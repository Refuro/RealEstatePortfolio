# Data Integrity & Reconciliation Audit — 2026-03-31

## Executive summary

- **Policy alignment** is strong for ownership mode: dashboard, portfolio summary API, and CSV export use `user.ownershipDisplayMode` with `computePropertyMetrics` / `computePortfolioMetrics`; saved deals and deal analyzer correctly pin **`proportional`** per `docs/policies/ownership-metrics.md` §5.
- **Mortgage payoff on APIs** uses strict `getPayoffProjection` (`app/app/api/properties/[id]/mortgage/route.ts`), consistent with `docs/policies/analytics-math-policy.md` §3.7; tolerance-aware helpers are confined to UI surfaces with disclosure expectations.
- **Critical import/export gap:** the portfolio CSV exporter emits **`escrow amount (first lien)`**, but the importer only looks for **`escrow amount`** / **`escrowAmount`** (`app/lib/import/csv-parser.ts`). A straight export→re-import drops escrow, so `escrowIncluded` / `escrowAmount` on the created mortgage do not match the file.
- **Recommendation:** Add import aliases for every exported first-lien column name (at minimum escrow and `mortgage balance (stored sum)`), and document intentional non-round-trip fields (`display mode` is informational only; multi-lien remains lossy per `docs/reference/portfolio-csv-export.md`).

## Severity-ranked findings

### Critical

- None labeled critical after review; the escrow alias gap is severe for reconciliation but recoverable by re-entering escrow in-app.

### High

- **CSV escrow round-trip failure** — Export header `escrow amount (first lien)` is not among `getCol` names (`escrow amount`, `escrowAmount` only), so re-imported mortgages lose escrow data and `escrowIncluded` defaults from `escrowAmount > 0` incorrectly. **Impact:** Silent divergence between exported snapshot and imported DB row; amortization/metrics assumptions drift. **Evidence:** `app/app/api/export/portfolio/route.ts` (header `escrow amount (first lien)`), `app/lib/import/csv-parser.ts` (~310–314).

### Medium

- **`mortgage balance (stored sum)` import alias missing** — Exporter uses `mortgage balance (stored sum)` (`app/app/api/export/portfolio/route.ts`); importer accepts `mortgage balance (stored)` but not the exported label (`app/lib/import/csv-parser.ts` ~279–287). Default files also include `mortgage balance (effective)`, which **does** match, so full exports usually still map a balance; risk is edited CSVs or tooling that keeps only the stored-sum column.
- **Embedded mortgage JSON shape vs mortgage API** — `serializePropertyForApi` spreads Prisma mortgage rows and adds string conversions for a subset of fields (`app/lib/serialize/property-api.ts`); it does **not** add `effectiveBalance`, `balanceSource`, or `payoffProjection`, which exist on `GET /api/properties/[id]/mortgage` (`app/app/api/properties/[id]/mortgage/route.ts`). **Impact:** API consumers comparing list vs mortgage sub-resource must not assume field parity; reconciliation scripts need two endpoints or explicit docs.

### Low

- **`display mode` CSV column** — Exported per row (`app/app/api/export/portfolio/route.ts`) but import does not apply it to `User.ownershipDisplayMode` (import only creates `Property` rows). **Impact:** Users may expect account-level mode to round-trip; it does not—by product scope, not bug, but worth clarity in export docs.
- **Multi-lien import** — Documented as lossy: at most one mortgage from CSV (`docs/reference/portfolio-csv-export.md`); reconciliation path is in-app addition of liens.

## Evidence reviewed

- **Policies:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/architecture-and-build-practices.md` (layered flow, metrics SSOT).
- **Schema:** `app/prisma/schema.prisma` (`User`, `Property`, `Mortgage`, `SavedDeal` fields vs API/import).
- **Export:** `app/app/api/export/portfolio/route.ts` (headers, `computePropertyMetrics`, `displayMode`, multi-lien columns).
- **Import:** `app/lib/import/csv-parser.ts`, `app/lib/import/rent-resolve.ts`, `app/app/api/import/portfolio/route.ts`.
- **API contracts:** `app/lib/serialize/property-api.ts`, `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/lib/server/portfolio-summary-payload.ts`, `app/app/api/deals/[id]/route.ts` (proportional metrics).
- **Validation:** `app/lib/validations/property.ts` (create/update vs Prisma).
- **Reconciliation helpers:** `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts` (60-day freshness vs policy §3.6).

## Risk & impact assessment

Unresolved **High** finding affects anyone using portfolio CSV as a backup or migration path: escrow disappears on import, which weakens trust in export as a contract and can skew payment-related interpretation until corrected manually. **Medium** items affect integrators and power users who reshape CSV columns. Likelihood is **high** for escrow (every default export includes the mismatched header).

## Recommendations (prioritized)

1. Extend `getCol` aliases in `csv-parser.ts` so every column name emitted by `GET /api/export/portfolio` that carries importable data maps correctly—start with **`escrow amount (first lien)`** and **`mortgage balance (stored sum)`**.
2. Add a short subsection to `docs/reference/portfolio-csv-export.md` listing columns that are **export-only** (derived metrics: NOI, cash flow, cap rate, LTV) vs **round-trip** vs **user-level** (`display mode` not applied on import).
3. Document in API or internal notes that **`GET /api/properties`** embedded `mortgages` are a subset of the mortgage route payload (or align shapes in a future change).

## Task candidates (optional)

- [ ] Add import aliases: `escrow amount (first lien)`, `mortgage balance (stored sum)`.
- [ ] Add regression test: parse a row object whose keys match export headers exactly and assert escrow and mortgage balance resolve.
- [ ] Update `docs/reference/portfolio-csv-export.md` with round-trip / non-round-trip column matrix.

## Re-test checklist

- [ ] Export portfolio CSV → import into empty account → verify first-lien `escrowAmount` and `escrowIncluded` match source property.
- [ ] Confirm `GET /api/portfolio/summary` totals match dashboard for same user (`proportional` and `full_liability`).
- [ ] Confirm `GET /api/deals/[id]` metrics still match `computePropertyMetrics(..., "proportional")`.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Changes to Prisma property/mortgage schema, CSV headers, `serializePropertyForApi`, or portfolio metric contracts.
- **Recommended next run:** 2026-04-30 or next release touching import/export.
