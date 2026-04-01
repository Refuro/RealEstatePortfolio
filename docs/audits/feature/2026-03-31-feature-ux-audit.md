# Feature / UX / IA Audit — 2026-03-31

## Executive summary

- **Overall:** Core information architecture is coherent: the signed-in shell (`app/app/(app)/layout.tsx`, `app-layout-client.tsx`, `app-nav.tsx`) exposes Dashboard, Properties, Modeling, Mortgage, Calculators, Analyze, Deals, Plans, and Settings with desktop sidebar and mobile drawer patterns that align with `docs/policies/design-spec.md` (breakpoint `md`, touch targets, `MobileCollapsible` usage on dashboard).
- **Top risks:** Secondary-but-valuable actions are unevenly discoverable (portfolio export appears on desktop dashboard workspace strip only, not in mobile workspace nav or primary nav). The Analyze flow is long; the page hero does not orient users to “saved deals” until they reach the lower “Deal actions” card.
- **Spec alignment:** List-style pages use `text-2xl` page titles as specified; property detail relies on an in-card `h2` identity strip (`property-hero.tsx`) without a matching top-level page title, which weakens hierarchy and scan consistency versus Dashboard/Properties/Deals.
- **Recommendation:** Treat this as a healthy baseline with targeted fixes for cross-surface parity (export, headings) and above-the-fold orientation on Analyze; re-run after any major nav or workspace change.

## Severity-ranked findings

### Critical

- No critical findings in this pass (no evidence of broken primary auth paths, data-loss flows without confirmation, or wholly blocked core journeys).

### High

- No high-severity findings in this pass. Plan limits and upgrade paths are surfaced on Properties (`properties/page.tsx`), Deals (`deals/page.tsx`), and Analyze deal actions (`deal-analyzer-form.tsx`); past-due and over-limit banners are wired in `app-layout-client.tsx`.

### Medium

- **Portfolio summary export — desktop-only entry point in the dashboard workspace strip** — Users on mobile see `WorkspaceNavMobile` (property / modeling / mortgage only) in `dashboard/page.tsx` + `dashboard/workspace-nav-mobile.tsx`, while “Print portfolio summary” (`/export/portfolio-summary`) appears only in the desktop flex strip in `dashboard/page.tsx`. Risk: mobile users may never discover export without searching Settings or elsewhere. Evidence: `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/workspace-nav-mobile.tsx`.
- **Analyze deal — weak top-of-page orientation to the Deals list** — The route intro (`analyze/page.tsx`) describes entering assumptions and saving, but there is no primary link to `/deals` in the header; “Open saved deals” appears in the lower “Deal actions” region of `deal-analyzer-form.tsx`. Risk: first-time users may not connect Analyze with the Deals list until they scroll. Evidence: `app/app/(app)/analyze/page.tsx`, `app/app/(app)/analyze/deal-analyzer-form.tsx` (~lines 1140–1187).
- **Sidebar nav density and ordering** — Nine primary items (plus optional Admin) in `app-nav.tsx` may increase cognitive load for newer investors; Analyze appears before Deals, which can invert the mental model (“save then compare”) for some users. Evidence: `app/app/(app)/app-nav.tsx`.

### Low

- **Property detail — page title pattern vs design spec** — `docs/policies/design-spec.md` calls for a page-level `text-2xl font-semibold` title on major surfaces; `properties/[id]/page.tsx` uses a back link and tabs while identity is an `h2` inside `property-hero.tsx`. Risk: minor inconsistency in heading hierarchy and screen-reader/document outline compared to list pages. Evidence: `app/app/(app)/properties/[id]/page.tsx`, `app/app/(app)/properties/[id]/property-hero.tsx`.
- **Calculators hub — possible redundant horizontal padding** — `calculators/page.tsx` wraps content in `px-4 py-8 md:px-6` inside `main` that already applies `p-4` / `md:p-6` in `app-layout-client.tsx`, which may tighten content width or double-pad relative to sibling routes. Evidence: `app/app/(app)/calculators/page.tsx`, `app/app/(app)/app-layout-client.tsx`.
- **Plans vs public Pricing — dual surfaces** — In-app conversion uses `/plans` (`plans/page.tsx`); marketing uses `/pricing` with `LandingNav` and signed-in pointer copy to Plans & billing (`pricing/page.tsx`). This is intentional but can confuse users who remember “Pricing” from marketing while the app nav label is “Plans.” Evidence: `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx`, `app/components/landing-nav.tsx`.
- **Footer in app shell — no billing shortcut** — `Footer` links to tools, legal, changelog, and contact but not `/plans`; reliance on sidebar for upgrade is fine for many users but adds one more hop if someone scrolls to the footer looking for billing. Evidence: `app/components/footer.tsx`.

