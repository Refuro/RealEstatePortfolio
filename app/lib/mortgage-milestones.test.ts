import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectNewMortgageMilestonesForProperty,
  detectNewMortgageMilestonesForUser,
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

  it("emits LTV milestones when threshold is crossed", () => {
    const property = buildProperty({
      currentEstimatedValue: 500_000, // ltv = 36%
    });
    const milestones = detectNewMortgageMilestonesForProperty({
      property,
      sentinels: {},
    });

    expect(milestones.map((m) => m.key)).toContain("prop_123456__ltv_75");
    expect(milestones.map((m) => m.key)).toContain("prop_123456__ltv_50");
    expect(milestones.map((m) => m.key)).not.toContain("prop_123456__ltv_25");
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
