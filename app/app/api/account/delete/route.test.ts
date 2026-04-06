import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

const verifyPasswordMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(async () => ({
    users: {
      verifyPassword: (...args: unknown[]) => verifyPasswordMock(...args),
    },
  })),
}));

const { getActiveAppUserMock } = vi.hoisted(() => {
  const getActiveAppUserMock = vi.fn();
  return { getActiveAppUserMock };
});

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    subscription: {
      findUnique: vi.fn(),
    },
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(),
  },
}));

const { checkRateLimitMock, recordRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn().mockResolvedValue({ allowed: true }),
  recordRateLimitMock: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/auth", () => ({
  getActiveAppUser: () => getActiveAppUserMock(),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
  recordRateLimit: (...args: unknown[]) => recordRateLimitMock(...args),
  getRateLimitIdentifier: vi.fn((userId: string | null) =>
    userId ? `user:${userId}` : "ip:unknown"
  ),
}));

vi.mock("@/lib/stripe-config", () => ({
  getStripe: vi.fn(() => ({
    subscriptions: { cancel: vi.fn().mockResolvedValue({}) },
  })),
}));

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/account/delete", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/account/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    verifyPasswordMock.mockResolvedValue(undefined);
    prismaMock.$transaction.mockImplementation(async (ops: unknown) => {
      const arr = ops as Promise<unknown>[];
      if (Array.isArray(arr)) {
        for (const op of arr) await op;
      }
    });
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(postJson({ password: "pw" }));
    expect(res.status).toBe(401);
    expect(verifyPasswordMock).not.toHaveBeenCalled();
  });

  it("returns 400 when JSON body is invalid for schema", async () => {
    const { POST } = await import("./route");
    const res = await POST(postJson({}));
    expect(res.status).toBe(400);
  });

  it("returns 401 when Clerk rejects password", async () => {
    verifyPasswordMock.mockRejectedValue(new Error("Invalid"));
    const { POST } = await import("./route");
    const res = await POST(postJson({ password: "wrong" }));
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid password/i);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("soft-deletes user when password verifies and no active subscription sync path", async () => {
    const { POST } = await import("./route");
    const res = await POST(postJson({ password: "correcthorse" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(verifyPasswordMock).toHaveBeenCalledWith({
      userId: mockActiveUser.clerkUserId,
      password: "correcthorse",
    });
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: mockActiveUser.id },
      data: expect.objectContaining({
        deletedAt: expect.any(Date),
        stripeCustomerId: null,
        subscriptionTier: "free",
      }),
    });
    expect(recordRateLimitMock).toHaveBeenCalled();
  });

  it("returns 503 when database soft-delete transaction fails", async () => {
    prismaMock.$transaction.mockRejectedValue(new Error("db failure"));
    const { POST } = await import("./route");
    const res = await POST(postJson({ password: "correcthorse" }));
    expect(res.status).toBe(503);
    expect(recordRateLimitMock).not.toHaveBeenCalled();
  });
});
