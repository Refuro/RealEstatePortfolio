# Data Integrity & Reconciliation Audit — 2026-04-05

## Executive summary

- The core metrics engine (`app/lib/metrics/`) is well-structured with pure helpers and correct formula alignment to the ownership-metrics and analytics-math policies. No formula divergence was found across UI API and export surfaces.
- Two denormalization bugs exist around `Property.hasMortgage`: the flag is never set during CSV import and never cleared on mortgage DELETE, leaving completeness-scoring signals stale for a material share of users.
- A silent-failure path in permanent account deletion can leave an active Stripe subscription billing a deleted user indefinitely.
- Schema constraints are thin at the DB layer (no `@unique` on `User.email`, no enum on `Subscription.status`, no FK from `RentCastApiCall.propertyId` to `Property`), relying entirely on the Zod/API layer for enforcement.
- **Recommendation:** Fix the two `hasMortgage` sync gaps and the `delete-permanent` Stripe error path as immediate tasks; add DB-level constraints in the next planned migration window.

---

## Severity-ranked findings

### Critical

- **`hasMortgage` not set on CSV import with mortgage data** — The import route (`app/app/api/import/portfolio/route.ts`, lines 196–221) creates `Mortgage` records inside the transaction but never issues `property.update({ hasMortgage: true })`. Imported properties that have mortgage data will show `hasMortgage = null` even though they have live `Mortgage` rows. Any completeness-scoring UI or onboarding logic that reads `hasMortgage` will report false gaps for imported users, potentially driving incorrect nudges or activation emails. The regular API create path (`app/app/api/properties/route.ts`, lines 188–198) does this correctly; the import path missed the equivalent step.

- **`hasMortgage` not cleared on mortgage DELETE** — The mortgage DELETE handler (`app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts`, lines 174–206) hard-deletes the `Mortgage` row but does not check whether any other mortgages remain for that property, and does not update `Property.hasMortgage`. After deleting the last mortgage, `hasMortgage` stays `true`, causing the property to appear "has mortgage" when it has none. Combined with the import bug above, both the "false positive" and "false negative" directions are broken.

- **`delete-permanent` swallows Stripe subscription cancellation errors** — `app/app/api/account/delete-permanent/route.ts` (lines 70–75) catches a Stripe cancel failure with only `console.error` and proceeds to delete the `User` row and Clerk identity. By contrast, the soft-delete path (`app/app/api/account/delete/route.ts`, lines 71–85) returns HTTP 503 on the same failure. The permanent-delete path leaves an active Stripe subscription with no associated user, causing continued billing with no recovery path for the customer.

---

### High

- **`User.email` has no `@unique` constraint at DB level** — `app/prisma/schema.prisma` line 20 declares `email String` without `@unique`. Only `clerkUserId @unique` constrains the row. While Clerk enforces uniqueness externally, a direct DB write, seed script bug, or future migration could insert duplicate emails. Any email-based lookup (e.g. `findUnique({ where: { email } })`) would silently return only one row. The `getAppUser` helper in `app/lib/auth.ts` uses `findUnique({ where: { clerkUserId } })` exclusively, so this is not currently exploited — but it is a latent risk.

- **`RentCastApiCall.propertyId` is a dangling soft-FK with no Prisma relation** — `app/prisma/schema.prisma` lines 136–145. The `propertyId String?` field is never declared in a `@relation`, so Prisma does not enforce referential integrity and does not cascade on property deletion. When a user deletes a property (which cascades from `User → Property → Mortgage`), any `RentCastApiCall` rows with that `propertyId` are orphaned. The quota-counting query at `app/app/api/rentcast-quota/route.ts` uses `[userId, createdAt]` only and is not affected, but any future per-property quota analysis would produce phantom results.

- **`Subscription.status` is an unvalidated free-text column** — `app/prisma/schema.prisma` line 169 declares `status String` with no Prisma enum and no DB CHECK constraint. The billing webhook (`app/app/api/billing/webhook/route.ts`, line 124) writes `sub.status ?? "active"` directly, meaning any Stripe status string (including future ones Stripe may introduce) is stored without validation. The plan-gate logic in `app/lib/plans.ts` presumably checks `status === "active"`, so an unexpected Stripe status string could silently fail to grant or revoke access.

