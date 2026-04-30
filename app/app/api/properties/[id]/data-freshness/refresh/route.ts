import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getDataFreshnessRefreshPlanAt } from "@/lib/data-freshness-refresh-plan";
import { fetchRentEstimate, fetchValueEstimate } from "@/lib/integrations/rentcast";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { getEffectiveTier } from "@/lib/plans";
import { getRentCastQuotaState } from "@/lib/rentcast-quota";
import { rentCastErrorResponse, isRentCastNoDataError } from "@/lib/rentcast-route-errors";

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

  const nowMs = Date.now();
  const totalRent = getPropertyTotalRent(property);
  const plan = getDataFreshnessRefreshPlanAt(
    {
      estimatedValueAsOf: property.estimatedValueAsOf,
      isRented: property.isRented,
      totalRent,
      marketRent: property.marketRent != null ? Number(property.marketRent) : null,
      marketRentAsOf: property.marketRentAsOf,
    },
    nowMs
  );

  if (!plan.needsValueRefresh && !plan.needsBenchmarkRefresh) {
    return NextResponse.json({
      refreshed: [] as const,
      skippedReason: "all_fresh" as const,
    });
  }

  const plannedCalls =
    Number(plan.needsValueRefresh) + Number(plan.needsBenchmarkRefresh);
  const tier = getEffectiveTier(user);
  const quota = await getRentCastQuotaState(user.id, tier);
  if (quota.remaining < plannedCalls) {
    return rentCastErrorResponse(
      "You've used your estimate limit for this hour. Try again later.",
      429
    );
  }

  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey?.trim()) {
    return rentCastErrorResponse("Rent estimate service is not configured", 503);
  }

  const pt = property.propertyType as
    | "single_family"
    | "condo"
    | "townhouse"
    | "manufactured"
    | "multi_family"
    | "apartment";

  const refreshed: ("value" | "benchmark")[] = [];
  const asOf = new Date(nowMs);

  if (plan.needsValueRefresh) {
    try {
      const result = await fetchValueEstimate(
        {
          address: property.addressLine1,
          addressLine2: property.addressLine2 ?? undefined,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode,
          propertyType: pt,
        },
        apiKey
      );

      await prisma.property.update({
        where: { id: propertyId, userId: user.id },
        data: {
          currentEstimatedValue: Math.round(result.value),
          estimatedValueAsOf: asOf,
        },
      });

      await prisma.rentCastApiCall.create({
        data: { userId: user.id, userEmail: user.email, propertyId },
      });
      refreshed.push("value");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Value estimate unavailable";
      if (isRentCastNoDataError(message)) {
        return rentCastErrorResponse(message, 422);
      }
      Sentry.captureException(err instanceof Error ? err : new Error(message), {
        tags: { area: "rentcast", route: "data-freshness/refresh", step: "value" },
        extra: { propertyId },
      });
      return rentCastErrorResponse(message, 502);
    }
  }

  if (plan.needsBenchmarkRefresh) {
    try {
      const result = await fetchRentEstimate(
        {
          address: property.addressLine1,
          addressLine2: property.addressLine2 ?? undefined,
          city: property.city,
          state: property.state,
          zipCode: property.zipCode,
          propertyType: pt,
          units: property.units,
        },
        apiKey
      );

      await prisma.property.update({
        where: { id: propertyId, userId: user.id },
        data: {
          marketRent: result.rent,
          marketRentAsOf: asOf,
        },
      });

      await prisma.rentCastApiCall.create({
        data: { userId: user.id, userEmail: user.email, propertyId },
      });
      refreshed.push("benchmark");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Benchmark unavailable";
      if (isRentCastNoDataError(message)) {
        return rentCastErrorResponse(message, 422);
      }
      Sentry.captureException(err instanceof Error ? err : new Error(message), {
        tags: { area: "rentcast", route: "data-freshness/refresh", step: "benchmark" },
        extra: { propertyId },
      });
      return rentCastErrorResponse(message, 502);
    }
  }

  return NextResponse.json({ refreshed });
}
