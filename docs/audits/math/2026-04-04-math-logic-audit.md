# Math & Logic Audit — 2026-04-04

## Executive summary

- All core formulas across amortization, property metrics, portfolio metrics, and benchmark utilities **match their specifications exactly** — no Critical or High findings.
- Two **Medium** spec-vs-implementation gaps were identified: (1) `getEffectiveBalance` implements a 3-tier staleness model ("stored / stored_projected / projected") that the process doc still describes as a simpler 2-tier model, and (2) `capRate` is computed from unscaled NOI while the returned `noi` field is ownership-scaled — correct behavior but not made explicit in the spec, creating a potential consumer confusion hazard.
- Two **Low** observations (NaN input guard absence, minor rounding inconsistency in `getPayoffYearsWithExtra`) warrant documentation but not immediate code changes.
- **Overall health: GOOD.** The codebase can be safely used for production amortization, payoff, and analytics calculations.

---

## Severity-ranked findings

### Critical
_None._

### High
_None._

### Medium

- **M1 — Spec outdated: `getEffectiveBalance` 2-tier vs. 3-tier staleness model** — The process doc (§2.1) says "balanceAsOfDate within 6 months → return currentBalance." The implementation has a more sophisticated 3-tier model: (a) same calendar month → return `currentBalance` as-is; (b) prior month but within 6 months → project forward via `projectStoredBalanceForward`; (c) older than 6 months or absent → project from original amortization. The behavior is correct and superior, but the spec description is stale. Callers reading the spec alone would not know about the forward-projection leg. — `app/lib/amortization.ts` lines 204–224.

- **M2 — `capRate` uses full (unscaled) NOI; returned `noi` is ownership-scaled** — In `computePropertyMetrics`, `capRate = fullNoi / estimatedValue` where `fullNoi = (effectiveRent×12) − (monthlyExpenses×12)` before any ownership scaling. The returned `noi` field is `fullNoi × ownershipScale`. A caller who assumes `capRate = returnedNoi / estimatedValue` would get an incorrect result for partial-ownership properties. The code is correct (cap rate is always a property-level metric), but the spec (§2.2) does not state this distinction explicitly. — `app/lib/metrics/property-metrics.ts` lines 94–120.

### Low

- **L1 — No NaN guard on numeric inputs to `generateAmortizationSchedule` / `getPayoffProjection`** — If `annualInterestRate` or `monthlyPayment` is `NaN` (e.g., from a corrupt DB record), the schedule loop will propagate `NaN` through every row without an early exit. The existing `<= 0` guard does not catch `NaN`. Upstream validation likely prevents this in practice, but there is no in-function fence. — `app/lib/amortization.ts` lines 55–90.

- **L2 — `getPayoffYearsWithExtra` rounds months/12 to nearest integer** — The spec (§2.1) says `return round(months/12)`. A result of e.g. 11 months returns `round(11/12) = 1`, while 1 month returns `round(1/12) = 0`. A zero result is not guarded; the function would return `0` rather than `null` for a payoff under 6 months away. This is unlikely in real data but worth a defensive `Math.max(1, ...)` or a `months === 0` null-return guard. — `app/lib/amortization.ts` line 690.

