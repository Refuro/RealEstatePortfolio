import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";
import { Prisma } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    property: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    mortgage: { create: vi.fn() },
    savedDeal: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
    apiRateLimitEntry: { count: vi.fn(), create: vi.fn() },
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

const { checkRateLimitMock, recordRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn().mockResolvedValue({ allowed: true }),
  recordRateLimitMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
  recordRateLimit: (...args: unknown[]) => recordRateLimitMock(...args),
  getRateLimitIdentifier: vi.fn((userId: string | null) =>
    userId ? `user:${userId}` : "ip:unknown"
  ),
}));

const baseProperty = {
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
  marketRent: null,
  marketRentAsOf: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  mortgages: [] as unknown[],
};

function paramsFor(id: string) {
  return { params: Promise.resolve({ id }) };
}

function patchRequest(json: unknown) {
  return new NextRequest("http://localhost/api/properties/prop-1", {
    method: "PATCH",
    body: JSON.stringify(json),
    headers: { "content-type": "application/json" },
  });
}

describe("GET /api/properties/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when property not found", async () => {
    prismaMock.property.findFirst.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET({} as NextRequest, paramsFor("missing"));
    expect(res.status).toBe(404);
  });

  it("returns serialized property when found", async () => {
    prismaMock.property.findFirst.mockResolvedValue({ ...baseProperty } as never);
    const { GET } = await import("./route");
    const res = await GET({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("prop-1");
    expect(json.city).toBe("Austin");
  });
});

describe("PATCH /api/properties/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.property.findFirst.mockResolvedValue({ ...baseProperty } as never);
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { PATCH } = await import("./route");
    const res = await PATCH(patchRequest({ nickname: "x" }), paramsFor("prop-1"));
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false });
    const { PATCH } = await import("./route");
    const res = await PATCH(patchRequest({ nickname: "x" }), paramsFor("prop-1"));
    expect(res.status).toBe(429);
    expect(prismaMock.property.findFirst).not.toHaveBeenCalled();
  });

  it("returns 404 when property not found", async () => {
    prismaMock.property.findFirst.mockResolvedValue(null);
    const { PATCH } = await import("./route");
    const res = await PATCH(patchRequest({ nickname: "x" }), paramsFor("prop-1"));
    expect(res.status).toBe(404);
  });

  it("returns 400 on validation failure", async () => {
    const { PATCH } = await import("./route");
    const res = await PATCH(
      patchRequest({ zipCode: "" }),
      paramsFor("prop-1")
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when units conflict with single-family type (Zod refine)", async () => {
    const { PATCH } = await import("./route");
    const res = await PATCH(patchRequest({ units: 2 }), paramsFor("prop-1"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
    const flat = JSON.stringify(body.details ?? {});
    expect(flat).toMatch(/Units must be 1/);
  });

  it("updates and returns property", async () => {
    prismaMock.property.update.mockResolvedValue({
      ...baseProperty,
      nickname: "HQ",
    } as never);
    const { PATCH } = await import("./route");
    const res = await PATCH(patchRequest({ nickname: "HQ" }), paramsFor("prop-1"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.nickname).toBe("HQ");
    expect(recordRateLimitMock).toHaveBeenCalledWith(
      `user:${mockActiveUser.id}`,
      "properties:patch"
    );
  });

  it("splits currentMonthlyRent using effective property type (not stale single_family)", async () => {
    prismaMock.property.findFirst.mockResolvedValue({
      ...baseProperty,
      propertyType: "multi_family",
      units: 2,
    } as never);
    prismaMock.property.update.mockResolvedValue({
      ...baseProperty,
      propertyType: "multi_family",
      units: 2,
      currentMonthlyRent: 4000,
      unitRents: [2000, 2000],
    } as never);
    const { PATCH } = await import("./route");
    const res = await PATCH(
      patchRequest({ propertyType: "multi_family", units: 2, currentMonthlyRent: "4000" }),
      paramsFor("prop-1")
    );
    expect(res.status).toBe(200);
    const updateArg = prismaMock.property.update.mock.calls[0]?.[0] as { data?: Record<string, unknown> };
    expect(updateArg?.data?.unitRents).toEqual([2000, 2000]);
  });

  it("clears rent fields when isRented is set false", async () => {
    prismaMock.property.update.mockResolvedValue({
      ...baseProperty,
      isRented: false,
      currentMonthlyRent: 0,
      unitRents: null,
    } as never);
    const { PATCH } = await import("./route");
    const res = await PATCH(patchRequest({ isRented: false }), paramsFor("prop-1"));
    expect(res.status).toBe(200);
    const updateArg = prismaMock.property.update.mock.calls[0]?.[0] as { data?: Record<string, unknown> };
    expect(updateArg?.data?.isRented).toBe(false);
    expect(updateArg?.data?.currentMonthlyRent).toBe(0);
    expect(updateArg?.data?.unitRents).toBe(Prisma.DbNull);
  });
});

describe("DELETE /api/properties/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.property.findFirst.mockResolvedValue({ ...baseProperty } as never);
    prismaMock.property.delete.mockResolvedValue({} as never);
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { DELETE } = await import("./route");
    const res = await DELETE({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(401);
  });

  it("deletes when property exists", async () => {
    const { DELETE } = await import("./route");
    const res = await DELETE({} as NextRequest, paramsFor("prop-1"));
    expect(res.status).toBe(200);
    expect(prismaMock.property.delete).toHaveBeenCalledWith({
      where: { id: "prop-1", userId: mockActiveUser.id },
    });
  });
});
