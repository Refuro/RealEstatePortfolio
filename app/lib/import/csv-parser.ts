import { US_STATES } from "@/lib/us-states";
import { resolveImportRentForCreate } from "@/lib/import/rent-resolve";

export const PROPERTY_TYPE_MAP: Record<string, string> = {
  "single family": "single_family",
  "single-family": "single_family",
  single_family: "single_family",
  "multi family": "multi_family",
  "multi-family": "multi_family",
  multi_family: "multi_family",
  condo: "condo",
  "multi-unit": "multi_family",
  townhouse: "townhouse",
  manufactured: "manufactured",
  apartment: "apartment",
  apt: "apartment",
};

const CANONICAL_TYPES = new Set([
  "single_family",
  "condo",
  "townhouse",
  "manufactured",
  "multi_family",
  "apartment",
]);

/** Normalizes CSV "property type" cell to Prisma enum string (round-trip with export). */
export function normalizePropertyTypeFromCsv(raw: string): string {
  const t = raw.trim();
  if (!t) return "single_family";
  const lower = t.toLowerCase().replace(/\s+/g, " ");
  const underscored = lower.replace(/ /g, "_");
  if (CANONICAL_TYPES.has(underscored)) return underscored;
  return PROPERTY_TYPE_MAP[lower] ?? "single_family";
}

function parseIsRentedCell(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (!s) return true;
  if (["yes", "y", "true", "1", "rented"].includes(s)) return true;
  if (["no", "n", "false", "0", "vacant", "not rented", "not_rented"].includes(s)) {
    return false;
  }
  return true;
}

/** Parses "1,200|1,300" or "1200, 1300" into numbers; length must match `units` to be valid. */
export function parseUnitRentsCell(raw: string, units: number): number[] | null {
  const s = raw.trim();
  if (!s) return null;
  const parts = s.includes("|") ? s.split("|") : s.split(",");
  const nums = parts
    .map((p) => parseNum(p.trim()))
    .filter((n): n is number => n != null && n >= 0);
  if (nums.length !== units) return null;
  return nums;
}

