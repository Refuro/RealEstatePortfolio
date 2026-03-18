import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchRentEstimate } from "@/lib/integrations/rentcast";
import { getRentCastHourlyLimit, getEffectiveTier } from "@/lib/plans";
import { getPropertyTotalRent } from "@/lib/property-utils";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: propertyId } = await params;
  const property = await prisma.property.findFirst({
    where: { id: propertyId, userId: user.id },
  });

  if (!property) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const tier = getEffectiveTier(user);
  const hourlyLimit = getRentCastHourlyLimit(tier);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCallCount = await prisma.rentCastApiCall.count({
    where: { userId: user.id, createdAt: { gte: oneHourAgo } },
  });
  if (recentCallCount >= hourlyLimit) {
    return NextResponse.json(
      { error: "You've used your estimate limit for this hour. Try again later." },
      { status: 429 }
    );
  }

  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Rent estimate service is not configured" },
      { status: 503 }
    );
  }

  try {
    const result = await fetchRentEstimate(
      {
        address: property.addressLine1,
        addressLine2: property.addressLine2 ?? undefined,
        city: property.city,
        state: property.state,
        zipCode: property.zipCode,
        propertyType: property.propertyType as "single_family" | "condo" | "townhouse" | "manufactured" | "multi_family" | "apartment",
        units: property.units,
        bedrooms: property.bedrooms ?? undefined,
        bathrooms: property.bathrooms != null ? Number(property.bathrooms) : undefined,
      },
      apiKey
    );

    const now = new Date();
    await prisma.property.update({
      where: { id: propertyId },
      data: { marketRent: result.rent, marketRentAsOf: now },
    });

    await prisma.rentCastApiCall.create({
      data: { userId: user.id, propertyId },
    });

    const totalRent = getPropertyTotalRent(property);
    const marketRent = result.rent;
    const pctAboveBelow =
      marketRent > 0 ? ((totalRent - marketRent) / marketRent) * 100 : 0;

    return NextResponse.json({
      marketRent,
      marketRentAsOf: now.toISOString().slice(0, 10),
      pctAboveBelow,
    });
  } catch (err) {
    await prisma.rentCastApiCall.create({
      data: { userId: user.id, propertyId },
    }).catch(() => {});
    const message = err instanceof Error ? err.message : "Benchmark unavailable";
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
