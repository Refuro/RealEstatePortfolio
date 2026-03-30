# Feature / UX / IA Audit — 2026-03-20

## Executive summary

- **Overall:** Core journeys (dashboard, properties, property detail tabs, Modeling/Mortgage workspaces, Analyze + Deals, Plans) are wired with consistent app chrome, progressive empty states, and clear primary CTAs. Information hierarchy generally matches `docs/policies/design-spec.md` (numbers-first, section labels).
- **Top risks:** (1) **Copy/IA mismatch** on property Overview vs what the Details tab actually allows. (2) **Semantic mismatch** between portfolio views (user ownership display mode) and the Analyze workspace (always proportional)—disclosed in-app but easy to miss when comparing numbers. (3) **Two pricing surfaces** (`/pricing` vs `/plans`) plus marketing nav for signed-in users can dilute “where do I manage billing?”
- **Recommendation:** Fix the misleading Overview copy first (low effort, high trust). Then align deep-link behavior for Modeling with Mortgage (URL sync), and clarify pricing entry points for authenticated users.

## Severity-ranked findings

### Critical

- *(none — no evidence of broken primary navigation, missing auth gates on audited routes, or silent data-loss patterns in reviewed flows.)*

### High

- **Property Overview mis-describes the Details tab as a “read-only ledger.”** — Risks confusion and eroded trust when users discover inline mortgage add/edit on Details (`MortgageSection`). — `app/(app)/properties/[id]/overview-tab-content.tsx` (Overview intro copy) vs `app/(app)/properties/[id]/details-tab-content.tsx` (includes interactive `MortgageSection` at `#mortgages`) and `app/(app)/properties/mortgage-section.tsx` (add/edit mortgages inline).

- **Portfolio metrics vs Deal Analyzer use different ownership semantics by design; easy to compare apples to oranges.** — Users with **full liability** display mode see portfolio/property metrics that do not match Analyze outputs (Analyze states it uses proportional semantics only). — `app/(app)/analyze/deal-analyzer-form.tsx` (helper copy under Ownership %) vs `lib/metrics/*` consumed on `app/(app)/dashboard/page.tsx` and property detail via `user.ownershipDisplayMode`.

### Medium

- **Modeling workspace does not sync `propertyId` in the URL when the user changes the property dropdown.** — Breaks parity with Mortgage workspace (which updates query via `syncMortgageWorkspaceQuery`), so bookmarks/shares/back-button behavior are weaker for Modeling. — `app/(app)/modeling/modeling-workspace.tsx` (local `useState` only) vs `app/(app)/mortgage/mortgage-workspace.tsx` (`syncMortgageWorkspaceQuery` + `history.replaceState`).

- **Dual pricing routes and marketing nav for signed-in users.** — Authenticated users can still land on marketing `/pricing` (`components/landing-nav.tsx`) while in-app billing context lives at `/plans` (`app/(app)/plans/page.tsx`). Increases “which page is canonical?” friction. — `components/landing-nav.tsx`, `app/(app)/app-nav.tsx`, `app/pricing/page.tsx`, `app/(app)/plans/page.tsx`.

- **Dashboard presents a large metric grid before charts.** — Two dense rows of `MetricCard`s may exceed “secondary metrics stay visually secondary” for some users (still consistent with “numbers first” philosophy but high scan cost on first visit). — `app/(app)/dashboard/page.tsx` (metric grids + `DashboardCharts`).

- **“Add mortgage” paths split between property Details anchor and Mortgage workspace.** — Overview links to `/mortgage?propertyId=…` for empty mortgage (`app/(app)/properties/[id]/overview-tab-content.tsx`); Mortgage workspace empty state pushes to `?tab=details#mortgages` (`mortgage-workspace.tsx`). Both valid but the hop count differs by entry point—minor flow inconsistency.

### Low

- **Stale implementation comment vs actual UI.** — Comment references a “Jump to dropdown” that is not present; mobile uses horizontal scroll only. — `app/(app)/properties/[id]/property-detail-tabs.tsx` (comment block under tab nav).

- **Onboarding is a single welcome modal; no in-app checklist after dismiss.** — Users who dismiss may lack a structured “first value” path beyond nav and dashboard empty state. — `app/(app)/onboarding-panel.tsx`, `app/(app)/dashboard/page.tsx` (empty state CTAs).

- **Footer copyright year may lag calendar year.** — Minor polish. — `components/footer.tsx`.

## Evidence reviewed

