import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { planTierFromPriceId } from "./stripe-config";

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
