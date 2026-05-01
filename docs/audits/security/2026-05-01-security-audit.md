# Security & Privacy Audit — 2026-05-01

## Executive summary

- **Core posture remains strong.** Clerk gates non-public traffic via `app/proxy.ts` with an explicit public allowlist (marketing, Stripe webhook, cron jobs, contact, CSP report, health, unsubscribe). Portfolio and app APIs use `getActiveAppUser()`; `getAppUser()` appears only on `app/app/api/account/restore/route.ts` for deleted-account recovery. Stripe webhooks verify signatures with `constructEvent` and a server-only secret; user data paths reviewed continue to scope by app `userId` with Zod validation on representative mutating routes.
- **Defense-in-depth gap persists and widened in this pass:** four distinct `checkRateLimit` action strings used by admin (or admin-only) handlers are **still missing** from `app/lib/rate-limit.ts` `RATE_LIMITS`, so `checkRateLimit` short-circuits to `{ allowed: true }` while some handlers still call `recordRateLimit` with those action names — no hourly cap and noisy orphan limit rows. **`SEC-2026-04-30-1`** in [`docs/tasks.md`](../../tasks.md) covers three routes; **`admin:milestone-sentinel-backfill`** is a fourth surface found in May.
- **CSP and observability:** production defaults remain **Report-Only** unless `CSP_ENFORCEMENT=true`; `connect-src` allows broad `https:`. CSP POST abuse is constrained by **`checkCspRateLimit`** (in-memory, per instance). Billing sync structured logs and Sentry contexts include **`userId`** and **`stripeCustomerId`** — appropriate for debugging, not payment PANs.
- **Recommendation:** Ship `RATE_LIMITS` entries (or consolidate keys) for all four admin actions; extend the existing task line in `docs/tasks.md` to include `admin:milestone-sentinel-backfill`. Continue CSP sampling before enforcement; optionally assert `CRON_SECRET` when cron is required in a given environment.

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Admin `checkRateLimit` no-op for four actions** — `checkRateLimit` returns `{ allowed: true }` when `RATE_LIMITS[action]` is undefined (`app/lib/rate-limit.ts` lines 44–45). Routes invoke it with **`admin:trial-patch`**, **`admin:trial-email-send`**, **`admin:billing-sync`** (`app/app/api/admin/users/[id]/trial/route.ts`, `trial-email/route.ts`, `billing-sync/route.ts`) and **`admin:milestone-sentinel-backfill`** (`app/app/api/admin/backfill-milestone-sentinels/route.ts`). Only **`admin:tier-patch`** is defined among admin keys in `RATE_LIMITS`. **Risk/impact:** Compromised or misused admin session can hammer Stripe, Resend, or run expensive backfill work without durable hourly caps; `recordRateLimit` may still insert rows that are never consulted because the pre-check exits early.

- **CSP defaults: Report-Only; permissive `connect-src`** — `app/next.config.ts` emits `Content-Security-Policy-Report-Only` unless `CSP_ENFORCEMENT === "true"` (lines 32–36); policy includes `connect-src 'self' https:` (line 24). **Risk/impact:** Violations are visible but not blocked until enforcement; outbound `fetch`/XHR is loosely constrained vs a strict allowlist.

### Low

- **`CRON_SECRET` not in `validateEnv()`** — `app/lib/env.ts` required list covers DB, Clerk, and Stripe secrets only. Cron handlers under `app/app/api/cron/*/route.ts` fail at runtime with 500 if `CRON_SECRET` is unset. **Risk/impact:** Misconfiguration surfaces at first scheduled invocation rather than deploy.

- **IP-derived rate identifiers use leftmost `X-Forwarded-For`** — `getRateLimitIdentifier` in `app/lib/rate-limit.ts` (lines 32–37). **Risk/impact:** Appropriate behind Vercel’s normalized headers; fragile if an untrusted proxy sat in front without consistent forwarding semantics.

- **Development CSP logging** — `app/app/api/csp-report/route.ts` logs full `JSON.stringify(payload)` in development (lines 47–49). **Risk/impact:** Local-only noise; rare chance of URLs or fragments in violation reports — keep dev logs out of shared screens.

- **Unsubscribe copy vs token semantics** — `app/app/api/unsubscribe/route.ts` returns “Invalid or expired unsubscribe link.” on verification failure (line 49); HMAC verification does not encode expiry. **Risk/impact:** Minor UX / accuracy — a bad or tampered token is described as “expired.”

