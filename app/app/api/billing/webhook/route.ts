import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, getWebhookSecret, planTierFromPriceId } from "@/lib/stripe-config";
import { prisma } from "@/lib/db";

/**
 * Stripe webhook handler. Verifies signature with STRIPE_WEBHOOK_SECRET
 * per docs/security-notes.md. Syncs subscription state to DB.
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let body: string;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    const secret = getWebhookSecret();
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscriptionToDb(sub);
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await setSubscriptionCanceled(sub.id);
      break;
    }
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === "subscription" && session.subscription) {
        const stripe = getStripe();
        const subscription =
          typeof session.subscription === "string"
            ? await stripe.subscriptions.retrieve(session.subscription)
            : session.subscription;
        await syncSubscriptionToDb(subscription);
      }
      break;
    }
    default:
      // Ignore other events
      break;
  }

  return NextResponse.json({ received: true });
}

async function syncSubscriptionToDb(sub: Stripe.Subscription) {
  const firstItem = sub.items?.data?.[0];
  const priceId =
    typeof firstItem?.price === "string" ? firstItem.price : firstItem?.price?.id;
  const planTier = priceId ? planTierFromPriceId(priceId) : null;
  const planName = planTier || "unknown";
  const status = sub.status ?? "active";
  const periodEnd = firstItem?.current_period_end;
  const currentPeriodEnd = periodEnd
    ? new Date(periodEnd * 1000)
    : null;

  const appUserId =
    (sub.metadata?.appUserId as string) ||
    (await findUserIdByStripeCustomer(sub.customer as string));

  if (!appUserId) {
    console.warn("Webhook: could not resolve app user for subscription", sub.id);
    return;
  }

  const tierForUser = planTier || "free";

  await prisma.$transaction([
    prisma.subscription.upsert({
      where: { userId: appUserId },
      update: {
        stripeSubscriptionId: sub.id,
        status,
        planName,
        currentPeriodEnd,
      },
      create: {
        userId: appUserId,
        stripeSubscriptionId: sub.id,
        status,
        planName,
        currentPeriodEnd,
      },
    }),
    prisma.user.update({
      where: { id: appUserId },
      data: { subscriptionTier: tierForUser },
    }),
  ]);
}

async function setSubscriptionCanceled(stripeSubscriptionId: string) {
  const sub = await prisma.subscription.findFirst({
    where: { stripeSubscriptionId },
  });
  if (!sub) return;

  await prisma.$transaction([
    prisma.subscription.update({
      where: { id: sub.id },
      data: { status: "canceled", planName: null, currentPeriodEnd: null },
    }),
    prisma.user.update({
      where: { id: sub.userId },
      data: { subscriptionTier: "free" },
    }),
  ]);
}

async function findUserIdByStripeCustomer(
  customerId: string
): Promise<string | null> {
  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId },
  });
  return user?.id ?? null;
}
