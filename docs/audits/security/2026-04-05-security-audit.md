# Security & Privacy Audit — 2026-04-05

**Auditor:** AI security audit lane  
**Scope:** Veld Portfolio — Next.js 15 / TypeScript, Clerk auth, Prisma/Postgres, Stripe  
**Reference docs reviewed:** `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/process/security-audit-process.md`, `app/proxy.ts`, `app/next.config.ts`, `app/lib/auth.ts`, `app/lib/rate-limit.ts`, `app/lib/env.ts`, all 56 API route files under `app/app/api/`

---

## Executive summary

- **Overall posture: Strong.** Auth, authorization, Prisma injection controls, Stripe webhook verification, deleted-account blocking, and secrets handling are all correctly implemented with no critical issues found.
- **Two High-severity functional breaks found:** `/api/unsubscribe` and `/api/cron/onboarding-emails` are missing from the public-routes allowlist in `proxy.ts`, meaning (a) email-link unsubscribes fail for unauthenticated users (privacy concern) and (b) Vercel Cron jobs are silently blocked by Clerk middleware.
- **One Medium-severity gap:** IP-based rate limiting trusts the client-controllable leftmost `X-Forwarded-For` value, enabling trivial bypass of contact-form and CSP-report rate limits.
- **Structural hygiene gap:** No HSTS header set; CSP enforcement still in Report-Only mode (known, tracked).
- **Recommendation:** Fix the two routing gaps immediately; prioritise HSTS and X-Forwarded-For hardening before the next production release.

---

## Severity-ranked findings

### Critical

None found.

---

### High

#### H1 — `/api/unsubscribe` not in public-routes allowlist (privacy + functional break)

`proxy.ts` `isPublicRoute` does not include `/api/unsubscribe`. When an unauthenticated user (the normal case for email-link clicks) hits this endpoint, `clerkMiddleware` calls `auth.protect()`, returning a 401 JSON response before the route handler executes. The HMAC-token verification logic in the handler is never reached.

**Impact:** Users who receive onboarding emails cannot unsubscribe without first signing in. The opt-out mechanism embedded in all onboarding emails is broken for the primary use-case (anonymous browser click). Privacy/CAN-SPAM compliance risk if email volume grows.

**Evidence:**
- `app/proxy.ts` — `isPublicRoute` matcher array (no `/api/unsubscribe` entry)
- `app/app/api/unsubscribe/route.ts` — performs `verifyUnsubscribeToken(userId, token)` HMAC check; does not call any Clerk auth helper
- `app/lib/emails/onboarding-reengagement.ts` line 77 — builds link to `/api/unsubscribe?userId=…&token=…` (public URL sent in email body)

---

#### H2 — `/api/cron/onboarding-emails` not in public-routes allowlist (silent cron failure)

