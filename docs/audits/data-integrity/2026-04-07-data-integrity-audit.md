# Data Integrity & Reconciliation Audit — 2026-04-07

## Executive summary

- **Contract parity:** Portfolio aggregates flow through `buildPortfolioSummaryPayload` / `computePortfolioMetrics` with explicit `totalAnnualRent` / NOI alignment (vacancy-adjusted rent basis) per `app/lib/metrics/portfolio-metrics.ts` and `docs/policies/analytics-math-policy.md`. Property-level API metrics (`GET /api/properties/[id]/metrics`) and CSV export both call `computePropertyMetrics` with the user’s `ownershipDisplayMode`, matching policy intent for property/detail/export surfaces; saved deals intentionally use `computePropertyMetrics(..., "proportional")` per `docs/policies/ownership-metrics.md` §5 (`app/app/api/deals/route.ts`).
- **Remediation check:** All three **critical** issues from the 2026-04-05 audit are **verified fixed** in the current codebase: CSV import sets `hasMortgage` after mortgage creation; mortgage `DELETE` recalculates `hasMortgage` from remaining liens; permanent account deletion returns HTTP 503 when Stripe subscription cancel fails instead of proceeding.
- **Residual risks:** Database layer remains lightly constrained (no `User.email` uniqueness, free-text `Subscription.status`, dangling `RentCastApiCall.propertyId`); `SavedDeal` flat mortgage scalars still allow inconsistent balance/payment pairs on partial PATCH; portfolio CSV truncation is visible only via response headers, not inside the file; `docs/reference/portfolio-csv-export.md` does not yet document the exported **`display mode`** column that scopes metric columns to the user’s liability lens.
- **Recommendation:** Schedule migration-hardening and deal PATCH cross-field validation; improve export and reference-doc transparency for truncation and CSV metric basis; add a short comment at `capRate` in `property-metrics.ts` to guard future refactors.

---

## Severity-ranked findings

### Critical

- *No open critical findings on this pass.* Verified remediation of prior critical items:
  - Import: `app/app/api/import/portfolio/route.ts` (lines 223–226) — `tx.property.update({ hasMortgage: true })` after mortgage create.
  - Mortgage delete: `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` (lines 198–213) — transaction updates `hasMortgage` from `remainingMortgageCount`.
  - Permanent delete: `app/app/api/account/delete-permanent/route.ts` (lines 70–85) — Stripe cancel failure returns 503 and does not delete the user.

### High

- **`User.email` has no `@unique` at the database layer** — `app/prisma/schema.prisma` (`User` model): `email` is not unique; only `clerkUserId` is. Risk: duplicate rows from seeds, migrations, or direct SQL; any future `findUnique({ where: { email } })` would be ambiguous. **Evidence:** `app/prisma/schema.prisma` lines 17–22.

- **`RentCastApiCall.propertyId` is not a Prisma relation** — Same schema: optional `propertyId` with no `@relation` or `onDelete` behavior. Property deletion does not clear or cascade this field; rows can orphan. **Evidence:** `app/prisma/schema.prisma` lines 138–145.

- **`Subscription.status` is unconstrained string storage** — Webhook and app code can persist any Stripe status string without DB-level enum or CHECK. Plan gating that assumes known statuses may mis-handle novel values. **Evidence:** `app/prisma/schema.prisma` (`Subscription`, lines 169–181).

- **`SavedDeal` mortgage totals are independent scalars with weak PATCH validation** — `updateDealSchema` is `dealSchemaBase.partial()` with no `superRefine` tying `totalMortgageBalance` to `totalMonthlyPayment`. A partial update can leave inconsistent pairs; metrics on `GET /api/deals`/`serializeDeal` would still compute. **Evidence:** `app/lib/validations/deal.ts` lines 61–64; `app/app/api/deals/route.ts` lines 53–65 (metrics from stored decimals).

- **Portfolio CSV omits in-file notice when the property slice is truncated** — Export applies `take: propertyLimit` (`app/app/api/export/portfolio/route.ts` lines 54–61). Truncation is communicated via `X-Veld-Property-Slice-Truncated` and related headers (lines 227–230), not a row or comment inside the CSV. Users who only open the file lose reconciliation context vs. dashboard/API `slice.truncated`. **Evidence:** same file.

### Medium

