import { describe, expect, it } from "vitest";
import { cashFlowDragGenerator } from "./cash-flow-drag";
import { makeContext, makeMetrics, makeProperty } from "./__fixtures";

describe("cash_flow_drag — single mode", () => {
  it("fires when monthly cash flow is negative", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1", monthlyCashFlow: -708, annualCashFlow: -8496 })],
    });
    const insights = cashFlowDragGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.severity).toBe("negative");
    expect(insights[0]!.dismissKey).toBe("cash_flow_drag:p1");
    expect(insights[0]!.score).toBe(708);
  });

  it("does not fire when monthly cash flow is positive", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1", monthlyCashFlow: 100 })],
    });
    expect(cashFlowDragGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when monthly cash flow is exactly zero", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1", monthlyCashFlow: 0 })],
    });
    expect(cashFlowDragGenerator.generate(ctx)).toEqual([]);
  });
});

describe("cash_flow_drag — multi mode", () => {
  it("fires when at least one property has negative cash flow", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1", name: "Maple Ave" }),
        makeProperty({ id: "p2", name: "Oak St" }),
      ],
      metrics: [
        makeMetrics({ id: "p1", monthlyCashFlow: -500, annualCashFlow: -6000 }),
        makeMetrics({ id: "p2", monthlyCashFlow: 200 }),
      ],
    });
    const insights = cashFlowDragGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.dismissKey).toBe("cash_flow_drag:portfolio");
    expect(insights[0]!.score).toBe(500); // total monthly drag
  });

  it("scores by total monthly drag across all negative properties", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1" }),
        makeProperty({ id: "p2" }),
        makeProperty({ id: "p3" }),
      ],
      metrics: [
        makeMetrics({ id: "p1", monthlyCashFlow: -300 }),
        makeMetrics({ id: "p2", monthlyCashFlow: -700 }),
        makeMetrics({ id: "p3", monthlyCashFlow: 100 }),
      ],
    });
    const insights = cashFlowDragGenerator.generate(ctx);
    expect(insights[0]!.score).toBe(1000);
  });

  it("does not fire when all properties have non-negative cash flow", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" }), makeProperty({ id: "p2" })],
      metrics: [
        makeMetrics({ id: "p1", monthlyCashFlow: 100 }),
        makeMetrics({ id: "p2", monthlyCashFlow: 0 }),
      ],
    });
    expect(cashFlowDragGenerator.generate(ctx)).toEqual([]);
  });
});

describe("cash_flow_drag — type contract", () => {
  it("declares both modes in appliesTo", () => {
    expect(cashFlowDragGenerator.appliesTo).toEqual(["single", "multi"]);
  });

  it("has correct type identifier", () => {
    expect(cashFlowDragGenerator.type).toBe("cash_flow_drag");
  });
});
