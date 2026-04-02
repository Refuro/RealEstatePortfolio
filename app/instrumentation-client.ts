import * as Sentry from "@sentry/nextjs";

// Defer init to after the module graph settles — calling Sentry.init() synchronously
// during module evaluation causes Sentry's onTTFB integration to trigger a re-entrant
// Turbopack module load, which crashes iOS WKWebView with a WeakMap TypeError (VELD-PORTFOLIO-1E).
Promise.resolve().then(() => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (dsn) {
    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV,
      tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    });
  }
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
