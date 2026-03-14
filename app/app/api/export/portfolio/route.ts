import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
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
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
  });

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
    "cash invested",
    "ownership %",
    "mortgage balance",
    "mortgage rate",
    "mortgage term",
    "monthly payment",
    "lender",
    "equity",
    "monthly cash flow",
    "cap rate",
    "LTV",
  ];

  const rows: string[][] = [];

  for (const p of properties) {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum, m) => sum + Number(m.currentBalance),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum, m) => sum + Number(m.monthlyPayment),
      0
    );

    const firstMortgage = p.mortgages[0];
    const mortgageBalance = totalMortgageBalance;
    const mortgageRate =
      firstMortgage != null
        ? Number(firstMortgage.interestRate) * 100
        : null;
    const mortgageTerm = firstMortgage?.termYears ?? null;
    const monthlyPayment = totalMonthlyPayment || (firstMortgage ? Number(firstMortgage.monthlyPayment) : null);
    const lender = firstMortgage?.lenderName ?? null;

    const metrics = computePropertyMetrics({
      monthlyRent: Number(p.currentMonthlyRent),
      monthlyExpenses: Number(p.currentMonthlyExpenses),
      estimatedValue: Number(p.currentEstimatedValue),
      cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
      ownershipPercent: p.ownershipPercent ?? 100,
    });

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
      escapeCsvCell(Number(p.currentMonthlyRent)),
      escapeCsvCell(Number(p.currentMonthlyExpenses)),
      escapeCsvCell(p.cashInvested != null ? Number(p.cashInvested) : ""),
      escapeCsvCell(p.ownershipPercent ?? 100),
      escapeCsvCell(mortgageBalance || ""),
      escapeCsvCell(mortgageRate ?? ""),
      escapeCsvCell(mortgageTerm ?? ""),
      escapeCsvCell(monthlyPayment ?? ""),
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
