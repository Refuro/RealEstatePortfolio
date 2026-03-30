import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { updatePropertySchema } from "@/lib/validations/property";
import { serializePropertyForApi } from "@/lib/serialize/property-api";

async function getPropertyForUser(propertyId: string, userId: string) {
  return prisma.property.findFirst({
    where: { id: propertyId, userId },
    include: { mortgages: true },
  });
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
  const property = await getPropertyForUser(id, user.id);
  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  return NextResponse.json(serializePropertyForApi(property));
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
  const singleUnitTypes = ["single_family", "condo", "townhouse", "manufactured"];
  const effectiveType = data.propertyType ?? existing.propertyType;
  if (
    data.units !== undefined &&
    singleUnitTypes.includes(effectiveType) &&
    data.units !== 1
  ) {
    return NextResponse.json(
      { error: "Units must be 1 for this property type" },
      { status: 400 }
    );
  }
  const updatePayload: Record<string, unknown> = {};
  if (data.nickname !== undefined) updatePayload.nickname = data.nickname;
  if (data.addressLine1 !== undefined) updatePayload.addressLine1 = data.addressLine1;
  if (data.addressLine2 !== undefined) updatePayload.addressLine2 = data.addressLine2;
  if (data.city !== undefined) updatePayload.city = data.city;
  if (data.state !== undefined) updatePayload.state = data.state;
  if (data.zipCode !== undefined) updatePayload.zipCode = data.zipCode;
  if (data.propertyType !== undefined) updatePayload.propertyType = data.propertyType;
  if (data.units !== undefined) updatePayload.units = data.units;
  if (data.ownershipPercent !== undefined) updatePayload.ownershipPercent = data.ownershipPercent;
  if (data.purchasePrice !== undefined) updatePayload.purchasePrice = data.purchasePrice;
  if (data.purchaseDate !== undefined) updatePayload.purchaseDate = data.purchaseDate;
  if (data.currentEstimatedValue !== undefined) updatePayload.currentEstimatedValue = data.currentEstimatedValue;
  if (data.currentMonthlyRent !== undefined) updatePayload.currentMonthlyRent = data.currentMonthlyRent;
  if (data.isRented !== undefined) updatePayload.isRented = data.isRented;
  if (data.unitRents !== undefined) {
    const arr = data.unitRents;
    if (Array.isArray(arr) && arr.length > 0) {
      updatePayload.unitRents = arr;
      updatePayload.currentMonthlyRent = arr.reduce((a: number, b: number) => a + b, 0);
    }
  }
  if (data.bedrooms !== undefined) updatePayload.bedrooms = data.bedrooms;
  if (data.bathrooms !== undefined) updatePayload.bathrooms = data.bathrooms;
  if (data.unitMix !== undefined) updatePayload.unitMix = data.unitMix;
  if (data.squareFeet !== undefined) updatePayload.squareFeet = data.squareFeet;
  if (data.currentMonthlyExpenses !== undefined) updatePayload.currentMonthlyExpenses = data.currentMonthlyExpenses;
  if (data.vacancyPercent !== undefined) updatePayload.vacancyPercent = data.vacancyPercent;
  if (data.cashInvested !== undefined) updatePayload.cashInvested = data.cashInvested;
  if (data.notes !== undefined) updatePayload.notes = data.notes;
  if (data.marketRent !== undefined) updatePayload.marketRent = data.marketRent;
  if (data.marketRentAsOf !== undefined) updatePayload.marketRentAsOf = data.marketRentAsOf;

  if (data.currentMonthlyRent !== undefined && !(data.unitRents !== undefined && Array.isArray(data.unitRents) && data.unitRents.length > 0)) {
    const total = Number(data.currentMonthlyRent) || 0;
    const units = Number(updatePayload.units ?? existing.units) || 1;
    if (["single_family", "condo", "townhouse", "manufactured"].includes(effectiveType)) {
      updatePayload.unitRents = [total];
    } else {
      const perUnit = Math.round((total / units) * 100) / 100;
      updatePayload.unitRents = Array(units).fill(perUnit);
    }
  }
  const effectiveIsRented = (updatePayload.isRented ?? existing.isRented) as boolean;
  if (!effectiveIsRented) {
    updatePayload.currentMonthlyRent = 0;
    updatePayload.unitRents = Prisma.DbNull;
  }

  const property = await prisma.property.update({
    where: { id },
    data: updatePayload,
    include: { mortgages: true },
  });

  return NextResponse.json(serializePropertyForApi(property));
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
  const existing = await getPropertyForUser(id, user.id);
  if (!existing) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  await prisma.property.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
