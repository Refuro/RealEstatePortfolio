import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveTier } from "@/lib/plans";
import { getStripe } from "@/lib/stripe-config";

/**
 * Re-sync subscription state from Stripe.
 * Called on app load when user has stripeCustomerId and tier !== free.
 * If Stripe shows no active subscription (canceled, unpaid, etc.), downgrade user to free.
 * When subscriptionTierOverride is set, skip downgrade — admin override wins.
 */
export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.subscriptionTierOverride) {
    return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
  }

  const tier = (user.subscriptionTier ?? "free").toLowerCase();
  if (!user.stripeCustomerId || tier === "free") {
    return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
  }

  try {
    const stripe = getStripe();
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
      status: "all",
      expand: ["data.status"],
    });

    const sub = subscriptions.data[0];
    const status = sub?.status;

    // Active or trialing = OK, keep current tier
    if (status === "active" || status === "trialing") {
      return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
    }

    // No subscription, or canceled/unpaid/past_due (for too long) = downgrade to free
    if (!sub || ["canceled", "unpaid", "incomplete_expired"].includes(status ?? "")) {
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
      return NextResponse.json({ synced: true, tier: "free" });
    }

    // past_due: don't downgrade here — webhook or user action handles it
    // Keep current tier; past_due banner will show
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
