# Reliability & Operations Audit — 2026-05-01

## Executive summary

- **Overall:** Failure handling and observability align with `docs/architecture-and-build-practices.md` §2.6: `@sentry/nextjs` on server/edge/client, `export const onRequestError = Sentry.captureRequestError` in `app/instrumentation.ts`, and broad `Sentry.captureException` usage across API routes, crons, billing, and PostHog capture helpers. Vercel Cron paths in `app/vercel.json` match the Clerk public allowlist in `app/proxy.ts` (seven `/api/cron/*` entries). `GET|HEAD /api/health` remains a **liveness-only** probe with no DB touch.
- **Top risks:** Runbook **§3** still describes database recovery using **“503 on /api/health”**, which does not match `app/app/api/health/route.ts`. External uptime (documented UptimeRobot on `/api/health`) can stay green during DB-only outages. Admin-triggered `POST …/billing-sync` returns `500` without forwarding to Sentry.
- **Recommendation:** Fix incident-response **§3** wording and the monitoring story (liveness vs readiness). Add Sentry to the admin billing-sync outer `catch`; optionally tighten `CRON_SECRET` surfacing (Sentry or deploy-time assertion). Scrub stale proxy-related rows in `docs/tasks.md` so on-call does not chase fixed issues.

## Severity-ranked findings

### Critical

- None identified in this pass. Stripe webhook and sampled cron handlers report unexpected failures to Sentry; cron routes enforce `Authorization: Bearer ${CRON_SECRET}` when configured.

### High

- **Incident runbook contradicts `/api/health` implementation** — `docs/runbooks/incident-response.md` **§2** correctly states liveness-only health; **§3** is titled **“Database unreachable (503 on /api/health)”** and points triage at `/api/health` for DB failure. The handler always returns **200** `{ "status": "ok" }` when the Node route runs; it does not probe Neon. **Risk:** Wrong runbook path extends MTTR and erodes trust in ops docs. — *Evidence:* `docs/runbooks/incident-response.md` §2 (lines 64–68) vs §3 (lines 89–93); `app/app/api/health/route.ts`.
- **Synthetic uptime vs data-plane health** — Incident response documents UptimeRobot against `GET …/api/health`. With no DB probe, the monitor reflects **app process liveness**, not PostgreSQL availability. **Risk:** User-facing authenticated routes can fail while monitors stay green unless Sentry/Neon dashboards catch the incident. — *Evidence:* `app/app/api/health/route.ts`; `docs/runbooks/incident-response.md` §2.

### Medium

- **`CRON_SECRET` unset: console-only, no Sentry** — When `CRON_SECRET` is missing, cron handlers return **500** after `console.error("CRON_SECRET is not configured")` without `Sentry.captureException` in that branch. **Risk:** Misconfigured Production may only show up in Vercel Logs, not error tracking. — *Evidence:* e.g. `app/app/api/cron/onboarding-emails/route.ts` (lines 29–34); `app/app/api/cron/monthly-refresh/route.ts` (lines 16–19).
- **`CRON_SECRET` not in `validateEnv()` / `instrumentation` deploy assertions** — `app/lib/env.ts` required keys omit `CRON_SECRET`; `app/instrumentation.ts` asserts Stripe webhook secret and public app URL on Vercel but not cron auth. **Risk:** First failed schedule or manual curl surfaces misconfiguration instead of deploy/build. — *Evidence:* `app/lib/env.ts`; `app/instrumentation.ts`.
- **Admin billing sync: `500` without Sentry** — `app/app/api/admin/users/[id]/billing-sync/route.ts` outer `catch` returns JSON error without `Sentry.captureException`, unlike most billing-related routes. **Risk:** Operator-initiated failures lack grouped telemetry. — *Evidence:* `app/app/api/admin/users/[id]/billing-sync/route.ts` (lines 195–198).
- **Read-route hardening backlog** — **SEC-SHIP-3** in `docs/tasks.md` still asks for try/catch + Sentry on unguarded read routes. **Risk:** Uncaught read-path errors may return generic failures without consistent capture until closed. — *Evidence:* `docs/tasks.md` (SEC-SHIP-3).

### Low

- **Monthly refresh scale headroom** — `app/lib/refresh.ts` sets `MAX_PROPERTIES_PER_USER_PER_RUN = Number.POSITIVE_INFINITY`; `monthly-refresh` batches users but each `processUserRefresh` can touch all properties for a user. Capacity hints exist in the cron JSON response (`capacityPlanning.runtimeNote`). **Risk:** Large portfolios could approach function duration or RentCast quota limits; monitoring is mostly log/Sentry per user failure. — *Evidence:* `app/lib/refresh.ts` (lines 13–17); `app/app/api/cron/monthly-refresh/route.ts` (lines 86–101).
- **`docs/tasks.md` proxy task drift** — **SEC-SHIP-1** still describes adding `/api/unsubscribe` and `/api/cron/onboarding-emails` to `isPublicRoute`; both appear in `app/proxy.ts` (2026-05-01). **CRIT-0409-1** parent is marked complete while nested checkboxes remain open. **Risk:** Wasted triage time. — *Evidence:* `docs/tasks.md` (lines 400–401, 232–236); `app/proxy.ts` (lines 27–37).
- **Trace sampling** — `app/sentry.server.config.ts` uses `tracesSampleRate: 0.1` outside development; deep trace investigation may need temporary rate bumps. — *Evidence:* `app/sentry.server.config.ts`.
- **Route-level error UI coverage** — `error.tsx` exists under `app/app/(app)/`, sign-in, and sign-up; `global-error.tsx` covers root failures. Public marketing segments under `app/app/` rely on `global-error` for uncaught render errors rather than segment-specific recoveries (acceptable trade-off but coarser UX). — *Evidence:* `app/app/(app)/error.tsx`; `app/app/global-error.tsx`; `app/app/sign-in/[[...sign-in]]/error.tsx`.
- **Client `fetch` retry semantics** — App Router client components issue `fetch` to APIs without a shared retry/backoff layer; degraded-mode messaging varies by surface (some buttons mention retry). **Risk:** Transient network blips manifest as one-shot failures unless user retries manually. — *Evidence:* sampled `grep` hits under `app/app/(app)/` (e.g. `app-layout-client.tsx`, property/dashboard flows).

