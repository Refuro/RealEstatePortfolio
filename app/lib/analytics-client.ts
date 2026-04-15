"use client";

import posthog from "posthog-js";
import { AnalyticsEvents } from "@/lib/analytics-events";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function captureGoogleAdsConversion(event: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const signupLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL;
  const activationLabel =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PROPERTY_CREATED_CONVERSION_LABEL;
  const ctaLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CTA_CLICKED_CONVERSION_LABEL;

  if (event === AnalyticsEvents.USER_SIGNED_UP && signupLabel) {
    window.gtag("event", "conversion", { send_to: signupLabel });
  }
  if (event === AnalyticsEvents.PROPERTY_CREATED && activationLabel) {
    window.gtag("event", "conversion", { send_to: activationLabel });
  }
  if (event === AnalyticsEvents.FUNNEL_CTA_CLICKED && ctaLabel) {
    window.gtag("event", "conversion", { send_to: ctaLabel });
  }
}

function compactProperties(
  properties?: Record<string, unknown>
): Record<string, unknown> | undefined {
  if (!properties) return undefined;
  const entries = Object.entries(properties).filter(([, value]) => value !== undefined);
  return entries.length ? Object.fromEntries(entries) : undefined;
}

/**
 * Fire a PostHog event when the client is initialized and `NEXT_PUBLIC_POSTHOG_KEY` is set.
 * Safe to call from any client component after {@link ../components/analytics/posthog-provider}.
 */
export function captureClientEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  captureGoogleAdsConversion(event);
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, compactProperties(properties));
  } catch {
    // no-op
  }
}
