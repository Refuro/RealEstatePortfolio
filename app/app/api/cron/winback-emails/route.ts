import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";
import { sendWinbackEmail, type WinbackVariant } from "@/lib/emails/winback";

const winbackSentinelSchema = z.record(z.string(), z.string().nullable().optional()).nullable().catch(null);

const DAY_MS = 24 * 60 * 60 * 1000;
const SIX_MONTHS_DAYS = 180;
const TWELVE_MONTHS_DAYS = 365;
const UNSUBSCRIBED_KEY = "__unsubscribedAt";

function getAnchorDate(lastActiveAt: Date | null, createdAt: Date): Date {
  return lastActiveAt ?? createdAt;
}

function chooseVariant(ageDays: number, sentinels: Record<string, string | null | undefined>): WinbackVariant | null {
  if (typeof sentinels[UNSUBSCRIBED_KEY] === "string") return null;
  if (ageDays >= TWELVE_MONTHS_DAYS && !sentinels["12mo"]) return "12mo";
  if (ageDays >= SIX_MONTHS_DAYS && !sentinels["6mo"]) return "6mo";
  return null;
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
  const candidates = await prisma.user.findMany({
    where: {
      deletedAt: null,
      properties: { some: {} },
    },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      createdAt: true,
      lastActiveAt: true,
      winbackEmailsSentAt: true,
      _count: { select: { properties: true } },
    },
  });

  let sent = 0;
  let sent6mo = 0;
  let sent12mo = 0;

  for (const user of candidates) {
    const sentinels = winbackSentinelSchema.parse(user.winbackEmailsSentAt) ?? {};
    const anchor = getAnchorDate(user.lastActiveAt, user.createdAt);
    const ageDays = Math.floor((now.getTime() - anchor.getTime()) / DAY_MS);
    const variant = chooseVariant(ageDays, sentinels);
    if (!variant) continue;

    try {
      const result = await sendWinbackEmail(
        user.email,
        user.id,
        variant,
        user._count.properties
      );
      if (!result.success) continue;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          winbackEmailsSentAt: {
            ...sentinels,
            [variant]: now.toISOString(),
          },
        },
      });

      await captureServerEvent(user.clerkUserId, AnalyticsEvents.WINBACK_EMAIL_SENT, {
        variant,
        ageDays,
        propertyCount: user._count.properties,
      });

      sent += 1;
      if (variant === "6mo") sent6mo += 1;
      if (variant === "12mo") sent12mo += 1;
    } catch (err) {
      console.error(`Winback email error for user ${user.id}:`, err);
      Sentry.captureException(err, {
        tags: { area: "cron_winback_emails" },
        extra: { userId: user.id },
      });
    }
  }

  return NextResponse.json({
    sent,
    sent6mo,
    sent12mo,
    processed: candidates.length,
  });
}
