import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe-config";

export type SubscriptionDetails = {
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
};

/**
 * Fetches subscription details with Stripe sync (currentPeriodEnd, cancelAtPeriodEnd).
 * Use server-side only. Safe to call from API routes or server components.
 */
export async function getSubscriptionDetails(
  userId: string
): Promise<SubscriptionDetails> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription || !subscription.stripeSubscriptionId) {
    return { currentPeriodEnd: null, cancelAtPeriodEnd: null };
  }

  const dbCurrentPeriodEnd = subscription.currentPeriodEnd
    ? subscription.currentPeriodEnd.toISOString()
    : null;
  const dbCancelAtPeriodEnd = subscription.cancelAtPeriodEnd ?? null;

  try {
    const stripe = getStripe();
    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    const now = Date.now();
    const willCancel =
      stripeSub.cancel_at_period_end === true ||
      (typeof stripeSub.cancel_at === "number" &&
        stripeSub.cancel_at * 1000 > now);

    if (stripeSub.cancel_at_period_end !== undefined || stripeSub.cancel_at) {
      await prisma.subscription.update({
        where: { userId },
        data: { cancelAtPeriodEnd: willCancel },
      });
    }

    const firstItem = stripeSub.items?.data?.[0];
    const stripePeriodEnd = firstItem?.current_period_end;
    const currentPeriodEnd = stripePeriodEnd
      ? new Date(stripePeriodEnd * 1000).toISOString()
      : dbCurrentPeriodEnd;
    const cancelAtPeriodEnd =
      stripeSub.cancel_at_period_end !== undefined
        ? stripeSub.cancel_at_period_end
        : willCancel;

    return { currentPeriodEnd, cancelAtPeriodEnd };
  } catch {
    return {
      currentPeriodEnd: dbCurrentPeriodEnd,
      cancelAtPeriodEnd: dbCancelAtPeriodEnd,
    };
  }
}
