# Security & Privacy Audit — 2026-04-01

## Executive summary

- **Overall:** AuthN (Clerk proxy), AuthZ (`getActiveAppUser` + `userId`-scoped queries), Zod validation on reviewed APIs, Stripe webhook signature verification, env validation at DB import, and Vercel deploy guards for billing secrets present a **strong baseline** consistent with `docs/security/security-notes.md` and `docs/security/security-audit.md`.
- **Top risks:** CSP is **report-only by default** with a **permissive `script-src`** (`unsafe-inline`, `unsafe-eval`), so XSS remains a defense-in-depth gap if another control fails. **DB-backed `ApiRateLimitEntry` does not cover every authenticated mutating route** (e.g. property/deal `DELETE`, mortgage writes), though high-volume PATCH/create/import/export/account/billing paths are covered per `app/lib/rate-limit.ts`.
- **Privacy:** Sensitive server keys stay server-only; public `NEXT_PUBLIC_*` usage aligns with typical patterns (Clerk publishable key, Sentry DSN, PostHog, display pricing). Contact and analytics behavior are documented in product security notes.
- **Recommendation:** Maintain monthly reviews; before **CSP enforcement**, triage report-only telemetry; extend rate limits where abuse patterns appear; keep security docs aligned with `app/next.config.ts` CSP sources.

## Severity-ranked findings

### Critical

- *(None identified in this static review pass.)*

### High

- *(None identified in this static review pass.)*

### Medium

- **CSP is monitoring-first and script policy is permissive** — Unless `CSP_ENFORCEMENT=true`, browsers receive `Content-Security-Policy-Report-Only`. The policy includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src` (compatibility with Clerk/React/Vercel tooling). **Impact:** Weaker mitigation for XSS if HTML/script injection occurred elsewhere. — Evidence: `app/next.config.ts` (`cspDirectives`, `enforceCsp`, `cspHeaders`).
- **Rate limiting does not cover all mutating endpoints** — `RATE_LIMITS` in `app/lib/rate-limit.ts` documents actions for property/deal **create** and **patch**, imports, exports, account deletes, billing checkout, admin tier patch, and CSP reports. **`DELETE` on `app/app/api/properties/[id]/route.ts` and `app/app/api/deals/[id]/route.ts` does not invoke `checkRateLimit`.** Mortgage create/update/delete under `app/app/api/properties/[id]/mortgage/` likewise has no `ApiRateLimitEntry` usage in sampled files. **Impact:** Authenticated abuse or automated destructive churn is less constrained than PATCH-heavy flows; still requires a valid session and ownership-scoped queries. — Evidence: `app/lib/rate-limit.ts`; `app/app/api/properties/[id]/route.ts` (`DELETE`); `app/app/api/deals/[id]/route.ts` (`DELETE`); `app/app/api/properties/[id]/mortgage/route.ts` (POST; related mortgage routes not grep-matched to `checkRateLimit`).
- **Operational security process gaps (documented)** — `docs/security/security-audit.md` lists recurring dependency/SCA cadence and deeper audit logging as open items; no automated SCA execution was run in this lane. — Evidence: `docs/security/security-audit.md` §1.2; this audit’s static-only scope.

### Low

- **Public health endpoint discloses database connectivity** — By design for load balancers; minimal JSON (`status`, `database`). — Evidence: `app/proxy.ts` (public matcher); `app/app/api/health/route.ts`.
- **IP-derived rate limit identifiers trust forward headers** — `getRateLimitIdentifier` uses `x-forwarded-for` / `x-real-ip` when no user id. On Vercel this is typically correct; misconfiguration behind a custom proxy could skew limits. — Evidence: `app/lib/rate-limit.ts`; `app/app/api/contact/route.ts` (similar pattern).
- **Admin CSV export has no `ApiRateLimitEntry` action** — Documented rationale: access gated by `getActiveAppUser()` + `isAdmin()` + `ADMIN_EMAILS`; structured `console.info` audit line. — Evidence: `docs/security/security-notes.md` (Admin CSV); `app/app/api/admin/export/users/route.ts`.
- **Security documentation may drift from live CSP sources** — Directive strings live in `app/next.config.ts`; periodic diff against `docs/security/security-audit.md` §5 reduces rollout risk. — Evidence: `app/next.config.ts`; `docs/security/security-audit.md`.

## Evidence reviewed

- **Process / template:** `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- **Canonical security docs:** `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md`
- **Auth boundary:** `app/proxy.ts` (public routes, Clerk `auth.protect()`)
- **AuthZ helpers:** `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`)
- **Secrets / env:** `app/lib/env.ts`, `app/lib/db.ts` (`validateEnv` at import), `app/instrumentation.ts` (Vercel Stripe + `NEXT_PUBLIC_APP_URL` assertions), `app/lib/stripe-config.ts`, `app/.env.example`
- **Rate limits:** `app/lib/rate-limit.ts`; grep-backed verification of `checkRateLimit` / `recordRateLimit` call sites across `app/app/api/**`
- **Sample protected APIs (auth + scoping + validation):** `app/app/api/billing/webhook/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/deals/[id]/route.ts`, `app/app/api/account/delete-permanent/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/admin/export/users/route.ts`, `app/app/api/contact/route.ts`
- **Public / special routes:** `app/app/api/csp-report/route.ts` (body cap `CSP_REPORT_MAX_BODY_BYTES`, `csp-report:post` limit), `app/app/api/health/route.ts`
- **CSP / headers:** `app/next.config.ts`
- **Runbooks:** `docs/runbooks/incident-response.md` (referenced for operational readiness)

