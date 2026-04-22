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

  it("strips ZIP+4 suffix before sending to RentCast (rent estimate)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ rent: 1200 }), { status: 200 })
    );

    await fetchRentEstimate(
      { address: "123 Main St", city: "Colquitt", state: "GA", zipCode: "39845-1546" },
      "api-key"
    );

    const calledUrl = (fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl).toContain("zipCode=39845");
    expect(calledUrl).not.toContain("39845-1546");
  });

  it("strips ZIP+4 suffix before sending to RentCast (value estimate)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ value: 150000 }), { status: 200 })
    );

    await fetchValueEstimate(
      { address: "123 Main St", city: "Colquitt", state: "GA", zipCode: "39845-1546" },
      "api-key"
    );

    const calledUrl = (fetchSpy.mock.calls[0][0] as string);
    expect(calledUrl).toContain("zipCode=39845");
    expect(calledUrl).not.toContain("39845-1546");
  });
});
