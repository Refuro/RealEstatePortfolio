# Reliability & Operations Audit — 2026-04-01

## Executive summary

- **Observability has a critical blind spot:** no `sentry.client.config.ts` exists, so client-side errors (browser crashes, React rendering exceptions) are never reported to Sentry. The inner error boundary (`app/(app)/error.tsx`) calls `Sentry.captureException` on an uninitialised client SDK — those calls silently no-op.
- **One high-risk billing path is invisible to Sentry:** `billing/create-checkout-session` has structured `console.error` logging but no `Sentry.captureException` call, meaning Stripe API or DB failures during checkout go unreported.
- **A single missing env var can silently break all paid-subscription flows:** `NEXT_PUBLIC_APP_URL` is not startup-asserted and falls back to `http://localhost:3000`; unset on Vercel, this routes Stripe checkout success/cancel URLs to localhost.
- **Core data-path API routes have no try-catch:** `GET/POST /api/properties`, `GET/PATCH/DELETE /api/properties/[id]`, `GET/POST /api/deals`, and others have no error handling around Prisma operations. They are partially protected by `onRequestError = Sentry.captureRequestError` but with no structured context (userId, route).
- **Runbooks and incident-response docs are solid for an early-stage app** (rollback steps, UptimeRobot config, Stripe/Clerk recovery guides). The primary ops gap is at the code layer (observability and env guards), not documentation.

---

## Severity-ranked findings

### Critical

- **No `sentry.client.config.ts` — client-side Sentry is uninitialised** — Browser exceptions, React rendering failures, and client-side crashes produce zero Sentry events. `app/(app)/error.tsx` calls `Sentry.captureException(error)` without a DSN guard on an SDK that has never been initialised; the call is a silent no-op. `global-error.tsx` guards its call with `if (process.env.NEXT_PUBLIC_SENTRY_DSN)` but that boundary is only reached for truly catastrophic failures; inner boundary captures nothing. Server-side Sentry works (`instrumentation.ts` loads `sentry.server.config.ts` / `sentry.edge.config.ts`; `onRequestError` captures unhandled server errors), but the client-side signal gap is a near-total blind spot for user-facing frontend failures. — `app/sentry.client.config.ts` (absent), `app/app/(app)/error.tsx`, `app/app/global-error.tsx`, `app/instrumentation.ts`

### High

- **`billing/create-checkout-session` catch block logs but does not capture to Sentry** — The catch block records a structured JSON line via `console.error` but omits `Sentry.captureException`. A Stripe API timeout, a DB error during `prisma.user.update` (customer ID write), or a session creation failure will be invisible in Sentry. This is the highest-value billing entry path; invisible failures here mean subscription starts silently fail. — `app/app/api/billing/create-checkout-session/route.ts` lines 97–115

- **`NEXT_PUBLIC_APP_URL` falls back to `http://localhost:3000` in production — not startup-asserted** — `billing/create-checkout-session` builds Stripe `success_url` and `cancel_url` as `${baseUrl}/billing/success?...` and `${baseUrl}/plans` where `baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"`. If this env var is absent or blank on Vercel, all Stripe checkout redirects point to localhost. The billing portal route has the same fallback. Neither route nor `lib/env.ts` asserts this at startup. — `app/app/api/billing/create-checkout-session/route.ts` line 53, `app/app/api/billing/portal/route.ts` line 19, `app/lib/env.ts`

### Medium

- **Wide set of CRUD API routes have no try-catch around Prisma operations** — The following routes execute Prisma queries with no surrounding error handling: `GET /api/properties`, `POST /api/properties`, `GET /api/properties/[id]`, `PATCH /api/properties/[id]`, `DELETE /api/properties/[id]`, `GET /api/deals`, `POST /api/deals`, `GET /api/portfolio/summary`, `GET /api/me`, `PATCH /api/me`, `POST /api/import/portfolio`, `POST /api/account/restore`, `GET /api/billing/subscription-details`, `GET /api/admin/export/users`. Any DB connection loss, query timeout, or Prisma error surfaces as an unhandled 500. These are partially captured by `onRequestError = Sentry.captureRequestError` in `instrumentation.ts`, but that hook has no userId or route-level context — events appear as anonymous server errors. — `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/deals/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/app/api/me/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/app/api/account/restore/route.ts`

