# Mortgage Simulation Analysis — Payoff Projection & "Not Amortizing" Issue
**Date:** 2026-04-02  
**Severity:** Medium — incorrect UI state on a valid mortgage; affects simulation usability  
**Status:** Immediate data fix available; code fixes planned  
**Affected file:** `lib/amortization.ts`, `app/(app)/properties/[id]/mortgage-tab-content.tsx`  
**Affected mortgage:** Westport Property — WestGate Bank, $297k, 6.25%, 30yr, opened 05/13/2023

---

## Summary

The mortgage simulation workspace displays **"Not amortizing"** for a valid, actively-reducing mortgage. The loan has positive principal reduction every month ($332.91/mo) and will pay off well within a normal timeframe. The false negative is caused by a data gap (`paymentEffectiveDate` not set) that causes the tolerance system to apply too tight a threshold on the end-of-term residual balance.

---

## The Specific Mortgage (Westport Property)

| Field | Value |
|---|---|
| Original loan | $297,000 |
| Current balance | $288,417 |
| Balance as of | 03/17/2026 |
| Interest rate | 6.25% (0.0625) |
| Term | 30 years |
| Start date | 05/13/2023 |
| Monthly payment | $2,648.08 |
| Escrow included | Yes — $813/mo |
| P&I (after escrow) | **$1,835.08/mo** |
| Monthly interest on balance | $288,417 × (0.0625/12) = **$1,502.17** |
| Monthly principal reduction | $1,835.08 − $1,502.17 = **$332.91** |

The loan is positively amortizing. The "Not amortizing" label is a false negative.

---

## Exact Calculation Trace

### Step 1 — Effective balance
`balanceAsOfDate` = 03/17/2026, today = 04/01/2026 (15 days — within 6-month window).  
→ `getEffectiveBalance` returns stored balance: **$288,417** ✓

### Step 2 — Remaining term window
```
startNorm        = May 1, 2023
startOfCurrentMonth = April 1, 2026
monthsSinceStart = (2026−2023)×12 + (3−4) = 35 months
remainingMonths  = 360 − 35 = 325 months
```

### Step 3 — Time-to-payoff from current balance
Using the amortization formula with P=$288,417, r=0.005208, payment=$1,835.08:
```
n = ln(1835.08 / (1835.08 − 288417×0.005208)) / ln(1.005208)
  = ln(1835.08 / 332.91) / ln(1.005208)
  = ln(5.513) / 0.005195
  ≈ 328.6 months
```

**328.6 months needed, but loop only runs 325 iterations.**  
Residual at month 325: **~$6,514** (confirmed by Sentry chart tooltip at May 2053).

### Step 4 — Tolerance check
```
getToleranceResidualThreshold:
  pi               = $1,835.08
  lagMonths        = 0  (paymentEffectiveDate not set → defaults to 0)
  threshold        = max($1,500, $1,835.08 × (2 + 0)) = $3,670

$6,514 > $3,670 → isWithinTermEndTolerance = FALSE
→ payoffDate = null → "Not amortizing"
```

---

## Root Cause: Missing First Payment Date

The loan closed **May 13, 2023** (mid-month). Standard mortgage convention for a mid-month closing:

- Prorated interest for May 13–31 is collected at closing
- First full P&I payment is due **July 1, 2023** (not June 1)
- The amortization clock starts in July, not May

The code calculates elapsed months from `startDate` (May 2023), assuming 35 months of payments. In reality, only **33 payments** have been made (July 2023 through March 2026). This leaves the balance ~$2,225 higher than a perfect schedule would project, which means the loan needs ~3.6 extra months beyond the remaining term window to reach zero.

The `paymentEffectiveDate` field exists precisely to account for this — but it is **not set** for this mortgage.

