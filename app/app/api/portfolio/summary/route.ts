import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { computePortfolioMetrics } from "@/lib/metrics/portfolio-metrics";

export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    include: { mortgages: true },
  });

  type PropertyWithMortgages = (typeof properties)[number];
  const portfolioInput = properties.map((p: PropertyWithMortgages) => {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum: number, m: { currentBalance: unknown }) => sum + Number(m.currentBalance),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
      0
    );
    return {
      id: p.id,
      monthlyRent: getPropertyTotalRent(p),
      monthlyExpenses: Number(p.currentMonthlyExpenses),
      estimatedValue: Number(p.currentEstimatedValue),
      cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
      ownershipPercent: p.ownershipPercent ?? 100,
    };
  });

  const displayMode = (user.ownershipDisplayMode ?? "proportional") as "proportional" | "full_liability";
  const metrics = computePortfolioMetrics(portfolioInput, displayMode);

  return NextResponse.json({
    ...metrics,
    weightedCapRate: metrics.weightedCapRate != null ? metrics.weightedCapRate : null,
    portfolioLtv: metrics.portfolioLtv != null ? metrics.portfolioLtv : null,
  });
}
