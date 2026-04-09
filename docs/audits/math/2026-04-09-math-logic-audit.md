# Math & Logic Audit — 2026-04-09

## Executive summary

- **Core libraries align with canonical formulas:** amortization iteration (interest → principal capped at balance, 2dp rounding in schedules), property/portfolio metrics (vacancy-adjusted rent, NOI, weighted cap rate, LTV, DSCR, cash-on-cash), and benchmark freshness (`now − asOf < 60×24h` in ms) match `docs/process/math-logic-audit.md` and `docs/policies/analytics-math-policy.md`.
- **Strict vs tolerance payoff split is enforced on API and export:** mortgage JSON uses `getPayoffProjection` only; portfolio CSV omits payoff simulation and does not call tolerance helpers. Property payoff UI discloses tolerance where accelerated estimates use `*WithTolerance` helpers.
- **Residual risk is disclosure, not formula error:** mortgage milestone detection and customer email copy use `getToleranceAwarePayoffProjection` without an explicit end-of-term tolerance disclaimer in the email body—policy §3.7 expects disclosure on any tolerance surface.
- **Recommendation:** Keep current math modules; optionally add a one-line footnote to milestone email HTML/text when payoff milestones are driven by tolerance-aware projection.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **Milestone emails use tolerance-aware payoff without inline disclosure** — Users may interpret “projected payoff date” in the monthly milestone email as strict amortization; detection uses `getToleranceAwarePayoffProjection` in `app/lib/mortgage-milestones.ts` (e.g. lines 84–100), while rendered copy is built in `app/lib/emails/mortgage-milestones.ts` with no tolerance note. This diverges from `docs/policies/analytics-math-policy.md` §3.7 (“Any surface using these must include disclosure”).

### Low

- **`docs/process/math-logic-audit.md` §2.1 simplifies `getBalanceSource`:** The living contract in code is three tiers (`stored` | `stored_projected` | `projected`) with shared 180-day staleness (`app/lib/amortization.ts` `getBalanceSource`, `getEffectiveBalance`). The process doc’s two-word “stored vs projected” summary is slightly under-specific for auditors—documentation drift only, not a code bug.
- **`generateAmortizationSchedule` rejects negative-amortizing payments with `[]`:** For inputs where `monthlyPayment` is positive but below monthly interest (within `AMORTIZATION_COMPARISON_EPSILON`), the schedule returns empty (`app/lib/amortization.ts` lines 69–71). The written spec emphasizes `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0`; this behavior is stricter and intentional—worth keeping in mind for edge-case QA.

## Evidence reviewed

| Area | Paths / surfaces |
|------|------------------|
| Amortization core & tolerance | `app/lib/amortization.ts`, `app/lib/amortization.test.ts` |
| Property / portfolio metrics | `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/metrics/*.test.ts`, `app/lib/test/fixtures/metrics-golden.ts` |
| Benchmarks | `app/lib/benchmark-utils.ts` |
| Plans / RentCast caps | `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`, `getRentCastHourlyLimit`) |
| API payoff contract | `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` |
| Export | `app/app/api/export/portfolio/route.ts` |
| Snapshots & display-mode reconciliation | `app/lib/snapshots.ts` (`buildSnapshotData`, `adjustSnapshotCashFlow`) |
| UI tolerance disclosure | `app/app/(app)/properties/[id]/payoff-card.tsx`, `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` |
| Milestone detection & email | `app/lib/mortgage-milestones.ts`, `app/lib/emails/mortgage-milestones.ts` |
| Policies / process | `docs/policies/analytics-math-policy.md`, `docs/process/math-logic-audit.md`, `docs/process/audit-report-template.md` |

**Limits of this pass:** No re-execution of numerical golden tests in CI (read-only verification against source). Marketing calculators under `app/lib/*-calculator.ts` are out of scope for the module inventory in `math-logic-audit.md` §1.1 unless extended there.

## Risk & impact assessment

- Unresolved **medium** finding affects trust on a low-frequency channel (email): a small set of users could see an earlier “payoff within 5 years” milestone than strict amortization would allow near term-end residuals. Likelihood is low (depends on loan shape and tolerance thresholds); impact is reputational/clarity rather than incorrect API or export numbers.
- Core dashboard, property API, and CSV export remain reconcilable under documented contracts.

## Recommendations (prioritized)

1. Add a short footnote to mortgage milestone email templates when payoff milestones are present, stating that near–term-end projections may use a small residual tolerance (or switch milestone detection to strict `getPayoffProjection` if marketing prefers conservative emails).
2. Optionally tighten `docs/process/math-logic-audit.md` §2.1 `getBalanceSource` bullet to mention `stored_projected` explicitly so future audits do not false-positive “drift.”
3. Continue running `app/lib/amortization.test.ts` and metrics golden tests on any change to `app/lib/amortization.ts` or `app/lib/metrics/*`.

## Task candidates (optional)

- [ ] Disclose tolerance (or use strict payoff) for mortgage milestone email content tied to `getToleranceAwarePayoffProjection`.
- [ ] Align `math-logic-audit.md` `getBalanceSource` spec text with the three-tier implementation.

## Re-test checklist

- [ ] After any milestone email change: send test email and confirm copy matches chosen contract (strict vs tolerance + disclosure).
- [ ] After amortization changes: `npm run check` and amortization/metrics tests.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Release touching `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`, `app/lib/snapshots.ts`, or export/API portfolio fields.
- **Next run:** Next monthly math lane or before a major analytics/export release.

---

## Module results

