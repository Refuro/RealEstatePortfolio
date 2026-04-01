# Data Integrity & Reconciliation Audit — 2026-04-01

## Executive summary

- **Prior-audit escrow and balance-alias gaps resolved:** The two High findings from 2026-03-31 (missing `escrow amount (first lien)` and `mortgage balance (stored sum)` import aliases) are now fixed in `csv-parser.ts` — all exported first-lien column headers round-trip correctly for single-mortgage properties.
- **Critical import validation gap remains open:** The portfolio CSV import route creates mortgages directly via Prisma without running `createMortgageSchema`, `validateEscrowAmount`, or `validateMortgagePiCoversInterestFields`. Negative-amortizing and escrow-invalid mortgages can enter the database through import even though the same conditions are blocked by the mortgage API routes.
- **Authorization defense-in-depth gap:** `DELETE /api/properties/[id]` and the mortgage `PATCH`/`DELETE` sub-route use Prisma statements without a `userId` filter, relying solely on a preceding ownership check; this is inconsistent with `PATCH /api/properties/[id]` which correctly folds `userId` into the Prisma `where` clause.
- **Recommendation:** Close the import validation gap with schema-level checks before the next launch cycle; add `userId` defense-in-depth to the three unguarded Prisma write calls; document the mortgage `startDate` import proxy in the CSV contract doc.

---

## Severity-ranked findings

### Critical

- **Import route bypasses all mortgage validation** — `app/app/api/import/portfolio/route.ts` calls `tx.mortgage.create` directly with parsed CSV values, skipping `createMortgageSchema.superRefine` (P&I covers monthly interest), `validateEscrowAmount` (escrow < payment), and the shared `validateMortgagePiCoversInterestFields` helper. `POST /api/properties/[id]/mortgage` runs both checks; the import does not. A CSV can therefore insert mortgages with negative-amortizing payment schedules or escrow amounts equal to or exceeding the monthly payment — states that `app/lib/amortization.ts` and the payoff projection logic do not handle defensively. **Evidence:** `app/app/api/import/portfolio/route.ts` lines 163–188; `app/lib/validations/mortgage.ts` lines 97–115, 121–133.

### High

- **`POST /api/properties` embedded mortgage skips `validateEscrowAmount`** — `app/app/api/properties/route.ts` validates the embedded mortgage with `createMortgageSchema.safeParse` (P&I superRefine runs) but never calls `validateEscrowAmount`. An `escrowAmount >= monthlyPayment` condition is accepted here even though the dedicated `POST /api/properties/[id]/mortgage` route explicitly calls `validateEscrowAmount` and rejects it. Creates a validation inconsistency between the two property-creation paths. **Evidence:** `app/app/api/properties/route.ts` lines 82–105 (no `validateEscrowAmount` call); `app/app/api/properties/[id]/mortgage/route.ts` lines 116–122 (escrow check present).

- **`DELETE /api/properties/[id]` Prisma call lacks `userId` filter** — Line 149: `prisma.property.delete({ where: { id } })`. Ownership is verified by `getPropertyForUser(id, user.id)` two lines earlier, but the Prisma operation is not independently scoped to `userId`. The `PATCH` on the same file correctly uses `{ where: { id, userId: user.id } }`. The same pattern appears in the mortgage sub-routes: `prisma.mortgage.delete({ where: { id: mortgageId } })` and `prisma.mortgage.update({ where: { id: mortgageId }, ... })` in `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` (lines 148, 171). A future refactor that removes or bypasses the preflight ownership check would introduce an IDOR. **Evidence:** `app/app/api/properties/[id]/route.ts` line 149; `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` lines 148, 171.

### Medium

- **Mortgage `startDate` proxied from `purchaseDate` on import** — `app/app/api/import/portfolio/route.ts` line 180 sets `startDate: r.purchaseDate`. No mortgage start date column exists in the CSV format. For refinanced loans where the mortgage origination date differs from the property purchase date, this produces an incorrect `startDate`, causing `getEffectiveBalance` and `getPayoffProjection` to compute against the wrong amortization timeline. The error is silent — no warning is surfaced to the user at import time. **Evidence:** `app/app/api/import/portfolio/route.ts` line 180; `app/lib/amortization.ts` (startDate-sensitive); `docs/reference/portfolio-csv-export.md` (no start date column defined).

