import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    apiRateLimitEntry: {
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
vi.mock("@sentry/nextjs", () => ({ captureException: vi.fn() }));

function makeRequest(authHeader?: string) {
  const headers = new Headers();
  if (authHeader) headers.set("authorization", authHeader);
  return new NextRequest("http://localhost/api/cron/rate-limit-cleanup", {
    method: "GET",
    headers,
  });
}

describe("GET /api/cron/rate-limit-cleanup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "cron-secret-test";
    prismaMock.apiRateLimitEntry.deleteMany.mockResolvedValue({ count: 42 });
  });

  it("returns 401 when authorization header is missing", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
  });

  it("returns 500 when CRON_SECRET is not configured", async () => {
    delete process.env.CRON_SECRET;
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer anything"));
    expect(res.status).toBe(500);
  });

  it("deletes rows older than one hour", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ deleted: 42 });
    expect(prismaMock.apiRateLimitEntry.deleteMany).toHaveBeenCalledWith({
      where: {
        createdAt: { lt: expect.any(Date) },
      },
    });
  });
});
