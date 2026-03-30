import { describe, expect, it } from "vitest";
import {
  RentCastErrorCodes,
  rentCastErrorResponse,
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
});
