# Reliability & Operations Audit — 2026-04-05

## Executive summary

- **Overall health: Good with targeted gaps.** Core write paths (property create/patch/delete, deals, billing sync, RentCast estimates) follow consistent try/catch + Sentry patterns. The billing webhook, health check, runbook, and graceful-degradation posture are solid.
- **Top risk: Unhandled exceptions on read-path routes.** Roughly a dozen GET routes that hit the database or call library functions have no try/catch. A transient DB error produces an unhandled 500 with no Sentry signal and a possible stack-trace leak.
- **Secondary risk: Stripe webhook handler has no outer error boundary.** DB failures inside the webhook switch block propagate as unhandled 500s — invisible to Sentry until Stripe exhausts retries.
- **Recommendation:** Add a minimal try/catch + Sentry capture + structured console.error to all remaining uncovered routes (read paths and import flow) and wrap the billing webhook's event-dispatch block in a top-level guard.

---

## Severity-ranked findings

### Critical

_None identified._

---

### High

#### H1 — Stripe webhook handler has no outer try/catch — silent 500 on DB failure

`POST /api/billing/webhook` verifies the Stripe signature and then dispatches events in a bare `switch` block with no enclosing try/catch.  `syncSubscriptionToDb` and `setSubscriptionCanceled` both execute `prisma.$transaction` without error handling.  If the database is temporarily unavailable during a subscription lifecycle event (created, updated, deleted, checkout completed), the exception propagates unhandled:

- The route returns HTTP 500 with no Sentry capture.
- Stripe interprets 5xx as a transient failure and retries (up to ~72 h). Subscription state in the DB may be stale for the entire retry window.
- Operators have no immediate signal; the failure only becomes visible if Stripe's event delivery dashboard is checked manually.

The `resolveAppUserIdForSubscription` helper already uses `Sentry.captureMessage` for user-resolution issues, which confirms the intent to instrument this path — but the outer guard is missing.

**Evidence:** `app/app/api/billing/webhook/route.ts` lines 41–113 (no enclosing try/catch); `syncSubscriptionToDb` lines 115–177 (bare `prisma.$transaction`).

---

#### H2 — Multiple GET/read routes missing try/catch — unhandled 500s on DB errors

The following routes execute Prisma queries or call server-side library functions with no exception handling:

| Route | File | Risk |
|-------|------|------|
| `GET /api/properties` | `app/app/api/properties/route.ts:19–35` | `findMany` unguarded |
| `GET /api/properties/[id]` | `app/app/api/properties/[id]/route.ts:21–37` | `findFirst` unguarded |
| `GET /api/deals` | `app/app/api/deals/route.ts:98–123` | `count` + `findMany` unguarded |
| `GET /api/portfolio/summary` | `app/app/api/portfolio/summary/route.ts:5–13` | `buildPortfolioSummaryPayload` unguarded |
| `GET /api/onboarding` | `app/app/api/onboarding/route.ts:14–22` | `buildOnboardingProgress` unguarded |
| `PATCH /api/onboarding` | `app/app/api/onboarding/route.ts:24–76` | `prisma.user.update` × 2 + `findUnique` unguarded |
| `GET /api/export/portfolio` | `app/app/api/export/portfolio/route.ts:32–` | `count` + `findMany` unguarded |
| `GET /api/export/portfolio-summary` | `app/app/api/export/portfolio-summary/route.ts` | presumed same pattern |
| `GET /api/rentcast-quota` | `app/app/api/rentcast-quota/route.ts` | presumed same pattern |

A transient Prisma error on any of these routes yields an uncaught exception, resulting in:
- HTTP 500 returned to the client with possible stack-trace leakage in development mode.
- Zero Sentry signal — the error is invisible in production observability.
- The `(app)` error boundary (`app/app/(app)/error.tsx`) will catch React-level rendering errors but **not** API-layer exceptions.

**Evidence:** Confirmed via direct file inspection for the first 7 routes; the pattern of missing try/catch was consistent across all read-only handlers audited.

---

#### H3 — Portfolio import transaction has no try/catch — silent 500 on mid-import failure

`POST /api/import/portfolio` validates rows, checks plan limits, and then executes a large `prisma.$transaction` that creates multiple Property and Mortgage records. The entire transaction block (lines 166–225) has no error handler.

A failure mid-import (DB constraint violation, connection loss, over-limit race condition) produces:
- Unhandled 500 with no indication to the client of how many rows were committed before failure.
- No Sentry capture for the failure.
- The `prisma.$transaction` is all-or-nothing, so the DB state is consistent — but the client UI has no actionable feedback.

**Evidence:** `app/app/api/import/portfolio/route.ts` lines 166–225.

