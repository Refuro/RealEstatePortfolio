import { describe, expect, it } from "vitest";
import {
  MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD,
  computeBenchmarkDashboardPartition,
  sortFreshByBenchmarkPct,
  type BenchmarkDashboardPropertyInput,
} from "./benchmark-dashboard-utils";

function staleProperty(
  id: string,
  overrides: Partial<BenchmarkDashboardPropertyInput> = {}
): BenchmarkDashboardPropertyInput {
  return {
    id,
    isRented: true,
    userRent: 2000,
    marketRent: 1900,
    marketRentAsOf: "2020-01-01",
    ...overrides,
  };
}

describe("benchmark-dashboard-utils", () => {
  it("caps refresh candidates at MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD", () => {
    const many = Array.from({ length: 10 }, (_, i) =>
      staleProperty(`p${i}`, { userRent: 1000 + i })
    );
    const { refreshCandidates, cappedRefreshCandidates } =
      computeBenchmarkDashboardPartition(many);
    expect(refreshCandidates.length).toBe(10);
    expect(cappedRefreshCandidates.length).toBe(MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD);
    expect(cappedRefreshCandidates.map((p) => p.id)).toEqual(["p0", "p1", "p2"]);
  });

  it("does not include not_rented or rent_missing in refresh candidates", () => {
    const { refreshCandidates } = computeBenchmarkDashboardPartition([
      { id: "a", isRented: false, userRent: 2000, marketRent: 2000, marketRentAsOf: "2025-01-01" },
      { id: "b", isRented: true, userRent: 0, marketRent: 2000, marketRentAsOf: "2025-01-01" },
      staleProperty("c"),
    ]);
    expect(refreshCandidates.map((p) => p.id)).toEqual(["c"]);
  });

  it("sortFreshByBenchmarkPct orders by delta ascending", () => {
    const fresh: BenchmarkDashboardPropertyInput[] = [
      { id: "high", isRented: true, userRent: 3000, marketRent: 2000, marketRentAsOf: "2025-06-01" },
      { id: "low", isRented: true, userRent: 1500, marketRent: 2000, marketRentAsOf: "2025-06-01" },
    ];
    const sorted = sortFreshByBenchmarkPct(fresh);
    expect(sorted.map((p) => p.id)).toEqual(["low", "high"]);
  });
});
