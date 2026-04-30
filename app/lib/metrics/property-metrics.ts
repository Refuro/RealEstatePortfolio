/**
 * Property-level investment metrics (pure functions).
 * Formulas from docs/policies/ownership-metrics.md.
 */

export type PropertyMetricsInput = {
  monthlyRent: number;
  monthlyExpenses: number;
  estimatedValue: number;
  cashInvested: number | null;
  /** Sum of current balance across all mortgages for this property */
  totalMortgageBalance: number;
  /** Sum of monthly payment across all mortgages for this property */
  totalMonthlyPayment: number;
  /** Ownership percentage (1-100). Metrics scaled by this for partial ownership. */
  ownershipPercent?: number;
  /** Vacancy percentage (0-100). Effective rent = monthlyRent * (1 - vacancyPercent/100). Default 5. */
  vacancyPercent?: number;
};

export type PropertyMetrics = {
  /** Annual rent after vacancy: effective monthly rent × 12 × ownership scale (not raw contract rent). */
  grossAnnualRent: number;
  annualExpenses: number;
  noi: number;
  capRate: number | null;
  monthlyCashFlow: number;
  annualCashFlow: number;
  equity: number;
  ltv: number | null;
  cashOnCashReturn: number | null;
};

export type AnalyticsDebtServiceSource = "all_in_payment" | "amortized_pi";

export function scaleLiabilityAmount(
  amount: number,
  ownershipPercent: number | undefined
): number {
  const scale = (ownershipPercent ?? 100) / 100;
  return amount * scale;
}

export function getAnnualDebtService(
  totalMonthlyPayment: number,
  ownershipPercent: number | undefined
): number {
  return scaleLiabilityAmount(totalMonthlyPayment, ownershipPercent) * 12;
}

export function computeAnnualCashFlowFromAnnualInputs({
  annualRentFull,
  annualExpensesFull,
  annualDebtServiceFull,
  ownershipPercent,
}: {
  annualRentFull: number;
  annualExpensesFull: number;
  annualDebtServiceFull: number;
  ownershipPercent: number | undefined;
}): number {
  const scale = (ownershipPercent ?? 100) / 100;
  return (annualRentFull - annualExpensesFull - annualDebtServiceFull) * scale;
}

export function computePropertyMetrics(input: PropertyMetricsInput): PropertyMetrics {
  const {
    monthlyRent,
    monthlyExpenses,
    estimatedValue,
    cashInvested,
    totalMortgageBalance,
    totalMonthlyPayment,
    ownershipPercent = 100,
    vacancyPercent = 5,
  } = input;

  const scale = ownershipPercent / 100;
  const effectiveRent = monthlyRent * (1 - vacancyPercent / 100);

  const grossAnnualRent = effectiveRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const noi = grossAnnualRent - annualExpenses;
  const capRate = estimatedValue > 0 ? noi / estimatedValue : null;

  const monthlyCashFlow = (effectiveRent - monthlyExpenses - totalMonthlyPayment) * scale;
  const annualCashFlow = monthlyCashFlow * 12;

  const equity = (estimatedValue - totalMortgageBalance) * scale;

  // LTV: debt in context of property stays as-is (full debt / full value)
  const ltv = estimatedValue > 0 ? totalMortgageBalance / estimatedValue : null;

  const personalCashInvested = cashInvested != null && cashInvested > 0 ? cashInvested : 0;
  const cashOnCashReturn =
    personalCashInvested > 0 ? annualCashFlow / personalCashInvested : null;

  return {
    grossAnnualRent: grossAnnualRent * scale,
    annualExpenses: annualExpenses * scale,
    noi: noi * scale,
    capRate,
    monthlyCashFlow,
    annualCashFlow,
    equity,
    ltv,
    cashOnCashReturn,
  };
}
