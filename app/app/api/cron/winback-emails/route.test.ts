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

const { sendWinbackEmailMock } = vi.hoisted(() => ({
  sendWinbackEmailMock: vi.fn(),
}));

const { captureServerEventMock } = vi.hoisted(() => ({
  captureServerEventMock: vi.fn(),
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@/lib/emails/winback", () => ({
  sendWinbackEmail: (...args: unknown[]) => sendWinbackEmailMock(...args),
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
  return new NextRequest("http://localhost/api/cron/winback-emails", {
    method: "GET",
    headers,
  });
}

describe("GET /api/cron/winback-emails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret-test";
    prismaMock.user.findMany.mockResolvedValue([]);
    prismaMock.user.update.mockResolvedValue({} as never);
    sendWinbackEmailMock.mockResolvedValue({ success: true, id: "email-id" });
    captureServerEventMock.mockResolvedValue(undefined);
  });

  it("returns 401 when authorization header is invalid", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("sends 6mo winback for stale user and writes sentinel", async () => {
    const now = new Date();
    const createdAt = new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "u1",
        clerkUserId: "clerk_u1",
        email: "u1@example.com",
        createdAt,
        lastActiveAt: null,
        winbackEmailsSentAt: null,
        _count: { properties: 2 },
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      sent: 1,
      sent6mo: 1,
      sent12mo: 0,
      processed: 1,
    });

    expect(sendWinbackEmailMock).toHaveBeenCalledWith(
      "u1@example.com",
      "u1",
      "6mo",
      2
    );
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: "u1" },
      data: {
        winbackEmailsSentAt: expect.objectContaining({
          "6mo": expect.any(String),
        }),
      },
    });
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_u1",
      AnalyticsEvents.WINBACK_EMAIL_SENT,
      expect.objectContaining({ variant: "6mo", propertyCount: 2 })
    );
  });

  it("sends 12mo winback and skips unsubscribed users", async () => {
    const now = new Date();
    const oldDate = new Date(now.getTime() - 500 * 24 * 60 * 60 * 1000);
    prismaMock.user.findMany.mockResolvedValue([
      {
        id: "u12",
        clerkUserId: "clerk_u12",
        email: "u12@example.com",
        createdAt: oldDate,
        lastActiveAt: null,
        winbackEmailsSentAt: { "6mo": "2025-01-01T00:00:00.000Z" },
        _count: { properties: 1 },
      },
      {
        id: "u_optout",
        clerkUserId: "clerk_u_optout",
        email: "uopt@example.com",
        createdAt: oldDate,
        lastActiveAt: null,
        winbackEmailsSentAt: { __unsubscribedAt: "2025-10-01T00:00:00.000Z" },
        _count: { properties: 1 },
      },
    ]);

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      sent: 1,
      sent6mo: 0,
      sent12mo: 1,
      processed: 2,
    });

    expect(sendWinbackEmailMock).toHaveBeenCalledTimes(1);
    expect(sendWinbackEmailMock).toHaveBeenCalledWith(
      "u12@example.com",
      "u12",
      "12mo",
      1
    );
  });
});
