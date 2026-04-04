---
title: "feat: Add Refinance & Payoff Insights (Phase 3 — Refinance What-If)"
type: feat
status: active
date: 2026-04-04
origin: docs/proposals/refinance-payoff-proposal.md
---

# feat: Add Refinance & Payoff Insights (Phase 3 — Refinance What-If)

## Overview

Phases 1 (payoff timeline) and 2 (payoff accelerator) from the refinance-payoff proposal are already
shipped. The `payoff-card.tsx` component — already headed "Payoff & refinance" — implements payoff
projection, years-earlier acceleration buttons, and extra-payment input. All underlying lib functions
(`getPayoffProjection`, `getMonthsToPayoffWithExtraStrict`, `getExtraPaymentForYearsEarlierWithTolerance`,
etc.) exist in `lib/amortization.ts` with full test coverage.

This plan covers Phase 3: a "what-if" refinance scenario tool that lets users enter a new rate, new
term, and optional closing costs and immediately see the new monthly payment, monthly savings, break-even
timeline, and total interest delta against their current mortgage — all computed from the same
`getEffectiveBalance` contract used by the existing payoff tools.

No schema migration is required. All refinance computation is purely client-side. New pure functions
are added to `lib/amortization.ts` following the established amortization pattern.

The feature ships in two phases:
- **Phase A (required):** New lib functions + collapsible refinance section in `payoff-card.tsx`.
- **Phase B (optional):** Standalone `/refinance` workspace with property/mortgage selector and
  amortization balance-over-time comparison chart.

## Problem Frame

Users want to know whether refinancing their current mortgage makes financial sense. The key questions
are: What would my new monthly payment be? How much do I save per month? When do I break even on
closing costs? How much total interest do I save (or lose) over the life of the new loan?

These answers must be computed against the user's *actual* current balance (via `getEffectiveBalance`),
not a generic online calculator that starts from scratch. The existing payoff tools already hold this
balance context; refinance is a natural extension.

The proposal at `docs/proposals/refinance-payoff-proposal.md` §3.3 defines the algorithm and copy
baseline. Flow analysis (2026-04-04) identified several critical gaps in the original proposal that
are resolved in the Key Technical Decisions and Open Questions sections below.

## Requirements Trace

- R1. `getStandardMonthlyPayment(principal, annualRate, termYears): number` — exported from
  `lib/amortization.ts`. Standard P&I formula. `annualRate` is decimal (e.g. 0.055 for 5.5%).
  Guards: non-positive inputs → 0; `annualRate = 0` → `principal / (termYears * 12)`; `termYears ≤ 0` → 0.
- R2. `getRefinanceProjection(mortgage: MortgageRecord, input: RefinanceInput): RefinanceProjection`
  — exported from `lib/amortization.ts`. `RefinanceInput.newAnnualRate` is decimal. Returns all
  fields including `isNewLoanNegativeAmortizing`, `remainingCurrentMonths` (for near-payoff warning),
  and `balanceSource` (carried from `getBalanceSource`).
- R3. Both functions have colocated tests in `lib/amortization.test.ts`. Tests cover: happy path,
  higher-rate refinance, zero-closing-cost, zero-rate new loan, zero-balance guard, negative-
  amortizing new loan, near-payoff loan (remainingCurrentMonths < 24), and all
  `getStandardMonthlyPayment` edge cases. All pre-existing tests continue to pass.
- R4. `payoff-card.tsx` gains a collapsible "What if I refinanced?" section (collapsed by default)
  in each `PayoffInsightPerMortgage` row when `projection.payoffDate` is non-null. Trigger label
  is always visible.
- R5. Section inputs: new rate (text, `inputMode="decimal"`, percentage entry e.g. "5.5"), new
  term (dropdown: 30 / 20 / 15 years, default 30), closing costs (text, `inputMode="decimal"`,
  optional, label "(optional, cash at closing)").
- R6. Section outputs use `CalculatorMetric`: new P&I (default tone), monthly savings (positive/
  negative/default tone per §3.7 of `analytics-math-policy.md` cash-flow rule), total interest
  delta (positive/negative tone, labeled "Total interest saved" or "Total interest added").
  Break-even card rendered only when `closingCosts > 0 && monthlySavings > 0`.
- R7. When `closingCosts > 0 && monthlySavings ≤ 0`: render a break-even card with `negative` tone
  and helper text "This refinance increases your monthly payment — no break-even." Differentiates
  "costs not entered" (card hidden) from "refinance never pays off" (card shown with warning).
- R8. Near-payoff guard: when `remainingCurrentMonths < 24`, render an inline note before output
  cards: "Your loan has ~X months remaining — a new N-year term will cost significantly more
  total interest despite a lower monthly payment."
- R9. Balance source disclosure carried into refinance output: same `getBalanceSourceCopy(m)` text
  appears below the output cards ("Based on stored balance as of [date]" etc.).
- R10. Closing costs model: upfront cash at closing, not rolled into the new loan principal.
  UI label "(optional, cash at closing)" and tooltip/helper text on the closing costs card: "Assumes
  costs paid upfront. Rolling costs into the loan changes these figures."
- R11. Rate unit contract: the UI divides user input by 100 before passing to `getRefinanceProjection`
  (`newAnnualRate = parseFloat(rateInput) / 100`). The lib function always receives a decimal.
  JSDoc on `getRefinanceInput` type and `getRefinanceProjection` must state this explicitly.
- R12. `getRefinanceProjection` uses `remainingInterestCurrent - totalInterestNew` for
  `totalInterestSaved` (true interest-only comparison, simulation-loop derived). JSDoc states
  formula and that closing costs are not included in interest comparison.
- R13. `isNegativeAmortizingPayment` is called with `newAnnualRate` (not the original rate) to
  set `isNewLoanNegativeAmortizing`. UI renders "This rate is too high to amortize the loan"
  inline; all output cards are hidden in this state.
