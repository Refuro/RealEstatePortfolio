"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useCookieConsent } from "@/components/consent/cookie-consent-provider";
import { PostHogIdentify } from "./posthog-identify";
import { PostHogPageView } from "./posthog-page-view";
import { PostHogPlanIntent } from "./posthog-plan-intent";
import { PostHogSignupOnce } from "./posthog-signup-once";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Initializes PostHog only when `NEXT_PUBLIC_POSTHOG_KEY` is set **and** the user
 * accepts optional analytics (cookie consent). Children render either way.
 */
export function PostHogGate({ children }: { children: React.ReactNode }) {
  const { hasAnalyticsConsent } = useCookieConsent();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    const g = globalThis as unknown as { __VELD_POSTHOG_INIT__?: boolean };
    if (hasAnalyticsConsent) {
      if (!g.__VELD_POSTHOG_INIT__) {
        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          person_profiles: "identified_only",
          capture_pageview: false,
          persistence: "localStorage+cookie",
        });
        g.__VELD_POSTHOG_INIT__ = true;
      }
    } else if (g.__VELD_POSTHOG_INIT__) {
      posthog.reset();
      g.__VELD_POSTHOG_INIT__ = false;
    }
  }, [hasAnalyticsConsent]);

  if (!POSTHOG_KEY || !hasAnalyticsConsent) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      <PostHogIdentify />
      <PostHogPlanIntent />
      <PostHogSignupOnce />
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