---

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: `interest = balance × monthlyRate` | PASS | Line 68: `balance * monthlyRate`; `monthlyRate = annualInterestRate / 12` (line 59). |
| `generateAmortizationSchedule`: `principal = min(payment − interest, balance)` | PASS | Lines 72–78: `principal = payment − interest`; `if (principal >= balance) principal = balance`; `Math.max(0, principal)`. Equivalent to `min(max(0, payment−interest), balance)`. |
| `generateAmortizationSchedule`: `balance = max(0, balance − principal)` | PASS | Line 80: `balance = Math.max(0, balance - principal)`. |
| `generateAmortizationSchedule`: edge — originalLoanAmount ≤ 0 or monthlyPayment ≤ 0 → `[]` | PASS | Lines 55–57 explicit guard. |
| `generateAmortizationSchedule`: per-row rounding to 2 decimals | PASS | Lines 85–89: `Math.round(x * 100) / 100` for payment, principal, interest, balance. |
| `getPiForAmortization`: escrowIncluded + escrowAmount > 0 → subtract, clamp ≥ 0.01 | PASS | Lines 126–128: `Math.max(0.01, monthlyPayment - escrowAmount)`. |
| `getPiForAmortization`: no escrow → return monthlyPayment | PASS | Line 130. |
| `getProjectedBalanceAsOf`: asOfDate before startDate → 0 | PASS | Line 148: `if (asOf < startNorm) return 0`. |
| `getProjectedBalanceAsOf`: empty schedule → 0 | PASS | Line 142. |
| `getEffectiveBalance`: staleness threshold is 180 days | PASS | Lines 201–202: `sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180)`. |
| `getEffectiveBalance`: within 6 months → uses stored/projected balance | NOTE | **M1**: within-6-months leg now projects stored balance forward when statement is from a prior month (3-tier, not 2-tier per spec). Behavior is correct. |
| `getEffectiveBalance`: > 6 months or null → project from amortization; fallback to currentBalance if 0 | PASS | Lines 215–224. |
| `getBalanceSource`: staleness threshold consistent with `getEffectiveBalance` | PASS | Lines 242–243: same `setDate(getDate() - 180)` pattern. Returns "stored", "stored_projected", "projected". |
| `getPayoffProjection`: balance ≤ 0 or payment ≤ 0 → `{payoffDate: null, remainingAtTermEnd: null}` | PASS | Lines 391–393. |
| `getPayoffProjection`: negative amortization → `{payoffDate: null, remainingAtTermEnd: Math.round(balance)}` | PASS | Lines 396–398. Spec only specifies balance ≤ 0 / payment ≤ 0 cases; negative-amortization handling is an intentional extension. |
| `getPayoffProjection`: iteration matches `generateAmortizationSchedule` logic | PASS | Lines 413–427 mirror lines 68–80 exactly (interest, principal clamping, balance update). |
| `getPayoffProjection`: payment doesn't amortize → payoffDate null, remainingAtTermEnd returned | PASS | Lines 435–438 return remaining balance when loop exhausts. |
| `getPayoffProjection`: uses `Number(mortgage.interestRate) / 12` for monthly rate | PASS | Line 383. |
| `getMonthsToPayoffWithExtraStrict`: iteration identical to `getPayoffProjection` | PASS | Lines 497–503 match canonical pattern. |
| `getMonthsToPayoffWithExtraWithTolerance`: iteration identical to strict variant | PASS | Lines 547–553 identical iteration; adds tolerance check at cap. |
| `getExtraPaymentForYearsEarlier`: returns null when `projection.payoffDate` is null | PASS | Line 571. |
| `getExtraPaymentForYearsEarlier`: returns null when `targetMonths ≤ 0` | PASS | Line 582. |
| `getExtraPaymentForYearsEarlier`: result is rounded dollar via `Math.round` | PASS | Line 601. |
| `getPayoffYearsWithExtra`: extraPayment < 0 → null | PASS | Line 667. |
| `getPayoffYearsWithExtra`: returns null when base projection has no payoffDate | PASS | Line 669. |
| `getPayoffYearsWithExtra`: returns `Math.round(months / 12)` | PASS | Line 690. Note L2 re: near-zero months. |
| NaN guard on numeric inputs to schedule/projection functions | NOTE | **L1**: `NaN` passes the `<= 0` guard and silently corrupts output. No in-function fence. |
| `annualInterestRate` stored as decimal (not percent) | PASS | JSDoc and type signatures confirm decimal. No `/100` conversion in any iteration loop. |

