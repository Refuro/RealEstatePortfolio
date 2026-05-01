import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsEvents } from "@/lib/analytics-events";

const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    user: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
  };
  return { prismaMock };
});

const { sendMortgageMilestoneEmailMock } = vi.hoisted(() => ({
  sendMortgageMilestoneEmailMock: vi.fn(),
}));

const { detectNewMortgageMilestonesForUserMock } = vi.hoisted(() => ({
  detectNewMortgageMilestonesForUserMock: vi.fn(),
}));

const { captureServerEventMock } = vi.hoisted(() => ({
  captureServerEventMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/emails/mortgage-milestones", () => ({
  sendMortgageMilestoneEmail: (...args: unknown[]) => sendMortgageMilestoneEmailMock(...args),
}));
vi.mock("@/lib/mortgage-milestones", async () => {
  const actual = await vi.importActual("@/lib/mortgage-milestones");
  return {
    ...actual,
    detectNewMortgageMilestonesForUser: (...args: unknown[]) =>
      detectNewMortgageMilestonesForUserMock(...args),
  };
});
vi.mock("@/lib/posthog-server", () => ({
  captureServerEvent: (...args: unknown[]) => captureServerEventMock(...args),
}));
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

function makeRequest(authHeader?: string) {
  const headers = new Headers();
  if (authHeader) headers.set("authorization", authHeader);
  return new NextRequest("http://localhost/api/cron/milestone-emails", {
    method: "GET",
    headers,
  });
}

describe("GET /api/cron/milestone-emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret-test";
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.user.update.mockResolvedValue({} as never);
    sendMortgageMilestoneEmailMock.mockResolvedValue({ success: true, id: "email-id" });
    detectNewMortgageMilestonesForUserMock.mockReturnValue([]);
    captureServerEventMock.mockResolvedValue(undefined);
  });

  it("returns 401 when authorization header is invalid", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with zeros when there are no eligible users", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sentEmails: 0, sentMilestones: 0 });
  });

  it("sends milestone email, writes sentinels, and captures event", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-1",
        clerkUserId: "clerk_1",
        email: "user1@example.com",
        mortgageMilestonesSentAt: null,
        properties: [],
      },
    ]);
    detectNewMortgageMilestonesForUserMock.mockReturnValue([
      {
        key: "prop_1__ltv_50",
        propertyId: "prop_1",
        propertyLabel: "Pine Cottage",
        type: "ltv",
        title: "Pine Cottage: crossed below 50% LTV",
        details: "Estimated LTV is now 49.4%.",
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sentEmails: 1, sentMilestones: 1 });

    expect(sendMortgageMilestoneEmailMock).toHaveBeenCalledWith(
      "user1@example.com",
      "user-1",
      expect.arrayContaining([
        expect.objectContaining({ key: "prop_1__ltv_50" }),
      ])
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        mortgageMilestonesSentAt: expect.objectContaining({
          prop_1__ltv_50: expect.any(String),
        }),
      },
    });
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_1",
      AnalyticsEvents.MORTGAGE_MILESTONE_EMAIL_SENT,
      { milestoneCount: 1 }
    );
  });

  it("writes silent sentinel keys to the DB but excludes them from the email and count", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-1",
        clerkUserId: "clerk_1",
        email: "user1@example.com",
        mortgageMilestonesSentAt: null,
        properties: [],
      },
    ]);
    detectNewMortgageMilestonesForUserMock.mockReturnValue([
      {
        key: "prop_1__ltv_25",
        propertyId: "prop_1",
        propertyLabel: "Pine Cottage",
        type: "ltv",
        title: "Pine Cottage: crossed below 25% LTV",
        details: "Estimated LTV is now 7.2%.",
      },
      {
        key: "prop_1__ltv_50",
        propertyId: "prop_1",
        propertyLabel: "Pine Cottage",
        type: "ltv",
        title: "Pine Cottage: crossed below 50% LTV",
        details: "Estimated LTV is now 7.2%.",
        silent: true,
      },
      {
        key: "prop_1__ltv_75",
        propertyId: "prop_1",
        propertyLabel: "Pine Cottage",
        type: "ltv",
        title: "Pine Cottage: crossed below 75% LTV",
        details: "Estimated LTV is now 7.2%.",
        silent: true,
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sentEmails: 1, sentMilestones: 1 });

    expect(sendMortgageMilestoneEmailMock).toHaveBeenCalledWith(
      "user1@example.com",
      "user-1",
      [expect.objectContaining({ key: "prop_1__ltv_25" })]
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: {
        mortgageMilestonesSentAt: expect.objectContaining({
          prop_1__ltv_25: expect.any(String),
          prop_1__ltv_50: expect.any(String),
          prop_1__ltv_75: expect.any(String),
        }),
      },
    });
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_1",
      AnalyticsEvents.MORTGAGE_MILESTONE_EMAIL_SENT,
      { milestoneCount: 1 }
    );
  });
});
