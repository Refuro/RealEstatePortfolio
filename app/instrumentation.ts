import * as Sentry from "@sentry/nextjs";
import { assertStripeWebhookSecretForVercelDeploy } from "@/lib/env";

export async function register() {
  assertStripeWebhookSecretForVercelDeploy();
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
