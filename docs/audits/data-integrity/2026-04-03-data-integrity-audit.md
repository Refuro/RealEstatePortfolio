# Data Integrity & Reconciliation Audit — 2026-04-03

## Executive summary

- **Core metrics alignment is strong:** Property-level numbers use one engine — `computePropertyMetrics` in `app/lib/metrics/property-metrics.ts` — on `GET /api/export/portfolio`, `GET /api/properties/[id]/metrics`, and server-rendered property/dashboard flows with the same inputs (`getPropertyTotalRent`, `getEffectiveBalance` sums, user `ownershipDisplayMode`).
- **CSV contract is documented and mostly implemented as written:** `docs/reference/portfolio-csv-export.md` matches export code for canonical `property type`, multi-mortgage column semantics, first-lien vs aggregate columns, and zero-vs-empty mortgage balance behavior (`app/app/api/export/portfolio/route.ts`).
- **Largest reconciliation risks** sit at **CSV boundaries**: multi-lien rows cannot be reconstructed from a single import row (documented lossy path); aggregate **monthly payment** and **balance** columns from exports map to **one** imported `Mortgage`, which can produce misleading or invalid loans if users treat multi-lien export as a backup restore. **Download UX** does not surface plan **slice truncation** headers returned by the export API.
- **Secondary gaps:** Papa Parse can return recoverable errors that are ignored when any rows parse; import does not apply the mortgage **loan type** Zod enum used by API routes; export does not include **original loan amount** / **loan type** columns present on the import template.

## Severity-ranked findings

### Critical

- None identified in this pass. Mortgage validation for import (`getImportMortgageValidationError` in `app/lib/import/validate-import-mortgage.ts`) applies `validateEscrowAmount` and `validateMortgagePiCoversInterestFields` consistent with `app/lib/validations/mortgage.ts` before `prisma` writes (`app/app/api/import/portfolio/route.ts`).

### High

- **Multi-lien export columns are not semantically safe for single-lien import** — Export writes `monthly payment (all liens sum)` and aggregate balances while import binds those labels to **one** `mortgage.create` (`app/app/api/import/portfolio/route.ts`, `app/lib/import/csv-parser.ts`). Re-importing a multi-mortgage row can create one loan whose **payment** and **balance** are portfolio-level aggregates, not a real first lien; P&I validation may reject the row or accept a misleading synthetic loan. **Risk:** Users believe CSV backup restores debt structure; numbers diverge from in-app multi-lien truth. **Evidence:** `docs/reference/portfolio-csv-export.md` (Round-trip vs lossy matrix); `app/app/api/import/portfolio/route.ts` (single `mortgage.create` when mortgage fields present); `csv-parser.ts` (`getCol` for `monthly payment (all liens sum)` and multiple balance column aliases into `mortgageBalance`).

- **Plan-limited export truncation is invisible in the download UI** — `GET /api/export/portfolio` returns `X-Veld-Property-Slice-Truncated`, `X-Veld-Property-Count-Total`, `X-Veld-Property-Count-Included`, `X-Veld-Property-Limit` (`app/app/api/export/portfolio/route.ts`). `app/app/(app)/settings/download-csv-button.tsx` only saves the blob and does not read headers or warn. **Risk:** Incomplete archives mistaken for full portfolio backups on limited tiers.

### Medium

- **`rent` vs derived NOI / cap rate in spreadsheets** — Exported **`rent`** follows `getPropertyTotalRent` (contract / total monthly). **NOI**, **annual cash flow**, and **cap rate** use **effective rent after vacancy** inside `computePropertyMetrics` (`app/lib/metrics/property-metrics.ts`). **`vacancy %`** is on the row, but naive `rent × 12` checks will not reconcile to **NOI** without applying vacancy (see `docs/policies/analytics-math-policy.md` §3.4). **Evidence:** `app/app/api/export/portfolio/route.ts` (inputs to `computePropertyMetrics` vs `getPropertyTotalRent` for the rent column).

- **Papa Parse errors may be dropped when some rows succeed** — Import returns 400 only when `parsed.errors.length > 0 && parsed.data.length === 0` (`app/app/api/import/portfolio/route.ts`). If the parser reports warnings/errors but yields non-empty `data`, processing continues without aggregating `parsed.errors` into the response. **Risk:** Silent column misalignment or dropped malformed rows in edge-case CSVs.

