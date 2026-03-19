# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.

**Future features / roadmap:** See `docs/roadmap.md`. PM promotes items from there to here when ready to build.

---

## Completed (verified — smoke test passed 2025-03-15)

Pricing update ($15/$29), Website performance, App layout performance, Settings defer Stripe, Code audit follow-ups, Landing page overhaul, Dashboard enhancements, and all Builder tasks. **Full history:** `docs/tasks-archived.md`.

**Mortgage estimate & polish (2025-03-13):** Balance advancement (projected/stored, 6‑month staleness), escrow amount for P&I, amortization steep dropoff fix, import loan type, amortization chart tooltip (month/year + balance). All tasks below marked complete.

**Batch verified 2025-03-15:** Mortgage balance advancement, Escrow amount, Import template (original loan amount), Monthly rent display (single-unit), Import loan type, Amortization chart tooltip, Amortization steep dropoff fix, RentCast plan-based limits, RentCast rate limit messaging, Benchmarking (rent vs market), Estimate buttons (disable when matches last), Benchmarking surfacing (Option A & C), Dashboard Rent vs. market integration, Benchmark refresh inline button, Admin membership override, Settings override display, Sentry error tracking. **Archived:** `docs/tasks-archived.md` (section: Open tasks batch 2025-03-15).

**Code audit follow-ups (2026-03-17):** Benchmark refresh return 502 on RentCast failure; amortization chart tooltip shadow-sm; BenchmarkDisplay refactor to use lib/benchmark-utils.

**Date fields (2026-03-17):** Calendar button visibility — `accent-color` and `color-scheme` on `input[type="date"]` in globals.css.

**Payoff timeline Phase 1 (2026-03-13):** `getPayoffProjection` in lib/amortization.ts; payoff insight per mortgage in mortgage section; "Mortgages & payoff" heading; balance source copy; edge cases (no mortgages, invalid data, paid off); disclaimer. Proposal: `docs/refinance-payoff-proposal.md`.

**Payoff Accelerator Phase 2 (2026-03-13):** `getExtraPaymentForYearsEarlier`, `getPayoffYearsWithExtra` in lib/amortization.ts; years-earlier selector (5, 10, 15); extra payment input with reverse calc. Proposal: `docs/refinance-payoff-proposal.md`.

**Dashboard single-property overhaul (2025-03-13):** Equity & Cash flow charts for single property; View property path; Value breakdown (stacked bar); refined Add another property CTA; contextual Quick actions; "What's on property page" teaser. Proposal: `docs/dashboard-single-property-proposal.md`.

**Dashboard overhaul — single vs multi (2025-03-13):** Inline value bar in Property at a glance; hide Portfolio charts for single-property; fix Cash flow chart (formatCurrency, symmetric domain); consolidate add-property messaging. Proposal: `docs/dashboard-single-property-proposal.md` (revised).

---

## Roadmap priority (value vs effort — 2025-03-15)

| Order | Item | Effort | Value | Recommendation |
|-------|------|--------|-------|----------------|
| — | Mortgage balance advancement | ✓ Done | — | Balance advancement, escrow, amortization fix, loan type import, chart tooltip. |
| — | Admin membership override | ✓ Done | — | Tier override, admin UI, settings override display. |
| — | Benchmarking | ✓ Done | — | Rent vs market, surfacing on list/dashboard, inline refresh. |
| — | Error tracking (Sentry) | ✓ Done | — | Production error monitoring; set NEXT_PUBLIC_SENTRY_DSN in Vercel. |
| — | Dashboard single-property | ✓ Done | — | Property at a glance, metrics, Rent vs. Market auto-refresh. |
| **1** | Refinance / payoff insights | Medium–High | High | Actionable; builds on amortization logic. |
| **3** | Simulation page | High | High | Full modeling; extends scenario concept. |
| **4** | Report section (PDF) | Medium | Medium | Professional output; share with partners/lenders. |
| **5** | Automated testing | High | High | Quality foundation; plan per Module M. |

