# Reliability & Operations Audit — 2026-04-01

## Executive summary

- **Overall:** Operations posture remains strong: Sentry (`@sentry/nextjs`) on client and server, `instrumentation.ts` exporting `onRequestError`, DB-backed `GET /api/health`, Stripe webhook idempotency documentation, RentCast timeouts, rate limits on sensitive routes, and actionable runbooks (`docs/runbooks/incident-response.md`, `docs/runbooks/health-check-smoke.md`).
- **Improvement since prior same-day pass:** `POST /api/account/delete` now **fails closed** on Stripe subscription cancellation errors (`Sentry.captureException`, HTTP **503**, user message to retry or contact support) and does **not** soft-delete the account — addressing the billing-integrity gap called out in `2026-04-01-reliability-ops-audit.md`.
- **Top remaining risks:** (1) **`/api/health` reflects only PostgreSQL** — Clerk or Stripe incidents can leave uptime monitors green while DB is healthy. (2) **Explicit `Sentry` imports in ~14 of 33 API route files** — others rely on unhandled errors and global request capture; route-level `tags`/`extra` are less uniform. (3) **`GET /api/billing/sync` returns HTTP 200** on caught Stripe/DB failures — intentional soft failure with server-side logs + Sentry, but HTTP probes and the client’s `!res.ok` branch in `app-layout-client.tsx` do not surface that distinction.
- **Recommendation:** Keep production monitoring; prioritize runbook clarity on health scope and optional synthetic or dashboard workflows for Clerk/Stripe; treat billing-sync HTTP semantics as a product/observability trade-off if stricter HTTP signaling is ever required.

## Severity-ranked findings

### Critical

- *(None identified in this pass.)*

### High

- **Health check does not cover Clerk or Stripe** — `GET /api/health` runs `SELECT 1` via Prisma and returns 503 when the database is unreachable. An auth or payments provider outage leaves the endpoint **200** if Postgres is healthy, so UptimeRobot-style checks aligned with `docs/runbooks/incident-response.md` may not fire for those failure modes. — `app/app/api/health/route.ts`, `docs/runbooks/incident-response.md` § Health check

### Medium

- **No root `app/error.tsx` — only `(app)/error.tsx` and `global-error.tsx`** — `app/(app)/error.tsx` covers the authenticated shell; top-level marketing routes (e.g. `app/page.tsx`) are outside `(app)` and do not use the same segment error UI — recovery depends on `global-error.tsx` / Next.js defaults. — `app/app/(app)/error.tsx`, `app/app/global-error.tsx`, `app/app/page.tsx`

- **Uneven explicit Sentry coverage across API routes** — Fourteen of thirty-three `app/app/api/**/route.ts` files import Sentry for local capture; the rest depend on propagation to **`onRequestError`** (`app/instrumentation.ts`) and platform behavior. Triage still works but **per-route tags and `extra` context** are less consistent. — Grep: `Sentry` in `app/app/api/**/route.ts` vs full route list (33 files)

- **`GET /api/billing/sync` returns HTTP 200 on caught exceptions** — The handler logs structured JSON, calls `Sentry.captureException`, and returns **200** with `{ synced: false, tier: ... }`. External HTTP checks cannot tell failure from “no change needed”; the client only runs the non-OK Sentry path when `!res.ok`, so **Stripe failures that still return 200** do not trigger that client branch (server Sentry remains the signal). — `app/app/api/billing/sync/route.ts`, `app/app/(app)/app-layout-client.tsx` (`fetch("/api/billing/sync")`)

### Low

- **Production trace sampling is 10%** — `sentry.client.config.ts` and `sentry.server.config.ts` use `tracesSampleRate: 0.1` outside development. Rare latency issues may be under-sampled. — `app/sentry.client.config.ts`, `app/sentry.server.config.ts`

- **Sentry webpack plugin org/project defaults** — `next.config.ts` passes `org`/`project` fallbacks (`placeholder-org` / `placeholder-project`) when env vars are unset; source maps in CI depend on `SENTRY_AUTH_TOKEN`. — `app/next.config.ts` (`withSentryConfig`)

- **Client `fetch` calls generally lack automatic retries** — Billing, property flows, and imports use single-shot `fetch`; users see network/retry copy. Transient failures rely on manual retry. — Representative: `app/components/pricing-cards.tsx`, `app/app/(app)/app-layout-client.tsx`

