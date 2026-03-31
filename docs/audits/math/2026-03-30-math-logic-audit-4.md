# Math & Logic Audit — 2026-03-30 (Run 4)

## Executive summary

- **Core math remains healthy:** Amortization iteration, 180-day effective-balance staleness, property and portfolio metrics, benchmark percentage and freshness semantics, and strict vs tolerance-aware payoff split still align with `docs/process/math-logic-audit.md` §2–4 and `docs/policies/analytics-math-policy.md` (including §3.6–3.7). Static review of `app/lib/amortization.ts`, `app/lib/metrics/*.ts`, and `app/lib/benchmark-utils.ts` found no regressions vs [Run 3](2026-03-30-math-logic-audit-3.md).
- **RentCast and exports:** Upstream rent/value figures are consumed from the RentCast API (`app/lib/integrations/rentcast.ts`); the app does not re-derive AVM math locally. Portfolio CSV and APIs continue to use shared metrics helpers (`computePropertyMetrics` on export path). Quota and hourly limits are operational caps, not financial formulas.
- **Outstanding gaps match Run 3:** Documentation drift (`docs/reference/engineering-spec.md` §6 vs shipped metrics) and process inventory naming (`docs/process/math-logic-audit.md` §1.1 vs `getMonthsToPayoffWithExtraStrict` / `getMonthsToPayoffWithExtraWithTolerance`) remain the primary actionable follow-ups; no new formula defects were identified in this pass.

## Severity-ranked findings

### Critical

- None.

### High

- None identified in reviewed implementation paths. Strict payoff remains the contract for API/export surfaces per prior audit evidence (`app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts`, `app/app/api/export/portfolio/route.ts`).

### Medium

- **`docs/reference/engineering-spec.md` §6 (Calculation Backlog) is still stale relative to production behavior** — It describes gross annual rent as `monthly_rent * 12`, monthly cash flow without vacancy, and omits ownership display modes. Shipped logic and golden fixtures follow `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md` §3.4, and `app/lib/metrics/property-metrics.ts` (`computePropertyMetrics`: effective rent, scaled outputs, cap rate on full-property NOI ÷ value). **Risk:** readers or future tasks copy §6 and reintroduce pre-vacancy or wrong-ownership formulas. **Evidence:** `docs/reference/engineering-spec.md` ~lines 525–565; `app/lib/metrics/property-metrics.ts`; `app/lib/test/fixtures/metrics-golden.ts` (header / intent).

### Low

- **`docs/process/math-logic-audit.md` §1.1 module inventory is incomplete** — Lists core amortization functions but omits `getMonthsToPayoffWithExtraStrict`, `getMonthsToPayoffWithExtraWithTolerance`, tolerance helpers, and eligibility helpers in `app/lib/benchmark-utils.ts` (`getBenchmarkEligibility`, `isBenchmarkComparable`, etc.). **Evidence:** `docs/process/math-logic-audit.md` §1.1 table; `app/lib/amortization.ts`; `app/lib/benchmark-utils.ts`.

- **Benchmark freshness wording in the process doc vs implementation** — `math-logic-audit.md` §2.4 describes “within 60 days”; code uses a **strict** millisecond upper bound (`now - asOf < 60 × 24 × 60 × 60 × 1000`), so a snapshot at exactly 60 full days is stale. This matches `docs/policies/analytics-math-policy.md` §3.6 and `app/lib/benchmark-utils.ts` (`BENCHMARK_FRESHNESS_MAX_MS`, `isBenchmarkFreshAt`).

- **`remainingAtTermEnd` integer rounding** — `getPayoffProjection` returns `Math.round(runningBalance)` for dollars while schedule rows use cent precision. Acceptable for API/display; not identical to row-level balance. **Evidence:** `app/lib/amortization.ts` `getPayoffProjection`; `generateAmortizationSchedule` row rounding.

## Module results

