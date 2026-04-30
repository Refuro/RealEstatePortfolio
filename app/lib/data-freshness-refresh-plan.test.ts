import { describe, expect, it } from "vitest";
import { BENCHMARK_FRESHNESS_MAX_MS } from "@/lib/benchmark-utils";
import { getDataFreshnessRefreshPlanAt } from "@/lib/data-freshness-refresh-plan";

const NOW = new Date("2026-06-15T12:00:00Z").getTime();

describe("getDataFreshnessRefreshPlanAt", () => {
  it("needs value refresh when estimatedValueAsOf is null", () => {
    const plan = getDataFreshnessRefreshPlanAt(
      {
        estimatedValueAsOf: null,
        isRented: false,
        totalRent: 0,
        marketRent: null,
        marketRentAsOf: null,
      },
      NOW
    );
    expect(plan.needsValueRefresh).toBe(true);
    expect(plan.needsBenchmarkRefresh).toBe(false);
  });

  it("does not need value when as-of is within 60-day window", () => {
    const plan = getDataFreshnessRefreshPlanAt(
      {
        estimatedValueAsOf: new Date(NOW - 10 * 24 * 60 * 60 * 1000),
        isRented: false,
        totalRent: 0,
        marketRent: null,
        marketRentAsOf: null,
      },
      NOW
    );
    expect(plan.needsValueRefresh).toBe(false);
  });

  it("needs value refresh when as-of is older than freshness window", () => {
    const stale = new Date(NOW - BENCHMARK_FRESHNESS_MAX_MS - 24 * 60 * 60 * 1000);
    const plan = getDataFreshnessRefreshPlanAt(
      {
        estimatedValueAsOf: stale,
        isRented: false,
        totalRent: 0,
        marketRent: null,
        marketRentAsOf: null,
      },
      NOW
    );
    expect(plan.needsValueRefresh).toBe(true);
  });

  it("needs benchmark refresh when benchmark_missing", () => {
    const plan = getDataFreshnessRefreshPlanAt(
      {
        estimatedValueAsOf: new Date(NOW),
        isRented: true,
        totalRent: 2000,
        marketRent: null,
        marketRentAsOf: null,
      },
      NOW
    );
    expect(plan.needsValueRefresh).toBe(false);
    expect(plan.needsBenchmarkRefresh).toBe(true);
  });

  it("needs benchmark refresh when benchmark stale", () => {
    const stale = new Date(NOW - BENCHMARK_FRESHNESS_MAX_MS - 24 * 60 * 60 * 1000);
    const plan = getDataFreshnessRefreshPlanAt(
      {
        estimatedValueAsOf: new Date(NOW),
        isRented: true,
        totalRent: 2000,
        marketRent: 1900,
        marketRentAsOf: stale,
      },
      NOW
    );
    expect(plan.needsBenchmarkRefresh).toBe(true);
  });

  it("needs both when value and benchmark are stale", () => {
    const stale = new Date(NOW - BENCHMARK_FRESHNESS_MAX_MS - 24 * 60 * 60 * 1000);
    const plan = getDataFreshnessRefreshPlanAt(
      {
        estimatedValueAsOf: stale,
        isRented: true,
        totalRent: 2000,
        marketRent: 1900,
        marketRentAsOf: stale,
      },
      NOW
    );
    expect(plan.needsValueRefresh).toBe(true);
    expect(plan.needsBenchmarkRefresh).toBe(true);
  });

  it("needs nothing when value and benchmark are fresh", () => {
    const fresh = new Date(NOW - 5 * 24 * 60 * 60 * 1000);
    const plan = getDataFreshnessRefreshPlanAt(
      {
        estimatedValueAsOf: fresh,
        isRented: true,
        totalRent: 2000,
        marketRent: 1900,
        marketRentAsOf: fresh,
      },
      NOW
    );
    expect(plan.needsValueRefresh).toBe(false);
    expect(plan.needsBenchmarkRefresh).toBe(false);
  });
});
