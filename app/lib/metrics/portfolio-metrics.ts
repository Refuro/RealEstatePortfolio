/**
 * Portfolio-level aggregation metrics (pure functions).
 * Uses property-level NOI and values for weighted cap rate and LTV.
 */

import {
  computePropertyMetrics,
  getAnnualDebtService,
  type PropertyMetricsInput,
  type OwnershipDisplayMode,
} from "./property-metrics";

export type PortfolioPropertyInput = PropertyMetricsInput & {
  id: string;
  ownershipPercent?: number;
};

export type PortfolioMetrics = {
  totalMarketValue: number;
  totalDebt: number;
  totalEquity: number;
  totalMonthlyRent: number;
  totalMonthlyExpenses: number;
  totalMonthlyCashFlow: number;
  totalNoi: number;
  totalCashInvested: number;
  totalAnnualRent: number;
  totalAnnualDebtService: number;
  dscr: number | null;
  weightedCapRate: number | null;
  portfolioLtv: number | null;
  portfolioCashOnCashReturn: number | null;
  propertyCount: number;
};

export function computePortfolioMetrics(
  properties: PortfolioPropertyInput[],
  displayMode?: OwnershipDisplayMode | null
): PortfolioMetrics {
  if (properties.length === 0) {
    return {
      totalMarketValue: 0,
      totalDebt: 0,
      totalEquity: 0,
      totalMonthlyRent: 0,
      totalMonthlyExpenses: 0,
      totalMonthlyCashFlow: 0,
      totalNoi: 0,
      totalCashInvested: 0,
      totalAnnualRent: 0,
      totalAnnualDebtService: 0,
      dscr: null,
      weightedCapRate: null,
      portfolioLtv: null,
      portfolioCashOnCashReturn: null,
      propertyCount: 0,
    };
  }

  const fullLiability = displayMode === "full_liability";

  let totalMarketValue = 0;
  let totalDebt = 0;
  let totalEquity = 0;
  let totalMonthlyRent = 0;
  let totalMonthlyExpenses = 0;
  let totalMonthlyCashFlow = 0;
  let totalNoi = 0;
  let totalCashInvested = 0;
  let totalAnnualDebtService = 0;

  for (const p of properties) {
    const metrics = computePropertyMetrics(p, displayMode);
    const scale = (p.ownershipPercent ?? 100) / 100;

    totalMarketValue += p.estimatedValue * scale;
    totalMonthlyRent += p.monthlyRent * scale;
    totalMonthlyExpenses += p.monthlyExpenses * scale;
    totalMonthlyCashFlow += metrics.monthlyCashFlow;
    totalNoi += metrics.noi;
    totalEquity += metrics.equity;
    totalAnnualDebtService += getAnnualDebtService(
      p.totalMonthlyPayment,
      p.ownershipPercent,
      displayMode
    );

    if (fullLiability) {
      totalDebt += p.totalMortgageBalance; // 100% debt
    } else {
      totalDebt += p.totalMortgageBalance * scale;
    }

    if (p.cashInvested != null && p.cashInvested > 0) {
      totalCashInvested += p.cashInvested * scale;
    }
  }

  const totalAnnualRent = totalMonthlyRent * 12;
  const dscr =
    totalAnnualDebtService > 0 ? totalNoi / totalAnnualDebtService : null;

  const weightedCapRate = totalMarketValue > 0 ? totalNoi / totalMarketValue : null;
  const portfolioLtv = totalMarketValue > 0 ? totalDebt / totalMarketValue : null;
  const portfolioCashOnCashReturn =
    totalCashInvested > 0 ? (totalMonthlyCashFlow * 12) / totalCashInvested : null;

  return {
    totalMarketValue,
    totalDebt,
    totalEquity,
    totalMonthlyRent,
    totalMonthlyExpenses,
    totalMonthlyCashFlow,
    totalNoi,
    totalCashInvested,
    totalAnnualRent,
    totalAnnualDebtService,
    dscr,
    weightedCapRate,
    portfolioLtv,
    portfolioCashOnCashReturn,
    propertyCount: properties.length,
  };
}
