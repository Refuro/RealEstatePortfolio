# Feature / UX / IA Audit — 2026-03-19

## Executive summary

- Navigation and information architecture are strong after the Phase 1 discoverability overhaul — Modeling and Mortgage are first-class sidebar destinations.
- Cross-page consistency has several medium-severity gaps: CTA label variations, card styling drift, and a confusing `/plans` vs `/pricing` naming split.
- Page-by-page analysis reveals good feature depth but specific UX friction points: duplicate Modeling/Mortgage links on property detail, flat CTA hierarchy on dashboard, and no filter/sort on Deals.
- Onboarding modal is well-designed but lacks a "don't show again" option and has no path to Analyze in the empty state.

---

## Severity-ranked findings

### Critical

- None found.

### High

**H1 — Nav label "Pricing" routes to `/plans`; public page lives at `/pricing`**

- `app/(app)/app-nav.tsx` line 25: `{ href: "/plans", label: "Pricing", icon: CreditCard }`.
- Public pricing page: `app/pricing/page.tsx` at `/pricing`.
- Signed-in plans page: `app/(app)/plans/page.tsx` at `/plans`.
- Users encountering both will be confused. The nav label should match the route, or the routes should be unified.
- **Impact:** High for user trust and navigation clarity.

### Medium

**M1 — Duplicate Modeling/Mortgage links on property detail**

- `app/(app)/properties/[id]/property-detail-tabs.tsx`:
  - Lines 226–232: Action buttons "Open Modeling workspace" and "Open Mortgage workspace" in hero area.
  - Lines 363–366: Same links repeated at bottom of Overview tab.
- Users see the same CTAs twice on one page with no differentiation.
- **Recommendation:** Keep only the hero-area links; remove the bottom repetition.

**M2 — Flat CTA hierarchy on dashboard empty state**

- `app/(app)/dashboard/page.tsx` lines 100–128: Empty state shows "Add your first property" (accent button) and "Import from CSV" (text link to settings).
- Missing: no "Analyze a deal" CTA, no mention of pricing/plans.
- When properties exist (lines 144–206): summary card has "View properties", "Open property", "Open Modeling workspace", "Open Mortgage workspace", "Add property", "Analyze a deal" — all with similar visual weight.
- **Recommendation:** Establish clear primary/secondary/tertiary hierarchy. Primary: "Add property". Secondary: "Analyze a deal". Tertiary: workspace links.

**M3 — No filter or sort on Deals page**

- `app/(app)/deals/page.tsx`: No filter pills, sort dropdown, or search.
- Properties page has both (`FILTER_OPTIONS` lines 77–91, `SORT_OPTIONS` lines 94–96).
- With 5–50 saved deals, finding a specific one requires visual scanning.
- **Recommendation:** Add at minimum a sort by date and a free-text search.

**M4 — Deals page title "Saved deals" vs nav label "Deals"**

- Nav: "Deals" (`app-nav.tsx` line 24).
- Page title: "Saved deals" (`deals/page.tsx` line 61).
- Inconsistent naming across the same surface.

**M5 — Card styling drift across pages**

- Dashboard metric cards: `rounded-xl border-border/70 bg-card/95`.
- Properties cards: `rounded-lg border-border bg-card` with different hover states.
- Modeling/Mortgage workspace headers: `rounded-xl border-border/70 bg-card/95 shadow-sm`.
- Filter pills: Properties uses `border-accent bg-accent/10` (active); dashboard charts use `border-accent/50 bg-accent/15`.
- Not broken, but creates subtle visual inconsistency across pages.

**M6 — "View" button on deal cards duplicates card click**

- `app/(app)/deals/deals-list.tsx` lines 55–88: Entire card is wrapped in a `<Link>` to `/analyze?deal=${d.id}`.
- Lines 89–115: Action row includes "View" button that goes to the same destination.
- "View" is redundant with card click behavior.
- **Recommendation:** Remove "View" button; keep "Add to portfolio" and "Delete" as actions.

### Low

**L1 — No active-state accent indicator in sidebar**

- `app/(app)/app-nav.tsx` lines 44–45: Active state is `bg-subtle font-medium text-foreground`; inactive is `text-muted hover:text-foreground`.
- No left border accent, icon highlight, or other strong visual cue for the current page.
- Works but could be more distinctive, especially on wide screens where sidebar is always visible.

**L2 — Deals delete uses `window.confirm()`**

- `deals-list.tsx`: Delete action uses browser-native `confirm()` dialog.
- Other destructive actions (account delete) use custom modals with Zod-validated confirmation text.
- Inconsistent pattern; `confirm()` is functional but feels less polished.

**L3 — Single-property dashboard has no metric cards**

- `dashboard/page.tsx` lines 206, 248, 285: Metric cards only show when `metrics.propertyCount > 1`.
- Single-property users see "Property at a glance" chart instead of metric cards.
- Users with one property may wonder where their key metrics are.

