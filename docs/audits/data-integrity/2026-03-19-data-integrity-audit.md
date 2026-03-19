# Data Integrity & Reconciliation Audit — 2026-03-19

## Executive summary

- Data-integrity lane is now formalized with explicit reconciliation focus.
- Ownership and analytics policies provide a strong contract baseline.
- Main risk is future cross-surface drift when UI/API/export evolve at different speeds.

## Severity-ranked findings

### Critical

- None found in this baseline framework pass.

### High

- No dedicated reconciliation lane previously existed despite math-policy requirements.

### Medium

- Reconciliation checks were present in policy but not guaranteed through a dedicated recurring audit lane.

### Low

- Import/export assumption disclosure standards were not centrally audited.

## Evidence reviewed

- `docs/policies/analytics-math-policy.md`
- `docs/policies/ownership-metrics.md`
- `docs/process/data-integrity-audit-process.md`
- `docs/audits/README.md`

## Risk & impact assessment

- Inconsistent contracts across UI/API/export can reduce trust and increase support burden.

## Recommendations (prioritized)

1. Run monthly data-integrity lane with at least one reconciliation walkthrough.
2. Include import/export assumptions audit in each pass.
3. Require evidence paths for all mismatch claims.

## Task candidates

- [ ] Add fixed reconciliation checklist for one representative property + portfolio + export path.
- [ ] Add explicit import parity check (template columns vs API parser behavior).

## Re-test checklist

- [ ] Confirm data-integrity command and report path.
- [ ] Confirm report includes cross-surface evidence and task candidates.

## Next trigger and cadence

- Trigger: schema, import/export, or analytics contract changes
- Recommended next run date/window: monthly
