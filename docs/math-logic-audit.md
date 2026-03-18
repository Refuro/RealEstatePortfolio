# Math and Logic Audit

**Purpose:** Verify correctness of math-heavy logic across the codebase. The app is increasingly logic- and math-heavy (amortization, payoff projections, metrics, benchmarks). This audit ensures formulas are correct, edge cases are handled, and modules are consistent.

**Status:** Active — follow this process when running a Math & Logic Audit.

**Distinct from:** General code audit (`docs/code-audit-process.md`) — that covers design, architecture, security, performance. This audit focuses solely on mathematical correctness and logical consistency.

---

## 1. Scope

### 1.1 Module inventory

| Module | Path | Functions |
|--------|------|-----------|
| **Amortization** | `app/lib/amortization.ts` | `generateAmortizationSchedule`, `getProjectedBalanceAsOf`, `getEffectiveBalance`, `getBalanceSource`, `getPiForAmortization`, `getPayoffProjection`, `getExtraPaymentForYearsEarlier`, `getPayoffYearsWithExtra` |
| **Property metrics** | `app/lib/metrics/property-metrics.ts` | `computePropertyMetrics` |
| **Portfolio metrics** | `app/lib/metrics/portfolio-metrics.ts` | `computePortfolioMetrics` |
| **Benchmark utils** | `app/lib/benchmark-utils.ts` | `isBenchmarkFresh`, `getBenchmarkDaysAgo`, `getBenchmarkPct`, `getBenchmarkLabel` |

**Future scope:** Refinance what-if (Phase 3), simulation page, any new math modules. Add to this inventory when implemented.

---

## 2. Reference specifications

### 2.1 Amortization (`lib/amortization.ts`)

**Interest rate:** Stored as decimal (e.g. 0.065 for 6.5%). Use `Number(rate) / 12` for monthly rate. No percent conversion.

**Month-by-month iteration (canonical):**
```
interest = balance × monthlyRate
principal = min(payment - interest, balance)
balance = max(0, balance - principal)
```

**`generateAmortizationSchedule`:**
- Input: `AmortizationInput` (originalLoanAmount, annualInterestRate, termYears, startDate, monthlyPayment)
- Output: Array of rows with monthIndex, date, payment, principal, interest, balance
- Edge: originalLoanAmount ≤ 0 or monthlyPayment ≤ 0 → return []
- Rounding: payment, principal, interest, balance rounded to 2 decimals per row

**`getPiForAmortization`:**
- P&I = monthlyPayment when escrow not included
- P&I = monthlyPayment - escrowAmount when escrowIncluded and escrowAmount > 0; clamp to ≥ 0.01

**`getEffectiveBalance`:**
- If balanceAsOfDate exists and is within 6 months of today → return currentBalance
- Else → project from amortization; if projected = 0, fall back to currentBalance
- Staleness: 6 months = 180 days

**`getBalanceSource`:**
- Same staleness logic as getEffectiveBalance: "stored" if within 6 months, else "projected"

**`getPayoffProjection`:**
- Start from getEffectiveBalance (today), use getPiForAmortization for payment
- Iterate month-by-month with canonical logic; cap at original term end
- Return: { payoffDate, remainingAtTermEnd } — payoffDate when amortizes, else remainingAtTermEnd
- Edge: balance ≤ 0 or payment ≤ 0 → { payoffDate: null, remainingAtTermEnd: null }

**`getExtraPaymentForYearsEarlier`:**
- Requires projection.payoffDate (base must amortize)
- targetMonths = currentPayoffMonths - yearsEarlier×12; must be > 0
- Binary search for extra payment; return rounded dollar or null

**`getPayoffYearsWithExtra`:**
- Requires projection.payoffDate; extraPayment ≥ 0
- Use getMonthsToPayoffWithExtra; return round(months/12) or null

### 2.2 Property metrics (`lib/metrics/property-metrics.ts`)

**Formulas (per docs/engineering-spec.md §6):**
- effectiveRent = monthlyRent × (1 - vacancyPercent/100)
- grossAnnualRent = effectiveRent × 12
- annualExpenses = monthlyExpenses × 12
- noi = grossAnnualRent - annualExpenses
- capRate = noi / estimatedValue (when estimatedValue > 0)
- monthlyCashFlow: full_liability = effectiveRent×scale - expenses×scale - payment; proportional = (effectiveRent - expenses - payment)×scale
- equity = (estimatedValue - totalMortgageBalance)×scale
- ltv = totalMortgageBalance / estimatedValue (when estimatedValue > 0)
- cashOnCashReturn = annualCashFlow / cashInvestedScaled (when cashInvested > 0)

**Edge:** estimatedValue = 0 → capRate null, ltv null; cashInvested = 0 or null → cashOnCashReturn null

### 2.3 Portfolio metrics (`lib/metrics/portfolio-metrics.ts`)

- Aggregates property metrics; weightedCapRate = totalNoi / totalMarketValue
- portfolioLtv = totalDebt / totalMarketValue
- portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested
- Edge: empty properties → zeros and nulls

### 2.4 Benchmark utils (`lib/benchmark-utils.ts`)

