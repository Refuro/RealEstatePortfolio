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
  }
}
