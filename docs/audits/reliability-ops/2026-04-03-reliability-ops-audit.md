# Reliability & Operations Audit — 2026-04-03

## Executive summary

- **Overall:** The stack has a coherent baseline: `@sentry/nextjs` wired through `next.config.ts`, `instrumentation.ts` (`onRequestError`), server/edge/client configs, `global-error.tsx`, Stripe webhook signature verification, idempotent DB writes, client-side billing resync with throttling, and a **DB-backed** `/api/health` plus runbooks that point to Vercel logs, Sentry, Neon, Stripe, Clerk, and external uptime monitoring.
- **Top gaps:** (1) Sentry **environment** tagging uses `NODE_ENV` only, which blurs preview vs production on Vercel; (2) segment `error.tsx` reports to Sentry during **render** (not `useEffect`), which risks duplicate events and diverges from `global-error.tsx`; (3) **public routes** (e.g. `app/contact/`) sit outside the `(app)` route group, so they do not use `app/(app)/error.tsx`—only `global-error.tsx` for full-app recovery; (4) **logging** is mixed (structured JSON vs plain `console.*`) and **health** does not expose release/build identity for fast incident correlation.
- **Recommendation:** Treat as **ship-ready for ops** with prioritized hardening: align Sentry `environment` with `VERCEL_ENV`, normalize client error reporting to `useEffect`, add `app/error.tsx` or document the public-route boundary explicitly, and add optional release/build metadata to health or runbooks.

## Severity-ranked findings

### Critical

- None identified in this pass. Webhook signature failures return **400** (non-retryable by Stripe for bad payloads); handler failures that throw before the success response should return **5xx** so Stripe retries (see `app/app/api/billing/webhook/route.ts`—no outer try/catch that swallows errors into **200**).

### High

- **Sentry environment conflation on Vercel** — Preview and production deployments typically both use `NODE_ENV=production`, while Sentry `init` in `sentry.server.config.ts`, `sentry.edge.config.ts`, `sentry.client.config.ts`, and deferred `instrumentation-client.ts` all set `environment: process.env.NODE_ENV`. **Impact:** Incidents and alerts are harder to triage (noise from preview mixed with prod unless filtered elsewhere). **Evidence:** `app/sentry.server.config.ts` (and sibling configs), `app/instrumentation-client.ts`.

### Medium

- **Segment `error.tsx` Sentry capture in render** — `app/(app)/error.tsx` calls `Sentry.captureException(error)` during render when `NEXT_PUBLIC_SENTRY_DSN` is set. **Impact:** Duplicated events under React Strict Mode / remount patterns and side effects during render (differs from `app/global-error.tsx`, which uses `useEffect`). **Evidence:** `app/app/(app)/error.tsx` vs `app/app/global-error.tsx`.

- **Stripe webhook “unresolved user” path returns 200** — When `syncSubscriptionToDb` cannot resolve `appUserId`, it logs to Sentry (`captureMessage`, warning) and returns without throwing; the outer `POST` still ends with `NextResponse.json({ received: true })`. **Impact:** Stripe will **not** retry; recovery depends on `/api/billing/sync` (client) or manual ops. **Mitigation:** Documented warning + billing sync path per `docs/architecture-and-build-practices.md` §2.6 and `app/app/api/billing/sync/route.ts`. **Evidence:** `app/app/api/billing/webhook/route.ts` (`syncSubscriptionToDb`), `docs/internal/stripe-webhook-posthog-idempotency.md`.

- **Health check scope** — `GET /api/health` only checks Prisma `SELECT 1` (DB). **Impact:** Auth (Clerk) or Stripe outages will not flip the monitor to unhealthy; runbook already notes “DB-only” implicitly via implementation. **Evidence:** `app/app/api/health/route.ts`, `docs/runbooks/incident-response.md` (monitoring table lists Clerk/Stripe separately).

- **Runbook surface area** — Only `docs/runbooks/incident-response.md` and `docs/runbooks/health-check-smoke.md` exist under `docs/runbooks/`. **Impact:** No dedicated runbook for Stripe webhook replay, Clerk incident checklist beyond bullets, or DB migration rollback—operators rely on generic sections in incident-response. **Evidence:** glob `docs/runbooks/**/*.md`.

### Low

- **Structured logging inconsistency** — `docs/architecture-and-build-practices.md` §2.6 recommends JSON-shaped `console.error` for ops dashboards; `/api/billing/sync` follows this (`action: "billing_sync_error"`), while many routes use plain `console.error("...", err)` (e.g. webhook signature failure, property/deal routes). **Impact:** Harder log aggregation in Vercel log drains without parsing free text.

