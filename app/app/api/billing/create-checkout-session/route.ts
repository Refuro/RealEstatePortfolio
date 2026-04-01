import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPublicAppBaseUrlForBilling } from "@/lib/env";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { getStripe, getPriceIdForPlan } from "@/lib/stripe-config";
import { createCheckoutSessionSchema } from "@/lib/validations/checkout";

/** Subscription statuses where a Stripe subscription already exists — do not create a second via Checkout. */
const STATUS_BLOCKS_NEW_CHECKOUT = new Set([
  "active",
  "trialing",
  "past_due",
  "unpaid",
]);

export async function POST(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "billing:create-checkout");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createCheckoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    const planError = parsed.error.flatten().fieldErrors.plan?.[0];
    const billingError = parsed.error.flatten().fieldErrors.billingCycle?.[0];
    const errorMessage =
      planError ?? billingError ?? "Invalid request";
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { plan, billingCycle } = parsed.data;
  const priceId = getPriceIdForPlan(plan, billingCycle);
  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID for plan '${plan}' is not configured` },
      { status: 500 }
    );
  }

  const existingSub = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });
  if (
    existingSub?.stripeSubscriptionId &&
    STATUS_BLOCKS_NEW_CHECKOUT.has(existingSub.status)
  ) {
    return NextResponse.json(
      {
        error:
          "You already have a subscription. Use Manage billing on Plans or Settings to change your plan.",
      },
      { status: 409 }
    );
  }

  const baseUrl = getPublicAppBaseUrlForBilling();

  try {
    const stripe = getStripe();

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { appUserId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/plans`,
      metadata: {
        appUserId: user.id,
        plan,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: { appUserId: user.id },
      },
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Failed to create checkout session" },
        { status: 500 }
      );
    }

    await recordRateLimit(identifier, "billing:create-checkout");

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : "Error";
    console.error(
      JSON.stringify({
        action: "billing_create_checkout_error",
        errorType: name,
        errorMessage: message,
        userId: user.id,
        plan,
        billingCycle,
        timestamp: new Date().toISOString(),
      })
    );
    Sentry.captureException(err instanceof Error ? err : new Error(String(err)), {
      tags: { area: "billing", route: "billing/create-checkout-session" },
      extra: { userId: user.id, plan, billingCycle },
    });
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
