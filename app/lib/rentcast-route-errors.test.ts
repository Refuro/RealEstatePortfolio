import { describe, expect, it } from "vitest";
import {
  RentCastErrorCodes,
  rentCastErrorResponse,
  isRentCastNoDataError,
} from "./rentcast-route-errors";

describe("rentCastErrorResponse", () => {
  it("returns 429 with RATE_LIMITED code", async () => {
    const res = rentCastErrorResponse("Too many", 429);
    expect(res.status).toBe(429);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.error).toBe("Too many");
    expect(body.code).toBe(RentCastErrorCodes.RATE_LIMITED);
  });

  it("returns 503 with SERVICE_NOT_CONFIGURED code", async () => {
    const res = rentCastErrorResponse("Not configured", 503);
    expect(res.status).toBe(503);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe(RentCastErrorCodes.SERVICE_NOT_CONFIGURED);
  });

  it("returns 502 with UPSTREAM_UNAVAILABLE code", async () => {
    const res = rentCastErrorResponse("Upstream failed", 502);
    expect(res.status).toBe(502);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe(RentCastErrorCodes.UPSTREAM_UNAVAILABLE);
  });

  it("returns 422 with NO_DATA code", async () => {
    const res = rentCastErrorResponse("Unable to calculate AVM due to insufficient comparables", 422);
    expect(res.status).toBe(422);
    const body = (await res.json()) as { error: string; code: string };
    expect(body.code).toBe(RentCastErrorCodes.NO_DATA);
  });
});

describe("isRentCastNoDataError", () => {
  it("matches the exact RentCast AVM message", () => {
    expect(
      isRentCastNoDataError(
        "Unable to calculate AVM due to insufficient comparables matching request parameters"
      )
    ).toBe(true);
  });

  it("matches case-insensitively", () => {
    expect(isRentCastNoDataError("INSUFFICIENT COMPARABLES for address")).toBe(true);
    expect(isRentCastNoDataError("no comparable properties found")).toBe(true);
    expect(isRentCastNoDataError("No data available")).toBe(true);
    expect(isRentCastNoDataError("address not found in database")).toBe(true);
  });

  it("does not match unrelated errors", () => {
    expect(isRentCastNoDataError("Rate limit exceeded")).toBe(false);
    expect(isRentCastNoDataError("Invalid API key or access denied.")).toBe(false);
    expect(isRentCastNoDataError("Request timed out. Please try again.")).toBe(false);
    expect(isRentCastNoDataError("RentCast API error (500)")).toBe(false);
  });
});
