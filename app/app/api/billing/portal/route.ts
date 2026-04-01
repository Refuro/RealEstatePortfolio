import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { getActiveAppUser } from "@/lib/auth";
import { resolveBillingPortalReturnPath } from "@/lib/billing/portal-return-path";
import { prisma } from "@/lib/db";
import { getPublicAppBaseUrlForBilling } from "@/lib/env";
import { getStripe, getPriceIdForPlan } from "@/lib/stripe-config";

type BillingCycle = "monthly" | "yearly";
type PaidTier = "investor" | "pro";

function isValidPaidTier(v: unknown): v is PaidTier {
  return v === "investor" || v === "pro";
}

function isValidBillingCycle(v: unknown): v is BillingCycle {
  return v === "monthly" || v === "yearly";
}

export async function POST(request: NextRequest) {
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

  let returnPath = "/settings";
  let targetPlan: PaidTier | null = null;
  let targetBillingCycle: BillingCycle | null = null;

  try {
    const text = await request.text();
    if (text) {
      const parsed = JSON.parse(text) as {
        returnPath?: unknown;
        targetPlan?: unknown;
        targetBillingCycle?: unknown;
      };
      returnPath = resolveBillingPortalReturnPath(parsed.returnPath);
      if (isValidPaidTier(parsed.targetPlan)) targetPlan = parsed.targetPlan;
      if (isValidBillingCycle(parsed.targetBillingCycle)) targetBillingCycle = parsed.targetBillingCycle;
    }
  } catch {
    // Empty body or invalid JSON — use defaults
  }

  const baseUrl = getPublicAppBaseUrlForBilling();
  const returnUrl = `${baseUrl}${returnPath}?billing_return=1`;

  try {
    const stripe = getStripe();

    // When a specific target plan + cycle is known (user clicked a direct action
    // button), use flow_data to skip the plan picker and go straight to a
    // confirmation screen for that exact price change.
    if (targetPlan && targetBillingCycle) {
      const priceId = getPriceIdForPlan(targetPlan, targetBillingCycle);
      const subRecord = await prisma.subscription.findUnique({
        where: { userId: user.id },
        select: { stripeSubscriptionId: true },
      });

      if (priceId && subRecord?.stripeSubscriptionId) {
        try {
          const stripeSub = await stripe.subscriptions.retrieve(
            subRecord.stripeSubscriptionId,
            { expand: ["items"] }
          );
          const itemId = stripeSub.items.data[0]?.id;

          if (itemId) {
            const session = await stripe.billingPortal.sessions.create({
              customer: user.stripeCustomerId,
              return_url: returnUrl,
              flow_data: {
                type: "subscription_update_confirm",
                after_completion: {
                  type: "redirect",
                  redirect: { return_url: returnUrl },
                },
                subscription_update_confirm: {
                  subscription: subRecord.stripeSubscriptionId,
                  items: [{ id: itemId, price: priceId, quantity: 1 }],
                },
              },
            });
            return NextResponse.json({ url: session.url });
          }
        } catch (flowErr) {
          // If the deep-link fails for any reason, fall through to the standard portal.
          console.warn("Portal flow_data failed, falling back to standard portal:", flowErr);
        }
      }
    }

    // Standard portal (manage billing, cancel, or flow_data fallback).
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      // billing_return=1 tells app-layout-client to bypass the 5-min sync
      // throttle so the tier refreshes immediately on return.
      return_url: returnUrl,
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
