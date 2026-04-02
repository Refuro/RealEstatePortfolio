import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  generateAmortizationSchedule,
  getBalanceSource,
  getEffectiveBalance,
  getExtraPaymentForYearsEarlier,
  getMonthsToPayoffWithExtraStrict,
  getMonthsToPayoffWithExtraWithTolerance,
  getPayoffProjection,
  getPaymentStartLagMonths,
  getPayoffYearsWithExtra,
  getPayoffYearsWithExtraWithTolerance,
  getPiForAmortization,
  getProjectedBalanceAsOf,
  getToleranceAwarePayoffProjection,
  isNegativeAmortizingPayment,
  isWithinTermEndTolerance,
  projectStoredBalanceForward,
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

  it("returns empty schedule when P&I does not cover monthly interest", () => {
    const schedule = generateAmortizationSchedule({
      originalLoanAmount: 100_000,
      annualInterestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 100,
    });
    expect(schedule).toEqual([]);
  });

  it("allows interest-only (payment equals monthly interest on first month)", () => {
    const schedule = generateAmortizationSchedule({
      originalLoanAmount: 100_000,
      annualInterestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 100_000 * (0.06 / 12),
    });
    expect(schedule.length).toBe(360);
    expect(schedule[0].principal).toBe(0);
  });
});

