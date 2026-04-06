import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";

const ONE_HOUR_MS = 60 * 60 * 1000;

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

  const cutoff = new Date(Date.now() - ONE_HOUR_MS);

  try {
    const result = await prisma.apiRateLimitEntry.deleteMany({
      where: {
        createdAt: { lt: cutoff },
      },
    });
    return NextResponse.json({ deleted: result.count });
  } catch (err) {
    console.error("Rate limit cleanup failed:", err);
    Sentry.captureException(
      err instanceof Error ? err : new Error("Rate limit cleanup failed"),
      { tags: { route: "api/cron/rate-limit-cleanup" } }
    );
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
