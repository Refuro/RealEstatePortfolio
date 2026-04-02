# Security & Privacy Audit — 2026-04-01 (pass 2)

## Executive summary

- **Overall:** Clerk auth boundary (`app/proxy.ts`), `getActiveAppUser()` on protected APIs, `userId`-scoped data access (e.g. `getPropertyForUser` in `app/app/api/properties/[id]/route.ts`), Zod on sampled mutating routes, Stripe webhook signature verification (`app/app/api/billing/webhook/route.ts`), env validation (`app/lib/env.ts`), and Vercel deploy guards (`app/instrumentation.ts`) align with `docs/security/security-notes.md` and `docs/security/security-audit.md`.
- **Top risks:** **CSP** remains **report-only** unless `CSP_ENFORCEMENT=true`, and `script-src` includes `'unsafe-inline'` and `'unsafe-eval'` for framework compatibility (`app/next.config.ts`)—weaker XSS defense-in-depth if other controls fail. **Mortgage create/update** (`POST` / `PATCH` under `app/app/api/properties/[id]/mortgage/`) do not use `ApiRateLimitEntry`, unlike property/deal deletes and mortgage `DELETE`.
- **Operational:** `docs/security/security-audit.md` still flags deeper structured audit logging and explicit dependency/SCA cadence; `docs/runbooks/incident-response.md` exists for rollback and monitoring.
- **Recommendation:** Keep monthly reviews; stage CSP enforcement after report telemetry is healthy; consider extending `RATE_LIMITS` to mortgage POST/PATCH if abuse-sensitive; keep security docs in sync with `app/next.config.ts` CSP sources.

## Severity-ranked findings

### Critical

- *(None identified in this static review pass.)*

### High

- *(None identified in this static review pass.)*

### Medium

- **CSP monitoring-first and permissive script policy** — Default path sends `Content-Security-Policy-Report-Only` unless `CSP_ENFORCEMENT=true`. Policy includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src`. **Impact:** Reduced mitigation for XSS if injection occurred. — Evidence: `app/next.config.ts` (`enforceCsp`, `cspDirectives`, `cspHeaders`).
- **Mortgage POST/PATCH not covered by `ApiRateLimitEntry`** — `app/lib/rate-limit.ts` defines `properties:mortgage-delete` (used on mortgage `DELETE`). **`POST` `app/app/api/properties/[id]/mortgage/route.ts` and `PATCH` `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` do not call `checkRateLimit`.** **Impact:** Authenticated users could churn writes more freely than on rate-limited property PATCH; ownership checks remain. — Evidence: those route files vs. `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` `DELETE` handler.
- **Security process gaps (documented)** — Structured audit logging for all high-risk actions and recurring SCA/dependency review cadence are called out in canonical docs; this pass did not run `npm audit` or external SCA. — Evidence: `docs/security/security-audit.md` §1.2; static-only scope of this audit.

### Low

- **Public health endpoint** — Intentionally unauthenticated; returns `status` and `database` connectivity only. — Evidence: `app/proxy.ts`; `app/app/api/health/route.ts`.
- **IP-based identifiers behind proxies** — `getRateLimitIdentifier` and contact form identifier use `x-forwarded-for` / `x-real-ip` when no user id; correct on typical Vercel setups, sensitive to proxy misconfiguration. — Evidence: `app/lib/rate-limit.ts`; `app/app/api/contact/route.ts`.
- **Admin user CSV export** — No `ApiRateLimitEntry`; gated by `getActiveAppUser()` + `isAdmin()` + `ADMIN_EMAILS`; audit line logged. — Evidence: `docs/security/security-notes.md`; `app/app/api/admin/export/users/route.ts`.
- **Documentation drift risk** — CSP directive source of truth is `app/next.config.ts`; `docs/security/security-audit.md` §5 should be diffed when CSP changes.

## Evidence reviewed

- **Process / template:** `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- **Canonical security docs:** `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md`
- **Auth boundary:** `app/proxy.ts` (public routes, `auth.protect()`)
- **AuthZ:** `app/lib/auth.ts` (`getActiveAppUser`, `getAppUser`, `isAdmin`); API grep for `getActiveAppUser` / exception `app/app/api/account/restore/route.ts` (`getAppUser`)
- **Secrets / deploy:** `app/lib/env.ts`, `app/instrumentation.ts`, `app/.env.example`
- **Rate limits:** `app/lib/rate-limit.ts`; grep of `checkRateLimit` / `recordRateLimit` across `app/app/api/**` (confirms `properties:delete`, `deals:delete`, `properties:mortgage-delete` on corresponding handlers)
- **Representative APIs:** `app/app/api/billing/webhook/route.ts`, `app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/csp-report/route.ts`, `app/app/api/contact/route.ts`, `app/app/api/properties/[id]/route.ts`
- **Runbook:** `docs/runbooks/incident-response.md`

**Assumptions / limits:** Static repository review only—no penetration test, no production secret or dashboard inspection, no automated SCA execution in this lane. This is **pass 2** on 2026-04-01 (filename suffix `-2`); findings reflect current `app/` as reviewed.

## Risk & impact assessment

- Medium items concern **defense-in-depth** (CSP), **abuse resilience** (mortgage write paths), and **process maturity** (audit logging, SCA cadence)—not a demonstrated authentication bypass or IDOR in reviewed patterns (`where: { userId }` / `findFirst` with ownership).
- **Likelihood** of harm from unlimited mortgage POST/PATCH is **low–moderate** (requires valid session); CSP gaps matter most if XSS or unsafe HTML ever appears.

## Recommendations (prioritized)

1. **CSP:** Continue report-only monitoring in production; validate `CSP_ENFORCEMENT=true` in staging first, then production, with smoke tests for Clerk, Stripe iframes, and analytics.
2. **Rate limits:** If product/security agrees, add `ApiRateLimitEntry` actions for **mortgage POST and PATCH** (or map to existing keys with clear semantics) to align nested mortgage writes with other property sub-resource controls.
3. **Documentation:** After CSP or rate-limit changes, update `docs/security/security-audit.md` §5–§6 and `docs/security/security-notes.md`.
4. **Operations:** Schedule recurring dependency/security review; extend structured logging for sensitive actions per `docs/security/security-audit.md`.

## Task candidates (optional)

- [ ] Add DB-backed rate limits for `POST` / `PATCH` on mortgage routes under `app/app/api/properties/[id]/mortgage/`.
- [ ] Staging validation for `CSP_ENFORCEMENT=true` with updated CSP tables in docs.
- [ ] Record owner and cadence for `npm audit` / SCA in security or reliability process docs.

## Re-test checklist

- [ ] After any new mortgage rate-limit behavior, verify 429 UX and normal flows.
- [ ] After CSP enforcement, verify auth, billing, and embedded iframes.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Release touching auth, billing, admin, CSP, webhooks, or external integrations; or monthly security review.
- **Recommended next run:** Within **one month** (target window **2026-05-01** ± one week), or before enabling CSP enforcement in production.
