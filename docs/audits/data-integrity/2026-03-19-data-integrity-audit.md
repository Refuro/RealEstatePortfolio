# Data Integrity & Reconciliation Audit — 2026-03-19

## Executive summary

- A round-trip data loss issue exists between export and import: export uses `mortgage balance (effective)` and `mortgage balance (stored)` columns, but import expects `mortgage balance`. Re-importing an exported CSV will not map mortgage balance correctly.
- API response fields and UI labels are well-aligned across all surfaces. `computePropertyMetrics` and `computePortfolioMetrics` are the single source of truth for both API and UI.
- Ownership display mode (`proportional` vs `full_liability`) is correctly applied on all portfolio/property/modeling/export surfaces. Deals and Analyze are intentionally hardcoded to `proportional`, documented in code and policy.
- Prisma schema has reasonable defaults and types, but `unitRents` (JSON field) has no runtime schema validation.

---

## Severity-ranked findings

### Critical

- None found.

### High

**H1 — Export/import column name mismatch breaks CSV round-trip**

Export columns (`api/export/portfolio/route.ts` lines 32–58):
```
mortgage balance (effective), mortgage balance (stored), balance as of
```

Import parser (`lib/import/csv-parser.ts`) expects:
```
mortgage balance, balance as of
```

Import template (`api/import/portfolio/template/route.ts`) generates:
```
mortgage balance, balance as of
```

**Problem:** If a user exports their portfolio CSV, edits it, and re-imports it, the `mortgage balance (effective)` and `mortgage balance (stored)` columns are not recognized by the import parser. The mortgage balance will be `null` on re-import.

**Root cause:** Export was enhanced to show both effective (ownership-scaled) and stored (raw) balances for reconciliation transparency, but import was not updated to accept either column name.

**Fix:** Update the import parser to accept `mortgage balance (effective)` or `mortgage balance (stored)` as aliases for `mortgage balance`, using the stored value as the canonical import value.

### Medium

**M1 — `unitRents` JSON field has no runtime schema validation**

- `Property.unitRents` is a JSON field in Prisma schema (`Json?`).
- Code assumes it's a `number[]` when present (e.g., `property-form.tsx` parses it as comma-separated numbers).
- No Zod schema or runtime type guard validates the JSON structure after database read.
- If corrupted (e.g., `{"a": 1}` instead of `[1200, 1300]`), UI components may crash with unhandled errors.
- **Impact:** Low probability (data is written by the app, not external sources), but no safety net exists.

**M2 — Export omits NOI and annual cash flow columns**

- Export includes: equity, monthly cash flow, cap rate, LTV.
- Export does NOT include: NOI, annual cash flow, DSCR, cash-on-cash return.
- These metrics are visible on dashboard and property detail, so a user comparing export to UI will find gaps.
- **Impact:** Incomplete reconciliation for power users who expect full metric parity.

### Low

**L1 — Import does not read `display mode` column**

- Export includes a `display mode` column (proportional/full_liability) per row.
- Import ignores this column — display mode is a user-level setting, not per-property.
- Not a bug (display mode is correctly user-level), but could confuse users who expect the column to be meaningful on import.

**L2 — `balanceAsOfDate` staleness threshold is hardcoded**

- `lib/amortization.ts` `getEffectiveBalance`: Uses `180 * 24 * 60 * 60 * 1000` (180 days) as the staleness threshold.
- `analytics-math-policy.md` says "6 months."
- 180 days is a reasonable approximation of 6 months but not exact. Not a bug, but worth noting for precision.

---

## Detailed analysis

### Export column inventory

Full export columns from `api/export/portfolio/route.ts` lines 32–58:

| Column | Source | Type |
|--------|--------|------|
| `address` | `property.addressLine1` | String |
| `nickname` | `property.nickname` | String (nullable) |
| `property type` | `property.propertyType` | String |
| `units` | `property.units` | Number |
| `purchase price` | `property.purchasePrice` | Decimal |
| `purchase date` | `property.purchaseDate` | Date |
| `value` | `property.currentEstimatedValue` | Decimal |
| `rent` | `property.currentMonthlyRent` | Decimal |
| `expenses` | `property.currentMonthlyExpenses` | Decimal |
| `vacancy %` | `property.vacancyPercent` | Number |
| `cash invested` | `property.cashInvested` | Decimal (nullable) |
| `ownership %` | `property.ownershipPercent` | Number |
| `display mode` | `user.ownershipDisplayMode` | String |
| `mortgage balance (effective)` | Ownership-scaled balance | Decimal |
| `mortgage balance (stored)` | Raw DB balance | Decimal |
| `balance as of` | `mortgage.balanceAsOfDate` | Date |
| `mortgage rate` | `mortgage.interestRate` | Decimal |
| `mortgage term` | `mortgage.termYears` | Number |
| `monthly payment` | `mortgage.monthlyPayment` | Decimal |
| `escrow amount` | `mortgage.escrowAmount` | Decimal |
| `lender` | `mortgage.lenderName` | String (nullable) |
| `equity` | Computed | Decimal |
| `monthly cash flow` | Computed | Decimal |
| `cap rate` | Computed | Decimal (nullable) |
| `LTV` | Computed | Decimal (nullable) |

