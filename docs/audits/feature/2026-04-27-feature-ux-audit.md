# Feature / UX / IA Audit — 2026-04-27

## Executive summary

- **Overall:** Core journeys (Dashboard, Properties, property detail, Modeling, Mortgage, Analyze, Deals, Plans) are implemented with clear page titles, progressive disclosure (e.g. property tabs redirecting mortgage/projection deep links to dedicated workspaces), and helpful empty states on Dashboard and Deals.
- **Top risks:** Mobile primary navigation uses an icon/label pairing that can confuse **Analyze** with **Calculators**; the sidebar **Tools** group is long (six items) and overlaps conceptually (Mortgage, Refinance, Calculators, Analyze), which may slow wayfinding for new users.
- **Onboarding / first value:** Welcome modal and dashboard empty state push **quick add** (`/properties/new?mode=quick`) while Modeling and Mortgage empty states link to `/properties/new` without `mode=quick` — a small but real inconsistency in the first-run path.
- **Recommendation:** Treat mobile nav affordance and first-property CTA alignment as the fastest wins; then review IA labeling for the Tools cluster (test with passive landlords) against `docs/policies/design-spec.md` hierarchy goals.

## Severity-ranked findings

### Critical

- None identified in this static/code-structure pass (no blocked flows or data-loss patterns found without live user testing).

### High

- **Mobile bottom nav “Analyze” uses a Calculator icon** — Users glancing at the tab bar may believe the control opens calculators or general math, not the Deal Analyzer. Sidebar **Analyze deal** uses `ClipboardList` in `app-nav.tsx`, but `mobile-bottom-nav.tsx` uses `Calculator` for the same primary destination (`/analyze`). **Impact:** Mis-set expectations, possible wrong-tab taps, extra cognitive load on mobile. **Evidence:** `app/components/mobile-bottom-nav.tsx` (NAV_ITEMS + `Calculator` import); contrast `app/app/(app)/app-nav.tsx` (`ClipboardList` for Analyze deal).
- **Seven destinations compete in “Tools” + bottom bar (mobile)** — Desktop sidebar groups Portfolio (2) + Tools (6) + Account. On mobile, only Dashboard, Properties, and Analyze are pinned; Mortgage, Modeling, Refinance, Calculators, and Deals require **More**. **Impact:** High-value work surfaces (e.g. Deals, mortgage payoff) are second-tier for thumb-first users unless they discover the drawer. **Evidence:** `app/app/(app)/app-nav.tsx` (`toolsNav` array); `app/components/mobile-bottom-nav.tsx` (three links + More).

### Medium

- **Inconsistent “first property” entry between empty states** — Dashboard primary CTA and onboarding “start now” use **`/properties/new?mode=quick`** (`app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`, `app/app/(app)/onboarding-panel.tsx`). Modeling and Mortgage zero-property empty states use **`/properties/new`** only (`app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`). **Impact:** Some users get the quick flow from one entry point and the full wizard from another without an obvious reason. **Risk:** Slower time-to-value or divergent data completeness.
- **Two pricing entry points (marketing vs app)** — Public **`/pricing`** (`app/app/pricing/page.tsx`) and in-app **Plans & billing** at **`/plans`** (`app/app/(app)/plans/page.tsx`) both sell tiers; copy cross-links signed-in users. **Impact:** Low if users always land from marketing CTAs, but support and bookmarks may use either URL; naming differs (“Pricing” vs “Plans & billing”). **Evidence:** `app/app/pricing/page.tsx` (link to `/plans` for signed-in users); `app/components/landing-nav.tsx` (“Pricing”); `app/app/(app)/app-nav.tsx` (`/plans` as “Plans”).
- **Deals list transparency vs dashboard display mode** — Saved deals page states metrics use **proportional** math and do **not** follow portfolio **full liability** display mode (`app/app/(app)/deals/page.tsx`). **Impact:** Users who set **full liability** on the portfolio may see a mismatch between portfolio property cards and saved-deal cards without a single inline explainer on the deal analyzer. **Policy tie-in:** `docs/policies/analytics-math-policy.md` (label clarity; no silent basis switching — the page partially addresses this with copy).

### Low

- **Property detail on-page tabs are only Overview + Details** — Deeper work (mortgage payoff, projections) live in **Mortgage** / **Modeling** via URL redirects when `?tab=mortgage` or `?tab=projections` is used (`app/app/(app)/properties/[id]/property-detail-tabs.tsx`). **Impact:** Power users who expect tabs for everything may miss deep links; redirects are a reasonable pattern but should stay documented in help content.
- **App shell logo is text “Veld”** — `app/app/(app)/app-layout-client.tsx` uses a wordmark in the header/sidebar, while marketing pages use broader nav branding patterns. **Impact:** Minor brand continuity only.
- **Dashboard empty state secondary copy** — “Analyze a deal first” says “No account data needed” (`dashboard-empty-state-ctas.tsx`); the user is signed in. **Impact:** Slight copy noise, not a functional issue.

