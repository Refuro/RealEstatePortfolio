/**
 * BRRRR (Buy–Rehab–Rent–Refinance) educational calculator — pure functions.
 * Model: interest-only purchase loan during rehab, then cash-out refinance at ARV LTV.
 */

import { computePropertyMetrics, getAnnualDebtService } from "@/lib/metrics/property-metrics";
import { computeMonthlyPayment } from "@/lib/public-calculator";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type BrrrCalculatorInput = {
  purchasePrice: number;
  rehabCost: number;
  rehabMonths: number;
  downPaymentPercent: number;
  /** Annual rate on purchase loan (interest-only during rehab). */
  purchaseLoanInterestRatePercent: number;
  arv: number;
  refinanceLtvPercent: number;
  refinanceInterestRatePercent: number;
  refinanceTermYears: number;
  /** Closing costs as % of new loan amount. */
  refinanceClosingCostPercent: number;
  monthlyRent: number;
  monthlyExpenses: number;
  vacancyPercent: number;
};

export type BrrrCalculatorResult = {
  initialLoanAmount: number;
  downPaymentAmount: number;
  monthlyInterestOnlyDuringRehab: number;
  totalHoldingInterest: number;
  cashInvestedBeforeRefi: number;
  newLoanAmount: number;
  refinanceClosingCosts: number;
  /** Net proceeds from refi after paying off acquisition loan and closing (can exceed cash in). */
  cashOutAtRefi: number;
  /** Equity left in deal after refi (down + rehab + holding − cash out), floored at 0. */
  netCashLeftInDeal: number;
  monthlyPaymentAfterRefi: number;
  metricsAfterRefi: ReturnType<typeof computePropertyMetrics>;
  dscrAfterRefi: number | null;
};

export function computeBrrrCalculatorResult(input: BrrrCalculatorInput): BrrrCalculatorResult {
  const purchasePrice = Math.max(0, input.purchasePrice);
  const rehabCost = Math.max(0, input.rehabCost);
  const rehabMonths = clamp(Math.round(input.rehabMonths), 0, 120);
  const downPaymentPercent = clamp(input.downPaymentPercent, 0, 100);
  const purchaseRate = clamp(input.purchaseLoanInterestRatePercent, 0, 50);
  const arv = Math.max(0, input.arv);
  const refinanceLtvPercent = clamp(input.refinanceLtvPercent, 0, 100);
  const refinanceRate = clamp(input.refinanceInterestRatePercent, 0, 50);
  const refinanceTermYears = clamp(input.refinanceTermYears, 1, 40);
  const refinanceClosingCostPercent = clamp(input.refinanceClosingCostPercent, 0, 10);
  const monthlyRent = Math.max(0, input.monthlyRent);
  const monthlyExpenses = Math.max(0, input.monthlyExpenses);
  const vacancyPercent = clamp(input.vacancyPercent, 0, 100);

  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const initialLoanAmount = Math.max(0, purchasePrice - downPaymentAmount);
  const monthlyRate = purchaseRate / 100 / 12;
  const monthlyInterestOnlyDuringRehab = initialLoanAmount * monthlyRate;
  const totalHoldingInterest = monthlyInterestOnlyDuringRehab * rehabMonths;
  const cashInvestedBeforeRefi = downPaymentAmount + rehabCost + totalHoldingInterest;

  const newLoanAmount = arv * (refinanceLtvPercent / 100);
  const refinanceClosingCosts = newLoanAmount * (refinanceClosingCostPercent / 100);
  const cashOutAtRefi = Math.max(0, newLoanAmount - initialLoanAmount - refinanceClosingCosts);
  const netRaw = cashInvestedBeforeRefi - cashOutAtRefi;
  const netCashLeftInDeal = Math.max(0, netRaw);

  const monthlyPaymentAfterRefi = computeMonthlyPayment(
    newLoanAmount,
    refinanceRate,
    refinanceTermYears
  );

  const metricsAfterRefi = computePropertyMetrics({
    monthlyRent,
    monthlyExpenses,
    estimatedValue: arv,
    cashInvested: netCashLeftInDeal > 0 ? netCashLeftInDeal : null,
    totalMortgageBalance: newLoanAmount,
    totalMonthlyPayment: monthlyPaymentAfterRefi,
    ownershipPercent: 100,
    vacancyPercent,
  });

  const annualDebtService = getAnnualDebtService(monthlyPaymentAfterRefi, 100);
  const dscrAfterRefi =
    annualDebtService > 0 ? metricsAfterRefi.noi / annualDebtService : null;

  return {
    initialLoanAmount,
    downPaymentAmount,
    monthlyInterestOnlyDuringRehab,
    totalHoldingInterest,
    cashInvestedBeforeRefi,
    newLoanAmount,
    refinanceClosingCosts,
    cashOutAtRefi,
    netCashLeftInDeal,
    monthlyPaymentAfterRefi,
    metricsAfterRefi,
    dscrAfterRefi,
  };
}
