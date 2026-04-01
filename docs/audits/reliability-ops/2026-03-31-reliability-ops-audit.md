# Reliability & Operations Audit — 2026-03-31

## Executive summary

- **Failure handling and observability** are strong on the server: Sentry is wired via `instrumentation.ts` (`onRequestError`), Next config wrapper, client init, segment error UI in `app/(app)/error.tsx`, and targeted captures on billing sync, Stripe webhook user-resolution gaps, contact (Resend), and CSP reports.
- **Operational docs and health** are in good shape: `GET /api/health` probes the database, `docs/runbooks/incident-response.md` documents rollback, monitors, and recovery, and optional smoke guidance lives in `docs/runbooks/health-check-smoke.md`.
- **Release confidence** depends on Vercel for production builds; GitHub Actions runs lint and unit tests only — consistent with `docs/qa/test-infrastructure-review.md` but leaves build/type regressions to deploy time unless caught locally.
- **Recommendation:** Address **degraded-mode visibility** where the client silently ignores billing sync failures, and consider **Sentry (or sampled logging) for RentCast upstream failures** if third-party outage triage becomes painful.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Client billing sync failures are silent** — `app/(app)/app-layout-client.tsx` calls `fetch("/api/billing/sync")` and uses `.catch(() => {})` with no logging, Sentry, or user-visible signal. Network errors or repeated non-JSON responses do not update `sessionStorage`, so behavior is “fail open” without ops visibility; subscription downgrades that depend on this path may lag until webhook or manual refresh. — *Evidence:* `app/app/(app)/app-layout-client.tsx` (effect ~lines 75–99)

- **RentCast upstream failures are user-visible but not centrally tracked** — `app/app/api/estimates/rent/route.ts` (and sibling value/benchmark paths using the same pattern) catch errors and return `rentCastErrorResponse` (502) without `Sentry.captureException`. Provider outages or systematic 5xx are visible only via Vercel logs unless something else throws. — *Evidence:* `app/app/api/estimates/rent/route.ts` (catch block ~lines 118–122); `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts` (same pattern)

### Low

- **`(app)/error.tsx` reports during render** — `Sentry.captureException(error)` runs in the component body, not `useEffect`. In React Strict Mode (development), this can double-fire compared to a single effect; production impact is usually minor but event volume/noise can differ from `global-error.tsx`. — *Evidence:* `app/app/(app)/error.tsx`

- **`global-error.tsx` gates Sentry on `NEXT_PUBLIC_SENTRY_DSN`** — Capture runs inside `useEffect` only when the public DSN env is set, while the app segment boundary calls `captureException` unconditionally (SDK typically no-ops without DSN). Slight inconsistency in explicit gating only. — *Evidence:* `app/app/global-error.tsx`

- **Health check DB failure is console-only** — `app/app/api/health/route.ts` logs with `console.error` on failure and returns 503; no Sentry hook (may be intentional to avoid monitor-driven noise). — *Evidence:* `app/app/api/health/route.ts`

- **Stripe webhook signature verification failures are not explicitly sent to Sentry** — Invalid/missing signature paths `console.error` and return 400; triage relies on logs or generic request error reporting. — *Evidence:* `app/app/api/billing/webhook/route.ts` (~lines 18–37)

## Evidence reviewed

- Process: `docs/process/reliability-ops-audit-process.md`
- Reference: `docs/architecture-and-build-practices.md` (§2.6 Observability), `docs/setup/manual-steps.md` (hosting, Stripe guard, support)
- Runbooks: `docs/runbooks/incident-response.md`, `docs/runbooks/health-check-smoke.md`
- CI / deploy posture: `.github/workflows/ci.yml`, `docs/qa/test-infrastructure-review.md` (§3.5 CI vs build), `app/package.json` (`check` script)
- Env / deploy guard: `app/lib/env.ts` (`assertStripeWebhookSecretForVercelDeploy`), `app/instrumentation.ts`
- Error boundaries / global fallback: `app/app/(app)/error.tsx`, `app/app/global-error.tsx`
- Sentry usage (grep-backed): `(app)/error.tsx`, `global-error.tsx`, `app/app/api/billing/sync/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/api/contact/route.ts`, `app/app/api/csp-report/route.ts`, `app/next.config.ts` (`withSentryConfig`), `app/instrumentation-client.ts`
- Health: `app/app/api/health/route.ts`
- Degraded / background fetch: `app/app/(app)/app-layout-client.tsx`
- Loading UX: `app/app/(app)/*/loading.tsx` (dashboard, properties, deals, settings, plans, modeling, mortgage, analyze, admin)
- Stripe webhook handler (idempotency note, user-resolution warning): `app/app/api/billing/webhook/route.ts`

**Limits:** No live checks of Sentry project settings, Vercel deployment history, UptimeRobot, or production log samples. No exhaustive audit of every API route’s error handling.

## Risk & impact assessment

Unresolved **medium** items mainly affect **time-to-detect** and **stale billing UI** when the periodic client sync fails or when RentCast is degraded: users may see correct server state only after navigation, webhook, or support intervention. Likelihood rises with network instability or third-party incidents; exposure is bounded by webhooks still driving authoritative subscription updates for many paths.

## Recommendations (prioritized)

1. **Harden client billing sync** — On non-OK `fetch`, log a structured client event or call Sentry from the client (or omit `sessionStorage` update and retry with backoff) so failures are visible; optionally show a dismissible banner when sync fails repeatedly.
2. **Add observability for RentCast 502 paths** — Use `Sentry.captureException` or a shared helper with tags (`area: rentcast`, route name) and light sampling if volume is a concern.
3. **Keep CI/deploy story explicit** — Continue documenting that `npm run check` (build + lint) is pre-merge discipline; optionally add a non-blocking or scheduled workflow build if build regressions become frequent.

## Task candidates (optional)

- [ ] In `app/app/(app)/app-layout-client.tsx`, handle failed `/api/billing/sync` (non-OK `res`, `catch`) with Sentry or structured logging and avoid silent swallow.
- [ ] Add Sentry (or sampled capture) on RentCast upstream failures in `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, and `app/app/api/properties/[id]/benchmark/refresh/route.ts`.
- [ ] Optionally move `Sentry.captureException` in `app/app/(app)/error.tsx` into `useEffect` to align with React 19 / Strict Mode expectations.

## Re-test checklist

- [ ] After any billing-sync change: verify paid user still downgrades when Stripe shows canceled and sync succeeds; verify failure path does not break layout.
- [ ] After RentCast observability change: trigger a controlled upstream failure in staging and confirm events appear in Sentry (or chosen sink).
- [ ] `npm run check` when code changes ship from this audit.

## Next trigger and cadence

- **Trigger:** Infra or monitoring change, major billing/RentCast work, or pre-launch hardening.
- **Recommended next run:** Within one month or after the next production incident review.
