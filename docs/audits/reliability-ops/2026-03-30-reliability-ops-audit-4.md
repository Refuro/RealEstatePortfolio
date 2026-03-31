# Reliability & Operations Audit — 2026-03-30 (Run 4)

## Executive summary

- **Overall:** Resilience and operational posture remain **solid** for the current stack (Vercel, Neon, Clerk, Stripe, Sentry). Segment error boundaries, Sentry server/edge/client wiring, `onRequestError` in `instrumentation.ts`, a DB-backed `/api/health`, UptimeRobot guidance in the incident runbook, and webhook upserts for subscription state continue to form a coherent baseline.
- **Top risks (unchanged):** **Contact email** failures still lack Sentry reporting on the Resend error path; **Stripe webhook replays** can still duplicate **analytics** side effects (`captureServerEvent`) while DB subscription sync stays upsert-idempotent.
- **Documentation:** `docs/runbooks/incident-response.md` still covers rollback, log sources, health checks, external monitoring, CSP triage, and support inbox verification; launch ops add `docs/launch/paid-ads-monitoring-runbook.md` for campaign monitoring (orthogonal to core SRE but listed for completeness).
- **Recommendation:** Prioritize **Sentry on contact send failures** and **document or implement idempotency** for webhook-driven analytics; keep CI vs local script expectations explicit (`npm run check` vs `npm run test`).

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **Contact form: Resend failures are not reported to Sentry** — On provider error, the route logs with `console.error` and returns HTTP 500; there is no `Sentry.captureException`, so outbound email outages may surface only in Vercel logs unless correlated manually. — `app/app/api/contact/route.ts` (Resend `error` branch, lines 95–100).

- **Stripe webhook: no stored idempotency key for event replay** — Signature verification and Prisma **upserts** make subscription state updates safe to replay. **Side effects** (`captureServerEvent` on `customer.subscription.updated`, `customer.subscription.deleted`, and `checkout.session.completed`) can still run more than once if Stripe redelivers the same `event.id`. — `app/app/api/billing/webhook/route.ts`.

### Low

- **`global-error.tsx` Sentry capture is DSN-gated** — `useEffect` reports only when `NEXT_PUBLIC_SENTRY_DSN` is set; `(app)/error.tsx` calls `captureException` unconditionally. Behavior matches optional Sentry but differs by surface. — `app/app/global-error.tsx`, `app/app/(app)/error.tsx`.

- **Health check failures are stdout-only** — DB errors on `GET /api/health` use `console.error` without Sentry; appropriate for avoiding alert noise from probes, but **503** triage relies on Vercel logs or synthetic checks. — `app/app/api/health/route.ts`.

- **CI does not run production build or `/api/health` smoke** — Workflow runs **ESLint + Vitest** only; production build runs on Vercel per project docs. — `.github/workflows/ci.yml`, `docs/qa/test-infrastructure-review.md` (§3.5).

- **`npm run check` omits unit tests** — Script is `build && lint`, not `test`; developers relying only on `check` can miss test regressions until CI. — `app/package.json`.

## Evidence reviewed

- **Process:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Prior audit (continuity):** `docs/audits/reliability-ops/2026-03-30-reliability-ops-audit-3.md`
- **Architecture / setup:** `docs/architecture-and-build-practices.md` (§2.6 Observability), `docs/setup/manual-steps.md` (hosting, Stripe webhook, env)
- **Runbooks / launch ops:** `docs/runbooks/incident-response.md`, `docs/launch/paid-ads-monitoring-runbook.md`
- **QA / CI context:** `docs/qa/test-infrastructure-review.md`
- **Error boundaries:** `app/app/(app)/error.tsx`, `app/app/global-error.tsx`
- **Sentry / instrumentation:** `app/instrumentation.ts` (`onRequestError`), `app/instrumentation-client.ts`, `app/next.config.ts` (Sentry wrapper), `app/sentry.server.config.ts`, `app/sentry.edge.config.ts`
- **Health / edge:** `app/app/api/health/route.ts`, `app/proxy.ts` (public `/api/health`)
- **Webhooks / billing:** `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/sync/route.ts` (referenced for Sentry patterns)
- **Upstream estimates:** `app/lib/rentcast-route-errors.ts` (standard JSON + 502/503/429 for RentCast-backed routes)
- **CI:** `.github/workflows/ci.yml`

**Assumptions / limits:** This pass did not execute production smoke tests or live webhook replay; conclusions are based on static review of the listed paths. No code changes were made during the audit.

## Risk & impact assessment

- **Contact + Sentry gap:** Affects **detection and triage** when Resend is misconfigured or degraded; users still see 500s; core availability is still reflected by `/api/health`.
- **Webhook analytics duplication:** Impacts **analytics fidelity** more than billing truth; financial/subscription DB state remains consistent due to transactional upserts.
- **Likelihood:** Resend misconfiguration is most likely during initial setup; Stripe replays are **expected** during incidents and should be assumed for side effects.

## Recommendations (prioritized)

1. **Add Sentry capture** (or a shared helper) on Resend failure in the contact route when DSN is configured, consistent with `docs/architecture-and-build-practices.md` §2.6.
2. **Document or implement idempotency** for webhook-driven analytics (e.g. store processed Stripe `event.id` with TTL, or dedupe in PostHog) if duplicate activation/subscription events become material.
3. **Keep CI vs local scripts explicit** — contributors should know `npm run test` / CI runs tests while `npm run check` does not.

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
