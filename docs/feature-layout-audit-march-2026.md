# Veld Portfolio - Feature and Layout Audit (March 2026)

## Purpose

This audit focuses on product experience, feature discoverability, and information architecture (not code quality).

Inputs reviewed:
- App navigation and app shell
- Dashboard, Properties, Property Detail tabs, Analyze, Deals, Settings
- Add Property + Mortgage wizard flow
- Public landing/pricing messaging
- Existing product and roadmap docs

---

## Executive Takeaways

Veld is strong on core value and functional depth for the target persona (small real estate investors). The product already feels useful and credible, especially once at least one property is added. The biggest experience gap is discoverability of advanced value (modeling/mortgage simulation) and guided onboarding for first-time users.

High-level:
- Product value proposition: clear
- Feature depth: strong
- Navigation discoverability: good for core, weaker for advanced tools
- Onboarding: basic empty states, but no true guided activation
- First-run setup flow: functional and complete, but visual polish and confidence cues can improve

---

## What You Are Doing Well

1) Focused positioning and scope discipline
- You consistently position as portfolio analytics/intelligence, not property management.
- This keeps the feature set coherent and reduces cognitive overload.

2) Strong core workflow coverage
- Add property -> see metrics -> dive into details/projections/mortgage -> analyze deals -> manage plans.
- The app covers the full "investor spreadsheet replacement" journey.

3) Good use of progressive depth
- Dashboard and Properties provide summary-level visibility.
- Property detail tabs provide deeper tooling without cluttering list pages.

4) Good empty-state foundations
- Dashboard, Properties, and Deals have actionable empty states.
- Calls to action are clear and generally relevant.

5) Monetization and limits are integrated into UX
- Plan limits and upgrade pathways are surfaced contextually without being too aggressive.

6) Consistent visual language
- The cards/metrics/tokens approach is coherent across pages and supports scanability.

---

## What Needs Improvement Most

### 1) Discoverability of advanced tools (highest UX gap)

Current issue:
- Mortgage simulation and projections are nested under property detail tabs.
- A user can use the app for a while and still miss one of the highest-value differentiators.

Impact:
- Users may perceive Veld as "property tracker with metrics" rather than "decision/intelligence tool."

Recommendation:
- Your instinct is correct: abstract modeling and mortgage tools into global IA.
- Add new top-level nav items:
  - `Modeling` (portfolio + property-level scenarios)
  - `Mortgage` (portfolio mortgage center; include payoff simulator entry points)
- Keep property context deep links (e.g., open selected property preloaded), but make these tools first-class destinations.

Alternative if you want lower lift:
- Keep current nav, but add a "Tools" section in sidebar with `Scenario modeling` and `Mortgage simulator` links.
- Add stronger in-product cross-links from Dashboard and Properties cards.

Verdict on your idea:
- Strongly agree. This is likely your highest-leverage UX upgrade.

---

### 2) First-session onboarding is too light

Current issue:
- You have empty-state CTAs, but no explicit activation flow after sign-up.
- No "set up your portfolio in 3 steps" framing, no progress, no in-app guided tour.

Impact:
- New users may do one action and leave before understanding the full value.

Recommendation:
- Add a lightweight onboarding layer:
  1. Welcome modal (goal selection + expected setup time)
  2. Checklist dock or panel:
     - Add first property
     - Add mortgage
     - Run first scenario
     - Analyze one deal
  3. Contextual coach marks (not a long forced tour)
- Keep it skippable and resumable.

Verdict on your idea:
- Agree. This should be prioritized just after discoverability upgrades.

---

### 3) Add Property + Mortgage wizard needs modernization

Current issue:
- Flow is comprehensive and logically structured.
- Visual and interaction patterns are more functional than premium.

Impact:
- First major in-app flow sets perceived product quality; this is a "trust moment."

