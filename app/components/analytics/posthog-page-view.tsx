"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";

/**
 * Sends a `$pageview` on pathname changes when PostHog is enabled.
 * (Pathname only — avoids Suspense requirement from `useSearchParams`.)
 */
export function PostHogPageView(): null {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    const full =
      typeof window !== "undefined"
        ? `${window.location.origin}${pathname}${window.location.search}`
        : pathname;
    posthog.capture("$pageview", {
      $current_url: full,
    });
  }, [pathname]);

  return null;
}
