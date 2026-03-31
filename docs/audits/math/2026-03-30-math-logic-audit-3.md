# Math & Logic Audit — 2026-03-30 (Run 3)

## Executive summary

- Core amortization iteration, effective-balance staleness (180 days), property/portfolio metrics, and benchmark percentage math match the formulas and edge-case behavior documented in `docs/process/math-logic-audit.md` §2–4 and `docs/policies/analytics-math-policy.md` / `docs/policies/ownership-metrics.md` (where they extend the older engineering backlog).
- Strict vs tolerance-aware payoff is correctly split: API routes and portfolio CSV use `getPayoffProjection` (strict); the mortgage workspace UI uses tolerance-aware helpers with policy-aligned labeling in module docs (`app/lib/amortization.ts`, `docs/policies/analytics-math-policy.md` §3.7).
- Remaining gaps are **documentation drift** (process inventory and `engineering-spec.md` §6 vs current contracts) and **test breadth** (golden fixtures skew to full-ownership proportional cases), not observed formula bugs in reviewed paths.

## Severity-ranked findings

### Critical

- None.

### High

- None identified in reviewed implementation paths. Mortgage payoff tolerance is confined to documented UI surfaces; `GET` mortgage and amortization routes expose strict contracts only (`app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts`, `app/app/api/export/portfolio/route.ts`).

### Medium

- **`docs/reference/engineering-spec.md` §6 (Calculation Backlog) is stale relative to shipped behavior** — It lists gross annual rent as `monthly_rent * 12`, monthly cash flow without vacancy, and omits ownership display modes. Implementation and golden fixtures follow `docs/policies/ownership-metrics.md` and `app/lib/metrics/property-metrics.ts` (effective rent, scaled NOI, cap rate on full-property NOI ÷ value, etc.). **Risk:** external readers or future tasks copy §6 and reintroduce wrong formulas. **Evidence:** `docs/reference/engineering-spec.md` lines ~529–564; `app/lib/metrics/property-metrics.ts` `computePropertyMetrics`; `app/lib/test/fixtures/metrics-golden.ts` header comment.

### Low

- **`docs/process/math-logic-audit.md` §1.1 inventory omits current symbol names** — The live API for “months to payoff with extra” is `getMonthsToPayoffWithExtraStrict` / `getMonthsToPayoffWithExtraWithTolerance`, not `getMonthsToPayoffWithExtra`. **Evidence:** `app/lib/amortization.ts`; process doc §1.1 table.

- **Benchmark “freshness” wording ambiguity** — `math-logic-audit.md` §2.4 says `isBenchmarkFresh: marketRentAsOf within 60 days`. Implementation uses a **strict** millisecond window (`now - asOf < 60 × 24 × 60 × 60 × 1000`), so a snapshot at exactly 60 full days is stale. This matches `docs/policies/analytics-math-policy.md` §3.6 and `app/lib/benchmark-utils.ts`; the process doc could say “strictly within” to match. **Evidence:** `app/lib/benchmark-utils.ts` `BENCHMARK_FRESHNESS_MAX_MS`, `isBenchmarkFreshAt`.

- **Residual at term end rounding** — `getPayoffProjection` returns `remainingAtTermEnd: Math.round(runningBalance)` (integer dollars) while schedule rows use cent rounding. Acceptable for API/display but not identical precision to amortization rows. **Evidence:** `app/lib/amortization.ts` `getPayoffProjection` return; `generateAmortizationSchedule` row rounding.

## Module results

