import { describe, expect, it } from "vitest";
import { pickInsights, PRIORITY_ORDER } from "./picker";
import type {
  Generator,
  Insight,
  InsightType,
  InsightsContext,
  Severity,
} from "./types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function makeContext(mode: "single" | "multi" = "multi"): InsightsContext {
  return {
    mode,
    properties: [],
    metrics: [],
    portfolio: {
      totalEquity: 0,
      totalMonthlyCashFlow: 0,
      totalCashInvested: 0,
      weightedCapRate: null,
      portfolioLtv: null,
      dscr: null,
    },
  };
}

function makeInsight(
  type: InsightType,
  severity: Severity,
  score: number,
  scope = "portfolio"
): Insight {
  return {
    type,
    severity,
    eyebrow: `${type}-eyebrow`,
    value: `${type}-value`,
    explanation: `${type}-explanation`,
    dismissKey: `${type}:${scope}`,
    score,
  };
}

/**
 * Build a generator that always emits the given insights, regardless of context.
 * Used for testing picker behavior without involving real generator logic.
 */
function makeStubGenerator(
  type: InsightType,
  appliesTo: ReadonlyArray<"single" | "multi">,
  insights: Insight[]
): Generator {
  return {
    type,
    appliesTo,
    generate: () => insights,
  };
}

// ─── Slot-fill basics ────────────────────────────────────────────────────────

describe("pickInsights — slot-fill basics", () => {
  it("returns 1 negative + 1 warning + 1 positive when all three are available", () => {
    const generators: Generator[] = [
      makeStubGenerator("ltv_risk", ["multi"], [makeInsight("ltv_risk", "negative", 100)]),
      makeStubGenerator("refi_gap", ["multi"], [makeInsight("refi_gap", "warning", 100)]),
      makeStubGenerator("total_return", ["multi"], [
        makeInsight("total_return", "positive", 100),
      ]),
    ];
    const result = pickInsights(makeContext(), generators);
    expect(result.map((i) => i.severity)).toEqual(["negative", "warning", "positive"]);
    expect(result.map((i) => i.type)).toEqual(["ltv_risk", "refi_gap", "total_return"]);
  });

  it("returns top 3 positives when no negatives or warnings exist (Fallback B)", () => {
    const generators: Generator[] = [
      makeStubGenerator("total_return", ["multi"], [
        makeInsight("total_return", "positive", 200),
      ]),
      makeStubGenerator("best_performer", ["multi"], [
        makeInsight("best_performer", "positive", 150),
      ]),
      makeStubGenerator("equity_built", ["multi"], [
        makeInsight("equity_built", "positive", 100),
      ]),
    ];
    const result = pickInsights(makeContext(), generators);
    expect(result).toHaveLength(3);
    expect(result.every((i) => i.severity === "positive")).toBe(true);
    // Order should reflect editorial priority.
    expect(result.map((i) => i.type)).toEqual([
      "total_return",
      "best_performer",
      "equity_built",
    ]);
  });

  it("returns only what is available when fewer than 3 insights fire (no filler)", () => {
    const generators: Generator[] = [
      makeStubGenerator("cash_flow_drag", ["multi"], [
        makeInsight("cash_flow_drag", "negative", 100),
      ]),
    ];
    const result = pickInsights(makeContext(), generators);
    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe("cash_flow_drag");
  });

  it("returns empty array when no insights fire", () => {
    const result = pickInsights(makeContext(), []);
    expect(result).toEqual([]);
  });
});

// ─── Slot-fill leftovers (Fallback A) ─────────────────────────────────────────

describe("pickInsights — leftover fill (Fallback A)", () => {
  it("fills empty positive slot with leftover negatives when no positive is available", () => {
    const generators: Generator[] = [
      makeStubGenerator("ltv_risk", ["multi"], [
        // ltv_risk fires twice for two different properties — the second
        // candidate should backfill the empty positive slot.
        makeInsight("ltv_risk", "negative", 100, "portfolio"),
      ]),
      makeStubGenerator("cash_flow_drag", ["multi"], [
        makeInsight("cash_flow_drag", "negative", 80, "portfolio"),
      ]),
      makeStubGenerator("refi_gap", ["multi"], [
        makeInsight("refi_gap", "warning", 50, "portfolio"),
      ]),
    ];
    const result = pickInsights(makeContext(), generators);
    expect(result).toHaveLength(3);
    // ltv_risk wins negative slot, refi_gap wins warning slot, cash_flow_drag fills the positive slot via leftover fill.
    expect(result.map((i) => i.type)).toEqual(["ltv_risk", "refi_gap", "cash_flow_drag"]);
  });
});

// ─── Editorial priority within severity ──────────────────────────────────────

