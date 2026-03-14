/**
 * Property-level investment metrics (pure functions).
 * Formulas from docs/engineering-spec.md §6.
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
};

export type PropertyMetrics = {
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

export function computePropertyMetrics(input: PropertyMetricsInput): PropertyMetrics {
  const {
    monthlyRent,
    monthlyExpenses,
    estimatedValue,
    cashInvested,
    totalMortgageBalance,
    totalMonthlyPayment,
    ownershipPercent = 100,
  } = input;

  const scale = ownershipPercent / 100;

  const grossAnnualRent = monthlyRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const noi = grossAnnualRent - annualExpenses;
  const capRate = estimatedValue > 0 ? noi / estimatedValue : null;
  const monthlyCashFlow = monthlyRent - monthlyExpenses - totalMonthlyPayment;
  const annualCashFlow = monthlyCashFlow * 12;
  const equity = estimatedValue - totalMortgageBalance;
  const ltv = estimatedValue > 0 ? totalMortgageBalance / estimatedValue : null;
  const cashOnCashReturn =
    cashInvested != null && cashInvested > 0 ? annualCashFlow / cashInvested : null;

  return {
    grossAnnualRent: grossAnnualRent * scale,
    annualExpenses: annualExpenses * scale,
    noi: noi * scale,
    capRate,
    monthlyCashFlow: monthlyCashFlow * scale,
    annualCashFlow: annualCashFlow * scale,
    equity: equity * scale,
    ltv,
    cashOnCashReturn,
  };
}