### lib/amortization.ts (`app/lib/amortization.ts`)

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: interest = balance × monthlyRate; principal capped when ≥ balance; balance = max(0, balance − principal); payment = principal + interest | PASS | Aligns with §2.1; handles insufficient P&I via principal &lt; 0 path until balance resolves. |
| Edge: originalLoanAmount ≤ 0 or monthlyPayment ≤ 0 → [] | PASS | Lines 36–37. |
| `getPiForAmortization`: escrow subtracted; clamp ≥ 0.01 | PASS | Lines 94–107. |
| `getProjectedBalanceAsOf`: before start → 0; else last row on/before as-of | PASS | Lines 114–139. |
| `getEffectiveBalance` / `getBalanceSource`: 180-day staleness aligned | PASS | Same `sixMonthsAgo` pattern (lines 152–155 vs 179–182); projection fallback when projected ≤ 0 (lines 168–169). |
| `getPayoffProjection`: iteration matches schedule core; null when balance ≤ 0 or payment ≤ 0 | PASS | Lines 279–324; matches `generateAmortizationSchedule` interest/principal/balance update (lines 305–312 vs 47–57). |
| Non-amortizing path: null payoff, `remainingAtTermEnd` rounded | PASS | Loop exhausts with balance &gt; 0. |
| `getExtraPaymentForYearsEarlier`: requires strict `getPayoffProjection`; binary search uses `getMonthsToPayoffWithExtraStrict` | PASS | Lines 440–475; null when no payoff or targetMonths ≤ 0. |
| `getPayoffYearsWithExtra`: extra &lt; 0 → null | PASS | Lines 537–541. |
| Tolerance helpers documented UI-only vs strict core | PASS | Comments; `analytics-math-policy.md` §3.7. |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| effectiveRent, grossAnnualRent, annualExpenses, NOI | PASS | Lines 90–96; default vacancy 5%. |
| capRate = NOI / estimatedValue when value &gt; 0; unscaled NOI for cap rate, scaled `metrics.noi` | PASS | Lines 96–97, 117–120; matches ownership policy / golden intent. |
| monthlyCashFlow: `full_liability` vs `proportional` | PASS | Lines 101–103. |
| equity scaled; LTV full debt / value | PASS | Lines 108–111. |
| cashOnCashReturn when cashInvested null or ≤ 0 | PASS | Lines 113–115. |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| Empty properties → zeros and nulls | PASS | Lines 42–59. |
| weightedCapRate = totalNoi / totalMarketValue | PASS | Line 107. |
| portfolioLtv = totalDebt / totalMarketValue | PASS | Line 108; `full_liability` debt lines 93–97. |
| portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested | PASS | Line 110. |
| totalMonthlyRent / totalAnnualRent align with vacancy-adjusted NOI rent leg | PASS | Lines 81, 85; `analytics-math-policy.md` §3.4. |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| getBenchmarkPct: marketRent ≤ 0 → 0 | PASS | Lines 58–60. |
| getBenchmarkLabel / tone: ~1% band “at market” | PASS | Lines 64–79. |
| Freshness: strict &lt; 60-day window | PASS | `isBenchmarkFreshAt` lines 27–35; see Low finding. |

### lib/public-calculator.ts (calculator lane)

| Check | Status | Notes |
|-------|--------|-------|
| `computeMonthlyPayment`: standard fixed-rate formula; zero-rate straight-line | PASS | Lines 29–41; rate as percent ÷ 100 ÷ 12, consistent with calculator inputs. |
| Delegates NOI/cash flow to `computePropertyMetrics` | PASS | Lines 56–68; proportional mode, vacancy from input. |
| DSCR = NOI / annual debt service when debt service &gt; 0 | PASS | Lines 70–71; uses `getAnnualDebtService` with proportional scaling. |

### RentCast integration (reference)

| Check | Status | Notes |
|-------|--------|-------|
| No local AVM re-computation | PASS | `app/lib/integrations/rentcast.ts` requests API and parses numeric rent/value; benchmark math applies `getBenchmarkPct` etc. to stored user vs market rent. |
| Quota / tier limits | N/A (ops) | `app/lib/rentcast-quota.ts`, `app/lib/plans.ts` — not valuation formulas. |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Payoff iteration shared across `generateAmortizationSchedule`, `getPayoffProjection`, `getMonthsToPayoffWithExtraStrict` | PASS | Same monthly interest / principal / balance core. |
| `getEffectiveBalance` and `getBalanceSource` staleness threshold | PASS | Both 180-day lookback. |
| Rate as decimal ÷ 12 for monthly rate (mortgage records) | PASS | `Number(mortgage.interestRate) / 12` in payoff/extra paths; schedule uses `annualInterestRate / 12` from input. |
| Metrics: calculator, export, portfolio summary use shared helpers | PASS | `app/lib/public-calculator.ts`; `app/app/api/export/portfolio/route.ts` (`computePropertyMetrics`); grep-aligned with Run 3 for `app/app/api/portfolio/summary/route.ts` and property metrics routes. |
| Analytics policy: strict API/export vs tolerance UI | PASS | `docs/policies/analytics-math-policy.md` §3.7; code comments in `amortization.ts`. |

