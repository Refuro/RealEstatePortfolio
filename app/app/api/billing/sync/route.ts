import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveTier } from "@/lib/plans";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
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
export async function GET(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "billing:sync");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  async function respondOk(body: Record<string, unknown>) {
    await recordRateLimit(identifier, "billing:sync");
    return NextResponse.json(body);
  }

  if (user.subscriptionTierOverride) {
    return respondOk({ synced: false, tier: getEffectiveTier(user) });
  }

  // No Stripe customer at all — never initiated billing; nothing to sync.
  if (!user.stripeCustomerId) {
    return respondOk({ synced: false, tier: getEffectiveTier(user) });
  }

  const tier = (user.subscriptionTier ?? "free").toLowerCase();

  try {
    const stripe = getStripe();

    // Prefer retrieving the exact subscription on record so we don't read
    // a stale/different subscription from the list endpoint.
    let sub: Awaited<ReturnType<typeof stripe.subscriptions.retrieve>> | null = null;
    const dbSub = await prisma.subscription.findUnique({
      where: { userId: user.id },
      select: { stripeSubscriptionId: true },
    });
    if (dbSub?.stripeSubscriptionId) {
      try {
        sub = await stripe.subscriptions.retrieve(dbSub.stripeSubscriptionId);
      } catch {
        sub = null;
      }
    }
    if (!sub) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 5,
        status: "all",
      });
      sub =
        subscriptions.data.find((s) => s.status === "active" || s.status === "trialing") ??
        subscriptions.data[0] ??
        null;
    }

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
      const periodEnd = firstItem?.current_period_end;
      const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;
      const nextCancelAtPeriodEnd =
        sub.cancel_at_period_end === true ||
        (typeof sub.cancel_at === "number" && sub.cancel_at * 1000 > Date.now());
      const existingSub = await prisma.subscription.findUnique({
        where: { userId: user.id },
        select: {
          stripeSubscriptionId: true,
          status: true,
          planName: true,
          currentPeriodEnd: true,
          cancelAtPeriodEnd: true,
        },
      });
      const subscriptionChanged =
        !existingSub ||
        existingSub.stripeSubscriptionId !== sub.id ||
        existingSub.status !== status ||
        existingSub.planName !== (stripePlanName ?? stripeTier) ||
        (existingSub.currentPeriodEnd?.getTime() ?? null) !==
          (currentPeriodEnd?.getTime() ?? null) ||
        (existingSub.cancelAtPeriodEnd ?? false) !== nextCancelAtPeriodEnd;

      // Always upsert active/trialing subscription details so cancellation state,
      // period end, and subscription id self-heal even when tier is unchanged.
      const writes = [
        prisma.subscription.upsert({
          where: { userId: user.id },
          update: {
            stripeSubscriptionId: sub.id,
            status,
            planName: stripePlanName ?? stripeTier,
            currentPeriodEnd,
            cancelAtPeriodEnd: nextCancelAtPeriodEnd,
          },
          create: {
            userId: user.id,
            stripeSubscriptionId: sub.id,
            status,
            planName: stripePlanName ?? stripeTier,
            currentPeriodEnd,
            cancelAtPeriodEnd: nextCancelAtPeriodEnd,
          },
        }),
      ];
      const tierChanged = Boolean(stripeTier && stripeTier !== tier);
      if (stripeTier && stripeTier !== tier) {
        writes.push(
          prisma.user.update({
            where: { id: user.id },
            data: { subscriptionTier: stripeTier },
          })
        );
      }
      await prisma.$transaction(writes);
      return respondOk({
        synced: tierChanged || subscriptionChanged,
        tier: stripeTier ?? getEffectiveTier(user),
      });
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
      return respondOk({ synced: tier !== "free", tier: "free" });
    }

    // past_due / incomplete: keep current tier; past_due banner handles user-facing messaging.
    return respondOk({ synced: false, tier: getEffectiveTier(user) });
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
    return respondOk({ synced: false, tier: getEffectiveTier(user) });
  }
}
