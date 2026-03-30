# Data Integrity & Reconciliation Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** `serializePropertyForApi` in `app/lib/serialize/property-api.ts` is the single JSON shape for property APIs, including `isRented`, decimal fields as strings, and mortgage nested serialization — good contract centralization.
- **Top risks:** **Benchmark eligibility** still depends on consistent UI interpretation of `isRented`, rent, and `marketRent` freshness across dashboard, list, and detail (roadmap benchmarking v2). **Import/export** must stay aligned with `serializePropertyForApi` field names and types.
- **Recommendation:** When benchmarking v2 lands, add one shared helper (e.g. `benchmark-eligibility.ts`) used by all surfaces to avoid drift.

## Severity-ranked findings

### Critical

- None.

### High

- **Cross-surface benchmark semantics** — Misleading display — Until benchmarking v2 is complete, list vs detail vs dashboard could theoretically diverge on when to show % vs market (track in Feature lane).

### Medium

- **Decimal serialization** — API consumers — Consistent string decimals for money fields reduce JSON precision issues; ensure CSV import/export uses the same semantics as API (spot-check: `lib/import/`, export route).

### Low

- **Unit rents** — `parseUnitRentsFromDb` in serialization path — Complex structures need test coverage when editing multi-unit properties.

## Evidence reviewed

- `app/lib/serialize/property-api.ts`
- `docs/policies/ownership-metrics.md` (reference)
- `docs/policies/analytics-math-policy.md` (reference)
- `docs/reference/roadmap.md` — benchmarking v2 acceptance criteria
- Prisma/schema references via git status — `isRented` migration present in project

## Risk & impact assessment

Data **integrity** for persisted properties is sound when APIs and UI use the same serializer and validation (`lib/validations/property`). Residual risk is **derived-metric presentation** (benchmarks), not raw DB corruption.

## Recommendations (prioritized)

1. Implement shared benchmark-eligibility contract per roadmap AC.
2. Regression-test CSV import against properties with `isRented` and multi-unit rents when those fields change.
3. Keep export column documentation in `docs/reference/portfolio-csv-export.md` updated with schema changes.

## Task candidates (optional)

- [ ] Add centralized `isBenchmarkComparable(property)` (or similar) and use in dashboard, properties list, property detail.

## Re-test checklist

- [ ] Round-trip: create property via API → export CSV → import → compare key fields.
- [ ] Property with `marketRent <= 0` shows non-comparison state everywhere.

## Next trigger and cadence

- Trigger: monthly or schema/import/export/API changes
- Recommended next run: 2026-04-28
