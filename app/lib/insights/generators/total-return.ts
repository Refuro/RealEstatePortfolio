/**
 * total_return generator.
 *
 * Reframes negative cash flow as a positive total return story by combining
 * cash flow + appreciation + paydown.
 *
 * Single mode: fires per property; uses appreciationByPropertyId for that property.
 * Multi mode:  aggregates across the portfolio.
 *
 * Severity: positive (always when firing).
 * Score:    annual total return ($).
 *
 * Gating:
 *   - Generator skips if total return is NOT positive — the reframe doesn't
 *     work if the math is also negative.
 *   - Skips if appreciation data is unavailable (e.g., generator's caller
 *     didn't supply appreciationByPropertyId).
 *   - Skips on properties held < 12 months (the "appreciation since purchase"
 *     framing is meaningless for very recent buys; this is enforced upstream
 *     in the appreciation resolver, which returns null for such cases).
 */

import type { Generator, Insight, InsightsContext } from "../types";
import { totalReturnCopy } from "../copy";

const TYPE = "total_return" as const;

function singleGenerate(ctx: InsightsContext): Insight[] {
  const property = ctx.properties[0];
  const metrics = ctx.metrics[0];
  if (!property || !metrics) return [];

  const appreciation = ctx.appreciationByPropertyId?.[property.id];
  if (!appreciation) return [];

  const annualAppreciation = appreciation.annualDollars;
  const annualPaydown = metrics.annualPaydown;
  const annualCashFlow = metrics.annualCashFlow;
  const annualTotalReturn = annualCashFlow + annualAppreciation + annualPaydown;

  if (annualTotalReturn <= 0) return [];

  const pctOfEquity = metrics.equity > 0 ? annualTotalReturn / metrics.equity : null;

  const copy = totalReturnCopy.single({
    annualTotalReturn,
    annualCashFlow,
    annualAppreciation,
    annualPaydown,
    pctOfEquity,
  });

  return [
    {
      type: TYPE,
      severity: "positive",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      dismissKey: `${TYPE}:${property.id}`,
      dismissThreshold: {
        metric: "annualTotalReturn",
        value: annualTotalReturn,
        deltaPct: 15,
      },
      score: annualTotalReturn,
    },
  ];
}

function multiGenerate(ctx: InsightsContext): Insight[] {
  const appreciationMap = ctx.appreciationByPropertyId ?? {};

  let annualAppreciation = 0;
  let annualPaydown = 0;
  let annualCashFlow = 0;
  let totalEquity = 0;
  let propertiesWithAppreciation = 0;

  for (const property of ctx.properties) {
    const metrics = ctx.metrics.find((m) => m.id === property.id);
    if (!metrics) continue;

    annualCashFlow += metrics.annualCashFlow;
    annualPaydown += metrics.annualPaydown;
    totalEquity += metrics.equity;

    const appr = appreciationMap[property.id];
    if (appr) {
      annualAppreciation += appr.annualDollars;
      propertiesWithAppreciation += 1;
    }
  }

  // Don't fire if we couldn't resolve appreciation for any property.
  if (propertiesWithAppreciation === 0) return [];

  const annualTotalReturn = annualCashFlow + annualAppreciation + annualPaydown;
  if (annualTotalReturn <= 0) return [];

  const pctOfEquity = totalEquity > 0 ? annualTotalReturn / totalEquity : null;

  const copy = totalReturnCopy.multi({
    annualTotalReturn,
    annualCashFlow,
    annualAppreciation,
    annualPaydown,
    pctOfEquity,
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
        metric: "annualTotalReturn",
        value: annualTotalReturn,
        deltaPct: 15,
      },
      score: annualTotalReturn,
    },
  ];
}

export const totalReturnGenerator: Generator = {
  type: TYPE,
  appliesTo: ["single", "multi"] as const,
  generate(ctx: InsightsContext): Insight[] {
    return ctx.mode === "single" ? singleGenerate(ctx) : multiGenerate(ctx);
  },
};
