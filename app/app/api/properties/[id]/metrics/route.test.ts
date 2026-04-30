import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";
import { getEffectiveBalance } from "@/lib/amortization";
import { getPropertyTotalRent } from "@/lib/property-utils";
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    property: {
      findFirst: vi.fn(),
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

const routeCtx = { params: Promise.resolve({ id: "prop-1" }) };

/** Recent balance-as-of so getEffectiveBalance uses stored balance (deterministic). */
function mortgageFixture() {
  const today = new Date();
  return {
    id: "m1",
    propertyId: "prop-1",
    originalLoanAmount: "150000",
    currentBalance: "100000",
    balanceAsOfDate: today,
    interestRate: 0.06,
    termYears: 30,
    startDate: new Date("2020-01-01"),
    monthlyPayment: "800",
    paymentEffectiveDate: null,
    escrowIncluded: false,
    escrowAmount: null,
    lenderName: null,
    loanType: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function propertyFixture() {
  return {
    id: "prop-1",
    userId: mockActiveUser.id,
    addressLine1: "1 Main",
    city: "Austin",
    state: "TX",
    zipCode: "78701",
    currentMonthlyRent: "2000",
    currentMonthlyExpenses: "500",
    currentEstimatedValue: "250000",
    cashInvested: "50000",
    ownershipPercent: 100,
    vacancyPercent: 5,
    isRented: true,
    unitRents: null,
    mortgages: [mortgageFixture()],
  };
}

describe("GET /api/properties/[id]/metrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
  });

  it("returns 401 when unauthenticated", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/properties/prop-1/metrics"),
      routeCtx
    );
    expect(res.status).toBe(401);
  });

  it("returns 404 when property not found", async () => {
    prismaMock.property.findFirst.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/properties/prop-1/metrics"),
      routeCtx
    );
    expect(res.status).toBe(404);
  });

  it("returns metrics matching computePropertyMetrics for the same inputs (correctness-first)", async () => {
    const p = propertyFixture();
    prismaMock.property.findFirst.mockResolvedValue(p);
    const { GET } = await import("./route");
    const res = await GET(
      new NextRequest("http://localhost/api/properties/prop-1/metrics"),
      routeCtx
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    const totalMortgageBalance = p.mortgages.reduce(
      (sum: number, m) => sum + getEffectiveBalance(m),
      0
    );
    const totalMonthlyPayment = p.mortgages.reduce(
      (sum: number, m: { monthlyPayment: unknown }) =>
        sum + Number(m.monthlyPayment),
      0
    );
    const expected = computePropertyMetrics({
      monthlyRent: getPropertyTotalRent(p as never),
      monthlyExpenses: Number(p.currentMonthlyExpenses),
      estimatedValue: Number(p.currentEstimatedValue),
      cashInvested:
        p.cashInvested != null ? Number(p.cashInvested) : null,
      totalMortgageBalance,
      totalMonthlyPayment,
      ownershipPercent: p.ownershipPercent ?? 100,
      vacancyPercent: p.vacancyPercent ?? 5,
    });
    expect(data).toEqual(expected);
  });
});
