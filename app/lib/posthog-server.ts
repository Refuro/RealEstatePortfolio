import * as Sentry from "@sentry/nextjs";
import { PostHog } from "posthog-node";

/**
 * Server-side PostHog capture (e.g. Stripe webhook). No-op if key unset.
 * Uses shutdown per call for serverless-friendly flush.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  if (!key) return;

  const client = new PostHog(key, {
    host,
    flushAt: 1,
  });
  try {
    client.capture({
      distinctId,
      event,
      properties,
    });
    await client.shutdown();
  } catch (err) {
    console.error(
      JSON.stringify({
        action: "posthog_capture_error",
        event,
        message: err instanceof Error ? err.message : String(err),
      })
    );
    Sentry.captureException(err, { extra: { action: "posthog_capture_error", event } });
  }
}

/**
 * Batch multiple events for one distinctId in a single client lifecycle.
 * Prefer this over multiple sequential captureServerEvent calls (e.g. in crons)
 * to avoid repeated client setup + network flush overhead.
 */
export async function captureServerEvents(
  distinctId: string,
  events: Array<{ event: string; properties?: Record<string, unknown> }>
): Promise<void> {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  if (!key || events.length === 0) return;

  const client = new PostHog(key, {
    host,
    flushAt: events.length,
  });
  try {
    for (const { event, properties } of events) {
      client.capture({ distinctId, event, properties });
    }
    await client.shutdown();
  } catch (err) {
    const eventNames = events.map((e) => e.event);
    console.error(
      JSON.stringify({
        action: "posthog_capture_error",
        events: eventNames,
        message: err instanceof Error ? err.message : String(err),
      })
    );
    Sentry.captureException(err, { extra: { action: "posthog_capture_error", events: eventNames } });
  }
}
