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

## Phase 1 Implementation Plan (Detailed)

Goal: improve activation and feature discoverability without introducing UX inconsistency, security regressions, or unnecessary scope creep.

Scope includes all Phase 1 items:
1. Global discoverability for Modeling and Mortgage
2. Onboarding checklist + welcome modal
3. Cross-links from Dashboard/Properties to advanced tools

### Design and Process Guardrails

These are required across all Phase 1 work:
- Keep existing visual system and tokens (card styles, spacing scale, typography, button hierarchy).
- Reuse existing app shell/navigation patterns before introducing new component variants.
- Maintain current route protection and user scoping patterns (no cross-user data exposure).
- Preserve current plan gating behavior and upgrade UX tone (contextual, not aggressive).
- Preserve mobile usability and keyboard accessibility for all new UI.
- Prefer additive changes and backward compatibility (existing property tabs continue to work).
- Ship behind small, reviewable PRs with clear acceptance checks.

### Workstream A - Global Discoverability (Modeling and Mortgage)

#### Deliverables
- Add first-class routes:
  - `/modeling`
  - `/mortgage` (or `/mortgage-center`, choose one naming convention and use consistently)
- Add top-level sidebar nav entries for these routes.
- Add route-level empty states and contextual selectors:
  - property selector on Modeling
  - property selector + mortgage selector on Mortgage
- Support deep-link preselection via query params:
  - `/modeling?propertyId=<id>`
  - `/mortgage?propertyId=<id>&mortgageId=<id>`
- Keep existing property detail tabs (`Projections`, `Mortgage`) as valid entry points.

#### UX behavior requirements
- 0 properties: explain value briefly and CTA to add first property.
- 1 property: auto-select property; keep selector minimized or hidden.
- 2+ properties: show selector prominently near page header.
- Property has no mortgage: clear state + CTA to add mortgage.
- Invalid/missing query IDs: fail gracefully to default selection (no crash/no blank page).

#### Security and integrity requirements
- All data queries remain scoped to authenticated user ID.
- Query params are selection hints only; never trusted as authorization.
- No sensitive values persisted in client storage beyond existing safe UI preferences.

#### Explicit acceptance criteria
- [x] Sidebar shows `Modeling` and `Mortgage` for authenticated app users.
- [x] `/modeling` loads and supports property selection with valid default behavior.
- [x] `/mortgage` loads and supports property+mortgage selection with valid default behavior.
- [x] Deep links from property context open global pages with preselected context when valid.
- [x] Invalid `propertyId`/`mortgageId` query values never expose unauthorized data and fallback safely.
- [x] Existing property-detail tabs still function and are not removed in Phase 1.
- [x] Mobile, tablet, and desktop layouts remain usable with no horizontal overflow regressions (desktop validated; mobile/tablet require manual QA pass below).

---

### Workstream B - Onboarding Activation (Modal-first, no checklist)

#### Deliverables
- First-session welcome modal for new users.
- Primary CTA in modal routes directly to `Add property`.
- First-property completion returns user to dashboard (`time-to-first-value` flow).
- Lightweight dashboard success state after first-property redirect.
- Optional "Explore next" guidance is allowed, but must be non-blocking and non-persistent.

#### UX behavior requirements
- Modal appears only when meaningful (new/incomplete onboarding), not on every session.
- Users can skip onboarding and continue product use immediately.
- Clicking "Start setup" should immediately begin setup (navigate to add-property flow).
- Onboarding should not push page layout down with persistent setup UI.
- Optional tools (Modeling, Mortgage, Analyze) should be suggestions only, not required completion gates.
- Keep copy concise and practical; avoid marketing-heavy language inside app.

#### Data and security requirements
- Onboarding state persistence should be per-user and resilient across sessions.
- If stored server-side, use authenticated route handlers and user-scoped reads/writes.
- Do not store PII beyond existing account/user identifiers needed for state linkage.
- Store only minimal state needed for modal behavior and first-property activation cues.

#### Explicit acceptance criteria
- [ ] Eligible users see a one-time welcome modal with clear skip/start options.
- [ ] Clicking `Start setup` routes directly to `/properties/new`.
- [ ] Users who click `Not now` do not see persistent checklist UI.
- [ ] After first property creation, user is redirected to dashboard.
- [ ] Dashboard shows a lightweight success confirmation after first property creation.
- [ ] Onboarding can be fully completed without running modeling, adding mortgage, or analyzing a deal.
- [ ] Optional guidance (if shown) is clearly labeled as optional and never blocks completion.

