# Math & Logic Audit — 2026-04-29

## Executive summary

- **Core math libraries match** `docs/process/math-logic-audit.md`: amortization iteration (interest = balance × monthly rate, principal capped to balance, ε-guarded sub-interest payments), shared 180-day staleness for `getEffectiveBalance` / `getBalanceSource`, property and portfolio metric formulas with guarded divisions, and benchmark freshness as a strict millisecond comparison to `60 × 24h` in `app/lib/benchmark-utils.ts`.
- **No critical or high-severity formula defects** were found in scoped modules (`amortization`, `property-metrics`, `portfolio-metrics`, `benchmark-utils`, `plans` quota constants).
- **Residual gaps are behavioral disclosure and documentation:** mortgage milestone detection still uses tolerance-aware payoff without matching email disclosure; process doc wording for balance source tiers is shorter than the three exported values.
- **Recommendation:** Ship current math as-is for correctness; backlog doc/email alignment items below unless product tightens milestone copy.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **Milestone emails use tolerance-aware payoff without explicit disclosure** — `app/lib/mortgage-milestones.ts` (~line 85) calls `getToleranceAwarePayoffProjection` while `app/lib/emails/mortgage-milestones.ts` does not state that payoff dates may be adjusted for end-of-term residual tolerance. Users may interpret email dates as strictly amortizing.

### Low

- **`docs/process/math-logic-audit.md` §2.1 vs `getBalanceSource`** — Implementation exposes three tiers (`stored` | `stored_projected` | `projected`) in `app/lib/amortization.ts` (`getBalanceSource`, lines 233–251); the process inventory’s shorthand “stored vs projected” underspecifies this for auditors (documentation drift only).
- **`projectStoredBalanceForward` vs ε-based amortization paths** — Forward projection exits when `pi <= interest` (`app/lib/amortization.ts` lines 184–185); `generateAmortizationSchedule` and `getPayoffProjection` reject sub-interest payments using `AMORTIZATION_COMPARISON_EPSILON`. Divergence only in pathological rounding bands.
- **`generateAmortizationSchedule` returns `[]` for negative-amortizing P&I** when `monthlyPayment > 0` but payment is below interest (lines 69–71), beyond the matrix row that only lists `monthlyPayment ≤ 0`; intentional per `app/lib/amortization.test.ts`.

## Evidence reviewed

| Area | Paths |
|------|--------|
| Amortization & refinance | `app/lib/amortization.ts`, `app/lib/amortization.test.ts` |
| Property / portfolio metrics | `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/metrics/property-metrics.test.ts`, `app/lib/metrics/portfolio-metrics.test.ts`, `app/lib/metrics/metrics-golden.test.ts` |
| Benchmarks | `app/lib/benchmark-utils.ts`, `app/lib/benchmark-utils.test.ts` |
| RentCast hourly caps (inventory §1.1) | `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`, `getRentCastHourlyLimit`) |
| Related: milestone consumers | `app/lib/mortgage-milestones.ts`, `app/lib/emails/mortgage-milestones.ts` |
| Process / template | `docs/process/math-logic-audit.md`, `docs/process/audit-report-template.md` |

**Limits of this pass:** Read-only review of implementations and tests; no `npm run check` executed. Routes and UI call sites were not exhaustively retraced unless needed for scoped modules. **`app/` was not modified** (audit-only).

## Risk & impact assessment

- **Medium (milestone email):** Affects clarity on a transactional channel; payoff dates shown may match tolerance-adjusted logic while copy reads as exact amortization. Core dashboard/API math remains consistent with written formulas.
- **Low:** Documentation and rare boundary behaviors; minimal impact on typical mortgage inputs.

## Recommendations (prioritized)

1. Add one line of disclosure to mortgage milestone email templates when content depends on `getToleranceAwarePayoffProjection`, or switch detection to strict `getPayoffProjection` if marketing requires conservative claims.
2. Update `docs/process/math-logic-audit.md` §2.1 / §3 cross-module notes to document all three `getBalanceSource` return values explicitly.
3. If amortization projection is refactored, add a regression test around `projectStoredBalanceForward` near `pi ≈ interest` if ε vs strict comparison becomes a merge risk.

## Task candidates (optional)

- [ ] Disclose tolerance (or use strict payoff) for mortgage milestone email content tied to `getToleranceAwarePayoffProjection`.
- [ ] Align `math-logic-audit.md` `getBalanceSource` description with the three-tier implementation.

## Re-test checklist

- [ ] After any milestone email or amortization changes: targeted tests + manual email sample review.
- [ ] `npm run check` when application code changes land.

## Next trigger and cadence

