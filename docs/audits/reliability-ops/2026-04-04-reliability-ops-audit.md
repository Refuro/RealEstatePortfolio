# Reliability & Operations Audit — 2026-04-04

## Executive summary

- **Overall:** The stack's reliability posture is meaningfully stronger than the 2026-04-03 baseline. All three previously-open non-optional items (Sentry environment conflation, `(app)/error.tsx` render-time capture, and the webhook unresolved-user test) are **confirmed resolved in code**. No Critical or High findings remain.
- **Top remaining gaps:** PostHog server-side failures are invisible in Sentry (console log only); `/api/health` DB failures lack a Sentry signal; client API calls are universally single-shot with no automatic retry.
- **Dependency resilience:** RentCast adapter has 15s timeouts and graceful 502 degradation; Stripe sync degrades gracefully to current tier on failure; Stripe webhook explicitly warns on user-resolution failure; billing-affecting DB operations are transactional. These are the highest-risk paths and are adequately instrumented.
- **Recommendation:** Address PostHog observability gap (Medium) before a high-traffic launch; the two Low optional items (root error boundary, health `gitSha`) remain valid backlog but are not urgent.

---

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **PostHog server capture failures are invisible in Sentry** — `captureServerEvent` in `app/lib/posthog-server.ts` (lines 28–36) catches all errors and emits a single structured `console.error` with `action: posthog_capture_error`. No `Sentry.captureException` or `captureMessage` is called. A PostHog outage, invalid API key, or wrong host (`NEXT_PUBLIC_POSTHOG_HOST`) will silently drop all server-side analytics events (Stripe webhook subscription events, billing sync, etc.) for the duration. **Risk:** prolonged analytics gap goes undetected in Sentry; product/activation decisions may be based on missing data. **Evidence:** `app/lib/posthog-server.ts` lines 28–36.

- **`/api/health` DB failures produce no Sentry signal** — `app/app/api/health/route.ts` (lines 15–20) logs with `console.error("Health check DB error:", err)` and returns `503`, but does not call `Sentry.captureException`. External monitors (UptimeRobot on `GET /api/health`, see `docs/runbooks/incident-response.md`) will alert, but teams operating primarily from Sentry lack a grouped "DB unreachable" issue for correlation with other error spikes. **Risk:** slower incident triage; ops ergonomics gap only. **Evidence:** `app/app/api/health/route.ts` lines 14–21.

- **Client API calls are universally single-shot with no retry** — UI data fetches and background calls (billing sync on app load, property form saves, import/export) use a single `fetch` with no retry or backoff. Transient network blips yield empty states or one-off errors that require manual user retry. Billing-related components include user-facing retry messaging; data fetch components generally do not. **Risk:** unnecessary support burden and perceived flakiness on mobile networks; no data loss, only UX friction. **Evidence:** pattern observed across `app/app/(app)/` page components and route handlers; billing copy in `app/components/pricing-cards.tsx` and `app/components/billing-portal-button.tsx` is more explicit than general data paths.

### Low

- **No root-segment `app/app/error.tsx`** — Only `app/app/(app)/error.tsx` and `app/app/global-error.tsx` are present. Public marketing and legal routes (outside the `(app)` segment) rely on `global-error.tsx` as sole backstop for uncaught render errors. The backstop is functionally adequate and does call Sentry. **Risk:** minor UX difference (full-page reload needed vs. in-segment recovery); the gap is undocumented in runbooks. **Evidence:** glob `app/app/error.tsx` → 0 results; `app/app/(app)/error.tsx` and `app/app/global-error.tsx` confirmed present.

- **Health JSON has no deploy identity** — `/api/health` returns only `{ status, database }`. No `VERCEL_GIT_COMMIT_SHA` or deploy correlation field is exposed. **Risk:** slower mapping from a health alert to a specific deployment during incidents; ops quality gap only. **Evidence:** `app/app/api/health/route.ts` lines 10–22.

- **Sentry coverage is uneven across thin API routes** — High-value routes (properties, deals, estimates, billing, contact, account/delete) use explicit `Sentry.captureException` with tags and `extra` context in their `catch` blocks. Thin routes (`app/app/api/me/route.ts`, `app/app/api/portfolio/summary/route.ts`) have no explicit try/catch and rely on the framework `onRequestError = Sentry.captureRequestError` wired in `instrumentation.ts`. **Risk:** low—unhandled exceptions still reach Sentry via `onRequestError`; tagging and `extra` context are thinner for these routes. **Evidence:** `instrumentation.ts` line 18; `app/app/api/me/route.ts` (no try/catch); `app/app/api/estimates/rent/route.ts` (explicit capture with tags).

---

## Resolved items (confirmed this pass)

The following items were **open Schedule/Medium findings** in `2026-04-03-reliability-ops-audit-2.md` and are **confirmed resolved**:

| Finding | Resolution | Evidence |
|---------|-----------|---------|
| Sentry `NODE_ENV` environment conflation | All four init paths now use `VERCEL_ENV` / `NEXT_PUBLIC_VERCEL_ENV` with `NODE_ENV` fallback | `sentry.server.config.ts` line 7, `sentry.edge.config.ts` line 7, `sentry.client.config.ts` lines 14–17, `instrumentation-client.ts` lines 12–14 |
| `(app)/error.tsx` render-time Sentry capture | `captureException` moved into `useEffect([error])` with DSN guard; matches `global-error.tsx` pattern | `app/app/(app)/error.tsx` lines 14–18 |
| Webhook unresolved-user path: no test coverage | Test added: "returns 200 without DB writes when app user cannot be resolved" covers `user.findFirst → null`, `metadata: {}`, asserts HTTP 200 + `captureMessage` with `could not resolve app user` warning | `app/app/api/billing/webhook/route.test.ts` lines 155–192 |

