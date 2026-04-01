"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { getPlanIntentForAnalytics } from "@/lib/plan-intent";

const DISMISS_KEY = "veld_paid_intent_checkout_banner_dismissed";

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {
      /* no external store */
    },
    () => true,
    () => false
  );
}

type PaidIntentCheckoutBannerProps = {
  effectiveTier: string;
};

/**
 * After signup, users who chose Investor or Pro intent (URL/CTA) still land on Free until checkout.
 * Surfaces a one-time nudge to /plans while tier is free and intent is paid.
 */
export function PaidIntentCheckoutBanner({ effectiveTier }: PaidIntentCheckoutBannerProps) {
  const isClient = useIsClient();
  const [dismissed, setDismissed] = useState(false);

  if (!isClient || effectiveTier !== "free" || dismissed) return null;

  try {
    if (sessionStorage.getItem(DISMISS_KEY) === "1") return null;
  } catch {
    /* ignore */
  }

  const { plan_intent } = getPlanIntentForAnalytics();
  if (plan_intent !== "investor" && plan_intent !== "pro") return null;

  const intentLabel = plan_intent === "pro" ? "Pro" : "Investor";

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="mb-4 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-foreground">
          You started signup with the <span className="font-semibold">{intentLabel}</span> plan in
          mind. When you&apos;re ready, continue to checkout from Plans &amp; billing.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link
            href="/plans"
            className="inline-flex rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            View plans
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-muted hover:bg-subtle hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
