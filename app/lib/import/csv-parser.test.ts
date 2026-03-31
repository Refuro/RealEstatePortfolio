import { describe, expect, it } from "vitest";
import {
  getCol,
  normalizePropertyTypeFromCsv,
  parseAddressFromCombined,
  parseDate,
  parseNum,
  parseRow,
  PROPERTY_TYPE_MAP,
} from "./csv-parser";
import { resolveImportRentForCreate } from "./rent-resolve";

describe("parseDate / parseNum / getCol", () => {
  it("parses ISO and US dates", () => {
    const iso = parseDate("2020-06-15");
    expect(iso?.getFullYear()).toBe(2020);
    expect(iso?.getMonth()).toBe(5);
    const us = parseDate("6/15/2020");
    expect(us?.getFullYear()).toBe(2020);
  });

  it("parses numbers with commas", () => {
    expect(parseNum("1,250.50")).toBe(1250.5);
    expect(parseNum("")).toBeNull();
  });

  it("getCol matches case-insensitive headers", () => {
    expect(getCol({ PurchasePrice: "100" }, "purchase price", "purchasePrice")).toBe("100");
  });
});

describe("parseAddressFromCombined", () => {
  it("parses street, city, state, zip", () => {
    const p = parseAddressFromCombined("123 Main St, Austin, TX, 78701");
    expect(p).toEqual({
      addressLine1: "123 Main St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
    });
  });

  it("returns null for bad zip or state", () => {
    expect(parseAddressFromCombined("A, B, XX, 78701")).toBeNull();
    expect(parseAddressFromCombined("A, B, TX, bad")).toBeNull();
  });
});

describe("PROPERTY_TYPE_MAP", () => {
  it("normalizes common labels", () => {
    expect(PROPERTY_TYPE_MAP["multi family"]).toBe("multi_family");
    expect(PROPERTY_TYPE_MAP.condo).toBe("condo");
  });
});

describe("normalizePropertyTypeFromCsv", () => {
  it("passes through canonical enum strings", () => {
    expect(normalizePropertyTypeFromCsv("apartment")).toBe("apartment");
    expect(normalizePropertyTypeFromCsv("single_family")).toBe("single_family");
  });
});

describe("parseRow", () => {
  const minimalRow: Record<string, string> = {
    address: "100 Oak Ln",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    "purchase price": "200000",
    "purchase date": "2020-01-15",
    value: "250000",
    rent: "2000",
    expenses: "500",
  };

  it("parses a valid separated-column row", () => {
    const r = parseRow(minimalRow, 2);
    expect("error" in r).toBe(false);
    if ("data" in r) {
      expect(r.data.city).toBe("Austin");
      expect(r.data.currentMonthlyRent).toBe(2000);
      expect(r.data.vacancyPercent).toBe(5);
      expect(r.data.ownershipPercent).toBe(100);
    }
  });

  it("parses address line 2 from dedicated column", () => {
    const r = parseRow(
      {
        ...minimalRow,
        addressLine2: "Unit 4B",
      },
      2
    );
    expect("error" in r).toBe(false);
    if ("data" in r) {
      expect(r.data.addressLine2).toBe("Unit 4B");
    }
  });

  it("returns error when address is missing", () => {
    const r = parseRow({ ...minimalRow, address: "" }, 3);
    expect("error" in r).toBe(true);
  });

  it("rejects single-family with units > 1", () => {
    const r = parseRow(
      {
        ...minimalRow,
        "property type": "single family",
        units: "2",
      },
      4
    );
    expect("error" in r).toBe(true);
  });

  it("parses is rented no and zero rent", () => {
    const r = parseRow(
      {
        ...minimalRow,
        rent: "0",
        "is rented": "no",
      },
      4
    );
    expect("error" in r).toBe(false);
    if ("data" in r) {
      expect(r.data.isRented).toBe(false);
      expect(r.data.currentMonthlyRent).toBe(0);
    }
  });
});

describe("resolveImportRentForCreate (re-exported behavior)", () => {
  it("prefers unit rents over rent when both present", () => {
    const out = resolveImportRentForCreate({
      isRented: true,
      propertyType: "single_family",
      units: 1,
      rentFromColumn: 5000,
      unitRentsFromColumn: [1200],
    });
    expect(out.currentMonthlyRent).toBe(1200);
    expect(out.unitRents).toEqual([1200]);
  });
});