**L4 — Analyze form has no step/progress indicators**

- `analyze/deal-analyzer-form.tsx`: Single continuous form with sections (Basics, Income/Expenses, Debt/Ownership).
- No step chips, progress bar, or section anchors.
- The form is manageable in length but lacks the structured feel of the add-property wizard.

**L5 — Properties "Add mortgage" may be more important than "Open Modeling"**

- `properties/page.tsx` lines 392–416: Property cards show "Open property" (primary), "Open Modeling", "Open Mortgage" or "Add mortgage".
- When a property has no mortgage, "Add mortgage" appears as a secondary link, but it's arguably more important than "Open Modeling" for that property.

---

## Page-by-page analysis

### 1. Sidebar / Navigation

**File:** `app/(app)/app-nav.tsx`, `app/(app)/app-layout-client.tsx`

**Nav items (8 + conditional admin):**

| Order | Label | Route | Icon |
|-------|-------|-------|------|
| 1 | Dashboard | `/dashboard` | LayoutDashboard |
| 2 | Properties | `/properties` | Building2 |
| 3 | Modeling | `/modeling` | SlidersHorizontal |
| 4 | Mortgage | `/mortgage` | Landmark |
| 5 | Analyze deal | `/analyze` | Calculator |
| 6 | Deals | `/deals` | Briefcase |
| 7 | Pricing | `/plans` | CreditCard |
| 8 | Settings | `/settings` | Settings |
| 9 | Admin | `/admin` | Shield (admin only) |

**Active state logic:** `pathname === href || (href !== "/dashboard" && pathname.startsWith(href))`. Dashboard active only on exact match; others active on prefix (e.g., `/properties/123` highlights Properties). Correct behavior.

**Mobile:** Hamburger menu with slide-from-left drawer (`w-56`), backdrop blur on `bg-foreground/20`, closes on click/escape/pathname change.

**Issues found:**
- Label "Pricing" → route `/plans` mismatch (H1).
- No accent border or strong visual cue for active nav item (L1).

### 2. Dashboard

**File:** `app/(app)/dashboard/page.tsx`

**Empty state (0 properties):** "Welcome to Veld" hero with "Add your first property" accent CTA and "Import from CSV" secondary link. Clean and clear. Missing "Analyze a deal" path.

**Single property:** "Property at a glance" inline value bar (from `DashboardCharts`), summary card with property links. No metric cards shown — only appears at 2+ properties.

**Multi-property:** Primary metrics (Total value, debt, equity, cash flow, cap rate), secondary metrics (LTV, NOI, cash-on-cash, annual rent, DSCR), charts (equity/debt-vs-value/cash-flow tabs), rent-vs-market section.

**CTA summary card (lines 144–206):** Contains "View properties"/"Open property", "Open Modeling workspace", "Open Mortgage workspace", "Add property", "Analyze a deal". All roughly equal visual weight.

**Issues found:** M2 (flat CTA hierarchy), L3 (no metrics for single property).

### 3. Properties

**File:** `app/(app)/properties/page.tsx`