**Assumptions / limits:** Static code and documentation review only—no penetration test, no production dashboard or secret inspection, no `npm audit`/SCA run in this pass. Findings are based on repository state at audit date.

## Risk & impact assessment

- **Unresolved Medium items** primarily affect **defense-in-depth** and **abuse resilience**, not a demonstrated auth bypass. Data scoping patterns (`findFirst` / `where` with `userId`) reduce IDOR risk for reviewed resources.
- **Likelihood** of mass destructive abuse via DELETE without rate limits is **moderate-low** (requires authenticated attacker or stolen session); CSP issues matter most if XSS or script injection is ever introduced.

## Recommendations (prioritized)

1. **CSP:** Continue report-only monitoring; when violation volume is acceptable, enable `CSP_ENFORCEMENT=true` in a staging environment first, then production, with full regression on Clerk sign-in, Stripe checkout/portal, and analytics scripts.
2. **Rate limits:** Add `ApiRateLimitEntry` actions (or extend existing keys) for **property/deal DELETE** and **mortgage mutating routes** if abuse or incident patterns warrant; align with `docs/security/security-audit.md` §6 expansion guidance.
3. **Documentation:** After any CSP source change, update `docs/security/security-audit.md` §5 and `docs/security/security-notes.md` to match `app/next.config.ts`.
4. **Operations:** Keep `docs/runbooks/incident-response.md` current with hosting and monitoring URLs; schedule recurring dependency/security reviews per `docs/security/security-audit.md` §1.2.

## Task candidates (optional)

- [ ] Add rate-limit coverage for `DELETE` on `/api/properties/[id]` and `/api/deals/[id]` (and evaluate mortgage sub-routes).
- [ ] Stage and validate `CSP_ENFORCEMENT=true` with updated security doc CSP tables.
- [ ] Add explicit recurring SCA / dependency review owner and cadence to security or reliability process docs.

## Re-test checklist

- [ ] Verify fixes for any new rate-limit actions (429 behavior, normal UX).
- [ ] After CSP enforcement, smoke-test auth, billing, and embedded iframes (Stripe, Clerk).
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Release touching auth, billing, admin, CSP, webhooks, or external integrations; or monthly security review.
- **Recommended next run:** Within **one month** (target window **2026-05-01** ± 1 week), or immediately before enabling CSP enforcement in production.
