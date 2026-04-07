"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useCookieConsent } from "@/components/consent/cookie-consent-provider";
import { PostHogIdentify } from "./posthog-identify";
import { PostHogPageView } from "./posthog-page-view";
import { PostHogPersonProperties } from "./posthog-person-properties";
import { PostHogPlanIntent } from "./posthog-plan-intent";
import { PostHogSignupOnce } from "./posthog-signup-once";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

/**
 * Always initializes PostHog in anonymous/memory-only mode (no cookies, no
 * device storage) so basic page-view and funnel events fire for every visitor.
 * When the user accepts analytics cookies the instance upgrades to full
 * persistent + identified mode.
 */
export function PostHogGate({ children }: { children: React.ReactNode }) {
  const { hasAnalyticsConsent, ready } = useCookieConsent();

  useEffect(() => {
    if (!POSTHOG_KEY) return;
    const g = globalThis as unknown as {
      __VELD_PH_MODE__?: "anon" | "full";
    };

    if (!g.__VELD_PH_MODE__) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        person_profiles: "identified_only",
        capture_pageview: false,
        persistence: "memory",
      });
      g.__VELD_PH_MODE__ = "anon";
    }

    if (hasAnalyticsConsent && g.__VELD_PH_MODE__ !== "full") {
      posthog.set_config({ persistence: "localStorage+cookie" });
      g.__VELD_PH_MODE__ = "full";
    } else if (!hasAnalyticsConsent && ready && g.__VELD_PH_MODE__ === "full") {
      posthog.reset();
      posthog.set_config({ persistence: "memory" });
      g.__VELD_PH_MODE__ = "anon";
    }
  }, [hasAnalyticsConsent, ready]);

  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return (
    <PHProvider client={posthog}>
      {hasAnalyticsConsent && (
        <>
          <PostHogIdentify />
          <PostHogPersonProperties />
          <PostHogPlanIntent />
          <PostHogSignupOnce />
        </>
      )}
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
