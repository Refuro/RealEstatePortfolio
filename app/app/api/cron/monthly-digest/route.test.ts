import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsEvents } from "@/lib/analytics-events";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const { sendMonthlyDigestEmailMock } = vi.hoisted(() => ({
  sendMonthlyDigestEmailMock: vi.fn(),
}));

const { captureServerEventMock } = vi.hoisted(() => ({
  captureServerEventMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/emails/monthly-digest", () => ({
  sendMonthlyDigestEmail: (...args: unknown[]) => sendMonthlyDigestEmailMock(...args),
}));
vi.mock("@/lib/posthog-server", () => ({
  captureServerEvent: (...args: unknown[]) => captureServerEventMock(...args),
}));
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

function makeRequest(authHeader?: string, query = "") {
  const headers = new Headers();
  if (authHeader) headers.set("authorization", authHeader);
  return new NextRequest(`http://localhost/api/cron/monthly-digest${query ? `?${query}` : ""}`, {
    method: "GET",
    headers,
  });
}

describe("GET /api/cron/monthly-digest", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret-test";
    sendMonthlyDigestEmailMock.mockResolvedValue({ success: true, id: "email-id" });
    captureServerEventMock.mockResolvedValue(undefined);
    prismaMock.user.update.mockResolvedValue({} as never);
    prismaMock.user.findMany.mockResolvedValue([]);
  });

  it("returns 401 when authorization header is invalid", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("returns zero when no eligible users", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      sent: 0,
      processed: 0,
      remaining: 0,
    });
  });

  it("sends digest, writes sentinel, and captures event", async () => {
    const now = new Date();
    const currentMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "u1",
        clerkUserId: "clerk_u1",
        email: "u1@example.com",
        subscriptionTier: "investor",
        subscriptionTierOverride: null,
        trialEndsAt: null,
        createdAt: new Date("2026-03-01T00:00:00.000Z"),
        lastActiveAt: now,
        digestEmailsSentAt: null,
        mortgageMilestonesSentAt: null,
        properties: [
          {
            id: "p1",
            nickname: "Pine",
            snapshots: [
              {
                snapshotMonth: currentMonth,
                estimatedValue: 320000,
                effectiveMortgageBalance: 149000,
                equity: 171000,
                marketRent: 2600,
                monthlyRent: 2500,
                monthlyCashFlow: 200,
                capRate: 0.065,
                ltv: 0.46,
                avmValueApplied: true,
                avmRentApplied: false,
              },
            ],
          },
        ],
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { sent: number; processed: number; remaining: number };
    expect(body.sent).toBe(1);
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: expect.objectContaining({
          digestEmailsSentAt: expect.any(Object),
        }),
      })
    );
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_u1",
      AnalyticsEvents.MONTHLY_DIGEST_SENT,
      expect.objectContaining({ propertyCount: 1 })
    );
  });
});
