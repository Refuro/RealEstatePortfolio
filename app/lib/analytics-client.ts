"use client";

import posthog from "posthog-js";

/**
 * Fire a PostHog event when the client is initialized and `NEXT_PUBLIC_POSTHOG_KEY` is set.
 * Safe to call from any client component after {@link ../components/analytics/posthog-provider}.
 */
export function captureClientEvent(
  event: string,
  properties?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  try {
    posthog.capture(event, properties);
  } catch {
    // no-op
  }
}
