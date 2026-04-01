# Reliability & Operations Audit — 2026-04-01

## Executive summary

- **Overall:** The app has a coherent reliability baseline: Sentry (`@sentry/nextjs`) on client and server, `instrumentation.ts` wiring `onRequestError`, public `GET /api/health` with DB probe, rate limits on sensitive routes, RentCast timeouts, Stripe webhook idempotency notes, and **strong operational docs** (`docs/runbooks/incident-response.md`, UptimeRobot guidance, rollback steps).
- **Top risks:** (1) **Health monitoring only reflects PostgreSQL** — Clerk or Stripe outages will not turn `/api/health` red while the DB is up, so external uptime monitors can show “green” during auth or payments incidents. (2) **Explicit Sentry usage is concentrated** in billing, properties, deals, estimates, contact, and CSP — many other route handlers have no local `try/catch` + `captureException`, so triage relies on global request error capture and Vercel logs. (3) **Account deletion** can proceed if Stripe subscription cancellation throws — only `console.error`, no Sentry, risking continued billing until manual reconciliation.
- **Degraded-mode behavior:** Billing periodic sync logs failures to Sentry from the client when HTTP is non-OK; server-side `/api/billing/sync` returns **200** with `{ synced: false }` on Stripe/DB errors (intentional soft failure) while still emitting structured logs + Sentry on the server. Users see generic network/retry copy on many client `fetch` failures.
- **Recommendation:** Treat this pass as **ready for continued production use** with prioritized hardening: extend monitoring or health semantics for critical third parties, add observability for the account-delete Stripe path, and optionally add a root-segment `error.tsx` for marketing routes.

## Severity-ranked findings

### Critical

- *(None identified in this pass.)*

### High

- **Health check does not cover Clerk or Stripe** — `GET /api/health` only runs `SELECT 1` via Prisma and returns 503 when the database is unreachable. An auth provider outage or Stripe API incident leaves the endpoint **200** if Postgres is healthy, so UptimeRobot (or similar) aligned with `docs/runbooks/incident-response.md` may not fire for those failure modes. — `app/app/api/health/route.ts`, `docs/runbooks/incident-response.md` § Health check

- **Stripe subscription cancellation failure during account delete is only logged to console** — In `POST /api/account/delete`, if `stripe.subscriptions.cancel` throws, the handler logs with `console.error` and continues with soft-delete and DB updates. There is no `Sentry.captureException`, and the user may still be charged until support/Stripe reconciliation. — `app/app/api/account/delete/route.ts` (Stripe `cancel` in `try/catch`)

### Medium

- **No root `app/error.tsx` — only `(app)/error.tsx` and `global-error.tsx`** — Route groups mean `app/(app)/error.tsx` covers the authenticated shell, but **`app/page.tsx` and other top-level marketing routes** are not under `(app)`; they do not get the same segment error boundary. Failures there depend on Next.js defaults / `global-error.tsx` behavior rather than the branded in-app error UI. — `app/app/(app)/error.tsx`, `app/app/global-error.tsx`, `app/app/page.tsx` (layout tree)

- **Uneven explicit Sentry coverage across API routes** — Twelve of thirty-three `app/api/**/route.ts` files import Sentry for structured capture; others (e.g. portfolio summary, CSV export, mortgage CRUD, onboarding, admin routes) rely on unhandled exception propagation and **`onRequestError`** / platform behavior. That is often sufficient but makes **per-route tags and `extra` context** less consistent for triage. — Grep: `Sentry` in `app/app/api/**/route.ts` vs full route list

- **`/api/billing/sync` returns HTTP 200 on caught exceptions** — The handler correctly logs JSON lines and `Sentry.captureException` in `catch`, but responds with **200** and `{ synced: false, tier: ... }`. HTTP-level synthetic checks cannot distinguish “sync failed” from “nothing to sync”; only server logs/Sentry carry the signal. — `app/app/api/billing/sync/route.ts`

### Low

- **Production trace sampling is 10%** — `sentry.client.config.ts` and `sentry.server.config.ts` use `tracesSampleRate: 0.1` outside development. Rare latency issues may be under-sampled. — `app/sentry.client.config.ts`, `app/sentry.server.config.ts`

- **Sentry webpack plugin org/project defaults** — `next.config.ts` passes `org`/`project` fallbacks (`placeholder-org` / `placeholder-project`) when env vars are unset; builds rely on `SENTRY_AUTH_TOKEN` for source maps in CI. Local misconfiguration is possible without breaking runtime DSN-based reporting. — `app/next.config.ts` (`withSentryConfig`)

- **Client `fetch` calls generally lack automatic retries** — Billing, property forms, and imports use single-shot `fetch`; users see “Network error” / retry copy. Acceptable for many flows; transient failures depend on user retry. — Representative: `app/app/(app)/properties/property-form.tsx`, `app/components/pricing-cards.tsx`