**Defer:** Rent gap email (cost scales), Referral system (validate first).

---

## Open tasks remaining

### Onboarding + Dashboard polish split (2026-03-18)

#### Batch 1 - Welcome modal visual overhaul (implement now)

- [x] Redesign onboarding welcome modal to a modern, premium card with stronger hierarchy.
- [x] Add concise value-forward content (benefit chips) without checklist-style language.
- [x] Polish CTA presentation: prominent primary action, clear secondary action, improved spacing/contrast.
- [x] Keep current onboarding behavior unchanged (`Add first property` -> `/properties/new`, `Maybe later` dismisses modal).
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Modal looks visually upgraded (elevated container, stronger typography, better spacing, cleaner CTA grouping).
- [x] Copy is activation-focused and non-blocking (no required-step/checklist framing).
- [x] Existing onboarding flow behavior remains exactly the same.
- [x] `npm run check` passes.

#### Batch 2 - Dashboard post-onboarding declutter (next)

- [x] Replace scattered action sections with one modern "Next actions" surface near the top of dashboard.
- [x] Remove duplicated action zones (`Advanced tools`, bottom `Quick actions`, and single-property duplicate links) and keep one clear hierarchy.
- [x] Keep Modeling and Mortgage highly discoverable via primary action buttons, with single-property contextual deep links.
- [x] Refine first-property return state into a cleaner success + next-step pattern with reduced above-the-fold competition.
- [x] Keep essential metric visibility while de-emphasizing non-primary CTAs and copy noise.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Dashboard has a single primary action area (no redundant top+bottom action clusters).
- [x] First-property users see success confirmation and clear next actions without stacked repetitive cards.
- [x] Users retain one-click access to Property, Modeling, Mortgage, Add property, and Analyze deal paths.
- [x] Visual hierarchy is cleaner: primary actions prominent, secondary actions quieter.
- [x] `npm run check` passes.

#### Batch 3 - Multi-property dashboard density + insights revamp (implement now)

- [x] Compact multi-property metric cards to reduce vertical height and improve scan speed.
- [x] Reorganize multi-property metrics into clearer hierarchy (primary row first, secondary row second).
- [x] Redesign `Rent vs. market` into a full insight card with stronger typography and per-property readability.
- [x] Convert multi-property stacked chart area into a tabbed chart workspace to reduce scroll depth.
- [x] Preserve existing calculations, benchmark refresh behavior, and chart data logic.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Multi-property dashboard shows denser metrics above the fold with visibly reduced card footprint.
- [x] Rent-vs-market no longer appears as orphaned tiny text; it has clear structure and readable hierarchy.
- [x] Users can switch between Equity, Debt vs Value, and Cash flow charts without long stacked scrolling.
- [x] All existing metric values, chart values, and refresh behavior remain functionally unchanged.
- [x] `npm run check` passes.

### Modeling workspace revamp (2026-03-18)

#### Batch A - Context bar + property selection prominence (implement now)

- [x] Replace current split header/layout with a single compact context bar that keeps active property visible.
- [x] Make property selection the primary control in the top area (clear label, high contrast, easy to find).
- [x] Demote utility links (`Open property projections`, `Open property detail`) to tertiary treatment within the same context bar.
- [x] Remove extra top-space card stack to reduce above-the-fold height before controls/charts.
- [x] Preserve all modeling calculations and selected-property behavior.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Active property is always obvious on the Modeling page without scrolling.
- [x] Users can switch properties from the top bar without hunting for the selector.
- [x] Utility links remain available but no longer dominate above-the-fold space.
- [x] Projections content starts higher on the page vs previous layout.
- [x] `npm run check` passes.

#### Batch B - Controls grouping + compact assumptions layout (next)

- [x] Reorganize simulation controls into clearer groups (horizon, growth, debt strategy, risk).
- [x] Reduce control section vertical footprint with tighter spacing and cleaner label hierarchy.
- [x] Keep presets prominent while de-emphasizing long helper copy.
- [x] Preserve all existing input behavior and calculations.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Controls are easier to scan and edit quickly.
- [x] Above-the-fold density improves without loss of functionality.
- [x] Existing modeling outputs remain mathematically unchanged.
- [x] `npm run check` passes.