- **Trigger:** Release touching `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`, `app/lib/plans.ts` quota math, or consumers that re-encode these formulas.
- **Recommended next run:** Monthly math lane or before major mortgage/analytics releases.

---

## Summary (process §7)

Scoped modules show consistent formulas, guarded divisions, and edge handling aligned with the edge-case matrix. Residual notes concern documentation completeness and tolerance disclosure on an adjacent email surface, not systemic formula errors.

## Module results

### `app/lib/amortization.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` core iteration matches spec (interest = balance × r/12; principal capped; ε rejects sub-interest payment) | PASS | Lines 66–88; aligns with canonical min(principal, balance) intent. |
| Rounding to 2 decimals per schedule row | PASS | Lines 85–88. |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | Lines 55–57. |
| `getPayoffProjection` iteration matches schedule logic | PASS | Lines 412–426; shared structure with ε. |
| `getEffectiveBalance` / `getBalanceSource` share 180-day staleness (`setDate(...- 180)`) | PASS | Lines 200–251. |
| Edge: balance ≤ 0 or payment ≤ 0 → null payoff fields | PASS | Lines 391–393. |
| Edge: negative amortization → `payoffDate` null; residual surfaced | PASS | Lines 396–398, 414–418. |
| `getPiForAmortization` escrow clamp ≥ 0.01 | PASS | Lines 126–128. |
| `getProjectedBalanceAsOf`: before normalized start month → 0 | PASS | Lines 148–148. |
| `getExtraPaymentForYearsEarlier` requires `payoffDate`; `targetMonths ≤ 0` → null | PASS | Lines 570–582. |
| `getPayoffYearsWithExtra` negative extra → null | PASS | Lines 667–668. |
| `getStandardMonthlyPayment` guards | PASS | Lines 738–748. |
| `getRefinanceProjection` iteration and guards | PASS | Lines 757–895. |

### `app/lib/metrics/property-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent`, `grossAnnualRent`, `annualExpenses`, `noi`, `capRate` | PASS | Lines 92–97; cap rate uses full-property NOI vs `estimatedValue`. |
| `monthlyCashFlow` full_liability vs proportional | PASS | Lines 101–103. |
| `equity`, `ltv` with `estimatedValue > 0` | PASS | Lines 108, 111. |
| `cashOnCashReturn` denominator | PASS | Lines 113–115. |
| Edge: `estimatedValue = 0` → cap/ltv null | PASS | Lines 97, 111. |
| Edge: `cashInvested` null or ≤ 0 → CoC null | PASS | Lines 113–115. |

### `app/lib/metrics/portfolio-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Empty properties → zeros and null ratios | PASS | Lines 42–59. |
| `weightedCapRate = totalNoi / totalMarketValue` | PASS | Line 107. |
| `portfolioLtv = totalDebt / totalMarketValue` | PASS | Line 108. |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | Lines 109–110. |
| `dscr` denominator guard | PASS | Lines 104–105. |

### `app/lib/benchmark-utils.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct`: `marketRent ≤ 0` → 0 | PASS | Lines 58–60. |
| `isBenchmarkFresh` strict ms window (boundary stale) | PASS | Lines 12–13, 28–39; see `benchmark-utils.test.ts` boundary case. |
| `getBenchmarkLabel`: `abs(pct) < 1` → at market | PASS | Lines 74–79. |

### `app/lib/plans.ts` (RentCast / quotas)

| Check | Status | Notes |
|-------|--------|-------|
| `RENTCAST_HOURLY_LIMITS` matches doc (free 5, investor 10, pro 20) | PASS | Lines 26–30; see `docs/reference/rentcast-quota.md`. |
| `getRentCastHourlyLimit` fallback for unknown tier | PASS | Lines 100–103 → defaults to free. |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` / `generateAmortizationSchedule` use same iteration semantics (principal cap, ε on interest check) | PASS | Compared `amortization.ts` loops. |
| `getEffectiveBalance` / `getBalanceSource` staleness threshold 180 days | PASS | Same `sixMonthsAgo` computation. |
| Monthly rate `Number(rate)/12` | PASS | Mortgage record consumers in same file. |
| `getMonthsToPayoffWithExtraStrict` aligns with payoff iteration | PASS | Same inner loop structure as `getPayoffProjection`. |

## Findings / recommendations

See **Severity-ranked findings** and **Recommendations** above. No FAIL items requiring immediate code fixes in scoped pure math modules; medium/low items are suitable for backlog or documentation updates.

## Changelog (audit scope)

- **2026-04-29:** Initial audit pass for this artifact. Scope: `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`, `app/lib/plans.ts` (RentCast hourly limits per process §1.1). Adjacent milestone email usage noted under Medium.
