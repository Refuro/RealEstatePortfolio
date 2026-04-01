import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { getPublicAppBaseUrlForBilling } from "@/lib/env";
import { getStripe } from "@/lib/stripe-config";

export async function POST() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing customer; subscribe first" },
      { status: 400 }
    );
  }

  const baseUrl = getPublicAppBaseUrlForBilling();

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${baseUrl}/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Billing portal error:", err);
    Sentry.captureException(err instanceof Error ? err : new Error("Billing portal session failed"), {
      tags: { area: "billing", route: "billing/portal" },
    });
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 }
    );
  }
}
