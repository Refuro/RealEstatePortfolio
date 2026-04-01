# Math & Logic Audit — 2026-04-01

## Executive summary

- All core formula checks **pass**: amortization iteration, property/portfolio metrics, benchmark freshness, and all calculator libs align with `docs/policies/ownership-metrics.md` and `docs/policies/analytics-math-policy.md`.
- The **Medium finding from 2026-03-31** (negative amortization — payment below interest not blocked) is **resolved**: `isNegativeAmortizingPayment` is now exported from `amortization.ts`, guards are added to `getPayoffProjection` and both extra-payment helpers, and `mortgage.ts` enforces the constraint at schema validation with a user-facing error message.
- One new **Low** observation: `fix-and-flip-calculator.ts` `annualizedRoiPercent` can return `NaN` for non-integer `12/holdMonths` exponents when total loss exceeds 100% of cash invested; no practical impact for typical inputs but worth hardening for the educational calculator.
- Overall recommendation: **healthy, ship**; address the annualized-ROI NaN edge case opportunistically.

---

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- None. (Prior Medium — negative amortization — is resolved; see §Module results below.)

### Low

- **`annualizedRoiPercent` NaN when loss > 100% of cash invested** — In `computeFixAndFlipResult`, when `netProfit / totalCashIn < -1`, the expression `Math.pow(1 + totalReturnRatio, 12 / holdMonths)` evaluates to `NaN` for any `holdMonths` that does not divide evenly into 12 (JavaScript returns `NaN` for a negative base raised to a non-integer exponent). Example: holdMonths=7, totalCashIn=$50k, netProfit=−$60k → `Math.pow(-0.2, 1.714...)` → `NaN`. Risk is limited to the educational calculator and only surfaces on extreme loss scenarios; however, the UI must handle `NaN` gracefully. — `app/lib/fix-and-flip-calculator.ts` line 75.

- **STR `annualGrossIncome` is pre-platform-fee gross (carry-forward from 2026-03-31)** — STR side returns `annualGrossStrBookings` (365 × occupancy × nightly rate, before platform fees), while LTR side returns `ltrMetrics.grossAnnualRent` (vacancy-adjusted). The type definition documents this intent; no formula error. Risk is label confusion if UI shows both under the same heading without qualification. — `app/lib/str-ltr-calculator.ts`.

---

## Evidence reviewed

- `app/lib/amortization.ts` (full — all exports including new `isNegativeAmortizingPayment` and `AMORTIZATION_COMPARISON_EPSILON`)
- `app/lib/metrics/property-metrics.ts` (full)
- `app/lib/metrics/portfolio-metrics.ts` (full)
- `app/lib/benchmark-utils.ts` (full)
- `app/lib/public-calculator.ts` (full)
- `app/lib/fix-and-flip-calculator.ts` (full)
- `app/lib/brrr-calculator.ts` (full)
- `app/lib/str-ltr-calculator.ts` (full)
- `app/lib/plans.ts` (RentCast hourly limits)
- `app/lib/validations/mortgage.ts` (full — negative amortization guard)
- `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`
- `docs/process/math-logic-audit.md` (scope, check matrix, reference specs)
- Previous audit: `docs/audits/math/2026-03-31-math-logic-audit.md`

**Limits of this pass:** Export/import call sites, deals API, portfolio-summary-payload, and mortgage-tab UI were not re-read (no formula changes signaled since 2026-03-31; those surfaces passed the prior audit). No runtime test execution.

---

## Risk & impact assessment

The previously identified negative amortization risk is closed at both the validation and computation layers. The remaining Low findings are limited to an educational calculator edge case (NaN on extreme loss) and a display-labeling note on STR gross income. Neither affects portfolio math, payoff projections, or any API/export surface. User-facing exposure is minimal.

