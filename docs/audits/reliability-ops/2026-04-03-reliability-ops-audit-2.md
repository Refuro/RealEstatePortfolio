# Reliability & Operations Audit — 2026-04-03 (Run 2)

## Executive summary

- **Overall:** The stack remains operationally coherent. No new regressions were introduced since this morning's audit. The webhook user-resolution fix (dual-lookup via `stripeCustomerId` and `metadata.appUserId`) is confirmed in place and has targeted test coverage for the mismatch path.
- **Schedule items still open:** Both items promoted to Schedule this morning — Sentry `VERCEL_ENV` environment tagging and `(app)/error.tsx` render-time capture — remain unresolved in code. These are the only items requiring developer action.
- **Webhook Ship item verified:** `resolveAppUserIdForSubscription` now prefers DB `stripeCustomerId` lookup over subscription metadata; test coverage confirms the mismatch path. One edge case (both lookups fail) has no automated test.
- **Recommendation:** Ship the two Schedule items (Sentry env + error.tsx useEffect) before the next marketing push; add a single test for the fully-unresolved webhook path to close the coverage gap.

---

## Severity-ranked findings

### Critical

- None.

### High

- **Sentry environment conflation — OPEN Schedule item** — All four Sentry init paths still set `environment: process.env.NODE_ENV`. On Vercel, preview and production deployments both report `NODE_ENV=production`, so incidents and alerts from preview are indistinguishable from production in Sentry. No change since this morning. **Evidence:** `app/sentry.client.config.ts` (line 6), `app/sentry.server.config.ts` (line 6), `app/sentry.edge.config.ts` (line 6), `app/instrumentation-client.ts` (line 11).

### Medium

- **`(app)/error.tsx` Sentry capture during render — OPEN Schedule item** — `Sentry.captureException(error)` is called unconditionally in the render body (line 14), not inside a `useEffect`. Under React Strict Mode this triggers on every remount pass, risking duplicate Sentry events. `global-error.tsx` correctly wraps the capture in `useEffect([error])` — the two boundaries are inconsistent. No change since this morning. **Evidence:** `app/app/(app)/error.tsx` lines 13–15; contrast with `app/app/global-error.tsx` lines 13–17.

- **Webhook fully-unresolved-user path: no test coverage** — When both `customerUserId` (via `stripeCustomerId` DB lookup) and `metadataAppUserId` are null, `syncSubscriptionToDb` logs a Sentry warning and returns early; the outer `POST` still responds `{ received: true }` with HTTP 200. Stripe will not retry. The fix (dual-lookup) is correct and reduces the frequency of this scenario, but there is no automated test that covers the zero-resolution case. Manual validation of the silent-pass behaviour is not guaranteed to persist through future refactors. **Evidence:** `app/app/api/billing/webhook/route.ts` lines 132–149, `app/app/api/billing/webhook/route.test.ts` (no test exercises both-null path).

### Low

- **Root `app/error.tsx` absent — Optional item** — No `app/error.tsx` exists at the root `app` segment. Public routes outside `(app)` (e.g. marketing, legal) fall through directly to `global-error.tsx`. This remains an acknowledged gap noted in the morning audit; the `global-error.tsx` backstop is adequate, but the boundary is undocumented in runbooks. **Evidence:** glob `app/app/error.tsx` → 0 files; `app/app/global-error.tsx` confirmed present.

- **Health check no build identity** — `/api/health` still returns only `{ status, database }`. No `VERCEL_GIT_COMMIT_SHA` or equivalent deploy correlation field. Unchanged from morning. **Evidence:** `app/app/api/health/route.ts`.

---

## Evidence reviewed

