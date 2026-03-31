# Security & Privacy Audit — 2026-03-30 (Run 4)

## Executive summary

- **Overall posture remains strong:** Clerk protects non-public routes via `app/proxy.ts`; protected APIs use `getActiveAppUser()` with **`getAppUser()` only on `app/app/api/account/restore/route.ts`**; resource handlers scope by `userId` (e.g. `findFirst` with `{ id, userId }`) to limit IDOR risk.
- **Billing and webhooks** continue to rely on Stripe signature verification (`constructEvent` with `STRIPE_WEBHOOK_SECRET`), Vercel deploy-time assertion for the webhook secret in `instrumentation.ts` / `lib/env.ts`, and server-only Stripe keys in `lib/stripe-config.ts`.
- **Abuse controls have expanded since earlier gap tracking:** `lib/rate-limit.ts` now defines per-hour limits for `properties:create`, `deals:create`, `import:portfolio`, `export:portfolio`, `account:delete`, `account:delete-permanent`, and `billing:create-checkout`, with `checkRateLimit` / `recordRateLimit` wired on the corresponding routes (see `grep` evidence below). Contact and RentCast pool limits remain as documented.
- **Residual risks** are unchanged in theme from [Run 3](./2026-03-30-security-audit-3.md): **CSP report-only unless enforced**, **permissive `script-src` for Next.js compatibility**, and **public endpoints** (`/api/csp-report`, `/api/health`) without the same rate-limit patterns as authenticated writes. No critical or high-severity code defects were identified in this pass.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **CSP is report-only unless `CSP_ENFORCEMENT=true`** — Browsers do not block violations until enforcement is enabled. Policy is in `app/next.config.ts` (`CSP_ENFORCEMENT === "true"` switches from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`). Rollout guidance: `docs/policies/csp-rollout.md`.

- **Baseline CSP includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src`** — Common Next.js tradeoff; widens impact if XSS or content injection ever appears. Evidence: `cspDirectives` in `app/next.config.ts`. Aligns with backlog in `docs/security/security-audit.md`.

### Low

- **`POST /api/csp-report` has no explicit request body size limit** — Full body read and `JSON.parse` in `app/app/api/csp-report/route.ts`. Malicious or buggy clients could send very large payloads; no rate limiting on this public endpoint.

- **`GET /api/health` is unauthenticated and probes the database** — Returns connectivity status (`app/app/api/health/route.ts`). Expected for load balancers; minor information disclosure to arbitrary callers.

- **Permanent account deletion order** — `app/app/api/account/delete-permanent/route.ts` deletes the Prisma user before deleting the Clerk user; failure on the Clerk step is logged but can leave a Clerk identity without an app row (operational hygiene, not privilege escalation).

## Evidence reviewed

| Area | Paths / notes |
|------|----------------|
| **Auth boundary (Clerk)** | `app/proxy.ts` — public routes: `/`, sign-in/up, marketing, `/api/billing/webhook`, `/api/contact`, `/api/csp-report`, `/api/health`; all other matched routes use `auth.protect()` |
| **App user resolution** | `app/lib/auth.ts` — `getAppUser`, `getActiveAppUser`, `isAdmin` (`ADMIN_EMAILS`) |
| **API `getAppUser` usage** | Only `app/app/api/account/restore/route.ts` (grep on `app/api/**`) |
| **API `getActiveAppUser` coverage** | All other `app/app/api/**/route.ts` handlers use `getActiveAppUser` where auth is required; webhook/health/csp-report excluded by design |
| **Newer / additional protected routes (this pass)** | `app/app/api/me/route.ts` (GET/PATCH profile), `app/app/api/rentcast-quota/route.ts`, `app/app/api/billing/subscription-details/route.ts` — all use `getActiveAppUser` |
| **IDOR / scoping** | `app/app/api/properties/[id]/route.ts` — `getPropertyForUser` with `{ id, userId }`; same pattern on deals/mortgages routes reviewed via grep |
| **Stripe webhook** | `app/app/api/billing/webhook/route.ts` — signature header, `constructEvent`, sync by metadata / `stripeCustomerId`, Sentry on unresolved user |
| **Billing (user)** | `create-checkout-session`, `sync`, `portal`, `status`, `subscription-details` — `getActiveAppUser`, Zod/checkout validation; checkout rate-limited |
| **Env / secrets** | `app/lib/env.ts` — `validateEnv` for DB + Clerk + Stripe; `assertStripeWebhookSecretForVercelDeploy` from `app/instrumentation.ts`; `app/.env.example` for server vs `NEXT_PUBLIC_*` |
| **Stripe config** | `app/lib/stripe-config.ts` — keys from `process.env` only |
| **Prisma** | `app/lib/db.ts` — `validateEnv()` at import; `app/app/api/health/route.ts` — tagged `SELECT 1` only |
| **CSP / headers** | `app/next.config.ts` — security headers, CSP directives, Sentry wrapper (`SENTRY_AUTH_TOKEN` optional for build) |
| **CSP reporting** | `app/app/api/csp-report/route.ts`, `app/lib/csp-report.ts` |
| **Rate limiting** | `app/lib/rate-limit.ts` — `RATE_LIMITS` map; used on properties POST, deals POST, import, export, billing checkout, account delete routes; contact uses `ContactFormSubmission` count; rent estimate uses `RentCastApiCall` table (per `app/app/api/estimates/rent/route.ts`) |
| **Admin** | `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts` — `getActiveAppUser` + `isAdmin`, structured `console.info` audit lines |
| **Account delete** | `app/app/api/account/delete-permanent/route.ts` — Zod + `confirmText` literal `DELETE` + password verification via Clerk; rate limited |
| **Public POST contact** | `app/app/api/contact/route.ts` — honeypot, Zod, IP/user rate limit via `contactFormSubmission` |
| **Client UTM attribution** | `app/lib/utm-attribution.ts` — localStorage only; no server secrets |
| **Server analytics** | `app/lib/posthog-server.ts` — optional capture; `NEXT_PUBLIC_POSTHOG_KEY` (project key model) |
| **Reference docs** | `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`, `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/policies/csp-rollout.md` |
| **Prior audit** | `docs/audits/security/2026-03-30-security-audit-3.md` |

**Assumptions / limits:** Static and documentation review only; no production traffic analysis, penetration test, or dependency SCA in this lane. Clerk, Stripe, Resend, and PostHog security models are trusted as implemented by those vendors.

## Risk & impact assessment

Unresolved **medium** items primarily affect **defense-in-depth** (CSP enforcement timing and `script-src` strictness), not an immediate authentication bypass. **Low** items are **availability/abuse** (large CSP report bodies), **accepted operational** exposure (health check), or **orphan identity** edge cases after failed Clerk delete. Expanded rate limits reduce **write-heavy abuse** risk versus the historical gap noted in `docs/security/security-audit.md` (non-Rent endpoints).

## Recommendations (prioritized)

1. **Production CSP:** Confirm whether `CSP_ENFORCEMENT=true` is set in production after triage; if not yet, keep `docs/policies/csp-rollout.md` triage active and schedule enforcement when violation noise is acceptable.

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