- **Stripe subscription cancellation failures silently swallowed in account delete/delete-permanent** — Both `account/delete` and `account/delete-permanent` wrap the Stripe subscription cancel call in a bare `catch (err) { console.error(...) }` — no Sentry capture. If Stripe is unreachable or the subscription ID is stale, the cancel fails silently and the subscription remains active in Stripe while the user is marked deleted in the app DB. — `app/app/api/account/delete/route.ts` lines 67–73, `app/app/api/account/delete-permanent/route.ts` lines 68–75

- **Clerk user deletion failure silently swallowed in `delete-permanent`** — The `client.users.deleteUser(user.clerkUserId)` call is inside `catch (err) { console.error(...) }` with no Sentry capture. If this fails, the Clerk identity persists while the DB record is gone. The user can re-register with the same email and potentially collide with orphaned Clerk state. — `app/app/api/account/delete-permanent/route.ts` lines 81–85

- **Webhook event-level idempotency not implemented for PostHog analytics** — Stripe may retry the same `event.id`. `syncSubscriptionToDb` uses Prisma upserts (DB-idempotent) but `captureServerEvent` (PostHog) does not deduplicate on `event.id`. Duplicate delivery produces duplicate `subscription_activated`, `subscription_updated`, `subscription_canceled` PostHog events. Conversion funnel metrics can be over-counted. Documented as known in `stripe-webhook-posthog-idempotency.md` but unresolved. — `app/app/api/billing/webhook/route.ts`, `docs/internal/stripe-webhook-posthog-idempotency.md`

- **Health check endpoint is DB-only — Clerk and Stripe degradation are undetectable** — `GET /api/health` executes `SELECT 1` and returns `{ status: "ok", database: "connected" }`. A Clerk auth service outage or total Stripe API degradation would not flip this endpoint to 503. UptimeRobot monitors this URL per `docs/runbooks/incident-response.md`; operators would see no alert during an auth-layer outage until users start reporting sign-in failures. — `app/app/api/health/route.ts`

- **`NEXT_PUBLIC_SENTRY_DSN` not startup-asserted** — If this env var is missing on Vercel, both server and client Sentry initialisation are gated behind `if (process.env.NEXT_PUBLIC_SENTRY_DSN)` and silently skip. The entire error observability layer disappears without any warning at deploy time. By contrast, `STRIPE_WEBHOOK_SECRET` has an explicit startup assertion for Vercel (`assertStripeWebhookSecretForVercelDeploy`). — `app/sentry.server.config.ts`, `app/sentry.edge.config.ts`, `app/lib/env.ts`

### Low

- **Inconsistent logging approach across production paths** — Some routes use structured JSON logging (`billing/sync`, `billing/create-checkout-session`, `admin/export/users`); others use unstructured `console.error("text:", err)` format (`billing/portal`, `account/delete`, `account/delete-permanent`, `health/route.ts`, `billing/webhook` signature failure, `billing/webhook` user resolution warning). Inconsistency makes log-based alerting or parsing more brittle over time. — Multiple routes

- **Inner error boundary (`app/(app)/error.tsx`) is not DSN-gated** — Calls `Sentry.captureException(error)` directly without checking `process.env.NEXT_PUBLIC_SENTRY_DSN`, unlike `global-error.tsx` which guards its Sentry call. On an uninitialised SDK (no `sentry.client.config.ts`) this is a no-op, but differs from the companion boundary's defensive pattern. — `app/app/(app)/error.tsx` line 13

- **Stripe Price ID env vars not validated at startup** — `STRIPE_PRICE_ID_INVESTOR_MONTHLY`, `STRIPE_PRICE_ID_INVESTOR_YEARLY`, `STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_PRO_YEARLY` are not checked in `lib/env.ts` or `instrumentation.ts`. A misconfigured or missing price ID surfaces as a runtime 500 from `getPriceIdForPlan` only when a user first attempts checkout. — `app/lib/env.ts`, `app/app/api/billing/create-checkout-session/route.ts` line 44

- **`RESEND_API_KEY` and `SUPPORT_EMAIL` not startup-asserted** — Missing values cause the contact form to return 503 at runtime rather than fail fast at deploy. Acceptable UX degradation, but invisible during deployment verification unless tested explicitly. — `app/app/api/contact/route.ts` lines 57–65

---

## Evidence reviewed

