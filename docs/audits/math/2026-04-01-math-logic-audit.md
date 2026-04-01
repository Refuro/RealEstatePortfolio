# Math & Logic Audit — 2026-04-01

## Executive summary

- **In-scope modules** (`docs/process/math-logic-audit.md` §1.1): amortization, property-metrics, portfolio-metrics, benchmark-utils, and RentCast hourly caps in `plans.ts` — **all core formula and edge-case checks PASS**; no FAIL items in the math-lane tables below.
- **Cross-module rules** (iteration parity, 180-day staleness, decimal rate usage) are **consistent** with the reference specs in the process doc §2.
- **Observations (Low / NOTE only):** `generateAmortizationSchedule` uses an inline negative-amort check (`monthlyPayment + ε < interest`) rather than calling `isNegativeAmortizingPayment` (equivalent semantics); future-dated `balanceAsOfDate` is treated as “stored” because it satisfies `>= sixMonthsAgo`.
- **Out of scope for this lane:** standalone calculators (`public-calculator`, BRRR, fix-and-flip, STR/LTR), API routes, and Prisma validation — not audited in this pass unless noted as supporting context.

---

## Severity-ranked findings

### Critical

- None (in-scope modules).

### High

- None (in-scope modules).

### Medium

- None (in-scope modules).

### Low

- **`generateAmortizationSchedule` vs shared helper** — The schedule loop uses `monthlyPayment + AMORTIZATION_COMPARISON_EPSILON < interest` before aborting, while payoff/extra-payment paths use exported `isNegativeAmortizingPayment`. Behavior is aligned; unifying on one helper would reduce drift risk. — `app/lib/amortization.ts` (e.g. lines 69–71 vs 14–22).

- **Future-dated `balanceAsOfDate`** — `getEffectiveBalance` / `getBalanceSource` treat any `balanceAsOfDate >= today − 180 days` as stored, including dates in the future. Unlikely with validated inputs; if it occurs, stored balance is used without warning. — `app/lib/amortization.ts` lines 175–180, 203–208.

---

## Evidence reviewed

- `app/lib/amortization.ts` (full read — all listed exports through `getPayoffYearsWithExtraWithTolerance`)
- `app/lib/metrics/property-metrics.ts` (full)
- `app/lib/metrics/portfolio-metrics.ts` (full)
- `app/lib/benchmark-utils.ts` (full)
- `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`, `getRentCastHourlyLimit`)
- `docs/process/math-logic-audit.md` (§1–§7, edge matrix)
- `docs/process/audit-report-template.md`
- `docs/reference/rentcast-quota.md` (quota model vs code)
- `docs/policies/analytics-math-policy.md` (referenced for benchmark §3.6; boundary matches code/tests)
- Tests sampled for edge coverage: `app/lib/amortization.test.ts`, `app/lib/benchmark-utils.test.ts`

**Limits:** No `npm test` run this pass; conclusions are from static review and alignment with specs/tests on disk.

---

## Risk & impact assessment

All **division-by-zero** paths in the scoped metrics and benchmark helpers are guarded (`estimatedValue > 0`, `marketRent > 0`, `totalMarketValue > 0`, `totalCashInvested > 0`, `totalAnnualDebtService > 0` where applicable). Amortization guards `balance ≤ 0` / `payment ≤ 0` before iterating.

Unresolved Low items are **hygiene / data-quality** only; they do not change portfolio aggregates or benchmark percentages under normal inputs.

---

## Recommendations (prioritized)

1. **Keep amortization iteration single-sourced** — Optionally refactor `generateAmortizationSchedule` to call `isNegativeAmortizingPayment` for the first-month (and per-month) check so schedule generation cannot diverge from payoff projection if epsilon rules ever change.
2. **Document or reject future `balanceAsOfDate`** — If the product should never accept future as-of dates, enforce at validation; otherwise document that “stored” means “recent as-of” including forward-dated rows.
3. **Next run** — Re-run after any change to `amortization.ts`, `metrics/*`, `benchmark-utils.ts`, or `RENTCAST_HOURLY_LIMITS`.

---

## Task candidates (optional)

- [ ] (Optional) Call `isNegativeAmortizingPayment` from `generateAmortizationSchedule` for DRY consistency with `getPayoffProjection` / tests.

---

## Re-test checklist

- [ ] After any code change to scoped libs: targeted `vitest` for `amortization`, `benchmark-utils`, `property-metrics`, `portfolio-metrics`.
- [ ] `npm run check` when application code changes.

---

## Next trigger and cadence

- **Trigger:** Monthly, or any merge touching `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`, or RentCast quota constants.
- **Recommended next window:** 2026-05-01 or next release touching analytics math.

