/**
 * Appreciation rate resolver.
 *
 * Returns annual appreciation $ per property, used by the `total_return` insight.
 * Tiered fallback per discussion doc decision #2:
 *
 *   1. Trailing 12mo snapshot delta — if ≥12mo of monthly snapshots exist
 *   2. Purchase → current value, annualized — if held >12mo
 *   3. Constant 3%/yr × current value — fallback
 *
 * Returns annual dollars (not a rate) plus a `source` tag so UI can vary
 * tooltip copy. Returns null if appreciation cannot be defended even by tier 3
 * (e.g., property created with no current value).
 *
 * The total_return generator gates on the result being POSITIVE; this resolver
 * does not — it returns the honest signal, which can be negative for properties
 * whose value has fallen since purchase.
 */

import type {
  AppreciationSource,
  InsightsContextAppreciation,
  InsightsContextProperty,
  InsightsContextSnapshot,
} from "./types";

/** Long-term US nominal average is 3–4%; 3% is the conservative anchor. */
export const DEFAULT_APPRECIATION_RATE = 0.03;

/** Minimum hold time before purchase-delta tier is meaningful. */
const MIN_HOLD_FOR_PURCHASE_DELTA_DAYS = 365;

/** Minimum snapshot history (in distinct months) before snapshot tier is used. */
const MIN_SNAPSHOT_HISTORY_MONTHS = 12;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysHeld(purchaseDate: Date, asOfMs: number): number {
  return Math.floor((asOfMs - purchaseDate.getTime()) / MS_PER_DAY);
}

function monthsBetween(earlier: Date, later: Date): number {
  const years = later.getUTCFullYear() - earlier.getUTCFullYear();
  const months = later.getUTCMonth() - earlier.getUTCMonth();
  return years * 12 + months;
}

/**
 * Trailing-12mo snapshot tier. Uses the oldest and newest snapshots that bracket
 * a 12-month-or-longer span. Returns annual dollars (delta over span × 12 / span_months).
 */
function tierSnapshot(
  property: InsightsContextProperty,
  snapshots: InsightsContextSnapshot[]
): { annualDollars: number } | null {
  const propertySnaps = snapshots
    .filter((s) => s.propertyId === property.id)
    .sort((a, b) => a.snapshotMonth.getTime() - b.snapshotMonth.getTime());

  if (propertySnaps.length < 2) return null;

  const newest = propertySnaps[propertySnaps.length - 1]!;
  const oldest = propertySnaps[0]!;
  const span = monthsBetween(oldest.snapshotMonth, newest.snapshotMonth);

  if (span < MIN_SNAPSHOT_HISTORY_MONTHS) return null;

  const valueDelta = newest.estimatedValue - oldest.estimatedValue;
  const annualDollars = (valueDelta * 12) / span;
  return { annualDollars };
}

/**
 * Purchase-delta tier. Annualizes (currentValue - purchasePrice) over years held.
 * Skipped if held < 12 months (annualizing a sub-year delta amplifies noise).
 */
function tierPurchaseDelta(
  property: InsightsContextProperty,
  asOfMs: number
): { annualDollars: number } | null {
  const days = daysHeld(property.purchaseDate, asOfMs);
  if (days < MIN_HOLD_FOR_PURCHASE_DELTA_DAYS) return null;

  const years = days / 365;
  const valueDelta = property.currentEstimatedValue - property.purchasePrice;
  const annualDollars = valueDelta / years;
  return { annualDollars };
}

/**
 * Constant tier. 3% of current estimated value, annualized.
 * Fires whenever the property has a positive estimated value.
 */
function tierConstant(
  property: InsightsContextProperty
): { annualDollars: number } | null {
  if (property.currentEstimatedValue <= 0) return null;
  return { annualDollars: property.currentEstimatedValue * DEFAULT_APPRECIATION_RATE };
}

/**
 * Resolve the appreciation $/yr for a single property.
 *
 * @param property the property to evaluate
 * @param snapshots all snapshots for this property (or for the portfolio — we filter)
 * @param nowMs current time in ms (parameterized for testability)
 */
export function resolveAppreciationForProperty(
  property: InsightsContextProperty,
  snapshots: InsightsContextSnapshot[],
  nowMs: number = Date.now()
): InsightsContextAppreciation | null {
  const snap = tierSnapshot(property, snapshots);
  if (snap) {
    return { annualDollars: snap.annualDollars, source: "snapshot_derived" };
  }
  const purchase = tierPurchaseDelta(property, nowMs);
  if (purchase) {
    return { annualDollars: purchase.annualDollars, source: "purchase_delta" };
  }
  const constant = tierConstant(property);
  if (constant) {
    return { annualDollars: constant.annualDollars, source: "default" };
  }
  return null;
}

/**
 * Resolve appreciation for every property in a list, returning the keyed map
 * shape that `InsightsContext.appreciationByPropertyId` expects.
 *
 * Properties whose appreciation cannot be resolved are simply absent from the
 * map (not present with null) — generators that need appreciation should treat
 * absence as "skip this property."
 */
export function resolveAppreciationMap(
  properties: InsightsContextProperty[],
  snapshots: InsightsContextSnapshot[],
  nowMs: number = Date.now()
): Record<string, InsightsContextAppreciation> {
  const result: Record<string, InsightsContextAppreciation> = {};
  for (const property of properties) {
    const resolved = resolveAppreciationForProperty(property, snapshots, nowMs);
    if (resolved) {
      result[property.id] = resolved;
    }
  }
  return result;
}

/** Exported for tests. */
export const __INTERNAL = {
  MIN_HOLD_FOR_PURCHASE_DELTA_DAYS,
  MIN_SNAPSHOT_HISTORY_MONTHS,
  daysHeld,
  monthsBetween,
};

// Type re-export for convenience.
export type { AppreciationSource };
