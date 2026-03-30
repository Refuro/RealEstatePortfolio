# Math & Logic Audit — 2026-03-20

## Summary

Static review of `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, and `app/lib/benchmark-utils.ts` against `docs/process/math-logic-audit.md` §2–§5, plus targeted Vitest runs. Core formulas, edge guards, and cross-module amortization iteration align with the process spec; automated tests passed. Residual risk is mainly **duplicated month-by-month simulation** in property UI tabs versus the shared library (consistency hazard, not a defect in `lib/` itself).

## Executive summary

- **Overall:** Math-lane modules implement the documented formulas and edge-case matrix; **17** amortization tests, **18** metrics tests, and **4** benchmark-utils tests passed on this run (`npm run test -- --run …`).
- **Top risks:** Parallel payoff/projection logic in UI (`projections-tab-content.tsx`) can drift from `lib/amortization.ts` if updated independently; `docs/reference/engineering-spec.md` §6 predates vacancy/ownership scaling and is not a precise match for current `computePropertyMetrics`.
- **Recommendation:** Treat `math-logic-audit.md` §2 and policy docs as the metric source of truth; consolidate tab simulations onto `lib/` when touching payoff UX.

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none)*

### Medium

- **Duplicate amortization iteration outside `lib/amortization.ts`** — Month-by-month balance/interest logic also exists in the property projections UI, so future formula or timing changes could diverge from the canonical implementation. — `app/app/(app)/properties/[id]/projections-tab-content.tsx` (e.g. `monthlyRate`, interest loop)

### Low

- **Engineering spec vs implementation** — `docs/reference/engineering-spec.md` §6 lists simplified formulas (no vacancy, no ownership scaling); `property-metrics.ts` correctly implements the richer rules referenced in `math-logic-audit.md` §2.2. Risk is **documentation confusion**, not a code bug. — `docs/reference/engineering-spec.md` L525–565 vs `app/lib/metrics/property-metrics.ts`

## Module results

### `app/lib/amortization.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: interest = balance × monthlyRate; principal capped; balance = max(0, balance − principal); rows rounded to 2 dp | PASS | Evidence: `app/lib/amortization.ts` L40–66 |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | L36–37 |
| `getPiForAmortization`: escrow subtracted when enabled; clamp P&I ≥ 0.01 | PASS | L94–107 |
| `getProjectedBalanceAsOf`: `asOf` before normalized start month → 0 | PASS | L121–126 |
| `getEffectiveBalance`: 180-day staleness → stored balance; else projected; projection 0 → `currentBalance` | PASS | L146–169 |
| `getBalanceSource`: same 180-day threshold as `getEffectiveBalance` | PASS | L175–187 |
| `getPayoffProjection`: `balance ≤ 0` or `payment ≤ 0` → `{ payoffDate: null, remainingAtTermEnd: null }` | PASS | L279–292 |
| `getPayoffProjection`: forward iteration matches schedule-style update (interest, principal cap, balance) | PASS | L302–312 vs L47–57 |
| `getPayoffProjection`: term cap; non-payoff → `remainingAtTermEnd` rounded | PASS | L321–324 |
| `getMonthsToPayoffWithExtra`: same iteration pattern as `getPayoffProjection` | PASS | L350–389 |
| `getExtraPaymentForYearsEarlier`: requires payoff path via `getToleranceAwarePayoffProjection`; `targetMonths ≤ 0` → null | PASS | L397–413, L429–431 |
| `getPayoffYearsWithExtra`: `extraPayment < 0` → null | PASS | L439–443 |
| Tolerance helpers (`getToleranceAwarePayoffProjection`, etc.) behave consistently with base projection | PASS | L327–343, L245–253 |
| **NOTE:** `generateAmortizationSchedule` uses `annualInterestRate / 12` without `Number()` (typed input); `getPayoffProjection` uses `Number(mortgage.interestRate) / 12` | NOTE | Aligns with “stored as decimal” when inputs are valid numbers |

### `app/lib/metrics/property-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| effectiveRent, grossAnnualRent, annualExpenses, NOI, capRate per process §2.2 | PASS | L89–96 |
| `full_liability` vs proportional monthly cash flow | PASS | L99–102 |
| Equity, LTV; `estimatedValue > 0` guards for cap rate and LTV | PASS | L106–110 |
| `cashOnCashReturn` only when scaled cash invested &gt; 0 | PASS | L112–114 |
| Returned gross/NOI/expenses scaled by ownership where applicable | PASS | L116–119 |

