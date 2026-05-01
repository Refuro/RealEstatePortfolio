import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveBalance } from "@/lib/amortization";
import {
  seedLtvSentinelsForProperty,
  seedPayoffSentinelForMortgage,
  type MortgageMilestoneSentinel,
} from "@/lib/mortgage-milestones";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";

const bodySchema = z.object({ dryRun: z.boolean().optional().default(false) });

const milestoneSentinelSchema = z
  .record(z.string(), z.string().nullable().optional())
  .nullable()
  .catch(null);

export async function POST(request: NextRequest) {
  const admin = await getActiveAppUser();
  if (!admin || !isAdmin(admin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(admin.id, request);
  const { allowed } = await checkRateLimit(identifier, "admin:milestone-sentinel-backfill");
  if (!allowed) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const { dryRun } = bodySchema.parse(body);

  try {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null,
        properties: { some: { mortgages: { some: {} } } },
      },
      select: {
        id: true,
        mortgageMilestonesSentAt: true,
        properties: {
          select: {
            id: true,
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

    let usersAffected = 0;
    let sentinelsAdded = 0;
    const now = new Date().toISOString();

    for (const user of users) {
      const existingSentinels = (
        milestoneSentinelSchema.parse(user.mortgageMilestonesSentAt) ?? {}
      ) as MortgageMilestoneSentinel;

      const newSeeds: Record<string, string> = {};

      for (const property of user.properties) {
        if (property.mortgages.length === 0) continue;
        const estimatedValue = Number(property.currentEstimatedValue);
        if (estimatedValue <= 0) continue;

        const totalBalance = property.mortgages.reduce(
          (sum, m) => sum + getEffectiveBalance(m),
          0
        );
        const ltvPercent = (totalBalance / estimatedValue) * 100;
        const combinedSentinels = { ...existingSentinels, ...newSeeds };
        Object.assign(
          newSeeds,
          seedLtvSentinelsForProperty(property.id, ltvPercent, combinedSentinels, now)
        );
        for (const m of property.mortgages) {
          Object.assign(
            newSeeds,
            seedPayoffSentinelForMortgage(property.id, m.id, m, combinedSentinels, now)
          );
        }
      }

      if (Object.keys(newSeeds).length === 0) continue;

      usersAffected += 1;
      sentinelsAdded += Object.keys(newSeeds).length;

      if (!dryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            mortgageMilestonesSentAt: { ...existingSentinels, ...newSeeds },
          },
        });
      }
    }

    await recordRateLimit(identifier, "admin:milestone-sentinel-backfill");

    return NextResponse.json({
      ok: true,
      dryRun,
      usersAffected,
      sentinelsAdded,
      message: dryRun
        ? `Dry run: would seed ${sentinelsAdded} sentinel(s) across ${usersAffected} user(s)`
        : `Seeded ${sentinelsAdded} sentinel(s) across ${usersAffected} user(s)`,
    });
  } catch (err) {
    console.error("Milestone sentinel backfill error:", err);
    Sentry.captureException(
      err instanceof Error ? err : new Error("Milestone sentinel backfill failed"),
      { tags: { route: "api/admin/backfill-milestone-sentinels" } }
    );
    return NextResponse.json({ error: "Backfill failed" }, { status: 500 });
  }
}
