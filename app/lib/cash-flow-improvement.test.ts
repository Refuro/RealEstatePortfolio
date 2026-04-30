import { describe, it, expect } from "vitest";
import { hasRecentCashFlowImprovement } from "./cash-flow-improvement";

describe("hasRecentCashFlowImprovement", () => {
  it("fires when prior negative and latest non-negative", () => {
    expect(
      hasRecentCashFlowImprovement(
        { monthlyCashFlow: 50 },
        { monthlyCashFlow: -100 }
      )
    ).toBe(true);
  });

  it("fires when latest is exactly zero (non-negative crossing)", () => {
    expect(
      hasRecentCashFlowImprovement(
        { monthlyCashFlow: 0 },
        { monthlyCashFlow: -10 }
      )
    ).toBe(true);
  });

  it("does not fire when both periods are negative", () => {
    expect(
      hasRecentCashFlowImprovement(
        { monthlyCashFlow: -50 },
        { monthlyCashFlow: -200 }
      )
    ).toBe(false);
  });

  it("does not fire when both periods are positive", () => {
    expect(
      hasRecentCashFlowImprovement(
        { monthlyCashFlow: 100 },
        { monthlyCashFlow: 50 }
      )
    ).toBe(false);
  });

  it("does not fire when latest dips negative again", () => {
    expect(
      hasRecentCashFlowImprovement(
        { monthlyCashFlow: -10 },
        { monthlyCashFlow: 50 }
      )
    ).toBe(false);
  });

  it("returns false when prior snapshot is missing", () => {
    expect(
      hasRecentCashFlowImprovement({ monthlyCashFlow: 50 }, null)
    ).toBe(false);
  });

  it("returns false when latest snapshot is missing", () => {
    expect(
      hasRecentCashFlowImprovement(null, { monthlyCashFlow: -50 })
    ).toBe(false);
  });
});
