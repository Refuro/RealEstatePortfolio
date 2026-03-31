import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    savedDeal: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const { getActiveAppUserMock } = vi.hoisted(() => {
  const getActiveAppUserMock = vi.fn();
  return { getActiveAppUserMock };
});

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/auth", () => ({
  getActiveAppUser: () => getActiveAppUserMock(),
}));

function dec(s: string) {
  return { toString: () => s };
}

function baseDeal() {
  return {
    id: "deal-1",
    userId: mockActiveUser.id,
    nickname: null as string | null,
    addressLine1: "1 Main St",
    addressLine2: null as string | null,
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    purchasePrice: dec("220000"),
    currentEstimatedValue: dec("230000"),
    currentMonthlyRent: dec("1800"),
    currentMonthlyExpenses: dec("600"),
    totalMortgageBalance: dec("120000"),
    totalMonthlyPayment: dec("900"),
    ownershipPercent: 100,
    vacancyPercent: 5,
    cashInvested: dec("40000"),
    notes: null as string | null,
    createdAt: new Date("2024-06-01T12:00:00.000Z"),
    updatedAt: new Date("2024-06-01T12:00:00.000Z"),
  };
}

const routeCtx = { params: Promise.resolve({ id: "deal-1" }) };

function patchJson(body: unknown) {
  return new NextRequest("http://localhost/api/deals/deal-1", {
    method: "PATCH",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("GET /api/deals/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/deals/deal-1"),
      routeCtx
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when deal not found", async () => {
    prismaMock.savedDeal.findFirst.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/deals/deal-1"),
      routeCtx
    );
    expect(res.status).toBe(404);
  });

  it("returns deal with metrics aligned with computePropertyMetrics (proportional)", async () => {
    const deal = baseDeal();
    prismaMock.savedDeal.findFirst.mockResolvedValue(deal);
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/deals/deal-1"),
      routeCtx
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    const rent = 1800;
    const expenses = 600;
    const value = 230000;
    const mortgageBalance = 120000;
    const monthlyPayment = 900;
    const expectedMetrics = computePropertyMetrics(
      {
        monthlyRent: rent,
        monthlyExpenses: expenses,
        estimatedValue: value,
        cashInvested: 40000,
        totalMortgageBalance: mortgageBalance,
        totalMonthlyPayment: monthlyPayment,
        ownershipPercent: 100,
        vacancyPercent: 5,
      },
      "proportional"
    );
    expect(data.metrics).toEqual(expectedMetrics);
    expect(data.id).toBe("deal-1");
  });
});

describe("PATCH /api/deals/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.savedDeal.findFirst.mockResolvedValue(baseDeal());
    prismaMock.savedDeal.update.mockImplementation(async ({ data }: { data: { nickname?: string } }) => ({
      ...baseDeal(),
      nickname: data.nickname ?? null,
    }));
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { PATCH } = await import("./route");
    const res = await PATCH(patchJson({ nickname: "X" }), routeCtx);
    expect(res.status).toBe(401);
  });

  it("returns 404 when deal not found", async () => {
    prismaMock.savedDeal.findFirst.mockResolvedValue(null);
    const { PATCH } = await import("./route");
    const res = await PATCH(patchJson({ nickname: "X" }), routeCtx);
    expect(res.status).toBe(404);
  });

  it("returns 400 when JSON is invalid", async () => {
    const { PATCH } = await import("./route");
    const req = new NextRequest("http://localhost/api/deals/deal-1", {
      method: "PATCH",
      body: "not-json",
      headers: { "content-type": "application/json" },
    });
    const res = await PATCH(req, routeCtx);
    expect(res.status).toBe(400);
  });

  it("returns 200 and updated deal when validation passes", async () => {
    const { PATCH } = await import("./route");
    const res = await PATCH(patchJson({ nickname: "My deal" }), routeCtx);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.nickname).toBe("My deal");
    expect(prismaMock.savedDeal.update).toHaveBeenCalled();
  });
});

describe("DELETE /api/deals/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.savedDeal.findFirst.mockResolvedValue(baseDeal());
    prismaMock.savedDeal.delete.mockResolvedValue({} as never);
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { DELETE } = await import("./route");
    const res = await DELETE(
      new NextRequest("http://localhost/api/deals/deal-1"),
      routeCtx
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when deal not found", async () => {
    prismaMock.savedDeal.findFirst.mockResolvedValue(null);
    const { DELETE } = await import("./route");
    const res = await DELETE(
      new NextRequest("http://localhost/api/deals/deal-1"),
      routeCtx
    );
    expect(res.status).toBe(404);
  });

  it("returns 200 and deletes row when deal exists", async () => {
    const { DELETE } = await import("./route");
    const res = await DELETE(
      new NextRequest("http://localhost/api/deals/deal-1"),
      routeCtx
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(prismaMock.savedDeal.delete).toHaveBeenCalledWith({
      where: { id: "deal-1" },
    });
  });
});