- Process: `docs/process/feature-ux-audit-process.md`, template: `docs/process/audit-report-template.md`, design alignment: `docs/policies/design-spec.md` (skim).
- **Dashboard:** `app/(app)/dashboard/page.tsx`, `app/(app)/dashboard/dashboard-charts.tsx`, `app/(app)/dashboard/metric-help-link.tsx`, `app/(app)/dashboard/rent-vs-market-section.tsx`.
- **Properties list & detail:** `app/(app)/properties/page.tsx`, `app/(app)/properties/[id]/page.tsx`, `app/(app)/properties/[id]/property-detail-tabs.tsx`, `app/(app)/properties/[id]/overview-tab-content.tsx`, `app/(app)/properties/[id]/details-tab-content.tsx`, `app/(app)/properties/[id]/quick-actions.tsx`, `app/(app)/properties/property-actions.tsx`, `app/(app)/properties/mortgage-section.tsx`.
- **Modeling & Mortgage:** `app/(app)/modeling/page.tsx`, `app/(app)/modeling/modeling-workspace.tsx`, `app/(app)/mortgage/page.tsx`, `app/(app)/mortgage/mortgage-workspace.tsx`.
- **Analyze & Deals:** `app/(app)/analyze/page.tsx`, `app/(app)/analyze/deal-analyzer-form.tsx`, `app/(app)/deals/page.tsx`, `app/(app)/deals/deals-list.tsx`.
- **Plans / pricing:** `app/(app)/plans/page.tsx`, `app/pricing/page.tsx`, `components/pricing-cards.tsx`.
- **Onboarding / first value:** `app/(app)/onboarding-panel.tsx`, `app/(app)/app-layout-client.tsx`, `app/app/page.tsx` (marketing first-run path), `app/(app)/properties/new/page.tsx` (deal → property bridge).
- **App shell / IA:** `app/(app)/app-nav.tsx`, `app/(app)/app-layout-client.tsx`, `components/landing-nav.tsx`, `components/footer.tsx`.

**Limits:** No device lab or screen-reader pass; no production analytics. Assessment is static code and copy review.

## Risk & impact assessment

Misleading IA copy on a high-traffic screen (property Overview) increases support questions and reduces confidence in other instructional text. Ownership-semantics divergence between Analyze and portfolio views can cause bad purchase decisions if users assume parity. Pricing route duplication is mostly wayfinding friction, not billing correctness. Unresolved items mostly raise cognitive load rather than immediate revenue risk.

## Recommendations (prioritized)

1. **Rewrite Overview tab intro** to state that **Details** is a full data snapshot with **read-only property/financial facts**, while **mortgage rows can be added/updated inline** (or link Mortgage workspace as the dedicated place for payoff tooling)—aligned with `details-tab-content.tsx` + `mortgage-section.tsx`.
2. **Surface a one-line Compare-mode banner** on Analyze when the user’s portfolio display mode is not proportional (link to Settings or explain that Analyze uses proportional math only)—reduces silent mismatch between `deal-analyzer-form.tsx` and dashboard/property metrics.
3. **Unify pricing wayfinding for signed-in users:** e.g. add “Plans & billing” to marketing nav when `userId` is set, or make `/pricing` redirect to `/plans` post-auth with a query flag—so `PricingCards` and Stripe checkout context stay single-purpose.
4. **Align Modeling URL behavior** with Mortgage: update `propertyId` query when the selector changes (same pattern as `mortgage-workspace.tsx`) for consistent deep links and back/forward.

## Task candidates

- [ ] Update Overview copy in `overview-tab-content.tsx` to remove “read-only ledger of everything” and accurately describe Details + mortgage editing.
- [ ] Add conditional helper/banner on Analyze when `ownershipDisplayMode === "full_liability"` (data from `getAppUser` / client prop) referencing proportional-only analysis.
- [ ] Implement `propertyId` query sync in `modeling-workspace.tsx` (mirror `syncMortgageWorkspaceQuery` in `mortgage-workspace.tsx`).
- [ ] Adjust `landing-nav.tsx` (or `/pricing` behavior) so authenticated users have a direct path to `/plans` / billing context without losing marketing FAQs.

## Re-test checklist

- [ ] Property Overview → Details: copy matches ability to add/edit mortgages inline.
- [ ] Analyze page: full-liability users see clear semantics notice; numbers still compute.
- [ ] Modeling: change property in dropdown updates URL and reload/deep-link behaves like Mortgage.
- [ ] Signed-in user: pricing/plans navigation feels coherent (no dead-end confusion).
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After IA changes to property detail, Modeling URL behavior, or pricing nav; otherwise monthly while product surface area is growing.
- **Recommended next run:** 2026-04-20 (or next release candidate if sooner).