---

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent = monthlyRent × (1 − vacancyPercent/100)` | PASS | Line 92. `vacancyPercent` defaults to 5 (line 87). |
| `grossAnnualRent = effectiveRent × 12` | PASS | Line 94 (pre-scale intermediate); returned scaled at line 118. |
| `annualExpenses = monthlyExpenses × 12` | PASS | Line 95 (pre-scale); returned scaled at line 119. |
| `noi = grossAnnualRent − annualExpenses` | PASS | Line 96 (pre-scale); returned scaled at line 120. |
| `capRate = noi / estimatedValue` (estimatedValue > 0) | PASS | Line 97: `estimatedValue > 0 ? noi / estimatedValue : null`. Uses unscaled `noi`. |
| `capRate` uses unscaled (full-property) NOI | NOTE | **M2**: correct property-level metric, but spec does not state this; returned `noi` is ownership-scaled. |
| `capRate` null when `estimatedValue = 0` | PASS | Line 97: ternary guard. |
| `monthlyCashFlow` — proportional mode: `(effectiveRent − expenses − payment) × scale` | PASS | Lines 101–103. |
| `monthlyCashFlow` — full_liability mode: `effectiveRent×scale − expenses×scale − payment` | PASS | Lines 101–103. |
| `equity = (estimatedValue − totalMortgageBalance) × scale` | PASS | Line 108. |
| `ltv = totalMortgageBalance / estimatedValue` (estimatedValue > 0) | PASS | Line 111. |
| `ltv` null when `estimatedValue = 0` | PASS | Line 111: ternary guard. |
| `cashOnCashReturn = annualCashFlow / cashInvestedScaled` (cashInvested > 0) | PASS | Lines 113–115. `cashInvestedScaled = cashInvested * scale`. |
| `cashOnCashReturn` null when `cashInvested = 0` or null | PASS | Lines 113–115: both `null` and `≤ 0` produce null return. |
| Division-by-zero guards | PASS | `capRate` and `ltv` guarded on `estimatedValue > 0`; `cashOnCashReturn` guarded on `cashInvestedScaled > 0`. |

---

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| Empty properties array → zeros and nulls | PASS | Lines 42–60: explicit early return with all-zero struct and `null` for ratio fields. |
| `weightedCapRate = totalNoi / totalMarketValue` | PASS | Line 107: `totalMarketValue > 0 ? totalNoi / totalMarketValue : null`. `totalNoi` aggregates `metrics.noi` (ownership-scaled NOI), `totalMarketValue` aggregates `estimatedValue × scale`. Ratio is self-consistent. |
| `portfolioLtv = totalDebt / totalMarketValue` | PASS | Line 108: `totalMarketValue > 0 ? totalDebt / totalMarketValue : null`. |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | Lines 109–110: `totalCashInvested > 0 ? (totalMonthlyCashFlow * 12) / totalCashInvested : null`. |
| `dscr = totalNoi / totalAnnualDebtService` | PASS | Lines 104–105: `totalAnnualDebtService > 0 ? totalNoi / totalAnnualDebtService : null`. |
| `totalDebt`: full_liability mode uses 100% debt; proportional uses scaled debt | PASS | Lines 93–97. |
| `totalCashInvested`: scaled by ownership; skips null/zero cashInvested | PASS | Lines 99–101. |
| Division-by-zero guards on all ratio fields | PASS | `dscr`, `weightedCapRate`, `portfolioLtv`, `portfolioCashOnCashReturn` all guarded. |

---

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| `BENCHMARK_FRESHNESS_MAX_MS = 60 × 24 × 60 × 60 × 1000` | PASS | Line 13: exactly 60 full days in milliseconds. |
| `isBenchmarkFresh`: strictly `< BENCHMARK_FRESHNESS_MAX_MS` (exclusive upper bound) | PASS | Line 34: `nowMs - asOfDate.getTime() < BENCHMARK_FRESHNESS_MAX_MS`. Exactly 60 days old is NOT fresh. Matches spec §1.1. |
| `getBenchmarkDaysAgo`: `Math.floor(ms / day)` | PASS | Line 49. |
| `getBenchmarkPct = (userRent − marketRent) / marketRent × 100` | PASS | Lines 58–61. |
| `getBenchmarkPct`: `marketRent ≤ 0 → 0` | PASS | Line 59: `if (marketRent <= 0) return 0`. Division-by-zero guard. |
| `getBenchmarkLabel`: `abs(pct) < 1 → "Rent at market"` | PASS | Line 77. |
| `getBenchmarkLabel`: above/below market strings | PASS | Lines 78–79. |
| `getBenchmarkEligibility`: single-source-of-truth eligibility logic | PASS | Lines 86–109. Dispatches `isBenchmarkFreshAt` internally; consistent with `isBenchmarkFresh`. |

---

### lib/plans.ts — RENTCAST_HOURLY_LIMITS

| Check | Status | Notes |
|-------|--------|-------|
| `RENTCAST_HOURLY_LIMITS` values: free=5, investor=10, pro=20 | PASS | Lines 26–30. Matches JSDoc and `docs/reference/rentcast-quota.md` note in JSDoc. |
| `getRentCastHourlyLimit`: unknown tier falls back to `free` (5) | PASS | Line 49: `?? RENTCAST_HOURLY_LIMITS.free`. |
| Shared pool comment documented in code | PASS | JSDoc on `RENTCAST_HOURLY_LIMITS` explains shared pool semantics (lines 20–25). |

---

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` and `generateAmortizationSchedule` use identical iteration logic | PASS | Both: `interest = balance × monthlyRate`; `principal = payment − interest`; `if (principal >= balance) principal = balance`; `principal = Math.max(0, principal)`; `balance = Math.max(0, balance − principal)`. |
| `getMonthsToPayoffWithExtraStrict` uses same iteration logic as `getPayoffProjection` | PASS | Lines 497–503 in the strict variant are character-for-character the same canonical pattern. |
| `getEffectiveBalance` and `getBalanceSource` use identical 180-day staleness threshold | PASS | Both use `setDate(getDate() - 180)`. Both check `balanceAsOf >= sixMonthsAgo`. |
| All mortgage rate usage: stored as decimal; `Number(rate) / 12` for monthly | PASS | `AmortizationInput` takes `number`; `MortgageRecord.interestRate` is `number \| {toString()}` and is always wrapped in `Number()` before `/12` in `getPayoffProjection`, `projectStoredBalanceForward`, `getMonthsToPayoffWithExtraStrict`, `getMonthsToPayoffWithExtraWithTolerance`, `getRefinanceProjection`. No percent-to-decimal conversion occurs in any iteration. |
| `getExtraPaymentForYearsEarlier` uses strict projection/strict months functions | PASS | Lines 570, 590, 598 use `getPayoffProjection` and `getMonthsToPayoffWithExtraStrict` only. Tolerance variants use their own paired functions. |

