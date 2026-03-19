import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser, mockFreeTierUser } from "@/lib/test/api-route-mocks";

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
    mortgage: {
      create: vi.fn(),
    },
    savedDeal: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    apiRateLimitEntry: {
      count: vi.fn(),
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

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  recordRateLimit: vi.fn().mockResolvedValue(undefined),
  getRateLimitIdentifier: vi.fn((userId: string | null) =>
    userId ? `user:${userId}` : "ip:unknown"
  ),
}));

const validCreateBody = {
  addressLine1: "123 Main St",
  city: "Austin",
  state: "TX",
  zipCode: "78701",
  purchasePrice: "200000",
  purchaseDate: "2020-06-01",
  currentEstimatedValue: "250000",
  currentMonthlyRent: "2000",
  currentMonthlyExpenses: "500",
};

function postRequest(json: unknown) {
  return new NextRequest("http://localhost/api/properties", {
    method: "POST",
    body: JSON.stringify(json),
    headers: { "content-type": "application/json" },
  });
}

describe("GET /api/properties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.property.findMany.mockResolvedValue([]);
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns JSON list when authenticated", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(prismaMock.property.findMany).toHaveBeenCalledWith({
      where: { userId: mockActiveUser.id },
      orderBy: { createdAt: "desc" },
      include: { mortgages: true },
    });
  });
});

describe("POST /api/properties", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.property.count.mockResolvedValue(0);
    prismaMock.mortgage.create.mockResolvedValue({} as never);
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(postRequest(validCreateBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 when JSON is invalid", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/properties", {
      method: "POST",
      body: "not-json",
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when validation fails", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      postRequest({
        ...validCreateBody,
        city: "",
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  it("creates a property and returns 200 JSON", async () => {
    const created = {
      id: "prop-new-1",
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
      unitRents: [2000],
      bedrooms: null,
      bathrooms: null,
      unitMix: null,
      squareFeet: null,
      currentMonthlyExpenses: 500,
      vacancyPercent: 5,
      cashInvested: null,
      notes: null,
      marketRent: null,
      marketRentAsOf: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    prismaMock.property.create.mockResolvedValue(created as never);

    const { POST } = await import("./route");
    const res = await POST(postRequest(validCreateBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("prop-new-1");
    expect(json.createdFirstProperty).toBe(true);
    expect(prismaMock.property.create).toHaveBeenCalled();
  });

  it("returns 403 PLAN_LIMIT_REACHED when free tier already has one property", async () => {
    getActiveAppUserMock.mockResolvedValue(mockFreeTierUser);
    prismaMock.property.count.mockResolvedValue(1);

    const { POST } = await import("./route");
    const res = await POST(postRequest(validCreateBody));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe("PLAN_LIMIT_REACHED");
    expect(body.error).toMatch(/limit/i);
    expect(prismaMock.property.create).not.toHaveBeenCalled();
  });
});
