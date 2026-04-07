import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";
import { sendTrialLifecycleEmail } from "@/lib/emails/trial-lifecycle";

const sentAtSchema = z
  .object({
    day10: z.string().nullable().optional(),
    day13: z.string().nullable().optional(),
    expired: z.string().nullable().optional(),
  })
  .nullable()
  .catch(null);

const DAY_MS = 24 * 60 * 60 * 1000;
const TRIAL_WINDOW_FUTURE_MS = 5 * DAY_MS;
const TRIAL_WINDOW_PAST_MS = 2 * DAY_MS;

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
  const candidates = await prisma.user.findMany({
    where: {
      subscriptionTier: "free",
      subscriptionTierOverride: null,
      trialEndsAt: {
        gte: new Date(now.getTime() - TRIAL_WINDOW_PAST_MS),
        lte: new Date(now.getTime() + TRIAL_WINDOW_FUTURE_MS),
      },
      onboardingEmailsOptedOutAt: null,
      deletedAt: null,
    },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      trialEndsAt: true,
      trialEmailsSentAt: true,
      _count: { select: { properties: true } },
    },
  });

  let sent = 0;

  for (const user of candidates) {
    const sentAt = sentAtSchema.parse(user.trialEmailsSentAt) ?? {};
    const endsAt = user.trialEndsAt;
    if (!endsAt) continue;

    const diffMs = endsAt.getTime() - now.getTime();

    try {
      if (diffMs > 0) {
        const daysRemaining = Math.ceil(diffMs / DAY_MS);

        if (daysRemaining >= 3 && daysRemaining <= 5 && !sentAt.day10) {
          const result = await sendTrialLifecycleEmail(
            user.email,
            user.id,
            "day10",
            user._count.properties
          );
          if (result.success) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                trialEmailsSentAt: { ...sentAt, day10: now.toISOString() },
              },
            });
            await captureServerEvent(user.clerkUserId, AnalyticsEvents.TRIAL_EMAIL_SENT, {
              variant: "day10",
            });
            sent++;
          }
        }

        if (daysRemaining >= 0 && daysRemaining <= 2 && !sentAt.day13) {
          const result = await sendTrialLifecycleEmail(
            user.email,
            user.id,
            "day13",
            user._count.properties
          );
          if (result.success) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                trialEmailsSentAt: { ...sentAt, day13: now.toISOString() },
              },
            });
            await captureServerEvent(user.clerkUserId, AnalyticsEvents.TRIAL_EMAIL_SENT, {
              variant: "day13",
            });
            sent++;
          }
        }
      } else {
        const expiredDays = Math.floor(Math.abs(diffMs) / DAY_MS);
        if (expiredDays >= 0 && expiredDays <= 2 && !sentAt.expired) {
          const result = await sendTrialLifecycleEmail(
            user.email,
            user.id,
            "expired",
            user._count.properties
          );
          if (result.success) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                trialEmailsSentAt: { ...sentAt, expired: now.toISOString() },
              },
            });
            await captureServerEvent(user.clerkUserId, AnalyticsEvents.TRIAL_EMAIL_SENT, {
              variant: "expired",
            });
            await captureServerEvent(user.clerkUserId, AnalyticsEvents.TRIAL_EXPIRED, {
              via: "trial_email_cron",
            });
            sent++;
          }
        }
      }
    } catch (err) {
      console.error(`Trial email error for user ${user.id}:`, err);
      Sentry.captureException(err, {
        tags: { area: "cron_trial_emails" },
        extra: { userId: user.id },
      });
    }
  }

  return NextResponse.json({ sent });
}
