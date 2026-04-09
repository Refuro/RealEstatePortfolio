import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRentEstimate, fetchValueEstimate } from "@/lib/integrations/rentcast";

describe("rentcast integration params", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws if value params include override fields like bedrooms/squareFootage", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      fetchValueEstimate(
        {
          address: "123 Main St",
          city: "Austin",
          state: "TX",
          zipCode: "78701",
          // Defensive runtime guard: should never be sent to RentCast.
          ...( { bedrooms: 4 } as Record<string, unknown> ),
        } as never,
        "api-key"
      )
    ).rejects.toThrow('Unsupported RentCast override field "bedrooms"');

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("throws if rent params include override fields like squareFeet", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    await expect(
      fetchRentEstimate(
        {
          address: "123 Main St",
          city: "Austin",
          state: "TX",
          zipCode: "78701",
          ...( { squareFeet: 1600 } as Record<string, unknown> ),
        } as never,
        "api-key"
      )
    ).rejects.toThrow('Unsupported RentCast override field "squareFeet"');

    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
