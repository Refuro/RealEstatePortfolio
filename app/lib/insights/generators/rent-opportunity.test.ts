import { describe, expect, it } from "vitest";
import { rentOpportunityGenerator } from "./rent-opportunity";
import { makeContext, makeProperty } from "./__fixtures";

describe("rent_opportunity — single mode", () => {
  it("fires when rent is materially below market (>3%)", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1", userRent: 1800, marketRent: 2200 }), // 18% below
      ],
    });
    const insights = rentOpportunityGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.severity).toBe("warning");
    expect(insights[0]!.score).toBe(400); // 2200 - 1800 monthly gap
    expect(insights[0]!.cta?.href).toBe("/properties/p1?edit=rent");
  });

  it("does not fire when gap is below the 3% materiality threshold", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1", userRent: 2150, marketRent: 2200 }), // ~2.3% below
      ],
    });
    expect(rentOpportunityGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when rent is at or above market", () => {
    const ctx = makeContext({
      properties: [makeProperty({ userRent: 2200, marketRent: 2200 })],
    });
    expect(rentOpportunityGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when property is not rented", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ isRented: false, userRent: 1800, marketRent: 2200 }),
      ],
    });
    expect(rentOpportunityGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when market rent is missing", () => {
    const ctx = makeContext({
      properties: [makeProperty({ userRent: 1800, marketRent: null })],
    });
    expect(rentOpportunityGenerator.generate(ctx)).toEqual([]);
  });

  it("does not fire when user rent is zero or missing", () => {
    const ctx = makeContext({
      properties: [makeProperty({ userRent: 0, marketRent: 2200 })],
    });
    expect(rentOpportunityGenerator.generate(ctx)).toEqual([]);
  });
});

describe("rent_opportunity — multi mode", () => {
  it("aggregates gaps across multiple below-market properties", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1", name: "A", userRent: 1800, marketRent: 2200 }), // gap 400
        makeProperty({ id: "p2", name: "B", userRent: 1900, marketRent: 2300 }), // gap 400
        makeProperty({ id: "p3", name: "C", userRent: 2100, marketRent: 2100 }), // at market
      ],
    });
    const insights = rentOpportunityGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.dismissKey).toBe("rent_opportunity:portfolio");
    expect(insights[0]!.score).toBe(800); // sum of two 400 gaps
  });

  it("does not fire when no properties are materially below market", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1", userRent: 2200, marketRent: 2200 }),
        makeProperty({ id: "p2", userRent: 2150, marketRent: 2200 }), // ~2.3% — below threshold
      ],
    });
    expect(rentOpportunityGenerator.generate(ctx)).toEqual([]);
  });
});
