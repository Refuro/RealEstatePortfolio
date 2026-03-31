import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

const sessionsCreate = vi.fn().mockResolvedValue({
  url: "https://checkout.stripe.com/c/pay/cs_test_123",
});
const customersCreate = vi.fn().mockResolvedValue({ id: "cus_new_123" });

const getStripe = vi.fn(() => ({
  customers: { create: customersCreate },
  checkout: {
    sessions: { create: sessionsCreate },
  },
}));

const { getActiveAppUserMock } = vi.hoisted(() => {
  const getActiveAppUserMock = vi.fn();
  return { getActiveAppUserMock };
});

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
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
  getStripe,
  getPriceIdForPlan: () => "price_investor_monthly_test",
}));

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/billing/create-checkout-session", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/billing/create-checkout-session", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_existing",
    });
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(postJson({ plan: "investor", billingCycle: "monthly" }));
    expect(res.status).toBe(401);
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 when body fails Zod (invalid plan)", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ plan: "enterprise", billingCycle: "monthly" })
    );
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBeTruthy();
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 200 with checkout url when authenticated and body is valid", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ plan: "investor", billingCycle: "monthly" })
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.url).toBe("https://checkout.stripe.com/c/pay/cs_test_123");
    expect(sessionsCreate).toHaveBeenCalled();
    expect(customersCreate).not.toHaveBeenCalled();
    expect(recordRateLimitMock).toHaveBeenCalled();
  });

  it("creates Stripe customer when user has no stripeCustomerId", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: null,
    });
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ plan: "pro", billingCycle: "yearly" })
    );
    expect(res.status).toBe(200);
    expect(customersCreate).toHaveBeenCalled();
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: mockActiveUser.id },
      data: { stripeCustomerId: "cus_new_123" },
    });
  });
});
