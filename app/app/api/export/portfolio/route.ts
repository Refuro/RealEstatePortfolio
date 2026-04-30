import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { prisma } from "@/lib/db";
import { getEffectiveBalance } from "@/lib/amortization";
import { getPropertyLimit, getEffectiveTier } from "@/lib/plans";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { parseUnitRentsFromDb } from "@/lib/validations/property";

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/**
 * Portfolio CSV contract (multi-mortgage):
 * - Rate / term / lender / escrow / balance-as-of columns describe the **first lien only** (by `createdAt`).
 * - `monthly payment (all liens sum)` is the sum of all liens’ scheduled payments.
 * - `mortgage balance (effective)` and `mortgage balance (stored sum)` are portfolio totals across liens.
 * - `mortgage stored balances (pipe)` lists each lien’s stored balance in the same order as liens (by `createdAt`).
 * See `docs/reference/portfolio-csv-export.md`.
 */
export async function GET(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const identifier = getRateLimitIdentifier(user.id, request);
    const { allowed } = await checkRateLimit(identifier, "export:portfolio");
    if (!allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429 }
      );
    }

    const tier = getEffectiveTier(user);
    const propertyLimit = getPropertyLimit(tier);
    const propertyCountTotal = await prisma.property.count({
      where: { userId: user.id },
    });
    const properties = await prisma.property.findMany({
      where: { userId: user.id },
      include: { mortgages: true },
      orderBy: { updatedAt: "desc" },
      take: propertyLimit,
    });
    const propertyCountIncluded = properties.length;
    const truncated = propertyCountTotal > propertyCountIncluded;

    const headers = [
    "address",
    "nickname",
    "property type",
    "units",
    "purchase price",
    "purchase date",
    "value",
    "rent",
    "is rented",
    "unit rents",
    "expenses",
    "vacancy %",
    "cash invested",
    "ownership %",
    "mortgage lien count",
    "mortgage stored balances (pipe)",
    "mortgage balance (effective)",
    "mortgage balance (stored sum)",
    "balance as of (first lien)",
    "mortgage start date (first lien)",
    "mortgage rate (first lien)",
    "mortgage term (first lien)",
    "monthly payment (all liens sum)",
    "escrow amount (first lien)",
    "lender (first lien)",
    "NOI",
    "annual cash flow",
    "equity",
    "monthly cash flow",
    "cap rate",
    "LTV",
  ];

    const rows: string[][] = [];

    for (const p of properties) {
    const orderedMortgages = [...p.mortgages].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    );
    const lienCount = orderedMortgages.length;
    const storedBalancesPipe = orderedMortgages
      .map((m) => Number(m.currentBalance))
      .join("|");

    const totalMortgageBalance = p.mortgages.reduce(
      (sum, m) => sum + getEffectiveBalance(m),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum, m) => sum + Number(m.monthlyPayment),
      0
    );

    const mortgageBalanceStored = p.mortgages.reduce(
      (sum, m) => sum + Number(m.currentBalance),
      0
    );

    const firstMortgage = orderedMortgages[0];
    const balanceAsOf = firstMortgage?.balanceAsOfDate
      ? (firstMortgage.balanceAsOfDate instanceof Date
          ? firstMortgage.balanceAsOfDate
          : new Date(firstMortgage.balanceAsOfDate)
        ).toISOString().slice(0, 10)
      : "";
    const mortgageStartDate =
      firstMortgage?.startDate != null
        ? (firstMortgage.startDate instanceof Date
            ? firstMortgage.startDate
            : new Date(firstMortgage.startDate)
          ).toISOString().slice(0, 10)
        : "";
    const mortgageRate =
      firstMortgage != null
        ? Number(firstMortgage.interestRate) * 100
        : null;
    const mortgageTerm = firstMortgage?.termYears ?? null;
    const monthlyPaymentAll = totalMonthlyPayment;
    const escrowAmount =
      firstMortgage?.escrowAmount != null ? Number(firstMortgage.escrowAmount) : null;
    const lender = firstMortgage?.lenderName ?? null;

    const metrics = computePropertyMetrics({
      monthlyRent: getPropertyTotalRent(p),
      monthlyExpenses: Number(p.currentMonthlyExpenses),
      estimatedValue: Number(p.currentEstimatedValue),
      cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
      ownershipPercent: p.ownershipPercent ?? 100,
      vacancyPercent: p.vacancyPercent ?? 5,
    });

    const address = [p.addressLine1, p.addressLine2, p.city, p.state, p.zipCode]
      .filter(Boolean)
      .join(", ");

    const purchaseDate =
      p.purchaseDate instanceof Date
        ? p.purchaseDate.toISOString().slice(0, 10)
        : String(p.purchaseDate).slice(0, 10);

    const unitRentsArr = parseUnitRentsFromDb(p.unitRents);
    const unitRentsCell =
      unitRentsArr && unitRentsArr.length > 0 ? unitRentsArr.join("|") : "";

    rows.push([
      escapeCsvCell(address),
      escapeCsvCell(p.nickname ?? ""),
      escapeCsvCell(p.propertyType),
      escapeCsvCell(p.units),
      escapeCsvCell(Number(p.purchasePrice)),
      escapeCsvCell(purchaseDate),
      escapeCsvCell(Number(p.currentEstimatedValue)),
      escapeCsvCell(getPropertyTotalRent(p)),
      escapeCsvCell(p.isRented ? "yes" : "no"),
      escapeCsvCell(unitRentsCell),
      escapeCsvCell(Number(p.currentMonthlyExpenses)),
      escapeCsvCell(p.vacancyPercent ?? 5),
      escapeCsvCell(p.cashInvested != null ? Number(p.cashInvested) : ""),
      escapeCsvCell(p.ownershipPercent ?? 100),
      escapeCsvCell(lienCount),
      escapeCsvCell(storedBalancesPipe),
      escapeCsvCell(lienCount === 0 ? "" : String(totalMortgageBalance)),
      escapeCsvCell(lienCount === 0 ? "" : String(mortgageBalanceStored)),
      escapeCsvCell(balanceAsOf),
      escapeCsvCell(mortgageStartDate),
      escapeCsvCell(mortgageRate ?? ""),
      escapeCsvCell(mortgageTerm ?? ""),
      escapeCsvCell(monthlyPaymentAll ?? ""),
      escapeCsvCell(escrowAmount ?? ""),
      escapeCsvCell(lender ?? ""),
      escapeCsvCell(metrics.noi),
      escapeCsvCell(metrics.annualCashFlow),
      escapeCsvCell(metrics.equity),
      escapeCsvCell(metrics.monthlyCashFlow),
      escapeCsvCell(
        metrics.capRate != null ? (metrics.capRate * 100).toFixed(2) : ""
      ),
      escapeCsvCell(
        metrics.ltv != null ? (metrics.ltv * 100).toFixed(1) : ""
      ),
    ]);
  }

    const csv =
      headers.join(",") + "\n" + rows.map((r) => r.join(",")).join("\n");

    await recordRateLimit(identifier, "export:portfolio");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="portfolio-export.csv"',
        "X-Veld-Property-Count-Total": String(propertyCountTotal),
        "X-Veld-Property-Count-Included": String(propertyCountIncluded),
        "X-Veld-Property-Limit": String(propertyLimit),
        "X-Veld-Property-Slice-Truncated": truncated ? "true" : "false",
      },
    });
  } catch (err) {
    console.error("Portfolio export error:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Portfolio export failed"), {
      tags: { route: "api/export/portfolio", userId: user.id },
    });
    return NextResponse.json({ error: "Failed to export portfolio" }, { status: 500 });
  }
}
