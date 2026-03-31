# Reliability & Operations Audit — 2026-03-30 (Run 5)

## Executive summary

- **Overall:** Error handling, observability, and ops documentation remain **strong** for the stack (Vercel, Neon, Clerk, Stripe, Sentry). Segment error boundaries, `onRequestError` in `instrumentation.ts`, DB-backed `/api/health`, runbooks for incidents and optional health smoke, and Stripe webhook DB upserts plus Sentry warnings for unmapped users continue to form a coherent baseline.
- **Improvement since Run 4:** The **contact form** Resend failure path now calls **`Sentry.captureException`** with tags (`area: contact`, `resend: send`), closing the prior observability gap for outbound email failures. — `app/app/api/contact/route.ts`.
- **Top remaining risk:** **Stripe webhook replays** can still duplicate **PostHog** server events (`captureServerEvent`); DB subscription sync remains upsert-idempotent. Behavior is **documented** in code comments, `docs/internal/stripe-webhook-posthog-idempotency.md`, and the webhook route header — implementation of deduplication is still optional.
- **Recommendation:** Treat **PostHog deduplication** (or explicit acceptance in analytics review) as the main follow-up if event fidelity matters; keep **`npm run check` vs `npm run test`** expectations clear for contributors.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **Stripe webhook: PostHog side effects not deduplicated by `event.id`** — Prisma upserts make subscription state safe to replay. `captureServerEvent` on `customer.subscription.updated`, `customer.subscription.deleted`, and `checkout.session.completed` can still run more than once when Stripe redelivers the same event. **Mitigation status:** Documented in `app/app/api/billing/webhook/route.ts` (comment block), `docs/internal/stripe-webhook-posthog-idempotency.md`, and architecture-aligned webhook warnings for unmapped users (`Sentry.captureMessage` in `syncSubscriptionToDb`). — Same files.

### Low

- **`global-error.tsx` Sentry capture is DSN-gated** — `useEffect` reports only when `NEXT_PUBLIC_SENTRY_DSN` is set; `(app)/error.tsx` calls `captureException` during render without that guard. Matches optional Sentry but differs by surface. — `app/app/global-error.tsx`, `app/app/(app)/error.tsx`.

- **Health check DB failures are stdout-only** — `GET /api/health` uses `console.error` without Sentry; reasonable to avoid noise from probes; **503** triage uses Vercel logs or external monitors. — `app/app/api/health/route.ts`.

- **CI does not run production build or `/api/health` smoke** — Workflow runs **ESLint + Vitest** only; production build runs on Vercel. Optional staging smoke is described in `docs/runbooks/health-check-smoke.md`. — `.github/workflows/ci.yml`, `docs/qa/test-infrastructure-review.md`.

- **`npm run check` omits unit tests** — Script is `build && lint`, not `test`. — `app/package.json`.

- **RentCast-backed estimate routes: no Sentry usage** — Upstream failures return structured JSON and HTTP codes via `rentCastErrorResponse` / `RentCastErrorCodes` (`app/lib/rentcast-route-errors.ts`); sustained upstream degradation may be visible only through user-visible errors and logs unless alerts are added separately. — `app/app/api/estimates/` (no `Sentry` imports found in this audit pass).

- **Webhook signature verification failures: `console.error` only** — Invalid signatures return 400 without Sentry; appropriate to limit noise from scanning traffic. — `app/app/api/billing/webhook/route.ts` (catch after `constructEvent`).

## Evidence reviewed

- **Process:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Prior audit (continuity):** `docs/audits/reliability-ops/2026-03-30-reliability-ops-audit-4.md`
- **Architecture / setup:** `docs/architecture-and-build-practices.md` (§2.6 Observability), `docs/setup/manual-steps.md` (hosting, Stripe webhook, env, CSP)
- **Runbooks:** `docs/runbooks/incident-response.md` (rollback, Vercel/Sentry/Neon/Stripe/Clerk, `/api/health`, UptimeRobot, CSP, support SLA), `docs/runbooks/health-check-smoke.md`
- **Internal ops docs:** `docs/internal/stripe-webhook-posthog-idempotency.md`
- **Error boundaries:** `app/app/(app)/error.tsx`, `app/app/global-error.tsx`
- **Sentry / instrumentation:** `app/instrumentation.ts` (`onRequestError`), `app/instrumentation-client.ts`, `app/next.config.ts` (`withSentryConfig`), `app/sentry.server.config.ts`, `app/sentry.edge.config.ts` (referenced; not fully re-read)
- **Health / proxy:** `app/app/api/health/route.ts`, `app/proxy.ts` (public `/api/health`, webhooks, contact)
- **Contact (updated):** `app/app/api/contact/route.ts` (Resend error path includes `Sentry.captureException`)
- **Webhooks / billing:** `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/sync/route.ts`
- **Upstream estimates:** `app/lib/rentcast-route-errors.ts`, `app/app/api/estimates/` (spot check: no Sentry)
- **CI:** `.github/workflows/ci.yml`

**Assumptions / limits:** Review-only; no code changes. No production smoke tests or live Stripe replays were executed; conclusions are from static review of the listed paths.

## Risk & impact assessment

- **PostHog duplicate events:** Affects **analytics accuracy** and funnel metrics more than billing or availability; DB subscription truth remains consistent.
- **RentCast without Sentry:** Affects **visibility** into third-party outages unless log-based monitoring is added; users receive explicit error JSON and status codes.
- **Likelihood:** Stripe replays are **expected** in production; RentCast outages depend on provider and quota.

## Recommendations (prioritized)

1. **If duplicate subscription lifecycle events in PostHog become material:** Implement stored **`event.id`** deduplication (or PostHog-side filtering), as outlined in `docs/internal/stripe-webhook-posthog-idempotency.md`.
2. **Keep contributor expectations explicit:** Document that **`npm run test`** (and CI) cover unit tests while **`npm run check`** runs build + lint only (`docs/qa/test-infrastructure-review.md` already supports this narrative).
3. **Optional:** Add **Sentry** (sampled or tagged) on RentCast upstream **502/503** paths if operator visibility into provider degradation is required beyond Vercel logs.

## Task candidates (optional)

- [ ] Evaluate implementing Stripe `event.id` deduplication for `captureServerEvent` (or confirm duplicate analytics acceptable with PM)
- [ ] Optional: sampled `Sentry.captureException` or `captureMessage` on RentCast upstream failures in estimate routes
- [ ] Optional: CI or post-deploy smoke calling staging `/api/health` per `docs/runbooks/health-check-smoke.md`

## Re-test checklist

- [ ] After PostHog/webhook changes: Stripe test-mode replay of the same `event.id` and verify analytics behavior
- [ ] After RentCast observability changes: simulate upstream failure and confirm Sentry or logs as expected
- [ ] `npm run check` and `npm run test` when code changes are made

## Next trigger and cadence

- **Trigger:** Monthly, or after changes to webhooks, health checks, CI, deployment targets, or observability tooling
- **Recommended next run:** **2026-04-30** (monthly) or next full audit cycle
