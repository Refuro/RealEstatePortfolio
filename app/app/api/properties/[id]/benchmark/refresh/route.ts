import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchRentEstimate } from "@/lib/integrations/rentcast";
import { getRentCastHourlyLimit, getEffectiveTier } from "@/lib/plans";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { rentCastErrorResponse, isRentCastNoDataError } from "@/lib/rentcast-route-errors";
import { getBenchmarkPct } from "@/lib/benchmark-utils";

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
  // Shared hourly pool with rent/value estimate routes (see docs/reference/rentcast-quota.md).
  const recentCallCount = await prisma.rentCastApiCall.count({
    where: { userId: user.id, createdAt: { gte: oneHourAgo } },
  });
  if (recentCallCount >= hourlyLimit) {
    return rentCastErrorResponse(
      "You've used your estimate limit for this hour. Try again later.",
      429
    );
  }

  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey?.trim()) {
    return rentCastErrorResponse("Rent estimate service is not configured", 503);
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
      },
      apiKey
    );

    const now = new Date();
    await prisma.property.update({
      where: { id: propertyId, userId: user.id },
      data: { marketRent: result.rent, marketRentAsOf: now },
    });

    await prisma.rentCastApiCall.create({
      data: { userId: user.id, userEmail: user.email, propertyId },
    });

    const totalRent = getPropertyTotalRent(property);
    const marketRent = result.rent;
    const pctAboveBelow = getBenchmarkPct(totalRent, marketRent);

    return NextResponse.json({
      marketRent,
      marketRentAsOf: now.toISOString().slice(0, 10),
      pctAboveBelow,
    });
  } catch (err) {
    // Quota: only successful upstream calls record RentCastApiCall (see try block).
    const message = err instanceof Error ? err.message : "Benchmark unavailable";
    if (isRentCastNoDataError(message)) {
      return rentCastErrorResponse(message, 422);
    }
    Sentry.captureException(err instanceof Error ? err : new Error(message), {
      tags: { area: "rentcast", route: "benchmark/refresh" },
      extra: { propertyId },
    });
    return rentCastErrorResponse(message, 502);
  }
}
