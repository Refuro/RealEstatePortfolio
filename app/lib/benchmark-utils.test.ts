import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  BENCHMARK_FRESHNESS_MAX_MS,
  getBenchmarkEligibility,
  getBenchmarkDaysAgo,
  getBenchmarkLabel,
  getBenchmarkPct,
  isBenchmarkComparable,
  isBenchmarkFresh,
  shouldOfferBenchmarkRefresh,
} from "./benchmark-utils";

describe("benchmark-utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("isBenchmarkFresh is true when as-of is within 60 days", () => {
    expect(isBenchmarkFresh(new Date("2025-06-10"))).toBe(true);
    expect(isBenchmarkFresh("2025-06-10")).toBe(true);
  });

  it("isBenchmarkFresh is false for null or stale dates", () => {
    expect(isBenchmarkFresh(null)).toBe(false);
    expect(isBenchmarkFresh(new Date("2025-01-01"))).toBe(false);
  });

  it("isBenchmarkFresh uses strict upper bound: exactly BENCHMARK_FRESHNESS_MAX_MS age is stale", () => {
    const now = new Date("2025-06-15T12:00:00.000Z");
    vi.setSystemTime(now);
    const exactlyBoundary = new Date(now.getTime() - BENCHMARK_FRESHNESS_MAX_MS);
    expect(isBenchmarkFresh(exactlyBoundary)).toBe(false);
    const oneMsInside = new Date(now.getTime() - BENCHMARK_FRESHNESS_MAX_MS + 1);
    expect(isBenchmarkFresh(oneMsInside)).toBe(true);
  });

  it("getBenchmarkDaysAgo floors whole days", () => {
    vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
    const days = getBenchmarkDaysAgo(new Date("2025-06-10T12:00:00.000Z"));
    expect(days).toBe(5);
  });

  it("getBenchmarkPct and label handle market rent edge and wording", () => {
    expect(getBenchmarkPct(1000, 0)).toBe(0);
    expect(getBenchmarkPct(1100, 1000)).toBe(10);
    expect(getBenchmarkLabel(1005, 1000)).toBe("Rent at market");
    expect(getBenchmarkLabel(1100, 1000)).toContain("above");
    expect(getBenchmarkLabel(900, 1000)).toContain("below");
  });

  it("returns benchmark eligibility states in expected order", () => {
    expect(
      getBenchmarkEligibility({
        isRented: false,
        userRent: 2200,
        marketRent: 2000,
        marketRentAsOf: "2025-06-10",
      })
    ).toBe("not_rented");
    expect(
      getBenchmarkEligibility({
        isRented: true,
        userRent: 0,
        marketRent: 2000,
        marketRentAsOf: "2025-06-10",
      })
    ).toBe("rent_missing");
    expect(
      getBenchmarkEligibility({
        isRented: true,
        userRent: 2200,
        marketRent: 0,
        marketRentAsOf: "2025-06-10",
      })
    ).toBe("benchmark_missing");
    expect(
      getBenchmarkEligibility({
        isRented: true,
        userRent: 2200,
        marketRent: 2000,
        marketRentAsOf: "2025-01-01",
      })
    ).toBe("benchmark_stale");
    expect(
      getBenchmarkEligibility({
        isRented: true,
        userRent: 2200,
        marketRent: 2000,
        marketRentAsOf: "2025-06-10",
      })
    ).toBe("eligible_fresh");
  });

  it("isBenchmarkComparable matches eligible_fresh only", () => {
    const input = {
      isRented: true,
      userRent: 2200,
      marketRent: 2000,
      marketRentAsOf: "2025-06-10",
    };
    expect(isBenchmarkComparable(input)).toBe(true);
    expect(isBenchmarkComparable({ ...input, isRented: false })).toBe(false);
    expect(isBenchmarkComparable({ ...input, userRent: 0 })).toBe(false);
    expect(isBenchmarkComparable({ ...input, marketRentAsOf: "2025-01-01" })).toBe(false);
  });

  it("shouldOfferBenchmarkRefresh is true only for missing or stale", () => {
    expect(shouldOfferBenchmarkRefresh("benchmark_missing")).toBe(true);
    expect(shouldOfferBenchmarkRefresh("benchmark_stale")).toBe(true);
    expect(shouldOfferBenchmarkRefresh("eligible_fresh")).toBe(false);
    expect(shouldOfferBenchmarkRefresh("not_rented")).toBe(false);
    expect(shouldOfferBenchmarkRefresh("rent_missing")).toBe(false);
  });
});
