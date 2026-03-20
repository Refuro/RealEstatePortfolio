"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

if (typeof window !== "undefined" && POSTHOG_KEY) {
  const g = globalThis as unknown as { __VELD_POSTHOG_INIT__?: boolean };
  if (!g.__VELD_POSTHOG_INIT__) {
    g.__VELD_POSTHOG_INIT__ = true;
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      person_profiles: "identified_only",
      capture_pageview: false,
      persistence: "localStorage+cookie",
    });
  }
}

/**
 * PostHog client wrapper. Initializes once per tab when env is set.
 * Place inside `ClerkProvider`.
 */
export function PostHogAnalyticsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!POSTHOG_KEY) {
    return <>{children}</>;
  }

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