#### Batch C - Desktop workspace density (next)

- [x] Improve desktop information density so controls and outputs coexist with less scrolling.
- [x] Keep mobile behavior practical and readable (no desktop-only assumptions).
- [x] Preserve advanced breakdown access while reducing layout interruptions.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Desktop view shows more actionable modeling context and output in one viewport.
- [x] Mobile layout remains usable without clipped controls/charts.
- [x] No functional regressions in scenario controls or chart rendering.
- [x] `npm run check` passes.

#### Batch D - Final visual polish + QA hardening (next)

- [x] Apply final typography/spacing polish for a cohesive modern workspace feel.
- [x] Verify visual hierarchy (context > assumptions > outcomes) across common viewport sizes.
- [x] Add desktop left-rail visual alignment treatment so controls column reads balanced against outcomes column.
- [x] Complete manual smoke checks for property switching and major modeling flows.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Modeling page feels visually consistent with upgraded onboarding/dashboard quality.
- [x] Left control rail appears intentionally aligned/balanced with right outcomes region on desktop.
- [x] No regressions in property selection, presets, controls, KPIs, or charts.
- [x] `npm run check` passes.

#### Batch E - Left rail usability and spacing refactor (implement now)

- [x] Widen desktop modeling workspace split so the controls rail has more usable width.
- [x] Flatten nested card density in the controls rail to reduce boxed-in visual clutter.
- [x] Improve section-level control composition (label/input rhythm, checkbox/input flow, reset placement).
- [x] Preserve all modeling formulas, state behavior, and chart outputs.
- [x] Keep mobile/tablet layout practical and readable.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Left rail no longer feels cramped at standard desktop widths.
- [x] Control labels/inputs avoid awkward wrapping at normal zoom levels.
- [x] Section structure remains clear while visually lighter and easier to scan.
- [x] No regressions in property selection, presets, controls, KPIs, or charts.
- [x] `npm run check` passes.

#### Batch F - Modeling canvas alignment lock (implement now)

- [x] Build a dedicated desktop canvas row that pairs Simulation Controls (left) and Graph card (right) in the same stretched grid row.
- [x] Ensure the bottom edge of the Simulation Controls card aligns with the bottom edge of the Graph card (excluding notes).
- [x] Make Advanced Breakdown always expanded in Modeling workspace and place it inside the Graph card to prevent layout jumps.
- [x] Keep baseline notes outside the aligned canvas row.
- [x] Preserve all modeling formulas, state behavior, and chart outputs.
- [x] Keep mobile/tablet layout readable and functional.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] On desktop, Simulation Controls card bottom and Graph card bottom remain aligned at normal zoom.
- [x] Advanced breakdown no longer causes graph/column misalignment when interacting.
- [x] Notes remain below the aligned cards and are excluded from alignment behavior.
- [x] No regressions in property selection, presets, controls, KPIs, or charts.
- [x] `npm run check` passes.

#### Batch G - Final modeling stability polish (implement now)

- [x] Fix Growth assumptions field alignment by normalizing label length and field rhythm across all three inputs.
- [x] Move Modeling tips below baseline inputs note.
- [x] Remove reinvest-toggle vertical jump by reserving stable space in controls and advanced breakdown content.
- [x] Preserve modeling formulas, state behavior, KPI values, and chart outputs.
- [x] Keep desktop card-bottom alignment behavior from Batch F.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Growth assumptions inputs remain visually aligned at normal desktop zoom.
- [x] Modeling tips render below baseline inputs note.
- [x] Clicking `Reinvest cash flow` no longer pushes the page/canvas down.
- [x] No regressions in property selection, presets, controls, KPIs, or charts.
- [x] `npm run check` passes.

#### Batch H - Reinvest copy compression polish (implement now)

