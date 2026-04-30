/**
 * cash_flow_drag generator.
 *
 * Single mode: fires when the property's monthly cash flow is negative.
 * Multi mode:  fires when ≥1 property has negative cash flow; features the
 *              worst offender and reports total drag + offset by healthy props.
 *
 * Severity: negative (always when firing).
 * Score:    magnitude of the drag in $/mo (single = property's drag; multi = total).
 *
 * No materiality threshold — even a small negative CF is a real signal worth
 * surfacing to a user. The dollar amount itself communicates magnitude.
 */

import type { Generator, Insight, InsightsContext } from "../types";
import { cashFlowDragCopy } from "../copy";

const TYPE = "cash_flow_drag" as const;

function singleGenerate(ctx: InsightsContext): Insight[] {
  const property = ctx.properties[0];
  const metrics = ctx.metrics[0];
  if (!property || !metrics) return [];
  if (metrics.monthlyCashFlow >= 0) return [];

  const monthlyDrag = -metrics.monthlyCashFlow; // positive magnitude
  const annualDrag = -metrics.annualCashFlow;

  const copy = cashFlowDragCopy.single({ monthlyDrag, annualDrag });

  return [
    {
      type: TYPE,
      severity: "negative",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      dismissKey: `${TYPE}:${property.id}`,
      dismissThreshold: { metric: "monthlyCashFlow", value: metrics.monthlyCashFlow, deltaPct: 10 },
      score: monthlyDrag,
    },
  ];
}

function multiGenerate(ctx: InsightsContext): Insight[] {
  const negativeProps = ctx.metrics.filter((m) => m.monthlyCashFlow < 0);
  if (negativeProps.length === 0) return [];

  // Sort negative properties worst-first.
  const sorted = [...negativeProps].sort(
    (a, b) => a.monthlyCashFlow - b.monthlyCashFlow
  );

  const totalMonthlyDrag = sorted.reduce(
    (sum, m) => sum + Math.abs(m.monthlyCashFlow),
    0
  );
  const totalAnnualDrag = totalMonthlyDrag * 12;

  // Top 1-2 worst by name + amount, aligned arrays.
  const worstNames: string[] = [];
  const worstAmounts: number[] = [];
  for (const metrics of sorted.slice(0, 2)) {
    const property = ctx.properties.find((p) => p.id === metrics.id);
    worstNames.push(property?.name ?? "—");
    worstAmounts.push(Math.abs(metrics.monthlyCashFlow));
  }

  const healthyMetrics = ctx.metrics.filter((m) => m.monthlyCashFlow >= 0);
  const healthyMonthlyTotal = healthyMetrics.reduce(
    (sum, m) => sum + m.monthlyCashFlow,
    0
  );

  let soloHealthyName: string | undefined;
  if (healthyMetrics.length === 1) {
    const soleHealthy = ctx.properties.find((p) => p.id === healthyMetrics[0]!.id);
    soloHealthyName = soleHealthy?.name;
  }

  const copy = cashFlowDragCopy.multi({
    count: negativeProps.length,
    totalProperties: ctx.properties.length,
    totalMonthlyDrag,
    totalAnnualDrag,
    worstNames,
    worstAmounts,
    healthyCount: healthyMetrics.length,
    healthyMonthlyTotal,
    soloHealthyName,
  });

  return [
    {
      type: TYPE,
      severity: "negative",
      eyebrow: copy.eyebrow,
      value: copy.value,
      explanation: copy.explanation,
      dismissKey: `${TYPE}:portfolio`,
      dismissThreshold: {
        metric: "totalMonthlyDrag",
        value: totalMonthlyDrag,
        deltaPct: 10,
      },
      score: totalMonthlyDrag,
    },
  ];
}

export const cashFlowDragGenerator: Generator = {
  type: TYPE,
  appliesTo: ["single", "multi"] as const,
  generate(ctx: InsightsContext): Insight[] {
    return ctx.mode === "single" ? singleGenerate(ctx) : multiGenerate(ctx);
  },
};
