import * as Sentry from "@sentry/nextjs";
import {
  assertPublicAppUrlForVercelDeploy,
  assertStripeWebhookSecretForVercelDeploy,
} from "@/lib/env";

export async function register() {
  assertStripeWebhookSecretForVercelDeploy();
  assertPublicAppUrlForVercelDeploy();
  if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn("[warn] NEXT_PUBLIC_SENTRY_DSN not set — errors will not be reported to Sentry");
  }
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
