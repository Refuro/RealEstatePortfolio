import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  adjustSnapshotCashFlow,
  buildSnapshotData,
  computeSnapshotDelta,
  shouldApplyAvmRent,
  shouldApplyAvmValue,
  type SnapshotData,
} from "@/lib/snapshots";

describe("snapshot thresholds", () => {
  it("applies value threshold when absolute change is >= $10,000", () => {
    expect(shouldApplyAvmValue(300_000, 310_000)).toBe(true);
  });

  it("applies value threshold when percent change is >= 3%", () => {
    expect(shouldApplyAvmValue(300_000, 309_001)).toBe(true);
  });

  it("does not apply value threshold below both limits", () => {
    expect(shouldApplyAvmValue(300_000, 307_000)).toBe(false);
  });

  it("applies rent threshold when absolute change is >= $50", () => {
    expect(shouldApplyAvmRent(2_000, 2_050)).toBe(true);
  });

  it("applies rent threshold when percent change is >= 5%", () => {
    expect(shouldApplyAvmRent(2_000, 2_100)).toBe(true);
  });
});

describe("buildSnapshotData", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("builds a snapshot with AVM-applied values", () => {
    const snapshot = buildSnapshotData(
      {
        id: "prop_1",
        currentEstimatedValue: 300_000,
        currentMonthlyExpenses: 500,
        currentMonthlyRent: 2_500,
        cashInvested: 50_000,
        ownershipPercent: 100,
        vacancyPercent: 5,
        marketRent: 2_450,
      },
      [
        {
          originalLoanAmount: 250_000,
          currentBalance: 150_000,
          interestRate: 0.06,
          termYears: 30,
          startDate: new Date("2020-01-01"),
          monthlyPayment: 1_600,
          balanceAsOfDate: new Date(2026, 3, 1),
        },
      ],
      {
        valueEstimate: 320_000,
        rentEstimate: 2_700,
        avmValueApplied: true,
        avmRentApplied: true,
      }
    );

    expect(snapshot.propertyId).toBe("prop_1");
    expect(snapshot.snapshotMonth.toISOString().slice(0, 10)).toBe("2026-04-01");
    expect(snapshot.estimatedValue).toBe(320_000);
    expect(snapshot.marketRent).toBe(2_700);
    expect(snapshot.avmValueApplied).toBe(true);
    expect(snapshot.avmRentApplied).toBe(true);
    expect(snapshot.effectiveMortgageBalance).toBe(150_000);
    // New basis-driver fields for display-mode re-derivation
    expect(snapshot.ownershipPct).toBe(1.0); // 100 / 100
    expect(snapshot.monthlyPayment).toBe(1_600);
  });

  it("stores ownershipPct as fraction for partial-ownership properties", () => {
    const snapshot = buildSnapshotData(
      {
        id: "prop_partial",
        currentEstimatedValue: 400_000,
        currentMonthlyExpenses: 800,
        currentMonthlyRent: 3_000,
        ownershipPercent: 50,
        vacancyPercent: 0,
      },
      [{ originalLoanAmount: 200_000, currentBalance: 180_000, interestRate: 0.065, termYears: 30, startDate: new Date("2022-01-01"), monthlyPayment: 1_400, balanceAsOfDate: null }],
      { avmValueApplied: false, avmRentApplied: false }
    );

    expect(snapshot.ownershipPct).toBe(0.5);
    expect(snapshot.monthlyPayment).toBe(1_400);
    // monthlyCashFlow stored in proportional mode: (3000 - 800 - 1400) * 0.5 = 400
    expect(snapshot.monthlyCashFlow).toBeCloseTo(400);
  });
});

describe("adjustSnapshotCashFlow", () => {
  it("returns stored cash flow unchanged for proportional mode", () => {
    expect(adjustSnapshotCashFlow(400, 0.5, 1200, "proportional")).toBe(400);
  });

  it("returns stored cash flow unchanged when displayMode is null/undefined", () => {
    expect(adjustSnapshotCashFlow(400, 0.5, 1200, null)).toBe(400);
    expect(adjustSnapshotCashFlow(400, 0.5, 1200, undefined)).toBe(400);
  });

  it("applies full-liability adjustment for 50% ownership", () => {
    // R=3000, E=1000, P=1200, s=0.5, vacancy=0
    // mcf_prop = (3000 - 1000 - 1200) * 0.5 = 400
    // mcf_full = 3000*0.5 - 1000*0.5 - 1200 = -200
    // adjustment = -1200 * (1 - 0.5) = -600 → 400 - 600 = -200
    expect(adjustSnapshotCashFlow(400, 0.5, 1200, "full_liability")).toBe(-200);
  });

  it("returns stored cash flow unchanged when ownershipPct is 1.0 (100%)", () => {
    expect(adjustSnapshotCashFlow(400, 1.0, 1200, "full_liability")).toBe(400);
  });

  it("treats null ownershipPct as 1.0 (graceful degradation for legacy rows)", () => {
    expect(adjustSnapshotCashFlow(400, null, 1200, "full_liability")).toBe(400);
  });

  it("treats null monthlyPayment as 0 (no mortgage)", () => {
    expect(adjustSnapshotCashFlow(400, 0.5, null, "full_liability")).toBe(400);
  });

  it("applies correct adjustment for 25% ownership", () => {
    // P=1200, s=0.25 → adjustment = -1200 * 0.75 = -900
    expect(adjustSnapshotCashFlow(100, 0.25, 1200, "full_liability")).toBe(100 - 900);
  });
});

describe("computeSnapshotDelta", () => {
  const current: SnapshotData = {
    propertyId: "prop_1",
    snapshotMonth: new Date("2026-04-01"),
    estimatedValue: 320_000,
    effectiveMortgageBalance: 149_000,
    equity: 171_000,
    marketRent: 2_700,
    monthlyRent: 2_500,
    monthlyCashFlow: 200,
    capRate: 0.066,
    ltv: 0.465,
    avmValueRaw: 320_000,
    avmRentRaw: 2_700,
    avmValueApplied: true,
    avmRentApplied: true,
    ownershipPct: 1.0,
    monthlyPayment: 1_600,
  };

  it("returns zero/nullable deltas for first snapshot", () => {
    const delta = computeSnapshotDelta(current, null);
    expect(delta.estimatedValueDelta).toBe(0);
    expect(delta.marketRentDelta).toBeNull();
    expect(delta.capRateDelta).toBeNull();
  });

  it("computes deltas when previous snapshot exists", () => {
    const previous: SnapshotData = {
      ...current,
      estimatedValue: 310_000,
      effectiveMortgageBalance: 150_000,
      equity: 160_000,
      marketRent: 2_650,
      monthlyRent: 2_450,
      monthlyCashFlow: 160,
      capRate: 0.062,
      ltv: 0.484,
      ownershipPct: 1.0,
      monthlyPayment: 1_600,
    };

    const delta = computeSnapshotDelta(current, previous);
    expect(delta.estimatedValueDelta).toBe(10_000);
    expect(delta.effectiveMortgageBalanceDelta).toBe(-1_000);
    expect(delta.equityDelta).toBe(11_000);
    expect(delta.marketRentDelta).toBe(50);
  });
});
