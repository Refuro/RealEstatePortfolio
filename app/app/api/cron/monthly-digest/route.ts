import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";
import { getEffectiveTier } from "@/lib/plans";
import { getActivityTier } from "@/lib/activity-tier";
import { buildDigestContent, isDigestWorthSending, type DigestSnapshot } from "@/lib/digest";
import { sendMonthlyDigestEmail } from "@/lib/emails/monthly-digest";

const DEFAULT_BATCH_SIZE = 10;
const digestSentinelSchema = z.record(z.string(), z.string().nullable().optional()).nullable().catch(null);
const milestoneSentinelSchema = z.record(z.string(), z.string().nullable().optional()).nullable().catch(null);

function getMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

function getPreviousMonthStart(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1));
}

function getMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function toNumber(value: number | { toString(): string } | null): number | null {
  if (value == null) return null;
  return typeof value === "number" ? value : Number(value.toString());
}

function parseMilestonesThisMonth(
  sentinels: Record<string, string | null | undefined>,
  monthKey: string
): number {
  return Object.values(sentinels).filter((value) => {
    if (typeof value !== "string") return false;
    return value.slice(0, 7) === monthKey;
  }).length;
}

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
      ? Math.min(100, Math.floor(batchSizeRaw))
      : DEFAULT_BATCH_SIZE;

  const currentMonth = getMonthStart(now);
  const previousMonth = getPreviousMonthStart(now);
  const monthKey = getMonthKey(currentMonth);

  const users = await prisma.user.findMany({
    where: {
      deletedAt: null,
      digestEmailsOptedOutAt: null,
      properties: { some: {} },
    },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      subscriptionTier: true,
      subscriptionTierOverride: true,
      trialEndsAt: true,
      createdAt: true,
      lastActiveAt: true,
      digestEmailsSentAt: true,
      mortgageMilestonesSentAt: true,
      properties: {
        select: {
          id: true,
          nickname: true,
          snapshots: {
            where: {
              snapshotMonth: {
                in: [currentMonth, previousMonth],
              },
            },
            select: {
              snapshotMonth: true,
              estimatedValue: true,
              effectiveMortgageBalance: true,
              equity: true,
              marketRent: true,
              monthlyRent: true,
              monthlyCashFlow: true,
              capRate: true,
              ltv: true,
              avmValueApplied: true,
              avmRentApplied: true,
            },
          },
        },
      },
    },
  });

  const eligible = users.filter((user) => {
    const tier = getEffectiveTier(user);
    if (tier === "free") return false;
    const activityTier = getActivityTier(user.lastActiveAt, user.createdAt, now);
    if (activityTier !== "active" && activityTier !== "cooling") return false;
    const digestSentinels = digestSentinelSchema.parse(user.digestEmailsSentAt) ?? {};
    if (digestSentinels[monthKey]) return false;
    return true;
  });

  const toProcess = eligible.slice(0, batchSize);
  let sent = 0;

  for (const user of toProcess) {
    try {
      const currentSnapshots: DigestSnapshot[] = [];
      const previousSnapshots: DigestSnapshot[] = [];

      for (const property of user.properties) {
        const propertyLabel =
          property.nickname?.trim() || `Property ${property.id.slice(0, 6)}`;
        for (const snapshot of property.snapshots) {
          const mapped: DigestSnapshot = {
            propertyId: property.id,
            propertyLabel,
            estimatedValue: Number(snapshot.estimatedValue),
            effectiveMortgageBalance: Number(snapshot.effectiveMortgageBalance),
            equity: Number(snapshot.equity),
            marketRent: toNumber(snapshot.marketRent),
            monthlyRent: Number(snapshot.monthlyRent),
            // Intentionally uses stored proportional value. Digest emails are
            // batch/background and don't apply per-user ownershipDisplayMode.
            // See DI-0409-1 — only chart/history views apply adjustSnapshotCashFlow.
            monthlyCashFlow: Number(snapshot.monthlyCashFlow),
            capRate: toNumber(snapshot.capRate),
            ltv: toNumber(snapshot.ltv),
            avmValueApplied: snapshot.avmValueApplied,
            avmRentApplied: snapshot.avmRentApplied,
          };
          const key = getMonthKey(snapshot.snapshotMonth);
          if (key === getMonthKey(currentMonth)) currentSnapshots.push(mapped);
          if (key === getMonthKey(previousMonth)) previousSnapshots.push(mapped);
        }
      }

      if (currentSnapshots.length === 0) continue;

      const milestoneSentinels =
        milestoneSentinelSchema.parse(user.mortgageMilestonesSentAt) ?? {};
      const milestoneCount = parseMilestonesThisMonth(milestoneSentinels, monthKey);
      const content = buildDigestContent({
        currentSnapshots,
        previousSnapshots,
        now,
      });
      if (!isDigestWorthSending(content, milestoneCount)) continue;

      const emailResult = await sendMonthlyDigestEmail(user.email, user.id, content);
      if (!emailResult.success) continue;

      const digestSentinels = digestSentinelSchema.parse(user.digestEmailsSentAt) ?? {};
      await prisma.user.update({
        where: { id: user.id },
        data: {
          digestEmailsSentAt: {
            ...digestSentinels,
            [monthKey]: now.toISOString(),
          },
        },
      });

      await captureServerEvent(user.clerkUserId, AnalyticsEvents.MONTHLY_DIGEST_SENT, {
        monthKey,
        propertyCount: content.items.length,
      });
      sent += 1;
    } catch (err) {
      Sentry.captureException(err, {
        tags: { area: "cron_monthly_digest" },
        extra: { userId: user.id },
      });
    }
  }

  return NextResponse.json({
    sent,
    processed: toProcess.length,
    remaining: Math.max(eligible.length - toProcess.length, 0),
  });
}