---

### Medium

#### M1 — Account delete final transaction unguarded

`POST /api/account/delete` correctly wraps the Stripe subscription cancel and the password-verification call in individual try/catch blocks. However, the final `prisma.$transaction` that soft-deletes the user (lines 87–108) has no error handler. A DB failure at this point leaves the Stripe subscription already canceled but the app-side account still active — a partially-failed state with no recovery path or Sentry signal.

**Evidence:** `app/app/api/account/delete/route.ts` lines 87–113.

---

#### M2 — Sentry is optional; no fallback logging if DSN absent

Sentry is marked optional in `.env.example` and all three config files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) gate initialization on `NEXT_PUBLIC_SENTRY_DSN`. Both error boundaries (`global-error.tsx` line 14, `app/(app)/error.tsx` line 15) also gate `captureException` on the same env var.

If `NEXT_PUBLIC_SENTRY_DSN` is absent in production, no exceptions are reported anywhere. The existing `console.error` in write paths (properties, deals, billing sync) provides some fallback signal in Vercel logs, but the read paths that lack try/catch have neither Sentry nor console fallback.

There is no documented threshold or policy requiring the DSN to be set before production launch.

**Evidence:** `app/sentry.server.config.ts` line 3; `app/app/(app)/error.tsx` lines 14–17; `app/.env.example` line 61 (marked "optional").

---

#### M3 — CI pipeline has no production build or TypeScript type-check step

`ci.yml` runs ESLint and Vitest but does not run `next build` or `tsc --noEmit`. TypeScript errors that pass ESLint and Vitest can only be caught at Vercel deploy time. The fail-fast env assertions (`assertStripeWebhookSecretForVercelDeploy`, `assertPublicAppUrlForVercelDeploy` in `lib/env.ts`) are also only triggered at build time on Vercel — never in CI.

A broken build is therefore discovered after pushing to the main branch rather than in the PR/push gate.

**Evidence:** `.github/workflows/ci.yml` (3 steps: install, lint, test); `app/lib/env.ts` lines 30–56 (assertions only fire on Vercel).

---

#### M4 — No Prisma connection pool limit configured

