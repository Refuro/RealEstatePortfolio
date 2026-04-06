# Math & Logic Audit — 2026-04-05

## Executive summary

- Overall math health is **good**: all canonical formulas (amortization iteration, cap rate, LTV, cash-on-cash, benchmark pct) match the reference spec exactly, and every division has a guard.
- One medium-severity design inconsistency found: in `full_liability` display mode, portfolio DSCR uses ownership-scaled NOI in the numerator but full (unscaled) debt service in the denominator — creating a conservative but undocumented asymmetry for partial-ownership properties.
- Two low-severity observations: `capRate` in `property-metrics.ts` uses unscaled NOI while the returned `noi` field is scaled (correct but surprising to consumers); and `getPayoffYearsWithExtra` can return `0` years for near-term payoffs due to `Math.round`, which the UI must handle.
- No FAILs on formulas or edge-case guards; no NaN/Infinity paths found unguarded.

---

## Severity-ranked findings

### Critical
_(none)_

### High
_(none)_

### Medium

- **DSCR asymmetry in `full_liability` mode** — `portfolio-metrics.ts`: `totalNoi` is always ownership-scaled (property-metrics always multiplies by `scale`), but `totalAnnualDebtService` is NOT scaled in `full_liability` mode (`scaleLiabilityAmount` returns the raw amount). For a 50%-owned property, `dscr = (noi × 0.5) / full_debt_service`, which is half of a consistent same-mode calculation. Whether this conservative stress-test view is intentional is not documented anywhere in the spec or code comments. — `app/lib/metrics/portfolio-metrics.ts` lines 87–91, 104–105; `app/lib/metrics/property-metrics.ts` lines 38–55.

### Low

- **`capRate` uses unscaled NOI; returned `noi` is scaled** — `property-metrics.ts`: `capRate` is computed from the internal unscaled `noi` (full property NOI / full estimatedValue), while `metrics.noi` in the return object is `noi × scale`. This is mathematically correct (cap rate is a whole-property metric) but means `metrics.noi / metrics.capRate ≠ estimatedValue` for partial ownership — a potential consumer confusion or incorrect derived calculation. — `app/lib/metrics/property-metrics.ts` lines 94–97, 118–119.

- **`getPayoffYearsWithExtra` can return `0` for near-term payoffs** — `Math.round(months / 12)` returns `0` when `months < 6`. A mortgage with e.g. 4 months to payoff with extra payment returns `0 years`, which is misleading. The spec says "return round(months/12)" so the code is spec-compliant, but the UI layer must handle `0` explicitly. — `app/lib/amortization.ts` line 690.

- **`getExtraPaymentForYearsEarlier` binary search upper bound is `Math.ceil(balance)`** — this is a safe upper bound (adding the full balance as extra payment guarantees payoff in month 1), but for large balances the binary search runs up to ~log2(balance) iterations ≈ 26 iterations for a $400K balance. Functionally correct, no risk; noting for awareness. — `app/lib/amortization.ts` line 586.

