import { describe, expect, it } from "vitest";
import {
  REFI_EQUITY_THRESHOLD,
  REFI_TARGET_DSCR,
  computeRentForTargetDscr,
  getRefiReadyStatus,
} from "./refi-ready";

describe("getRefiReadyStatus", () => {
  it("qualifies with active mortgage at DSCR ≥ 1.25 and equity ≥ 40%", () => {
    const status = getRefiReadyStatus({
      hasActiveMortgage: true,
      estimatedValue: 400_000,
      totalMortgageBalance: 200_000, // 50% equity
      dscr: 1.30,
    });
    expect(status.qualifies).toBe(true);
    expect(status.equityPct).toBeCloseTo(0.5);
    expect(status.currentEquity).toBe(200_000);
    expect(status.dscr).toBe(1.30);
    expect(status.hasMortgage).toBe(true);
  });

  it("does NOT qualify when there is no active mortgage (paid-off / never financed)", () => {
    const status = getRefiReadyStatus({
      hasActiveMortgage: false,
      estimatedValue: 400_000,
      totalMortgageBalance: 0,
      dscr: null,
    });
    expect(status.qualifies).toBe(false);
    expect(status.equityPct).toBe(1);
    expect(status.currentEquity).toBe(400_000);
    expect(status.hasMortgage).toBe(false);
  });

  it("does NOT qualify for paid-off property with high equity (active mortgage required)", () => {
    // Paid-off property: hasActiveMortgage=false, full equity. Should not be
    // surfaced as "refi-ready" — refi implies refinancing an existing loan.
    const status = getRefiReadyStatus({
      hasActiveMortgage: false,
      estimatedValue: 500_000,
      totalMortgageBalance: 0,
      dscr: null,
    });
    expect(status.qualifies).toBe(false);
  });

  it("does NOT qualify for never-financed property with high equity", () => {
    const status = getRefiReadyStatus({
      hasActiveMortgage: false,
      estimatedValue: 350_000,
      totalMortgageBalance: 0,
      dscr: null,
    });
    expect(status.qualifies).toBe(false);
  });

  it("does NOT qualify when equity is below 40% (low equity)", () => {
    const status = getRefiReadyStatus({
      hasActiveMortgage: true,
      estimatedValue: 400_000,
      totalMortgageBalance: 280_000, // 30% equity
      dscr: 1.50,
    });
    expect(status.qualifies).toBe(false);
    expect(status.equityPct).toBeCloseTo(0.3);
  });

  it("does NOT qualify when DSCR is below 1.25 (low DSCR)", () => {
    const status = getRefiReadyStatus({
      hasActiveMortgage: true,
      estimatedValue: 400_000,
      totalMortgageBalance: 200_000,
      dscr: 1.10,
    });
    expect(status.qualifies).toBe(false);
  });

  it("does NOT qualify when DSCR is null but a mortgage is active (no equity data)", () => {
    const status = getRefiReadyStatus({
      hasActiveMortgage: true,
      estimatedValue: 400_000,
      totalMortgageBalance: 200_000,
      dscr: null,
    });
    expect(status.qualifies).toBe(false);
  });

  it("does NOT qualify when there is no equity (estimatedValue == 0)", () => {
    const status = getRefiReadyStatus({
      hasActiveMortgage: false,
      estimatedValue: 0,
      totalMortgageBalance: 0,
      dscr: null,
    });
    expect(status.qualifies).toBe(false);
    expect(status.equityPct).toBe(0);
  });

  it("qualifies exactly at the 40% equity threshold", () => {
    const status = getRefiReadyStatus({
      hasActiveMortgage: true,
      estimatedValue: 400_000,
      totalMortgageBalance: 240_000, // 40% equity
      dscr: REFI_TARGET_DSCR,
    });
    expect(status.equityPct).toBeCloseTo(REFI_EQUITY_THRESHOLD);
    expect(status.qualifies).toBe(true);
  });
});

describe("computeRentForTargetDscr", () => {
  it("computes the rent that lifts DSCR exactly to the target", () => {
    // From refi-gap.test.ts: monthlyRent=2000, expenses=500, vacancy=5%, ADS=18000.
    // currentNOI = 16800; target NOI = 22500; target gross = 28500;
    // target effective monthly = 2375; target monthly = 2500.
    const target = computeRentForTargetDscr({
      annualDebtService: 18_000,
      monthlyExpenses: 500,
      vacancyPercent: 5,
    });
    expect(target).not.toBeNull();
    expect(target!).toBeCloseTo(2500, 0);
  });

  it("returns null when annual debt service is zero (no mortgage)", () => {
    expect(
      computeRentForTargetDscr({
        annualDebtService: 0,
        monthlyExpenses: 500,
        vacancyPercent: 5,
      })
    ).toBeNull();
  });

  it("returns null at or above 50% vacancy", () => {
    expect(
      computeRentForTargetDscr({
        annualDebtService: 18_000,
        monthlyExpenses: 500,
        vacancyPercent: 50,
      })
    ).toBeNull();
  });
});
