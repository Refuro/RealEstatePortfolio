import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { getActiveAppUser } from "@/lib/auth";

const querySchema = z.object({
  input: z.string().trim().min(3, "Enter at least 3 characters").max(200),
});

type GoogleAutocompleteResponse = {
  status: string;
  error_message?: string;
  predictions?: Array<{
    description?: string;
    place_id?: string;
  }>;
};

export async function GET(req: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({
    input: searchParams.get("input") ?? "",
  });
  if (!parsed.success) {
    const msg =
      parsed.error.flatten().fieldErrors.input?.[0] ?? "Invalid parameters";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey?.trim()) {
    return NextResponse.json({ predictions: [] });
  }

  const upstreamParams = new URLSearchParams({
    input: parsed.data.input,
    key: apiKey,
    components: "country:US",
    types: "address",
  });

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?${upstreamParams.toString()}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "Autocomplete unavailable" },
        { status: 502 }
      );
    }
    const json = (await res.json()) as GoogleAutocompleteResponse;
    if (json.status === "ZERO_RESULTS") {
      return NextResponse.json({ predictions: [] });
    }
    if (json.status !== "OK") {
      return NextResponse.json(
        { error: json.error_message ?? "Autocomplete unavailable" },
        { status: 502 }
      );
    }
    const predictions = (json.predictions ?? [])
      .map((p) => ({
        description: p.description ?? "",
        placeId: p.place_id ?? "",
      }))
      .filter((p) => p.description && p.placeId);
    return NextResponse.json({ predictions });
  } catch (err) {
    Sentry.captureException(err instanceof Error ? err : new Error("Autocomplete unavailable"), {
      tags: { area: "places", route: "places/autocomplete" },
    });
    // Graceful degradation: keep manual input usable if upstream fails.
    return NextResponse.json({ predictions: [] });
  }
}