- **Zero-balance and no-mortgage properties export effective/stored balance as blank** — `app/app/api/export/portfolio/route.ts` lines 185–186 use `escapeCsvCell(totalMortgageBalance || "")` and `escapeCsvCell(mortgageBalanceStored || "")`. When `totalMortgageBalance` or `mortgageBalanceStored` is `0` (no mortgages or fully paid-off), `0 || ""` evaluates to `""`, yielding a blank CSV cell. On re-import the blank is read as `null` mortgage balance (no mortgage created), which is operationally correct but makes a paid-off $0-balance property indistinguishable in the export from a property that never had a mortgage. **Evidence:** `app/app/api/export/portfolio/route.ts` lines 185–186.

- **`serializePropertyForApi` omits computed mortgage fields** (carried from 2026-03-31, unfixed) — `GET /api/properties` and `GET /api/properties/[id]` return mortgage objects without `effectiveBalance`, `balanceSource`, or `payoffProjection`. These fields are added only by the dedicated mortgage `serializeMortgage` function in `app/app/api/properties/[id]/mortgage/route.ts`. API consumers comparing list vs. mortgage sub-resource see different shapes; two requests are required to get full computed mortgage data. **Evidence:** `app/lib/serialize/property-api.ts` lines 70–79; `app/app/api/properties/[id]/mortgage/route.ts` lines 50–58.

### Low

- **Duplicate `zipCode` alias in `getCol` call** — `app/lib/import/csv-parser.ts` line 165: `getCol(row, "zipCode", "zip", "zipCode")` passes `"zipCode"` twice. The second occurrence is unreachable (first match returns) and is harmless, but indicates a copy-paste error that could mask a missing alias in a future edit. **Evidence:** `app/lib/import/csv-parser.ts` line 165.

- **`display mode` column exported but not importable** (carried from 2026-03-31, still undocumented) — The CSV export writes a `display mode` column per row, but `csv-parser.ts` has no alias for it and the import route does not apply it to `User.ownershipDisplayMode`. This is the correct product behavior (ownership display mode is an account-level setting, not a property-level field), but `docs/reference/portfolio-csv-export.md` does not explicitly list this column as export-only/non-round-trip. **Evidence:** `app/app/api/export/portfolio/route.ts` line 215 (header list); `app/lib/import/csv-parser.ts` (no `display mode` alias).

- **`cap rate` CSV column format is undocumented as a percentage** — Exported as `(metrics.capRate * 100).toFixed(2)` — a percentage value (e.g., `5.25`) — but the column header is `"cap rate"` with no `%` indicator. The import does not read this column, so there is no round-trip risk, but the CSV contract doc (`docs/reference/portfolio-csv-export.md`) does not note that this column is a percentage nor that it is export-only/derived. **Evidence:** `app/app/api/export/portfolio/route.ts` line 198–200; `docs/reference/portfolio-csv-export.md` (no cap-rate entry).

---

## Evidence reviewed

