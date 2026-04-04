import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsEvents } from "@/lib/analytics-events";

const constructEvent = vi.fn();
const getStripe = vi.fn(() => ({
  webhooks: { constructEvent },
  subscriptions: { retrieve: vi.fn() },
}));

const { prismaMock, captureServerEventMock, captureMessageMock } = vi.hoisted(() => {
  const captureServerEventMock = vi.fn().mockResolvedValue(undefined);
  const captureMessageMock = vi.fn();
  const prismaMock = {
    subscription: {
      upsert: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    user: {
      update: vi.fn().mockResolvedValue({}),
      findFirst: vi.fn(),
    },
    stripePosthogDedup: {
      create: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn(),
  };
  return { prismaMock, captureServerEventMock, captureMessageMock };
});

vi.mock("@/lib/db", () => ({
  prisma: prismaMock,
}));

vi.mock("@/lib/posthog-server", () => ({
  captureServerEvent: (...args: unknown[]) => captureServerEventMock(...args),
}));

vi.mock("@/lib/stripe-config", () => ({
  getStripe,
  getWebhookSecret: () => "whsec_test_secret",
  planTierFromPriceId: (priceId: string) =>
    priceId === "price_pro_test" ? "pro" : null,
  billingIntervalFromPriceId: (priceId: string) =>
    priceId === "price_pro_test" ? "monthly" : null,
}));

vi.mock("@sentry/nextjs", () => ({
  captureMessage: captureMessageMock,
  captureException: vi.fn(),
}));

function postWebhook(body: string, signature: string | null) {
  return new NextRequest("http://localhost/api/billing/webhook", {
    method: "POST",
    body,
    headers: signature
      ? { "stripe-signature": signature }
      : {},
  });
}

function subscriptionUpdatedEvent() {
  return {
    id: "evt_sub_updated",
    type: "customer.subscription.updated" as const,
    data: {
      object: {
        id: "sub_test_123",
        customer: "cus_test",
        status: "active",
        metadata: { appUserId: "user-cuid-1" },
        items: {
          data: [
            {
              price: { id: "price_pro_test" },
              current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
            },
          ],
        },
        cancel_at_period_end: false,
      },
    },
  };
}

describe("POST /api/billing/webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findFirst.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (ops: unknown) => {
      const arr = ops as Promise<unknown>[];
      if (Array.isArray(arr)) {
        for (const op of arr) await op;
      }
    });
  });

  it("returns 400 when stripe-signature header is missing", async () => {
    const { POST } = await import("./route");
    const res = await POST(postWebhook("{}", null));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/stripe-signature/i);
    expect(constructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails (constructEvent throws)", async () => {
    constructEvent.mockImplementation(() => {
      throw new Error("Invalid signature");
    });
    const { POST } = await import("./route");
    const res = await POST(postWebhook("{}", "bad_sig"));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toMatch(/Invalid signature/i);
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
  });

  it("returns 200 for unhandled event type without subscription DB writes", async () => {
    constructEvent.mockReturnValue({
      id: "evt_other",
      type: "charge.succeeded",
      data: { object: {} },
    });
    const { POST } = await import("./route");
    const res = await POST(postWebhook("{}", "sig_ok"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("syncs subscription and emits subscription_updated on customer.subscription.updated", async () => {
    constructEvent.mockReturnValue(subscriptionUpdatedEvent());
    const { POST } = await import("./route");
    const res = await POST(postWebhook("{}", "sig_ok"));
    expect(res.status).toBe(200);
    expect(prismaMock.$transaction).toHaveBeenCalled();
    expect(prismaMock.subscription.upsert).toHaveBeenCalled();
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "user-cuid-1",
      AnalyticsEvents.SUBSCRIPTION_UPDATED,
      expect.objectContaining({
        status: "active",
        plan_tier: "pro",
        cancel_at_period_end: false,
      })
    );
  });

  it("returns 200 without DB writes when app user cannot be resolved", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    constructEvent.mockReturnValue({
      id: "evt_unresolved",
      type: "customer.subscription.updated" as const,
      data: {
        object: {
          id: "sub_test_unresolved",
          customer: "cus_no_match",
          status: "active",
          metadata: {},
          items: {
            data: [
              {
                price: { id: "price_pro_test" },
                current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
              },
            ],
          },
          cancel_at_period_end: false,
        },
      },
    });
    const { POST } = await import("./route");
    const res = await POST(postWebhook("{}", "sig_ok"));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.received).toBe(true);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.subscription.upsert).not.toHaveBeenCalled();
    expect(captureMessageMock).toHaveBeenCalledWith(
      expect.stringMatching(/could not resolve app user/i),
      expect.objectContaining({
        level: "warning",
        tags: expect.objectContaining({ area: "billing" }),
      })
    );
  });

  it("prefers stripeCustomerId mapping when metadata appUserId mismatches", async () => {
    prismaMock.user.findFirst.mockResolvedValue({ id: "user-from-customer" });
    constructEvent.mockReturnValue(subscriptionUpdatedEvent());
    const { POST } = await import("./route");

    const res = await POST(postWebhook("{}", "sig_ok"));
    expect(res.status).toBe(200);

    expect(prismaMock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "user-from-customer" },
      })
    );
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "user-from-customer",
      AnalyticsEvents.SUBSCRIPTION_UPDATED,
      expect.any(Object)
    );
    expect(captureMessageMock).toHaveBeenCalledWith(
      expect.stringMatching(/metadata appUserId mismatch/i),
      expect.objectContaining({
        level: "warning",
      })
    );
  });
});
