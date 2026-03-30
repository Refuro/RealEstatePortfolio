# Data Integrity & Reconciliation Audit — 2026-03-30 (Run 2, post-merge)

## Executive summary

- Post-merge integrity checks show no immediate contract regressions across property/deal/import/export surfaces.
- Shared benchmark and metrics helpers remain central, reducing UI/API divergence risk.
- No blocking data-integrity findings from this pass.

## Severity-ranked findings

### Critical

- None.

### High

- None identified.

### Medium

- **Cross-surface contract discipline** — future field additions still require synchronized updates across validation, API serialization, import/export mappings, and docs.

### Low

- Legacy CSV compatibility paths should continue to be regression-tested when parser changes.

## Evidence reviewed

- `app/lib/import/`
- `app/lib/serialize/property-api.ts`
- `app/lib/benchmark-utils.ts`
- `docs/reference/portfolio-csv-export.md`
- `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`

## Risk & impact assessment

Data risk remains mostly future change-management drift; current merged state appears consistent.

## Recommendations (prioritized)

1. Keep one-PR contract updates when introducing new property/deal fields.
2. Maintain benchmark display/eligibility tests as benchmark logic evolves.

## Task candidates (optional)

- [ ] Expand/confirm automated coverage for benchmark display state transitions if CI gaps remain.

## Re-test checklist

- [ ] CSV import/export round-trip check after schema/import changes
- [ ] Benchmark state checks on list/detail/dashboard after benchmark logic edits

## Next trigger and cadence

- **Trigger:** schema/import/export/API contract changes
- **Cadence:** Monthly