### Import parser field inventory

From `lib/import/csv-parser.ts`:

| Column | Parser field | Required |
|--------|-------------|----------|
| `address` / `addressLine1` | Street address | Yes |
| `city` | City | Yes (if separate columns) |
| `state` | State (2-letter code) | Yes (if separate columns) |
| `zipCode` / `zip` | ZIP | Yes (if separate columns) |
| `nickname` | Nickname | No |
| `property type` | Property type | No (defaults to `single_family`) |
| `units` | Units | No (defaults to 1) |
| `purchase price` | Purchase price | Yes |
| `purchase date` | Purchase date | Yes |
| `value` | Current estimated value | Yes |
| `rent` | Monthly rent | Yes |
| `expenses` | Monthly expenses | Yes |
| `vacancy %` | Vacancy percent | No (defaults to 5) |
| `cash invested` | Cash invested | No |
| `ownership %` | Ownership percent | No (defaults to 100) |
| `mortgage balance` | Mortgage balance | No |
| `original loan amount` | Original loan amount | No |
| `balance as of` | Balance as-of date | No |
| `mortgage rate` | Interest rate | No |
| `mortgage term` | Term years | No |
| `monthly payment` | Monthly payment | No |
| `escrow amount` | Escrow amount | No |
| `lender` | Lender name | No |
| `loan type` | Loan type | No |
| `unit rents` | Per-unit rents | No |

**Mismatch summary:**

| Export column | Import column | Match |
|---------------|--------------|-------|
| `mortgage balance (effective)` | `mortgage balance` | NO |
| `mortgage balance (stored)` | `mortgage balance` | NO |
| `display mode` | (not imported) | OK (user setting) |
| `equity` | (not imported) | OK (computed) |
| `monthly cash flow` | (not imported) | OK (computed) |
| `cap rate` | (not imported) | OK (computed) |
| `LTV` | (not imported) | OK (computed) |

### API response to UI label alignment

#### Portfolio summary (`api/portfolio/summary/route.ts`)

| API field | Dashboard UI label | Match |
|-----------|-------------------|-------|
| `totalMarketValue` | Total property value | Yes |
| `totalDebt` | Total debt | Yes |
| `totalEquity` | Total equity | Yes |
| `totalMonthlyCashFlow` | Monthly cash flow | Yes |
| `weightedCapRate` | Portfolio cap rate | Yes |
| `portfolioLtv` | Portfolio LTV | Yes |
| `totalNoi` | NOI | Yes |
| `portfolioCashOnCashReturn` | Cash-on-cash return | Yes |
| `totalAnnualRent` | Annual rent | Yes |
| `dscr` | DSCR | Yes |

All API fields map correctly to UI labels. Both use `computePortfolioMetrics()` as the shared calculation source.

#### Property metrics (`api/properties/[id]/metrics/route.ts`)

| API field | Property detail UI | Match |
|-----------|-------------------|-------|
| `equity` | Equity | Yes |
| `monthlyCashFlow` | Cash flow | Yes |
| `annualCashFlow` | (used in calculations) | Yes |
| `noi` | NOI | Yes |
| `capRate` | Cap rate | Yes |
| `ltv` | LTV | Yes |
| `cashOnCashReturn` | Cash-on-cash | Yes |
| `grossAnnualRent` | (used in calculations) | Yes |
| `annualExpenses` | (used in calculations) | Yes |

Both API and property detail use `computePropertyMetrics()`. No divergence.

### Ownership mode surface audit

| Surface | Respects user `displayMode` | Mode used |
|---------|---------------------------|-----------|
| Dashboard (portfolio metrics) | Yes | User setting |
| Properties list (card metrics) | Yes | User setting |
| Property detail (overview metrics) | Yes | User setting |
| Modeling (projections) | Yes | User setting |
| Mortgage workspace | N/A (balance display only) | N/A |
| Export CSV | Yes | User setting |
| Portfolio summary API | Yes | User setting |
| Property metrics API | Yes | User setting |
| Deal analyzer | No (intentional) | `proportional` always |
| Deals page | No (intentional) | `proportional` always |
| Deals API (create/read) | No (intentional) | `proportional` always |

**Deal analyzer note:** `deal-analyzer-form.tsx` lines 126–128 explicitly use `"proportional"`. UI shows explanatory text: "Full liability mode does not apply to deal analysis." This matches `ownership-metrics.md` policy.

