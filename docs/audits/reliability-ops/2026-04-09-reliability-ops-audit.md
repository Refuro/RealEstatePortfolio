# Reliability & Operations Audit — 2026-04-09

## Executive summary

- **Overall:** Error boundaries, Sentry wiring, Stripe webhook hardening, and Vercel cron routing are in solid shape for the paths reviewed. Clerk `proxy.ts` allowlists all seven `vercel.json` cron paths plus `/api/billing/webhook`, `/api/health`, and other public integrations, so scheduled jobs are not blocked by auth middleware.
- **Top risks:** Misconfigured **`CRON_SECRET`** fails crons at first invocation with **`console.error` only** (no `Sentry.captureException`), delaying detection unless Vercel Cron UI or log scraping is watched. **`GET /api/health`** returns **503** with **`console.error`** on DB errors but does not emit Sentry—reliance on UptimeRobot (per runbook) is explicit but not redundant with error tracking.
- **Ops docs:** `docs/runbooks/incident-response.md` covers Vercel rollback, DB migration rollback options, health monitoring, Sentry/CSP, and degradation playbooks for PostHog, Resend, RentCast, Google Places, Clerk, and Stripe.
- **Recommendation:** Add **observability for cron misconfiguration** (Sentry warning with stable tag, or Vercel alert on cron 500s) and optionally **`CRON_SECRET` deploy-time validation** parity with Stripe webhook secret checks; keep treating **`NEXT_PUBLIC_SENTRY_DSN`** as required in production checklists despite the startup warning in `instrumentation.ts`.

## Severity-ranked findings

### Critical

- No critical reliability defects identified in this pass (cron allowlist and Stripe webhook processing error path were verified against current tree).

### High

- **Cron secret misconfiguration is invisible to Sentry** — If `CRON_SECRET` is unset, cron handlers return **500** after `console.error("CRON_SECRET is not configured")` without `Sentry.captureException`, so operators may not see grouped errors in Sentry. Affects all scheduled jobs in `vercel.json`. — *Evidence:* `app/app/api/cron/onboarding-emails/route.ts` (lines 28–33); same pattern in `app/app/api/cron/trial-emails/route.ts`, `rate-limit-cleanup`, `milestone-emails`, `monthly-refresh`, `monthly-digest`, `winback-emails` (see repository search for `CRON_SECRET is not configured`).

### Medium

- **Health check DB failures are log-only in-app** — `GET /api/health` catches DB errors, logs with `console.error`, returns **503** JSON, but does not call Sentry. Detection depends on external uptime tooling or log review as documented in the runbook. — *Evidence:* `app/app/api/health/route.ts` (lines 8–20).
- **`CRON_SECRET` is not part of `validateEnv()` / deploy assertions** — Unlike `STRIPE_WEBHOOK_SECRET` (guarded via `assertStripeWebhookSecretForVercelDeploy()` in `app/instrumentation.ts`), missing cron secret surfaces only when a job runs. — *Evidence:* `app/lib/env.ts` (`REQUIRED_ENV_VARS`, lines 7–24); `app/instrumentation.ts` (lines 7–9).
- **Unguarded read-style API routes (backlog)** — `docs/tasks.md` still tracks **SEC-SHIP-3** (try/catch + Sentry on unguarded read routes). This pass did not exhaustively enumerate every `GET` handler; treat as residual coverage gap until closed. — *Evidence:* `docs/tasks.md` (SEC-SHIP-3 entry).

### Low

- **Sentry trace sampling is code-fixed outside development** — `tracesSampleRate: 0.1` when `NODE_ENV !== "development"` in server and client Sentry init; raising sampling during an incident requires a deploy or env-driven toggle (not present). — *Evidence:* `app/sentry.server.config.ts` (lines 3–9); `app/instrumentation-client.ts` (lines 6–16).
- **Client and boundary capture still gate on `NEXT_PUBLIC_SENTRY_DSN`** — Server init and `global-error.tsx` / `(app)/error.tsx` only call `captureException` when DSN is set; production without DSN relies on logs. A **startup warning** mitigates silent omission. — *Evidence:* `app/sentry.server.config.ts` (lines 3–10); `app/app/global-error.tsx` (lines 13–16); `app/app/(app)/error.tsx` (lines 14–17); `app/instrumentation.ts` (lines 10–12).

