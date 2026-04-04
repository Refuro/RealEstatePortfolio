# Data Integrity & Reconciliation Audit — 2026-04-04

**Scope:** Full audit pass against 5 dimensions: contract parity (schema → API → UI → export), input/output naming consistency, export assumptions, data edge cases, and user reconciliation path clarity. No code changes made.

**Previous report:** `docs/audits/data-integrity/2026-04-03-data-integrity-audit-2.md`

---

## Executive summary

- **All four Schedule items from the 2026-04-03 Run 2 report are confirmed resolved:** `download-csv-button.tsx` now reads `X-Veld-*` truncation headers and surfaces per-status error messages; `csv-parser.ts` now normalizes `loanType` case-insensitively against `LOAN_TYPE_OPTIONS`; Papa Parse recoverable errors are now propagated in the import response even when data rows are present; and download failure feedback is implemented with inline error state.
- **One High finding remains open (carried):** multi-lien export→import creates at most one mortgage per CSV row while export writes aggregate payment/balance columns, creating lossy round-trips for multi-lien properties with no at-point-of-file-selection warning.
- **One Medium finding remains open (carried):** export omits `original loan amount` and `loan type` from its 32-column header set, breaking single-lien origination round-trip fidelity.
- **Two new Low/Medium findings identified:** (1) the `monthly payment (all liens sum)` export column carries no escrow-basis label, creating potential misreconciliation risk for users comparing CSV values against lender statements; (2) a hard-failure path for unrecognized `loanType` values on import (rather than null fallback) may block imports from non-standard spreadsheets without adequate user messaging.

---

## Severity-ranked findings

### Critical

- None.

### High

- **Multi-lien export→import semantic risk (carried, confirmed open)** — The import route (`app/app/api/import/portfolio/route.ts` lines 196–221) creates at most one `mortgage.create` per CSV row. The export writes `monthly payment (all liens sum)` (aggregate across all liens) and `mortgage balance (stored sum)` / `mortgage balance (effective)` (aggregate totals). When a multi-lien export is re-imported, the single created mortgage receives the aggregate payment and balance — not the first-lien values — producing a structurally different loan record. The in-app warning in `import-csv-section.tsx` (lines 211–216 per prior audit) is present but does not trigger at the moment of file selection and does not warn on the confirm/import step. **Evidence:** `app/app/api/import/portfolio/route.ts` (`mortgage.create` branch); `app/lib/import/csv-parser.ts` (`getCol` for `"monthly payment (all liens sum)"`, `"mortgage balance (stored sum)"`); `docs/reference/portfolio-csv-export.md` (Round-trip vs lossy matrix).

### Medium

- **Export omits `original loan amount` and `loan type` columns (carried, confirmed open)** — The 32-column export header array (`app/app/api/export/portfolio/route.ts` lines 62–94) does not include `original loan amount` or `loan type`. The import template (`app/app/api/import/portfolio/template/route.ts` lines 4–28) supports both columns, and `csv-parser.ts` reads them via `getCol`. For single-lien properties, export→import round-trip loses origination metadata (original loan amount and loan type). **Evidence:** `app/app/api/export/portfolio/route.ts` (headers array); `app/app/api/import/portfolio/template/route.ts` (`TEMPLATE_HEADERS`); `app/lib/import/csv-parser.ts` (getCol aliases for `"original loan amount"`, `"loan type"`).

- **`monthly payment (all liens sum)` export column has no escrow-basis label (new)** — The export column name correctly conveys that all liens are summed, but does not indicate whether individual payments are all-in (P&I + escrow) or P&I only. Per `docs/policies/analytics-math-policy.md` §2, the stored `monthlyPayment` is "all-in debt service: stored monthly mortgage payment value as entered/imported by user (may include escrow depending on source data)." Two properties with identical `monthly payment (all liens sum)` values could have fundamentally different P&I loads if one was entered as all-in (escrow included) and the other as P&I only. The `escrow amount (first lien)` column provides partial context (first lien only), but for multi-lien properties, or properties where the user entered payments with escrow, no aggregate-level escrow indication is present. Users reconciling debt-service CSV data against lender statements may misread the column. `docs/reference/portfolio-csv-export.md` does not document the escrow-inclusion basis of this column. **Evidence:** `app/app/api/export/portfolio/route.ts` (line 85: `"monthly payment (all liens sum)"`, lines 198–199: `monthlyPaymentAll` from `totalMonthlyPayment` which is raw sum of `m.monthlyPayment`); `docs/policies/analytics-math-policy.md` §2 (all-in vs P&I definitions); `docs/reference/portfolio-csv-export.md` (no escrow basis note for this column); `app/prisma/schema.prisma` (`Mortgage.escrowIncluded Boolean @default(false)`, `Mortgage.monthlyPayment`).

