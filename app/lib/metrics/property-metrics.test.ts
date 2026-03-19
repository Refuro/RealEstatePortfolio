import { describe, expect, it } from "vitest";
import {
  computePropertyMetrics,
  getAnnualDebtService,
  scaleLiabilityAmount,
} from "./property-metrics";

describe("scaleLiabilityAmount", () => {
  it("scales by ownership in proportional mode", () => {
    expect(scaleLiabilityAmount(1000, 50, undefined)).toBe(500);
    expect(scaleLiabilityAmount(1000, 100, "proportional")).toBe(1000);
  });

  it("does not scale payment amount in full_liability mode", () => {
    expect(scaleLiabilityAmount(1200, 50, "full_liability")).toBe(1200);
  });

  it("treats undefined ownership as 100%", () => {
    expect(scaleLiabilityAmount(800, undefined, undefined)).toBe(800);
  });
});

describe("getAnnualDebtService", () => {
  it("returns 12x scaled monthly payment for proportional", () => {
    expect(getAnnualDebtService(1000, 100, "proportional")).toBe(12000);
    expect(getAnnualDebtService(1000, 50, "proportional")).toBe(6000);
  });

  it("uses full monthly payment for full_liability regardless of ownership percent", () => {
    expect(getAnnualDebtService(1000, 50, "full_liability")).toBe(12000);
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

  it("applies default 5% vacancy to effective rent (proportional)", () => {
    const m = computePropertyMetrics(base, "proportional");
    // effectiveRent = 1000 * 0.95 = 950; gross annual full = 11400 → scaled 11400 at 100%
    expect(m.grossAnnualRent).toBeCloseTo(11400, 5);
    expect(m.annualExpenses).toBeCloseTo(400 * 12, 5);
    expect(m.noi).toBeCloseTo((11400 - 4800) * 1, 5);
    expect(m.monthlyCashFlow).toBeCloseTo((950 - 400 - 1200) * 1, 5);
    expect(m.equity).toBeCloseTo((300_000 - 200_000) * 1, 5);
    expect(m.ltv).toBeCloseTo(200_000 / 300_000, 5);
    expect(m.capRate).toBeCloseTo((11400 - 4800) / 300_000, 5);
  });

  it("scales income and expenses for 50% proportional ownership", () => {
    const m = computePropertyMetrics({ ...base, ownershipPercent: 50 }, "proportional");
    expect(m.grossAnnualRent).toBeCloseTo(11400 * 0.5, 5);
    expect(m.monthlyCashFlow).toBeCloseTo((950 - 400 - 1200) * 0.5, 5);
    expect(m.equity).toBeCloseTo(100_000 * 0.5, 5);
  });

  it("uses full debt service in full_liability mode with partial ownership", () => {
    const m = computePropertyMetrics({ ...base, ownershipPercent: 50 }, "full_liability");
    // monthly: effectiveRent*scale - expenses*scale - full payment
    const effectiveRent = 950;
    expect(m.monthlyCashFlow).toBeCloseTo(
      effectiveRent * 0.5 - 400 * 0.5 - 1200,
      5
    );
  });

  it("returns null cap rate when estimated value is zero", () => {
    const m = computePropertyMetrics({ ...base, estimatedValue: 0 }, "proportional");
    expect(m.capRate).toBeNull();
    expect(m.ltv).toBeNull();
  });

  it("returns null cash-on-cash when no cash invested", () => {
    const m = computePropertyMetrics({ ...base, cashInvested: null }, "proportional");
    expect(m.cashOnCashReturn).toBeNull();
  });
});