## Evidence reviewed

- **Process & template:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Reference docs:** `docs/architecture-and-build-practices.md` (§2.6 Observability, §2.5 External APIs), `docs/setup/manual-steps.md` (hosting, Stripe, Clerk, monitoring expectations)
- **Runbooks:** `docs/runbooks/incident-response.md` (rollback, Sentry/Vercel/Stripe/Clerk, health URL, UptimeRobot), `docs/runbooks/health-check-smoke.md`
- **Error boundaries & global handling:** `app/app/(app)/error.tsx`, `app/app/global-error.tsx`
- **Observability:** `app/instrumentation.ts`, `app/sentry.client.config.ts`, `app/sentry.server.config.ts`, `app/next.config.ts` (Sentry + CSP headers)
- **Env fail-fast (deploy):** `app/lib/env.ts` (`assertStripeWebhookSecretForVercelDeploy`, `assertPublicAppUrlForVercelDeploy`)
- **Health:** `app/app/api/health/route.ts`
- **Auth boundary:** `app/proxy.ts` (public routes including `/api/health`, `/api/billing/webhook`)
- **Representative API patterns:** `app/app/api/billing/sync/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/api/account/delete/route.ts`, `app/app/api/properties/route.ts`, `app/app/api/csp-report/route.ts`
- **Client degraded behavior:** `app/app/(app)/app-layout-client.tsx` (billing sync + Sentry)
- **External integration hardening:** `app/lib/integrations/rentcast.ts` (timeout, status handling)
- **API surface enumeration:** 33 `route.ts` files under `app/app/api/`

**Limits:** Static review only; no production traffic, Sentry project dashboards, or Vercel runtime metrics. Stripe/Clerk dashboard configuration was not verified live.

## Risk & impact assessment

| Area | Impact if unresolved |
|------|----------------------|
| DB-only health + single external monitor | **Time-to-detect** for non-DB incidents (auth, payments API) depends on user reports or provider dashboards, not the primary uptime URL. |
| Account delete + Stripe cancel failure | **Billing integrity** — possible continued charges and support load until Stripe subscription is canceled manually. |
| Sparse per-route Sentry | **Triage speed** — engineers may rely more on grouped unhandled errors than rich route-level context on less-instrumented handlers. |
| Marketing segment without `app/error.tsx` | **UX consistency** on public pages if a server/client error occurs — possibly generic Next/global error experience vs branded `(app)` recovery. |

Likelihood is **moderate** for third-party outages (industry-normal) and **low–moderate** for the Stripe-cancel-on-delete edge case (network/API blips during delete).

## Recommendations (prioritized)

1. **Extend operational detection beyond DB health** — Either document reliance on Clerk/Stripe status pages + Sentry alerts as primary for those providers, or add **synthetic checks** / **separate lightweight probes** (e.g. authenticated smoke, or provider-specific monitors) so `incident-response.md` stays accurate. At minimum, add an explicit “limitations” bullet to the health section of the runbook if code stays DB-only.
2. **Harden account deletion Stripe path** — On `stripe.subscriptions.cancel` failure: emit **Sentry** (with `userId` / subscription id in `extra`, no card data), and consider **blocking** soft-delete or returning a **409/503** with a clear message so the user retries instead of proceeding with inconsistent billing state.
3. **Add `app/error.tsx` at the root segment** — Align public/marketing error UX with the authenticated app’s error boundary where product owners want a consistent “Veld” recovery experience (or document a deliberate choice to keep minimal global-error-only UX).

## Task candidates (optional)

- [ ] Add Sentry + explicit failure policy for Stripe cancel in `POST /api/account/delete` (and optional idempotent retry).
- [ ] Update `docs/runbooks/incident-response.md` § Health check with **explicit scope** (DB only) and pointers to Clerk/Stripe dashboards or optional extra monitors.
- [ ] Add root `app/error.tsx` (or document why omitted) for parity with `app/(app)/error.tsx`.
- [ ] Optionally add `Sentry.captureException` in high-traffic or high-risk routes without it (export, import, mortgage) for richer `tags` — after confirming overlap with `onRequestError` to avoid double noise.

## Re-test checklist

- [ ] Verify any change to account-delete behavior with Stripe test mode (cancel succeeds, cancel fails, idempotency).
- [ ] After health/monitoring doc or code changes, re-run manual `curl` from `docs/runbooks/health-check-smoke.md` and UptimeRobot expectations.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly or after any production incident involving billing, auth, database, or third-party integrations; quarterly standing review per `docs/architecture-and-build-practices.md` review cadence.
- **Recommended next run:** **2026-05-01** (one month) or sooner if a Sev-1/2 incident occurs.
