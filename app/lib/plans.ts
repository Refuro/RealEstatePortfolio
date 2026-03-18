/**
 * Subscription plan definitions and property limits.
 * Matches engineering-spec Module J: Free (1), Investor (5), Pro (20).
 */

export const PLAN_PROPERTY_LIMITS = {
  free: 1,
  investor: 5,
  pro: 20,
} as const;

export const PLAN_DEAL_LIMITS = {
  free: 5,
  investor: 20,
  pro: 50,
} as const;

/** RentCast API calls per hour by plan. Free: 5, Investor: 10, Pro: 20. */
export const RENTCAST_HOURLY_LIMITS = {
  free: 5,
  investor: 10,
  pro: 20,
} as const;

export type PlanTier = keyof typeof PLAN_PROPERTY_LIMITS;

/** Effective tier = override when valid (free|investor|pro); else subscriptionTier ?? "free". */
export function getEffectiveTier(user: {
  subscriptionTier: string | null;
  subscriptionTierOverride?: string | null;
}): string {
  const override = user.subscriptionTierOverride?.trim().toLowerCase();
  if (override && ["free", "investor", "pro"].includes(override)) {
    return override;
  }
  return (user.subscriptionTier ?? "free").toLowerCase();
}

export function getRentCastHourlyLimit(tier: string): number {
  const key = tier.toLowerCase() as PlanTier;
  return RENTCAST_HOURLY_LIMITS[key] ?? RENTCAST_HOURLY_LIMITS.free;
}

export function getPropertyLimit(tier: string): number {
  const key = tier.toLowerCase() as PlanTier;
  return PLAN_PROPERTY_LIMITS[key] ?? PLAN_PROPERTY_LIMITS.free;
}

export function getDealLimit(tier: string): number {
  const key = tier.toLowerCase() as PlanTier;
  return PLAN_DEAL_LIMITS[key] ?? PLAN_DEAL_LIMITS.free;
}

export function canAddProperty(
  tier: string,
  currentCount: number
): boolean {
  return currentCount < getPropertyLimit(tier);
}

export function canAddDeal(tier: string, currentCount: number): boolean {
  return currentCount < getDealLimit(tier);
}
