import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { getEffectiveBalance, getBalanceSource, getPayoffProjection } from "@/lib/amortization";
import { createMortgageSchema, validateEscrowAmount } from "@/lib/validations/mortgage";
import {
  seedLtvSentinelsForProperty,
  seedPayoffSentinelForMortgage,
  type MortgageMilestoneSentinel,
} from "@/lib/mortgage-milestones";

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

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "properties:mortgage-post");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
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
  const escrowCheck = validateEscrowAmount(data.escrowAmount, data.monthlyPayment);
  if (!escrowCheck.success) {
    return NextResponse.json(
      { error: escrowCheck.error, details: { fieldErrors: { escrowAmount: [escrowCheck.error] } } },
      { status: 400 }
    );
  }

  // Form no longer asks the user for "as of" dates — server stamps them with
  // submission time. Schema fields stay (consumed by balance projection /
  // amortization). Clients may still send explicit values; we fall back to
  // `now` when omitted.
  const now = new Date();
  const escrowAmount = data.escrowAmount ?? null;
  const escrowIncluded =
    escrowAmount != null && parseFloat(escrowAmount) > 0;

  const mortgage = await prisma.$transaction(async (tx) => {
    const created = await tx.mortgage.create({
      data: {
        propertyId,
        originalLoanAmount: data.originalLoanAmount,
        currentBalance: data.currentBalance,
        balanceAsOfDate: data.balanceAsOfDate ?? now,
        interestRate: data.interestRate,
        termYears: data.termYears,
        startDate: data.startDate,
        monthlyPayment: data.monthlyPayment,
        paymentEffectiveDate: data.paymentEffectiveDate ?? now,
        escrowIncluded,
        escrowAmount,
        lenderName: data.lenderName ?? null,
        loanType: data.loanType ?? null,
      },
    });
    await tx.property.update({
      where: { id: propertyId },
      data: { hasMortgage: true, mortgagePaidOff: false },
    });
    return created;
  });

  await recordRateLimit(identifier, "properties:mortgage-post");

  try {
    const estimatedValue = Number(property.currentEstimatedValue);
    if (estimatedValue > 0) {
      const allMortgages = await prisma.mortgage.findMany({
        where: { propertyId },
        select: {
          originalLoanAmount: true,
          currentBalance: true,
          interestRate: true,
          termYears: true,
          startDate: true,
          monthlyPayment: true,
          balanceAsOfDate: true,
          paymentEffectiveDate: true,
          escrowIncluded: true,
          escrowAmount: true,
        },
      });
      const totalBalance = allMortgages.reduce((sum, m) => sum + getEffectiveBalance(m), 0);
      const ltvPercent = (totalBalance / estimatedValue) * 100;
      const nowIso = new Date().toISOString();
      const userRecord = await prisma.user.findUnique({
        where: { id: user.id },
        select: { mortgageMilestonesSentAt: true },
      });
      const existingSentinels = (
        userRecord?.mortgageMilestonesSentAt &&
        typeof userRecord.mortgageMilestonesSentAt === "object"
          ? userRecord.mortgageMilestonesSentAt
          : {}
      ) as MortgageMilestoneSentinel;
      const seeds: Record<string, string> = {
        ...seedLtvSentinelsForProperty(propertyId, ltvPercent, existingSentinels, nowIso),
        ...seedPayoffSentinelForMortgage(propertyId, mortgage.id, mortgage, existingSentinels, nowIso),
      };
      if (Object.keys(seeds).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { mortgageMilestonesSentAt: { ...existingSentinels, ...seeds } },
        });
      }
    }
  } catch (sentinelErr) {
    console.error("Failed to seed mortgage milestone sentinels:", sentinelErr);
  }

  return NextResponse.json(serializeMortgage(mortgage));
}
