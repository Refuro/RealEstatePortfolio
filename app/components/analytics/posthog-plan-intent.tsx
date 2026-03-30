"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureClientEvent } from "@/lib/analytics-client";
import { getPlanIntentForAnalytics } from "@/lib/plan-intent";

const APPLIED_PREFIX = "veld_plan_intent_applied_";

/**
 * Registers plan intent as PostHog person/super properties after auth; fires `plan_intent_applied` once per user.
 */
export function PostHogPlanIntent(): null {
  const { user, isLoaded } = useUser();
  const fired = useRef(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!isLoaded || !user?.id) return;

    const { plan_intent, plan_intent_source } = getPlanIntentForAnalytics();
    posthog.register({
      plan_intent,
      plan_intent_source,
    });

    if (fired.current) return;
    if (plan_intent_source === "unknown") return;

    const key = `${APPLIED_PREFIX}${user.id}`;
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(key)) {
        fired.current = true;
        return;
      }
    } catch {
      return;
    }

    fired.current = true;
    captureClientEvent(AnalyticsEvents.PLAN_INTENT_APPLIED, {
      plan_intent,
      plan_intent_source,
      clerk_user_id: user.id,
    });
    try {
      window.localStorage.setItem(key, "1");
    } catch {
      /* ignore */
    }
  }, [isLoaded, user?.id]);

  return null;
}
