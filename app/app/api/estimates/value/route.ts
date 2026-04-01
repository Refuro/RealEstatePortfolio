import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchValueEstimate } from "@/lib/integrations/rentcast";
import { getRentCastHourlyLimit, getEffectiveTier } from "@/lib/plans";
import { US_STATES } from "@/lib/us-states";
import { rentCastErrorResponse } from "@/lib/rentcast-route-errors";

const valueEstimateQuerySchema = z.object({
  addressLine1: z.string().min(1, "Address is required").max(300),
  addressLine2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z
    .string()
    .min(1, "State is required")
    .refine(
      (s) => US_STATES.includes(s.toUpperCase() as (typeof US_STATES)[number]),
      "Invalid state"
    )
    .transform((s) => s.toUpperCase()),
  zipCode: z.string().min(1, "ZIP is required").max(20),
  propertyType: z
    .enum(["single_family", "condo", "townhouse", "manufactured", "multi_family", "apartment"])
    .optional(),
  squareFootage: z.preprocess(
    (v) => {
      if (v === "" || v === undefined || v === null) return undefined;
      const n = typeof v === "number" ? v : parseInt(String(v), 10);
      return Number.isFinite(n) ? n : undefined;
    },
    z.number().int().min(100).max(500_000).optional()
  ),
});

export async function GET(req: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tier = getEffectiveTier(user);
  const hourlyLimit = getRentCastHourlyLimit(tier);
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  // Shared hourly pool with rent estimate + benchmark refresh (see docs/reference/rentcast-quota.md).
  const recentCallCount = await prisma.rentCastApiCall.count({
    where: { userId: user.id, createdAt: { gte: oneHourAgo } },
  });
  if (recentCallCount >= hourlyLimit) {
    return rentCastErrorResponse(
      "You've used your estimate limit for this hour. Try again later.",
      429
    );
  }

  const { searchParams } = new URL(req.url);
  const parsed = valueEstimateQuerySchema.safeParse({
    addressLine1: searchParams.get("addressLine1") ?? "",
    addressLine2: searchParams.get("addressLine2") ?? undefined,
    city: searchParams.get("city") ?? "",
    state: searchParams.get("state") ?? "",
    zipCode: searchParams.get("zipCode") ?? "",
    propertyType: searchParams.get("propertyType") ?? undefined,
    squareFootage: searchParams.get("squareFootage") ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.values(first).flat().find(Boolean) ?? "Invalid parameters";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey?.trim()) {
    return rentCastErrorResponse("Value estimate service is not configured", 503);
  }

  try {
    const result = await fetchValueEstimate(
      {
        address: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2,
        city: parsed.data.city,
        state: parsed.data.state,
        zipCode: parsed.data.zipCode,
        propertyType: parsed.data.propertyType,
        squareFootage: parsed.data.squareFootage,
      },
      apiKey
    );
    await prisma.rentCastApiCall.create({
      data: { userId: user.id },
    });
    return NextResponse.json({ value: result.value });
  } catch (err) {
    // Hourly quota counts only successful provider calls (recorded above).
    const message = err instanceof Error ? err.message : "Estimate unavailable";
    Sentry.captureException(err instanceof Error ? err : new Error(message), {
      tags: { area: "rentcast", route: "estimates/value" },
    });
    return rentCastErrorResponse(message, 502);
  }
}
