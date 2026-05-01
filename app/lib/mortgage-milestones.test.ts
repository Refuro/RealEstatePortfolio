import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectNewMortgageMilestonesForProperty,
  detectNewMortgageMilestonesForUser,
  seedLtvSentinelsForProperty,
  seedPayoffSentinelForMortgage,
  type MilestoneProperty,
} from "@/lib/mortgage-milestones";

function buildProperty(overrides?: Partial<MilestoneProperty>): MilestoneProperty {
  return {
    id: "prop_123456",
    nickname: "Pine Cottage",
    currentEstimatedValue: 400_000,
    mortgages: [
      {
        id: "mort_1",
        originalLoanAmount: 350_000,
        currentBalance: 180_000,
        interestRate: 0.06,
        termYears: 30,
        startDate: new Date("2020-01-01"),
        monthlyPayment: 2_100,
        balanceAsOfDate: new Date("2026-04-01"),
      },
    ],
    ...overrides,
  };
}

describe("mortgage milestones", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("emits LTV milestones when threshold is crossed, lowest as visible and higher as silent", () => {
    const property = buildProperty({
      currentEstimatedValue: 500_000, // ltv = 180000/500000 = 36%
    });
    const milestones = detectNewMortgageMilestonesForProperty({
      property,
      sentinels: {},
    });

    const keys = milestones.map((m) => m.key);
    expect(keys).toContain("prop_123456__ltv_75");
    expect(keys).toContain("prop_123456__ltv_50");
    expect(keys).not.toContain("prop_123456__ltv_25");

    expect(milestones.find((m) => m.key === "prop_123456__ltv_50")?.silent).toBeUndefined();
    expect(milestones.find((m) => m.key === "prop_123456__ltv_75")?.silent).toBe(true);
  });

  it("emits only the 25% threshold as visible when LTV is below all three", () => {
    const property = buildProperty({
      currentEstimatedValue: 2_500_000, // ltv = 180000/2500000 = 7.2%
    });
    const milestones = detectNewMortgageMilestonesForProperty({
      property,
      sentinels: {},
    });

    expect(milestones.find((m) => m.key === "prop_123456__ltv_25")?.silent).toBeUndefined();
    expect(milestones.find((m) => m.key === "prop_123456__ltv_50")?.silent).toBe(true);
    expect(milestones.find((m) => m.key === "prop_123456__ltv_75")?.silent).toBe(true);
  });

  it("emits only one visible milestone when exactly one threshold is crossed", () => {
    const property = buildProperty({
      currentEstimatedValue: 260_000, // ltv = 180000/260000 ≈ 69.2% — only crosses 75%
    });
    const milestones = detectNewMortgageMilestonesForProperty({
      property,
      sentinels: {},
    });

    expect(milestones.map((m) => m.key)).toContain("prop_123456__ltv_75");
    expect(milestones.map((m) => m.key)).not.toContain("prop_123456__ltv_50");
    expect(milestones.find((m) => m.key === "prop_123456__ltv_75")?.silent).toBeUndefined();
  });

  it("does not emit milestones already present in sentinel map", () => {
    const property = buildProperty({
      currentEstimatedValue: 500_000,
    });
    const milestones = detectNewMortgageMilestonesForProperty({
      property,
      sentinels: {
        prop_123456__ltv_75: "2026-03-01T00:00:00.000Z",
      },
    });

    expect(milestones.map((m) => m.key)).not.toContain("prop_123456__ltv_75");
    expect(milestones.map((m) => m.key)).toContain("prop_123456__ltv_50");
  });

  it("emits payoff milestone when mortgage is projected to pay off within 5 years", () => {
    const property = buildProperty({
      mortgages: [
        {
          id: "mort_soon",
          originalLoanAmount: 120_000,
          currentBalance: 12_000,
          interestRate: 0.05,
          termYears: 30,
          startDate: new Date("2020-01-01"),
          monthlyPayment: 2_000,
          balanceAsOfDate: new Date("2026-04-01"),
        },
      ],
    });
    const milestones = detectNewMortgageMilestonesForProperty({
      property,
      sentinels: {},
    });

    expect(milestones.some((m) => m.key === "prop_123456__mort_soon__payoff_5yr")).toBe(true);
  });

  it("handles user-level aggregation across properties", () => {
    const milestones = detectNewMortgageMilestonesForUser({
      properties: [
        buildProperty({ id: "prop_a", nickname: "A", currentEstimatedValue: 500_000 }),
        buildProperty({ id: "prop_b", nickname: null, currentEstimatedValue: 500_000 }),
      ],
      sentinels: {},
    });

    expect(milestones.some((m) => m.propertyId === "prop_a")).toBe(true);
    expect(milestones.some((m) => m.propertyId === "prop_b")).toBe(true);
  });
});