---

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: edge `originalLoanAmount ≤ 0 \|\| monthlyPayment ≤ 0` → `[]` | **PASS** | Line 55–57 |
| `generateAmortizationSchedule`: formula `interest = balance × monthlyRate` | **PASS** | Line 68 |
| `generateAmortizationSchedule`: formula `principal = min(payment − interest, balance)` | **PASS** | Lines 72–78; two-step clamp (≥ balance → set to balance, then `Math.max(0,…)`) is equivalent |
| `generateAmortizationSchedule`: formula `balance = max(0, balance − principal)` | **PASS** | Line 80 |
| `generateAmortizationSchedule`: rounding to 2 decimals per row | **PASS** | Lines 85–89 |
| `generateAmortizationSchedule`: negative-amortization early exit → `[]` | **PASS** | Lines 69–71 |
| `generateAmortizationSchedule`: running balance not rounded between rows (avoids cumulative error) | **PASS** | `balance` variable is unrounded; only the pushed row field is rounded |
| `getPiForAmortization`: escrow deduction when `escrowIncluded && escrowAmount > 0` | **PASS** | Lines 126–129 |
| `getPiForAmortization`: clamp P&I to ≥ 0.01 | **PASS** | `Math.max(0.01, pi)` line 128 |
| `getProjectedBalanceAsOf`: `asOfDate < startDate` → `0` | **PASS** | Line 148 |
| `getEffectiveBalance`: Tier 1 — same calendar month → `currentBalance` | **PASS** | Lines 207–212 |
| `getEffectiveBalance`: Tier 2 — prior month within 180 days → `projectStoredBalanceForward` | **PASS** | Lines 206–211 |
| `getEffectiveBalance`: Tier 3 — older than 180 days or null → projected from original; fallback to `currentBalance` if 0 | **PASS** | Lines 215–224 |
| `getEffectiveBalance` / `getBalanceSource`: identical 180-day staleness threshold | **PASS** | Both use `sixMonthsAgo.setDate(getDate() − 180)` |
| `getBalanceSource`: returns `"stored"` / `"stored_projected"` / `"projected"` consistently with `getEffectiveBalance` tiers | **PASS** | Lines 244–250 |
| `getPayoffProjection`: edge `balance ≤ 0 \|\| payment ≤ 0` → `{ payoffDate: null, remainingAtTermEnd: null }` | **PASS** | Lines 391–393 |
| `getPayoffProjection`: negative-amortizing early return with `remainingAtTermEnd` | **PASS** | Lines 396–398 |
| `getPayoffProjection`: iteration identical to `generateAmortizationSchedule` canonical loop | **PASS** | Lines 413–426 match lines 68–80 exactly |
| `getPayoffProjection`: returns `{ payoffDate, remainingAtTermEnd: null }` when balance hits 0 | **PASS** | Lines 428–429 |
| `getPayoffProjection`: returns `{ payoffDate: null, remainingAtTermEnd: Math.round(runningBalance) }` when term exhausted | **PASS** | Lines 435–438 |
| `getMonthsToPayoffWithExtraStrict`: iteration identical to `getPayoffProjection` | **PASS** | Lines 497–503 |
| `getMonthsToPayoffWithExtraWithTolerance`: iteration identical to `getPayoffProjection` | **PASS** | Lines 547–553 |
| `getExtraPaymentForYearsEarlier`: `projection.payoffDate == null` → `null` | **PASS** | Line 571 |
| `getExtraPaymentForYearsEarlier`: `targetMonths ≤ 0` → `null` | **PASS** | Line 582 |
| `getPayoffYearsWithExtra`: `extraPayment < 0` → `null` | **PASS** | Line 667 |
| `getPayoffYearsWithExtra`: `Math.round(months / 12)` | **PASS** (spec-compliant) | **NOTE**: returns `0` when `months < 6`; UI must handle |
| `getStandardMonthlyPayment`: standard amortization formula `P×r×(1+r)^n / ((1+r)^n − 1)` | **PASS** | Lines 744–748 |
| `getStandardMonthlyPayment`: zero-rate special case | **PASS** | Lines 741–743 |
| Rate stored as decimal (e.g. 0.065); divided by 12 for monthly rate throughout | **PASS** | All uses of `annualInterestRate / 12` and `Number(mortgage.interestRate) / 12` |
| NaN/Infinity guards: `Number(mortgage.interestRate)` / `Number(mortgage.currentBalance)` etc. | **PASS** | No unguarded paths found; `balance ≤ 0` / `payment ≤ 0` guards catch NaN-coerced-to-0 |

