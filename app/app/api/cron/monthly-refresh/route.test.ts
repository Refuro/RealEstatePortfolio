import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsEvents } from "@/lib/analytics-events";

const { getRefreshEligibleUsersMock, processUserRefreshMock } = vi.hoisted(() => ({
  getRefreshEligibleUsersMock: vi.fn(),
  processUserRefreshMock: vi.fn(),
}));

const { captureServerEventMock } = vi.hoisted(() => ({
  captureServerEventMock: vi.fn(),
}));

vi.mock("@/lib/refresh", () => ({
  DEFAULT_REFRESH_BATCH_SIZE: 10,
  getRefreshEligibleUsers: (...args: unknown[]) => getRefreshEligibleUsersMock(...args),
  processUserRefresh: (...args: unknown[]) => processUserRefreshMock(...args),
}));

vi.mock("@/lib/posthog-server", () => ({
  captureServerEvent: (...args: unknown[]) => captureServerEventMock(...args),
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
    captureServerEventMock.mockReset();
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
    captureServerEventMock.mockResolvedValue(undefined);
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
    await expect(res.json()).resolves.toEqual({
      processed: 0,
      remaining: 0,
      snapshotsCreated: 0,
      propertiesUpdated: 0,
      valueAppliedCount: 0,
      valueBelowThresholdCount: 0,
      failedUsers: 0,
    });
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
    await expect(res.json()).resolves.toEqual({
      processed: 1,
      remaining: 1,
      snapshotsCreated: 2,
      propertiesUpdated: 1,
      valueAppliedCount: 1,
      valueBelowThresholdCount: 1,
      failedUsers: 0,
    });
    expect(processUserRefreshMock).toHaveBeenCalledTimes(1);
    expect(captureServerEventMock).toHaveBeenCalledWith(
      "clerk_u1",
      AnalyticsEvents.MONTHLY_REFRESH_COMPLETED,
      {
        processedProperties: 2,
        snapshotsCreated: 2,
      }
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
    await expect(res.json()).resolves.toEqual({
      processed: 1,
      remaining: 0,
      snapshotsCreated: 0,
      propertiesUpdated: 0,
      valueAppliedCount: 0,
      valueBelowThresholdCount: 0,
      failedUsers: 1,
    });
  });
});
