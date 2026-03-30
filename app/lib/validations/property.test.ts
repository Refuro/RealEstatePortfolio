import { describe, expect, it } from "vitest";
import { createPropertySchema, updatePropertySchema } from "./property";

const validCreateBase = {
  addressLine1: "123 Main St",
  city: "Austin",
  state: "TX",
  zipCode: "78701",
  purchasePrice: "200000",
  purchaseDate: "2020-06-01",
  currentEstimatedValue: "250000",
  currentMonthlyRent: "2000",
  currentMonthlyExpenses: "500",
};

describe("createPropertySchema", () => {
  it("accepts a minimal valid payload", () => {
    const r = createPropertySchema.safeParse(validCreateBase);
    expect(r.success).toBe(true);
  });

  it("rejects when rent and unit rents are both missing", () => {
    const { currentMonthlyRent, ...rest } = validCreateBase;
    void currentMonthlyRent;
    const r = createPropertySchema.safeParse(rest);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("currentMonthlyRent"))).toBe(true);
    }
  });

  it("allows non-rented create payload without rent inputs", () => {
    const { currentMonthlyRent, ...rest } = validCreateBase;
    void currentMonthlyRent;
    const r = createPropertySchema.safeParse({
      ...rest,
      isRented: false,
    });
    expect(r.success).toBe(true);
  });

  it("rejects single-family with units !== 1", () => {
    const r = createPropertySchema.safeParse({
      ...validCreateBase,
      propertyType: "single_family",
      units: 2,
    });
    expect(r.success).toBe(false);
  });

  it("uppercases state", () => {
    const r = createPropertySchema.safeParse({
      ...validCreateBase,
      state: "tx",
    });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.state).toBe("TX");
  });

  it("rejects invalid state abbreviation", () => {
    const r = createPropertySchema.safeParse({
      ...validCreateBase,
      state: "XX",
    });
    expect(r.success).toBe(false);
  });
});

describe("updatePropertySchema", () => {
  it("allows empty partial update without rent fields", () => {
    const r = updatePropertySchema.safeParse({});
    expect(r.success).toBe(true);
  });

  it("validates unit count when property type and units are both present", () => {
    const r = updatePropertySchema.safeParse({
      propertyType: "condo",
      units: 3,
    });
    expect(r.success).toBe(false);
  });
});
