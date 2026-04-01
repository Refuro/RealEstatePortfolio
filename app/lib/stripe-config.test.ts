import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { billingIntervalFromPriceId, parsePlanNameInterval, planTierFromPriceId } from "./stripe-config";

describe("planTierFromPriceId", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    process.env.STRIPE_PRICE_ID_INVESTOR_MONTHLY = "price_inv_m";
    process.env.STRIPE_PRICE_ID_INVESTOR_YEARLY = "price_inv_y";
    process.env.STRIPE_PRICE_ID_PRO_MONTHLY = "price_pro_m";
    process.env.STRIPE_PRICE_ID_PRO_YEARLY = "price_pro_y";
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("maps Investor monthly and yearly price ids", () => {
    expect(planTierFromPriceId("price_inv_m")).toBe("investor");
    expect(planTierFromPriceId("price_inv_y")).toBe("investor");
  });

  it("maps Pro monthly and yearly price ids", () => {
    expect(planTierFromPriceId("price_pro_m")).toBe("pro");
    expect(planTierFromPriceId("price_pro_y")).toBe("pro");
  });

  it("returns null for unknown price id", () => {
    expect(planTierFromPriceId("price_unknown")).toBeNull();
  });
});

describe("billingIntervalFromPriceId", () => {
  const saved = { ...process.env };

  beforeEach(() => {
    process.env.STRIPE_PRICE_ID_INVESTOR_MONTHLY = "price_inv_m";
    process.env.STRIPE_PRICE_ID_INVESTOR_YEARLY = "price_inv_y";
    process.env.STRIPE_PRICE_ID_PRO_MONTHLY = "price_pro_m";
    process.env.STRIPE_PRICE_ID_PRO_YEARLY = "price_pro_y";
  });

  afterEach(() => {
    process.env = { ...saved };
  });

  it("returns monthly for monthly price ids", () => {
    expect(billingIntervalFromPriceId("price_inv_m")).toBe("monthly");
    expect(billingIntervalFromPriceId("price_pro_m")).toBe("monthly");
  });

  it("returns yearly for yearly price ids", () => {
    expect(billingIntervalFromPriceId("price_inv_y")).toBe("yearly");
    expect(billingIntervalFromPriceId("price_pro_y")).toBe("yearly");
  });

  it("returns null for unknown price id", () => {
    expect(billingIntervalFromPriceId("price_unknown")).toBeNull();
  });
});

describe("parsePlanNameInterval", () => {
  it("parses monthly interval from combined planName", () => {
    expect(parsePlanNameInterval("investor_monthly")).toBe("monthly");
    expect(parsePlanNameInterval("pro_monthly")).toBe("monthly");
  });

  it("parses yearly interval from combined planName", () => {
    expect(parsePlanNameInterval("investor_yearly")).toBe("yearly");
    expect(parsePlanNameInterval("pro_yearly")).toBe("yearly");
  });

  it("returns null for legacy planName without interval", () => {
    expect(parsePlanNameInterval("investor")).toBeNull();
    expect(parsePlanNameInterval("pro")).toBeNull();
    expect(parsePlanNameInterval("unknown")).toBeNull();
  });

  it("returns null for null or undefined", () => {
    expect(parsePlanNameInterval(null)).toBeNull();
    expect(parsePlanNameInterval(undefined)).toBeNull();
  });
});