### Low

- **Unknown `loanType` on import causes hard row failure rather than null fallback (new)** — `normalizeLoanTypeFromCsv` correctly normalizes case (e.g., `"fha"` → `"FHA"`) but returns `{ error: string }` for unrecognized values (e.g., `"balloon"`, `"HELOC"`, `"bridge loan"`). `parseRow` in `csv-parser.ts` (lines 354–358) propagates this as a row-level hard failure, rejecting the entire property row rather than importing with `loanType = null`. The prior audit recommendation (2026-04-03 Run 2) was to fall back to `null` with a warning for unknown values, to preserve import success for rows from non-standard spreadsheets. `loanType` is display/filter metadata not used in any metric calculation, so a hard failure is disproportionate to the impact of the unknown value. **Evidence:** `app/lib/import/csv-parser.ts` (`normalizeLoanTypeFromCsv` lines 29–44, `parseRow` lines 354–358); `app/lib/validations/mortgage.ts` (`LOAN_TYPE_OPTIONS`).

- **Portfolio summary print page omits ownership display mode context (new)** — The `/export/portfolio-summary` page (`app/app/(app)/export/portfolio-summary/page.tsx`) renders mode-dependent metrics — `Total debt`, `DSCR`, `Monthly cash flow` — without indicating which ownership display mode (proportional vs full liability) was applied. The footer note (line 180) references "ownership display mode" in generic terms but does not show the actual active mode. `buildPortfolioSummaryPayload` uses the user's `ownershipDisplayMode` from `User.ownershipDisplayMode` (defaulting to `"proportional"`), and the payload fields `totalDebt` and `dscr` differ materially between modes for multi-owner portfolios. A printed or shared PDF carries no mode context, making reconciliation ambiguous for any reader other than the account holder. **Evidence:** `app/app/(app)/export/portfolio-summary/page.tsx` (footer lines 176–187, `SummaryPayload` type lacks `displayMode`); `app/lib/server/portfolio-summary-payload.ts` (`buildPortfolioSummaryPayload` — returns `metrics` spread without `displayMode`); `docs/policies/ownership-metrics.md` §2 (mode-dependent metric table).

- **`property-metrics.ts` header references stale `engineering-spec.md §6` (carried from math audits)** — File comment at line 3 (`"Formulas from docs/reference/engineering-spec.md §6"`) points to a section known to be outdated (no vacancy, no ownership modes). The canonical source is `docs/policies/ownership-metrics.md`. This has been flagged in multiple math audit runs (2026-03-28 through 2026-03-30) as a task candidate but remains open. The stale reference could mislead a new contributor who relies on `engineering-spec.md §6` for formula context. **Evidence:** `app/lib/metrics/property-metrics.ts` (line 3); `docs/audits/math/2026-03-30-math-logic-audit-5.md` (Medium finding, still open task candidate).

---

## Evidence reviewed

### Process and policy docs
- `docs/process/data-integrity-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/policies/ownership-metrics.md` (canonical formula and mode semantics)
- `docs/policies/analytics-math-policy.md` (time windows, debt-service sourcing, reconciliation rules)
- `docs/architecture-and-build-practices.md`
- `docs/reference/portfolio-csv-export.md` (last updated 2026-04-01)

### Previous audit
- `docs/audits/data-integrity/2026-04-03-data-integrity-audit-2.md`

### Schema
- `app/prisma/schema.prisma` — `Property`, `Mortgage`, `User`, `SavedDeal` models

### Metrics library
- `app/lib/metrics/property-metrics.ts` — `computePropertyMetrics`, `scaleLiabilityAmount`, `getAnnualDebtService`, `computeAnnualCashFlowFromAnnualInputs`
- `app/lib/metrics/portfolio-metrics.ts` — `computePortfolioMetrics`

