import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateMortgageSchema } from "@/lib/validations/mortgage";

async function getMortgageForUser(mortgageId: string, userId: string) {
  return prisma.mortgage.findFirst({
    where: {
      id: mortgageId,
      property: { userId },
    },
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mortgageId: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mortgageId } = await params;
  const existing = await getMortgageForUser(mortgageId, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Mortgage not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateMortgageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updatePayload: Record<string, unknown> = {};
  if (data.originalLoanAmount !== undefined) updatePayload.originalLoanAmount = data.originalLoanAmount;
  if (data.currentBalance !== undefined) updatePayload.currentBalance = data.currentBalance;
  if (data.interestRate !== undefined) updatePayload.interestRate = data.interestRate;
  if (data.termYears !== undefined) updatePayload.termYears = data.termYears;
  if (data.startDate !== undefined) updatePayload.startDate = data.startDate;
  if (data.monthlyPayment !== undefined) updatePayload.monthlyPayment = data.monthlyPayment;
  if (data.paymentEffectiveDate !== undefined) updatePayload.paymentEffectiveDate = data.paymentEffectiveDate;
  if (data.escrowIncluded !== undefined) updatePayload.escrowIncluded = data.escrowIncluded;
  if (data.lenderName !== undefined) updatePayload.lenderName = data.lenderName;
  if (data.loanType !== undefined) updatePayload.loanType = data.loanType;

  const mortgage = await prisma.mortgage.update({
    where: { id: mortgageId },
    data: updatePayload,
  });

  return NextResponse.json(serializeMortgage(mortgage));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; mortgageId: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { mortgageId } = await params;
  const existing = await getMortgageForUser(mortgageId, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Mortgage not found" }, { status: 404 });
  }

  await prisma.mortgage.delete({ where: { id: mortgageId } });
  return NextResponse.json({ success: true });
}
