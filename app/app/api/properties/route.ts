import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPropertySchema } from "@/lib/validations/property";
import { canAddProperty } from "@/lib/plans";

export async function GET() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { mortgages: true },
  });

  return NextResponse.json(
    properties.map((p) => ({
      ...p,
      purchasePrice: p.purchasePrice.toString(),
      purchaseDate: p.purchaseDate.toISOString().slice(0, 10),
      currentEstimatedValue: p.currentEstimatedValue.toString(),
      currentMonthlyRent: p.currentMonthlyRent.toString(),
      currentMonthlyExpenses: p.currentMonthlyExpenses.toString(),
      cashInvested: p.cashInvested?.toString() ?? null,
      mortgages: p.mortgages.map((m) => ({
        ...m,
        originalLoanAmount: m.originalLoanAmount.toString(),
        currentBalance: m.currentBalance.toString(),
        interestRate: m.interestRate.toString(),
        monthlyPayment: m.monthlyPayment.toString(),
        startDate: m.startDate.toISOString().slice(0, 10),
      })),
    }))
  );
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

  const parsed = createPropertySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const currentCount = await prisma.property.count({
    where: { userId: user.id },
  });
  if (!canAddProperty(user.subscriptionTier, currentCount)) {
    return NextResponse.json(
      {
        error: "Property limit reached for your plan. Upgrade to add more properties.",
        code: "PLAN_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const property = await prisma.property.create({
    data: {
      userId: user.id,
      nickname: data.nickname ?? null,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2 ?? null,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      propertyType: data.propertyType,
      units: data.units,
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate,
      currentEstimatedValue: data.currentEstimatedValue,
      currentMonthlyRent: data.currentMonthlyRent,
      currentMonthlyExpenses: data.currentMonthlyExpenses,
      cashInvested: data.cashInvested ?? null,
      notes: data.notes ?? null,
    },
  });

  return NextResponse.json({
    ...property,
    purchasePrice: property.purchasePrice.toString(),
    purchaseDate: property.purchaseDate.toISOString().slice(0, 10),
    currentEstimatedValue: property.currentEstimatedValue.toString(),
    currentMonthlyRent: property.currentMonthlyRent.toString(),
    currentMonthlyExpenses: property.currentMonthlyExpenses.toString(),
    cashInvested: property.cashInvested?.toString() ?? null,
  });
}