describe("pickInsights — editorial priority resolution", () => {
  it("picks ltv_risk over cash_flow_drag for the negative slot when both fire", () => {
    const generators: Generator[] = [
      makeStubGenerator("cash_flow_drag", ["multi"], [
        makeInsight("cash_flow_drag", "negative", 1000, "portfolio"),
      ]),
      makeStubGenerator("ltv_risk", ["multi"], [
        // Lower score, but higher editorial priority — should still win.
        makeInsight("ltv_risk", "negative", 50, "portfolio"),
      ]),
    ];
    const result = pickInsights(makeContext(), generators);
    expect(result[0]!.type).toBe("ltv_risk");
  });

  it("matches the documented PRIORITY_ORDER for negatives", () => {
    expect(PRIORITY_ORDER.negative).toEqual([
      "ltv_risk",
      "cash_flow_drag",
      "rent_opportunity",
    ]);
  });

  it("matches the documented PRIORITY_ORDER for positives", () => {
    expect(PRIORITY_ORDER.positive).toEqual([
      "total_return",
      "best_performer",
      "equity_built",
    ]);
  });
});

// ─── Mode handling ────────────────────────────────────────────────────────────

describe("pickInsights — mode handling", () => {
  it("skips generators that do not apply to the current mode", () => {
    const generators: Generator[] = [
      makeStubGenerator("best_performer", ["multi"], [
        makeInsight("best_performer", "positive", 100),
      ]),
      makeStubGenerator("total_return", ["single"], [
        makeInsight("total_return", "positive", 100),
      ]),
    ];
    // Single mode — only total_return runs.
    const single = pickInsights(makeContext("single"), generators);
    expect(single.map((i) => i.type)).toEqual(["total_return"]);
    // Multi mode — only best_performer runs.
    const multi = pickInsights(makeContext("multi"), generators);
    expect(multi.map((i) => i.type)).toEqual(["best_performer"]);
  });
});

// ─── Dismissal filtering ─────────────────────────────────────────────────────

describe("pickInsights — dismissal filtering", () => {
  it("filters out dismissed insights BEFORE slot-fill", () => {
    const generators: Generator[] = [
      makeStubGenerator("ltv_risk", ["multi"], [makeInsight("ltv_risk", "negative", 100)]),
      makeStubGenerator("cash_flow_drag", ["multi"], [
        makeInsight("cash_flow_drag", "negative", 80),
      ]),
      makeStubGenerator("refi_gap", ["multi"], [makeInsight("refi_gap", "warning", 50)]),
      makeStubGenerator("total_return", ["multi"], [
        makeInsight("total_return", "positive", 60),
      ]),
    ];
    const result = pickInsights(makeContext(), generators, {
      dismissed: new Set(["ltv_risk:portfolio"]),
    });
    // ltv_risk filtered → cash_flow_drag fills negative slot.
    expect(result.map((i) => i.type)).toEqual([
      "cash_flow_drag",
      "refi_gap",
      "total_return",
    ]);
  });

  it("returns empty when all candidates are dismissed", () => {
    const generators: Generator[] = [
      makeStubGenerator("ltv_risk", ["multi"], [
        makeInsight("ltv_risk", "negative", 100, "portfolio"),
      ]),
    ];
    const result = pickInsights(makeContext(), generators, {
      dismissed: new Set(["ltv_risk:portfolio"]),
    });
    expect(result).toEqual([]);
  });
});

// ─── Within-generator score tiebreaker ───────────────────────────────────────

describe("pickInsights — within-generator score ranking", () => {
  it("picks the highest-score insight when a generator emits multiple of the same type", () => {
    const generators: Generator[] = [
      makeStubGenerator("ltv_risk", ["multi"], [
        makeInsight("ltv_risk", "negative", 50, "prop_a"),
        makeInsight("ltv_risk", "negative", 200, "prop_b"),
        makeInsight("ltv_risk", "negative", 100, "prop_c"),
      ]),
    ];
    const result = pickInsights(makeContext(), generators);
    expect(result).toHaveLength(1);
    expect(result[0]!.dismissKey).toBe("ltv_risk:prop_b"); // highest score
  });
});

// ─── maxCount option ─────────────────────────────────────────────────────────

describe("pickInsights — maxCount option", () => {
  it("respects maxCount when greater than 3", () => {
    const generators: Generator[] = [
      makeStubGenerator("total_return", ["multi"], [
        makeInsight("total_return", "positive", 100),
      ]),
      makeStubGenerator("best_performer", ["multi"], [
        makeInsight("best_performer", "positive", 90),
      ]),
      makeStubGenerator("equity_built", ["multi"], [
        makeInsight("equity_built", "positive", 80),
      ]),
    ];
    const result = pickInsights(makeContext(), generators, { maxCount: 5 });
    expect(result).toHaveLength(3); // only 3 available
  });

  it("respects maxCount when smaller than 3", () => {
    const generators: Generator[] = [
      makeStubGenerator("ltv_risk", ["multi"], [makeInsight("ltv_risk", "negative", 100)]),
      makeStubGenerator("refi_gap", ["multi"], [makeInsight("refi_gap", "warning", 100)]),
      makeStubGenerator("total_return", ["multi"], [
        makeInsight("total_return", "positive", 100),
      ]),
    ];
    const result = pickInsights(makeContext(), generators, { maxCount: 1 });
    expect(result).toHaveLength(1);
    expect(result[0]!.severity).toBe("negative");
  });
});
