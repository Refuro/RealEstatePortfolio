import { NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe-config";

/**
 * Returns subscription details (currentPeriodEnd, cancelAtPeriodEnd) after syncing from Stripe.
 * Used by Settings page client to refresh cancelAtPeriodEnd without blocking initial render.
 */
export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    return NextResponse.json({
      currentPeriodEnd: null,
      cancelAtPeriodEnd: null,
    });
  }

  const dbCurrentPeriodEnd = subscription.currentPeriodEnd
    ? subscription.currentPeriodEnd.toISOString()
    : null;
  const dbCancelAtPeriodEnd = subscription.cancelAtPeriodEnd ?? null;

  try {
    const stripe = getStripe();
    const stripeSub = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    const now = Date.now();
    const willCancel =
      stripeSub.cancel_at_period_end === true ||
      (typeof stripeSub.cancel_at === "number" && stripeSub.cancel_at * 1000 > now);

    if (stripeSub.cancel_at_period_end !== undefined || stripeSub.cancel_at) {
      await prisma.subscription.update({
        where: { userId: user.id },
        data: { cancelAtPeriodEnd: willCancel },
      });
    }

    const firstItem = stripeSub.items?.data?.[0];
    const stripePeriodEnd = firstItem?.current_period_end;
    const currentPeriodEnd = stripePeriodEnd
      ? new Date(stripePeriodEnd * 1000).toISOString()
      : dbCurrentPeriodEnd;
    const cancelAtPeriodEnd =
      stripeSub.cancel_at_period_end !== undefined ? stripeSub.cancel_at_period_end : willCancel;

    return NextResponse.json({
      currentPeriodEnd,
      cancelAtPeriodEnd,
    });
  } catch {
    // Stripe error: return DB values, don't throw
    return NextResponse.json({
      currentPeriodEnd: dbCurrentPeriodEnd,
      cancelAtPeriodEnd: dbCancelAtPeriodEnd,
    });
  }
}
