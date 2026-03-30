# Feature / UX / IA Audit — 2026-03-28

## Executive summary

- Core journeys (onboarding modal, properties list/detail, dashboard, modeling, mortgage, analyze, deals, plans) are generally coherent: navigation is predictable, empty states point to primary CTAs, and recent **rented / not rented** behavior is explained in add/edit flows and aligned with benchmark hiding on list and detail surfaces.
- The main gap is **inconsistent rent-vs-market treatment on the single-property dashboard**: the “Property at a glance” block can show a **refresh benchmark** affordance when the property is **not rented**, which conflicts with `getBenchmarkEligibility` semantics and with copy elsewhere (“benchmark hidden”).
- Secondary gaps: **properties list** has no filter for vacant/not-rented assets; **dashboard rent section** may auto-trigger benchmark refreshes on load; **welcome modal** styling diverges from the design spec’s “minimal chrome” direction.
- **Recommendation:** Fix single-property dashboard benchmark branching first (align with property detail and multi-property rent section), then improve IA for vacant portfolios and review auto-refresh behavior for user control.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- **Single-property dashboard shows “Refresh estimate” for vacant (not rented) properties** — Misleading CTA and inconsistent with `not_rented` eligibility (benchmark should not be framed as refreshable). Property detail only shows refresh when eligibility is `benchmark_missing` or `benchmark_stale` (`property-detail-tabs.tsx`), but the dashboard passes `{ propertyId }` for any non-`eligible_fresh` state, including `not_rented` (`dashboard/page.tsx` benchmark block; `dashboard-charts.tsx` renders `BenchmarkRefreshButton` when `benchmark?.propertyId` is set).

### Medium

- **No list-level filter for “vacant / not rented”** — Users with larger portfolios can filter by cash flow, benchmark staleness, etc., but cannot isolate non-rented assets (`properties/page.tsx` `FILTER_OPTIONS`), which weakens IA for the rent/vacant workflow promoted elsewhere.
- **Dashboard “Rent vs. market” section may auto-refresh benchmarks on mount** — `RentVsMarketSection` queues refresh calls for missing/stale benchmarks without an explicit user action (`rent-vs-market-section.tsx` `useEffect`), which can surprise users and add load; contrast with explicit refresh buttons on property surfaces.
- **Welcome onboarding modal conflicts with design spec tone** — Decorative blurs and `shadow-2xl` on the welcome dialog (`onboarding-panel.tsx`) sit at odds with `docs/policies/design-spec.md` §1 (“Clarity over decoration,” minimal chrome).
- **Single-property “Property at a glance” does not surface explicit vacant copy for “Rent vs. market”** — For `not_rented`, the grid can show refresh (see High) or “—” (`dashboard-charts.tsx`), whereas multi-property rent list uses clear “Not currently rented - benchmark hidden” (`rent-vs-market-section.tsx`).

### Low

- **Default `isRented: true` in validation** — Create/update paths default to rented (`lib/validations/property.ts`), so users adding a vacant asset must notice and toggle; copy in forms mitigates but does not remove scanning cost.
- **Nav wording: “Analyze deal” vs “Deals”** — Related labels may cause momentary confusion for new users (`app-nav.tsx`); both are valid but adjacent.
- **Plans vs public Pricing** — In-app `/plans` (“Plans & billing”) vs marketing `/pricing` serve different contexts; generally clear, but cross-links could be tested for users who land on one and expect the other.

## Evidence reviewed

- **Process / template:** `docs/process/feature-ux-audit-process.md`, `docs/process/audit-report-template.md`
- **Policy:** `docs/policies/design-spec.md` (§1, typography/color scan)
- **App shell / onboarding:** `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/api/onboarding/route.ts`
- **Dashboard:** `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/dashboard/rent-vs-market-section.tsx`
- **Properties:** `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/property-form.tsx`, `app/app/(app)/properties/add-property-wizard.tsx`, `app/app/(app)/properties/benchmark-display.tsx`, `app/app/(app)/properties/[id]/property-detail-tabs.tsx`, `app/app/(app)/properties/[id]/overview-tab-content.tsx`, `app/app/(app)/properties/[id]/property-health-strip.tsx`, `app/app/(app)/properties/[id]/details-tab-content.tsx`
- **Benchmark logic:** `app/lib/benchmark-utils.ts`
- **Modeling / mortgage:** `app/app/(app)/modeling/page.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`
- **Analyze / deals:** `app/app/(app)/analyze/page.tsx`, `app/app/(app)/deals/page.tsx`
- **Plans / pricing:** `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx`
- **Assumptions / limits:** Static code review only; no production session, device matrix, or accessibility tooling run. Findings focused on flows and copy evidenced in source.

## Risk & impact assessment

- **Unresolved High finding:** Users with one vacant property may believe they must “refresh” a benchmark that is intentionally suppressed, reducing trust in rent-vs-market and cluttering support.
- **Medium IA / automation:** Missing vacant filter slows power users; auto-refresh may cause unnecessary API use or perceived loss of control.
- **Likelihood:** Vacant single-property portfolios are common (turnover, rehab); dashboard bug affects that segment directly.

## Recommendations (prioritized)

1. **Align single-property dashboard benchmark UI with `getBenchmarkEligibility`** — For `not_rented`, show the same explanatory pattern as `RentVsMarketSection` / list (e.g. “Not currently rented - benchmark hidden”) and do not pass `propertyId` for refresh unless eligibility is `benchmark_missing` or `benchmark_stale` (mirror `property-detail-tabs.tsx` logic).
2. **Add a properties list filter (or tag) for not-rented** — Improves scanability for portfolios mixing occupied and vacant units.
3. **Revisit auto-refresh in `RentVsMarketSection`** — Prefer explicit “Refresh all” or per-row actions, or clear disclosure that estimates will refresh on load.
4. **Tighten welcome modal visual treatment** — Reduce decorative gradients/shadow to match design spec without removing the modal’s clarity.
5. **Consider optional “vacant” hint on dashboard income metrics** — When `isRented` is false, a short sublabel on annual rent or cash flow could reinforce $0 income semantics (avoid contradicting benchmark messaging).

## Task candidates

- [ ] Fix single-property dashboard `benchmark` prop so `not_rented` / `rent_missing` never surface `BenchmarkRefreshButton` inappropriately; match property-detail eligibility rules.
- [ ] Add Properties filter: “Not rented” / “Vacant” (copy aligned with existing “Currently rented” strings).
- [ ] Replace or gate automatic benchmark refresh in `RentVsMarketSection` with user-initiated refresh or visible consent copy.
- [ ] Simplify `OnboardingPanel` styling per design spec (reduce blur blobs / heavy shadow).
- [ ] UX copy pass: single-property “Property at a glance” rent row for vacant state (explicit hidden benchmark message).
- [ ] Optional: nav label tweak or tooltip for “Analyze deal” vs “Deals” (IA test or micro-copy).
- [ ] Optional: cross-link “Pricing” from Plans footer or vice versa for users who confuse `/plans` and `/pricing`.

## Re-test checklist

- [ ] Verify fix for single-property dashboard rent vs market when `isRented === false` (no refresh CTA; correct copy).
- [ ] Verify no regression for `benchmark_missing` / `benchmark_stale` on single-property dashboard.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After major property/income field changes, or quarterly.
- **Recommended next run:** 2026-06-28 (or next release touching benchmark or property forms).
