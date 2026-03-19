import { describe, expect, it } from "vitest";
import { createDealSchema, updateDealSchema } from "./deal";

const validMinimal = {
  addressLine1: "123 Main",
  city: "Austin",
  state: "tx",
  zipCode: "78701",
  currentMonthlyRent: "2000",
  currentMonthlyExpenses: "500",
  purchasePrice: "250000",
  currentEstimatedValue: "260000",
};

describe("createDealSchema", () => {
  it("accepts a valid payload with purchase price", () => {
    const r = createDealSchema.safeParse(validMinimal);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.state).toBe("TX");
  });

  it("requires either purchase price or current value", () => {
    const r = createDealSchema.safeParse({
      ...validMinimal,
      purchasePrice: "",
      currentEstimatedValue: "",
    });
    expect(r.success).toBe(false);
  });

  it("accepts value-only when purchase price empty", () => {
    const r = createDealSchema.safeParse({
      ...validMinimal,
      purchasePrice: "",
      currentEstimatedValue: "300000",
    });
    expect(r.success).toBe(true);
  });
});

describe("updateDealSchema", () => {
  it("allows partial updates", () => {
    const r = updateDealSchema.safeParse({ city: "Dallas" });
    expect(r.success).toBe(true);
  });
});