- [x] Shorten reinvest assumption card label/value copy to prevent wrap-driven expansion.
- [x] Remove redundant reinvest percentage sentence from advanced breakdown card content.
- [x] Preserve advanced breakdown grid structure and stable section height behavior.
- [x] Preserve all formulas, state behavior, KPI values, and chart outputs.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Reinvestment assumption card no longer wraps into overly tall content at normal desktop zoom.
- [x] Advanced breakdown no longer visibly expands due to verbose reinvest text.
- [x] No regressions in property selection, presets, controls, KPIs, or charts.
- [x] `npm run check` passes.

#### Batch I - Canvas density and inline reinvest final micro polish (implement now)

- [x] Reduce modeled chart visual height on desktop so the canvas feels tighter and better balanced.
- [x] Keep controls/graph card bottom alignment behavior while reducing visible dead space under controls.
- [x] Make `Reinvest (%)` inline with `Reinvest cash flow` in Debt strategy without adding vertical height.
- [x] Preserve formulas, KPI/chart values, and interaction behavior.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Graph card appears less tall on desktop and overall canvas is more compact.
- [x] `Reinvest cash flow` and `Reinvest (%)` appear on one inline row.
- [x] No additional vertical jump is introduced when toggling reinvest.
- [x] No regressions in property selection, presets, controls, KPIs, or charts.
- [x] `npm run check` passes.

### Mortgage workspace revamp (2026-03-18)

#### Batch M1 - Context bar + top hierarchy (implement now)

- [x] Replace split mortgage header and context card with a single compact context bar.
- [x] Keep active property obvious at top and make property selector the primary control.
- [x] Demote utility links (`Open property mortgage tab`, `Edit mortgage details`) to tertiary inline links.
- [x] Reduce top vertical stack height before simulator content.
- [x] Preserve existing property selection and mortgage selection behavior.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Active mortgage property is obvious without scrolling.
- [x] Property switcher is easy to find and use from top bar.
- [x] Utility links are available but no longer visually dominant.
- [x] Simulator content starts higher vs previous layout.
- [x] `npm run check` passes.

#### Batch M2 - Simulator control composition + spacing (next)

- [x] Reorganize mortgage controls into cleaner groups with improved spacing rhythm.
- [x] Normalize label/input alignment for primary control rows.
- [x] Keep payoff and accelerator controls behavior unchanged.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Control panel is easier to scan at normal desktop zoom.
- [x] No awkward wrapping in key control rows.
- [x] Existing simulation outputs remain mathematically unchanged.
- [x] `npm run check` passes.

#### Batch M3 - Desktop aligned canvas for mortgage simulator (implement now)

- [x] Build dedicated desktop canvas row pairing controls (left) and outcomes/chart (right).
- [x] Align controls-card bottom and chart-card bottom (notes excluded).
- [x] Reduce chart visual height to improve balance and reduce scrolling.
- [x] Keep baseline notes outside aligned canvas row.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Controls and chart cards align at bottom on desktop.
- [x] Canvas appears denser with less dead space.
- [x] Notes are outside alignment target.
- [x] `npm run check` passes.

#### Batch M4 - Stability polish (no-jump interactions) (implement now)

- [x] Stabilize optional controls and breakdown sections to avoid vertical jumps.
- [x] Compress verbose copy in cards where wrapping inflates section height.
- [x] Preserve formulas, KPI values, and chart behavior.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Interaction toggles no longer cause noticeable canvas shifts.
- [x] Card content remains readable without excessive wrapping.
- [x] No regressions in mortgage selection, payoff simulation, or chart output.
- [x] `npm run check` passes.

#### Batch M5 - Final consistency polish + QA hardening (implement now)

- [x] Apply final typography/spacing polish to match Modeling and Dashboard quality.
- [x] Verify behavior across no-mortgage, single-mortgage, and multi-mortgage states.
- [x] Preserve deep-linking behavior (`propertyId`, `mortgageId`).
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Mortgage workspace feels visually consistent with Modeling polish quality.
- [x] Empty and edge states remain clear and actionable.
- [x] No regressions in property/mortgage switching, payoff outputs, or chart rendering.
- [x] `npm run check` passes.

