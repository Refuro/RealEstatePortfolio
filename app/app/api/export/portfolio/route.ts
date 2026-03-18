import { NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveBalance } from "@/lib/amortization";
import { getPropertyLimit, getEffectiveTier } from "@/lib/plans";
import { takeFirstNByUpdatedAt } from "@/lib/limit-utils";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

function escapeCsvCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allProperties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
  });

  const propertyLimit = getPropertyLimit(getEffectiveTier(user));
  const properties = takeFirstNByUpdatedAt(allProperties, propertyLimit);

  const headers = [
    "address",
    "nickname",
    "property type",
    "units",
    "purchase price",
    "purchase date",
    "value",
    "rent",
    "expenses",
    "vacancy %",
    "cash invested",
    "ownership %",
    "mortgage balance",
    "balance as of",
    "mortgage rate",
    "mortgage term",
    "monthly payment",
    "escrow amount",
    "lender",
    "equity",
    "monthly cash flow",
    "cap rate",
    "LTV",
  ];

  const rows: string[][] = [];
  const displayMode = (user.ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability";

  for (const p of properties) {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum, m) => sum + getEffectiveBalance(m),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum, m) => sum + Number(m.monthlyPayment),
      0
    );

    const firstMortgage = p.mortgages[0];
    const mortgageBalanceStored = p.mortgages.reduce(
      (sum, m) => sum + Number(m.currentBalance),
      0
    );
    const balanceAsOf = firstMortgage?.balanceAsOfDate
      ? (firstMortgage.balanceAsOfDate instanceof Date
          ? firstMortgage.balanceAsOfDate
          : new Date(firstMortgage.balanceAsOfDate)
        ).toISOString().slice(0, 10)
      : "";
    const mortgageRate =
      firstMortgage != null
        ? Number(firstMortgage.interestRate) * 100
        : null;
    const mortgageTerm = firstMortgage?.termYears ?? null;
    const monthlyPayment = totalMonthlyPayment || (firstMortgage ? Number(firstMortgage.monthlyPayment) : null);
    const escrowAmount =
      firstMortgage?.escrowAmount != null ? Number(firstMortgage.escrowAmount) : null;
    const lender = firstMortgage?.lenderName ?? null;

    const metrics = computePropertyMetrics(
      {
        monthlyRent: getPropertyTotalRent(p),
        monthlyExpenses: Number(p.currentMonthlyExpenses),
        estimatedValue: Number(p.currentEstimatedValue),
        cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
        totalMortgageBalance,
        totalMonthlyPayment,
        ownershipPercent: p.ownershipPercent ?? 100,
        vacancyPercent: p.vacancyPercent ?? 5,
      },
      displayMode
    );

    const address = [p.addressLine1, p.addressLine2, p.city, p.state, p.zipCode]
      .filter(Boolean)
      .join(", ");

    const propertyType =
      p.propertyType === "multi_family" ? "Multi family" : "Single family";

    const purchaseDate =
      p.purchaseDate instanceof Date
        ? p.purchaseDate.toISOString().slice(0, 10)
        : String(p.purchaseDate).slice(0, 10);

    rows.push([
      escapeCsvCell(address),
      escapeCsvCell(p.nickname ?? ""),
      escapeCsvCell(propertyType),
      escapeCsvCell(p.units),
      escapeCsvCell(Number(p.purchasePrice)),
      escapeCsvCell(purchaseDate),
      escapeCsvCell(Number(p.currentEstimatedValue)),
      escapeCsvCell(getPropertyTotalRent(p)),
      escapeCsvCell(Number(p.currentMonthlyExpenses)),
      escapeCsvCell(p.vacancyPercent ?? 5),
      escapeCsvCell(p.cashInvested != null ? Number(p.cashInvested) : ""),
      escapeCsvCell(p.ownershipPercent ?? 100),
      escapeCsvCell(mortgageBalanceStored || ""),
      escapeCsvCell(balanceAsOf),
      escapeCsvCell(mortgageRate ?? ""),
      escapeCsvCell(mortgageTerm ?? ""),
      escapeCsvCell(monthlyPayment ?? ""),
      escapeCsvCell(escrowAmount ?? ""),
      escapeCsvCell(lender ?? ""),
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

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="portfolio-export.csv"',
    },
  });
}
