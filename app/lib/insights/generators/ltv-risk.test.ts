import { describe, expect, it } from "vitest";
import { ltvRiskGenerator } from "./ltv-risk";
import { makeContext, makeMetrics, makeProperty } from "./__fixtures";

describe("ltv_risk — single mode", () => {
  it("fires as warning for LTV between 80% and 90%", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1", ltv: 0.85 })],
    });
    const insights = ltvRiskGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.severity).toBe("warning");
    expect(insights[0]!.score).toBeCloseTo(85, 0);
  });

  it("fires as negative for LTV at or above 90%", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1", ltv: 0.92 })],
    });
    const insights = ltvRiskGenerator.generate(ctx);
    expect(insights[0]!.severity).toBe("negative");
  });

  it("does not fire when LTV is below 80%", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1", ltv: 0.79 })],
    });
    expect(ltvRiskGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when LTV is null", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1", ltv: null })],
    });
    expect(ltvRiskGenerator.generate(ctx)).toEqual([]);
  });
});

describe("ltv_risk — multi mode", () => {
  it("fires with warning severity when all risky properties are 80–90%", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1" }),
        makeProperty({ id: "p2" }),
        makeProperty({ id: "p3" }),
      ],
      metrics: [
        makeMetrics({ id: "p1", ltv: 0.83 }),
        makeMetrics({ id: "p2", ltv: 0.86 }),
        makeMetrics({ id: "p3", ltv: 0.50 }),
      ],
    });
    const insights = ltvRiskGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.severity).toBe("warning");
    expect(insights[0]!.score).toBeCloseTo(86, 0);
  });

  it("escalates to negative severity when any property is above 90%", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1" }),
        makeProperty({ id: "p2" }),
      ],
      metrics: [
        makeMetrics({ id: "p1", ltv: 0.83 }),
        makeMetrics({ id: "p2", ltv: 0.94 }),
      ],
    });
    const insights = ltvRiskGenerator.generate(ctx);
    expect(insights[0]!.severity).toBe("negative");
  });

  it("does not fire when no property exceeds the 80% threshold", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" }), makeProperty({ id: "p2" })],
      metrics: [
        makeMetrics({ id: "p1", ltv: 0.70 }),
        makeMetrics({ id: "p2", ltv: 0.65 }),
      ],
    });
    expect(ltvRiskGenerator.generate(ctx)).toEqual([]);
  });
});
