# Math & Logic Audit — 2025-03-13

## Summary

Overall health is good. All four modules in scope implement formulas that match the reference specifications. Cross-module consistency rules are satisfied. Edge cases from the matrix are handled correctly. One NOTE: when payment does not cover interest (payment < interest), `generateAmortizationSchedule` produces negative principal and growing balance per the spec's min formula; this is rare for real mortgages but could occur with invalid input. Division-by-zero guards and rounding rules are applied consistently.

---

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| generateAmortizationSchedule formula matches spec | PASS | interest = balance × monthlyRate; principal = min(payment - interest, balance) via `if (principal >= balance) principal = balance`; balance = max(0, balance - principal) |
| generateAmortizationSchedule edge: originalLoanAmount ≤ 0 or monthlyPayment ≤ 0 → return [] | PASS | Lines 36–37 guard and return [] |
| generateAmortizationSchedule rounding: 2 decimals per row | PASS | Math.round(x * 100) / 100 for payment, principal, interest, balance |
| Interest rate: decimal stored, monthlyRate = rate/12 | PASS | annualInterestRate / 12 (line 39); Number(mortgage.interestRate) / 12 in payoff functions |
| getPiForAmortization: P&I clamp to ≥ 0.01 when escrow | PASS | Math.max(0.01, pi) when escrowIncluded and escrowAmount > 0 |
| getPiForAmortization: P&I = monthlyPayment when no escrow | PASS | Returns monthlyPayment when not escrowIncluded or escrowAmount ≤ 0 |
| getProjectedBalanceAsOf: asOfDate before startDate → return 0 | PASS | asOf < startNorm returns 0 (line 123) |
| getEffectiveBalance: balanceAsOfDate within 6 months → return currentBalance | PASS | balanceAsOf >= sixMonthsAgo returns currentBalance (lines 154–156) |
| getEffectiveBalance: balanceAsOfDate > 6 months or null → use projected; if 0, fall back to currentBalance | PASS | projected > 0 ? projected : currentBalance (line 168) |
| getBalanceSource: same staleness as getEffectiveBalance | PASS | Both use sixMonthsAgo.setDate(getDate() - 180) |
| getPayoffProjection: balance ≤ 0 or payment ≤ 0 → nulls | PASS | Returns { payoffDate: null, remainingAtTermEnd: null } (lines 207–210) |
| getPayoffProjection: payment doesn't amortize → remainingAtTermEnd, payoffDate null | PASS | Loop exits at remainingMonths; returns payoffDate: null, remainingAtTermEnd: rounded balance |
| getPayoffProjection iteration matches generateAmortizationSchedule | PASS | Same logic: interest = balance × rate; principal = min(payment - interest, balance); balance = max(0, balance - principal) |
| getExtraPaymentForYearsEarlier: projection.payoffDate null → return null | PASS | Line 299 |
| getExtraPaymentForYearsEarlier: yearsEarlier ≥ current payoff years → return null | PASS | targetMonths ≤ 0 returns null (line 311) |
| getPayoffYearsWithExtra: extraPayment < 0 → return null | PASS | Line 339 |
| getPayoffYearsWithExtra: projection.payoffDate null → return null | PASS | Line 341 |
| getMonthsToPayoffWithExtra uses same iteration logic as getPayoffProjection | PASS | Identical interest/principal/balance update logic |
| Division-by-zero guards | PASS | No divisions in amortization; rate/12 safe for finite inputs |
| Rounding: years whole, dollars nearest, schedule 2 decimals | PASS | remainingAtTermEnd: Math.round; getExtraPaymentForYearsEarlier: Math.round(low); getPayoffYearsWithExtra: Math.round(months/12) |
| Edge: payment < interest (negative principal) | NOTE | Spec allows min(payment-interest, balance) → negative principal; implementation produces same. Balance grows; schedule continues to term end. Rare for valid mortgages. |

