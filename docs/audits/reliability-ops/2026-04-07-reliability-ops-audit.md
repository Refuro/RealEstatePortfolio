# Reliability & Operations Audit — 2026-04-07

## Executive summary

- **Overall:** Core production paths show intentional patterns: Stripe webhook failures return **500** with **Sentry** (Stripe retries), billing sync **degrades** to HTTP 200 with `synced: false` while logging + Sentry, **`GET /api/health`** exposes DB connectivity, and **`docs/runbooks/incident-response.md`** documents Vercel rollback, logs, and an UptimeRobot monitor URL.
- **Top risks:** **Observability is DSN-gated** — without `NEXT_PUBLIC_SENTRY_DSN`, client boundaries and many explicit `captureException` calls do nothing; **CI does not run `next build`**, so type/build failures surface at Vercel; **Vercel Cron** hits three routes daily/hourly — if **`CRON_SECRET`** is unset, every invocation returns **500** with only `console.error` (no Sentry on that branch).
- **Dependencies:** **PostgreSQL** adapter uses a raw `connectionString` with **no documented pool limit** for serverless fan-out; **`npm run build`** runs **`prisma migrate deploy`**, so code rollback without a matching migration story can strand the DB (runbook still lacks a **migration rollback** section for destructive changes).
- **Recommendation:** Treat **Sentry DSN + CRON_SECRET** as production launch gates; extend the incident runbook for **third-party degradation** (RentCast, Google Places, Resend) and **migration + code rollback** interaction; optionally add **`next build` or `tsc`** to CI per `docs/qa/test-infrastructure-review.md` §3.5.

## Severity-ranked findings

### Critical

- *(None identified in this pass.)* No single finding combines certain widespread outage with absent detection/recovery beyond documented health monitoring and Stripe’s own webhook retry behavior.

### High

- **Production error signal depends on optional Sentry DSN** — If `NEXT_PUBLIC_SENTRY_DSN` is unset, `global-error.tsx` and `app/(app)/error.tsx` skip `captureException`, and server configs in `sentry.*.config.ts` do not initialize Sentry. Operators rely on Vercel logs and user reports. **Impact:** Silent degradation of incident detection. **Evidence:** `app/app/global-error.tsx` (lines 14–16), `app/app/(app)/error.tsx` (lines 15–17), `app/sentry.server.config.ts` (lines 3–10), `app/.env.example` (Sentry marked optional).

- **CI does not run production build or standalone TypeScript check** — `.github/workflows/ci.yml` runs `lint` and `test` only; `docs/qa/test-infrastructure-review.md` §3.5 documents that **`npm run build` is intentionally not in CI**. TypeScript or Next compile errors can reach production deploy before failure. **Impact:** Late discovery of broken builds. **Evidence:** `.github/workflows/ci.yml`; `app/package.json` (`check` = `build` + `lint`, not invoked by CI); `docs/qa/test-infrastructure-review.md` §1, §3.5.

### Medium

- **Prisma serverless connection usage has no explicit pool limit in app config** — `lib/db.ts` passes only `connectionString` to `PrismaPg`. Under concurrent serverless instances, connection exhaustion can cause **503** on `/api/health` or failed requests. **Evidence:** `app/lib/db.ts`; architecture doc mentions observability but not pool tuning (`docs/architecture-and-build-practices.md` §2.6).

- **Destructive migration without runbook rollback path** — `20260406120000_completeness_overhaul` **drops** `Property.unitMix`. Vercel “promote previous deployment” does not reverse applied migrations; incident runbook has no **DB migration rollback** procedure. **Impact:** Wrong rollback order can leave old code against new schema (or vice versa). **Evidence:** `app/prisma/migrations/20260406120000_completeness_overhaul/migration.sql` (lines 8–9); `docs/runbooks/incident-response.md` §1 (Vercel rollback only).

- **Incident runbook omits third-party degradation playbooks** — Runbook covers DB, Stripe, Clerk, Sentry, CSP. It does not document **RentCast**, **Google Places**, or **Resend** failure modes (user-visible vs silent), though the product depends on them for optional flows and contact email. **Evidence:** `docs/runbooks/incident-response.md` §2–3; `docs/setup/manual-steps.md` (RentCast, Resend, Places).

### Low

- **Cron auth misconfiguration returns 500 without Sentry** — `GET` handlers for `/api/cron/onboarding-emails`, `/api/cron/trial-emails`, and `/api/cron/rate-limit-cleanup` return **500** with `console.error` when `CRON_SECRET` is missing; no `captureException` on that branch. Vercel Cron still fires per `vercel.json`. **Evidence:** `app/app/api/cron/onboarding-emails/route.ts` (lines 30–33); `app/app/api/cron/trial-emails/route.ts` (lines 23–26); `app/app/api/cron/rate-limit-cleanup/route.ts` (lines 8–11); `vercel.json`.

- **Cron handlers: DB query outside per-user try/catch** — Initial `prisma.user.findMany` in onboarding and trial email routes is not wrapped in the same try/catch as the per-user loop. A thrown query error becomes an unhandled route error (may still reach Sentry via framework integration if DSN is set, but response shape and logging are less explicit than inner loops). **Evidence:** `app/app/api/cron/onboarding-emails/route.ts` (lines 48–65 vs 73–111); `app/app/api/cron/trial-emails/route.ts` (lines 35–54 vs 65–142).

