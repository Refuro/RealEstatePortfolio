import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import Stripe from "stripe";
import { getStripe, getWebhookSecret, planTierFromPriceId, billingIntervalFromPriceId } from "@/lib/stripe-config";
import { prisma } from "@/lib/db";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";
import { captureStripeWebhookAnalyticsOnce } from "@/lib/stripe-webhook-posthog";

/**
 * Stripe webhook handler. Verifies signature with STRIPE_WEBHOOK_SECRET
 * per docs/security/security-notes.md. Syncs subscription state to DB.
 *
 * **Idempotency:** Stripe may retry the same `event.id`; Prisma upserts in `syncSubscriptionToDb`
 * are safe to replay. PostHog server captures are deduped by Stripe `event.id` via `StripePosthogDedup`.
 * See `docs/internal/stripe-webhook-posthog-idempotency.md`.
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

  try {
    switch (event.type) {
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionToDb(sub);
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await syncSubscriptionToDb(sub);
        const { appUserId } = await resolveAppUserIdForSubscription(sub);
        if (appUserId) {
          const firstItem = sub.items?.data?.[0];
          const priceId =
            typeof firstItem?.price === "string" ? firstItem.price : firstItem?.price?.id;
          const planTier = priceId ? planTierFromPriceId(priceId) : null;
          await captureStripeWebhookAnalyticsOnce(event.id, async () => {
            await captureServerEvent(appUserId, AnalyticsEvents.SUBSCRIPTION_UPDATED, {
              status: sub.status,
              plan_tier: planTier ?? undefined,
              cancel_at_period_end: sub.cancel_at_period_end ?? false,
            });
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const row = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: sub.id },
          select: { userId: true },
        });
        await setSubscriptionCanceled(sub.id);
        if (row?.userId) {
          await captureStripeWebhookAnalyticsOnce(event.id, async () => {
            await captureServerEvent(row.userId, AnalyticsEvents.SUBSCRIPTION_CANCELED, {
              stripe_subscription_id: sub.id,
            });
          });
        }
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
          const appUserId = session.metadata?.appUserId;
          if (typeof appUserId === "string" && appUserId.length > 0) {
            await captureStripeWebhookAnalyticsOnce(event.id, async () => {
              await captureServerEvent(
                appUserId,
                AnalyticsEvents.SUBSCRIPTION_ACTIVATED,
                {
                  plan: session.metadata?.plan ?? undefined,
                  billing_cycle: session.metadata?.billing_cycle ?? undefined,
                }
              );
            });
          }
        }
        break;
      }
      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error("Webhook processing failed:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Webhook processing failed"), {
      tags: { route: "api/billing/webhook", eventType: event.type },
      extra: { eventId: event.id },
    });
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

function isStripeCancelScheduled(sub: Stripe.Subscription): boolean {
  return (
    sub.cancel_at_period_end === true ||
    (typeof sub.cancel_at === "number" && sub.cancel_at * 1000 > Date.now())
  );
}

async function syncSubscriptionToDb(sub: Stripe.Subscription) {
  const firstItem = sub.items?.data?.[0];
  const priceId =
    typeof firstItem?.price === "string" ? firstItem.price : firstItem?.price?.id;
  const planTier = priceId ? planTierFromPriceId(priceId) : null;
  const billingInterval = priceId ? billingIntervalFromPriceId(priceId) : null;
  const planName = planTier
    ? billingInterval ? `${planTier}_${billingInterval}` : planTier
    : "unknown";
  const status = sub.status ?? "active";
  const periodEnd = firstItem?.current_period_end;
  const currentPeriodEnd = periodEnd
    ? new Date(periodEnd * 1000)
    : null;

  const { appUserId, hasMetadataAppUserId } = await resolveAppUserIdForSubscription(sub);

  if (!appUserId) {
    const customerId =
      typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
    Sentry.captureMessage(
      "Stripe webhook: could not resolve app user for subscription sync",
      {
        level: "warning",
        tags: { area: "billing", stripe_webhook: "subscription_sync" },
        extra: {
          subscriptionId: sub.id,
          customerId,
          hasMetadataAppUserId,
        },
      }
    );
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
        cancelAtPeriodEnd: isStripeCancelScheduled(sub),
      },
      create: {
        userId: appUserId,
        stripeSubscriptionId: sub.id,
        status,
        planName,
        currentPeriodEnd,
        cancelAtPeriodEnd: isStripeCancelScheduled(sub),
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
      data: { status: "canceled", planName: null, currentPeriodEnd: null, cancelAtPeriodEnd: null },
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

async function resolveAppUserIdForSubscription(sub: Stripe.Subscription): Promise<{
  appUserId: string | null;
  hasMetadataAppUserId: boolean;
}> {
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  const customerUserId = customerId
    ? await findUserIdByStripeCustomer(customerId)
    : null;
  const metadataAppUserIdRaw = sub.metadata?.appUserId;
  const metadataAppUserId =
    typeof metadataAppUserIdRaw === "string" && metadataAppUserIdRaw.trim().length > 0
      ? metadataAppUserIdRaw.trim()
      : null;

  if (customerUserId && metadataAppUserId && customerUserId !== metadataAppUserId) {
    Sentry.captureMessage(
      "Stripe webhook: metadata appUserId mismatch, using stripeCustomerId mapping",
      {
        level: "warning",
        tags: { area: "billing", stripe_webhook: "subscription_user_mismatch" },
        extra: {
          subscriptionId: sub.id,
          customerId,
          customerUserId,
          metadataAppUserId,
        },
      }
    );
  }

  return {
    appUserId: customerUserId ?? metadataAppUserId,
    hasMetadataAppUserId: Boolean(metadataAppUserId),
  };
}