- **Import `loanType` bypasses API Zod enum** — `createMortgageSchema` restricts `loanType` to `LOAN_TYPE_OPTIONS` (`app/lib/validations/mortgage.ts`). CSV import writes `loanType: r.loanType ?? null` directly from the row (`app/app/api/import/portfolio/route.ts`) with no schema pass. **Risk:** Free-form strings in DB vs normalized API-created mortgages; downstream reporting inconsistency.

- **Export omits columns the template and importer support** — `GET /api/import/portfolio/template` includes `original loan amount` and `loan type` (`app/app/api/import/portfolio/template/route.ts`); `parseRow` reads them (`app/lib/import/csv-parser.ts`). Export `headers` in `app/app/api/export/portfolio/route.ts` do **not** include those columns. **Risk:** Export → re-import loses origination metadata even for single-lien properties (also noted in prior audits).

### Low

- **`display mode` is exported for CSV context but not imported** — Export writes the user’s `ownershipDisplayMode` lens (`app/app/api/export/portfolio/route.ts`); import has no column that updates `User.ownershipDisplayMode`. **Risk:** Comparing a saved file to live UI after changing mode in Settings — expected product behavior; users should treat `display mode` in CSV as snapshot context (`docs/policies/ownership-metrics.md`).

- **Cap rate / LTV cells are numeric without `%` suffix** — Matches spreadsheet conventions per reference doc; external readers must use headers + `docs/reference/portfolio-csv-export.md` §Percent / money basis.

## Evidence reviewed

- **Process & policy:** `docs/process/data-integrity-audit-process.md`, `docs/process/audit-report-template.md`, `docs/reference/portfolio-csv-export.md`, `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md` (§3.4, §5).
- **Schema:** `app/prisma/schema.prisma` (`Property`, `Mortgage`, `User` fields relevant to CSV and metrics).
- **Validation:** `app/lib/validations/property.ts` (Zod `propertyType` enum, units/rent refinements), `app/lib/validations/mortgage.ts` (`createMortgageSchema`, escrow/P&I helpers).
- **Import/export:** `app/app/api/import/portfolio/route.ts`, `app/app/api/import/portfolio/template/route.ts`, `app/lib/import/csv-parser.ts`, `app/lib/import/validate-import-mortgage.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/(app)/settings/download-csv-button.tsx`, `app/app/(app)/settings/import-csv-section.tsx` (multi-mortgage copy).
- **Metrics parity:** `app/lib/metrics/property-metrics.ts`, `app/app/api/properties/[id]/metrics/route.ts`, `app/app/(app)/properties/[id]/page.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/lib/metrics/portfolio-metrics.ts`.

## Risk & impact assessment

Unresolved **High** items affect **backup/restore trust** and **compliance with user expectations** on tier limits. **Medium** items skew **off-app spreadsheet reconciliation** and **long-term data normalization** (loan type), not necessarily in-app screens that use shared metrics. Likelihood is **higher** for users who rely on CSV as a system of record or who use multi-lien properties.

## Recommendations (prioritized)

1. **Treat multi-lien CSV as reporting-first:** Keep in-app disclosure (e.g. `import-csv-section.tsx`); consider blocking or warning import when `mortgage lien count` &gt; 1 and aggregate payment/balance columns are present, or document “do not re-import multi-lien exports” even more prominently in product copy.
2. **Surface export slice metadata in the download flow** — Read `X-Veld-*` headers in `download-csv-button.tsx` (or a thin wrapper) and show count/truncation before or after download.
3. **Align import mortgage metadata with API** — Run imported mortgage fields through the same `loanType` normalization as `createMortgageSchema`, or reject unknown labels with row-level errors.
4. **Optional: extend export** with `original loan amount` and `loan type` for first lien to improve single-lien round-trip parity with `csv-parser.ts` / template.

## Task candidates (optional)

- [ ] Show export truncation and included/total property counts in Settings CSV download UX using `GET /api/export/portfolio` response headers.
- [ ] Aggregate or surface Papa Parse `errors` when `parsed.data.length > 0` (warning toast or row-0 message).
- [ ] Add export columns for first-lien `original loan amount` and `loan type` to match template/import.
- [ ] Validate or normalize CSV `loan type` against `LOAN_TYPE_OPTIONS` in `parseRow` or import route.

## Re-test checklist

- [ ] Verify fix for export truncation UX (if implemented) across tiers with property limits.
- [ ] Verify multi-lien import behavior if product adds warnings or column changes.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Release touching `lib/import`, `api/export/portfolio`, `lib/metrics`, or Prisma `Property`/`Mortgage` models.
- **Recommended next run:** 2026-07-01 or next major portfolio data change.
