/**
 * Amortization schedule generator for fixed-rate mortgages.
 * Module G — principal vs interest by month, remaining balance over time.
 */

/** Dollar-scale tolerance for P&I vs monthly interest comparisons. */
export const AMORTIZATION_COMPARISON_EPSILON = 1e-4;

/**
 * True when the P&I portion is strictly below monthly interest on the balance
 * (unpaid interest would capitalize — we do not model that; callers should reject or skip schedules).
 * `annualInterestRate` is a decimal (e.g. 0.06 for 6%).
 */
export function isNegativeAmortizingPayment(
  pi: number,
  balance: number,
  annualInterestRate: number
): boolean {
  if (balance <= 0 || pi <= 0) return false;
  const monthlyRate = annualInterestRate / 12;
  const interestDue = balance * monthlyRate;
  return pi < interestDue - AMORTIZATION_COMPARISON_EPSILON;
}

export type AmortizationRow = {
  monthIndex: number;
  date: string; // YYYY-MM-DD
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type AmortizationInput = {
  originalLoanAmount: number;
  annualInterestRate: number;
  termYears: number;
  startDate: Date;
  monthlyPayment: number;
};

/**
 * Generate full amortization schedule for a fixed-rate loan.
 * Each row: month index, date, payment, principal, interest, remaining balance.
 */
export function generateAmortizationSchedule(input: AmortizationInput): AmortizationRow[] {
  const {
    originalLoanAmount,
    annualInterestRate,
    termYears,
    startDate,
    monthlyPayment,
  } = input;

  if (originalLoanAmount <= 0 || monthlyPayment <= 0) {
    return [];
  }

  const monthlyRate = annualInterestRate / 12;
  const totalMonths = termYears * 12;
  const schedule: AmortizationRow[] = [];

  let balance = originalLoanAmount;
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  for (let monthIndex = 0; monthIndex < totalMonths && balance > 0; monthIndex++) {
    const periodStart = new Date(start.getFullYear(), start.getMonth() + monthIndex, 1);
    const interest = balance * monthlyRate;
    if (monthlyPayment + AMORTIZATION_COMPARISON_EPSILON < interest) {
      return [];
    }
    let principal = monthlyPayment - interest;

    // Pay off remaining balance only when payment is sufficient (avoids fake drop to 0 when payment is too low)
    if (principal >= balance) {
      principal = balance;
    }
    principal = Math.max(0, principal);
    const payment = principal + interest;
    balance = Math.max(0, balance - principal);

    schedule.push({
      monthIndex,
      date: periodStart.toISOString().slice(0, 10),
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(principal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      balance: Math.round(balance * 100) / 100,
    });
  }

  return schedule;
}

/**
 * Mortgage record shape needed for balance projection.
 * Matches Prisma Mortgage model fields used in calculations.
 */
export type MortgageRecord = {
  originalLoanAmount: number | { toString(): string };
  currentBalance: number | { toString(): string };
  interestRate: number | { toString(): string };
  termYears: number;
  startDate: Date | string;
  monthlyPayment: number | { toString(): string };
  balanceAsOfDate?: Date | string | null;
  paymentEffectiveDate?: Date | string | null;
  escrowIncluded?: boolean;
  escrowAmount?: number | { toString(): string } | null;
};

/**
 * Get P&I (principal + interest) for amortization.
 * When escrowIncluded and escrowAmount are set and > 0: return monthlyPayment - escrowAmount, clamped to > 0.
 * Else: return monthlyPayment.
 */
export function getPiForAmortization(mortgage: MortgageRecord): number {
  const monthlyPayment = Number(mortgage.monthlyPayment);
  const escrowIncluded = mortgage.escrowIncluded === true;
  const escrowVal = mortgage.escrowAmount;
  const escrowAmount =
    escrowVal != null && escrowVal !== ""
      ? Number(typeof escrowVal === "object" && "toString" in escrowVal ? escrowVal.toString() : escrowVal)
      : 0;

  if (escrowIncluded && escrowAmount > 0) {
    const pi = monthlyPayment - escrowAmount;
    return Math.max(0.01, pi); // clamp to > 0 to avoid zero/negative P&I
  }
  return monthlyPayment;
}

/**
 * Get projected balance at a given date from the amortization schedule.
 * Returns 0 if asOfDate is before startDate, after payoff, or schedule is empty.
 */
export function getProjectedBalanceAsOf(
  input: AmortizationInput,
  asOfDate: Date
): number {
  const schedule = generateAmortizationSchedule(input);
  if (schedule.length === 0) return 0;

  const asOf = new Date(asOfDate.getFullYear(), asOfDate.getMonth(), asOfDate.getDate());
  const start = new Date(input.startDate);
  const startNorm = new Date(start.getFullYear(), start.getMonth(), 1);

  if (asOf < startNorm) return 0;

  let lastRow = schedule[0];
  for (const row of schedule) {
    const rowDate = new Date(row.date);
    if (rowDate > asOf) break;
    lastRow = row;
  }

  const lastRowDate = new Date(lastRow.date);
  const lastRowNorm = new Date(lastRowDate.getFullYear(), lastRowDate.getMonth(), 1);
  const asOfNorm = new Date(asOf.getFullYear(), asOf.getMonth(), 1);
  if (lastRowNorm > asOfNorm) return 0;

  return lastRow.balance;
}

/**
 * Get effective balance for a mortgage: stored if balanceAsOfDate is within 6 months,
 * else projected from amortization. Falls back to currentBalance if projection returns 0.
 */
export function getEffectiveBalance(mortgage: MortgageRecord): number {
  const currentBalance = Number(mortgage.currentBalance);
  const balanceAsOf = mortgage.balanceAsOfDate
    ? new Date(mortgage.balanceAsOfDate)
    : null;

  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

  if (balanceAsOf && balanceAsOf >= sixMonthsAgo) {
    return currentBalance;
  }

  const input: AmortizationInput = {
    originalLoanAmount: Number(mortgage.originalLoanAmount),
    annualInterestRate: Number(mortgage.interestRate),
    termYears: mortgage.termYears,
    startDate: new Date(mortgage.startDate),
    monthlyPayment: getPiForAmortization(mortgage),
  };

  const projected = getProjectedBalanceAsOf(input, today);
  return projected > 0 ? projected : currentBalance;
}

/**
 * Returns 'stored' when balanceAsOfDate exists and is within 6 months; else 'projected'.
 */
export function getBalanceSource(mortgage: MortgageRecord): "stored" | "projected" {
  const balanceAsOf = mortgage.balanceAsOfDate
    ? new Date(mortgage.balanceAsOfDate)
    : null;

  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

  if (balanceAsOf && balanceAsOf >= sixMonthsAgo) {
    return "stored";
  }
  return "projected";
}

export type PayoffProjection = {
  payoffDate: Date | null;
  remainingAtTermEnd: number | null;
};

export type PayoffToleranceOptions = {
  termEndMonthTolerance?: number;
  minResidualDollars?: number;
  residualPiMultiplier?: number;
  maxLagMonths?: number;
};

export type ToleranceAwarePayoffProjection = PayoffProjection & {
  toleranceApplied: boolean;
};

const DEFAULT_TOLERANCE_OPTIONS: Required<PayoffToleranceOptions> = {
  termEndMonthTolerance: 2,
  minResidualDollars: 1500,
  residualPiMultiplier: 2,
  maxLagMonths: 3,
};

function mergeToleranceOptions(
  options?: PayoffToleranceOptions
): Required<PayoffToleranceOptions> {
  return { ...DEFAULT_TOLERANCE_OPTIONS, ...options };
}

export function getPaymentStartLagMonths(
  mortgage: MortgageRecord,
  options?: PayoffToleranceOptions
): number {
  const { maxLagMonths } = mergeToleranceOptions(options);
  if (!mortgage.paymentEffectiveDate) return 0;
  const start = new Date(mortgage.startDate);
  const effective = new Date(mortgage.paymentEffectiveDate);
  const startNorm = new Date(start.getFullYear(), start.getMonth(), 1);
  const effectiveNorm = new Date(effective.getFullYear(), effective.getMonth(), 1);
  const months =
    (effectiveNorm.getFullYear() - startNorm.getFullYear()) * 12 +
    (effectiveNorm.getMonth() - startNorm.getMonth());
  return Math.min(maxLagMonths, Math.max(0, months));
}

export function getToleranceResidualThreshold(
  mortgage: MortgageRecord,
  options?: PayoffToleranceOptions
): number {
  const { minResidualDollars, residualPiMultiplier } = mergeToleranceOptions(options);
  const pi = getPiForAmortization(mortgage);
  const lagMonths = getPaymentStartLagMonths(mortgage, options);
  return Math.max(minResidualDollars, pi * (residualPiMultiplier + lagMonths));
}

export function isWithinTermEndTolerance(
  remainingAtTermEnd: number | null | undefined,
  mortgage: MortgageRecord,
  options?: PayoffToleranceOptions
): boolean {
  if (remainingAtTermEnd == null || remainingAtTermEnd <= 0) return false;
  const threshold = getToleranceResidualThreshold(mortgage, options);
  return remainingAtTermEnd <= threshold;
}

export function getToleranceAdjustedPayoffDate(
  mortgage: MortgageRecord,
  options?: PayoffToleranceOptions
): Date {
  const { termEndMonthTolerance } = mergeToleranceOptions(options);
  const startDate = new Date(mortgage.startDate);
  const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const baseTermEnd = new Date(
    startNorm.getFullYear(),
    startNorm.getMonth() + mortgage.termYears * 12,
    1
  );
  const lagMonths = Math.min(
    termEndMonthTolerance,
    getPaymentStartLagMonths(mortgage, options)
  );
  return new Date(baseTermEnd.getFullYear(), baseTermEnd.getMonth() + lagMonths, 1);
}

/**
 * Project payoff from effective balance forward.
 * Returns payoff date when payment fully amortizes; else remaining balance at term end.
 * Caps iterations at original term end. Uses getEffectiveBalance, getPiForAmortization.
 */
export function getPayoffProjection(mortgage: MortgageRecord): PayoffProjection {
  const balance = getEffectiveBalance(mortgage);
  const payment = getPiForAmortization(mortgage);
  const monthlyRate = Number(mortgage.interestRate) / 12;
  const termYears = mortgage.termYears;
  const startDate = new Date(mortgage.startDate);
  const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  const today = new Date();
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  if (balance <= 0 || payment <= 0) {
    return { payoffDate: null, remainingAtTermEnd: null };
  }

  const annualRate = Number(mortgage.interestRate);
  if (isNegativeAmortizingPayment(payment, balance, annualRate)) {
    return { payoffDate: null, remainingAtTermEnd: Math.round(balance) };
  }

  const monthsSinceStartDate = Math.max(
    0,
    (startOfCurrentMonth.getFullYear() - startNorm.getFullYear()) * 12 +
      (startOfCurrentMonth.getMonth() - startNorm.getMonth())
  );
  const totalTermMonths = termYears * 12;
  const remainingMonths = Math.max(0, totalTermMonths - monthsSinceStartDate);

  let runningBalance = balance;
  let periodStart = new Date(startOfCurrentMonth.getFullYear(), startOfCurrentMonth.getMonth() + 1, 1);

  for (let i = 0; i < remainingMonths && runningBalance > 0; i++) {
    const interest = runningBalance * monthlyRate;
    if (payment + AMORTIZATION_COMPARISON_EPSILON < interest) {
      return {
        payoffDate: null,
        remainingAtTermEnd: Math.round(runningBalance),
      };
    }
    let principal = payment - interest;

    if (principal >= runningBalance) {
      principal = runningBalance;
    }
    principal = Math.max(0, principal);
    runningBalance = Math.max(0, runningBalance - principal);

    if (runningBalance <= 0) {
      return { payoffDate: periodStart, remainingAtTermEnd: null };
    }

    periodStart = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1);
  }

  return {
    payoffDate: null,
    remainingAtTermEnd: Math.round(runningBalance),
  };
}

export function getToleranceAwarePayoffProjection(
  mortgage: MortgageRecord,
  options?: PayoffToleranceOptions
): ToleranceAwarePayoffProjection {
  const projection = getPayoffProjection(mortgage);
  if (projection.payoffDate) {
    return { ...projection, toleranceApplied: false };
  }
  if (isWithinTermEndTolerance(projection.remainingAtTermEnd, mortgage, options)) {
    return {
      payoffDate: getToleranceAdjustedPayoffDate(mortgage, options),
      remainingAtTermEnd: null,
      toleranceApplied: true,
    };
  }
  return { ...projection, toleranceApplied: false };
}

/**
 * Run month-by-month payoff simulation with base P&I + extra payment.
 * **Strict:** payoff only when balance reaches zero in the iteration; no end-of-term residual tolerance.
 * Use for API-facing and canonical extra-payment math.
 */
export function getMonthsToPayoffWithExtraStrict(
  mortgage: MortgageRecord,
  extraPayment: number,
  maxMonths: number
): number | null {
  const balance = getEffectiveBalance(mortgage);
  const basePi = getPiForAmortization(mortgage);
  const payment = basePi + extraPayment;
  const monthlyRate = Number(mortgage.interestRate) / 12;
  const termYears = mortgage.termYears;
  const startDate = new Date(mortgage.startDate);
  const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  const today = new Date();
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  if (balance <= 0 || payment <= 0) return null;

  const annualRateStrict = Number(mortgage.interestRate);
  if (isNegativeAmortizingPayment(payment, balance, annualRateStrict)) return null;

  const monthsSinceStartDate = Math.max(
    0,
    (startOfCurrentMonth.getFullYear() - startNorm.getFullYear()) * 12 +
      (startOfCurrentMonth.getMonth() - startNorm.getMonth())
  );
  const totalTermMonths = termYears * 12;
  const remainingTermMonths = Math.max(0, totalTermMonths - monthsSinceStartDate);
  const cap = Math.min(maxMonths, remainingTermMonths);

  let runningBalance = balance;
  for (let i = 0; i < cap && runningBalance > 0; i++) {
    const interest = runningBalance * monthlyRate;
    if (payment + AMORTIZATION_COMPARISON_EPSILON < interest) return null;
    let principal = payment - interest;
    if (principal >= runningBalance) principal = runningBalance;
    principal = Math.max(0, principal);
    runningBalance = Math.max(0, runningBalance - principal);
    if (runningBalance <= 0) return i + 1;
  }
  return null;
}

/**
 * Same iteration as {@link getMonthsToPayoffWithExtraStrict}, but if a small balance remains
 * at the iteration cap and it is within {@link isWithinTermEndTolerance}, returns `cap` as payoff horizon.
 * **UI / exploratory only** — not for canonical API or export contracts.
 */
export function getMonthsToPayoffWithExtraWithTolerance(
  mortgage: MortgageRecord,
  extraPayment: number,
  maxMonths: number,
  options?: PayoffToleranceOptions
): number | null {
  const balance = getEffectiveBalance(mortgage);
  const basePi = getPiForAmortization(mortgage);
  const payment = basePi + extraPayment;
  const monthlyRate = Number(mortgage.interestRate) / 12;
  const termYears = mortgage.termYears;
  const startDate = new Date(mortgage.startDate);
  const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  const today = new Date();
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  if (balance <= 0 || payment <= 0) return null;

  const annualRateTol = Number(mortgage.interestRate);
  if (isNegativeAmortizingPayment(payment, balance, annualRateTol)) return null;

  const monthsSinceStartDate = Math.max(
    0,
    (startOfCurrentMonth.getFullYear() - startNorm.getFullYear()) * 12 +
      (startOfCurrentMonth.getMonth() - startNorm.getMonth())
  );
  const totalTermMonths = termYears * 12;
  const remainingTermMonths = Math.max(0, totalTermMonths - monthsSinceStartDate);
  const cap = Math.min(maxMonths, remainingTermMonths);

  let runningBalance = balance;
  for (let i = 0; i < cap && runningBalance > 0; i++) {
    const interest = runningBalance * monthlyRate;
    if (payment + AMORTIZATION_COMPARISON_EPSILON < interest) return null;
    let principal = payment - interest;
    if (principal >= runningBalance) principal = runningBalance;
    principal = Math.max(0, principal);
    runningBalance = Math.max(0, runningBalance - principal);
    if (runningBalance <= 0) return i + 1;
  }
  if (isWithinTermEndTolerance(Math.round(runningBalance), mortgage, options)) {
    return cap;
  }
  return null;
}

/**
 * Get extra monthly payment needed to pay off yearsEarlier years sooner.
 * **Canonical / strict contract:** uses {@link getPayoffProjection} and {@link getMonthsToPayoffWithExtraStrict} only.
 * For UI that should align with tolerance-aware payoff dates, use {@link getExtraPaymentForYearsEarlierWithTolerance}.
 */
export function getExtraPaymentForYearsEarlier(
  mortgage: MortgageRecord,
  yearsEarlier: number
): number | null {
  const projection = getPayoffProjection(mortgage);
  if (projection.payoffDate == null) return null;

  const today = new Date();
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const payoffDate = new Date(projection.payoffDate);

  const currentPayoffMonths =
    (payoffDate.getFullYear() - startOfCurrentMonth.getFullYear()) * 12 +
    (payoffDate.getMonth() - startOfCurrentMonth.getMonth());

  const targetMonths = currentPayoffMonths - yearsEarlier * 12;
  if (targetMonths <= 0) return null;

  const balance = getEffectiveBalance(mortgage);
  let low = 0;
  let high = Math.ceil(balance); // safe upper bound: paying full balance in one month

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const months = getMonthsToPayoffWithExtraStrict(mortgage, mid, targetMonths + 1);
    if (months != null && months <= targetMonths) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  const monthsAtLow = getMonthsToPayoffWithExtraStrict(mortgage, low, targetMonths + 1);
  if (monthsAtLow == null || monthsAtLow > targetMonths) return null;

  return Math.round(low);
}

/**
 * Same as {@link getExtraPaymentForYearsEarlier} but uses {@link getToleranceAwarePayoffProjection}
 * and {@link getMonthsToPayoffWithExtraWithTolerance}. **UI-only** — disclose tolerance in copy.
 */
export function getExtraPaymentForYearsEarlierWithTolerance(
  mortgage: MortgageRecord,
  yearsEarlier: number,
  options?: PayoffToleranceOptions
): number | null {
  const projection = getToleranceAwarePayoffProjection(mortgage, options);
  if (projection.payoffDate == null) return null;

  const today = new Date();
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const payoffDate = new Date(projection.payoffDate);

  const currentPayoffMonths =
    (payoffDate.getFullYear() - startOfCurrentMonth.getFullYear()) * 12 +
    (payoffDate.getMonth() - startOfCurrentMonth.getMonth());

  const targetMonths = currentPayoffMonths - yearsEarlier * 12;
  if (targetMonths <= 0) return null;

  const balance = getEffectiveBalance(mortgage);
  let low = 0;
  let high = Math.ceil(balance);

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const months = getMonthsToPayoffWithExtraWithTolerance(
      mortgage,
      mid,
      targetMonths + 1,
      options
    );
    if (months != null && months <= targetMonths) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  const monthsAtLow = getMonthsToPayoffWithExtraWithTolerance(
    mortgage,
    low,
    targetMonths + 1,
    options
  );
  if (monthsAtLow == null || monthsAtLow > targetMonths) return null;

  return Math.round(low);
}

/**
 * Years to payoff when adding extra monthly payment.
 * **Canonical / strict:** requires a strict amortizing payoff from {@link getPayoffProjection}; uses
 * {@link getMonthsToPayoffWithExtraStrict}. For UI-friendly tolerance near term end, use
 * {@link getPayoffYearsWithExtraWithTolerance}.
 */
export function getPayoffYearsWithExtra(
  mortgage: MortgageRecord,
  extraPayment: number
): number | null {
  if (extraPayment < 0) return null;
  const projection = getPayoffProjection(mortgage);
  if (projection.payoffDate == null) return null;

  const termYears = mortgage.termYears;
  const startDate = new Date(mortgage.startDate);
  const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const today = new Date();
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthsSinceStart = Math.max(
    0,
    (startOfCurrentMonth.getFullYear() - startNorm.getFullYear()) * 12 +
      (startOfCurrentMonth.getMonth() - startNorm.getMonth())
  );
  const remainingTermMonths = Math.max(0, termYears * 12 - monthsSinceStart);

  const months = getMonthsToPayoffWithExtraStrict(
    mortgage,
    extraPayment,
    remainingTermMonths
  );
  if (months == null) return null;
  return Math.round(months / 12);
}

/**
 * Same as {@link getPayoffYearsWithExtra} but uses tolerance-aware base payoff and
 * {@link getMonthsToPayoffWithExtraWithTolerance}. **UI-only** — disclose tolerance in copy.
 */
export function getPayoffYearsWithExtraWithTolerance(
  mortgage: MortgageRecord,
  extraPayment: number,
  options?: PayoffToleranceOptions
): number | null {
  if (extraPayment < 0) return null;
  const projection = getToleranceAwarePayoffProjection(mortgage, options);
  if (projection.payoffDate == null) return null;

  const termYears = mortgage.termYears;
  const startDate = new Date(mortgage.startDate);
  const startNorm = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const today = new Date();
  const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthsSinceStart = Math.max(
    0,
    (startOfCurrentMonth.getFullYear() - startNorm.getFullYear()) * 12 +
      (startOfCurrentMonth.getMonth() - startNorm.getMonth())
  );
  const remainingTermMonths = Math.max(0, termYears * 12 - monthsSinceStart);

  const months = getMonthsToPayoffWithExtraWithTolerance(
    mortgage,
    extraPayment,
    remainingTermMonths,
    options
  );
  if (months == null) return null;
  return Math.round(months / 12);
}
