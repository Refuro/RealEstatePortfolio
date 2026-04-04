# Math & Logic Audit — 2026-04-03 (Run 2)

## Executive summary

- **Fix verified:** The morning Ship item — payoff-years extra-payment simulation cap missing `getPaymentStartLagMonths` lag — is correctly resolved in both `getPayoffYearsWithExtra` and `getPayoffYearsWithExtraWithTolerance` (lines 652 and 687 of `app/lib/amortization.ts`). A dedicated regression test (`amortization.test.ts` lines 536–552) confirms the contract for a mid-month closing with lag = 2.
- **New surface — embedded mockup data:** Three planned mockup components (`DashboardMockup`, `MortgageMockup`, `DealAnalyzerMockup`) carry hardcoded display values. The `DealAnalyzerMockup` numbers are exact; `MortgageMockup` is directionally correct and anchored to the Westport fixture. `DashboardMockup` has one Low inconsistency: NOI and Annual rent are both displayed as $55,290, implying zero portfolio-wide expenses — realistic-looking for the other cards but misleading for visitors who understand rental economics.
- **Calculator libs (`str-ltr-calculator.ts`, `fix-and-flip-calculator.ts`, `calculator-metric-tones.ts`):** All formulas match spec and policy. Edge cases (zero payment, negative inputs, loss > 100% of cash-in) are guarded. Two minor observations are noted below but no failures.

---

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- None. Morning's medium finding (payoff-years lag cap) is resolved — see §Verified fix below.

### Low

- **DashboardMockup: Annual rent = NOI = $55,290 implies zero portfolio expenses** — `docs/plans/2026-04-03-embedded-mockups-plan.md` "Metric row 2". Annual rent and NOI are identical values. Per `ownership-metrics.md` §2, `NOI = (R − E) × 12 × s` and `Annual rent = R × 12 × s`; equality holds only when `E = 0`. An informed visitor comparing both cards will conclude there are no expenses, which undermines credibility. No code fix required (mockup is presentational); curate the numbers so that NOI < Annual rent by a plausible expense delta before implementation.

- **`StrLtrSideResult.annualGrossIncome` has different semantic bases per side** — `app/lib/str-ltr-calculator.ts` lines 142–155. For STR the field is pre-platform-fee gross bookings (`annualGrossStrBookings`); for LTR it is vacancy-adjusted effective annual rent (`ltrMetrics.grossAnnualRent`). The type-level JSDoc comment documents this difference correctly, but any UI that labels both sides with a shared "Annual gross income" heading without qualification will silently misrepresent the LTR figure as pre-vacancy rather than post-vacancy. Low risk today (no UI component yet uses this calc); worth a UI-layer annotation before shipping the STR/LTR calculator page.

- **Benchmark % uses contract rent; metrics use effective vacancy-adjusted rent** — carried from morning audit (unchanged). `app/lib/property-utils.ts` `getPropertyTotalRent` vs `computePropertyMetrics` effective rent. Copy/tooltip clarification recommended; no code change needed.

- **Negative-amortization detection epsilon asymmetry** — carried from morning audit (unchanged). `generateAmortizationSchedule` / payoff loops use `payment + EPSILON < interest`; `projectStoredBalanceForward` uses `pi <= interest`. Boundary behaviour at exact interest-only equality differs across modules. No user-visible impact identified; document in code review checklist.

---

## Verified fix: payoff-years extra-payment lag cap (morning Ship item)

**Before fix (morning FAIL):** `getPayoffYearsWithExtra` and `getPayoffYearsWithExtraWithTolerance` computed `remainingTermMonths` as `termYears × 12 − monthsSinceStart` without adding `lagMonths`, passing a shorter window to the inner strict/tolerance helpers and silently truncating the simulation near term end.

**After fix (confirmed):**

`app/lib/amortization.ts` line 652 (`getPayoffYearsWithExtra`):
```
const remainingTermMonths = Math.max(0, termYears * 12 - monthsSinceStart + lagMonths);
```

`app/lib/amortization.ts` line 687 (`getPayoffYearsWithExtraWithTolerance`):
```
const remainingTermMonths = Math.max(0, termYears * 12 - monthsSinceStart + lagMonths);
```

Both now mirror the same lag-inclusive formula used inside `getMonthsToPayoffWithExtraStrict` (lines 460–462) and `getPayoffProjection` (lines 376–377).

**Regression test** (`app/lib/amortization.test.ts` lines 536–552):
- Fixture: 30-year loan, startDate Jan 15 2020 (mid-month → inferred lag = 2), currentBalance = $100, systemTime = 2050-01-15 (near term end).
- Asserts `getPaymentStartLagMonths` = 2.
- Asserts `getPayoffYearsWithExtra(mortgage, 0)` = `0` (not `null`).
- Asserts `getPayoffYearsWithExtraWithTolerance(mortgage, 0)` = `0` (not `null`).
- Comment confirms the pre-fix failure: "before lag-inclusive cap, this returned null at term end."

