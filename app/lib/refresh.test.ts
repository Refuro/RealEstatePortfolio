import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn(),
    },
    property: {
      update: vi.fn(),
    },
    propertySnapshot: {
      create: vi.fn(),
    },
  },
}));

const { fetchValueEstimateMock, fetchRentEstimateMock } = vi.hoisted(() => ({
  fetchValueEstimateMock: vi.fn(),
  fetchRentEstimateMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/integrations/rentcast", () => ({
  fetchValueEstimate: (...args: unknown[]) => fetchValueEstimateMock(...args),
  fetchRentEstimate: (...args: unknown[]) => fetchRentEstimateMock(...args),
}));
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

describe("refresh library", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.property.update.mockResolvedValue({});
    prismaMock.propertySnapshot.create.mockResolvedValue({});
    fetchValueEstimateMock.mockResolvedValue({ value: 320000 });
    fetchRentEstimateMock.mockResolvedValue({ rent: 2600 });
  });

  it("filters eligible users by paid/trial tier, activity, and unsnapshotted properties", async () => {
    const now = new Date("2026-04-08T12:00:00.000Z");
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "eligible",
        clerkUserId: "clerk_1",
        email: "a@example.com",
        subscriptionTier: "investor",
        subscriptionTierOverride: null,
        trialEndsAt: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        lastActiveAt: new Date("2026-04-01T00:00:00.000Z"),
        properties: [{ id: "p1", snapshots: [], mortgages: [] }],
      },
      {
        id: "free_user",
        clerkUserId: "clerk_2",
        email: "b@example.com",
        subscriptionTier: "free",
        subscriptionTierOverride: null,
        trialEndsAt: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        lastActiveAt: new Date("2026-04-01T00:00:00.000Z"),
        properties: [{ id: "p2", snapshots: [], mortgages: [] }],
      },
    ]);

    const { getRefreshEligibleUsers } = await import("@/lib/refresh");
    const users = await getRefreshEligibleUsers(now);
    expect(users.map((u) => u.id)).toEqual(["eligible"]);
  });

  it("creates paydown snapshot even when RentCast calls fail", async () => {
    fetchValueEstimateMock.mockRejectedValue(new Error("rate limited"));
    fetchRentEstimateMock.mockRejectedValue(new Error("rate limited"));

    const user = {
      id: "u1",
      clerkUserId: "clerk_u1",
      email: "u1@example.com",
      properties: [
        {
          id: "p1",
          addressLine1: "123 Main St",
          addressLine2: null,
          city: "Austin",
          state: "TX",
          zipCode: "78701",
          propertyType: "single_family",
          units: 1,
          nickname: "Pine",
          currentEstimatedValue: 300000,
          currentMonthlyExpenses: 500,
          currentMonthlyRent: 2500,
          unitRents: null,
          cashInvested: 50000,
          ownershipPercent: 100,
          vacancyPercent: 5,
          marketRent: 2450,
          marketRentAsOf: null,
          snapshots: [],
          mortgages: [
            {
              id: "m1",
              originalLoanAmount: 250000,
              currentBalance: 150000,
              interestRate: 0.06,
              termYears: 30,
              startDate: new Date("2020-01-01"),
              monthlyPayment: 1600,
              balanceAsOfDate: new Date(2026, 3, 1),
              paymentEffectiveDate: null,
              escrowIncluded: false,
              escrowAmount: null,
            },
          ],
        },
      ],
    };

    const { processUserRefresh } = await import("@/lib/refresh");
    const result = await processUserRefresh(user, "api-key", new Date("2026-04-08T12:00:00.000Z"));

    expect(result.snapshotsCreated).toBe(1);
    expect(result.propertiesUpdated).toBe(0);
    expect(prismaMock.propertySnapshot.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          avmValueRaw: null,
          avmRentRaw: null,
          avmValueApplied: false,
          avmRentApplied: false,
        }),
      })
    );
  });
});