---

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent = monthlyRent × (1 − vacancyPercent/100)` | **PASS** | Line 92 |
| `grossAnnualRent = effectiveRent × 12` (unscaled internal) | **PASS** | Line 94 |
| `annualExpenses = monthlyExpenses × 12` (unscaled internal) | **PASS** | Line 95 |
| `noi = grossAnnualRent − annualExpenses` (unscaled internal) | **PASS** | Line 96 |
| `capRate = noi / estimatedValue` (uses unscaled NOI = full-property cap rate) | **PASS** | Line 97 |
| Edge: `estimatedValue = 0` → `capRate null` | **PASS** | `estimatedValue > 0` guard line 97 |
| `monthlyCashFlow` — `full_liability` formula `effectiveRent×scale − expenses×scale − payment` | **PASS** | Lines 101–102 |
| `monthlyCashFlow` — `proportional` formula `(effectiveRent − expenses − payment) × scale` | **PASS** | Line 103 |
| `annualCashFlow = monthlyCashFlow × 12` | **PASS** | Line 105 |
| `equity = (estimatedValue − totalMortgageBalance) × scale` | **PASS** | Line 108 |
| `ltv = totalMortgageBalance / estimatedValue` | **PASS** | Line 111 |
| Edge: `estimatedValue = 0` → `ltv null` | **PASS** | `estimatedValue > 0` guard line 111 |
| `cashOnCashReturn = annualCashFlow / cashInvestedScaled` | **PASS** | Lines 113–115 |
| Edge: `cashInvested = null` → `cashOnCashReturn null` | **PASS** | `cashInvested != null && cashInvested > 0` guard line 113 |
| Edge: `cashInvested = 0` → `cashOnCashReturn null` | **PASS** | `cashInvested > 0` guard line 113 |
| Returned `noi` is scaled; `capRate` uses unscaled NOI | **NOTE** | Mathematically correct (cap rate is whole-property), but `metrics.noi / metrics.capRate ≠ estimatedValue` for partial ownership. See Medium finding. |
| Internal consistency: returned `grossAnnualRent`, `annualExpenses`, `noi` are all `× scale` | **PASS** | Lines 118–120; `noi × scale = (grossAnnualRent − annualExpenses) × scale` ✓ |
| `vacancyPercent` defaults to `5` when not provided | **PASS** | Line 87 |
| `ownershipPercent` defaults to `100` when not provided | **PASS** | Line 87 |

---

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| Edge: `properties.length = 0` → all zeros and nulls | **PASS** | Lines 42–60 |
| `totalMarketValue` aggregation: `estimatedValue × scale` per property | **PASS** | Line 79 |
| `totalNoi` aggregation: uses `metrics.noi` (scaled by property-metrics) | **PASS** | Line 84 |
| `weightedCapRate = totalNoi / totalMarketValue` | **PASS** | Line 107 |
| Division-by-zero guard on `weightedCapRate` | **PASS** | `totalMarketValue > 0` line 107 |
| `portfolioLtv = totalDebt / totalMarketValue` | **PASS** | Line 108 |
| Division-by-zero guard on `portfolioLtv` | **PASS** | `totalMarketValue > 0` line 108 |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | **PASS** | Lines 109–110 |
| Division-by-zero guard on `portfolioCashOnCashReturn` | **PASS** | `totalCashInvested > 0` line 109 |
| `dscr = totalNoi / totalAnnualDebtService` | **PASS** | Lines 104–105 |
| Division-by-zero guard on `dscr` | **PASS** | `totalAnnualDebtService > 0` line 104 |
| `totalDebt`: full debt in `full_liability` mode, scaled in `proportional` mode | **PASS** | Lines 93–97 |
| `dscr` in `full_liability` mode: NOI is ownership-scaled; debt service is full | **NOTE/MEDIUM** | Asymmetric for partial ownership. See Medium finding. |
| `totalMonthlyRent = Σ(metrics.grossAnnualRent / 12)` = vacancy-adjusted, ownership-scaled | **PASS** | Line 81 |
| `totalCashInvested`: skips null and `≤ 0` `cashInvested` | **PASS** | Lines 99–101 |
| `propertyCount` = `properties.length` | **PASS** | Line 127 |

---

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| `BENCHMARK_FRESHNESS_MAX_MS = 60 × 24 × 60 × 60 × 1000` (60 full days in ms) | **PASS** | Line 13 |
| `isBenchmarkFresh`: strict `<` comparison (exclusive boundary) | **PASS** | Line 34; at exactly 60 days the benchmark is stale, per spec |
| `isBenchmarkFreshAt`: deterministic overload with `nowMs` param for testing | **PASS** | Line 31 |
| `getBenchmarkPct = (userRent − marketRent) / marketRent × 100` | **PASS** | Lines 59–61 |
| Edge: `marketRent ≤ 0` → `getBenchmarkPct` returns `0` | **PASS** | Line 59 guard |
| `getBenchmarkLabel`: `abs(pct) < 1` → `"Rent at market"` | **PASS** | Line 77 |
| `getBenchmarkLabel`: `pct ≥ 1` → `"Rent X% above market"` | **PASS** | Line 78 |
| `getBenchmarkLabel`: `pct ≤ −1` → `"Rent X% below market"` | **PASS** | Line 79 |
| `getBenchmarkDaysAgo`: `Math.floor(ms_diff / day_ms)` | **PASS** | Line 49 |
| `getBenchmarkEligibilityAt`: all eligibility states covered (not_rented, rent_missing, benchmark_missing, benchmark_stale, eligible_fresh) | **PASS** | Lines 95–99 |
| NaN guard: `marketRent <= 0` covers both zero and negative; `toBenchmarkAsOfDate` null-checks | **PASS** | Guards at lines 59, 33 |

---

### lib/plans.ts (RentCast quotas — supplemental)

| Check | Status | Notes |
|-------|--------|-------|
| `RENTCAST_HOURLY_LIMITS`: free=5, investor=10, pro=20 | **PASS** | Lines 27–30; constants only, no math |
| `getRentCastHourlyLimit`: unknown tier falls back to `free` (5) | **PASS** | Line 49 |
| No division, rounding, or floating-point arithmetic in quota logic | **PASS** | Quota comparisons are integer counts; no numeric risk |

---

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` and `generateAmortizationSchedule` use identical iteration logic | **PASS** | Both: `interest = balance × rate`, `principal = min(payment − interest, balance)`, `balance = max(0, balance − principal)` |
| `getMonthsToPayoffWithExtraStrict` and `getMonthsToPayoffWithExtraWithTolerance` use same iteration as `getPayoffProjection` | **PASS** | Identical loop body in all three functions |
| `getEffectiveBalance` and `getBalanceSource` use identical 180-day staleness threshold | **PASS** | Both compute `sixMonthsAgo = today − 180 days` using `setDate(getDate() − 180)` |
| Rate stored as decimal throughout; `/ 12` for monthly rate | **PASS** | All usages of `annualInterestRate / 12` and `Number(mortgage.interestRate) / 12` confirmed |
| `getExtraPaymentForYearsEarlier` uses `getMonthsToPayoffWithExtraStrict` (canonical contract) | **PASS** | Line 590 |
| `getExtraPaymentForYearsEarlierWithTolerance` uses `getMonthsToPayoffWithExtraWithTolerance` (UI contract) | **PASS** | Line 633 |
| `capRate` (property) and `weightedCapRate` (portfolio) are numerically consistent for uniform ownership | **PASS** | Both equal `full_noi / full_value`; ownership scale cancels when uniform |
| NOI always scaled in property-metrics output, regardless of `displayMode` | **PASS** — **NOTE** | Intentional but creates DSCR asymmetry in `full_liability` mode (see Medium finding) |

