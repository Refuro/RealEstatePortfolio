/**
 * Utilities for property data.
 */

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  single_family: "Single family",
  condo: "Condo",
  townhouse: "Townhouse",
  manufactured: "Manufactured",
  multi_family: "Multi family",
  apartment: "Apartment",
};

export function formatPropertyType(propertyType: string, units?: number): string {
  const label = PROPERTY_TYPE_LABELS[propertyType] ?? propertyType;
  if ((propertyType === "multi_family" || propertyType === "apartment") && units != null && units > 1) {
    return `${label} (${units} units)`;
  }
  return label;
}

export type PropertyWithRent = {
  currentMonthlyRent: { toString(): string } | number;
  unitRents?: unknown;
};

/**
 * Get total monthly rent from a property.
 * When unitRents is present (array of numbers): sum(unitRents).
 * When unitRents is null (existing data): use currentMonthlyRent.
 */
export function getPropertyTotalRent(property: PropertyWithRent): number {
  const unitRents = property.unitRents;
  if (Array.isArray(unitRents) && unitRents.length > 0) {
    const sum = unitRents.reduce((a, b) => a + (typeof b === "number" ? b : Number(b) || 0), 0);
    if (Number.isFinite(sum)) return sum;
  }
  const rent = property.currentMonthlyRent;
  return typeof rent === "number" ? rent : Number(rent);
}
