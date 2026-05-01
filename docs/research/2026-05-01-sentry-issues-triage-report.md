# Sentry issues triage & Resend observability fix (May 2026)

This document summarizes investigation of grouped Sentry issues **VELD-PORTFOLIO-1N**, **27**, **28**, and **29**, and the code changes made in-repo.

Organization: **skryptix**. Project: **veld-portfolio**.

---

## Issue summary

| Short ID | Description (Sentry title) | Category |
|----------|----------------------------|----------|
| **1N** | `TypeError: WeakMap keys must be objects…` via Sentry internals on `/sign-up` | Client SDK × WKWebView / browser metrics |
| **27** | Message `sg-probe`, debug level, non-app platform | Noise / external probe |
| **28** | RentCast “insufficient comparables” on `monthly-refresh` rent stage | Expected upstream refusal, overcaptured as exception |
| **29** | `Error: [object Object]` from `trial-emails` cron (`day13`) | Resend SDK error typed as plain object |

---

## VELD-PORTFOLIO-1N

**What it is.** The stack traces Sentry captured are almost entirely **`@sentry-internal/browser-utils`** → Web Vitals / TTFB wiring during **`Sentry.init()`**, not application React code.

**Impact.** Failure happens while the monitoring SDK initializes. It surfaces as **`unhandledrejection`**. This is not optional “analytics”; it can degrade or break the page load in **iOS WKWebView / in-app browsers** (prior internal incident documented similar behavior).

**Remediation status (codebase).**

- **`app/sentry.client.config.ts`** — Extensive WKWebView guards (`beforeSend`, skipping init on WKWebView, integration filtering, rejection handler).
- **`app/instrumentation-client.ts`** — Defers **`Sentry.init()`** via `Promise.resolve().then(...)`, **without** copying the WKWebView / browser-metrics safeguards.

Under Turbopack, client bootstrap may prioritize **`instrumentation-client.ts`**; duplicate / uneven init paths remain a plausible reason events still appear. **No code change was made for 1N in this pass.**

**External “known bug” framing.** Public Sentry changelog material does not map this cleanly to a single semver fix (“upgrade to X”). It is better described as **Sentry browser metrics interacting with Strict WebKit semantics and bundler/init ordering**. Mitigation remains **don't run brittle integrations on WKWebView** or unify init so the Turbopack path matches `sentry.client.config.ts`.

---

## VELD-PORTFOLIO-27

**What it is.** Literal message **`sg-probe`**, `level: debug`, no app stack trace, not referenced in-app.

**Assessment.** Operational / scanner / test-noise targeting the ingestion endpoint—not a product defect.

**Action.** Prefer **ignoring/archiving/filtering** in Sentry unless volume grows.

---

## VELD-PORTFOLIO-28

**What it is.** RentCast responds with an error body whose message indicates **unable to calculate AVM (insufficient comparables)**. **`app/lib/integrations/rentcast.ts`** throws **`new Error(message)`**.

**Handling in app.** **`app/lib/refresh.ts`** wraps **value** and **rent** fetches in **separate `try/catch`** blocks:

- Rent failure ⇒ **`rentEstimate` stays `null`**, **`rentApplied`** false ⇒ **no automated market rent update** from RentCast that run.
- Snapshot creation still proceeds with existing rent / derivation rules (`buildSnapshotData`).

So **behavior is sane** (graceful degradation: “no new rent estimate this run”). The rough edge is **`Sentry.captureException`** for an **expected** vendor outcome, which **pollutes** the error stream.

**No code change was made for 28 in this pass** (recommended follow-up: treat identifiable “no comps” outcomes as breadcrumb/`captureMessage` or skip Sentry).

---

## VELD-PORTFOLIO-29 — bug & fix implemented

### Root cause

**Resend Node SDK** returns **`{ data, error }`** where **`error`** matches their **`ErrorResponse`** shape (**plain object**): `message`, `name`, `statusCode`. It is **`not`** an **`Error`** instance.

The code wrapped failures as:

```ts
error instanceof Error ? error : new Error(String(error))
```

For Resend failures, **`String(error)` is `"[object Object]"`**, so Sentry loses the API message and error code.

**Reference.** Upstream typing: [`resend-node` `ErrorResponse`](https://github.com/resend/resend-node/blob/canary/src/interfaces.ts).

### Changes made

1. **New module:** `app/lib/emails/resend-sdk-error.ts`  
   - **`parseResendSdkError`** / **`errorFromResendSdk`** — build an **`Error`** with message + **`[name]`** + HTTP suffix when structured.  
   - **`resendSdkErrorExtra`** — **`message` / `name` / `status_code`** attached as Sentry **`extra`**.

2. **Call sites updated** so **`Sentry.captureException`** uses the helper consistently after **`resend.emails.send`**:
   - `app/lib/emails/trial-lifecycle.ts`
   - `app/lib/emails/winback.ts`
   - `app/lib/emails/monthly-digest.ts`
   - `app/lib/emails/mortgage-milestones.ts`
   - `app/lib/emails/onboarding-reengagement.ts`
   - `app/app/api/contact/route.ts`

**Result.** Future Resend failures should show actionable titles (e.g. validation / domain issues) plus structured **`extra`** in Sentry.

---

## Suggested follow-ups (not implemented here)

| Item | Follow-up |
|------|-----------|
| 1N | Single client init path **or** port WKWebView guards into **`instrumentation-client.ts`** |
| 28 | Downgrade **expected** RentCast “no comps” paths from **`captureException`** |
| 27 | Sentry issue workflow: ignore/archive + optional inbound filters |

---

## Related internal docs

- `docs/audits/reliability-ops/2026-04-02-ios-wkwebview-crash-incident.md` — WKWebView / Turbopack / **`Sentry.init`** timing (**VELD-PORTFOLIO-1E** lineage).