#### Batch M6 - Controls visual facelift (implement now)

- [x] Increase spacing rhythm and section padding in Simulation controls for better visual hierarchy.
- [x] Recompose Mortgage and payment panel to improve readability of selected mortgage, extra principal, and base P&I.
- [x] Upgrade payoff target buttons with clearer hierarchy, stronger selected state, and consistent heights.
- [x] Allow slightly taller workspace controls area to reduce cramped feeling.
- [x] Preserve all payoff simulation logic and interaction behavior.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Controls panel feels less cramped and visually consistent with Modeling polish.
- [x] Primary control rows are easier to scan at normal desktop zoom.
- [x] Payoff target cards are legible, balanced, and clearly state selection.
- [x] No regressions in mortgage switching, payoff outputs, or chart rendering.
- [x] `npm run check` passes.

#### Batch M7 - Dense rail compression (implement now)

- [x] Flatten simulation controls layout by removing nested heavy card structure.
- [x] Convert controls header into compact toolbar with links + reset.
- [x] Recompose mortgage/payment controls into tighter rows with clearer visual hierarchy.
- [x] Convert payoff targets into compact chips and collapse to inline note when all targets are unavailable.
- [x] Reduce workspace controls min-height to improve chart-to-controls balance.
- [x] Preserve formulas, interactions, and deep-link behavior.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Simulation controls occupy noticeably less vertical space on desktop.
- [x] Controls are readable and scannable without stacked inner-card clutter.
- [x] Payoff targets fit compactly and remain clear/interactive.
- [x] No regressions in mortgage switching, payoff outputs, chart rendering, or URL sync.
- [x] `npm run check` passes.

#### Batch M8 - Balanced rail fill for empty-space polish (implement now)

- [x] Add compact scenario-outcome strip inside simulation controls to use remaining vertical space intentionally.
- [x] Add compact quick-assumptions row (rate, term, base P&I) to improve at-a-glance context.
- [x] Keep additions low-height and visually aligned with dense-rail design language.
- [x] Preserve all existing simulation formulas, interactions, and deep-link behavior.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Controls column no longer has obvious dead space under normal desktop viewport.
- [x] Added content is concise and useful (not filler), with readable hierarchy.
- [x] Row composition remains balanced against chart panel.
- [x] No regressions in mortgage switching, payoff outputs, chart rendering, or URL sync.
- [x] `npm run check` passes.

### Properties page overhaul (2026-03-18)

#### Batch P1 - Triage + hierarchy polish (implement now)

- [x] Replace standalone `Advanced tools` card with compact inline tools row in page header.
- [x] Add filter/sort chip bar for triage (`All`, `Needs attention`, `No mortgage`, `Stale benchmark`, `Negative cash flow`; sort by updated or worst cash flow).
- [x] Add lightweight insight tags on property cards (`No mortgage`, `Benchmark stale`, `Negative cash flow`) to improve scan speed.
- [x] Preserve existing calculations, benchmark refresh behavior, and deep links to Modeling/Mortgage/property detail.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Properties page presents one compact global tools row (no large standalone tools card).
- [x] Users can quickly focus the list by triage filters and sort mode.
- [x] Property cards surface actionable status tags without overwhelming card layout.
- [x] Existing metrics and benchmark refresh paths remain functionally unchanged.
- [x] `npm run check` passes.

#### Batch P2 - Card composition modernization (next)

