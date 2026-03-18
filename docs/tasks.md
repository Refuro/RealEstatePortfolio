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

*None.*

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
