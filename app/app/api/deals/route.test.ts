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
    mortgage: { create: vi.fn() },
    savedDeal: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
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

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true }),
  recordRateLimit: vi.fn().mockResolvedValue(undefined),
  getRateLimitIdentifier: vi.fn((userId: string | null) =>
    userId ? `user:${userId}` : "ip:unknown"
  ),
}));

const validDealBody = {
  addressLine1: "99 Oak Rd",
  city: "Dallas",
  state: "TX",
  zipCode: "75201",
  currentMonthlyRent: "1800",
  currentMonthlyExpenses: "600",
  purchasePrice: "220000",
  currentEstimatedValue: "230000",
};

function postRequest(json: unknown) {
  return new NextRequest("http://localhost/api/deals", {
    method: "POST",
    body: JSON.stringify(json),
    headers: { "content-type": "application/json" },
  });
}

describe("GET /api/deals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.savedDeal.findMany.mockResolvedValue([]);
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns deals array when authenticated", async () => {
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual([]);
  });
});

describe("POST /api/deals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.savedDeal.count.mockResolvedValue(0);
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(postRequest(validDealBody));
    expect(res.status).toBe(401);
  });

  it("returns 400 on invalid JSON", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/deals", {
      method: "POST",
      body: "{",
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when schema validation fails", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      postRequest({
        ...validDealBody,
        purchasePrice: "",
        currentEstimatedValue: "",
      })
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  it("creates a deal and returns metrics", async () => {
    const created = {
      id: "deal-new-1",
      userId: mockActiveUser.id,
      nickname: null,
      addressLine1: "99 Oak Rd",
      addressLine2: null,
      city: "Dallas",
      state: "TX",
      zipCode: "75201",
      purchasePrice: 220000,
      currentEstimatedValue: 230000,
      currentMonthlyRent: 1800,
      currentMonthlyExpenses: 600,
      totalMortgageBalance: 0,
      totalMonthlyPayment: 0,
      ownershipPercent: 100,
      vacancyPercent: 5,
      cashInvested: null,
      notes: null,
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    };
    prismaMock.savedDeal.create.mockResolvedValue(created as never);

    const { POST } = await import("./route");
    const res = await POST(postRequest(validDealBody));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe("deal-new-1");
    expect(json.metrics).toBeDefined();
    expect(json.metrics.noi).toBeDefined();
  });

  it("returns 403 PLAN_LIMIT_REACHED when free tier already has max deals", async () => {
    getActiveAppUserMock.mockResolvedValue(mockFreeTierUser);
    prismaMock.savedDeal.count.mockResolvedValue(5);

    const { POST } = await import("./route");
    const res = await POST(postRequest(validDealBody));
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.code).toBe("PLAN_LIMIT_REACHED");
    expect(body.error).toMatch(/deal limit/i);
    expect(prismaMock.savedDeal.create).not.toHaveBeenCalled();
  });
});