---

## Evidence reviewed

| Area | Paths / artifacts |
|------|-------------------|
| Process & template | `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md` |
| Architecture / ops context | `docs/architecture-and-build-practices.md` §2.6, `docs/setup/manual-steps.md` |
| Runbooks | `docs/runbooks/incident-response.md`, `docs/runbooks/health-check-smoke.md` |
| Error boundaries | `app/app/global-error.tsx`, `app/app/(app)/error.tsx` (glob for root `app/app/error.tsx` → 0 files) |
| Sentry init (all 4) | `app/sentry.server.config.ts`, `app/sentry.edge.config.ts`, `app/sentry.client.config.ts`, `app/instrumentation-client.ts` |
| Sentry server hook | `app/instrumentation.ts` (`register`, `onRequestError`) |
| Health endpoint | `app/app/api/health/route.ts` |
| Billing resilience | `app/app/api/billing/webhook/route.ts` (full), `app/app/api/billing/webhook/route.test.ts` (full), `app/app/api/billing/sync/route.ts` |
| RentCast adapter | `app/lib/integrations/rentcast.ts` (timeout, status handling, error surfacing) |
| RentCast routes | `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts` |
| Analytics reliability | `app/lib/posthog-server.ts` |
| Account operations | `app/app/api/account/delete/route.ts` |
| Contact form | `app/app/api/contact/route.ts` |
| Thin API routes (sample) | `app/app/api/me/route.ts`, `app/app/api/portfolio/summary/route.ts` |
| Prior audit | `docs/audits/reliability-ops/2026-04-03-reliability-ops-audit-2.md` |

**Assumptions / limits:** Static review only — no production Sentry project, Vercel logs, or chaos/load testing. Dependency behaviour (Neon, Stripe, Clerk SLAs) inferred from code paths and docs. No new feature code from active plans (refinance, calculators) was shipped at audit time.

---

## Risk & impact assessment

| Finding | Likelihood | User / ops impact |
|---------|-----------|-------------------|
| PostHog server capture failures | Occasional (key rotation, host misconfiguration, PostHog outage) | Analytics gap; no user-facing outage; product decisions skewed |
| Health DB outage — no Sentry signal | When DB is unreachable | High user impact; mitigated by external UptimeRobot monitor; Sentry gap is ops ergonomics only |
| No client retry | Common on mobile/flaky networks | UX friction, support tickets; no data loss; user can retry manually |
| No root `app/app/error.tsx` | Low (public pages rarely throw uncaught render errors) | Full-page error on public routes; `global-error.tsx` backstop is functional |
| Health no `gitSha` | Constant (every request) | Slower deploy correlation during incidents; ops ergonomics only |
| Sentry coverage uneven on thin routes | Per-error (low base rate on thin routes) | Slightly reduced Sentry context; `onRequestError` still fires |

---

## Recommendations (prioritized)

1. **PostHog observability:** In `captureServerEvent`, add `Sentry.captureException` (or `captureMessage` with `level: "warning"`) inside the `catch` block, gated on `process.env.NEXT_PUBLIC_SENTRY_DSN` and optionally sampled. Add a "PostHog / analytics outage" subsection to `docs/runbooks/incident-response.md` documenting how to detect the failure (check `posthog_capture_error` in Vercel logs or Sentry warning).
2. **Health / DB Sentry signal:** Either add a one-line `Sentry.captureException` in the health `catch` block (acceptable since the health endpoint is polled infrequently) or add a documented note to `docs/runbooks/incident-response.md` clarifying that DB-down signals come from UptimeRobot + Vercel logs, not Sentry.
3. **Client retry (optional):** For high-value background calls (billing sync, import), consider a single `5xx`/network-error retry with short jitter. Document the intentional single-shot behaviour for all other data fetches so future contributors do not inadvertently assume retry logic exists.
4. **Root error boundary (optional):** Add a lightweight `app/app/error.tsx` that matches the `(app)/error.tsx` style, or add a note to `docs/runbooks/incident-response.md` explaining that public routes rely on `global-error.tsx`.
5. **Health `gitSha` (optional):** Append `gitSha: process.env.VERCEL_GIT_COMMIT_SHA` to the health JSON response in non-development environments.

---

## Task candidates

- [ ] `app/lib/posthog-server.ts`: add `Sentry.captureException` (or `captureMessage` warning) on `capture`/`shutdown` failure, gated on Sentry DSN. Update runbook with PostHog outage detection steps.
- [ ] `docs/runbooks/incident-response.md`: add PostHog analytics outage subsection (symptoms, check `posthog_capture_error` in logs).
- [ ] `app/app/api/health/route.ts`: add Sentry capture on DB failure, **or** document in runbook that DB-down signals come from UptimeRobot/Vercel only (pick one, not both).
- [ ] Optional: add root `app/app/error.tsx` or document public-route boundary behaviour in runbook.
- [ ] Optional: append `gitSha: process.env.VERCEL_GIT_COMMIT_SHA` to health JSON in non-dev environments.

---

## Re-test checklist

- [ ] After PostHog change: simulate failure (invalid key or bad host) in staging; confirm Sentry warning or documented log signal appears as expected.
- [ ] After health change: simulate DB failure or document Sentry gap; confirm incident-response runbook accurately describes the signal path.
- [ ] `npm run check` (when code changes are made).
- [ ] Regression: existing webhook tests (`route.test.ts`) remain green after any billing changes.

---

## Next trigger and cadence

- **Trigger:** After any observability change (Sentry, PostHog, health endpoint), major billing or third-party integration change, or before a high-traffic launch.
- **Recommended next run:** **2026-07-04** (quarterly), or sooner if PostHog/Sentry instrumentation or a new third-party dependency is added.
