/**
 * Pure helpers for dashboard “Rent vs market” behavior (capped auto-refresh, ordering).
 * Keeps eligibility math testable without React or fetch.
 */

import { getBenchmarkEligibility, getBenchmarkPct } from "@/lib/benchmark-utils";

/** Auto-refresh on dashboard load is capped to avoid hammering RentCast for large stale sets. */
export const MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD = 3;

export type BenchmarkDashboardPropertyInput = {
  id: string;
  isRented: boolean;
  /** Precomputed total monthly rent (same as `getPropertyTotalRent` for the row). */
  userRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
};

/**
 * Partitions properties for the Rent vs market section and caps refresh candidates.
 */
export function computeBenchmarkDashboardPartition(
  properties: BenchmarkDashboardPropertyInput[]
) {
  const getEligibility = (p: BenchmarkDashboardPropertyInput) =>
    getBenchmarkEligibility({
      isRented: p.isRented,
      userRent: p.userRent,
      marketRent: p.marketRent,
      marketRentAsOf: p.marketRentAsOf,
    });

  const fresh = properties.filter((p) => getEligibility(p) === "eligible_fresh");
  const staleOrMissing = properties.filter((p) => getEligibility(p) !== "eligible_fresh");
  const refreshCandidates = staleOrMissing.filter((p) => {
    const state = getEligibility(p);
    return state === "benchmark_missing" || state === "benchmark_stale";
  });
  const cappedRefreshCandidates = refreshCandidates.slice(
    0,
    MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD
  );

  return {
    fresh,
    staleOrMissing,
    refreshCandidates,
    cappedRefreshCandidates,
  };
}

/** Sort fresh properties by rent vs market delta ascending (most below market first). */
export function sortFreshByBenchmarkPct(
  fresh: BenchmarkDashboardPropertyInput[]
): BenchmarkDashboardPropertyInput[] {
  return [...fresh].sort((a, b) => {
    const marketA = a.marketRent != null && a.marketRent > 0 ? a.marketRent : 0;
    const marketB = b.marketRent != null && b.marketRent > 0 ? b.marketRent : 0;
    return getBenchmarkPct(a.userRent, marketA) - getBenchmarkPct(b.userRent, marketB);
  });
}
