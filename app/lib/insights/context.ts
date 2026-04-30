/**
 * Helpers for callers to build an `InsightsContext`.
 *
 * The engine is decoupled from any specific data source — dashboard, digest
 * job, future insights page — so this file provides shape-agnostic helpers
 * that take the structured inputs each caller computes (raw property records,
 * computed metrics, snapshots) and assembles a clean `InsightsContext`.
 *
 * Callers are responsible for:
 *   - Loading their own data (DB queries, etc.)
 *   - Computing per-property metrics (use `lib/metrics/property-metrics.ts`)
 *   - Computing portfolio metrics (use `lib/metrics/portfolio-metrics.ts`)
 *   - Computing annual mortgage paydown for each property (use amortization lib)
 *   - Resolving appreciation (use `resolveAppreciationMap` from `./appreciation`)
 *
 * This file ties those pre-computed pieces together into the shape the
 * generators consume.
 */

import type {
  InsightMode,
  InsightsContext,
  InsightsContextAppreciation,
  InsightsContextBenchmarks,
  InsightsContextMetrics,
  InsightsContextPortfolio,
  InsightsContextProperty,
  InsightsContextSnapshot,
} from "./types";

export type BuildInsightsContextInput = {
  properties: InsightsContextProperty[];
  metrics: InsightsContextMetrics[];
  portfolio: InsightsContextPortfolio;
  snapshots?: InsightsContextSnapshot[];
  appreciationByPropertyId?: Record<string, InsightsContextAppreciation>;
  benchmarks?: InsightsContextBenchmarks;
};

/**
 * Build an `InsightsContext` from pre-computed inputs.
 *
 * Determines `mode` from the property count: 1 property → "single", 2+ → "multi".
 * (See discussion doc decision #4.)
 */
export function buildInsightsContext(input: BuildInsightsContextInput): InsightsContext {
  const mode: InsightMode = input.properties.length === 1 ? "single" : "multi";
  return {
    mode,
    properties: input.properties,
    metrics: input.metrics,
    portfolio: input.portfolio,
    snapshots: input.snapshots,
    appreciationByPropertyId: input.appreciationByPropertyId,
    benchmarks: input.benchmarks,
  };
}

/**
 * Compute the dismissal-relevant timestamp signal that callers pass to the
 * client for the dismissal updated-at expiry rule (see decision #6).
 *
 * Callers pass property `updatedAt` timestamps to the client; the client
 * compares each dismissal's `dismissedAt` against the relevant timestamp:
 *   - For `${type}:${propertyId}` dismissals: that property's updatedAt.
 *   - For `${type}:portfolio` dismissals: the max updatedAt across all properties.
 *
 * This helper just packages the data into the shape the client expects. The
 * client does the comparison logic.
 */
export type DismissalTimestamps = {
  /** Per-property updatedAt as ISO strings, keyed by property id. */
  propertyUpdatedAt: Record<string, string>;
  /** Max updatedAt across all properties as an ISO string, for portfolio-scoped dismissals. */
  portfolioUpdatedAt: string;
};

export function buildDismissalTimestamps(
  properties: Array<{ id: string; updatedAt: Date }>
): DismissalTimestamps {
  const propertyUpdatedAt: Record<string, string> = {};
  let maxMs = 0;
  for (const p of properties) {
    propertyUpdatedAt[p.id] = p.updatedAt.toISOString();
    if (p.updatedAt.getTime() > maxMs) maxMs = p.updatedAt.getTime();
  }
  // Fallback to epoch if no properties — portfolio dismissals will always
  // expire on the month boundary anyway.
  const portfolioUpdatedAt =
    maxMs > 0 ? new Date(maxMs).toISOString() : new Date(0).toISOString();
  return { propertyUpdatedAt, portfolioUpdatedAt };
}
