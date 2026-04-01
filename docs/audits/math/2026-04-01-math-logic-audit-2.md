# Math & Logic Audit — 2026-04-01 (run suffix **-2**)

## Executive summary

- **Second full pass** the same day per `docs/process/math-logic-audit.md` §6 (checklist executed independently on current sources). **All scoped formula checks, edge-matrix paths, and cross-module rules PASS**; no FAIL rows in the module tables below.
- **Risk:** None elevated in-scope. **Low** observations only: optional DRY alignment between `generateAmortizationSchedule` and `isNegativeAmortizingPayment`; future-dated `balanceAsOfDate` still satisfies “stored” when `>= today − 180 days`.
- **Recommendation:** Treat math lane as healthy for release; optional follow-ups are hygiene (see Low findings). Re-run after edits to amortization, metrics, benchmark utils, or RentCast hourly constants.

---

## Severity-ranked findings

### Critical

- None (in-scope modules).

### High

- None (in-scope modules).

### Medium

- None (in-scope modules).

### Low

- **`generateAmortizationSchedule` vs `isNegativeAmortizingPayment`** — Schedule generation uses an inline check `monthlyPayment + AMORTIZATION_COMPARISON_EPSILON < interest`; payoff and extra-payment paths use `isNegativeAmortizingPayment`. Semantics align (ε-discounted); consolidating would reduce future drift if epsilon rules change. — `app/lib/amortization.ts` (schedule loop ~69–71; helper ~14–22).

- **Future-dated `balanceAsOfDate`** — `getEffectiveBalance` / `getBalanceSource` use `balanceAsOf >= sixMonthsAgo` with no upper bound, so a forward-dated as-of still reads as “stored.” Unlikely with validated inputs. — `app/lib/amortization.ts` ~175–180, 203–208.

---

## Evidence reviewed

- `app/lib/amortization.ts` (full read — all exports through `getPayoffYearsWithExtraWithTolerance`)
- `app/lib/metrics/property-metrics.ts` (full)
- `app/lib/metrics/portfolio-metrics.ts` (full)
- `app/lib/benchmark-utils.ts` (full)
- `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`, `getRentCastHourlyLimit`)
- `docs/process/math-logic-audit.md` (§1–§7, edge case matrix §4)
- `docs/process/audit-report-template.md`
- `docs/reference/rentcast-quota.md` (shared pool / hourly caps vs code)
- Tests on disk for edge coverage: `app/lib/amortization.test.ts`, `app/lib/benchmark-utils.test.ts`

**Limits:** Static review and spec/trace alignment; no `npm test` executed in this pass.

---

## Risk & impact assessment

Guarded divisions (`estimatedValue > 0`, `marketRent > 0`, `totalMarketValue > 0`, `totalCashInvested > 0`, `totalAnnualDebtService > 0` where used). Amortization rejects non-positive balance/payment before forward iteration. Low items are maintainability / input-shape edge cases, not incorrect core formulas under normal data.

---

## Recommendations (prioritized)

1. **On next amortization change** — Consider calling `isNegativeAmortizingPayment` from `generateAmortizationSchedule` so negative-amort detection stays single-sourced with payoff/extra-payment loops.
2. **Product/data** — If future `balanceAsOfDate` must never mean “stored,” enforce at validation; else document intended behavior.
3. **Cadence** — Re-audit monthly or when any scoped file changes materially.

---

## Task candidates (optional)

- [ ] (Optional) Use `isNegativeAmortizingPayment` inside `generateAmortizationSchedule` for DRY consistency with `getPayoffProjection` / strict extra-payment helpers.

---

## Re-test checklist

- [ ] After code changes in scoped libs: `vitest` for `amortization`, `benchmark-utils`, and metrics modules as touched.
- [ ] `npm run check` when application code changes.

---

## Next trigger and cadence

- **Trigger:** Monthly, or any change to `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`, or `RENTCAST_HOURLY_LIMITS` / `getRentCastHourlyLimit`.
- **Recommended next window:** 2026-05-01 or next release touching analytics math.

