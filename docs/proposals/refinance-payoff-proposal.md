# Refinance / Payoff Insights Proposal

**Status:** Proposal  
**Last updated:** March 2026

---

## 1. Overview

Add payoff timeline and (later) refinance insights to help users understand when they'll pay off their mortgage and whether refinancing makes sense. Placement: property detail page, in the mortgage section. Phased rollout: payoff first (no new inputs), then payoff accelerator, then refinance "what if."

---

## 2. Placement: Property Detail Page, Mortgage Section

**Rationale:**
- Context is right there — user is viewing the mortgage
- Calculations are per-mortgage; property detail is the natural home
- No new navigation or tabs
- Single-property users reach it via dashboard → property; multi-property users drill in from list

**Concern:** The property detail page is stacking a lot of information. Many users may not discover these tools. See [§7 Property Detail Page Overhaul](#7-property-detail-page-overhaul) for thoughts on addressing this.

---

## 3. Content

### 3.1 Payoff Timeline (Phase 1 — primary)

**Copy:** "At your current payment, you'll pay off this mortgage in **X years** (around **Month Year**)."

**Logic:** Project forward from **today's effective balance** (not from the original schedule). Start with `getEffectiveBalance(mortgage)` as the current balance. Use `getPiForAmortization(mortgage)` for P&I, `Number(mortgage.interestRate)/12` for monthly rate. Iterate month-by-month (match `generateAmortizationSchedule` logic): `interest = balance * monthlyRate`; `principal = payment - interest`; if `principal >= balance` then `principal = balance`; `balance = max(0, balance - principal)`. Stop when balance ≤ 0 (payoff) or when reaching end of original term (remaining at term end). Cap iterations at `remainingMonths = max(0, termYears*12 - monthsSinceStartDate)`.

**Why not use the existing schedule?** The schedule is built from `originalLoanAmount` and `startDate`. If the user has a stored balance that differs (e.g. extra payments), the schedule's payoff date would be wrong. We must project from `getEffectiveBalance` (today) forward.

**Edge cases:**
- If payment doesn't fully amortize: Iterate until end of original term. "At your current payment, you'll have about **$X** remaining at the end of the term."
- If balance is projected: "Using projected balance from amortization."
- If stored balance: "Based on stored balance as of [date]."
- Empty/invalid inputs (balance ≤ 0, payment ≤ 0): Don't show payoff; or show "Add mortgage details to see payoff timeline."
- Property with no mortgages: No payoff section.

**Assumptions:** Uses `getEffectiveBalance`, `getBalanceSource`, `getPiForAmortization`. No new inputs.

**New lib function:** Add `getPayoffProjection(mortgage: MortgageRecord): { payoffDate: Date | null; remainingAtTermEnd: number | null }`. Returns payoff date when payment fully amortizes; else returns remaining balance at term end.

**Multiple mortgages:** Each mortgage gets its own payoff insight. Property with 2 mortgages shows 2 payoff lines.

**Out of scope (Phase 1):** `paymentEffectiveDate` — assume current payment applies throughout. Future payment changes not modeled.

**Interest rate:** Stored as decimal (e.g. 0.065 for 6.5%). Use `Number(mortgage.interestRate)` directly for `monthlyRate = rate / 12`. No conversion needed.

**Iteration cap:** When payment doesn't fully amortize, cap iteration at original term end: `startDate + termYears * 12` months. Do not iterate indefinitely.

**Already paid off:** If `getEffectiveBalance` returns 0, show "This mortgage is paid off" or omit payoff line.

**Rounding:** "X years" — round to nearest whole. "Month Year" — use exact payoff month. "$X remaining" — round to nearest dollar.

---

### 3.2 Payoff Accelerator (Phase 2 — optional)

**Copy:** "Add **$X/month** to pay off **Y years** earlier."

**Logic:** User selects target "years earlier" (e.g. 5). Target payoff = current payoff date minus Y years. Solve for extra monthly payment: binary search or formula such that `balance` (starting from `getEffectiveBalance`) reaches 0 in `(currentPayoffMonths - Y*12)` months with payment = base P&I + extra.

**Input:** "Years earlier" selector (e.g. 5, 10, 15) or optional "Extra monthly payment" input (then show "Pay off in X years").

---

### 3.3 Refinance "What If" (Phase 3 — optional)

**Copy:** "If you refinanced to **X%** with **$Y** closing costs, you'd save about **$Z** over the remaining term. Break-even in **N** months."

**Logic:**
- Current loan: remaining balance (`getEffectiveBalance`), current rate, remaining months to payoff (from Phase 1).
- New loan: same balance, new rate (user input), new term (e.g. 30 years or match remaining — user choice). Compute new monthly payment via standard amortization formula.
- Monthly savings = current P&I − new P&I.
- Total savings = monthly savings × remaining months (capped at new loan term).
- Break-even months = closing costs ÷ monthly savings (if savings > 0).

**Inputs:** New rate (user), closing costs (user), optionally new term. Optional: link to current market rate (e.g. Freddie Mac).

---

## 4. Phased Rollout

| Phase | Scope | Effort | Risk | New inputs |
|-------|-------|--------|------|------------|
| **1** | Payoff timeline only | Low–medium | Low | None |
| **2** | Payoff accelerator | Medium | Low | Years-earlier selector |
| **3** | Refinance what-if | Medium–high | Medium | New rate, closing costs |

**Recommendation:** Implement Phase 1 first. Add Phase 2 and 3 based on feedback.

---

## 5. Handling Manual Input

**Disclaimer (recommended):** Add a subtle disclaimer near payoff/refinance insights: "Estimates are for informational purposes only. Not financial or investment advice." Or in app footer/terms. Reduces liability if projections differ from reality. Applies to all users (free and paid) — the product has memberships, so projections should be clearly non-advisory.

**Principles:**
1. **Show assumptions** — "Based on your mortgage terms (balance as of [date], rate, payment)."
2. **Source of balance** — "Using stored balance" vs "Using projected balance from amortization."
3. **Avoid overconfidence** — "Estimated payoff" / "Projected payoff," not "Guaranteed."
4. **Stale data** — If `balanceAsOfDate` is old or missing, keep existing nudge: "Review your mortgage balance for accurate projections."
5. **Edge cases** — If payment doesn't fully amortize, state that clearly.

**Implementation:** Use `getEffectiveBalance` and `getBalanceSource` for all calculations. Display `balanceSource` in the insight copy.

---

## 6. UI Sketch (Phase 1)

**In mortgage section, per mortgage:**

```
┌─────────────────────────────────────────────────────────┐
│ Mortgage 1 — ABC Bank                                    │
│ Balance: $245,000 (as of 2025-01-15)                     │
│ Rate: 6.5% · Term: 30 years · Payment: $1,850           │
│                                                          │
│ Payoff: At your current payment, you'll pay off in      │
│ ~18 years (around March 2043).                           │
│ Based on stored balance.                                 │
└─────────────────────────────────────────────────────────┘
```

**If payment doesn't fully amortize:**

```
│ Payoff: At your current payment, you'll have about       │
│ $230,000 remaining at the end of the term.               │
│ Consider increasing your payment to fully amortize.       │
```

---

## 7. Property Detail Page Overhaul

### 7.1 The Problem

The property detail page has become a catch-all:
- Property details (type, purchase, value, rent, expenses, benchmark, notes)
- Mortgages (balance, rate, term, payment, payoff insight)
- Property metrics (equity, LTV, cash flow, cap rate, etc.)
- Scenario modeling (adjust rent/value/expenses, see impact)
- Amortization chart

Adding payoff insights (and later refinance) stacks more into the mortgage area. Users who skim or don't scroll may never see these tools. The page risks feeling dense and overwhelming rather than user-centric.

### 7.2 Overhaul Direction

**Goal:** Make the property detail page a clear, scannable "home base" for a property — with tools that are discoverable, not buried.

**Options to consider:**

| Approach | Description | Pros | Cons |
|----------|-------------|------|------|
| **Tabbed layout** | Overview \| Mortgages \| Scenarios \| Insights | Clear separation; each tab focused | Extra click to reach content; some users never explore tabs |
| **Collapsible sections** | Sections expand/collapse; default "Overview" expanded | Reduces scroll; user controls depth | Hidden content may be forgotten |
| **Card-based dashboard** | Property at a glance + cards for Metrics, Mortgages, Scenarios, Insights | Scannable; cards invite exploration | More layout work; mobile considerations |
| **Progressive disclosure** | Top: key metrics + "See payoff" / "Explore refinance" CTAs; expand on click | Surfaces value; doesn't overwhelm | Requires thoughtful defaults |
| **Sidebar nav** | Sticky nav: Overview, Mortgages, Scenarios, etc. | Easy jump to section | Adds UI chrome; may feel heavy on mobile |

**Recommendation:** A **card-based layout with clear section headers** is a good first step. Each major area (Property details, Mortgages & payoff, Metrics, Scenarios, Amortization) is a distinct card. Add a short "What you can do here" or section intros so users know tools exist. Avoid tabs for now — they hide content. Collapsible sections could work if the default state shows the most valuable content (e.g. payoff insight visible, scenario collapsed until user wants it).

**Timing:** The payoff insight (Phase 1) can ship without an overhaul — it's a small addition to the mortgage section. Plan the property detail overhaul as a separate initiative. When we do it, payoff/refinance insights become first-class in the "Mortgages & payoff" card rather than buried.

### 7.3 Short-Term Mitigation

Until an overhaul:
- Add a brief intro or subheading in the mortgage section: e.g. "Mortgages & payoff" so "payoff" signals there's insight there.
- Keep the payoff copy concise and scannable.
- Consider a small "Insights" or "Tools" callout near the top that links to key sections (e.g. "View payoff timeline" → scrolls to mortgage section).

---

## 8. Phase 1 Acceptance Criteria

- [x] Add `getPayoffProjection(mortgage)` to `lib/amortization.ts` — projects from effective balance, returns payoff date or remaining at term end.
- [x] Mortgage section shows payoff insight per mortgage: "At your current payment, you'll pay off in X years (Month Year)" or "you'll have about $X remaining at the end of the term."
- [x] Display `balanceSource` in copy: "Based on stored balance as of [date]" or "Using projected balance from amortization."
- [x] Section heading updated to "Mortgages & payoff" (or equivalent) to signal insight.
- [x] Property with no mortgages: no payoff section (or "Add a mortgage to see payoff timeline" if section exists).
- [x] Invalid/empty mortgage data: graceful handling (no crash, no misleading output).
- [x] Balance = 0 (paid off): show "Paid off" or omit; no "pay off in 0 years."
- [x] Consider disclaimer: "Estimates for informational purposes only. Not financial advice."
- [x] `npm run check` passes.

---

## 9. Summary

| Decision | Recommendation |
|----------|----------------|
| **Placement** | Property detail page, mortgage section |
| **Phase 1** | Payoff timeline only |
| **Algorithm** | Project from `getEffectiveBalance` (today), not from original schedule |
| **New lib** | `getPayoffProjection(mortgage)` |
| **New inputs** | None for Phase 1 |
| **Transparency** | "Based on your mortgage terms (balance as of [date], rate, payment)" |
| **Property detail** | Plan overhaul as separate initiative; use short-term mitigations until then |

---

## 10. References

- `lib/amortization.ts` — `getEffectiveBalance`, `getBalanceSource`, `getProjectedBalanceAsOf`, `getPiForAmortization`, `generateAmortizationSchedule`
- `app/(app)/properties/[id]/page.tsx` — Property detail layout, passes mortgages to MortgageSection
- `app/(app)/properties/mortgage-section.tsx` — Mortgage display; payoff insight will be added here
