# Data Integrity & Reconciliation Audit — 2026-03-20

## Executive summary

- **Overall:** Prisma schema includes property/mortgage models; **Zod** validates API payloads; **CSV import** uses `lib/import/csv-parser.ts` with tests. **Portfolio export** includes derived columns (NOI, annual cash flow, cap rate, LTV) aligned with metrics computation path.
- **Top risks:** **JSON fields** (e.g. `unitRents`) — ensure read paths validate consistently; **import column aliases** — keep documented when users upload varied spreadsheets.
- **Recommendation:** Any schema change → migration + regression tests for import/export round trips.

## Severity-ranked findings

### Critical

- *(none in static review)*

### High

- *(none flagged)*

### Medium

- **Dual representation** — Stored mortgage balance vs effective balance is explicit in export headers; UI must continue to label clearly to avoid user confusion. — `app/api/export/portfolio/route.ts`, property UI

### Low

- **CSV edge cases** — Rare encodings or delimiter edge cases may still need manual QA for large imports.

## Evidence reviewed

- `app/prisma/schema.prisma` (partial)
- `app/lib/import/csv-parser.ts` + tests
- `app/lib/validations/property.ts`
- `app/api/export/portfolio/route.ts`
- `app/api/import/portfolio/route.ts` — rate limited ✓

## Risk & impact assessment

Data issues erode trust in portfolio metrics; automated tests and clear export columns mitigate; import remains highest manual QA surface.

## Recommendations (prioritized)

1. When adding columns to export, update **docs** and a **fixture row** in tests if applicable.
2. Keep **import** sample CSVs in `test-data/` or docs updated.

## Task candidates (optional)

- [ ] Add one **integration-style** test: parse sample CSV → shape expected by POST import handler (mock DB) if not already covered end-to-end.
- [ ] Document **column alias** matrix for import in `docs/setup/` or runbook.

## Re-test checklist

- [ ] Export CSV → re-import in sandbox (if product allows) or compare totals to dashboard.
- [ ] `npm run test` — csv-parser + validation tests.

## Next trigger and cadence

- **Trigger:** Schema migration, import/export feature, or ownership/vacancy semantics change.
- **Next window:** Monthly.
