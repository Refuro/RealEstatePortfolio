import { describe, expect, it } from "vitest";
import { computeStrLtrResult, type StrLtrCalculatorInput } from "./str-ltr-calculator";

/** Tuned so STR NOI > LTR NOI and both DSCR ≥ 1 at 100% ownership. */
const base = (): StrLtrCalculatorInput => ({
  nightlyRate: 195,
  annualOccupancyPercent: 68,
  platformFeePercent: 12,
  monthlyStrExpenses: 400,
  monthlyLtrRent: 2800,
  monthlyLtrVacancyPercent: 5,
  monthlyLtrExpenses: 400,
  monthlySharedExpenses: 400,
  monthlyMortgagePayment: 1597,
  purchasePrice: 300_000,
  downPaymentPercent: 20,
  ownershipPercent: 100,
});

describe("computeStrLtrResult", () => {
  it("happy path: STR beats LTR on NOI and delta positive", () => {
    const r = computeStrLtrResult(base());
    expect(r.delta.noi).toBeGreaterThan(0);
    expect(r.delta.monthlyCashFlow).toBeGreaterThan(0);
    expect(r.str.noi).toBeGreaterThan(r.ltr.noi);
    expect(r.str.dscr).not.toBeNull();
    expect(r.ltr.dscr).not.toBeNull();
    expect(r.str.dscr!).toBeGreaterThanOrEqual(1);
    expect(r.ltr.dscr!).toBeGreaterThanOrEqual(1);
  });

  it("LTR wins when STR fees and occupancy crush STR revenue", () => {
    const r = computeStrLtrResult({
      ...base(),
      nightlyRate: 50,
      annualOccupancyPercent: 30,
      platformFeePercent: 25,
      monthlyStrExpenses: 900,
      monthlyLtrRent: 3200,
      monthlyLtrVacancyPercent: 5,
    });
    expect(r.ltr.noi).toBeGreaterThan(r.str.noi);
    expect(r.delta.noi).toBeLessThan(0);
  });

  it("DSCR is null when mortgage payment is zero", () => {
    const r = computeStrLtrResult({ ...base(), monthlyMortgagePayment: 0 });
    expect(r.str.dscr).toBeNull();
    expect(r.ltr.dscr).toBeNull();
  });

  it("zero occupancy: STR income and NOI collapse", () => {
    const r = computeStrLtrResult({ ...base(), annualOccupancyPercent: 0 });
    expect(r.str.effectiveMonthlyIncome).toBe(0);
    expect(r.str.noi).toBeLessThan(0);
  });

  it("purchase price zero: cap rates null, DSCR still defined if payment > 0", () => {
    const r = computeStrLtrResult({ ...base(), purchasePrice: 0 });
    expect(r.str.capRate).toBeNull();
    expect(r.ltr.capRate).toBeNull();
    expect(r.str.dscr).not.toBeNull();
  });

  it("sanitizes negative nightly rate and occupancy over 100", () => {
    const r = computeStrLtrResult({
      ...base(),
      nightlyRate: -100,
      annualOccupancyPercent: 150,
      platformFeePercent: -5,
    });
    expect(r.str.effectiveMonthlyIncome).toBe(0);
    expect(Number.isFinite(r.str.noi)).toBe(true);
    expect(Number.isNaN(r.str.dscr)).toBe(false);
  });

  it("all outputs finite for extreme inputs", () => {
    const r = computeStrLtrResult({
      ...base(),
      monthlyMortgagePayment: 1e9,
    });
    expect(Number.isFinite(r.str.monthlyCashFlow)).toBe(true);
    expect(Number.isFinite(r.delta.monthlyCashFlow)).toBe(true);
  });
});
