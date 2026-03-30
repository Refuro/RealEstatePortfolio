import { computePropertyMetrics, getAnnualDebtService } from "@/lib/metrics/property-metrics";

export type PublicCalculatorInput = {
  purchasePrice: number;
  monthlyRent: number;
  monthlyExpenses: number;
  downPaymentPercent: number;
  interestRatePercent: number;
  termYears: number;
  vacancyPercent: number;
};

export type PublicCalculatorResult = {
  loanAmount: number;
  downPaymentAmount: number;
  monthlyPayment: number;
  dscr: number | null;
  metrics: ReturnType<typeof computePropertyMetrics>;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Monthly payment using standard amortization.
 * Falls back to straight-line principal when rate is zero.
 */
export function computeMonthlyPayment(
  principal: number,
  annualRatePercent: number,
  termYears: number
): number {
  if (principal <= 0) return 0;
  const totalMonths = Math.max(1, Math.round(termYears * 12));
  const monthlyRate = Math.max(0, annualRatePercent) / 100 / 12;
  if (monthlyRate === 0) return principal / totalMonths;

  const pow = Math.pow(1 + monthlyRate, totalMonths);
  return (principal * monthlyRate * pow) / (pow - 1);
}

export function computePublicCalculatorResult(input: PublicCalculatorInput): PublicCalculatorResult {
  const purchasePrice = Math.max(0, input.purchasePrice);
  const monthlyRent = Math.max(0, input.monthlyRent);
  const monthlyExpenses = Math.max(0, input.monthlyExpenses);
  const downPaymentPercent = clamp(input.downPaymentPercent, 0, 100);
  const vacancyPercent = clamp(input.vacancyPercent, 0, 100);
  const termYears = clamp(input.termYears, 1, 40);
  const interestRatePercent = clamp(input.interestRatePercent, 0, 50);

  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = Math.max(0, purchasePrice - downPaymentAmount);
  const monthlyPayment = computeMonthlyPayment(loanAmount, interestRatePercent, termYears);

  const metrics = computePropertyMetrics(
    {
      monthlyRent,
      monthlyExpenses,
      estimatedValue: purchasePrice,
      cashInvested: downPaymentAmount > 0 ? downPaymentAmount : null,
      totalMortgageBalance: loanAmount,
      totalMonthlyPayment: monthlyPayment,
      ownershipPercent: 100,
      vacancyPercent,
    },
    "proportional"
  );

  const annualDebtService = getAnnualDebtService(monthlyPayment, 100, "proportional");
  const dscr = annualDebtService > 0 ? metrics.noi / annualDebtService : null;

  return {
    loanAmount,
    downPaymentAmount,
    monthlyPayment,
    dscr,
    metrics,
  };
}
