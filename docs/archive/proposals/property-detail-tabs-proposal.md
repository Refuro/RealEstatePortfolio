# Property Detail — Tabs & UX Refinements Proposal

**ARCHIVED:** Implemented.  
**Status:** Proposal (reference for building)  
**Last updated:** March 2026  
**References:** `docs/property-detail-overhaul-proposal.md`, `docs/refinance-payoff-proposal.md`

---

## 1. Overview

This document captures UX refinements and a tab-based restructure for the property detail page. It consolidates feedback and design decisions for implementation.

**Summary:** Four tabs — Overview (hero + metrics), Mortgage (tools first, details on demand), Projections (elevated scenario with live chart), Details (property + mortgage reference data). Refresh benchmark conditional; no duplicate metrics. Future: Projections may move to Simulation sidebar.

### 1.1 Definitions

| Term | Definition |
|------|-------------|
| **Stale (benchmark)** | `marketRent` is null, OR `marketRent` ≤ 0, OR `!isBenchmarkFresh(marketRentAsOf)`. Use `lib/benchmark-utils.ts` `isBenchmarkFresh` (60-day window). |
| **Hero** | Property at a glance block: Value, Equity, Cash flow, Rent vs. market, DSCR. |
| **Investment metrics** | Cap rate, LTV, NOI, Cash-on-cash, Annual rent. |
| **Quick actions** | Row of links: Edit property \| Add mortgage \| Refresh benchmark (when stale). |
| **Combined mortgage view** | Payoff insight + accelerator + amortization chart integrated into one cohesive layout; not three stacked sections. |

---

## 2. Refresh Benchmark Behavior

### 2.1 Recommendation: Conditional visibility

**Show the "Refresh benchmark" action only when there's something to do.**

| State | Behavior |
|-------|----------|
| **Fresh estimate** | No button. Hero shows "Rent vs. market: $X" with a "fresh" label. Nothing to click. |
| **Stale estimate** | Show "Refresh estimate" in hero and/or quick actions. |
| **Missing estimate** | Show "Get estimate" or "Refresh estimate" as the CTA. |

**During refresh:** Disable the button and show a spinner. On success, it disappears (or stays hidden until next stale). On failure, re-enable so the user can retry.

**Quick actions row:** Always show "Edit property | Add mortgage". Show "Refresh benchmark" only when estimate is stale or missing.

### 2.2 Rationale

- Reduces cognitive load — no permanent "Refresh" when nothing needs refreshing.
- Aligns with progressive disclosure — action appears when relevant.
- Avoids double-click confusion — disabled + spinner during refresh.

---

## 3. Duplicate Metrics (Hero vs Investment Metrics)

### 3.1 Recommendation: Remove duplicates from Investment Metrics

**Hero owns the headline numbers.** Investment metrics becomes the complementary view.

| Hero (keep) | Investment Metrics (keep) | Remove from Investment Metrics |
|-------------|---------------------------|--------------------------------|
| Value | Cap rate | Equity |
| Equity | LTV | Monthly / Annual cash flow |
| Cash flow | NOI | DSCR |
| Rent vs. market | Cash-on-cash | |
| DSCR | Annual rent | |

**Result:** Hero = "at a glance" summary. Investment metrics = ratios and income metrics only. No duplication.

---

## 4. Tab-Based Layout

### 4.1 Tab structure

| Tab | Purpose | Contents |
|-----|---------|----------|
| **Overview** | Landing view — "How's this property doing?" | Hero (Value, Equity, Cash flow, Rent vs. market, DSCR) → Quick actions → Investment metrics grid (no duplicates). Optional "Model scenarios →" link to Projections. |
| **Mortgage** | Tools for debt and payoff | Combined mortgage view — payoff + amortization front and center. Minimal context (e.g. "Mortgage 1: $X balance at Y%"). Full mortgage details on demand → Details tab. See §5. |
| **Projections** | What-if modeling | Sliders + live chart + easy improvements. See §6. Future: may move to Simulation sidebar. |
| **Details** | Property and mortgage reference data | Property details (address, beds, baths, etc.) + full mortgage list (terms, edit, add, delete). Edit property. See §7. |

### 4.2 Navigation

- Tabs as primary nav: Overview | Mortgage | Projections | Details
- On mobile: horizontal tab bar or "Jump to" dropdown
- Sticky section nav (from Phase 2) can be retired in favor of tabs

### 4.3 Future: Simulation sidebar

Projections may later move out of the property detail page into a dedicated **Simulation** sidebar/section. For now, Projections lives as a tab within the property detail page.

---