### lib/amortization.ts (`app/lib/amortization.ts`)

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: interest = balance × monthlyRate; principal capped by balance; balance = max(0, balance − principal) | PASS | Matches §2.1; negative amortization when P&I &lt; interest is handled via negative principal (equivalent to min(payment−interest, balance) for positive balance). |
| `generateAmortizationSchedule` edge: originalLoanAmount ≤ 0 or monthlyPayment ≤ 0 → [] | PASS | Lines 36–37. |
| `getPiForAmortization`: P&I = payment or payment − escrow; clamp ≥ 0.01 | PASS | Lines 94–107; aligns with tests `app/lib/amortization.test.ts`. |
| `getProjectedBalanceAsOf`: before start month → 0; mid-loan → last row balance | PASS | Lines 114–139; tested in `amortization.test.ts`. |
| `getEffectiveBalance` / `getBalanceSource`: 180-day staleness aligned | PASS | Same `sixMonthsAgo` construction (lines 152–155 vs 179–182); projection fallback when projected ≤ 0 (lines 168–169). |
| `getPayoffProjection` iteration matches schedule logic | PASS | Same interest / principal / balance update as `generateAmortizationSchedule` (lines 305–312 vs 49–57). |
| `getPayoffProjection` edge: balance ≤ 0 or payment ≤ 0 → nulls | PASS | Lines 290–291; tested. |
| `getPayoffProjection` non-amortizing loan → null payoff, remaining at term | PASS | Loop exhausts with balance &gt; 0. |
| `getExtraPaymentForYearsEarlier` requires strict payoff; binary search uses `getMonthsToPayoffWithExtraStrict` | PASS | Lines 440–475; null when `projection.payoffDate` null or `targetMonths` ≤ 0. |
| `getPayoffYearsWithExtra`: extra &lt; 0 → null | PASS | Lines 541–542; tested. |
| Tolerance helpers documented UI-only vs strict core | PASS | Comments + `analytics-math-policy.md` §3.7. |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| effectiveRent, grossAnnualRent, annualExpenses, NOI | PASS | Lines 90–96; matches process §2.2 with default vacancy 5%. |
| capRate = NOI / estimatedValue when value &gt; 0; uses **unscaled** NOI for cap rate while returning scaled `metrics.noi` | PASS | Lines 96–97, 117–120; intentional per `metrics-golden.ts` / ownership policy. |
| monthlyCashFlow: full_liability vs proportional | PASS | Lines 101–103; matches process §2.2. |
| equity, ltv guards | PASS | Lines 108–111. |
| cashOnCashReturn when cashInvested null or ≤ 0 | PASS | Lines 113–115. |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| Empty properties → zeros and nulls | PASS | Lines 42–59; `portfolio-metrics.test.ts`. |
| weightedCapRate = totalNoi / totalMarketValue | PASS | Line 107. |
| portfolioLtv = totalDebt / totalMarketValue | PASS | Line 108; `full_liability` uses full debt lines 93–97. |
| portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested | PASS | Line 110. |
| totalMonthlyRent / totalAnnualRent align with vacancy-adjusted NOI rent leg | PASS | Lines 81, 85; matches `analytics-math-policy.md` §3.4. |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| getBenchmarkPct: marketRent ≤ 0 → 0 | PASS | Lines 58–60. |
| getBenchmarkLabel / tone: ~1% band “at market” | PASS | Lines 74–79; uses `getBenchmarkPct`. |
| Freshness: strict &lt; 60-day window | PASS | `isBenchmarkFreshAt` lines 28–35 — see Low finding on doc wording. |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Payoff iteration shared across `generateAmortizationSchedule` and `getPayoffProjection` / extra-payment strict path | PASS | Same monthly interest/principal/balance core. |
| `getEffectiveBalance` and `getBalanceSource` staleness threshold | PASS | Both 180-day lookback. |
| Rate as decimal ÷ 12 for monthly rate | PASS | `amortization.ts`; Prisma decimals coerced via `Number()` at call sites. |
| Amortization API P&amp;I: `getPiForAmortization` for schedule | PASS | `app/app/api/properties/[id]/amortization/route.ts` lines 31–36; chart consumes same API `app/components/charts/amortization-chart.tsx`. |
| Metrics: UI/API/export/deals/public calculator use `computePropertyMetrics` / `computePortfolioMetrics` | PASS | Grep: `app/lib/public-calculator.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/portfolio/summary/route.ts`, pages under `app/app/(app)/`. |

## Evidence reviewed

- **Core math:** `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`
- **Tests:** `app/lib/amortization.test.ts`, `app/lib/metrics/property-metrics.test.ts`, `app/lib/metrics/portfolio-metrics.test.ts`, `app/lib/metrics/metrics-golden.test.ts`
- **Golden fixtures:** `app/lib/test/fixtures/metrics-golden.ts`
- **API / export surfaces:** `app/app/api/properties/[id]/amortization/route.ts`, `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/app/api/properties/[id]/metrics/route.ts`
- **UI payoff (tolerance):** `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (`getToleranceAwarePayoffProjection`, `getExtraPaymentForYearsEarlierWithTolerance`, local `simulateMortgage`)
- **Policies:** `docs/policies/analytics-math-policy.md`, `docs/policies/ownership-metrics.md` (referenced via fixtures), `docs/process/math-logic-audit.md`, `docs/reference/engineering-spec.md` §6
- **Assumptions:** No execution of `npm run test` in this audit pass; conclusions rely on static review and existing tests on disk.

## Risk & impact assessment

- **Unresolved Medium (spec drift):** Teams relying on `engineering-spec.md` §6 alone could implement pre-vacancy, pre-ownership metrics and diverge from production — moderate likelihood if that section is used as a sole spec, user-visible impact if wrong formulas ship in a new surface.
- **Low doc/test gaps:** Lower exposure; golden tests still catch proportional regressions for canonical fixtures.

## Recommendations (prioritized)

1. **Replace or banner `engineering-spec.md` §6** with a pointer to `ownership-metrics.md`, `analytics-math-policy.md`, and the `computePropertyMetrics` / `computePortfolioMetrics` source so the “Calculation Backlog” cannot be mistaken for the live contract.
2. **Update `docs/process/math-logic-audit.md` §1.1** to list `getMonthsToPayoffWithExtraStrict` and `getMonthsToPayoffWithExtraWithTolerance`, and tighten benchmark freshness wording to “strictly within 60 full days.”
3. **Optional:** Add a portfolio golden case with partial ownership and/or `full_liability` if regression sensitivity for those modes should match single-property coverage.

## Task candidates (optional)

- [ ] Align `docs/reference/engineering-spec.md` §6 with current metrics policy or mark it superseded.
- [ ] Refresh `docs/process/math-logic-audit.md` module inventory and benchmark freshness phrasing.
- [ ] Add golden coverage for partial-ownership portfolio aggregation (if product priority).

## Re-test checklist

- [ ] After any doc change: spot-check that linked line references in policies still match code.
- [ ] After any metrics/amortization code change: `npm run test` and targeted review of `metrics-golden.test.ts` / `amortization.test.ts`.
- [ ] `npm run check` when code changes are made.

## Next trigger and cadence

- **Trigger:** Release touching `app/lib/amortization.ts`, `app/lib/metrics/`, benchmark contracts, or export/API metric columns.
- **Recommended next run:** Next monthly window or before a major analytics/export milestone.

## Changelog (audit scope)

- **2026-03-30:** Run 3 — Full math lane per `docs/process/math-logic-audit.md`: amortization, projections, tolerance vs strict, property/portfolio metrics, ownership modes, benchmark utils, golden tests, API/export/UI consumption. Audit-only; no code changes.
