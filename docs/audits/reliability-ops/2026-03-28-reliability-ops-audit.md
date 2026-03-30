# Reliability & Operations Audit — 2026-03-28

## Executive summary

- **Overall:** The app has a **documented incident runbook**, a **DB-backed `/api/health`** endpoint, **Sentry** wired through Next instrumentation and client config, **rate limiting** on sensitive writes, and **segmented `loading.tsx`** routes in the main app areas. Failure handling is **uneven**: benchmark refresh correctly returns **502** on upstream failure, but the **GET estimate APIs return HTTP 200** on RentCast errors, which **masks failures** in logs and status-based alerting.
- **Top risks:** (1) **Misleading HTTP status** on `/api/estimates/rent` and `/api/estimates/value` failure paths; (2) **Silent Stripe webhook** paths when an app user cannot be resolved; (3) **Minimal global error UI** for root-level failures.
- **Recommendation:** Fix estimate-route HTTP semantics (and verify any consumers), add **operational visibility** for unmapped Stripe events, and **tighten** global error UX without scope creep.

## Severity-ranked findings

### Critical

- *(none identified in this pass)*

### High

- **Estimate GET routes return HTTP 200 on integration failure** — Upstream/RentCast failures are returned as `{ error: string }` with **status 200**, unlike `POST /api/properties/[id]/benchmark/refresh` which returns **502**. This hides failures from **HTTP-based monitors**, **Vercel log filters**, and **Sentry’s request-failure signals** that depend on status codes. **Evidence:** `app/app/api/estimates/rent/route.ts` (catch returns 200 with `error`), `app/app/api/estimates/value/route.ts` (same pattern). **Note:** Client code (e.g. `property-form.tsx`) keys off JSON fields, so user-visible behavior may still work; the gap is **observability and API contract consistency**.

### Medium

- **`global-error.tsx` is a bare unstyled fallback** — Root layout errors show minimal HTML with no design tokens, recovery actions, or support link. Degraded experience during the worst class of failures. **Evidence:** `app/app/global-error.tsx`.

- **Stripe webhook can succeed (200) while skipping DB sync** — When `syncSubscriptionToDb` cannot resolve `appUserId`, it **logs a warning** and returns without updating subscription state; the handler still responds **200** to Stripe (avoiding infinite retries). That is a valid tradeoff but creates **silent billing drift** unless Stripe Dashboard + logs are monitored. **Evidence:** `app/app/api/billing/webhook/route.ts` (`syncSubscriptionToDb`, `console.warn`).

- **Server-side error reporting is mostly `console.error` + Sentry defaults** — Many API `catch` blocks log to stdout only; only routes that throw or use `captureRequestError` paths get consistent Sentry coverage. Triage relies on **Vercel logs** and **manual correlation**. **Evidence:** e.g. `app/app/api/billing/portal/route.ts`, `app/app/api/contact/route.ts` (Resend errors), health route DB errors.

### Low

- **Inconsistent Sentry guards between error boundaries** — `(app)/error.tsx` always calls `Sentry.captureException`; `global-error.tsx` only captures when `NEXT_PUBLIC_SENTRY_DSN` is set. Client init in `instrumentation-client.ts` is DSN-gated; impact is likely low but **behavior differs** by surface. **Evidence:** `app/app/(app)/error.tsx`, `app/app/global-error.tsx`, `app/instrumentation-client.ts`.

- **Health check scope is DB-only** — `/api/health` validates PostgreSQL only; Clerk, Stripe, and RentCast are out of scope. Appropriate for a **lightweight LB probe**; full dependency checks would need careful design to avoid false negatives and abuse. **Evidence:** `app/app/api/health/route.ts`.

- **CI does not exercise runtime health or synthetic API smoke** — Workflow runs **ESLint + Vitest** only (`/.github/workflows/ci.yml`); production readiness of `/api/health` is **manual** or external (UptimeRobot per runbook).

## Evidence reviewed

