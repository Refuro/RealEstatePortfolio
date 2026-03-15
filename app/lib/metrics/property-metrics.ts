/**
 * Property-level investment metrics (pure functions).
 * Formulas from docs/engineering-spec.md §6.
 */

export type OwnershipDisplayMode = "proportional" | "full_liability";

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

export function computePropertyMetrics(
  input: PropertyMetricsInput,
  displayMode?: OwnershipDisplayMode | null
): PropertyMetrics {
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
  const fullLiability = displayMode === "full_liability";
  const effectiveRent = monthlyRent * (1 - vacancyPercent / 100);

  const grossAnnualRent = effectiveRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const noi = grossAnnualRent - annualExpenses;
  const capRate = estimatedValue > 0 ? noi / estimatedValue : null;

  // full_liability: cash flow = (effectiveRent×scale − expenses×scale − full payment)
  // proportional: cash flow = (effectiveRent − expenses − payment) × scale
  const monthlyCashFlow = fullLiability
    ? effectiveRent * scale - monthlyExpenses * scale - totalMonthlyPayment
    : (effectiveRent - monthlyExpenses - totalMonthlyPayment) * scale;

  const annualCashFlow = monthlyCashFlow * 12;

  // Equity stays scaled in both modes
  const equity = (estimatedValue - totalMortgageBalance) * scale;

  // LTV: debt in context of property stays as-is (full debt / full value)
  const ltv = estimatedValue > 0 ? totalMortgageBalance / estimatedValue : null;

  const cashInvestedScaled = cashInvested != null && cashInvested > 0 ? cashInvested * scale : 0;
  const cashOnCashReturn =
    cashInvestedScaled > 0 ? annualCashFlow / cashInvestedScaled : null;

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