---

## Evidence reviewed

| File | Lines reviewed |
|------|----------------|
| `app/lib/amortization.ts` | 1–897 (full file) |
| `app/lib/metrics/property-metrics.ts` | 1–129 (full file) |
| `app/lib/metrics/portfolio-metrics.ts` | 1–130 (full file) |
| `app/lib/benchmark-utils.ts` | 1–137 (full file) |
| `app/lib/plans.ts` | 1–72 (full file) |
| `docs/process/math-logic-audit.md` | Full (spec reference) |
| `docs/process/audit-report-template.md` | Full (template reference) |

**Audit limitations:**
- No runtime testing was performed; all analysis is static code tracing.
- Consumers of these modules (API routes, UI components) were not audited in this pass; rate and formula inputs from outside these modules are assumed valid.
- Floating-point accumulation over long schedules (e.g., 30-year loans) was not numerically stress-tested; all rounding checkpoints were verified to exist.

---

## Risk & impact assessment

| Finding | Business impact | Likelihood of manifesting |
|---------|-----------------|---------------------------|
| M1 — Spec/code divergence for `getEffectiveBalance` | Low: code behavior is correct and better than spec. Risk is developer misimplementation when reading the spec. | Low in production; Medium during onboarding of new contributors. |
| M2 — `capRate` uses full NOI; `noi` return is scaled | Low: cap rate shown to users is always property-level (correct). Risk is developer misuse if building a new feature that derives cap rate from the returned `noi` field. | Low until new consumer code is written. |
| L1 — No in-function NaN guard | Low: upstream validation in API routes and schema parsing should prevent `NaN` inputs. If a NaN escapes, the amortization schedule would silently contain NaN rows, which would display as "NaN" in the UI but not cause a crash. | Very low in production; nonzero in test/dev with raw mock data. |
| L2 — `getPayoffYearsWithExtra` can return 0 for < 6-month payoffs | Negligible: edge case only reachable for nearly-paid-off mortgages. Would display "0 years" rather than null in UI, a cosmetic anomaly. | Very low in practice. |

