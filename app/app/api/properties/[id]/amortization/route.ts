import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generateAmortizationSchedule,
  getPiForAmortization,
  isNegativeAmortizingPayment,
} from "@/lib/amortization";

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

  // Use first mortgage for schedule (MVP: one mortgage per property in UI)
  const mortgage = property.mortgages[0];
  if (!mortgage) {
    return NextResponse.json({ schedule: [] });
  }

  const pi = getPiForAmortization(mortgage);
  if (
    isNegativeAmortizingPayment(
      pi,
      Number(mortgage.currentBalance),
      Number(mortgage.interestRate)
    )
  ) {
    return NextResponse.json({ schedule: [], negativeAmortization: true });
  }

  const schedule = generateAmortizationSchedule({
    originalLoanAmount: Number(mortgage.originalLoanAmount),
    annualInterestRate: Number(mortgage.interestRate),
    termYears: mortgage.termYears,
    startDate: mortgage.startDate,
    monthlyPayment: pi,
  });

  return NextResponse.json({ schedule, negativeAmortization: false });
}
