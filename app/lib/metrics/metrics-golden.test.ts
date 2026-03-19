import { describe, expect, it } from "vitest";
import { computePropertyMetrics } from "./property-metrics";
import { computePortfolioMetrics } from "./portfolio-metrics";
import {
  goldenPortfolioTwo,
  goldenPortfolioTwoExpectedProportional,
  goldenPropertyAlpha,
  goldenPropertyAlphaExpectedProportional,
} from "@/lib/test/fixtures/metrics-golden";

describe("metrics golden fixtures (ownership-metrics policy)", () => {
  it("matches canonical single-property proportional outputs", () => {
    const m = computePropertyMetrics(goldenPropertyAlpha, "proportional");
    const e = goldenPropertyAlphaExpectedProportional;
    expect(m.grossAnnualRent).toBeCloseTo(e.grossAnnualRent, 5);
    expect(m.annualExpenses).toBeCloseTo(e.annualExpenses, 5);
    expect(m.noi).toBeCloseTo(e.noi, 5);
    expect(m.capRate).toBeCloseTo(e.capRate, 5);
    expect(m.monthlyCashFlow).toBeCloseTo(e.monthlyCashFlow, 5);
    expect(m.equity).toBeCloseTo(e.equity, 5);
    expect(m.ltv).toBeCloseTo(e.ltv, 5);
  });

  it("matches multi-property portfolio aggregates (proportional)", () => {
    const p = computePortfolioMetrics(goldenPortfolioTwo, "proportional");
    const e = goldenPortfolioTwoExpectedProportional;
    expect(p.propertyCount).toBe(e.propertyCount);
    expect(p.totalMarketValue).toBeCloseTo(e.totalMarketValue, 5);
    expect(p.totalNoi).toBeCloseTo(e.totalNoi, 5);
    expect(p.totalDebt).toBeCloseTo(e.totalDebt, 5);
    expect(p.totalAnnualDebtService).toBeCloseTo(e.totalAnnualDebtService, 5);
    expect(p.weightedCapRate).toBeCloseTo(e.weightedCapRate, 5);
    expect(p.portfolioLtv).toBeCloseTo(e.portfolioLtv, 5);
    expect(p.dscr).toBeCloseTo(e.dscr, 5);
  });
});
