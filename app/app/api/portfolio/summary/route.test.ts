import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

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

vi.mock("@/lib/auth", () => ({
  getActiveAppUser: () => getActiveAppUserMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

/** Minimal property row matching portfolio summary mapping (see `docs/internal/api-list-contract.md` slice semantics). */
function minimalProperty(id: string) {
  return {
    id,
    userId: mockActiveUser.id,
    addressLine1: "1 Main St",
    addressLine2: null as string | null,
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    nickname: null as string | null,
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
    mortgages: [] as never[],
  };
}

describe("GET /api/portfolio/summary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("includes slice with truncated false when total is within plan limit (pro tier)", async () => {
    prismaMock.property.count.mockResolvedValue(3);
    prismaMock.property.findMany.mockResolvedValue([
      minimalProperty("a"),
      minimalProperty("b"),
      minimalProperty("c"),
    ]);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slice).toEqual({
      propertyCountTotal: 3,
      propertyCountIncluded: 3,
      propertyLimit: 20,
      truncated: false,
    });
  });

  it("sets truncated true when total count exceeds plan slice (pro: 20)", async () => {
    prismaMock.property.count.mockResolvedValue(25);
    const many = Array.from({ length: 20 }, (_, i) =>
      minimalProperty(`p-${i}`)
    );
    prismaMock.property.findMany.mockResolvedValue(many);
    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slice).toEqual({
      propertyCountTotal: 25,
      propertyCountIncluded: 20,
      propertyLimit: 20,
      truncated: true,
    });
  });
});