**Layout:** Grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`); single property gets full-width card.

**Filtering:** 5 filter options (All, Needs attention, No mortgage, Stale benchmark, Negative cash flow) as pills with active/inactive states. Working well.

**Sort:** 2 options (Recently updated, Worst cash flow). Minimal but functional.

**Card metrics:** Value, Equity, Cash flow (3 columns) + benchmark line.

**Card CTAs:** "Open property" (primary accent), "Open Modeling", "Open Mortgage"/"Add mortgage".

**Empty state:** "No properties yet" with "Add your first property" CTA. Filtered empty state: "No properties match this view" with "Clear filters".

**Over-limit:** "Showing X of Y" with "Upgrade" link when plan limit exceeded.

**Issues found:** L5 (mortgage priority), card styling drift (M5).

### 4. Property Detail

**Files:** `app/(app)/properties/[id]/page.tsx`, `property-detail-tabs.tsx`

**Tabs:** Overview, Details (2 tabs only — Mortgage and Projections tabs were removed and redirect to global workspaces).

**Overview tab:**
- PropertyHero with 4 key metrics, Edit link
- Action buttons: "Open Modeling workspace", "Open Mortgage workspace", benchmark refresh
- Verification section: Property inputs + Mortgage inputs (data quality chips)
- Performance at a glance: 4 primary metrics + 4 expandable supporting metrics
- Bottom links: Modeling and Mortgage workspace (duplicate of hero buttons)

**Details tab:** `DetailsTabContent` with Data & settings, Property facts, Financial inputs, Notes, Mortgage terms.

**Tab redirect logic:** `?tab=mortgage` → redirects to `/mortgage?propertyId=...`; `?tab=projections` → redirects to `/modeling?propertyId=...`. Backward-compatible.

**Issues found:** M1 (duplicate workspace links).

### 5. Modeling

**Files:** `app/(app)/modeling/page.tsx`, `modeling-workspace.tsx`

**Property selector:** Dropdown labeled "Modeling context" with property names. Disabled when single property. Shows "Active property" badge.

**Controls:** Handled by `ProjectionsTabContent` (rent/expense/value growth sliders, vacancy, PRESETS).

**Results:** Projection chart, summary cards, year-by-year breakdown.

**Empty state:** "Add your first property to start modeling" with CTA to `/properties/new`.

**Issues found:**
- No "Add property" option in the selector dropdown.
- "Active property" badge redundant when only one property exists.
- Disabled select with single property has no visual feedback.

### 6. Mortgage

**Files:** `app/(app)/mortgage/page.tsx`, `mortgage-workspace.tsx`

**Property/mortgage selector:** Property dropdown + mortgage count badge. "Edit mortgage details" link.

**Controls:** Handled by `MortgageTabContent` (extra payment slider, payoff earlier simulation).

**Empty state (no properties):** "Add your first property to start mortgage modeling" with CTA.

**Empty state (no mortgage):** "No mortgage found for this property" with "Add mortgage details" CTA. Clear.

**Issues found:**
- Mortgage count badge shows "0 mortgages" when none exist (minor).
- URL syncing via `syncMortgageWorkspaceQuery` with `history.replaceState`.

### 7. Analyze Deal

**Files:** `app/(app)/analyze/page.tsx`, `deal-analyzer-form.tsx`

**Layout:** Two-column on desktop — form (7/12) + sticky results sidebar (5/12).

**Form sections:** Basics (address, price, value), Income & expenses (rent, expenses, vacancy), Debt & ownership (mortgage, payment, cash invested, ownership %).

**Results sidebar:** Deal actions (Save, New deal, Open saved deals), Deal signal (cash flow, DSCR, cap rate), `PropertyMetricsSection`.

**Ownership note:** "Full liability mode does not apply to deal analysis" with brief explanation.

**Issues found:** L4 (no step indicators), redundant metrics between Deal signal and PropertyMetricsSection.

### 8. Deals

**Files:** `app/(app)/deals/page.tsx`, `deals-list.tsx`

**Layout:** Grid (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`).

**Card content:** Nickname/address, Cash flow, Cap rate, Equity, "Saved" date. Card is a link to `/analyze?deal=${id}`.

**Actions:** View (redundant), Add to portfolio, Delete (`confirm()` dialog).

**Empty state:** "No saved deals yet" with "Analyze a deal" CTA.

**Issues found:** M3 (no filter/sort), M4 (title mismatch), M6 (redundant View button), L2 (confirm dialog).

### 9. Plans / Pricing

**Files:** `app/(app)/plans/page.tsx` (signed-in), `app/pricing/page.tsx` (public)

**Plans page:** Title "Pricing", plan context card (current plan, property/deal counts, billing status), `PricingCards` component. Upgrade CTAs route to Stripe checkout.

**Public pricing page:** `LandingNav`, centered layout, `PricingCards` with sign-up CTAs, FAQ section, sign-up/sign-in CTAs for guests.

**PricingCards:** Shared component with tier cards showing features, limits, `publicBestFor` text. "Current plan" badge for active tier. Monthly/yearly toggle with savings display.

**Issues found:** H1 (label/route mismatch). "Pricing" as in-app title could be "Plans & billing" for clarity.

### 10. Settings

**File:** `app/(app)/settings/page.tsx`

**Sections:** Appearance (theme toggle), Portfolio display (ownership mode), Profile (name, email), Plan & billing (tier, limits, portal), Export/Import (CSV download + import), Delete account.

**Well organized.** Each section has clear heading and purpose. Plan limits show "(limit reached)" in red with "Upgrade" link.

**Issues found:** Minor — Import CSV is nested under "Export your data" section, which could be confusing. `id="export"` anchor is used for deep linking from dashboard.

### 11. Onboarding

**File:** `app/(app)/onboarding-panel.tsx`

**Modal design:** Fixed overlay with backdrop blur, `max-w-xl` card, decorative gradient circles. "Welcome" badge, bold headline, supporting copy, value chips ("Track cash flow", "See equity growth", "Model upside").

**CTAs:** "Maybe later" (secondary outline, dismisses permanently), "Add first property" (primary accent, navigates to `/properties/new`).

**Trigger logic:** Shows when both `onboardingWelcomeSeenAt` and `onboardingDismissedAt` are null. Either CTA marks `welcome_seen`; "Maybe later" also marks `dismissed`.

**Issues found:** No explicit "Don't show again" (though "Maybe later" is permanent). Helpful "~2 minutes" setup time estimate.

---

