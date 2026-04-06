import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { buildPortfolioSummaryPayload } from "@/lib/server/portfolio-summary-payload";

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = await buildPortfolioSummaryPayload(user);
    return NextResponse.json(payload);
  } catch (err) {
    console.error("Portfolio summary error:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Portfolio summary failed"), {
      tags: { route: "api/portfolio/summary", userId: user.id },
    });
    return NextResponse.json({ error: "Failed to load portfolio summary" }, { status: 500 });
  }
}