- [x] Tighten property card composition into modern dense layout with clearer identity > metrics > actions hierarchy.
- [x] Promote one primary card action (`Open property`) while keeping Modeling/Mortgage as secondary links.
- [x] Normalize card spacing/typography rhythm to match Mortgage/Modeling quality level.
- [x] Add single-property mode behavior: hide filter/sort controls when exactly one property exists.
- [x] Add single-property compact workspace card treatment (not dashboard duplicate) with focused status + next actions.
- [x] Keep multi-property mode triage controls and card-list workflow unchanged in purpose.
- [x] Preserve benchmark behavior, metric values, and existing route paths.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Card layout is denser and easier to scan at normal desktop zoom.
- [x] Action hierarchy is clearer without reducing discoverability of advanced tools.
- [x] When `properties.length === 1`, filter/sort controls are hidden and single-property workspace treatment renders.
- [x] Single-property treatment does not replicate dashboard summary/charts; it remains properties-page specific.
- [x] When `properties.length > 1`, triage controls remain available and list behavior is preserved.
- [x] No regressions in metric values, benchmark state, or link behavior.
- [x] `npm run check` passes.

#### Batch P2.1 - Multi-property card height consistency polish (implement now)

- [x] Normalize multi-property card structure so all cards in a row keep consistent vertical rhythm.
- [x] Reserve stable space for status tags and benchmark row to avoid variable card heights.
- [x] Pin actions row to card bottom so primary/secondary actions align across cards.
- [x] Preserve all benchmark behavior, metric values, and action links.
- [x] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [x] Multi-property cards in the same row appear visually consistent in height.
- [x] Actions align horizontally across cards regardless of content variance.
- [x] No regressions in benchmark refresh behavior, metrics, or navigation.
- [x] `npm run check` passes.

### Onboarding scope correction (activation-first)

- [x] Replace checklist flow with modal-only onboarding (no persistent setup panel).
- [x] Keep `Modeling`, `Analyze deal`, and mortgage setup as optional discovery paths outside onboarding gating.
- [x] Ensure users without mortgages are not blocked by onboarding.
- [x] `Start setup` routes directly to `/properties/new`.
- [x] After creating the first property, route user back to dashboard with success context.
- [x] `Maybe later` dismisses modal and does not inject persistent onboarding UI.
- [x] Run `npm run check` and verify onboarding flow works with no regressions.

Acceptance criteria:
- [x] No checklist UI renders in app layout after modal interaction.
- [x] Users can complete core onboarding by adding first property only.
- [x] Optional tools remain discoverable via nav and dashboard/properties entry points.
- [x] First property creation from onboarding flow lands on dashboard.
- [x] Existing property creation behavior remains unchanged for non-first properties.

---

## Recently completed (2026-03)

**Projections tab — accuracy hardening:** Replaced fixed annual debt service with simulated month-level debt service that drops after payoff; aligned projection math with ownership display mode; added reinvest UX guidance for non-positive cash flow; baseline delta comparisons now use ownership-aware math and sale-analysis context when enabled. Exploration completed using existing payoff/effective-balance patterns in `lib/amortization.ts` and current call sites across property/dashboard/API routes. `npm run check` passed.

AC status:
- [x] AC-1..AC-5 (projected debt service by year, payoff-aware, reused amortization patterns, assumptions copy updated)
- [x] AC-6..AC-8 (ownership-mode-aware cash flow/equity/value/debt projections and baseline deltas)
- [x] AC-9..AC-11 (reinvest positive-cashflow guidance, non-positive hold-year messaging, primary-outcome visibility)
- [x] AC-12..AC-13 (`npm run check` passed; negative/positive behavior represented by conditional UI and formula guards)

**Property detail — Tabs & UX refinements (full proposal):** Four tabs (Overview | Mortgage | Projections | Details); refresh benchmark conditional; no duplicate metrics; combined mortgage view; Projections with live chart. All AC-1 through AC-28 passed. Proposal: `docs/property-detail-tabs-proposal.md`. Test steps below.

**Property detail overhaul — Phase 2 (Polish):** Sticky section nav (Overview | Property details | Mortgages | Amortization); Jump to dropdown on mobile; Edit property in hero and Property details header; scroll-margin-top for sections. Proposal: `docs/property-detail-overhaul-proposal.md` §7.

**Property detail overhaul — Phase 3 (Optional enhancements):** Amortization sub-page at `/properties/[id]/amortization`; "View amortization schedule →" link on detail page; Quick actions row (Edit property | Add mortgage | Refresh benchmark). Proposal: `docs/property-detail-overhaul-proposal.md` §7.