- **`docs/reference/portfolio-csv-export.md` omits the `display mode` column** — Exporter writes `display mode` per row from `user.ownershipDisplayMode` (`app/app/api/export/portfolio/route.ts` lines 78, 98–101, 192), which documents the lens used for exported NOI, cash flow, cap rate, and LTV. The reference contract doc (last updated 2026-04-01) does not list this column, creating doc/code drift for auditors and power users reconciling CSV to UI. **Evidence:** `docs/reference/portfolio-csv-export.md`; `app/app/api/export/portfolio/route.ts`.

- **`capRate` computation is correct but fragile to refactor** — `app/lib/metrics/property-metrics.ts` line 97 uses `noi / estimatedValue` before ownership scaling while returned `noi` is scaled (lines 118–120). This matches `docs/policies/ownership-metrics.md` (scale cancels in cap-rate ratio) but lacks an inline comment; a future edit that “fixes” `noi` to scaled-only without adjusting `capRate` would break partial-ownership cap rates silently.

- **`Property.hasMortgage` legacy NULL vs `false` semantics** — Schema allows `hasMortgage Boolean?` (`app/prisma/schema.prisma` line 99). Completeness or UI logic that distinguishes unknown (`null`) from “confirmed no mortgage” (`false`) may still behave inconsistently for pre-migration or never-touched rows unless uniformly normalized. **Evidence:** schema; prior migration `20260406120000_completeness_overhaul` (backfill true only, per 2026-04-05 audit notes).

- **`Property.units` / `propertyType` invariant is Zod-only** — Rule enforced in `app/lib/validations/property.ts` and import parser; no PostgreSQL CHECK. Bulk or raw writes could violate assumptions consumed by `getPropertyTotalRent` / unit rent parsing.

- **Import does not validate `originalLoanAmount >= mortgageBalance` when both supplied** — `app/lib/import/validate-import-mortgage.ts` line 34 uses `originalLoanAmount ?? mortgageBalance` for P&I validation but does not reject `originalLoanAmount < mortgageBalance`. **Evidence:** same file; contrast with user expectation of loan sanity.

### Low

- **`User.ownershipDisplayMode` is free text in DB** — Validated on `PATCH /api/me` in application code; invalid stored values fall back to proportional in metric helpers. **Evidence:** `app/prisma/schema.prisma` line 29; metrics callers coerce/default.

- **`serializePropertyForApi` spreads the Prisma property row** — New DB columns may surface in API responses without an explicit allowlist decision. **Evidence:** `app/lib/serialize/property-api.ts` (pattern noted in 2026-04-05 audit).

- **`vacancyPercent` / `ownershipPercent` lack DB CHECK constraints** — Out-of-range values from direct DB access could distort effective rent and scaled metrics. **Evidence:** `app/prisma/schema.prisma` `Property` model.

- **Dev seed subscription dates** — `app/prisma/seed.ts` may still use past `currentPeriodEnd` values, skewing local subscription-state testing (dev-only impact; confirm if still present when touching seeds).

---

## Evidence reviewed

**Policies and architecture (canonical contracts):**

- `docs/policies/ownership-metrics.md`
- `docs/policies/analytics-math-policy.md`
- `docs/architecture-and-build-practices.md` (metrics and CSV reference pointers)
- `docs/reference/portfolio-csv-export.md`

**Schema:**

- `app/prisma/schema.prisma` (full model pass: `User`, `Property`, `Mortgage`, `SavedDeal`, `Subscription`, `RentCastApiCall`, `ApiRateLimitEntry`)

**Import / export:**

- `app/app/api/import/portfolio/route.ts`
- `app/lib/import/csv-parser.ts` (partial — types, `normalizePropertyTypeFromCsv`, column aliases)
- `app/lib/import/validate-import-mortgage.ts`
- `app/app/api/export/portfolio/route.ts`

**Validation:**

- `app/lib/validations/deal.ts`
- `app/lib/validations/property.ts` (referenced for units coupling; not line-by-line)

**API contracts & reconciliation surfaces:**

- `app/lib/server/portfolio-summary-payload.ts`
- `app/app/api/portfolio/summary/route.ts`
- `app/app/api/properties/[id]/metrics/route.ts`
- `app/app/api/deals/route.ts` (`serializeDeal`, proportional metrics)
- `app/app/api/account/delete-permanent/route.ts` (Stripe cancel path)
- `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` (`DELETE` transaction)

**Metrics:**

