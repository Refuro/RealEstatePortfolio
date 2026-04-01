# Security Audit — 2026-04-01

## Executive summary

- Security posture is strong across auth/authz boundaries, webhook signature verification, validation patterns, and server-side secret handling.
- No Critical or High findings were identified in this pass.
- Top residual risk areas are CSP hardening posture (`report-only` default and permissive `script-src`), selective rate-limit coverage on some mutating/admin routes, and low-grade unauthenticated endpoint abuse/noise risk.
- Recommendation: keep monthly cadence, align security docs to current CSP source list, and prioritize targeted defense-in-depth hardening on identified low/medium items.

## Severity-ranked findings

### Critical
- *(None identified in this pass.)*

### High
- *(None identified in this pass.)*

### Medium
- **CSP remains monitoring-first and permissive for script execution** — `app/next.config.ts` defaults to `Content-Security-Policy-Report-Only` unless `CSP_ENFORCEMENT=true`, and includes `'unsafe-inline' 'unsafe-eval'` in `script-src`. This is an intentional compatibility posture but reduces mitigation depth for XSS classes if another control fails. — Evidence: `app/next.config.ts`; rollout note in `app/.env.example`.
- **Rate-limit coverage is partial across mutating/auth-sensitive routes** — `app/lib/rate-limit.ts` covers key actions (create/import/export/delete/billing checkout), but routes like `PATCH /api/properties/[id]`, `PATCH /api/deals/[id]`, and `PATCH /api/admin/users/[id]/tier` do not apply `ApiRateLimitEntry` checks. Current auth+validation+scoping controls are strong; residual risk is authenticated abuse/fat-finger storms. — Evidence: `app/lib/rate-limit.ts`; `app/app/api/properties/[id]/route.ts`; `app/app/api/deals/[id]/route.ts`; `app/app/api/admin/users/[id]/tier/route.ts`.

### Low
- **Public health endpoint returns explicit DB connectivity state** — `GET /api/health` is intentionally public and returns `{ status, database }`. Useful operationally, but provides reconnaissance signal to anonymous callers. — Evidence: `app/proxy.ts`; `app/app/api/health/route.ts`.
- **Public CSP report endpoint has no explicit rate/body-size guard** — `POST /api/csp-report` is public by design and safely returns `204`, with parsing/sampling logic before optional Sentry forwarding. Residual risk is observability noise/resource churn under deliberate spam. — Evidence: `app/proxy.ts`; `app/app/api/csp-report/route.ts`; `app/lib/csp-report.ts`.
- **Security docs are slightly behind current CSP implementation details** — security docs describe CSP posture, but source lists are not fully synchronized with current `script-src` additions (e.g., Vercel analytics/insights domains in code). Risk is operational confusion during CSP enforcement work. — Evidence: `app/next.config.ts`; `docs/security/security-audit.md`; `docs/security/security-notes.md`.

## Evidence reviewed

- Process/template: `docs/process/security-audit-process.md`, `docs/process/audit-report-template.md`
- Security references: `docs/security/security-notes.md`, `docs/security/security-audit.md`, `docs/architecture-and-build-practices.md`
- AuthN/AuthZ boundary and public-route perimeter: `app/proxy.ts`, `app/lib/auth.ts`
- Validation patterns and user/data scoping (sampled protected routes): `app/app/api/properties/[id]/route.ts`, `app/app/api/deals/[id]/route.ts`, `app/app/api/contact/route.ts`, `app/app/api/import/portfolio/route.ts`
- Rate limiting and abuse controls: `app/lib/rate-limit.ts`, `app/app/api/contact/route.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/export/portfolio-summary/route.ts`, `app/app/api/billing/create-checkout-session/route.ts`
- CSP and security headers: `app/next.config.ts`, `app/app/api/csp-report/route.ts`, `app/lib/csp-report.ts`
- Webhook verification: `app/app/api/billing/webhook/route.ts`, `app/lib/stripe-config.ts`
- Env handling: `app/lib/env.ts`, `app/lib/db.ts`, `app/instrumentation.ts`, `app/.env.example`, `docs/setup/manual-steps.md`
- Privacy/security docs alignment: `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `docs/security/security-notes.md`, `docs/security/security-audit.md`

Audit limits:
- Static review only (no dynamic penetration testing, no production env/dashboard inspection, no external dependency scanner run in this pass).

## Risk & impact assessment

- Most residual risk is defense-in-depth and operational clarity rather than immediate compromise paths.
- Current likelihood of severe authz/authn bypass appears low based on reviewed route patterns (`getActiveAppUser`, ownership-scoped lookups).
- Highest practical impact if unresolved is from future drift: CSP rollout confusion, uneven abuse-control behavior on high-traffic mutating routes, and noisy public endpoint telemetry.

## Recommendations (prioritized)

1. Keep CSP in report-only until violation telemetry stabilizes, then stage `CSP_ENFORCEMENT=true` in pre-prod with explicit compatibility verification for Clerk/Stripe/analytics scripts.
2. Add targeted `ApiRateLimitEntry` coverage for select mutating routes with highest abuse potential (start with `PATCH /api/properties/[id]`, `PATCH /api/deals/[id]`, and admin tier override).
3. Add lightweight abuse guards to public diagnostics endpoints as needed (e.g., size cap or minimal rate control for `/api/csp-report`; consider environment-based restriction for `/api/health` if threat model tightens).
4. Synchronize `docs/security/security-audit.md` and `docs/security/security-notes.md` CSP source-list details with `app/next.config.ts` before CSP enforcement milestones.

## Task candidates (optional)

- [ ] Add rate-limit actions and enforcement wrappers for selected PATCH/admin routes.
- [ ] Add request body-size cap and/or lightweight spam guard on `POST /api/csp-report`.
- [ ] Decide whether `GET /api/health` should stay public in production threat model; document rationale.
- [ ] Refresh security docs to match current CSP directive sources and enforcement workflow.

## Re-test checklist

- [ ] Verify CSP telemetry volume and top violations after any CSP source changes.
- [ ] If enabling enforcement, validate sign-in, billing checkout, billing portal, and major app/dashboard flows.
- [ ] Verify rate-limit responses (`429`) on newly covered mutating routes without breaking normal UX.
- [ ] Confirm privacy + security docs remain aligned after any integration/security-control changes.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- Trigger: pre-release changes touching auth, billing, admin, external integrations, or security headers/CSP.
- Recommended next run date/window: monthly (next target window: 2026-05-01 +/- 3 days), or immediately before CSP enforcement rollout.
