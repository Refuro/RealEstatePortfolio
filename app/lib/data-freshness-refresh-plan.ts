import {
  getBenchmarkEligibilityAt,
  isBenchmarkFreshAt,
  shouldOfferBenchmarkRefresh,
} from "@/lib/benchmark-utils";

export type DataFreshnessRefreshPlanInput = {
  estimatedValueAsOf: Date | string | null;
  isRented: boolean;
  totalRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
};

export type DataFreshnessRefreshPlan = {
  needsValueRefresh: boolean;
  needsBenchmarkRefresh: boolean;
};

/**
 * Pure guard for property detail “data freshness” refresh: only value AVM and/or rent benchmark
 * when as-of data is missing or outside the same 60-day window as rent benchmark.
 */
export function getDataFreshnessRefreshPlanAt(
  input: DataFreshnessRefreshPlanInput,
  nowMs: number
): DataFreshnessRefreshPlan {
  const eligibility = getBenchmarkEligibilityAt(
    {
      isRented: input.isRented,
      userRent: input.totalRent,
      marketRent: input.marketRent,
      marketRentAsOf: input.marketRentAsOf,
    },
    nowMs
  );

  const needsBenchmarkRefresh = shouldOfferBenchmarkRefresh(eligibility);

  const needsValueRefresh =
    input.estimatedValueAsOf == null ||
    !isBenchmarkFreshAt(input.estimatedValueAsOf, nowMs);

  return { needsValueRefresh, needsBenchmarkRefresh };
}

export function getDataFreshnessRefreshPlan(
  input: DataFreshnessRefreshPlanInput
): DataFreshnessRefreshPlan {
  return getDataFreshnessRefreshPlanAt(input, Date.now());
}
