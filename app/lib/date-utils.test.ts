import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatTimeAgo, isDataStale } from "./date-utils";

describe("formatTimeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns buckets for recent past", () => {
    const now = new Date("2025-06-15T12:00:00.000Z");
    expect(formatTimeAgo(new Date(now.getTime() - 30_000))).toBe("just now");
    expect(formatTimeAgo(new Date(now.getTime() - 30 * 60_000))).toMatch(/minute/);
    expect(formatTimeAgo(new Date(now.getTime() - 3 * 60 * 60_000))).toMatch(/hour/);
    expect(formatTimeAgo(new Date(now.getTime() - 24 * 60 * 60_000))).toBe("yesterday");
    expect(formatTimeAgo(new Date(now.getTime() - 5 * 24 * 60 * 60_000))).toMatch(/days ago/);
  });

  it("returns months for older dates", () => {
    expect(formatTimeAgo(new Date("2025-04-15T12:00:00Z"))).toMatch(/month/);
  });
});

describe("isDataStale", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-06-15T12:00:00.000Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("is true when date is more than 180 days before now", () => {
    expect(isDataStale(new Date("2024-01-01"))).toBe(true);
  });

  it("is false for recent dates", () => {
    expect(isDataStale(new Date("2025-05-01"))).toBe(false);
  });
});