- R14. All new analytics events are added to `lib/analytics-events.ts` before the UI units fire
  them: `refinance_scenario_changed` (Phase A), `refinance_workspace_viewed` (Phase B).
- R15. `npm run check` and `npm run test` pass green on all touched files before each phase is
  marked complete.
- R16. No changes to any existing payoff lib function signatures, implementations, or test
  assertions.
- R17. (Phase B) Standalone `/refinance` workspace: RSC `page.tsx` + client
  `refinance-workspace.tsx`, property selector, **mortgage-level selector** for multi-mortgage
  properties, full refinance scenario inputs + `CalculatorMetric` row, optional Recharts balance
  comparison chart. Mobile-responsive via `MobileToolShell`.

## Scope Boundaries

- No new Prisma schema columns. Refinance scenarios are not persisted.
- No changes to any API route response shape. Computation is purely client-side.
- No changes to any existing payoff lib function (strict or tolerance-aware) or their test coverage.
- No "roll closing costs into loan" model (deferred; must be a future product decision).
- No multi-scenario side-by-side comparison (one scenario at a time per mortgage).
- No market-rate data feed (user enters rate manually).
- No PDF/CSV export of refinance scenarios.
- Phase B (`/refinance` workspace) is optional — Phase A ships independently.

## Context & Research

### Relevant Code and Patterns

- `app/lib/amortization.ts` — canonical mortgage math. All new functions go here. `MortgageRecord`
  type is the input contract. Every numeric field accepts `number | { toString(): string }` (Prisma
  Decimal serialization) — call `Number(...)` defensively on every field.
- `app/lib/amortization.test.ts` — colocated Vitest tests. `beforeEach(() => { vi.useFakeTimers();
  vi.setSystemTime(new Date("YYYY-MM-DD")); })` + `afterEach(() => vi.useRealTimers())` for all
  date-sensitive tests. New tests extend this file.
- `app/(app)/properties/[id]/payoff-card.tsx` — Phase A target. Per-mortgage state via `useState`
  inside `PayoffInsightPerMortgage`. Rate/term/costs inputs follow the existing `extraInput` pattern.
  Cast to `MortgageRecord` uses `m as Parameters<typeof fn>[0]` — same pattern for refinance call.
- `app/components/calculators/calculator-metric.tsx` — output cards. Props: `label`, `value`,
  `helper`, `tone: "default" | "positive" | "warning" | "negative" | "neutral"`. The component
  internally applies `tabular-nums` to the value; all financial value renders outside this
  component must also use the `tabular-nums` Tailwind class.
- `app/lib/calculator-metric-tones.ts` — tone mapping. Apply cash-flow rule to `monthlySavings`:
  `> 0 → "positive"`, `< 0 → "negative"`, `= 0 → "default"`. Same rule for `totalInterestSaved`.
- `app/(app)/mortgage/page.tsx` + `app/(app)/mortgage/mortgage-workspace.tsx` — Phase B workspace
  scaffold to follow exactly. RSC data-fetch + client workspace + URL-synced property selector.
- `app/components/mobile-tool-shell.tsx` — Phase B mobile shell. Props: `eyebrow`, `title`,
  `summaryItems`, `children`.
- `app/components/charts/amortization-chart.tsx` — Phase B chart reference. Uses
  `var(--chart-1)` / `var(--chart-2)` for line colors, `var(--border)` for grid.
- `app/lib/analytics-events.ts` — `AnalyticsEvents` constant; new event keys added here first.
- `app/components/mobile-section-card.tsx`, `app/components/mobile-collapsible.tsx` — Phase B
  mobile section layout primitives.
- **`docs/design/design-spec-2026.md` (v3.1, 2026-04-04) — canonical design spec.** All new UI
  must conform to this document. Key sections for this plan: §5 (Surface Hierarchy), §6 (Shadows),
  §7 (Radius System), §8 (Numerics / `tabular-nums`), §9 (Accessibility / touch targets),
  §10.1 (Motion policy — collapsible expand = `transition-all duration-200`), §13.13
  (`CalculatorMetric`), §16 (Anti-patterns).

### Institutional Learnings

- **Always use `getEffectiveBalance(mortgage)` as the starting balance** — never `originalLoanAmount`
  (see `docs/proposals/refinance-payoff-proposal.md` §3.3,
  `docs/audits/math/2026-04-02-mortgage-simulation-analysis.md`).
- **`interestRate` is a decimal** (0.065 for 6.5%). `Number(mortgage.interestRate)` used directly
  throughout the codebase. No unit conversion inside lib functions.
- **Lag-months cap** (`Math.max(0, termYears * 12 - monthsSinceStart + lagMonths)`) is required
  in any iteration loop that counts remaining months (see `docs/audits/math/2026-04-03-math-logic-audit-2.md`).
  The `remainingInterestCurrent` simulation loop in `getRefinanceProjection` must use this same cap.
- **Tolerance-aware contract is UI-only** (`docs/policies/analytics-math-policy.md` §3.7). The
  refinance calculation uses `getStandardMonthlyPayment` (no end-of-term tolerance concept
  applies). No tolerance disclosure is required for the refinance section.
- **Phases 1 + 2 confirmed complete**: `getPayoffProjection` + all `*WithTolerance` variants
  exist in `lib/amortization.ts`; `payoff-card.tsx` renders payoff timeline, years-earlier
  buttons, extra payment input, and "Estimates for informational purposes only" disclaimer.
