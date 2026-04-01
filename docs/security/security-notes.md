# Security notes

Recorded as we build. For manual security steps (e.g. production keys, webhooks), see [manual-steps.md](../setup/manual-steps.md).

**Last reviewed:** 2026-03-31  
**Review cadence:** Monthly (or after material auth/billing/security changes)

---

## Current setup (Phases 0–2)

- **Auth:** Clerk; proxy (`app/proxy.ts`) protects non-public routes. Public routes include marketing pages, `/api/billing/webhook`, `/api/contact`, `/api/csp-report` (CSP violation reports from anonymous browsers; no auth), `/api/health`, and auth-related paths.
- **Authorization:** Protected APIs use `getActiveAppUser()` so soft-deleted accounts cannot read or mutate portfolio data. `getAppUser()` remains for layout and account-restore flows where a deleted user must load the shell. All data access scoped by `userId`. No IDOR risk for properties/mortgages.
- **Input:** Request bodies validated with Zod before use; invalid input returns 400.
- **Secrets:** Env vars only; `.env*` gitignored; no secrets in code.
- **DB:** Prisma only (parameterized queries).

---

## As we go

- *Add any new security-related decisions or findings here (e.g. new APIs, auth changes, rate limiting, headers).*

- **Google Ads (gtag)** — When `NEXT_PUBLIC_GOOGLE_ADS_ID` is set, the root layout loads `gtag.js` from Google for ads measurement (client-side third-party script). ID is public; no secret. See privacy policy for disclosure.
- **CSP reporting** — `POST /api/csp-report` remains public for anonymous browser submissions. In development it logs compact reports to the server console; in production it forwards grouped, sampled CSP violations to Sentry (tag `signal=csp`) so rollout monitoring is visible without flooding events.

- Audit lane reference: `docs/process/security-audit-process.md` and `docs/audits/security/`.

---

## Security headers + CSP + `ApiRateLimitEntry` (2026-03)

- **Security headers** — `app/next.config.ts` `headers()` for `/:path*`: X-Frame-Options (DENY), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy (camera, microphone, geolocation disabled).
- **CSP** — Same file builds a `Content-Security-Policy` string (Clerk, Stripe checkout iframes, Cloudflare Turnstile if used, `connect-src https:`, etc.). Default deployment uses **`Content-Security-Policy-Report-Only`** unless `CSP_ENFORCEMENT=true`, in which case the enforced **`Content-Security-Policy`** header is sent. Optional `report-uri` to `/api/csp-report` when `NEXT_PUBLIC_APP_URL` is set. Full directive list: [security-audit.md](./security-audit.md) §5.
- **Route rate limits** — Sensitive routes use `lib/rate-limit.ts` (`RATE_LIMITS`, rolling 1h, `ApiRateLimitEntry`). Table of actions: [security-audit.md](./security-audit.md) §6.

---

## RentCast hourly quota (shared pool)

**Canonical doc:** [reference/rentcast-quota.md](../reference/rentcast-quota.md).

- **Limits by tier:** `RENTCAST_HOURLY_LIMITS` in `app/lib/plans.ts` — **Free: 5**, **Investor: 10**, **Pro: 20** successful upstream calls per rolling hour (not the same as legacy “20/hour for rent only”).
- **Shared counter:** Each successful RentCast-backed response increments one `RentCastApiCall` row. **Rent estimate, value estimate, and benchmark refresh** all count toward the **same** hourly cap for the user.
- **Routes:** `GET /api/estimates/rent`, `GET /api/estimates/value`, `POST /api/properties/[id]/benchmark/refresh` (after successful provider response). Failed calls do not insert rows and do not consume quota.
- **UI:** `GET /api/rentcast-quota` + `RentCastQuotaHint` surface remaining uses before 429.

---

## Security audit (rolling)

- See [security-audit.md](./security-audit.md) for full assessment and CSP/rate-limit tables.
- **Summary:** Auth, authorization, input validation, secrets, webhooks, and deleted-account controls remain strong. CSP and multiple rate-limit layers are in place; continue monitoring CSP reports before enforcing in production.

---

## Phase 4 — Stripe (implemented)

- **Webhook:** `/api/billing/webhook` is a public route (excluded from Clerk auth in middleware). Security is enforced by verifying the request body with `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent()`; invalid or missing signature returns 400.
- **Secrets:** `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` are server-only (no `NEXT_PUBLIC_`). See manual-steps for webhook URL and key setup.
- **Vercel deploy guard:** `assertStripeWebhookSecretForVercelDeploy()` in `lib/env.ts` runs from `instrumentation.ts` when `VERCEL=1`; missing `STRIPE_WEBHOOK_SECRET` fails startup/build on Vercel so webhook verification cannot be accidentally omitted in deployed environments.
- **Subscription → user resolution:** If a subscription event cannot be mapped to an app user (no `metadata.appUserId` and no `User` row for `stripeCustomerId`), the handler logs a warning and sends a **Sentry** message (`level: warning`) with `subscriptionId`, `customerId`, and `hasMetadataAppUserId` so misconfigured Stripe metadata is visible in production.
- **GET `/api/billing/sync`:** Stripe API failures are logged as structured JSON and reported to **Sentry** with `userId` and `stripeCustomerId` in context (no card or payment details).

---

## Portfolio export abuse control (2026-03)

- **GET `/api/export/portfolio`** — Rate limited via `ApiRateLimitEntry` action `export:portfolio` (15 requests per user per rolling hour; see `lib/rate-limit.ts`). Returns 429 when exceeded. Count is recorded only after a successful CSV response.
- **GET `/api/export/portfolio-summary`** — Same portfolio aggregates as `GET /api/portfolio/summary`, rate limited via action `export:portfolio_summary` (15 requests per user per rolling hour). Used by the print-friendly portfolio summary page.

---

## Admin CSV export (2026-03)

- **GET `/api/admin/export/users`** — Requires `getActiveAppUser()` **and** `isAdmin()` (env `ADMIN_EMAILS`). Intentionally **no** `ApiRateLimitEntry` action: access is already tightly gated; each request emits a structured `console.info` line with admin id/email for audit. Rationale: negligible volume vs operational need for support exports; add rate limiting if abuse is ever observed.

---

## Contact form auth (2026-03)

- **POST `/api/contact`** uses `getActiveAppUser()` for identification. Soft-deleted users receive `null` and are rate-limited by **IP** (same as anonymous), while still submitting `email` in the JSON body — aligns with blocking deleted accounts from privileged APIs without blocking support contact.

---

## Account deletion + deleted user blocking (March 2025)

- **Permanent delete confirmText** — POST `/api/account/delete-permanent` requires `body.confirmText === "DELETE"` (exact, case-sensitive). Returns 400 if missing or incorrect. Closes gap for direct API calls bypassing client validation.
- **Block API access for deleted users** — `getActiveAppUser()` returns null when `user.deletedAt` is set. All protected API routes use `getActiveAppUser()` instead of `getAppUser()`; deleted users receive 401. The restore route and app layout keep `getAppUser()` so deleted users can restore their account.
- **Env validation** — `lib/env.ts` validates `DATABASE_URL`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` at first DB import. Fails fast with clear error if any are missing.
