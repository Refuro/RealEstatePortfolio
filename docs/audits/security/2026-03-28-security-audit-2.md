# Security & Privacy Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** Protected API routes consistently use `getActiveAppUser()` (grep across `app/app/api/**/route.ts`); Stripe webhook verifies signatures with `constructEvent`; portfolio export and sensitive actions use `lib/rate-limit.ts` and/or dedicated counters (RentCast, contact).
- **Top risks:** **CSP violation reporting** may be unreliable for unauthenticated users because `/api/csp-report` is not in the Clerk public route list (`app/proxy.ts`). **CSP** defaults to report-only unless `CSP_ENFORCEMENT=true` (`next.config.ts`).
- **Recommendation:** Add `/api/csp-report` to public routes if anonymous CSP telemetry is required; keep documenting third-party scripts (e.g. gtag) in privacy materials.

## Severity-ranked findings

### Critical

- None identified.

### High

- **CSP report endpoint + auth proxy** — Observability gap / misconfiguration risk — Browsers POST violation reports to `report-uri`; if the route is behind `auth.protect()`, anonymous page loads may not successfully report. Evidence: `app/proxy.ts` public list lacks `/api/csp-report`; `app/next.config.ts` sets `report-uri` when `NEXT_PUBLIC_APP_URL` is set.

### Medium

- **CSP in report-only by default** — XSS containment — `CSP_ENFORCEMENT` must be `true` in production for full enforcement; until then, CSP is advisory (headers still valuable for monitoring).

- **Third-party scripts** — Privacy — Google Ads gtag when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set is noted in `docs/security/security-notes.md`; ensure privacy policy stays aligned.

### Low

- **CSP report handler** — Abuse — `app/app/api/csp-report/route.ts` accepts POST without auth (if reachable); low risk, small bodies; optional rate limit if abused.

## Evidence reviewed

- `app/proxy.ts` — `isPublicRoute` list
- `app/next.config.ts` — security headers, CSP directives, Sentry wrapper
- `app/app/api/billing/webhook/route.ts` — signature verification
- `app/lib/auth.ts` — `getAppUser` vs `getActiveAppUser`
- `app/lib/rate-limit.ts` — `RATE_LIMITS`
- `app/app/api/contact/route.ts` — honeypot + rate limit
- `docs/security/security-notes.md`

## Risk & impact assessment

Auth and data scoping patterns are **strong** for portfolio APIs. The CSP/report-uri gap mainly hurts **visibility into XSS or policy drift** on public pages, not direct data breach.

## Recommendations (prioritized)

1. Public-route allowlist: add `/api/csp-report` **or** document that only authenticated sessions should report (and accept blind spots on `/`, `/pricing`, etc.).
2. Confirm production sets `CSP_ENFORCEMENT=true` when ready, after fixing report noise.
3. Periodically review new API routes for `getActiveAppUser` + Zod validation.

## Task candidates (optional)

- [ ] Add `/api/csp-report` to `isPublicRoute` in `app/proxy.ts` for complete CSP telemetry.
- [ ] Optional: basic size/rate limit on CSP report POST if log volume becomes an issue.

## Re-test checklist

- [ ] Anonymous `POST /api/csp-report` returns 204 without redirect.
- [ ] Webhook: invalid signature → 400.

## Next trigger and cadence

- Trigger: monthly or auth/billing/CSP changes
- Recommended next run: 2026-04-28
