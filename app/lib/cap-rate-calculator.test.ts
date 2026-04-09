import { describe, expect, it } from "vitest";
import { computeCapRateResult } from "./cap-rate-calculator";

describe("computeCapRateResult", () => {
  it("normal case: positive NOI, cap rate, and GRM", () => {
    const r = computeCapRateResult({
      purchasePrice: 300_000,
      monthlyRent: 2_200,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 400,
      annualPropertyTaxes: 4_500,
      annualInsurance: 1_800,
      otherMonthlyCosts: 0,
    });

    expect(r.annualNoi).toBeGreaterThan(0);
    expect(r.capRate).not.toBeNull();
    expect(r.capRate!).toBeGreaterThan(0);
    expect(r.grossRentMultiplier).not.toBeNull();
  });

  it("zero purchase price: cap rate is null", () => {
    const r = computeCapRateResult({
      purchasePrice: 0,
      monthlyRent: 2_000,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 300,
      annualPropertyTaxes: 3_000,
      annualInsurance: 1_200,
      otherMonthlyCosts: 0,
    });

    expect(r.capRate).toBeNull();
    expect(Number.isFinite(r.annualNoi)).toBe(true);
  });

  it("zero rent: GRM is null and NOI can be negative", () => {
    const r = computeCapRateResult({
      purchasePrice: 250_000,
      monthlyRent: 0,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 350,
      annualPropertyTaxes: 4_000,
      annualInsurance: 1_500,
      otherMonthlyCosts: 75,
    });

    expect(r.grossRentMultiplier).toBeNull();
    expect(r.annualNoi).toBeLessThan(0);
  });

  it("high vacancy lowers effective gross income materially", () => {
    const lowVacancy = computeCapRateResult({
      purchasePrice: 300_000,
      monthlyRent: 2_200,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 400,
      annualPropertyTaxes: 4_500,
      annualInsurance: 1_800,
      otherMonthlyCosts: 0,
    });
    const highVacancy = computeCapRateResult({
      purchasePrice: 300_000,
      monthlyRent: 2_200,
      vacancyPercent: 30,
      monthlyOperatingExpenses: 400,
      annualPropertyTaxes: 4_500,
      annualInsurance: 1_800,
      otherMonthlyCosts: 0,
    });

    expect(highVacancy.effectiveGrossIncome).toBeLessThan(lowVacancy.effectiveGrossIncome);
    expect(highVacancy.annualNoi).toBeLessThan(lowVacancy.annualNoi);
  });

  it("expense-heavy scenario yields negative NOI and cap rate", () => {
    const r = computeCapRateResult({
      purchasePrice: 350_000,
      monthlyRent: 1_900,
      vacancyPercent: 8,
      monthlyOperatingExpenses: 1_400,
      annualPropertyTaxes: 9_000,
      annualInsurance: 3_000,
      otherMonthlyCosts: 600,
    });

    expect(r.annualNoi).toBeLessThan(0);
    expect(r.capRate).not.toBeNull();
    expect(r.capRate!).toBeLessThan(0);
  });

  it("known-answer reference case", () => {
    const r = computeCapRateResult({
      purchasePrice: 240_000,
      monthlyRent: 2_000,
      vacancyPercent: 10,
      monthlyOperatingExpenses: 300,
      annualPropertyTaxes: 3_600,
      annualInsurance: 1_200,
      otherMonthlyCosts: 100,
    });

    // EGI = 2,000 * 12 * 0.9 = 21,600
    expect(r.effectiveGrossIncome).toBeCloseTo(21_600, 6);
    // Expenses = (300 + 100) * 12 + 3,600 + 1,200 = 9,600
    expect(r.totalAnnualExpenses).toBeCloseTo(9_600, 6);
    // NOI = 12,000
    expect(r.annualNoi).toBeCloseTo(12_000, 6);
    expect(r.monthlyNoi).toBeCloseTo(1_000, 6);
    // Cap rate = 12,000 / 240,000 = 0.05
    expect(r.capRate).toBeCloseTo(0.05, 6);
    // GRM = 240,000 / 24,000 = 10
    expect(r.grossRentMultiplier).toBeCloseTo(10, 6);
  });
});