Fix is correct and fully regression-tested. Both FAIL items from the morning audit are resolved.

---

## Embedded mockup data verification

### `DashboardMockup` (plan lines 57–65)

| Check | Result | Working |
|---|---|---|
| Equity = value − debt | PASS | $819,700 − $462,800 = $356,900 ✓ |
| LTV = debt / value | PASS | $462,800 / $819,700 = 56.46% → displays 56.5% ✓ |
| Cap rate = NOI / value | PASS | $55,290 / $819,700 = 6.745% → displays 6.75% ✓ |
| DSCR → monthly cash flow chain | PASS | Annual DS = $55,290 / 1.72 = $32,145/yr = $2,679/mo; CF = $55,290/12 − $2,679 = $1,929 ≈ $1,930 ✓ |
| Rent-vs-market pill counts | PASS | Above: 2 (Pine Cottage, Westport), Below: 1 (Oak Street), Aligned: 0 ✓ |
| NOI = Annual rent (inconsistency) | **LOW** | Both $55,290 → implies $0 portfolio expenses; see Finding above |

### `MortgageMockup` (plan lines 69–77)

| Check | Result | Working |
|---|---|---|
| Time saved = baseline − scenario | PASS | July 2053 − July 2043 = 10 years ✓ |
| P&I = $1,835/mo | PASS | Matches Westport test fixture: `getPiForAmortization(westport) ≈ 1835.08` (`amortization.test.ts` line 468) ✓ |
| Balance $288,084 at 6.25% | PASS | Consistent with Westport fixture (currentBalance $288,417 in test, $288,084 is a slightly earlier snapshot) ✓ |
| $443 extra/mo → ~207 months → July 2043 | PASS | Monthly rate 0.5208%; payment $2,278; n ≈ ln(2278/777.9)/ln(1.005208) ≈ 207 months from Apr 2026 ≈ July 2043 ✓ |
| Interest saved $129,773 plausible | PASS | Rough estimate: baseline remaining interest ~$311K, scenario remaining interest ~$183K, delta ~$128K; within ~1.4% of stated $129,773 (rounding from exact schedule) ✓ |

### `DealAnalyzerMockup` (plan lines 80–93)

Assumptions from plan: purchase = value = $450,000, rent = $4,200, expenses = $400, vacancy = 5%, balance = $300,000, payment = $2,650, cash invested = $150,000.

| Check | Result | Working |
|---|---|---|
| Effective rent | PASS | $4,200 × (1 − 0.05) = $3,990/mo ✓ |
| Monthly cash flow $940 | PASS | $3,990 − $400 − $2,650 = **$940** (exact) ✓ |
| NOI | PASS | ($3,990 − $400) × 12 = $43,080/yr |
| Cap rate 9.57% | PASS | $43,080 / $450,000 = 9.573% → **9.57%** ✓ |
| DSCR 1.35 | PASS | $43,080 / ($2,650 × 12) = $43,080 / $31,800 = 1.355 → **1.35** ✓ |
| Tone signals per policy | PASS | CF $940 ≥ 0 → green ✓; DSCR 1.35 ≥ 1.0 → green ✓; cap rate → always default ✓ |

---

## Module results

### lib/amortization.ts — payoff lag fix (re-audit)

| Check | Status | Notes |
|---|---|---|
| `getPayoffYearsWithExtra` includes `+ lagMonths` in cap | **PASS** | Line 652; previously FAIL. Fixed. |
| `getPayoffYearsWithExtraWithTolerance` includes `+ lagMonths` | **PASS** | Line 687; previously FAIL. Fixed. |
| Regression test for lag-2 mid-month mortgage near term end | **PASS** | `amortization.test.ts` lines 536–552; added as part of fix |
| Cap formula matches `getMonthsToPayoffWithExtraStrict` internal formula | **PASS** | Lines 460–462 vs 646–652; identical `termYears*12 − monthsSinceStart + lag` pattern |
| All other morning PASS results | **PASS** | Unchanged; full table in morning audit `2026-04-03-math-logic-audit.md` |

### lib/str-ltr-calculator.ts

