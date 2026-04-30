import { describe, expect, it } from "vitest";
import { refiGapGenerator } from "./refi-gap";
import { makeContext, makeMetrics, makeProperty } from "./__fixtures";

describe("refi_gap — gating", () => {
  it("fires when DSCR is below 1.25 with a mortgage", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          userRent: 2000,
          monthlyExpenses: 500,
          vacancyPercent: 5,
        }),
      ],
      metrics: [
        makeMetrics({
          id: "p1",
          dscr: 1.10,
          annualDebtService: 18_000,
          noi: 19_800,
        }),
      ],
    });
    const insights = refiGapGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.severity).toBe("warning");
    expect(insights[0]!.score).toBeGreaterThan(0);
  });

  it("does not fire when DSCR is already at or above 1.25", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
      metrics: [makeMetrics({ id: "p1", dscr: 1.30, annualDebtService: 18_000 })],
    });
    expect(refiGapGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when there is no mortgage (annualDebtService null)", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1", hasMortgage: false })],
      metrics: [
        makeMetrics({
          id: "p1",
          dscr: null,
          annualDebtService: null,
          annualPaydown: 0,
        }),
      ],
    });
    expect(refiGapGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when vacancy is at or above 50%", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1", vacancyPercent: 50 })],
      metrics: [makeMetrics({ id: "p1", dscr: 1.10, annualDebtService: 18_000 })],
    });
    expect(refiGapGenerator.generate(ctx)).toEqual([]);
  });

  it("does not run in multi mode (single only)", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" }), makeProperty({ id: "p2" })],
      metrics: [
        makeMetrics({ id: "p1", dscr: 1.10, annualDebtService: 18_000 }),
        makeMetrics({ id: "p2", dscr: 1.10, annualDebtService: 18_000 }),
      ],
      mode: "multi",
    });
    expect(refiGapGenerator.generate(ctx)).toEqual([]);
  });

  it("declares only single mode in appliesTo", () => {
    expect(refiGapGenerator.appliesTo).toEqual(["single"]);
  });
});

describe("refi_gap — math", () => {
  it("computes a positive rent increase when DSCR is below target", () => {
    // Setup: NOI = (rent - expenses) * vacancy_adj * 12.
    // Use round numbers to make assertions easy.
    // monthlyRent=2000, expenses=500, vacancy=5%, annualDebtService=18000.
    // currentNOI = (2000 * 0.95 - 500) * 12 = (1900-500)*12 = 1400*12 = 16800
    // currentDSCR = 16800 / 18000 = 0.933
    // target NOI = 1.25 * 18000 = 22500
    // target gross annual rent = 22500 + 6000 = 28500
    // target effective monthly = 28500 / 12 = 2375
    // target monthly rent = 2375 / 0.95 = 2500
    // increase = 2500 - 2000 = 500
    const ctx = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          userRent: 2000,
          monthlyExpenses: 500,
          vacancyPercent: 5,
        }),
      ],
      metrics: [
        makeMetrics({
          id: "p1",
          dscr: 0.933,
          noi: 16_800,
          annualDebtService: 18_000,
        }),
      ],
    });
    const insights = refiGapGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.score).toBeCloseTo(500, 0);
  });
});