- `app/lib/metrics/portfolio-metrics.ts`
- `app/lib/metrics/property-metrics.ts` (`capRate` / `grossAnnualRent` / `noi` paths)

**Prior audit (continuity):**

- `docs/audits/data-integrity/2026-04-05-data-integrity-audit.md`

**Assumptions / limits:**

- Static code and document review only; no production DB queries or live API calls.
- Amortization primitives (`app/lib/amortization.ts`) and full frontend display copy were not re-audited line-by-line; reliance on existing policy docs and shared metric entry points.
- Client-side import UI behavior was not exercised in a browser.

---

## Risk & impact assessment

| Theme | User / business impact | Likelihood |
| --- | --- | --- |
| Thin DB constraints | Data corruption or ambiguous reads only if app layer bypassed or future code queries by email | Low for current Clerk-centric flows; medium long-term |
| `SavedDeal` inconsistent mortgage fields | Misleading DSCR / cash flow on saved scenarios after partial API edits | Medium for power users using deals API or integrations |
| CSV truncation invisible in file | Incorrect assumptions in external spreadsheets or compliance archives | Medium on high-tier portfolios over property limit |
| Reference doc missing `display mode` | Reconciliation friction and false “bug” reports when comparing CSV to UI | Medium for advanced users |
| `capRate` refactor risk | Wrong cap rate for partial ownership after careless metrics edit | Low until code changes |
| Import loan principal vs balance | Rare bad import; confusing amortization | Low |

---

## Recommendations (prioritized)

1. **Harden persistence layer in a planned migration** — Add `@unique` on `User.email` where product allows; model `RentCastApiCall.propertyId` with `onDelete: SetNull` (or equivalent); constrain `Subscription.status` via enum or CHECK aligned with Stripe handling in `app/lib/plans.ts` / webhooks.

2. **Add deal PATCH cross-field validation** — Extend `updateDealSchema` with `superRefine`: e.g. if `totalMortgageBalance > 0` then require `totalMonthlyPayment > 0`, and optionally cap balance vs payment sanity bounds.

3. **Surface truncation and metric basis in exports** — When `truncated === true`, append a final CSV comment row or dedicated metadata line, and/or add a one-line note to the export download UX; update `docs/reference/portfolio-csv-export.md` to document `display mode`, truncation headers, and that computed metric columns use the user’s ownership display mode at export time.

4. **Document `capRate` invariant in code** — Short comment at `property-metrics.ts` `capRate` line linking to ownership-metrics policy equivalence.

5. **Optional import guard** — Reject or warn when CSV supplies both `originalLoanAmount` and mortgage balance with principal &lt; balance.

---

## Task candidates

- [ ] Prisma migration: `User.email` `@unique`; `RentCastApiCall` FK to `Property` with `onDelete: SetNull`; consider `Subscription.status` enum
- [ ] `app/lib/validations/deal.ts` — `superRefine` on `updateDealSchema` for mortgage balance vs payment consistency
- [ ] `app/app/api/export/portfolio/route.ts` + `docs/reference/portfolio-csv-export.md` — in-file truncation notice; document `display mode` column and header names
- [ ] `app/lib/metrics/property-metrics.ts` — comment at `capRate` re: `noi / estimatedValue` vs scaled NOI in policy
- [ ] `app/lib/import/validate-import-mortgage.ts` — validate `originalLoanAmount >= mortgageBalance` when both provided
- [ ] Normalize `Property.hasMortgage` to non-null boolean where product treats NULL as incomplete (migration + one-time backfill `false` where no mortgages)

---

## Re-test checklist

- [ ] After any schema change: `npm run check` and targeted API tests for affected routes
- [ ] Verify portfolio CSV metrics match `GET /api/properties/[id]/metrics` for the same user display mode (sample property)
- [ ] Verify `GET /api/portfolio/summary` `slice.truncated` aligns with export headers when over limit
- [ ] Verify deal metrics after PATCH with intentionally inconsistent mortgage fields (before/after validation fix)
- [ ] Regression: CSV import with mortgage still sets `hasMortgage`; deleting last mortgage clears flag

---

## Next trigger and cadence

- **Trigger:** After next Prisma migration affecting `Property`, `User`, or `SavedDeal`; after any change to `computePropertyMetrics` / portfolio CSV columns; before shipping new completeness or onboarding signals that read `hasMortgage`.
- **Recommended next run:** 2026-07-07 (quarterly), or sooner if deal validation or export contract changes ship.