---

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` iteration matches spec (interest, principal capped at balance, balance update, 2-decimal rounding) | PASS | |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | |
| Negative amortization guard (mid-loop): `payment + ε < interest` → `[]` | PASS | Inline check equivalent to `isNegativeAmortizingPayment`; not calling the dedicated helper directly (see NOTE) |
| `getPiForAmortization` escrow path; clamp P&I ≥ 0.01 | PASS | |
| `getProjectedBalanceAsOf` before `startDate` → 0 | PASS | |
| `getEffectiveBalance` / `getBalanceSource` staleness: both use 180-day window, identical logic | PASS | |
| `getPayoffProjection` iteration matches `generateAmortizationSchedule`; caps at term | PASS | |
| `getPayoffProjection` pre-loop negative amortization guard via `isNegativeAmortizingPayment` | PASS | **NEW** — resolved 2026-03-31 Medium finding |
| `getPayoffProjection` mid-loop guard | PASS | **NEW** |
| Edge: balance ≤ 0 or payment ≤ 0 → `{ payoffDate: null, remainingAtTermEnd: null }` | PASS | |
| Edge: payment does not amortize → `remainingAtTermEnd` non-null, `payoffDate` null | PASS | |
| `getMonthsToPayoffWithExtraStrict` — same iteration as `getPayoffProjection`; pre- and mid-loop guards | PASS | **NEW** guards |
| `getMonthsToPayoffWithExtraWithTolerance` — same iteration; tolerance path calls `isWithinTermEndTolerance` | PASS | |
| `getExtraPaymentForYearsEarlier` requires strict `payoffDate`; `targetMonths ≤ 0` → null | PASS | |
| `getPayoffYearsWithExtra` `extraPayment < 0` → null; `payoffDate null` → null; rounds months/12 | PASS | |
| Strict vs tolerance split per `analytics-math-policy.md` §3.7 | PASS | |
| `isNegativeAmortizingPayment` function — correct formula; guards balance ≤ 0, pi ≤ 0 | PASS | **NEW** — new function since 2026-03-31 |
| NOTE: `generateAmortizationSchedule` does not call `isNegativeAmortizingPayment` directly | NOTE | Uses inline `monthlyPayment + ε < interest` which is equivalent. No correctness issue; minor code-reuse inconsistency. |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent = monthlyRent × (1 − vacancyPercent/100)` | PASS | |
| `grossAnnualRent = effectiveRent × 12` (pre-scale internally; returned as `effectiveRent × 12 × scale`) | PASS | Matches analytics policy §3.4 (vacancy-adjusted, ownership-scaled annual rent) |
| `annualExpenses = monthlyExpenses × 12` (returned as `× scale`) | PASS | |
| `noi = grossAnnualRent − annualExpenses` (pre-scale); returned as `noi × scale` | PASS | |
| `capRate = noi / estimatedValue` when `estimatedValue > 0` | PASS | Pre-scale noi/V ≡ `(noi × s)/(V × s)` per ownership policy; correct |
| Edge: `estimatedValue = 0` → `capRate null`, `ltv null` | PASS | |
| `monthlyCashFlow` proportional: `(R − E − P) × scale`; full liability: `R×scale − E×scale − P` | PASS | Matches `ownership-metrics.md` §2 table |
| `equity = (V − D) × scale` | PASS | |
| `ltv = D / V` unscaled (property leverage; ownership policy §2) | PASS | |
| `cashOnCashReturn = annualCashFlow / (cashInvested × scale)` | PASS | |
| Edge: `cashInvested null` or `0` → `cashOnCashReturn null` | PASS | |
| `scaleLiabilityAmount`, `getAnnualDebtService`, `computeAnnualCashFlowFromAnnualInputs` consistent with mode | PASS | |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `weightedCapRate = totalNoi / totalMarketValue` (guard on `totalMarketValue > 0`) | PASS | `totalNoi` and `totalMarketValue` are both ownership-scaled; formula correct |
| `portfolioLtv = totalDebt / totalMarketValue` | PASS | `totalDebt` is mode-dependent per policy |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | Guard on `totalCashInvested > 0` |
| `totalAnnualRent` = sum of `metrics.grossAnnualRent` (vacancy-adjusted, ownership-scaled) | PASS | Reconcilable with NOI rent basis per analytics policy §3.4 |
| `totalMonthlyRent = metrics.grossAnnualRent / 12` | PASS | Same effective-R basis as NOI |
| `dscr = totalNoi / totalAnnualDebtService` (guard on `totalAnnualDebtService > 0`) | PASS | |
| `totalDebt` mode-dependent: full liability = full balance; proportional = balance × scale | PASS | |
| Empty `properties` → zeros and nulls | PASS | |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| `BENCHMARK_FRESHNESS_MAX_MS = 60 × 24 × 60 × 60 × 1000` | PASS | |
| `isBenchmarkFresh` / `isBenchmarkFreshAt`: `now − asOf < BENCHMARK_FRESHNESS_MAX_MS` (strict `<`) | PASS | Exactly 60 days old is stale; matches analytics policy §3.6 |
| `getBenchmarkPct`: `marketRent ≤ 0` → `0`; formula `(userRent − marketRent) / marketRent × 100` | PASS | |
| `getBenchmarkLabel`: `|pct| < 1` → `"Rent at market"` | PASS | |
| `getBenchmarkEligibility` / `isBenchmarkComparable` / `shouldOfferBenchmarkRefresh` consistent | PASS | Single eligibility contract across surfaces |

### Calculators (lib)

| Surface | Status | Notes |
|---------|--------|-------|
| `public-calculator.ts` — `computeMonthlyPayment`: percent→decimal, zero-rate fallback, division-by-zero guard (`pow − 1` only after `monthlyRate > 0`) | PASS | |
| `public-calculator.ts` — DSCR uses `metrics.noi / getAnnualDebtService`; guard `annualDebtService > 0` | PASS | |
| `brrr-calculator.ts` — refi loan amount, closing costs, cash-out, net cash left; clamps on all inputs; DSCR guarded | PASS | |
| `fix-and-flip-calculator.ts` — interest-only hold, ROI formula, annualized ROI compound formula | PASS (with Low note) | `annualizedRoiPercent` returns NaN when loss > 100% of cash-in and `holdMonths` does not divide 12 evenly — see Low finding |
| `str-ltr-calculator.ts` — STR net annual from occupancy/fees; LTR vacancy; shared loan; DSCR; `vacancyPercent: 0` for STR | PASS | `annualGrossIncome` semantic difference by side is by design and documented (Low carry-forward) |