| Check | Status | Notes |
|---|---|---|
| STR revenue: nights = 365 × occ%; gross = nights × rate; net = gross × (1 − fee%) | PASS | Lines 97–100 |
| STR effective monthly = net annual / 12 | PASS | Line 100 |
| LTR effective rent = rent × (1 − vacancy/100) | PASS | Line 139 |
| STR vacancyPercent = 0 in `computePropertyMetrics` (no double-count) | PASS | Line 111 |
| DSCR = NOI / annualDebtService; both proportional-scaled | PASS | Lines 116–121, 136; consistent with ownership-metrics §2 |
| Zero payment → DSCR null (not divide-by-zero) | PASS | `annualDebtService > 0` guard lines 121, 136 |
| `sanitize()`: negative inputs floored, percentages clamped [0, 100], ownershipPercent defaults to 100 when non-positive | PASS | Lines 54–88 |
| NaN/Infinity: all formula outputs finite after sanitize | PASS | Tests confirm (`str-ltr-calculator.test.ts` lines 77–84) |
| `annualGrossIncome` label semantic asymmetry (STR pre-fee vs LTR post-vacancy) | NOTE | Documented in JSDoc; potential UI label risk if field is displayed without qualification |

### lib/fix-and-flip-calculator.ts

| Check | Status | Notes |
|---|---|---|
| Interest-only model: monthlyInterest = loanAmount × rate/100/12 | PASS | Lines 57–58; model stated in file header |
| totalCashIn = down + rehab + holding interest + carrying costs | PASS | Line 61 |
| loanPayoff = initial loanAmount (no principal reduction during hold) | PASS | Line 65; correct per IO model |
| netProfit = saleProceeds − sellingCosts − loanPayoff − totalCashIn | PASS | Lines 63–67 |
| grossSaleProceeds clamped ≥ 0 | PASS | `Math.max(0, arv − sellingCosts)` line 64 |
| roiPercent = 0 when totalCashIn = 0 (no divide-by-zero) | PASS | Line 69 |
| annualizedRoi: compound formula; NaN guard when loss > 100% | PASS | Lines 72–79; `1 + ratio > 0` prevents NaN/complex result |
| annualizedRoi null when holdMonths = 0 | PASS | Lines 73–79; guard on `holdMonths > 0` |
| holdMonths capped at 120 (10 years) | PASS | Line 48 |
| Sanitization: negative prices, out-of-range percents | PASS | Lines 46–53; tests lines 102–116 |
| cashOnCashReturnPercent = roiPercent | PASS / NOTE | Correct for IO flip model (no hold period income); comment documents the basis |

### lib/calculator-metric-tones.ts

| Check | Status | Notes |
|---|---|---|
| DSCR thresholds: null/NaN→default; ≥1→positive; [0.9,1)→warning; <0.9→negative | PASS | Lines 24–29; matches policy exactly |
| Cash flow: ≥0→positive; <0→negative | PASS | Lines 31–33 |
| Cash flow: Infinity/NaN→default defensive guard | PASS | `!Number.isFinite` check line 32 |
| CoC: null/NaN→default; ≥0→positive; <0→negative | PASS | Lines 37–40 |
| Cap rate: always default | PASS | Line 43; matches policy: "no good/bad semantics" |
| `getCapRateTone` has no unit test | NOTE | Trivially `return "default"`; zero logic to test; acceptable |
| CSS token classes match design system | PASS | `text-positive`, `text-warning`, `text-negative`, `text-foreground` lines 9–22 |

---

## Cross-module consistency

| Rule | Status | Notes |
|---|---|---|
| `getPayoffYearsWithExtra` and `getMonthsToPayoffWithExtraStrict` use same lag-inclusive remaining months | **PASS** | Fixed this morning; verified both sites |
| `getPayoffYearsWithExtraWithTolerance` and `getMonthsToPayoffWithExtraWithTolerance` lag consistency | **PASS** | Fixed this morning |
| STR/LTR DSCR uses same annualDebtService denominator for both sides | PASS | Lines 116–121, 136 |
| `computePropertyMetrics` called correctly for STR (vacancy=0) and LTR (vacancy=input) | PASS | Lines 102–113, 123–134 |
| Fix-and-flip IO model explicitly documents loanPayoff = initial balance (no amortization) | PASS | File header + line 65 comment |
| All remaining morning PASS rules | PASS | See morning audit for full cross-module table |

---

## Evidence reviewed

### Process and policy

- `docs/process/math-logic-audit.md`
- `docs/process/audit-report-template.md`
- `docs/policies/ownership-metrics.md`
- `docs/policies/analytics-math-policy.md` (§3.7 strict vs tolerance, §3.4 annual rent vs NOI)
- `docs/policies/calculator-metric-tones.md`

### Morning audit

- `docs/audits/math/2026-04-03-math-logic-audit.md` (FAIL items, low items, all PASS tables)

### Plans (new surface)

- `docs/plans/2026-04-03-embedded-mockups-plan.md` — hardcoded values for `DashboardMockup` (lines 57–65), `MortgageMockup` (lines 69–77), `DealAnalyzerMockup` (lines 80–93)

### Implementation

