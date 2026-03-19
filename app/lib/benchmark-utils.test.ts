import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getBenchmarkDaysAgo,
  getBenchmarkLabel,
  getBenchmarkPct,
  isBenchmarkFresh,
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
});
