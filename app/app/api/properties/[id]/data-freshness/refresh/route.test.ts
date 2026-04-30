import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    property: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    rentCastApiCall: {
      create: vi.fn(),
    },
  };
  return { prismaMock };
});

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

const { getActiveAppUserMock } = vi.hoisted(() => {
  const getActiveAppUserMock = vi.fn();
  return { getActiveAppUserMock };
});

vi.mock("@/lib/auth", () => ({
  getActiveAppUser: () => getActiveAppUserMock(),
}));

const { fetchValueEstimateMock, fetchRentEstimateMock } = vi.hoisted(() => ({
  fetchValueEstimateMock: vi.fn(),
  fetchRentEstimateMock: vi.fn(),
}));

vi.mock("@/lib/integrations/rentcast", () => ({
  fetchValueEstimate: (...args: unknown[]) => fetchValueEstimateMock(...args),
  fetchRentEstimate: (...args: unknown[]) => fetchRentEstimateMock(...args),
}));

const { getRentCastQuotaStateMock } = vi.hoisted(() => ({
  getRentCastQuotaStateMock: vi.fn(),
}));

vi.mock("@/lib/rentcast-quota", () => ({
  getRentCastQuotaState: (...args: unknown[]) => getRentCastQuotaStateMock(...args),
}));

vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

const FRESH_AS_OF = new Date("2026-06-10T12:00:00Z");
/** Older than 60-day freshness window when `now` is June 15, 2026. */
const STALE_AS_OF = new Date("2026-03-01T12:00:00Z");

function baseProperty(overrides: Record<string, unknown> = {}) {
  return {
    id: "prop-1",
    userId: mockActiveUser.id,
    nickname: null,
    addressLine1: "123 Main St",
    addressLine2: null,
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    propertyType: "single_family",
    units: 1,
    ownershipPercent: 100,
    purchasePrice: 200000,
    purchaseDate: new Date("2020-06-01"),
    currentEstimatedValue: 250000,
    currentMonthlyRent: 2000,
    isRented: true,
    unitRents: [2000],
    bedrooms: null,
    bathrooms: null,
    squareFeet: null,
    currentMonthlyExpenses: 500,
    vacancyPercent: 5,
    cashInvested: null,
    notes: null,
    marketRent: 2000,
    marketRentAsOf: FRESH_AS_OF,
    estimatedValueAsOf: FRESH_AS_OF,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe("POST /api/properties/[id]/data-freshness/refresh", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ now: new Date("2026-06-15T12:00:00Z") });
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    process.env.RENTCAST_API_KEY = "test-key";
    getRentCastQuotaStateMock.mockResolvedValue({
      limit: 10,
      used: 0,
      remaining: 10,
    });
    prismaMock.property.update.mockResolvedValue({} as never);
    prismaMock.rentCastApiCall.create.mockResolvedValue({} as never);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when property not found", async () => {
    prismaMock.property.findFirst.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST({} as NextRequest, paramsFor("missing"));
    expect(res.status).toBe(404);
  });

  it("returns 200 all_fresh without RentCast when nothing is stale", async () => {
    prismaMock.property.findFirst.mockResolvedValue(baseProperty() as never);
    const { POST } = await import("./route");
    const res = await POST({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { skippedReason?: string; refreshed?: unknown[] };
    expect(body.skippedReason).toBe("all_fresh");
    expect(body.refreshed).toEqual([]);
    expect(fetchValueEstimateMock).not.toHaveBeenCalled();
    expect(fetchRentEstimateMock).not.toHaveBeenCalled();
    expect(prismaMock.rentCastApiCall.create).not.toHaveBeenCalled();
  });

  it("refreshes value only when estimatedValueAsOf is missing", async () => {
    prismaMock.property.findFirst.mockResolvedValue(
      baseProperty({ estimatedValueAsOf: null }) as never
    );
    fetchValueEstimateMock.mockResolvedValue({ value: 310000 });

    const { POST } = await import("./route");
    const res = await POST({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { refreshed: string[] };
    expect(body.refreshed).toEqual(["value"]);

    expect(fetchValueEstimateMock).toHaveBeenCalledOnce();
    expect(fetchRentEstimateMock).not.toHaveBeenCalled();
    expect(prismaMock.property.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "prop-1", userId: mockActiveUser.id },
        data: expect.objectContaining({
          currentEstimatedValue: 310000,
        }),
      })
    );
    expect(prismaMock.rentCastApiCall.create).toHaveBeenCalledOnce();
  });

  it("returns 429 before RentCast when quota is insufficient for planned calls", async () => {
    prismaMock.property.findFirst.mockResolvedValue(
      baseProperty({
        estimatedValueAsOf: null,
        marketRentAsOf: STALE_AS_OF,
      }) as never
    );
    getRentCastQuotaStateMock.mockResolvedValue({
      limit: 10,
      used: 9,
      remaining: 1,
    });

    const { POST } = await import("./route");
    const res = await POST({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(429);
    expect(fetchValueEstimateMock).not.toHaveBeenCalled();
    expect(fetchRentEstimateMock).not.toHaveBeenCalled();
  });

  it("returns 503 when RentCast API key is missing", async () => {
    delete process.env.RENTCAST_API_KEY;
    prismaMock.property.findFirst.mockResolvedValue(
      baseProperty({ estimatedValueAsOf: null }) as never
    );

    const { POST } = await import("./route");
    const res = await POST({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(503);
    expect(fetchValueEstimateMock).not.toHaveBeenCalled();
  });

  it("refreshes benchmark only when value is fresh and benchmark is stale", async () => {
    prismaMock.property.findFirst.mockResolvedValue(
      baseProperty({
        estimatedValueAsOf: FRESH_AS_OF,
        marketRentAsOf: STALE_AS_OF,
      }) as never
    );
    fetchRentEstimateMock.mockResolvedValue({ rent: 2150 });

    const { POST } = await import("./route");
    const res = await POST({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { refreshed: string[] };
    expect(body.refreshed).toEqual(["benchmark"]);

    expect(fetchValueEstimateMock).not.toHaveBeenCalled();
    expect(fetchRentEstimateMock).toHaveBeenCalledOnce();
    expect(prismaMock.rentCastApiCall.create).toHaveBeenCalledOnce();
  });
});
