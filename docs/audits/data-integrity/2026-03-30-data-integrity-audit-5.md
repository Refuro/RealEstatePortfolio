# Data Integrity & Reconciliation Audit — 2026-03-30 (Run 5)

## Executive summary

- **Schema and validation:** `Property`, `Mortgage`, and `SavedDeal` in `app/prisma/schema.prisma` are reflected in Zod layers (`app/lib/validations/property.ts`, `deal.ts`, `mortgage.ts`) and in API serialization (`app/lib/serialize/property-api.ts`). Overall model-to-API shape is coherent for primary CRUD paths.
- **Top risk — plan-capped vs full inventory:** `GET /api/portfolio/summary` and `GET /api/export/portfolio` query properties with `orderBy: { updatedAt: "desc" }` and `take: getPropertyLimit(tier)` (`app/app/api/portfolio/summary/route.ts`, `app/app/api/export/portfolio/route.ts`). **`GET /api/properties` lists every property** with no `take`. When `property.count > propertyLimit` (over-capacity accounts, e.g. after downgrade), **portfolio totals and CSV exports omit older properties** while list APIs still return them — integrators and anyone reconciling list length to summary will **disagree**. `computePortfolioMetrics`’s `propertyCount` is the **included** subset, not necessarily `prisma.property.count`.
- **Deals vs properties lens:** Saved-deal APIs embed `computePropertyMetrics(..., "proportional")` only (`app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`). Property metrics and portfolio/export use `user.ownershipDisplayMode ?? "proportional"` where applicable. **Full-liability** users see a **different liability contract** on owned properties than on saved deals.
- **Import/export:** CSV import (`app/lib/import/csv-parser.ts`, `app/app/api/import/portfolio/route.ts`) aligns with the template and core export columns; **multi-mortgage** rows in export cannot be faithfully re-imported (import creates **at most one** `Mortgage` per row). Reference: `docs/reference/portfolio-csv-export.md`.
- **Overall recommendation:** Document or align REST list contracts with portfolio/export; clarify or unify ownership mode for deal metrics; treat multi-lien CSV as **lossy** on re-import unless product adds an import path for additional liens.

## Severity-ranked findings

### Critical

- None identified (no evidence of silent cross-user data bleed or destructive corruption in this pass).

### High

- **Portfolio summary and CSV vs full property list — reconciliation break when over tier cap** — Users or integrations comparing `GET /api/properties` (all rows) to `GET /api/portfolio/summary` or `GET /api/export/portfolio` will see **different universes** when total property count exceeds `getPropertyLimit(getEffectiveTier(user))`. Summary/export intentionally cap to the **most recently updated** N properties (`take` + `orderBy: updatedAt desc`). **`propertyCount`** in `computePortfolioMetrics` reflects only properties in the query, not total DB count — evidence: `app/app/api/portfolio/summary/route.ts` (lines 14–21, 46–48), `app/app/api/export/portfolio/route.ts` (lines 47–53). `app/lib/limit-utils.ts` documents the “first N by `updatedAt`” policy for over-limit display.

- **`GET /api/deals` vs deals UI list — same class of list/summary mismatch for deals** — `GET /api/deals` returns **all** saved deals (`app/app/api/deals/route.ts`, lines 91–96). The deals page uses `take: dealLimit` with `orderBy: { updatedAt: "desc" }` (`app/app/(app)/deals/page.tsx`, lines 15–21). Integrators using only the API see **more** deals than the plan-effective UI list when `totalCount > dealLimit`.

### Medium

- **Saved deals ignore `ownershipDisplayMode` for embedded metrics** — `serializeDeal` passes `"proportional"` to `computePropertyMetrics` in `app/app/api/deals/route.ts` (lines 46–57) and `app/app/api/deals/[id]/route.ts` (lines 46–57). `GET /api/properties/[id]/metrics` uses `(user.ownershipDisplayMode ?? "proportional")` (`app/app/api/properties/[id]/metrics/route.ts`, lines 37–49). Conflicts with `docs/policies/analytics-math-policy.md` §6 (cross-surface reconciliation) unless deals are explicitly a **proportional-only** sandbox — **not** stated in schema or policy docs reviewed here.

- **Multi-mortgage CSV is not round-trippable through import** — Export documents multiple liens (`mortgage stored balances (pipe)`, `monthly payment (all liens sum)`, etc.) per `docs/reference/portfolio-csv-export.md` and `app/app/api/export/portfolio/route.ts` (lines 24–30, 94–110). Import creates **one** `Mortgage` when balance/payment/rate/term conditions hold (`app/app/api/import/portfolio/route.ts`, lines 163–188). Re-importing an exported multi-lien row **drops junior liens** or misattributes totals.

- **Field coverage: CSV import vs Prisma `Property`** — Import does not set `bedrooms`, `bathrooms`, `unitMix`, `squareFeet`, `notes`, `marketRent`, `marketRentAsOf` (see `app/app/api/import/portfolio/route.ts` create payload vs `app/prisma/schema.prisma` `Property`). Expected for a narrow CSV contract; **reconciliation** with manually enriched records requires users to re-enter those fields outside import.

- **`subscriptionTier` vs `subscriptionTierOverride` vs Stripe** — `getEffectiveTier` (`app/lib/plans.ts`, lines 34–44) governs limits in app paths. Raw `User.subscriptionTier` can differ from effective tier when override is set. Any external report that reads `subscriptionTier` only can **mis-state** plan — same theme as prior audits; evidence in `app/lib/plans.ts`, `app/app/api/me/route.ts` (returns counts, not raw tier alone for limits).

