import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser, mockFreeTierUser } from "@/lib/test/api-route-mocks";

const { getActiveAppUserMock } = vi.hoisted(() => {
  const getActiveAppUserMock = vi.fn();
  return { getActiveAppUserMock };
});

const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    property: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
  };
  return { prismaMock };
});

const { checkRateLimitMock, recordRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn(),
  recordRateLimitMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth", () => ({
  getActiveAppUser: () => getActiveAppUserMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
  recordRateLimit: (...args: unknown[]) => recordRateLimitMock(...args),
  getRateLimitIdentifier: vi.fn((userId: string | null) =>
    userId ? `user:${userId}` : "ip:unknown"
  ),
}));

function getRequest() {
  return new NextRequest("http://localhost/api/export/portfolio");
}

describe("GET /api/export/portfolio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    checkRateLimitMock.mockResolvedValue({ allowed: true });
    prismaMock.property.count.mockResolvedValue(0);
    prismaMock.property.findMany.mockResolvedValue([]);
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(getRequest());
    expect(res.status).toBe(401);
  });

  it("returns 429 when rate limit is exceeded", async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false });
    const { GET } = await import("./route");
    const res = await GET(getRequest());
    expect(res.status).toBe(429);
    expect(recordRateLimitMock).not.toHaveBeenCalled();
  });

  it("sets X-Veld slice headers consistent with api-list-contract (empty export)", async () => {
    const { GET } = await import("./route");
    const res = await GET(getRequest());
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("X-Veld-Property-Count-Total")).toBe("0");
    expect(res.headers.get("X-Veld-Property-Count-Included")).toBe("0");
    expect(res.headers.get("X-Veld-Property-Limit")).toBe("20");
    expect(res.headers.get("X-Veld-Property-Slice-Truncated")).toBe("false");
    expect(recordRateLimitMock).toHaveBeenCalled();
  });

  it("sets truncated true when total exceeds free-tier slice (1 row in CSV, 3 total)", async () => {
    getActiveAppUserMock.mockResolvedValue(mockFreeTierUser);
    prismaMock.property.count.mockResolvedValue(3);
    prismaMock.property.findMany.mockResolvedValue([
      {
        id: "exp-1",
        userId: mockFreeTierUser.id,
        addressLine1: "1 Main St",
        addressLine2: null,
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        nickname: null,
        propertyType: "single_family",
        units: 1,
        purchasePrice: "200000",
        purchaseDate: new Date("2020-01-01"),
        currentEstimatedValue: "250000",
        currentMonthlyRent: "2000",
        currentMonthlyExpenses: "500",
        cashInvested: "50000",
        ownershipPercent: 100,
        vacancyPercent: 5,
        isRented: true,
        unitRents: null,
        createdAt: new Date("2020-01-01"),
        updatedAt: new Date("2020-01-01"),
        mortgages: [],
      },
    ]);
    const { GET } = await import("./route");
    const res = await GET(getRequest());
    expect(res.status).toBe(200);
    expect(res.headers.get("X-Veld-Property-Count-Total")).toBe("3");
    expect(res.headers.get("X-Veld-Property-Count-Included")).toBe("1");
    expect(res.headers.get("X-Veld-Property-Limit")).toBe("1");
    expect(res.headers.get("X-Veld-Property-Slice-Truncated")).toBe("true");
  });
});
