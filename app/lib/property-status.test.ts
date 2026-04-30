import { describe, expect, it } from "vitest";
import {
  PROPERTY_STATUS_LTV_NEGATIVE_THRESHOLD,
  getPropertyStatus,
  type PropertyStatusBenchmarkInputs,
  type PropertyStatusMetrics,
} from "./property-status";
import type { PropertyCompletenessInput } from "./property-completeness";

const completeProperty: PropertyCompletenessInput = {
  purchasePrice: 280000,
  currentEstimatedValue: 300000,
  cashInvested: 60000,
  mortgageCount: 1,
  hasMortgage: true,
  mortgagePaidOff: false,
};

const positiveMetrics: PropertyStatusMetrics = {
  monthlyCashFlow: 200,
  ltv: 0.6,
};

// A long-stale benchmark date — "not fresh", so below-market check shouldn't fire.
const staleBenchmark: PropertyStatusBenchmarkInputs = {
  isRented: true,
  userRent: 2000,
  marketRent: 2200,
  marketRentAsOf: new Date("2020-01-01"),
};

const freshNow = new Date();

const freshBelowMarket: PropertyStatusBenchmarkInputs = {
  isRented: true,
  userRent: 1800,
  marketRent: 2200,
  marketRentAsOf: freshNow,
};

const freshAtMarket: PropertyStatusBenchmarkInputs = {
  isRented: true,
  userRent: 2200,
  marketRent: 2200,
  marketRentAsOf: freshNow,
};

describe("getPropertyStatus", () => {
  it("returns 'positive' for a healthy property", () => {
    expect(getPropertyStatus(completeProperty, positiveMetrics, staleBenchmark)).toBe(
      "positive"
    );
  });

  it("returns 'negative' when monthly cash flow is below zero", () => {
    expect(
      getPropertyStatus(
        completeProperty,
        { monthlyCashFlow: -1, ltv: 0.5 },
        staleBenchmark
      )
    ).toBe("negative");
  });

  it("returns 'negative' when LTV is strictly above 0.90", () => {
    expect(
      getPropertyStatus(
        completeProperty,
        { monthlyCashFlow: 200, ltv: 0.91 },
        staleBenchmark
      )
    ).toBe("negative");
  });

  it("does NOT return 'negative' when LTV equals exactly 0.90 (strict >)", () => {
    expect(
      getPropertyStatus(
        completeProperty,
        { monthlyCashFlow: 200, ltv: PROPERTY_STATUS_LTV_NEGATIVE_THRESHOLD },
        staleBenchmark
      )
    ).toBe("positive");
  });

  it("returns 'negative' even when also incomplete (cash flow takes precedence)", () => {
    expect(
      getPropertyStatus(
        { ...completeProperty, cashInvested: null },
        { monthlyCashFlow: -50, ltv: 0.5 },
        staleBenchmark
      )
    ).toBe("negative");
  });

  it("returns 'warning' when profile is incomplete", () => {
    const incomplete: PropertyCompletenessInput = {
      ...completeProperty,
      cashInvested: null,
    };
    expect(getPropertyStatus(incomplete, positiveMetrics, staleBenchmark)).toBe(
      "warning"
    );
  });

  it("returns 'warning' when rent is below market AND benchmark is fresh", () => {
    expect(
      getPropertyStatus(completeProperty, positiveMetrics, freshBelowMarket)
    ).toBe("warning");
  });

  it("returns 'positive' when benchmark is fresh but rent is at market", () => {
    expect(getPropertyStatus(completeProperty, positiveMetrics, freshAtMarket)).toBe(
      "positive"
    );
  });

  it("returns 'positive' when benchmark is stale even if user rent looks below market", () => {
    expect(
      getPropertyStatus(completeProperty, positiveMetrics, staleBenchmark)
    ).toBe("positive");
  });

  it("returns 'positive' when ltv is null (no mortgage) and metrics are otherwise positive", () => {
    expect(
      getPropertyStatus(
        { ...completeProperty, hasMortgage: false, mortgageCount: 0 },
        { monthlyCashFlow: 200, ltv: null },
        staleBenchmark
      )
    ).toBe("positive");
  });

  it("returns 'negative' for cash flow exactly below zero (boundary at 0 vs -1)", () => {
    expect(
      getPropertyStatus(
        completeProperty,
        { monthlyCashFlow: 0, ltv: 0.5 },
        staleBenchmark
      )
    ).toBe("positive");
    expect(
      getPropertyStatus(
        completeProperty,
        { monthlyCashFlow: -0.01, ltv: 0.5 },
        staleBenchmark
      )
    ).toBe("negative");
  });
});
