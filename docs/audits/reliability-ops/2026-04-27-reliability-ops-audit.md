# Reliability & Operations Audit — 2026-04-27

## Executive summary

- **Overall:** Core patterns remain strong: Stripe webhook and billing sync report to Sentry with structured context; Vercel crons are allowlisted in `app/proxy.ts`; `global-error.tsx`, `(app)/error.tsx`, and sign-in/sign-up `error.tsx` provide fallback UX and optional Sentry capture when `NEXT_PUBLIC_SENTRY_DSN` is set. Monthly refresh cron isolates per-user failures and captures exceptions to Sentry.
- **Top shift since prior pass:** `GET /api/health` is now a **liveness-only** endpoint (no database probe). That matches the comment in `app/app/api/health/route.ts` and the monitoring note in `docs/runbooks/incident-response.md` §2, but **§3 of the same runbook still instructs responders to treat DB outages as “503 on /api/health”**, which is no longer accurate—creating operational drift and a possible **silent gap** if UptimeRobot is the sole automated check on `/api/health`.
- **Persistent gaps:** Cron handlers still return **500** on missing `CRON_SECRET` with **`console.error` only** (no Sentry in those branches). `CRON_SECRET` is still **not** part of `validateEnv()` / Vercel fail-fast assertions in `app/lib/env.ts` (unlike `STRIPE_WEBHOOK_SECRET`). **SEC-SHIP-3** remains open in `docs/tasks.md` for unguarded read routes.
- **Recommendation:** Reconcile the incident runbook with the new health semantics (and decide whether production needs a **separate** DB readiness probe or Neon-native alerting). Add observability or deploy-time checks for **`CRON_SECRET`** parity with billing webhook posture. Close or narrowly scope **SEC-SHIP-3** with a route inventory.

## Severity-ranked findings

### Critical

- No critical defects identified in this read-only pass (webhook outer `catch` still captures to Sentry; cron auth pattern is consistent).

### High

- **Incident runbook contradicts current health behavior** — `docs/runbooks/incident-response.md` §2 documents that `/api/health` does **not** probe the database, but §3 still titles recovery **“Database unreachable (503 on /api/health)”** and implies that path as a signal. The implementation returns **200** `{ status: "ok" }` regardless of DB state (`app/app/api/health/route.ts`). Risk: responders waste time on the wrong symptom or assume external monitoring will flip when only the DB is broken. — *Evidence:* `docs/runbooks/incident-response.md` (§2 lines 64–68 vs §3 lines 89–93); `app/app/api/health/route.ts` (lines 3–13).
- **Primary uptime URL may no longer reflect user-impacting DB failures** — If production monitoring is only `GET /api/health` (as documented for UptimeRobot in the runbook), **Neon outages or credential failures may not trip that monitor** while authenticated routes fail. Mean time to detect depends on Sentry noise from user traffic or manual Neon dashboard checks unless augmented. — *Evidence:* `app/app/api/health/route.ts`; `docs/runbooks/incident-response.md` (§2 “External uptime monitor” table).

### Medium

- **Cron secret misconfiguration lacks Sentry signal** — When `CRON_SECRET` is unset, cron routes log with `console.error("CRON_SECRET is not configured")` and return **500** without `Sentry.captureException` / `captureMessage` in that branch. Operators relying primarily on Sentry may miss grouped mis-deploys until Vercel cron logs are reviewed. — *Evidence:* `app/app/api/cron/onboarding-emails/route.ts` (lines 28–33); same pattern in `app/app/api/cron/monthly-refresh/route.ts` (lines 15–19), `monthly-digest`, `milestone-emails`, `trial-emails`, `rate-limit-cleanup`, `winback-emails` (repository-wide grep for `CRON_SECRET is not configured`).
- **`CRON_SECRET` not validated at deploy / env parity** — `app/lib/env.ts` lists required vars for general startup (`DATABASE_URL`, Clerk, Stripe, webhook secret) but **not** `CRON_SECRET`; `app/instrumentation.ts` asserts Stripe webhook secret and public app URL on Vercel but not cron secret. Misconfiguration surfaces at **first cron invocation**, not build. — *Evidence:* `app/lib/env.ts` (lines 7–24); `app/instrumentation.ts` (lines 7–12).
- **Residual unguarded read-route coverage (backlog)** — `docs/tasks.md` **SEC-SHIP-3** remains unchecked: add try/catch + Sentry + `console.error` on unguarded read handlers. Until closed, GET coverage is an explicit known gap. — *Evidence:* `docs/tasks.md` (SEC-SHIP-3 entry).

### Low