`proxy.ts` `isPublicRoute` does not include `/api/cron/onboarding-emails`. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` but holds no Clerk session token. `auth.protect()` returns 401 before the handler runs, so the `CRON_SECRET` check inside the handler is unreachable. Cron executions return 401 silently; no onboarding emails are ever sent.

**Impact:** Day-3 and day-7 re-engagement emails are never delivered. The Vercel Cron schedule in `vercel.json` appears healthy but produces no effect. If relied on for user activation, the flow is entirely broken.

**Evidence:**
- `app/proxy.ts` — `isPublicRoute` matcher array (no `/api/cron/onboarding-emails` entry)
- `app/app/api/cron/onboarding-emails/route.ts` lines 21–29 — verifies `Authorization: Bearer <CRON_SECRET>`; no Clerk call
- `vercel.json` lines 2–6 — cron configured to fire daily at 14:00 UTC

---

### Medium

#### M1 — IP-based rate limiting trusts client-supplied `X-Forwarded-For` (spoofable)

`getRateLimitIdentifier()` in `lib/rate-limit.ts` selects the **leftmost** element of the `X-Forwarded-For` header when no `userId` is available:

```typescript
const forwarded = req.headers.get("x-forwarded-for");
const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
```

On Vercel, `X-Forwarded-For` is appended by the edge with the real client IP, but the leftmost value is whatever the client provided. An attacker sending `X-Forwarded-For: 1.1.1.1` can appear to be a different IP on every request, bypassing the contact-form 5-req/hr and CSP-report 240-req/hr per-IP limits. The same helper is used in `app/app/api/contact/route.ts` line 14.

**Impact:** Contact form can be flooded (email spam to support inbox); CSP report endpoint can be used for log noise at low cost.

**Evidence:**
- `app/lib/rate-limit.ts` lines 30–36
- `app/app/api/contact/route.ts` lines 10–16

**Recommendation:** Use the **rightmost** (or second-to-rightmost on Vercel's network where the rightmost is the edge server) `X-Forwarded-For` value, or rely exclusively on `X-Real-IP` which Vercel injects and clients cannot override.

---

#### M2 — Missing `Strict-Transport-Security` (HSTS) header

`app/next.config.ts` sets X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy, but does not include `Strict-Transport-Security`. While Vercel forces HTTPS on its edge, the absence of HSTS means browsers will not pin the connection and do not enforce HTTPS for future visits if traffic is intercepted before the first redirect.

**Evidence:**
- `app/next.config.ts` lines 40–49 — `securityHeaders` array

**Recommendation:** Add `{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }` to `securityHeaders` in `next.config.ts`. Start with `max-age=300` in staging, then increase to 2-year value after confirming no mixed-content issues.

---

#### M3 — `CRON_SECRET` absent from startup env validation

`lib/env.ts` validates `DATABASE_URL`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` at startup, failing fast if any are missing. `CRON_SECRET` is documented as required for Vercel Cron in `.env.example` but is not included in `REQUIRED_ENV_VARS`. A missing `CRON_SECRET` is caught only at first cron execution (returning 500 "Server misconfiguration") rather than at deploy time, masking the misconfiguration.

**Evidence:**
- `app/lib/env.ts` lines 7–12 — `REQUIRED_ENV_VARS` list
- `app/app/api/cron/onboarding-emails/route.ts` lines 21–24 — runtime check
- `app/.env.example` line 48 — marked as required

---

#### M4 — No explicit file-size guard on CSV import before parsing

`POST /api/import/portfolio` calls `await file.text()` without first checking the file byte-size. A client can upload a file up to Next.js's default body limit (~4 MB) in a single request. PapaParse then processes the entire buffer synchronously on the server thread. A crafted CSV with millions of quoted fields could consume disproportionate CPU time.

**Evidence:**
- `app/app/api/import/portfolio/route.ts` lines 30–45
- Rate limit of 5/hr (good) reduces the window, but does not bound per-request processing time.

**Recommendation:** Reject files above a byte threshold (e.g. 512 KB) before calling `file.text()`. Compare `file.size` to a constant and return 413 if exceeded.

---

### Low

#### L1 — `unsafe-inline` / `unsafe-eval` in `script-src`

The CSP `script-src` directive includes both `'unsafe-inline'` and `'unsafe-eval'`. These are currently required by Next.js App Router (inline scripts in `<script>` tags) and some third-party integrations (PostHog, gtag). However they negate most inline-XSS protection the CSP header would otherwise provide.

**Evidence:** `app/next.config.ts` line 14

**Recommendation:** Long-term (not blocking): investigate nonce-based CSP with Next.js middleware to remove `'unsafe-inline'`. Blocked by Next.js framework requirements in current version; track as tech debt.

---

#### L2 — CSP still in Report-Only mode by default (known, tracked)

`CSP_ENFORCEMENT` must be set to `"true"` in production to switch from `Content-Security-Policy-Report-Only` to enforced `Content-Security-Policy`. The current default allows violations to be observed but not blocked.

**Evidence:** `app/next.config.ts` lines 31–35; `docs/security/security-audit.md` §1.2 (open gap tracked)

**Recommendation:** Continue triaging reports from `/api/csp-report` → Sentry, then set `CSP_ENFORCEMENT=true` on Vercel once reports are clean.

---

#### L3 — `connect-src 'self' https:` allows all HTTPS origins