Recommendation:
- Keep step logic, but modernize presentation:
  - Sticky step summary rail (desktop) or condensed step chip strip (mobile)
  - Better section hierarchy and spacing rhythm
  - Inline "Why this matters" helper text for critical assumptions
  - Better micro-feedback after estimate actions (timestamp/confidence hint)
  - Optional quick mode vs advanced details ("Show advanced fields")
- Add stronger completion moment after submit (success state + immediate next best actions).

Verdict on your idea:
- Agree. This is a high-value polish initiative, but after discoverability/onboarding.

---

## Page-by-Page UX Notes

## `Dashboard`
- Strong: good summary metrics and quick actions.
- Improve: make advanced tools more visible with explicit cards:
  - "Run scenario modeling"
  - "Mortgage payoff simulator"
- Improve: add "Continue setup" module for incomplete onboarding users.

## `Properties`
- Strong: clear card layout and useful at-a-glance metrics.
- Improve: add segmented filters or sort shortcuts (recently updated, worst cash flow, stale data).
- Improve: add "insight nudges" on cards (e.g., low DSCR warning, high vacancy impact).

## `Property detail` (Overview/Mortgage/Projections/Details tabs)
- Strong: rich, structured, and logically separated.
- Improve: tabs hide power features from users who do not explore deeply.
- Improve: add persistent cross-page affordances:
  - "Open in Modeling"
  - "Open in Mortgage Center"

## `Analyze deal`
- Strong: clear and purposeful.
- Improve: stronger compare loop:
  - direct links to compare against portfolio medians
  - visible path to "Promote to property" after save

## `Deals`
- Strong: clean list and clear empty state.
- Improve: add quick compare view (2-3 selected deals side by side), plus tags/status labels.

## `Settings`
- Strong: complete account/billing/data surfaces.
- Improve: keep mostly as-is; avoid overloading this page with product actions.

## Public landing/pricing
- Strong: clear value proposition and pricing clarity.
- Improve: add one or two product screenshots/workflow snapshots to shorten time-to-trust.

---

## Information Architecture Recommendation

Proposed in-app nav:
- Dashboard
- Properties
- Modeling (new)
- Mortgage (new)
- Analyze deal
- Deals
- Pricing
- Settings

If adding two new top-level items feels heavy, use:
- Dashboard
- Properties
- Analyze deal
- Deals
- Tools (contains Modeling + Mortgage)
- Pricing
- Settings

Design principle:
- Core objects (Properties, Deals) + Core actions (Analyze, Model, Mortgage) should be globally discoverable.

---

## Prioritized Plan (Product/UX)

### Phase 1 (highest impact, 1-2 sprints)
1. Add global discoverability for Modeling and Mortgage
2. Add onboarding checklist + welcome modal
3. Add cross-links from Dashboard/Properties to advanced tools

### Phase 2 (next, 1-2 sprints)
1. Modernize Add Property wizard UI and confidence cues
2. Add post-submit success flow with explicit next best actions
3. Add compare affordances in Deals/Analyze

### Phase 3 (polish)
1. Enhanced filters and insight nudges on Properties
2. Marketing page proof assets (screenshots + short walkthrough)

---

## Launch Readiness Assessment

From a feature and layout perspective (not code/testing):

- Feature readiness: 8.5/10
- UX/discoverability readiness: 7.0/10
- Overall launch readiness: 7.8/10

Interpretation:
- You are close to launch-ready for an early paid beta/public launch.
- You are not yet at "best-converting launch shape" because advanced value is not yet obvious enough for first-time users.

To move to ~8.5-9.0 launch readiness:
- Make advanced tools globally discoverable
- Implement lightweight onboarding activation
- Modernize first-run wizard polish

---

## Final Call on Your Three Ideas

1) Abstract modeling/mortgage into sidebar nav:
- Yes, do it. This is the most important.

2) Better onboarding via modals/tour:
- Yes, do it next. Prefer checklist + contextual tips over a long forced tour.

3) Modernize add property/add mortgage wizard:
- Yes, do it, but after discoverability and onboarding unless you need visual polish first for demos.

