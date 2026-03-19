# Math & Logic Audit — 2026-03-19

## Executive summary

- All core metric calculations (equity, cash flow, NOI, cap rate, LTV, DSCR, cash-on-cash) are correctly implemented and aligned with `analytics-math-policy.md` and `ownership-metrics.md`.
- Ownership mode scaling (`proportional` vs `full_liability`) is correctly applied across property metrics, portfolio metrics, projections, and export. Deals/Analyze are intentionally hardcoded to proportional, per policy.
- One high-priority finding: the projection chart loan balance line is always ownership-scaled, even in `full_liability` mode — policy expects full (unscaled) debt display in that mode.
- Amortization and tolerance logic is thorough with correct edge case handling (zero balance, zero payment, P&I clamping, tolerance thresholds).
- Cross-module consistency is strong — `getPayoffProjection`, `generateAmortizationSchedule`, and `simulateMortgage` all use the same iteration logic. Shared helpers (`scaleLiabilityAmount`, `computeAnnualCashFlowFromAnnualInputs`, `getAnnualDebtService`) prevent formula duplication.

---

## Severity-ranked findings

### Critical

- None found.

### High

**H1 — Projection chart loan balance not mode-aware in `full_liability`**

- `projections-tab-content.tsx` line 307: `loanBalance` in projection rows is always computed as `loanBalanceFull * scale` (where `scale = ownershipPercent / 100`).
- In `full_liability` mode, the policy (`ownership-metrics.md` §2) states debt should be shown at 100% (`D`), not `D * s`.
- The "Projected debt exposure" summary card (line 383) correctly uses `scaleLiabilityAmount` which returns the full amount in `full_liability` mode.
- This creates a visual inconsistency: the chart shows scaled debt but the summary card shows full debt for the same property in `full_liability` mode.
- **Fix:** In `full_liability` mode, use unscaled `loanBalanceFull` for the chart data series, or add a tooltip explaining the difference.

### Medium

**M1 — Mortgage tab baseline note always shows "extra principal 0"**

- `mortgage-tab-content.tsx` line 428: Baseline note in the helper text says "extra principal 0" regardless of the user's extra payment input.
- The baseline projection does use extra=0 (which is correct for the "baseline" comparison), but the label could be clearer that this represents the no-extra-payment scenario.
- **Fix:** Clarify label to "Baseline (no extra payment)" or similar.

**M2 — Export omits NOI and annual cash flow columns**

- `api/export/portfolio/route.ts`: Exports equity, monthly cash flow, cap rate, LTV but not NOI, annual cash flow, DSCR, or cash-on-cash.
- Dashboard and property detail show all these metrics.
- Users doing reconciliation between UI and export will find missing columns.
- **Fix:** Add NOI and annual cash flow to export. Consider DSCR and cash-on-cash as well.

### Low

**L1 — Amortization staleness uses 180 days as "6 months"**

- `lib/amortization.ts` `getEffectiveBalance`: Threshold is `180 * 24 * 60 * 60 * 1000` (180 days).
- `analytics-math-policy.md` says "6 months."
- 180 days is a reasonable approximation (actual 6 months varies from 181–184 days), but not exact.
- Not a bug. Noted for precision.

**L2 — `ownershipPercent` is Int in Prisma schema**

- `Property.ownershipPercent` is `Int` — cannot store sub-percent values (e.g., 33.33%).
- `ownership-metrics.md` formulas use `s = ownership/100` which would work with decimals.
- Code defaults `ownershipPercent` to 100 when null/undefined.
- Low impact since most investors own whole-percent stakes, but limits precision for partnership structures.

---

## Detailed analysis

### Property metrics (`lib/metrics/property-metrics.ts`)

All formulas verified against `ownership-metrics.md` §2:

| Metric | Formula (proportional) | Formula (full_liability) | Implementation | Status |
|--------|----------------------|-------------------------|----------------|--------|
| Gross annual rent | `R * 12 * s` | `R * 12 * s` | L90, L116 | PASS |
| Annual expenses | `E * 12 * s` | `E * 12 * s` | L91, L117 | PASS |
| NOI | `(R - E) * 12 * s` | `(R - E) * 12 * s` | L94, L118 | PASS |
| Cap rate | `NOI / (V * s)` | `NOI / (V * s)` | L95 | PASS |
| Monthly cash flow | `(R - E - P) * s` | `(R * s) - (E * s) - P` | L99–101 | PASS |
| Equity | `(V - D) * s` | `(V - D) * s` | L106 | PASS |
| Property LTV | `D / V` | `D / V` | L109 | PASS |
| Cash-on-cash | `annualCashFlow / (cashInvested * s)` | `annualCashFlow / (cashInvested * s)` | L111–113 | PASS |
| DSCR | `NOI / (P * 12 * s)` | `NOI / (P * 12)` | Via `getAnnualDebtService` | PASS |

Key helpers:
- `scaleLiabilityAmount(amount, scale, mode)`: Returns `amount` in full_liability, `amount * scale` in proportional (L42–44).
- `getAnnualDebtService(monthlyPayment, ownership, mode)`: Returns `P * 12` (full) or `P * 12 * s` (proportional) (L47–53).
- `computeAnnualCashFlowFromAnnualInputs(rent, expenses, debtService)`: `rent - expenses - debtService` (L56–60).

