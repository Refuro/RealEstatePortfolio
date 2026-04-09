import { describe, expect, it } from "vitest";
import { buildDashboardTrends } from "@/lib/dashboard-trends";

describe("buildDashboardTrends", () => {
  it("returns null deltas when only one month exists", () => {
    const result = buildDashboardTrends([
      {
        propertyId: "p1",
        snapshotMonth: new Date("2026-04-01T00:00:00.000Z"),
        estimatedValue: 300000,
        equity: 140000,
        monthlyCashFlow: 200,
      },
    ]);

    expect(result.portfolio.equityDeltaMoM).toBeNull();
    expect(result.portfolio.valueDeltaMoM).toBeNull();
    expect(result.portfolio.cashFlowDeltaMoM).toBeNull();
    expect(result.portfolio.equityDeltaSinceFirst).toBe(0);
    expect(result.propertyEquityDeltaMoM["p1"]).toBeNull();
    expect(result.propertyValueDeltaMoM["p1"]).toBeNull();
    expect(result.propertyCashFlowDeltaMoM["p1"]).toBeNull();
  });

  it("aggregates portfolio deltas across multiple properties", () => {
    const result = buildDashboardTrends([
      {
        propertyId: "p1",
        snapshotMonth: new Date("2026-03-01T00:00:00.000Z"),
        estimatedValue: 300000,
        equity: 140000,
        monthlyCashFlow: 200,
      },
      {
        propertyId: "p2",
        snapshotMonth: new Date("2026-03-01T00:00:00.000Z"),
        estimatedValue: 500000,
        equity: 250000,
        monthlyCashFlow: 400,
      },
      {
        propertyId: "p1",
        snapshotMonth: new Date("2026-04-01T00:00:00.000Z"),
        estimatedValue: 310000,
        equity: 151000,
        monthlyCashFlow: 230,
      },
      {
        propertyId: "p2",
        snapshotMonth: new Date("2026-04-01T00:00:00.000Z"),
        estimatedValue: 520000,
        equity: 273000,
        monthlyCashFlow: 410,
      },
    ]);

    expect(result.portfolio.valueDeltaMoM).toBe(30000);
    expect(result.portfolio.equityDeltaMoM).toBe(34000);
    expect(result.portfolio.cashFlowDeltaMoM).toBe(40);
    expect(result.portfolio.equityDeltaSinceFirst).toBe(34000);
    expect(result.propertyEquityDeltaMoM["p1"]).toBe(11000);
    expect(result.propertyEquityDeltaMoM["p2"]).toBe(23000);
    expect(result.propertyValueDeltaMoM["p1"]).toBe(10000);
    expect(result.propertyValueDeltaMoM["p2"]).toBe(20000);
    expect(result.propertyCashFlowDeltaMoM["p1"]).toBe(30);
    expect(result.propertyCashFlowDeltaMoM["p2"]).toBe(10);
    expect(result.portfolio.equitySeries).toHaveLength(2);
  });
});
