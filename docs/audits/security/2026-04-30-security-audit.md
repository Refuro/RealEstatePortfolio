# Security & Privacy Audit — 2026-04-30

## Executive summary

- **Core posture remains sound.** Clerk protects non-public routes via `app/proxy.ts` (public allowlist includes webhooks, cron, contact, CSP report, health, unsubscribe). Portfolio and billing APIs use `getActiveAppUser()`; the documented `getAppUser()` exception remains only on `app/app/api/account/restore/route.ts`. Stripe webhooks verify signatures with `constructEvent`; `GET /api/health` is a minimal public liveness probe with no DB touch.
- **Outstanding issues are defense-in-depth and documentation truth**, consistent with the 2026-04-29 lane: three admin routes call `checkRateLimit` with action keys **absent** from `app/lib/rate-limit.ts` `RATE_LIMITS`, so limits are still a no-op; canonical security docs still describe CSP report limiting via `ApiRateLimitEntry` / `csp-report:post`, while `app/app/api/csp-report/route.ts` uses in-memory `checkCspRateLimit` from `app/lib/csp-rate-limit.ts`.
- **Recommendation:** Add `RATE_LIMITS` entries for `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (or rename keys); reconcile `docs/security/security-notes.md`, `docs/security/security-audit.md` §6–§7, and any engineering reference CSP tables with implementation; keep monitoring CSP before `CSP_ENFORCEMENT=true` in production.

**Post-audit (2026-04-30 — doc cleanup Phase F):** Canonical **`docs/security/*`** were updated to match **`checkCspRateLimit`**, the live **`RATE_LIMITS`** table (+ Places keys), and **`GET /api/health`** (`{ status: "ok" }` only). Remaining **admin `RATE_LIMITS` implementation** → **`SEC-2026-04-30-1`** in [`docs/tasks.md`](../../tasks.md).

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Admin `checkRateLimit` still no-op for three routes** — `checkRateLimit` returns `{ allowed: true }` when `RATE_LIMITS[action]` is undefined (`app/lib/rate-limit.ts` lines 44–45). Routes call it with `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (`app/app/api/admin/users/[id]/trial/route.ts`, `trial-email/route.ts`, `billing-sync/route.ts`), but `RATE_LIMITS` only includes `admin:tier-patch` among admin keys (`app/lib/rate-limit.ts`). **Risk/impact:** Compromised admin session could stress Stripe/Resend or mutate trials without durable hourly caps recorded in `ApiRateLimitEntry`.

- **CSP defaults: Report-Only; broad `connect-src`** — `app/next.config.ts` sends `Content-Security-Policy-Report-Only` unless `CSP_ENFORCEMENT === "true"` (lines 32–36); policy includes `connect-src 'self' https:` (line 24). **Risk/impact:** Violations observable but not blocked until enforcement; outbound connectivity is loosely constrained relative to a strict allowlist.

- **Documentation vs implementation: CSP report rate limiting** — *At audit time,* `docs/security/security-notes.md` and `docs/security/security-audit.md` §6 overstated **`ApiRateLimitEntry`** usage for CSP; implementation is **`checkCspRateLimit`** (`app/lib/csp-rate-limit.ts`). **Risk/impact:** Operators may assume distributed DB-backed limits; canonical **`docs/security/*`** was reconciled **2026-04-30 (Phase F)** — see **`SEC-2026-04-30-1`** and remaining admin rate-limit gaps in [`tasks.md`](../../tasks.md).

### Low

- **`docs/security/security-audit.md` §7 vs `GET /api/health`** — §7 still claims response includes database connectivity; `app/app/api/health/route.ts` returns only `{ status: "ok" }` (aligned with the inline note in `docs/security/security-notes.md` for `/api/health`).

- **`RATE_LIMITS` / §6 table drift** — §6 omits or misattributes keys relative to code (e.g. `places:autocomplete`, `places:details` exist in `RATE_LIMITS`; `csp-report:post` does not).

- **Security doc freshness** — `docs/security/security-notes.md` front matter lists **Last reviewed: 2026-04-01**; `docs/security/security-audit.md` **Last updated: 2026-04-04**. Material implementation gaps above are not reflected in those references. **Risk/impact:** Audit and onboarding readers follow stale narratives.

- **`CRON_SECRET` not in `validateEnv()`** — `app/lib/env.ts` required list excludes `CRON_SECRET`; cron routes typically fail at runtime if unset. **Risk/impact:** Misconfiguration may surface at first scheduled invocation rather than deploy.

- **IP-derived rate identifiers use leftmost `X-Forwarded-For`** — `getRateLimitIdentifier` in `app/lib/rate-limit.ts` (lines 32–37). **Risk/impact:** Generally correct behind Vercel; fragile if forwarding chains were attacker-controlled without platform normalization.

- **Unsubscribe copy vs token semantics** — `app/app/api/unsubscribe/route.ts` returns “Invalid or expired unsubscribe link.” on verification failure (line 49); HMAC verification in `app/lib/emails/onboarding-reengagement.ts` has no embedded expiry. **Risk/impact:** Low — misleading UX / privacy modeling if a leaked link is described as “expired.”

- **Some admin tooling routes** — e.g. `app/app/api/admin/email-preview/route.ts`, `app/app/api/admin/resubscribe-self/route.ts` rely on `isAdmin()` without `ApiRateLimitEntry` (low volume by design per historical notes).

## Evidence reviewed

- **Process / template:** `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- **Security references:** `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md` (security checklist, API conventions, observability)
- **Auth boundary:** `app/proxy.ts` (`isPublicRoute`, `clerkMiddleware`, `config.matcher`)
- **Rate limits:** `app/lib/rate-limit.ts`, `app/lib/csp-rate-limit.ts`, `app/app/api/csp-report/route.ts`, admin routes under `app/app/api/admin/users/[id]/`
- **Public / webhook / health:** `app/app/api/billing/webhook/route.ts`, `app/app/api/health/route.ts`
- **Env / deploy guards:** `app/lib/env.ts`
- **CSP / headers:** `app/next.config.ts`
- **`getAppUser` usage:** grep on `app/app/api/**/route.ts` — sole API usage `app/app/api/account/restore/route.ts`

**Assumptions / limits:** Static review of repository state on 2026-04-30; no production traffic analysis, penetration test, dependency SCA, or third-party dashboard verification. No application code was modified (audit-only).

## Risk & impact assessment

Unresolved **Medium** items mainly affect **abuse throttling for specific admin actions** and **accuracy of security documentation** for CSP reporting—not core tenant isolation, which remains `userId`-scoped with Zod on mutating bodies where applicable. **Low** items are operational clarity (cron env validation, doc dates, health wording in one canonical doc).

## Recommendations (prioritized)

1. Add `RATE_LIMITS` entries for `admin:trial-patch`, `admin:trial-email-send`, and `admin:billing-sync` (or consolidate to one admin action key) so `checkRateLimit` / `recordRateLimit` persist hourly caps.
2. Reconcile `docs/security/security-notes.md`, `docs/security/security-audit.md` §5–§7, and any cross-linked engineering reference: describe **`checkCspRateLimit`** (per-instance, in-memory) explicitly, or move CSP posting to `ApiRateLimitEntry` if distributed limits are required—then align code and tables.
3. Fix `docs/security/security-audit.md` §7 health response description to match `app/app/api/health/route.ts`.
4. Continue CSP sampling (Sentry `signal=csp` per existing ops patterns) before enabling `CSP_ENFORCEMENT=true` in production.
5. Optional: assert `CRON_SECRET` on Vercel when cron is always enabled; add or cross-link incident response + key-rotation runbook per `docs/security/security-audit.md` §1.2 gaps.

## Task candidates — workflow / doc status

- **Implementation:** **`RATE_LIMITS`** for trial / trial-email / billing-sync admin actions — **`SEC-2026-04-30-1`** in [`docs/tasks.md`](../../tasks.md).
- **Doc reconciliation (CSP, §7 health, freshness):** **Done** in doc cleanup Phase F (`docs/security/security-notes.md`, `docs/security/security-audit.md`).
- **Optional:** `CRON_SECRET` deploy-time assert in `instrumentation.ts` — **accepted risk** documented in canonical security gaps until promoted.

## Re-test checklist

- [ ] After admin rate-limit fix: exercise trial, trial-email, billing-sync until 429; confirm DB rows.
- [ ] After doc updates: spot-check that staging behavior matches written CSP / rate-limit narratives.
- [ ] After CSP enforcement: smoke Clerk, Stripe checkout, PostHog, consented marketing scripts.
- [ ] `npm run check` (when application code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly security lane, or after changes to auth, `proxy.ts` public routes, billing/webhooks, CSP, rate limiting, account deletion, or privacy-sensitive flows.
- **Recommended next run:** 2026-05-30 (monthly) or before the next production release touching those surfaces.
