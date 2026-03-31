# Security & Privacy Audit — 2026-03-30 (Run 5)

## Executive summary

- **Authentication and authorization in `app/` remain aligned with policy:** Clerk’s `clerkMiddleware` in `app/proxy.ts` restricts non-public traffic; protected route handlers use `getActiveAppUser()` with **`getAppUser()` only on** `app/app/api/account/restore/route.ts` for soft-deleted account recovery. Admin APIs require `isAdmin()` (`ADMIN_EMAILS`).
- **Secrets and env handling:** Core secrets load from `process.env` server-side (`app/lib/env.ts`, `app/lib/stripe-config.ts`, RentCast and Resend keys in route handlers); Prisma validates required vars at DB import via `app/lib/db.ts`. Vercel deploy asserts `STRIPE_WEBHOOK_SECRET` via `app/instrumentation.ts`.
- **Abuse controls:** `app/lib/rate-limit.ts` backs hourly limits on selected writes; RentCast usage is capped per tier via `rentCastApiCall` counts on estimate and benchmark routes; contact form uses `contactFormSubmission` counts by user/IP.
- **Residual themes:** CSP is **report-only** unless `CSP_ENFORCEMENT=true` (`app/next.config.ts`); baseline `script-src` includes `'unsafe-inline'` and `'unsafe-eval'` for framework compatibility. Public endpoints `/api/csp-report` and `/api/health` are intentionally unauthenticated with different risk profiles. No critical or high-severity defects were identified in this static review.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **CSP is report-only unless `CSP_ENFORCEMENT=true`** — Browsers do not block violations until enforcement is enabled. Policy selection: `app/next.config.ts` (`enforceCsp` → `Content-Security-Policy` vs `Content-Security-Policy-Report-Only`). Rollout: `docs/policies/csp-rollout.md`.

- **Baseline CSP allows `'unsafe-inline'` and `'unsafe-eval'` in `script-src`** — Common Next.js / Clerk / Stripe tradeoff; increases blast radius if XSS or injection occurs. Evidence: `cspDirectives` in `app/next.config.ts`. Aligns with backlog in `docs/security/security-audit.md`.

### Low

- **`POST /api/csp-report` has no explicit body size cap** — Handler reads full body with `request.text()` then `JSON.parse` in `app/app/api/csp-report/route.ts`. Malicious or faulty clients could send very large payloads; no rate limit on this public route.

- **`GET /api/health` is unauthenticated and hits the database** — Returns connectivity JSON (`app/app/api/health/route.ts`). Expected for probes; exposes minimal operational state to any caller.

- **Stripe webhook PostHog idempotency** — `app/app/api/billing/webhook/route.ts` documents that `captureServerEvent` does not dedupe by Stripe `event.id`; duplicate deliveries may duplicate analytics (not a billing integrity issue). See `docs/internal/stripe-webhook-posthog-idempotency.md` (reference only).

## Evidence reviewed

| Area | Paths / notes |
|------|----------------|
| **Auth boundary (Clerk)** | `app/proxy.ts` — public: `/`, sign-in/up, marketing pages, `/api/billing/webhook`, `/api/contact`, `/api/csp-report`, `/api/health`; others `auth.protect()` |
| **App user resolution** | `app/lib/auth.ts` — `getAppUser`, `getActiveAppUser`, `isAdmin` |
| **API `getAppUser` usage** | Only `app/app/api/account/restore/route.ts` |
| **API `getActiveAppUser` usage** | All other authenticated `app/app/api/**/route.ts` handlers (32 route files inventoried); webhook, health, csp-report excluded |
| **Stripe webhook** | `app/app/api/billing/webhook/route.ts` — `stripe-signature` header, `constructEvent`, `getWebhookSecret()` from `app/lib/stripe-config.ts`; Sentry warning on unresolved `appUserId` |
| **Billing (user)** | `create-checkout-session`, `sync`, `portal`, `status`, `subscription-details` — `getActiveAppUser`; checkout rate-limited (`billing:create-checkout`) |
| **Env / validation** | `app/lib/env.ts` — `validateEnv` for `DATABASE_URL`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`; `app/lib/db.ts` imports validation; `assertStripeWebhookSecretForVercelDeploy` in `app/instrumentation.ts` |
| **Stripe keys** | `app/lib/stripe-config.ts` — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (no `NEXT_PUBLIC_` for secrets) |
| **RentCast** | `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts` — `RENTCAST_API_KEY`, shared hourly `rentCastApiCall` pool, Zod query validation |
| **Contact** | `app/app/api/contact/route.ts` — Zod via `contactFormSchema`, honeypot, `RESEND_API_KEY` / `SUPPORT_EMAIL` server-side, per-identifier hourly count |
| **CSP / headers** | `app/next.config.ts` — security headers, CSP directives, `report-uri` to `/api/csp-report`; Sentry wrap (`SENTRY_AUTH_TOKEN` optional for build) |
| **CSP reporting** | `app/app/api/csp-report/route.ts`, `app/lib/csp-report.ts` |
| **Rate limiting (`ApiRateLimitEntry`)** | `app/lib/rate-limit.ts` — `RATE_LIMITS`; wired: `app/app/api/properties/route.ts`, `app/app/api/deals/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/billing/create-checkout-session/route.ts`, `app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts` |
| **Admin** | `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts` — `getActiveAppUser` + `isAdmin` |
| **Health** | `app/app/api/health/route.ts` — `SELECT 1` via Prisma |
| **Client-exposed env** | `app/.env.example` — documents `NEXT_PUBLIC_*` vs server-only; layout/analytics use public keys only (`app/app/layout.tsx`, `app/components/analytics/posthog-provider.tsx`) |
| **Reference docs (process)** | `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`, `docs/security/security-notes.md`, `docs/security/security-audit.md` |

**Assumptions / limits:** Static review of `app/` only; no penetration test, dependency SCA, or production log review. Clerk, Stripe, Resend, PostHog, and Sentry trust boundaries are as implemented by those vendors.

## Risk & impact assessment

Unresolved **medium** items affect **defense-in-depth** (when CSP blocks vs reports; breadth of `script-src`), not an immediate auth bypass or data exfiltration path from this review. **Low** items are **availability / noise** (large CSP bodies), **accepted operational** exposure (health), or **analytics fidelity** (webhook retries).

## Recommendations (prioritized)

1. **Production CSP:** Confirm `CSP_ENFORCEMENT=true` when violation triage allows; keep report-only mode until noise is acceptable (`docs/policies/csp-rollout.md`).

2. **CSP hardening:** Plan incremental tightening of `script-src` / `style-src` where Next.js and Clerk allow, or document why `unsafe-inline` / `unsafe-eval` must remain.

3. **Public reporting endpoint:** If abuse appears, add a maximum body size or early rejection for `POST /api/csp-report`.

4. **Cadence:** Re-run after changes to `app/proxy.ts` public routes, webhook signature path, `app/lib/env.ts` requirements, or CSP header construction.

## Task candidates (optional)

- [ ] Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` for correct `report-uri` and enforcement intent.
- [ ] Optionally cap or sample `POST /api/csp-report` body size if monitoring shows abuse.

## Re-test checklist

- [ ] Verify fix for any future critical/high finding
- [ ] Verify no regression in adjacent auth or billing paths
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly security lane, pre-launch gate, or after auth/billing/CSP/proxy changes.
- **Recommended next run:** Within one month or before the next production release that touches those surfaces.