## Evidence reviewed

- **Process & template:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`
- **Reference docs:** `docs/architecture-and-build-practices.md` (§2.6 Observability, §2.5 Performance), `docs/setup/manual-steps.md` (hosting, Stripe, Clerk, monitoring)
- **Runbooks:** `docs/runbooks/incident-response.md`, `docs/runbooks/health-check-smoke.md`, `docs/launch/paid-ads-monitoring-runbook.md` (growth ops; not app SLOs)
- **Prior same-day report (delta check):** `docs/audits/reliability-ops/2026-04-01-reliability-ops-audit.md`
- **Error boundaries:** `app/app/(app)/error.tsx`, `app/app/global-error.tsx`
- **Observability:** `app/instrumentation.ts`, `app/sentry.client.config.ts`, `app/sentry.server.config.ts`, `app/next.config.ts`
- **Health & billing:** `app/app/api/health/route.ts`, `app/app/api/billing/sync/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/api/account/delete/route.ts`
- **Client billing sync:** `app/app/(app)/app-layout-client.tsx`
- **Integration hardening:** `app/lib/integrations/rentcast.ts` (timeout constant, error behavior)
- **API surface:** 33 `route.ts` files under `app/app/api/`

**Limits:** Static review only; no live production dashboards, Sentry project views, or Stripe/Clerk configuration verification. This pass re-read critical paths to confirm findings against current sources.

## Risk & impact assessment

| Area | Impact if unresolved |
|------|----------------------|
| DB-only health + single external monitor | **Time-to-detect** for non-DB incidents depends on vendor status pages, Sentry, or user reports rather than the primary uptime URL. |
| Sparse per-route Sentry on some handlers | **Triage speed** — more reliance on grouped unhandled errors than rich route-scoped context. |
| Billing sync HTTP 200 on server catch | **Monitoring semantics** — synthetic HTTP success does not imply Stripe sync succeeded; ops must use Sentry/log queries. |
| Marketing segment without `app/error.tsx` | **UX consistency** on public routes if a render error occurs — `global-error.tsx` applies instead of the branded `(app)` recovery UI. |

Likelihood of third-party outages is **industry-normal**; likelihood of needing stricter billing-sync HTTP signaling depends on whether external probes must mirror server catch behavior.

## Recommendations (prioritized)

1. **Clarify health monitoring scope in ops docs** — Update `docs/runbooks/incident-response.md` § Health check with an explicit **DB-only** scope and pointers to Clerk and Stripe dashboards (or optional separate probes), so on-call expectations match behavior.
2. **Optional: extend detection beyond DB** — If product requires it, add synthetic checks or alert rules for auth/billing (without overloading `/api/health` if that would add brittle dependencies).
3. **Decide on billing-sync HTTP contract** — If HTTP-level monitors must reflect Stripe failures, consider a non-2xx or a machine-readable error field on failure; if the current **200 + server Sentry** contract is intentional, document it next to the runbook billing section.
4. **Optional: root `app/error.tsx`** — Align public-page error UX with `(app)` or document a deliberate choice to rely on `global-error.tsx` only.

## Task candidates (optional)

- [ ] Update `docs/runbooks/incident-response.md` § Health check with **explicit DB-only scope** and links to Clerk/Stripe operational checks.
- [ ] Add root `app/error.tsx` (or document why omitted) for parity with `app/(app)/error.tsx`.
- [ ] Optionally add localized `Sentry` tags on high-traffic routes without imports (export, import, onboarding) after confirming no duplicate noise with `onRequestError`.
- [ ] Document or adjust `GET /api/billing/sync` HTTP semantics for operators (200 on catch vs synthetic monitoring needs).

## Re-test checklist

- [ ] Verify account delete with Stripe test mode: cancel succeeds; cancel fails → 503 and no soft-delete (regression guard).
- [ ] After health or monitoring doc changes, align expectations with `docs/runbooks/health-check-smoke.md` and external monitors.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly or after a production incident involving billing, auth, database, or third-party integrations; quarterly per `docs/architecture-and-build-practices.md` review cadence.
- **Recommended next run:** **2026-05-01** (one month) or sooner after a Sev-1/2 incident.
