/**
 * Subscription plan definitions and property limits.
 * Matches engineering-spec Module J: Free (1), Investor (5), Pro (20).
 */

export const PLAN_PROPERTY_LIMITS = {
  free: 1,
  investor: 5,
  pro: 20,
} as const;

export type PlanTier = keyof typeof PLAN_PROPERTY_LIMITS;

export function getPropertyLimit(tier: string): number {
  const key = tier.toLowerCase() as PlanTier;
  return PLAN_PROPERTY_LIMITS[key] ?? PLAN_PROPERTY_LIMITS.free;
}

export function canAddProperty(
  tier: string,
  currentCount: number
): boolean {
  return currentCount < getPropertyLimit(tier);
}
