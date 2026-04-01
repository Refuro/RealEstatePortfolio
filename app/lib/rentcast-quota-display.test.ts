import { describe, expect, it } from "vitest";
import { shouldShowRentCastQuotaHint } from "./rentcast-quota-display";

describe("shouldShowRentCastQuotaHint", () => {
  it("returns false for invalid limit", () => {
    expect(shouldShowRentCastQuotaHint(5, 0)).toBe(false);
  });

  it("always shows when exhausted", () => {
    expect(shouldShowRentCastQuotaHint(0, 20)).toBe(true);
    expect(shouldShowRentCastQuotaHint(0, 5)).toBe(true);
  });

  it("shows when remaining is within threshold for limit 20 (25% => 5)", () => {
    expect(shouldShowRentCastQuotaHint(5, 20)).toBe(true);
    expect(shouldShowRentCastQuotaHint(4, 20)).toBe(true);
    expect(shouldShowRentCastQuotaHint(6, 20)).toBe(false);
  });

  it("uses at least threshold 2 for small limits", () => {
    expect(shouldShowRentCastQuotaHint(2, 5)).toBe(true);
    expect(shouldShowRentCastQuotaHint(3, 5)).toBe(false);
  });

  it("shows for limit 10 when remaining <= 3 (ceil 2.5)", () => {
    expect(shouldShowRentCastQuotaHint(3, 10)).toBe(true);
    expect(shouldShowRentCastQuotaHint(4, 10)).toBe(false);
  });
});