## Evidence reviewed

- **Process / template:** `docs/process/reliability-ops-audit-process.md`; `docs/process/audit-report-template.md`
- **Architecture / setup:** `docs/architecture-and-build-practices.md` (§2.6 observability, § deploy/cron/health); `docs/setup/manual-steps.md` (Vercel Cron + `CRON_SECRET` checklist)
- **Runbooks:** `docs/runbooks/incident-response.md`; `docs/runbooks/health-check-smoke.md`
- **Deploy / auth boundary:** `app/vercel.json`; `app/proxy.ts`
- **Health & instrumentation:** `app/app/api/health/route.ts`; `app/instrumentation.ts`; `app/sentry.server.config.ts`; `app/sentry.edge.config.ts`; `app/sentry.client.config.ts`; `app/instrumentation-client.ts`
- **Error UI:** `app/app/global-error.tsx`; `app/app/(app)/error.tsx`; sign-in/sign-up `error.tsx`
- **Samples:** `app/app/api/cron/onboarding-emails/route.ts`; `app/app/api/cron/monthly-refresh/route.ts`; `app/lib/refresh.ts`; `app/lib/auth.ts` (`withPrismaRetry`); `app/app/api/admin/users/[id]/billing-sync/route.ts`
- **Backlog:** `docs/tasks.md` (SEC-SHIP-1, SEC-SHIP-3, CRIT-0409-1)

**Limits:** Read-only review of docs and code; no live verification of Sentry projects, Vercel Cron success history, UptimeRobot, or PostHog. Not every API route was inspected.

## Risk & impact assessment

- Runbook and monitor mismatch inflates **MTTD** for database and credential incidents if responders wait for `/api/health` to fail.
- Cron misconfiguration or long-running refresh jobs affect **email lifecycles**, **monthly snapshots**, and **rate-limit cleanup** with visibility split between Vercel Logs and Sentry.
- Admin-only gaps narrow **blast radius** but slow **correlation** when supporting billing discrepancies.

## Recommendations (prioritized)

1. **Rewrite `docs/runbooks/incident-response.md` §3** — Remove the **503 on `/api/health`** premise; align DB recovery steps with Neon dashboard and API/Sentry signals. If a future **readiness** endpoint exists, document it separately and update monitoring tables.
2. **Declare the monitoring contract** — Either add a documented DB/external check beyond liveness, or state explicitly that UptimeRobot is **process-only** and DB outage detection is via Sentry/Vercel/Neon (per §2 tone).
3. **Harden cron and admin observability** — Capture `CRON_SECRET` misconfiguration to Sentry or fail fast at deploy on Vercel when cron is always enabled; add `Sentry.captureException` to admin billing-sync `catch` with safe `extra` fields.
4. **Close or refresh `docs/tasks.md` items** — Mark **SEC-SHIP-1** / **CRIT-0409-1** sub-checkboxes to match current `proxy.ts`, or archive; drive **SEC-SHIP-3** to completion for read-route parity.

## Task candidates (optional)

- [ ] Align `docs/runbooks/incident-response.md` §3 with liveness-only `/api/health` (remove 503 framing; point DB triage at Neon/API errors).
- [ ] Add `Sentry.captureException` (and structured context) to `app/app/api/admin/users/[id]/billing-sync/route.ts` outer `catch`.
- [ ] When `CRON_SECRET` is missing at runtime in cron handlers, emit `Sentry.captureMessage`/`captureException` (or equivalent) in addition to `console.error`; optionally add deploy-time assertion for Production when all crons are required.
- [ ] Reconcile `docs/tasks.md`: close superseded **SEC-SHIP-1** / **CRIT-0409-1** checkboxes or update acceptance text to match `app/proxy.ts`.
- [ ] Complete **SEC-SHIP-3** (unguarded read routes: try/catch + Sentry + `console.error` per task text).
- [ ] Optional: document or implement a **readiness** check (e.g. lightweight DB ping on a dedicated path) if product requires uptime to reflect data-plane health — **do not** overload `/api/health` without an explicit ops decision (`docs/runbooks/health-check-smoke.md`).

## Re-test checklist

- [ ] Table-top: simulate Neon unreachable — confirm runbook steps and URLs match actual signals (no reliance on `/api/health` for DB).
- [ ] After billing-sync instrumentation — trigger a controlled failure and confirm Sentry grouping.
- [ ] After any cron observability change — verify events appear when `CRON_SECRET` is unset in a safe environment.
- [ ] `npm run check` (when application code changes)

## Next trigger and cadence

- **Trigger:** Changes to `/api/health`, `vercel.json` crons, `proxy.ts` public routes, Sentry config, or production env contracts; otherwise **quarterly** or pre-release.
- **Suggested next window:** **2026-08-01** (quarterly) or the next full-audit synthesis cycle.
