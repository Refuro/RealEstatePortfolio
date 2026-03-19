import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateAmortizationSchedule,
  getBalanceSource,
  getEffectiveBalance,
  getExtraPaymentForYearsEarlier,
  getPayoffProjection,
  getPaymentStartLagMonths,
  getPayoffYearsWithExtra,
  getPiForAmortization,
  getProjectedBalanceAsOf,
  getToleranceAwarePayoffProjection,
  isWithinTermEndTolerance,
} from "./amortization";

describe("generateAmortizationSchedule", () => {
  it("returns empty schedule for non-positive loan or payment", () => {
    expect(
      generateAmortizationSchedule({
        originalLoanAmount: 0,
        annualInterestRate: 0.06,
        termYears: 30,
        startDate: new Date("2020-01-01"),
        monthlyPayment: 1000,
      })
    ).toEqual([]);
    expect(
      generateAmortizationSchedule({
        originalLoanAmount: 100000,
        annualInterestRate: 0.06,
        termYears: 30,
        startDate: new Date("2020-01-01"),
        monthlyPayment: 0,
      })
    ).toEqual([]);
  });

  it("produces monotonically decreasing balance and 360 rows for full term when payment covers interest", () => {
    const schedule = generateAmortizationSchedule({
      originalLoanAmount: 100_000,
      annualInterestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-15"),
      monthlyPayment: 600,
    });
    expect(schedule.length).toBe(360);
    let prev = 100_000;
    for (const row of schedule) {
      expect(row.balance).toBeLessThanOrEqual(prev + 0.01);
      prev = row.balance;
      expect(row.principal + row.interest).toBeCloseTo(row.payment, 1);
    }
    expect(schedule[0].interest).toBeCloseTo(100_000 * 0.005, 1);
    expect(schedule[schedule.length - 1].balance).toBe(0);
    const sumPrincipal = schedule.reduce((s, r) => s + r.principal, 0);
    expect(sumPrincipal).toBeCloseTo(100_000, 0);
  });

  it("uses month boundaries aligned to start month", () => {
    const schedule = generateAmortizationSchedule({
      originalLoanAmount: 50_000,
      annualInterestRate: 0.05,
      termYears: 15,
      startDate: new Date("2024-06-10"),
      monthlyPayment: 400,
    });
    expect(schedule[0].date.startsWith("2024-06")).toBe(true);
  });
});

describe("getPiForAmortization", () => {
  it("returns full payment when escrow is not included", () => {
    expect(
      getPiForAmortization({
        originalLoanAmount: 100_000,
        currentBalance: 90_000,
        interestRate: 0.06,
        termYears: 30,
        startDate: "2020-01-01",
        monthlyPayment: 2000,
        escrowIncluded: false,
      })
    ).toBe(2000);
  });

  it("subtracts escrow when included and clamps to a small positive P&I", () => {
    expect(
      getPiForAmortization({
        originalLoanAmount: 100_000,
        currentBalance: 90_000,
        interestRate: 0.06,
        termYears: 30,
        startDate: "2020-01-01",
        monthlyPayment: 2000,
        escrowIncluded: true,
        escrowAmount: 500,
      })
    ).toBe(1500);
    expect(
      getPiForAmortization({
        originalLoanAmount: 100_000,
        currentBalance: 90_000,
        interestRate: 0.06,
        termYears: 30,
        startDate: "2020-01-01",
        monthlyPayment: 2000,
        escrowIncluded: true,
        escrowAmount: 2500,
      })
    ).toBe(0.01);
  });
});

describe("getProjectedBalanceAsOf", () => {
  const input = {
    originalLoanAmount: 100_000,
    annualInterestRate: 0.06,
    termYears: 30,
    startDate: new Date(2020, 0, 1),
    monthlyPayment: 600,
  };

  it("returns 0 when as-of is before amortization start month", () => {
    expect(getProjectedBalanceAsOf(input, new Date(2019, 11, 15))).toBe(0);
  });

  it("returns a positive balance mid-loan", () => {
    const bal = getProjectedBalanceAsOf(input, new Date(2025, 5, 15));
    expect(bal).toBeGreaterThan(0);
    expect(bal).toBeLessThan(100_000);
  });
});

