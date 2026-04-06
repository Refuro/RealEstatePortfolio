import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { getEffectiveBalance, getBalanceSource, getPayoffProjection } from "@/lib/amortization";
import {
  updateMortgageSchema,
  validateEscrowAmount,
  validateMortgagePiCoversInterestFields,
} from "@/lib/validations/mortgage";

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
  balanceAsOfDate: Date | null;
  interestRate: { toString(): string };
  termYears: number;
  startDate: Date;
  monthlyPayment: { toString(): string };
  paymentEffectiveDate: Date | null;
  escrowIncluded: boolean;
  escrowAmount: { toString(): string } | null;
  lenderName: string | null;
  loanType: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: m.id,
    propertyId: m.propertyId,
    originalLoanAmount: m.originalLoanAmount.toString(),
    currentBalance: m.currentBalance.toString(),
    balanceAsOfDate: m.balanceAsOfDate
      ? m.balanceAsOfDate.toISOString().slice(0, 10)
      : null,
    interestRate: m.interestRate.toString(),
    termYears: m.termYears,
    startDate: m.startDate.toISOString().slice(0, 10),
    monthlyPayment: m.monthlyPayment.toString(),
    paymentEffectiveDate: m.paymentEffectiveDate
      ? m.paymentEffectiveDate.toISOString().slice(0, 10)
      : null,
    escrowIncluded: m.escrowIncluded,
    escrowAmount: m.escrowAmount != null ? m.escrowAmount.toString() : null,
    lenderName: m.lenderName,
    loanType: m.loanType,
    effectiveBalance: getEffectiveBalance(m),
    balanceSource: getBalanceSource(m),
    payoffProjection: (() => {
      const p = getPayoffProjection(m);
      return {
        payoffDate: p.payoffDate ? p.payoffDate.toISOString().slice(0, 10) : null,
        remainingAtTermEnd: p.remainingAtTermEnd,
      };
    })(),
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

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "properties:mortgage-patch");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
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
  const monthlyPayment =
    data.monthlyPayment ?? existing.monthlyPayment.toString();
  const escrowAmount =
    data.escrowAmount !== undefined ? data.escrowAmount : existing.escrowAmount?.toString() ?? null;
  const escrowCheck = validateEscrowAmount(escrowAmount, monthlyPayment);
  if (!escrowCheck.success) {
    return NextResponse.json(
      { error: escrowCheck.error, details: { fieldErrors: { escrowAmount: [escrowCheck.error] } } },
      { status: 400 }
    );
  }

  const mergedForPi = {
    originalLoanAmount:
      data.originalLoanAmount ?? existing.originalLoanAmount.toString(),
    currentBalance: data.currentBalance ?? existing.currentBalance.toString(),
    interestRate: data.interestRate ?? existing.interestRate.toString(),
    termYears: data.termYears ?? existing.termYears,
    startDate: data.startDate ?? existing.startDate,
    monthlyPayment,
    escrowIncluded: data.escrowIncluded ?? existing.escrowIncluded,
    escrowAmount:
      data.escrowAmount !== undefined
        ? data.escrowAmount
        : existing.escrowAmount?.toString() ?? null,
  };
  const piCheck = validateMortgagePiCoversInterestFields(mergedForPi);
  if (!piCheck.ok) {
    return NextResponse.json(
      { error: piCheck.message, details: { fieldErrors: { monthlyPayment: [piCheck.message] } } },
      { status: 400 }
    );
  }

  const updatePayload: Record<string, unknown> = {};
  if (data.originalLoanAmount !== undefined) updatePayload.originalLoanAmount = data.originalLoanAmount;
  if (data.currentBalance !== undefined) updatePayload.currentBalance = data.currentBalance;
  if (data.interestRate !== undefined) updatePayload.interestRate = data.interestRate;
  if (data.termYears !== undefined) updatePayload.termYears = data.termYears;
  if (data.startDate !== undefined) updatePayload.startDate = data.startDate;
  if (data.monthlyPayment !== undefined) updatePayload.monthlyPayment = data.monthlyPayment;
  if (data.paymentEffectiveDate !== undefined) updatePayload.paymentEffectiveDate = data.paymentEffectiveDate;
  if (data.escrowIncluded !== undefined) updatePayload.escrowIncluded = data.escrowIncluded;
  if (data.escrowAmount !== undefined) updatePayload.escrowAmount = data.escrowAmount;
  if (data.lenderName !== undefined) updatePayload.lenderName = data.lenderName;
  if (data.loanType !== undefined) updatePayload.loanType = data.loanType;
  if (data.balanceAsOfDate !== undefined) updatePayload.balanceAsOfDate = data.balanceAsOfDate;

  const mortgage = await prisma.mortgage.update({
    where: {
      id: mortgageId,
      property: { userId: user.id },
    },
    data: updatePayload,
  });

  await recordRateLimit(identifier, "properties:mortgage-patch");
  return NextResponse.json(serializeMortgage(mortgage));
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mortgageId: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "properties:mortgage-delete");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  const { mortgageId } = await params;
  const existing = await getMortgageForUser(mortgageId, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Mortgage not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.mortgage.delete({
      where: {
        id: mortgageId,
        property: { userId: user.id },
      },
    });

    const remainingMortgageCount = await tx.mortgage.count({
      where: { propertyId: existing.propertyId },
    });

    await tx.property.update({
      where: { id: existing.propertyId },
      data: { hasMortgage: remainingMortgageCount > 0 },
    });
  });
  await recordRateLimit(identifier, "properties:mortgage-delete");
  return NextResponse.json({ success: true });
}
