"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { AnalyticsEvents } from "@/lib/analytics-events";

const SIGNUP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // 7 days after account creation
const STORAGE_PREFIX = "veld_ph_signup_sent_";

/**
 * Fires `user_signed_up` once per user (localStorage) if the account is new enough.
 * Avoids relying on Clerk webhooks for MVP funnel signal.
 */
export function PostHogSignupOnce(): null {
  const { user, isLoaded } = useUser();
  const fired = useRef(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!isLoaded || !user?.id || fired.current) return;

    const storageKey = `${STORAGE_PREFIX}${user.id}`;
    try {
      if (typeof window !== "undefined" && window.localStorage.getItem(storageKey)) {
        return;
      }
    } catch {
      return;
    }

    // Clerk types allow `createdAt` to be null in some edge cases
    if (user.createdAt == null) {
      try {
        window.localStorage.setItem(storageKey, "1");
      } catch {
        /* ignore */
      }
      return;
    }
    const created = new Date(user.createdAt).getTime();
    if (Number.isNaN(created)) return;
    if (Date.now() - created > SIGNUP_WINDOW_MS) {
      try {
        window.localStorage.setItem(storageKey, "1");
      } catch {
        /* ignore */
      }
      return;
    }

    fired.current = true;
    posthog.capture(AnalyticsEvents.USER_SIGNED_UP, {
      clerk_user_id: user.id,
    });
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  }, [isLoaded, user]);

  return null;
}
