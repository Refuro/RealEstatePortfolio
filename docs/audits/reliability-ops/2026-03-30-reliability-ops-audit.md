# Reliability & Operations Audit — 2026-03-30

## Executive summary

- **Health endpoint** (`/api/health`) and uptime monitoring are documented in the runbook.
- **Sentry** covers production errors; CSP violations can surface in Sentry for policy rollout (`signal=csp`).
- **Recommendation:** Keep incident runbook and monitoring links current when changing domains or providers.

## Severity-ranked findings

### Critical

- None.

### High

- None new.

### Medium

- **Operational dependency on external services** — Vercel, Neon, Clerk, Stripe, Sentry; failure modes are documented in `docs/runbooks/incident-response.md`.

### Low

- **Builder/test friction** — Local Node version mismatch can block Vitest; not production reliability but affects engineering velocity.

## Evidence reviewed

- `docs/runbooks/incident-response.md`
- `app/app/api/health/route.ts`
- `app/app/global-error.tsx`, error instrumentation patterns (conceptual)

## Risk & impact assessment

Runbook coverage is good for a small team; main gap is **human** on-call during incidents.

## Recommendations (prioritized)

1. After deploys that touch CSP, watch Sentry CSP noise for false positives vs real issues.
2. Document Vitest/Node version in setup docs so CI and laptops align.

## Task candidates (optional)

- [ ] Add `engines` field or explicit Node version note in `docs/setup/run-and-smoke-test.md` if not already aligned with Vitest.

## Re-test checklist

- [ ] `GET /api/health` in staging/production after infra changes
- [ ] Confirm uptime monitor URL if domain changes

## Next trigger and cadence

- **Trigger:** Release hardening, new monitoring, or infra change
- **Cadence:** Monthly