- `app/lib/amortization.ts` — lines 440–476 (`getMonthsToPayoffWithExtraStrict`), lines 600–697 (`getPayoffYearsWithExtra`, `getPayoffYearsWithExtraWithTolerance`)
- `app/lib/str-ltr-calculator.ts` (full file)
- `app/lib/fix-and-flip-calculator.ts` (full file)
- `app/lib/calculator-metric-tones.ts` (full file)

### Tests

- `app/lib/amortization.test.ts` — full file; focus on lines 536–552 (lag regression), lines 555–591 (hybrid payoff contract)
- `app/lib/str-ltr-calculator.test.ts` (full file)
- `app/lib/fix-and-flip-calculator.test.ts` (full file)
- `app/lib/calculator-metric-tones.test.ts` (full file)

### Assumptions / limits

- Math verification for mockup numbers is analytical (pencil-and-paper trace); implementation of mockup components does not yet exist so no runtime check was possible.
- Interest-saved figure for `MortgageMockup` ($129,773) is confirmed as plausible via approximate schedule arithmetic (rough estimate $128K; exact figure requires running the actual schedule from a specific balance snapshot date).
- `brrr-calculator.ts` is in scope for a future audit run but was not listed in this audit's explicit scope; test file exists at `app/lib/brrr-calculator.test.ts`.

---

## Risk & impact assessment

- **Fix confirmed (payoff lag):** The morning's Ship item is resolved. Narrow but real edge case (loans near end of term with mid-month closing) no longer returns `null` or an understated years figure. Regression test is in place.
- **DashboardMockup NOI = Annual rent:** Marketing surface only (no production data at risk). Risk is **credibility**: a landlord or real-estate literate visitor will notice the anomaly and distrust the mockup. Fix before component is built.
- **`StrLtrSideResult.annualGrossIncome` asymmetry:** No UI surface exists yet; risk materializes when the calculator page is built. Low urgency.
- **Two carried Low items (benchmark rent basis, negative-amort epsilon):** No new evidence of user-visible impact; priority unchanged.

---

## Recommendations (prioritized)

1. **Revise DashboardMockup expense baseline before implementation.** Choose a realistic monthly expense total (e.g., $1,000–$1,200/mo portfolio-wide) so that Annual rent > NOI. A consistent set: if Annual rent = $58,500, Expenses = $3,210/yr ≈ $268/mo → NOI ≈ $55,290. Or raise Annual rent to $58,500 and keep NOI = $55,290, making expenses = $3,210/yr — credible numbers.
2. **Apply a UI-layer label or helper text** for `annualGrossIncome` on the STR/LTR calculator page to make the basis difference explicit ("Gross bookings before fees" for STR, "Effective annual rent" for LTR) before the calculator page ships.
3. **Carry forward the two open Low items** from the morning audit into the next relevant release review (benchmark copy clarification; negative-amort epsilon audit note). No immediate action needed.

---

## Task candidates

- [ ] Revise DashboardMockup hardcoded metric row 2 numbers: set Annual rent ≠ NOI so expense delta is realistic (small, < 1-hour task on the plan document before component is built).
- [ ] Add UI-layer qualifier to `annualGrossIncome` field in the STR/LTR calculator component (when built): "Gross bookings (before fees)" / "Effective annual rent".

---

## Re-test checklist

- [x] `getPayoffYearsWithExtra` lag regression — passes (`amortization.test.ts` line 536–552)
- [x] `getPayoffYearsWithExtraWithTolerance` lag regression — passes (same fixture, line 551)
- [ ] Revise DashboardMockup mockup numbers, then re-verify equity/LTV/DSCR/cap rate chain with updated values
- [ ] After `MockupFrame` + `DealAnalyzerMockup` components built: spot-check rendered CF, cap rate, DSCR values match verified working above
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Implementation of any mockup component (to confirm displayed values match plan); any change to `str-ltr-calculator.ts`, `fix-and-flip-calculator.ts`, or the BRRR calculator; next amortization or ownership-metrics change.
- **Recommended next run:** Before or immediately after the embedded mockup components ship; or include BRRR calculator in the next scheduled math audit pass.

---

## Changelog (audit scope)

- **2026-04-03 AM:** Math & Logic lane — scope: `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`. Found payoff-years lag cap FAIL (medium).
- **2026-04-03 PM (this run):** Re-verified payoff lag fix; audited `app/lib/str-ltr-calculator.ts`, `app/lib/fix-and-flip-calculator.ts`, `app/lib/calculator-metric-tones.ts`; verified hardcoded numbers in `docs/plans/2026-04-03-embedded-mockups-plan.md` (DashboardMockup, MortgageMockup, DealAnalyzerMockup). New Low finding: DashboardMockup NOI = Annual rent implies zero expenses.
