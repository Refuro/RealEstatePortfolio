"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
import { getLandingVariantForAnalytics } from "@/lib/landing-variant-attribution";
import { getPlanIntentForAnalytics } from "@/lib/plan-intent";

/** v2: localStorage + cooldown so dismiss isn’t only session-scoped. */
const DISMISS_KEY = "veld_paid_intent_checkout_banner_v2";
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

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
  const [cooldownBlocks, setCooldownBlocks] = useState<boolean | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(DISMISS_KEY);
        if (raw) {
          const until = Number.parseInt(raw, 10);
          if (Number.isFinite(until) && Date.now() < until) {
            setCooldownBlocks(true);
            return;
          }
        }
      } catch {
        /* ignore */
      }
      setCooldownBlocks(false);
    });
  }, []);

  if (!isClient || effectiveTier !== "free" || dismissed || cooldownBlocks !== false) return null;

  const { plan_intent } = getPlanIntentForAnalytics();
  if (plan_intent !== "investor" && plan_intent !== "pro") return null;

  const { landing_variant: landingVariant } = getLandingVariantForAnalytics();

  const intentLabel = plan_intent === "pro" ? "Pro" : "Investor";

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now() + DISMISS_COOLDOWN_MS));
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="mb-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <p className="text-sm text-foreground">
          You started signup with the <span className="font-semibold">{intentLabel}</span> plan in
          mind. When you&apos;re ready, continue to checkout from Plans &amp; billing.
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <FunnelCtaLink
            href="/plans"
            placement="paid_intent_checkout_banner"
            ctaId="view_plans"
            landingVariant={landingVariant}
            className="inline-flex rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            View plans
          </FunnelCtaLink>
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
