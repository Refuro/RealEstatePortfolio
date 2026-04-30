import { describe, expect, it } from "vitest";
import {
  getPropertyCompleteness,
  type PropertyCompletenessInput,
} from "./property-completeness";

const base: PropertyCompletenessInput = {
  purchasePrice: 300000,
  currentEstimatedValue: 300000,
  cashInvested: null,
  mortgageCount: 0,
  hasMortgage: null,
  mortgagePaidOff: false,
};

describe("getPropertyCompleteness", () => {
  it("scores a bare quick-add property at 10", () => {
    const result = getPropertyCompleteness(base);
    expect(result.score).toBe(10);
    expect(result.missingFields).toEqual([
      "actual purchase price",
      "mortgage status",
      "cash invested",
    ]);
  });

  it("adds 30 points when purchase price differs from estimated value", () => {
    const result = getPropertyCompleteness({ ...base, purchasePrice: 280000 });
    expect(result.score).toBe(40);
    expect(result.missingFields).not.toContain("actual purchase price");
  });

  it("adds 30 points when a mortgage exists", () => {
    const result = getPropertyCompleteness({ ...base, mortgageCount: 1 });
    expect(result.score).toBe(40);
    expect(result.missingFields).not.toContain("mortgage status");
    expect(result.missingFields).not.toContain("mortgage details");
  });

  it("adds 30 points when hasMortgage is false (confirmed no mortgage)", () => {
    const result = getPropertyCompleteness({ ...base, hasMortgage: false });
    expect(result.score).toBe(40);
    expect(result.missingFields).not.toContain("mortgage status");
  });

  it("adds 30 points when mortgagePaidOff is true", () => {
    const result = getPropertyCompleteness({
      ...base,
      hasMortgage: false,
      mortgagePaidOff: true,
    });
    expect(result.score).toBe(40);
    expect(result.missingFields).not.toContain("mortgage status");
  });

  it("shows 'mortgage details' when hasMortgage=true but no mortgage added", () => {
    const result = getPropertyCompleteness({
      ...base,
      hasMortgage: true,
      mortgageCount: 0,
    });
    expect(result.score).toBe(10);
    expect(result.missingFields).toContain("mortgage details");
    expect(result.missingFields).not.toContain("mortgage status");
  });

  it("shows 'mortgage status' when hasMortgage=null and no mortgage", () => {
    const result = getPropertyCompleteness({
      ...base,
      hasMortgage: null,
      mortgageCount: 0,
    });
    expect(result.missingFields).toContain("mortgage status");
    expect(result.missingFields).not.toContain("mortgage details");
  });

  it("mortgage count >1 still adds only 30 points", () => {
    const result = getPropertyCompleteness({ ...base, mortgageCount: 3 });
    expect(result.score).toBe(40);
  });

  it("adds 30 points for cash invested", () => {
    const result = getPropertyCompleteness({ ...base, cashInvested: 60000 });
    expect(result.score).toBe(40);
    expect(result.missingFields).not.toContain("cash invested");
  });

  it("reaches max score 100 with all metric-ready fields (active mortgage)", () => {
    const result = getPropertyCompleteness({
      purchasePrice: 280000,
      currentEstimatedValue: 300000,
      cashInvested: 60000,
      mortgageCount: 1,
      hasMortgage: true,
      mortgagePaidOff: false,
    });
    expect(result.score).toBe(100);
    expect(result.missingFields).toHaveLength(0);
  });

  it("cash buyer with everything filled scores 100", () => {
    const result = getPropertyCompleteness({
      purchasePrice: 280000,
      currentEstimatedValue: 300000,
      cashInvested: 200000,
      mortgageCount: 0,
      hasMortgage: false,
      mortgagePaidOff: false,
    });
    expect(result.score).toBe(100);
  });

  it("paid-off owner with everything filled scores 100", () => {
    const result = getPropertyCompleteness({
      purchasePrice: 280000,
      currentEstimatedValue: 300000,
      cashInvested: 200000,
      mortgageCount: 0,
      hasMortgage: false,
      mortgagePaidOff: true,
    });
    expect(result.score).toBe(100);
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
    expect(result.score).toBe(40);
  });

  it("does not include bed/bath/sqft in score (handoff: flavor fields)", () => {
    // These fields are no longer scored — confirm no surprise score change.
    const result = getPropertyCompleteness({
      purchasePrice: 280000,
      currentEstimatedValue: 300000,
      cashInvested: 60000,
      mortgageCount: 1,
      hasMortgage: true,
      mortgagePaidOff: false,
    });
    expect(result.score).toBe(100);
  });
});
