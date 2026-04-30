# Math & Logic Audit — 2026-04-27

## Executive summary

- **Amortization, metrics, and benchmark utilities are internally consistent** with `docs/process/math-logic-audit.md`: monthly iteration uses interest = balance × monthly rate, principal capped at balance (with `AMORTIZATION_COMPARISON_EPSILON` where applicable), 180-day balance staleness is shared by `getEffectiveBalance` and `getBalanceSource`, and benchmark freshness uses a strict millisecond window `now − asOf < 60 × 24h` in `app/lib/benchmark-utils.ts`.
- **No critical or high-severity formula defects** were identified in the scoped modules; edge cases in the process edge-case matrix (empty schedule inputs, null payoff, zero denominators, empty portfolio) are handled in code as specified.
- **Residual items are documentation and disclosure:** the process doc’s two-tier description of `getBalanceSource` understates the three-tier implementation; `projectStoredBalanceForward` uses a strict `pi <= interest` bail-out versus epsilon-based checks elsewhere (minor boundary nuance). Mortgage milestone emails still use tolerance-aware payoff detection without inline tolerance copy (see Medium).
- **Recommendation:** Keep the current math implementation; treat the items below as backlog or doc fixes, not emergency code changes.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **Milestone emails use tolerance-aware payoff without inline disclosure** — `app/lib/mortgage-milestones.ts` calls `getToleranceAwarePayoffProjection` (e.g. ~line 85) to detect milestones, while `app/lib/emails/mortgage-milestones.ts` builds HTML/text with no note that dates may reflect end-of-term residual tolerance. Align with `docs/policies/analytics-math-policy.md` §3.7 expectations for any tolerance-based surface.

### Low

- **`docs/process/math-logic-audit.md` §2.1 vs `getBalanceSource`:** The living contract in `app/lib/amortization.ts` exposes three sources (`stored` | `stored_projected` | `projected`) with one shared 180-day threshold. The process doc’s short “stored vs projected” wording is under-specific for auditors (documentation drift only).
- **`projectStoredBalanceForward` vs epsilon-based paths:** Forward projection breaks when `pi <= interest` (`app/lib/amortization.ts`), while `generateAmortizationSchedule` and `getPayoffProjection` use `AMORTIZATION_COMPARISON_EPSILON` for the negative-amortization test. Unlikely to diverge in normal loans; worth knowing for boundary QA.
- **`generateAmortizationSchedule` returns `[]` when P&I is below monthly interest** even if `originalLoanAmount > 0` and `monthlyPayment > 0` — stricter than the edge matrix’s “≤ 0” rows alone; intentional per tests in `app/lib/amortization.test.ts`.

## Evidence reviewed

| Area | Paths |
|------|--------|
| Amortization & refinance helpers | `app/lib/amortization.ts`, `app/lib/amortization.test.ts` |
| Property / portfolio metrics | `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/metrics/property-metrics.test.ts`, `app/lib/metrics/portfolio-metrics.test.ts`, `app/lib/metrics/metrics-golden.test.ts` |
| Benchmarks | `app/lib/benchmark-utils.ts`, `app/lib/benchmark-utils.test.ts` |
| RentCast hourly caps (inventory §1.1) | `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`) |
| Milestone math / email (related surface) | `app/lib/mortgage-milestones.ts`, `app/lib/emails/mortgage-milestones.ts` |
| Process / template | `docs/process/math-logic-audit.md`, `docs/process/audit-report-template.md` |

**Limits of this pass:** Read-only review of source and test names; no CI re-run. Exports/API routes and marketing calculators not re-traced line-by-line unless they appeared in scope notes. `app/` was not modified.

## Risk & impact assessment

- Unresolved **medium** item affects clarity on a low-frequency channel (email): users might read milestone payoff language as strict amortization when tolerance adjusted the date. Core API math and the libraries under review remain aligned with the written spec.
- **Low** items are unlikely to affect typical user data; they matter for audit repeatability and rare boundary inputs.

## Recommendations (prioritized)

1. Add a one-line disclosure to mortgage milestone email templates when milestones depend on tolerance-aware payoff projection, or switch detection to strict `getPayoffProjection` if product prefers conservative email claims.
2. Update `docs/process/math-logic-audit.md` §2.1 to document the three `getBalanceSource` tiers explicitly so future lanes do not report false drift.
3. When touching balance projection, add a focused test for `projectStoredBalanceForward` near the `pi` vs `interest` boundary if regression risk increases.

## Task candidates (optional)

- [ ] Disclose tolerance (or use strict payoff) for mortgage milestone email content tied to `getToleranceAwarePayoffProjection`.
- [ ] Align `math-logic-audit.md` `getBalanceSource` bullet with the three-tier implementation.

## Re-test checklist

- [ ] Verify fix for any milestone email or disclosure change end-to-end.
- [ ] After amortization changes: `npm run check` plus `app/lib/amortization.test.ts` and metrics tests.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Release touching `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`, `app/lib/plans.ts` (quota math), or analytics/export consumers of these modules.
- **Recommended next run:** Next monthly math lane or before a major analytics or mortgage-feature release.