export function parseDate(val: string): Date | null {
  const s = String(val ?? "").trim();
  if (!s) return null;
  // YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const d = new Date(
      parseInt(iso[1], 10),
      parseInt(iso[2], 10) - 1,
      parseInt(iso[3], 10)
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // MM/DD/YYYY
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (us) {
    const d = new Date(
      parseInt(us[3], 10),
      parseInt(us[1], 10) - 1,
      parseInt(us[2], 10)
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function parseNum(val: string): number | null {
  const s = String(val ?? "").replace(/,/g, "").trim();
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

export function getCol(row: Record<string, string>, ...names: string[]): string {
  const lower = (k: string) => k.toLowerCase().trim();
  const keys = Object.keys(row).map(lower);
  for (const name of names) {
    const n = lower(name);
    const idx = keys.indexOf(n);
    if (idx >= 0) {
      const origKey = Object.keys(row)[idx];
      return String(row[origKey] ?? "").trim();
    }
  }
  return "";
}

export function parseAddressFromCombined(
  addr: string
): { addressLine1: string; city: string; state: string; zipCode: string } | null {
  const parts = addr
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 4) return null;
  const zipCode = parts[parts.length - 1];
  const state = parts[parts.length - 2];
  const city = parts[parts.length - 3];
  const addressLine1 = parts.slice(0, -3).join(", ");
  if (!/^\d{5}(-\d{4})?$/.test(zipCode)) return null;
  if (
    !US_STATES.includes(state.toUpperCase() as (typeof US_STATES)[number])
  )
    return null;
  return { addressLine1, city, state: state.toUpperCase(), zipCode };
}

export type ImportRow = {
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  nickname: string | null;
  propertyType: string;
  units: number;
  purchasePrice: number;
  purchaseDate: Date;
  currentEstimatedValue: number;
  currentMonthlyRent: number;
  unitRents: number[] | null;
  currentMonthlyExpenses: number;
  vacancyPercent: number;
  cashInvested: number | null;
  ownershipPercent: number;
  mortgageBalance: number | null;
  balanceAsOfDate: Date | null;
  originalLoanAmount: number | null;
  mortgageRate: number | null;
  mortgageTerm: number | null;
  /** Loan amortization start; when null, import uses `purchaseDate` for mortgage `startDate`. */
  mortgageStartDate: Date | null;
  monthlyPayment: number | null;
  escrowAmount: number | null;
  lenderName: string | null;
  loanType: string | null;
  isRented: boolean;
};

export function parseRow(
  row: Record<string, string>,
  rowNum: number
): { data: ImportRow } | { error: string } {
  const addr = getCol(row, "address", "addressLine1");
  const city = getCol(row, "city");
  const state = getCol(row, "state");
  const zipCode = getCol(row, "zipCode", "zip", "zipCode");

  let addressLine1 = "";
  let parsedCity = "";
  let parsedState = "";
  let parsedZip = "";

  const addressLine2FromCol = getCol(
    row,
    "address line 2",
    "addressLine2",
    "address line2"
  ).trim();

  if (addr && city && state && zipCode) {
    addressLine1 = addr;
    parsedCity = city;
    parsedState = state.toUpperCase();
    parsedZip = zipCode;
  } else if (addr && addr.includes(",")) {
    const parsed = parseAddressFromCombined(addr);
    if (!parsed)
      return {
        error: `Row ${rowNum}: Invalid address format. Use "street, city, state, zip" or separate columns.`,
      };
    addressLine1 = parsed.addressLine1;
    parsedCity = parsed.city;
    parsedState = parsed.state;
    parsedZip = parsed.zipCode;
  } else {
    return {
      error: `Row ${rowNum}: Address required (address or addressLine1, city, state, zipCode).`,
    };
  }

  if (
    !US_STATES.includes(parsedState as (typeof US_STATES)[number])
  ) {
    return {
      error: `Row ${rowNum}: Invalid state. Use 2-letter abbreviation (e.g. TX, CA).`,
    };
  }

  const purchasePrice = parseNum(getCol(row, "purchase price", "purchasePrice"));
  if (purchasePrice == null || purchasePrice < 0)
    return { error: `Row ${rowNum}: Valid purchase price required.` };

  const purchaseDate = parseDate(getCol(row, "purchase date", "purchaseDate"));
  if (!purchaseDate)
    return {
      error: `Row ${rowNum}: Valid purchase date required (YYYY-MM-DD or MM/DD/YYYY).`,
    };

  const currentEstimatedValue = parseNum(
    getCol(row, "value", "currentEstimatedValue")
  );
  if (currentEstimatedValue == null || currentEstimatedValue < 0)
    return { error: `Row ${rowNum}: Valid current value required.` };

  const isRentedRaw = getCol(row, "is rented", "isRented");
  const isRented = parseIsRentedCell(isRentedRaw);

  const ptRaw = getCol(row, "property type", "propertyType");
  const propertyType = normalizePropertyTypeFromCsv(ptRaw);

  const unitsRaw = parseNum(getCol(row, "units"));
  const units =
    unitsRaw != null && unitsRaw >= 1 ? Math.min(999, Math.round(unitsRaw)) : 1;

  const unitRentsRaw = getCol(row, "unit rents", "unitRents");
  const unitRentsParsed = parseUnitRentsCell(unitRentsRaw, units);

  const rent = parseNum(getCol(row, "rent", "currentMonthlyRent"));
  if (isRented && (rent == null || rent < 0) && !unitRentsParsed) {
    return { error: `Row ${rowNum}: Valid rent or unit rents required when is rented.` };
  }
  const expenses = parseNum(
    getCol(row, "expenses", "currentMonthlyExpenses")
  );
  if (expenses == null || expenses < 0)
    return { error: `Row ${rowNum}: Valid expenses required.` };

  const SINGLE_UNIT_TYPES = [
    "single_family",
    "condo",
    "townhouse",
    "manufactured",
  ];
  if (SINGLE_UNIT_TYPES.includes(propertyType) && units !== 1) {
    return {
      error: `Row ${rowNum}: Units must be 1 for ${propertyType}.`,
    };
  }

  const vacancyRaw = parseNum(getCol(row, "vacancy %", "vacancyPercent"));
  const vacancyPercent =
    vacancyRaw != null && vacancyRaw >= 0 && vacancyRaw <= 100
      ? Math.round(vacancyRaw)
      : 5;

  const cashInvestedRaw = parseNum(
    getCol(row, "cash invested", "cashInvested")
  );
  const cashInvested =
    cashInvestedRaw != null && cashInvestedRaw >= 0 ? cashInvestedRaw : null;

  const ownershipRaw = parseNum(
    getCol(row, "ownership %", "ownershipPercent")
  );
  const ownershipPercent =
    ownershipRaw != null && ownershipRaw >= 1 && ownershipRaw <= 100
      ? Math.round(ownershipRaw)
      : 100;

  const mortgageBalance = parseNum(
    getCol(
      row,
      "mortgage balance",
      "mortgage balance (effective)",
      "mortgage balance (stored)",
      "mortgage balance (stored sum)",
      "mortgageBalance"
    )
  );
  const balanceAsOfRaw = parseDate(
    getCol(row, "balance as of", "balance as of (first lien)", "balanceAsOfDate")
  );
  const balanceAsOfDate = balanceAsOfRaw ?? null;
  const originalLoanAmountRaw = parseNum(
    getCol(row, "original loan amount", "originalLoanAmount")
  );
  const originalLoanAmount =
    originalLoanAmountRaw != null && originalLoanAmountRaw >= 0
      ? originalLoanAmountRaw
      : null;
  const mortgageRateRaw = parseNum(
    getCol(row, "mortgage rate", "mortgage rate (first lien)", "mortgageRate")
  );
  const mortgageRate =
    mortgageRateRaw != null && mortgageRateRaw >= 0 ? mortgageRateRaw / 100 : null;
  const mortgageTerm = parseNum(
    getCol(row, "mortgage term", "mortgage term (first lien)", "mortgageTerm")
  );
  const mortgageStartDateRaw = getCol(
    row,
    "mortgage start date",
    "mortgage start date (first lien)",
    "mortgageStartDate"
  ).trim();
  let mortgageStartDate: Date | null = null;
  if (mortgageStartDateRaw) {
    const parsedMs = parseDate(mortgageStartDateRaw);
    if (!parsedMs) {
      return {
        error: `Row ${rowNum}: Invalid mortgage start date (use YYYY-MM-DD or MM/DD/YYYY).`,
      };
    }
    mortgageStartDate = parsedMs;
  }
  const monthlyPayment = parseNum(
    getCol(row, "monthly payment", "monthly payment (all liens sum)", "monthlyPayment")
  );
  const escrowAmountRaw = parseNum(
    getCol(row, "escrow amount", "escrow amount (first lien)", "escrowAmount")
  );
  const escrowAmount =
    escrowAmountRaw != null && escrowAmountRaw >= 0 ? escrowAmountRaw : null;
  const lenderName = getCol(row, "lender", "lender (first lien)") || null;
  const loanTypeRaw = getCol(row, "loan type", "loanType");
  const loanType = loanTypeRaw ? loanTypeRaw.trim() : null;

  const nickname = getCol(row, "nickname") || null;

  const resolved = resolveImportRentForCreate({
    isRented,
    propertyType,
    units,
    rentFromColumn: rent != null && rent >= 0 ? rent : null,
    unitRentsFromColumn: unitRentsParsed,
  });

  if (isRented && resolved.currentMonthlyRent <= 0) {
    return {
      error: `Row ${rowNum}: When is rented, provide a positive rent total or valid per-unit rents.`,
    };
  }

  return {
    data: {
      addressLine1,
      addressLine2: addressLine2FromCol,
      city: parsedCity,
      state: parsedState,
      zipCode: parsedZip,
      nickname: nickname || null,
      propertyType,
      units,
      purchasePrice,
      purchaseDate,
      currentEstimatedValue,
      currentMonthlyRent: resolved.currentMonthlyRent,
      unitRents: resolved.unitRents,
      currentMonthlyExpenses: expenses,
      vacancyPercent,
      cashInvested,
      ownershipPercent,
      mortgageBalance:
        mortgageBalance != null && mortgageBalance >= 0 ? mortgageBalance : null,
      balanceAsOfDate,
      originalLoanAmount,
      mortgageRate,
      mortgageTerm:
        mortgageTerm != null && mortgageTerm >= 1 ? Math.round(mortgageTerm) : null,
      mortgageStartDate,
      monthlyPayment:
        monthlyPayment != null && monthlyPayment >= 0 ? monthlyPayment : null,
      escrowAmount,
      lenderName,
      loanType,
      isRented,
    },
  };
}
