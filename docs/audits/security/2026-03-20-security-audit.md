# Security & Privacy Audit — 2026-03-20

## Executive summary

- **Overall:** **CSP Report-Only** and standard security headers are set in `next.config.ts`. **Rate limiting** is applied to sensitive write/delete/billing/import routes via `@/lib/rate-limit`. **Clerk** `proxy.ts` protects non-public routes; `/api/health` and webhook remain public by design.
- **Top risks:** CSP is **report-only** (by design) — plan graduation to enforced CSP with reporting endpoint; **external estimate APIs** remain abuse-sensitive — tier/hourly limits help but monitor for credential stuffing on auth endpoints separately.
- **Recommendation:** Keep secrets in env only; periodic review of public route list in `proxy.ts` when adding routes.

## Severity-ranked findings

### Critical

- *(none identified)*

### High

- **CSP not enforcing** — `Content-Security-Policy-Report-Only` allows learning without breakage; before strict enforcement, tune `script-src`/`connect-src` for Clerk, Stripe, Sentry, analytics. — `app/next.config.ts`

### Medium

- **Public surface growth** — Each new `app/api/*` or page route must be classified in `isPublicRoute` or it falls under `auth.protect()`. Omission could block webhooks or public pages. — `app/proxy.ts`

### Low

- **Dependency advisories** — Run `npm audit` in `app/` on a schedule (outside this review); address high/critical with vendor guidance.

## Evidence reviewed

- `app/next.config.ts` — security headers, CSP report-only
- `app/proxy.ts` — `createRouteMatcher`, public routes
- `app/lib/rate-limit.ts` + sample consumers: `app/api/properties/route.ts`, `deals`, `import/portfolio`, `account/delete`, `billing/create-checkout-session`
- `app/app/api/health/route.ts` — unauthenticated (intentional for LB probes)

## Risk & impact assessment

Auth + rate limits reduce automated abuse on expensive operations. Main residual exposure is **misconfigured public routes** and **future CSP tightening** without breaking third-party scripts.

## Recommendations (prioritized)

1. Before enforcing CSP, add **`report-uri` / `report-to`** or connect Sentry reporting for violation noise triage.
2. Add a **code review checklist item**: new API route → update `proxy.ts` public list if needed.

## Task candidates (optional)

- [ ] Document **public route checklist** in `docs/security/security-notes.md` (if not already).
- [ ] Schedule quarterly **`npm audit`** + lockfile refresh for `app/`.

## Re-test checklist

- [ ] Anonymous: `/`, `/pricing`, `/api/health`, Stripe webhook path — behave as expected.
- [ ] Authenticated API: 401 without session; 429 when hammering rate-limited POST.

## Next trigger and cadence

- **Trigger:** Auth/billing/webhook changes, new integrations, or pre-launch hardening.
- **Next window:** Monthly.
