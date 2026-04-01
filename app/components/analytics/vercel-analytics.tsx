"use client";

import { Analytics } from "@vercel/analytics/react";
import { useCookieConsent } from "@/components/consent/cookie-consent-provider";

/** Vercel Web Analytics only after optional analytics consent (same as PostHog / Google gtag). */
export function VercelAnalyticsClient() {
  const { hasAnalyticsConsent } = useCookieConsent();
  if (!hasAnalyticsConsent) return null;
  return <Analytics />;
}
