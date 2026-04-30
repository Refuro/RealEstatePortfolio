# Reliability & Operations Audit — 2026-04-29

## Executive summary

- **Overall:** Failure handling and observability remain aligned with documented architecture: Sentry is wired through server/edge/client configs, `instrumentation.ts` exports `onRequestError`, and high-value paths (billing webhook/sync, property CRUD, exports, crons with per-item isolation) use explicit `Sentry.captureException`. `getAppUser()` still wraps Prisma with bounded retries for transient DB errors (`app/lib/auth.ts`).
- **Still open (re-verified):** `docs/runbooks/incident-response.md` **§3** continues to describe database recovery under the heading **“Database unreachable (503 on /api/health)”** while **§2** and `app/app/api/health/route.ts` correctly state health is **liveness-only** (no DB probe, always `200` when the route responds). External monitoring on `/api/health` alone can stay green during DB-only outages.
- **New in this pass:** At least one **admin** route catches errors, returns **500**, and does **not** emit Sentry (`app/app/api/admin/users/[id]/billing-sync/route.ts`), which weakens operator visibility for billing support actions.
- **Recommendation:** Reconcile runbook §3 with §2 (or add a separate DB/readiness check and document it). Add Sentry (or remove broad catch) on admin billing-sync failures; keep pushing on **`CRON_SECRET`** visibility and **`SEC-SHIP-3`** read-route coverage from backlog.

## Severity-ranked findings

### Critical

- No critical defects identified in this read-only pass (Stripe webhook outer `catch` still captures to Sentry; cron routes consistently require `Authorization: Bearer ${CRON_SECRET}`).

### High

- **Incident runbook contradicts `/api/health` semantics** — `docs/runbooks/incident-response.md` §2 states the endpoint does not probe the database; §3 is still titled and framed around **“Database unreachable (503 on /api/health)”**, which does not match `app/app/api/health/route.ts` (always `200` + `{ status: "ok" }` when reachable). Risk: wrong triage steps and false confidence during DB incidents. — *Evidence:* `docs/runbooks/incident-response.md` (§2 lines 64–68 vs §3 lines 89–93); `app/app/api/health/route.ts`.
- **Primary uptime signal may miss DB-only failures** — Documented UptimeRobot target is `GET …/api/health` (`docs/runbooks/incident-response.md` §2). If that remains the only synthetic check, Neon or credential issues may not flip the monitor while authenticated routes fail; detection relies on user traffic → Sentry or manual Neon checks. — *Evidence:* `app/app/api/health/route.ts`; `docs/runbooks/incident-response.md` §2 “External uptime monitor”.

### Medium

- **Cron secret misconfiguration: console-only signal** — When `CRON_SECRET` is unset, cron handlers return **500** with `console.error("CRON_SECRET is not configured")` and no Sentry in that branch (pattern repeated across cron routes). Operators who live in Sentry may miss grouped mis-deploys until Vercel cron logs are inspected. — *Evidence:* e.g. `app/app/api/cron/monthly-refresh/route.ts` (lines 16–19); `app/app/api/cron/onboarding-emails/route.ts` (lines 29–33).
- **`CRON_SECRET` not in deploy-time assertions** — `app/lib/env.ts` `REQUIRED_ENV_VARS` and `app/instrumentation.ts` fail fast for core billing/URL envs but not for `CRON_SECRET`; misconfiguration surfaces at **first cron invocation**, not build. `app/.env.example` documents the var; `docs/setup/manual-steps.md` does not call it out in the Hosting checklist. — *Evidence:* `app/lib/env.ts`; `app/instrumentation.ts`; `docs/setup/manual-steps.md`; `app/.env.example` (lines 47–49).
- **Admin billing sync swallows errors without Sentry** — `app/app/api/admin/users/[id]/billing-sync/route.ts` outer `catch` returns `NextResponse.json({ error: message }, { status: 500 })` with no `Sentry.captureException`, unlike most user-facing billing routes. Support-time failures are harder to correlate in Sentry. — *Evidence:* `app/app/api/admin/users/[id]/billing-sync/route.ts` (lines 195–198).
- **Backlog: unguarded read routes** — `docs/tasks.md` **SEC-SHIP-3** remains open (try/catch + Sentry + structured log on unguarded read handlers). — *Evidence:* `docs/tasks.md`.

