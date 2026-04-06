import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

const verifyPasswordMock = vi.fn();
const deleteUserMock = vi.fn().mockResolvedValue(undefined);

vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: vi.fn(async () => ({
    users: {
      verifyPassword: (...args: unknown[]) => verifyPasswordMock(...args),
      deleteUser: (...args: unknown[]) => deleteUserMock(...args),
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
      delete: vi.fn().mockResolvedValue({}),
    },
  },
}));

const { checkRateLimitMock, recordRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn().mockResolvedValue({ allowed: true }),
  recordRateLimitMock: vi.fn().mockResolvedValue(undefined),
}));

const { cancelSubscriptionMock } = vi.hoisted(() => ({
  cancelSubscriptionMock: vi.fn().mockResolvedValue({}),
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
    subscriptions: { cancel: (...args: unknown[]) => cancelSubscriptionMock(...args) },
  })),
}));

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/account/delete-permanent", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/account/delete-permanent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
    getActiveAppUserMock.mockResolvedValue(mockActiveUser);
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    verifyPasswordMock.mockResolvedValue(undefined);
    cancelSubscriptionMock.mockResolvedValue({});
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ password: "pw", confirmText: "DELETE" })
    );
    expect(res.status).toBe(401);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("returns 400 when confirmText is not DELETE", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ password: "pw", confirmText: "REMOVE" })
    );
    expect(res.status).toBe(400);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("returns 401 when password is invalid", async () => {
    verifyPasswordMock.mockRejectedValue(new Error("bad"));
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ password: "wrong", confirmText: "DELETE" })
    );
    expect(res.status).toBe(401);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
  });

  it("deletes user row and calls Clerk deleteUser on success", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ password: "correcthorse", confirmText: "DELETE" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: mockActiveUser.id },
    });
    expect(deleteUserMock).toHaveBeenCalledWith(mockActiveUser.clerkUserId);
    expect(recordRateLimitMock).toHaveBeenCalled();
  });

  it("returns 503 and does not delete user when Stripe cancel fails", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
    });
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: "sub-1",
      userId: mockActiveUser.id,
      stripeSubscriptionId: "stripe-sub-1",
      status: "active",
    });
    cancelSubscriptionMock.mockRejectedValue(new Error("stripe down"));

    const { POST } = await import("./route");
    const res = await POST(
      postJson({ password: "correcthorse", confirmText: "DELETE" })
    );
    expect(res.status).toBe(503);
    expect(prismaMock.user.delete).not.toHaveBeenCalled();
    expect(deleteUserMock).not.toHaveBeenCalled();
  });
});