- **`Property.hasMortgage` has no DB-level migration backfill for pre-existing data** — The `20260406120000_completeness_overhaul` migration (`app/prisma/migrations/20260406120000_completeness_overhaul/migration.sql`) backfills `hasMortgage = true` for properties with mortgage rows. However, the backfill does not also set `hasMortgage = false` for properties with no mortgage rows (those remain `NULL`). If completeness-scoring logic treats `NULL` as "unknown/incomplete" and `false` as "confirmed no mortgage", properties created before this migration and without a mortgage will have `hasMortgage = NULL` rather than `false`. Whether the UI distinguishes `NULL` vs `false` determines whether this is a display issue or a scoring gap.

---

### Medium

- **`Property.units` / `propertyType` coupling enforced only at Zod layer** — The rule "single-unit types must have `units = 1`" is enforced in `app/lib/validations/property.ts` (`unitsRefine`, line 109) and in `app/lib/import/csv-parser.ts` (line 273), but there is no DB-level `CHECK` constraint. Data written via direct DB access, migrations, or future bulk-update scripts could violate this invariant, causing `getPropertyTotalRent` to distribute rent incorrectly across phantom units.

- **`capRate` in `property-metrics.ts` uses pre-scale `noi` divided by full `estimatedValue`** — `app/lib/metrics/property-metrics.ts` line 97: `const capRate = estimatedValue > 0 ? noi / estimatedValue : null` where `noi` is the pre-ownership-scale value `(effectiveRent - expenses) * 12`. This is mathematically equivalent to `NOI_scaled / (V * s)` from the ownership-metrics policy (the `s` terms cancel), but the code is non-obvious and lacks a comment explaining the equivalence. A future refactor that changes the `noi` variable to the scaled version (as already returned in `noi: noi * scale`) without also correcting the `capRate` line would silently break cap rate for partial-ownership properties.

- **Export CSV truncates to `propertyLimit` with no inline CSV warning row** — `app/app/api/export/portfolio/route.ts` lines 54–57 apply `take: propertyLimit` before building rows. Truncation is indicated via the `X-Veld-Property-Slice-Truncated: true` response header, but the CSV itself contains no header row or trailing comment noting the omission. A user who opens the file in Excel or imports it into another tool will not see the warning. The same truncation logic is used in the portfolio summary API and in the UI, so the metric values are internally consistent — but the raw-data CSV export's silent truncation is a data-fidelity gap for users expecting a complete export.

- **`SavedDeal` stores flat mortgage scalars with no cross-model reconciliation** — `app/prisma/schema.prisma` lines 42–73. `SavedDeal.totalMortgageBalance` and `totalMonthlyPayment` are stored Decimal fields (defaulting to 0). Unlike `Property → Mortgage[]`, there is no child model and no constraint linking these to any real loan. The PATCH handler (`app/app/api/deals/[id]/route.ts`, lines 183–184) updates them independently. If only one of the two is updated in a PATCH call (e.g. balance changes but payment does not), DSCR and cash flow metrics will be silently computed on a mismatched pair. No server-side cross-field validation enforces `totalMonthlyPayment > 0 when totalMortgageBalance > 0`.

- **Seed data contains expired `currentPeriodEnd` subscription dates** — `app/prisma/seed.ts` lines 172 and 329 set `currentPeriodEnd: new Date("2025-04-01")` and `new Date("2025-06-01")` respectively. These are approximately one year in the past as of audit date (2026-04-05). Any code path that checks `currentPeriodEnd > now` for access or UI state will show these dev accounts as expired, potentially masking bugs in subscription-expiry flows during local development and testing.

---

### Low

- **`User.ownershipDisplayMode` is an unvalidated string at DB level** — `app/prisma/schema.prisma` line 26: `ownershipDisplayMode String?`. The PATCH `/api/me` validates with `z.enum(["proportional", "full_liability"])`. At runtime, `computePortfolioMetrics` and `computePropertyMetrics` check `displayMode === "full_liability"` and default to proportional for anything else, so an unexpected value would silently fall back to proportional rather than erroring. No user-facing data corruption, but an invalid stored value would produce a silent incorrect display mode.

- **Import route does not validate `originalLoanAmount ≥ currentBalance`** — `app/lib/import/validate-import-mortgage.ts` (line 34) falls back: `const originalLoan = r.originalLoanAmount ?? r.mortgageBalance`. It does not separately validate that `originalLoanAmount ≥ mortgageBalance` when both are provided. The `validateMortgagePiCoversInterestFields` function does not catch this; it only checks P&I vs interest. The regular mortgage create API schema does not enforce this either (it enforces only the P&I floor). A CSV row with `originalLoanAmount < mortgageBalance` would be imported silently, yielding a loan that appears to have balance exceeding the original principal.

