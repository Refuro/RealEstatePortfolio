import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";
import { sendMortgageMilestoneEmail } from "@/lib/emails/mortgage-milestones";
import {
  detectNewMortgageMilestonesForUser,
  type MortgageMilestoneSentinel,
} from "@/lib/mortgage-milestones";

const milestoneSentinelSchema = z.record(z.string(), z.string().nullable().optional()).nullable().catch(null);

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
      digestEmailsOptedOutAt: null,
      properties: {
        some: {
          mortgages: {
            some: {},
          },
        },
      },
    },
    select: {
      id: true,
      clerkUserId: true,
      email: true,
      mortgageMilestonesSentAt: true,
      properties: {
        select: {
          id: true,
          nickname: true,
          currentEstimatedValue: true,
          mortgages: {
            select: {
              id: true,
              originalLoanAmount: true,
              currentBalance: true,
              interestRate: true,
              termYears: true,
              startDate: true,
              monthlyPayment: true,
              balanceAsOfDate: true,
              paymentEffectiveDate: true,
              escrowIncluded: true,
              escrowAmount: true,
            },
          },
        },
      },
    },
  });

  let sentEmails = 0;
  let sentMilestones = 0;

  for (const user of candidates) {
    const sentinels = (milestoneSentinelSchema.parse(user.mortgageMilestonesSentAt) ?? {}) as MortgageMilestoneSentinel;
    const milestones = detectNewMortgageMilestonesForUser({
      properties: user.properties,
      sentinels,
      now,
    });
    if (milestones.length === 0) continue;

    const visibleMilestones = milestones.filter((m) => !m.silent);
    if (visibleMilestones.length === 0) continue;

    try {
      const result = await sendMortgageMilestoneEmail(user.email, user.id, visibleMilestones);
      if (!result.success) continue;

      const nextSentinels: MortgageMilestoneSentinel = { ...sentinels };
      for (const milestone of milestones) {
        nextSentinels[milestone.key] = now.toISOString();
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          mortgageMilestonesSentAt: nextSentinels,
        },
      });

      await captureServerEvent(user.clerkUserId, AnalyticsEvents.MORTGAGE_MILESTONE_EMAIL_SENT, {
        milestoneCount: visibleMilestones.length,
      });

      sentEmails += 1;
      sentMilestones += visibleMilestones.length;
    } catch (err) {
      console.error(`Milestone email error for user ${user.id}:`, err);
      Sentry.captureException(err, {
        tags: { area: "cron_milestone_emails" },
        extra: { userId: user.id },
      });
    }
  }

  return NextResponse.json({ sentEmails, sentMilestones });
}
