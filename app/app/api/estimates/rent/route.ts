import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchRentEstimate } from "@/lib/integrations/rentcast";
import { getRentCastHourlyLimit, getEffectiveTier } from "@/lib/plans";
import { US_STATES } from "@/lib/us-states";

const rentEstimateQuerySchema = z.object({
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
  units: z.coerce.number().int().min(1).max(999).optional(),
  bedrooms: z.coerce.number().int().min(1).max(10).optional(),
  bathrooms: z.coerce.number().min(0.5).max(10).optional(),
  propertyId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { searchParams } = new URL(req.url);
  const parsed = rentEstimateQuerySchema.safeParse({
    addressLine1: searchParams.get("addressLine1") ?? "",
    addressLine2: searchParams.get("addressLine2") ?? undefined,
    city: searchParams.get("city") ?? "",
    state: searchParams.get("state") ?? "",
    zipCode: searchParams.get("zipCode") ?? "",
    propertyType: searchParams.get("propertyType") ?? undefined,
    units: searchParams.get("units") ?? undefined,
    bedrooms: searchParams.get("bedrooms") ?? undefined,
    bathrooms: searchParams.get("bathrooms") ?? undefined,
    propertyId: searchParams.get("propertyId") ?? undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg = Object.values(first).flat().find(Boolean) ?? "Invalid parameters";
    return NextResponse.json({ error: msg }, { status: 400 });
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
        address: parsed.data.addressLine1,
        addressLine2: parsed.data.addressLine2,
        city: parsed.data.city,
        state: parsed.data.state,
        zipCode: parsed.data.zipCode,
        propertyType: parsed.data.propertyType,
        units: parsed.data.units,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
      },
      apiKey
    );
    const now = new Date();
    if (parsed.data.propertyId) {
      await prisma.property.updateMany({
        where: { id: parsed.data.propertyId, userId: user.id },
        data: { marketRent: result.rent, marketRentAsOf: now },
      });
    }
    await prisma.rentCastApiCall.create({
      data: { userId: user.id, propertyId: parsed.data.propertyId ?? null },
    });
    const marketRentAsOfStr = now.toISOString().slice(0, 10);
    return NextResponse.json({
      rent: result.rent,
      marketRent: result.rent,
      marketRentAsOf: marketRentAsOfStr,
    });
  } catch (err) {
    await prisma.rentCastApiCall.create({
      data: { userId: user.id },
    }).catch(() => {});
    const message = err instanceof Error ? err.message : "Estimate unavailable";
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
