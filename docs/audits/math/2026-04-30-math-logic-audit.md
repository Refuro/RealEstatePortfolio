# Math & Logic Audit — 2026-04-30

## Executive summary

- **Scoped libraries remain internally consistent** with `docs/process/math-logic-audit.md`: amortization iteration (interest on balance, principal capped, ε-guarded sub-interest rejection), shared 180-day window for `getEffectiveBalance` / `getBalanceSource`, property and portfolio metric formulas with division guards, benchmark freshness as strict ms comparison to `60 × 24h`, and RentCast hourly caps as plain tier constants in `app/lib/plans.ts`.
- **No new critical or high-severity formula bugs** were identified in amortization, property/portfolio metrics, benchmark utils, or quota constants on this pass.
- **Residual issues are product/documentation adjacent:** mortgage milestone content still derives dates from tolerance-aware payoff without email disclosure; process-doc wording for metrics and balance source lags canonical policy and implementation detail.
- **Recommendation:** Keep shipping core math; prioritize milestone email disclosure or strict payoff if marketing claims require amortization-exact dates; trim process-doc drift when convenient.

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified.

### Medium

- **Mortgage milestone detection uses tolerance-aware payoff without matching email disclosure** — `app/lib/mortgage-milestones.ts` calls `getToleranceAwarePayoffProjection` (~line 85) while users reading transactional email copy may assume a strictly amortizing payoff date. Impact: interpretability on email channels, not silent miscalculation of schedules elsewhere.

### Low

- **`docs/process/math-logic-audit.md` §2.2 vs `docs/policies/ownership-metrics.md`** — Canonical policy §2 fixes monthly cash flow as `(R - E - P) * s` only; the math-logic audit still lists legacy “full_liability vs proportional” wording. Auditors should treat `ownership-metrics.md` as authoritative for ownership scaling.
- **`projectStoredBalanceForward` vs schedule/payoff ε comparison** — Stored-balance forward projection breaks when `pi <= interest` (`app/lib/amortization.ts` ~184–185) while `generateAmortizationSchedule` / `getPayoffProjection` use `AMORTIZATION_COMPARISON_EPSILON`. Divergence only in a narrow rounding band around payment ≈ interest.
- **`docs/process/math-logic-audit.md` §2.1 shorthand for `getBalanceSource`** — Implementation returns three tiers (`stored` | `stored_projected` | `projected`); the process inventory compresses this to “stored vs projected,” which underspecifies audits.

## Evidence reviewed

| Area | Paths |
|------|--------|
| Amortization & refinance | `app/lib/amortization.ts` |
| Property / portfolio metrics | `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts` |
| Benchmarks | `app/lib/benchmark-utils.ts` |
| RentCast hourly caps (inventory §1.1) | `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`, `getRentCastHourlyLimit`) |
| Related consumer (finding context) | `app/lib/mortgage-milestones.ts` |
| Canonical policy | `docs/policies/ownership-metrics.md` |
| Process / template | `docs/process/math-logic-audit.md`, `docs/process/audit-report-template.md` |

**Limits of this pass:** Read-only review of implementations against written specs and policy; no `npm run check` executed. UI and API call sites were not exhaustively traced. **No edits under `app/`** (audit-only).

## Risk & impact assessment

- **Medium (milestone email):** Misalignment between tolerance-adjusted dates and copy that reads as exact amortization affects trust on a transactional channel; core dashboard formulas remain consistent with documented iteration rules.
- **Low:** Documentation drift and rare boundary consistency between forward projection and ε-based paths; limited exposure for typical mortgage inputs.

## Recommendations (prioritized)

1. Add explicit disclosure in mortgage milestone emails when dates come from `getToleranceAwarePayoffProjection`, or switch milestone detection to strict `getPayoffProjection` if product requires conservative claims.
2. Update `docs/process/math-logic-audit.md` §2.2 to reference `ownership-metrics.md` monthly cash flow only, and §2.1 / inventory to list all three `getBalanceSource` values.
3. If refactoring amortization helpers, unify `projectStoredBalanceForward` negative-amort detection with ε-based comparisons or add a regression test for `pi ≈ interest` after stored balance projection.

## Task candidates (optional)

- [ ] Disclose tolerance (or use strict payoff) for mortgage milestone email content tied to `getToleranceAwarePayoffProjection`.
- [ ] Align `math-logic-audit.md` metric and balance-source wording with `ownership-metrics.md` and `app/lib/amortization.ts`.

## Re-test checklist