### `app/lib/amortization.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` core iteration matches spec (interest = balance × monthly rate; principal capped by balance) | PASS | Also returns `[]` if payment &lt; interest − ε (`AMORTIZATION_COMPARISON_EPSILON`); see Low finding. |
| Rounding to 2 decimals per schedule row | PASS | Lines 82–88. |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | Lines 55–57. |
| `getPayoffProjection` iteration matches schedule logic (principal cap, ε on interest check) | PASS | Lines 412–426 vs 66–80. |
| `getEffectiveBalance` / `getBalanceSource` share 180-day staleness and calendar-month rules | PASS | Lines 194–251 vs 233–251. |
| Edge: `balance ≤ 0` or `payment ≤ 0` → null payoff | PASS | `getPayoffProjection` lines 391–393. |
| Edge: payment does not amortize (negative amort) → null `payoffDate`, balance surfaced | PASS | Lines 396–398, 414–418. |
| `getPiForAmortization` escrow path clamp ≥ 0.01 | PASS | Lines 126–128. |
| `getProjectedBalanceAsOf` before normalized start → 0 | PASS | Lines 148–149. |
| `getExtraPaymentForYearsEarlier` requires strict `payoffDate`; `targetMonths ≤ 0` → null | PASS | Lines 570–582. |
| `getPayoffYearsWithExtra` negative extra → null | PASS | Lines 667–668. |
| Strict helpers used for canonical extra-payoff math; `*WithTolerance` documented UI-only | PASS | Comments lines 459–462, 508–511, 604–607, 693–696. |

### `app/lib/metrics/property-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent = monthlyRent × (1 − vacancyPercent/100)` | PASS | Line 92. |
| `grossAnnualRent` / `noi` / `capRate` / `ltv` formulas | PASS | Lines 94–97, 110–111. |
| `monthlyCashFlow` proportional vs `full_liability` | PASS | Lines 101–103. |
| `cashOnCashReturn` guarded denominator | PASS | Lines 113–115. |
| Edge: `estimatedValue = 0` → `capRate`/`ltv` null | PASS | Lines 97, 111. |
| Edge: `cashInvested` null/zero → `cashOnCashReturn` null | PASS | Lines 113–115. |
| Exported `grossAnnualRent` includes ownership scale (policy §3.4 rent leg) | PASS | Line 118: `(effectiveRent × 12) × scale`. |

### `app/lib/metrics/portfolio-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Empty `properties` → zeros and null ratios | PASS | Lines 42–59. |
| `weightedCapRate = totalNoi / totalMarketValue` | PASS | Line 107. |
| `portfolioLtv = totalDebt / totalMarketValue` | PASS | Line 108 (`totalDebt` respects `full_liability` rules lines 93–97). |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | Lines 109–110. |
| `totalAnnualRent` sums property `grossAnnualRent` (vacancy-adjusted, scaled) | PASS | Lines 85, 121; matches policy §3.4 reconciliation intent. |
| `dscr` denominator uses `getAnnualDebtService` (mode-aware) | PASS | Lines 87–91, 104–105. |

### `app/lib/benchmark-utils.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct`: `(userRent − marketRent) / marketRent × 100`; `marketRent ≤ 0` → 0 | PASS | Lines 58–60. |
| `isBenchmarkFresh` / `isBenchmarkFreshAt`: `nowMs − asOf.getTime() < BENCHMARK_FRESHNESS_MAX_MS` | PASS | Lines 28–34, 13; matches policy §3.6 (strict &lt; 60 full days in ms). |
| `getBenchmarkLabel` uses \|pct\| &lt; 1 as “at market” band | PASS | Lines 74–79 (copy prefixed with “Rent ”). |

### `app/lib/plans.ts` (RentCast quota math)

| Check | Status | Notes |
|-------|--------|-------|
| `RENTCAST_HOURLY_LIMITS` free/investor/pro = 5/10/20 | PASS | Lines 26–30; matches process §1.1 inventory. |
| `getRentCastHourlyLimit` unknown tier → free | PASS | Lines 100–102. |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` and `generateAmortizationSchedule` share iteration semantics | PASS | Same interest/principal/ε pattern. |
| `getEffectiveBalance` and `getBalanceSource` share 180-day window | PASS | Identical `sixMonthsAgo` construction. |
| Mortgage rate stored as decimal; monthly rate = `Number(rate)/12` | PASS | Used throughout `amortization.ts` and consumers. |
| `getMonthsToPayoffWithExtraStrict` matches payoff loop structure | PASS | Lines 495–503 vs 412–426. |
| API/export strict payoff; UI tolerance helpers disclosed on primary payoff surfaces | PASS / PARTIAL | API: `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` lines 64–69. CSV: no payoff fields. UI: `payoff-card.tsx` lines 18–19; `mortgage-tab-content.tsx` lines 494–499. **Gap:** milestone email (see Medium finding). |
| Portfolio “annual rent” and NOI share vacancy-adjusted rent basis | PASS | `computePortfolioMetrics` aggregates `metrics.grossAnnualRent` (`portfolio-metrics.ts` lines 85, 121). |
| Snapshots store proportional cash flow; `adjustSnapshotCashFlow` reconciles `full_liability` | PASS | `snapshots.ts` lines 39–40, 145–165; documented formula. |

## Findings / recommendations (summary)

- No formula failures in scoped modules; primary follow-up is **policy §3.7 disclosure** for tolerance-based payoff messaging in **email** milestones.
- Documentation: process doc could name `stored_projected` explicitly for `getBalanceSource`.

## Changelog (audit scope)

- **2026-04-09:** Full math-lane pass against current `app/lib` sources. Scope: amortization, property-metrics, portfolio-metrics, benchmark-utils, plans RentCast caps; cross-check API mortgage JSON, portfolio CSV export, snapshots, and selected UI/email consumers for analytics-math policy alignment.
