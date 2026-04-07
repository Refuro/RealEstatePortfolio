import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockActiveUser } from "@/lib/test/api-route-mocks";

const captureExceptionMock = vi.fn();

vi.mock("@sentry/nextjs", () => ({
  captureException: (...args: unknown[]) => captureExceptionMock(...args),
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
      upsert: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({}),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(),
  },
}));

const subscriptionsList = vi.fn();

const getStripe = vi.fn(() => ({
  subscriptions: { list: subscriptionsList },
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
  planTierFromPriceId: (priceId: string) => {
    if (priceId === "price_investor_monthly") return "investor";
    if (priceId === "price_pro_monthly") return "pro";
    return null;
  },
  billingIntervalFromPriceId: (priceId: string) => {
    if (priceId === "price_investor_monthly" || priceId === "price_pro_monthly") return "monthly";
    return null;
  },
}));

function makeRequest() {
  return new NextRequest("http://localhost/api/billing/sync");
}

function activeSubscription(priceId: string, subId = "sub_test_123") {
  return {
    data: [
      {
        id: subId,
        status: "active",
        cancel_at_period_end: false,
        items: {
          data: [
            {
              price: { id: priceId },
              current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            },
          ],
        },
      },
    ],
  };
}

describe("GET /api/billing/sync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    captureExceptionMock.mockClear();
    checkRateLimitMock.mockResolvedValue({ allowed: true });
    prismaMock.subscription.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (ops: unknown) => {
      const arr = ops as Promise<unknown>[];
      if (Array.isArray(arr)) {
        for (const op of arr) await op;
      }
    });
  });

  it("returns 401 when no active user", async () => {
    getActiveAppUserMock.mockResolvedValue(null);
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    expect(res.status).toBe(401);
    expect(checkRateLimitMock).not.toHaveBeenCalled();
  });

  it("returns 429 when rate limit exceeded", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
      subscriptionTier: "free",
      subscriptionTierOverride: null,
    });
    checkRateLimitMock.mockResolvedValue({ allowed: false, retryAfter: 3600 });
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    expect(res.status).toBe(429);
    expect(subscriptionsList).not.toHaveBeenCalled();
  });

  it("skips sync and returns free when user has no stripeCustomerId", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: null,
      subscriptionTier: "free",
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.synced).toBe(false);
    expect(data.tier).toBe("investor");
    expect(subscriptionsList).not.toHaveBeenCalled();
  });

  it("skips sync when subscriptionTierOverride is set", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
      subscriptionTierOverride: "pro",
      subscriptionTier: "free",
    });
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.synced).toBe(false);
    expect(subscriptionsList).not.toHaveBeenCalled();
  });

  it("syncs free→investor when Stripe has active investor subscription (missed webhook)", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
      subscriptionTier: "free",
      subscriptionTierOverride: null,
    });
    subscriptionsList.mockResolvedValue(activeSubscription("price_investor_monthly"));
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.synced).toBe(true);
    expect(data.tier).toBe("investor");
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { subscriptionTier: "investor" } })
    );
  });

  it("syncs investor→pro when Stripe has active pro subscription (portal plan change, missed webhook)", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
      subscriptionTier: "investor",
      subscriptionTierOverride: null,
    });
    subscriptionsList.mockResolvedValue(activeSubscription("price_pro_monthly"));
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.synced).toBe(true);
    expect(data.tier).toBe("pro");
  });

  it("refreshes subscription metadata and returns synced:false when Stripe tier and billing state match DB", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
      subscriptionTier: "investor",
      subscriptionTierOverride: null,
    });
    const stripeData = activeSubscription("price_investor_monthly");
    subscriptionsList.mockResolvedValue(stripeData);
    const stripeSub = stripeData.data[0];
    const stripePeriodEnd = stripeSub.items.data[0]?.current_period_end;
    prismaMock.subscription.findUnique.mockResolvedValue({
      stripeSubscriptionId: stripeSub.id,
      status: stripeSub.status,
      planName: "investor_monthly",
      currentPeriodEnd: stripePeriodEnd ? new Date(stripePeriodEnd * 1000) : null,
      cancelAtPeriodEnd: false,
    });
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.synced).toBe(false);
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it("downgrades investor→free when Stripe subscription is canceled", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
      subscriptionTier: "investor",
      subscriptionTierOverride: null,
    });
    subscriptionsList.mockResolvedValue({
      data: [{ id: "sub_123", status: "canceled", items: { data: [] }, cancel_at_period_end: false }],
    });
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.synced).toBe(true);
    expect(data.tier).toBe("free");
    expect(prismaMock.$transaction).toHaveBeenCalled();
  });

  it("does not write to DB when already free and Stripe shows no subscription", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
      subscriptionTier: "free",
      subscriptionTierOverride: null,
    });
    subscriptionsList.mockResolvedValue({ data: [] });
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.synced).toBe(false);
    expect(data.tier).toBe("free");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns synced:false and current tier when Stripe throws", async () => {
    getActiveAppUserMock.mockResolvedValue({
      ...mockActiveUser,
      stripeCustomerId: "cus_test",
      subscriptionTier: "investor",
      subscriptionTierOverride: null,
    });
    subscriptionsList.mockRejectedValue(new Error("stripe network error"));
    const { GET } = await import("./route");
    const res = await GET(makeRequest());
    const data = await res.json();
    expect(data.synced).toBe(false);
    expect(captureExceptionMock).toHaveBeenCalled();
  });
});