### lib/validations/mortgage.ts (negative amortization guard — new since 2026-03-31)

| Check | Status | Notes |
|-------|--------|-------|
| `validateMortgagePiCoversInterestFields` calls `isNegativeAmortizingPayment(pi, balance, rate)` | PASS | **NEW** — directly addresses 2026-03-31 Medium finding |
| `createMortgageSchema.superRefine` integrates P&I guard; error path on `monthlyPayment` field | PASS | |
| `validateEscrowAmount`: escrow < monthlyPayment when present and > 0 | PASS | Prevents escrow strip from producing zero/negative P&I at save time |
| `updateMortgageSchema` (partial) — note: PATCH merges then calls `validateMortgagePiCoversInterestFields` per comment | PASS | Documented in mortgage route; not re-read this pass |

---

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` ↔ `generateAmortizationSchedule` iteration (interest → principal cap → balance) | PASS | Identical logic |
| `getEffectiveBalance` ↔ `getBalanceSource` staleness threshold (180 days) | PASS | Identical `setDate(-180)` and `>=` comparison |
| Mortgage rate stored as decimal; `Number(rate) / 12` for monthly | PASS | Consistent across amortization.ts; calculators take percent and convert `/100/12` |
| `getMonthsToPayoffWithExtraStrict` ↔ `getPayoffProjection` iteration | PASS | |
| API/export strict payoff (`getPayoffProjection`) vs UI tolerance-aware helpers | PASS | Policy §3.7 respected |
| Negative amortization guard in schedule/projection/extra-payment + validation layer | PASS | **NEW** — all four iteration sites now guarded |

---

## Resolved findings (from 2026-03-31)

| Finding | Resolution |
|---------|------------|
| **Medium: negative amortization — payment below interest not blocked** | `isNegativeAmortizingPayment` added as exported helper; pre-loop guard added to `getPayoffProjection`, `getMonthsToPayoffWithExtraStrict`, `getMonthsToPayoffWithExtraWithTolerance`; `validateMortgagePiCoversInterestFields` wired into `createMortgageSchema.superRefine` with user-facing error on `monthlyPayment`; `validateEscrowAmount` prevents escrow strip producing zero P&I at save. **Fully closed.** |

---

## Recommendations (prioritized)

1. **Guard `annualizedRoiPercent` against NaN** — In `computeFixAndFlipResult`, add a `Number.isFinite` check (or clamp `1 + totalReturnRatio` to ≥ 0 before `Math.pow`) so the field is `null` rather than `NaN` for catastrophic-loss scenarios. Minimal change; prevents UI from having to special-case `NaN`.
2. **Confirm STR UI labels distinguish gross vs net income** — Verify that any surface displaying `annualGrossIncome` from the STR side explicitly labels it as "gross before platform fees" to avoid user confusion against the LTR side's vacancy-adjusted figure.
3. **Consider calling `isNegativeAmortizingPayment` in `generateAmortizationSchedule`** — Replace the inline `monthlyPayment + AMORTIZATION_COMPARISON_EPSILON < interest` pre-return with a call to the dedicated helper for consistency. Low-priority code hygiene; no correctness impact.

---

## Task candidates

- [ ] Guard `annualizedRoiPercent` NaN: add `Number.isFinite` / clamp before `Math.pow` in `fix-and-flip-calculator.ts` line ~73–75; update or add test case for >100% loss scenario.

---

## Re-test checklist

- [ ] Verify `annualizedRoiPercent` NaN fix: unit test with holdMonths=7, netProfit < −totalCashIn confirms `null` (not `NaN`).
- [ ] Regression: `npm run check` after any code change.
- [ ] On next mortgage-validation change: confirm `updateMortgageSchema` PATCH path still calls `validateMortgagePiCoversInterestFields` after row merge.

---

## Next trigger and cadence

- **Trigger:** Monthly or after any change to `app/lib/amortization.ts`, `app/lib/metrics/*`, benchmark freshness logic, export/deal/mortgage metric payloads, or calculator files.
- **Recommended next window:** 2026-05-01 or on the next release touching analytics math.

---

## Findings / recommendations (math-lane index)

No FAIL rows in any module table. One Low finding (annualized ROI NaN) in the educational fix-and-flip calculator; one Low carry-forward (STR gross income label). Prior Medium fully resolved.

---

## Changelog (audit scope)

- **2026-04-01:** Routine monthly audit. Scope: amortization (all exports including new `isNegativeAmortizingPayment`), property-metrics, portfolio-metrics, benchmark-utils, public/brrr/fix-and-flip/str-ltr calculators, plans.ts, mortgage validation. Prior Medium (negative amortization) confirmed resolved. New Low: fix-and-flip `annualizedRoiPercent` NaN edge case.
- **2026-03-31:** Initial audit. See `docs/audits/math/2026-03-31-math-logic-audit.md`.