### Edge case handling (property metrics)

| Condition | Expected | Actual | Status |
|-----------|----------|--------|--------|
| `estimatedValue = 0` | `capRate = null`, `ltv = null` | L95: `estimatedValue > 0 ? noi / estimatedValue : null` | PASS |
| `cashInvested = 0 or null` | `cashOnCashReturn = null` | L111–113 | PASS |
| `ownershipPercent undefined` | Default to 100 | L84 | PASS |
| `vacancyPercent undefined` | Default to 5 | L85 | PASS |
| `No mortgages` | `totalMortgageBalance = 0`, `monthlyPayment = 0` | L87–89 | PASS |

### Portfolio metrics (`lib/metrics/portfolio-metrics.ts`)

| Metric | Formula | Implementation | Status |
|--------|---------|----------------|--------|
| Total market value | `Sum(V_i * s_i)` | L75 | PASS |
| Total debt | Mode-dependent: `Sum(D_i)` or `Sum(D_i * s_i)` | L87–91 | PASS |
| Total annual debt service | `Sum(getAnnualDebtService_i)` | L81–85 | PASS |
| Total NOI | `Sum(NOI_i)` | L76 | PASS |
| Total monthly cash flow | `Sum(cf_i)` | L77 | PASS |
| DSCR | `totalNoi / totalAnnualDebtService` | L99–100 | PASS |
| Weighted cap rate | `totalNoi / totalMarketValue` | L102 | PASS |
| Portfolio LTV | `totalDebt / totalMarketValue` | L103 | PASS |
| Cash-on-cash | `(totalMonthlyCashFlow * 12) / totalCashInvested` | L104–105 | PASS |

Edge case: `properties.length = 0` returns zeros and nulls (L40–57). PASS.

### Amortization (`lib/amortization.ts`)