### Low

- **Import template vs export column set** — `GET /api/import/portfolio/template` (`app/app/api/import/portfolio/template/route.ts`) lists a **subset** of export headers (no `display mode`, lien metadata block, or derived metric columns). Extra export columns are ignored on re-import by design; users should not expect a symmetric template for full export round-trip.

- **`serializePropertyForApi` spreads Prisma row** — `app/lib/serialize/property-api.ts` uses `{ ...p, ...overrides }`. New Prisma fields may surface in JSON until explicitly mapped — forward-compat payload growth risk.

- **CSV `address line 2`** — `parseRow` can populate `addressLine2` from dedicated columns (`app/lib/import/csv-parser.ts`, lines 172–177, 338); combined-address-only rows still omit line 2 — minor round-trip loss for that path.

## Evidence reviewed

- **Process:** `docs/process/data-integrity-audit-process.md`, `docs/process/audit-report-template.md`.
- **Policies:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`.
- **Architecture:** `docs/architecture-and-build-practices.md` (metrics and CSV reference pointers).
- **Reference:** `docs/reference/portfolio-csv-export.md`.
- **Schema:** `app/prisma/schema.prisma` (`User`, `Property`, `Mortgage`, `SavedDeal`, `Subscription`, `ApiRateLimitEntry`, `RentCastApiCall`, `ContactFormSubmission`).
- **API routes:** `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/properties/[id]/metrics/route.ts`; `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`; `app/app/api/portfolio/summary/route.ts`; `app/app/api/export/portfolio/route.ts`; `app/app/api/import/portfolio/route.ts`, `app/app/api/import/portfolio/template/route.ts`; `app/app/api/me/route.ts`.
- **Validation & import:** `app/lib/validations/property.ts`, `app/lib/validations/deal.ts`, `app/lib/import/csv-parser.ts`, `app/lib/import/rent-resolve.ts` (referenced via `resolveImportRentForCreate`).
- **Metrics:** `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`.
- **Plans / limits:** `app/lib/plans.ts`, `app/lib/limit-utils.ts`.
- **UI (plan capping):** `app/app/(app)/properties/page.tsx`, `app/app/(app)/deals/page.tsx`.

**Limits of this pass:** Static code and docs review only; no production DB sampling, no load tests. Billing webhook paths not re-walked line-by-line (unchanged high-level tier/override risk called out only).

## Risk & impact assessment

- **High:** Affects **downgraded or over-capacity accounts** and **API consumers** who assume list endpoints equal “portfolio” or “export.” Financial dashboards built on summary alone can **understate** exposure. Likelihood grows whenever tier limits shrink while legacy rows remain.
- **Medium (deals lens):** Affects **full_liability** users comparing deal cards to property metrics; stored deal inputs are consistent — **display contract** diverges.
- **Medium (multi-lien import):** Affects users who **export then re-import** for migration; **junior liens lost** or totals wrong.
- **Low:** Template/export asymmetry and serializer spread are **maintainability** and **documentation** risks more than immediate user harm.

## Recommendations (prioritized)

1. **Publish or implement a single contract** for “plan-effective subset” vs “full inventory”: e.g. add `totalPropertyCount` / `includedPropertyCount` (and deal analogs) on `GET /api/portfolio/summary`, or document that `GET /api/properties` is authoritative for row inventory while summary/export are plan-capped — and ensure integrator docs match.
2. **Deals metrics:** Either document saved deals as **proportional-only** in `docs/policies/` and UI copy, or thread `user.ownershipDisplayMode` through `serializeDeal` to match property routes.
3. **Multi-mortgage:** In user-facing import/export docs, state explicitly that **only one lien** is created from CSV; optional backlog item for multi-row or multi-lien import format.
4. **Ops/analytics:** Any reporting on subscription must use **`getEffectiveTier`** semantics (or equivalent SQL), not raw `subscriptionTier` alone, when describing effective limits.

## Task candidates (optional)

- [ ] Add response metadata on portfolio summary/export (or capped list endpoints) so `propertyCount` / row counts cannot be mistaken for total inventory when over cap.
- [ ] Align `GET /api/deals` with plan-effective `take` + metadata, **or** document full-list API as intentional and warn integrators.
- [ ] Product/docs: confirm saved-deals proportional-only behavior and update `ownership-metrics.md` or analytics policy cross-references.
- [ ] Optional: CSV import support for additional mortgages (multiple rows per property or extended columns) — only if product scope allows.

## Re-test checklist

- [ ] Over–property-limit user: compare `prisma.property.count`, `GET /api/properties` length, CSV row count, and `GET /api/portfolio/summary` aggregates — confirm documented behavior.
- [ ] Over–deal-limit user: compare `GET /api/deals` length vs deals page list length vs `getDealLimit`.
- [ ] Full-liability user: compare `GET /api/properties/[id]/metrics` to a saved deal with identical numeric inputs (deal metrics proportional-only).
- [ ] Property with two mortgages: export CSV, re-import to a test account, compare lien count and payment sums.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Prisma schema or validation changes; import/export column changes; plan/limit or `getEffectiveTier` behavior changes; new public API consumers.
- **Recommended next run:** Within one month or before release touching portfolio, deals, CSV, or billing tiers.