---

## Findings / recommendations

### Medium — DSCR asymmetry in `full_liability` display mode (`portfolio-metrics.ts`)

**Finding:** `totalNoi` is summed from `metrics.noi` which is always ownership-scaled (by design in `property-metrics.ts`). However, `getAnnualDebtService` in `full_liability` mode skips the ownership scale and returns the full payment. Result: `dscr = Σ(noi × scale) / Σ(full_debt_service)`. For a 50%-owned property, this produces a DSCR that is half of the correctly consistent value.

**Root cause:** `property-metrics.ts` always scales NOI (no `displayMode` branch in the NOI calc), while `scaleLiabilityAmount` respects `displayMode`. This is the only metric where the two modes diverge asymmetrically.

**Recommendation:** Either (a) document this as intentional conservative DSCR in a code comment, or (b) fix `computePortfolioMetrics` to also scale NOI differently in `full_liability` mode (use unscaled property NOI for DSCR numerator). If it is intentional as a stress-test view, add a `// Conservative: NOI is proportional; debt service is full liability` comment to `dscr` calculation.

---

### Low — `capRate` uses unscaled NOI; returned `noi` is scaled (`property-metrics.ts`)

**Finding:** `capRate` is computed from internal unscaled NOI before the return object's `noi` is scaled. `metrics.noi / metrics.capRate ≠ estimatedValue` for partial ownership. This is the correct economic model (cap rate is a whole-property metric) but is undocumented and counterintuitive.

**Recommendation:** Add a JSDoc comment to the `capRate` field in `PropertyMetrics` clarifying: `"Full-property cap rate (unscaled NOI / full estimatedValue). Not affected by ownershipPercent."` This prevents future callers from deriving incorrect values.

---

### Low — `getPayoffYearsWithExtra` can return `0` for near-term payoffs (`amortization.ts`)

**Finding:** `Math.round(months / 12)` returns `0` when `months < 6`. E.g., a loan with 4 months remaining returns `0 years` to payoff with extra payment. The spec says "round(months/12)" so the code is spec-compliant; the issue is in rendering, not math.

