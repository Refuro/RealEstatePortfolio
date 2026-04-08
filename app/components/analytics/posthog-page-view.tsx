"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

function extractUtms(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const utms: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const val = params.get(key);
    if (val) utms[key] = val;
  }
  return utms;
}

/**
 * Sends a `$pageview` on pathname changes when PostHog is enabled.
 * (Pathname only — avoids Suspense requirement from `useSearchParams`.)
 * UTM params are explicitly extracted from window.location.search and passed
 * as event properties because PostHog's automatic UTM extraction does not run
 * when capture_pageview is false and pageviews are captured manually.
 */
export function PostHogPageView(): null {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const search = window.location.search;
    const full = `${window.location.origin}${pathname}${search}`;
    posthog.capture("$pageview", {
      $current_url: full,
      ...extractUtms(search),
    });
  }, [pathname]);

  return null;
}