**Property detail page overhaul — Phase 1:** Hero (Value, Equity, Cash flow, Rent vs. market); Investment metrics always visible (no Show more); Scenario expanded by default; PayoffCard extracted; Property details, Mortgages, Amortization collapsible. Proposal: `docs/property-detail-overhaul-proposal.md`.

**Test steps — Property detail overhaul:** See below.

---

**Multi-property Rent vs. Market — auto-refresh:** Show all properties; background refresh for stale/missing; "Unable to refresh" on failure. Proposal: `docs/benchmarking-proposal.md`.

**Single-property dashboard — restore metrics:** Cap rate, LTV, NOI, Cash-on-cash, Annual rent, DSCR in Property at a glance; DSCR color; Rent vs. market col-span; teaser link "See amortization, scenarios & more →".

---

## Archived — Dashboard overhaul (detailed history)

See `docs/tasks-archived.md` for full task lists. Summary: dashboard-single-property-proposal.md; inline value bar; hide Equity/Cash flow for single; fix Cash flow chart; consolidate add-property; Rent vs. Market auto-refresh.

---

---

## Property detail overhaul — Test steps

Run these after Phase 1 implementation to validate the new view.

### Hero & layout
- [ ] **Hero at top:** Property detail page opens with Hero card first (Value, Equity, Cash flow, Rent vs. market).
- [ ] **Sticky section nav:** Appears when scrolling past hero; links (Overview, Property details, Mortgages, Amortization) scroll to correct sections; mobile shows "Jump to" dropdown.
- [ ] **Edit link:** "Edit property" link visible in hero; navigates to edit page.
- [ ] **Rent vs. market:** Shows benchmark label when fresh, or "Refresh estimate" when stale/missing.
- [ ] **Section order:** Hero → Quick actions → Investment metrics → Scenario → Payoff → Property details → Mortgages → Amortization link.

### Investment metrics
- [ ] **All visible:** Monthly cash flow, Annual cash flow, Equity, Cap rate, LTV, Cash-on-cash, DSCR, Annual rent all shown (no "Show more").
- [ ] **Cash flow color:** Positive = green, negative = red.
- [ ] **DSCR color:** Green when ≥ 1, red when < 1 (if displayed).

### Scenario
- [ ] **Expanded by default:** Scenario section is open on load (sliders visible).
- [ ] **Sliders work:** Rent %, Value %, Mortgage % sliders change recalculated metrics.
- [ ] **Reset:** Reset button clears overrides.
- [ ] **How is this calculated?:** Details/summary expands.

### Payoff card
- [ ] **Payoff insight:** "Pay off in X years" or "About $X remaining at term" per mortgage.
- [ ] **Accelerator:** Years-earlier buttons (5, 10, 15) and extra payment input work.
- [ ] **Balance source:** "Based on stored balance" or "Using projected balance" shown.
- [ ] **No mortgages:** PayoffCard shows appropriate empty state or "Add a mortgage to see payoff timeline."

### Collapsible sections
- [ ] **Property details:** Collapsed by default. Expand to see type, purchase, value, rent, expenses, benchmark, notes. "Edit property" in header.
- [ ] **Mortgages:** When 0 mortgages — expanded, "Add mortgage" visible. When 1+ — collapsed with summary "N mortgages, $X total balance". Expand to see list, Add/Edit/Delete.
- [ ] **Amortization:** Replaced with "View amortization schedule →" link to sub-page. Sub-page shows chart and note "Original mortgage terms. Not affected by scenario."

### No regressions
- [ ] **Edit:** Edit property works from hero and property details header.
- [ ] **Delete:** PropertyActions (Delete) still works.
- [ ] **Add mortgage:** Add mortgage flow works when Mortgages expanded.
- [ ] **Edit/delete mortgage:** Edit and delete mortgage work.
- [ ] **Amortization:** "View amortization schedule →" link navigates to sub-page; chart renders; tooltip works.
- [ ] **Benchmark refresh:** Refresh estimate updates Rent vs. market in hero.

