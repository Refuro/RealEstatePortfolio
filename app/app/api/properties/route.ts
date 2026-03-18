import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createPropertySchema } from "@/lib/validations/property";
import { createMortgageSchema } from "@/lib/validations/mortgage";
import { canAddProperty, getEffectiveTier } from "@/lib/plans";

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const properties = await prisma.property.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { mortgages: true },
  });

  type PropertyWithMortgages = (typeof properties)[number];
  type MortgageItem = PropertyWithMortgages["mortgages"][number];
  return NextResponse.json(
    properties.map((p: PropertyWithMortgages) => ({
      ...p,
      purchasePrice: p.purchasePrice.toString(),
      purchaseDate: p.purchaseDate.toISOString().slice(0, 10),
      currentEstimatedValue: p.currentEstimatedValue.toString(),
      currentMonthlyRent: p.currentMonthlyRent.toString(),
      unitRents: p.unitRents as number[] | null,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms?.toString() ?? null,
      unitMix: p.unitMix,
      currentMonthlyExpenses: p.currentMonthlyExpenses.toString(),
      cashInvested: p.cashInvested?.toString() ?? null,
      marketRent: (p as { marketRent?: { toString(): string } | null }).marketRent?.toString() ?? null,
      marketRentAsOf: (p as { marketRentAsOf?: Date | null }).marketRentAsOf?.toISOString().slice(0, 10) ?? null,
      ownershipPercent: p.ownershipPercent ?? 100,
      mortgages: p.mortgages.map((m: MortgageItem) => ({
        ...m,
        originalLoanAmount: m.originalLoanAmount.toString(),
        currentBalance: m.currentBalance.toString(),
        interestRate: m.interestRate.toString(),
        monthlyPayment: m.monthlyPayment.toString(),
        startDate: m.startDate.toISOString().slice(0, 10),
        paymentEffectiveDate: m.paymentEffectiveDate?.toISOString().slice(0, 10) ?? null,
      })),
    }))
  );
}

export async function POST(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bodyObj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : {};
  const { mortgage: mortgagePayload, ...propertyBody } = bodyObj;

  const parsed = createPropertySchema.safeParse(propertyBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  let mortgageData: {
    originalLoanAmount: string;
    currentBalance: string;
    balanceAsOfDate: Date | null;
    interestRate: string;
    termYears: number;
    startDate: Date;
    monthlyPayment: string;
    paymentEffectiveDate: Date | null;
    escrowIncluded: boolean;
    escrowAmount: string | null;
    lenderName: string | null;
    loanType: string | null;
  } | null = null;
  if (mortgagePayload != null && typeof mortgagePayload === "object") {
    const mortgageParsed = createMortgageSchema.safeParse(mortgagePayload);
    if (!mortgageParsed.success) {
      return NextResponse.json(
        { error: "Mortgage validation failed", details: mortgageParsed.error.flatten() },
        { status: 400 }
      );
    }
    const m = mortgageParsed.data;
    mortgageData = {
      originalLoanAmount: m.originalLoanAmount,
      currentBalance: m.currentBalance,
      balanceAsOfDate: m.balanceAsOfDate ?? null,
      interestRate: m.interestRate,
      termYears: m.termYears,
      startDate: m.startDate,
      monthlyPayment: m.monthlyPayment,
      paymentEffectiveDate: m.paymentEffectiveDate ?? null,
      escrowIncluded: m.escrowIncluded,
      escrowAmount: m.escrowAmount ?? null,
      lenderName: m.lenderName ?? null,
      loanType: m.loanType ?? null,
    };
  }

  const currentCount = await prisma.property.count({
    where: { userId: user.id },
  });
  if (!canAddProperty(getEffectiveTier(user), currentCount)) {
    return NextResponse.json(
      {
        error: "Property limit reached. Upgrade your plan or remove a property to add more.",
        code: "PLAN_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const unitRents = data.unitRents;
  const totalRent: number =
    Array.isArray(unitRents) && unitRents.length > 0
      ? unitRents.reduce((a: number, b: number) => a + b, 0)
      : Number(data.currentMonthlyRent) || 0;
  let unitRentsJson: number[] | null;
  if (Array.isArray(unitRents) && unitRents.length > 0) {
    unitRentsJson = unitRents;
  } else if (["single_family", "condo", "townhouse", "manufactured"].includes(data.propertyType)) {
    unitRentsJson = [Number(totalRent)];
  } else {
    const n = data.units || 1;
    const perUnit = Math.round((Number(totalRent) / n) * 100) / 100;
    unitRentsJson = Array(n).fill(perUnit);
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
      ownershipPercent: data.ownershipPercent ?? 100,
      purchasePrice: data.purchasePrice,
      purchaseDate: data.purchaseDate,
      currentEstimatedValue: data.currentEstimatedValue,
      currentMonthlyRent: totalRent,
      unitRents: unitRentsJson,
      bedrooms: data.bedrooms ?? null,
      bathrooms: data.bathrooms ?? null,
      unitMix: data.unitMix ?? null,
      currentMonthlyExpenses: data.currentMonthlyExpenses,
      vacancyPercent: data.vacancyPercent ?? 5,
      cashInvested: data.cashInvested ?? null,
      notes: data.notes ?? null,
      marketRent: data.marketRent ?? null,
      marketRentAsOf: data.marketRentAsOf ? new Date(data.marketRentAsOf) : null,
    },
  });

  if (mortgageData) {
    await prisma.mortgage.create({
      data: {
        propertyId: property.id,
        ...mortgageData,
      },
    });
  }

  return NextResponse.json({
    ...property,
    purchasePrice: property.purchasePrice.toString(),
    purchaseDate: property.purchaseDate.toISOString().slice(0, 10),
    currentEstimatedValue: property.currentEstimatedValue.toString(),
    currentMonthlyRent: property.currentMonthlyRent.toString(),
    unitRents: property.unitRents as number[] | null,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms?.toString() ?? null,
    unitMix: property.unitMix,
    currentMonthlyExpenses: property.currentMonthlyExpenses.toString(),
    cashInvested: property.cashInvested?.toString() ?? null,
  });
}
