# Security & Privacy Audit — 2026-03-28

## Executive summary

- **Overall:** **Clerk** gates non-public routes via `app/proxy.ts`; protected APIs consistently use **`getActiveAppUser()`** with **userId-scoped** Prisma queries, **Zod** validation on JSON bodies, and **Stripe webhook signature verification**. **Security headers** (frame denial, nosniff, referrer, permissions policy) and **CSP (report-only)** are set in `app/next.config.ts`. **DB-backed rate limits** cover several sensitive writes (properties, deals, import, account delete, billing checkout); **RentCast** routes use per-user hourly limits via `rentCastApiCall`.
- **Top risks:** **CSP is not enforcing** (report-only); **Stripe webhook secret** is not part of startup `validateEnv()`; several **high-value read/export** paths have **no** shared `checkRateLimit` pattern; **rent vs. value** estimates share one hourly counter.
- **Recommendation:** Treat CSP graduation and webhook env parity as release hardening; extend targeted rate limits where cost or abuse sensitivity is high; keep `proxy.ts` public-route list in code review scope.

## Severity-ranked findings

### Critical

- *(none identified)*

### High

- **CSP not enforcing** — `Content-Security-Policy-Report-Only` informs monitoring but does not block violations; XSS or injection in third-party scripts remains a class of risk until a tuned enforced policy ships. — `app/next.config.ts`

- **Webhook secret not in startup env validation** — `validateEnv()` in `app/lib/env.ts` requires `DATABASE_URL`, `CLERK_SECRET_KEY`, and `STRIPE_SECRET_KEY` but not `STRIPE_WEBHOOK_SECRET`. A missing webhook secret surfaces when the webhook handler runs (`getWebhookSecret()` in `app/lib/stripe-config.ts`), not at process boot—higher risk of **silent deploy misconfiguration** until first webhook traffic. — `app/lib/env.ts`, `app/lib/stripe-config.ts`

### Medium

- **Export and large read surfaces without shared write-style rate limits** — Portfolio CSV export (`app/app/api/export/portfolio/route.ts`) and admin user CSV (`app/app/api/admin/export/users/route.ts`) authenticate and scope data correctly but are not covered by `app/lib/rate-limit.ts` actions; repeated calls could stress DB/CPU or facilitate bulk scraping of own data for abuse automation. — `app/lib/rate-limit.ts`, export routes

- **RentCast hourly limit shared between rent and value APIs** — Both `app/app/api/estimates/rent/route.ts` and `app/app/api/estimates/value/route.ts` count against `prisma.rentCastApiCall` with the same hourly cap (`getRentCastHourlyLimit`), so one flow can starve the other and complicates cost/abuse attribution. — both estimate routes, `app/lib/plans.ts` (limit helpers)

- **Public route allowlist maintenance** — `createRouteMatcher` in `app/proxy.ts` must include `/api/billing/webhook`, `/api/health`, `/api/contact`, and marketing pages; forgetting to add a new public page or webhook path either blocks legitimate traffic or (if misclassified elsewhere) could expose routes—**operational** rather than immediate code flaw. — `app/proxy.ts`

### Low

- **Health endpoint information** — `GET /api/health` returns DB connectivity status without auth (intentional for probes); acceptable for ops; minimal info disclosure if exposed broadly. — `app/app/api/health/route.ts`

- **Estimate error responses use HTTP 200** — On upstream failure, rent/value routes may return JSON with an `error` field and status **200** (see catch paths), which can confuse clients and complicate monitoring vs. true success. — `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`

- **Contact API uses `getAppUser()`** — `app/app/api/contact/route.ts` uses `getAppUser()` (not `getActiveAppUser()`), so a **soft-deleted** user with a valid Clerk session could still submit the public contact form; narrow edge case. — `app/app/api/contact/route.ts`, `app/lib/auth.ts`

- **Security notes review date** — `docs/security/security-notes.md` lists **Last reviewed: 2026-03-19**; refresh when material security changes land to match operational expectations in that file. — `docs/security/security-notes.md`

## Evidence reviewed