### What happens if `paymentEffectiveDate = 2023-07-01` is entered:
```
lagMonths  = min(3, 2) = 2
threshold  = max($1,500, $1,835.08 × (2 + 2)) = $7,340

$6,514 < $7,340 → isWithinTermEndTolerance = TRUE
→ payoffDate = May 2053 + 2 months = July 2053
→ "Baseline payoff: July 2053" ✓
```

---

## Immediate Fix (No Code Required)

Go to **Edit Mortgage Details** for the Westport Property and set:

> **Payment as of (optional):** `07/01/2023`

This is the date the first P&I payment was due. Save — the simulation will immediately show the correct payoff date.

---

## Five Systemic Issues in the Codebase

### Issue 1 — Loop window does not extend by lag months
**File:** `lib/amortization.ts` — `getPayoffProjection` (~line 328), `getMonthsToPayoffWithExtraStrict`, `getMonthsToPayoffWithExtraWithTolerance`  
**Severity:** Medium

`getPayoffProjection` caps iterations at `totalTermMonths − monthsSinceStartDate`. When `paymentEffectiveDate` is set and lag=2, `getToleranceAdjustedPayoffDate` returns term-end+2 months, but the loop still computes the residual at month 325 (not 327). The two mechanisms are inconsistent.

If the loop ran `325 + 2 = 327` iterations, the residual would be ~$2,881, which falls **below** the $3,670 no-lag threshold — meaning the fix would work even without `paymentEffectiveDate` being set.

**Proposed fix:**
```ts
// lib/amortization.ts — getPayoffProjection
const lagMonths = getPaymentStartLagMonths(mortgage);
const remainingMonths = Math.max(0, totalTermMonths - monthsSinceStartDate + lagMonths);
```
Apply the same extension to `getMonthsToPayoffWithExtraStrict` and `getMonthsToPayoffWithExtraWithTolerance`.

---

### Issue 2 — No auto-inference of first payment lag
**File:** `lib/amortization.ts` — `getPaymentStartLagMonths` (~line 242)  
**Severity:** Medium

When `paymentEffectiveDate` is null, lag defaults to 0. Any mortgage with a non-first-of-month `startDate` almost certainly has a 1–2 month lag before the first payment. All such mortgages will hit the same false-negative "Not amortizing" label unless the user manually fills in `paymentEffectiveDate`.

**Proposed fix:**
```ts
export function getPaymentStartLagMonths(mortgage, options) {
  const { maxLagMonths } = mergeToleranceOptions(options);
  if (mortgage.paymentEffectiveDate) {
    // existing logic — explicit date takes priority
    ...
  }
  // Auto-infer: mid-month closing → standard convention is first payment 2 months out
  const startDate = new Date(mortgage.startDate);
  if (startDate.getDate() > 1) {
    return Math.min(maxLagMonths, 2);
  }
  return Math.min(maxLagMonths, 1); // first-of-month closing → 1 month lag
}
```

---

### Issue 3 — No guidance on the `paymentEffectiveDate` field
**File:** `app/(app)/properties/mortgage-form-fields.tsx`  
**Severity:** Low-Medium (UX friction)

The field exists and saves correctly, but there is no label hint explaining what it means or why it matters. Most users will leave it blank, triggering Issue 2 on every mid-month closing.

**Proposed fix:** Add helper text beneath the field:
> "The date your first P&I payment was due. For a May 13 closing, this is typically July 1. Leave blank to auto-estimate."

---

### Issue 4 — Stored balance not projected forward from `balanceAsOfDate`
**File:** `app/(app)/properties/[id]/mortgage-tab-content.tsx` — `toMortgageRecordLike` (line 70)  
**Severity:** Low (cosmetic / minor precision)

```ts
balanceAsOfDate: new Date().toISOString(),  // forces getEffectiveBalance to always use stored balance
```

The simulation always uses the raw stored balance ($288,417 as of 03/17/2026) as the starting point, even when `balanceAsOfDate` is weeks in the past. The balance should be projected forward to the current month using the amortization schedule.

