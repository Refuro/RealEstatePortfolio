# Security & Privacy Audit — 2026-04-07

## Executive summary

- **Overall posture: Strong.** Clerk boundary on non-public routes, `getActiveAppUser()` on protected APIs, Zod validation, Prisma-scoped queries (reduced IDOR surface), Stripe webhook signature verification, unsubscribe HMAC with `timingSafeEqual`, and security headers (including HSTS and CSP) in `app/next.config.ts` align with `docs/security/security-notes.md` and `docs/security/security-audit.md`.
- **One High finding:** Vercel Cron is configured for trial lifecycle emails, but the route is not on the Clerk public allowlist, so scheduled runs are blocked before `CRON_SECRET` verification runs—trial emails likely never send in production.
- **Residual Medium/Low items** match standing doc gaps: spoofable leftmost `X-Forwarded-For` for anonymous IP rate limits, and CSP remains Report-Only until `CSP_ENFORCEMENT=true` (operational choice).
- **Recommendation:** Add `/api/cron/trial-emails` to the public route matcher (and update `docs/security/security-notes.md` public-route list); re-verify Vercel Cron 200 responses; optionally harden IP extraction for contact/CSP limits.

## Severity-ranked findings

### Critical

None found.

### High

- **Trial cron blocked by Clerk middleware** — Vercel invokes `GET /api/cron/trial-emails` on schedule (`vercel.json`), but `app/proxy.ts` does not list that path in `isPublicRoute`. Unauthenticated cron requests hit `auth.protect()` and never reach the handler that validates `Authorization: Bearer ${CRON_SECRET}`. **Impact:** Day-10 / day-13 / expired trial emails may never be sent; product and compliance expectations for trial comms may be unmet. **Evidence:** `vercel.json` (cron path `/api/cron/trial-emails`); `app/proxy.ts` (public list includes `/api/cron/onboarding-emails` and `/api/cron/rate-limit-cleanup` but not trial-emails); `app/app/api/cron/trial-emails/route.ts` (lines 22–32, Bearer `CRON_SECRET` check).

### Medium

- **IP rate-limit identifier trusts leftmost `X-Forwarded-For`** — For anonymous callers, `getRateLimitIdentifier` uses the first comma-separated value of `X-Forwarded-For`, which clients can prepend, weakening per-IP limits on contact submissions and CSP reports. **Evidence:** `app/lib/rate-limit.ts` (lines 30–35); `app/app/api/contact/route.ts` (`getIdentifier` uses same pattern). **Impact:** Support inbox spam or noisy CSP/Sentry traffic; abuse cost remains low but not zero.

- **CSP enforcement deferred** — Default is Report-Only until `CSP_ENFORCEMENT=true`. **Evidence:** `app/next.config.ts` (`enforceCsp`, `cspHeaders`). **Impact:** XSS reliance on framework/React and other layers rather than browser CSP blocking; consistent with documented rollout.

### Low

- **Security notes vs proxy drift** — `docs/security/security-notes.md` lists representative public API routes but does not mention cron paths individually; after fixing trial-emails, keep proxy and notes in sync for future audits. **Evidence:** `docs/security/security-notes.md` (public routes bullet); `app/proxy.ts`.

- **`CRON_SECRET` not validated at app boot** — Missing secret yields 500 at runtime on cron hit only (unlike `STRIPE_WEBHOOK_SECRET` on Vercel). **Evidence:** `app/app/api/cron/trial-emails/route.ts` (lines 23–27); `app/lib/env.ts` (required vars omit `CRON_SECRET`).

## Evidence reviewed

- Process/template: `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- Canonical security docs: `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md` (auth section)
- Auth boundary: `app/proxy.ts` (`isPublicRoute`, `clerkMiddleware`)
- Auth helpers: `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)
- Env / deploy guards: `app/lib/env.ts`
- Rate limits: `app/lib/rate-limit.ts` (`RATE_LIMITS`, `getRateLimitIdentifier`)
- Security headers / CSP: `app/next.config.ts`
- Webhook: `app/app/api/billing/webhook/route.ts`
- Public/sensitive APIs sampled: `app/app/api/health/route.ts`, `app/app/api/csp-report/route.ts`, `app/app/api/contact/route.ts`, `app/app/api/unsubscribe/route.ts`, `app/lib/emails/onboarding-reengagement.ts` (HMAC helpers)
- Cron: `vercel.json`; `app/app/api/cron/onboarding-emails/route.ts`, `app/app/api/cron/trial-emails/route.ts`, `app/app/api/cron/rate-limit-cleanup/route.ts`
- Data scoping sample: `app/app/api/properties/[id]/route.ts` (`getPropertyForUser`)
- Admin sample: `app/app/api/admin/users/[id]/tier/route.ts`
- API inventory: all `app/app/api/**/route.ts` handlers (65 files) cross-checked for `getActiveAppUser` / `getAppUser` usage; exceptions: webhook, cron handlers, `csp-report`, `health`, `contact` (optional user), `unsubscribe` (token only), `account/restore` (`getAppUser` by design)

**Assumptions / limits:** Static review only; no live penetration test, dependency SCA, or Vercel dashboard verification of cron HTTP status. Clerk `auth.protect()` behavior inferred from prior audit and standard Clerk + Next middleware patterns.

## Risk & impact assessment

Unresolved **High** finding primarily affects **reliability and product comms** (trial lifecycle emails), not direct data exfiltration. If marketing or legal copy promises those emails, there is secondary **trust/compliance** exposure. **Medium** IP-spoofing limits are most relevant under active abuse. Likelihood of exploitation is moderate for IP bypass (low skill), low for CSP bypass (requires another vulnerability).

## Recommendations (prioritized)

1. **Add `/api/cron/trial-emails` to `isPublicRoute` in `app/proxy.ts`** (mirror onboarding and rate-limit-cleanup), then confirm Vercel Cron receives HTTP 200 and `sent` increments in logs.
2. **Update `docs/security/security-notes.md`** public-route bullet to include all cron paths that use `CRON_SECRET`, so the next audit does not miss new schedules.
3. **Harden anonymous IP identification** for rate limiting (e.g. prefer `x-real-ip` on Vercel, or rightmost trusted `x-forwarded-for` hop per platform docs).

## Task candidates

- [ ] Allowlist `/api/cron/trial-emails` in `app/proxy.ts` and deploy; verify cron execution in Vercel logs.
- [ ] Align `docs/security/security-notes.md` public API/cron list with `app/proxy.ts`.
- [ ] Adjust `getRateLimitIdentifier` / contact `getIdentifier` to use a non-spoofable client IP on the deployment platform.

## Re-test checklist

- [ ] After proxy change: Vercel Cron for `/api/cron/trial-emails` returns 200 with valid `Authorization: Bearer <CRON_SECRET>`.
- [ ] Confirm without Bearer: 401 from handler (after Clerk allows route through).
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly, or after any auth, billing, webhook, cron, or new public API route.
- **Suggested next run:** 2026-05-07 or next production release touching `app/proxy.ts` / `app/app/api/`.
