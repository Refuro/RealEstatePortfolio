import { describe, expect, it } from "vitest";
import {
  COMPLETENESS_THRESHOLD,
  getPropertyCompleteness,
  type PropertyCompletenessInput,
} from "./property-completeness";

const base: PropertyCompletenessInput = {
  purchasePrice: 300000,
  currentEstimatedValue: 300000,
  cashInvested: null,
  mortgageCount: 0,
  hasMortgage: null,
  bedrooms: null,
  bathrooms: null,
  squareFeet: null,
};

describe("getPropertyCompleteness", () => {
  it("scores a bare quick-add property at 10", () => {
    const result = getPropertyCompleteness(base);
    expect(result.score).toBe(10);
    expect(result.isComplete).toBe(false);
    expect(result.missingFields).toEqual([
      "actual purchase price",
      "mortgage status",
      "cash invested",
      "bedrooms",
      "bathrooms",
      "square feet",
    ]);
  });

  it("adds 25 points when purchase price differs from estimated value", () => {
    const result = getPropertyCompleteness({ ...base, purchasePrice: 280000 });
    expect(result.score).toBe(35);
    expect(result.missingFields).not.toContain("actual purchase price");
  });

  it("adds 25 points when a mortgage exists", () => {
    const result = getPropertyCompleteness({ ...base, mortgageCount: 1 });
    expect(result.score).toBe(35);
    expect(result.missingFields).not.toContain("mortgage status");
    expect(result.missingFields).not.toContain("mortgage details");
  });

  it("adds 25 points when hasMortgage is false (confirmed no mortgage)", () => {
    const result = getPropertyCompleteness({ ...base, hasMortgage: false });
    expect(result.score).toBe(35);
    expect(result.missingFields).not.toContain("mortgage status");
    expect(result.missingFields).not.toContain("mortgage details");
  });

  it("shows 'mortgage details' when hasMortgage=true but no mortgage added", () => {
    const result = getPropertyCompleteness({ ...base, hasMortgage: true, mortgageCount: 0 });
    expect(result.score).toBe(10);
    expect(result.missingFields).toContain("mortgage details");
    expect(result.missingFields).not.toContain("mortgage status");
  });

  it("shows 'mortgage status' when hasMortgage=null and no mortgage", () => {
    const result = getPropertyCompleteness({ ...base, hasMortgage: null, mortgageCount: 0 });
    expect(result.missingFields).toContain("mortgage status");
    expect(result.missingFields).not.toContain("mortgage details");
  });

  it("mortgage count >1 still adds only 25 points", () => {
    const result = getPropertyCompleteness({ ...base, mortgageCount: 3 });
    expect(result.score).toBe(35);
  });

  it("adds 20 points for cash invested", () => {
    const result = getPropertyCompleteness({ ...base, cashInvested: 60000 });
    expect(result.score).toBe(30);
    expect(result.missingFields).not.toContain("cash invested");
  });

  it("returns isComplete when purchase price + no mortgage confirmed (score 60)", () => {
    const result = getPropertyCompleteness({
      ...base,
      purchasePrice: 280000,
      hasMortgage: false,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1400,
    });
    expect(result.score).toBe(80);
    expect(result.isComplete).toBe(true);
  });

  it("returns isComplete when purchase price + mortgage added (score 60)", () => {
    const result = getPropertyCompleteness({
      ...base,
      purchasePrice: 280000,
      mortgageCount: 1,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1400,
    });
    expect(result.score).toBe(80);
    expect(result.isComplete).toBe(true);
  });

  it("reaches max score 100 with all metric-ready fields", () => {
    const result = getPropertyCompleteness({
      purchasePrice: 280000,
      currentEstimatedValue: 300000,
      cashInvested: 60000,
      mortgageCount: 1,
      hasMortgage: true,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1400,
    });
    expect(result.score).toBe(100);
    expect(result.isComplete).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it("cash buyer with everything filled scores 100", () => {
    const result = getPropertyCompleteness({
      purchasePrice: 280000,
      currentEstimatedValue: 300000,
      cashInvested: 200000,
      mortgageCount: 0,
      hasMortgage: false,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1400,
    });
    expect(result.score).toBe(100);
    expect(result.isComplete).toBe(true);
  });

  it("does not reach threshold with mortgage status alone", () => {
    const result = getPropertyCompleteness({ ...base, mortgageCount: 1 });
    expect(result.score).toBe(35);
    expect(result.isComplete).toBe(false);
  });

  it("treats purchasePrice===currentEstimatedValue as missing even when both non-zero", () => {
    const result = getPropertyCompleteness({
      ...base,
      purchasePrice: 450000,
      currentEstimatedValue: 450000,
    });
    expect(result.missingFields).toContain("actual purchase price");
    expect(result.score).toBe(10);
  });

  it("handles rounding so $300,000.49 and $300,000.51 are treated as different", () => {
    const result = getPropertyCompleteness({
      ...base,
      purchasePrice: 300000.49,
      currentEstimatedValue: 300000.51,
    });
    expect(result.missingFields).not.toContain("actual purchase price");
    expect(result.score).toBe(35);
  });

  it("COMPLETENESS_THRESHOLD is 60", () => {
    expect(COMPLETENESS_THRESHOLD).toBe(60);
  });

  it("bed/bath/sqft increase completeness score", () => {
    const withoutExtras = getPropertyCompleteness(base);
    const withExtras = getPropertyCompleteness({
      ...base,
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1400,
    });
    expect(withoutExtras.score).toBe(10);
    expect(withExtras.score).toBe(30);
  });

  it("lists each missing home profile field", () => {
    const result = getPropertyCompleteness({
      ...base,
      bedrooms: 3,
      bathrooms: null,
      squareFeet: null,
    });
    expect(result.missingFields).not.toContain("bedrooms");
    expect(result.missingFields).toContain("bathrooms");
    expect(result.missingFields).toContain("square feet");
  });
});