For this mortgage: one month of projection from 03/17 would reduce the starting balance by ~$333 to ~$288,084. Not a large error, but the displayed balance is always a snapshot, never a live estimate.

**Proposed fix:** When `balanceAsOfDate` is in a prior month, project forward using `getProjectedBalanceAsOf` and display the result as an estimate. Show "Balance as of [date]" and "~$288,084 estimated April 2026" in the workspace.

---

### Issue 5 — Chart appears to reach $0 but header says "Not amortizing"
**File:** `app/(app)/properties/[id]/mortgage-tab-content.tsx` (chart section)  
**Severity:** Low (confusing UX)

On a $300k scale, a $6,514 residual is visually indistinguishable from $0. The chart looks like it reaches payoff at May 2053, while the header simultaneously says "Not amortizing." These are technically consistent but feel contradictory.

**Proposed fix:** When `remainingAtTermEnd > 0` and it is within 3× the tolerance threshold, annotate the chart endpoint: `"~$6.5k at term end"` or add a note beneath the chart: `"Balance reaches ~$6,514 at May 2053 — within [X]% of payoff."` This makes the residual visible and explains the discrepancy.

---

## Fix Priority Plan

| # | Issue | Action | File | Effort | Priority |
|---|---|---|---|---|---|
| 0 | `paymentEffectiveDate` not set on Westport mortgage | Set `07/01/2023` in Edit Mortgage Details | User data | 2 min | **Immediate** |
| 1 | Loop window ignores lag months | Extend by `lagMonths` in all three projection functions | `lib/amortization.ts` | 30 min | High |
| 2 | No auto-infer of first payment lag | Return estimated lag when `paymentEffectiveDate` is null | `lib/amortization.ts` | 30 min | High |
| 3 | No field guidance | Add helper text to `paymentEffectiveDate` | `mortgage-form-fields.tsx` | 15 min | Medium |
| 4 | Balance not projected forward | Project from `balanceAsOfDate` to current month | `mortgage-tab-content.tsx` | 45 min | Low |
| 5 | Chart/header mismatch at near-zero residual | Annotate chart when residual is near-zero | `mortgage-tab-content.tsx` | 20 min | Low |

Issues 1 and 2 together mean that after the code changes, **any mortgage with a mid-month closing date will auto-resolve correctly** without the user ever needing to know about `paymentEffectiveDate`.

---

## Test Coverage Notes

`lib/amortization.test.ts` covers tolerance helpers and the strict/tolerance split. After implementing fixes 1 and 2, add a test case:

```ts
it("auto-infers 2-month lag for mid-month closing and resolves near-term residual", () => {
  vi.setSystemTime(new Date("2026-04-01"));
  const projection = getToleranceAwarePayoffProjection({
    originalLoanAmount: 297000,
    currentBalance: 288417,
    interestRate: 0.0625,
    termYears: 30,
    startDate: new Date("2023-05-13"),
    monthlyPayment: 2648.08,
    balanceAsOfDate: new Date("2026-03-17"),
    escrowIncluded: true,
    escrowAmount: 813,
  });
  expect(projection.payoffDate).not.toBeNull();
  expect(projection.toleranceApplied).toBe(true);
});
```

---

## Related Files

| File | Role |
|---|---|
| `lib/amortization.ts` | Core math — all projection, tolerance, and payoff functions |
| `lib/amortization.test.ts` | Test coverage for above |
| `lib/validations/mortgage.ts` | Schema + P&I vs interest validation |
| `app/(app)/properties/[id]/mortgage-tab-content.tsx` | Simulation UI — `toMortgageRecordLike`, `simulateMortgage`, chart |
| `app/(app)/mortgage/mortgage-workspace.tsx` | Workspace shell — property selection, routing |
| `app/(app)/properties/mortgage-form-fields.tsx` | Form fields including `paymentEffectiveDate` |
