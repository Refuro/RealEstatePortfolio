import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAppUser } from "@/lib/auth";
import { fetchRentEstimate } from "@/lib/integrations/rentcast";
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
  propertyType: z.enum(["single_family", "multi_family"]).optional(),
  units: z.coerce.number().int().min(1).max(999).optional(),
});

export async function GET(req: NextRequest) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      },
      apiKey
    );
    return NextResponse.json({ rent: result.rent });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Estimate unavailable";
    return NextResponse.json({ error: message }, { status: 200 });
  }
}