describe("seedLtvSentinelsForProperty", () => {
  it("seeds all thresholds below the current LTV", () => {
    const seeds = seedLtvSentinelsForProperty("prop_abc", 7.2, {}, "2026-05-01T00:00:00.000Z");
    expect(seeds["prop_abc__ltv_25"]).toBe("2026-05-01T00:00:00.000Z");
    expect(seeds["prop_abc__ltv_50"]).toBe("2026-05-01T00:00:00.000Z");
    expect(seeds["prop_abc__ltv_75"]).toBe("2026-05-01T00:00:00.000Z");
  });

  it("seeds only the thresholds below current LTV", () => {
    const seeds = seedLtvSentinelsForProperty("prop_abc", 60, {}, "2026-05-01T00:00:00.000Z");
    expect(seeds["prop_abc__ltv_75"]).toBe("2026-05-01T00:00:00.000Z");
    expect(seeds["prop_abc__ltv_50"]).toBeUndefined();
    expect(seeds["prop_abc__ltv_25"]).toBeUndefined();
  });

  it("skips thresholds already in the sentinel map", () => {
    const existing = { "prop_abc__ltv_75": "2026-04-01T00:00:00.000Z" };
    const seeds = seedLtvSentinelsForProperty("prop_abc", 7.2, existing, "2026-05-01T00:00:00.000Z");
    expect(seeds["prop_abc__ltv_75"]).toBeUndefined();
    expect(seeds["prop_abc__ltv_50"]).toBe("2026-05-01T00:00:00.000Z");
    expect(seeds["prop_abc__ltv_25"]).toBe("2026-05-01T00:00:00.000Z");
  });

  it("returns empty object when LTV is above all thresholds", () => {
    const seeds = seedLtvSentinelsForProperty("prop_abc", 90, {}, "2026-05-01T00:00:00.000Z");
    expect(Object.keys(seeds)).toHaveLength(0);
  });
});

describe("seedPayoffSentinelForMortgage", () => {
  const nowIso = "2026-05-01T00:00:00.000Z";

  const nearPayoffMortgage = {
    originalLoanAmount: 120_000,
    currentBalance: 8_000,
    interestRate: 0.05,
    termYears: 30,
    startDate: new Date("2020-01-01"),
    monthlyPayment: 2_000,
    balanceAsOfDate: new Date("2026-04-01"),
  };

  const farPayoffMortgage = {
    originalLoanAmount: 350_000,
    currentBalance: 300_000,
    interestRate: 0.06,
    termYears: 30,
    startDate: new Date("2020-01-01"),
    monthlyPayment: 2_100,
    balanceAsOfDate: new Date("2026-04-01"),
  };

  it("seeds the payoff sentinel when payoff is within 5 years", () => {
    const seeds = seedPayoffSentinelForMortgage(
      "prop_abc",
      "mort_1",
      nearPayoffMortgage,
      {},
      nowIso
    );
    expect(seeds["prop_abc__mort_1__payoff_5yr"]).toBe(nowIso);
  });

  it("returns empty object when payoff is beyond 5 years", () => {
    const seeds = seedPayoffSentinelForMortgage(
      "prop_abc",
      "mort_1",
      farPayoffMortgage,
      {},
      nowIso
    );
    expect(Object.keys(seeds)).toHaveLength(0);
  });

  it("returns empty object when sentinel is already set", () => {
    const existing = { "prop_abc__mort_1__payoff_5yr": "2026-04-01T00:00:00.000Z" };
    const seeds = seedPayoffSentinelForMortgage(
      "prop_abc",
      "mort_1",
      nearPayoffMortgage,
      existing,
      nowIso
    );
    expect(Object.keys(seeds)).toHaveLength(0);
  });
});
