import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { getActiveAppUser } from "@/lib/auth";
import { checkRateLimit, getRateLimitIdentifier, recordRateLimit } from "@/lib/rate-limit";

const querySchema = z.object({
  placeId: z.string().trim().min(1, "Place ID is required").max(255),
});

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GooglePlaceDetailsResponse = {
  status: string;
  error_message?: string;
  result?: {
    address_components?: GoogleAddressComponent[];
  };
};

function getAddressComponent(
  components: GoogleAddressComponent[],
  type: string
): GoogleAddressComponent | undefined {
  return components.find((component) => component.types.includes(type));
}

export async function GET(req: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, req);
  const { allowed } = await checkRateLimit(identifier, "places:details");
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    placeId: searchParams.get("placeId") ?? "",
  });
  if (!parsed.success) {
    const msg =
      parsed.error.flatten().fieldErrors.placeId?.[0] ?? "Invalid parameters";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json(
      { error: "Places service is not configured" },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({
    place_id: parsed.data.placeId,
    key: apiKey,
    fields: "address_components",
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Address details unavailable" },
        { status: 502 }
      );
    }

    const json = (await res.json()) as GooglePlaceDetailsResponse;
    if (json.status !== "OK" || !json.result?.address_components) {
      return NextResponse.json(
        { error: json.error_message ?? "Address details unavailable" },
        { status: 502 }
      );
    }

    const components = json.result.address_components;
    const country = getAddressComponent(components, "country")?.short_name;
    if (country !== "US") {
      return NextResponse.json(
        { error: "Only US addresses are supported" },
        { status: 400 }
      );
    }

    const streetNumber = getAddressComponent(components, "street_number")?.long_name ?? "";
    const route = getAddressComponent(components, "route")?.long_name ?? "";
    const addressLine1 = [streetNumber, route].filter(Boolean).join(" ").trim();
    const city =
      getAddressComponent(components, "locality")?.long_name ??
      getAddressComponent(components, "postal_town")?.long_name ??
      getAddressComponent(components, "sublocality_level_1")?.long_name ??
      getAddressComponent(components, "administrative_area_level_2")?.long_name ??
      "";
    const state =
      getAddressComponent(components, "administrative_area_level_1")?.short_name ??
      "";
    const zipCode = getAddressComponent(components, "postal_code")?.long_name ?? "";

    if (!addressLine1 || !city || !state || !zipCode) {
      return NextResponse.json(
        { error: "Address details unavailable" },
        { status: 400 }
      );
    }

    await recordRateLimit(identifier, "places:details");
    return NextResponse.json({
      addressLine1,
      city,
      state,
      zipCode,
    });
  } catch (err) {
    Sentry.captureException(
      err instanceof Error ? err : new Error("Address details unavailable"),
      {
        tags: { area: "places", route: "places/details" },
      }
    );
    return NextResponse.json(
      { error: "Address details unavailable" },
      { status: 502 }
    );
  }
}
