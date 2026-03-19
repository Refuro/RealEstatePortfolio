import { NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { getSubscriptionDetails } from "@/lib/billing/get-subscription-details";

/**
 * Returns subscription details (currentPeriodEnd, cancelAtPeriodEnd) after syncing from Stripe.
 * Used for client refresh; Settings page receives initial data via server props.
 */
export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const details = await getSubscriptionDetails(user.id);
  return NextResponse.json(details);
}
