/**
 * RentCast API adapter for rent and value estimates.
 * Rent: https://api.rentcast.io/v1/avm/rent/long-term
 * Value: https://api.rentcast.io/v1/avm/value
 */

const RENTCAST_RENT_BASE = "https://api.rentcast.io/v1/avm/rent/long-term";
const RENTCAST_VALUE_BASE = "https://api.rentcast.io/v1/avm/value";
const TIMEOUT_MS = 15_000;

export type RentCastParams = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  addressLine2?: string;
  propertyType?: "single_family" | "condo" | "townhouse" | "manufactured" | "multi_family" | "apartment";
  units?: number;
  /** Bedrooms (single-family) or typical unit bedrooms (multi-family). RentCast supported. */
  bedrooms?: number;
  /** Bathrooms (single-family) or typical unit bathrooms (multi-family). RentCast supported. */
  bathrooms?: number;
  /** Living area; RentCast query param `squareFootage` — improves AVM accuracy. */
  squareFootage?: number;
};

export type RentCastResult = { rent: number };

/** Map our property types to RentCast property types */
const RENTCAST_PROPERTY_TYPE_MAP: Record<
  "single_family" | "condo" | "townhouse" | "manufactured" | "multi_family" | "apartment",
  string
> = {
  single_family: "Single Family",
  condo: "Condo",
  townhouse: "Townhouse",
  manufactured: "Manufactured",
  multi_family: "Multi-Family",
  apartment: "Apartment",
};

function toRentCastPropertyType(
  propertyType: keyof typeof RENTCAST_PROPERTY_TYPE_MAP
): string {
  return RENTCAST_PROPERTY_TYPE_MAP[propertyType] ?? "Single Family";
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
  if (params.bedrooms != null && params.bedrooms >= 1) {
    searchParams.set("bedrooms", String(params.bedrooms));
  }
  if (params.bathrooms != null && params.bathrooms >= 0.5) {
    searchParams.set("bathrooms", String(params.bathrooms));
  }
  if (params.squareFootage != null && params.squareFootage >= 100) {
    searchParams.set("squareFootage", String(Math.round(params.squareFootage)));
  }

  const url = `${RENTCAST_RENT_BASE}?${searchParams.toString()}`;
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

export type ValueEstimateParams = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  addressLine2?: string;
  propertyType?: "single_family" | "condo" | "townhouse" | "manufactured" | "multi_family" | "apartment";
  /** RentCast `squareFootage` when available. */
  squareFootage?: number;
};

export type ValueEstimateResult = { value: number };

/**
 * Fetch value estimate from RentCast AVM API.
 * Returns { value: number } or throws on error.
 */
export async function fetchValueEstimate(
  params: ValueEstimateParams,
  apiKey: string
): Promise<ValueEstimateResult> {
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
  if (params.squareFootage != null && params.squareFootage >= 100) {
    searchParams.set("squareFootage", String(Math.round(params.squareFootage)));
  }

  const url = `${RENTCAST_VALUE_BASE}?${searchParams.toString()}`;
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
    const value = data?.value ?? data?.estimatedValue ?? data?.price;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new Error("Value estimate unavailable for this address.");
    }
    return { value };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Please try again.");
      }
      throw err;
    }
    throw new Error("Failed to fetch value estimate.");
  }
}
