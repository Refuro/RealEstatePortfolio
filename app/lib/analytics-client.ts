"use client";

import posthog from "posthog-js";
import { AnalyticsEvents } from "@/lib/analytics-events";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function fireConversionWhenReady(label: string, attempt = 0): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", { send_to: label });
    return;
  }
  if (attempt < 30) {
    setTimeout(() => fireConversionWhenReady(label, attempt + 1), 100);
  }
}

function captureGoogleAdsConversion(event: string): void {
  if (typeof window === "undefined") return;

  const activationLabel =
    process.env.NEXT_PUBLIC_GOOGLE_ADS_PROPERTY_CREATED_CONVERSION_LABEL;
  const ctaLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CTA_CLICKED_CONVERSION_LABEL;

  // USER_SIGNED_UP is handled by GoogleAdsSignupConversion (has gtag-ready retry + own dedup).
  if (event === AnalyticsEvents.PROPERTY_CREATED && activationLabel) {
    fireConversionWhenReady(activationLabel);
  }
  if (event === AnalyticsEvents.FUNNEL_CTA_CLICKED && ctaLabel) {
    fireConversionWhenReady(ctaLabel);
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