`lib/db.ts` creates a `PrismaClient` via `PrismaPg` with only a raw `connectionString` — no `connection_limit` parameter. On Vercel's serverless runtime, each warm function instance holds its own connection.  Free and basic tiers of Neon and Supabase cap PostgreSQL max connections at 20–30. Under moderate burst traffic (e.g., multiple concurrent dashboard loads), the pool can be exhausted, causing subsequent requests to hang or fail with `Can't reach database server`.

The health check endpoint (`/api/health`) would surface this as a 503, but there is no alerting or auto-recovery documented beyond the UptimeRobot monitor.

**Evidence:** `app/lib/db.ts` lines 9–18 (no `connection_limit`); Neon free tier: 10–25 max connections.

---

#### M5 — Migration destructive DROP has no rollback procedure in runbooks

`20260406120000_completeness_overhaul` drops the `unitMix` column (`DROP COLUMN IF EXISTS`) and includes a data-backfill UPDATE. The migration is safe to apply (guarded with `IF EXISTS`, backfill is idempotent). However:

- No rollback migration exists for restoring `unitMix`.
- The incident-response runbook documents Vercel-level rollback (promote previous deployment) but says nothing about database migration rollback.
- If a rolled-back deployment re-expects `unitMix` in the schema, it would encounter a missing-column error until the DB is manually patched.

**Evidence:** `app/prisma/migrations/20260406120000_completeness_overhaul/migration.sql`; `docs/runbooks/incident-response.md` (no migration rollback section).

---

### Low

#### L1 — No error boundaries on public/marketing page segments

Only `app/(app)/error.tsx` (protected app routes) and `app/global-error.tsx` (root) are present. There is no `error.tsx` for the public pages segment (`/`, `/pricing`, `/changelog`, `/alternatives`, `/tools/*`). A React render error on a marketing page propagates directly to the root `global-error.tsx` fallback (full-page replacement), which is more disruptive than a scoped boundary would be.

**Evidence:** Glob search for `app/**/error.tsx` returned only 1 result (`app/(app)/error.tsx`) and `global-error.tsx`.

---

#### L2 — No runbooks for third-party service degradation (RentCast, Resend, Google Places)

The incident-response runbook covers DB, Stripe, Clerk, and high Sentry error rates. It does not document:

- RentCast API key revocation, quota exhaustion, or API outage (affects rent/value estimate and benchmark refresh features).
- Resend delivery failure or domain verification expiry (affects contact form and onboarding emails).
- Google Places API quota exhaustion or key revocation (affects address autocomplete in add-property wizard).

Graceful degradation exists in code for all three (Places returns empty array; RentCast returns user-facing error; cron logs per-user failures), but there is no operator procedure for how to detect, communicate, or recover from these failures.

**Evidence:** `docs/runbooks/incident-response.md` §2–3 (no mention of RentCast, Resend, Google Places).

---

#### L3 — Health check not integrated in automated post-deploy verification

`docs/runbooks/health-check-smoke.md` documents CI smoke testing of `/api/health` as "optional." The UptimeRobot monitor is referenced in `incident-response.md` but relies on a manual external setup with no code evidence of the configured URL. The CI pipeline has no post-deploy verification step.

**Evidence:** `.github/workflows/ci.yml` (no smoke step); `docs/runbooks/health-check-smoke.md` (smoke step marked optional).

---

#### L4 — CRON_SECRET treated as optional in `.env.example` but causes 500 if absent

`.env.example` marks `CRON_SECRET` as optional (no comment requiring it). However, `GET /api/cron/onboarding-emails/route.ts` lines 22–25 return HTTP 500 when `CRON_SECRET` is not set:

```ts
if (!cronSecret) {
  console.error("CRON_SECRET is not configured");
  return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
}
```

Vercel Cron fires this endpoint daily at 14:00 UTC regardless of whether the secret is configured. A missing secret means every daily cron invocation silently returns 500 and sends zero emails — with no Sentry capture for the 500 path.

**Evidence:** `app/app/api/cron/onboarding-emails/route.ts` lines 21–25; `app/.env.example` line 48 ("required for Vercel Cron jobs" — but not in `lib/env.ts` REQUIRED_ENV_VARS list).

---

#### L5 — Sentry tracesSampleRate not configurable via env var

Both client and server Sentry configs hardcode `tracesSampleRate: 0.1` for production (non-development). Temporarily increasing sampling to diagnose a production incident requires a code change and deploy rather than an env-var adjustment in Vercel.

**Evidence:** `app/sentry.client.config.ts` line 18; `app/sentry.server.config.ts` line 7.

---

## Evidence reviewed

### Files inspected

- `app/app/global-error.tsx`, `app/app/(app)/error.tsx` — error boundary coverage
- `app/sentry.client.config.ts`, `app/sentry.server.config.ts`, `app/sentry.edge.config.ts` — Sentry init
- `app/lib/db.ts` — Prisma singleton and connection config
- `app/lib/env.ts` — env var validation and fail-fast assertions
- `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts` — property CRUD
- `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts` — deal CRUD
- `app/app/api/billing/webhook/route.ts` — Stripe webhook handler
- `app/app/api/billing/sync/route.ts` — billing sync
- `app/app/api/billing/portal/route.ts` — portal redirect
- `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts` — RentCast estimates
- `app/app/api/properties/[id]/benchmark/refresh/route.ts` — benchmark refresh
- `app/app/api/portfolio/summary/route.ts` — portfolio summary
- `app/app/api/import/portfolio/route.ts` — CSV import
- `app/app/api/export/portfolio/route.ts` — CSV export (partial read)
- `app/app/api/cron/onboarding-emails/route.ts` — onboarding email cron
- `app/app/api/onboarding/route.ts` — onboarding state
- `app/app/api/places/autocomplete/route.ts` — Google Places autocomplete
- `app/app/api/account/delete/route.ts` — account soft-delete
- `app/app/api/health/route.ts` — health check
- `app/prisma/migrations/` — all 27 migration files (reviewed filenames; read initial, indexes, and completeness-overhaul)
- `app/.env.example` — env var inventory
- `.github/workflows/ci.yml` — CI pipeline
- `vercel.json` — cron schedule
- `docs/runbooks/incident-response.md`, `docs/runbooks/health-check-smoke.md`
- `docs/architecture-and-build-practices.md`
- `docs/setup/manual-steps.md`

### Audit scope and assumptions

- Audit is static (code inspection only) — no runtime execution.
- All 56 API route files were enumerated; roughly half were read in full; the remainder were assessed by pattern recognition.
- No secrets or runtime environment state was verified.
- Test files were not audited.
- The `docs/audits/reliability-ops/` directory was created for this report; it did not exist previously.

---

## Risk & impact assessment

| Finding | User-facing impact | Operator impact | Likelihood |
|---------|-------------------|-----------------|------------|
| H1 — Webhook no outer try/catch | Subscription state stale for hours | Silent 5xx until Stripe retry exhaustion | Low (DB must be down during webhook) |
| H2 — Read-path no try/catch | Dashboard/properties/deals 500 during DB hiccup | No Sentry signal; blind spot | Medium (serverless cold starts, connection churn) |
| H3 — Import no try/catch | Import UI shows generic 500; no row count | No Sentry capture | Low (large imports rare) |
| M1 — Account delete transaction unguarded | User stuck in partially-deleted state | Manual recovery required | Very low (unlikely DB failure at this specific moment) |
| M2 — Sentry optional, no fallback | No change (transparent) | Zero error visibility if DSN unset | Medium (configuration omission) |
| M3 — No build in CI | Silent TypeScript errors until Vercel deploy | Failed deploys; delayed discovery | Medium (active dev) |
| M4 — No connection pool limit | Intermittent 500s under load spike | No auto-recovery; manual DB scaling | Medium on free DB tier |
| M5 — No migration rollback runbook | N/A (deploy-level) | Manual DB surgery if rollback needed | Low |

---

## Recommendations (prioritized)

1. **Add top-level try/catch + Sentry capture to all uncovered routes (H2 first, then H1 and H3).** Start with the most-trafficked read paths (`/api/properties`, `/api/deals`, `/api/portfolio/summary`). Wrap each in a minimal `try { … } catch (err) { console.error(…); Sentry.captureException(…); return NextResponse.json({ error: "…" }, { status: 500 }); }` block consistent with the existing pattern in the PATCH/DELETE handlers.

2. **Wrap the Stripe webhook switch block in a top-level try/catch (H1).** Catch exceptions from the event-dispatch block, capture to Sentry with the `event.type` and `event.id`, and return `500` intentionally so Stripe retries — but with operator visibility.

3. **Add `next build` (or `tsc --noEmit`) as a CI step (M3).** This catches TypeScript errors, build-time env assertions, and import resolution failures before they reach Vercel. A lightweight `npx tsc --noEmit` step costs ~30 s and prevents silent deploy failures.

4. **Set `CRON_SECRET` as a required env var in `lib/env.ts` REQUIRED_ENV_VARS (L4).** Move it from "optional" in `.env.example` to "required" (with a comment that it's only evaluated at cron-route request time). Alternatively, add a Sentry capture to the 500 path so the misconfiguration is immediately visible.

5. **Add a connection pool limit to `lib/db.ts` (M4).** Add `?connection_limit=5` (or similar) to the `DATABASE_URL` or configure the `PrismaPg` adapter's pool options. Document the chosen limit in `docs/setup/manual-steps.md`.

---

## Task candidates

- [ ] Add try/catch + Sentry capture to `GET /api/properties` (list path — unguarded DB query)
- [ ] Add try/catch + Sentry capture to `GET /api/properties/[id]` (single fetch — unguarded DB query)
- [ ] Add try/catch + Sentry capture to `GET /api/deals` (list path — unguarded DB queries)
- [ ] Add try/catch + Sentry capture to `GET /api/portfolio/summary` (wraps `buildPortfolioSummaryPayload`)
- [ ] Add try/catch + Sentry capture to `GET /api/onboarding` and `PATCH /api/onboarding`
- [ ] Add try/catch + Sentry capture to `GET /api/export/portfolio` and `GET /api/export/portfolio-summary`
- [ ] Wrap Stripe webhook event-dispatch switch block in outer try/catch with Sentry capture
- [ ] Add try/catch + Sentry capture around `prisma.$transaction` in `POST /api/import/portfolio`
- [ ] Add try/catch around final `prisma.$transaction` in `POST /api/account/delete`
- [ ] Add `npx tsc --noEmit` or `npm run build` step to `.github/workflows/ci.yml`
- [ ] Set `CRON_SECRET` in `REQUIRED_ENV_VARS` in `lib/env.ts` (or add Sentry capture to the 500 misconfiguration path)
- [ ] Add `connection_limit` to Prisma `DATABASE_URL` / adapter config and document in `manual-steps.md`
- [ ] Add brief migration rollback procedure to `docs/runbooks/incident-response.md`
- [ ] Add RentCast, Resend, and Google Places degradation runbook entries to `incident-response.md`

---

## Re-test checklist

- [ ] Verify try/catch added to all routes identified in H2 — confirm Sentry event fires on a simulated DB error
- [ ] Verify Stripe webhook outer guard catches and captures a simulated `syncSubscriptionToDb` failure
- [ ] Verify `npx tsc --noEmit` runs in CI and fails on a deliberate type error
- [ ] Verify `CRON_SECRET` is either required at startup or produces a Sentry event when absent
- [ ] `npm run check` after any code changes implementing the above

---

## Next trigger and cadence

- **Trigger:** Major release, after any new API surface area is added, or 90 days
- **Recommended next run:** 2026-07-05 (quarterly) or earlier if a high-traffic event is planned
