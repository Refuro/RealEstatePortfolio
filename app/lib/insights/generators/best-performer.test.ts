import { describe, expect, it } from "vitest";
import { bestPerformerGenerator } from "./best-performer";
import { makeContext, makeMetrics, makePortfolio, makeProperty } from "./__fixtures";

function fourGoodProperties() {
  return {
    properties: [
      makeProperty({ id: "p1", name: "Oak St" }),
      makeProperty({ id: "p2", name: "Maple Ave" }),
      makeProperty({ id: "p3", name: "Pine Rd" }),
      makeProperty({ id: "p4", name: "Birch Ln" }),
    ],
    metrics: [
      makeMetrics({ id: "p1", capRate: 0.072, monthlyCashFlow: 1240 }),
      makeMetrics({ id: "p2", capRate: 0.065, monthlyCashFlow: 1100 }),
      makeMetrics({ id: "p3", capRate: 0.068, monthlyCashFlow: 1180 }),
      makeMetrics({ id: "p4", capRate: 0.04, monthlyCashFlow: 200 }),
    ],
    portfolio: makePortfolio({ totalMonthlyCashFlow: 3720 }),
  };
}

describe("best_performer — gating", () => {
  it("does not fire in single mode", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      mode: "single",
    });
    expect(bestPerformerGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when fewer than 4 properties", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1" }),
        makeProperty({ id: "p2" }),
        makeProperty({ id: "p3" }),
      ],
    });
    expect(bestPerformerGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when total portfolio CF is non-positive", () => {
    const data = fourGoodProperties();
    const ctx = makeContext({
      ...data,
      portfolio: makePortfolio({ totalMonthlyCashFlow: 0 }),
    });
    expect(bestPerformerGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when no property has positive cap rate AND positive CF", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1" }),
        makeProperty({ id: "p2" }),
        makeProperty({ id: "p3" }),
        makeProperty({ id: "p4" }),
      ],
      metrics: [
        makeMetrics({ id: "p1", capRate: 0.05, monthlyCashFlow: -100 }),
        makeMetrics({ id: "p2", capRate: 0.04, monthlyCashFlow: -50 }),
        makeMetrics({ id: "p3", capRate: null, monthlyCashFlow: 100 }),
        makeMetrics({ id: "p4", capRate: 0.03, monthlyCashFlow: 0 }),
      ],
      portfolio: makePortfolio({ totalMonthlyCashFlow: 50 }),
    });
    expect(bestPerformerGenerator.generate(ctx)).toEqual([]);
  });

  it("declares only multi mode in appliesTo", () => {
    expect(bestPerformerGenerator.appliesTo).toEqual(["multi"]);
  });
});

describe("best_performer — selection", () => {
  it("fires with severity positive when ≥4 properties exist with strong performers", () => {
    const ctx = makeContext(fourGoodProperties());
    const insights = bestPerformerGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.severity).toBe("positive");
    expect(insights[0]!.dismissKey).toBe("best_performer:portfolio");
  });

  it("scores by combined monthly CF of the top 3", () => {
    const ctx = makeContext(fourGoodProperties());
    const insights = bestPerformerGenerator.generate(ctx);
    // Top 3 by composite score should be p1 (1240) + p3 (1180) + p2 (1100) = 3520.
    expect(insights[0]!.score).toBeCloseTo(3520, 0);
  });
});
