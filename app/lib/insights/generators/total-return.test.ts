import { describe, expect, it } from "vitest";
import { totalReturnGenerator } from "./total-return";
import { makeContext, makeMetrics, makeProperty } from "./__fixtures";

describe("total_return — single mode", () => {
  it("fires when total return is positive (CF + appreciation + paydown > 0)", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [
        makeMetrics({
          id: "p1",
          monthlyCashFlow: -700,
          annualCashFlow: -8_400,
          annualPaydown: 8_000,
        }),
      ],
      appreciationByPropertyId: {
        p1: { annualDollars: 12_000, source: "purchase_delta" },
      },
    });
    const insights = totalReturnGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.severity).toBe("positive");
    // total return = -8400 + 12000 + 8000 = 11600
    expect(insights[0]!.score).toBeCloseTo(11_600, 0);
  });

  it("does not fire when total return is zero or negative", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [
        makeMetrics({
          id: "p1",
          annualCashFlow: -10_000,
          annualPaydown: 2_000,
        }),
      ],
      appreciationByPropertyId: {
        p1: { annualDollars: 5_000, source: "default" },
      },
    });
    // -10000 + 2000 + 5000 = -3000 < 0
    expect(totalReturnGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when appreciation map is missing the property", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1" })],
      // No appreciationByPropertyId.
    });
    expect(totalReturnGenerator.generate(ctx)).toEqual([]);
  });
});

describe("total_return — multi mode", () => {
  it("aggregates CF + paydown + appreciation across properties", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1" }),
        makeProperty({ id: "p2" }),
      ],
      metrics: [
        makeMetrics({ id: "p1", annualCashFlow: -2_000, annualPaydown: 4_000 }),
        makeMetrics({ id: "p2", annualCashFlow: 3_000, annualPaydown: 5_000 }),
      ],
      appreciationByPropertyId: {
        p1: { annualDollars: 8_000, source: "purchase_delta" },
        p2: { annualDollars: 10_000, source: "purchase_delta" },
      },
    });
    const insights = totalReturnGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    // CF total: -2000 + 3000 = 1000
    // Paydown total: 4000 + 5000 = 9000
    // Appreciation total: 8000 + 10000 = 18000
    // Total: 28000
    expect(insights[0]!.score).toBeCloseTo(28_000, 0);
    expect(insights[0]!.dismissKey).toBe("total_return:portfolio");
  });

  it("does not fire when no property has appreciation data", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" }), makeProperty({ id: "p2" })],
      metrics: [makeMetrics({ id: "p1" }), makeMetrics({ id: "p2" })],
      // No appreciation data.
    });
    expect(totalReturnGenerator.generate(ctx)).toEqual([]);
  });

  it("includes properties that have appreciation, ignores ones that don't", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1" }),
        makeProperty({ id: "p2" }),
      ],
      metrics: [
        makeMetrics({ id: "p1", annualCashFlow: 1_000, annualPaydown: 2_000 }),
        makeMetrics({ id: "p2", annualCashFlow: 1_000, annualPaydown: 2_000 }),
      ],
      appreciationByPropertyId: {
        p1: { annualDollars: 5_000, source: "default" },
        // p2 missing on purpose
      },
    });
    const insights = totalReturnGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    // Aggregated metrics include both properties: CF (2000) + paydown (4000) + appreciation (5000, just p1) = 11000.
    expect(insights[0]!.score).toBeCloseTo(11_000, 0);
  });
});

describe("total_return — type contract", () => {
  it("declares both modes", () => {
    expect(totalReturnGenerator.appliesTo).toEqual(["single", "multi"]);
  });
});