---

### Workstream C - Cross-links from Summary Pages to Advanced Tools

#### Deliverables
- Add explicit cards/CTAs on Dashboard to:
  - Run scenario modeling
  - Open mortgage payoff simulator
- Add contextual CTAs on Properties cards/list and property detail surfaces:
  - Open in Modeling
  - Open in Mortgage Center
- Ensure links pass property context through query params where appropriate.

#### UX behavior requirements
- CTA labels should be action-oriented and consistent across pages.
- Do not overload pages with too many equal-priority CTAs.
- Preserve existing primary actions (e.g., Add property) as primary where expected.

#### Explicit acceptance criteria
- [x] Dashboard includes visible access paths to Modeling and Mortgage tools.
- [x] Properties page includes at least one contextual path into each advanced tool.
- [x] Property detail includes clear "open in global tool" affordances.
- [x] All new links route correctly with valid context fallback behavior.
- [x] CTA hierarchy remains clear (no conflicts with primary existing actions).

---

### Delivery Sequence (Recommended)

Sprint 1:
1. Workstream A foundations (new routes + nav + selection model + deep-link parsing)
2. Workstream C initial dashboard/properties cross-links (using new routes)

Sprint 2:
1. Workstream B onboarding (modal-first + first-property dashboard return)
2. Workstream C refinement (copy polish + context placements)
3. End-to-end polish and edge-case hardening

---

### Validation and QA Checklist (Phase 1 Exit Gate)

- Navigation
  - [x] New nav entries visible and active-state behavior is correct.
  - [x] No regressions in existing app nav items.

- Access control and safety
  - [x] User cannot access another user's property/mortgage context via query param tampering.
  - [x] Unauthorized users are still redirected/protected as before.

- UX consistency
  - [x] New pages use existing design tokens/components and feel native to app.
  - [x] New copy is consistent with existing tone (clear, practical, concise).

- Responsiveness and accessibility
  - [ ] Works on mobile/desktop with no major layout breaks. (manual QA required)
  - [ ] Interactive elements are keyboard reachable with visible focus states. (manual QA required)
  - [ ] Modals and coach marks are screen-reader friendly (labels/roles). (manual QA required)

- Activation outcomes
  - [ ] New users can discover and reach advanced tools within first session. (manual QA required)
  - [ ] New users can complete onboarding without running optional advanced workflows. (manual QA required)

- Operational confidence
  - [x] Error handling states are present for empty, missing, or invalid selection contexts.
  - [x] Existing analytics/billing surfaces are unaffected by Phase 1 changes.

Status note:
- Automated validation (`npm run check`) passes after Phase 1 changes.
- Remaining unchecked items are intentionally marked for manual product QA.
- Onboarding proposal updated to modal-first flow; checklist-based assumptions are deprecated.

---

### Out of Scope for Phase 1

- Full wizard redesign (Phase 2).
- Deal compare redesign (Phase 2).
- Major visual redesign or token changes (Phase 3+).
- New external integrations or pricing model changes.

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
- Yes, do it next. Prefer a modal-first activation flow and optional suggestions over persistent checklists.

3) Modernize add property/add mortgage wizard:
- Yes, do it, but after discoverability and onboarding unless you need visual polish first for demos.

---

## Approved Onboarding Modal Direction (2026-03-18)

This visual direction is approved and should be treated as the baseline for onboarding style quality.

- Style:
  - Elevated, premium modal card with soft backdrop blur and subtle gradient/glow accents.
  - Strong typography hierarchy: compact eyebrow label, bold activation headline, concise supporting copy.
  - Clean spacing and visual rhythm; no crowded checklist layout.

- Content:
  - Activation-first message focused on immediate value after first property is added.
  - Benefit points presented as informational items (not actions), e.g.:
    - Track cash flow
    - See equity growth
    - Model upside
  - Confidence microcopy such as setup-time expectation.

- Actions:
  - Primary CTA is visually dominant: `Add first property`.
  - Secondary CTA is quiet but clear: `Maybe later`.
  - Keep behavior unchanged from current implementation:
    - Primary -> `/properties/new`
    - Secondary -> dismiss modal persistently

- Guardrails:
  - Modal should feel integrated with app design tokens (no one-off visual language).
  - Avoid interactive styling on informational elements to reduce ambiguity.
  - Keep onboarding non-blocking and avoid reintroducing persistent checklist UX.

