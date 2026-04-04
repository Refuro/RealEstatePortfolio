import * as Sentry from "@sentry/nextjs";

// WKWebView (iOS in-app browsers) has broken PerformanceObserver support that
// causes Sentry's TTFB reporter to pass a non-object key to a WeakMap, crashing
// the browserMetrics integration on init. Detect it and skip browser perf
// integrations in that environment.
const isWKWebView =
  typeof navigator !== "undefined" &&
  /\bWKWebView\b/i.test(navigator.userAgent);

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment:
      process.env.NEXT_PUBLIC_VERCEL_ENV ||
      process.env.NODE_ENV ||
      "development",
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
    integrations: isWKWebView
      ? (defaults) =>
          defaults.filter(
            (i) =>
              i.name !== "BrowserMetrics" &&
              i.name !== "BrowserTracing" &&
              i.name !== "BrowserProfilingIntegration"
          )
      : undefined,
  });
}