- **Policies:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/reference/portfolio-csv-export.md`
- **Schema:** `app/prisma/schema.prisma` — `User`, `Property`, `Mortgage`, `SavedDeal`; field nullability, cascade rules
- **Export:** `app/app/api/export/portfolio/route.ts` — headers, multi-lien semantics, `computePropertyMetrics`, `displayMode` sourcing
- **Import parser:** `app/lib/import/csv-parser.ts` — column aliases, `parseRow`, `normalizePropertyTypeFromCsv`; `app/lib/import/rent-resolve.ts`
- **Import route:** `app/app/api/import/portfolio/route.ts` — validation pipeline, mortgage creation, transaction scope
- **Mortgage validation:** `app/lib/validations/mortgage.ts` — `createMortgageSchema`, `updateMortgageSchema`, `validateEscrowAmount`, `validateMortgagePiCoversInterestFields`
- **Property validation:** `app/lib/validations/property.ts` — `createPropertySchema`, `updatePropertySchema`, `parseUnitRentsFromDb`
- **API routes:** `app/app/api/properties/route.ts` (GET, POST), `app/app/api/properties/[id]/route.ts` (GET, PATCH, DELETE), `app/app/api/properties/[id]/mortgage/route.ts` (GET, POST), `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` (PATCH, DELETE)
- **Portfolio summary:** `app/app/api/portfolio/summary/route.ts`, `app/lib/server/portfolio-summary-payload.ts`
- **Serializer:** `app/lib/serialize/property-api.ts`
- **Metrics helpers:** `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`
- **Property utilities:** `app/lib/property-utils.ts` (`getPropertyTotalRent`)

**Audit limits:** Amortization internals (`app/lib/amortization.ts`) and RentCast/benchmark surfaces were reviewed at the call site only, not re-audited in full. Deal analyzer routes were out of scope for this pass.

---

## Risk & impact assessment

The **Critical** import validation gap is the highest-exposure risk: any user with a CSV can insert mortgage records that violate amortization invariants, leading to incorrect `getEffectiveBalance` and `getPayoffProjection` outputs on those properties across all surfaces (dashboard, export, property detail). Once persisted, corrupt rows produce misleading metrics silently. The likelihood is moderate — users who re-import slightly modified exports are the at-risk cohort.

The **High** authorization gap (`DELETE` without `userId`) is low-likelihood in the current code (ownership preflight guard is present), but it is a structural debt item: any future refactor that extracts or removes the preflight check would immediately become an IDOR without test coverage to catch the regression.

The **Medium** `startDate` proxy issue affects every refinanced property imported via CSV — a common real-world case. Effective balance and payoff dates for these properties are systematically wrong until corrected in-app, and no import-time warning is issued.

---

## Recommendations (prioritized)

1. **Close the import mortgage validation gap** — Before `tx.mortgage.create` in `app/app/api/import/portfolio/route.ts`, run at minimum `validateEscrowAmount` and `validateMortgagePiCoversInterestFields` (or migrate to `createMortgageSchema.safeParse`). Emit per-row errors rather than silently skipping; do not create the mortgage if validation fails.
2. **Add `validateEscrowAmount` to `POST /api/properties`** — After `createMortgageSchema.safeParse` in `app/app/api/properties/route.ts`, add the same escrow check called by the mortgage POST route so all mortgage-creation paths enforce identical constraints.
3. **Add `userId` defense-in-depth to three Prisma write calls** — `prisma.property.delete` (`[id]/route.ts` line 149), `prisma.mortgage.update` (`[mortgageId]/route.ts` line 148), and `prisma.mortgage.delete` (`[mortgageId]/route.ts` line 171) should include `userId` (or `property: { userId }`) in their `where` clause, mirroring the pattern already used in `PATCH /api/properties/[id]`.
4. **Add a mortgage `startDate` column to the CSV import format** — Define a `mortgage start date` / `start date` column in the import spec and parser. Fall back to `purchaseDate` only when the column is absent/empty, and surface a per-row notice when the fallback is used.
5. **Fix zero-balance export cells** — Replace `totalMortgageBalance || ""` with an explicit null check (e.g. `lienCount > 0 ? totalMortgageBalance : ""`) to distinguish "no mortgage" from "paid-off balance." Update `docs/reference/portfolio-csv-export.md` to describe the empty-cell semantics.
6. **Document export-only columns in CSV contract** — Add a table to `docs/reference/portfolio-csv-export.md` classifying each column as: round-trip, export-only/derived (NOI, cash flow, cap rate, LTV, display mode), or lossy (multi-lien fields). Note that `cap rate` is expressed as a percentage.

---

## Task candidates

- [ ] Add `validateEscrowAmount` + `validateMortgagePiCoversInterestFields` to import route mortgage creation block; surface row-level errors.
- [ ] Add `validateEscrowAmount` call after `createMortgageSchema.safeParse` in `POST /api/properties`.
- [ ] Update `prisma.property.delete`, `prisma.mortgage.update`, and `prisma.mortgage.delete` to include `userId` scoping in Prisma `where`.
- [ ] Define `mortgage start date` import column in `csv-parser.ts` and `docs/reference/portfolio-csv-export.md`; fall back to `purchaseDate` with a logged notice.
- [ ] Fix `totalMortgageBalance || ""` and `mortgageBalanceStored || ""` to explicit null/zero distinction.
- [ ] Add round-trip / export-only / lossy column matrix to `docs/reference/portfolio-csv-export.md`; note `cap rate` percentage basis.

---

## Re-test checklist

- [ ] Import a CSV where escrow ≥ monthly payment — verify row is rejected with a clear error after fix.
- [ ] Import a CSV where P&I does not cover monthly interest — verify row is rejected with a clear error after fix.
- [ ] Verify `DELETE /api/properties/[id]` and mortgage delete/update calls are correctly scoped after `userId` fix.
- [ ] Export a portfolio with a paid-off ($0 balance) property; confirm zero renders as `0` not blank after fix.
- [ ] Export → import round-trip for a single-mortgage property; verify `escrowAmount`, `mortgageRate`, `mortgageTerm`, `lenderName`, `balanceAsOfDate` all round-trip without loss.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Changes to Prisma mortgage/property schema, import/export column definitions, mortgage validation helpers, or `serializePropertyForApi`.
- **Recommended next run:** 2026-05-01 or before the next release that touches import/export or mortgage write paths.
