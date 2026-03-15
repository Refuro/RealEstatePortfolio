import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createMortgageSchema } from "@/lib/validations/mortgage";

async function getPropertyForUser(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
  });
}

function serializeMortgage(m: {
  id: string;
  propertyId: string;
  originalLoanAmount: { toString(): string };
  currentBalance: { toString(): string };
  interestRate: { toString(): string };
  termYears: number;
  startDate: Date;
  monthlyPayment: { toString(): string };
  paymentEffectiveDate: Date | null;
  escrowIncluded: boolean;
  lenderName: string | null;
  loanType: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...m,
    originalLoanAmount: m.originalLoanAmount.toString(),
    currentBalance: m.currentBalance.toString(),
    interestRate: m.interestRate.toString(),
    monthlyPayment: m.monthlyPayment.toString(),
    startDate: m.startDate.toISOString().slice(0, 10),
    paymentEffectiveDate: m.paymentEffectiveDate
      ? m.paymentEffectiveDate.toISOString().slice(0, 10)
      : null,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  const property = await getPropertyForUser(propertyId, user.id);
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const mortgages = await prisma.mortgage.findMany({
    where: { propertyId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(mortgages.map(serializeMortgage));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  const property = await getPropertyForUser(propertyId, user.id);
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createMortgageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const mortgage = await prisma.mortgage.create({
    data: {
      propertyId,
      originalLoanAmount: data.originalLoanAmount,
      currentBalance: data.currentBalance,
      interestRate: data.interestRate,
      termYears: data.termYears,
      startDate: data.startDate,
      monthlyPayment: data.monthlyPayment,
      paymentEffectiveDate: data.paymentEffectiveDate ?? null,
      escrowIncluded: data.escrowIncluded,
      lenderName: data.lenderName ?? null,
      loanType: data.loanType ?? null,
    },
  });

  return NextResponse.json(serializeMortgage(mortgage));
}
