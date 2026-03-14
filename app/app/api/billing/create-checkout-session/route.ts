import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe, getPriceIdForPlan, type BillingCycle } from "@/lib/stripe-config";

export async function POST(request: NextRequest) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { plan?: string; billingCycle?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const plan = body.plan === "investor" || body.plan === "pro" ? body.plan : null;
  if (!plan) {
    return NextResponse.json(
      { error: "Invalid or missing plan; use 'investor' or 'pro'" },
      { status: 400 }
    );
  }

  const billingCycle: BillingCycle =
    body.billingCycle === "yearly" ? "yearly" : "monthly";
  const priceId = getPriceIdForPlan(plan, billingCycle);
  if (!priceId) {
    return NextResponse.json(
      { error: `Price ID for plan '${plan}' is not configured` },
      { status: 500 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

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
      cancel_url: `${baseUrl}/pricing`,
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

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Checkout session error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
