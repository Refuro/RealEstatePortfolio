# Security & Privacy Audit — 2026-03-30

## Executive summary

- **AuthZ** pattern remains: protected APIs use `getActiveAppUser()` / appropriate helpers; public routes explicitly listed in `app/proxy.ts`.
- **CSP reporting** is public by design; production can forward sampled violations to Sentry for rollout monitoring (see `docs/policies/csp-rollout.md`, `docs/security/security-notes.md`).
- **Rate limiting** covers sensitive endpoints per architecture notes.
- **Recommendation:** Keep security notes updated when adding routes or third-party scripts; re-run this lane after auth/billing changes.

## Severity-ranked findings

### Critical

- None identified.

### High

- None new; webhook and secrets handling remain gated (see `lib/env.ts`, billing routes).

### Medium

- **CSP enforcement** — When `CSP_ENFORCEMENT=true`, monitor Sentry `signal=csp` and runbook triage. *Evidence:* `docs/policies/csp-rollout.md`, `docs/runbooks/incident-response.md`.

### Low

- **Third-party scripts** — gtag/PostHog behind consent; ensure privacy copy stays aligned (ongoing, not a code defect).

## Evidence reviewed

- `docs/security/security-notes.md`, `app/proxy.ts`
- `app/app/api/csp-report/route.ts`, `app/lib/csp-report.ts`
- Sample protected routes: `app/app/api/properties/route.ts`, `app/app/api/export/portfolio/route.ts`
- `docs/setup/manual-steps.md` for production secrets

## Risk & impact assessment

Residual risk is mainly **misconfiguration** (env, Clerk redirects, Stripe webhooks) rather than missing controls in code.

## Recommendations (prioritized)

1. Before tightening CSP in production, confirm Sentry CSP triage workflow is used.
2. Review new public API routes for listing in proxy public allowlist when added.

## Task candidates (optional)

- None mandatory; prior synthesis items for CSP public route and Sentry forwarding are largely addressed in recent work—verify in deployment.

## Re-test checklist

- [ ] Confirm `/api/csp-report` reachable without auth on marketing pages when testing CSP
- [ ] `npm run check` after security-touched changes

## Next trigger and cadence

- **Trigger:** Auth, billing, new public API, or CSP phase change
- **Cadence:** Monthly
