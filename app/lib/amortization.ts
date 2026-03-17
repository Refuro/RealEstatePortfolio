/**
 * Amortization schedule generator for fixed-rate mortgages.
 * Module G — principal vs interest by month, remaining balance over time.
 */

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
    let principal = monthlyPayment - interest;

    // Pay off remaining balance only when payment is sufficient (avoids fake drop to 0 when payment is too low)
    if (principal >= balance) {
      principal = balance;
    }
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