## Cross-page consistency inventory

| Dimension | Observation | Locations |
|-----------|-------------|-----------|
| CTA label for first property | "Add your first property" vs "Add property" | Dashboard empty state vs Properties header |
| Primary CTA style | `bg-accent text-accent-foreground` (most pages) vs `border border-border` (some secondary) | Mixed |
| Card corner radius | `rounded-xl` (dashboard, workspaces) vs `rounded-lg` (properties, deals) | Mixed |
| Card border | `border-border/70` (workspaces) vs `border-border` (properties, deals) | Mixed |
| Card background | `bg-card/95` (workspaces) vs `bg-card` (properties, deals) | Mixed |
| Filter pill active style | `border-accent bg-accent/10` (properties) vs `border-accent/50 bg-accent/15` (dashboard charts) | Properties vs Dashboard |
| Page title vs nav label | "Saved deals" vs "Deals"; "Pricing" vs `/plans` | Deals, Plans |
| Workspace link labels | "Open Modeling workspace" / "Open Mortgage workspace" (repeated identically) | Property detail, dashboard |
| Delete confirmation | `window.confirm()` (deals) vs custom modal with Zod validation (account) | Deals vs Settings |
| Empty state CTA phrasing | "Add your first property" (dashboard, properties, modeling, mortgage) — consistent | All |

---

## Evidence reviewed

- `app/(app)/app-nav.tsx` (navigation items, active state logic)
- `app/(app)/app-layout-client.tsx` (layout, mobile drawer, onboarding panel mount)
- `app/(app)/dashboard/page.tsx` (dashboard layout, metrics, empty states)
- `app/(app)/properties/page.tsx` (property list, filters, sort, cards)
- `app/(app)/properties/[id]/page.tsx` (property detail, tab routing, redirects)
- `app/(app)/properties/[id]/property-detail-tabs.tsx` (tab content, Overview/Details)
- `app/(app)/modeling/page.tsx` and `modeling-workspace.tsx` (modeling page, selector, workspace)
- `app/(app)/mortgage/page.tsx` and `mortgage-workspace.tsx` (mortgage page, selector, workspace)
- `app/(app)/analyze/deal-analyzer-form.tsx` (deal form, layout, metrics)
- `app/(app)/deals/page.tsx` and `deals-list.tsx` (deals list, cards, actions)
- `app/(app)/plans/page.tsx` and `app/pricing/page.tsx` (pricing, plans, CTAs)
- `app/(app)/settings/page.tsx` (settings sections)
- `app/(app)/onboarding-panel.tsx` (welcome modal)
- `components/pricing-cards.tsx` (shared pricing component)

---

## Risk & impact assessment

- **H1 (Pricing/Plans naming):** Confuses users navigating between public and signed-in pricing. Could reduce conversion confidence.
- **M1-M6:** Individually small but collectively create a sense of inconsistency that can erode perceived polish.
- **Missing Deals filter/sort** will become a real usability issue as users accumulate saved deals.

---

## Recommendations (prioritized)

1. **Unify pricing naming** — Either rename the in-app nav to "Plans" and the page title to "Plans & billing", or merge the two routes. The public `/pricing` and in-app `/plans` should have consistent terminology.
2. **Remove duplicate workspace links** from property detail bottom section (keep hero-area links only).
3. **Establish CTA hierarchy on dashboard** — Primary "Add property", secondary "Analyze a deal", tertiary workspace links.
4. **Add filter/sort to Deals page** — At minimum sort by date and free-text search.
5. **Standardize card styling** — Pick one `rounded-*` + `border-*` + `bg-*` combo for content cards across all pages.
6. **Remove redundant "View" button on deal cards** (card click already navigates).
7. **Add metric cards for single-property dashboard** (or provide equivalent key metrics inline).
8. **Replace `window.confirm()` with design-consistent modal** for deal deletion.

---

## Task candidates

- [ ] Rename nav label from "Pricing" to "Plans" and page title to "Plans & billing".
- [ ] Remove duplicate Modeling/Mortgage links from bottom of property detail Overview.
- [ ] Add sort-by-date and search to Deals page.
- [ ] Standardize card styling tokens across dashboard, properties, deals, and workspaces.
- [ ] Remove "View" action from deal cards.
- [ ] Replace `window.confirm()` in deals with app-consistent delete confirmation.
- [ ] Add single-property metric cards or inline metrics to dashboard.

---

## Re-test checklist

- [ ] Verify nav label change does not break active-state highlighting.
- [ ] Verify property detail has no duplicate workspace links.
- [ ] Verify Deals page sort/search works with 0, 1, and many deals.
- [ ] Manual QA: mobile responsiveness across all changed pages.
- [ ] `npm run check` passes.

---

## Next trigger and cadence

- Trigger: major layout, navigation, or new page additions
- Recommended next run: monthly