### API routes
- `app/app/api/properties/[id]/metrics/route.ts` — property metrics endpoint
- `app/app/api/portfolio/summary/route.ts` — portfolio summary endpoint
- `app/app/api/export/portfolio/route.ts` — CSV export (full; headers array, metric computation, response header block)
- `app/app/api/export/portfolio-summary/route.ts` — JSON portfolio summary for print export
- `app/app/api/import/portfolio/route.ts` — CSV import (full; Papa Parse config, `papaErrors` propagation, mortgage create branch)
- `app/app/api/import/portfolio/template/route.ts` — import CSV template

### Library and validation
- `app/lib/import/csv-parser.ts` — `parseRow`, `normalizeLoanTypeFromCsv`, `getCol`
- `app/lib/import/validate-import-mortgage.ts`
- `app/lib/validations/mortgage.ts` — `LOAN_TYPE_OPTIONS`, `createMortgageSchema`, `validateMortgagePiCoversInterestFields`
- `app/lib/server/portfolio-summary-payload.ts` — `buildPortfolioSummaryPayload`, `buildDashboardPortfolioPayload`

### UI components
- `app/app/(app)/settings/download-csv-button.tsx` — CSV download UX (truncation notice, error states)
- `app/app/(app)/settings/import-csv-section.tsx` — referenced for multi-lien warning
- `app/app/(app)/properties/[id]/page.tsx` — property detail page (metrics computation, DSCR derivation)
- `app/app/(app)/properties/[id]/overview-tab-content.tsx` — property detail overview tab (metric labels: Monthly cash flow, DSCR, Equity, Loan-to-value, NOI, Cap rate, Cash-on-cash return, Annual rent)
- `app/app/(app)/properties/property-metrics-section.tsx` — shared investment metrics section
- `app/app/(app)/dashboard/page.tsx` — portfolio dashboard (metric labels vs API field names)
- `app/app/(app)/export/portfolio-summary/page.tsx` — print/export summary page
- `app/app/(app)/properties/[id]/projections-tab-content.tsx` — modeling/projections workspace (`cashFlowDebtServiceSource = "all_in_payment"` confirmed; baseline notes text at line 1030)

### Audit limits
- Static code review only; no live runtime verification of truncation, Papa Parse error scenarios, or multi-lien import end-to-end flows.
- `import-csv-section.tsx` multi-lien warning text not re-read directly in this pass; prior run confirmed its presence.

---

## Risk & impact assessment

**High (multi-lien import):** Affects any user with more than one mortgage on a property who exports and re-imports. The CSV is the only data portability path; a re-import from a multi-lien portfolio silently collapses multiple loans into one aggregate. User may not notice until property metrics diverge from lender statements. Likelihood: moderate for investors with HELOCs or multiple liens.

**Medium (export omits origination columns):** Origination metadata (`original loan amount`, `loan type`) is lost on export→import for all properties. `loanType` is display metadata; loss is low impact today. `original loan amount` loss affects any future analytics relying on LTV at origination or loan-age modeling. Likelihood of user-visible impact: low now, increasing with any feature using origination data.

**Medium (monthly payment escrow basis unlabeled):** Risk is highest when a user downloads the portfolio CSV and imports values into a third-party tool (loan modeling spreadsheet, lender underwriting worksheet) expecting P&I for debt-service coverage calculations. If the stored payment includes escrow, the user's DSCR or coverage calculation will be understated. Likelihood of confusion: moderate for financially sophisticated users; low for passive landlords who don't decompose the payment.

**Low (hard loanType failure):** Users importing from spreadsheets with non-standard loan type labels (balloon, bridge, HELOC) will have those rows fail. Since `loanType` doesn't affect any metric, the failure blocks a property that would otherwise import cleanly. User experience: confusing because the row fails on metadata, not on core property fields. Likelihood: moderate for power users who maintain their own spreadsheets.

**Low (print summary omits mode):** Risk is entirely in the shared/printed document scenario. A lender or advisor looking at the summary PDF cannot determine whether debt figures are proportional or full-liability without context from the account holder. Likelihood of direct data integrity harm: low.

**Low (stale engineering-spec reference):** Risk is developer confusion during future metrics work. No user-facing impact.

---

## Recommendations (prioritized)

1. **Surface a multi-lien import warning at file-selection or confirm step** — When the parsed CSV contains any row whose `mortgage lien count` > 1 (or whose `monthly payment` column name is `monthly payment (all liens sum)`), add an in-line warning before the user confirms import: "One or more properties in this file had multiple mortgages. Only the first lien will be recreated. Add additional liens in-app after import." This prevents silent data loss at the point of action.

