import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";
import { sendOnboardingEmail } from "@/lib/emails/onboarding-reengagement";

const sentAtSchema = z
  .object({
    day3: z.string().nullable().optional(),
    day7: z.string().nullable().optional(),
  })
  .nullable()
  .catch(null);

// Called by Vercel Cron daily at 14:00 UTC (see vercel.json).
// Sends day-3 and day-7 re-engagement emails to users with no properties.

const DAY_MS = 24 * 60 * 60 * 1000;
// ±1 day window around the target age keeps us from missing users if the cron
// fires slightly early or late, while the sentinel field prevents double-sends.
const DAY3_MIN_MS = 2 * DAY_MS;
const DAY3_MAX_MS = 4 * DAY_MS;
const DAY7_MIN_MS = 6 * DAY_MS;
const DAY7_MAX_MS = 8 * DAY_MS;

export async function GET(req: NextRequest) {
  // Verify the Vercel Cron secret (Authorization: Bearer <CRON_SECRET>).
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

  // Fetch users who:
  //  - are not opted out of onboarding emails
  //  - have no properties
  //  - may still need a day-3 or day-7 email (rough age filter to keep the
  //    query set small; per-user checks below are exact)
  const candidates = await prisma.user.findMany({
    where: {
      onboardingEmailsOptedOutAt: null,
      deletedAt: null,
      createdAt: {
        // oldest possible candidate: day-7 window upper bound
        gte: new Date(now.getTime() - DAY7_MAX_MS),
      },
      properties: { none: {} },
    },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      createdAt: true,
      onboardingEmailsSentAt: true,
    },
  });

  let sent = 0;

  for (const user of candidates) {
    const ageMs = now.getTime() - user.createdAt.getTime();
    const sentAt = sentAtSchema.parse(user.onboardingEmailsSentAt) ?? {};

    try {
      if (ageMs >= DAY3_MIN_MS && ageMs <= DAY3_MAX_MS && !sentAt.day3) {
        const result = await sendOnboardingEmail(user.email, user.id, "day3");
        if (result.success) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              onboardingEmailsSentAt: { ...sentAt, day3: now.toISOString() },
            },
          });
          await captureServerEvent(user.clerkUserId, AnalyticsEvents.ONBOARDING_EMAIL_SENT, {
            variant: "day3",
          });
          sent++;
        }
      }

      if (ageMs >= DAY7_MIN_MS && ageMs <= DAY7_MAX_MS && !sentAt.day7) {
        const result = await sendOnboardingEmail(user.email, user.id, "day7");
        if (result.success) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              onboardingEmailsSentAt: { ...sentAt, day7: now.toISOString() },
            },
          });
          await captureServerEvent(user.clerkUserId, AnalyticsEvents.ONBOARDING_EMAIL_SENT, {
            variant: "day7",
          });
          sent++;
        }
      }
    } catch (err) {
      console.error(`Onboarding email error for user ${user.id}:`, err);
      Sentry.captureException(err, {
        tags: { area: "cron_onboarding_emails" },
        extra: { userId: user.id },
      });
    }
  }

  return NextResponse.json({ sent });
}
