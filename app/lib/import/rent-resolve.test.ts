import { describe, expect, it } from "vitest";
import { resolveImportRentForCreate } from "./rent-resolve";

describe("resolveImportRentForCreate", () => {
  it("uses unit rents when length matches units (precedence over rent column)", () => {
    const r = resolveImportRentForCreate({
      isRented: true,
      propertyType: "multi_family",
      units: 2,
      rentFromColumn: 9999,
      unitRentsFromColumn: [1500, 1600],
    });
    expect(r.currentMonthlyRent).toBe(3100);
    expect(r.unitRents).toEqual([1500, 1600]);
  });

  it("uses rent column when unit rents invalid length", () => {
    const r = resolveImportRentForCreate({
      isRented: true,
      propertyType: "multi_family",
      units: 2,
      rentFromColumn: 4000,
      unitRentsFromColumn: [2000],
    });
    expect(r.currentMonthlyRent).toBe(4000);
    expect(r.unitRents).toEqual([2000, 2000]);
  });

  it("clears rent when not rented", () => {
    const r = resolveImportRentForCreate({
      isRented: false,
      propertyType: "single_family",
      units: 1,
      rentFromColumn: 2000,
      unitRentsFromColumn: [2000],
    });
    expect(r.currentMonthlyRent).toBe(0);
    expect(r.unitRents).toBeNull();
  });
});
