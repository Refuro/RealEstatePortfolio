import { describe, expect, it } from "vitest";
import { computePortfolioMetrics, type PortfolioPropertyInput } from "./portfolio-metrics";

function baseProperty(
  id: string,
  overrides: Partial<PortfolioPropertyInput> = {}
): PortfolioPropertyInput {
  return {
    id,
    monthlyRent: 1000,
    monthlyExpenses: 400,
    estimatedValue: 300_000,
    cashInvested: 50_000,
    totalMortgageBalance: 200_000,
    totalMonthlyPayment: 1200,
    ownershipPercent: 100,
    vacancyPercent: 5,
    ...overrides,
  };
}

describe("computePortfolioMetrics", () => {
  it("returns empty aggregates when there are no properties", () => {
    const m = computePortfolioMetrics([]);
    expect(m.propertyCount).toBe(0);
    expect(m.totalMarketValue).toBe(0);
    expect(m.totalNoi).toBe(0);
    expect(m.weightedCapRate).toBeNull();
    expect(m.portfolioLtv).toBeNull();
    expect(m.dscr).toBeNull();
  });

  it("sums two identical full-ownership properties as 2x single-property economics (proportional)", () => {
    const one = computePortfolioMetrics([baseProperty("a")], "proportional");
    const two = computePortfolioMetrics(
      [baseProperty("a"), baseProperty("b")],
      "proportional"
    );
    expect(two.propertyCount).toBe(2);
    expect(two.totalMarketValue).toBeCloseTo(one.totalMarketValue * 2, 5);
    expect(two.totalNoi).toBeCloseTo(one.totalNoi * 2, 5);
    expect(two.totalMonthlyCashFlow).toBeCloseTo(one.totalMonthlyCashFlow * 2, 5);
    expect(two.totalAnnualDebtService).toBeCloseTo(one.totalAnnualDebtService * 2, 5);
  });

  it("scales value and rent by ownership percent for market-value totals", () => {
    const m = computePortfolioMetrics(
      [
        baseProperty("half", {
          ownershipPercent: 50,
        }),
      ],
      "proportional"
    );
    expect(m.totalMarketValue).toBeCloseTo(150_000, 5);
    // 1000 × (1 − 5%) × 50% = 475 effective monthly (matches NOI rent basis)
    expect(m.totalMonthlyRent).toBeCloseTo(475, 5);
  });

  it("uses full mortgage balance for totalDebt in full_liability mode regardless of ownership", () => {
    const proportional = computePortfolioMetrics(
      [
        baseProperty("p", {
          ownershipPercent: 50,
          totalMortgageBalance: 200_000,
        }),
      ],
      "proportional"
    );
    const full = computePortfolioMetrics(
      [
        baseProperty("f", {
          ownershipPercent: 50,
          totalMortgageBalance: 200_000,
        }),
      ],
      "full_liability"
    );
    expect(proportional.totalDebt).toBeCloseTo(100_000, 5);
    expect(full.totalDebt).toBeCloseTo(200_000, 5);
  });

  it("computes DSCR as NOI / annual debt service when debt service > 0", () => {
    const m = computePortfolioMetrics([baseProperty("x")], "proportional");
    expect(m.totalAnnualDebtService).toBeGreaterThan(0);
    expect(m.dscr).toBeCloseTo(m.totalNoi / m.totalAnnualDebtService, 5);
  });

  it("computes weighted cap rate as total NOI / total market value", () => {
    const m = computePortfolioMetrics([baseProperty("x")], "proportional");
    expect(m.weightedCapRate).toBeCloseTo(m.totalNoi / m.totalMarketValue, 5);
  });
});