- **Admin trial-email response includes recipient email** — `app/app/api/admin/users/[id]/trial-email/route.ts` JSON message includes `user.email` (line 159). **Risk/impact:** Low — requires `isAdmin()`; could appear in admin browser devtools or logs.

## Evidence reviewed

- **Process / template:** `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- **Security references:** `docs/security/security-notes.md`, `docs/security/security-audit.md` (including §7 health — aligned with code)
- **Auth boundary:** `app/proxy.ts` (`isPublicRoute`, `clerkMiddleware`, `config.matcher`)
- **AuthZ / user resolution:** `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)
- **API auth usage:** grep of `getAppUser` / `getActiveAppUser` across `app/app/api/**/route.ts` — restore route sole `getAppUser` consumer
- **Rate limits:** `app/lib/rate-limit.ts` (`RATE_LIMITS`, `checkRateLimit`, `recordRateLimit`, `getRateLimitIdentifier`), `app/lib/csp-rate-limit.ts`, `app/app/api/csp-report/route.ts`, all `checkRateLimit` call sites under `app/`
- **Webhooks / billing:** `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/sync/route.ts`, `app/instrumentation.ts`, `app/lib/env.ts` (`assertStripeWebhookSecretForVercelDeploy`)
- **Sensitive flows:** `app/app/api/account/delete-permanent/route.ts`, `app/app/api/contact/route.ts`, `app/app/api/unsubscribe/route.ts`
- **CSP / headers:** `app/next.config.ts`
- **Health:** `app/app/api/health/route.ts`
- **Backlog cross-check:** `docs/tasks.md` (`SEC-2026-04-30-1`)

**Assumptions / limits:** Static review of repository state on **2026-05-01**; no production traffic analysis, penetration test, dependency SCA, or third-party dashboard verification. **No application source changes** (audit-only).

## Risk & impact assessment

Unresolved **Medium** items affect **abuse throttling and operational cost** for admin-tier actions, not core tenant isolation (`userId` scoping and soft-delete blocking via `getActiveAppUser()` remain consistent with prior audits). **Low** items are configuration clarity, log hygiene, and copy accuracy.

## Recommendations (prioritized)

1. Add `RATE_LIMITS` entries for **`admin:trial-patch`**, **`admin:trial-email-send`**, **`admin:billing-sync`**, and **`admin:milestone-sentinel-backfill`** (or fewer consolidated keys), so `checkRateLimit` / `recordRateLimit` enforce consistent hourly caps; update [`docs/tasks.md`](../../tasks.md) **`SEC-2026-04-30-1`** to include the backfill route.
2. Continue monitoring CSP reports (Sentry `signal=csp` where configured) before setting `CSP_ENFORCEMENT=true` in production; plan a stricter `connect-src` allowlist when feasible.
3. Optional: assert **`CRON_SECRET`** in `instrumentation.ts` on Vercel when cron jobs are always enabled, or document “fail at first cron” as accepted operational risk.
4. Optional: align unsubscribe error copy with actual failure modes (invalid vs unavailable).

## Task candidates

- [ ] **Extend `SEC-2026-04-30-1` (or follow-on):** add `RATE_LIMITS` for `admin:trial-patch`, `admin:trial-email-send`, `admin:billing-sync`, and `admin:milestone-sentinel-backfill` in `app/lib/rate-limit.ts`; verify 429 behavior and `ApiRateLimitEntry` rows for each route.
- [ ] After rate-limit fix: grep `checkRateLimit(` against `RATE_LIMITS` keys in CI or a short script to prevent future undefined-action drift.
- [ ] Optional: Vercel deploy guard for `CRON_SECRET` when all listed cron routes are production-critical.

## Re-test checklist

- [ ] After admin rate-limit fix: exercise trial PATCH, trial-email POST, billing-sync POST, milestone backfill POST until 429; confirm DB `ApiRateLimitEntry` rows and action names.
- [ ] After CSP enforcement experiment: smoke Clerk, Stripe checkout, PostHog, consented marketing scripts.
- [ ] `npm run check` (when application code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly security lane, or after changes to auth, `proxy.ts` public routes, billing/webhooks, CSP, rate limiting, account deletion, or privacy-sensitive flows.
- **Recommended next run:** **2026-06-01** (monthly) or before the next production release touching those surfaces.
