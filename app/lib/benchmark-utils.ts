/**
 * Utilities for rent vs. market benchmark display.
 */

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

/** Returns true if marketRentAsOf is within 60 days of now. */
export function isBenchmarkFresh(marketRentAsOf: Date | string | null): boolean {
  if (!marketRentAsOf) return false;
  const asOfDate = marketRentAsOf instanceof Date ? marketRentAsOf : new Date(marketRentAsOf);
  return Date.now() - asOfDate.getTime() < SIXTY_DAYS_MS;
}

/** Returns days since marketRentAsOf. */
export function getBenchmarkDaysAgo(marketRentAsOf: Date | string | null): number {
  if (!marketRentAsOf) return 0;
  const asOfDate = marketRentAsOf instanceof Date ? marketRentAsOf : new Date(marketRentAsOf);
  return Math.floor((Date.now() - asOfDate.getTime()) / (24 * 60 * 60 * 1000));
}

/** Returns (userRent - marketRent) / marketRent * 100. */
export function getBenchmarkPct(userRent: number, marketRent: number): number {
  if (marketRent <= 0) return 0;
  return ((userRent - marketRent) / marketRent) * 100;
}

/** Returns display label: "Rent X% below market" | "Rent X% above market" | "Rent at market". */
export function getBenchmarkLabel(userRent: number, marketRent: number): string {
  const pct = getBenchmarkPct(userRent, marketRent);
  const absPct = Math.abs(pct);
  if (absPct < 1) return "Rent at market";
  if (pct >= 0) return `Rent ${pct.toFixed(1)}% above market`;
  return `Rent ${Math.abs(pct).toFixed(1)}% below market`;
}
