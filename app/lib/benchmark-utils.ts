/**
 * Utilities for rent vs. market benchmark display (benchmarking v2 contract).
 *
 * **Single contract:** Use {@link getBenchmarkEligibility}, {@link isBenchmarkComparable}, and
 * {@link shouldOfferBenchmarkRefresh} for dashboard, properties list, and property detail so
 * comparison vs non-comparison vs refresh affordances stay aligned.
 *
 * **Freshness:** `isBenchmarkFresh` is true only when `now - marketRentAsOf` is strictly less than
 * {@link BENCHMARK_FRESHNESS_MAX_MS}. An as-of timestamp exactly 60×24h old is **not** fresh (stale).
 */

/** 60-day window; exclusive upper bound: at exactly this age, benchmark is stale. */
export const BENCHMARK_FRESHNESS_MAX_MS = 60 * 24 * 60 * 60 * 1000;

export type BenchmarkEligibility =
  | "not_rented"
  | "rent_missing"
  | "benchmark_missing"
  | "benchmark_stale"
  | "eligible_fresh";

function toBenchmarkAsOfDate(marketRentAsOf: Date | string | null): Date | null {
  if (!marketRentAsOf) return null;
  return marketRentAsOf instanceof Date ? marketRentAsOf : new Date(marketRentAsOf);
}

/** Returns true when `marketRentAsOf` is strictly within the 60-day window (see module doc). */
export function isBenchmarkFreshAt(
  marketRentAsOf: Date | string | null,
  nowMs: number
): boolean {
  const asOfDate = toBenchmarkAsOfDate(marketRentAsOf);
  if (!asOfDate) return false;
  return nowMs - asOfDate.getTime() < BENCHMARK_FRESHNESS_MAX_MS;
}

/** Returns true when `marketRentAsOf` is strictly within the 60-day window (see module doc). */
export function isBenchmarkFresh(marketRentAsOf: Date | string | null): boolean {
  return isBenchmarkFreshAt(marketRentAsOf, Date.now());
}

/** Returns days since marketRentAsOf. */
export function getBenchmarkDaysAgoAt(
  marketRentAsOf: Date | string | null,
  nowMs: number
): number {
  const asOfDate = toBenchmarkAsOfDate(marketRentAsOf);
  if (!asOfDate) return 0;
  return Math.floor((nowMs - asOfDate.getTime()) / (24 * 60 * 60 * 1000));
}

/** Returns days since marketRentAsOf. */
export function getBenchmarkDaysAgo(marketRentAsOf: Date | string | null): number {
  return getBenchmarkDaysAgoAt(marketRentAsOf, Date.now());
}

/** Returns (userRent - marketRent) / marketRent * 100. */
export function getBenchmarkPct(userRent: number, marketRent: number): number {
  if (marketRent <= 0) return 0;
  return ((userRent - marketRent) / marketRent) * 100;
}

/** Returns display label: "Rent X% below market" | "Rent X% above market" | "Rent at market". */
export function getBenchmarkLabel(userRent: number, marketRent: number): string {
  const pct = getBenchmarkPct(userRent, marketRent);
  const absPct = Math.abs(pct);
  if (absPct < 1) return "Rent at market";
  if (pct >= 0) return `Rent ${pct.toFixed(1)}% above market`;
  return `Rent ${Math.abs(pct).toFixed(1)}% below market`;
}

/**
 * Determines if a property is eligible for rent-vs-market comparison.
 * Keep this as the single source of truth across dashboard/list/detail surfaces.
 */
export function getBenchmarkEligibilityAt(
  input: {
    isRented: boolean;
    userRent: number;
    marketRent: number | null;
    marketRentAsOf: Date | string | null;
  },
  nowMs: number
): BenchmarkEligibility {
  if (!input.isRented) return "not_rented";
  if (input.userRent <= 0) return "rent_missing";
  if (input.marketRent == null || input.marketRent <= 0) return "benchmark_missing";
  if (!isBenchmarkFreshAt(input.marketRentAsOf, nowMs)) return "benchmark_stale";
  return "eligible_fresh";
}

export function getBenchmarkEligibility(input: {
  isRented: boolean;
  userRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
}): BenchmarkEligibility {
  return getBenchmarkEligibilityAt(input, Date.now());
}

/**
 * True when rent-vs-market percentage comparison is meaningful (rented, positive rent, fresh market data).
 */
export function isBenchmarkComparable(
  input: Parameters<typeof getBenchmarkEligibility>[0]
): boolean {
  return getBenchmarkEligibility(input) === "eligible_fresh";
}

/** @deprecated Use {@link isBenchmarkComparable} (identical behavior). */
export function canShowBenchmarkComparison(
  input: Parameters<typeof getBenchmarkEligibility>[0]
): boolean {
  return isBenchmarkComparable(input);
}

/** True when the UI should offer refreshing market benchmark data (missing or stale). */
export function shouldOfferBenchmarkRefresh(eligibility: BenchmarkEligibility): boolean {
  return eligibility === "benchmark_missing" || eligibility === "benchmark_stale";
}

/** Matches `benchmark-display` and Rent vs. market list copy. */
export const BENCHMARK_UX_MESSAGES = {
  notRented: "Not currently rented - benchmark hidden",
  rentMissing: "Add rent to compare to market",
} as const;
