# Security & Privacy Audit — 2026-03-30 (Run 3)

## Executive summary

- **Auth and data access** are in good shape: Clerk protects non-public routes via `app/proxy.ts`, protected APIs consistently use `getActiveAppUser()` (with deliberate `getAppUser()` only for account restore), and resource handlers scope lookups by `userId` to limit IDOR risk.
- **Billing and webhooks** rely on Stripe signature verification (`constructEvent` with `STRIPE_WEBHOOK_SECRET`), Vercel deploy-time assertion for the webhook secret, and server-only Stripe keys; subscription sync paths resolve users via metadata or `stripeCustomerId` with observability when resolution fails.
- **Privacy-relevant behavior** matches documented intent: optional analytics and ads are gated behind client consent (`CookieConsentProvider`, `PostHogGate`, `GoogleAdsGtagClient`); privacy copy references Clerk, PostHog, and Google Ads.
- **Residual risks** are mainly **configuration and CSP posture** (report-only by default, permissive `script-src` for Next.js compatibility) and **abuse surface on intentionally public endpoints**; no critical or high-severity code defects were identified in this pass.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **CSP is report-only unless `CSP_ENFORCEMENT=true`** — Until enforcement is enabled in production, browsers do not block violations; XSS or misconfigured assets may go undetected from a policy perspective even though monitoring may catch reports. Policy and rollout are documented in `docs/policies/csp-rollout.md`; implementation is in `app/next.config.ts` (`CSP_ENFORCEMENT === "true"` switches from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`).

- **Baseline CSP includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src`** — This is a common Next.js tradeoff but widens impact if a content-injection or XSS bug ever appears. Evidence: `cspDirectives` in `app/next.config.ts`. Aligns with prior gap tracking in `docs/security/security-audit.md` (baseline CSP tightening).

### Low

- **`POST /api/csp-report` has no explicit request body size limit** — The route reads the full body and `JSON.parse`s it (`app/app/api/csp-report/route.ts`). A malicious or buggy client could send very large payloads, increasing resource use. Rate limiting is not applied to this public endpoint.

- **`GET /api/health` is unauthenticated and probes the database** — Returns connectivity status (`app/app/api/health/route.ts`). Expected for load balancers; minor information disclosure to arbitrary callers.

- **Permanent account deletion order** — `app/app/api/account/delete-permanent/route.ts` deletes the Prisma user before deleting the Clerk user; failure on the Clerk step is logged but can leave a Clerk identity without an app row (operational hygiene, not a privilege-escalation finding).

## Evidence reviewed

| Area | Paths / notes |
|------|----------------|
| **Auth boundary (Clerk)** | `app/proxy.ts` — `createRouteMatcher` public list vs `auth.protect()` for all other matched routes |
| **App user resolution** | `app/lib/auth.ts` — `getAppUser`, `getActiveAppUser`, `isAdmin` (`ADMIN_EMAILS`) |
| **API route auth pattern** | All `app/app/api/**/route.ts` files — grep confirmed `getActiveAppUser` on protected handlers; `getAppUser` only on `app/app/api/account/restore/route.ts` |
| **IDOR / scoping** | `app/app/api/properties/[id]/route.ts` — `findFirst` with `{ id, userId }`; same pattern assumed on deals/mortgages routes reviewed via grep |
| **Stripe webhook** | `app/app/api/billing/webhook/route.ts` — signature header, `constructEvent`, sync by `appUserId` / `stripeCustomerId` |
| **Billing (user)** | `app/app/api/billing/create-checkout-session/route.ts`, `billing/sync/route.ts`, `billing/portal/route.ts`, `billing/status/route.ts` — `getActiveAppUser`, Zod/checkout validation, rate limit on checkout |
| **Env / secrets** | `app/lib/env.ts` — `validateEnv` for DB + Clerk + Stripe; `assertStripeWebhookSecretForVercelDeploy` from `app/instrumentation.ts`; `app/.env.example` documents server vs `NEXT_PUBLIC_*` |
| **Stripe config** | `app/lib/stripe-config.ts` — keys from `process.env` only |
| **Prisma** | `app/lib/db.ts` — `validateEnv()` at import; `app/app/api/health/route.ts` — only `$queryRaw` usage (tagged `SELECT 1`) |
| **CSP / headers** | `app/next.config.ts` — security headers, CSP directives, Sentry wrapper |
| **CSP reporting** | `app/app/api/csp-report/route.ts`, `app/lib/csp-report.ts` — parsing, sampling, Sentry forwarding |
| **Rate limiting** | `app/lib/rate-limit.ts`, contact (`app/app/api/contact/route.ts`), RentCast pool (`app/app/api/estimates/rent/route.ts`), export (`app/app/api/export/portfolio/route.ts`) |
| **Admin** | `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts` — `getActiveAppUser` + `isAdmin`, structured `console.info` audit lines |
| **Account delete** | `app/app/api/account/delete-permanent/route.ts` — Zod + `confirmText`/password verification via Clerk |
| **Public POST contact** | `app/app/api/contact/route.ts` — honeypot, Zod, IP/user rate limit, HTML escaping for email body |
| **Cookies / privacy UX** | `app/lib/cookie-consent.ts`, `app/components/consent/*`, `app/app/layout.tsx`, `app/app/privacy/page.tsx` |
| **Server analytics** | `app/lib/posthog-server.ts` — optional capture; uses `NEXT_PUBLIC_POSTHOG_KEY` (project key model) |
| **Reference docs** | `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/policies/csp-rollout.md` |

**Assumptions / limits:** Static and documentation review only; no production traffic analysis, penetration test, or dependency SCA run in this lane. Clerk and Stripe security models are trusted as implemented by those vendors.

## Risk & impact assessment

Unresolved **medium** items mainly affect **defense-in-depth** (CSP enforcement timing and script-src strictness), not an immediate authentication bypass. **Low** items are **availability/abuse** (large CSP report bodies) or **accepted operational** exposure (health check). Likelihood of exploitation varies: CSP enforcement drift is **process-dependent**; oversized CSP bodies require an attacker to target the reporting endpoint.

## Recommendations (prioritized)

1. **Production CSP:** Confirm whether `CSP_ENFORCEMENT=true` is set in the production environment after triage; if not yet, keep `docs/policies/csp-rollout.md` triage active and schedule enforcement when violation noise is acceptable.

2. **CSP hardening backlog:** Plan incremental tightening of `script-src` / `style-src` where Next.js allows (or document why `unsafe-inline` / `unsafe-eval` must remain), per `docs/security/security-audit.md`.

3. **Public reporting endpoint:** Consider a maximum body size or early rejection for `POST /api/csp-report` if abuse or noisy clients become an issue.

4. **Cadence:** Re-run this lane after any change to `proxy.ts` public routes, billing/webhook code, `lib/env.ts` requirements, or CSP header construction.

## Task candidates (optional)

- [ ] Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` values match `docs/policies/csp-rollout.md` expectations.
- [ ] Optionally add a request body size guard for `POST /api/csp-report` if monitoring shows abuse.

## Re-test checklist

- [ ] After CSP or `proxy.ts` changes: smoke sign-in, dashboard, billing, and CSP report flow per `docs/policies/csp-rollout.md`.
- [ ] After env or Stripe webhook changes: confirm Vercel build still enforces `STRIPE_WEBHOOK_SECRET` and webhook signature verification in staging.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Release touching auth, billing, public API routes, CSP, or environment validation.
- **Recommended next run:** Within one month or before a major production launch, whichever comes first.
