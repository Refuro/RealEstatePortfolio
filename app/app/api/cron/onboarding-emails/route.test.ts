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

const { sendOnboardingEmailMock } = vi.hoisted(() => ({
  sendOnboardingEmailMock: vi.fn(),
}));

const { captureServerEventMock } = vi.hoisted(() => ({
  captureServerEventMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));

vi.mock("@/lib/emails/onboarding-reengagement", () => ({
  sendOnboardingEmail: (...args: unknown[]) => sendOnboardingEmailMock(...args),
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
  return new NextRequest("http://localhost/api/cron/onboarding-emails", {
    method: "GET",
    headers,
  });
}

describe("GET /api/cron/onboarding-emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret-test";
    prismaMock.user.findMany.mockResolvedValue([]);
    sendOnboardingEmailMock.mockResolvedValue({ success: true, id: "email-id" });
    captureServerEventMock.mockResolvedValue(undefined);
    prismaMock.user.update.mockResolvedValue({} as never);
  });

  it("returns 401 when authorization header is missing", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 401 when authorization header is invalid", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("returns 500 when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer anything"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBe("Server misconfiguration");
  });

  it("returns 200 with sent=0 when there are no eligible users", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: 0 });
  });

  it("sends day-3 email, updates onboardingEmailsSentAt, and fires PostHog event with clerkUserId", async () => {
    const createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-day3",
        clerkUserId: "clerk_day3",
        email: "day3@example.com",
        createdAt,
        onboardingEmailsSentAt: null,
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: 1 });

    expect(sendOnboardingEmailMock).toHaveBeenCalledWith(
      "day3@example.com",
      "user-day3",
      "day3"
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "user-day3" },
      data: {
        onboardingEmailsSentAt: expect.objectContaining({
          day3: expect.any(String),
        }),
      },
    });
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_day3",
      AnalyticsEvents.ONBOARDING_EMAIL_SENT,
      { variant: "day3" }
    );
  });

  it("sends day-7 email when user is 7 days old and unsent", async () => {
    const createdAt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-day7",
        clerkUserId: "clerk_day7",
        email: "day7@example.com",
        createdAt,
        onboardingEmailsSentAt: { day3: "2026-04-01T12:00:00.000Z", day7: null },
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: 1 });

    expect(sendOnboardingEmailMock).toHaveBeenCalledWith(
      "day7@example.com",
      "user-day7",
      "day7"
    );
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_day7",
      AnalyticsEvents.ONBOARDING_EMAIL_SENT,
      { variant: "day7" }
    );
  });

  it("does not send if day-3 email is already marked sent", async () => {
    const createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-already-sent",
        clerkUserId: "clerk_already",
        email: "already@example.com",
        createdAt,
        onboardingEmailsSentAt: { day3: "2026-04-01T12:00:00.000Z", day7: null },
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: 0 });
    expect(sendOnboardingEmailMock).not.toHaveBeenCalled();
    expect(captureServerEventMock).not.toHaveBeenCalled();
  });

  it("does not increment sent count when sendOnboardingEmail returns failure", async () => {
    sendOnboardingEmailMock.mockResolvedValue({ success: false });
    const createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-fail",
        clerkUserId: "clerk_fail",
        email: "fail@example.com",
        createdAt,
        onboardingEmailsSentAt: null,
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: 0 });

    expect(sendOnboardingEmailMock).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.update).not.toHaveBeenCalled();
    expect(captureServerEventMock).not.toHaveBeenCalled();
  });

  it("uses query filters that exclude opted-out and activated users", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          onboardingEmailsOptedOutAt: null,
          properties: { none: {} },
        }),
      })
    );
  });

  it("handles corrupted onboardingEmailsSentAt JSON gracefully", async () => {
    const createdAt = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "user-corrupt",
        clerkUserId: "clerk_corrupt",
        email: "corrupt@example.com",
        createdAt,
        onboardingEmailsSentAt: "not-an-object",
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ sent: 1 });
    expect(sendOnboardingEmailMock).toHaveBeenCalledWith(
      "corrupt@example.com",
      "user-corrupt",
      "day3"
    );
  });

  it("is idempotent across runs and does not double-send", async () => {
    const userState = {
      id: "user-repeat",
      clerkUserId: "clerk_repeat",
      email: "repeat@example.com",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      onboardingEmailsSentAt: null as { day3?: string | null; day7?: string | null } | null,
    };

    prismaMock.user.findMany.mockImplementation(async () => [userState]);
    prismaMock.user.update.mockImplementation(async ({ data }: { data: { onboardingEmailsSentAt: { day3?: string | null; day7?: string | null } } }) => {
      userState.onboardingEmailsSentAt = data.onboardingEmailsSentAt;
      return {} as never;
    });

    const { GET } = await import("./route");
    const first = await GET(makeRequest("Bearer cron-secret-test"));
    const second = await GET(makeRequest("Bearer cron-secret-test"));

    await expect(first.json()).resolves.toEqual({ sent: 1 });
    await expect(second.json()).resolves.toEqual({ sent: 0 });
    expect(sendOnboardingEmailMock).toHaveBeenCalledTimes(1);
  });
});