describe("getEffectiveBalance / getBalanceSource", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses stored balance when balance-as-of is within 6 months", () => {
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 88_888,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
      balanceAsOfDate: new Date("2025-05-01"),
    };
    expect(getEffectiveBalance(m)).toBe(88_888);
    expect(getBalanceSource(m)).toBe("stored");
  });

  it("falls back to current balance when projection is unavailable", () => {
    const m = {
      originalLoanAmount: 0,
      currentBalance: 50_000,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
      balanceAsOfDate: null,
    };
    expect(getEffectiveBalance(m)).toBe(50_000);
    expect(getBalanceSource(m)).toBe("projected");
  });
});

describe("getPaymentStartLagMonths", () => {
  it("returns 0 without paymentEffectiveDate", () => {
    expect(
      getPaymentStartLagMonths({
        originalLoanAmount: 100_000,
        currentBalance: 90_000,
        interestRate: 0.06,
        termYears: 30,
        startDate: new Date("2020-01-01"),
        monthlyPayment: 600,
      })
    ).toBe(0);
  });

  it("caps lag by maxLagMonths", () => {
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 90_000,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
      paymentEffectiveDate: new Date("2020-10-01"),
    };
    expect(getPaymentStartLagMonths(m)).toBe(3);
  });
});

describe("getPayoffProjection / tolerance helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-06-15T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null payoff when balance or payment is non-positive", () => {
    expect(
      getPayoffProjection({
        originalLoanAmount: 100_000,
        currentBalance: 0,
        interestRate: 0.06,
        termYears: 30,
        startDate: new Date("2020-01-01"),
        monthlyPayment: 600,
        balanceAsOfDate: new Date("2030-05-01"),
      })
    ).toEqual({ payoffDate: null, remainingAtTermEnd: null });
  });

  it("getToleranceAwarePayoffProjection passes through when payoff exists", () => {
    const projection = getToleranceAwarePayoffProjection({
      originalLoanAmount: 100_000,
      currentBalance: 500,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date(2020, 0, 1),
      monthlyPayment: 50_000,
      balanceAsOfDate: new Date(2030, 4, 1),
    });
    expect(projection.payoffDate).not.toBeNull();
    expect(projection.toleranceApplied).toBe(false);
  });

  it("isWithinTermEndTolerance respects residual threshold", () => {
    const mortgage = {
      originalLoanAmount: 100_000,
      currentBalance: 10_000,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
    };
    expect(isWithinTermEndTolerance(500, mortgage, { minResidualDollars: 1000 })).toBe(true);
    expect(isWithinTermEndTolerance(5000, mortgage, { minResidualDollars: 1000 })).toBe(false);
  });
});

/** Used by `payoff-card.tsx` / `mortgage-tab-content.tsx` — edge cases + deferred deep cases in docs/qa/test-infrastructure-review.md §4.2 */
describe("getExtraPaymentForYearsEarlier / getPayoffYearsWithExtra", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-06-15T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const paidOffMortgage = {
    originalLoanAmount: 100_000,
    currentBalance: 0,
    interestRate: 0.06,
    termYears: 30,
    startDate: new Date(2020, 0, 1),
    monthlyPayment: 600,
    balanceAsOfDate: new Date(2030, 4, 1),
  };

  it("getPayoffYearsWithExtra returns null when extra payment is negative", () => {
    expect(getPayoffYearsWithExtra(paidOffMortgage, -50)).toBeNull();
  });

  it("getExtraPaymentForYearsEarlier returns null when base loan has no payoff projection", () => {
    expect(getExtraPaymentForYearsEarlier(paidOffMortgage, 2)).toBeNull();
  });

  it("getPayoffYearsWithExtra returns a whole number of years when extra payment accelerates payoff", () => {
    const mortgage = {
      originalLoanAmount: 200_000,
      currentBalance: 50_000,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date(2015, 0, 1),
      monthlyPayment: 1200,
      balanceAsOfDate: new Date(2030, 4, 1),
    };
    const years = getPayoffYearsWithExtra(mortgage, 2000);
    expect(years).not.toBeNull();
    if (years !== null) {
      expect(Number.isInteger(years)).toBe(true);
      expect(years).toBeGreaterThanOrEqual(0);
    }
  });
});