| Surface | Path |
|---------|------|
| Inner app error boundary | `app/app/(app)/error.tsx` |
| Root app error boundary | `app/app/error.tsx` (absent) |
| Global error boundary | `app/app/global-error.tsx` |
| Sentry server config | `app/sentry.server.config.ts` |
| Sentry edge config | `app/sentry.edge.config.ts` |
| Sentry client config | `app/sentry.client.config.ts` (absent) |
| Next.js build config (Sentry wrapper) | `app/next.config.ts` |
| Instrumentation + startup hooks | `app/instrumentation.ts` |
| Env assertions | `app/lib/env.ts` |
| DB module (env validation callsite) | `app/lib/db.ts` |
| Health check | `app/app/api/health/route.ts` |
| Billing webhook | `app/app/api/billing/webhook/route.ts` |
| Billing sync (server) | `app/app/api/billing/sync/route.ts` |
| Billing sync (client trigger) | `app/app/(app)/app-layout-client.tsx` |
| App layout server | `app/app/(app)/layout.tsx` |
| Create checkout session | `app/app/api/billing/create-checkout-session/route.ts` |
| Billing portal | `app/app/api/billing/portal/route.ts` |
| Properties list/create | `app/app/api/properties/route.ts` |
| Property detail | `app/app/api/properties/[id]/route.ts` |
| Deals list/create | `app/app/api/deals/route.ts` |
| Portfolio summary | `app/app/api/portfolio/summary/route.ts` |
| Me | `app/app/api/me/route.ts` |
| Rent estimate | `app/app/api/estimates/rent/route.ts` |
| Benchmark refresh | `app/app/api/properties/[id]/benchmark/refresh/route.ts` |
| Import portfolio | `app/app/api/import/portfolio/route.ts` |
| Account delete / delete-permanent | `app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts` |
| Account restore | `app/app/api/account/restore/route.ts` |
| CSP report | `app/app/api/csp-report/route.ts` |
| Contact | `app/app/api/contact/route.ts` |
| Admin user export | `app/app/api/admin/export/users/route.ts` |
| Billing subscription-details | `app/app/api/billing/subscription-details/route.ts` |
| Incident response runbook | `docs/runbooks/incident-response.md` |
| Health check smoke runbook | `docs/runbooks/health-check-smoke.md` |
| Security notes | `docs/security/security-notes.md` |
| Stripe webhook idempotency doc | `docs/internal/stripe-webhook-posthog-idempotency.md` |
| Manual setup steps | `docs/setup/manual-steps.md` |
| Launch plan | `docs/launch/launch-plan.md` |

**Audit limits:**
- Did not inspect `lib/billing/`, `lib/posthog-server.ts`, `lib/rate-limit.ts`, `lib/integrations/rentcast.ts`, `lib/stripe-config.ts`, or test files in depth; those were out of direct scope for this reliability pass.
- Did not exercise live routes; all findings are static analysis of source files.

---

## Risk & impact assessment

| Finding | Business / user impact | Likelihood / exposure |
|---------|----------------------|----------------------|
| No client Sentry | Invisible frontend failures; operators learn of browser bugs only from user reports or crash spikes in analytics | High likelihood of missing real errors in production; no mitigant today |
| Checkout missing Sentry | Failed subscription starts go unreported; revenue loss with no alert | Low frequency but high revenue impact per event |
| `NEXT_PUBLIC_APP_URL` unguarded | All Stripe checkouts silently redirect to localhost if env var is absent on Vercel | One-time deployment misconfiguration risk; easy to trigger accidentally during env variable changes |
| CRUD routes without try-catch | DB error during any property/deal write surfaces as uncontextualised 500; `onRequestError` captures it but without userId | Any DB hiccup (network flap, connection limit) affects core write paths |
| Stripe/Clerk cancel swallowed | Subscription divergence between Stripe and app DB; orphaned Clerk identities | Low frequency but creates billing and auth reconciliation burden |
| Webhook PostHog idempotency | Conversion metric inflation on Stripe retries | Low frequency (Stripe retries are rare on non-error responses) |
| Health check DB-only | Auth outage not detected by uptime monitor; operators see no alert | Auth layer outages are rare but would affect all authenticated users |

---

## Recommendations (prioritized)

