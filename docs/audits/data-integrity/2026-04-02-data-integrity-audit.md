# Data Integrity & Reconciliation Audit — 2026-04-02

## Executive summary

- **Overall:** CSV import/export contract (`docs/reference/portfolio-csv-export.md`) and multi-mortgage disclosures remain authoritative. No API or schema changes triggered by marketing alternative pages.
- **Competitor config:** `competitor-data.ts` is static marketing boolean matrix—does not affect persisted user data.

## Severity-ranked findings

### Critical

- None.

### High

- None new.

### Medium

- **CSV rent vs NOI documentation** — Prior synthesis noted clarifying effective rent semantics in docs; verify if promoted to tasks.

### Low

- Export/import round-trip tests—maintain when columns change.

## Evidence reviewed

- `app/lib/marketing/competitor-data.ts` — no DB writes
- Reference: `docs/reference/portfolio-csv-export.md`, prior `2026-04-01-data-integrity-audit-2.md`

## Risk & impact assessment

Data corruption from import or wrong metric in export is **High** severity if it occurred; no new signals this pass.

## Recommendations (prioritized)

1. Any new property fields → update CSV contract + validation + tests together.
2. Keep **Zod** schemas as single validation source for APIs.

## Task candidates (optional)

- [ ] (Optional) Doc note: CSV rent vs NOI / effective rent — if not already done per prior Ship.

## Re-test checklist

- [ ] Import sample CSV after schema change; verify round-trip.

## Next trigger and cadence

- **Trigger:** Prisma schema, import/export, or metrics API changes.
- **Cadence:** Monthly.