- **`Property.vacancyPercent` and `ownershipPercent` have no DB-level range constraints** — Zod enforces `vacancyPercent: int(0..100)` and `ownershipPercent: int(1..100)`. No PostgreSQL `CHECK` constraint exists. A direct DB write with `vacancyPercent = 150` would produce an effective rent of `monthlyRent * (1 - 1.5) = -0.5 * monthlyRent` (negative effective rent), which would flow into NOI and all derived metrics without error.

- **`Mortgage.termYears` maximum is 50 (Zod), not enforced at DB level** — `app/lib/validations/mortgage.ts` line 51. No `@db` constraint. A term beyond 50 years would pass DB write but could produce unexpected amortization projections.

- **`serializePropertyForApi` spreads full Prisma row via `...p`** — `app/lib/serialize/property-api.ts` line 53. The spread includes all columns on the Prisma object including `hasMortgage`, `createdAt`, `updatedAt`, and any future schema additions. New columns added to `Property` will be automatically included in the API response without an explicit decision to expose them. This is a latent data-exposure risk that will grow as the schema evolves.

---

## Evidence reviewed

**Schema and migrations:**
- `app/prisma/schema.prisma` — full review of all models, constraints, relations, and cascade rules
- `app/prisma/migrations/20260406120000_completeness_overhaul/migration.sql` — `hasMortgage` backfill
- `app/prisma/migrations/20260315043742_add_saved_deal.sql` — SavedDeal model
- `app/prisma/seed.ts` — seed data validation

**API mutation validation:**
- `app/app/api/properties/route.ts` (POST)
- `app/app/api/properties/[id]/route.ts` (PATCH, DELETE)
- `app/app/api/properties/[id]/mortgage/route.ts` (POST)
- `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` (PATCH, DELETE)
- `app/app/api/deals/route.ts` (GET, POST)
- `app/app/api/deals/[id]/route.ts` (GET, PATCH, DELETE)
- `app/app/api/me/route.ts` (PATCH — ownershipDisplayMode)
- `app/app/api/account/delete/route.ts`
- `app/app/api/account/delete-permanent/route.ts`
- `app/app/api/account/restore/route.ts`
- `app/app/api/billing/webhook/route.ts`

**Validation schemas:**
- `app/lib/validations/property.ts`
- `app/lib/validations/mortgage.ts`
- `app/lib/validations/deal.ts`
- `app/lib/validations/account.ts`

**Import / export fidelity:**
- `app/app/api/import/portfolio/route.ts`
- `app/lib/import/csv-parser.ts`
- `app/lib/import/validate-import-mortgage.ts`
- `app/app/api/export/portfolio/route.ts`
- `app/app/api/export/portfolio-summary/route.ts`

**Metrics and computation:**
- `app/lib/metrics/property-metrics.ts`
- `app/lib/metrics/portfolio-metrics.ts`
- `app/lib/server/portfolio-summary-payload.ts`
- `app/app/api/properties/[id]/metrics/route.ts`
- `app/app/api/portfolio/summary/route.ts`
- `app/lib/property-utils.ts` (`getPropertyTotalRent`)
- `app/lib/serialize/property-api.ts`

**Policy documents:**
- `docs/policies/analytics-math-policy.md`
- `docs/policies/ownership-metrics.md`

**Assumptions / limits of this pass:**
- Amortization library (`app/lib/amortization.ts`) was not inspected; the payoff projection and effective-balance logic were treated as correct based on the surrounding callers.
- Frontend component code was not reviewed; this audit covers server-side data paths only.
- No live DB query was run; findings are based on static code and schema analysis.

---

## Risk & impact assessment

| Finding | User impact | Likelihood of hitting it |
|---|---|---|
| `hasMortgage` not set on import | Users who import via CSV may see incorrect completeness nudges or missing onboarding signals | High — CSV import is a primary onboarding path |
| `hasMortgage` not cleared on DELETE | Users who remove a mortgage see the property treated as mortgaged in completeness scoring | Medium — affects any user who corrects a mistaken mortgage entry |
| `delete-permanent` Stripe silent fail | Active subscription continues billing a deleted user; no recovery without manual Stripe admin action | Low occurrence, very high financial and trust impact |
| `User.email` no unique constraint | Latent; requires direct DB write to exploit | Low — mitigated by Clerk uniqueness enforcement |
| `RentCastApiCall` orphaned propertyId | Phantom data accumulates; quota counting by property would be inaccurate | Low for current quota logic; grows over time |
| `Subscription.status` free-text | Plan gating could silently pass/fail on unrecognized Stripe status strings | Low — Stripe status strings are stable |
| `capRate` formula fragility | Silent breakage on future `noi` variable refactor | Low risk now; Medium risk on any metrics edit |
| Export truncation not inline | Users may not notice that CSV is incomplete | Medium — user experience / data trust issue |
| Seed subscription expiry | Dev-only; does not affect production data | Low (dev only) |

