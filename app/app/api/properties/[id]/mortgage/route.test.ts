import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    property: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    mortgage: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };
  return { prismaMock };
});

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

const { getActiveAppUserMock } = vi.hoisted(() => ({
  getActiveAppUserMock: vi.fn(),
}));

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

const validMortgageBody = {
  originalLoanAmount: "200000",
  currentBalance: "180000",
  interestRate: "0.055",
  termYears: 30,
  startDate: "2022-01-01",
  monthlyPayment: "1500",
  escrowIncluded: false,
};

function postRequest(propertyId: string, json: unknown) {
  return new NextRequest(`http://localhost/api/properties/${propertyId}/mortgage`, {
    method: "POST",
    body: JSON.stringify(json),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/properties/[id]/mortgage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.property.findFirst.mockResolvedValue({
      id: "prop-1",
      userId: mockActiveUser.id,
      hasMortgage: false,
      mortgagePaidOff: true,
    });
    prismaMock.mortgage.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
      id: "mortgage-1",
      propertyId: "prop-1",
      originalLoanAmount: data.originalLoanAmount,
      currentBalance: data.currentBalance,
      balanceAsOfDate: data.balanceAsOfDate ?? null,
      interestRate: data.interestRate,
      termYears: data.termYears,
      startDate: data.startDate,
      monthlyPayment: data.monthlyPayment,
      paymentEffectiveDate: data.paymentEffectiveDate ?? null,
      escrowIncluded: data.escrowIncluded ?? false,
      escrowAmount: data.escrowAmount ?? null,
      lenderName: data.lenderName ?? null,
      loanType: data.loanType ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    prismaMock.property.update.mockResolvedValue({});
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<unknown>) => {
      return callback(prismaMock);
    });
  });

  it("clears mortgagePaidOff when adding a mortgage to a previously paid-off property", async () => {
    const { POST } = await import("./route");
    const res = await POST(postRequest("prop-1", validMortgageBody), {
      params: Promise.resolve({ id: "prop-1" }),
    });
    expect(res.status).toBe(200);

    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(prismaMock.mortgage.create).toHaveBeenCalledTimes(1);
    expect(prismaMock.property.update).toHaveBeenCalledWith({
      where: { id: "prop-1" },
      data: { hasMortgage: true, mortgagePaidOff: false },
    });
  });

  it("returns 401 when no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(postRequest("prop-1", validMortgageBody), {
      params: Promise.resolve({ id: "prop-1" }),
    });
    expect(res.status).toBe(401);
  });

  it("returns 404 when the property does not belong to the user", async () => {
    prismaMock.property.findFirst.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(postRequest("prop-1", validMortgageBody), {
      params: Promise.resolve({ id: "prop-1" }),
    });
    expect(res.status).toBe(404);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
