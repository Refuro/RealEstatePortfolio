/**
 * Portfolio-level aggregation metrics (pure functions).
 * Uses property-level NOI and values for weighted cap rate and LTV.
 */

import { computePropertyMetrics, type PropertyMetricsInput } from "./property-metrics";

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
  weightedCapRate: number | null;
  portfolioLtv: number | null;
  propertyCount: number;
};

export function computePortfolioMetrics(properties: PortfolioPropertyInput[]): PortfolioMetrics {
  if (properties.length === 0) {
    return {
      totalMarketValue: 0,
      totalDebt: 0,
      totalEquity: 0,
      totalMonthlyRent: 0,
      totalMonthlyExpenses: 0,
      totalMonthlyCashFlow: 0,
      totalNoi: 0,
      weightedCapRate: null,
      portfolioLtv: null,
      propertyCount: 0,
    };
  }

  let totalMarketValue = 0;
  let totalDebt = 0;
  let totalMonthlyRent = 0;
  let totalMonthlyExpenses = 0;
  let totalMonthlyCashFlow = 0;
  let totalNoi = 0;

  for (const p of properties) {
    const metrics = computePropertyMetrics(p);
    const scale = (p.ownershipPercent ?? 100) / 100;
    totalMarketValue += p.estimatedValue * scale;
    totalDebt += p.totalMortgageBalance * scale;
    totalMonthlyRent += p.monthlyRent * scale;
    totalMonthlyExpenses += p.monthlyExpenses * scale;
    totalMonthlyCashFlow += metrics.monthlyCashFlow;
    totalNoi += metrics.noi;
  }

  const totalEquity = totalMarketValue - totalDebt;
  const weightedCapRate = totalMarketValue > 0 ? totalNoi / totalMarketValue : null;
  const portfolioLtv = totalMarketValue > 0 ? totalDebt / totalMarketValue : null;

  return {
    totalMarketValue,
    totalDebt,
    totalEquity,
    totalMonthlyRent,
    totalMonthlyExpenses,
    totalMonthlyCashFlow,
    totalNoi,
    weightedCapRate,
    portfolioLtv,
    propertyCount: properties.length,
  };
}
