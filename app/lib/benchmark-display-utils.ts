import {
  BENCHMARK_UX_MESSAGES,
  getBenchmarkDaysAgoAt,
  getBenchmarkEligibilityAt,
  getBenchmarkLabel,
} from "@/lib/benchmark-utils";

export type BenchmarkDisplayModel =
  | {
      kind: "hidden";
      message: string;
      showQuotaHint: false;
      showRefreshButton: false;
    }
  | {
      kind: "eligible";
      message: string;
      showQuotaHint: false;
      showRefreshButton: false;
    }
  | {
      kind: "refreshable";
      staleSummary: string | null;
      showQuotaHint: true;
      showRefreshButton: true;
    }
  | {
      kind: "pending_time";
      showQuotaHint: false;
      showRefreshButton: false;
    };

type BenchmarkDisplayInput = {
  isRented: boolean;
  userRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
  nowMs: number | null;
};

/**
 * Centralized view-model for `benchmark-display.tsx` so hidden / refreshable / eligible
 * states follow the shared benchmark contract and can be regression-tested without React.
 */
export function getBenchmarkDisplayModel(
  input: BenchmarkDisplayInput
): BenchmarkDisplayModel {
  if (!input.isRented) {
    return {
      kind: "hidden",
      message: BENCHMARK_UX_MESSAGES.notRented,
      showQuotaHint: false,
      showRefreshButton: false,
    };
  }

  if (input.userRent <= 0) {
    return {
      kind: "hidden",
      message: BENCHMARK_UX_MESSAGES.rentMissing,
      showQuotaHint: false,
      showRefreshButton: false,
    };
  }

  if (input.marketRent == null || input.marketRent <= 0) {
    return {
      kind: "refreshable",
      staleSummary: null,
      showQuotaHint: true,
      showRefreshButton: true,
    };
  }

  if (!input.marketRentAsOf) {
    return {
      kind: "refreshable",
      staleSummary: null,
      showQuotaHint: true,
      showRefreshButton: true,
    };
  }

  if (input.nowMs == null) {
    return {
      kind: "pending_time",
      showQuotaHint: false,
      showRefreshButton: false,
    };
  }

  const eligibility = getBenchmarkEligibilityAt(
    {
      isRented: input.isRented,
      userRent: input.userRent,
      marketRent: input.marketRent,
      marketRentAsOf: input.marketRentAsOf,
    },
    input.nowMs
  );

  if (eligibility === "eligible_fresh") {
    const label = getBenchmarkLabel(input.userRent, input.marketRent).replace(/^Rent /, "");
    const displayLabel = label === "at market" ? "At market" : label;
    return {
      kind: "eligible",
      message: `Market: $${input.marketRent.toLocaleString()} (${displayLabel})`,
      showQuotaHint: false,
      showRefreshButton: false,
    };
  }

  if (eligibility === "benchmark_stale") {
    const daysAgo = getBenchmarkDaysAgoAt(input.marketRentAsOf, input.nowMs);
    return {
      kind: "refreshable",
      staleSummary: `Market: $${input.marketRent.toLocaleString()} · Updated ${daysAgo} days ago`,
      showQuotaHint: true,
      showRefreshButton: true,
    };
  }

  return {
    kind: "refreshable",
    staleSummary: null,
    showQuotaHint: true,
    showRefreshButton: true,
  };
}
