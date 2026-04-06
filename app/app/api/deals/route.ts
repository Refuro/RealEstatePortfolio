import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { createDealSchema } from "@/lib/validations/deal";
import { canAddDeal, getDealLimit, getEffectiveTier } from "@/lib/plans";
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
  bedrooms: number | null;
  bathrooms: { toString(): string } | null;
  squareFeet: number | null;
  propertyType: string | null;
  marketRent: { toString(): string } | null;
  marketRentAsOf: Date | null;
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
    bedrooms: deal.bedrooms,
    bathrooms: deal.bathrooms != null ? parseFloat(deal.bathrooms.toString()) : null,
    squareFeet: deal.squareFeet,
    propertyType: deal.propertyType,
    marketRent: deal.marketRent?.toString() ?? null,
    marketRentAsOf: deal.marketRentAsOf ? deal.marketRentAsOf.toISOString().slice(0, 10) : null,
    createdAt: deal.createdAt.toISOString(),
    updatedAt: deal.updatedAt.toISOString(),
    metrics,
  };
}

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dealLimit = getDealLimit(getEffectiveTier(user));
    const dealCountTotal = await prisma.savedDeal.count({
      where: { userId: user.id },
    });

    const deals = await prisma.savedDeal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const exceedsPlanUiCap = dealCountTotal > dealLimit;

    return NextResponse.json(deals.map(serializeDeal), {
      headers: {
        "X-Veld-Deal-Count-Total": String(dealCountTotal),
        "X-Veld-Plan-Deal-Limit": String(dealLimit),
        "X-Veld-Deals-Exceeds-Plan-Ui-Cap": exceedsPlanUiCap ? "true" : "false",
      },
    });
  } catch (err) {
    console.error("Deals list error:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Deals list failed"), {
      tags: { route: "api/deals", userId: user.id },
    });
    return NextResponse.json({ error: "Failed to load deals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "deals:create");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
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
  if (!canAddDeal(getEffectiveTier(user), currentCount)) {
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

  try {
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
        bedrooms: data.bedrooms ?? undefined,
        bathrooms: data.bathrooms ?? undefined,
        squareFeet: data.squareFeet ?? undefined,
        propertyType: data.propertyType ?? undefined,
        marketRent: data.marketRent ? parseFloat(data.marketRent) : undefined,
        marketRentAsOf: data.marketRentAsOf ? new Date(data.marketRentAsOf) : undefined,
      },
    });

    await recordRateLimit(identifier, "deals:create");

    return NextResponse.json(serializeDeal(deal));
  } catch (err) {
    console.error("Deal create error:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Deal create failed"), {
      tags: { route: "api/deals", userId: user.id },
    });
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
