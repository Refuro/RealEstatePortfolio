# Data Integrity & Reconciliation Audit — 2026-03-28

## Executive summary

- **Overall:** Prisma `Property` / `Mortgage` models align with Zod validation on API create/update, and list/detail/dashboard surfaces consistently pass `isRented` into benchmark helpers (`lib/benchmark-utils.ts`). **Portfolio CSV export** and **import** remain the weakest reconciliation boundary: export **mislabels** several `propertyType` values, and import **does not** mirror API create logic for rent totals and `isRented`.
- **Top risks:** Users treating export→import as a backup/round-trip will get **wrong property types** and **incomplete** records (`isRented`, market fields, notes, etc.). **POST /api/properties** returns `unitRents` without the same JSON normalization used on GET.
- **Recommendation:** Treat import/export as a **contract** owned by tests: align export labels with `PROPERTY_TYPE_LABELS` / schema enums; align import create payload with `POST` handler (or share a single “persist property” path); add `isRented` (and optional market columns) to export if round-trip is a product goal.

## Severity-ranked findings

### Critical

- *(none identified in this pass — no evidence of cross-tenant data exposure or silent destructive migration behavior beyond reviewed `isRented` default backfill.)*

### High

- **Export collapses `propertyType` to two labels** — Any property that is `condo`, `townhouse`, `manufactured`, or `apartment` is emitted as `"Single family"` in the CSV; only `multi_family` is labeled `"Multi family"`. Re-import maps unknown labels via `PROPERTY_TYPE_MAP` to `single_family`, so **condo/townhouse/etc. are lost or misclassified** on round-trip. — `app/api/export/portfolio/route.ts` (lines ~115–116), `app/lib/import/csv-parser.ts` (`PROPERTY_TYPE_MAP`).

- **Import `currentMonthlyRent` vs `unitRents` not reconciled with API create** — API create sums `unitRents` when present to set `currentMonthlyRent` (`app/api/properties/route.ts`). Import sets `currentMonthlyRent` from the `rent` column and `unitRents` from an optional `unit rents` column **independently** (`app/api/import/portfolio/route.ts`). A CSV can therefore store **inconsistent** total rent vs per-unit array vs what the UI/API would persist.

- **Import never sets `isRented`; export omits it** — Schema default and import path imply `isRented === true` for every imported row. A row with **$0 rent** is still imported as “rented” in the DB, which disagrees with product semantics where “not rented” clears rent (`PATCH` in `app/api/properties/[id]/route.ts`). Users cannot round-trip **vacant** properties via CSV.

### Medium

- **POST property response shape for `unitRents` differs from GET** — After create, the handler returns `unitRents: property.unitRents as number[] | null` without `parseUnitRentsFromDb`. List/detail GET paths normalize JSON via `parseUnitRentsFromDb` (`app/api/properties/route.ts`, `app/api/properties/[id]/route.ts`). Clients may see **raw Prisma JSON** vs **normalized arrays** depending on endpoint.

- **PATCH: `currentMonthlyRent` + `propertyType` in one request** — When `currentMonthlyRent` is updated without `unitRents`, the code splits rent using **`existing.propertyType`** (`app/api/properties/[id]/route.ts` ~180–188), not the effective new type if `propertyType` is also in the same body. **unitRents distribution can be wrong** for that update.

- **Export mortgage metadata is “first loan” while balances/payments are aggregated** — `mortgage rate`, `mortgage term`, `lender`, `escrow amount` come from `p.mortgages[0]`; `monthly payment` and effective balance **sum** all loans. Multi-mortgage portfolios can look **internally inconsistent** in a single CSV row. — `app/api/export/portfolio/route.ts`.

- **Derived metrics in export vs live UI** — NOI, cap rate, LTV, etc. use `computePropertyMetrics` + `getPropertyTotalRent` + `getEffectiveBalance`. **Vacancy** and **ownership display mode** match the in-app math path, but users may not realize CSV is a **snapshot** at download time; not a bug but a **reconciliation clarity** gap.

### Low

