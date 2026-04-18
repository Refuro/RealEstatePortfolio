"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

const SIGNUP_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const STORAGE_KEY_PREFIX = "veld_gads_signup_sent_";

/**
 * Polls for window.gtag readiness before firing, handling the race between
 * the afterInteractive gtag Script and the useEffect on first app load.
 * Gives up after ~3 s (30 × 100 ms) — if gtag never loads, the user didn't
 * consent and no conversion should fire anyway.
 */
function fireConversionWhenReady(label: string, attempt = 0): void {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", { send_to: label });
    return;
  }
  if (attempt < 30) {
    setTimeout(() => fireConversionWhenReady(label, attempt + 1), 100);
  }
}

/**
 * Fires the Google Ads signed_up conversion once per new user, independently
 * of PostHog and the analytics consent gate.
 *
 * Mounting outside the consent gate means it runs as soon as Clerk resolves
 * the user — the gtag retry handles the case where the Script hasn't executed
 * yet. If the user never consented, gtag won't be defined and the retry
 * silently expires, so no conversion fires without consent.
 */
export function GoogleAdsSignupConversion(): null {
  const { user, isLoaded } = useUser();
  const fired = useRef(false);

  useEffect(() => {
    const label = process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL;
    if (!label) return;
    if (!isLoaded || !user?.id || fired.current) return;

    const storageKey = `${STORAGE_KEY_PREFIX}${user.id}`;
    try {
      if (window.localStorage.getItem(storageKey)) return;
    } catch {
      return;
    }

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
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
    fireConversionWhenReady(label);
  }, [isLoaded, user]);

  return null;
}
