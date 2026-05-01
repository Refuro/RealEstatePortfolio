# Reliability & Operations Audit — 2026-04-30

## Executive summary

- **Overall:** The stack matches the documented reliability posture: Sentry is initialized for server/edge with `onRequestError` exported from `app/instrumentation.ts`, Vercel crons are declared in `app/vercel.json` and listed in `app/proxy.ts`, and high-trust paths such as the Stripe webhook still surface failures to Sentry. User resolution continues to use bounded Prisma retries in `app/lib/auth.ts` (`withPrismaRetry`).
- **Runbook drift (re-verified):** `docs/runbooks/incident-response.md` **§2** correctly documents liveness-only `/api/health`, but **§3** still frames database recovery as **“Database unreachable (503 on /api/health)”**, which disagrees with `app/app/api/health/route.ts` (always `200` + `{ status: "ok" }` when the route responds).
- **Visibility gaps:** Cron handlers log `CRON_SECRET is not configured` to the console without Sentry; `CRON_SECRET` is not in `app/lib/env.ts` required/deploy assertions. Admin POST `app/app/api/admin/users/[id]/billing-sync/route.ts` returns `500` from a broad `catch` without `Sentry.captureException`.
- **Recommendation:** Fix the incident runbook §3 heading and steps (or add a documented DB readiness probe). Tighten cron and admin operational visibility; keep **SEC-SHIP-3** read-route hardening on the backlog until closed.

## Severity-ranked findings

### Critical

- No critical defects identified in this read-only pass (Stripe webhook handler includes `Sentry.captureException` on processing failure; sampled cron routes require `Authorization: Bearer ${CRON_SECRET}` when the secret is set).

### High

- **Incident runbook contradicts `/api/health` behavior** — §2 documents a non-DB liveness check; §3 title and framing still imply **503 from `/api/health`** during DB outages. Risk: incorrect triage and false confidence when only Neon is down. — *Evidence:* `docs/runbooks/incident-response.md` (§2 lines 64–68 vs §3 lines 89–93); `app/app/api/health/route.ts`.
- **External uptime may not reflect DB-only failure** — UptimeRobot is documented against `GET …/api/health` (`docs/runbooks/incident-response.md` §2). With liveness-only health, the monitor can stay green while authenticated API routes fail on DB errors; detection depends on Sentry, user reports, or manual Neon checks. — *Evidence:* `app/app/api/health/route.ts`; `docs/runbooks/incident-response.md` §2.

### Medium

- **`CRON_SECRET` missing: console-only signal** — When unset, cron routes return **500** after `console.error("CRON_SECRET is not configured")` with no Sentry in that branch (pattern in multiple cron handlers). — *Evidence:* e.g. `app/app/api/cron/onboarding-emails/route.ts` (lines 28–34); `app/app/api/cron/monthly-refresh/route.ts` (lines 16–19).
- **`CRON_SECRET` not in deploy-time assertions** — `app/instrumentation.ts` asserts Stripe webhook secret and public app URL on Vercel but not `CRON_SECRET`; `app/lib/env.ts` `REQUIRED_ENV_VARS` omits it. Misconfiguration appears at first cron hit, not build. `docs/setup/manual-steps.md` hosting checklist does not mention `CRON_SECRET` (contrast `app/.env.example`). — *Evidence:* `app/lib/env.ts`; `app/instrumentation.ts`; `docs/setup/manual-steps.md`.
- **Admin billing sync: errors not captured to Sentry** — Outer `catch` in `app/app/api/admin/users/[id]/billing-sync/route.ts` returns JSON `500` without `Sentry.captureException`, unlike typical billing routes. — *Evidence:* `app/app/api/admin/users/[id]/billing-sync/route.ts` (lines 195–198).
- **Backlog: unguarded read routes** — `docs/tasks.md` **SEC-SHIP-3** remains open (try/catch + Sentry + structured logging on listed GET/PATCH/export read handlers). — *Evidence:* `docs/tasks.md`.

