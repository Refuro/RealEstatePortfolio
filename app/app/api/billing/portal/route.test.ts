import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

const captureExceptionMock = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureExceptionMock(...args),
}));

const billingPortalSessionsCreate = vi.fn().mockResolvedValue({
  url: "https://billing.stripe.com/session/test",
});

const subscriptionsRetrieve = vi.fn().mockResolvedValue({
  items: { data: [{ id: "si_item_123" }] },
});

const getStripe = vi.fn(() => ({
  billingPortal: {
    sessions: { create: billingPortalSessionsCreate },
  },
  subscriptions: { retrieve: subscriptionsRetrieve },
}));

const { getActiveAppUserMock } = vi.hoisted(() => ({
  getActiveAppUserMock: vi.fn(),
}));

const { checkRateLimitMock, recordRateLimitMock } = vi.hoisted(() => ({
  checkRateLimitMock: vi.fn().mockResolvedValue({ allowed: true }),
  recordRateLimitMock: vi.fn().mockResolvedValue(undefined),
}));

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    subscription: {
      findUnique: vi.fn().mockResolvedValue({
        stripeSubscriptionId: "sub_test_123",
      }),
    },
  },
}));

vi.mock("@/lib/auth", () => ({
  getActiveAppUser: () => getActiveAppUserMock(),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => checkRateLimitMock(...args),
  getRateLimitIdentifier: () => "user:test-id",
  recordRateLimit: (...args: unknown[]) => recordRateLimitMock(...args),
}));

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/stripe-config", () => ({
  getStripe,
  getPriceIdForPlan: (plan: string, cycle: string) =>
    plan === "pro" && cycle === "yearly" ? "price_pro_yearly_test" :
    plan === "investor" && cycle === "yearly" ? "price_inv_yearly_test" :
    plan === "investor" && cycle === "monthly" ? "price_inv_monthly_test" : null,
}));

vi.mock("@/lib/env", () => ({
  getPublicAppBaseUrlForBilling: () => "https://app.example.com",
}));

function postJson(body: unknown) {
  return new NextRequest("http://localhost/api/billing/portal", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

function postEmpty() {
  return new NextRequest("http://localhost/api/billing/portal", {
    method: "POST",
  });
}

describe("POST /api/billing/portal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captureExceptionMock.mockClear();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test_1",
    });
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: "sub_test_123",
    });
    subscriptionsRetrieve.mockResolvedValue({
      items: { data: [{ id: "si_item_123" }] },
    });
  });

  it("returns 401 when there is no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { POST } = await import("./route");
    const res = await POST(postJson({}));
    expect(res.status).toBe(401);
    expect(billingPortalSessionsCreate).not.toHaveBeenCalled();
    expect(checkRateLimitMock).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limit exceeded", async () => {
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfter: 3600 });
    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(429);
    expect(billingPortalSessionsCreate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid JSON body", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost/api/billing/portal", {
      method: "POST",
      body: "{not-json",
      headers: { "content-type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/invalid json/i);
  });

  it("returns 400 for unknown JSON keys (strict body)", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ returnPath: "/plans", extraField: true } as Record<string, unknown>)
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 when user has no Stripe customer id", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: null,
    });
    const { POST } = await import("./route");
    const res = await POST(postJson({}));
    expect(res.status).toBe(400);
    expect(billingPortalSessionsCreate).not.toHaveBeenCalled();
  });

  it("uses /settings return_url when body is empty", async () => {
    const { POST } = await import("./route");
    const res = await POST(postEmpty());
    expect(res.status).toBe(200);
    expect(billingPortalSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        return_url: "https://app.example.com/settings?billing_return=1",
      })
    );
  });

  it("uses allowlisted returnPath from JSON body with billing_return param", async () => {
    const { POST } = await import("./route");
    const res = await POST(postJson({ returnPath: "/plans" }));
    expect(res.status).toBe(200);
    expect(billingPortalSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        return_url: "https://app.example.com/plans?billing_return=1",
      })
    );
  });

  it("returns portal url in JSON", async () => {
    const { POST } = await import("./route");
    const res = await POST(postJson({}));
    const data = await res.json();
    expect(data.url).toBe("https://billing.stripe.com/session/test");
  });

  it("creates flow_data session when targetPlan and targetBillingCycle are provided", async () => {
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ returnPath: "/plans", targetPlan: "pro", targetBillingCycle: "yearly" })
    );
    expect(res.status).toBe(200);
    expect(subscriptionsRetrieve).toHaveBeenCalledWith("sub_test_123", expect.anything());
    expect(billingPortalSessionsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        flow_data: expect.objectContaining({
          type: "subscription_update_confirm",
          subscription_update_confirm: expect.objectContaining({
            subscription: "sub_test_123",
            items: [{ id: "si_item_123", price: "price_pro_yearly_test", quantity: 1 }],
          }),
        }),
      })
    );
  });

  it("falls back to standard portal when subscription has no stripeSubscriptionId", async () => {
    prismaMock.subscription.findUnique.mockResolvedValueOnce({ stripeSubscriptionId: null });
    const { POST } = await import("./route");
    const res = await POST(
      postJson({ targetPlan: "pro", targetBillingCycle: "yearly" })
    );
    expect(res.status).toBe(200);
    expect(subscriptionsRetrieve).not.toHaveBeenCalled();
    // Standard portal: no flow_data
    expect(billingPortalSessionsCreate).toHaveBeenCalledWith(
      expect.not.objectContaining({ flow_data: expect.anything() })
    );
  });

  it("falls back to standard portal when targetPlan price ID is not configured", async () => {
    const { POST } = await import("./route");
    // "pro" + "monthly" returns null from our mock getPriceIdForPlan
    const res = await POST(
      postJson({ targetPlan: "pro", targetBillingCycle: "monthly" })
    );
    expect(res.status).toBe(200);
    expect(subscriptionsRetrieve).not.toHaveBeenCalled();
    expect(billingPortalSessionsCreate).toHaveBeenCalledWith(
      expect.not.objectContaining({ flow_data: expect.anything() })
    );
  });
});
