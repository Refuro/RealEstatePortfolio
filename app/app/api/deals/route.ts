import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createDealSchema } from "@/lib/validations/deal";
import { canAddDeal } from "@/lib/plans";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

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

export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deals = await prisma.savedDeal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(deals.map(serializeDeal));
}

export async function POST(request: NextRequest) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createDealSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const currentCount = await prisma.savedDeal.count({
    where: { userId: user.id },
  });
  if (!canAddDeal(user.subscriptionTier, currentCount)) {
    return NextResponse.json(
      {
        error: "Deal limit reached. Upgrade your plan or remove a deal to save more.",
        code: "PLAN_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const purchasePrice = data.purchasePrice ? parseFloat(data.purchasePrice) : null;
  const currentValue = data.currentEstimatedValue ? parseFloat(data.currentEstimatedValue) : null;
  const rent = parseFloat(data.currentMonthlyRent);
  const expenses = parseFloat(data.currentMonthlyExpenses);
  const mortgageBalance = parseFloat(data.totalMortgageBalance ?? "0");
  const monthlyPayment = parseFloat(data.totalMonthlyPayment ?? "0");
  const cashInvested = data.cashInvested ? parseFloat(data.cashInvested) : null;

  const deal = await prisma.savedDeal.create({
    data: {
      userId: user.id,
      nickname: data.nickname?.trim() || null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2?.trim() || null,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      purchasePrice: purchasePrice ?? undefined,
      currentEstimatedValue: currentValue ?? purchasePrice ?? undefined,
      currentMonthlyRent: rent,
      currentMonthlyExpenses: expenses,
      totalMortgageBalance: mortgageBalance,
      totalMonthlyPayment: monthlyPayment,
      ownershipPercent: data.ownershipPercent ?? 100,
      vacancyPercent: data.vacancyPercent ?? 5,
      cashInvested: cashInvested ?? undefined,
      notes: data.notes?.trim() || null,
    },
  });

  return NextResponse.json(serializeDeal(deal));
}