---

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| effectiveRent = monthlyRent × (1 - vacancyPercent/100) | PASS | Line 51 |
| grossAnnualRent = effectiveRent × 12 | PASS | Line 53 |
| annualExpenses = monthlyExpenses × 12 | PASS | Line 54 |
| noi = grossAnnualRent - annualExpenses | PASS | Line 55 |
| capRate = noi / estimatedValue when estimatedValue > 0 | PASS | Line 56 |
| monthlyCashFlow: full_liability vs proportional formulas | PASS | Lines 60–62 match spec |
| equity = (estimatedValue - totalMortgageBalance) × scale | PASS | Line 67 |
| ltv = totalMortgageBalance / estimatedValue when estimatedValue > 0 | PASS | Line 70 |
| cashOnCashReturn = annualCashFlow / cashInvestedScaled when cashInvested > 0 | PASS | Lines 72–74 |
| Edge: estimatedValue = 0 → capRate null, ltv null | PASS | Lines 56, 70 |
| Edge: cashInvested = 0 or null → cashOnCashReturn null | PASS | cashInvestedScaled > 0 check (lines 72–74) |
| Division-by-zero guards | PASS | capRate, ltv, cashOnCashReturn all guarded |
| NaN/Infinity from Number(undefined) | NOTE | Input types expect numbers; callers responsible for validation |

---

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| weightedCapRate = totalNoi / totalMarketValue | PASS | Line 84, guarded by totalMarketValue > 0 |
| portfolioLtv = totalDebt / totalMarketValue | PASS | Line 85, guarded |
| portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested | PASS | Line 86–87, guarded by totalCashInvested > 0 |
| Edge: properties.length = 0 → zeros and nulls | PASS | Lines 36–50 return zeros, nulls for weightedCapRate, portfolioLtv, portfolioCashOnCashReturn |
| Division-by-zero guards | PASS | All three ratios guarded |
| Aggregation consistency with property-metrics | PASS | Uses computePropertyMetrics; totals built from scaled property values |

---

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| getBenchmarkPct: (userRent - marketRent) / marketRent × 100 | PASS | Line 23 |
| getBenchmarkPct: marketRent ≤ 0 → return 0 | PASS | Line 22 |
| isBenchmarkFresh: marketRentAsOf within 60 days | PASS | SIXTY_DAYS_MS = 60 × 24 × 60 × 60 × 1000; Date.now() - asOf < threshold |
| getBenchmarkLabel: abs(pct) < 1 → "at market" | PASS | Line 30 |
| getBenchmarkLabel: above/below market | PASS | Lines 31–32 |
| Division-by-zero guard | PASS | marketRent ≤ 0 returns 0 before division |

---

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| getPayoffProjection and generateAmortizationSchedule use identical iteration logic | PASS | Same interest, principal, balance update formulas |
| getEffectiveBalance and getBalanceSource use identical staleness (6 months / 180 days) | PASS | Both use sixMonthsAgo.setDate(getDate() - 180) |
| All mortgage rate usage: decimal stored, rate/12 for monthly | PASS | amortization.ts and payoff functions use Number(rate)/12 |
| getMonthsToPayoffWithExtra uses same iteration logic as getPayoffProjection | PASS | Identical loop body |

---

## Findings / recommendations

1. **NOTE (amortization):** When `monthlyPayment < interest` (payment does not cover interest), `generateAmortizationSchedule` produces negative principal and growing balance. This matches the spec’s `min(payment - interest, balance)` but is unusual for valid mortgages. Consider documenting or guarding this edge case for invalid input.

2. **NOTE (property-metrics):** Input validation for NaN/Infinity is left to callers. Consider adding defensive checks if metrics are ever computed from untrusted or raw form data.

3. No FAIL items. All formulas, edge cases, and cross-module rules pass.

---

## Changelog (audit scope)

- 2025-03-13: Initial audit. Scope: amortization, property-metrics, portfolio-metrics, benchmark-utils.
