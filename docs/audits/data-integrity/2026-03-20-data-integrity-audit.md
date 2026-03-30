# Data Integrity & Reconciliation Audit — 2026-03-20

## Executive summary

- **Core metrics pipeline is coherent:** `computePropertyMetrics` / `computePortfolioMetrics` in `app/lib/metrics/` back dashboard, properties list, property detail, export, and `/api/portfolio/summary` with the same inputs (effective mortgage balance, `getPropertyTotalRent`, user `ownershipDisplayMode`), subject to plan limits.
- **Highest integrity risk:** CSV **export** coarsens `propertyType` to only “Single family” vs “Multi family,” so a round-trip export → edit → **import** can misclassify condos, townhouses, apartments, and manufactured homes as `single_family` (`lib/import/csv-parser.ts` default).
- **Secondary gaps:** export does not include **`unit rents`**, so multi-unit rent detail cannot be reconstructed from CSV; **GET `/api/properties`** returns all rows ordered by `createdAt` while in-app rollups use **first N by `updatedAt`**—a contract mismatch for API consumers.
- **Policy boundary:** Saved **deals** and **Analyze** use `computePropertyMetrics(..., "proportional")` only, ignoring the user’s ownership display mode; portfolio/property surfaces respect `user.ownershipDisplayMode`.

---

## Severity-ranked findings

### Critical

- None found.

### High

- **Export collapses property type to two labels, breaking import classification on round-trip** — On re-import, `property type` is mapped through `PROPERTY_TYPE_MAP`; unknown labels fall back to `single_family`. Export writes only `"Multi family"` or `"Single family"` (`app/app/api/export/portfolio/route.ts`, property type cell ~115–116), so exported condo/townhouse/apartment/manufactured rows are **indistinguishable** from true single-family. **Impact:** Wrong `propertyType` and possible unit-validation errors when users re-import edited exports.

### Medium

- **CSV export omits `unit rents` while import supports it** — Import template and `parseRow` (`app/app/api/import/portfolio/template/route.ts`, `app/lib/import/csv-parser.ts`) include `unit rents` for multi-unit parity with `getPropertyTotalRent`, but export has no column for it. **Impact:** Multi-unit rent breakdown is lost in exports; re-import relies on a single `rent` column only.

- **`GET /api/properties` cardinality and ordering differ from portfolio rollups** — List route returns every property for the user, ordered by `createdAt` desc (`app/app/api/properties/route.ts`). Dashboard, properties page, export, and `/api/portfolio/summary` use `takeFirstNByUpdatedAt` after `getPropertyLimit` (`app/lib/limit-utils.ts`). **Impact:** Integrations or scripts using the list API can disagree with in-app totals and with export row sets.

- **`Property.unitRents` JSON field has no strict runtime validation** — Prisma `Json?` is assumed to be `number[]` in `getPropertyTotalRent` / `parseUnitRentsFromDb`; malformed DB values could cause runtime errors. **Impact:** Low likelihood, but no hard guard.

- **Deals API and Analyze UI ignore ownership display mode** — `serializeDeal` and `analyze/deal-analyzer-form.tsx` call `computePropertyMetrics` with `"proportional"` only (`app/app/api/deals/route.ts`, `app/app/(app)/analyze/deal-analyzer-form.tsx`). **Impact:** Metrics for deals and the analyzer do not reconcile with portfolio/property views when the user selects **full liability** (`docs/policies/ownership-metrics.md`).

### Low

- **`GET /api/portfolio/summary` is unused in the app code** — Matches dashboard aggregation logic (`app/app/api/portfolio/summary/route.ts`) but no client references found in this pass. **Impact:** Drift risk if future integrations assume it is the only contract without tests.

- **`GET /api/properties/[id]/metrics` returns `PropertyMetrics` only** — Does not expose `dscr`; property detail UI computes `dscr` from `getAnnualDebtService` + `metrics.noi` on the server (`app/app/(app)/properties/[id]/page.tsx`). **Impact:** API-only consumers cannot reconcile DSCR without duplicating logic.

