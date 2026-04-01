# Data Integrity & Reconciliation Audit — 2026-04-01

## Executive summary

- **Overall health is strong** for core contracts: portfolio metrics use shared `computePropertyMetrics` from `app/lib/metrics/property-metrics.ts` on export (`GET /api/export/portfolio`), property metrics API (`GET /api/properties/[id]/metrics`), and dashboard/property UI with the user’s ownership display mode; saved deals APIs and the deals list page intentionally use **proportional** mode only, matching `docs/policies/ownership-metrics.md` §5 and explicit UI copy on `app/app/(app)/deals/page.tsx`.
- **CSV import path is materially aligned with mortgage validation:** `POST /api/import/portfolio` runs `getImportMortgageValidationError` (`app/lib/import/validate-import-mortgage.ts`), which applies `validateEscrowAmount` and `validateMortgagePiCoversInterestFields` before any row is imported—addressing the historical gap where import could diverge from `POST /api/properties/[id]/mortgage`. Rows that fail mortgage validation are rejected with row-level errors (property not created for that row).
- **Top residual risks** are **user reconciliation** (multi-mortgage export is lossy on re-import; tier-based export truncation is not obvious in the download UI) and **CSV edge behavior** (Papa Parse may return rows while reporting parse errors; ambiguous `is rented` cells default to rented).
- **Recommendation:** Keep `docs/reference/portfolio-csv-export.md` as the reconciliation anchor; tighten UX/diagnostics for truncated exports and document export-only/derived columns so spreadsheet users do not mis-compare numbers across sessions or tools.

---

## Severity-ranked findings

### Critical

- None identified in this pass. Portfolio import mortgage validation is enforced via `getImportMortgageValidationError` before `prisma` writes (`app/app/api/import/portfolio/route.ts` with `app/lib/import/validate-import-mortgage.ts`).

### High

- **Multi-mortgage properties do not round-trip through CSV** — Import creates **at most one** `Mortgage` per property row (`app/app/api/import/portfolio/route.ts`); export can list many liens (`mortgage lien count`, `mortgage stored balances (pipe)`, sums). Re-importing an exported multi-lien row cannot recreate lien structure; balances/rates mapped through a single `mortgageBalance` column are inherently ambiguous. **Risk/impact:** Users can believe a backup CSV fully restores portfolio state; partial recovery without manual follow-up in the app. **Evidence:** `docs/reference/portfolio-csv-export.md` (Round-trip vs lossy matrix); `app/app/api/import/portfolio/route.ts` (single `mortgage.create`); `app/lib/import/csv-parser.ts` (one balance field).

### Medium

- **Plan-limited export slice is not surfaced in the settings download UI** — `GET /api/export/portfolio` returns `X-Veld-Property-Slice-Truncated`, `X-Veld-Property-Count-Total`, and `X-Veld-Property-Count-Included` (`app/app/api/export/portfolio/route.ts`), but `app/app/(app)/settings/download-csv-button.tsx` only downloads the blob and does not read headers or warn when the file is a truncated subset. **Risk/impact:** Users on limited tiers may archive an incomplete export without knowing. **Evidence:** `app/app/api/export/portfolio/route.ts` (headers); `app/app/(app)/settings/download-csv-button.tsx` (no header handling).

- **Papa Parse errors can be ignored when some rows parse** — `POST /api/import/portfolio` returns 400 only when `parsed.errors.length > 0 && parsed.data.length === 0` (`app/app/api/import/portfolio/route.ts`). If the file has recoverable parse warnings and non-empty `data`, processing continues without surfacing `parsed.errors`. **Risk/impact:** Silent row drops or mis-aligned columns in edge-case CSVs. **Evidence:** `app/app/api/import/portfolio/route.ts` (conditional on empty data).

- **Export omits fields the importer accepts (original loan amount, loan type)** — Import template and parser support `original loan amount` / `loan type` (`app/app/api/import/portfolio/template/route.ts`, `app/lib/import/csv-parser.ts`), but `GET /api/export/portfolio` headers do not include those columns (`app/app/api/export/portfolio/route.ts`). **Risk/impact:** Export → re-import loses fidelity for amortization/origination metadata even for single-lien properties. **Evidence:** export `headers` vs `csv-parser.ts` / template `TEMPLATE_HEADERS`.

### Low

- **`is rented` ambiguous values default to rented** — `parseIsRentedCell` (`app/lib/import/csv-parser.ts`) returns `true` for unknown strings (only explicit “no” patterns mark vacant). **Risk/impact:** Typos in spreadsheets may overstate rent requirements or block validation paths unexpectedly. **Evidence:** `app/lib/import/csv-parser.ts` (`parseIsRentedCell`).

