import { describe, expect, it } from "vitest";
import { incompleteProfileGenerator } from "./incomplete-profile";
import { makeContext, makeMetrics, makeProperty } from "./__fixtures";

// A property scoring 100 (everything filled): purchase price differs from
// estimated value (+30), mortgage confirmed via mortgageCount=1 (+30), cash
// invested set (+30), base 10 = 100. The default fixture matches.

describe("incomplete_profile — gating", () => {
  it("does not fire when the property scores 100", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" })],
    });
    expect(incompleteProfileGenerator.generate(ctx)).toEqual([]);
  });

  it("fires in single mode when cash invested is missing", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1", cashInvested: null })],
    });
    const insights = incompleteProfileGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    const insight = insights[0]!;
    expect(insight.severity).toBe("warning");
    expect(insight.value).toBe("70% complete");
    expect(insight.cta?.href).toBe("/properties/p1?edit=mortgage&wizard=1");
    expect(insight.dismissKey).toBe("incomplete_profile:p1");
    expect(insight.explanation).toContain("cash invested");
  });

  it("fires when mortgage status is unknown (hasMortgage null, no mortgages)", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          hasMortgage: null,
          mortgageCount: 0,
          mortgagePaidOff: false,
          totalMortgageBalance: 0,
          totalMonthlyPayment: 0,
        }),
      ],
    });
    const insights = incompleteProfileGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    expect(insights[0]!.value).toBe("70% complete");
    expect(insights[0]!.explanation).toContain("mortgage status");
  });

  it("treats hasMortgage=false as confirmed (no mortgage record needed)", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          hasMortgage: false,
          mortgageCount: 0,
          totalMortgageBalance: 0,
          totalMonthlyPayment: 0,
        }),
      ],
    });
    expect(incompleteProfileGenerator.generate(ctx)).toEqual([]);
  });

  it("scores worse when more fields are missing", () => {
    const heavilyMissing = makeContext({
      properties: [
        makeProperty({
          id: "p1",
          purchasePrice: 400_000,
          currentEstimatedValue: 400_000, // matches → not real purchase price
          cashInvested: null,
          hasMortgage: null,
          mortgageCount: 0,
          mortgagePaidOff: false,
          totalMortgageBalance: 0,
          totalMonthlyPayment: 0,
        }),
      ],
    });
    const insights = incompleteProfileGenerator.generate(heavilyMissing);
    expect(insights[0]!.score).toBe(90); // 100 - 10 base
    expect(insights[0]!.value).toBe("10% complete");
  });
});

describe("incomplete_profile — multi mode", () => {
  it("aggregates across the portfolio and names the worst offender when count is 1", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1" }), // complete
        makeProperty({ id: "p2", name: "Mesquite house", cashInvested: null }),
      ],
      metrics: [makeMetrics({ id: "p1" }), makeMetrics({ id: "p2" })],
    });
    const insights = incompleteProfileGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    const insight = insights[0]!;
    expect(insight.value).toBe("1 property");
    expect(insight.explanation).toContain("Mesquite house");
    expect(insight.cta?.href).toBe("/properties/p2?edit=mortgage&wizard=1");
    expect(insight.dismissKey).toBe("incomplete_profile:portfolio");
  });

  it("links to the filtered properties list when 2+ are incomplete", () => {
    const ctx = makeContext({
      properties: [
        makeProperty({ id: "p1", cashInvested: null }),
        makeProperty({
          id: "p2",
          purchasePrice: 300_000,
          currentEstimatedValue: 300_000,
        }),
      ],
      metrics: [makeMetrics({ id: "p1" }), makeMetrics({ id: "p2" })],
    });
    const insights = incompleteProfileGenerator.generate(ctx);
    expect(insights).toHaveLength(1);
    const insight = insights[0]!;
    expect(insight.value).toBe("2 properties");
    expect(insight.cta?.href).toBe("/properties?filter=incomplete");
    expect(insight.score).toBe(2);
  });

  it("does not fire when every property scores 100", () => {
    const ctx = makeContext({
      properties: [makeProperty({ id: "p1" }), makeProperty({ id: "p2" })],
      metrics: [makeMetrics({ id: "p1" }), makeMetrics({ id: "p2" })],
    });
    expect(incompleteProfileGenerator.generate(ctx)).toEqual([]);
  });
});

describe("incomplete_profile — registration", () => {
  it("applies in both single and multi mode", () => {
    expect(incompleteProfileGenerator.appliesTo).toEqual(["single", "multi"]);
  });
});
