import { describe, expect, it } from "vitest";
import {
  PLAN_DEAL_LIMITS,
  PLAN_PROPERTY_LIMITS,
  RENTCAST_HOURLY_LIMITS,
  canAddDeal,
  canAddProperty,
  getDealLimit,
  getEffectiveTier,
  getPropertyLimit,
  getRentCastHourlyLimit,
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
  ] as const)(
    "%s → %s (%s)",
    (user, expected) => {
      expect(getEffectiveTier(user)).toBe(expected);
    }
  );
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
