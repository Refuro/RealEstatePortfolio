import { prisma } from "@/lib/db";
import { getEffectiveBalance } from "@/lib/amortization";
import { getPropertyLimit, getEffectiveTier } from "@/lib/plans";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { computePortfolioMetrics } from "@/lib/metrics/portfolio-metrics";
import type { User } from "@prisma/client";

async function loadPortfolioSummaryCore(user: User) {
  const tier = getEffectiveTier(user);
  const propertyLimit = getPropertyLimit(tier);
  const propertyCountTotal = await prisma.property.count({
    where: { userId: user.id },
  });
  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
    orderBy: { updatedAt: "desc" },
    take: propertyLimit,
  });
  type PropertyWithMortgages = (typeof properties)[number];
  const propertyCountIncluded = properties.length;
  const truncated = propertyCountTotal > propertyCountIncluded;

  const portfolioInput = properties.map((p: PropertyWithMortgages) => {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum: number, m) => sum + getEffectiveBalance(m),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
      0
    );
    return {
      id: p.id,
      monthlyRent: getPropertyTotalRent(p),
      monthlyExpenses: Number(p.currentMonthlyExpenses),
      estimatedValue: Number(p.currentEstimatedValue),
      cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
      ownershipPercent: p.ownershipPercent ?? 100,
      vacancyPercent: p.vacancyPercent ?? 5,
    };
  });

  const metrics = computePortfolioMetrics(portfolioInput);

  return {
    metrics,
    properties,
    effectiveTier: tier,
    slice: {
      propertyCountTotal,
      propertyCountIncluded,
      propertyLimit,
      truncated,
    },
  };
}

/**
 * Shared portfolio aggregates for dashboard API, deal context, and exports.
 */
export async function buildPortfolioSummaryPayload(user: User) {
  const { metrics, slice } = await loadPortfolioSummaryCore(user);
  return {
    ...metrics,
    weightedCapRate: metrics.weightedCapRate != null ? metrics.weightedCapRate : null,
    portfolioLtv: metrics.portfolioLtv != null ? metrics.portfolioLtv : null,
    slice,
  };
}

/**
 * Dashboard page: same metrics/slice as API summary plus property rows (single query).
 */
export async function buildDashboardPortfolioPayload(user: User) {
  return loadPortfolioSummaryCore(user);
}

export type DealPortfolioContext = {
  propertyCount: number;
  propertyCountTotal: number;
  truncated: boolean;
  weightedCapRate: number | null;
  portfolioCashOnCashReturn: number | null;
  totalMonthlyCashFlow: number;
  dscr: number | null;
};

export function toDealPortfolioContext(
  payload: Awaited<ReturnType<typeof buildPortfolioSummaryPayload>>
): DealPortfolioContext {
  return {
    propertyCount: payload.slice.propertyCountIncluded,
    propertyCountTotal: payload.slice.propertyCountTotal,
    truncated: payload.slice.truncated,
    weightedCapRate: payload.weightedCapRate,
    portfolioCashOnCashReturn: payload.portfolioCashOnCashReturn,
    totalMonthlyCashFlow: payload.totalMonthlyCashFlow,
    dscr: payload.dscr,
  };
}
