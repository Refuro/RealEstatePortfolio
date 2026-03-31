# Data Integrity & Reconciliation Audit — 2026-03-30 (Run 3)

## Executive summary

- **Plan-limit scoping is inconsistent across surfaces:** server-rendered portfolio views and `GET /api/portfolio/summary` / `GET /api/export/portfolio` apply `takeFirstNByUpdatedAt` after `getPropertyLimit`, while **`GET /api/properties` and `GET /api/deals` return every row** for the authenticated user. Consumers that reconcile “list” vs “portfolio totals” without the same cap will see mismatches for accounts over their plan limit.
- **Ownership lens alignment:** property metrics (`GET /api/properties/[id]/metrics`), portfolio summary, and CSV export use `user.ownershipDisplayMode` (default proportional). **Saved deals** API and deals UI compute `computePropertyMetrics(..., "proportional")` only — intentional for deals, but **not reconcilable** with full-liability property numbers without explicit user education.
- **Import/rent contract** remains aligned with `POST /api/properties` via `resolveImportRentForCreate` (`app/lib/import/rent-resolve.ts`) and shared validation patterns; CSV multi-mortgage export semantics are documented in `docs/reference/portfolio-csv-export.md`.
- **Overall recommendation:** Treat REST list endpoints as “full inventory” and portfolio/export as “plan-effective subset” until aligned; document or fix in a follow-up. No schema-level corruption risks identified in this pass.

## Severity-ranked findings

### Critical

- None identified.

### High

- **REST property/deal lists vs plan-effective portfolio — reconciliation risk** — For users with more properties or deals than their tier allows, **dashboard/properties UI, portfolio summary, and CSV export** include only the first *N* items by `updatedAt` descending (`takeFirstNByUpdatedAt` in `app/lib/limit-utils.ts`), while **`GET /api/properties`** (`app/app/api/properties/route.ts`) and **`GET /api/deals`** (`app/app/api/deals/route.ts`) return **all** rows scoped by `userId` only. Any client summing list payloads as “the portfolio” will **over-count** relative to `GET /api/portfolio/summary` and `GET /api/export/portfolio`. *Evidence:* `app/app/api/properties/route.ts` (lines 21–24), `app/app/api/deals/route.ts` (lines 91–94), `app/app/api/portfolio/summary/route.ts` (lines 16–22), `app/app/api/export/portfolio/route.ts` (lines 48–54), `app/app/(app)/properties/page.tsx` (lines 142–148), `app/app/(app)/dashboard/page.tsx` (lines 33–39).

### Medium

- **Saved deals metrics ignore `ownershipDisplayMode`** — `serializeDeal` in both `app/app/api/deals/route.ts` and `app/app/api/deals/[id]/route.ts` calls `computePropertyMetrics(..., "proportional")` unconditionally. The deals page (`app/app/(app)/deals/page.tsx`) does the same. Property-level metrics (`app/app/api/properties/[id]/metrics/route.ts`) and portfolio/export use `(user.ownershipDisplayMode ?? "proportional")`. Users in **full liability** mode see **different cash flow / DSCR-style interpretations** between saved deals and owned properties unless they mentally switch lens. *Risk:* confusion when comparing a deal to a property; not a storage bug. *Evidence:* deals routes (hardcoded `"proportional"`), `app/app/api/properties/[id]/metrics/route.ts` (lines 36–49).

- **Cross-surface contract discipline** — New `Property` / `SavedDeal` / mortgage fields still require coordinated updates to Zod (`app/lib/validations/property.ts`, `deal.ts`, `mortgage.ts`), `serializePropertyForApi`, CSV import (`app/lib/import/csv-parser.ts`), and export headers (`app/app/api/export/portfolio/route.ts`). *Evidence:* schema `app/prisma/schema.prisma` vs optional fields not present in import rows (e.g. `bedrooms`, `notes`, `marketRent` are API/UI concerns, not CSV import today).

### Low

- **CSV import does not populate `addressLine2`** — `parseRow` sets `addressLine2: ""` in the `ImportRow` result (`app/lib/import/csv-parser.ts`). Exports that combine a single `address` column cannot round-trip a distinct line 2 without separate columns or parser work. *Risk:* minor data loss on re-import for users relying only on combined address cells.

