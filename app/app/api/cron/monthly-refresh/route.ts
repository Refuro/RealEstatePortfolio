import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";
import {
  ASSUMED_PROPERTIES_PER_USER_FOR_CAPACITY,
  DEFAULT_REFRESH_BATCH_SIZE,
  ESTIMATED_RENTCAST_CALLS_PER_PROPERTY,
  getRefreshEligibleUsers,
  MAX_REFRESH_BATCH_SIZE,
  MAX_PROPERTIES_PER_USER_PER_RUN,
  processUserRefresh,
} from "@/lib/refresh";

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET is not configured");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const { searchParams } = new URL(req.url);
  const batchSizeRaw = Number(searchParams.get("batchSize"));
  const batchSize =
    Number.isFinite(batchSizeRaw) && batchSizeRaw > 0
      ? Math.min(MAX_REFRESH_BATCH_SIZE, Math.floor(batchSizeRaw))
      : DEFAULT_REFRESH_BATCH_SIZE;

  const eligibleUsers = await getRefreshEligibleUsers(now);
  const toProcess = eligibleUsers.slice(0, batchSize);
  const apiKey = process.env.RENTCAST_API_KEY?.trim() || null;
  const estimatedRentCastCalls =
    batchSize *
    ASSUMED_PROPERTIES_PER_USER_FOR_CAPACITY *
    ESTIMATED_RENTCAST_CALLS_PER_PROPERTY;
  const perUserPropertyCapText =
    Number.isFinite(MAX_PROPERTIES_PER_USER_PER_RUN)
      ? MAX_PROPERTIES_PER_USER_PER_RUN.toString()
      : "unbounded";

  let snapshotsCreated = 0;
  let propertiesUpdated = 0;
  let valueAppliedCount = 0;
  let valueBelowThresholdCount = 0;
  let failedUsers = 0;

  for (const user of toProcess) {
    try {
      const result = await processUserRefresh(user, apiKey, now);
      snapshotsCreated += result.snapshotsCreated;
      propertiesUpdated += result.propertiesUpdated;
      valueAppliedCount += result.valueAppliedCount;
      valueBelowThresholdCount += result.valueBelowThresholdCount;

      await captureServerEvent(user.clerkUserId, AnalyticsEvents.MONTHLY_REFRESH_COMPLETED, {
        processedProperties: result.processedProperties,
        snapshotsCreated: result.snapshotsCreated,
      });
      if (result.valueAppliedCount > 0) {
        await captureServerEvent(user.clerkUserId, AnalyticsEvents.AVM_VALUE_UPDATED, {
          count: result.valueAppliedCount,
        });
      }
      if (result.valueBelowThresholdCount > 0) {
        await captureServerEvent(user.clerkUserId, AnalyticsEvents.AVM_VALUE_BELOW_THRESHOLD, {
          count: result.valueBelowThresholdCount,
        });
      }
    } catch (err) {
      failedUsers += 1;
      Sentry.captureException(err, {
        tags: { area: "cron_monthly_refresh" },
        extra: { userId: user.id },
      });
    }
  }

  return NextResponse.json({
    processed: toProcess.length,
    remaining: Math.max(eligibleUsers.length - toProcess.length, 0),
    snapshotsCreated,
    propertiesUpdated,
    valueAppliedCount,
    valueBelowThresholdCount,
    failedUsers,
    capacityPlanning: {
      maxBatchSize: MAX_REFRESH_BATCH_SIZE,
      defaultBatchSize: DEFAULT_REFRESH_BATCH_SIZE,
      perUserPropertyCap: perUserPropertyCapText,
      estimatedRentCastCallsPerRun: estimatedRentCastCalls,
      runtimeNote:
        "Estimate assumes 20 properties/user and 2 RentCast calls/property. For current Vercel timeout headroom, adjust batchSize if runtimes trend upward.",
    },
  });
}
