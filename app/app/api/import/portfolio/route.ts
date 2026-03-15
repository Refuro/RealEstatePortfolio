import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import type { Prisma } from "@prisma/client";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPropertyLimit, canAddProperty } from "@/lib/plans";
import { US_STATES } from "@/lib/us-states";

const PROPERTY_TYPE_MAP: Record<string, string> = {
  "single family": "single_family",
  "single-family": "single_family",
  single_family: "single_family",
  "multi family": "multi_family",
  "multi-family": "multi_family",
  multi_family: "multi_family",
  condo: "condo",
  townhouse: "townhouse",
  manufactured: "manufactured",
  apartment: "apartment",
};

function parseDate(val: string): Date | null {
  const s = String(val ?? "").trim();
  if (!s) return null;
  // YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (iso) {
    const d = new Date(parseInt(iso[1], 10), parseInt(iso[2], 10) - 1, parseInt(iso[3], 10));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // MM/DD/YYYY
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (us) {
    const d = new Date(parseInt(us[3], 10), parseInt(us[1], 10) - 1, parseInt(us[2], 10));
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseNum(val: string): number | null {
  const s = String(val ?? "").replace(/,/g, "").trim();
  if (!s) return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

function getCol(row: Record<string, string>, ...names: string[]): string {
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

function parseAddressFromCombined(addr: string): { addressLine1: string; city: string; state: string; zipCode: string } | null {
  const parts = addr.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length < 4) return null;
  const zipCode = parts[parts.length - 1];
  const state = parts[parts.length - 2];
  const city = parts[parts.length - 3];
  const addressLine1 = parts.slice(0, -3).join(", ");
  if (!/^\d{5}(-\d{4})?$/.test(zipCode)) return null;
  if (!US_STATES.includes(state.toUpperCase() as (typeof US_STATES)[number])) return null;
  return { addressLine1, city, state: state.toUpperCase(), zipCode };
}

type ImportRow = {
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
  currentMonthlyExpenses: number;
  vacancyPercent: number;
  cashInvested: number | null;
  ownershipPercent: number;
  mortgageBalance: number | null;
  mortgageRate: number | null;
  mortgageTerm: number | null;
  monthlyPayment: number | null;
  lenderName: string | null;
};

function parseRow(
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

  if (addr && city && state && zipCode) {
    addressLine1 = addr;
    parsedCity = city;
    parsedState = state.toUpperCase();
    parsedZip = zipCode;
  } else if (addr && addr.includes(",")) {
    const parsed = parseAddressFromCombined(addr);
    if (!parsed) return { error: `Row ${rowNum}: Invalid address format. Use "street, city, state, zip" or separate columns.` };
    addressLine1 = parsed.addressLine1;
    parsedCity = parsed.city;
    parsedState = parsed.state;
    parsedZip = parsed.zipCode;
  } else {
    return { error: `Row ${rowNum}: Address required (address or addressLine1, city, state, zipCode).` };
  }

  if (!US_STATES.includes(parsedState as (typeof US_STATES)[number])) {
    return { error: `Row ${rowNum}: Invalid state. Use 2-letter abbreviation (e.g. TX, CA).` };
  }

  const purchasePrice = parseNum(getCol(row, "purchase price", "purchasePrice"));
  if (purchasePrice == null || purchasePrice < 0)
    return { error: `Row ${rowNum}: Valid purchase price required.` };

  const purchaseDate = parseDate(getCol(row, "purchase date", "purchaseDate"));
  if (!purchaseDate) return { error: `Row ${rowNum}: Valid purchase date required (YYYY-MM-DD or MM/DD/YYYY).` };

  const currentEstimatedValue = parseNum(getCol(row, "value", "currentEstimatedValue"));
  if (currentEstimatedValue == null || currentEstimatedValue < 0)
    return { error: `Row ${rowNum}: Valid current value required.` };

  const rent = parseNum(getCol(row, "rent", "currentMonthlyRent"));
  if (rent == null || rent < 0) return { error: `Row ${rowNum}: Valid rent required.` };

  const expenses = parseNum(getCol(row, "expenses", "currentMonthlyExpenses"));
  if (expenses == null || expenses < 0) return { error: `Row ${rowNum}: Valid expenses required.` };

  const ptRaw = getCol(row, "property type", "propertyType");
  const propertyType = ptRaw
    ? (PROPERTY_TYPE_MAP[ptRaw.toLowerCase()] ?? "single_family")
    : "single_family";

  const unitsRaw = parseNum(getCol(row, "units"));
  const units = unitsRaw != null && unitsRaw >= 1 ? Math.min(999, Math.round(unitsRaw)) : 1;

  const SINGLE_UNIT_TYPES = ["single_family", "condo", "townhouse", "manufactured"];
  if (SINGLE_UNIT_TYPES.includes(propertyType) && units !== 1) {
    return { error: `Row ${rowNum}: Units must be 1 for ${propertyType}.` };
  }

  const vacancyRaw = parseNum(getCol(row, "vacancy %", "vacancyPercent"));
  const vacancyPercent = vacancyRaw != null && vacancyRaw >= 0 && vacancyRaw <= 100
    ? Math.round(vacancyRaw)
    : 5;

  const cashInvestedRaw = parseNum(getCol(row, "cash invested", "cashInvested"));
  const cashInvested = cashInvestedRaw != null && cashInvestedRaw >= 0 ? cashInvestedRaw : null;

  const ownershipRaw = parseNum(getCol(row, "ownership %", "ownershipPercent"));
  const ownershipPercent = ownershipRaw != null && ownershipRaw >= 1 && ownershipRaw <= 100
    ? Math.round(ownershipRaw)
    : 100;

  const mortgageBalance = parseNum(getCol(row, "mortgage balance", "mortgageBalance"));
  const mortgageRateRaw = parseNum(getCol(row, "mortgage rate", "mortgageRate"));
  const mortgageRate = mortgageRateRaw != null && mortgageRateRaw >= 0 ? mortgageRateRaw / 100 : null;
  const mortgageTerm = parseNum(getCol(row, "mortgage term", "mortgageTerm"));
  const monthlyPayment = parseNum(getCol(row, "monthly payment", "monthlyPayment"));
  const lenderName = getCol(row, "lender") || null;

  const nickname = getCol(row, "nickname") || null;

  return {
    data: {
      addressLine1,
      addressLine2: "",
      city: parsedCity,
      state: parsedState,
      zipCode: parsedZip,
      nickname: nickname || null,
      propertyType,
      units,
      purchasePrice,
      purchaseDate,
      currentEstimatedValue,
      currentMonthlyRent: rent,
      currentMonthlyExpenses: expenses,
      vacancyPercent,
      cashInvested,
      ownershipPercent,
      mortgageBalance: mortgageBalance != null && mortgageBalance >= 0 ? mortgageBalance : null,
      mortgageRate,
      mortgageTerm: mortgageTerm != null && mortgageTerm >= 1 ? Math.round(mortgageTerm) : null,
      monthlyPayment: monthlyPayment != null && monthlyPayment >= 0 ? monthlyPayment : null,
      lenderName,
    },
  };
}

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Send multipart/form-data with 'file' field." },
      { status: 400 }
    );
  }

  const selectedIndicesRaw = formData.get("selectedIndices") as string | null;

  const text = await file.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return NextResponse.json(
      { error: "Invalid CSV. Could not parse.", imported: 0, errors: [] },
      { status: 400 }
    );
  }

  const rows = parsed.data;
  if (rows.length === 0) {
    return NextResponse.json({ imported: 0, errors: [] });
  }

  const propertyCount = await prisma.property.count({
    where: { userId: user.id },
  });

  const tier = user.subscriptionTier ?? "free";
  const limit = getPropertyLimit(tier);
  const canAdd = canAddProperty(tier, propertyCount);

  const validRows: ImportRow[] = [];
  const errors: { row: number; message: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // 1-based, +1 for header
    const result = parseRow(rows[i], rowNum);
    if ("error" in result) {
      errors.push({ row: rowNum, message: result.error });
    } else {
      validRows.push(result.data);
    }
  }

  if (validRows.length === 0) {
    return NextResponse.json({ imported: 0, errors });
  }

  const slotsRemaining = limit - propertyCount;

  if (!canAdd) {
    return NextResponse.json({
      imported: 0,
      errors: [{ row: 0, message: `Property limit reached (${limit}). Upgrade to add more.` }, ...errors],
    });
  }

  // Over limit and no selection: return requiresSelection (do NOT import)
  if (validRows.length > slotsRemaining && !selectedIndicesRaw) {
    return NextResponse.json({
      requiresSelection: true,
      validRows,
      slotsRemaining,
      limit,
      validationErrors: errors,
    });
  }

  // Determine which rows to import
  let rowsToImport: ImportRow[];
  if (selectedIndicesRaw) {
    const rawIndices = selectedIndicesRaw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n >= 0 && n < validRows.length);
    const indices = [...new Set(rawIndices)].sort((a, b) => a - b);
    rowsToImport = indices.map((i) => validRows[i]);
    // Enforce limit: only import up to slotsRemaining
    rowsToImport = rowsToImport.slice(0, slotsRemaining);
  } else {
    rowsToImport = validRows.slice(0, slotsRemaining);
  }

  let imported = 0;

  await prisma.$transaction(async (tx) => {
    for (let i = 0; i < rowsToImport.length; i++) {
      const r = rowsToImport[i];
      const prop = await tx.property.create({
        data: {
          userId: user.id,
          addressLine1: r.addressLine1,
          addressLine2: r.addressLine2 || null,
          city: r.city,
          state: r.state,
          zipCode: r.zipCode,
          nickname: r.nickname,
          propertyType: r.propertyType,
          units: r.units,
          purchasePrice: r.purchasePrice,
          purchaseDate: r.purchaseDate,
          currentEstimatedValue: r.currentEstimatedValue,
          currentMonthlyRent: r.currentMonthlyRent,
          currentMonthlyExpenses: r.currentMonthlyExpenses,
          vacancyPercent: r.vacancyPercent,
          cashInvested: r.cashInvested,
          ownershipPercent: r.ownershipPercent,
        } as Prisma.PropertyUncheckedCreateInput,
      });

      if (
        r.mortgageBalance != null &&
        r.mortgageBalance > 0 &&
        r.monthlyPayment != null &&
        r.monthlyPayment > 0 &&
        r.mortgageRate != null &&
        r.mortgageTerm != null
      ) {
        await tx.mortgage.create({
          data: {
            propertyId: prop.id,
            originalLoanAmount: r.mortgageBalance,
            currentBalance: r.mortgageBalance,
            interestRate: r.mortgageRate,
            termYears: r.mortgageTerm,
            startDate: r.purchaseDate,
            monthlyPayment: r.monthlyPayment,
            lenderName: r.lenderName,
          },
        });
      }

      imported++;
    }
  });

  const limitErrors =
    rowsToImport.length < validRows.length
      ? errors.concat({
          row: 0,
          message: `Only ${imported} of ${validRows.length} valid rows imported (property limit ${limit}).`,
        })
      : errors;

  return NextResponse.json({ imported, errors: limitErrors });
}
