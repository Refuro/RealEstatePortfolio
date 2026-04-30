/**
 * incomplete_profile generator.
 *
 * Surfaces a CTA to finish a property's profile when metric-ready fields are
 * still missing. Sits at the top of the warning bucket because the missing
 * fields directly gate other insights and metrics — the user can't see
 * accurate DSCR, LTV, or cash-on-cash without them, so this nudge explains
 * the blanks and points at the fix.
 *
 * Single mode: fires when the property's completeness score is < 100.
 * Multi mode:  fires when 1+ properties in the portfolio are < 100.
 *
 * Severity: warning (always — it's a nudge, not a failure).
 * Score:
 *   - single: 100 - score (more missing → ranks higher within generator)
 *   - multi:  count of incomplete properties
 *
 * Math (the completeness scoring) lives in `lib/property-completeness.ts`,
 * shared with the properties task center. This generator is a thin wrapper
 * that gates on insights-engine concerns and shapes the copy.
 */

import type { Generator, Insight, InsightsContext, InsightsContextProperty } from "../types";
import { incompleteProfileCopy } from "../copy";
import { getPropertyCompleteness, type CompletenessResult } from "@/lib/property-completeness";

const TYPE = "incomplete_profile" as const;

function completenessForProperty(p: InsightsContextProperty): CompletenessResult {
  return getPropertyCompleteness({
    purchasePrice: p.purchasePrice,
    currentEstimatedValue: p.currentEstimatedValue,
    cashInvested: p.cashInvested,
    mortgageCount: p.mortgageCount,
    hasMortgage: p.hasMortgage,
    mortgagePaidOff: p.mortgagePaidOff,
  });
}

function singleGenerate(ctx: InsightsContext): Insight[] {
  const property = ctx.properties[0];
  if (!property) return [];

  const result = completenessForProperty(property);
  if (result.score >= 100) return [];

  const copy = incompleteProfileCopy.single({
    score: result.score,
    missingFields: result.missingFields,
  });

  return [
    {
      type: TYPE,
      severity: "warning",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      cta: {
        label: "Complete profile →",
        href: `/properties/${property.id}?edit=mortgage&wizard=1`,
      },
      dismissKey: `${TYPE}:${property.id}`,
      dismissThreshold: {
        metric: "completenessScore",
        value: result.score,
        deltaPct: 15,
      },
      score: 100 - result.score,
    },
  ];
}

function multiGenerate(ctx: InsightsContext): Insight[] {
  let count = 0;
  let worstScore = 100;
  let worstName: string | undefined;
  let worstId: string | undefined;

  for (const property of ctx.properties) {
    const { score } = completenessForProperty(property);
    if (score >= 100) continue;
    count += 1;
    if (score < worstScore) {
      worstScore = score;
      worstName = property.name;
      worstId = property.id;
    }
  }

  if (count === 0) return [];

  const copy = incompleteProfileCopy.multi({
    count,
    worstName,
    worstScore,
  });

  // When exactly one property is incomplete, deep-link to its edit wizard.
  // Otherwise, send the user to the properties list filtered to incomplete.
  const ctaHref =
    count === 1 && worstId
      ? `/properties/${worstId}?edit=mortgage&wizard=1`
      : "/properties?filter=incomplete";
  const ctaLabel = count === 1 ? "Complete profile →" : "Complete profiles →";

  return [
    {
      type: TYPE,
      severity: "warning",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      cta: { label: ctaLabel, href: ctaHref },
      dismissKey: `${TYPE}:portfolio`,
      dismissThreshold: {
        metric: "incompleteCount",
        value: count,
        deltaPct: 25,
      },
      score: count,
    },
  ];
}

export const incompleteProfileGenerator: Generator = {
  type: TYPE,
  appliesTo: ["single", "multi"] as const,
  generate(ctx: InsightsContext): Insight[] {
    return ctx.mode === "single" ? singleGenerate(ctx) : multiGenerate(ctx);
  },
};
