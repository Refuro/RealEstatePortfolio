/**
 * Dashboard-specific bridge that turns the dashboard payload + per-property
 * metrics into an `InsightsContext`. Lives next to page.tsx because the input
 * shape is dashboard-specific (Prisma records); the engine itself remains
 * decoupled from any caller.
 *
 * Responsibilities:
 *   - Convert Prisma `Property + Mortgage` records to `InsightsContextProperty`
 *   - Compute per-property `annualPaydown` (sum of next 12 months of principal,
 *     ownership-scaled) and `annualDebtService`/`dscr`
 *   - Project snapshots into `InsightsContextSnapshot`
 *   - Resolve appreciation via the engine helper
 */

import {
  resolveAppreciationMap,
  type InsightsContext,
  type InsightsContextMetrics,
  type InsightsContextPortfolio,
  type InsightsContextProperty,
  type InsightsContextSnapshot,
} from "@/lib/insights";
import {
  buildInsightsContext,
  buildDismissalTimestamps,
  type DismissalTimestamps,
} from "@/lib/insights/context";
import { getEffectiveBalance, getPiForAmortization, type MortgageRecord } from "@/lib/amortization";
import { getPropertyTotalRent } from "@/lib/property-utils";

// Minimal Prisma-shaped types — only what we read here.
// Using `any` for unitRents because it's a Prisma JSON column that
// `getPropertyTotalRent` already handles.
type Mortgage = MortgageRecord & {
  monthlyPayment: number | { toString(): string };
  interestRate: number | { toString(): string };
  termYears: number;
  startDate: Date | string;
};

type DashboardPropertyRecord = {
  id: string;
  nickname: string | null;
  addressLine1: string;
  city: string;
  state: string;
  isRented: boolean;
  purchasePrice: number | { toString(): string };
  currentEstimatedValue: number | { toString(): string };
  purchaseDate: Date;
  currentMonthlyRent: number | { toString(): string };
  unitRents: unknown;
  marketRent: number | { toString(): string } | null;
  marketRentAsOf: Date | null;
  currentMonthlyExpenses: number | { toString(): string };
  vacancyPercent: number | null;
  ownershipPercent: number | null;
  hasMortgage: boolean | null;
  mortgagePaidOff: boolean | null;
  cashInvested: number | { toString(): string } | null;
  updatedAt: Date;
  mortgages: Mortgage[];
};

type PerPropertyMetric = {
  id: string;
  equity: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number | null;
  ltv: number | null;
  noi: number;
};

type DashboardPortfolioMetrics = {
  totalEquity: number;
  totalMonthlyCashFlow: number;
  totalCashInvested: number;
  weightedCapRate: number | null;
  portfolioLtv: number | null;
  dscr: number | null;
};

type SnapshotInput = {
  propertyId: string;
  snapshotMonth: Date;
  estimatedValue: number;
  equity: number;
  monthlyCashFlow: number;
};

/**
 * Approximate the next 12 months of principal paydown across all of the
 * property's mortgages. Walks the schedule forward from the current balance
 * (not the original loan), then ownership-scales the result.
 */
function annualPaydownForProperty(
  mortgages: Mortgage[],
  ownershipPercent: number
): number {
  let totalPaydown = 0;
  for (const m of mortgages) {
    const balance = getEffectiveBalance(m);
    const monthlyPayment = getPiForAmortization(m);
    const annualRate = Number(m.interestRate);
    const monthlyRate = annualRate / 12;

    let bal = balance;
    for (let i = 0; i < 12 && bal > 0; i++) {
      const interest = bal * monthlyRate;
      let principal = monthlyPayment - interest;
      if (principal <= 0) break;
      if (principal > bal) principal = bal;
      totalPaydown += principal;
      bal -= principal;
    }
  }

  const scale = (ownershipPercent ?? 100) / 100;
  return totalPaydown * scale;
}

function toContextProperty(p: DashboardPropertyRecord): InsightsContextProperty {
  const totalMortgageBalance = p.mortgages.reduce(
    (sum, m) => sum + getEffectiveBalance(m),
    0
  );
  const totalMonthlyPayment = p.mortgages.reduce(
    (sum, m) => sum + Number(m.monthlyPayment),
    0
  );
  return {
    id: p.id,
    name: p.nickname || p.addressLine1,
    addressLine1: p.addressLine1,
    city: p.city,
    state: p.state,
    isRented: p.isRented,
    purchasePrice: Number(p.purchasePrice),
    currentEstimatedValue: Number(p.currentEstimatedValue),
    purchaseDate: p.purchaseDate,
    userRent: getPropertyTotalRent(p),
    marketRent: p.marketRent != null ? Number(p.marketRent) : null,
    marketRentAsOf: p.marketRentAsOf,
    monthlyExpenses: Number(p.currentMonthlyExpenses),
    vacancyPercent: p.vacancyPercent ?? 5,
    ownershipPercent: p.ownershipPercent ?? 100,
    hasMortgage: p.hasMortgage,
    totalMortgageBalance,
    totalMonthlyPayment,
    mortgageCount: p.mortgages.length,
    mortgagePaidOff: p.mortgagePaidOff ?? false,
    cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
    updatedAt: p.updatedAt,
  };
}

