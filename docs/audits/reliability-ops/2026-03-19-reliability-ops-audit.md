# Reliability & Operations Audit — 2026-03-19

## Executive summary

- Sentry integration covers server, client, and edge runtimes, but the route-level error boundary (`app/(app)/error.tsx`) does not report errors to Sentry — only the root `global-error.tsx` does.
- External API failure handling is thorough for RentCast (timeout, rate-limit, auth errors all caught) but Stripe and Clerk error handling is less granular.
- No runbooks, incident response docs, or rollback procedures exist. The app is currently solo-operated with no documented recovery playbook.
- Build pipeline is straightforward (`prisma migrate deploy && next build`) with Sentry source maps. No health check endpoint exists for monitoring.

---

## Severity-ranked findings

### Critical

- None found.

### High

**H1 — Route-level error boundary does not report to Sentry**

- `app/(app)/error.tsx`: Catches errors within the app shell and renders "Something went wrong" with retry/back buttons.
- Does NOT call `Sentry.captureException(error)`.
- `app/global-error.tsx`: Correctly calls `Sentry.captureException(error)` — but only catches errors outside route segments.
- Most user-facing errors will hit the route-level boundary and be silently lost from monitoring.
- **Impact:** Production errors in authenticated routes go untracked. Debugging relies on user reports rather than automated alerting.

### Medium

**M1 — No health check or uptime monitoring endpoint**

- No `/api/health` or similar endpoint exists for external monitoring services (Vercel, UptimeRobot, etc.).
- The only way to detect an outage is through Sentry error spikes or manual checking.
- **Recommendation:** Add a lightweight `/api/health` endpoint that verifies DB connectivity and returns 200/503.

**M2 — Stripe error handling returns generic messages**

- `api/billing/create-checkout-session`: `catch` block logs error and returns `{ error: "Failed to create checkout session" }` (500).
- `api/billing/sync`: `catch` returns `{ synced: false, tier }` without logging.
- `api/billing/subscription-details`: `catch` falls back to DB values silently.
- Stripe failures are absorbed without structured logging or Sentry reporting.
- **Impact:** Billing issues (failed checkouts, sync failures) may go unnoticed.

**M3 — No incident response or rollback documentation**

- No runbook, incident response doc, or rollback procedure exists in `docs/`.
- `docs/setup/manual-steps.md` covers initial setup but not recovery.
- `docs/architecture-and-build-practices.md` covers deployment patterns but not rollback.
- **Impact:** During an incident, recovery depends entirely on operator memory and Vercel's built-in rollback.

### Low

**L1 — No Suspense boundaries for data-heavy pages**

- Property detail has `Suspense` for `PropertyDetailTabs` (line 126 in `properties/[id]/page.tsx`).
- Dashboard, Properties list, Modeling, Mortgage pages have no `Suspense` wrappers.
- Without Suspense, slow DB queries block the entire page render with no progressive loading.

**L2 — Clerk auth failures are not explicitly handled**

- `lib/auth.ts` uses `currentUser()` from Clerk. If Clerk is down or returns an error, the call will throw, which propagates to the error boundary.
- No graceful degradation (e.g., cached session, retry, or "auth service unavailable" message).
- At current scale this is acceptable, but at higher scale Clerk outages would take down the entire app.

**L3 — Billing sync uses sessionStorage throttle**

- `app/(app)/app-layout-client.tsx` throttles billing sync calls using `sessionStorage.getItem("lastBillingSync")`.
- If sessionStorage is cleared (incognito, browser restart), sync fires on every page load.
- Not a reliability issue per se, but creates unnecessary Stripe API calls.

**L4 — No `error.tsx` for non-app route segments**

- Only `app/(app)/error.tsx` exists. No error boundary for:
  - Public pages (`/pricing`, `/contact`, `/privacy`, `/terms`)
  - Auth pages (`/sign-in`, `/sign-up`)
- Errors on these pages fall through to `global-error.tsx`, which provides minimal UI.

---

## Detailed analysis

### Error boundary coverage

| Boundary | File | Sentry | UI |
|----------|------|--------|----|
| Root (global) | `app/global-error.tsx` | `Sentry.captureException(error)` | Minimal HTML fallback |
| App shell | `app/(app)/error.tsx` | **None** | "Something went wrong" + retry + back to dashboard |
| Route segments (public) | None | Falls through to global | Minimal |
| Route segments (auth) | None | Falls through to global | Minimal |

### Sentry integration points

| Surface | File | Implementation |
|---------|------|----------------|
| Server init | `sentry.server.config.ts` | `Sentry.init()` with DSN, `tracesSampleRate: 0.1` (prod) |
| Client init | `instrumentation-client.ts` | `Sentry.init()` |
| Edge init | `sentry.edge.config.ts` | `Sentry.init()` |
| Request error hook | `instrumentation.ts` | `onRequestError = Sentry.captureRequestError` |
| Global error boundary | `app/global-error.tsx` | `Sentry.captureException(error)` |
| Route error boundary | `app/(app)/error.tsx` | **Missing** |
| API routes | N/A | Caught by `onRequestError` if unhandled |

`onRequestError` in `instrumentation.ts` catches unhandled errors from API routes and server components. This provides a safety net for server-side errors. But client-side errors caught by `error.tsx` are not re-thrown to reach `global-error.tsx`.

### External API failure handling

#### RentCast (`lib/integrations/rentcast.ts`)