- **Disclaimer already present** in `payoff-card.tsx` footer ("Estimates for informational
  purposes only. Not financial advice.") — it covers the refinance section; no additional
  disclaimer text is needed.

### External References

None required. Standard P&I formula and break-even calculation are well-established; local
patterns are sufficient. The existing `amortization.ts` is the definitive style reference.

## Key Technical Decisions

- **New functions go in `lib/amortization.ts`, not a new `lib/refinance.ts`**: Refinance math is
  inseparable from the amortization contract — it uses `getEffectiveBalance`, `getPiForAmortization`,
  `getPaymentStartLagMonths`, `isNegativeAmortizingPayment`, and `MortgageRecord`. Keeping all
  mortgage math in one file avoids split-import complexity. A future extraction to
  `lib/mortgage-calculator.ts` is a post-MVP refactor concern.

- **`getStandardMonthlyPayment` exported as a standalone primitive**: The formula
  `P × r(1+r)^n / ((1+r)^n − 1)` is useful to other tools independently (e.g., the BRRR
  calculator's cash-out refinance cross-check). Exporting it rather than inlining in
  `getRefinanceProjection` enables direct testing and future reuse.

- **`newAnnualRate` in all lib signatures is a decimal (0.055), not a percentage (5.5)**: This
  is consistent with every other function in the file. The UI layer is solely responsible for
  dividing user percentage input by 100. Violation is a 100× error with no runtime alarm; the
  JSDoc on `RefinanceInput` and `getStandardMonthlyPayment` must state this explicitly.

- **`totalInterestSaved = remainingInterestCurrent − totalInterestNew`**: True interest-only
  comparison, not a gross payment comparison (`currentPi × n`). This correctly handles the case
  where a loan has only 2 years remaining — total remaining interest is small, and the comparison
  to a new 30yr loan is still meaningful. Closing costs are excluded from this field; they appear
  separately in break-even math.

- **`currentMonthlyPi = getPiForAmortization(mortgage)` (contracted payment, not re-computed)**:
  The contracted payment is what the user actually pays today. Re-computing a "remaining-term-
  equivalent" payment would confuse users ("that's not my payment"). Instead, the near-payoff
  guard (R8, remainingCurrentMonths < 24) surfaces the limitation as a contextual note without
  changing the math.

- **Break-even `null` when `closingCosts` is absent or zero**: The field is not shown when there
  is nothing to break even on. When `closingCosts > 0 && monthlySavings ≤ 0`, the card is shown
  with a `negative` tone and "no break-even" helper text (R7). This disambiguates "no costs
  entered" from "refinance never pays off."

- **Upfront-only closing costs model (not rolled in)**: Rolling closing costs into the loan
  principal is a product decision that changes `newMonthlyPayment` and all downstream fields.
  Choosing upfront is the simpler, more conservative default. The UI labels the field "(optional,
  cash at closing)" and includes a helper note disclosing the assumption.

- **Purely client-side computation, no API route**: All inputs (mortgage data already serialized
  to the client, user-entered rate/term/costs) are in scope at the component level. No write-side
  effects, no external data. Adding an API route would add latency with no security or data benefit.

- **Collapsible section, closed by default**: `payoff-card.tsx` already shows payoff timeline and
  accelerator buttons. Showing the refinance section open by default for every mortgage would make
  the card very tall and densify the property detail page. A visible trigger label ("What if I
  refinanced? ▾") ensures discoverability without defaulting open.

- **Phase B workspace is additive over Phase A**: Phase B (`/refinance/page.tsx`) is a thin shell
  that reuses the same lib functions. The property/mortgage selector and workspace layout mirror
  `/mortgage` exactly; the per-mortgage scenario display may extract a `RefinanceScenarioCard`
  component from what Phase A builds in `payoff-card.tsx`. Phase B adds no new lib code.

## Open Questions

### Resolved During Planning

- **Rate unit contract**: `newAnnualRate` is decimal throughout lib. UI divides by 100. Stated
  explicitly in JSDoc and in R11.
- **`totalInterestSaved` formula**: `remainingInterestCurrent − totalInterestNew` (true
  interest-only comparison, R12).
- **Closing costs model**: upfront cash, disclosed in UI label and tooltip (R10).
- **Break-even null behavior**: two distinct cases handled differently (R6, R7).
- **Near-payoff warning**: inline note when `remainingCurrentMonths < 24` (R8).
- **Default term in dropdown**: 30 years (most common refi scenario; stated in R5).
- **Collapsible default state**: closed; trigger label always visible (R4).
- **`isNewLoanNegativeAmortizing` rate parameter**: uses `newAnnualRate`, not original rate (R13).
- **Does refinance need a new DB column?** No — purely client-side/calculation.
- **Which API routes need to change?** None.
- **Balance source disclosure**: carried into refinance output section (R9).

### Deferred to Implementation

- Whether to extract a `RefinanceScenarioCard` component from `payoff-card.tsx` for reuse in the
  Phase B workspace — determine at implementation based on the actual prop shape and whether shared
  state needs are compatible.
- Whether the Phase B workspace mortgage selector should default to the first mortgage or the one
  with the closest payoff date — both are reasonable defaults; choose during implementation.
- Whether "Match remaining" should appear as a fourth term option in the dropdown when remaining
  months don't round to 30/20/15 — low value for Phase A; revisit if user feedback requests it.
- Exact Recharts chart data preparation for Phase B balance comparison — mimic
  `amortization-chart.tsx` structure; exact series names and tooltip formatting chosen at
  implementation.

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation
> specification. The implementing agent should treat it as context, not code to reproduce.*

### Data flow — Phase A (payoff-card.tsx refinance section)

```
MortgageForPayoff (from property API response)
  → effectiveBalance (pre-computed, passed as m.effectiveBalance)
  → payoffProjection (strict, pre-computed, passed as m.payoffProjection)
  → balanceSource (pre-computed, passed as m.balanceSource)

User enters: rateInput (percentage string) → / 100 → newAnnualRate (decimal)
             newTermYears (dropdown, default 30)
             closingCostsInput (optional dollar string)

useMemo: getRefinanceProjection(m as MortgageRecord, { newAnnualRate, newTermYears, closingCosts })
  ↓ getEffectiveBalance(m)                       → effectiveBalance
  ↓ getPiForAmortization(m)                      → currentMonthlyPi
  ↓ getStandardMonthlyPayment(bal, rate, term)   → newMonthlyPayment
  ↓ isNegativeAmortizingPayment(newPi, bal, newRate) → isNewLoanNegativeAmortizing
  ↓ month-by-month sum (current, lag-capped)     → remainingInterestCurrent
  ↓ month-by-month sum (new, newTermYears * 12)  → totalInterestNew
  ↓ closingCosts / monthlySavings                → breakEvenMonths / breakEvenDate

RefinanceProjection output
  ↓
  Guard: isNewLoanNegativeAmortizing → show error state, hide all metric cards
  Guard: remainingCurrentMonths < 24 → show near-payoff warning above cards
  ↓
  CalculatorMetric: New P&I       (default tone)
  CalculatorMetric: Monthly savings (positive / negative / default)
  CalculatorMetric: Total interest delta (positive / negative)
  CalculatorMetric: Break-even    (shown only when closingCosts > 0;
                                   negative tone + "no break-even" copy when monthlySavings ≤ 0)
  Prose: getBalanceSourceCopy(m)
```

### Data flow — Phase B (/refinance workspace)

```
RSC page.tsx (server)
  → getActiveAppUser() + Prisma: properties with mortgages (same query as /mortgage/page.tsx)
  → enrich: getEffectiveBalance, getBalanceSource, getPayoffProjection (strict)
  → serialize Decimals → strings, Dates → YYYY-MM-DD
  → pass MortgageProperty[] to RefinanceWorkspace client component
      → property selector (syncWorkspaceQuery to URL)
      → mortgage selector (when selected property has > 1 mortgage)
      → RefinanceScenarioCard (or inline):
          inputs: rate, term, closingCosts
          useMemo: getRefinanceProjection(...)
          CalculatorMetric row (same as Phase A)
          optional Recharts LineChart:
            Line 1: current balance curve (from effective balance, currentMonthlyPi)
            Line 2: refinanced balance curve (from effective balance, newMonthlyPayment)
            colors: var(--chart-1), var(--chart-2)
      → MobileToolShell wrapper (md:hidden) with summaryItems [current P&I, new P&I]
      → desktop: rounded-xl border border-border bg-card shadow-sm Panel (§5 Panel level;
                 hidden md:block equivalent layout)
```

## Implementation Units

---

- [ ] **Unit 1: Refinance pure functions in `lib/amortization.ts` + tests**

**Goal:** Add `getStandardMonthlyPayment` and `getRefinanceProjection` to `lib/amortization.ts`
with full test coverage. These are the sole source of refinance math for all UI surfaces.

**Requirements:** R1, R2, R3, R11, R12, R13, R16

**Dependencies:** None

**Files:**
- Modify: `app/lib/amortization.ts`
- Test: `app/lib/amortization.test.ts`

**Approach:**

1. Add exported types after the existing `PayoffToleranceOptions` block:
   - `RefinanceInput`: `{ newAnnualRate: number; newTermYears: number; closingCosts?: number }`.
     JSDoc: "*`newAnnualRate` is a decimal (e.g. 0.055 for 5.5%). Divide user percentage input
     by 100 before passing.*"
   - `RefinanceProjection`: `{ effectiveBalance: number; currentMonthlyPi: number;
     newMonthlyPayment: number; monthlySavings: number; remainingInterestCurrent: number;
     totalInterestNew: number; totalInterestSaved: number; breakEvenMonths: number | null;
     breakEvenDate: Date | null; remainingCurrentMonths: number;
     balanceSource: "stored" | "stored_projected" | "projected";
     isNewLoanNegativeAmortizing: boolean }`.

2. Add `getStandardMonthlyPayment(principal, annualRate, termYears): number`:
   - Guard: `principal ≤ 0 || termYears ≤ 0 || annualRate < 0` → return 0.
   - Guard: `annualRate === 0` → return `principal / (termYears * 12)`.
   - Standard formula: `P × r(1+r)^n / ((1+r)^n − 1)` where `r = annualRate / 12`,
     `n = termYears * 12`.
   - Return `Math.round(result * 100) / 100`.

3. Add `getRefinanceProjection(mortgage, input)`:
   - Step 1: `effectiveBalance = getEffectiveBalance(mortgage)`. If `≤ 0` → return all-zero
     result with `isNewLoanNegativeAmortizing: false`, `remainingCurrentMonths: 0`.
   - Step 2: `currentMonthlyPi = getPiForAmortization(mortgage)`.
   - Step 3: `newMonthlyPayment = getStandardMonthlyPayment(effectiveBalance, newAnnualRate,
     newTermYears)`.
   - Step 4: `isNewLoanNegativeAmortizing = isNegativeAmortizingPayment(newMonthlyPayment,
     effectiveBalance, newAnnualRate)`. If true → return with `remainingInterestCurrent: 0`,
     `totalInterestNew: 0`, `totalInterestSaved: 0`, `breakEvenMonths: null`,
     `breakEvenDate: null`.
   - Step 5: Compute `remainingCurrentMonths` using the same cap formula as `getPayoffProjection`:
     `Math.max(0, termYears * 12 − monthsSinceStart + lagMonths)` where `lagMonths =
     getPaymentStartLagMonths(mortgage)`.
   - Step 6: `remainingInterestCurrent` — month-by-month forward simulation from `effectiveBalance`
     at `Number(mortgage.interestRate)` using `currentMonthlyPi`, capped at
     `remainingCurrentMonths`. Sum the interest portion each step (same iteration structure as
     `getPayoffProjection`). Stop early if `runningBalance ≤ 0`.
   - Step 7: `totalInterestNew` — month-by-month simulation from `effectiveBalance` at
     `input.newAnnualRate` using `newMonthlyPayment`, for `input.newTermYears * 12` months. Sum
     all interest. Stop early if balance reaches 0.
   - Step 8: `monthlySavings = currentMonthlyPi − newMonthlyPayment`.
   - Step 9: `totalInterestSaved = remainingInterestCurrent − totalInterestNew`.
   - Step 10: `breakEvenMonths`: if `(input.closingCosts ?? 0) > 0 && monthlySavings > 0` →
     `Math.ceil(input.closingCosts! / monthlySavings)`. Else `null`.
   - Step 11: `breakEvenDate`: if `breakEvenMonths != null` → `new Date(today.getFullYear(),
     today.getMonth() + breakEvenMonths, 1)`. Else `null`.
   - Step 12: `balanceSource = getBalanceSource(mortgage)`.
   - Position new exports after the `getPayoffYearsWithExtraWithTolerance` block. Add JSDoc block
     on each function.

**Execution note:** Implement `getStandardMonthlyPayment` test-first — all edge cases (zero rate,
non-positive inputs) are fully specified above and do not require code exploration.

**Patterns to follow:**
- `getPayoffProjection` and `getMonthsToPayoffWithExtraStrict` — same iteration style and cap
  formula. Do not deviate from the `Math.max(0, termYears * 12 - monthsSinceStart + lagMonths)`
  cap.
- Existing test `beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date(...)); })` /
  `afterEach(() => vi.useRealTimers())` — required because `getRefinanceProjection` calls
  `new Date()` internally.

**Test scenarios:**

*`getStandardMonthlyPayment`:*
- Happy path: `getStandardMonthlyPayment(200_000, 0.06, 30)` → approximately $1,199.10.
  Assert to nearest cent (`toBeCloseTo(1199.10, 1)`).
- Zero rate: `getStandardMonthlyPayment(120_000, 0, 10)` → exactly $1,000.
- Non-positive principal: `getStandardMonthlyPayment(0, 0.06, 30)` → 0; same for negative.
- Non-positive term: `getStandardMonthlyPayment(100_000, 0.06, 0)` → 0.
- Negative rate: `getStandardMonthlyPayment(100_000, -0.01, 30)` → 0.
- Short term precision: `getStandardMonthlyPayment(50_000, 0.05, 5)` → approximately $943.56.

*`getRefinanceProjection` — happy path:*
- Fixture: 30yr, startDate 2020-01-01, systemTime 2026-01-15, balance $280,000, rate 0.065,
  P&I ~$1,776. Refinance to newAnnualRate 0.055, newTermYears 30, closingCosts 4_000.
  Expect: `newMonthlyPayment < currentMonthlyPi`, `monthlySavings > 0`, `breakEvenMonths =
  Math.ceil(4000 / monthlySavings)`, `totalInterestNew < remainingInterestCurrent`,
  `totalInterestSaved > 0`, `isNewLoanNegativeAmortizing: false`.

*Higher-rate refinance:*
- Same fixture, newAnnualRate 0.08. Expect: `monthlySavings < 0`, `breakEvenMonths = null`,
  `breakEvenDate = null`, `totalInterestSaved` may be negative.

*Zero closing costs:*
- Refinance to lower rate, closingCosts = 0 (or undefined). Expect: `breakEvenMonths = null`,
  `breakEvenDate = null`, `monthlySavings > 0`, `totalInterestSaved > 0`.

*Zero interest rate new loan:*
- newAnnualRate = 0, newTermYears = 15. Expect: `newMonthlyPayment = effectiveBalance / (15 * 12)`,
  no NaN or Infinity anywhere in result.

*Zero balance guard:*
- currentBalance = 0, balanceAsOfDate = today. Expect: `effectiveBalance = 0`, returns all-
  zero/null result without crash, `isNewLoanNegativeAmortizing: false`.

*Negative-amortizing new loan:*
- newAnnualRate = 0.99, newTermYears = 30. Expect: `isNewLoanNegativeAmortizing: true`,
  `totalInterestSaved = 0`, `breakEvenMonths = null`.

*Near-payoff loan:*
- Fixture: 30yr, startDate 2020-01-01, systemTime 2049-08-01 (< 5 months remaining),
  balance ~$5,000. Expect: `remainingCurrentMonths < 24`, `remainingInterestCurrent` is small.

*Lag cap parity:*
- Fixture matching the existing `getPayoffProjection` lag-regression test (startDate Jan 15 2020,
  systemTime 2050-01-15): `remainingCurrentMonths` returned by `getRefinanceProjection` must
  equal the `remainingMonths` used in `getPayoffProjection` for the same mortgage. Assert both
  are > 0 and equal.

*Regression:*
- All pre-existing tests in `lib/amortization.test.ts` pass without modification.

**Verification:**
- `npm run test` passes green including all pre-existing amortization tests.
- `npm run check` passes (TypeScript strict, no `any` in new code).
- `getRefinanceProjection` and `getStandardMonthlyPayment` are importable from `@/lib/amortization`.

---

- [ ] **Unit 2: Refinance event keys in `lib/analytics-events.ts`**

**Goal:** Add the new event key constants before any UI component fires them, preserving the
single-source-of-truth pattern for PostHog event names.

**Requirements:** R14

**Dependencies:** None (can be parallel with Unit 1)

**Files:**
- Modify: `app/lib/analytics-events.ts`

**Approach:**
- Add `REFINANCE_SCENARIO_CHANGED: "refinance_scenario_changed"` and (if Phase B is in scope)
  `REFINANCE_WORKSPACE_VIEWED: "refinance_workspace_viewed"` to the `AnalyticsEvents` constant.
- Follow the existing constant naming pattern exactly.

**Test scenarios:**
Test expectation: none — pure constant addition, no behavioral change.

**Verification:**
- `npm run check` passes on the modified file.
- The new keys are importable and usable in subsequent units.

---

- [ ] **Unit 3: Refinance what-if section in `payoff-card.tsx`**

**Goal:** Add a collapsible "What if I refinanced?" section to each `PayoffInsightPerMortgage`
row. Inputs: new rate, new term, closing costs. Outputs: `CalculatorMetric` cards with toned
display. All guards (negative amortization, near-payoff, break-even disambiguation) rendered
correctly.

**Requirements:** R4–R13, R15

**Dependencies:** Units 1 and 2

**Files:**
- Modify: `app/(app)/properties/[id]/payoff-card.tsx`

**Approach:**
- Add state to `PayoffInsightPerMortgage`: `refinanceOpen: boolean` (default `false`),
  `rateInput: string` (default `""`), `newTermYears: number` (default `30`), `costsInput:
  string` (default `""`).
- The refinance section renders below the existing payoff accelerator section only when
  `projection.payoffDate` is non-null. (If the loan is not amortizing, refinance comparison is
  not meaningful.)
- Collapsible trigger: a `<button>` with visible label text "What if I refinanced?" and a
  `<ChevronDown className="size-3.5" aria-hidden />` / `<ChevronUp className="size-3.5" aria-hidden />`
  icon from `lucide-react` (never use literal `▾`/`▴` characters — see design-spec-2026 §16.1).
  Classes: `inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors
  duration-150 hover:text-foreground min-h-[44px]` (§9.2 touch target + §16.4 transition
  requirement). Toggles `refinanceOpen`.
- Inputs section (when `refinanceOpen` is true): vertically stacked `space-y-3 pt-2`.
  - **Rate:** `<label className="text-sm font-medium text-muted">` above an
    `<input type="text" inputMode="decimal" placeholder="e.g. 5.5"
    className="rounded-md border border-border bg-background px-3 py-1.5 text-sm w-24" />` + `%`
    inline suffix. Sanitize: `parseFloat(value.replace(/[^0-9.]/g, ""))`. Clamp 0–30. If outside
    range after blur, show `<p className="text-sm text-negative">Enter a rate between 0 and 30.</p>`
    below the input (§5.4 error pattern). Convert to lib decimal: `clampedRate / 100`.
  - **New term:** `<label className="text-sm font-medium text-muted">` above a
    `<select className="rounded-md border border-border bg-background px-3 py-1.5 text-sm">` with
    options 30 / 20 / 15 years, default 30.
  - **Closing costs (optional):** `<label className="text-sm font-medium text-muted">` above
    `$` prefix + `<input type="text" inputMode="decimal" placeholder="e.g. 4000"
    className="rounded-md border border-border bg-background px-3 py-1.5 text-sm w-28" />` with
    `<p className="text-xs text-muted">(optional, cash at closing)</p>` below.
- `useMemo`: compute `getRefinanceProjection(m as MortgageRecord, { newAnnualRate, newTermYears,
  closingCosts })` only when `rateInput` parses to a valid number in range; otherwise `null`.
- Accordion content area (`refinanceOpen && ...`): wrap in `<div className="transition-all
  duration-200">` per §10.1 (collapsible expand = 200ms).
- Output rendering (only when projection is non-null):
  - Wrap the entire output block in an Inset surface `<div className="mt-3 rounded-lg
    bg-subtle/40 p-3 space-y-3">` (§5 Inset: secondary content nested inside a Panel — never
    adds its own border or shadow).
  - If `isNewLoanNegativeAmortizing`: show `<p className="text-sm text-warning">This rate is
    too high to amortize the loan.</p>`. Do not render any metric cards.
  - If `remainingCurrentMonths < 24`: show inline note (R8) above metric cards.
  - Metric card row: `<div className="flex flex-wrap gap-2">` containing `CalculatorMetric`
    components: New P&I (default tone), Monthly savings (cash-flow toned), Total interest delta
    (cash-flow toned). Values passed to `CalculatorMetric` must be pre-formatted strings (e.g.
    `"$1,420/mo"`) — the component renders them as-is and applies `tabular-nums` internally.
  - Interest saved prose line (below metric cards): `<p className="text-sm text-muted">` with
    the dollar figure wrapped in `<span className="tabular-nums font-medium text-foreground">`
    (§8 numerics policy — financial figures outside `CalculatorMetric` must also use `tabular-nums`).
  - Break-even card: shown only when `closingCosts > 0`. If `monthlySavings > 0`:
    `breakEvenMonths` value + formatted `breakEvenDate` as `helper`. If `monthlySavings ≤ 0`:
    show card with `negative` tone, helper "This refinance increases your monthly payment — no
    break-even."
  - Balance source disclosure: `<p className="text-xs text-muted">{getBalanceSourceCopy(m)}</p>`
    below cards.
  - Closing costs assumption note: `<p className="text-xs text-muted">Assumes closing costs paid
    upfront. Rolling costs into the loan changes these figures.</p>` shown only when
    `costsInput` parses > 0.
- Analytics: `captureClientEvent(AnalyticsEvents.REFINANCE_SCENARIO_CHANGED, { placement:
  "payoff_card", newRate: clampedRate, newTermYears })`. Debounce 500ms or fire on stable value
  (not per-keystroke).
- No new disclaimer text needed — existing `PayoffCard` footer covers the section.

**Patterns to follow:**
- Existing `extraInput` state + parse pattern in `PayoffInsightPerMortgage`.
- `CalculatorMetric` usage and import.
- `calculator-metric-tones.ts` cash-flow tone logic.
- `ChevronDown` / `ChevronUp` (lucide-react) for accordion trigger.
- `captureClientEvent` usage in other client components.

**Test scenarios:**
*(Component-level — manual review or integration snapshot; lib behavior covered in Unit 1 tests)*
- Happy path: valid rate input (e.g. "5.5") with default 30yr term, no closing costs →
  `CalculatorMetric` row renders with positive savings tone. Break-even card hidden.
- Higher rate (e.g. current rate + 2%): savings card shows negative tone; break-even card
  hidden (monthlySavings ≤ 0).
- Closing costs entered with positive savings → break-even card visible with month count.
- Closing costs entered with negative savings → break-even card shows `negative` tone +
  "no break-even" copy.
- Rate out of range (e.g. "99"): validation message shown; no metric cards rendered.
- Empty rate input: section collapses to trigger-only; no metric cards; no NaN display.
- `isNewLoanNegativeAmortizing = true`: error message shown; all metric cards hidden.
- Near-payoff fixture (remainingCurrentMonths < 24): inline warning rendered above cards.
- Balance source copy: "Based on stored balance as of [date]" appears below cards when
  `balanceSource = "stored"`.
- Analytics event: `refinance_scenario_changed` fires with correct `newRate` + `newTermYears`
  payload (verify in PostHog dev console or unit mock).

**Verification:**
- `npm run check` passes on `payoff-card.tsx`.
- All existing payoff timeline / accelerator sections render without regression.
- Refinance section is collapsed on initial render; trigger button is visible.
- `npm run test` passes (Unit 1 tests covering the underlying computation).

---

- [ ] **Unit 4 (Phase B): Standalone `/refinance` workspace**

**Goal:** Create a dedicated `/refinance` workspace page with property + mortgage selectors,
full refinance scenario display, and an optional balance-over-time comparison chart. Follows
the `/mortgage` workspace pattern exactly.

**Requirements:** R15, R17

**Dependencies:** Units 1, 2, 3

**Files:**
- Create: `app/(app)/refinance/page.tsx`
- Create: `app/(app)/refinance/refinance-workspace.tsx`
- Modify: `app/(app)/mortgage/mortgage-workspace.tsx` (add "Refinance comparison →" cross-link
  to `/refinance`)

**Approach:**

*`page.tsx` (RSC):*
- Same auth pattern as `/mortgage/page.tsx`: `getActiveAppUser()` → redirect if unauthenticated.
- Prisma query: all user properties with at least one mortgage, including all mortgage fields.
- Enrich each mortgage: `getEffectiveBalance`, `getBalanceSource`, `getPayoffProjection` (strict).
- Serialize: Decimal → `.toString()`, Date → `.toISOString().slice(0, 10)`.
- Read `searchParams` for initial `propertyId` and `mortgageId`.
- Pass `properties: MortgageProperty[]` + initial selections to `RefinanceWorkspace` client
  component via `dynamic(import(...), { ssr: false })`.

*`refinance-workspace.tsx` (client):*
- State: `selectedPropertyId`, `selectedMortgageId`, `rateInput`, `newTermYears` (default 30),
  `costsInput`.
- Property selector: same dropdown + `syncWorkspaceQuery` pattern as `MortgageWorkspace`.
- Mortgage selector: shown when selected property has > 1 mortgage. Dropdown of mortgage
  labels (lender name + original amount or index fallback).
- `useMemo`: `getRefinanceProjection` on selected mortgage + inputs.
- Desktop output: top-level Panel card `<div className="rounded-xl border border-border bg-card
  shadow-sm p-5">` (§5 Panel + §6 Raised shadow — not `rounded-lg`, which is for cards nested
  inside a Panel) containing the `CalculatorMetric` row + optional Recharts chart below.
- Chart (shown when `rateInput` is valid): `LineChart` with two `Line` series.
  - Series 1 "Current loan": month-by-month balance from `effectiveBalance` at current rate
    using `currentMonthlyPi`, for `remainingCurrentMonths`.
  - Series 2 "If refinanced": month-by-month balance from `effectiveBalance` at `newAnnualRate`
    using `newMonthlyPayment`, for `newTermYears * 12`.
  - Chart data prepared in the same `useMemo` as the projection.
  - Colors: `var(--chart-1)` (current), `var(--chart-2)` (refinanced). Grid: `var(--border)`.
  - Follow `amortization-chart.tsx` for `ResponsiveContainer`, `XAxis`, `YAxis`, `Tooltip`
    setup.
- Mobile (`MobileToolShell`):
  - `eyebrow="Refinance"`, `title="What-If Comparison"`.
  - `summaryItems`: current P&I and new P&I (when valid).
  - `MobileSectionCard` for inputs section.
  - `MobileCollapsible` for chart section.
- Analytics: `captureClientEvent(AnalyticsEvents.REFINANCE_WORKSPACE_VIEWED, { propertyId,
  mortgageId })` on mount.
- Cross-link added to `mortgage-workspace.tsx`: a link with text "Refinance comparison" and a
  `<ChevronRight className="size-3.5" aria-hidden />` icon (never the literal `→` character —
  §16.1). Classes: `inline-flex items-center gap-1 text-sm text-muted transition-colors
  duration-150 hover:text-foreground` (§4 forward-link pattern). Navigates to
  `/refinance?propertyId=<selectedPropertyId>` via Next.js `<Link>`.

**Patterns to follow:**
- `app/(app)/mortgage/page.tsx` + `mortgage-workspace.tsx` — match the scaffold exactly.
- `app/components/charts/amortization-chart.tsx` — chart token usage and structure.
- `app/components/mobile-tool-shell.tsx` — `MobileToolShell` with `summaryItems`.
- `app/components/mobile-section-card.tsx`, `app/components/mobile-collapsible.tsx`.

**Test scenarios:**
Test expectation: none for `page.tsx` or `refinance-workspace.tsx` themselves (RSC data
fetching + client wiring; all computation is tested in Unit 1). Manual verification covers:
- Page renders at `/refinance` for authenticated user with properties.
- Property selector updates displayed mortgage.
- Mortgage selector appears and functions for multi-mortgage property.
- Chart renders and updates on rate change.
- Mobile shell renders at 375px viewport width.
- URL query params reflect selected property/mortgage after navigation.

**Verification:**
- `npm run check` passes on all new files.
- The workspace renders at `/refinance?propertyId=<id>` without errors.
- `npm run test` continues to pass (no new lib changes in this unit).

---

## System-Wide Impact

- **Interaction graph:** `payoff-card.tsx` → `lib/amortization.ts` (new functions, no callbacks
  affected). `/refinance/page.tsx` adds a new protected route automatically covered by the
  `(app)` authenticated layout. No middleware, observers, or existing routes are modified except
  the cross-link addition in `mortgage-workspace.tsx`.
- **Error propagation:** `getRefinanceProjection` returns a defined result object in all cases —
  no throws. All edge cases return valid typed objects. UI guards on `isNewLoanNegativeAmortizing`
  and invalid inputs prevent display of bad data. No propagation to parent components or APIs.
- **State lifecycle risks:** All refinance state is local to the component (`useState`). No global
  store, no server state, no caching concerns. Navigating away from the page resets inputs; this
  is acceptable given scenarios are not persisted by design.
- **API surface parity:** No API routes are changed. The mortgage API response already includes
  `effectiveBalance`, `balanceSource`, and `payoffProjection` (strict) — these are the inputs to
  the refinance computation. No new API fields are needed. No export contracts change.
- **Integration coverage:** Unit 1 lib tests prove the core computation. Unit 3 UI rendering is
  verified manually. The full user flow (mortgage data from API → component state → lib call →
  CalculatorMetric display) crosses layers but is thin enough that unit + manual coverage is
  sufficient. If an integration test exists for the `/mortgage` route, add a parallel test for
  `/refinance` confirming auth redirect and 200 for an authenticated user.
- **Unchanged invariants:** `getPayoffProjection`, `getMonthsToPayoffWithExtraStrict`,
  `getExtraPaymentForYearsEarlier`, `getPayoffYearsWithExtra`, and all `*WithTolerance` variants
  are not modified. Their test assertions must remain green. The existing payoff timeline and
  accelerator sections of `payoff-card.tsx` are not modified — only a new section is appended.
  The `/mortgage` workspace is not structurally changed (only a cross-link is added).

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Rate unit mismatch (user enters 5.5, lib expects 0.055) | R11 mandates explicit JSDoc on `RefinanceInput.newAnnualRate` and UI conversion. Test scenario in Unit 1 uses decimal-specified fixture. |
| `remainingInterestCurrent` loop diverges from `getPayoffProjection` remaining-months cap | Step 5 of `getRefinanceProjection` explicitly uses `getPaymentStartLagMonths` — same cap formula. Add lag-parity test scenario in Unit 1. |
| Near-payoff loans show wildly misleading monthly savings | R8 near-payoff guard (< 24 months) surfaces the issue as an inline note. Math remains correct; user is informed. |
| `payoff-card.tsx` vertical density with 3 new inputs + 4 output cards | Section is collapsed by default; only expands on explicit user action. Existing sections unchanged. |
| Recharts chart data preparation for Phase B is slow (two long balance series) | Both series are simple month-by-month arrays (≤ 360 items each). Computed in `useMemo`. No performance concern at this scale. |
| Cross-link in `mortgage-workspace.tsx` navigates to wrong URL | Simple `href="/refinance?propertyId=${selectedPropertyId}"` string — reviewed in `npm run check`. |

## Phased Delivery

### Phase A — Required

Units 1 → 2 → 3 (in order; Unit 2 can be parallel with Unit 1).

Ships: refinance lib functions + tests + refinance section in `payoff-card.tsx`. This is the
complete user-visible feature for the property detail page. No dependency on Phase B.

### Phase B — Optional

Unit 4 depends on Phase A being complete (needs Unit 1 lib functions).

Ships: standalone `/refinance` workspace with chart comparison. Can be deferred without blocking
Phase A value delivery. Recommended when usage data from Phase A shows significant refinance
section engagement.

## Documentation / Operational Notes

- No migration, rollback plan, or feature flag needed. Purely additive; no DB changes; no API
  contract changes.
- After Phase A ships, update `docs/proposals/refinance-payoff-proposal.md` Phase 3 checklist
  items to `[x]`.
- No rate-limit entries needed for any new endpoint (there are no new endpoints).

## Sources & References

- **Origin document:** [`docs/proposals/refinance-payoff-proposal.md`](docs/proposals/refinance-payoff-proposal.md)
- **Math policy:** [`docs/policies/analytics-math-policy.md`](docs/policies/analytics-math-policy.md) §3.7 (strict vs tolerance-aware contract)
- **Architecture:** [`docs/architecture-and-build-practices.md`](docs/architecture-and-build-practices.md) (lib layering rules)
- **Design spec (canonical):** [`docs/design/design-spec-2026.md`](docs/design/design-spec-2026.md) v3.1 — §5 Surface Hierarchy, §6 Shadows, §7 Radius System, §8 Numerics (`tabular-nums`), §9.2 Touch targets, §10.1 Motion (collapsible 200ms), §13.13 `CalculatorMetric`, §16 Anti-patterns (no literal `→`, no `rounded-xl` button in `rounded-xl` card, transition required on hover, etc.)
- **Tone policy:** [`docs/policies/calculator-metric-tones.md`](docs/policies/calculator-metric-tones.md) (cash-flow tone rule applied to `monthlySavings`)
- **Lag-months audit:** [`docs/audits/math/2026-04-02-mortgage-simulation-analysis.md`](docs/audits/math/2026-04-02-mortgage-simulation-analysis.md) and [`docs/audits/math/2026-04-03-math-logic-audit-2.md`](docs/audits/math/2026-04-03-math-logic-audit-2.md)
- **Related code:** `app/lib/amortization.ts` (lines 1–697), `app/(app)/properties/[id]/payoff-card.tsx`, `app/(app)/mortgage/page.tsx`, `app/(app)/mortgage/mortgage-workspace.tsx`, `app/components/calculators/calculator-metric.tsx`, `app/components/charts/amortization-chart.tsx`
