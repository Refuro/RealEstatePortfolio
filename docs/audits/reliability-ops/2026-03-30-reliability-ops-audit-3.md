# Reliability & Operations Audit — 2026-03-30 (Run 3)

## Executive summary

- **Overall:** Failure handling, observability, and ops documentation are in **good shape** for the current stack (Vercel, Neon, Clerk, Stripe, Sentry). Segment error boundaries, Sentry wiring, a DB-backed health probe, and `docs/runbooks/incident-response.md` form a coherent baseline.
- **Top risks:** Uneven **Sentry coverage** on some API failure paths (notably contact email), and **Stripe webhook replays** potentially duplicating **analytics** events (DB sync remains upsert-idempotent).
- **Recommendation:** Treat **contact delivery** and **webhook deduplication for side effects** as the main follow-ups; keep runbook and external monitoring aligned with domain and env changes.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **Contact form: Resend failures are not reported to Sentry** — On provider error, the route logs with `console.error` and returns HTTP 500; there is no `Sentry.captureException`, so outbound email outages may surface only in Vercel logs unless correlated manually. — `app/app/api/contact/route.ts` (Resend `error` branch).

- **Stripe webhook: no stored idempotency key for event replay** — Signature verification and Prisma **upserts** make subscription state updates safe to replay. **Side effects** (e.g. `captureServerEvent` on `customer.subscription.updated` / checkout completion) can still run more than once if Stripe redelivers the same `event.id`. — `app/app/api/billing/webhook/route.ts`.

### Low

- **`global-error.tsx` Sentry capture is DSN-gated** — `useEffect` reports only when `NEXT_PUBLIC_SENTRY_DSN` is set; `(app)/error.tsx` calls `captureException` unconditionally. Behavior is consistent with optional Sentry but differs by surface. — `app/app/global-error.tsx`, `app/app/(app)/error.tsx`.

- **Health check failures are stdout-only** — DB errors on `GET /api/health` use `console.error` without Sentry; appropriate for avoiding alert noise from probes, but **503** triage relies on Vercel logs or synthetic checks. — `app/app/api/health/route.ts`.

- **CI does not run production build or `/api/health` smoke** — Workflow runs **ESLint + Vitest** only; production build runs on Vercel per project docs. — `.github/workflows/ci.yml`, `docs/qa/test-infrastructure-review.md` (local `check` vs `test`).

- **`npm run check` omits unit tests** — Script is `build && lint`, not `test`; developers relying only on `check` can miss test regressions until CI. — `app/package.json`.

## Evidence reviewed

- **Process:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Architecture / setup:** `docs/architecture-and-build-practices.md` (§2.6 Observability), `docs/setup/manual-steps.md` (hosting, Stripe webhook, env)
- **Runbooks:** `docs/runbooks/incident-response.md`, `docs/launch/paid-ads-monitoring-runbook.md` (launch ops)
- **Error boundaries:** `app/app/(app)/error.tsx`, `app/app/global-error.tsx`
- **Sentry / instrumentation:** `app/instrumentation.ts` (`onRequestError`), `app/instrumentation-client.ts`, `app/next.config.ts` (Sentry wrapper)
- **Health:** `app/app/api/health/route.ts`, `app/proxy.ts` (public `/api/health`)
- **Webhooks / billing:** `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/sync/route.ts`
- **RentCast / estimates:** `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/lib/rentcast-route-errors.ts` (502 on upstream errors)
- **CI:** `.github/workflows/ci.yml`

## Risk & impact assessment

- **Contact + Sentry gap:** Affects **support channel reliability** and time-to-detect when Resend is misconfigured or degraded; core app availability is still reflected by `/api/health` and user-visible 500s.
- **Webhook analytics duplication:** Impacts **analytics accuracy** more than billing truth; financial state remains consistent due to transactional upserts.
- **Likelihood:** Contact misconfig is low after initial setup; Stripe replays are **expected** during incidents and should be assumed.

## Recommendations (prioritized)

1. **Add Sentry capture** (or a shared helper) on Resend failure in the contact route when DSN is configured, matching patterns in `docs/architecture-and-build-practices.md`.
2. **Document or implement idempotency** for webhook-driven analytics (e.g. store processed Stripe `event.id` with a short TTL, or dedupe in PostHog) if duplicate activation/subscription events become material.
3. **Keep CI vs local scripts explicit** — ensure contributors know `npm run test` / CI runs tests while `npm run check` does not.

## Task candidates (optional)

- [ ] `Sentry.captureException` on Resend error in `app/app/api/contact/route.ts` when DSN present
- [ ] Evaluate Stripe webhook idempotency for `captureServerEvent` paths (store `event.id` or document acceptance of duplicate analytics)
- [ ] Optional: CI smoke or documented script calling `/api/health` against staging

## Re-test checklist

- [ ] After contact-route changes: trigger Resend failure in a safe environment and confirm Sentry receives the event
- [ ] After webhook changes: verify subscription state still correct under Stripe test-mode replay
- [ ] `npm run check` and `npm run test` when code changes are made

## Next trigger and cadence

- **Trigger:** Monthly, or after changes to webhooks, health checks, CI, deployment targets, or observability tooling
- **Recommended next run:** **2026-04-30** (monthly) or next full audit cycle
