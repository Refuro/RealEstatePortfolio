import { describe, expect, it } from "vitest";
import {
  DEFAULT_APPRECIATION_RATE,
  resolveAppreciationForProperty,
  resolveAppreciationMap,
} from "./appreciation";
import type { InsightsContextProperty, InsightsContextSnapshot } from "./types";

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const NOW_MS = new Date("2026-04-27T00:00:00Z").getTime();

function makeProperty(overrides: Partial<InsightsContextProperty> = {}): InsightsContextProperty {
  return {
    id: "prop_1",
    name: "Test Property",
    addressLine1: "123 Main",
    city: "Portland",
    state: "OR",
    isRented: true,
    purchasePrice: 300_000,
    currentEstimatedValue: 400_000,
    purchaseDate: new Date("2020-01-01T00:00:00Z"), // ~6 years ago
    userRent: 2000,
    marketRent: 2200,
    marketRentAsOf: new Date("2026-03-01T00:00:00Z"),
    monthlyExpenses: 500,
    vacancyPercent: 5,
    ownershipPercent: 100,
    hasMortgage: true,
    totalMortgageBalance: 200_000,
    totalMonthlyPayment: 1500,
    mortgageCount: 1,
    mortgagePaidOff: false,
    cashInvested: 60_000,
    updatedAt: new Date("2026-04-01T00:00:00Z"),
    ...overrides,
  };
}

function makeSnapshot(
  overrides: Partial<InsightsContextSnapshot> = {}
): InsightsContextSnapshot {
  return {
    propertyId: "prop_1",
    snapshotMonth: new Date("2026-04-01T00:00:00Z"),
    estimatedValue: 400_000,
    equity: 200_000,
    monthlyCashFlow: 100,
    ...overrides,
  };
}

// ─── Tier 1: snapshot-derived ─────────────────────────────────────────────────

describe("resolveAppreciationForProperty — snapshot-derived tier", () => {
  it("uses 12mo snapshot delta annualized when ≥12mo of snapshots exist", () => {
    const property = makeProperty();
    const snapshots = [
      makeSnapshot({ snapshotMonth: new Date("2025-04-01"), estimatedValue: 380_000 }),
      makeSnapshot({ snapshotMonth: new Date("2025-10-01"), estimatedValue: 390_000 }),
      makeSnapshot({ snapshotMonth: new Date("2026-04-01"), estimatedValue: 400_000 }),
    ];
    const result = resolveAppreciationForProperty(property, snapshots, NOW_MS);
    expect(result).not.toBeNull();
    expect(result!.source).toBe("snapshot_derived");
    // Span = 12 months, delta = 20k → 20k/yr.
    expect(result!.annualDollars).toBeCloseTo(20_000, 0);
  });

  it("falls through to purchase-delta when snapshots span less than 12 months", () => {
    const property = makeProperty();
    const snapshots = [
      makeSnapshot({ snapshotMonth: new Date("2026-01-01"), estimatedValue: 395_000 }),
      makeSnapshot({ snapshotMonth: new Date("2026-04-01"), estimatedValue: 400_000 }),
    ];
    const result = resolveAppreciationForProperty(property, snapshots, NOW_MS);
    expect(result!.source).toBe("purchase_delta");
  });

  it("returns negative annualDollars when value has fallen — does not gate", () => {
    const property = makeProperty();
    const snapshots = [
      makeSnapshot({ snapshotMonth: new Date("2025-04-01"), estimatedValue: 420_000 }),
      makeSnapshot({ snapshotMonth: new Date("2026-04-01"), estimatedValue: 400_000 }),
    ];
    const result = resolveAppreciationForProperty(property, snapshots, NOW_MS);
    expect(result!.source).toBe("snapshot_derived");
    expect(result!.annualDollars).toBeCloseTo(-20_000, 0);
  });
});

// ─── Tier 2: purchase-delta ──────────────────────────────────────────────────

describe("resolveAppreciationForProperty — purchase-delta tier", () => {
  it("uses purchase-to-current delta annualized when held >12mo and snapshots are insufficient", () => {
    const property = makeProperty({
      purchaseDate: new Date("2024-04-27T00:00:00Z"), // exactly 2 years ago
      purchasePrice: 300_000,
      currentEstimatedValue: 360_000,
    });
    const result = resolveAppreciationForProperty(property, [], NOW_MS);
    expect(result!.source).toBe("purchase_delta");
    // 60k delta over 2 years = 30k/yr.
    expect(result!.annualDollars).toBeCloseTo(30_000, -2); // rounding tolerance
  });

  it("falls through to default when held < 12 months", () => {
    const property = makeProperty({
      purchaseDate: new Date("2026-01-01T00:00:00Z"), // ~4 months ago
      currentEstimatedValue: 400_000,
    });
    const result = resolveAppreciationForProperty(property, [], NOW_MS);
    expect(result!.source).toBe("default");
  });
});

// ─── Tier 3: default constant ────────────────────────────────────────────────

describe("resolveAppreciationForProperty — default constant tier", () => {
  it("uses 3% × current value when no other tier applies", () => {
    const property = makeProperty({
      purchaseDate: new Date("2026-02-01T00:00:00Z"), // <12mo
      currentEstimatedValue: 400_000,
    });
    const result = resolveAppreciationForProperty(property, [], NOW_MS);
    expect(result!.source).toBe("default");
    expect(result!.annualDollars).toBeCloseTo(400_000 * DEFAULT_APPRECIATION_RATE, 0);
  });

  it("returns null when current estimated value is zero", () => {
    const property = makeProperty({
      purchaseDate: new Date("2026-02-01T00:00:00Z"),
      currentEstimatedValue: 0,
    });
    const result = resolveAppreciationForProperty(property, [], NOW_MS);
    expect(result).toBeNull();
  });
});

// ─── resolveAppreciationMap ──────────────────────────────────────────────────

describe("resolveAppreciationMap", () => {
  it("returns map keyed by property id, omits properties that resolve to null", () => {
    const properties = [
      makeProperty({ id: "p1", currentEstimatedValue: 400_000 }),
      makeProperty({
        id: "p2",
        currentEstimatedValue: 0,
        purchaseDate: new Date("2026-02-01"),
      }),
    ];
    const result = resolveAppreciationMap(properties, [], NOW_MS);
    expect(result).toHaveProperty("p1");
    expect(result).not.toHaveProperty("p2");
  });

  it("uses property-specific snapshots — does not leak between properties", () => {
    const properties = [makeProperty({ id: "p1" }), makeProperty({ id: "p2" })];
    const snapshots = [
      // Snapshots only for p1; p2 should fall to purchase-delta or default.
      makeSnapshot({
        propertyId: "p1",
        snapshotMonth: new Date("2025-04-01"),
        estimatedValue: 380_000,
      }),
      makeSnapshot({
        propertyId: "p1",
        snapshotMonth: new Date("2026-04-01"),
        estimatedValue: 400_000,
      }),
    ];
    const result = resolveAppreciationMap(properties, snapshots, NOW_MS);
    expect(result.p1?.source).toBe("snapshot_derived");
    expect(result.p2?.source).toBe("purchase_delta");
  });
});
