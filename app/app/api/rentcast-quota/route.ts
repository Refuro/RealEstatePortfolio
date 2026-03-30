import { NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { getEffectiveTier } from "@/lib/plans";
import { getRentCastQuotaState } from "@/lib/rentcast-quota";

/**
 * Authenticated clients only: remaining RentCast uses in the rolling hour (shared pool).
 */
export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const tier = getEffectiveTier(user);
  const quota = await getRentCastQuotaState(user.id, tier);
  return NextResponse.json(quota);
}