The `connect-src` directive permits `fetch`/XHR/WebSocket connections to any HTTPS host. This is intentionally broad (covers Sentry, PostHog, RentCast, Stripe, Clerk), but also means a successful XSS could exfiltrate data to any attacker-controlled HTTPS host.

**Evidence:** `app/next.config.ts` line 24

**Recommendation:** Consider enumerating the known third-party hostnames (Sentry DSN host, PostHog host, RentCast API domain, Stripe, Clerk) as a hardening step after CSP enforcement is enabled.

---

#### L4 — Internal `userId` included in property and deal API responses

`serializePropertyForApi` uses `...p` spread, which passes the `userId` field through to every `GET /api/properties`, `POST /api/properties`, and `PATCH /api/properties/[id]` response. The `serializeDeal` function in `app/app/api/deals/route.ts` explicitly includes `userId: deal.userId`. Since all responses are scoped to the authenticated user's own data, this is not a cross-user leak, but returning internal DB IDs (UUIDs) in client-visible payloads is minimal over-exposure.

**Evidence:**
- `app/lib/serialize/property-api.ts` line 52 (`...p` spread)
- `app/app/api/deals/route.ts` line 69 (`userId: deal.userId`)

---

#### L5 — Contact-form rate limit uses non-atomic check-then-insert (TOCTOU window)

The contact route reads a count of recent submissions, checks against the limit, sends the email, then inserts the DB record — in three separate operations. Concurrent requests that pass the count check before any of them inserts can briefly exceed the 5-per-hour limit.

**Evidence:** `app/app/api/contact/route.ts` lines 22–26, 108–110

**Recommendation:** Low exploitation value (each extra email costs the attacker nothing but lands in the support inbox); acceptable as-is. Can be addressed if abuse is observed by moving to the shared `ApiRateLimitEntry` table with `recordRateLimit` *before* sending.

---

#### L6 — No structured audit log for `account:restore`

Other sensitive account actions (soft-delete, permanent-delete, admin tier override, admin CSV export) emit structured `console.info(JSON.stringify({action, userId, ...}))` lines. The restore route (`POST /api/account/restore`) silently restores deleted accounts with no log line.

**Evidence:** `app/app/api/account/restore/route.ts` lines 5–23

---

## Evidence reviewed

| Area | Files / surfaces reviewed |
|------|--------------------------|
| Auth proxy | `app/proxy.ts` |
| Auth helpers | `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`) |
| Rate limiting | `app/lib/rate-limit.ts`, `RATE_LIMITS` table |
| Env validation | `app/lib/env.ts` |
| Security headers / CSP | `app/next.config.ts` |
| All API routes | All 56 files under `app/app/api/` |
| Stripe webhook | `app/app/api/billing/webhook/route.ts` |
| Admin routes | `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/admin/export/users/route.ts` |
| Account flows | `app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts`, `app/app/api/account/restore/route.ts` |
| Unsubscribe + cron | `app/app/api/unsubscribe/route.ts`, `app/app/api/cron/onboarding-emails/route.ts`, `app/lib/emails/onboarding-reengagement.ts` |
| CSV import | `app/app/api/import/portfolio/route.ts` |
| Public endpoints | `app/app/api/health/route.ts`, `app/app/api/csp-report/route.ts`, `app/app/api/contact/route.ts` |
| Reference docs | `docs/security/security-notes.md`, `docs/security/security-audit.md`, `.env.example`, `vercel.json` |

**Audit limits:**
- No dynamic (runtime) testing performed; findings are static code analysis.
- Third-party libraries (Clerk, Stripe SDK, Prisma) not audited; trust vendor security.
- Database schema not reviewed (migration files not read); Prisma ORM parameterization is assumed correct.
- No review of client-side components; XSS attack surface via React rendering not assessed.

---

## Risk & impact assessment

