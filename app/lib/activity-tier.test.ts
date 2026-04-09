import { describe, expect, it } from "vitest";
import { getActivityTier } from "@/lib/activity-tier";

describe("getActivityTier", () => {
  const now = new Date("2026-04-08T12:00:00.000Z");

  it("uses lastActiveAt when present", () => {
    expect(getActivityTier(new Date("2026-04-01T00:00:00.000Z"), new Date("2024-01-01"), now)).toBe("active");
  });

  it("falls back to createdAt when lastActiveAt is null", () => {
    expect(getActivityTier(null, new Date("2026-03-25T00:00:00.000Z"), now)).toBe("active");
  });

  it("handles exact boundaries", () => {
    expect(getActivityTier(new Date("2026-03-09T12:00:00.000Z"), new Date("2025-01-01"), now)).toBe("active"); // 30
    expect(getActivityTier(new Date("2026-03-08T12:00:00.000Z"), new Date("2025-01-01"), now)).toBe("cooling"); // 31
    expect(getActivityTier(new Date("2026-01-08T12:00:00.000Z"), new Date("2025-01-01"), now)).toBe("cooling"); // 90
    expect(getActivityTier(new Date("2026-01-07T12:00:00.000Z"), new Date("2025-01-01"), now)).toBe("dormant"); // 91
    expect(getActivityTier(new Date("2025-10-10T12:00:00.000Z"), new Date("2025-01-01"), now)).toBe("dormant"); // 180
    expect(getActivityTier(new Date("2025-10-09T12:00:00.000Z"), new Date("2025-01-01"), now)).toBe("cold"); // 181
    expect(getActivityTier(new Date("2025-04-08T12:00:00.000Z"), new Date("2025-01-01"), now)).toBe("cold"); // 365
    expect(getActivityTier(new Date("2025-04-07T12:00:00.000Z"), new Date("2025-01-01"), now)).toBe("gone"); // 366
  });
});
