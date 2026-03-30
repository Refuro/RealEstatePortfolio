# Math & Logic Audit — 2026-03-30 (Run 2, post-merge)

## Executive summary

- Portfolio and property metric contracts remain aligned with ownership and analytics-math policies.
- Merge retained shared benchmark/metrics helpers, reducing drift risk between dashboard/property/API views.
- No formula regressions were surfaced by the post-merge test/build pass.

## Severity-ranked findings

### Critical

- None.

### High

- None found in core formula paths during this pass.

### Medium

- **Verification environment dependency** — local math-safety confidence still depends on consistent Node/Vitest environment across contributors.

### Low

- Locale-dependent display formatting remains acceptable but can affect snapshots if snapshot testing expands.

## Evidence reviewed

- `app/lib/metrics/property-metrics.ts`
- `app/lib/metrics/portfolio-metrics.ts`
- `app/lib/amortization.ts`
- `app/lib/benchmark-utils.ts`, `app/lib/benchmark-display-utils.ts`
- policy docs: `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`

## Risk & impact assessment

Current math risk is operational verification consistency, not formula correctness.

## Recommendations (prioritized)

1. Keep policy docs and golden fixtures updated together when changing formulas.
2. Keep local/CI Node expectations explicit for reliable test execution.

## Task candidates (optional)

- [ ] Add or confirm explicit Node/Vitest version guidance in setup docs or `engines` field for consistent local verification.

## Re-test checklist

- [ ] Run `npm run test` after any metrics/amortization changes
- [ ] Reconcile label/basis language with analytics-math policy when copy changes

## Next trigger and cadence

- **Trigger:** Any change to `lib/metrics`, amortization logic, or benchmark contracts
- **Cadence:** Monthly
