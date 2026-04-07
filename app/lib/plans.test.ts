import { describe, expect, it } from "vitest";
import {
  PLAN_DEAL_LIMITS,
  PLAN_PROPERTY_LIMITS,
  RENTCAST_HOURLY_LIMITS,
  TRIAL_DURATION_DAYS,
  canAddDeal,
  canAddProperty,
  getDealLimit,
  getEffectiveTier,
  getPropertyLimit,
  getRentCastHourlyLimit,
  hasTrialExpired,
  isOnTrial,
  trialDaysRemaining,
} from "./plans";

describe("getEffectiveTier", () => {
  it.each([
    [
      { subscriptionTier: "pro", subscriptionTierOverride: "free" },
      "free",
      "valid override wins",
    ],
    [
      { subscriptionTier: "FREE", subscriptionTierOverride: null },
      "free",
      "subscription tier lowercased",
    ],
    [
      { subscriptionTier: null, subscriptionTierOverride: "  PRO  " },
      "pro",
      "override trimmed",
    ],
    [
      { subscriptionTier: "investor", subscriptionTierOverride: "enterprise" },
      "investor",
      "invalid override ignored",
    ],
    [
      {
        subscriptionTier: "free",
        subscriptionTierOverride: null,
        trialEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
      "investor",
      "active trial maps free user to investor",
    ],
    [
      {
        subscriptionTier: "free",
        subscriptionTierOverride: null,
        trialEndsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      "free",
      "expired trial stays free",
    ],
  ] as const)(
    "%s → %s (%s)",
    (user, expected) => {
      expect(getEffectiveTier(user)).toBe(expected);
    }
  );
});

describe("trial helpers", () => {
  it("exports the 14-day trial duration", () => {
    expect(TRIAL_DURATION_DAYS).toBe(14);
  });

  it("isOnTrial returns true only for free users with a future trial end", () => {
    expect(
      isOnTrial({
        subscriptionTier: "free",
        subscriptionTierOverride: null,
        trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      })
    ).toBe(true);
    expect(
      isOnTrial({
        subscriptionTier: "investor",
        subscriptionTierOverride: null,
        trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      })
    ).toBe(false);
  });

  it("hasTrialExpired returns true only for expired free-tier trials", () => {
    expect(
      hasTrialExpired({
        subscriptionTier: "free",
        subscriptionTierOverride: null,
        trialEndsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      })
    ).toBe(true);
    expect(
      hasTrialExpired({
        subscriptionTier: "free",
        subscriptionTierOverride: "pro",
        trialEndsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      })
    ).toBe(false);
  });

  it("trialDaysRemaining returns null/0/positive values correctly", () => {
    expect(trialDaysRemaining({ trialEndsAt: null })).toBeNull();
    expect(
      trialDaysRemaining({
        trialEndsAt: new Date(Date.now() - 5 * 60 * 1000),
      })
    ).toBe(0);
    expect(
      trialDaysRemaining({
        trialEndsAt: new Date(Date.now() + 36 * 60 * 60 * 1000),
      })
    ).toBe(2);
  });
});

describe("getPropertyLimit / getDealLimit", () => {
  it.each([
    ["free", PLAN_PROPERTY_LIMITS.free, PLAN_DEAL_LIMITS.free],
    ["investor", PLAN_PROPERTY_LIMITS.investor, PLAN_DEAL_LIMITS.investor],
    ["pro", PLAN_PROPERTY_LIMITS.pro, PLAN_DEAL_LIMITS.pro],
    ["PRO", PLAN_PROPERTY_LIMITS.pro, PLAN_DEAL_LIMITS.pro],
  ] as const)("tier %s", (tier, propLimit, dealLimit) => {
    expect(getPropertyLimit(tier)).toBe(propLimit);
    expect(getDealLimit(tier)).toBe(dealLimit);
  });

  it("falls back to free limits for unknown tier strings", () => {
    expect(getPropertyLimit("unknown")).toBe(PLAN_PROPERTY_LIMITS.free);
    expect(getDealLimit("")).toBe(PLAN_DEAL_LIMITS.free);
  });
});

describe("getRentCastHourlyLimit", () => {
  it.each([
    ["free", RENTCAST_HOURLY_LIMITS.free],
    ["investor", RENTCAST_HOURLY_LIMITS.investor],
    ["pro", RENTCAST_HOURLY_LIMITS.pro],
  ] as const)("tier %s", (tier, expected) => {
    expect(getRentCastHourlyLimit(tier)).toBe(expected);
  });

  it("falls back to free for unknown tier", () => {
    expect(getRentCastHourlyLimit("nope")).toBe(RENTCAST_HOURLY_LIMITS.free);
  });
});

describe("canAddProperty / canAddDeal", () => {
  it("returns true when under limit", () => {
    expect(canAddProperty("pro", 0)).toBe(true);
    expect(canAddProperty("pro", 19)).toBe(true);
    expect(canAddDeal("free", 0)).toBe(true);
  });

  it("returns false at or above limit", () => {
    expect(canAddProperty("free", 1)).toBe(false);
    expect(canAddProperty("pro", 20)).toBe(false);
    expect(canAddDeal("free", 5)).toBe(false);
  });
});
