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

const { sendTrialLifecycleEmailMock } = vi.hoisted(() => ({
  sendTrialLifecycleEmailMock: vi.fn(),
}));

const { captureServerEventMock } = vi.hoisted(() => ({
  captureServerEventMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/emails/trial-lifecycle", () => ({
  sendTrialLifecycleEmail: (...args: unknown[]) => sendTrialLifecycleEmailMock(...args),
}));
vi.mock("@/lib/posthog-server", () => ({
  captureServerEvent: (...args: unknown[]) => captureServerEventMock(...args),
}));
vi.mock("@sentry/nextjs", () => ({
  captureException: vi.fn(),
}));

function makeRequest(authHeader?: string) {
  const headers = new Headers();
  if (authHeader) headers.set("authorization", authHeader);
  return new NextRequest("http://localhost/api/cron/trial-emails", {
    method: "GET",
    headers,
  });
}

describe("GET /api/cron/trial-emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret-test";
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.user.update.mockResolvedValue({} as never);
    sendTrialLifecycleEmailMock.mockResolvedValue({ success: true, id: "email-id" });
    captureServerEventMock.mockResolvedValue(undefined);
  });

  it("returns 401 when authorization header is invalid", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("sends day10 email when 3-5 days remain and unsent", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-day10",
        clerkUserId: "clerk_day10",
        email: "day10@example.com",
        trialEndsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        trialEmailsSentAt: null,
        _count: { properties: 3 },
      },
    ]);
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: 1 });

    expect(sendTrialLifecycleEmailMock).toHaveBeenCalledWith(
      "day10@example.com",
      "user-day10",
      "day10",
      3
    );
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_day10",
      AnalyticsEvents.TRIAL_EMAIL_SENT,
      { variant: "day10" }
    );
  });

  it("sends expired email and captures TRIAL_EXPIRED", async () => {
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-expired",
        clerkUserId: "clerk_expired",
        email: "expired@example.com",
        trialEndsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        trialEmailsSentAt: { day10: "2026-04-01T00:00:00.000Z", day13: "2026-04-04T00:00:00.000Z" },
        _count: { properties: 2 },
      },
    ]);
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: 1 });

    expect(sendTrialLifecycleEmailMock).toHaveBeenCalledWith(
      "expired@example.com",
      "user-expired",
      "expired",
      2
    );
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_expired",
      AnalyticsEvents.TRIAL_EMAIL_SENT,
      { variant: "expired" }
    );
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_expired",
      AnalyticsEvents.TRIAL_EXPIRED,
      { via: "trial_email_cron" }
    );
  });
});