| Area | Reviewed |
|------|----------|
| Morning audit | `docs/audits/reliability-ops/2026-04-03-reliability-ops-audit.md` |
| Process / template | `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md` |
| Sentry init (all 4) | `app/sentry.client.config.ts`, `app/sentry.server.config.ts`, `app/sentry.edge.config.ts`, `app/instrumentation-client.ts` |
| Sentry instrumentation | `app/instrumentation.ts` (`register`, `onRequestError = Sentry.captureRequestError`) |
| Error boundaries | `app/app/(app)/error.tsx`, `app/app/global-error.tsx`, glob for `app/app/error.tsx` (absent) |
| Stripe webhook | `app/app/api/billing/webhook/route.ts` (full), `app/app/api/billing/webhook/route.test.ts` (full) |
| Health endpoint | `app/app/api/health/route.ts` |
| Supporting docs | `docs/security/security-notes.md`, `docs/internal/billing-matrix.md` |

**Assumptions / limits:** No production runtime or Sentry project settings inspected. Webhook behaviour inferred from code + test suite. No chaos or load testing performed.

---

## Risk & impact assessment

| Finding | Likelihood | User / ops impact |
|---------|-----------|-------------------|
| Sentry `NODE_ENV` tagging | Constant (every preview deploy) | Reduced signal quality during incident triage; preview noise in prod alerts |
| `(app)/error.tsx` render capture | Triggered on every (app) error page render under Strict Mode | Duplicate Sentry events inflate error counts; may mask real frequency |
| Webhook unresolved-user no test | Low (both lookups fail only on metadata+customer misconfiguration) | Entitlement drift without Stripe retry; silent data gap until client sync |
| No root `app/error.tsx` | Low (public pages rarely throw uncaught errors) | Full-page error on public route falls through to `global-error.tsx` backstop |
| Health check no version | Constant | Slower deploy correlation during incidents; ops quality gap only |

---

## Recommendations (prioritized)

1. **Sentry `VERCEL_ENV`:** In all four Sentry `init` calls, replace `environment: process.env.NODE_ENV` with `environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV`. This separates `production`, `preview`, and `development` cleanly in Sentry with zero risk.
2. **`(app)/error.tsx` useEffect:** Wrap `Sentry.captureException(error)` in a `useEffect([error])` to match `global-error.tsx`, eliminating duplicate captures under Strict Mode.
3. **Webhook unresolved-user test:** Add a Vitest case to `route.test.ts` that mocks `user.findFirst` to return `null` and sets `metadata.appUserId` to `undefined`/empty — assert HTTP 200 is returned and `captureMessageMock` is called with the "could not resolve app user" warning. This pins the silent-pass behaviour intentionally.
4. **Public-route error boundary:** Either add `app/app/error.tsx` as a lightweight root-segment boundary or add a "Public routes & error boundaries" note to `docs/runbooks/incident-response.md` clarifying that public pages fall through to `global-error.tsx`. Low urgency but closes the documentation gap.
5. **Health build identity (Optional):** Append `gitSha: process.env.VERCEL_GIT_COMMIT_SHA` to the health JSON in non-development environments to aid deploy correlation during incidents.

---

## Task candidates

- [ ] Sentry: use `VERCEL_ENV ?? NODE_ENV` for `environment` in all four init files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation-client.ts`).
- [ ] `app/(app)/error.tsx`: move `Sentry.captureException(error)` into `useEffect([error])`.
- [ ] `app/app/api/billing/webhook/route.test.ts`: add test for fully-unresolved-user path (both lookups null) — assert HTTP 200 + Sentry warning.
- [ ] Optional: add root `app/error.tsx` or document public-route error boundary in runbooks.
- [ ] Optional: append `gitSha` to `/api/health` JSON for ops correlation.

---

## Re-test checklist

- [ ] After Sentry env change: verify distinct `production` vs `preview` environments appear in Sentry after next preview + production deploy.
- [ ] After `error.tsx` useEffect change: trigger an error in an `(app)` route under Strict Mode — confirm single Sentry event per error, not two.
- [ ] After webhook test addition: `npm run check` passes; new test exercises the both-null user-resolution path.
- [ ] Regression: existing webhook tests (`route.test.ts`) remain green after any changes.

---

## Next trigger and cadence

- **Trigger:** After any of the above Schedule items are shipped, or before a major marketing launch / billing configuration change.
- **Recommended next run:** **2026-07-03** (quarterly) unless a Sentry config change, billing system change, or traffic spike warrants an earlier pass.
