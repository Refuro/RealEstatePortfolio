import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { buildPortfolioSummaryPayload } from "@/lib/server/portfolio-summary-payload";

/**
 * Same JSON as GET /api/portfolio/summary, with hourly rate limiting for print/export flows.
 */
export async function GET(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "export:portfolio_summary");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  await recordRateLimit(identifier, "export:portfolio_summary");
  const payload = await buildPortfolioSummaryPayload(user);
  return NextResponse.json(payload);
}
