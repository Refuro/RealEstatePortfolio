import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import Papa from "papaparse";
import type { Prisma } from "@prisma/client";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { getPropertyLimit, canAddProperty, getEffectiveTier } from "@/lib/plans";
import { parseRow, type ImportRow } from "@/lib/import/csv-parser";
import { getImportMortgageValidationError } from "@/lib/import/validate-import-mortgage";

export async function POST(req: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, req);
  const { allowed } = await checkRateLimit(identifier, "import:portfolio");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later.", imported: 0, errors: [] },
      { status: 429 }
    );
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

  const papaErrors: { row: number; message: string }[] = parsed.errors.map((e) => ({
    row: e.row != null ? e.row + 1 : 0,
    message: e.message || String(e.code ?? "CSV parse error"),
  }));

  if (parsed.errors.length > 0 && parsed.data.length === 0) {
    return NextResponse.json(
      {
        error: "Invalid CSV. Could not parse.",
        imported: 0,
        errors: papaErrors,
      },
      { status: 400 }
    );
  }

  const rows = parsed.data;
  if (rows.length === 0) {
    return NextResponse.json({ imported: 0, errors: papaErrors });
  }

  const propertyCount = await prisma.property.count({
    where: { userId: user.id },
  });

  const tier = getEffectiveTier(user);
  const limit = getPropertyLimit(tier);
  const canAdd = canAddProperty(tier, propertyCount);

  const validRows: ImportRow[] = [];
  const validRowNumbers: number[] = [];
  const errors: { row: number; message: string }[] = [...papaErrors];

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 2; // 1-based, +1 for header
    const result = parseRow(rows[i], rowNum);
    if ("error" in result) {
      errors.push({ row: rowNum, message: result.error });
    } else {
      validRows.push(result.data);
      validRowNumbers.push(rowNum);
    }
  }

  if (validRows.length === 0) {
    return NextResponse.json({ imported: 0, errors });
  }

  const slotsRemaining = limit - propertyCount;

  if (!canAdd) {
    return NextResponse.json(
      {
        error:
          "Property limit reached. Upgrade your plan or remove a property to add more.",
        code: "PLAN_LIMIT_REACHED",
        imported: 0,
        errors: [
          {
            row: 0,
            message:
              "Property limit reached. Upgrade your plan or remove a property to add more.",
          },
          ...errors,
        ],
      },
      { status: 403 }
    );
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

  // Determine which rows to import (preserve CSV line numbers for mortgage validation errors)
  type RowWithLine = { r: ImportRow; csvRow: number };
  let rowsWithLines: RowWithLine[];
  if (selectedIndicesRaw) {
    const rawIndices = selectedIndicesRaw
      .split(",")
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => Number.isInteger(n) && n >= 0 && n < validRows.length);
    const indices = [...new Set(rawIndices)].sort((a, b) => a - b);
    rowsWithLines = indices
      .slice(0, slotsRemaining)
      .map((i) => ({ r: validRows[i], csvRow: validRowNumbers[i] }));
  } else {
    rowsWithLines = validRows
      .slice(0, slotsRemaining)
      .map((r, i) => ({ r, csvRow: validRowNumbers[i] }));
  }

  const mortgageErrors: { row: number; message: string }[] = [];
  const allowedRows: RowWithLine[] = [];
  for (const { r, csvRow } of rowsWithLines) {
    const msg = getImportMortgageValidationError(r);
    if (msg) {
      mortgageErrors.push({ row: csvRow, message: msg });
    } else {
      allowedRows.push({ r, csvRow });
    }
  }

  if (allowedRows.length === 0) {
    return NextResponse.json({
      imported: 0,
      errors: [...errors, ...mortgageErrors],
    });
  }

  let imported = 0;

  try {
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < allowedRows.length; i++) {
        const r = allowedRows[i].r;
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
            isRented: r.isRented,
            unitRents:
              r.isRented && r.unitRents && r.unitRents.length > 0
                ? r.unitRents
                : null,
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
          const originalLoan = r.originalLoanAmount ?? r.mortgageBalance;
          await tx.mortgage.create({
            data: {
              propertyId: prop.id,
              originalLoanAmount: originalLoan,
              currentBalance: r.mortgageBalance,
              balanceAsOfDate: r.balanceAsOfDate,
              interestRate: r.mortgageRate,
              termYears: r.mortgageTerm,
              startDate: r.mortgageStartDate ?? r.purchaseDate,
              monthlyPayment: r.monthlyPayment,
              escrowIncluded: r.escrowAmount != null && r.escrowAmount > 0,
              escrowAmount: r.escrowAmount,
              lenderName: r.lenderName,
              loanType: r.loanType ?? null,
            },
          });
          await tx.property.update({
            where: { id: prop.id },
            data: { hasMortgage: true },
          });
        }

        imported++;
      }
    });
  } catch (err) {
    console.error("Portfolio import transaction failed:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Portfolio import failed"), {
      tags: { route: "api/import/portfolio", userId: user.id },
    });
    return NextResponse.json(
      { error: "Import failed. Please try again.", imported: 0, errors },
      { status: 500 }
    );
  }

  await recordRateLimit(identifier, "import:portfolio");

  const limitErrors =
    rowsWithLines.length < validRows.length
      ? errors.concat({
          row: 0,
          message: `Only ${imported} of ${validRows.length} valid rows imported (property limit ${limit}).`,
        })
      : errors;

  return NextResponse.json({
    imported,
    errors: [...limitErrors, ...mortgageErrors],
  });
}
