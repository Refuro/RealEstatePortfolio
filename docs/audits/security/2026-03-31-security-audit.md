# Security & Privacy Audit — 2026-03-31

## Executive summary

- **Overall:** Veld Portfolio’s security posture is **strong** for auth, authorization, billing webhook verification, secret handling (server env + `validateEnv` on DB import), input validation (Zod), and **user-scoped data access** (no IDOR pattern observed on reviewed property/deal paths). The Clerk **proxy** (`app/proxy.ts`) correctly protects non-public routes while listing documented public exceptions.
- **Top residual risks:** CSP is **permissive** (`unsafe-inline` / `unsafe-eval`) and **report-only by default**; master `docs/security/security-audit.md` is **stale** relative to implemented CSP. Some **unauthenticated** surfaces (`/api/health`, `/api/csp-report`) are acceptable by design but warrant threat-model awareness.
- **Recommendation:** Keep **monthly** security lane runs; refresh `security-audit.md` to match current CSP and rate-limit coverage; plan a **phased CSP enforce** path after report-only telemetry review.

## Severity-ranked findings

### Critical

- (None observed in this pass.)

### High

- (None observed in this pass.)

### Medium

- **Security documentation drift** — `docs/security/security-audit.md` §1.2 still lists “No explicit CSP policy” as a gap, but **`app/next.config.ts`** defines CSP directives and applies **`Content-Security-Policy-Report-Only`** unless `CSP_ENFORCEMENT=true`. **Risk:** Incorrect backlog prioritization and missed operational expectation (enforce vs report-only). **Evidence:** `docs/security/security-audit.md`; `app/next.config.ts`.
- **CSP strength vs XSS** — Baseline CSP includes **`script-src` … `'unsafe-inline' 'unsafe-eval'`** (alongside Clerk/Stripe origins). **Risk:** Weaker mitigation of injection-to-execution classes if other defenses fail; acceptable as a **documented tradeoff** for Next/Clerk/Stripe but should stay on the hardening roadmap. **Evidence:** `app/next.config.ts`.
- **Unauthenticated health endpoint information** — **`GET /api/health`** is public (per `app/proxy.ts`) and returns DB connectivity JSON. **Risk:** Infrastructure reconnaissance; low for typical SaaS, higher if the threat model requires obscuring backend health. **Evidence:** `app/proxy.ts`; `app/app/api/health/route.ts`.

### Low

- **Public CSP report endpoint without rate limit** — **`POST /api/csp-report`** accepts anonymous bodies; production path samples/forwards to Sentry when configured. **Risk:** Log or observability noise / minor resource abuse. **Evidence:** `app/proxy.ts`; `app/app/api/csp-report/route.ts`; `app/lib/csp-report.ts` (sampling logic).
- **Defense-in-depth on benchmark property update** — After ownership check, **`app/app/api/properties/[id]/benchmark/refresh/route.ts`** calls `prisma.property.update({ where: { id: propertyId } })` without repeating `userId` in `where`. **Risk:** Negligible given prior `findFirst` with `userId`; tightening `where` would align with “never trust ID alone” policy. **Evidence:** `app/app/api/properties/[id]/benchmark/refresh/route.ts`.
- **Write-heavy PATCH routes without dedicated `ApiRateLimitEntry` actions** — Many authenticated mutating routes rely on Clerk session + Zod + scoping only (e.g. property PATCH, deal PATCH, admin tier PATCH). **Risk:** Authenticated abuse or fat-finger storms; acceptable baseline unless abuse observed. **Evidence:** `app/lib/rate-limit.ts` (listed actions vs grep of API routes).

## Evidence reviewed

- **Process / policy:** `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`, `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md` (security sections).
- **Auth boundary:** `app/proxy.ts` (public route matcher, `auth.protect()`).
- **AuthZ helpers:** `app/lib/auth.ts` (`getAppUser`, `getActiveAppUser`, `isAdmin`).
- **Secrets / env:** `app/lib/env.ts`, `app/lib/db.ts` (`validateEnv` at import), `app/instrumentation.ts` (`assertStripeWebhookSecretForVercelDeploy`).
- **Headers / CSP:** `app/next.config.ts`.
- **Rate limits:** `app/lib/rate-limit.ts`; sampled routes: `app/app/api/properties/route.ts`, `app/app/api/deals/route.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/app/api/billing/create-checkout-session/route.ts`, `app/app/api/account/delete/route.ts`, `app/app/api/account/delete-permanent/route.ts`, `app/app/api/contact/route.ts`, `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts` (RentCast quota).
- **Billing:** `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/create-checkout-session/route.ts` (metadata `appUserId`).
- **Sensitive flows:** `app/app/api/account/delete-permanent/route.ts`, `app/lib/validations/account.ts`, `app/app/api/account/restore/route.ts` (`getAppUser`), `app/app/api/admin/export/users/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`.
- **Data scoping sample:** `app/app/api/properties/[id]/route.ts` (`getPropertyForUser`).
- **Public / special APIs:** `app/app/api/health/route.ts`, `app/app/api/csp-report/route.ts`.
- **API inventory:** All `app/app/api/**/route.ts` files (33); grep for `getActiveAppUser` / `getAppUser`.

**Assumptions / limits:** Static review only; no penetration test, no production config inspection, no dependency/SCA tool run in this pass. Third-party (Clerk, Stripe, Vercel) security relies on their controls and correct env configuration.

## Risk & impact assessment

Unresolved **medium** items mainly affect **clarity of security posture** (documentation) and **long-term XSS resilience** (CSP tightening). **Low** items are mostly **noise, defense-in-depth, or authenticated abuse** scenarios with limited user-data breach impact given current patterns. **Billing** mishandling risk is mitigated by **Stripe signature verification** on the webhook; **IDOR** risk on reviewed routes is mitigated by **userId-scoped queries**.

## Recommendations (prioritized)

1. **Update `docs/security/security-audit.md`** to reflect implemented CSP (report-only vs enforce flag), and align the “open gaps” table with `app/next.config.ts` and `docs/security/security-notes.md`.
2. **Maintain CSP report-only telemetry**; when stable, enable **`CSP_ENFORCEMENT=true`** in a staged environment and narrow `unsafe-*` only as product stack allows.
3. **Revisit `/api/health`** if the deployment threat model changes (e.g. add auth, IP restriction, or separate internal monitor URL).
4. **Optional hardening:** Add `userId` to `prisma.property.update` `where` in benchmark refresh; consider a **light rate limit** or body-size cap on `/api/csp-report` if abuse appears.

## Task candidates (optional)

- [ ] Refresh `docs/security/security-audit.md` CSP and rate-limit statements against code (`app/next.config.ts`, `app/lib/rate-limit.ts`).
- [ ] Add `userId` to benchmark refresh `property.update` where clause for defense-in-depth.
- [ ] Add incident response + secret-rotation runbook per `docs/security/security-audit.md` backlog (if not already elsewhere).

## Re-test checklist

- [ ] After doc updates, spot-check that CSP behavior matches described report-only vs enforce.
- [ ] After any CSP enforce change, smoke-test Clerk sign-in, Stripe checkout, and marketing pages.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly (per `docs/security/security-notes.md`) and before releases that touch auth, billing, account lifecycle, or external integrations (`docs/process/security-audit-process.md`).
- **Recommended next run:** **2026-04-30** (monthly) or sooner if shipping auth/billing changes.