---

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: interest = balance × monthlyRate; principal capped at balance; balance update; 2-decimal rounding | PASS | Lines 66–89; early exit when payment + ε < interest (negative amort) |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | Lines 55–57 |
| `getPiForAmortization`: P&I = payment − escrow when escrow included; clamp ≥ 0.01 | PASS | Lines 117–130 |
| `getProjectedBalanceAsOf`: as-of before start month → 0 | PASS | Lines 144–148 |
| `getEffectiveBalance` / `getBalanceSource`: same 180-day staleness (`setDate(-180)`, `>=`) | PASS | Lines 169–211 |
| `getEffectiveBalance`: projected 0 → fallback `currentBalance` | PASS | Lines 191–192 |
| `getPayoffProjection`: uses `getEffectiveBalance`, `getPiForAmortization`; iteration matches schedule logic; negative amort guard | PASS | Lines 302–360; `isNegativeAmortizingPayment` lines 317–320 |
| Edge: balance ≤ 0 or payment ≤ 0 → `{ payoffDate: null, remainingAtTermEnd: null }` | PASS | Lines 313–315 |
| Edge: payment does not amortize → `payoffDate` null, `remainingAtTermEnd` rounded | PASS | Lines 317–320, 335–339, 356–359 |
| `getMonthsToPayoffWithExtraStrict` / `WithTolerance`: same iteration as payoff projection; guards | PASS | Lines 385–477 |
| `getExtraPaymentForYearsEarlier`: requires `projection.payoffDate`; `targetMonths ≤ 0` → null | PASS | Lines 489–501 |
| `getPayoffYearsWithExtra`: `extraPayment < 0` → null | PASS | Lines 586–587 |
| Tolerance helpers: `getToleranceResidualThreshold`, `isWithinTermEndTolerance`, `getToleranceAdjustedPayoffDate`, `getToleranceAwarePayoffProjection` | PASS | Lines 258–377 |
| `getPaymentStartLagMonths`: capped by `maxLagMonths` | PASS | Lines 242–256 |
| Inline schedule check vs `isNegativeAmortizingPayment` | NOTE | Equivalent ε-threshold; see Low finding |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent = monthlyRent × (1 − vacancyPercent/100)` | PASS | Line 92 |
| `grossAnnualRent`, `annualExpenses`, `noi` | PASS | Lines 94–96; outputs scaled lines 118–120 |
| `capRate = noi / estimatedValue` when `estimatedValue > 0` | PASS | Line 97 |
| Edge: `estimatedValue = 0` → `capRate` null, `ltv` null | PASS | Lines 97, 111 |
| `monthlyCashFlow`: full_liability vs proportional per spec | PASS | Lines 101–103 |
| `equity`, `ltv`, `cashOnCashReturn` | PASS | Lines 108–115 |
| Edge: `cashInvested` null or ≤ 0 → `cashOnCashReturn` null | PASS | Lines 113–115 |
| `scaleLiabilityAmount`, `getAnnualDebtService`, `computeAnnualCashFlowFromAnnualInputs` | PASS | Lines 37–73 |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `weightedCapRate = totalNoi / totalMarketValue` (guard `totalMarketValue > 0`) | PASS | Lines 107–108 |
| `portfolioLtv = totalDebt / totalMarketValue` | PASS | Line 108 |
| `portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | Lines 109–110 |
| `dscr = totalNoi / totalAnnualDebtService` when debt service > 0 | PASS | Lines 104–105 |
| Empty `properties` → zeros and nulls | PASS | Lines 42–59 |
| `totalDebt` full_liability vs proportional | PASS | Lines 93–97 |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct`: `marketRent ≤ 0` → 0; else `(userRent − marketRent) / marketRent × 100` | PASS | Lines 58–60 |
| `isBenchmarkFresh` / `isBenchmarkFreshAt`: strict `now − asOf < BENCHMARK_FRESHNESS_MAX_MS` | PASS | Lines 28–35; 60×24×60×60×1000 ms |
| `getBenchmarkLabel`: `abs(pct) < 1` → "Rent at market" | PASS | Lines 74–79 |
| `getBenchmarkDaysAgo` floors whole days | PASS | Lines 42–49 |

### lib/plans.ts (RentCast hourly limits — §1.1)

| Check | Status | Notes |
|-------|--------|-------|
| `RENTCAST_HOURLY_LIMITS`: free 5, investor 10, pro 20 | PASS | Lines 26–30; matches `docs/reference/rentcast-quota.md` |
| `getRentCastHourlyLimit` fallback to free for unknown tier | PASS | Lines 47–49 |

---

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` ↔ `generateAmortizationSchedule` iteration (interest → principal cap → balance) | PASS | Same monthlyRate = annual/12; same principal capping |
| `getEffectiveBalance` ↔ `getBalanceSource` staleness (180 days) | PASS | Identical date math |
| Mortgage rate: decimal annual; `/12` monthly | PASS | `amortization.ts` throughout |
| `getMonthsToPayoffWithExtraStrict` ↔ `getPayoffProjection` iteration | PASS | Shared structure and guards |
| Consumers: `validateMortgagePiCoversInterestFields` uses `isNegativeAmortizingPayment` | PASS (context) | `app/lib/validations/mortgage.ts` — supports amortization correctness at save time; not expanded audit |

---

## Findings / recommendations (math-lane index)

- **FAIL:** None in scoped modules.
- **Low:** DRY note on `generateAmortizationSchedule` vs `isNegativeAmortizingPayment`; future `balanceAsOfDate` semantics.

---

## Changelog (audit scope)

- **2026-04-01:** Math & Logic audit per `docs/process/math-logic-audit.md`. Scope: `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`, `app/lib/plans.ts` (RentCast hourly limits). Report structure: `docs/process/audit-report-template.md` + process §7 tables.