### Mobile
- [ ] **Metrics stack:** Hero and Investment metrics stack vertically on narrow viewport.
- [ ] **Collapsible:** Sections expand/collapse; no horizontal scroll.
- [ ] **Touch targets:** Buttons and links adequately sized.

### Edge cases
- [ ] **No mortgages:** Page loads; PayoffCard handles empty; Mortgages section expanded with Add CTA.
- [ ] **Paid-off mortgage:** PayoffCard shows "This mortgage is paid off" or equivalent.
- [ ] **Multiple mortgages:** PayoffCard shows per-mortgage; Mortgages collapsed with count.

### Phase 2 — Sticky section nav
- [ ] **Nav appears:** Sticky nav shows when scrolling past hero.
- [ ] **Links work:** Overview | Property details | Mortgages | Amortization scroll to correct sections.
- [ ] **Mobile:** "Jump to" dropdown on narrow viewport.
- [ ] **Scroll margin:** Section headings visible (not hidden under nav).

### Phase 3 — Amortization sub-page & Quick actions
- [ ] **Amortization link:** "View amortization schedule →" replaces collapsible; links to `/properties/[id]/amortization`.
- [ ] **Amortization page:** Sub-page shows chart, "Original mortgage terms" note, back link to property.
- [ ] **Quick actions:** Edit property | Add mortgage | Refresh benchmark row below hero.
- [ ] **Edit property:** Navigates to edit page.
- [ ] **Add mortgage:** Scrolls to Mortgages section and expands (or links appropriately).
- [ ] **Refresh benchmark:** Triggers refresh; shows loading; updates hero Rent vs. market on success.

---

## Property detail — Tabs & UX refinements — Test steps

Run after builder completes. Reference: `docs/property-detail-tabs-proposal.md` §9.

### Refresh benchmark (AC-1 to AC-4)
- [ ] Fresh benchmark: No "Refresh benchmark" in quick actions.
- [ ] Stale/missing: "Refresh benchmark" visible; click → spinner, disabled; success → disappears.
- [ ] Failure: Re-enables for retry.

### Duplicate metrics (AC-5, AC-6)
- [ ] Hero: Value, Equity, Cash flow, Rent vs. market, DSCR.
- [ ] Investment metrics: Cap rate, LTV, NOI, Cash-on-cash, Annual rent only (no Equity, cash flow, DSCR).

### Tabs (AC-7 to AC-9)
- [ ] Tab nav: Overview | Mortgage | Projections | Details.
- [ ] Default: Overview on load.
- [ ] Mobile: Tabs scroll or dropdown.

### Overview tab (AC-10 to AC-13)
- [ ] Hero, quick actions, investment metrics in order.
- [ ] "Model scenarios →" links to Projections tab.

### Mortgage tab (AC-14 to AC-17)
- [ ] Combined payoff + amortization (not stacked sections).
- [ ] Compact context; "View mortgage details" → Details tab.
- [ ] No full mortgage list in Mortgage tab.

### Projections tab (AC-18 to AC-22)
- [ ] Sliders work; live chart updates.
- [ ] Reset; compare-to-baseline (if implemented).

### Details tab (AC-23 to AC-25)
- [ ] Property details + full mortgage list + Edit property.

### No regressions (AC-26 to AC-28)
- [ ] Edit/Delete property, Add/Edit/Delete mortgage, benchmark refresh work.
- [ ] `npm run check` passes.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*

## Details tab — Phase B inline editing

- [x] Add inline edit mode to `Property facts` card with Save/Cancel actions.
- [x] Add inline edit mode to `Financial inputs` card with Save/Cancel actions.
- [x] Add inline edit mode to `Notes` card with Save/Cancel actions.
- [x] Wire inline section saves to `PATCH /api/properties/[id]` and refresh tab data on success.
- [x] Show in-card validation/save errors when updates fail.
- [x] Preserve existing `Edit property` full-page flow for advanced edits.
- [x] Run `npm run check` and verify no regressions from Phase B.
