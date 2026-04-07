"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureClientEvent } from "@/lib/analytics-client";

// One sessionStorage key per user so the event fires once per browser session,
// not once per lifetime (unlike signup which uses localStorage).
const STORAGE_PREFIX = "veld_ph_signin_sent_";

/**
 * Fires `user_signed_in` once per browser session per user.
 * Mounted inside PostHogGate (requires analytics consent) alongside PostHogSignupOnce.
 * Enables returning-user retention metrics without stitching pageviews.
 */
export function PostHogSigninOnce(): null {
  const { user, isLoaded } = useUser();
  const fired = useRef(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!isLoaded || !user?.id || fired.current) return;

    const storageKey = `${STORAGE_PREFIX}${user.id}`;
    try {
      if (typeof window !== "undefined" && window.sessionStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      return;
    }

    fired.current = true;
    captureClientEvent(AnalyticsEvents.USER_SIGNED_IN, {
      clerk_user_id: user.id,
    });
    try {
      window.sessionStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  }, [isLoaded, user]);

  return null;
}