1. **Create `app/sentry.client.config.ts`** — Add a client Sentry initialisation file (DSN-gated, with `tracesSampleRate` matching the server config) so browser-side errors are captured. Update `app/(app)/error.tsx` to also guard its `Sentry.captureException` call with a DSN check, consistent with `global-error.tsx`.

2. **Add `Sentry.captureException` to `billing/create-checkout-session` catch block** — This is the most impactful missing Sentry call given it is the entry point for all paid subscriptions. Add it alongside the existing `console.error` log, including `userId`, `plan`, and `billingCycle` as context.

3. **Assert `NEXT_PUBLIC_APP_URL` at startup (or Vercel deploy time)** — Add a check in `lib/env.ts` or a dedicated `assertUrlForVercelDeploy()` function in `instrumentation.ts` that throws if `NEXT_PUBLIC_APP_URL` is absent on Vercel (similar to `assertStripeWebhookSecretForVercelDeploy`).

4. **Add try-catch with Sentry to high-traffic CRUD routes** — At minimum, wrap the main body of `POST /api/properties`, `POST /api/deals`, `POST /api/import/portfolio`, and `PATCH /api/properties/[id]` in try-catch blocks that call `Sentry.captureException` with `userId` and route context before returning a 500. Read-only routes are lower priority.

5. **Add Sentry capture to Stripe cancel and Clerk delete failure paths** — In `account/delete` and `account/delete-permanent`, replace bare `console.error` in the Stripe cancel catch with a Sentry capture tagged `area: "account-delete", sub_area: "stripe-cancel"`. Same for the Clerk `deleteUser` catch in `delete-permanent`.

6. **Assert `NEXT_PUBLIC_SENTRY_DSN` at deploy time on Vercel** — Add it to the startup env checks (or at least document it as required in `manual-steps.md`) so deployment without Sentry is a deliberate opt-out, not an accidental omission.

7. **Standardise structured logging** — Align the few `console.error("text:", err)` patterns in production paths (billing webhook, billing portal, account delete, health check) to the `console.error(JSON.stringify({action, errorType, ...}))` format already established in `billing/sync` and `billing/create-checkout-session`.

8. **Resolve PostHog webhook idempotency** — Persist processed Stripe `event.id` in a small DB table (or in-memory/Redis cache with TTL) and skip `captureServerEvent` for duplicate deliveries, per the option documented in `stripe-webhook-posthog-idempotency.md`.

9. **Extend health check or add secondary checks** — Consider adding a lightweight Clerk reachability probe (e.g., HEAD to the Clerk JWKS endpoint) to a separate internal endpoint, so auth-layer degradation can be detected by monitoring without requiring a full user report.

---

## Task candidates

- [ ] Create `app/sentry.client.config.ts` (DSN-gated, matching server sample rate); add DSN guard to `app/(app)/error.tsx`
- [ ] Add `Sentry.captureException` to `billing/create-checkout-session` catch block
- [ ] Add `NEXT_PUBLIC_APP_URL` Vercel startup assertion to `instrumentation.ts` / `lib/env.ts`
- [ ] Add structured try-catch + Sentry to `POST /api/properties`, `POST /api/deals`, `POST /api/import/portfolio`, `PATCH /api/properties/[id]`
- [ ] Add Sentry capture to Stripe cancel and Clerk deleteUser failure paths in account delete routes
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` to `REQUIRED_ENV_VARS` or document as Vercel-required in `manual-steps.md`
- [ ] Standardise `console.error` to structured JSON format in billing webhook, billing portal, and account delete handlers
- [ ] Implement Stripe `event.id` deduplication for PostHog server events in webhook handler

---

## Re-test checklist

- [ ] Verify `sentry.client.config.ts` is present and a test browser error appears in Sentry
- [ ] Verify `app/(app)/error.tsx` now guards Sentry call with DSN check
- [ ] Simulate a Stripe API failure in `create-checkout-session` and confirm Sentry event fires
- [ ] Verify Vercel deploy fails or warns if `NEXT_PUBLIC_APP_URL` is absent
- [ ] Verify unhandled Prisma error in `POST /api/properties` generates a Sentry event with userId context
- [ ] `npm run check` after any code changes

---

## Next trigger and cadence

- **Trigger:** Before next public marketing push, or after any material change to error handling, Sentry config, or billing flows.
- **Recommended next run:** 2026-05-01 (monthly cadence), or earlier if critical findings above are resolved and re-verified.
