/**
 * RentCast API adapter for rent estimates.
 * API: https://api.rentcast.io/v1/avm/rent/long-term
 * Docs: https://developers.rentcast.io/reference/rent-estimate-long-term
 */

const RENTCAST_BASE = "https://api.rentcast.io/v1/avm/rent/long-term";
const TIMEOUT_MS = 15_000;

export type RentCastParams = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  addressLine2?: string;
  propertyType?: "single_family" | "multi_family";
  units?: number;
};

export type RentCastResult = { rent: number };

/** Map our property types to RentCast property types */
function toRentCastPropertyType(
  propertyType: "single_family" | "multi_family"
): string {
  return propertyType === "single_family" ? "House" : "Apartment";
}

/**
 * Fetch rent estimate from RentCast API.
 * Returns { rent: number } or throws on error.
 */
export async function fetchRentEstimate(
  params: RentCastParams,
  apiKey: string
): Promise<RentCastResult> {
  const fullAddress = [params.address, params.addressLine2]
    .filter(Boolean)
    .join(", ");
  const searchParams = new URLSearchParams({
    address: fullAddress,
    city: params.city,
    state: params.state,
    zipCode: params.zipCode,
  });
  if (params.propertyType) {
    searchParams.set("propertyType", toRentCastPropertyType(params.propertyType));
  }
  if (params.units != null && params.units > 1) {
    searchParams.set("units", String(params.units));
  }

  const url = `${RENTCAST_BASE}?${searchParams.toString()}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "X-Api-Key": apiKey,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    if (res.status === 401 || res.status === 403) {
      throw new Error("Invalid API key or access denied.");
    }
    if (!res.ok) {
      const body = await res.text();
      let message = `RentCast API error (${res.status})`;
      try {
        const json = JSON.parse(body);
        if (typeof json.message === "string") message = json.message;
        else if (typeof json.error === "string") message = json.error;
      } catch {
        if (body) message = `${message}: ${body.slice(0, 100)}`;
      }
      throw new Error(message);
    }

    const data = (await res.json()) as Record<string, unknown>;
    const rent = data?.rent ?? data?.rentAmount ?? data?.rentalPrice;
    if (typeof rent !== "number" || !Number.isFinite(rent) || rent < 0) {
      throw new Error("Rent estimate unavailable for this address.");
    }
    return { rent };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw err;
    }
    throw new Error("Failed to fetch rent estimate.");
  }
}