describe("isNegativeAmortizingPayment", () => {
  it("is true when P&I is strictly below monthly interest", () => {
    expect(isNegativeAmortizingPayment(400, 100_000, 0.06)).toBe(true);
  });

  it("is false when P&I covers interest", () => {
    expect(isNegativeAmortizingPayment(600, 100_000, 0.06)).toBe(false);
  });

  it("is false for interest-only at equality", () => {
    const io = 100_000 * (0.06 / 12);
    expect(isNegativeAmortizingPayment(io, 100_000, 0.06)).toBe(false);
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

describe("projectStoredBalanceForward", () => {
  it("applies one month of amortization correctly", () => {
    // balance: 88_888, rate: 0.06/12 = 0.005, payment: 600 (no escrow)
    // interest = 88_888 * 0.005 = 444.44
    // principal = 600 - 444.44 = 155.56
    // result = 88_888 - 155.56 = 88_732.44
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 88_888,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
    };
    const result = projectStoredBalanceForward(
      88_888,
      new Date(2025, 4, 1), // May 2025
      m,
      new Date(2025, 5, 1)  // June 2025
    );
    expect(result).toBeCloseTo(88_732.44, 1);
  });

  it("applies multiple months of amortization", () => {
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 88_888,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
    };
    const oneMonth = projectStoredBalanceForward(
      88_888,
      new Date(2025, 4, 1),
      m,
      new Date(2025, 5, 1)
    );
    const twoMonths = projectStoredBalanceForward(
      88_888,
      new Date(2025, 4, 1),
      m,
      new Date(2025, 6, 1) // July 2025
    );
    // Two months must reduce balance more than one month
    expect(twoMonths).toBeLessThan(oneMonth);
    expect(twoMonths).toBeGreaterThan(0);
  });

  it("returns stored balance unchanged when fromDate equals toDate (same month)", () => {
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 88_888,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
    };
    const result = projectStoredBalanceForward(
      88_888,
      new Date(2025, 5, 1),
      m,
      new Date(2025, 5, 15) // same month, different day
    );
    expect(result).toBe(88_888);
  });

  it("short-circuits when P&I does not cover monthly interest", () => {
    // payment too low to cover interest → negative amortization → bail, return starting balance
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 100_000,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 100, // way below monthly interest of 500
    };
    const result = projectStoredBalanceForward(
      100_000,
      new Date(2025, 0, 1),
      m,
      new Date(2025, 3, 1) // 3 months later
    );
    expect(result).toBe(100_000);
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

  it("returns stored balance when balanceAsOfDate is in the current month", () => {
    // June 15 system time, June 1 balanceAsOfDate — same month → return verbatim
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 88_888,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
      balanceAsOfDate: new Date(2025, 5, 1), // local June 1 2025
    };
    expect(getEffectiveBalance(m)).toBe(88_888);
    expect(getBalanceSource(m)).toBe("stored");
  });

  it("projects stored balance forward when balanceAsOfDate is in a prior month within 6 months", () => {
    // System time: 2025-06-15. Statement: May 1. One month gap.
    // interest = 88_888 * 0.005 = 444.44; principal = 155.56; result ≈ 88_732.44
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 88_888,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 600,
      balanceAsOfDate: new Date(2025, 4, 1), // local May 1 2025
    };
    expect(getEffectiveBalance(m)).toBeCloseTo(88_732.44, 1);
    expect(getBalanceSource(m)).toBe("stored_projected");
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
  it("auto-infers 1-month lag for first-of-month closing when paymentEffectiveDate is absent", () => {
    expect(
      getPaymentStartLagMonths({
        originalLoanAmount: 100_000,
        currentBalance: 90_000,
        interestRate: 0.06,
        termYears: 30,
        startDate: new Date("2020-01-01"),
        monthlyPayment: 600,
      })
    ).toBe(1);
  });

  it("auto-infers 2-month lag for mid-month closing when paymentEffectiveDate is absent", () => {
    expect(
      getPaymentStartLagMonths({
        originalLoanAmount: 297_000,
        currentBalance: 288_417,
        interestRate: 0.0625,
        termYears: 30,
        startDate: new Date("2023-05-13"),
        monthlyPayment: 2648.08,
      })
    ).toBe(2);
  });

  it("uses explicit paymentEffectiveDate when provided, ignoring auto-inference", () => {
    // Use local-midnight Date constructors (not ISO strings) to avoid UTC-to-local day shifts.
    expect(
      getPaymentStartLagMonths({
        originalLoanAmount: 100_000,
        currentBalance: 90_000,
        interestRate: 0.06,
        termYears: 30,
        startDate: new Date(2020, 0, 13),           // local Jan 13
        monthlyPayment: 600,
        paymentEffectiveDate: new Date(2020, 2, 1), // local March 1 → 2 months after Jan
      })
    ).toBe(2);
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

  it("returns no payoff and current balance when P&I is below monthly interest", () => {
    const p = getPayoffProjection({
      originalLoanAmount: 100_000,
      currentBalance: 100_000,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date("2020-01-01"),
      monthlyPayment: 100,
      balanceAsOfDate: new Date("2030-05-01"),
    });
    expect(p.payoffDate).toBeNull();
    expect(p.remainingAtTermEnd).toBe(100_000);
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

/** Regression: Westport Property mortgage — mid-month closing shows payoff correctly without paymentEffectiveDate */
describe("mid-month closing payoff projection (Westport regression)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const westport = {
    originalLoanAmount: 297_000,
    currentBalance: 288_417,
    interestRate: 0.0625,
    termYears: 30,
    startDate: new Date("2023-05-13"),
    monthlyPayment: 2648.08,
    balanceAsOfDate: new Date("2026-03-17"),
    escrowIncluded: true,
    escrowAmount: 813,
  };

  it("auto-infers 2-month lag for May 13 closing", () => {
    expect(getPaymentStartLagMonths(westport)).toBe(2);
  });

  it("P&I is positive and above monthly interest — not negative amortizing", () => {
    const pi = getPiForAmortization(westport);
    expect(pi).toBeCloseTo(1835.08, 1);
    expect(isNegativeAmortizingPayment(pi, 288_417, 0.0625)).toBe(false);
  });

  it("getToleranceAwarePayoffProjection resolves payoff date without paymentEffectiveDate", () => {
    const projection = getToleranceAwarePayoffProjection(westport);
    expect(projection.payoffDate).not.toBeNull();
    expect(projection.toleranceApplied).toBe(true);
    // Payoff date should be within the tolerance window of the 30-year term end (May 2053)
    const payoffYear = projection.payoffDate!.getFullYear();
    expect(payoffYear).toBeGreaterThanOrEqual(2053);
    expect(payoffYear).toBeLessThanOrEqual(2054);
  });

  it("getToleranceAwarePayoffProjection also resolves with explicit paymentEffectiveDate set", () => {
    const withExplicit = { ...westport, paymentEffectiveDate: new Date("2023-07-01") };
    const projection = getToleranceAwarePayoffProjection(withExplicit);
    expect(projection.payoffDate).not.toBeNull();
    expect(projection.toleranceApplied).toBe(true);
  });
});

/** Canonical (strict) vs tolerance-aware UI — see docs/policies/analytics-math-policy.md §3.7 */
describe("getExtraPaymentForYearsEarlier / getPayoffYearsWithExtra (strict canonical)", () => {
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

  it("includes payment-start lag in payoff-years cap near term end", () => {
    vi.setSystemTime(new Date("2050-01-15T12:00:00.000Z"));
    const mortgage = {
      originalLoanAmount: 100_000,
      currentBalance: 100,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date(2020, 0, 15), // mid-month => inferred lag of 2 months
      monthlyPayment: 60,
      balanceAsOfDate: new Date(2050, 0, 1),
    };

    expect(getPaymentStartLagMonths(mortgage)).toBe(2);
    // Regression: before lag-inclusive cap, this returned null at term end.
    expect(getPayoffYearsWithExtra(mortgage, 0)).toBe(0);
    expect(getPayoffYearsWithExtraWithTolerance(mortgage, 0)).toBe(0);
  });
});

describe("hybrid payoff contract: strict core vs tolerance UI", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2030-06-15T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("getPayoffProjection never exposes toleranceApplied (strict contract)", () => {
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 50_000,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date(2020, 0, 1),
      monthlyPayment: 600,
      balanceAsOfDate: new Date(2030, 4, 1),
    };
    const p = getPayoffProjection(m);
    expect("toleranceApplied" in p).toBe(false);
  });

  it("getMonthsToPayoffWithExtraStrict is null while WithTolerance returns cap when small residual at cap is within tolerance", () => {
    const m = {
      originalLoanAmount: 100_000,
      currentBalance: 8000,
      interestRate: 0.06,
      termYears: 30,
      startDate: new Date(2020, 0, 1),
      monthlyPayment: 500,
      balanceAsOfDate: new Date(2030, 4, 1),
    };
    expect(getMonthsToPayoffWithExtraStrict(m, 0, 15)).toBeNull();
    expect(getMonthsToPayoffWithExtraWithTolerance(m, 0, 15)).toBe(15);
  });
});

