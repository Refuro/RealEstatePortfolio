# Security & Privacy Audit — 2026-04-29

## Executive summary

- **Overall posture remains strong.** Clerk gates non-public traffic via `app/proxy.ts`; portfolio and billing APIs consistently use `getActiveAppUser()` with the documented `getAppUser()` exception only on `app/app/api/account/restore/route.ts`; Stripe webhooks verify signatures; cron jobs require `Authorization: Bearer ${CRON_SECRET}`; permanent account deletion re-verifies password via Clerk and enforces Zod + rate limits; `app/next.config.ts` applies HSTS, framing/content-type/referrer/permissions headers, and CSP (report-only unless `CSP_ENFORCEMENT=true`).
- **Top gaps are defense-in-depth and documentation accuracy**, not broken tenant isolation: several admin routes call `checkRateLimit` with action keys missing from `app/lib/rate-limit.ts` `RATE_LIMITS`, so those checks never enforce hourly caps; canonical security docs still describe **`csp-report:post` via `ApiRateLimitEntry`**, while **`POST /api/csp-report` uses only the in-memory** limiter in `app/lib/csp-rate-limit.ts` (240/hour per identifier per instance).
- **Recommendation:** Add `RATE_LIMITS` entries for the three admin actions (or align keys); reconcile `docs/security/security-notes.md`, `docs/security/security-audit.md` §6–§7, and `docs/reference/complete-engineering-reference.md` CSP rate-limit language with `csp-rate-limit.ts` + `rate-limit.ts`; continue CSP report review before `CSP_ENFORCEMENT=true` in production.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Admin `checkRateLimit` is a no-op for three routes** — `checkRateLimit` returns `{ allowed: true }` when `RATE_LIMITS[action]` is undefined (`app/lib/rate-limit.ts`, lines 44–45). Handlers still call it with `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (`app/app/api/admin/users/[id]/trial/route.ts`, `trial-email/route.ts`, `billing-sync/route.ts`), while `RATE_LIMITS` only defines `admin:tier-patch` among admin keys. **Risk/impact:** Misleading defense-in-depth; a compromised admin session could stress Stripe/Resend or mutate trials without DB-backed hourly caps.

- **CSP defaults remain Report-Only; `connect-src` is broadly permissive** — `app/next.config.ts` emits `Content-Security-Policy-Report-Only` unless `CSP_ENFORCEMENT === "true"` (lines 32–36); `connect-src` includes `https:` (line 24). **Risk/impact:** Violations are observed (via `/api/csp-report` / Sentry), not blocked, until enforcement; a hypothetical script-injection scenario would face weaker outbound connectivity constraints than a tight allowlist.

- **Documentation mismatch on CSP report rate limiting** — `docs/security/security-notes.md` states **`csp-report:post` … via `ApiRateLimitEntry`**, and `docs/security/security-audit.md` §6 lists `csp-report:post` | 240 in the `RATE_LIMITS` table; `app/lib/rate-limit.ts` **does not define** `csp-report:post`, and `app/app/api/csp-report/route.ts` applies **`checkCspRateLimit`** from `app/lib/csp-rate-limit.ts` (in-memory `Map`, documented as not a distributed gate). **Risk/impact:** Operators and auditors may assume durable, cross-instance DB limits that do not exist; incident/abuse assessment could be wrong.

### Low

- **`docs/security/security-audit.md` §7 vs implementation** — §7 still describes `GET /api/health` returning database connectivity; `app/app/api/health/route.ts` returns only `{ status: "ok" }` with no DB probe (aligned with `docs/security/security-notes.md` line 27).

- **`RATE_LIMITS` table drift** — §6 omits some keys present in code (`places:autocomplete`, `places:details`) and lists `csp-report:post` as if backed by `RATE_LIMITS` / `ApiRateLimitEntry`.

- **`CRON_SECRET` not in `validateEnv()`** — `app/lib/env.ts` required list excludes `CRON_SECRET`; cron handlers return 500 when unset (`app/app/api/cron/onboarding-emails/route.ts`, pattern repeated across cron routes). **Risk/impact:** Misconfiguration may surface at first scheduled run rather than deploy.

- **IP-derived rate identifiers use leftmost `X-Forwarded-For`** — `getRateLimitIdentifier` in `app/lib/rate-limit.ts` (lines 32–37); `/api/contact` duplicates similar logic (`app/app/api/contact/route.ts`, lines 10–15). **Risk/impact:** Correct on typical Vercel setups; fragile if untrusted clients could spoof forwarded chains without platform normalization.

- **Unsubscribe UX says “expired”; tokens are not time-bounded** — `app/app/api/unsubscribe/route.ts` returns “Invalid or expired unsubscribe link” on bad tokens (line 49); HMAC verification in `app/lib/emails/onboarding-reengagement.ts` has no expiry embedded. **Risk/impact:** Low privacy/abuse modeling concern if a link leaks.

- **Some admin routes lack `ApiRateLimitEntry` caps** — e.g. `app/app/api/admin/email-preview/route.ts`, `app/app/api/admin/resubscribe-self/route.ts` rely on `isAdmin()` only (consistent with notes for low-volume admin tooling). **Risk/impact:** Optional hardening if abuse of a stolen admin session is a driver.

## Evidence reviewed

- **Process / template:** `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- **Security references:** `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md` (§2.4 API conventions, §3 security checklist, §2.6 observability)
- **Auth boundary:** `app/proxy.ts` (`isPublicRoute`, `clerkMiddleware`, `config.matcher`)
- **Auth helpers:** `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)
- **API inventory:** All `app/app/api/**/route.ts` handlers (48 files); grep for `getActiveAppUser` / `getAppUser` — sole `getAppUser` usage on `app/app/api/account/restore/route.ts`
- **Webhooks:** `app/app/api/billing/webhook/route.ts` (signature verification via `constructEvent`)
- **Cron / unsubscribe:** `app/app/api/cron/*/route.ts` (Bearer + `CRON_SECRET`), `app/app/api/unsubscribe/route.ts`
- **Secrets / env / deploy guards:** `app/lib/env.ts`, `app/instrumentation.ts` (stripe/public URL asserts per existing patterns)
- **CSP / headers:** `app/next.config.ts`
- **Rate limits:** `app/lib/rate-limit.ts`, `app/lib/csp-rate-limit.ts`, grep `checkRateLimit(` across API routes
- **Sensitive flows:** `app/app/api/account/delete-permanent/route.ts`, `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`
- **Public endpoints:** `app/app/api/health/route.ts`, `app/app/api/csp-report/route.ts`, `app/app/api/contact/route.ts`

**Assumptions / limits:** Static review of repository state on 2026-04-29; no production log review, penetration test, dependency SCA run, or Clerk/Vercel/Stripe dashboard verification. Third-party subprocessor posture not re-certified.

## Risk & impact assessment

Unresolved **Medium** items mainly weaken **abuse throttling and operational truth** (admin hourly caps, CSP reporting semantics in docs) rather than core **AuthZ** or webhook integrity. **Low** items are documentation accuracy, deploy-time detection of optional cron config, and edge IP semantics. Core patterns (Clerk gating, `userId`-scoped Prisma access, Zod on bodies, Stripe signature verification, password re-check on permanent delete) remain aligned with `docs/security/security-notes.md`.

## Recommendations (prioritized)

1. Define `RATE_LIMITS` entries for `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (or change routes to reuse an existing admin action key) so `checkRateLimit` / `recordRateLimit` enforce hourly caps.
2. Update `docs/security/security-notes.md`, `docs/security/security-audit.md` §6–§7, and `docs/reference/complete-engineering-reference.md` CSP sections to describe **`checkCspRateLimit`** (in-memory, per-instance) vs **`ApiRateLimitEntry`**, or implement DB-backed `csp-report:post` if product requires distributed caps — then align code and docs.
3. Continue sampling CSP reports (Sentry `signal=csp`) and enable `CSP_ENFORCEMENT=true` when stable per `docs/policies/csp-rollout.md`.
4. Add or cross-link an **incident response + key-rotation** runbook (called out in `docs/security/security-audit.md` §1.2).
5. Optional: consider time-bounded unsubscribe tokens if product accepts tradeoffs; optional Vercel assert for `CRON_SECRET` similar to Stripe webhook guard.

## Task candidates (optional)

- [ ] Add `RATE_LIMITS` for `admin:trial-patch`, `admin:trial-email-send`, `admin:billing-sync`; verify 429 behavior in staging.
- [ ] Reconcile CSP reporting rate-limit documentation (and engineering reference table) with `app/lib/csp-rate-limit.ts` and `app/app/api/csp-report/route.ts`; fix §7 health wording vs `app/app/api/health/route.ts`.
- [ ] Optional: assert `CRON_SECRET` on Vercel in `instrumentation.ts` if all deployed projects use cron.

## Re-test checklist

- [ ] After admin rate-limit fix: exercise admin trial, trial-email, and billing-sync until 429; confirm `ApiRateLimitEntry` rows.
- [ ] After doc/code alignment for CSP limits: confirm staging behavior matches written runbooks.
- [ ] After CSP enforcement: smoke-test Clerk, Stripe checkout, PostHog, consented marketing scripts.
- [ ] `npm run check` (when application code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly security lane, or after material changes to auth, billing, webhooks, `proxy.ts` public routes, CSP, rate limiting, or privacy copy.
- **Recommended next run:** 2026-05-29 (monthly) or before the next production release touching those surfaces.