## Evidence reviewed

- **Core math:** `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`, `app/lib/public-calculator.ts`
- **RentCast / quota:** `app/lib/integrations/rentcast.ts`, `app/lib/rentcast-quota.ts`, `app/lib/plans.ts` (quota math as counting, not AVM)
- **Policies:** `docs/policies/analytics-math-policy.md`, `docs/policies/ownership-metrics.md` (cross-check), `docs/process/math-logic-audit.md`
- **Stale spec (finding):** `docs/reference/engineering-spec.md` §6
- **Tests (by path reference; not executed in this audit):** `app/lib/amortization.test.ts`, `app/lib/metrics/property-metrics.test.ts`, `app/lib/metrics/portfolio-metrics.test.ts`, `app/lib/metrics/metrics-golden.test.ts`, `app/lib/test/fixtures/metrics-golden.ts`
- **Continuity:** [2026-03-30-math-logic-audit-3.md](2026-03-30-math-logic-audit-3.md) (Run 3)
- **Assumptions:** Audit-only static review; `npm run test` was not executed in this pass.

## Risk & impact assessment

- **Medium (spec drift):** If `engineering-spec.md` §6 is treated as the live contract, new surfaces could ship pre-vacancy or wrong-ownership metrics — user-visible misstatement risk for analytics.
- **Low (docs/process):** Inventory and freshness wording gaps increase onboarding friction and review errors; lower direct user impact than wrong formulas.
- **RentCast:** Reliance on third-party AVM accuracy is a product/data risk, not an in-repo formula bug; app math for *comparing* user rent to stored market rent remains consistent.

## Recommendations (prioritized)

1. **Replace or banner `engineering-spec.md` §6** with pointers to `ownership-metrics.md`, `analytics-math-policy.md`, and `computePropertyMetrics` / `computePortfolioMetrics` so the backlog section cannot be mistaken for the shipped contract.
2. **Expand `docs/process/math-logic-audit.md` §1.1** to include `getMonthsToPayoffWithExtraStrict`, `getMonthsToPayoffWithExtraWithTolerance`, tolerance-aware payoff helpers, and (optionally) benchmark eligibility exports; tighten §2.4 benchmark freshness to “strictly within 60 full days” (exclusive upper bound).
3. **Optional:** Add portfolio golden coverage for partial ownership and/or `full_liability` if regression sensitivity should match single-property cases.

## Task candidates (optional)

- [ ] Align `docs/reference/engineering-spec.md` §6 with current metrics policy or mark it superseded.
- [ ] Refresh `docs/process/math-logic-audit.md` module inventory and benchmark freshness phrasing.
- [ ] Add golden coverage for partial-ownership portfolio aggregation (if product priority).

## Re-test checklist

- [ ] After any doc change: verify policy line references still match code.
- [ ] After any metrics/amortization code change: `npm run test` with focus on `metrics-golden.test.ts` and `amortization.test.ts`.
- [ ] `npm run check` when code changes are made.

## Next trigger and cadence

- **Trigger:** Release or substantial change touching `app/lib/amortization.ts`, `app/lib/metrics/`, benchmark contracts, export/API metric columns, or public calculator inputs.
- **Recommended next run:** Next monthly window or before a major analytics/export milestone.

## Changelog (audit scope)

- **2026-03-30:** Run 4 — Full math lane per `docs/process/math-logic-audit.md` and canonical template in `docs/process/audit-report-template.md`: amortization, projections, tolerance vs strict, property/portfolio metrics, public calculator, benchmark utils, RentCast consumption (no local AVM math), policies, continuity with Run 3. Audit-only; no code changes.
