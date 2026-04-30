/**
 * rent_opportunity generator.
 *
 * Single mode: fires when the property is rented, has a fresh-enough market rent,
 *              and userRent is materially below market.
 * Multi mode:  aggregates properties with material below-market rent;
 *              features up to the top 4 underperformers by gap.
 *
 * Severity: warning (always).
 * Score:    monthly rent gap in $ (single = the property's gap; multi = total).
 *
 * Materiality: only fires if the gap is at least 3% of market rent.
 * Properties without market rent data are silently skipped — staleness handling
 * lives in the benchmark-utils layer; this generator just consumes what's there.
 */

import type { Generator, Insight, InsightsContext, InsightsContextProperty } from "../types";
import { rentOpportunityCopy } from "../copy";

const TYPE = "rent_opportunity" as const;
const MATERIALITY_PCT = 3.0;

type Gap = {
  property: InsightsContextProperty;
  pctBelow: number;
  monthlyGap: number; // positive
};

function computeGap(property: InsightsContextProperty): Gap | null {
  if (!property.isRented) return null;
  if (property.userRent <= 0) return null;
  if (property.marketRent == null || property.marketRent <= 0) return null;

  const monthlyGap = property.marketRent - property.userRent;
  if (monthlyGap <= 0) return null; // at/above market

  const pctBelow = (monthlyGap / property.marketRent) * 100;
  if (pctBelow < MATERIALITY_PCT) return null;

  return { property, pctBelow, monthlyGap };
}

function singleGenerate(ctx: InsightsContext): Insight[] {
  const property = ctx.properties[0];
  if (!property) return [];

  const gap = computeGap(property);
  if (!gap) return [];

  const annualGap = gap.monthlyGap * 12;

  const copy = rentOpportunityCopy.single({
    pctBelow: gap.pctBelow,
    monthlyGap: gap.monthlyGap,
    annualGap,
  });

  // copy.cta has an empty href (per copy.ts contract: filled here). Property
  // edit uses the detail-page drawer (`?edit=<section>`), not a /edit segment.
  const cta = copy.cta
    ? { ...copy.cta, href: `/properties/${property.id}?edit=rent` }
    : undefined;

  return [
    {
      type: TYPE,
      severity: "warning",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      cta,
      dismissKey: `${TYPE}:${property.id}`,
      dismissThreshold: { metric: "monthlyGap", value: gap.monthlyGap, deltaPct: 10 },
      score: gap.monthlyGap,
    },
  ];
}

function multiGenerate(ctx: InsightsContext): Insight[] {
  const gaps: Gap[] = [];
  for (const property of ctx.properties) {
    const gap = computeGap(property);
    if (gap) gaps.push(gap);
  }
  if (gaps.length === 0) return [];

  // Sort by largest pct-below first (largest opportunity).
  gaps.sort((a, b) => b.pctBelow - a.pctBelow);

  const totalMonthlyGap = gaps.reduce((sum, g) => sum + g.monthlyGap, 0);

  const worst = gaps.slice(0, 4);
  const worstNames = worst.map((g) => g.property.name);
  const worstPcts = worst.map((g) => g.pctBelow);

  const copy = rentOpportunityCopy.multi({
    count: gaps.length,
    totalMonthlyGap,
    worstNames,
    worstPcts,
  });

  return [
    {
      type: TYPE,
      severity: "warning",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      cta: copy.cta,
      dismissKey: `${TYPE}:portfolio`,
      dismissThreshold: {
        metric: "totalMonthlyGap",
        value: totalMonthlyGap,
        deltaPct: 10,
      },
      score: totalMonthlyGap,
    },
  ];
}

export const rentOpportunityGenerator: Generator = {
  type: TYPE,
  appliesTo: ["single", "multi"] as const,
  generate(ctx: InsightsContext): Insight[] {
    return ctx.mode === "single" ? singleGenerate(ctx) : multiGenerate(ctx);
  },
};
