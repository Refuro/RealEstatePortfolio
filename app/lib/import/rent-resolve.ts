/**
 * CSV import rent semantics (must match POST /api/properties behavior).
 *
 * **Precedence:** If `unitRents` has exactly `units` non-negative values (and at least one > 0 when rented),
 * those values win and `rent` is ignored for the total (total = sum(unitRents)).
 * Otherwise the `rent` column drives `currentMonthlyRent` and per-unit splits follow property type
 * (single-unit types → one value; multi-unit → equal split across `units`).
 */
export function resolveImportRentForCreate(input: {
  isRented: boolean;
  propertyType: string;
  units: number;
  rentFromColumn: number | null;
  unitRentsFromColumn: number[] | null;
}): { currentMonthlyRent: number; unitRents: number[] | null } {
  if (!input.isRented) {
    return { currentMonthlyRent: 0, unitRents: null };
  }

  const units = Math.max(1, input.units);
  const ur = input.unitRentsFromColumn;
  const validLength = ur != null && ur.length === units;
  const validValues =
    validLength && ur!.every((n) => Number.isFinite(n) && n >= 0);
  const hasPositive = validLength && ur!.some((n) => n > 0);

  if (validValues && hasPositive) {
    const sum = ur!.reduce((a, b) => a + b, 0);
    return { currentMonthlyRent: sum, unitRents: ur! };
  }

  const total = input.rentFromColumn != null && input.rentFromColumn >= 0 ? input.rentFromColumn : 0;
  const singleUnitTypes = ["single_family", "condo", "townhouse", "manufactured"];
  if (singleUnitTypes.includes(input.propertyType)) {
    return { currentMonthlyRent: total, unitRents: [total] };
  }
  const perUnit = units > 0 ? Math.round((total / units) * 100) / 100 : 0;
  return {
    currentMonthlyRent: total,
    unitRents: Array(units).fill(perUnit),
  };
}
