/**
 * Insights engine — public surface.
 *
 * Standard usage:
 *
 *   import { pickInsights, buildInsightsContext } from "@/lib/insights";
 *   const ctx = buildInsightsContext(...); // see context.ts
 *   const insights = pickInsights(ctx, { dismissed, maxCount: 3 });
 *
 * Most callers should use this `pickInsights` (the wrapper) rather than the
 * one in `picker.ts` directly. The wrapper injects the default generator
 * registry; the picker takes generators explicitly to keep the dependency
 * graph one-way (this file → picker, never the reverse).
 *
 * See `./README.md` for the engine's contract and `claudeCode/veld-implementation-discussion.md`
 * for the decisions behind it.
 */

import type { Generator, Insight, InsightsContext, PickOptions } from "./types";
import { pickInsights as pickInsightsCore, PRIORITY_ORDER } from "./picker";

import { cashFlowDragGenerator } from "./generators/cash-flow-drag";
import { rentOpportunityGenerator } from "./generators/rent-opportunity";
import { refiGapGenerator } from "./generators/refi-gap";
import { incompleteProfileGenerator } from "./generators/incomplete-profile";
import { totalReturnGenerator } from "./generators/total-return";
import { bestPerformerGenerator } from "./generators/best-performer";
import { ltvRiskGenerator } from "./generators/ltv-risk";
import { equityBuiltGenerator } from "./generators/equity-built";

/**
 * Default generator registry used by the public `pickInsights`.
 *
 * Order doesn't matter functionally — the picker buckets by severity and
 * orders within buckets via `PRIORITY_ORDER` from picker.ts. This list is
 * just the set of generators that participate.
 */
export const DEFAULT_GENERATORS: Generator[] = [
  cashFlowDragGenerator,
  rentOpportunityGenerator,
  refiGapGenerator,
  incompleteProfileGenerator,
  totalReturnGenerator,
  bestPerformerGenerator,
  ltvRiskGenerator,
  equityBuiltGenerator,
];

/**
 * Pick insights from a context using the default generator registry.
 *
 * Pass `opts.generators` to override the registry (testing, digest variants,
 * future insights page with a different mix, etc.).
 */
export function pickInsights(
  ctx: InsightsContext,
  opts?: PickOptions
): Insight[] {
  const generators = opts?.generators ?? DEFAULT_GENERATORS;
  return pickInsightsCore(ctx, generators, opts);
}

// Re-exports for callers / tests.
export { PRIORITY_ORDER };
export type {
  AppreciationSource,
  Generator,
  Insight,
  InsightMode,
  InsightType,
  InsightsContext,
  InsightsContextAppreciation,
  InsightsContextBenchmarks,
  InsightsContextMetrics,
  InsightsContextPortfolio,
  InsightsContextProperty,
  InsightsContextSnapshot,
  PickOptions,
  Severity,
} from "./types";

export {
  resolveAppreciationForProperty,
  resolveAppreciationMap,
  DEFAULT_APPRECIATION_RATE,
} from "./appreciation";
