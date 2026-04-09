import { describe, expect, it } from "vitest";
import { computeCashOnCashResult } from "./cash-on-cash-calculator";

describe("computeCashOnCashResult", () => {
  it("normal case: positive cash flow and CoC return", () => {
    const r = computeCashOnCashResult({
      monthlyRent: 2_000,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 400,
      monthlyMortgagePayment: 1_200,
      downPayment: 60_000,
      closingCosts: 4_000,
      rehabCapex: 0,
      otherUpfrontCosts: 0,
    });

    expect(r.monthlyCashFlow).toBeGreaterThan(0);
    expect(r.cocReturnPercent).not.toBeNull();
    expect(r.cocReturnPercent!).toBeGreaterThan(0);
    expect(r.breakEvenMonths).not.toBeNull();
  });

  it("zero total cash invested: CoC and gross yield are null", () => {
    const r = computeCashOnCashResult({
      monthlyRent: 1_800,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 300,
      monthlyMortgagePayment: 1_000,
      downPayment: 0,
      closingCosts: 0,
      rehabCapex: 0,
      otherUpfrontCosts: 0,
    });

    expect(r.totalCashInvested).toBe(0);
    expect(r.cocReturnPercent).toBeNull();
    expect(r.grossYieldPercent).toBeNull();
  });

  it("high vacancy reduces monthly cash flow", () => {
    const lowVacancy = computeCashOnCashResult({
      monthlyRent: 2_200,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 450,
      monthlyMortgagePayment: 1_200,
      downPayment: 55_000,
      closingCosts: 3_000,
      rehabCapex: 2_000,
      otherUpfrontCosts: 500,
    });
    const highVacancy = computeCashOnCashResult({
      monthlyRent: 2_200,
      vacancyPercent: 30,
      monthlyOperatingExpenses: 450,
      monthlyMortgagePayment: 1_200,
      downPayment: 55_000,
      closingCosts: 3_000,
      rehabCapex: 2_000,
      otherUpfrontCosts: 500,
    });

    expect(highVacancy.monthlyCashFlow).toBeLessThan(lowVacancy.monthlyCashFlow);
    expect(highVacancy.annualCashFlow).toBeLessThan(lowVacancy.annualCashFlow);
  });

  it("negative monthly cash flow yields null break-even months", () => {
    const r = computeCashOnCashResult({
      monthlyRent: 1_600,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 700,
      monthlyMortgagePayment: 1_200,
      downPayment: 45_000,
      closingCosts: 4_000,
      rehabCapex: 6_000,
      otherUpfrontCosts: 1_000,
    });

    expect(r.monthlyCashFlow).toBeLessThan(0);
    expect(r.breakEvenMonths).toBeNull();
  });

  it("known-answer reference case", () => {
    const r = computeCashOnCashResult({
      monthlyRent: 2_000,
      vacancyPercent: 10,
      monthlyOperatingExpenses: 500,
      monthlyMortgagePayment: 900,
      downPayment: 40_000,
      closingCosts: 3_000,
      rehabCapex: 2_000,
      otherUpfrontCosts: 0,
    });

    // Effective monthly rent = 2000 * 0.9 = 1800
    expect(r.monthlyCashFlow).toBeCloseTo(400, 6);
    expect(r.annualCashFlow).toBeCloseTo(4_800, 6);
    expect(r.totalCashInvested).toBeCloseTo(45_000, 6);
    expect(r.cocReturnPercent).toBeCloseTo((4_800 / 45_000) * 100, 6);
    expect(r.grossYieldPercent).toBeCloseTo((24_000 / 45_000) * 100, 6);
    expect(r.breakEvenMonths).toBeCloseTo(112.5, 6);
  });

  it("sanitization: negatives floored and vacancy clamped", () => {
    const r = computeCashOnCashResult({
      monthlyRent: -100,
      vacancyPercent: 120,
      monthlyOperatingExpenses: -50,
      monthlyMortgagePayment: -20,
      downPayment: -1,
      closingCosts: -2,
      rehabCapex: -3,
      otherUpfrontCosts: -4,
    });

    expect(r.monthlyCashFlow).toBe(0);
    expect(r.totalCashInvested).toBe(0);
    expect(r.cocReturnPercent).toBeNull();
  });
});