## Evidence reviewed

- **Process / template:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Reference docs:** `docs/architecture-and-build-practices.md` (§2.6 observability), `docs/setup/manual-steps.md` (hosting, env, Stripe, monitoring)
- **Runbooks:** `docs/runbooks/incident-response.md`; also noted `docs/launch/seo-phase-5-6-runbook.md`, `docs/launch/paid-ads-monitoring-runbook.md` (domain-specific ops)
- **Deploy / schedule:** `vercel.json` (cron paths); `app/proxy.ts` (public route matcher vs crons and webhooks)
- **Instrumentation:** `app/instrumentation.ts`, `app/instrumentation-client.ts`, `app/sentry.server.config.ts`, `app/sentry.edge.config.ts`, `app/sentry.client.config.ts`, `app/next.config.ts` (Sentry wrapper per grep)
- **Failure UX:** `app/app/global-error.tsx`, `app/app/(app)/error.tsx`
- **Representative API / jobs:** `app/app/api/health/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/app/api/cron/onboarding-emails/route.ts`
- **Client resilience:** `app/app/(app)/app-layout-client.tsx` (billing sync `fetch` + Sentry on non-OK and network error)
- **Backlog cross-check:** `docs/tasks.md` (RELI-0409-1 implemented in tree; SEC-SHIP-3 still open)

**Limits:** Not every API route was opened; retry semantics for third-party SDKs were not systematically traced. Audit is read-only per process (no changes under `app/`).

## Risk & impact assessment

- **Cron + health gaps** affect **mean time to detect** and **operator confidence** more than immediate user-visible outages; user impact shows up as **missing emails**, **stale digests/refreshes**, or **delayed rate-limit cleanup** if jobs fail silently from the operator’s perspective.
- **Stripe webhook** failures still return **500** (Stripe retries) **with Sentry capture** in the outer handler—billing integrity and visibility are aligned.
- **Likelihood** of `CRON_SECRET` drift is moderate in multi-env setups without staging parity checks; health **503** likelihood is low but high-severity when it occurs.

## Recommendations (prioritized)

1. **Emit a Sentry event (e.g. level warning) when `CRON_SECRET` is missing** at cron handler entry, with a stable tag such as `cron_misconfigured`, **or** add a Vercel monitor/alert on cron HTTP **500** responses—so mis-deploys surface in the same tooling as application errors.
2. **Optionally assert `CRON_SECRET` on Vercel production** (non-throwing log + Sentry, or documented exception if serverless cron is unused) to match the fail-fast posture used for Stripe webhook configuration.
3. **Decide on `/api/health` alerting contract:** keep **UptimeRobot-only** (already documented) **or** add a Sentry capture on DB failure to correlate infra incidents with error tracking—document the chosen contract in `docs/runbooks/incident-response.md` if extended.
4. **Close SEC-SHIP-3** or scope it with an explicit inventory of remaining read routes so “unguarded GET” is not an open-ended reliability unknown.

## Task candidates (optional)

- [ ] Add `Sentry.captureMessage` or `captureException` when cron handlers detect missing `CRON_SECRET` (tagged for alerting).
- [ ] Add deploy-time or first-request warning for missing `CRON_SECRET` on Vercel production (align with `assertStripeWebhookSecretForVercelDeploy` policy).
- [ ] Resolve **SEC-SHIP-3** in `docs/tasks.md` with concrete route list and tests.

## Re-test checklist

- [ ] After any cron observability change: trigger a test cron (or simulate missing secret) and confirm Sentry/Vercel signals.
- [ ] After health/Sentry change: force DB disconnect in staging and confirm alerting path (Sentry and/or external monitor).
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After changes to `vercel.json` crons, `app/proxy.ts` public routes, Sentry configuration, health/cron handlers, or deploy env requirements; otherwise **quarterly** or before a major release.
- **Suggested next window:** **2026-07-09** (quarterly) or next production reliability review milestone.