2. **Add `original loan amount` and `loan type` to export headers** — Append both columns to the CSV export (first-lien values, consistent with existing first-lien columns). This closes the single-lien round-trip gap and completes origination metadata in the export record.

3. **Add escrow basis note to `portfolio-csv-export.md` and export column header or footer** — Document in `docs/reference/portfolio-csv-export.md` that `monthly payment (all liens sum)` is stored all-in payment (may include escrow per `escrowIncluded` per mortgage). Consider adding a `escrow included (first lien)` boolean column to the export so users can derive P&I for the first lien without ambiguity.

4. **Change unknown `loanType` on import to null fallback with row-level warning** — In `normalizeLoanTypeFromCsv`, return `{ value: null, warning: string }` for values that don't match any `LOAN_TYPE_OPTIONS` entry. Propagate the warning as a non-blocking row-level note in the import response alongside `imported` and `errors`. This aligns with the original recommendation and preserves import success for rows with non-standard loan type labels.

5. **Add ownership mode to `buildPortfolioSummaryPayload` return and display it on print page** — Include `displayMode` in the payload. On the `/export/portfolio-summary` page, add a small footnote: "Ownership display mode: proportional / full liability" so printed documents carry self-contained context for reconciliation.

6. **Update or deprecate `engineering-spec.md §6`** — Add a one-line banner at the top of §6 pointing to `docs/policies/ownership-metrics.md` and `app/lib/metrics/property-metrics.ts` as canonical. Update the comment in `app/lib/metrics/property-metrics.ts` line 3 to reference the ownership-metrics policy. (Carried from math audit series.)

---

## Errata (2026-04-04)

**DI-1 / multi-lien warning:** Full-audit synthesis [`2026-04-04-audit-synthesis.md`](../synthesis/2026-04-04-audit-synthesis.md) closes **DI-1** as already addressed: `import-csv-section.tsx` includes a persistent **"Multiple mortgages:"** note above the import control (lines 212–216). This audit’s stricter recommendation (warn at file-selection or confirm when the parsed CSV indicates multi-lien) remains a valid **follow-up** if PM wants parity with the moment-of-action pattern; it is not required for the synthesis closure.

---

## Task candidates

- [x] Show multi-lien collapse warning in import UX — **Closed per synthesis DI-1 (2026-04-04):** persistent note block in `import-csv-section.tsx`. *(Optional later: conditional warning at file-selection when CSV rows indicate multi-lien — see Errata above.)*
- [ ] Add `original loan amount` and `loan type` (first lien) to export headers in `app/app/api/export/portfolio/route.ts`.
- [ ] Add escrow-basis note to `docs/reference/portfolio-csv-export.md` for `monthly payment (all liens sum)` column; optionally add `escrow included (first lien)` boolean export column.
- [ ] Change unknown `loanType` in `normalizeLoanTypeFromCsv` to return `{ value: null, warning }` instead of `{ error }` and propagate as non-blocking import warning.
- [ ] Add `displayMode` to `buildPortfolioSummaryPayload` return; display it on `/export/portfolio-summary` print page footer.
- [ ] Update `app/lib/metrics/property-metrics.ts` line 3 comment to cite `docs/policies/ownership-metrics.md` instead of `engineering-spec.md §6`.

---

## Re-test checklist

- [x] Multi-lien import UX — persistent warning copy verified per synthesis **DI-1** (2026-04-04). *(Optional: re-test conditional file-selection warning if implemented later.)*
- [ ] Verify export CSV includes `original loan amount` and `loan type` columns when added.
- [ ] Verify `loanType = "balloon"` in imported CSV imports with `loanType = null` and a non-blocking warning rather than a row failure.
- [ ] Verify `/export/portfolio-summary` print page footer shows active ownership mode.
- [ ] Verify that previously-resolved items have not regressed: truncation notice appears on download when export is truncated; download error state shows on 429/401; `loanType = "fha"` normalizes to `"FHA"` on import; Papa Parse structural errors appear in import response warnings.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Any merge touching `app/app/api/export/portfolio/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/lib/import/csv-parser.ts`, `app/lib/server/portfolio-summary-payload.ts`, or `app/app/(app)/export/portfolio-summary/page.tsx`.
- **Recommended next run:** 2026-07-01, or immediately after any of the task candidates above are shipped.
