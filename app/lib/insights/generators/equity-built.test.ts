import { describe, expect, it } from "vitest";
import { generateWithClock } from "./equity-built";
import { makeContext, makeMetrics, makePortfolio, makeProperty } from "./__fixtures";

const NOW_MS = new Date("2026-04-27T00:00:00Z").getTime();

describe("equity_built — single mode", () => {
  it("fires when held >12mo with sufficient equity built", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          purchaseDate: new Date("2020-01-01"),
          cashInvested: 60_000,
        }),
      ],
      metrics: [makeMetrics({ id: "p1", equity: 200_000 })],
    });
    const insights = generateWithClock(ctx, NOW_MS);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.severity).toBe("positive");
    // equity_built = 200000 - 60000 = 140000
    expect(insights[0]!.score).toBeCloseTo(140_000, 0);
  });

  it("does not fire when held less than 12 months", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          purchaseDate: new Date("2026-01-01"),
          cashInvested: 50_000,
        }),
      ],
      metrics: [makeMetrics({ equity: 60_000 })],
    });
    expect(generateWithClock(ctx, NOW_MS)).toEqual([]);
  });

  it("does not fire when equity built is below the $10k materiality threshold", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          purchaseDate: new Date("2020-01-01"),
          cashInvested: 50_000,
        }),
      ],
      metrics: [makeMetrics({ equity: 55_000 })], // only $5k built
    });
    expect(generateWithClock(ctx, NOW_MS)).toEqual([]);
  });

  it("fires with bare-dollar value when cashInvested is null (no multiplier)", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          purchaseDate: new Date("2020-01-01"),
          cashInvested: null,
        }),
      ],
      metrics: [makeMetrics({ equity: 200_000 })],
    });
    const insights = generateWithClock(ctx, NOW_MS);
    expect(insights).toHaveLength(1);
    // equity_built falls back to current equity itself when no cashInvested.
    expect(insights[0]!.score).toBeCloseTo(200_000, 0);
  });
});

describe("equity_built — multi mode", () => {
  it("aggregates across properties held >12mo", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          purchaseDate: new Date("2020-01-01"),
          cashInvested: 50_000,
        }),
        makeProperty({
          id: "p2",
          purchaseDate: new Date("2018-01-01"),
          cashInvested: 75_000,
        }),
      ],
      metrics: [
        makeMetrics({ id: "p1", equity: 150_000 }),
        makeMetrics({ id: "p2", equity: 200_000 }),
      ],
      portfolio: makePortfolio({ totalEquity: 350_000, totalCashInvested: 125_000 }),
    });
    const insights = generateWithClock(ctx, NOW_MS);
    expect(insights).toHaveLength(1);
    // 350000 - 125000 = 225000
    expect(insights[0]!.score).toBeCloseTo(225_000, 0);
    expect(insights[0]!.dismissKey).toBe("equity_built:portfolio");
  });

  it("excludes properties held less than 12 months from the aggregate", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          purchaseDate: new Date("2020-01-01"),
          cashInvested: 50_000,
        }),
        makeProperty({
          id: "p2",
          purchaseDate: new Date("2026-01-01"), // <12mo, should be excluded
          cashInvested: 100_000,
        }),
      ],
      metrics: [
        makeMetrics({ id: "p1", equity: 150_000 }),
        makeMetrics({ id: "p2", equity: 110_000 }),
      ],
    });
    const insights = generateWithClock(ctx, NOW_MS);
    expect(insights).toHaveLength(1);
    // Only p1 contributes: 150000 - 50000 = 100000
    expect(insights[0]!.score).toBeCloseTo(100_000, 0);
  });

  it("falls back to bare-dollar framing when any property is missing cashInvested", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          purchaseDate: new Date("2020-01-01"),
          cashInvested: 50_000,
        }),
        makeProperty({
          id: "p2",
          purchaseDate: new Date("2018-01-01"),
          cashInvested: null, // missing
        }),
      ],
      metrics: [
        makeMetrics({ id: "p1", equity: 150_000 }),
        makeMetrics({ id: "p2", equity: 200_000 }),
      ],
    });
    const insights = generateWithClock(ctx, NOW_MS);
    expect(insights).toHaveLength(1);
    // Falls back to total equity (350k) since not all properties have cashInvested.
    expect(insights[0]!.score).toBeCloseTo(350_000, 0);
  });
});
