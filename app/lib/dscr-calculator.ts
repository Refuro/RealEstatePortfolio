/**
 * DSCR educational calculator — pure functions.
 * Model supports interest-only and amortizing debt service, plus max-loan back-solve.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type DscrInput = {
  monthlyRent: number;
  vacancyPercent: number;
  monthlyOperatingExpenses: number;
  loanAmount: number;
  interestRatePercent: number;
  loanTermYears: number;
  interestOnly: boolean;
};

export type DscrResult = {
  dscr: number | null;
  annualNoi: number;
  annualDebtService: number;
  passesAt1_0: boolean;
  passesAt1_25: boolean;
  maxLoanAt1_25: number | null;
  maxLoanAt1_0: number | null;
};

function monthlyDebtService({
  loanAmount,
  monthlyRate,
  termMonths,
  interestOnly,
}: {
  loanAmount: number;
  monthlyRate: number;
  termMonths: number;
  interestOnly: boolean;
}): number {
  if (loanAmount <= 0) return 0;

  if (interestOnly) {
    return monthlyRate > 0 ? loanAmount * monthlyRate : 0;
  }

  if (termMonths <= 0) return 0;

  if (monthlyRate === 0) {
    return loanAmount / termMonths;
  }

  const factor = Math.pow(1 + monthlyRate, termMonths);
  return (loanAmount * monthlyRate * factor) / (factor - 1);
}

function maxLoanForTargetDscr({
  annualNoi,
  targetDscr,
  monthlyRate,
  termMonths,
  interestOnly,
}: {
  annualNoi: number;
  targetDscr: number;
  monthlyRate: number;
  termMonths: number;
  interestOnly: boolean;
}): number | null {
  if (annualNoi <= 0 || targetDscr <= 0) return null;
  const maxMonthlyPayment = annualNoi / targetDscr / 12;
  if (maxMonthlyPayment <= 0) return null;

  if (interestOnly) {
    if (monthlyRate <= 0) return null;
    return maxMonthlyPayment / monthlyRate;
  }

  if (termMonths <= 0) return null;

  if (monthlyRate === 0) {
    return maxMonthlyPayment * termMonths;
  }

  // Present value of level payment annuity.
  return (maxMonthlyPayment * (1 - Math.pow(1 + monthlyRate, -termMonths))) / monthlyRate;
}

export function computeDscrResult(input: DscrInput): DscrResult {
  const monthlyRent = Math.max(0, input.monthlyRent);
  const vacancyPercent = clamp(input.vacancyPercent, 0, 100);
  const monthlyOperatingExpenses = Math.max(0, input.monthlyOperatingExpenses);
  const loanAmount = Math.max(0, input.loanAmount);
  const interestRatePercent = clamp(input.interestRatePercent, 0, 30);
  const loanTermYears = clamp(input.loanTermYears, 1, 50);
  const interestOnly = input.interestOnly;

  const annualNoi =
    (monthlyRent * (1 - vacancyPercent / 100) - monthlyOperatingExpenses) * 12;
  const monthlyRate = interestRatePercent / 100 / 12;
  const termMonths = Math.round(loanTermYears * 12);

  const monthlyService = monthlyDebtService({
    loanAmount,
    monthlyRate,
    termMonths,
    interestOnly,
  });
  const annualDebtService = monthlyService * 12;

  const dscr = annualDebtService > 0 ? annualNoi / annualDebtService : null;
  const passesAt1_0 = dscr != null && dscr >= 1;
  const passesAt1_25 = dscr != null && dscr >= 1.25;

  const maxLoanAt1_25 = maxLoanForTargetDscr({
    annualNoi,
    targetDscr: 1.25,
    monthlyRate,
    termMonths,
    interestOnly,
  });
  const maxLoanAt1_0 = maxLoanForTargetDscr({
    annualNoi,
    targetDscr: 1,
    monthlyRate,
    termMonths,
    interestOnly,
  });

  return {
    dscr,
    annualNoi,
    annualDebtService,
    passesAt1_0,
    passesAt1_25,
    maxLoanAt1_25,
    maxLoanAt1_0,
  };
}
