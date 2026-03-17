import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveBalance } from "@/lib/amortization";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await prisma.property.findFirst({
    where: { id, userId: user.id },
    include: { mortgages: true },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const totalMortgageBalance = property.mortgages.reduce(
    (sum: number, m) => sum + getEffectiveBalance(m),
    0
  );
  const totalMonthlyPayment = property.mortgages.reduce(
    (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
    0
  );

  const ownershipPercent = property.ownershipPercent ?? 100;
  const displayMode = (user.ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability";
  const metrics = computePropertyMetrics(
    {
      monthlyRent: getPropertyTotalRent(property),
      monthlyExpenses: Number(property.currentMonthlyExpenses),
      estimatedValue: Number(property.currentEstimatedValue),
      cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
      ownershipPercent,
      vacancyPercent: property.vacancyPercent ?? 5,
    },
    displayMode
  );

  return NextResponse.json(metrics);
}