- **Export with multiple mortgages: first loan only for several descriptive columns** — Rate, term, `balance as of`, escrow, lender come from `firstMortgage` while balances/payments are summed (`app/app/api/export/portfolio/route.ts`). **Impact:** Spreadsheet may look inconsistent if the user expects one row per loan.

- **`display mode` column in export is per-row but user-scoped** — Same value repeated; import correctly ignores it (display mode is user-level via `/api/me`). **Impact:** User confusion, not a data bug.

---

## Evidence reviewed

| Area | Paths / surfaces |
|------|-------------------|
| Policies | `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/architecture-and-build-practices.md` (metrics layer) |
| Schema | `app/prisma/schema.prisma` |
| Metrics | `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/amortization.ts` (`getEffectiveBalance`, `getPiForAmortization`) |
| Import/export | `app/app/api/export/portfolio/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/app/api/import/portfolio/template/route.ts`, `app/lib/import/csv-parser.ts` |
| API | `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/properties/[id]/metrics/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/app/api/me/route.ts`, `app/app/api/deals/route.ts` |
| UI (server) | `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/[id]/page.tsx`, `app/app/(app)/analyze/deal-analyzer-form.tsx` |
| Client import | `app/app/(app)/settings/import-csv-section.tsx` |

**Assumptions / limits:** Static review of the repository; no production DB samples. Prior report (2026-03-19) cited **mortgage column name mismatch** on import; **re-verified:** `parseRow` now accepts `mortgage balance`, `mortgage balance (effective)`, and `mortgage balance (stored)` (`app/lib/import/csv-parser.ts` ~223–230), so that specific gap is **closed** in current code.

---

## Risk & impact assessment

- **High finding:** Misclassified `propertyType` after CSV round-trip skews **filters, validation, and UX labels** (e.g. units rules for multi-family vs single-unit types).
- **Medium findings:** **API vs UI** mismatch affects anyone building on `GET /api/properties` without matching plan-limit rules; **unit rents** omission affects **landlords with per-unit rents**; **mode** mismatch affects **users on full liability** comparing deals/analyzer to the rest of the app.
- **Likelihood:** Round-trip CSV and external API use are **intermittent**; full-liability users and multi-unit exports are **smaller subsets** but higher impact when they occur.

---

## Recommendations (prioritized)

1. **Align export property type** with canonical labels (`PROPERTY_TYPE_LABELS` / `formatPropertyType` in `app/lib/property-utils.ts`) so exported CSV matches import `PROPERTY_TYPE_MAP` and Prisma enums.
2. **Add `unit rents` (or a documented equivalent)** to portfolio export when `unitRents` is present, or document that export is **single-rent-total only** for multi-unit properties.
3. **Document or enforce** `GET /api/properties` behavior for plan limits: e.g. query params mirroring `takeFirstNByUpdatedAt`, or explicit documentation that **rollup parity** is only on `/api/portfolio/summary` + export.
4. **Decide product behavior** for deals/analyzer vs `ownershipDisplayMode` (either apply user mode, or state in UI that these surfaces are **proportional-only**).

---

## Task candidates

- [ ] Export: emit full property type string (or `propertyType` enum value) matching `csv-parser` / schema.
- [ ] Export: add optional `unit rents` column when `unitRents` is set; keep backward compatibility for old imports.
- [ ] API: document or align `GET /api/properties` with plan-limit semantics (same ordering and subset as dashboard/export).
- [ ] Product: apply `user.ownershipDisplayMode` to deals serialization + `DealAnalyzerForm`, or add inline copy that metrics are **proportional-only**.
- [ ] Validation: add Zod/runtime guard for `unitRents` when reading from DB (shared with forms).
- [ ] Optional: extend `GET /api/properties/[id]/metrics` with `dscr` (and debt-service basis fields) to match UI.

---

## Re-test checklist

- [ ] Verify property type round-trip for each `propertyType` enum value after export fix.
- [ ] Verify multi-unit property with `unitRents` export/import parity.
- [ ] Verify plan-limit user: API list vs dashboard totals (if API behavior changes).
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** After changes to CSV import/export, metrics helpers, or `GET /api/properties` / portfolio summary.
- **Recommended next run:** 2026-06-20 (quarterly) or before a major release touching analytics or data portability.