- **Trace sampling fixed at 0.1 outside development** — `app/sentry.server.config.ts` sets `tracesSampleRate: 0.1` when `NODE_ENV !== "development"`; incident-time increases require a deploy or env-driven toggle (not present in this file). — *Evidence:* `app/sentry.server.config.ts` (lines 3–9).
- **Client and segment error boundaries gate Sentry on public DSN** — `global-error.tsx`, `(app)/error.tsx`, and sign-in error UI call `captureException` only when `NEXT_PUBLIC_SENTRY_DSN` is set; production without DSN relies on logs. A startup warning exists when DSN is missing on Vercel (`app/instrumentation.ts` lines 10–12). — *Evidence:* `app/app/global-error.tsx` (lines 13–16); `app/app/(app)/error.tsx` (lines 14–17); `app/instrumentation.ts`.

## Evidence reviewed

- **Process / template:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Reference docs:** `docs/architecture-and-build-practices.md` (§2.6 observability), `docs/setup/manual-steps.md` (hosting, env, third-party setup)
- **Runbooks:** `docs/runbooks/incident-response.md` (rollback, monitoring, recovery)
- **Deploy / schedule:** `app/vercel.json` (seven cron paths); `app/proxy.ts` (public matcher includes crons, webhook, health, contact, CSP report, unsubscribe)
- **Health & instrumentation:** `app/app/api/health/route.ts`; `app/instrumentation.ts`; `app/lib/env.ts`; `app/sentry.server.config.ts`
- **Failure UX:** `app/app/global-error.tsx`; `app/app/(app)/error.tsx`; `app/app/sign-in/[[...sign-in]]/error.tsx` (pattern also on sign-up)
- **Billing resilience:** `app/app/api/billing/webhook/route.ts` (Sentry on processing failure); `app/app/api/billing/sync/route.ts` (catch logs JSON + Sentry, returns degraded `respondOk`); `app/app/(app)/app-layout-client.tsx` (client billing sync: Sentry on non-OK and network error)
- **Cron sample:** `app/app/api/cron/onboarding-emails/route.ts` (auth + missing secret); `app/app/api/cron/monthly-refresh/route.ts` (per-user try/catch + Sentry on failure)
- **Backlog:** `docs/tasks.md` (RELI-0409-* marked done; SEC-SHIP-3 open)

**Limits:** Not every API route was opened; third-party SDK retry policies were not exhaustively traced. Audit is documentation and read-only code review only (no changes under `app/`).

## Risk & impact assessment

- **Runbook / monitoring drift** affects **mean time to detect and respond** on database incidents more than a single code bug; user-visible impact can be **full app failure for signed-in flows** while a liveness monitor stays green.
- **Cron misconfiguration** skews toward **delayed lifecycle emails**, **stale digests/refreshes**, and **rate-limit cleanup gaps**—medium severity, moderate likelihood in multi-environment setups without staging parity checks.
- **Stripe path** remains well-instrumented for operator visibility; billing sync intentionally **degrades** (keeps last-known tier) when Stripe throws, which limits user-facing hard failure.

## Recommendations (prioritized)

1. **Update `docs/runbooks/incident-response.md` §3** to remove or rewrite the “503 on `/api/health`” database playbook so it matches §2 and the current route implementation; add explicit steps for Neon dashboard, Sentry error spikes, and/or a **separate** readiness check if product requires DB-aware alerting.
2. **Decide the production alerting contract:** either add a **secondary** monitor or synthetic check that exercises a cheap DB query (or use Neon’s built-in alerts), **or** document acceptance that `/api/health` is liveness-only and UptimeRobot will not reflect DB-only outages.
3. **Improve cron misconfiguration visibility:** emit `Sentry.captureMessage` (warning) or `captureException` when `CRON_SECRET` is missing, and/or add Vercel alerting on cron HTTP 500s; optionally align with `assertStripeWebhookSecretForVercelDeploy` policy for production.
4. **Close SEC-SHIP-3** with a concrete inventory of remaining GET handlers so “unguarded read” is not an open-ended reliability unknown.

## Task candidates (optional)

- [ ] Edit `docs/runbooks/incident-response.md` §3 to align database recovery steps with liveness-only `/api/health`.
- [ ] Add Sentry or deploy-time signal for missing `CRON_SECRET` on Vercel production.
- [ ] Resolve **SEC-SHIP-3** in `docs/tasks.md` with a route list and verification plan.

## Re-test checklist

- [ ] After runbook edits: walk a table-top incident (DB down) and confirm documented signals match reality.
- [ ] After cron observability change: simulate missing `CRON_SECRET` in staging and confirm alerting path.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After changes to `/api/health`, `vercel.json` crons, `app/proxy.ts` public routes, Sentry configuration, or deploy env requirements; otherwise **quarterly** or before a major release.
- **Suggested next window:** **2026-07-27** (quarterly) or the next production reliability review milestone.