### `app/lib/metrics/portfolio-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Empty `properties` → zeros and null aggregates | PASS | L40–57 |
| `weightedCapRate` = totalNoi / totalMarketValue when MV &gt; 0 | PASS | L72–80, L103 |
| `portfolioLtv` = totalDebt / totalMarketValue when MV &gt; 0; debt handling for `full_liability` | PASS | L88–92, L104 |
| `portfolioCashOnCashReturn` = (totalMonthlyCashFlow × 12) / totalCashInvested | PASS | L94–96, L105–106 |
| DSCR uses `totalNoi` / `totalAnnualDebtService` with debt-service guard | PASS | L100–101 |

### `app/lib/benchmark-utils.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct`: `marketRent ≤ 0` → 0 | PASS | L22–24 |
| `isBenchmarkFresh`: within 60 days | PASS | L5–11 |
| `getBenchmarkLabel`: \|pct\| &lt; 1 → “at market”; else above/below | PASS | L28–33 |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` / `getMonthsToPayoffWithExtra` use the same core iteration as `generateAmortizationSchedule` (interest, principal cap, balance update) | PASS | `app/lib/amortization.ts` L47–57, L305–312, L379–383 |
| `getEffectiveBalance` and `getBalanceSource` share 180-day staleness | PASS | L152–158, L180–186 |
| Mortgage annual rate treated as decimal; monthly rate = rate/12 | PASS | `app/lib/amortization.ts` L40, L282, L359; UI consumers e.g. `projections-tab-content.tsx` L124, L134 |
| Extra-payoff helpers build on `getEffectiveBalance` + `getPiForAmortization` like `getPayoffProjection` | PASS | `app/lib/amortization.ts` L350–358 vs L279–282 |

## Evidence reviewed

- `app/lib/amortization.ts` (full file)
- `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`
- `app/lib/benchmark-utils.ts`
- `docs/process/math-logic-audit.md`, `docs/process/audit-report-template.md`
- `docs/reference/engineering-spec.md` §6 (contrast only)
- Spot check: `app/app/(app)/properties/[id]/projections-tab-content.tsx` (duplicate simulation)
- Tests: `npm run test -- --run amortization.test` (17 passed); `npm run test -- --run lib/metrics/` (18 passed); `npm run test -- --run lib/benchmark-utils.test.ts` (4 passed)

**Limits:** No exhaustive manual numeric spot-check against an external amortization calculator; reliance on unit tests and spec trace-through. Benchmark utils have no integration test with real API payloads beyond unit tests.

## Risk & impact assessment

Incorrect rent, payoff, or portfolio aggregates would undermine user trust in returns and debt views. Current `lib/` implementations are consistent with the audit process spec and backed by passing unit tests; the main exposure is **maintaining two simulation paths** (lib vs tabs) under future changes.

## Recommendations (prioritized)

1. **Single source for payoff/month-ahead simulation** — Prefer routing tab UIs through `lib/amortization.ts` (or thin wrappers) so iteration rules stay one place.
2. **Clarify docs** — Add a short pointer in `engineering-spec.md` §6 that detailed formulas live in `math-logic-audit.md` / policy docs and include vacancy and ownership.
3. **Regression discipline** — When changing any `lib/` math, update golden/metrics tests in the same change (`lib/metrics/metrics-golden.test.ts`, `amortization.test.ts`).

## Task candidates (optional)

- [ ] Refactor `projections-tab-content.tsx` to consume `getPayoffProjection` / schedule helpers from `app/lib/amortization.ts` instead of duplicating the monthly loop.

## Re-test checklist

- [ ] After any amortization or metrics change: `npm run test -- --run amortization.test lib/metrics/ lib/benchmark-utils.test.ts`
- [ ] Spot-check one property: dashboard vs CSV export for NOI / cash flow / LTV after formula edits
- [ ] `npm run check` (when TypeScript or imports change)

## Next trigger and cadence

- **Trigger:** Changes to `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`, ownership/vacancy inputs, or payoff/projection UI.
- **Next window:** Next monthly math pass or before a major metrics/refinance release.

## Changelog (audit scope)

- **2026-03-20:** Math & Logic lane audit. Scope: amortization, property-metrics, portfolio-metrics, benchmark-utils; cross-module consistency; Vitest evidence as listed above.