### Low

- **Trace sampling** — `app/sentry.server.config.ts` uses `tracesSampleRate: 0.1` outside development; raising coverage for an incident still requires a deploy or config change.
- **Client error boundaries gate Sentry on `NEXT_PUBLIC_SENTRY_DSN`** — `app/app/global-error.tsx`, `app/app/(app)/error.tsx`, and sign-in/sign-up `error.tsx` capture only when DSN is set; `app/instrumentation.ts` logs a warning if DSN is missing in production.

## Evidence reviewed

- **Process / template:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Reference:** `docs/architecture-and-build-practices.md` (§2.6 observability), `docs/setup/manual-steps.md`
- **Runbooks:** `docs/runbooks/incident-response.md`
- **Deploy / schedule:** `app/vercel.json`; `app/proxy.ts` (public cron + `/api/health` matcher)
- **Health & instrumentation:** `app/app/api/health/route.ts`; `app/instrumentation.ts`; `app/lib/env.ts`; `app/sentry.server.config.ts`
- **Resilience samples:** `app/lib/auth.ts` (`withPrismaRetry`); `app/app/api/billing/webhook/route.ts`; `app/app/api/billing/sync/route.ts`; `app/app/(app)/app-layout-client.tsx` (client billing sync)
- **Cron sample:** `app/app/api/cron/monthly-refresh/route.ts` (auth + per-user `catch` + Sentry)
- **Admin sample:** `app/app/api/admin/users/[id]/billing-sync/route.ts`
- **Backlog:** `docs/tasks.md` (SEC-SHIP-3)

**Limits:** Sampling of API routes and client `fetch` paths only; no live traffic or dashboard verification. Audit is documentation and read-only code review (no changes under `app/`).

## Risk & impact assessment

- **Runbook / monitoring drift** primarily hurts **MTTD/MTTR** on database and credential incidents; user impact can be broad outage of authenticated flows while a liveness URL stays healthy.
- **Cron misconfiguration** delays lifecycle email, digest, refresh, and rate-limit cleanup—moderate product impact, moderate likelihood across environments without staging parity.
- **Admin billing sync** failures affect a narrow audience but can block support workflows with weak traceability.

## Recommendations (prioritized)

1. **Edit `docs/runbooks/incident-response.md` §3** so database recovery steps no longer imply **503 on `/api/health`**; align with §2 and `app/app/api/health/route.ts`, or document a **separate** DB readiness endpoint/monitor if product requires it.
2. **Explicit production alerting contract:** either add Neon (or synthetic) DB checks beyond `/api/health`, or document acceptance that external uptime is **liveness-only**.
3. **`CRON_SECRET`:** add to `docs/setup/manual-steps.md` Vercel env checklist; consider Sentry warning or deploy-time assert parity with Stripe webhook posture; alert on cron **500** responses in Vercel.
4. **Admin billing-sync:** add `Sentry.captureException` in the outer `catch` (or rethrow to global handler) with `extra` context (`userId`, admin action).

## Task candidates (optional)

- [ ] Align `docs/runbooks/incident-response.md` §3 with liveness-only `/api/health`.
- [ ] Add Sentry (or narrow catch) for `app/app/api/admin/users/[id]/billing-sync/route.ts` failures.
- [ ] Document `CRON_SECRET` in `docs/setup/manual-steps.md` and/or add deploy/cron observability for missing secret.

## Re-test checklist

- [ ] Table-top: DB unreachable — confirm documented signals and monitor URLs match reality.
- [ ] Staging: simulate admin billing-sync failure — confirm Sentry receives event after any code fix.
- [ ] `npm run check` (when application code changes)

## Next trigger and cadence

- **Trigger:** After changes to `/api/health`, cron config, `app/proxy.ts`, Sentry, or deploy env requirements; otherwise **quarterly** or pre-release.
- **Suggested next window:** **2026-07-29** (quarterly) or next production reliability review.
