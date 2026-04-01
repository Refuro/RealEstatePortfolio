import { NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { buildPortfolioSummaryPayload } from "@/lib/server/portfolio-summary-payload";

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await buildPortfolioSummaryPayload(user);
  return NextResponse.json(payload);
}
