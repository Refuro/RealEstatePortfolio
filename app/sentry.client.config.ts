import * as Sentry from "@sentry/nextjs";

// ---------------------------------------------------------------------------
// WKWebView guard – VELD-PORTFOLIO-1N
// ---------------------------------------------------------------------------
// WKWebView (iOS in-app browsers: Twitter, Facebook, LinkedIn, Mail, etc.) has
// broken PerformanceObserver support. Sentry's TTFB reporter inside the
// browserMetrics integration passes a non-object key to a WeakMap, producing:
//   TypeError: WeakMap keys must be objects or non-registered symbols
//
// The crash fires as an unhandled promise rejection during Sentry.init() →
// _setupIntegrations() → browserMetrics.setup() → onTTFB(). The entire
// stacktrace is Sentry-internal – zero first-party frames.
//
// Defence layers:
// 1. Broad WKWebView UA detection (explicit token + heuristic).
// 2. Hard fail-safe: do NOT initialize Sentry at all in WKWebView.
// 3. Regex-based integration filter strips all browser perf integrations.
// 4. try-catch around Sentry.init() so even unknown failures degrade gracefully.
// 5. beforeSend drops the specific WeakMap error if layers 1–3 miss it.
// 6. Global unhandledrejection listener prevents the rejection from surfacing.
// ---------------------------------------------------------------------------

const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

const isWKWebView =
  // Explicit WKWebView token (some apps include it)
  /\bWKWebView\b/i.test(ua) ||
  // Heuristic: iOS device + AppleWebKit but no "Safari/nnn" suffix.
  // Real Mobile Safari always appends "Safari/xxx.xxx"; WKWebView does not.
  (/iPad|iPhone|iPod/.test(ua) &&
    /AppleWebKit/.test(ua) &&
    !/Safari\/\d/.test(ua));

// Layer 5: Suppress the unhandled rejection so it never hits the console or
// any global error handler. Scoped tightly to this exact TypeError message.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (e) => {
    const msg = e.reason?.message ?? String(e.reason ?? "");
    if (
      msg.includes("WeakMap keys must be objects") &&
      String(e.reason?.stack ?? "").includes("browser-utils")
    ) {
      e.preventDefault();
    }
  });
}

if (process.env.NEXT_PUBLIC_SENTRY_DSN && !isWKWebView) {
  try {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment:
        process.env.NEXT_PUBLIC_VERCEL_ENV ||
        process.env.NODE_ENV ||
        "development",
      tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

      // Layer 3: Strip browser-perf integrations defensively.
      integrations: isWKWebView
        ? (defaults) =>
            defaults.filter(
              (i) =>
                !/(BrowserMetrics|BrowserTracing|BrowserProfil)/i.test(i.name)
            )
        : undefined,

      // Layer 5: Drop the event if it somehow still fires.
      beforeSend(event) {
        const isWeakMapFromSentry = event.exception?.values?.some(
          (ex) =>
            ex.type === "TypeError" &&
            ex.value?.includes("WeakMap keys must be objects") &&
            ex.stacktrace?.frames?.some(
              (f) =>
                f.filename?.includes("@sentry-internal/browser-utils") ||
                f.filename?.includes("@sentry/")
            )
        );
        if (isWeakMapFromSentry) return null;
        return event;
      },
    });
  } catch {
    // Layer 4: Swallow synchronous init failures so the app boots cleanly.
    // Sentry will be inert for this page load – acceptable trade-off.
  }
}