---

## Recommendations (prioritized)

1. **Update `docs/process/math-logic-audit.md` §2.1** to reflect the actual 3-tier `getEffectiveBalance` model — "stored" (same month), "stored_projected" (prior month within 180 days, stepped forward), "projected" (older or absent). This keeps the spec accurate for future contributors and prevents the existing behavior from being accidentally "simplified" away. _(Documentation only, no code change.)_

2. **Annotate `computePropertyMetrics` return type** to clarify that `capRate` is always a full-property metric computed from unscaled NOI, while `noi`, `grossAnnualRent`, and `annualExpenses` in the return struct represent the owner's proportional share. A one-line JSDoc comment on `PropertyMetrics.capRate` would be sufficient. _(Documentation only, no code change.)_

3. **Add a NaN guard in `generateAmortizationSchedule` and `getPayoffProjection`** (optional, defensive): `if (!isFinite(annualInterestRate) || !isFinite(monthlyPayment))` early return. Prevents silent NaN propagation if upstream validation ever has a gap. _(Low-effort code hardening.)_

4. **Guard `getPayoffYearsWithExtra` against a 0-month result**: after `const months = getMonthsToPayoffWithExtraStrict(...)`, add `if (months === 0) return null` before the `Math.round`. _(One-line code change.)_

---

## Task candidates

- [ ] Update `docs/process/math-logic-audit.md` §2.1 to describe 3-tier `getEffectiveBalance` staleness model (stored / stored_projected / projected).
- [ ] Add JSDoc to `PropertyMetrics.capRate` clarifying it uses full-property (unscaled) NOI.
- [ ] Add `isFinite` NaN guard at top of `generateAmortizationSchedule` and `getPayoffProjection`.
- [ ] Guard `getPayoffYearsWithExtra` against returning `0` when months rounds to zero.

---

## Re-test checklist

- [ ] After M1 spec update: re-read `getEffectiveBalance` code against updated spec to confirm alignment.
- [ ] After M2 JSDoc addition: confirm `capRate` documentation matches formula in code (line 97).
- [ ] After L1 NaN guard: verify `generateAmortizationSchedule(NaN input)` returns `[]`; `getPayoffProjection(NaN rate)` returns `{payoffDate: null, remainingAtTermEnd: null}`.
- [ ] After L2 fix: verify `getPayoffYearsWithExtra` with a mortgage 3 months from payoff returns `null` (not `0`).
- [ ] Run `npm run check` if any code changes are made.

---

## Next trigger and cadence

- **Trigger:** Pre-launch of any new math-heavy module (refinance what-if Phase 3, simulation page, deal analyzer); or when any formula in scope is modified.
- **Recommended next run:** Before Phase 3 refinance what-if launch, or within 90 days if no major module changes.

---

## Changelog (audit scope)

- 2026-04-04: Initial math & logic audit. Scope: `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`, `app/lib/plans.ts` (RENTCAST_HOURLY_LIMITS section). No code changes made. All formulas verified against `docs/process/math-logic-audit.md` §2 and the canonical iteration spec. Two Medium spec-gap findings (M1, M2) and two Low observations (L1, L2) documented.
