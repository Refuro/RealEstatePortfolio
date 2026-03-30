# Data Integrity & Reconciliation Audit — 2026-03-30

## Executive summary

- **Import/export** and property APIs have been hardened for rental semantics (`isRented`, rent resolution) with tests and docs.
- **Benchmark eligibility** is shared across surfaces via `lib/benchmark-utils.ts` and display helpers, reducing contradictory UI states.
- **Recommendation:** Any new CSV column or API field should update export, import mapping, and policy docs in one change.

## Severity-ranked findings

### Critical

- None.

### High

- None new in this pass.

### Medium

- **Multi-mortgage export** — Prior work made semantics explicit; verify edge cases remain documented if schema evolves. *Evidence:* `docs/tasks.md` Batch 9 history, `docs/reference/portfolio-csv-export.md`.

### Low

- **Legacy imports** — Parser continues to accept aliases; keep tests when adding columns.

## Evidence reviewed

- `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`
- `app/lib/import/csv-parser.ts`, `app/lib/import/rent-resolve.ts`
- `app/lib/benchmark-utils.ts`, `app/lib/serialize/property-api.ts`

## Risk & impact assessment

Drift risk is **contract** drift across API/UI/export/import. Current shared helpers and policies reduce it.

## Recommendations (prioritized)

1. When adding property fields, update Zod + API + export + import in one PR.
2. Keep benchmark regression tests passing when environment allows.

## Task candidates (optional)

- [ ] Extend automated coverage for benchmark **display** states if not fully covered in CI (see open tasks in `docs/tasks.md` if any remain).

## Re-test checklist

- [ ] CSV round-trip for a sample property after schema/import changes
- [ ] Verify benchmark hidden vs refreshable states on list/detail/dashboard

## Next trigger and cadence

- **Trigger:** Schema, import/export, or metrics contract change
- **Cadence:** Monthly