| Failure mode | Handling | Quality |
|-------------|----------|---------|
| 429 (rate limit) | Throws descriptive "Rate limit exceeded. Please try again later." | Good |
| 401/403 (auth) | Throws "Invalid API key or access denied." | Good |
| 4xx/5xx (general) | Parses error message from response body | Good |
| Timeout (15s) | `AbortController` with 15s timeout; throws "Request timed out. Please try again." | Good |
| Invalid response shape | Throws "Rent estimate unavailable" / "Value estimate unavailable" | Good |
| Network failure | Caught by outer try/catch; error propagates | Acceptable |

**Benchmark refresh route** (`api/properties/[id]/benchmark/refresh/route.ts`): On RentCast failure, still creates `RentCastApiCall` record (tracking the failed call), logs error, and returns 502 with message. Good pattern.

#### Stripe

| Route | Failure handling | Quality |
|-------|-----------------|---------|
| `billing/create-checkout-session` | `catch` logs, returns 500 with generic message | Basic |
| `billing/sync` | `catch` returns `{ synced: false }` silently | No logging |
| `billing/subscription-details` | `catch` falls back to DB values | Acceptable |
| `billing/portal` | No explicit error handling | Relies on global catch |
| `billing/webhook` | Signature verification errors return 400 | Good |

**Gap:** Stripe checkout failures and sync failures produce no Sentry events and no structured logs. A Stripe outage would be invisible to monitoring.

#### Clerk

| Surface | Failure handling | Quality |
|---------|-----------------|---------|
| `lib/auth.ts` `getAppUser()` | `currentUser()` → if null, returns null | OK for normal cases |
| Clerk SDK exception | Propagates to error boundary | Acceptable |
| Clerk webhook | N/A (no Clerk webhook; user sync on first request) | Acceptable |

No explicit retry or degraded mode for Clerk failures.

### Build and deploy pipeline

| Step | Implementation |
|------|----------------|
| Build script | `prisma migrate deploy && next build` |
| Sentry source maps | `withSentryConfig()` in `next.config.ts` |
| Type checking | `tsc --noEmit` via `npm run check` |
| Linting | ESLint via `npm run check` |
| Deployment | Vercel (assumed from Next.js + config patterns) |
| Rollback | Vercel built-in deployment rollback (no custom docs) |
| Migration rollback | No documented rollback procedure for Prisma migrations |

### Missing operational docs

| Document | Status |
|----------|--------|
| Incident response runbook | **Missing** |
| Rollback procedure | **Missing** |
| On-call playbook | **Missing** (solo operator) |
| Health check endpoint | **Missing** |
| Monitoring dashboard setup | **Missing** |
| Alerting configuration | **Missing** |

---

## Evidence reviewed

- `app/(app)/error.tsx` (route-level error boundary)
- `app/global-error.tsx` (root error boundary)
- `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts` (Sentry init)
- `instrumentation.ts` (request error hook)
- `app/lib/integrations/rentcast.ts` (RentCast error handling)
- `app/app/api/billing/create-checkout-session/route.ts` (Stripe checkout errors)
- `app/app/api/billing/sync/route.ts` (Stripe sync errors)
- `app/app/api/billing/subscription-details/route.ts` (Stripe details fallback)
- `app/app/api/billing/webhook/route.ts` (webhook signature verification)
- `app/lib/auth.ts` (Clerk auth flow)
- `app/(app)/app-layout-client.tsx` (billing sync throttle)
- `app/next.config.ts` (Sentry config, build)
- `docs/setup/manual-steps.md` (setup docs)
- `docs/architecture-and-build-practices.md` (deployment patterns)

---

## Risk & impact assessment

- **H1 (missing Sentry in error.tsx):** Most user-facing production errors will go untracked. This is the single highest-priority fix — it's a one-line addition.
- **M2 (Stripe error silence):** Billing issues may go unnoticed until a user reports them. At current scale this is manageable; at higher scale it's a revenue risk.
- **M3 (no runbooks):** Acceptable for a solo operator but becomes a liability for any team expansion or acquisition due diligence.
- **M1 (no health check):** Prevents automated uptime monitoring.

---

## Recommendations (prioritized)

1. **Add `Sentry.captureException(error)` to `app/(app)/error.tsx`** — One-line fix with highest observability impact.
2. **Add `/api/health` endpoint** — Verify DB connectivity, return 200/503. Use for external monitoring.
3. **Add structured logging to Stripe error paths** — Use `console.error` with structured context (userId, action, error message) in checkout, sync, and portal routes.
4. **Create incident response runbook** — Document: how to check Sentry, how to rollback Vercel deployment, how to check DB state, how to verify Stripe/Clerk status.
5. **Add Suspense boundaries to data-heavy pages** — Dashboard and Properties list would benefit from progressive loading.
6. **Add error.tsx for public route segment** — Catch errors on `/pricing`, `/contact` without falling through to minimal global error UI.

---

## Task candidates

- [ ] Add `Sentry.captureException(error)` to `app/(app)/error.tsx`.
- [ ] Add `/api/health` endpoint with DB connectivity check.
- [ ] Add structured error logging to `api/billing/create-checkout-session`, `api/billing/sync`.
- [ ] Create `docs/runbooks/incident-response.md` covering rollback, monitoring, and recovery.
- [ ] Add `Suspense` wrappers to dashboard and properties page components.

---

## Re-test checklist

- [ ] Trigger a route-level error and verify it appears in Sentry.
- [ ] Hit `/api/health` and verify 200 response with DB check.
- [ ] Simulate Stripe failure and verify structured log output.
- [ ] `npm run check` passes.

---

## Next trigger and cadence

- Trigger: infra changes, error-profile shifts, new external integrations
- Recommended next run: monthly + pre-launch
