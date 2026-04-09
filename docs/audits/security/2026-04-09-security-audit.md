# Security & Privacy Audit — 2026-04-09

## Executive summary

- **Overall posture: strong.** Clerk gates non-public traffic via `app/proxy.ts`; portfolio APIs use `getActiveAppUser()` with a documented `getAppUser()` exception for account restore; Stripe webhooks verify signatures; cron jobs are both allowlisted for unauthenticated platform calls and gated by `CRON_SECRET`; security headers, HSTS, and CSP (Report-Only unless enforced) ship from `app/next.config.ts`.
- **Top gap (Medium):** Several admin API handlers call `checkRateLimit` with action keys that are **not** defined in `app/lib/rate-limit.ts` `RATE_LIMITS`, so those checks are no-ops (`checkRateLimit` returns `allowed: true` when the action is missing). This weakens abuse throttling for a compromised admin session (e.g. repeated trial emails or billing sync calls).
- **Standing items:** CSP defaults to Report-Only until `CSP_ENFORCEMENT=true`; `connect-src` allows any `https:` origin, which limits CSP as a data-exfiltration control; anonymous IP rate limits use the first `X-Forwarded-For` hop (spoofable without a trusted edge).
- **Recommendation:** Add `RATE_LIMITS` entries for `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (or align route code to existing keys), refresh `docs/security/security-audit.md` §6 to match `RATE_LIMITS`, then continue CSP report review before enforcing in production.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass. *(A prior concern that some `/api/cron/*` paths were missing from `isPublicRoute` is **not** current: `app/proxy.ts` lists all seven crons from `vercel.json`, including `milestone-emails`, `monthly-refresh`, `monthly-digest`, and `winback-emails`.)*

### Medium

- **Admin `checkRateLimit` calls are ineffective for three routes** — `checkRateLimit` in `app/lib/rate-limit.ts` returns `{ allowed: true }` when `RATE_LIMITS[action]` is undefined (lines 46–47). Routes still invoke it with `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (`app/app/api/admin/users/[id]/trial/route.ts`, `trial-email/route.ts`, `billing-sync/route.ts`), but only `admin:tier-patch` appears in `RATE_LIMITS`. **Risk/impact:** Misleading defense-in-depth; a stolen admin session could hammer Resend/Stripe or mutate trials without hourly caps from `ApiRateLimitEntry`.

- **CSP is Report-Only unless explicitly enforced** — `app/next.config.ts` sets `Content-Security-Policy-Report-Only` when `CSP_ENFORCEMENT` is not `"true"` (lines 31–35). **Risk/impact:** Violations are reported, not blocked; XSS reliance remains on framework/React patterns and other headers until enforcement.

- **`connect-src` includes `https:`** — CSP string in `app/next.config.ts` (line 24) allows connections to any HTTPS origin. **Risk/impact:** Weaker constraint on exfiltration or unexpected third-party calls from injected script if other controls fail.

### Low

- **IP-derived rate identifiers use leftmost `X-Forwarded-For`** — `getRateLimitIdentifier` in `app/lib/rate-limit.ts` (lines 34–39) takes the first forwarded hop. **Risk/impact:** Without a platform-normalized client IP, anonymous limits (`csp-report:post`, contact form IP bucket in `app/app/api/contact/route.ts`) can be skewed by client-supplied headers.

- **Documentation drift vs `RATE_LIMITS`** — `docs/security/security-audit.md` §6 table omits `places:autocomplete` / `places:details` and does not mention the admin action keys used in code. **Risk/impact:** Operators and future audits may misjudge coverage.

- **`CRON_SECRET` not validated in `validateEnv()`** — `app/lib/env.ts` does not require `CRON_SECRET` at startup; cron handlers return 500 when unset (`app/app/api/cron/onboarding-emails/route.ts` pattern). **Risk/impact:** Misconfiguration surfaces at first scheduled invocation, not at deploy (contrast `assertStripeWebhookSecretForVercelDeploy` in `app/instrumentation.ts`).

## Evidence reviewed

- **Process / template:** `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- **Security references:** `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md` (API conventions, security checklist, observability)
- **Auth boundary:** `app/proxy.ts` (`isPublicRoute`, `clerkMiddleware`, `config.matcher`)
- **Auth / admin:** `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)
- **API surface (sampled + grep):** all `app/app/api/**/route.ts` (48 handlers); grep for `getActiveAppUser` / `getAppUser`
- **Webhooks:** `app/app/api/billing/webhook/route.ts` (Stripe signature verification, idempotency notes)
- **Cron / unsubscribe:** `app/app/api/cron/*/route.ts`, `vercel.json`, `app/app/api/unsubscribe/route.ts`, `app/lib/emails/onboarding-reengagement.ts` (HMAC helpers)
- **Secrets / env:** `app/lib/env.ts`, `app/instrumentation.ts`, `RealEstatePortfolio/.gitignore`, `app/.gitignore`
- **CSP / headers:** `app/next.config.ts`
- **Rate limits:** `app/lib/rate-limit.ts`, usages in API routes; RentCast quota in `app/app/api/estimates/rent/route.ts`, `value/route.ts`, `properties/[id]/benchmark/refresh/route.ts`
- **Public / sensitive endpoints:** `app/app/api/health/route.ts`, `app/app/api/csp-report/route.ts`, `app/app/api/contact/route.ts`

**Assumptions / limits:** Read-only review of the repository; no production log review, penetration test, or dependency SCA run in this lane. Clerk dashboard configuration and Vercel project secrets were not directly inspected.

## Risk & impact assessment

Unresolved **Medium** items mainly affect **defense in depth** (CSP enforcement timing, admin rate-limit alignment) and **operational clarity** (docs). Likelihood of material incident depends on rare events (admin credential compromise, XSS chain). **Low** items are noise, documentation, or edge-configuration timing. User data scoping and webhook integrity remain well aligned with documented policy.

## Recommendations (prioritized)

1. Define `RATE_LIMITS` for `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (or change those routes to reuse documented keys) so `recordRateLimit` / `checkRateLimit` actually cap abuse.
2. Update `docs/security/security-audit.md` §6 to mirror `app/lib/rate-limit.ts` and the admin action strings used in handlers.
3. Continue sampling CSP reports (Sentry `signal=csp` / `/api/csp-report` path) and, when stable, enable `CSP_ENFORCEMENT=true` in production.
4. Consider documenting or tightening IP extraction for rate limits (trust only platform-injected IP headers on Vercel, or use Vercel’s geolocation/IP primitives if adopted).

## Task candidates (optional)

- [ ] Add missing `RATE_LIMITS` entries for admin trial / trial-email / billing-sync actions and verify 429 behavior in staging.
- [ ] Sync `docs/security/security-audit.md` §6 rate-limit table with `app/lib/rate-limit.ts`.
- [ ] Optional: extend `validateEnv()` or Vercel-only assert for `CRON_SECRET` if crons are always deployed on Vercel.

## Re-test checklist

- [ ] After rate-limit fix: exercise admin trial / trial-email / billing-sync routes until 429; confirm `ApiRateLimitEntry` rows.
- [ ] After CSP enforcement: smoke-test Clerk sign-in, Stripe checkout, PostHog, and marketing scripts.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly security lane, or after material changes to auth, billing, webhooks, proxy public routes, CSP, or rate limiting.
- **Recommended next run:** 2026-05-09 (monthly) or before next production release touching those surfaces.
