"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import posthog from "posthog-js";

type MeResponse = {
  subscriptionTier?: string;
  propertyCount?: number;
  dealCount?: number;
  error?: string;
};

/**
 * Syncs PostHog person properties (plan tier, counts) from GET /api/me.
 * Runs on load and when the tab becomes visible again (avoids refetching on every route change).
 */
export function PostHogPersonProperties(): null {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!isLoaded || !user?.id) return;

    let cancelled = false;

    async function sync() {
      try {
        const res = await fetch("/api/me");
        const data = (await res.json()) as MeResponse;
        if (cancelled || data.error || !res.ok) return;
        posthog.setPersonProperties({
          plan_tier: data.subscriptionTier ?? "free",
          property_count: data.propertyCount ?? 0,
          deal_count: data.dealCount ?? 0,
        });
      } catch {
        /* ignore */
      }
    }

    void sync();

    const onVisibility = () => {
      if (document.visibilityState === "visible") void sync();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isLoaded, user?.id]);

  return null;
}