## Evidence reviewed

- **Process:** `docs/process/feature-ux-audit-process.md` (core journeys and dimensions).
- **Template:** `docs/process/audit-report-template.md`.
- **Policy / spec references:** `docs/policies/design-spec.md` (hierarchy, mobile breakpoint `md`); `docs/policies/analytics-math-policy.md` (label density, metric contracts).
- **App surfaces (read-only file review):**
  - Layout & navigation: `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/app-nav.tsx`, `app/components/mobile-bottom-nav.tsx`, `app/components/landing-nav.tsx`
  - Dashboard: `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`
  - Properties: `app/app/(app)/properties/page.tsx`
  - Property detail: `app/app/(app)/properties/[id]/page.tsx`, `app/app/(app)/properties/[id]/property-detail-tabs.tsx`
  - Workspaces: `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/calculators/page.tsx`, `app/app/tools/page.tsx`
  - Analyze & deals: `app/app/(app)/analyze/page.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/(app)/deals/deals-list.tsx`
  - Plans & conversion: `app/app/(app)/plans/page.tsx`, `app/app/pricing/page.tsx`
  - Onboarding: `app/app/(app)/onboarding-panel.tsx`
  - Settings (export deep link): `app/app/(app)/settings/page.tsx` (`id="export"` for `#export` from dashboard)

**Assumptions / limits:** No production session replay, analytics, or moderated usability tests. No visual regression of rendered pages in this run. Findings are from representative source files and route list coverage of core journeys.

## Risk & impact assessment

- **Unresolved High items** reduce discoverability and speed-to-value on **mobile**, where landlords may review the portfolio between showings. Wrong mental model (calculator vs deal analysis) can reduce engagement with the Deal Analyzer and inflate support questions (“where is the calculator?”).
- **Medium items** create **inconsistent first-run** behavior and **multi-URL** mental load for pricing; the deals vs portfolio **display mode** copy gap may erode trust in number parity for analytical users.
- **Likelihood:** High for mobile icon confusion (visible on every app load); medium for quick-vs-full add-property divergence (only affects users hitting Modeling/Mortgage before adding a property).

## Recommendations (prioritized)

1. **Align mobile bottom nav** with the Deal Analyzer affordance: use the same iconography as the sidebar (`ClipboardList` or another non-calculator symbol) and/or shorten the label to “Deal” / “Deals” if space allows — verify against touch target and scanability in `app/components/mobile-bottom-nav.tsx`.
2. **Unify first-property CTAs** across Modeling, Mortgage, and any other empty states with Dashboard/onboarding: use **`/properties/new?mode=quick`** (or a single documented helper) unless product intentionally routes power users to the full wizard.
3. **IA pass on the Tools group:** Consider sub-grouping (e.g. “Financing: Mortgage, Refinance” vs “Analysis: Calculators, Analyze, Deals”) or a small in-app “What to use when” help line on `/dashboard` for users with 1–2 properties — test labels with the `design-spec` “numbers first” hierarchy in mind.
4. **Optional:** On saved deals or the analyzer, add a one-line pointer when the user’s **ownership display mode** is full liability, linking to the proportional basis used in deals (ties to analytics policy).

## Task candidates (optional)

- [ ] Change `MobileBottomNav` Analyze icon from `Calculator` to match Deal Analyzer (`ClipboardList`) or approved alternative; re-check active-state styling for `/analyze`.
- [ ] Replace `/properties/new` with `/properties/new?mode=quick` in Modeling and Mortgage zero-property empty states (or extract shared `FIRST_PROPERTY_HREF` constant).
- [ ] Add a11y/UX review of **More** drawer: ensure Mortgage, Modeling, deals, and calculators are scannable in one scroll on typical phone heights.
- [ ] Add inline helper on Deal Analyzer or Deals when `user.ownershipDisplayMode === "full_liability"` (or link to help doc).

## Re-test checklist

- [ ] Verify fix for mobile Analyze icon/label (High) on 375px and 430px viewports; confirm `/analyze` is still the target.
- [ ] After unifying add-property hrefs, smoke-test: dashboard empty → quick add; Modeling empty → add → quick flow behavior.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After major nav/workspace changes, or quarterly.
- **Recommended next run:** 2026-07-27 (Q3) or next release with routing/nav updates; pair with `docs/qa/mobile-experience-audit.md` for a mobile-only pass if viewport/touch issues are a priority.
