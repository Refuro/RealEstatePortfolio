import { describe, expect, it } from "vitest";
import { computeWholesaleResult } from "./wholesale-calculator";

describe("computeWholesaleResult", () => {
  it("normal case: computes MAO and spreads", () => {
    const r = computeWholesaleResult({
      arv: 250_000,
      estimatedRepairs: 35_000,
      assignmentFee: 10_000,
      buyerClosingCosts: 3_000,
      sellerClosingCosts: 5_000,
      monthlyHoldingCosts: 800,
      holdMonths: 3,
      arvMultiplier: 0.7,
    });

    expect(r.mao).toBeCloseTo(119_600, 6);
    expect(r.maoAsPercentArv).toBeCloseTo(119_600 / 250_000, 6);
    expect(r.wholesalerNetProfit).toBe(10_000);
  });

  it("negative MAO is valid when inputs are too expensive", () => {
    const r = computeWholesaleResult({
      arv: 150_000,
      estimatedRepairs: 90_000,
      assignmentFee: 15_000,
      buyerClosingCosts: 8_000,
      sellerClosingCosts: 7_000,
      monthlyHoldingCosts: 2_500,
      holdMonths: 6,
      arvMultiplier: 0.7,
    });

    expect(r.mao).toBeLessThan(0);
    expect(r.maoAsPercentArv).not.toBeNull();
  });

  it("zero ARV: MAO percent is null", () => {
    const r = computeWholesaleResult({
      arv: 0,
      estimatedRepairs: 20_000,
      assignmentFee: 8_000,
      buyerClosingCosts: 2_000,
      sellerClosingCosts: 2_000,
      monthlyHoldingCosts: 500,
      holdMonths: 2,
      arvMultiplier: 0.7,
    });

    expect(r.maoAsPercentArv).toBeNull();
    expect(Number.isFinite(r.mao)).toBe(true);
  });

  it("higher hold months reduce MAO", () => {
    const shortHold = computeWholesaleResult({
      arv: 300_000,
      estimatedRepairs: 40_000,
      assignmentFee: 12_000,
      buyerClosingCosts: 4_000,
      sellerClosingCosts: 5_000,
      monthlyHoldingCosts: 900,
      holdMonths: 1,
      arvMultiplier: 0.7,
    });
    const longHold = computeWholesaleResult({
      arv: 300_000,
      estimatedRepairs: 40_000,
      assignmentFee: 12_000,
      buyerClosingCosts: 4_000,
      sellerClosingCosts: 5_000,
      monthlyHoldingCosts: 900,
      holdMonths: 6,
      arvMultiplier: 0.7,
    });

    expect(longHold.mao).toBeLessThan(shortHold.mao);
  });

  it("known-answer reference case", () => {
    const r = computeWholesaleResult({
      arv: 200_000,
      estimatedRepairs: 30_000,
      assignmentFee: 10_000,
      buyerClosingCosts: 2_000,
      sellerClosingCosts: 3_000,
      monthlyHoldingCosts: 500,
      holdMonths: 2,
      arvMultiplier: 0.7,
    });

    // Total costs = 30k + 10k + 2k + 3k + 1k = 46k
    expect(r.totalDealCosts).toBeCloseTo(46_000, 6);
    // MAO = 140k - 30k - 2k - 3k - 1k - 10k = 94k
    expect(r.mao).toBeCloseTo(94_000, 6);
    expect(r.grossSpread).toBeCloseTo(154_000, 6);
    expect(r.endBuyerEquityCushion).toBeCloseTo(74_000, 6);
  });

  it("sanitization clamps invalid values", () => {
    const r = computeWholesaleResult({
      arv: -1,
      estimatedRepairs: -1,
      assignmentFee: -1,
      buyerClosingCosts: -1,
      sellerClosingCosts: -1,
      monthlyHoldingCosts: -1,
      holdMonths: 999,
      arvMultiplier: -5,
    });

    expect(r.totalDealCosts).toBe(0);
    expect(r.mao).toBe(0);
    expect(r.maoAsPercentArv).toBeNull();
  });
});
