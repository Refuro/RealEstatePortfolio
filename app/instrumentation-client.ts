import * as Sentry from "@sentry/nextjs";

// ---------------------------------------------------------------------------
// VELD-PORTFOLIO-1N / 1E — iOS WKWebView Sentry init crash
// ---------------------------------------------------------------------------
// iOS WKWebView (in-app browsers: Google app, Gmail, Twitter, FB, LinkedIn,
// etc.) runs JavaScriptCore in strict mode, which rejects WeakMap keys that
// are mid-init objects. Sentry's browser-utils web-vitals integration hits
// this path during Sentry.init(), producing:
//   TypeError: WeakMap keys must be objects or non-registered symbols
// surfacing as `unhandledrejection` and breaking the page load.
//
// Policy: WKWebView gets NO client-side Sentry. We do not init at all.
// Server-side Sentry (sentry.server.config.ts) still captures every API
// and route error those users hit, so we lose nothing meaningful.
//
// Layered defense:
// 1. Synchronous unhandledrejection listener registered before anything else
//    — last-resort backstop in case UA detection misses an edge variant.
// 2. WKWebView UA detection (explicit token + Safari-suffix heuristic).
// 3. Hard-skip Sentry.init() entirely on WKWebView.
// 4. Microtask defer for the non-WKWebView path so Turbopack's module graph
//    settles before init runs (original VELD-PORTFOLIO-1E fix).
// 5. try/catch around Sentry.init() so unknown init failures degrade
//    gracefully — Sentry inert for that page load is acceptable; a blank
//    page is not.
// 6. beforeSend drops the specific WeakMap event if it somehow still fires.
// ---------------------------------------------------------------------------

const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

const isWKWebView =
  // Explicit WKWebView token (some apps include it).
  /\bWKWebView\b/i.test(ua) ||
  // Heuristic: iOS device + AppleWebKit but no "Safari/nnn" suffix.
  // Real Mobile Safari always appends "Safari/xxx.xxx"; WKWebView does not.
  (/iPad|iPhone|iPod/.test(ua) &&
    /AppleWebKit/.test(ua) &&
    !/Safari\/\d/.test(ua));

// Layer 1: Synchronous backstop. Registered before the microtask defer fires
// so it catches errors thrown during init itself. Scoped tightly to the exact
// TypeError signature so we never silently swallow unrelated rejections.
if (typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (e) => {
    const reason = e.reason as { message?: unknown; stack?: unknown } | null;
    const msg =
      typeof reason?.message === "string"
        ? reason.message
        : String(reason ?? "");
    const stack = typeof reason?.stack === "string" ? reason.stack : "";
    if (
      msg.includes("WeakMap keys must be objects") &&
      stack.includes("browser-utils")
    ) {
      e.preventDefault();
    }
  });
}

// Layers 3+4+5: Defer init to a microtask so the Turbopack module graph is
// fully settled before Sentry.init() runs. Hard-skip on WKWebView; wrap in
// try/catch as a final safety net.
Promise.resolve().then(() => {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn || isWKWebView) return;

  try {
    Sentry.init({
      dsn,
      environment:
        process.env.NEXT_PUBLIC_VERCEL_ENV ||
        process.env.NODE_ENV ||
        "development",
      tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,

      // Layer 6: Drop the WeakMap-from-Sentry event if it ever leaks past
      // the hard-skip guard (e.g., new in-app browser variant we haven't seen).
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
    // Swallow synchronous init failures so the app boots cleanly. Sentry
    // will be inert for this page load — acceptable trade-off vs. a crash.
  }
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
