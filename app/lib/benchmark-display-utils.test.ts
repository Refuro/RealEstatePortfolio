import { describe, expect, it } from "vitest";
import { getBenchmarkDisplayModel } from "./benchmark-display-utils";

const NOW_MS = new Date("2025-06-15T12:00:00.000Z").getTime();

describe("benchmark-display-utils", () => {
  it("returns hidden state when property is not rented", () => {
    expect(
      getBenchmarkDisplayModel({
        isRented: false,
        userRent: 2200,
        marketRent: 2000,
        marketRentAsOf: "2025-06-10",
        nowMs: NOW_MS,
      })
    ).toEqual({
      kind: "hidden",
      message: "Not currently rented - benchmark hidden",
      showQuotaHint: false,
      showRefreshButton: false,
    });
  });

  it("returns hidden state when rent is missing", () => {
    expect(
      getBenchmarkDisplayModel({
        isRented: true,
        userRent: 0,
        marketRent: 2000,
        marketRentAsOf: "2025-06-10",
        nowMs: NOW_MS,
      })
    ).toEqual({
      kind: "hidden",
      message: "Add rent to compare to market",
      showQuotaHint: false,
      showRefreshButton: false,
    });
  });

  it("returns refreshable state when benchmark is missing", () => {
    expect(
      getBenchmarkDisplayModel({
        isRented: true,
        userRent: 2200,
        marketRent: null,
        marketRentAsOf: null,
        nowMs: NOW_MS,
      })
    ).toEqual({
      kind: "refreshable",
      staleSummary: null,
      showQuotaHint: true,
      showRefreshButton: true,
    });
  });

  it("returns refreshable state with stale summary when benchmark is stale", () => {
    expect(
      getBenchmarkDisplayModel({
        isRented: true,
        userRent: 2200,
        marketRent: 2000,
        marketRentAsOf: "2025-01-01",
        nowMs: NOW_MS,
      })
    ).toEqual({
      kind: "refreshable",
      staleSummary: "Market: $2,000 · Updated 165 days ago",
      showQuotaHint: true,
      showRefreshButton: true,
    });
  });

  it("returns eligible state when comparison is fresh", () => {
    expect(
      getBenchmarkDisplayModel({
        isRented: true,
        userRent: 2200,
        marketRent: 2000,
        marketRentAsOf: "2025-06-10",
        nowMs: NOW_MS,
      })
    ).toEqual({
      kind: "eligible",
      message: "Market: $2,000 (10.0% above market)",
      showQuotaHint: false,
      showRefreshButton: false,
    });
  });

  it("returns pending_time only for time-sensitive states before hydration", () => {
    expect(
      getBenchmarkDisplayModel({
        isRented: true,
        userRent: 2200,
        marketRent: 2000,
        marketRentAsOf: "2025-06-10",
        nowMs: null,
      })
    ).toEqual({
      kind: "pending_time",
      showQuotaHint: false,
      showRefreshButton: false,
    });
  });
});
