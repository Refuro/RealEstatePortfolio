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

/**
 * Per-hour cap on successful RentCast upstream calls, by subscription tier.
 * Free: 5, Investor: 10, Pro: 20.
 *
 * **Shared pool:** `RentCastApiCall` rows do not distinguish endpoint type. Rent estimate,
 * value estimate, and benchmark refresh all count toward the same hourly limit for the user.
 * See `docs/reference/rentcast-quota.md`.
 */
export const RENTCAST_HOURLY_LIMITS = {
  free: 5,
  investor: 10,
  pro: 20,
} as const;

export type PlanTier = keyof typeof PLAN_PROPERTY_LIMITS;
const VALID_TIERS = ["free", "investor", "pro"] as const;
export const TRIAL_DURATION_DAYS = 14;

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}

/**
 * Effective tier priority:
 * 1) valid admin override
 * 2) paid Stripe tier
 * 3) active app-managed trial => investor
 * 4) free
 */
export function getEffectiveTier(user: {
  subscriptionTier: string | null;
  subscriptionTierOverride?: string | null;
  trialEndsAt?: Date | string | null;
}): string {
  const override = user.subscriptionTierOverride?.trim().toLowerCase();
  if (override && VALID_TIERS.includes(override as (typeof VALID_TIERS)[number])) {
    return override;
  }

  const tier = (user.subscriptionTier ?? "free").toLowerCase();
  if (tier !== "free") {
    return tier;
  }

  const trialEndsAt = toDate(user.trialEndsAt);
  if (trialEndsAt && trialEndsAt > new Date()) {
    return "investor";
  }

  return "free";
}

export function isOnTrial(user: {
  trialEndsAt?: Date | null;
  subscriptionTier?: string | null;
  subscriptionTierOverride?: string | null;
}): boolean {
  if (!user.trialEndsAt) return false;
  if (user.subscriptionTierOverride?.trim()) return false;
  if ((user.subscriptionTier ?? "free").toLowerCase() !== "free") return false;
  return user.trialEndsAt > new Date();
}

export function hasTrialExpired(user: {
  trialEndsAt?: Date | null;
  subscriptionTier?: string | null;
  subscriptionTierOverride?: string | null;
}): boolean {
  if (!user.trialEndsAt) return false;
  if (user.subscriptionTierOverride?.trim()) return false;
  if ((user.subscriptionTier ?? "free").toLowerCase() !== "free") return false;
  return user.trialEndsAt <= new Date();
}

export function trialDaysRemaining(user: { trialEndsAt?: Date | null }): number | null {
  if (!user.trialEndsAt) return null;
  const ms = user.trialEndsAt.getTime() - Date.now();
  return ms <= 0 ? 0 : Math.ceil(ms / (1000 * 60 * 60 * 24));
}

/** Max `RentCastApiCall` rows in the rolling hour (all RentCast-backed routes share one counter). */
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
