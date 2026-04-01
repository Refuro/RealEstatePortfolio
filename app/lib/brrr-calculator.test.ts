import { describe, expect, it } from "vitest";
import { computeBrrrCalculatorResult } from "./brrr-calculator";

describe("computeBrrrCalculatorResult", () => {
  it("computes refi cash-out and stabilized metrics", () => {
    const r = computeBrrrCalculatorResult({
      purchasePrice: 100_000,
      rehabCost: 25_000,
      rehabMonths: 4,
      downPaymentPercent: 20,
      purchaseLoanInterestRatePercent: 10,
      arv: 200_000,
      refinanceLtvPercent: 75,
      refinanceInterestRatePercent: 7,
      refinanceTermYears: 30,
      refinanceClosingCostPercent: 1,
      monthlyRent: 2_000,
      monthlyExpenses: 600,
      vacancyPercent: 5,
    });

    expect(r.initialLoanAmount).toBe(80_000);
    expect(r.downPaymentAmount).toBe(20_000);
    expect(r.newLoanAmount).toBe(150_000);
    expect(r.cashOutAtRefi).toBeGreaterThan(0);
    expect(r.metricsAfterRefi.monthlyCashFlow).toBeDefined();
    expect(r.dscrAfterRefi).not.toBeNull();
  });

  it("handles zero rehab months", () => {
    const r = computeBrrrCalculatorResult({
      purchasePrice: 50_000,
      rehabCost: 10_000,
      rehabMonths: 0,
      downPaymentPercent: 25,
      purchaseLoanInterestRatePercent: 12,
      arv: 100_000,
      refinanceLtvPercent: 70,
      refinanceInterestRatePercent: 8,
      refinanceTermYears: 30,
      refinanceClosingCostPercent: 0,
      monthlyRent: 1_200,
      monthlyExpenses: 400,
      vacancyPercent: 5,
    });
    expect(r.totalHoldingInterest).toBe(0);
    // 25% of 50k + 10k rehab, no holding interest
    expect(r.cashInvestedBeforeRefi).toBe(12_500 + 10_000);
  });
});
