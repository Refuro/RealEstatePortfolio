/**
 * best_performer generator.
 *
 * Multi mode only — "best of one" doesn't mean anything in single mode.
 * Self-gates at ≥4 properties (per discussion doc decision #4) — "best of 2 or 3"
 * is just listing properties, not a real insight.
 *
 * Identifies the top 1–3 performers by a combined score of cap rate + monthly
 * cash flow. Reports their combined CF and the share of total portfolio CF they
 * represent.
 *
 * Severity: positive.
 * Score:    combined monthly cash flow of the top 3.
 *
 * Gating: requires positive total portfolio CF (to give "share of CF" a
 * meaningful denominator) and properties with positive cap rates.
 */

import type {
  Generator,
  Insight,
  InsightsContext,
  InsightsContextMetrics,
  InsightsContextProperty,
} from "../types";
import { bestPerformerCopy } from "../copy";

const TYPE = "best_performer" as const;
const MIN_PROPERTIES = 4;
const TOP_N = 3;

type Performer = {
  property: InsightsContextProperty;
  metrics: InsightsContextMetrics;
  // Composite score for ranking — favors high cap rate AND high CF.
  // Cap rate normalized to a 0–1ish scale by treating 10% as the high end.
  rankScore: number;
};

function buildPerformer(
  property: InsightsContextProperty,
  metrics: InsightsContextMetrics
): Performer | null {
  if (metrics.capRate == null || metrics.capRate <= 0) return null;
  if (metrics.monthlyCashFlow <= 0) return null;
  // Combined score: equally weights normalized cap rate and CF magnitude.
  const capRateNormalized = Math.min(metrics.capRate / 0.1, 1.5);
  const cfNormalized = Math.min(metrics.monthlyCashFlow / 2000, 1.5);
  const rankScore = capRateNormalized + cfNormalized;
  return { property, metrics, rankScore };
}

export const bestPerformerGenerator: Generator = {
  type: TYPE,
  appliesTo: ["multi"] as const,
  generate(ctx: InsightsContext): Insight[] {
    if (ctx.mode !== "multi") return [];
    if (ctx.properties.length < MIN_PROPERTIES) return [];

    const performers: Performer[] = [];
    for (const property of ctx.properties) {
      const metrics = ctx.metrics.find((m) => m.id === property.id);
      if (!metrics) continue;
      const performer = buildPerformer(property, metrics);
      if (performer) performers.push(performer);
    }
    if (performers.length === 0) return [];

    // Need positive total portfolio CF for the share-of-CF framing to make sense.
    if (ctx.portfolio.totalMonthlyCashFlow <= 0) return [];

    performers.sort((a, b) => b.rankScore - a.rankScore);
    const top = performers.slice(0, TOP_N);

    const combinedMonthlyCashFlow = top.reduce(
      (sum, p) => sum + p.metrics.monthlyCashFlow,
      0
    );
    const shareOfPortfolioCfPct =
      (combinedMonthlyCashFlow / ctx.portfolio.totalMonthlyCashFlow) * 100;

    const copy = bestPerformerCopy.multi({
      topNames: top.map((p) => p.property.name),
      topCapRates: top.map((p) => p.metrics.capRate ?? 0),
      topMonthlyCashFlows: top.map((p) => p.metrics.monthlyCashFlow),
      combinedMonthlyCashFlow,
      shareOfPortfolioCfPct,
    });

    return [
      {
        type: TYPE,
        severity: "positive",
        eyebrow: copy.eyebrow,
        value: copy.value,
        explanation: copy.explanation,
        dismissKey: `${TYPE}:portfolio`,
        dismissThreshold: {
          metric: "shareOfPortfolioCfPct",
          value: shareOfPortfolioCfPct,
          deltaPct: 10,
        },
        score: combinedMonthlyCashFlow,
      },
    ];
  },
};