| Function | Check | Status |
|----------|-------|--------|
| `generateAmortizationSchedule` | `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS |
| | Interest = `balance * monthlyRate` | PASS |
| | Principal = `min(payment - interest, balance)` | PASS |
| `getPiForAmortization` | Escrow subtracted, clamped to `max(pi, 0.01)` | PASS |
| `getEffectiveBalance` | 180-day staleness check; fallback to amortization projection | PASS |
| `getBalanceSource` | Same 180-day logic | PASS |
| `getPayoffProjection` | `balance ≤ 0` or `payment ≤ 0` → null | PASS |
| | Iteration matches schedule logic | PASS |

### Tolerance logic (`lib/amortization.ts`)

| Function | Formula | Status |
|----------|---------|--------|
| `getPaymentStartLagMonths` | `floor((today - paymentEffectiveDate) / 30)` clamped to `[0, maxLagMonths]` | PASS |
| `getToleranceResidualThreshold` | `max(minResidualDollars, pi * (residualPiMultiplier + lagMonths))` | PASS |
| `isWithinTermEndTolerance` | `remainingAtTermEnd ≤ threshold` | PASS |
| `getToleranceAdjustedPayoffDate` | Term end + lag months | PASS |
| `getToleranceAwarePayoffProjection` | Wraps `getPayoffProjection`; applies tolerance if payoff not found | PASS |

Default tolerance: `minResidualDollars: 500`, `residualPiMultiplier: 2`, `maxLagMonths: 3`. Reasonable.

### Extra payment calculations

| Function | Check | Status |
|----------|-------|--------|
| `getExtraPaymentForYearsEarlier` | Binary search; `targetMonths ≤ 0` → null | PASS |
| `getMonthsToPayoffWithExtra` | Same iteration as `getPayoffProjection` | PASS |
| `getPayoffYearsWithExtra` | `extraPayment < 0` → null | PASS |

### Projection calculations (`projections-tab-content.tsx`)

| Calculation | Formula | Status |
|-------------|---------|--------|
| Rent growth | `monthlyRent * Math.pow(1 + rentGrowth/100, year)` | PASS |
| Expense growth | Same pattern | PASS |
| Value growth | Same pattern | PASS |
| Vacancy applied | `rentForYear * (1 - projectionVacancy/100)` | PASS |
| Cash flow | `computeAnnualCashFlowFromAnnualInputs` with ownership and displayMode | PASS |
| Debt-service source | `cashFlowDebtServiceSource = "all_in_payment"` | PASS (matches policy) |
| Loan balance (amortized_pi) | `debtServiceByMonth` accumulated P&I | PASS |
| Loan balance (all_in) | `priorBalance > 0 ? activeMonths * allInPayment : 0` | N/A (for debt display only) |
| Equity | `max(0, propertyValue - loanBalance)` (scaled) | PASS |
| Net sale proceeds | `grossSaleValue - sellingCosts - loanBalance` (scaled) | PASS |

PRESETS are reasonable: Conservative (1/3/1.5/8%), Base (2/2/3/5%), Upside (3.5/1.5/4.5/4%).

### Deal analyzer (`deal-analyzer-form.tsx`)

| Check | Status | Notes |
|-------|--------|-------|
| Uses `computePropertyMetrics` | PASS | L114–127 |
| DSCR = NOI / annual debt service | PASS | L128 |
| Annual debt service uses `getAnnualDebtService` | PASS | L127 |
| Ownership mode | PASS | Hardcoded `"proportional"` (L126); documented in UI (L324–326) |
| Stress test | PASS | Rent and expense scaling with `stressPercent` |

### Cross-surface reconciliation

| Surface | Metric source | Display mode | Consistent |
|---------|--------------|-------------|------------|
| Dashboard | `computePortfolioMetrics` | User setting | Yes |
| Properties list | `computePropertyMetrics` per card | User setting | Yes |
| Property detail | `computePropertyMetrics` | User setting | Yes |
| Portfolio summary API | `computePortfolioMetrics` | User setting | Yes |
| Property metrics API | `computePropertyMetrics` | User setting | Yes |
| Export CSV | `computePropertyMetrics` | User setting | Yes |
| Modeling (projections) | Custom projection loop + shared helpers | User setting | Yes (except H1) |
| Mortgage workspace | Amortization lib | N/A | N/A |
| Deal analyzer | `computePropertyMetrics` | `proportional` always | Yes |
| Deals page | `computePropertyMetrics` | `proportional` always | Yes |

All surfaces use the same underlying calculation functions. The only divergence is H1 (projection chart loan balance scaling).

### Policy compliance summary

| Policy | Requirement | Status |
|--------|-------------|--------|
| `analytics-math-policy.md` — One metric, one contract | Centralized in `lib/metrics/` | PASS |
| `analytics-math-policy.md` — No silent basis switching | `all_in_payment` documented in projections | PASS |
| `analytics-math-policy.md` — Shared helpers only | No duplicated formulas in components | PASS |
| `analytics-math-policy.md` — Clarity over density | Labels use primary name; details in progressive disclosure | PASS |
| `ownership-metrics.md` — Proportional formulas | All match §2 | PASS |
| `ownership-metrics.md` — Full_liability formulas | All match §2 (except H1 chart) | PARTIAL |
| `ownership-metrics.md` — Deals use proportional only | Hardcoded and documented | PASS |

---

## Evidence reviewed

- `app/lib/metrics/property-metrics.ts` (all functions, lines 1–120)
- `app/lib/metrics/portfolio-metrics.ts` (all functions, lines 1–110)
- `app/lib/amortization.ts` (all functions, lines 1–400+)
- `app/(app)/properties/[id]/projections-tab-content.tsx` (projection loop, PRESETS, debt service)
- `app/(app)/properties/[id]/mortgage-tab-content.tsx` (simulation, payoff calculations)
- `app/(app)/analyze/deal-analyzer-form.tsx` (deal metrics, ownership mode)
- `app/app/api/portfolio/summary/route.ts` (API-level portfolio metrics)
- `app/app/api/properties/[id]/metrics/route.ts` (API-level property metrics)
- `app/app/api/export/portfolio/route.ts` (export calculations)
- `docs/policies/analytics-math-policy.md` (policy compliance)
- `docs/policies/ownership-metrics.md` (ownership mode compliance)

---

## Risk & impact assessment

- **H1 (chart loan balance):** Users in `full_liability` mode will see inconsistent debt numbers — chart shows scaled, summary card shows full. Could erode trust in projections.
- **M1 (baseline note):** Minor UX confusion about what "baseline" means in the mortgage tool.
- **M2 (export gaps):** Power users doing reconciliation will notice missing metrics. Moderate impact for users who export regularly.

---

## Recommendations (prioritized)

1. **Make projection chart loan balance mode-aware** — Use `scaleLiabilityAmount` for the chart data series so it matches the summary card behavior.
2. **Clarify mortgage baseline note** — Change "extra principal 0" to "Baseline (no extra payment)" for clarity.
3. **Add NOI and annual cash flow to export** — Complete the metric column set for full UI-to-export reconciliation.
4. **Consider `Decimal` for `ownershipPercent`** — Allows sub-percent ownership stakes. Low priority.

---

## Task candidates

- [ ] Make projection chart loan balance use `scaleLiabilityAmount` for mode-aware display.
- [ ] Update mortgage tab baseline note to clarify "no extra payment" scenario.
- [ ] Add NOI and annual cash flow columns to portfolio export.
- [ ] Evaluate Prisma schema change for `ownershipPercent` from `Int` to `Decimal`.

---

## Re-test checklist

- [ ] Verify projection chart shows correct debt in both `proportional` and `full_liability` modes.
- [ ] Verify mortgage tab baseline note is clear.
- [ ] Verify export CSV includes new metric columns.
- [ ] Run verification matrix: one property at 50% ownership, check dashboard/property detail/export/projections for consistency.
- [ ] `npm run check` passes.

---

## Next trigger and cadence

- Trigger: any analytics contract change, new metric surface, or ownership logic change
- Recommended next run: monthly + pre-release for analytics-heavy updates
