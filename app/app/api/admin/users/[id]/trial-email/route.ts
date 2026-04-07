import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";
import { sendTrialLifecycleEmail } from "@/lib/emails/trial-lifecycle";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getActiveAppUser();
  if (!admin || !isAdmin(admin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(admin.id, request);
  const { allowed } = await checkRateLimit(identifier, "admin:trial-email-send");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  const { id: userId } = await params;
  const now = new Date();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      subscriptionTier: true,
      subscriptionTierOverride: true,
      trialEndsAt: true,
      trialEmailsSentAt: true,
      onboardingEmailsOptedOutAt: true,
      deletedAt: true,
      _count: { select: { properties: true } },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (
    user.subscriptionTier !== "free" ||
    user.subscriptionTierOverride !== null ||
    user.onboardingEmailsOptedOutAt !== null ||
    user.deletedAt !== null ||
    !user.trialEndsAt
  ) {
    return NextResponse.json({
      ok: true,
      sent: false,
      message: "User is not eligible for trial lifecycle emails right now.",
    });
  }

  const endsAtMs = user.trialEndsAt.getTime();
  if (
    endsAtMs < now.getTime() - TRIAL_WINDOW_PAST_MS ||
    endsAtMs > now.getTime() + TRIAL_WINDOW_FUTURE_MS
  ) {
    return NextResponse.json({
      ok: true,
      sent: false,
      message: "No trial email due in the current send window.",
    });
  }

  const sentAt = sentAtSchema.parse(user.trialEmailsSentAt) ?? {};
  const diffMs = endsAtMs - now.getTime();

  let variant: "day10" | "day13" | "expired" | null = null;
  if (diffMs > 0) {
    const daysRemaining = Math.ceil(diffMs / DAY_MS);
    if (daysRemaining >= 3 && daysRemaining <= 5 && !sentAt.day10) {
      variant = "day10";
    } else if (daysRemaining >= 0 && daysRemaining <= 2 && !sentAt.day13) {
      variant = "day13";
    }
  } else {
    const expiredDays = Math.floor(Math.abs(diffMs) / DAY_MS);
    if (expiredDays >= 0 && expiredDays <= 2 && !sentAt.expired) {
      variant = "expired";
    }
  }

  if (!variant) {
    return NextResponse.json({
      ok: true,
      sent: false,
      message: "No unsent trial email is due for this user.",
    });
  }

  const result = await sendTrialLifecycleEmail(
    user.email,
    user.id,
    variant,
    user._count.properties
  );

  if (!result.success) {
    return NextResponse.json(
      {
        error:
          "Email provider is not configured or email send failed. Check RESEND settings.",
      },
      { status: 500 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      trialEmailsSentAt: { ...sentAt, [variant]: now.toISOString() },
    },
  });

  await captureServerEvent(user.clerkUserId, AnalyticsEvents.TRIAL_EMAIL_SENT, {
    variant,
  });
  if (variant === "expired") {
    await captureServerEvent(user.clerkUserId, AnalyticsEvents.TRIAL_EXPIRED, {
      via: "admin_trial_email_button",
    });
  }

  await recordRateLimit(identifier, "admin:trial-email-send");

  return NextResponse.json({
    ok: true,
    sent: true,
    variant,
    message: `Sent ${variant} trial email to ${user.email}.`,
  });
}
