# Feature / UX / IA Audit — 2026-04-29

## Executive summary

- **Overall:** Core journeys remain structured with clear page titles, grouped sidebar navigation (Portfolio → Tools → Account), and dedicated workspaces for modeling, mortgage, refinance, calculators, and deal analysis. Empty states exist for key tools and explain next steps.
- **Top risks:** Mobile primary navigation still pairs the **Deal Analyzer** destination with a **calculator** icon and a short **“Analyze”** label, which can mis-lead users relative to the sidebar’s **“Analyze deal”** + clipboard affordance. Six **Tools** items plus **Refinance** create wayfinding load; on mobile, only Dashboard, Properties, and Analyze are pinned—**Deals**, **Mortgage**, **Modeling**, **Refinance**, and **Calculators** are behind **More**.
- **First-value path:** Dashboard empty state and onboarding push **`/properties/new?mode=quick`**, while Modeling, Mortgage, and Refinance zero-data CTAs use **`/properties/new`** (no quick mode) or **`/properties`**—fragmenting the first-property experience.
- **Recommendation:** Fix mobile tab semantics first; unify add-property deep links (single helper or shared query param); then consider IA testing (Tools grouping/labels) with passive landlords.

## Severity-ranked findings

### Critical

- None identified in this static, code-structure pass (no evidence of blocked flows or destructive dead-ends without live session testing).

### High

- **Mobile bottom nav: “Analyze” uses `Calculator` icon** — The third tab targets `/analyze` (Deal Analyzer) but uses the calculator glyph; sidebar uses `ClipboardList` for **Analyze deal**. **Impact:** Users may expect spreadsheets/calculators, tap the wrong mental model, or hunt for “real” deal analysis. **Evidence:** `app/components/mobile-bottom-nav.tsx` (`Calculator` in `NAV_ITEMS`); `app/app/(app)/app-nav.tsx` (`ClipboardList` for Analyze deal).

- **High-value tools are second-tier on mobile** — Sidebar **Tools** lists Modeling, Mortgage, Refinance, Calculators, Analyze deal, Deals. Bottom bar exposes only Dashboard, Properties, Analyze, and **More**. **Impact:** Saved deals, global mortgage workspace, and calculators require an extra step on small screens; may reduce discovery for deal-oriented users. **Evidence:** `app/app/(app)/app-nav.tsx` (`toolsNav`); `app/components/mobile-bottom-nav.tsx`.

### Medium

- **Inconsistent first-property / “get data in” CTAs across surfaces** — Dashboard primary CTA and onboarding use **`/properties/new?mode=quick`** (`app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`, `app/app/(app)/onboarding-panel.tsx`). Modeling and Mortgage empty states link to **`/properties/new`** without `mode=quick` (`app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`). Refinance empty state (no qualifying mortgages) links to **`/properties/new`** when there are no properties at all (`app/app/(app)/refinance/refinance-workspace.tsx`). **Impact:** Users hit different add flows from different entry points without an explained reason; may slow time-to-value or skew completeness.

- **Dual pricing surfaces (“Pricing” vs “Plans & billing”)** — Public **`/pricing`** and authenticated **`/plans`** both present tiers; naming differs. **Impact:** Bookmarks, emails, and support may reference either URL; minor cognitive overhead. **Evidence:** `app/app/pricing/page.tsx`; `app/app/(app)/plans/page.tsx`; `app/app/(app)/app-nav.tsx` (**Plans**).

- **Saved deals metrics vs portfolio display mode** — Deals list documents that metrics use **proportional** math and do not follow portfolio **full liability** display mode. **Impact:** Analytical users may still question parity until they read the copy. **Evidence:** `app/app/(app)/deals/page.tsx` (intro paragraph); aligns with `docs/policies/analytics-math-policy.md` (no silent basis switching).

### Low