| Finding | Business / user impact | Likelihood |
|---------|----------------------|------------|
| H1 — Unsubscribe blocked | Broken user privacy flow; potential CAN-SPAM compliance gap at scale | High (affects every email recipient) |
| H2 — Cron blocked | Zero onboarding re-engagement emails delivered; activation funnel loss | High (Vercel Cron fires daily but silently fails) |
| M1 — XFF spoofing | Contact inbox flood; minor CSP noise | Medium (trivial to exploit; low incentive currently) |
| M2 — No HSTS | Browser downgrade in adversarial networks | Low (Vercel forces HTTPS; practical risk is low in real deployment) |
| M3 — CRON_SECRET not at startup | Silent misconfiguration in a new deploy | Low (one-time; caught on first cron fire) |
| M4 — CSV size | Brief CPU spike per import request | Low (rate limited to 5/hr; 4 MB body limit) |
| L1–L6 | Incremental hardening gaps; no user data exposure | Low |

---

## Recommendations (prioritized)

1. **[Immediate] Add `/api/unsubscribe` and `/api/cron/onboarding-emails` to `isPublicRoute` in `proxy.ts`.** These routes already implement their own authentication (HMAC token and Bearer secret respectively) and must be reachable without a Clerk session. One-line fix each; test by hitting both endpoints without a browser session.

2. **[Before next release] Harden IP extraction in `getRateLimitIdentifier`.** Switch from the leftmost `X-Forwarded-For` value to the last-trusted-hop value, or use `X-Real-IP` exclusively. Consider extracting a `getClientIp(req)` utility used consistently across `rate-limit.ts` and `contact/route.ts`.

3. **[Before next release] Add HSTS header to `next.config.ts`.** Start with `max-age=300` in staging; promote to `max-age=63072000; includeSubDomains` for production once confirmed.

4. **[Near-term] Add `CRON_SECRET` to startup env validation** in `lib/env.ts`, guarded by Vercel env check (similar to `assertStripeWebhookSecretForVercelDeploy`).

5. **[Near-term] Add file-size check to CSV import** before `file.text()`. Reject files over a reasonable threshold (e.g. 512 KB) with a 413 response.

6. **[Medium-term] Enable CSP enforcement.** Triage Report-Only violations in Sentry, then set `CSP_ENFORCEMENT=true` in Vercel Production environment.

7. **[Backlog] Add structured audit log line to `account:restore`** for consistency with other sensitive account-management actions.

---

## Task candidates

- [ ] `proxy.ts` — add `/api/unsubscribe` to `isPublicRoute` matcher array (fix H1)
- [ ] `proxy.ts` — add `/api/cron/onboarding-emails` to `isPublicRoute` matcher array (fix H2)
- [ ] `lib/rate-limit.ts` + `api/contact/route.ts` — use last-trusted `X-Forwarded-For` or `X-Real-IP` exclusively for IP identifier (fix M1)
- [ ] `next.config.ts` — add `Strict-Transport-Security` to `securityHeaders` array (fix M2)
- [ ] `lib/env.ts` — add `CRON_SECRET` to Vercel-guarded startup assertion (fix M3)
- [ ] `api/import/portfolio/route.ts` — reject files above 512 KB before `file.text()` (fix M4)
- [ ] `next.config.ts` — set `CSP_ENFORCEMENT=true` in Vercel Production after CSP report triage (fix L2)
- [ ] `api/account/restore/route.ts` — emit structured `console.info` audit log on successful restore (fix L6)

---

## Re-test checklist

- [ ] Verify unauthenticated `GET /api/unsubscribe?userId=…&token=…` returns unsubscribe confirmation (not 401 or sign-in redirect)
- [ ] Verify Vercel Cron simulation (`curl -H "Authorization: Bearer $CRON_SECRET" /api/cron/onboarding-emails`) returns `{ sent: N }` (not 401)
- [ ] Verify `X-Forwarded-For: 10.0.0.1` spoofed header does not bypass contact form rate limit
- [ ] Verify `Strict-Transport-Security` header present in production response
- [ ] Verify no regression in Clerk-protected routes (dashboard, properties, billing) after public-routes additions
- [ ] `npm run check` after any code changes

---

## Next trigger and cadence

- **Trigger:** Before any production release touching auth, billing, account flows, or public-route configuration; also before CAN-SPAM compliance review
- **Recommended next run:** 2026-05-05 (monthly cadence) or earlier if H1/H2 fixes ship and new routes are added