---

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: interest = balance × monthlyRate; principal capped; balance update; 2-decimal rounding | PASS | ~66–89; exits when payment + ε < interest |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | ~55–57 |
| `getPiForAmortization`: P&I = payment − escrow when applicable; clamp ≥ 0.01 | PASS | ~117–130 |
| `getProjectedBalanceAsOf`: as-of before start month → 0 | PASS | ~144–148 |
| `getEffectiveBalance` / `getBalanceSource`: same 180-day staleness | PASS | ~169–211 |
| `getEffectiveBalance`: projected 0 → fallback `currentBalance` | PASS | ~191–192 |
| `getPayoffProjection`: `getEffectiveBalance`, `getPiForAmortization`; iteration matches schedule; negative amort guard | PASS | ~302–360 |
| Edge: balance ≤ 0 or payment ≤ 0 → both nulls | PASS | ~313–315 |
| Edge: payment does not amortize → `payoffDate` null, `remainingAtTermEnd` rounded | PASS | ~317–320, 335–339, 356–359 |
| `getMonthsToPayoffWithExtraStrict` / `WithTolerance`: iteration parity | PASS | ~385–477 |
| `getExtraPaymentForYearsEarlier`: requires `payoffDate`; `targetMonths ≤ 0` → null | PASS | ~489–501 |
| `getPayoffYearsWithExtra`: `extraPayment < 0` → null | PASS | ~586–587 |
| Tolerance helpers (`getToleranceResidualThreshold`, `isWithinTermEndTolerance`, `getToleranceAdjustedPayoffDate`, `getToleranceAwarePayoffProjection`) | PASS | ~258–377 |
| `getPaymentStartLagMonths` capped | PASS | ~242–256 |
| Inline ε vs `isNegativeAmortizingPayment` in schedule | NOTE | Equivalent; see Low finding |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent = monthlyRent × (1 − vacancyPercent/100)` | PASS | ~92 |
| `grossAnnualRent`, `annualExpenses`, `noi` | PASS | ~94–96; scaled outputs ~118–120 |
| `capRate` when `estimatedValue > 0` | PASS | ~97 |
| Edge: `estimatedValue = 0` → `capRate` / `ltv` null | PASS | ~97, 111 |
| `monthlyCashFlow`: full_liability vs proportional | PASS | ~101–103 |
| `equity`, `ltv`, `cashOnCashReturn` | PASS | ~108–115 |
| Edge: `cashInvested` null or ≤ 0 → `cashOnCashReturn` null | PASS | ~113–115 |
| `scaleLiabilityAmount`, `getAnnualDebtService`, `computeAnnualCashFlowFromAnnualInputs` | PASS | ~37–73 |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `weightedCapRate = totalNoi / totalMarketValue` (guard) | PASS | ~107–108 |
| `portfolioLtv = totalDebt / totalMarketValue` | PASS | ~108 |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | ~109–110 |
| `dscr` when `totalAnnualDebtService > 0` | PASS | ~104–105 |
| Empty `properties` → zeros and nulls | PASS | ~42–59 |
| `totalDebt` full_liability vs proportional | PASS | ~93–97 |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct`: `marketRent ≤ 0` → 0 | PASS | ~58–60 |
| `isBenchmarkFresh` / `isBenchmarkFreshAt`: strict `< BENCHMARK_FRESHNESS_MAX_MS` | PASS | ~28–35; 60×24h ms window |
| `getBenchmarkLabel`: `abs(pct) < 1` → at market | PASS | ~74–79 |
| `getBenchmarkDaysAgo` floors whole days | PASS | ~42–49 |

### lib/plans.ts (RentCast hourly limits — §1.1)

| Check | Status | Notes |
|-------|--------|-------|
| `RENTCAST_HOURLY_LIMITS`: free 5, investor 10, pro 20 | PASS | ~26–30; matches `docs/reference/rentcast-quota.md` |
| `getRentCastHourlyLimit` unknown tier → free | PASS | ~47–49 |

---

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` ↔ `generateAmortizationSchedule` iteration | PASS | Same monthly rate, principal cap, balance update |
| `getEffectiveBalance` ↔ `getBalanceSource` staleness (180 days) | PASS | Identical `sixMonthsAgo` math |
| Mortgage rate decimal; `/12` monthly | PASS | `amortization.ts` |
| `getMonthsToPayoffWithExtraStrict` ↔ `getPayoffProjection` | PASS | Same loop structure and guards |

---

## Findings / recommendations (math-lane index)

- **FAIL:** None in scoped modules.
- **Low:** DRY note on schedule vs `isNegativeAmortizingPayment`; future `balanceAsOfDate` semantics.

---

## Changelog (audit scope)

- **2026-04-01 (suffix -2):** Math & Logic audit per `docs/process/math-logic-audit.md`. Scope: `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`, `app/lib/plans.ts` (RentCast hourly limits). Report structure: `docs/process/audit-report-template.md` + process §7 tables. **No code changes** (audit only).
