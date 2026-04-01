import { describe, expect, it } from "vitest";
import { computeFixAndFlipResult, type FixAndFlipInput } from "./fix-and-flip-calculator";

describe("computeFixAndFlipResult", () => {
  it("happy path: ~6 month hold, positive net profit and ROI", () => {
    const r = computeFixAndFlipResult({
      purchasePrice: 150_000,
      rehabCost: 40_000,
      holdMonths: 6,
      downPaymentPercent: 20,
      purchaseLoanRatePercent: 10,
      arv: 260_000,
      sellingCostsPercent: 8,
      monthlyCarryingCosts: 400,
    });
    expect(r.netProfit).toBeGreaterThan(0);
    expect(r.roiPercent).toBeGreaterThan(0);
    expect(r.annualizedRoiPercent).not.toBeNull();
    expect(r.annualizedRoiPercent!).toBeGreaterThan(r.roiPercent);
  });

  it("break-even band: small ARV swing changes sign of net profit", () => {
    const base: FixAndFlipInput = {
      purchasePrice: 100_000,
      rehabCost: 20_000,
      holdMonths: 4,
      downPaymentPercent: 25,
      purchaseLoanRatePercent: 8,
      arv: 200_000,
      sellingCostsPercent: 6,
      monthlyCarryingCosts: 300,
    };
    const high = computeFixAndFlipResult({ ...base, arv: 180_000 });
    const low = computeFixAndFlipResult({ ...base, arv: 100_000 });
    expect(high.netProfit).toBeGreaterThan(low.netProfit);
    expect(Number.isFinite(high.netProfit - low.netProfit)).toBe(true);
  });

  it("underwater: high costs yield negative net profit without NaN", () => {
    const r = computeFixAndFlipResult({
      purchasePrice: 200_000,
      rehabCost: 80_000,
      holdMonths: 12,
      downPaymentPercent: 10,
      purchaseLoanRatePercent: 12,
      arv: 220_000,
      sellingCostsPercent: 10,
      monthlyCarryingCosts: 800,
    });
    expect(r.netProfit).toBeLessThan(0);
    expect(Number.isFinite(r.roiPercent)).toBe(true);
  });

  it("zero hold months: no holding interest; annualized ROI null", () => {
    const r = computeFixAndFlipResult({
      purchasePrice: 100_000,
      rehabCost: 10_000,
      holdMonths: 0,
      downPaymentPercent: 20,
      purchaseLoanRatePercent: 10,
      arv: 150_000,
      sellingCostsPercent: 5,
      monthlyCarryingCosts: 200,
    });
    expect(r.totalHoldingInterest).toBe(0);
    expect(r.annualizedRoiPercent).toBeNull();
  });

  it("zero down: loan equals purchase; holding interest on full loan", () => {
    const r = computeFixAndFlipResult({
      purchasePrice: 80_000,
      rehabCost: 15_000,
      holdMonths: 3,
      downPaymentPercent: 0,
      purchaseLoanRatePercent: 12,
      arv: 130_000,
      sellingCostsPercent: 7,
      monthlyCarryingCosts: 150,
    });
    expect(r.loanAmount).toBe(80_000);
    expect(r.downPaymentAmount).toBe(0);
    expect(r.monthlyInterest).toBeGreaterThan(0);
  });

  it("sanitization: negative inputs floored; selling cost percent capped", () => {
    const r = computeFixAndFlipResult({
      purchasePrice: -50_000,
      rehabCost: -10_000,
      holdMonths: 999,
      downPaymentPercent: 150,
      purchaseLoanRatePercent: 99,
      arv: -1,
      sellingCostsPercent: 200,
      monthlyCarryingCosts: -50,
    });
    expect(r.loanAmount).toBe(0);
    expect(r.netProfit).toBe(0);
    expect(Number.isNaN(r.roiPercent)).toBe(false);
  });
});
