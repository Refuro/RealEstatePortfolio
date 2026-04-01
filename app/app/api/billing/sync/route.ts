import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveTier } from "@/lib/plans";
import { getStripe, planTierFromPriceId, billingIntervalFromPriceId } from "@/lib/stripe-config";

/**
 * Re-sync subscription state from Stripe.
 * Called on app load when user has stripeCustomerId (regardless of DB tier).
 *
 * Handles two scenarios:
 *  1. Downgrade: Stripe shows canceled/unpaid/none → set user to free.
 *  2. Upgrade/correction: Stripe shows active subscription whose price tier
 *     does not match the DB tier (e.g. missed webhook, portal plan change) →
 *     sync DB tier up to match Stripe.
 *
 * When subscriptionTierOverride is set, skip — admin override wins.
 */
export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.subscriptionTierOverride) {
    return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
  }

  // No Stripe customer at all — never initiated billing; nothing to sync.
  if (!user.stripeCustomerId) {
    return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
  }

  const tier = (user.subscriptionTier ?? "free").toLowerCase();

  try {
    const stripe = getStripe();
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
      status: "all",
    });

    const sub = subscriptions.data[0];
    const status = sub?.status;

    if (status === "active" || status === "trialing") {
      // Determine the tier Stripe is billing for.
      const firstItem = sub.items?.data?.[0];
      const priceId =
        typeof firstItem?.price === "string"
          ? firstItem.price
          : firstItem?.price?.id;
      const stripeTier = priceId ? planTierFromPriceId(priceId) : null;
      const stripeInterval = priceId ? billingIntervalFromPriceId(priceId) : null;
      const stripePlanName = stripeTier
        ? stripeInterval ? `${stripeTier}_${stripeInterval}` : stripeTier
        : null;

      // If Stripe's tier differs from the DB (missed webhook, portal change),
      // sync DB up so the app immediately reflects the correct entitlement.
      if (stripeTier && stripeTier !== tier) {
        const periodEnd = firstItem?.current_period_end;
        const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;
        await prisma.$transaction([
          prisma.subscription.upsert({
            where: { userId: user.id },
            update: {
              stripeSubscriptionId: sub.id,
              status,
              planName: stripePlanName ?? stripeTier,
              currentPeriodEnd,
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            },
            create: {
              userId: user.id,
              stripeSubscriptionId: sub.id,
              status,
              planName: stripePlanName ?? stripeTier,
              currentPeriodEnd,
              cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
            },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { subscriptionTier: stripeTier },
          }),
        ]);
        return NextResponse.json({ synced: true, tier: stripeTier });
      }

      // Tier matches — no change needed.
      return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
    }

    // No subscription, or definitively ended — downgrade to free.
    if (!sub || ["canceled", "unpaid", "incomplete_expired"].includes(status ?? "")) {
      if (tier !== "free") {
        await prisma.$transaction([
          prisma.subscription.updateMany({
            where: { userId: user.id },
            data: { status: "canceled", planName: null, currentPeriodEnd: null, cancelAtPeriodEnd: null },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { subscriptionTier: "free" },
          }),
        ]);
      }
      return NextResponse.json({ synced: tier !== "free", tier: "free" });
    }

    // past_due / incomplete: keep current tier; past_due banner handles user-facing messaging.
    return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const name = err instanceof Error ? err.name : "Error";
    console.error(
      JSON.stringify({
        action: "billing_sync_error",
        errorType: name,
        errorMessage: message,
        userId: user.id,
        stripeCustomerId: user.stripeCustomerId ?? null,
        timestamp: new Date().toISOString(),
      })
    );
    Sentry.captureException(err instanceof Error ? err : new Error(message), {
      tags: { area: "billing", route: "billing_sync" },
      extra: {
        userId: user.id,
        stripeCustomerId: user.stripeCustomerId ?? null,
      },
    });
    return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
  }
}