- **`withSentryConfig` build defaults** — `next.config.ts` passes `org: process.env.SENTRY_ORG ?? "placeholder-org"` and `project: process.env.SENTRY_PROJECT ?? "placeholder-project"` with `authToken: process.env.SENTRY_AUTH_TOKEN`. **Impact:** Local/CI builds without real org/project may not match production Sentry project settings for source maps; `silent: !process.env.CI` reduces noise but can hide misconfiguration. **Evidence:** `app/next.config.ts`.

- **CI pipeline** — `.github/workflows/ci.yml` runs lint and unit tests only; no automated `curl` smoke to `/api/health` (runbook describes it as optional). **Evidence:** `.github/workflows/ci.yml`, `docs/runbooks/health-check-smoke.md`.

## Evidence reviewed

| Area | Reviewed |
|------|----------|
| Process / template | `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md` |
| Sentry | `app/next.config.ts` (`withSentryConfig`), `app/instrumentation.ts`, `app/instrumentation-client.ts`, `app/sentry.server.config.ts`, `app/sentry.edge.config.ts`, `app/sentry.client.config.ts`, grep across `app/` for `@sentry/nextjs` |
| Global / route errors | `app/app/global-error.tsx`, `app/app/(app)/error.tsx` |
| Error boundaries | Single segment `error.tsx` at `app/app/(app)/error.tsx`; `app/contact/page.tsx` shows public routes outside `(app)` |
| Stripe webhook | `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/sync/route.ts`, `app/lib/env.ts` (`assertStripeWebhookSecretForVercelDeploy`), `docs/internal/stripe-webhook-posthog-idempotency.md`, `app/proxy.ts` (public `/api/billing/webhook`) |
| Health | `app/app/api/health/route.ts` |
| Runbooks | `docs/runbooks/incident-response.md`, `docs/runbooks/health-check-smoke.md` |
| Logging | Grep `console.` in `app/`; `docs/architecture-and-build-practices.md` §2.6 |
| Reference | `docs/architecture-and-build-practices.md` (observability), prior `docs/audits/reliability-ops/2026-04-02-reliability-ops-audit.md` |

**Assumptions / limits:** No production runtime or Sentry project settings were inspected; webhook behavior inferred from code and Stripe’s retry semantics. No load or chaos testing.

## Risk & impact assessment

Unresolved **Medium** items mainly affect **triage speed** (environment tagging, log shape), **UX on errors** (segment vs global boundaries), and **clarity during partial outages** (health = DB only). The webhook “unresolved user” path is **unlikely** if checkout metadata and `stripeCustomerId` are consistently set, but when it happens, **Stripe will not retry**—impact is entitlement drift until sync or manual fix; Sentry warning reduces silent failure.

## Recommendations (prioritized)

1. Set Sentry `environment` from **`VERCEL_ENV`** (or equivalent) when present, falling back to `NODE_ENV`, so preview/staging/production separate cleanly in Sentry.
2. Move `Sentry.captureException` in `app/(app)/error.tsx` into **`useEffect`** (mirror `global-error.tsx`) to avoid render side effects and duplicate captures.
3. Either add **`app/error.tsx`** at the root `app` segment for public pages or document in `docs/runbooks/` that marketing/legal routes rely on **`global-error.tsx`** for uncaught errors (and verify behavior in staging).
4. Extend **`/api/health`** (or runbook) with **build/version** (`VERCEL_GIT_COMMIT_SHA` or similar) for deploy correlation—optional second line in JSON—without expanding auth scope of the endpoint.
5. Normalize high-traffic API **`console.error`** lines toward the JSON pattern in `architecture-and-build-practices.md` §2.6 where feasible.

## Task candidates (optional)

- [ ] Sentry: use `VERCEL_ENV` for `environment` in all Sentry init paths (`sentry.*.config.ts`, `instrumentation-client.ts`).
- [ ] `app/(app)/error.tsx`: capture exceptions in `useEffect([error])`.
- [ ] Add root `app/error.tsx` **or** short “Public routes & error boundaries” subsection in `docs/runbooks/incident-response.md`.
- [ ] Optional: append `gitSha` / `deploymentId` to health JSON in production for ops.
- [ ] Optional: GitHub Actions step—post-deploy or staging-only `curl` to `/api/health` per `health-check-smoke.md`.

## Re-test checklist

- [ ] Trigger a test error in **(app)** route → Sentry event once per error (no duplicate from Strict Mode).
- [ ] Trigger error on a **public** page (e.g. `/contact`) → confirm expected boundary (`global-error` vs segment).
- [ ] Verify Sentry **environment** filter shows distinct preview vs production after config change.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** After major billing/auth changes, Sentry/Vercel config changes, or quarterly ops review.
- **Recommended next run:** **2026-07-03** (quarterly) or before a large marketing launch / traffic spike.