- **Docs:** `docs/process/reliability-ops-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` (API/error conventions), `docs/setup/manual-steps.md`, `docs/runbooks/incident-response.md`, `docs/security/security-notes.md` (webhook verification)
- **Error boundaries:** `app/app/(app)/error.tsx`, `app/app/global-error.tsx`
- **Observability:** `app/instrumentation.ts`, `app/instrumentation-client.ts`, `app/sentry.server.config.ts`, `app/sentry.edge.config.ts`, `app/next.config.ts` (`withSentryConfig`)
- **Health:** `app/app/api/health/route.ts`, `app/proxy.ts` (public `/api/health`)
- **Retries / idempotency:** `app/app/api/billing/webhook/route.ts` (signature verification, Prisma upserts), `app/lib/integrations/rentcast.ts` (timeout constant), `app/prisma/seed.ts` (idempotent seed comment)
- **Rate limits:** `app/lib/rate-limit.ts`, sample consumers under `app/app/api/`
- **Representative API failure paths:** `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/app/api/contact/route.ts`
- **CI:** `.github/workflows/ci.yml`
- **Loading / degraded UX:** `app/app/(app)/*/loading.tsx` (multiple routes)

**Limits:** No production log review, no load testing, no Stripe replay simulation. Assessment is **static** from repository state as of 2026-03-28.

## Risk & impact assessment

- **Unresolved High finding:** Operations teams and automated monitors may **under-count** RentCast/outage incidents; regression detection and SLI/SLO dashboards keyed on HTTP status will be **wrong** for those endpoints.
- **Medium findings:** Billing misconfiguration may go **unnoticed** until user reports; **global** errors feel **unpolished** and may increase support noise during incidents.
- **Likelihood:** Estimate API failures occur whenever RentCast is down, rate-limited, or misconfigured; webhook user-resolution issues are **lower frequency** but **high impact** per event.

## Recommendations (prioritized)

1. **Change GET `/api/estimates/rent` and `/api/estimates/value`** to return **4xx/5xx** (e.g. 502) when RentCast or internal handling fails, while keeping JSON `{ error }` for the client. Confirm `property-form.tsx` / `add-property-wizard.tsx` still behave (they already branch on JSON body).
2. **Add operational visibility** for Stripe webhook “could not resolve app user” — e.g. **Sentry capture** or a **structured log** field + alert rule, without changing the **200** response to Stripe.
3. **Upgrade `global-error.tsx`** to a minimal branded layout (semantic tokens if possible in this boundary), **Try again** / **home** links, and optional support path — aligned with `docs/policies/design-spec.md`.
4. **Define a lightweight API logging convention** for non-2xx paths: when to call `Sentry.captureException` / `captureMessage` vs `console.error`, and document it in `docs/architecture-and-build-practices.md`.

## Task candidates

- [ ] Return **502** (or **503** when appropriate) from `GET /api/estimates/rent` and `GET /api/estimates/value` in the `catch` blocks instead of HTTP 200; verify UI flows in property form and add-property wizard.
- [ ] On Stripe webhook user-resolution failure, **report to Sentry** (or equivalent) with subscription/customer IDs; keep HTTP 200 to Stripe.
- [ ] Redesign **`app/app/global-error.tsx`** for accessible, on-brand fallback UI and recovery links.
- [ ] Document **API error logging + Sentry** expectations in `docs/architecture-and-build-practices.md` (short subsection).
- [ ] Optionally align **`(app)/error.tsx`** Sentry usage with `global-error.tsx` DSN guard for consistency.
- [ ] Optionally add a **CI step** or documented script that hits `/api/health` in a test environment (or document why only external uptime is used).
- [ ] Add a **runbook note** that **DB outage** affects rate-limit counters and estimate limits (both use Prisma) — same incident bucket as `/api/health` 503.

## Re-test checklist

- [ ] After estimate route changes: failure path returns non-2xx; UI still shows friendly error copy.
- [ ] After webhook visibility change: unmapped subscription events appear in Sentry (or chosen sink) without altering Stripe HTTP behavior.
- [ ] After global-error change: trigger a root error in staging and verify layout and links.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After material changes to **billing webhooks**, **estimate integrations**, **error boundaries**, or **monitoring**; otherwise **quarterly** or **pre-major release**.
- **Recommended next run:** **2026-06-28** (or next release with API/observability changes).