### Prisma schema — data drift risks

| Field | Type | Precision | Risk |
|-------|------|-----------|------|
| `Property.purchasePrice` | `Decimal(14,2)` | 2 decimal places | None |
| `Property.currentEstimatedValue` | `Decimal(14,2)` | Same | None |
| `Property.currentMonthlyRent` | `Decimal(12,2)` | Same | None |
| `Property.currentMonthlyExpenses` | `Decimal(12,2)` | Same | None |
| `Property.cashInvested` | `Decimal(14,2)` | Same | None |
| `Property.ownershipPercent` | `Int` | Integer only | Loss of sub-percent ownership (e.g., 33.33%) |
| `Property.vacancyPercent` | `Int` | Integer only | Loss of fractional vacancy |
| `Property.unitRents` | `Json?` | No schema | **M1** — no runtime validation |
| `Mortgage.interestRate` | `Decimal(6,5)` | 5 decimal places | None |
| `Mortgage.monthlyPayment` | `Decimal(10,2)` | 2 decimal places | None |
| `Mortgage.escrowAmount` | `Decimal(10,2)` | Same | None |
| `User.ownershipDisplayMode` | `String?` | Nullable | Handled: `?? "proportional"` in code |

**Nullable field defaults in code:**
- `ownershipPercent`: defaults to `100` when null/undefined (property-metrics.ts)
- `vacancyPercent`: defaults to `5` when null/undefined
- `ownershipDisplayMode`: defaults to `"proportional"` when null
- `cashInvested`: treated as null (cash-on-cash return returns null)

All nullable fields have documented fallback behavior.

---

## Evidence reviewed

- `app/app/api/export/portfolio/route.ts` (export columns, metric computation)
- `app/lib/import/csv-parser.ts` (import field parsing, validation rules)
- `app/app/api/import/portfolio/route.ts` (import flow, transaction)
- `app/app/api/import/portfolio/template/route.ts` (template columns)
- `app/app/api/portfolio/summary/route.ts` (portfolio API fields)
- `app/app/api/properties/[id]/metrics/route.ts` (property API fields)
- `app/(app)/dashboard/page.tsx` (dashboard UI labels)
- `app/(app)/properties/[id]/property-detail-tabs.tsx` (property detail UI)
- `app/(app)/analyze/deal-analyzer-form.tsx` (deal analyzer ownership mode)
- `app/(app)/deals/page.tsx` (deals ownership mode)
- `app/lib/metrics/property-metrics.ts` (metric computation, ownership scaling)
- `app/lib/metrics/portfolio-metrics.ts` (portfolio computation)
- `app/lib/amortization.ts` (balance staleness threshold)
- Prisma schema (`schema.prisma`)
- `docs/policies/analytics-math-policy.md`
- `docs/policies/ownership-metrics.md`

---

## Risk & impact assessment

- **H1 (export/import mismatch):** Users who export, edit, and re-import will lose mortgage balance data. This is a real data loss scenario, though the workaround is to manually rename the column header before import.
- **M1 (unitRents):** Low probability of corruption from app usage, but any external DB manipulation or migration error could cause silent UI crashes.
- **M2 (export metric gaps):** Power users doing full reconciliation will notice missing NOI/annual cash flow columns. Reduces confidence in export completeness.

---

## Recommendations (prioritized)

1. **Fix export/import column name mismatch** — Either update import to accept `mortgage balance (effective)` and `mortgage balance (stored)` as aliases, or change export to use `mortgage balance` as the column name (using stored value, with display mode noted separately).
2. **Add runtime validation for `unitRents` JSON** — Create a Zod schema for the expected `number[]` structure and validate on read.
3. **Add NOI and annual cash flow to export** — Complete the metric set for reconciliation.
4. **Consider `Decimal` for `ownershipPercent` and `vacancyPercent`** — Allows sub-percent values (33.33% ownership). Low priority but improves precision.

---

## Task candidates

- [ ] Update import parser to accept `mortgage balance (effective)` or `mortgage balance (stored)` as aliases.
- [ ] Add Zod runtime validation for `unitRents` JSON field on read.
- [ ] Add NOI and annual cash flow columns to portfolio export.
- [ ] Evaluate `Decimal` type for `ownershipPercent` and `vacancyPercent`.

---

## Re-test checklist

- [ ] Export a portfolio CSV, then re-import it — verify mortgage balance survives round-trip.
- [ ] Verify `unitRents` with malformed JSON does not crash the UI.
- [ ] Verify new export columns appear correctly in downloaded CSV.
- [ ] `npm run check` passes.

---

## Next trigger and cadence

- Trigger: schema changes, import/export changes, analytics contract changes
- Recommended next run: monthly