## Evidence reviewed

**Process & policy**

- `docs/process/feature-ux-audit-process.md` (scope, dimensions, output path, audit-only).
- `docs/process/audit-report-template.md` (structure).
- `docs/policies/design-spec.md` (philosophy, typography, mobile patterns, audit alignment list).
- `docs/policies/analytics-math-policy.md` (label density / clarity over density, metric contracts — cross-checked against dashboard and deals copy).
- `docs/architecture-and-build-practices.md` (property detail IA, workspace deep links).

**Navigation & shell**

- `app/app/(app)/app-nav.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/layout.tsx`
- `app/components/footer.tsx`, `app/components/landing-nav.tsx`

**Core journeys**

- Dashboard: `app/app/(app)/dashboard/page.tsx`, `dashboard/workspace-nav-mobile.tsx`, `dashboard/dashboard-charts.tsx` (referenced), `components/mobile-collapsible.tsx` (usage on dashboard)
- Properties: `app/app/(app)/properties/page.tsx`, `properties/properties-filters-mobile.tsx` (referenced), `app/app/(app)/properties/[id]/page.tsx`, `property-detail-tabs.tsx`, `property-hero.tsx`
- Modeling / Mortgage: `app/app/(app)/modeling/page.tsx`, `app/app/(app)/mortgage/page.tsx` (data loading + `propertyId` / `mortgageId` query params)
- Analyze + Deals: `app/app/(app)/analyze/page.tsx`, `deal-analyzer-form.tsx`, `app/app/(app)/deals/page.tsx`, `deals/deals-list.tsx`
- Calculators: `app/app/(app)/calculators/page.tsx`, `components/calculators/calculators-hub-cards.tsx`
- Plans / pricing: `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx`, `components/pricing-cards.tsx`
- Onboarding: `app/app/(app)/onboarding-panel.tsx`, dashboard empty and `?onboarding=first-property` banner in `dashboard/page.tsx`

**Limits & assumptions**

- Static review of source and docs only; no device lab or automated visual regression this run.
- Did not exhaust every sub-page (e.g. full `modeling-workspace.tsx` / `mortgage-workspace.tsx` interaction states); focused on IA, primary flows, and cross-surface consistency per process doc.

## Risk & impact assessment

Unresolved medium items mainly affect **discoverability and learnability** (export on mobile, Analyze ↔ Deals connection, nav density), not core data integrity. Likelihood is moderate for mobile-heavy investors and first-time Analyze users. Low items are polish and consistency; fixing them reduces support questions and spec drift.

## Recommendations (prioritized)

1. **Parity for portfolio export:** Add a mobile-visible path to `/export/portfolio-summary` (e.g. include it in `WorkspaceNavMobile`, a dashboard overflow menu, or Settings) so the feature matches desktop discoverability.
2. **Analyze page orientation:** Add a short secondary line or inline link in the Analyze header (`analyze/page.tsx`) to `/deals` (“View saved deals”) so the save/compare loop is obvious without scrolling the full form.
3. **Property detail heading:** Introduce a spec-aligned page title (or promote the identity block to `h1` with appropriate styling) so property detail matches other primary surfaces and improves outline consistency.
4. **Nav optional refinement:** Consider grouping or reordering (e.g. Deals adjacent to Analyze) or a future “Workspaces” grouping if nav growth continues; validate with a short usability pass.

## Task candidates

- [ ] Add mobile dashboard (or settings) entry for portfolio summary export aligned with desktop behavior.
- [ ] Add Analyze header link/copy pointing to saved deals (`/deals`).
- [ ] Align property detail page heading with `design-spec.md` page title pattern.
- [ ] Normalize `(app)/calculators/page.tsx` outer padding vs `app-layout-client` `main` padding.

## Re-test checklist

- [ ] Verify export is discoverable from mobile dashboard (or agreed alternate surface).
- [ ] Verify Analyze first screen communicates the Deals list without scrolling.
- [ ] Verify property detail heading hierarchy and styles match list pages.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Quarterly UX alignment per `design-spec.md`, or before any primary nav / workspace restructuring; optionally after shipping major Analyze or Deals changes.
- **Suggested next window:** 2026-06-30 ± 2 weeks, or next pre-release milestone.