### Low

- **Trace sampling** — `app/sentry.server.config.ts` uses `tracesSampleRate: 0.1` outside development; expanding trace volume for an incident still requires config/deploy change.
- **Client/global error reporting** — Per architecture notes, client fallbacks gate Sentry on `NEXT_PUBLIC_SENTRY_DSN`; `app/instrumentation.ts` warns when DSN is absent in production.

## Evidence reviewed

- **Process / template:** `docs/process/reliability-ops-audit-process.md`; `docs/process/audit-report-template.md`
- **Reference:** `docs/architecture-and-build-practices.md` (§2.6 observability); `docs/setup/manual-steps.md`
- **Runbooks:** `docs/runbooks/incident-response.md`
- **Deploy / routing:** `app/vercel.json`; `app/proxy.ts` (cron allowlist + `/api/health`)
- **Health & instrumentation:** `app/app/api/health/route.ts`; `app/instrumentation.ts`; `app/lib/env.ts`; `app/sentry.server.config.ts`
- **Resilience samples:** `app/lib/auth.ts` (`withPrismaRetry`); `app/app/api/billing/webhook/route.ts` (`Sentry.captureException` on handler failure); `app/app/api/cron/onboarding-emails/route.ts`; `app/app/api/admin/users/[id]/billing-sync/route.ts`
- **Backlog:** `docs/tasks.md` (SEC-SHIP-3)

**Limits:** Read-only sampling of docs and representative code paths; no live PostHog/Sentry/UptimeRobot verification; no exhaustive audit of every API route.

## Risk & impact assessment

- **Runbook / synthetic monitoring mismatch** lengthens MTTD/MTTR for database and credential incidents; authenticated surfaces can be down while `/api/health` stays green.
- **Cron misconfiguration** degrades lifecycle email, digest, refresh, and rate-limit cleanup with delayed discovery if teams rely on Sentry alone.
- **Admin billing-sync** failures affect a narrow operator/support audience but are hard to correlate without exception telemetry.

## Recommendations (prioritized)

1. **Update `docs/runbooks/incident-response.md` §3** — Remove or rewrite the **503 on `/api/health`** premise; align database recovery bullets with §2 and the implementation in `app/app/api/health/route.ts`. If product needs a readiness URL, document it separately and update monitoring tables.
2. **Alerting contract** — Either add Neon/synthetic checks beyond liveness `/api/health`, or explicitly document acceptance that external uptime is **process liveness only** and DB outages are detected elsewhere.
3. **`CRON_SECRET` operations** — Add to `docs/setup/manual-steps.md` (Vercel env checklist); consider Sentry warning or deploy-time assertion parity with billing secrets; monitor cron **500** responses in Vercel logs.
4. **Admin billing-sync** — Add `Sentry.captureException` in the outer `catch` with `extra` context (target user id, admin action) or rethrow to a path that reports consistently.

## Task candidates (optional)

- [ ] Align `docs/runbooks/incident-response.md` §3 with liveness-only `/api/health`.
- [ ] Add Sentry (or narrower error handling) for `app/app/api/admin/users/[id]/billing-sync/route.ts` failures.
- [ ] Document `CRON_SECRET` in `docs/setup/manual-steps.md` and/or add observability when the secret is missing at runtime.
- [ ] Close **SEC-SHIP-3** in `docs/tasks.md` via the listed read/export routes.

## Re-test checklist

- [ ] Table-top: Neon unreachable — verify documented URLs and monitors match actual signals.
- [ ] After any admin billing-sync instrumentation change — simulate failure and confirm Sentry receives an event.
- [ ] `npm run check` (when application code changes)

## Next trigger and cadence

- **Trigger:** Changes to `/api/health`, cron configuration, `app/proxy.ts`, Sentry, or production env requirements; otherwise **quarterly** or pre-release.
- **Suggested next window:** **2026-07-30** (quarterly) or the next focused reliability review.
