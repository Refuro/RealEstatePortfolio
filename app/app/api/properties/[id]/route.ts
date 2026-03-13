import { NextRequest, NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updatePropertySchema } from "@/lib/validations/property";

async function getPropertyForUser(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: { mortgages: true },
  });
}

function serializeProperty(p: {
  id: string;
  userId: string;
  nickname: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  units: number;
  purchasePrice: { toString(): string };
  purchaseDate: Date;
  currentEstimatedValue: { toString(): string };
  currentMonthlyRent: { toString(): string };
  currentMonthlyExpenses: { toString(): string };
  cashInvested: { toString(): string } | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  mortgages: Array<{
    id: string;
    originalLoanAmount: { toString(): string };
    currentBalance: { toString(): string };
    interestRate: { toString(): string };
    monthlyPayment: { toString(): string };
    startDate: Date;
    [key: string]: unknown;
  }>;
}) {
  return {
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
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const property = await getPropertyForUser(id, user.id);
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json(serializeProperty(property));
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getPropertyForUser(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updatePropertySchema.safeParse(body);
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
  if (data.propertyType !== undefined) updatePayload.propertyType = data.propertyType;
  if (data.units !== undefined) updatePayload.units = data.units;
  if (data.purchasePrice !== undefined) updatePayload.purchasePrice = data.purchasePrice;
  if (data.purchaseDate !== undefined) updatePayload.purchaseDate = data.purchaseDate;
  if (data.currentEstimatedValue !== undefined) updatePayload.currentEstimatedValue = data.currentEstimatedValue;
  if (data.currentMonthlyRent !== undefined) updatePayload.currentMonthlyRent = data.currentMonthlyRent;
  if (data.currentMonthlyExpenses !== undefined) updatePayload.currentMonthlyExpenses = data.currentMonthlyExpenses;
  if (data.cashInvested !== undefined) updatePayload.cashInvested = data.cashInvested;
  if (data.notes !== undefined) updatePayload.notes = data.notes;

  const property = await prisma.property.update({
    where: { id },
    data: updatePayload,
    include: { mortgages: true },
  });

  return NextResponse.json(serializeProperty(property));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await getPropertyForUser(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
