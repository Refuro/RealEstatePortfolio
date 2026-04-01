import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

function isUniqueViolation(e: unknown): boolean {
  return (
    e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
  );
}

/**
 * Run a PostHog capture once per Stripe `event.id` (dedupes Stripe webhook retries).
 * Claims the id in DB before capture; rolls back the claim if `capture` throws so a retry can emit.
 */
export async function captureStripeWebhookAnalyticsOnce(
  stripeEventId: string,
  capture: () => Promise<void>
): Promise<void> {
  try {
    await prisma.stripePosthogDedup.create({
      data: { eventId: stripeEventId },
    });
  } catch (e) {
    if (isUniqueViolation(e)) return;
    throw e;
  }
  try {
    await capture();
  } catch (err) {
    await prisma.stripePosthogDedup
      .delete({ where: { eventId: stripeEventId } })
      .catch(() => undefined);
    throw err;
  }
}