- **Sentry `tracesSampleRate` is hardcoded (0.1 prod)** — Raising trace sampling for an incident requires a code change and deploy. **Evidence:** `app/sentry.server.config.ts` (line 8); `app/sentry.client.config.ts` (line 18).

- **Stripe webhook signature failures log only to console** — Invalid signature returns **400** without Sentry (reasonable to avoid noise from scanners; document as intentional). **Evidence:** `app/app/api/billing/webhook/route.ts` (lines 36–38).

## Evidence reviewed

- **Process / template:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Architecture & setup:** `docs/architecture-and-build-practices.md` (§2.6 observability), `docs/setup/manual-steps.md`
- **Runbooks:** `docs/runbooks/incident-response.md`
- **CI / quality:** `.github/workflows/ci.yml`, `app/package.json`, `docs/qa/test-infrastructure-review.md` (§1, §3.5)
- **Env / DB:** `app/lib/env.ts`, `app/lib/db.ts`
- **Observability / errors:** `app/app/global-error.tsx`, `app/app/(app)/error.tsx`, `app/sentry.client.config.ts`, `app/sentry.server.config.ts`, `app/next.config.ts` (Sentry + CSP headers)
- **Health:** `app/app/api/health/route.ts`
- **Billing:** `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/sync/route.ts`
- **Cron / jobs:** `vercel.json`, `app/app/api/cron/onboarding-emails/route.ts`, `app/app/api/cron/trial-emails/route.ts`, `app/app/api/cron/rate-limit-cleanup/route.ts`
- **Sample API resilience:** `app/app/api/portfolio/summary/route.ts`, `app/app/api/contact/route.ts`
- **Migrations:** `app/prisma/migrations/20260406120000_completeness_overhaul/migration.sql`
- **Sentry usage scan:** grep of `Sentry.captureException` / `captureMessage` under `app/app/api/` (broad coverage on write paths and several reads; gaps as noted above)

**Assumptions / limits:** Read-only audit; no runtime load tests or live verification of UptimeRobot/Sentry projects. Failure modes inferred from code and docs.

## Risk & impact assessment

- **Unresolved High items** mainly affect **mean time to detect and fix** (missing Sentry, late build failure) rather than guaranteed user-facing outage.
- **Medium items** matter under **scale or bad deploys**: connection limits, migration/code mismatch, and operator uncertainty when optional integrations fail.
- **Low items** skew toward **background jobs and email** — misconfigured cron secret stops onboarding/trial email automation and hourly rate-limit cleanup without a loud alert unless logs are watched.

## Recommendations (prioritized)

1. **Launch gate:** Set `NEXT_PUBLIC_SENTRY_DSN` in production and document in `docs/setup/manual-steps.md` or internal launch checklist that production without DSN is unsupported for ops.
2. **Cron reliability:** Ensure `CRON_SECRET` is set in all Vercel environments that have `vercel.json` crons; optionally emit `Sentry.captureMessage` (warning) when secret is missing so misconfiguration is visible.
3. **Runbook hardening:** Extend `docs/runbooks/incident-response.md` with (a) **migration vs Vercel rollback** (when to avoid promoting old code, how to repair schema), and (b) short **RentCast / Google Places / Resend** sections (symptoms, env vars, user-visible behavior).
4. **CI / release confidence:** Add a lightweight **`next build`** or **`tsc --noEmit`** job (or document explicit owner responsibility to run `npm run check` before merge) per team tolerance and `docs/qa/test-infrastructure-review.md`.
5. **Database connections:** Document or configure Neon/Supabase-appropriate **connection limits / pooler** (e.g. `connection_limit` on URL or provider dashboard) and link from `docs/setup/manual-steps.md`.

## Task candidates (optional)

- [ ] Add production checklist: Sentry DSN + CRON_SECRET + `NEXT_PUBLIC_APP_URL` + Stripe webhook secret (cross-reference `app/lib/env.ts` assertions).
- [ ] Add `Sentry.captureMessage` or `captureException` for cron **misconfiguration** branches (missing `CRON_SECRET`).
- [ ] Update `docs/runbooks/incident-response.md` with migration rollback / code rollback interaction and third-party integration triage.
- [ ] Evaluate `SENTRY_TRACES_SAMPLE_RATE` (or similar) env-driven sampling in `sentry.*.config.ts`.
- [ ] Add CI job: `next build` with dummy env **or** `tsc --noEmit` in `app/`.

## Re-test checklist

- [ ] Verify fix for High: Sentry DSN present in production project; spot-check error appears in Sentry from a test route.
- [ ] Verify fix for High: CI catches a deliberate TS error if a compile job is added.
- [ ] Verify cron: authorized call returns 200 and misconfigured secret path is observable (log or Sentry).
- [ ] `npm run check` (when code or CI workflow changes are made)

## Next trigger and cadence

- **Trigger:** Monthly, after major billing/cron/migration changes, or pre-launch.
- **Recommended next run:** **2026-05-07** (or next production-impacting release, whichever is sooner).
