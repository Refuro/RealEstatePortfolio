/**
 * ltv_risk generator.
 *
 * Single mode: fires when the property's LTV is above 80%.
 * Multi mode:  fires when ≥1 property is above 80% LTV; features the
 *              highest-LTV property and counts the at-risk set.
 *
 * Severity escalates by LTV magnitude:
 *   - 80% to 90%  → warning  (refi access getting tight)
 *   - 90%+        → negative (refi-locked, refinance very difficult)
 *
 * Multi-mode severity = `negative` if ANY property is above 90%, else `warning`.
 *
 * Score: absolute LTV percentage of the worst property (the higher, the more urgent).
 */

import type {
  Generator,
  Insight,
  InsightsContext,
  InsightsContextMetrics,
  InsightsContextProperty,
} from "../types";
import { ltvRiskCopy } from "../copy";

const TYPE = "ltv_risk" as const;
const WATCH_THRESHOLD = 0.8;
const NEGATIVE_THRESHOLD = 0.9;

/** Narrow severity — ltv_risk never produces "positive". */
type LtvSeverity = "negative" | "warning";

function severityFromLtv(ltv: number): LtvSeverity {
  return ltv >= NEGATIVE_THRESHOLD ? "negative" : "warning";
}

function singleGenerate(ctx: InsightsContext): Insight[] {
  const property = ctx.properties[0];
  const metrics = ctx.metrics[0];
  if (!property || !metrics) return [];
  if (metrics.ltv == null || metrics.ltv < WATCH_THRESHOLD) return [];

  const ltvPct = metrics.ltv * 100;
  const severity = severityFromLtv(metrics.ltv);
  const severityLabel = severity;

  const copy = ltvRiskCopy.single({ ltvPct, severityLabel });

  return [
    {
      type: TYPE,
      severity,
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      dismissKey: `${TYPE}:${property.id}`,
      dismissThreshold: { metric: "ltv", value: metrics.ltv, deltaPct: 5 },
      score: ltvPct,
    },
  ];
}

function multiGenerate(ctx: InsightsContext): Insight[] {
  type Risky = {
    property: InsightsContextProperty;
    metrics: InsightsContextMetrics;
    ltv: number;
  };
  const risky: Risky[] = [];

  for (const property of ctx.properties) {
    const metrics = ctx.metrics.find((m) => m.id === property.id);
    if (!metrics || metrics.ltv == null) continue;
    if (metrics.ltv < WATCH_THRESHOLD) continue;
    risky.push({ property, metrics, ltv: metrics.ltv });
  }
  if (risky.length === 0) return [];

  // Worst (highest) LTV first.
  risky.sort((a, b) => b.ltv - a.ltv);

  const anyNegative = risky.some((r) => r.ltv >= NEGATIVE_THRESHOLD);
  const severity: LtvSeverity = anyNegative ? "negative" : "warning";
  const severityLabel = severity;

  const worstNames = risky.slice(0, 3).map((r) => r.property.name);
  const worstLtvPcts = risky.slice(0, 3).map((r) => r.ltv * 100);

  const copy = ltvRiskCopy.multi({
    count: risky.length,
    worstNames,
    worstLtvPcts,
    severityLabel,
  });

  return [
    {
      type: TYPE,
      severity,
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      dismissKey: `${TYPE}:portfolio`,
      dismissThreshold: { metric: "worstLtv", value: risky[0]!.ltv, deltaPct: 5 },
      score: worstLtvPcts[0] ?? 0,
    },
  ];
}

export const ltvRiskGenerator: Generator = {
  type: TYPE,
  appliesTo: ["single", "multi"] as const,
  generate(ctx: InsightsContext): Insight[] {
    return ctx.mode === "single" ? singleGenerate(ctx) : multiGenerate(ctx);
  },
};
