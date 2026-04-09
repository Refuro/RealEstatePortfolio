import { describe, expect, it } from "vitest";
import { buildDigestContent, isDigestWorthSending } from "@/lib/digest";

describe("digest content", () => {
  it("builds totals and per-property deltas", () => {
    const content = buildDigestContent({
      now: new Date("2026-05-07T00:00:00.000Z"),
      currentSnapshots: [
        {
          propertyId: "p1",
          propertyLabel: "Pine",
          estimatedValue: 320000,
          effectiveMortgageBalance: 149000,
          equity: 171000,
          marketRent: 2600,
          monthlyRent: 2500,
          monthlyCashFlow: 210,
          capRate: 0.065,
          ltv: 0.466,
          avmValueApplied: true,
          avmRentApplied: false,
        },
      ],
      previousSnapshots: [
        {
          propertyId: "p1",
          propertyLabel: "Pine",
          estimatedValue: 310000,
          effectiveMortgageBalance: 150000,
          equity: 160000,
          marketRent: 2550,
          monthlyRent: 2500,
          monthlyCashFlow: 180,
          capRate: 0.062,
          ltv: 0.484,
          avmValueApplied: false,
          avmRentApplied: false,
        },
      ],
    });

    expect(content.totalPaydown).toBe(1000);
    expect(content.totalEquity).toBe(171000);
    expect(content.totalEquityDelta).toBe(11000);
    expect(content.anyValueUpdated).toBe(true);
    expect(content.items[0].equityDelta).toBe(11000);
  });

  it("suppresses digest when no meaningful changes", () => {
    const content = buildDigestContent({
      currentSnapshots: [
        {
          propertyId: "p1",
          propertyLabel: "Pine",
          estimatedValue: 300000,
          effectiveMortgageBalance: 149990,
          equity: 150010,
          marketRent: null,
          monthlyRent: 2500,
          monthlyCashFlow: 100,
          capRate: null,
          ltv: null,
          avmValueApplied: false,
          avmRentApplied: false,
        },
      ],
      previousSnapshots: [
        {
          propertyId: "p1",
          propertyLabel: "Pine",
          estimatedValue: 300000,
          effectiveMortgageBalance: 150000,
          equity: 150000,
          marketRent: null,
          monthlyRent: 2500,
          monthlyCashFlow: 100,
          capRate: null,
          ltv: null,
          avmValueApplied: false,
          avmRentApplied: false,
        },
      ],
    });
    expect(isDigestWorthSending(content, 0)).toBe(false);
  });
});