- getBenchmarkPct: (userRent - marketRent) / marketRent × 100; marketRent ≤ 0 → 0
- isBenchmarkFresh: marketRentAsOf within 60 days
- getBenchmarkLabel: abs(pct) < 1 → "at market"; else above/below

---

## 3. Cross-module consistency rules

| Rule | Modules involved |
|------|------------------|
| `getPayoffProjection` and `generateAmortizationSchedule` must use identical iteration logic (interest, principal, balance update) | amortization.ts |
| `getEffectiveBalance` and `getBalanceSource` must use identical staleness threshold (6 months / 180 days) | amortization.ts |
| All mortgage rate usage: stored as decimal, use `Number(rate)/12` for monthly | amortization.ts, consumers |
| `getMonthsToPayoffWithExtra` uses same iteration logic as `getPayoffProjection` | amortization.ts |

---

## 4. Edge case matrix

| Module | Function | Input condition | Expected behavior |
|--------|----------|-----------------|-------------------|
| amortization | generateAmortizationSchedule | originalLoanAmount ≤ 0 or monthlyPayment ≤ 0 | return [] |
| amortization | getPiForAmortization | escrowIncluded, escrowAmount such that P&I ≤ 0 | clamp to 0.01 |
| amortization | getProjectedBalanceAsOf | asOfDate before startDate | return 0 |
| amortization | getEffectiveBalance | balanceAsOfDate within 6 months | return currentBalance |
| amortization | getEffectiveBalance | balanceAsOfDate > 6 months ago or null | use projected; if 0, fall back to currentBalance |
| amortization | getPayoffProjection | balance ≤ 0 or payment ≤ 0 | { payoffDate: null, remainingAtTermEnd: null } |
| amortization | getPayoffProjection | payment doesn't amortize | return remainingAtTermEnd, payoffDate null |
| amortization | getExtraPaymentForYearsEarlier | yearsEarlier ≥ current payoff years | return null |
| amortization | getExtraPaymentForYearsEarlier | projection.payoffDate null | return null |
| amortization | getPayoffYearsWithExtra | extraPayment < 0 | return null |
| property-metrics | computePropertyMetrics | estimatedValue = 0 | capRate null, ltv null |
| property-metrics | computePropertyMetrics | cashInvested = 0 or null | cashOnCashReturn null |
| portfolio-metrics | computePortfolioMetrics | properties.length = 0 | return zeros and nulls |
| benchmark-utils | getBenchmarkPct | marketRent ≤ 0 | return 0 |

---

## 5. Numerical and safety checks

- **Division by zero:** Every division must have a guard (denominator > 0 or explicit check).
- **NaN/Infinity:** Inputs that could produce NaN (e.g. `Number(undefined)`) — are they guarded?
- **Rounding:** Consistent rounding rules per proposal (years → whole, dollars → nearest dollar, schedule rows → 2 decimals).
- **Integer overflow:** Unlikely for mortgage amounts; flag if any calculation could exceed Number.MAX_SAFE_INTEGER.

---

## 6. Audit execution checklist (for AI)

**For each module in scope:**

1. **Read the implementation** — Open the file and read each function.

2. **Verify formulas match spec** — Trace through with a sample input. Confirm:
   - interest = balance × monthlyRate
   - principal = min(payment - interest, balance)
   - etc.

3. **For each row in the edge case matrix for that module** — Trace the code path. Confirm expected behavior.

4. **Check cross-module rules** — Does this module's logic match related modules? (e.g. getEffectiveBalance vs getBalanceSource staleness)

5. **Division / NaN / rounding** — Any division that could be by zero? Any unguarded NaN/Infinity? Rounding applied consistently?

6. **Document findings** — Use the output format below. Mark PASS, FAIL, or NOTE (observation).

---

## 7. Output format

Write the audit report to `docs/math_audits/YYYY-MM-DD-math-logic-audit.md`. Structure:

```markdown
# Math & Logic Audit — YYYY-MM-DD

## Summary

2–3 sentence overview: overall health, any formula or edge-case issues found.

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| generateAmortizationSchedule formula matches spec | PASS/FAIL |
| getPayoffProjection iteration matches generateAmortizationSchedule | PASS/FAIL |
| getEffectiveBalance / getBalanceSource staleness consistent | PASS/FAIL |
| Edge: balance=0 returns null | PASS/FAIL |
| Edge: payment doesn't amortize | PASS/FAIL |
| ... | | |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| ... | | |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| ... | | |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| ... | | |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| ... | | |

## Findings / recommendations

List any FAIL items or observations. User will create tasks from these as needed.

## Changelog (audit scope)

- YYYY-MM-DD: Initial audit. Scope: amortization, property-metrics, portfolio-metrics, benchmark-utils.
```

---

## 8. Execution

1. Read this document and the reference specs above.
2. For each module in §1.1, execute the checklist in §6.
3. Document results in the format in §7.
4. Write the report to `docs/math_audits/YYYY-MM-DD-math-logic-audit.md`.
5. Do **not** make code changes. Audit only. The user reviews and creates tasks from findings.

---

## 9. References

- **Amortization / payoff:** `docs/refinance-payoff-proposal.md` §3.1, §3.2
- **Property metrics:** `docs/engineering-spec.md` §6 (if exists)
- **Reports folder:** `docs/math_audits/`