---

## Recommendations (prioritized)

1. **Fix `hasMortgage` sync in import and DELETE** — In `app/app/api/import/portfolio/route.ts`, add `tx.property.update({ where: { id: prop.id }, data: { hasMortgage: true } })` after mortgage creation. In `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` DELETE handler, after deleting the mortgage, count remaining mortgages for the property and update `hasMortgage` accordingly (`true` if any remain, `false` if none).

2. **Add error guard to `delete-permanent` Stripe cancellation** — Mirror the pattern in `delete/route.ts`: return HTTP 503 if Stripe subscription cancel throws, rather than proceeding with user deletion. Accept the behavior tradeoff (user cannot complete permanent deletion while Stripe is unreachable) as the safer path; document in a code comment.

3. **Add DB-level constraints in the next migration window** — At minimum: `@unique` on `User.email`; a Prisma `enum` or DB `CHECK` on `Subscription.status`; and a `@relation` with `onDelete: SetNull` on `RentCastApiCall.propertyId` to enforce FK integrity on property deletion.

4. **Add a comment in `property-metrics.ts` explaining the cap-rate formula** — Document why `capRate = noi / estimatedValue` (pre-scale) is equivalent to the ownership-metrics policy formula `NOI_scaled / (V * s)`, to prevent a future refactor from breaking this silently.

5. **Add a truncation notice row to the portfolio CSV export** — Append a comment or metadata row at the end of the CSV when `truncated = true`, so users who open the file in a spreadsheet application see the limitation without needing to inspect response headers.

6. **Update seed data subscription `currentPeriodEnd` values** — Set to a future date (e.g. one year from seed run) so dev/test accounts have realistic active subscription state.

---

## Task candidates

- [ ] `import/portfolio/route.ts` — After mortgage creation in import transaction, set `property.hasMortgage = true` via `tx.property.update`
- [ ] `mortgage/[mortgageId]/route.ts` DELETE — After deleting mortgage, query remaining mortgage count for the property and update `Property.hasMortgage` to `true` (any remain) or `false` (none remain)
- [ ] `account/delete-permanent/route.ts` — Return HTTP 503 on Stripe subscription cancel failure instead of swallowing the error; mirror the pattern in `delete/route.ts`
- [ ] Schema migration — Add `@unique` to `User.email`; add `onDelete: SetNull` relation on `RentCastApiCall.propertyId`; consider `Subscription.status` enum
- [ ] `20260406` migration — Add backfill step to set `hasMortgage = false` for properties with no mortgage rows (currently backfills only `true`)
- [ ] `property-metrics.ts` — Add inline comment at `capRate` line explaining formula equivalence to ownership-metrics policy formula
- [ ] `export/portfolio/route.ts` — Append a CSV comment/metadata row when `truncated = true` so downstream consumers see the truncation warning
- [ ] `deal.ts` validation — Add cross-field Zod check: if `totalMortgageBalance > 0`, then `totalMonthlyPayment > 0` (and vice versa)
- [ ] `seed.ts` — Update `currentPeriodEnd` to a future date relative to seed execution time
- [ ] `import/validate-import-mortgage.ts` — Add validation: `originalLoanAmount >= mortgageBalance` when both are provided in the CSV row

---

## Re-test checklist

- [ ] Verify `hasMortgage = true` is set on a property created via CSV import that includes mortgage columns
- [ ] Verify `hasMortgage = false` (not `null`, not `true`) on a property after its last mortgage is deleted
- [ ] Verify `DELETE /api/account/delete-permanent` returns 503 when Stripe is unavailable, and no `User` row is deleted
- [ ] Verify `User.email` rejects duplicate insertion after schema migration
- [ ] Verify `RentCastApiCall` rows with a deleted property's `propertyId` are handled (set null or cascade) after FK migration
- [ ] Verify `npm run check` passes after any code changes

---

## Next trigger and cadence

- **Trigger:** Before next onboarding activation rollout or completeness-scoring feature ship, and after any schema migration that adds new nullable flags.
- **Recommended next run:** 2026-07-05 (quarterly), or sooner if `hasMortgage` fix task is shipped (re-audit completeness-scoring surface at that point).
