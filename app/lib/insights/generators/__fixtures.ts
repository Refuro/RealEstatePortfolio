/**
 * Shared test fixture builders for generator tests.
 * Not exported from the package; only consumed by `*.test.ts` files in this folder.
 */

import type {
  InsightsContext,
  InsightsContextMetrics,
  InsightsContextProperty,
  InsightsContextPortfolio,
} from "../types";

export function makeProperty(
  overrides: Partial<InsightsContextProperty> = {}
): InsightsContextProperty {
  return {
    id: "prop_1",
    name: "Test Property",
    addressLine1: "123 Main",
    city: "Portland",
    state: "OR",
    isRented: true,
    purchasePrice: 300_000,
    currentEstimatedValue: 400_000,
    purchaseDate: new Date("2020-01-01T00:00:00Z"),
    userRent: 2000,
    marketRent: 2200,
    marketRentAsOf: new Date("2026-03-01T00:00:00Z"),
    monthlyExpenses: 500,
    vacancyPercent: 5,
    ownershipPercent: 100,
    hasMortgage: true,
    totalMortgageBalance: 200_000,
    totalMonthlyPayment: 1500,
    mortgageCount: 1,
    mortgagePaidOff: false,
    cashInvested: 60_000,
    updatedAt: new Date("2026-04-01T00:00:00Z"),
    ...overrides,
  };
}

export function makeMetrics(
  overrides: Partial<InsightsContextMetrics> = {}
): InsightsContextMetrics {
  return {
    id: "prop_1",
    equity: 200_000,
    monthlyCashFlow: 100,
    annualCashFlow: 1200,
    capRate: 0.06,
    ltv: 0.5,
    noi: 24_000,
    dscr: 1.3,
    annualDebtService: 18_000,
    annualPaydown: 4_000,
    ...overrides,
  };
}

export function makePortfolio(
  overrides: Partial<InsightsContextPortfolio> = {}
): InsightsContextPortfolio {
  return {
    totalEquity: 200_000,
    totalMonthlyCashFlow: 100,
    totalCashInvested: 60_000,
    weightedCapRate: 0.06,
    portfolioLtv: 0.5,
    dscr: 1.3,
    ...overrides,
  };
}

export function makeContext(
  overrides: Partial<InsightsContext> = {}
): InsightsContext {
  const properties = overrides.properties ?? [makeProperty()];
  const metrics = overrides.metrics ?? properties.map((p) => makeMetrics({ id: p.id }));
  const mode = overrides.mode ?? (properties.length === 1 ? "single" : "multi");
  return {
    mode,
    properties,
    metrics,
    portfolio: overrides.portfolio ?? makePortfolio(),
    snapshots: overrides.snapshots,
    appreciationByPropertyId: overrides.appreciationByPropertyId,
    benchmarks: overrides.benchmarks,
  };
}
