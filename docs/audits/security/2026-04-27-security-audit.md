# Security & Privacy Audit — 2026-04-27

## Executive summary

- **Overall posture: strong.** Clerk protects non-public routes via `app/proxy.ts`; sensitive portfolio and billing APIs use `getActiveAppUser()` with a narrow `getAppUser()` exception for account restore; Stripe webhooks verify signatures with `STRIPE_WEBHOOK_SECRET`; cron routes are public to the platform but gated by `Authorization: Bearer` + `CRON_SECRET`; security headers, HSTS, and CSP are applied from `app/next.config.ts`; permanent account deletion requires password re-verification and exact `DELETE` confirmation per validation schema.
- **Top risk (Medium):** Three admin handlers still call `checkRateLimit` with action keys that are **not** defined in `app/lib/rate-limit.ts` `RATE_LIMITS`, so those checks are no-ops (`checkRateLimit` returns `allowed: true` when the action is missing). This weakens abuse throttling for a compromised admin session (trial changes, trial emails, billing sync).
- **Standing controls / tradeoffs:** CSP ships as **Report-Only** unless `CSP_ENFORCEMENT=true`; `connect-src` allows any `https:` origin, which limits CSP as an exfiltration control if script execution were ever subverted. Email unsubscribe links use HMAC verification with `crypto.timingSafeEqual` but tokens do not encode expiry.
- **Recommendation:** Add `RATE_LIMITS` entries for the three admin actions (or align route code to existing keys), sync `docs/security/security-audit.md` §6–§7 with `RATE_LIMITS` and the current `GET /api/health` behavior, and continue CSP report review before enforcing in production.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Admin `checkRateLimit` calls are ineffective for three routes** — `checkRateLimit` in `app/lib/rate-limit.ts` returns `{ allowed: true }` when `RATE_LIMITS[action]` is undefined (lines 44–45). Routes still invoke it with `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (`app/app/api/admin/users/[id]/trial/route.ts`, `trial-email/route.ts`, `billing-sync/route.ts`), while `RATE_LIMITS` only defines `admin:tier-patch` (among admin keys). **Risk/impact:** Misleading defense-in-depth; a stolen admin session could hammer Resend/Stripe or mutate trials without hourly `ApiRateLimitEntry` caps.

- **CSP is Report-Only unless explicitly enforced** — `app/next.config.ts` sets `Content-Security-Policy-Report-Only` when `CSP_ENFORCEMENT` is not `"true"`. **Risk/impact:** Violations are reported to `/api/csp-report` / Sentry, not blocked; XSS reliance remains on React/framework patterns and other headers until enforcement.

- **`connect-src` includes `https:`** — CSP string in `app/next.config.ts` allows connections to any HTTPS origin. **Risk/impact:** Weaker constraint on data exfiltration or unexpected third-party calls from injected script if other controls fail.

### Low

- **Documentation drift: health endpoint** — `docs/security/security-audit.md` §7 describes `GET /api/health` as returning database connectivity (`connected` / `disconnected`). The implementation in `app/app/api/health/route.ts` returns only `{ "status": "ok" }` and explicitly avoids a DB probe. `docs/security/security-notes.md` (line 27) matches the code. **Risk/impact:** Operators and future audits may assume DB-aware health semantics that production does not provide.

- **Documentation drift: rate-limit table** — `docs/security/security-audit.md` §6 omits `places:autocomplete` and `places:details` (present in `app/lib/rate-limit.ts`) and does not list the admin action strings used outside `admin:tier-patch`. **Risk/impact:** Misjudged coverage during review.

- **IP-derived rate identifiers use leftmost `X-Forwarded-For`** — `getRateLimitIdentifier` in `app/lib/rate-limit.ts` (lines 32–37) uses the first forwarded hop for anonymous identifiers. **Risk/impact:** Anonymous limits (`/api/csp-report` also uses this pattern via `getRateLimitIdentifier`) can be skewed if client-controlled headers are trusted without a normalized edge IP (Vercel typically sets `x-forwarded-for` correctly).

- **`CRON_SECRET` not required in `validateEnv()`** — `app/lib/env.ts` does not list `CRON_SECRET` in `REQUIRED_ENV_VARS`. Cron handlers return 500 when unset. **Risk/impact:** Misconfiguration may surface at first scheduled invocation rather than at deploy (contrast `assertStripeWebhookSecretForVercelDeploy` in `app/instrumentation.ts`).

- **Unsubscribe tokens do not expire** — `app/lib/emails/onboarding-reengagement.ts` builds HMAC-SHA256 over `userId` only; `verifyUnsubscribeToken` uses timing-safe comparison. **Risk/impact:** A leaked email link remains valid indefinitely for that user’s preferences (low likelihood, but relevant to privacy/abuse modeling).

- **CSP report rate limit is in-memory per instance** — `app/lib/csp-rate-limit.ts` documents that the limit is not a hard distributed gate in serverless. **Risk/impact:** Abuse could still stress Sentry or logs at platform scale; acceptable as noise control, not a strong global cap.

## Evidence reviewed

- **Process / template:** `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- **Security references:** `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md` (API conventions, security checklist, observability)
- **Auth boundary:** `app/proxy.ts` (`isPublicRoute`, `clerkMiddleware`, `config.matcher`)
- **Auth:** `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)
- **API surface:** Enumerated `app/app/api/**/route.ts` handlers; grep for `getActiveAppUser` / `getAppUser` (restore route is the only API using `getAppUser`, as expected)
- **Webhooks:** `app/app/api/billing/webhook/route.ts` (signature verification)
- **Cron / unsubscribe:** `app/app/api/cron/*/route.ts` (Bearer + `CRON_SECRET` pattern), `app/app/api/unsubscribe/route.ts`, `app/lib/emails/onboarding-reengagement.ts`
- **Secrets / env:** `app/lib/env.ts`, `app/instrumentation.ts`
- **CSP / headers:** `app/next.config.ts`
- **Rate limits:** `app/lib/rate-limit.ts`, `app/lib/csp-rate-limit.ts`, sampled API routes
- **Sensitive flows:** `app/app/api/account/delete-permanent/route.ts`, `app/app/api/account/restore/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`
- **Public endpoints:** `app/app/api/health/route.ts`, `app/app/api/csp-report/route.ts`, `app/app/api/contact/route.ts`
- **Privacy surface (marketing):** `app/app/privacy/page.tsx` (existence only; content not re-audited line-by-line)

**Assumptions / limits:** Read-only review of the repository state on 2026-04-27; no production log review, penetration test, dependency SCA run, or Clerk/Vercel dashboard inspection. This lane does not re-certify third-party subprocessors; it checks application patterns and documented controls.

## Risk & impact assessment

Unresolved **Medium** items mainly affect **defense in depth** (CSP enforcement timing, admin rate-limit alignment) rather than a clear break in tenant isolation or webhook integrity. **Low** items are documentation accuracy, edge IP semantics, and operational timing of misconfiguration detection. Core patterns (Clerk session gating, `userId`-scoped Prisma queries, Zod on API bodies, Stripe signature verification, HMAC unsubscribe) remain aligned with `docs/security/security-notes.md`.

## Recommendations (prioritized)

1. Define `RATE_LIMITS` entries for `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (or change those routes to reuse an existing key) so `checkRateLimit` / `recordRateLimit` enforce hourly caps.
2. Update `docs/security/security-audit.md` §6 to mirror `app/lib/rate-limit.ts` and list all action keys used in code; update §7 to match `app/app/api/health/route.ts` (no DB probe) or add an explicit “ops-only” health route if DB checks are required elsewhere.
3. Continue sampling CSP reports (Sentry / `signal=csp`) and, when stable, enable `CSP_ENFORCEMENT=true` in production.
4. Add or link an **incident response + key-rotation** runbook in `docs/` (called out in `docs/security/security-audit.md` §1.2) so operational readiness matches technical controls.
5. Optional: consider time-bounded unsubscribe tokens (nonce + expiry) if product accepts one-time re-auth for email preferences.

## Task candidates (optional)

- [ ] Add `RATE_LIMITS` entries for `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync`; verify 429 behavior and `ApiRateLimitEntry` rows in staging.
- [ ] Sync `docs/security/security-audit.md` §6–§7 with `app/lib/rate-limit.ts` and `app/app/api/health/route.ts`.
- [ ] Optional: Vercel-only assert for `CRON_SECRET` in `instrumentation.ts` (or `validateEnv`) if all cron routes are always deployed.
- [ ] Optional: document trusted IP header behavior for Vercel for future rate-limit hardening.

## Re-test checklist

- [ ] After admin rate-limit fix: exercise admin trial, trial-email, and billing-sync routes until 429; confirm `ApiRateLimitEntry` rows.
- [ ] After CSP enforcement: smoke-test Clerk sign-in, Stripe checkout, PostHog, and consented marketing scripts.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly security lane, or after material changes to auth, billing, webhooks, proxy public routes, CSP, rate limiting, or privacy copy.
- **Recommended next run:** 2026-05-27 (monthly) or before the next production release touching those surfaces.
