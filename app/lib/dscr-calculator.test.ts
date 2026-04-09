import { describe, expect, it } from "vitest";
import { computeDscrResult } from "./dscr-calculator";

describe("computeDscrResult", () => {
  it("normal case: DSCR is computed with positive debt service", () => {
    const r = computeDscrResult({
      monthlyRent: 2_200,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 650,
      loanAmount: 240_000,
      interestRatePercent: 7.5,
      loanTermYears: 30,
      interestOnly: false,
    });

    expect(r.dscr).not.toBeNull();
    expect(r.annualDebtService).toBeGreaterThan(0);
    expect(Number.isFinite(r.dscr!)).toBe(true);
  });

  it("interest-only has lower debt service than amortizing for same inputs", () => {
    const amort = computeDscrResult({
      monthlyRent: 2_500,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 700,
      loanAmount: 260_000,
      interestRatePercent: 7.5,
      loanTermYears: 30,
      interestOnly: false,
    });
    const io = computeDscrResult({
      monthlyRent: 2_500,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 700,
      loanAmount: 260_000,
      interestRatePercent: 7.5,
      loanTermYears: 30,
      interestOnly: true,
    });

    expect(io.annualDebtService).toBeLessThan(amort.annualDebtService);
    expect((io.dscr ?? 0)).toBeGreaterThan(amort.dscr ?? 0);
  });

  it("failing DSCR scenario", () => {
    const r = computeDscrResult({
      monthlyRent: 1_500,
      vacancyPercent: 8,
      monthlyOperatingExpenses: 700,
      loanAmount: 300_000,
      interestRatePercent: 8,
      loanTermYears: 30,
      interestOnly: false,
    });

    expect(r.passesAt1_0).toBe(false);
    expect(r.passesAt1_25).toBe(false);
  });

  it("back-solve validation: max loan at 1.25 reproduces ~1.25 DSCR", () => {
    const base = computeDscrResult({
      monthlyRent: 2_800,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 700,
      loanAmount: 200_000,
      interestRatePercent: 7,
      loanTermYears: 30,
      interestOnly: false,
    });

    expect(base.maxLoanAt1_25).not.toBeNull();
    const verify = computeDscrResult({
      monthlyRent: 2_800,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 700,
      loanAmount: base.maxLoanAt1_25!,
      interestRatePercent: 7,
      loanTermYears: 30,
      interestOnly: false,
    });
    expect(verify.dscr).not.toBeNull();
    expect(verify.dscr!).toBeCloseTo(1.25, 3);
  });

  it("zero rent gives non-positive NOI and no qualifying max loan", () => {
    const r = computeDscrResult({
      monthlyRent: 0,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 500,
      loanAmount: 150_000,
      interestRatePercent: 7,
      loanTermYears: 30,
      interestOnly: false,
    });

    expect(r.annualNoi).toBeLessThanOrEqual(0);
    expect(r.maxLoanAt1_25).toBeNull();
    expect(r.maxLoanAt1_0).toBeNull();
  });

  it("zero loan results in null DSCR and positive max loan when NOI positive", () => {
    const r = computeDscrResult({
      monthlyRent: 2_400,
      vacancyPercent: 5,
      monthlyOperatingExpenses: 500,
      loanAmount: 0,
      interestRatePercent: 7,
      loanTermYears: 30,
      interestOnly: false,
    });

    expect(r.annualDebtService).toBe(0);
    expect(r.dscr).toBeNull();
    expect(r.maxLoanAt1_25).not.toBeNull();
  });
});
