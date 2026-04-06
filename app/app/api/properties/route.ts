import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { createPropertySchema } from "@/lib/validations/property";
import { serializePropertyForApi } from "@/lib/serialize/property-api";
import {
  createMortgageSchema,
  validateEscrowAmount,
} from "@/lib/validations/mortgage";
import { canAddProperty, getEffectiveTier } from "@/lib/plans";

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const properties = await prisma.property.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { mortgages: true },
    });

    type PropertyWithMortgages = (typeof properties)[number];
    return NextResponse.json(
      properties.map((p: PropertyWithMortgages) => serializePropertyForApi(p))
    );
  } catch (err) {
    console.error("Property list error:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Property list failed"), {
      tags: { route: "api/properties", userId: user.id },
    });
    return NextResponse.json({ error: "Failed to load properties" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "properties:create");
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
    const escrowStr =
      m.escrowAmount != null && m.escrowAmount !== ""
        ? String(m.escrowAmount)
        : null;
    const escrowCheck = validateEscrowAmount(escrowStr, m.monthlyPayment);
    if (!escrowCheck.success) {
      return NextResponse.json(
        { error: escrowCheck.error, details: { fieldErrors: { "mortgage.escrowAmount": [escrowCheck.error] } } },
        { status: 400 }
      );
    }
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
  const createdFirstProperty = currentCount === 0;
  if (!canAddProperty(getEffectiveTier(user), currentCount)) {
    return NextResponse.json(
      {
        error: "Property limit reached. Upgrade your plan or remove a property to add more.",
        code: "PLAN_LIMIT_REACHED",
      },
      { status: 403 }
    );
  }

  const isRented = data.isRented ?? true;
  const unitRents = data.unitRents;
  const parsedRent: number =
    Array.isArray(unitRents) && unitRents.length > 0
      ? unitRents.reduce((a: number, b: number) => a + b, 0)
      : Number(data.currentMonthlyRent) || 0;
  const totalRent = isRented ? parsedRent : 0;
  let unitRentsJson: number[] | null;
  if (!isRented) {
    unitRentsJson = null;
  } else if (Array.isArray(unitRents) && unitRents.length > 0) {
    unitRentsJson = unitRents;
  } else if (["single_family", "condo", "townhouse", "manufactured"].includes(data.propertyType)) {
    unitRentsJson = [Number(totalRent)];
  } else {
    const n = data.units || 1;
    const perUnit = Math.round((Number(totalRent) / n) * 100) / 100;
    unitRentsJson = Array(n).fill(perUnit);
  }

  try {
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
        isRented,
        unitRents: unitRentsJson ?? Prisma.DbNull,
        bedrooms: data.bedrooms ?? null,
        bathrooms: data.bathrooms ?? null,
        squareFeet: data.squareFeet ?? null,
        currentMonthlyExpenses: data.currentMonthlyExpenses,
        vacancyPercent: data.vacancyPercent ?? 5,
        cashInvested: data.cashInvested ?? null,
        notes: data.notes ?? null,
        marketRent: data.marketRent ?? null,
        marketRentAsOf: data.marketRentAsOf ? new Date(data.marketRentAsOf) : null,
        hasMortgage: data.hasMortgage ?? null,
      },
    });

    if (mortgageData) {
      await prisma.mortgage.create({
        data: {
          propertyId: property.id,
          ...mortgageData,
        },
      });
      await prisma.property.update({
        where: { id: property.id },
        data: { hasMortgage: true },
      });
    }

    await recordRateLimit(identifier, "properties:create");

    const full = await prisma.property.findUnique({
      where: { id: property.id },
      include: { mortgages: true },
    });
    if (!full) {
      return NextResponse.json({ error: "Failed to load property" }, { status: 500 });
    }

    return NextResponse.json({
      ...serializePropertyForApi(full),
      createdFirstProperty,
    });
  } catch (err) {
    console.error("Property create error:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Property create failed"), {
      tags: { route: "api/properties", userId: user.id },
    });
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