---

## Module results

### `app/lib/amortization.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` core iteration matches spec (interest = balance × monthly rate; principal capped; payment = principal + interest on row) | PASS | Lines 66–88; uses ε for sub-interest payment rejection (lines 69–71). |
| Rounding to 2 decimals per schedule row | PASS | Lines 85–88. |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | Lines 55–57. |
| `getPayoffProjection` iteration aligns with schedule logic (principal cap, ε on interest) | PASS | Lines 412–426 vs 66–80. |
| `getEffectiveBalance` / `getBalanceSource` share 180-day staleness | PASS | Lines 200–251; calendar-month branch for projection vs same-month statement. |
| Edge: `balance ≤ 0` or `payment ≤ 0` → null payoff fields | PASS | Lines 391–393. |
| Edge: negative amortization → null `payoffDate`, residual surfaced | PASS | Lines 396–398, 414–418. |
| `getPiForAmortization` escrow clamp ≥ 0.01 | PASS | Lines 126–128. |
| `getProjectedBalanceAsOf` before normalized start → 0 | PASS | Lines 148–149. |
| `getExtraPaymentForYearsEarlier` requires `payoffDate`; `targetMonths ≤ 0` → null | PASS | Lines 570–582. |
| `getPayoffYearsWithExtra` negative extra → null | PASS | Lines 667–668. |
| Strict vs tolerance helpers documented (canonical vs UI) | PASS | Comments and exports e.g. 459–462, 508–511, 604–607, 693–696. |
| `getStandardMonthlyPayment` guards (principal, term, rate) and zero-rate path | PASS | Lines 738–748. |
| `getRefinanceProjection` uses consistent iteration for remaining interest and new loan; guards `effectiveBalance ≤ 0` and new-loan negative amort | PASS | Lines 757–895. |

### `app/lib/metrics/property-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent = monthlyRent × (1 − vacancyPercent/100)` | PASS | Line 92. |
| `grossAnnualRent`, `annualExpenses`, `noi`, `capRate` | PASS | Lines 94–97; `capRate` uses unscaled NOI vs full `estimatedValue` (whole-property cap rate). |
| `monthlyCashFlow` `full_liability` vs proportional | PASS | Lines 101–103. |
| `equity`, `ltv` with `estimatedValue > 0` guard | PASS | Lines 108, 111. |
| `cashOnCashReturn` denominator guard | PASS | Lines 113–115. |
| Edge: `estimatedValue = 0` → `capRate` / `ltv` null | PASS | Lines 97, 111. |
| Edge: `cashInvested` null or ≤ 0 → `cashOnCashReturn` null | PASS | Lines 113–115. |

### `app/lib/metrics/portfolio-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Empty `properties` → zeros and null ratios | PASS | Lines 42–59. |
| `weightedCapRate = totalNoi / totalMarketValue` | PASS | Line 107. |
| `portfolioLtv = totalDebt / totalMarketValue` | PASS | Line 108; `totalDebt` mode-aware lines 93–97. |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | Lines 109–110. |
| `dscr` guarded denominator | PASS | Lines 104–105. |

### `app/lib/benchmark-utils.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct`: `marketRent ≤ 0` → 0 | PASS | Lines 58–60. |
| `isBenchmarkFresh` / `isBenchmarkFreshAt`: strict ms window | PASS | Lines 12–13, 28–39. |
| `getBenchmarkLabel` / `getBenchmarkTone`: ~1% “at market” band | PASS | Lines 67–79. |

### `app/lib/plans.ts` (RentCast quota — §1.1)

| Check | Status | Notes |
|-------|--------|-------|
| `RENTCAST_HOURLY_LIMITS` numeric caps (free / investor / pro) | PASS | Lines 26–30; matches module inventory; shared-pool behavior described in repo docs. |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` and `generateAmortizationSchedule` share the same principal/interest/balance rules (with payoff starting next month from “current” month) | PASS | Payoff forward-from–next-month semantics are product-specific; inner month step matches. |
| `getEffectiveBalance` and `getBalanceSource` use the same 180-day staleness | PASS | Same `sixMonthsAgo` construction in both. |
| Mortgage rate: decimal annual; monthly = `Number(rate) / 12` | PASS | Used throughout `amortization.ts`. |
| `getMonthsToPayoffWithExtraStrict` matches `getPayoffProjection` loop structure | PASS | Lines 495–503 vs 412–426. |

## Findings / recommendations

See **Severity-ranked findings** and **Recommendations** above. No FAIL markers in the module tables for the reviewed checks.

## Changelog (audit scope)

- **2026-04-27:** Initial lane run for this date. Scope: `amortization.ts`, `property-metrics.ts`, `portfolio-metrics.ts`, `benchmark-utils.ts`, `plans.ts` (`RENTCAST_HOURLY_LIMITS` only). Related surface noted: mortgage milestone email (tolerance disclosure).
