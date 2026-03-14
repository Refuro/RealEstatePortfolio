import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAppUser();
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
    (sum: number, m: { currentBalance: unknown }) => sum + Number(m.currentBalance),
    0
  );
  const totalMonthlyPayment = property.mortgages.reduce(
    (sum: number, m: { monthlyPayment: unknown }) => sum + Number(m.monthlyPayment),
    0
  );

  const ownershipPercent = property.ownershipPercent ?? 100;
  const metrics = computePropertyMetrics({
    monthlyRent: Number(property.currentMonthlyRent),
    monthlyExpenses: Number(property.currentMonthlyExpenses),
    estimatedValue: Number(property.currentEstimatedValue),
    cashInvested: property.cashInvested != null ? Number(property.cashInvested) : null,
    totalMortgageBalance,
    totalMonthlyPayment,
    ownershipPercent,
  });

  return NextResponse.json(metrics);
}