- **`getPropertyTotalRent` ignores `isRented`** — It sums `unitRents` or uses `currentMonthlyRent` only (`app/lib/property-utils.ts`). If legacy/bad rows had non-zero rent while `isRented` is false, metrics could still use that rent until corrected. Normal `PATCH` path clears rent when `isRented` is false.

- **Migration `20260328120000_add_property_is_rented`** — `ADD COLUMN "isRented" BOOLEAN NOT NULL DEFAULT true` is **backward-safe** for existing rows (all historical properties marked rented). No automatic distinction for previously “vacant” modeling; users must edit if needed.

## Evidence reviewed

- Policies: `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md` (referenced for metric semantics at boundaries)
- Schema: `app/prisma/schema.prisma`
- API: `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`
- Import/export: `app/app/api/import/portfolio/route.ts`, `app/app/api/export/portfolio/route.ts`, `app/lib/import/csv-parser.ts`, `app/lib/import/csv-parser.test.ts`
- Validation: `app/lib/validations/property.ts`
- Reconciliation helpers: `app/lib/property-utils.ts`, `app/lib/benchmark-utils.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/amortization.ts` (`getEffectiveBalance`)
- UI sampling: `app/app/(app)/properties/page.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/property-form.tsx` (for `isRented` propagation)
- Migration: `app/prisma/migrations/20260328120000_add_property_is_rented/migration.sql`

**Limits:** No runtime DB sampling; static/code-path review only. Saved deals and billing models were out of scope for this lane.

## Risk & impact assessment

**Unresolved High issues** undermine **trust in backups and migrations between environments** (wrong type, wrong rent decomposition, vacant state lost). **Medium** issues affect **edge-case API consumers** and **multi-lien** reporting. Likelihood rises for power users who rely on CSV more than the web UI.

## Recommendations (prioritized)

1. **Fix export `property type` column** to use the same vocabulary as import (`PROPERTY_TYPE_MAP` keys or canonical enum strings) and/or `formatPropertyType` / `PROPERTY_TYPE_LABELS` so re-import preserves type.
2. **Align import create** with API: derive `currentMonthlyRent` from `unitRents` when present; optionally set `isRented` from a new column or infer `false` when total rent is 0 and document behavior.
3. **Normalize POST response** `unitRents` with `parseUnitRentsFromDb` (or identical helper) for parity with GET.
4. **PATCH** rent split: use effective property type (`data.propertyType ?? existing.propertyType`) when rebuilding `unitRents` from total rent.

## Task candidates (optional)

- [ ] Export: emit full property type label or canonical enum; add regression test comparing export column to `PROPERTY_TYPE_LABELS` / import map.
- [ ] Import: after parsing row, set `currentMonthlyRent` to `sum(unitRents)` when `unitRents` is present and non-empty; validate sum vs rent column or prefer one source of truth.
- [ ] Import/export: add optional `isRented` column (or document that import cannot represent vacant; block rent=0 unless `isRented=false`).
- [ ] POST `/api/properties`: return `unitRents` via `parseUnitRentsFromDb(property.unitRents)` (and ensure `notes` / `marketRent` serialization matches GET if clients depend on shape).
- [ ] PATCH `[id]`: use effective `propertyType` when splitting `currentMonthlyRent` into `unitRents`; add API test for combined update.
- [ ] Export: document multi-mortgage row semantics (first loan vs sums) in user-facing docs or add per-loan rows (larger change).
- [ ] Optional: `getPropertyTotalRent` — if `isRented === false`, return 0 defensively for metrics consistency.

## Re-test checklist

- [ ] Export CSV of mixed property types → re-import in dev → verify types and rents match UI.
- [ ] PATCH property: change `propertyType` and `currentMonthlyRent` in one request → verify `unitRents` length and sum.
- [ ] POST create → compare JSON `unitRents` to GET for same id.
- [ ] After code fixes: `npm run check` and targeted API tests.

## Next trigger and cadence

- **Trigger:** Schema or import/export changes; new nullable fields on `Property`; benchmark or rent semantics changes.
- **Recommended next run:** After the next migration touching `Property` or CSV contracts, or quarterly.
