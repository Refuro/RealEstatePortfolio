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

describe("GET /api/places/autocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    process.env.GOOGLE_PLACES_API_KEY = "test-places-key";
  });

  it("returns 401 when user is not authenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(makeRequest("http://localhost/api/places/autocomplete?input=123"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when input is missing or too short", async () => {
    const { GET } = await import("./route");
    const missingRes = await GET(makeRequest("http://localhost/api/places/autocomplete"));
    const shortRes = await GET(
      makeRequest("http://localhost/api/places/autocomplete?input=12")
    );

    expect(missingRes.status).toBe(400);
    expect(shortRes.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 200 with predictions when upstream returns valid data", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "OK",
        predictions: [
          {
            description: "123 Main St, Austin, TX, USA",
            place_id: "place-123",
          },
        ],
      }),
    });

    const { GET } = await import("./route");
    const res = await GET(
      makeRequest("http://localhost/api/places/autocomplete?input=123 Main")
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      predictions: [
        {
          description: "123 Main St, Austin, TX, USA",
          placeId: "place-123",
        },
      ],
    });
  });

  it("returns 200 with empty predictions when upstream has zero results", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ status: "ZERO_RESULTS" }),
    });

    const { GET } = await import("./route");
    const res = await GET(
      makeRequest("http://localhost/api/places/autocomplete?input=No results")
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ predictions: [] });
  });

  it("returns 200 with empty predictions when upstream fetch throws", async () => {
    fetchMock.mockRejectedValue(new Error("upstream exploded"));

    const { GET } = await import("./route");
    const res = await GET(
      makeRequest("http://localhost/api/places/autocomplete?input=Graceful fallback")
    );

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ predictions: [] });
  });
});