- **Auth / proxy:** `app/proxy.ts` (public routes, Clerk `auth.protect()`)
- **Auth helpers:** `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)
- **Env / DB bootstrap:** `app/lib/env.ts`, `app/lib/db.ts`
- **Rate limiting:** `app/lib/rate-limit.ts`; consumers in `app/app/api/properties/route.ts`, `deals/route.ts`, `import/portfolio/route.ts`, `account/delete*.ts`, `billing/create-checkout-session/route.ts`
- **Estimates / external API cost:** `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`
- **Billing:** `app/app/api/billing/webhook/route.ts`, `app/lib/stripe-config.ts`, `app/app/api/billing/sync/route.ts`, `create-checkout-session`, `portal`, `status`, `subscription-details`
- **Account:** `app/app/api/account/delete/route.ts`, `delete-permanent/route.ts`, `restore/route.ts`
- **Admin:** `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/(app)/admin/layout.tsx`
- **Import / export:** `app/app/api/import/portfolio/route.ts`, `import/portfolio/template/route.ts`, `app/app/api/export/portfolio/route.ts`
- **Representative data scoping:** `app/app/api/properties/[id]/route.ts` (`getPropertyForUser`)
- **Public contact:** `app/app/api/contact/route.ts`
- **Headers:** `app/next.config.ts`
- **Docs:** `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/runbooks/incident-response.md`, `docs/setup/manual-steps.md`, `app/.env.example`

**Assumptions / limits:** Review was static (no penetration test, no `npm audit` execution this pass). Third-party (Clerk, Stripe, Vercel) security relies on their controls and configuration.

## Risk & impact assessment

Unresolved **High** items mainly affect **defense-in-depth** (CSP) and **deployment correctness** (webhook secret). **Medium** items raise **cost**, **availability**, and **operational** risk more than direct tenant cross-access—the app’s **userId scoping** pattern for property/deal data remains sound based on sampled routes.

## Recommendations (prioritized)

1. **CSP:** Plan transition from report-only to enforced CSP using violation telemetry (`report-to` / Sentry / dedicated endpoint) and staged allowlists for Clerk, Stripe, PostHog, Sentry, and ads tag as applicable.
2. **Stripe:** Include `STRIPE_WEBHOOK_SECRET` in production deployment checks; optionally add to `validateEnv()` for production builds or document a strict CI gate.
3. **Rate limits:** Add targeted limits for **CSV exports** and consider **billing/sync** GET if client-side triggers allow hammering Stripe list APIs.
4. **RentCast:** Split counters or document product behavior so rent vs. value limits are predictable; align with vendor cost model.
5. **Process:** Keep `proxy.ts` public-route updates on PR checklist; refresh `security-notes.md` after material changes.

## Task candidates

- [ ] Add **`STRIPE_WEBHOOK_SECRET`** to production validation or documented deploy gate (align with `docs/setup/manual-steps.md`).
- [ ] Add **rate limiting** (or equivalent abuse control) for **`GET /api/export/portfolio`** and optionally **admin user export**.
- [ ] **CSP:** Implement violation reporting and a staged **enforcement** plan for `Content-Security-Policy`.
- [ ] **RentCast:** Separate or clearly document **hourly quota** behavior between rent and value estimate endpoints.
- [ ] **Contact route:** Use **`getActiveAppUser()`** or explicitly allow deleted-user contact with documented behavior.
- [ ] **Estimate APIs:** Return **non-2xx** HTTP status on hard failures where safe, for consistent client and monitoring semantics.

## Re-test checklist

- [ ] Verify CSP / reporting pipeline before flipping to enforced CSP.
- [ ] Deploy with missing `STRIPE_WEBHOOK_SECRET` in staging—confirm fail-fast or documented gate.
- [ ] Authenticated: hammer export and estimate routes—confirm 429 behavior matches expectations.
- [ ] `npm run check` after any code changes from follow-up tasks.

## Next trigger and cadence

- **Trigger:** Changes to auth, `proxy.ts`, billing, webhooks, admin, import/export, or security headers.
- **Recommended next run:** Within **one month** or before **production launch** milestone.
