# Reliability & Operations Audit — 2026-03-20

## Executive summary

- **Failure handling** is in solid shape for the authenticated shell: `app/(app)/error.tsx` reports to Sentry, and `instrumentation.ts` wires `onRequestError` for server/request failures. Billing checkout and sync routes emit **structured JSON logs** on Stripe errors.
- **Observability** includes Sentry (server/edge/client init + source maps via `next.config.ts`), a **DB-backed** `GET /api/health`, and external uptime monitoring documented in the incident runbook. Gaps remain for **some API failure paths** (e.g. contact email) that only use `console.error`.
- **Degraded-mode UX** is mixed: several app sections have `loading.tsx`; the app layout **silently ignores** billing sync `fetch` failures, so subscription state can stay stale without feedback. `global-error.tsx` is a minimal fallback for errors outside the app error boundary.
- **Runbook and rollback** are documented in `docs/runbooks/incident-response.md` (Vercel promote, logs, Stripe/Clerk triage, health contract, UptimeRobot). **Release confidence** is supported by CI (`lint` + `test`), but **`npm run check` does not run tests**—a local gate mismatch called out in `docs/qa/test-infrastructure-review.md`.

---

## Severity-ranked findings

### Critical

- *(none identified in this pass)*

### High

- **`npm run check` omits unit tests while CI runs them** — Risk of shipping after a “green” local `check` when Vitest would fail; `app/package.json` defines `check` as `build && lint` only, while `.github/workflows/ci.yml` runs `lint` then `test`. `docs/qa/test-infrastructure-review.md` §3.5 documents build living on Vercel/local check, but the **script name** still suggests a full pre-merge gate. — *Evidence:* `app/package.json`, `.github/workflows/ci.yml`, `docs/qa/test-infrastructure-review.md`

### Medium

- **Client billing sync failures are swallowed** — `app/(app)/app-layout-client.tsx` calls `fetch("/api/billing/sync")` and uses `.catch(() => {})`, so network or 5xx failures produce **no user-visible signal** and the session throttle still advances on success path only when JSON resolves; users may retain stale tier/banner state until a refresh or later navigation. — *Evidence:* `app/app/(app)/app-layout-client.tsx`

- **Contact form delivery failures are not escalated to Sentry** — On Resend error, `app/api/contact/route.ts` logs with `console.error` and returns 500; unlike route-level Sentry hooks, there is no explicit `Sentry.captureException`, so **email pipeline failures** may only show in Vercel logs unless something else reports them. — *Evidence:* `app/app/api/contact/route.ts`

- **`global-error.tsx` UX is minimal and Sentry capture is conditional** — Root fallback renders bare HTML; Sentry runs inside `useEffect` only when `NEXT_PUBLIC_SENTRY_DSN` is set. Errors on **public or auth routes** without a segment `error.tsx` degrade to this minimal shell. — *Evidence:* `app/app/global-error.tsx`

### Low

- **Health endpoint has no auth and hits the DB on every GET** — Appropriate for probes; at higher scale, abuse or aggressive scanners could add load (runbook already notes monitoring the URL). — *Evidence:* `app/app/api/health/route.ts`, `docs/runbooks/incident-response.md`

- **Stripe webhook business logic relies on framework error handling** — `syncSubscriptionToDb` and related calls are not wrapped in try/catch; failures should surface as non-2xx (Stripe retries) and `onRequestError` may record them, but there is no domain-specific structured log per failure path inside the handler. — *Evidence:* `app/app/api/billing/webhook/route.ts`, `app/instrumentation.ts`

---

## Evidence reviewed

- Process: `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- Architecture / setup: `docs/architecture-and-build-practices.md`, `docs/setup/manual-steps.md`
- Runbook: `docs/runbooks/incident-response.md`
- App: `app/app/(app)/error.tsx`, `app/app/global-error.tsx`, `app/instrumentation.ts`, `app/instrumentation-client.ts`, `app/sentry.server.config.ts`, `app/next.config.ts` (Sentry wrapper)
- APIs: `app/app/api/health/route.ts`, `app/app/api/billing/create-checkout-session/route.ts`, `app/app/api/billing/sync/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/api/contact/route.ts`
- Client ops: `app/app/(app)/app-layout-client.tsx`
- Auth: `app/lib/auth.ts`
- Integration sample: `app/lib/integrations/rentcast.ts` (timeouts, status handling — spot-checked)
- CI / scripts: `.github/workflows/ci.yml`, `app/package.json`
- QA reference: `docs/qa/test-infrastructure-review.md`

**Limits:** No production metrics, Sentry project settings, or live Vercel/Stripe dashboards were inspected. Webhook idempotency and exact Stripe retry behavior were not traced end-to-end.

---

## Risk & impact assessment

Unresolved **High** finding mainly affects **process**: a developer trusting `npm run check` alone could miss regressions caught by Vitest until CI or Vercel build. **Medium** items affect **user trust** (silent billing sync, contact form failures) more than core app availability, which is already guarded by health checks and documented rollback. Likelihood of silent sync failure is moderate (transient network); misconfigured Resend is lower frequency but high impact for support.

---

## Recommendations (prioritized)

1. **Align local “gate” with team intent** — Either add `npm run test` to `check`, or rename/document `check` so `docs/architecture-and-build-practices.md` and builder habits consistently run tests before merge (CI already enforces on mainline).
2. **Surface or record billing sync failures** — Log to Sentry or show a non-blocking toast/banner when `/api/billing/sync` fails, so stale entitlements are visible or actionable.
3. **Harden observability for contact delivery** — Add `Sentry.captureException` (or shared helper) on Resend failure paths so support-channel outages page the same system as app errors.
4. **Improve root error presentation** — Optionally align `global-error.tsx` styling with design tokens and match `(app)/error.tsx` Sentry pattern for consistency.

---

## Task candidates (optional)

- [ ] Update `app/package.json` `check` script (or docs) so pre-merge expectations match CI: include `npm run test` or document a two-step `check && test` workflow.
- [ ] In `app-layout-client.tsx`, handle non-OK responses and failed `fetch` (log to Sentry + optional lightweight UI).
- [ ] In `app/api/contact/route.ts`, report Resend failures to Sentry when DSN is configured.

---

## Re-test checklist

- [ ] After any change to error reporting: trigger a controlled error in `(app)` and confirm Sentry receives it.
- [ ] `GET /api/health` returns 200 with DB up and 503 when `DATABASE_URL` is invalid (staging).
- [ ] `npm run test` passes after script or workflow changes.
- [ ] `npm run check` (if extended): full pipeline green.

---

## Next trigger and cadence

- **Trigger:** After major infra changes (auth, billing, monitoring), quarterly, or before a high-traffic launch.
- **Recommended next run:** **2026-06-20** (quarterly) or sooner if webhook or health-check contracts change.
