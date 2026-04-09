import { describe, expect, it } from "vitest";
import { computeRentVsBuyResult } from "./rent-vs-buy-calculator";

describe("computeRentVsBuyResult", () => {
  it("finds break-even within horizon for balanced scenario", () => {
    const r = computeRentVsBuyResult({
      monthlyRent: 2_000,
      annualRentGrowthPercent: 3,
      homePrice: 400_000,
      downPaymentPercent: 20,
      mortgageRatePercent: 7,
      loanTermYears: 30,
      annualAppreciationPercent: 3,
      investmentReturnPercent: 7,
      annualPropertyTaxPercent: 1.2,
      monthlyInsuranceAndMaintenance: 300,
      horizonYears: 20,
    });

    expect(r.breakEvenYear).not.toBeNull();
    expect(r.breakEvenYear!).toBeGreaterThan(0);
    expect(r.breakEvenYear!).toBeLessThanOrEqual(20);
  });

  it("never breaks even when home price is very high", () => {
    const r = computeRentVsBuyResult({
      monthlyRent: 2_000,
      annualRentGrowthPercent: 2,
      homePrice: 1_800_000,
      downPaymentPercent: 20,
      mortgageRatePercent: 7,
      loanTermYears: 30,
      annualAppreciationPercent: 2,
      investmentReturnPercent: 7,
      annualPropertyTaxPercent: 1.2,
      monthlyInsuranceAndMaintenance: 500,
      horizonYears: 20,
    });

    expect(r.breakEvenYear).toBeNull();
  });

  it("zero appreciation makes owning less favorable vs baseline", () => {
    const withAppreciation = computeRentVsBuyResult({
      monthlyRent: 2_000,
      annualRentGrowthPercent: 3,
      homePrice: 400_000,
      downPaymentPercent: 20,
      mortgageRatePercent: 7,
      loanTermYears: 30,
      annualAppreciationPercent: 3,
      investmentReturnPercent: 7,
      annualPropertyTaxPercent: 1.2,
      monthlyInsuranceAndMaintenance: 300,
      horizonYears: 20,
    });
    const zeroAppreciation = computeRentVsBuyResult({
      monthlyRent: 2_000,
      annualRentGrowthPercent: 3,
      homePrice: 400_000,
      downPaymentPercent: 20,
      mortgageRatePercent: 7,
      loanTermYears: 30,
      annualAppreciationPercent: 0,
      investmentReturnPercent: 7,
      annualPropertyTaxPercent: 1.2,
      monthlyInsuranceAndMaintenance: 300,
      horizonYears: 20,
    });

    expect(zeroAppreciation.costAt20Years.own).toBeGreaterThan(withAppreciation.costAt20Years.own);
  });

  it("high rent growth favors buying sooner", () => {
    const lowGrowth = computeRentVsBuyResult({
      monthlyRent: 2_000,
      annualRentGrowthPercent: 1,
      homePrice: 400_000,
      downPaymentPercent: 20,
      mortgageRatePercent: 7,
      loanTermYears: 30,
      annualAppreciationPercent: 3,
      investmentReturnPercent: 7,
      annualPropertyTaxPercent: 1.2,
      monthlyInsuranceAndMaintenance: 300,
      horizonYears: 20,
    });
    const highGrowth = computeRentVsBuyResult({
      monthlyRent: 2_000,
      annualRentGrowthPercent: 6,
      homePrice: 400_000,
      downPaymentPercent: 20,
      mortgageRatePercent: 7,
      loanTermYears: 30,
      annualAppreciationPercent: 3,
      investmentReturnPercent: 7,
      annualPropertyTaxPercent: 1.2,
      monthlyInsuranceAndMaintenance: 300,
      horizonYears: 20,
    });

    const a = lowGrowth.breakEvenYear ?? 999;
    const b = highGrowth.breakEvenYear ?? 999;
    expect(b).toBeLessThanOrEqual(a);
  });

  it("known reference case values are stable", () => {
    const r = computeRentVsBuyResult({
      monthlyRent: 2_000,
      annualRentGrowthPercent: 3,
      homePrice: 400_000,
      downPaymentPercent: 20,
      mortgageRatePercent: 7,
      loanTermYears: 30,
      annualAppreciationPercent: 3,
      investmentReturnPercent: 7,
      annualPropertyTaxPercent: 1.2,
      monthlyInsuranceAndMaintenance: 300,
      horizonYears: 20,
    });

    expect(r.yearData).toHaveLength(20);
    expect(r.breakEvenYear).toBe(6);
    expect(r.costAt5Years.rent).toBeCloseTo(159_623, 0);
    expect(r.costAt10Years.own).toBeCloseTo(245_187, 0);
    expect(r.costAt20Years.delta).toBeCloseTo(-537_749, 0);
  });

  it("horizon bounds are respected and 5/10/20 snap to available years", () => {
    const r = computeRentVsBuyResult({
      monthlyRent: 2_000,
      annualRentGrowthPercent: 3,
      homePrice: 400_000,
      downPaymentPercent: 20,
      mortgageRatePercent: 7,
      loanTermYears: 30,
      annualAppreciationPercent: 3,
      investmentReturnPercent: 7,
      annualPropertyTaxPercent: 1.2,
      monthlyInsuranceAndMaintenance: 300,
      horizonYears: 3,
    });

    expect(r.yearData).toHaveLength(3);
    expect(r.costAt5Years.rent).toBeCloseTo(r.yearData[2].cumulativeRentCost, 6);
    expect(r.costAt10Years.own).toBeCloseTo(r.yearData[2].ownNetCost, 6);
    expect(r.costAt20Years.own).toBeCloseTo(r.yearData[2].ownNetCost, 6);
  });
});