- **Property detail actions: Modeling + Refinance, not global Mortgage** — `BreadcrumbActions` exposes **Open in Modeling** and **Open in Refinance** with query params (`app/app/(app)/properties/[id]/property-detail-content.tsx`) but no mirrored **Open in Mortgage** deep link to `/mortgage?propertyId=…`. Mortgage content exists on-page via `MortgageSection`; global workspace is discoverable only via nav. **Impact:** Minor asymmetry for users who live in workspace UIs.

- **Dashboard empty-state copy** — “Analyze a deal first” says “No account data needed” while the user is signed in (`app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`). **Impact:** Small trust/clarity noise only.

- **App header wordmark** — In-app shell uses text “Veld” (`app/app/(app)/app-layout-client.tsx` / `LogoLink`) vs richer marketing nav on public pages. **Impact:** Brand continuity only.

## Evidence reviewed

- **Process:** `docs/process/feature-ux-audit-process.md`
- **Template:** `docs/process/audit-report-template.md`
- **Policies / specs:** `docs/policies/design-spec.md` (journey list, hierarchy); `docs/policies/analytics-math-policy.md` (labeling, no silent basis switching)
- **Surfaces (read-only):**
  - Shell: `app/app/(app)/layout.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx`, `app/components/mobile-bottom-nav.tsx`
  - Dashboard: `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`
  - Properties: `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/[id]/property-detail-content.tsx`, `app/app/(app)/properties/[id]/mortgage/quick/page.tsx`
  - Workspaces: `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/modeling/page.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/refinance/refinance-workspace.tsx`, `app/app/(app)/calculators/page.tsx`
  - Analyze & deals: `app/app/(app)/analyze/page.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/(app)/deals/deals-list.tsx`
  - Plans / conversion: `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx`
  - Onboarding: `app/app/(app)/onboarding-panel.tsx`

**Assumptions / limits:** No production session replay, moderated usability tests, or visual regression in this pass. Findings are from representative source review aligned to the process scope. A prior audit referenced a `property-detail-tabs.tsx` file; current property detail structure is centered on `property-detail-content.tsx` and related components.

## Risk & impact assessment

- **High:** Mobile icon/label mismatch affects every small-screen app open and can dampen Deal Analyzer adoption; buried **More** items reduce exposure for deal and debt workflows during mobile-only usage (common in the field).
- **Medium:** Split add-property URLs can create uneven onboarding data quality; dual pricing URLs create light support/doc drift risk.
- **Likelihood:** High for mobile nav confusion (always visible); medium for CTA divergence (conditional on user path).

## Recommendations (prioritized)

1. **Align mobile bottom navigation** with Deal Analyzer semantics: replace `Calculator` with the same icon family as the sidebar (`ClipboardList` or another non-calculator metaphor) and consider label text (“Deal” / “Analyze deal”) given `min-h-[44px]` constraints in `app/components/mobile-bottom-nav.tsx`.
2. **Centralize first-property navigation** — Use one documented href (e.g. always `?mode=quick` for “empty portfolio” CTAs unless a surface intentionally targets the full wizard) across Modeling, Mortgage, Refinance, and any other zero-state cards.
3. **IA review of “Tools”** — Validate labels and grouping (Mortgage vs Refinance vs Calculators vs Analyze deal) with target users; optionally surface **Deals** or **Mortgage** on the bottom bar if analytics show mobile drop-off.

## Task candidates

- [ ] Swap mobile bottom-nav icon for `/analyze` to match sidebar / product language (`mobile-bottom-nav.tsx`).
- [ ] Unify empty-state `href` for “add first property” with dashboard/onboarding (`?mode=quick` or shared constant).
- [ ] Add optional `Open in Mortgage` (or equivalent) from property detail for parity with Modeling/Refinance links, if product confirms demand.

## Re-test checklist

- [ ] Verify mobile bottom nav: icon, label, and active states on `/analyze` and child routes
- [ ] Verify each tool empty state lands on the intended add-property flow
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After material navigation or onboarding changes, or quarterly.
- **Recommended next run:** 2026-07-29 (quarterly) or sooner if mobile nav or add-property flow ships.