**Recommendation:** The calling UI should display `"< 1 year"` or similar when `getPayoffYearsWithExtra` returns `0`. Add a note to the function JSDoc: `"Returns 0 when payoff is less than 6 months away (rounds to nearest year)."` No code change needed in `amortization.ts`.

---

## Evidence reviewed

- `app/lib/amortization.ts` — full file (897 lines)
- `app/lib/metrics/property-metrics.ts` — full file (129 lines)
- `app/lib/metrics/portfolio-metrics.ts` — full file (130 lines)
- `app/lib/benchmark-utils.ts` — full file (137 lines)
- `app/lib/plans.ts` — lines 1–60 (quota constants)
- `docs/process/math-logic-audit.md` — full process doc
- `docs/process/audit-report-template.md` — full template

**Audit limits:**
- Did not run the code or execute test suites; analysis is static.
- `getRefinanceProjection` (in-scope per file, not in §1.1 module list) was reviewed but not fully traced — no issues spotted in the negative-amortization check or interest accumulation loops.
- `plans.ts` was reviewed for quota constants only; route-level quota enforcement was not audited.

---

## Risk & impact assessment

- **DSCR asymmetry (Medium):** Affects any user with partial-ownership properties (e.g., partnership LLCs, co-owned properties) when `full_liability` display mode is active. The DSCR shown would be understated, potentially making a property appear less serviceable than it is. Low probability of user-facing confusion today (most users likely have 100% ownership), but could mislead sophisticated users in partnership scenarios.
- **`capRate` / scaled `noi` divergence (Low):** Does not affect displayed values; only affects consumers that try to re-derive `estimatedValue` from `noi / capRate`. No known consumer does this today.
- **`getPayoffYearsWithExtra` returning 0 (Low):** Near-term loans with extra payment UI will show "0 years" until the UI handles it. Cosmetic only.

---

## Recommendations (prioritized)

1. Document or fix the DSCR NOI-scaling asymmetry in `portfolio-metrics.ts` before `full_liability` mode is surfaced to users with partial-ownership properties. A clarifying comment is the minimum; a code fix that makes NOI and debt service scale consistently is preferred.
2. Add a JSDoc clarification to the `capRate` field in `PropertyMetrics` noting it uses unscaled (full-property) NOI, not the returned ownership-scaled `noi`.
3. Add a note to `getPayoffYearsWithExtra`'s JSDoc that it can return `0` for very-near-term payoffs, and ensure the UI layer handles `0` explicitly with a `"< 1 year"` label.

---

## Task candidates

- [ ] Add code comment (or fix) to `computePortfolioMetrics` DSCR calculation clarifying NOI-scaling asymmetry in `full_liability` mode; assess whether fix is needed before partial-ownership launch
- [ ] Add JSDoc to `PropertyMetrics.capRate` field: "Full-property metric; uses unscaled NOI / full estimatedValue; not proportional to ownershipPercent"
- [ ] Add JSDoc to `getPayoffYearsWithExtra`: "Returns 0 for payoffs < 6 months away (Math.round); callers should render as '< 1 year'"
- [ ] (Optional) Add test coverage for `computePortfolioMetrics` with mixed partial-ownership properties in both display modes, asserting DSCR behavior

---

## Re-test checklist

- [ ] Verify DSCR in `full_liability` mode with a 50%-owned property produces the documented/expected value
- [ ] Verify `getPayoffYearsWithExtra` returns `0` for a near-term mortgage and confirm UI handles it
- [ ] Verify `metrics.capRate` equals `full_noi / full_estimatedValue` for a partial-ownership property (not scaled)
- [ ] `npm run check` (when any code changes are made from task candidates above)

---

## Next trigger and cadence

- **Trigger:** Before any new metric (refinance what-if Phase 3, simulation page) ships, or when `full_liability` mode gains significant partial-ownership user exposure.
- **Recommended next run:** 2026-07-01, or on introduction of any new math module.

---

## Changelog (audit scope)

- 2026-04-05: Initial audit. Scope: `lib/amortization.ts`, `lib/metrics/property-metrics.ts`, `lib/metrics/portfolio-metrics.ts`, `lib/benchmark-utils.ts`, `lib/plans.ts` (quotas, supplemental). No FAILs. 1 Medium finding (DSCR asymmetry), 2 Low findings (capRate/noi divergence, getPayoffYearsWithExtra → 0).
