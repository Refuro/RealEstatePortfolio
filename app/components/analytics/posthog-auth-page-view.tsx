"use client";

import { useEffect, useRef } from "react";
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

type AuthPage = "signup" | "signin";

/**
 * Fires a one-shot page-rendered event so we can build a funnel:
 *   page_view → form_rendered → user_signed_up / user_signed_in
 *
 * This fills the gap where Clerk's iframe fails to render (CSP, network, JS
 * error, ad blocker) — without this event, a broken form is invisible in
 * analytics because the user just silently bounces.
 *
 * Uses `captureClientEvent`, which is a no-op when PostHog is not configured,
 * so this component is safe to mount unconditionally.
 */
export function PostHogAuthPageView({ page }: { page: AuthPage }): null {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    const event =
      page === "signup"
        ? AnalyticsEvents.SIGNUP_PAGE_RENDERED
        : AnalyticsEvents.SIGNIN_PAGE_RENDERED;
    captureClientEvent(event, {
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  }, [page]);

  return null;
}
