/**
 * Golden metrics cases for regression tests.
 *
 * **Policy:** Aligned with `docs/policies/ownership-metrics.md` — economic-share metrics scale by
 * ownership; cap rate uses full-property NOI ÷ value; LTV is full debt ÷ full value (§2 table).
 *
 * Do not change numbers here without updating policy-linked tests and this comment.
 */

import type { PropertyMetricsInput } from "@/lib/metrics/property-metrics";
import type { PortfolioPropertyInput } from "@/lib/metrics/portfolio-metrics";

/** Single property @ 100% ownership, proportional liability display. */
export const goldenPropertyAlpha: PropertyMetricsInput = {
  monthlyRent: 2000,
  monthlyExpenses: 800,
  estimatedValue: 400_000,
  cashInvested: 100_000,
  totalMortgageBalance: 250_000,
  totalMonthlyPayment: 1800,
  ownershipPercent: 100,
  vacancyPercent: 5,
};

/**
 * Expected outputs for `goldenPropertyAlpha` under **proportional** mode.
 * effectiveRent = 2000 × (1 − 0.05) = 1900
 * grossAnnualRent = 1900 × 12 = 22_800; annualExpenses = 9_600; NOI = 13_200
 * capRate = 13_200 / 400_000 (full-property NOI / value per property-metrics.ts)
 * monthlyCashFlow = (1900 − 800 − 1800) × 1 = −700
 * equity = (400_000 − 250_000) × 1 = 150_000; LTV = 250_000 / 400_000
 */
export const goldenPropertyAlphaExpectedProportional = {
  grossAnnualRent: 22_800,
  annualExpenses: 9600,
  noi: 13_200,
  capRate: 13_200 / 400_000,
  monthlyCashFlow: -700,
  equity: 150_000,
  ltv: 250_000 / 400_000,
} as const;

/** Two properties with different rent/expense/vacancy — full ownership, proportional mode. */
export const goldenPortfolioTwo: PortfolioPropertyInput[] = [
  {
    id: "p1",
    monthlyRent: 1000,
    monthlyExpenses: 400,
    estimatedValue: 300_000,
    cashInvested: 50_000,
    totalMortgageBalance: 200_000,
    totalMonthlyPayment: 1200,
    ownershipPercent: 100,
    vacancyPercent: 5,
  },
  {
    id: "p2",
    monthlyRent: 1500,
    monthlyExpenses: 450,
    estimatedValue: 350_000,
    cashInvested: 80_000,
    totalMortgageBalance: 220_000,
    totalMonthlyPayment: 1400,
    ownershipPercent: 100,
    vacancyPercent: 10,
  },
];

/**
 * Precomputed portfolio totals for `goldenPortfolioTwo` + proportional display.
 * NOI: p1 (950×12 − 4800) = 6600; p2 (1350×12 − 5400) = 10_800 → total 17_400
 * Market value: 300k + 350k = 650k
 * Debt (proportional, 100% each): 200k + 220k = 420k
 * Annual debt service: 1200×12 + 1400×12 = 31_200
 */
export const goldenPortfolioTwoExpectedProportional = {
  totalMarketValue: 650_000,
  totalNoi: 17_400,
  /** 950×12 + 1350×12 — vacancy-adjusted annual rent (same R as in NOI). */
  totalAnnualRent: 11_400 + 16_200,
  totalDebt: 420_000,
  totalAnnualDebtService: 31_200,
  propertyCount: 2,
  weightedCapRate: 17_400 / 650_000,
  portfolioLtv: 420_000 / 650_000,
  dscr: 17_400 / 31_200,
} as const;
