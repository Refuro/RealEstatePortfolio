import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsEvents } from "@/lib/analytics-events";

const { getRefreshEligibleUsersMock, processUserRefreshMock } = vi.hoisted(() => ({
  getRefreshEligibleUsersMock: vi.fn(),
  processUserRefreshMock: vi.fn(),
}));

const { captureServerEventsMock } = vi.hoisted(() => ({
  captureServerEventsMock: vi.fn(),
}));

vi.mock("@/lib/refresh", () => ({
  DEFAULT_REFRESH_BATCH_SIZE: 10,
  MAX_REFRESH_BATCH_SIZE: 100,
  ESTIMATED_RENTCAST_CALLS_PER_PROPERTY: 2,
  ASSUMED_PROPERTIES_PER_USER_FOR_CAPACITY: 20,
  MAX_PROPERTIES_PER_USER_PER_RUN: Number.POSITIVE_INFINITY,
  getRefreshEligibleUsers: (...args: unknown[]) => getRefreshEligibleUsersMock(...args),
  processUserRefresh: (...args: unknown[]) => processUserRefreshMock(...args),
}));

vi.mock("@/lib/posthog-server", () => ({
  captureServerEvents: (...args: unknown[]) => captureServerEventsMock(...args),
}));

function makeRequest(authHeader?: string, query = "") {
  const headers = new Headers();
  if (authHeader) headers.set("authorization", authHeader);
  const url = `http://localhost/api/cron/monthly-refresh${query ? `?${query}` : ""}`;
  return new NextRequest(url, { method: "GET", headers });
}

describe("GET /api/cron/monthly-refresh", () => {
  beforeEach(() => {
    getRefreshEligibleUsersMock.mockReset();
    processUserRefreshMock.mockReset();
    captureServerEventsMock.mockReset();
    process.env.CRON_SECRET = "cron-secret-test";
    process.env.RENTCAST_API_KEY = "rentcast-key";
    getRefreshEligibleUsersMock.mockResolvedValue([]);
    processUserRefreshMock.mockResolvedValue({
      processedProperties: 0,
      snapshotsCreated: 0,
      propertiesUpdated: 0,
      valueAppliedCount: 0,
      valueBelowThresholdCount: 0,
    });
    captureServerEventsMock.mockResolvedValue(undefined);
  });

  it("returns 401 when authorization header is invalid", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer wrong-secret"));
    expect(res.status).toBe(401);
  });

  it("returns 200 with zero work when no eligible users", async () => {
    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(
      expect.objectContaining({
        processed: 0,
        remaining: 0,
        snapshotsCreated: 0,
        propertiesUpdated: 0,
        valueAppliedCount: 0,
        valueBelowThresholdCount: 0,
        failedUsers: 0,
      })
    );
  });

  it("processes users in batches and captures events", async () => {
    getRefreshEligibleUsersMock.mockResolvedValue([
      { id: "u1", clerkUserId: "clerk_u1", properties: [] },
      { id: "u2", clerkUserId: "clerk_u2", properties: [] },
    ]);
    processUserRefreshMock
      .mockResolvedValueOnce({
        processedProperties: 2,
        snapshotsCreated: 2,
        propertiesUpdated: 1,
        valueAppliedCount: 1,
        valueBelowThresholdCount: 1,
      })
      .mockResolvedValueOnce({
        processedProperties: 1,
        snapshotsCreated: 1,
        propertiesUpdated: 0,
        valueAppliedCount: 0,
        valueBelowThresholdCount: 1,
      });

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test", "batchSize=1"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(
      expect.objectContaining({
        processed: 1,
        remaining: 1,
        snapshotsCreated: 2,
        propertiesUpdated: 1,
        valueAppliedCount: 1,
        valueBelowThresholdCount: 1,
        failedUsers: 0,
      })
    );
    expect(processUserRefreshMock).toHaveBeenCalledTimes(1);
    expect(captureServerEventsMock).toHaveBeenCalledWith(
      "clerk_u1",
      expect.arrayContaining([
        expect.objectContaining({
          event: AnalyticsEvents.MONTHLY_REFRESH_COMPLETED,
          properties: { processedProperties: 2, snapshotsCreated: 2 },
        }),
        expect.objectContaining({
          event: AnalyticsEvents.AVM_VALUE_UPDATED,
          properties: { count: 1 },
        }),
        expect.objectContaining({
          event: AnalyticsEvents.AVM_VALUE_BELOW_THRESHOLD,
          properties: { count: 1 },
        }),
      ])
    );
  });

  it("continues processing when one user refresh throws", async () => {
    getRefreshEligibleUsersMock.mockResolvedValue([
      { id: "u1", clerkUserId: "clerk_u1", properties: [] },
    ]);
    processUserRefreshMock.mockRejectedValueOnce(new Error("boom"));

    const { GET } = await import("./route");
    const res = await GET(makeRequest("Bearer cron-secret-test"));
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual(
      expect.objectContaining({
        processed: 1,
        remaining: 0,
        snapshotsCreated: 0,
        propertiesUpdated: 0,
        valueAppliedCount: 0,
        valueBelowThresholdCount: 0,
        failedUsers: 1,
      })
    );
  });
});