- **`display mode` is exported but not imported** — Export writes `display mode` for context of derived columns (`app/app/api/export/portfolio/route.ts`); import does not apply it to the user record (correct product model—account-level setting). **Risk/impact:** Users comparing a saved CSV to live UI must remember the file’s lens; spreadsheet-only workflows may mis-explain deltas if the user’s current mode differs. **Evidence:** `app/lib/import/csv-parser.ts` (no `display mode`); `docs/policies/ownership-metrics.md` (mode semantics).

- **Duplicate header alias in `getCol` for ZIP** — `getCol(row, "zipCode", "zip", "zipCode")` lists `zipCode` twice (`app/lib/import/csv-parser.ts`). **Risk/impact:** Harmless redundancy; future edits could miss a needed alias. **Evidence:** `app/lib/import/csv-parser.ts`.

- **Derived metric columns in CSV lack full basis labeling in the file** — NOI, cash flow, cap rate, LTV are computed with `computePropertyMetrics` and user `displayMode` (`app/app/api/export/portfolio/route.ts`); cap rate is stored as a numeric percent (e.g. `5.25`) without a `%` suffix in the cell. **Risk/impact:** Low for in-app users who use the app as source of truth; moderate for external spreadsheet analysis if headers are interpreted without `docs/reference/portfolio-csv-export.md`. **Evidence:** `app/app/api/export/portfolio/route.ts`; policy `docs/policies/analytics-math-policy.md` §6.

---

## Evidence reviewed

- **Policies:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/architecture-and-build-practices.md` (metrics and CSV references).
- **CSV contract:** `docs/reference/portfolio-csv-export.md`.
- **Import:** `app/app/api/import/portfolio/route.ts`, `app/lib/import/csv-parser.ts`, `app/lib/import/rent-resolve.ts`, `app/lib/import/validate-import-mortgage.ts`, `app/app/api/import/portfolio/template/route.ts`.
- **Export:** `app/app/api/export/portfolio/route.ts`, `app/app/(app)/settings/download-csv-button.tsx`, `app/app/(app)/settings/import-csv-section.tsx` (flow only).
- **Metrics alignment:** `app/lib/metrics/property-metrics.ts`, `app/lib/property-utils.ts` (`getPropertyTotalRent`), `app/app/api/properties/[id]/metrics/route.ts`.
- **Saved deals (intentional proportional contract):** `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`, `app/app/(app)/deals/page.tsx`.
- **Admin CSV (secondary):** `app/app/api/admin/export/users/route.ts` (escaping pattern for operational export).

**Assumptions / limits:** Review focused on import/export, schema alignment, and reconciliation paths per `docs/process/data-integrity-audit-process.md`. No runtime load tests or production data sampling. Application source was read for evidence only; no code changes were made.

---

## Risk & impact assessment

- **Unresolved High (multi-lien CSV):** Affects anyone using CSV as disaster-recovery or migration truth for multi-mortgage properties; likelihood is **medium** among power users, **low** for typical single-lien portfolios.
- **Medium (truncation, parse errors, missing export columns):** Mostly **operational and spreadsheet** risks—incorrect backups, silent CSV quirks, or extra manual steps after restore—not silent wrong math inside the app for a given session.
- **Low items:** Mostly hygiene, documentation, and edge-case input quality.

---

## Recommendations (prioritized)

1. **Surface export truncation and counts in the download UX** (toast, banner, or post-download message) using response headers from `GET /api/export/portfolio`, so users know when the file is not a full portfolio dump.
2. **Extend `docs/reference/portfolio-csv-export.md`** with a concise table of **export-only** columns (`display mode`, derived metrics, cap rate numeric convention) and **import-not-present-on-export** fields (`original loan amount`, `loan type`) to close spreadsheet reconciliation gaps.
3. **Harden import diagnostics:** Log or return non-fatal Papa Parse `errors` when `data.length > 0`, or reject files with structural errors—product choice should favor explicit failure over silent partial import.

---

## Task candidates (optional)

- [ ] Settings: show “X of Y properties included” / truncation warning after portfolio CSV download using export response headers.
- [ ] Docs: add export-only vs import-only column matrix to `docs/reference/portfolio-csv-export.md`.
- [ ] Import API: return or log Papa Parse warnings when `parsed.errors.length > 0` and `parsed.data.length > 0`.
- [ ] Optional product: add `original loan amount` and `loan type` to portfolio export headers for single-lien parity with import (evaluate column explosion vs value).

---

## Re-test checklist

- [ ] After any import/export change: single-lien export → import round-trip on a staging account.
- [ ] After UX change: download CSV on a capped plan and confirm truncation messaging.
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Quarterly, or when CSV columns, mortgage modeling, or ownership/metrics policies change.
- **Recommended next run:** 2026-07-01 (or next major release touching `lib/import`, `api/export/portfolio`, or `lib/metrics`).
