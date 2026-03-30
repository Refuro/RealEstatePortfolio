import { prisma } from "@/lib/db";
import { getRentCastHourlyLimit } from "@/lib/plans";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Rolling-hour RentCast usage vs tier limit (shared pool: rent, value, benchmark refresh).
 * See `docs/reference/rentcast-quota.md`.
 */
export async function getRentCastQuotaState(
  userId: string,
  tier: string
): Promise<{ limit: number; used: number; remaining: number }> {
  const limit = getRentCastHourlyLimit(tier);
  const oneHourAgo = new Date(Date.now() - ONE_HOUR_MS);
  const used = await prisma.rentCastApiCall.count({
    where: { userId, createdAt: { gte: oneHourAgo } },
  });
  const remaining = Math.max(0, limit - used);
  return { limit, used, remaining };
}