## 5. Mortgage Tab — Combined Element (Not Stacked)

### 5.1 Design intent

**The Mortgage tab should be a single, integrated experience — not the current elements (mortgage list, payoff card, amortization) stacked vertically.**

Today we have:
- Mortgage list (balance, rate, term, payment)
- PayoffCard (payoff insight + accelerator per mortgage)
- Amortization chart/schedule

These should be **combined into one cohesive "Mortgage View"** rather than three separate sections.

### 5.2 Combined Mortgage View — Design direction

**Core idea:** The amortization timeline is the backbone. Mortgage data and payoff insights are integrated around it.

**Possible approaches:**

1. **Chart-centric layout**
   - Main content: amortization chart (principal over time)
   - Mortgage selector/summary at top (if multiple) or inline
   - Payoff insights alongside or below the chart — e.g. "Pay off 5 years earlier" could show a marker on the timeline, or the extra-payment input updates the chart in real time
   - Single scroll within the tab; no artificial section breaks

2. **Split layout**
   - Left: mortgage cards (compact) + payoff accelerator inputs
   - Right: amortization chart that reflects the selected mortgage and any extra-payment scenario
   - Payoff insight ("Pay off in X years") integrated into the mortgage card or chart header

3. **Timeline-first**
   - One unified timeline: principal balance over time
   - Hover/click on a point → see payoff date, remaining balance
   - "What if I paid $X extra?" → chart redraws with new payoff date
   - Mortgage terms (rate, payment) in a compact summary above or beside

**Key principle:** Payoff and amortization should feel like one tool, not two. The user is answering "When do I pay this off, and what if I accelerated?" — the chart and payoff inputs should work together.

### 5.3 Tools first, details on demand

**Mortgage details should not be in your face.** Users typically know their mortgage terms. The main use of the Mortgage tab is the tools (payoff, amortization).

**Layout:**
- **Primary:** Payoff insight + accelerator + amortization chart — front and center.
- **Context:** Compact summary at top (e.g. "Mortgage 1: $X balance at Y%" or "2 mortgages, $X total") — enough to orient, not a data dump.
- **Details:** "View mortgage details" or "Show full terms" — expands inline or links to Details tab.

**Full mortgage details live in the Details tab** alongside property details. Mortgage tab = tools. Details tab = raw data (property + mortgages). No duplication of tools; reference data lives in one place.

### 5.4 What to avoid

- Three separate cards/sections stacked: Mortgages → Payoff → Amortization
- Mortgage details (balance, rate, lender, term) shoved in the user's face
- Amortization as a "link to sub-page" that feels disconnected from payoff
- Payoff accelerator that doesn't visually connect to the amortization chart

---

## 6. Projections Tab (elevated from Scenario)

### 6.1 Purpose

"What happens if…?" — First-class modeling tool, not a random addition. Framed as: "Model your investment over time."

### 6.2 Content (for now)

- Sliders: Rent %, Value %, Mortgage %
- **Live chart** that updates as sliders move — e.g. equity over time, cash flow over time
- Recalculated metrics inline
- Reset to baseline
- Easy improvements: compare-to-baseline mode, sensitivity hints

### 6.3 Future enhancements

- Tornado chart, exit-year analysis, sale price scenarios
- More assumption controls

### 6.4 Layout

- Sliders on left (or top on mobile)
- Chart on right (or below)
- Metrics update in real time as user adjusts

### 6.5 Future: Simulation sidebar

Projections may later move from the property detail page into a dedicated **Simulation** sidebar/section. For now, it lives as a tab within the property.

---

## 7. Details Tab — Property + Mortgage Details

### 7.1 Recommendation: Details = Property + full mortgage list

**Details tab:** All reference data in one place.
- **Property:** Address, type, beds, baths, sqft, year built, purchase date, ownership %, vacancy %, notes
- **Mortgages:** Full mortgage list with terms (balance, rate, term, payment, lender, loan type), Add / Edit / Delete
- Edit property link

**Mortgage tab:** Tools only (payoff + amortization) + minimal context. "View mortgage details" links to Details tab.

### 7.2 Rationale

- **Mortgage tab = tools.** Users come for payoff and amortization. They don't need to see full loan terms unless they're editing or verifying.
- **Details tab = reference.** Property details + mortgage details. One place for "show me the raw data" or "I need to edit something."
- **No duplication.** Mortgage list appears once (Details). Mortgage tab has tools + compact summary.

---

## 8. Implementation checklist (reference)

When building, reference this order:

1. **Refresh benchmark:** Conditional visibility; disable + spinner during refresh.
2. **Duplicate metrics:** Remove Equity, cash flow, DSCR from Investment metrics section.
3. **Tab shell:** Add tab nav (Overview | Mortgage | Projections | Details); route content into tabs.
4. **Overview tab:** Hero + quick actions + investment metrics (no duplicates). Optional "Model scenarios →" link.
5. **Mortgage tab:** Combined mortgage view — tools first (payoff + amortization), minimal context, "View mortgage details" → Details.
6. **Projections tab:** Sliders + live chart + easy improvements (reset, compare-to-baseline).
7. **Details tab:** Property details + full mortgage list (terms, add/edit/delete) + Edit property.

---

## 9. Acceptance criteria (must pass)

### 9.1 Refresh benchmark
- [x] **AC-1:** "Refresh benchmark" / "Refresh estimate" appears only when `marketRent` is null OR `marketRentAsOf` is stale (per existing staleness logic).
- [x] **AC-2:** When visible, clicking triggers refresh; button shows spinner and is disabled until request completes.
- [x] **AC-3:** On success: button disappears (or stays hidden until next stale). On failure: button re-enables so user can retry.
- [x] **AC-4:** Quick actions row always shows "Edit property | Add mortgage"; "Refresh benchmark" only when AC-1 applies.

### 9.2 Duplicate metrics
- [x] **AC-5:** Hero shows: Value, Equity, Cash flow, Rent vs. market, DSCR.
- [x] **AC-6:** Investment metrics section shows ONLY: Cap rate, LTV, NOI, Cash-on-cash, Annual rent. No Equity, no Monthly/Annual cash flow, no DSCR.

### 9.3 Tab structure
- [x] **AC-7:** Tab nav displays: Overview | Mortgage | Projections | Details. Tabs switch content; URL may use query (e.g. `?tab=mortgage`) or hash.
- [x] **AC-8:** Default tab is Overview when landing on property page.
- [x] **AC-9:** Mobile: tabs scroll horizontally or collapse to "Jump to" dropdown.

### 9.4 Overview tab
- [x] **AC-10:** Hero (Value, Equity, Cash flow, Rent vs. market, DSCR) at top.
- [x] **AC-11:** Quick actions row below hero: Edit property | Add mortgage | Refresh benchmark (when stale/missing).
- [x] **AC-12:** Investment metrics grid (Cap rate, LTV, NOI, Cash-on-cash, Annual rent).
- [x] **AC-13:** Optional "Model scenarios →" link that switches to Projections tab.

### 9.5 Mortgage tab
- [x] **AC-14:** Primary content: payoff insight + accelerator + amortization chart combined into one integrated view (not three stacked sections).
- [x] **AC-15:** Compact context at top: e.g. "Mortgage 1: $X balance at Y%" or "2 mortgages, $X total" — no full loan terms.
- [x] **AC-16:** "View mortgage details" link/button that navigates to Details tab (or scrolls to mortgage section if same page).
- [x] **AC-17:** No separate mortgage list with full terms in Mortgage tab. Full mortgage list lives in Details tab.

### 9.6 Projections tab
- [x] **AC-18:** Sliders: Rent %, Value %, Mortgage % (existing scenario sliders).
- [x] **AC-19:** Live chart that updates as sliders move — e.g. equity over time or cash flow over time.
- [x] **AC-20:** Recalculated metrics displayed inline; update in real time.
- [x] **AC-21:** "Reset to baseline" button.
- [x] **AC-22:** Compare-to-baseline mode (optional, easy add): show "vs. current" when sliders differ from 0%.

### 9.7 Details tab
- [x] **AC-23:** Property details: address, type, beds, baths, sqft, year built, purchase date, ownership %, vacancy %, notes. (Note: sqft and year built not in schema; shown fields per available data.)
- [x] **AC-24:** Full mortgage list: balance, rate, term, payment, lender, loan type per mortgage; Add / Edit / Delete actions.
- [x] **AC-25:** "Edit property" link.

### 9.8 No regressions
- [x] **AC-26:** Edit property, Delete property, Add mortgage, Edit mortgage, Delete mortgage all work.
- [x] **AC-27:** Benchmark refresh (when shown) updates Rent vs. market in hero.
- [x] **AC-28:** `npm run check` passes (TypeScript, lint).

---

## 10. References

- `docs/property-detail-overhaul-proposal.md` — Original structure, Phase 1–3
- `docs/refinance-payoff-proposal.md` — Payoff logic, accelerator
- `app/(app)/properties/[id]/payoff-card.tsx` — Current PayoffCard
- `app/(app)/properties/mortgage-section.tsx` — Current mortgage list
