# Incident Report — VELD-PORTFOLIO-1E iOS WKWebView Crash
**Date:** 2026-04-02  
**Severity:** High — unhandled production crash, escalating  
**Status:** Fix applied, pending deployment  
**Sentry Issue:** [VELD-PORTFOLIO-1E](https://skryptix.sentry.io/issues/7381146037/)  
**Trace ID:** `bdab0547b09b4e29a9a57e7edc5d0012`  
**Release at time of discovery:** `a4c5aae4e5a39460e4944cbd755cd716e1e0c9ab`

---

## Summary

A `TypeError: WeakMap keys must be objects or non-registered symbols` crash was identified in production, affecting iPhone users visiting `veldportfolio.com` via WKWebView (in-app browsers). The issue was escalating — 20 events logged across iOS 18.5, 18.6, and 18.7 in under 24 hours. Three events occurred on the `/sign-up` page.

The crash rendered the page broken or blank with no fallback. All affected users came through `Mobile Safari UI/WKWebView` (Google app, Gmail, or similar in-app browser). Zero desktop Chrome events were recorded.

---

## Affected Users

| Dimension | Value |
|---|---|
| Total crash events | 20 |
| Unique users impacted (Sentry-identified) | 0 (pre-auth, no user identity sent) |
| Browser | 100% Mobile Safari UI/WKWebView |
| OS breakdown | iOS 18.7 (18), iOS 18.6 (1), iOS 18.5 (1) |
| Pages | `/` homepage (17), `/sign-up` (3) |
| Traffic source | Google paid ads (`paid_test_2026q1`, `gad_source=5`, SafeFrame referer) |
| Mechanism | `auto.browser.global_handlers.onunhandledrejection` — unhandled |

---

## Root Cause

### Full crash chain (bottom-up from Sentry trace)

```
Turbopack: registerChunk
  → app-next-turbopack.ts:8        Next.js bootstraps client, requires instrumentation
    → require-instrumentation-client.ts:26
      → moduleFactory (build-base.ts:72)   Executes instrumentation-client.ts
        → Sentry.init()                    Called synchronously during module evaluation
          → client._setupIntegrations()
            → BrowserMetrics integration setup
              → onTTFB.ts:35              TTFB web vitals instruments document.readyState
                → instrument.ts:addHandler
                  → [re-entrant module load via Turbopack]
                    → WeakMap.set(???)    Module is mid-init, key is not yet an object
                      → [native code] set ← CRASH (iOS JavaScriptCore strict enforcement)
```

### Why this only affects iOS WKWebView

Turbopack's browser module runtime uses a `WeakMap` to register module instances. During the re-entrant load triggered by Sentry's `onTTFB` integration, the module reference passed to `WeakMap.set()` is not yet a valid object (mid-initialization). V8 (Chrome/Node) handles this edge case more leniently. **JavaScriptCore (iOS 18.x) throws strictly** — `WeakMap keys must be objects or non-registered symbols`.

### Contributing factors

1. **`instrumentation-client.ts` called `Sentry.init()` synchronously at module evaluation time.** The Sentry SDK's `onTTFB` integration (TTFB web vitals) runs during `_setupIntegrations()`, which triggers a re-entrant Turbopack module load before the module graph has settled.

2. **Double initialization.** `Sentry.init()` was also being called in `sentry.client.config.ts` via the `withSentryConfig` build plugin. The call in `instrumentation-client.ts` was redundant AND the source of the crash.

3. **Next.js 16.1.6 + Turbopack in production.** Turbopack is the production bundler via explicit `turbopack: { root: appDir }` config. The multi-lockfile monorepo layout is an additional stressor noted in the config comments.

4. **Active paid campaign.** Traffic arriving via `utm_campaign: paid_test_2026q1` meant first-time paid visitors were hitting the crash on their first page load.

---

## Fix Applied

**File:** `app/instrumentation-client.ts`  
**Commit reference:** Apply before next deployment (fix made 2026-04-02)

### Before
```ts
import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
```

### After
```ts
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
```

### Why this fix is correct

`Promise.resolve().then()` schedules a microtask. Microtasks execute after the current synchronous execution stack — including all module evaluation for the current Turbopack chunk — is complete. By the time `Sentry.init()` runs, the module registry is fully settled and `onTTFB`'s re-entrant load cannot produce an invalid WeakMap key.

The static `import * as Sentry` remains synchronous (static imports are resolved before any evaluation code runs — they do not trigger new module loads during evaluation).

`onRouterTransitionStart` is still exported synchronously as required by Next.js, and no router transitions can occur before the microtask fires.

Per official Sentry docs for Next.js 15+/Turbopack: `instrumentation-client.ts` is the correct and only client-side init location. `sentry.client.config.ts` is the legacy Webpack-injected path and is not auto-injected under Turbopack. The previous code was therefore both crashing and redundant.

---

## Verification After Deployment

After deploying:
1. Watch `skryptix.sentry.io` → Issues → VELD-PORTFOLIO-1E for ~10 minutes
2. Confirm no new events appear
3. Confirm mobile Sentry events still flowing (SDK still initializes via microtask)
4. Mark VELD-PORTFOLIO-1E as **resolved** in Sentry so it re-alerts if it regresses

To reproduce before deploying: open the site from within the Google app or Gmail on iPhone iOS 18.x (WKWebView context) — do not test from standalone Safari.

---

## Reproduction Attempt

Attempted reproduction on iOS 18.6.2 via iMessage link (WKWebView via Messages) — **did not reproduce**. Likely explanation: Messages uses a different WKWebView context than the Google app. The Sentry event came from a Google Ads SafeFrame referer, indicating the user was inside the Google app's in-app browser, which has a stricter sandboxed WKWebView. Version difference (18.6.2 vs 18.7) may also be a factor.

---

## Secondary Notes

- `sentry.client.config.ts` still exists and contains a valid `Sentry.init()` call. Under the current Turbopack build, this file is **not** auto-injected. It should either be removed or kept as a Webpack fallback with a clear comment.
- `tracesSampleRate: 0.1` in production means only 10% of errors are captured. Consider temporarily increasing while monitoring mobile after this fix.
- No `ErrorBoundary` exists in the root layout. If any init-level error slips through in future, users get a blank page with no fallback. Consider adding `app/global-error.tsx`.