- **`serializePropertyForApi` spreads the full Prisma row** — Returns `{ ...p, ... }` before overrides (`app/lib/serialize/property-api.ts`), so any newly added Prisma fields appear in JSON unless explicitly stripped. *Risk:* low; mostly forward-compatibility and accidental payload growth.

- **PATCH property uses `where: { id }` after prior lookup** — `app/app/api/properties/[id]/route.ts` verifies ownership via `getPropertyForUser` then updates with `where: { id }` (lines 125–127). Correct given the prior check; defense-in-depth would include `userId` in `where`. *Risk:* negligible in normal operation.

## Evidence reviewed

- **Schema:** `app/prisma/schema.prisma` (`User`, `Property`, `Mortgage`, `SavedDeal`, `ApiRateLimitEntry`, `RentCastApiCall`).
- **API routes:** `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/properties/[id]/metrics/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/app/api/properties/[id]/mortgage/route.ts` (partial); `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`; `app/app/api/import/portfolio/route.ts`, `app/app/api/import/portfolio/template/route.ts` (not deep-dived); `app/app/api/export/portfolio/route.ts`; `app/app/api/portfolio/summary/route.ts`.
- **Validation & serialization:** `app/lib/validations/property.ts`, `app/lib/validations/deal.ts`, `app/lib/serialize/property-api.ts`, `app/lib/import/csv-parser.ts`, `app/lib/import/rent-resolve.ts`.
- **Metrics & limits:** `app/lib/metrics/property-metrics.ts`, `app/lib/limit-utils.ts`, `app/lib/property-utils.ts`, `app/lib/benchmark-utils.ts`.
- **Policies:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/reference/portfolio-csv-export.md`.
- **Auth scoping:** `getActiveAppUser` in `app/lib/auth.ts` (soft-deleted users excluded from protected APIs); property/deal lookups use `{ id, userId }` pattern on reads.

**Limits of this pass:** No runtime DB inspection; amortization/mortgage edge cases assumed consistent with `getEffectiveBalance` / `getPayoffProjection` as used in export. Admin-only routes were not exercised.

## Risk & impact assessment

- **High finding exposure:** Affects users **over plan limits** (e.g. after downgrade) and any **API integrator** who assumes `GET /api/properties` matches portfolio rollups. First-party UI already caps lists and shows copy when `overLimit`; the gap is mainly **machine-readable parity** and third-party consistency.
- **Medium (deals vs ownership mode):** Affects comparison workflows for **full_liability** users; data at rest is consistent — the mismatch is **metric lens**, not persistence.
- **Likelihood:** Plan over-limit and API-only workflows are less common than happy-path single-surface use; still material for reconciliation audits and support.

## Recommendations (prioritized)

1. **Align contract documentation or implementation:** Either document that `GET /api/properties` and `GET /api/deals` are “full inventories” and portfolio/export are “plan-effective,” or apply the same `takeFirstNByUpdatedAt` + limit in list endpoints (with explicit metadata such as `totalCount`, `includedCount`) so clients cannot double-count silently.
2. **Deals lens:** If product intent is “always proportional sandbox,” add a short help/tooltip or API field noting that deal metrics ignore `ownershipDisplayMode`; if not, thread `user.ownershipDisplayMode` into deal serialization to match property metrics.
3. **Change management:** Keep single-PR updates for new financial fields across validation, serialization, import column aliases, and export headers.

## Task candidates (optional)

- [ ] Decide and implement API parity for plan limits on `GET /api/properties` and `GET /api/deals` (or publish a non-code contract doc for integrators).
- [ ] Clarify saved-deals vs `ownershipDisplayMode` in product copy or align `computePropertyMetrics` with user display mode for deals.
- [ ] Optional: extend CSV import to read `address line 2` / split address if export format evolves.

## Re-test checklist

- [ ] Verify plan over-limit user: portfolio summary totals match CSV export row sums and match UI-capped property set, and contrast with `GET /api/properties` length if lists stay uncapped.
- [ ] Verify full-liability user: property detail metrics and export columns match; compare to a saved deal with same numbers to confirm expected proportional-only deal behavior.
- [ ] CSV import/export round-trip for representative files after any import/export change.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Schema, import/export, portfolio or deals API contract changes; plan/limit logic changes; pre-release hardening.
- **Recommended next run:** Within one month or before the next major release touching financial fields.
