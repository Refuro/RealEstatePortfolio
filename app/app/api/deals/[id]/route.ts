import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateDealSchema } from "@/lib/validations/deal";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

async function getDealForUser(dealId: string, userId: string) {
  return prisma.savedDeal.findFirst({
    where: { id: dealId, userId },
  });
}

function serializeDeal(deal: {
  id: string;
  userId: string;
  nickname: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  purchasePrice: { toString(): string } | null;
  currentEstimatedValue: { toString(): string } | null;
  currentMonthlyRent: { toString(): string };
  currentMonthlyExpenses: { toString(): string };
  totalMortgageBalance: { toString(): string };
  totalMonthlyPayment: { toString(): string };
  ownershipPercent: number;
  vacancyPercent: number;
  cashInvested: { toString(): string } | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  const rent = parseFloat(deal.currentMonthlyRent.toString());
  const expenses = parseFloat(deal.currentMonthlyExpenses.toString());
  const value = deal.currentEstimatedValue
    ? parseFloat(deal.currentEstimatedValue.toString())
    : deal.purchasePrice
      ? parseFloat(deal.purchasePrice.toString())
      : 0;
  const mortgageBalance = parseFloat(deal.totalMortgageBalance.toString());
  const monthlyPayment = parseFloat(deal.totalMonthlyPayment.toString());
  const cashInvested = deal.cashInvested ? parseFloat(deal.cashInvested.toString()) : null;

  const metrics = computePropertyMetrics(
    {
      monthlyRent: rent,
      monthlyExpenses: expenses,
      estimatedValue: value,
      cashInvested,
      totalMortgageBalance: mortgageBalance,
      totalMonthlyPayment: monthlyPayment,
      ownershipPercent: deal.ownershipPercent ?? 100,
      vacancyPercent: deal.vacancyPercent ?? 5,
    },
    "proportional"
  );

  return {
    id: deal.id,
    userId: deal.userId,
    nickname: deal.nickname,
    addressLine1: deal.addressLine1,
    addressLine2: deal.addressLine2,
    city: deal.city,
    state: deal.state,
    zipCode: deal.zipCode,
    purchasePrice: deal.purchasePrice?.toString() ?? null,
    currentEstimatedValue: deal.currentEstimatedValue?.toString() ?? null,
    currentMonthlyRent: deal.currentMonthlyRent.toString(),
    currentMonthlyExpenses: deal.currentMonthlyExpenses.toString(),
    totalMortgageBalance: deal.totalMortgageBalance.toString(),
    totalMonthlyPayment: deal.totalMonthlyPayment.toString(),
    ownershipPercent: deal.ownershipPercent ?? 100,
    vacancyPercent: deal.vacancyPercent ?? 5,
    cashInvested: deal.cashInvested?.toString() ?? null,
    notes: deal.notes,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
    metrics,
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

  const { id } = await params;
  const deal = await getDealForUser(id, user.id);
  if (!deal) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  return NextResponse.json(serializeDeal(deal));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getDealForUser(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateDealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const updatePayload: Record<string, unknown> = {};

  if (data.nickname !== undefined) updatePayload.nickname = data.nickname;
  if (data.addressLine1 !== undefined) updatePayload.addressLine1 = data.addressLine1;
  if (data.addressLine2 !== undefined) updatePayload.addressLine2 = data.addressLine2;
  if (data.city !== undefined) updatePayload.city = data.city;
  if (data.state !== undefined) updatePayload.state = data.state;
  if (data.zipCode !== undefined) updatePayload.zipCode = data.zipCode;
  if (data.purchasePrice !== undefined) updatePayload.purchasePrice = data.purchasePrice ? parseFloat(data.purchasePrice) : null;
  if (data.currentEstimatedValue !== undefined) updatePayload.currentEstimatedValue = data.currentEstimatedValue ? parseFloat(data.currentEstimatedValue) : null;
  if (data.currentMonthlyRent !== undefined) updatePayload.currentMonthlyRent = parseFloat(data.currentMonthlyRent);
  if (data.currentMonthlyExpenses !== undefined) updatePayload.currentMonthlyExpenses = parseFloat(data.currentMonthlyExpenses);
  if (data.totalMortgageBalance !== undefined) updatePayload.totalMortgageBalance = parseFloat(data.totalMortgageBalance ?? "0");
  if (data.totalMonthlyPayment !== undefined) updatePayload.totalMonthlyPayment = parseFloat(data.totalMonthlyPayment ?? "0");
  if (data.ownershipPercent !== undefined) updatePayload.ownershipPercent = data.ownershipPercent;
  if (data.vacancyPercent !== undefined) updatePayload.vacancyPercent = data.vacancyPercent;
  if (data.cashInvested !== undefined) updatePayload.cashInvested = data.cashInvested ? parseFloat(data.cashInvested) : null;
  if (data.notes !== undefined) updatePayload.notes = data.notes;

  const deal = await prisma.savedDeal.update({
    where: { id },
    data: updatePayload,
  });

  return NextResponse.json(serializeDeal(deal));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getDealForUser(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Deal not found" }, { status: 404 });
  }

  await prisma.savedDeal.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
