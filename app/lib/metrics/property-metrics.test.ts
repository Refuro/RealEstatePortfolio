import { describe, expect, it } from "vitest";
import {
  computePropertyMetrics,
  getAnnualDebtService,
  scaleLiabilityAmount,
} from "./property-metrics";

describe("scaleLiabilityAmount", () => {
  it("scales by ownership", () => {
    expect(scaleLiabilityAmount(1000, 50)).toBe(500);
    expect(scaleLiabilityAmount(1000, 100)).toBe(1000);
  });

  it("treats undefined ownership as 100%", () => {
    expect(scaleLiabilityAmount(800, undefined)).toBe(800);
  });
});

describe("getAnnualDebtService", () => {
  it("returns 12x ownership-scaled monthly payment", () => {
    expect(getAnnualDebtService(1000, 100)).toBe(12000);
    expect(getAnnualDebtService(1000, 50)).toBe(6000);
  });
});

describe("computePropertyMetrics", () => {
  const base = {
    monthlyRent: 1000,
    monthlyExpenses: 400,
    estimatedValue: 300_000,
    cashInvested: 50_000,
    totalMortgageBalance: 200_000,
    totalMonthlyPayment: 1200,
    ownershipPercent: 100,
    vacancyPercent: 5,
  };

  it("applies default 5% vacancy to effective rent at 100% ownership", () => {
    const m = computePropertyMetrics(base);
    // effectiveRent = 1000 * 0.95 = 950
    expect(m.grossAnnualRent).toBeCloseTo(11400, 5);
    expect(m.annualExpenses).toBeCloseTo(400 * 12, 5);
    expect(m.noi).toBeCloseTo(11400 - 4800, 5);
    expect(m.monthlyCashFlow).toBeCloseTo(950 - 400 - 1200, 5);
    expect(m.equity).toBeCloseTo(300_000 - 200_000, 5);
    expect(m.ltv).toBeCloseTo(200_000 / 300_000, 5);
    expect(m.capRate).toBeCloseTo((11400 - 4800) / 300_000, 5);
  });

  it("scales income, expenses, debt service, and equity for 50% ownership", () => {
    const m = computePropertyMetrics({ ...base, ownershipPercent: 50 });
    expect(m.grossAnnualRent).toBeCloseTo(11400 * 0.5, 5);
    expect(m.monthlyCashFlow).toBeCloseTo((950 - 400 - 1200) * 0.5, 5);
    expect(m.equity).toBeCloseTo(100_000 * 0.5, 5);
  });

  it("returns null cap rate when estimated value is zero", () => {
    const m = computePropertyMetrics({ ...base, estimatedValue: 0 });
    expect(m.capRate).toBeNull();
    expect(m.ltv).toBeNull();
  });

  it("returns null cash-on-cash when no cash invested", () => {
    const m = computePropertyMetrics({ ...base, cashInvested: null });
    expect(m.cashOnCashReturn).toBeNull();
  });

  it("does not scale cashInvested for partial ownership (it is the user's personal share)", () => {
    const fullOwner = computePropertyMetrics(base);
    const halfOwner = computePropertyMetrics({ ...base, ownershipPercent: 50 });
    // Cash invested stays $50k for both — annualCashFlow halves at 50%, so CoC halves too.
    expect(halfOwner.cashOnCashReturn).toBeCloseTo(fullOwner.cashOnCashReturn! / 2, 5);
  });
});