function toContextMetrics(
  p: DashboardPropertyRecord,
  m: PerPropertyMetric
): InsightsContextMetrics {
  const ownershipPercent = p.ownershipPercent ?? 100;
  const totalMonthlyPayment = p.mortgages.reduce(
    (sum, mort) => sum + Number(mort.monthlyPayment),
    0
  );
  const annualDebtService =
    p.mortgages.length === 0
      ? null
      : totalMonthlyPayment * 12 * (ownershipPercent / 100);

  const dscr =
    annualDebtService != null && annualDebtService > 0
      ? m.noi / annualDebtService
      : null;

  return {
    id: m.id,
    equity: m.equity,
    monthlyCashFlow: m.monthlyCashFlow,
    annualCashFlow: m.annualCashFlow,
    capRate: m.capRate,
    ltv: m.ltv,
    noi: m.noi,
    dscr,
    annualDebtService,
    annualPaydown: annualPaydownForProperty(p.mortgages, ownershipPercent),
  };
}

export type BuildInsightsPayloadInput = {
  properties: DashboardPropertyRecord[];
  perPropertyMetrics: PerPropertyMetric[];
  portfolioMetrics: DashboardPortfolioMetrics;
  snapshots: SnapshotInput[];
  /** Defaults to Date.now(); parameterized for testability. */
  nowMs?: number;
};

export type DashboardInsightsPayload = {
  context: InsightsContext;
  dismissalTimestamps: DismissalTimestamps;
};

/**
 * Build the full `InsightsContext` plus dismissal timestamps from dashboard data.
 *
 * Returns the bundle the dashboard page passes to `pickInsights` and to the
 * `InsightsCardsClient` (the client-side dismissal wrapper).
 */
export function buildDashboardInsightsPayload(
  input: BuildInsightsPayloadInput
): DashboardInsightsPayload {
  const ctxProperties = input.properties.map(toContextProperty);
  const metricsById = new Map(input.perPropertyMetrics.map((m) => [m.id, m]));
  const ctxMetrics = input.properties.map((p) => {
    const metric = metricsById.get(p.id);
    if (!metric) {
      // Should not happen in practice — but be defensive rather than crash.
      return {
        id: p.id,
        equity: 0,
        monthlyCashFlow: 0,
        annualCashFlow: 0,
        capRate: null,
        ltv: null,
        noi: 0,
        dscr: null,
        annualDebtService: null,
        annualPaydown: 0,
      };
    }
    return toContextMetrics(p, metric);
  });

  const ctxPortfolio: InsightsContextPortfolio = {
    totalEquity: input.portfolioMetrics.totalEquity,
    totalMonthlyCashFlow: input.portfolioMetrics.totalMonthlyCashFlow,
    totalCashInvested: input.portfolioMetrics.totalCashInvested,
    weightedCapRate: input.portfolioMetrics.weightedCapRate,
    portfolioLtv: input.portfolioMetrics.portfolioLtv,
    dscr: input.portfolioMetrics.dscr,
  };

  const ctxSnapshots: InsightsContextSnapshot[] = input.snapshots.map((s) => ({
    propertyId: s.propertyId,
    snapshotMonth: s.snapshotMonth,
    estimatedValue: s.estimatedValue,
    equity: s.equity,
    monthlyCashFlow: s.monthlyCashFlow,
  }));

  const appreciationByPropertyId = resolveAppreciationMap(
    ctxProperties,
    ctxSnapshots,
    input.nowMs
  );

  const context = buildInsightsContext({
    properties: ctxProperties,
    metrics: ctxMetrics,
    portfolio: ctxPortfolio,
    snapshots: ctxSnapshots,
    appreciationByPropertyId,
  });

  const dismissalTimestamps = buildDismissalTimestamps(
    input.properties.map((p) => ({ id: p.id, updatedAt: p.updatedAt }))
  );

  return { context, dismissalTimestamps };
}
