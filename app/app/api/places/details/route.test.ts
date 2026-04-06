import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

const { getActiveAppUserMock } = vi.hoisted(() => {
  const getActiveAppUserMock = vi.fn();
  return { getActiveAppUserMock };
});

const { fetchMock } = vi.hoisted(() => {
  const fetchMock = vi.fn();
  return { fetchMock };
});

vi.mock("@/lib/auth", () => ({
  getActiveAppUser: () => getActiveAppUserMock(),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

vi.stubGlobal("fetch", fetchMock);

function makeRequest(url: string) {
  return new NextRequest(url, { method: "GET" });
}

describe("GET /api/places/details", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    process.env.GOOGLE_PLACES_API_KEY = "test-places-key";
  });

  it("returns 401 when user is not authenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(makeRequest("http://localhost/api/places/details?placeId=abc"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when placeId is missing", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("http://localhost/api/places/details"));
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 200 with parsed US address when upstream returns valid place", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "OK",
        result: {
          address_components: [
            { long_name: "123", short_name: "123", types: ["street_number"] },
            { long_name: "Main St", short_name: "Main St", types: ["route"] },
            { long_name: "Austin", short_name: "Austin", types: ["locality"] },
            {
              long_name: "Texas",
              short_name: "TX",
              types: ["administrative_area_level_1"],
            },
            { long_name: "78701", short_name: "78701", types: ["postal_code"] },
            { long_name: "United States", short_name: "US", types: ["country"] },
          ],
        },
      }),
    });

    const { GET } = await import("./route");
    const res = await GET(
      makeRequest("http://localhost/api/places/details?placeId=valid-place")
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      addressLine1: "123 Main St",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
    });
  });

  it("returns 400 when address cannot be parsed into a valid US address", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "OK",
        result: {
          address_components: [
            { long_name: "123", short_name: "123", types: ["street_number"] },
            { long_name: "Main St", short_name: "Main St", types: ["route"] },
            // Missing locality/city and state on purpose.
            { long_name: "78701", short_name: "78701", types: ["postal_code"] },
            { long_name: "United States", short_name: "US", types: ["country"] },
          ],
        },
      }),
    });

    const { GET } = await import("./route");
    const res = await GET(
      makeRequest("http://localhost/api/places/details?placeId=bad-place")
    );

    expect(res.status).toBe(400);
  });
});
