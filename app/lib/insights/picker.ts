/**
 * Insights picker — slot-fills 3 insight cards from the candidate pool.
 *
 * **Read `./README.md` before editing.** It documents the non-negotiable rules
 * (scoring is editorial not normalized, slot-fill order, dismissal contract,
 * mode handling). Those rules exist because we considered alternatives and
 * rejected them — see `claudeCode/veld-implementation-discussion.md` for why.
 *
 * Public surface:
 *   pickInsights(ctx, generators, opts?) → Insight[]
 *
 * Most callers should use the wrapper from `./index` which injects the default
 * generator registry. This file's `pickInsights` requires generators explicitly
 * to keep the dependency graph one-way (index → picker, not the reverse).
 *
 * Algorithm:
 *   1. Run each generator that matches ctx.mode.
 *   2. Filter out candidates whose dismissKey is in opts.dismissed.
 *   3. Bucket remaining candidates by severity (negative / warning / positive).
 *   4. Within each bucket, sort by editorial PRIORITY_ORDER first, then by
 *      generator-native `score` desc as the tiebreaker within the same generator.
 *   5. Slot-fill (default 1 of each color, fallbacks per README rule #2).
 *   6. Return up to opts.maxCount ?? 3 insights.
 *
 * Do NOT:
 *   - Replace editorial priority with a normalized scoring algorithm. (See README ¶ rule 1.)
 *   - Fill empty slots with generic CTAs / tips when fewer than 3 insights fire.
 *   - Move generator gating thresholds (e.g. "LTV > 80%") out into this file.
 *   - Add dismissal storage / persistence here. The engine is pure; callers own state.
 */

import type {
  Generator,
  Insight,
  InsightType,
  InsightsContext,
  PickOptions,
  Severity,
} from "./types";

/**
 * Editorial priority within each severity bucket.
 *
 * When multiple generators of the same severity compete for one slot, the
 * winner is decided by this list — NOT by comparing scores across generators.
 *
 * `cap_rate_benchmark` deliberately absent — deferred from v1 per discussion
 * doc decision #3.
 */
export const PRIORITY_ORDER: Record<Severity, ReadonlyArray<InsightType>> = {
  negative: ["ltv_risk", "cash_flow_drag", "rent_opportunity"],
  // incomplete_profile precedes refi_gap because the missing fields it
  // surfaces directly gate the metrics other warning/positive insights rely
  // on — explaining the blanks is more useful than a calculation built on
  // partial data.
  warning: ["incomplete_profile", "refi_gap"],
  positive: ["total_return", "best_performer", "equity_built"],
};

const DEFAULT_MAX_COUNT = 3;

function priorityIndex(type: InsightType, severity: Severity): number {
  const order = PRIORITY_ORDER[severity];
  const idx = order.indexOf(type);
  // Generators not present in the priority list sort to the end.
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

/** Negatives first, then warnings, then positives. */
function severityRank(severity: Severity): number {
  return severity === "negative" ? 0 : severity === "warning" ? 1 : 2;
}

/**
 * Sort a bucket of insights all sharing the same severity:
 *   - editorial priority order across generator types (asc)
 *   - within the same generator type, native `score` desc
 */
function sortBucket(insights: Insight[]): Insight[] {
  return [...insights].sort((a, b) => {
    const pa = priorityIndex(a.type, a.severity);
    const pb = priorityIndex(b.type, b.severity);
    if (pa !== pb) return pa - pb;
    if (a.type !== b.type) return 0;
    return b.score - a.score;
  });
}

/**
 * Pick insights from a context using an explicit generator list.
 *
 * @param ctx       the context the generators consume
 * @param generators the generator pool (use DEFAULT_GENERATORS from `./index` for the standard set)
 * @param opts      maxCount, dismissed-set
 */
export function pickInsights(
  ctx: InsightsContext,
  generators: Generator[],
  opts?: PickOptions
): Insight[] {
  const maxCount = opts?.maxCount ?? DEFAULT_MAX_COUNT;
  const dismissed = opts?.dismissed ?? new Set<string>();

  // 1. Collect candidates from every applicable generator.
  const all: Insight[] = [];
  for (const gen of generators) {
    if (!gen.appliesTo.includes(ctx.mode)) continue;
    const produced = gen.generate(ctx);
    for (const insight of produced) {
      all.push(insight);
    }
  }

  // 2. Filter out dismissed.
  const eligible = all.filter((i) => !dismissed.has(i.dismissKey));

  // 3. Bucket by severity and sort each bucket.
  const buckets: Record<Severity, Insight[]> = {
    negative: sortBucket(eligible.filter((i) => i.severity === "negative")),
    warning: sortBucket(eligible.filter((i) => i.severity === "warning")),
    positive: sortBucket(eligible.filter((i) => i.severity === "positive")),
  };

  // 4. Slot-fill.
  const result: Insight[] = [];
  const takenTypes = new Set<InsightType>();

  // Fallback B: if no negatives AND no warnings exist, show top positives only.
  const hasNegOrWarn = buckets.negative.length > 0 || buckets.warning.length > 0;
  if (!hasNegOrWarn) {
    for (const insight of buckets.positive) {
      if (result.length >= maxCount) break;
      if (takenTypes.has(insight.type)) continue;
      result.push(insight);
      takenTypes.add(insight.type);
    }
    return result;
  }

  // Default path: try 1 negative + 1 warning + 1 positive.
  const slotOrder: Severity[] = ["negative", "warning", "positive"];
  for (const slot of slotOrder) {
    if (result.length >= maxCount) break;
    for (const insight of buckets[slot]) {
      if (takenTypes.has(insight.type)) continue;
      result.push(insight);
      takenTypes.add(insight.type);
      break;
    }
  }

  // Fallback A: fill empty slots from leftovers if we have fewer than maxCount.
  if (result.length < maxCount) {
    const leftover: Insight[] = [];
    for (const slot of slotOrder) {
      for (const insight of buckets[slot]) {
        if (takenTypes.has(insight.type)) continue;
        leftover.push(insight);
      }
    }
    leftover.sort((a, b) => {
      const sa = severityRank(a.severity);
      const sb = severityRank(b.severity);
      if (sa !== sb) return sa - sb;
      const pa = priorityIndex(a.type, a.severity);
      const pb = priorityIndex(b.type, b.severity);
      if (pa !== pb) return pa - pb;
      return b.score - a.score;
    });
    for (const insight of leftover) {
      if (result.length >= maxCount) break;
      if (takenTypes.has(insight.type)) continue;
      result.push(insight);
      takenTypes.add(insight.type);
    }
  }

  return result;
}
