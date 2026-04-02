# Math & Logic Audit — 2026-04-02

## Executive summary

- **Overall:** Canonical policies (`docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`) remain the contract; core math lives in `lib/metrics/`, `lib/amortization.ts`, and related modules.
- **No schema or metrics contract changes** were required for this audit window; no new regressions identified without running full test suite.
- **Future design work** (`design-brief-2026`) is visual; it does not change formulas unless explicitly scoped.

## Severity-ranked findings

### Critical

- None.

### High

- None from static review this pass.

### Medium

- **Optional DRY** — Shared negative-amortization guard in schedule generation remains a possible consolidation (prior audit carryover).

### Low

- Rounding / display vs export reconciliation: continue to verify on any change to `analytics-math-policy.md`.

## Evidence reviewed

- Policy docs: `ownership-metrics.md`, `analytics-math-policy.md`
- Code paths: `lib/metrics/`, `lib/amortization.ts` (existence; no formula edits this pass)
- Tests: Vitest coverage for metrics/amortization per `testing-implementation-plan.md` (not re-executed in audit-only mode)

## Risk & impact assessment

Math errors in production would be **High** severity; this pass did not surface new contradictions between policy and implementation.

## Recommendations (prioritized)

1. On any **pricing, projection, or export** change: run `npm run test` for `lib/metrics`, `lib/amortization.ts`, `lib/validations/property.ts`.
2. Keep math specs in markdown as source-of-truth before AI-generated code changes.

## Task candidates (optional)

- [ ] (Optional) DRY `isNegativeAmortizingPayment` (or equivalent) if duplicated in schedule helpers — low priority.

## Re-test checklist

- [ ] After math changes: unit tests + spot-check dashboard vs export for one property.

## Next trigger and cadence

- **Trigger:** Any change to metrics, projections, CSV columns, or ownership semantics.
- **Cadence:** Monthly or on PR touching `lib/metrics/` or `lib/amortization.ts`.
