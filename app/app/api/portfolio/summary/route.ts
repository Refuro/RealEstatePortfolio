import { NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveBalance } from "@/lib/amortization";
import { getPropertyLimit, getEffectiveTier } from "@/lib/plans";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { computePortfolioMetrics } from "@/lib/metrics/portfolio-metrics";

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  type PropertyWithMortgages = (typeof properties)[number];
  const portfolioInput = properties.map((p: PropertyWithMortgages) => {
    const totalMortgageBalance = p.mortgages.reduce(
      (sum: number, m) => sum + getEffectiveBalance(m),
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
      vacancyPercent: p.vacancyPercent ?? 5,
    };
  });

  const displayMode = (user.ownershipDisplayMode ?? "proportional") as
    | "proportional"
    | "full_liability";
  const metrics = computePortfolioMetrics(portfolioInput, displayMode);

  return NextResponse.json({
    ...metrics,
    weightedCapRate: metrics.weightedCapRate != null ? metrics.weightedCapRate : null,
    portfolioLtv: metrics.portfolioLtv != null ? metrics.portfolioLtv : null,
    slice: {
      propertyCountTotal,
      propertyCountIncluded,
      propertyLimit,
      truncated,
    },
  });
}