- [ ] After milestone email or amortization changes: targeted tests + sample email review.
- [ ] `npm run check` when application code changes land.

## Next trigger and cadence

- **Trigger:** Release touching `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`, `app/lib/plans.ts` quota math, or consumers that re-encode these formulas.
- **Recommended next run:** Monthly math lane or before major mortgage/analytics releases.

---

## Summary (process §7)

Core amortization, metrics aggregation, benchmark percentage math, and RentCast tier caps align with the edge-case matrix and cross-module rules in the math-logic process document. Open items are disclosure on tolerance-aware payoff in email UX and tightening process documentation against canonical ownership policy.

## Module results

### `app/lib/amortization.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` core iteration matches spec | PASS | Interest = balance × rate/12; principal capped at balance; ε rejects payment below interest (~66–71). |
| Rounding to 2 decimals per schedule row | PASS | ~82–88 |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | ~55–57 |
| Negative-amortizing payment with positive inputs → `[]` | NOTE | Beyond matrix row for `monthlyPayment ≤ 0`; intentional guard (~69–71). |
| `getPayoffProjection` iteration matches schedule logic | PASS | ~412–426 |
| `getEffectiveBalance` / `getBalanceSource` share 180-day staleness | PASS | ~200–251 |
| Edge: balance ≤ 0 or payment ≤ 0 → null payoff fields | PASS | ~391–393 |
| Edge: negative amortization → `payoffDate` null; residual surfaced | PASS | ~396–418 |
| `getPiForAmortization` escrow clamp ≥ 0.01 | PASS | ~126–128 |
| `getProjectedBalanceAsOf`: before normalized start month → 0 | PASS | ~148 |
| `getExtraPaymentForYearsEarlier` requires `payoffDate`; `targetMonths ≤ 0` → null | PASS | ~570–582 |
| `getPayoffYearsWithExtra` negative extra → null | PASS | ~667–668 |
| `getMonthsToPayoffWithExtraStrict` aligns with payoff iteration | PASS | ~495–504 |

### `app/lib/metrics/property-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent`, `grossAnnualRent`, `annualExpenses`, `noi` | PASS | ~92–97 |
| `capRate` with `estimatedValue > 0`; property-level ratio | PASS | ~97; matches ownership policy cancellation intent |
| `monthlyCashFlow` matches `(R - E - P) * s` | PASS | ~86 |
| `equity`, `ltv` guards | PASS | ~105–111 |
| `cashOnCashReturn` denominator | PASS | ~113–116 |
| Edge: `estimatedValue = 0` → cap/ltv null | PASS | ~97, 111 |
| Edge: `cashInvested` null or ≤ 0 → CoC null | PASS | ~113–116 |

### `app/lib/metrics/portfolio-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Empty properties → zeros and null ratios | PASS | ~40–58 |
| `weightedCapRate = totalNoi / totalMarketValue` | PASS | ~107 |
| `portfolioLtv = totalDebt / totalMarketValue` | PASS | ~108 |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | ~109–110 |
| `dscr` denominator guard | PASS | ~104–105 |

### `app/lib/benchmark-utils.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct`: `marketRent ≤ 0` → 0 | PASS | ~58–60 |
| `isBenchmarkFresh` strict `< 60` full-day ms window | PASS | ~12–13, 28–39 |
| `getBenchmarkLabel` / tone: `abs(pct) < 1` → at market | PASS | ~64–79 |

### `app/lib/plans.ts` (RentCast quota)

| Check | Status | Notes |
|-------|--------|-------|
| Tier hourly caps (5 / 10 / 20) | PASS | ~26–30 |
| `getRentCastHourlyLimit` fallback to free | PASS | ~100–102 |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Payoff/schedule iteration logic aligned | PASS | Shared interest → principal → balance pattern with ε |
| `getEffectiveBalance` / `getBalanceSource` staleness threshold aligned | PASS | Same `180`-day rollback |
| Monthly rate = decimal annual / 12 | PASS | Used throughout amortization |
| Extra-payoff strict paths use same iteration as payoff projection | PASS | `getMonthsToPayoffWithExtraStrict` |

## Findings / recommendations

See **Severity-ranked findings** and **Recommendations** above. No FAIL marks were required for core formula checks in scoped modules.

## Changelog (audit scope)

- **2026-04-30:** Initial audit for this date. Scope: `amortization.ts`, `property-metrics.ts`, `portfolio-metrics.ts`, `benchmark-utils.ts`, `plans.ts` RentCast limits; contextual check of `mortgage-milestones.ts` for disclosure gap.
