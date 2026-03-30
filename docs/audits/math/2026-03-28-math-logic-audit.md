# Math & Logic Audit — 2026-03-28

## Executive summary

- Core amortization iteration (interest → principal cap → balance), staleness handling for effective balance (180 days), and property/portfolio metric helpers align with the math-lane reference and golden fixtures tied to `docs/policies/ownership-metrics.md`.
- **Highest risk:** portfolio `totalAnnualRent` is built from **stated** monthly rent while **NOI** and related ratios use **vacancy-adjusted effective rent**—the dashboard labels both as primary portfolio metrics without reconciling basis, so users can misinterpret relationships (e.g. NOI vs “Annual rent”).
- **Second risk:** `getExtraPaymentForYearsEarlier` and `getPayoffYearsWithExtra` use `getToleranceAwarePayoffProjection` (not the strict `getPayoffProjection` described in `docs/process/math-logic-audit.md`), so “extra payment” math can key off a synthetic payoff when residual-at-term-end is within tolerance.
- **Overall recommendation:** Treat the annual-rent label/basis as a product/math contract fix; document or narrow tolerance use in payoff-acceleration APIs; tighten export copy for multi-mortgage rows.

## Severity-ranked findings

### Critical

- None identified in this pass (no unconditional divide-by-zero in reviewed paths; ownership golden tests match policy).

### High

- **Portfolio “Annual rent” vs NOI basis mismatch** — User-facing inconsistency and analytics-math policy risk — `app/lib/metrics/portfolio-metrics.ts` (`totalAnnualRent = totalMonthlyRent * 12` where `totalMonthlyRent` sums **stated** `monthlyRent`); `computePropertyMetrics` uses `effectiveRent = monthlyRent * (1 - vacancyPercent/100)` for NOI and scaled gross annual rent. Same dashboard surfaces show “Annual rent” and “NOI” without stating that one is contract/scheduled and the other is vacancy-adjusted — `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-charts.tsx`.

- **Extra-payment helpers use tolerance-aware payoff, not strict projection** — Possible overstated payoff acceleration or misleading “years earlier” when residual falls in tolerance band — `getExtraPaymentForYearsEarlier` and `getPayoffYearsWithExtra` call `getToleranceAwarePayoffProjection` (`app/lib/amortization.ts`), which can set `payoffDate` when strict `getPayoffProjection` would return `payoffDate: null` with a small `remainingAtTermEnd`. Process doc `docs/process/math-logic-audit.md` §2.1 documents `getPayoffProjection` for these flows; implementation diverges.

### Medium

- **CSV export: multi-mortgage metadata** — Misleading single row for multiple loans — `app/app/api/export/portfolio/route.ts` sums effective balance across mortgages but takes **first** mortgage for rate, term, balance-as-of, escrow, lender. Users with multiple liens get incomplete/wrong mortgage metadata in export while derived metrics use summed balance.

- **Benchmark freshness boundary** — Edge case: exactly 60 days may read as stale — `isBenchmarkFresh` uses `Date.now() - asOfDate.getTime() < SIXTY_DAYS_MS` (`app/lib/benchmark-utils.ts`). Values on the boundary depend on clock vs midnight interpretation; “within 60 days” in docs is ambiguous for inclusivity.

- **Negative amortization when P&I &lt; interest** — Unbounded balance growth in schedule math — `generateAmortizationSchedule` does not clamp principal to ≥ 0 (`app/lib/amortization.ts`). If `monthlyPayment` is below monthly interest, principal goes negative and balance increases. Unlikely for normal loans but possible for bad/partial inputs; not listed in the process edge matrix.

### Low

- **Process inventory drift** — `docs/process/math-logic-audit.md` §1.1 omits tolerance helpers (`getToleranceAwarePayoffProjection`, `getPaymentStartLagMonths`, etc.) and the extra-payment dependency on tolerance-aware logic.

- **Unvalidated benchmark inputs** — `getBenchmarkPct` guards `marketRent <= 0` but not `userRent` NaN/negative — `app/lib/benchmark-utils.ts` (low exposure if UI/DB constrain rent).

## Evidence reviewed

| Area | Paths / notes |
|------|----------------|
| Amortization | `app/lib/amortization.ts`, `app/lib/amortization.test.ts` |
| Property / portfolio metrics | `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/metrics/metrics-golden.test.ts`, `app/lib/test/fixtures/metrics-golden.ts` |
| Benchmark / rent | `app/lib/benchmark-utils.ts`, `app/lib/benchmark-utils.test.ts`, `app/app/(app)/dashboard/rent-vs-market-section.tsx` |
| Policies | `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md` |
| API / UI / export | `app/app/api/properties/[id]/metrics/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/app/(app)/dashboard/page.tsx`, `app/app/api/export/portfolio/route.ts` |

**Assumptions / limits:** Review focused on listed modules and primary consumers; mortgage UI components calling payoff helpers were not exhaustively traced. Prisma `Decimal` fields are coerced with `Number()` at boundaries—standard precision caveats apply.

## Risk & impact assessment

- **Annual rent vs NOI:** High user trust impact on dashboard and any API consumer using `totalAnnualRent` as if it were the same gross basis as NOI (vacancy-adjusted). Likelihood: any portfolio with `vacancyPercent > 0`.
- **Tolerance in extra-payment math:** Affects a subset of loans near term-end with small residuals; impact is wrong suggested extra payment or year count when tolerance triggers.
- **Export:** Affects multi-mortgage portfolios (smaller set); wrong rate/term columns but NOI/cash flow still use summed effective balance from inputs.

## Recommendations (prioritized)

1. **Clarify or fix `totalAnnualRent`:** Either compute it as the sum of per-property `grossAnnualRent` from `computePropertyMetrics` (effective, scaled), or keep contract rent but rename labels/tooltips to “Scheduled / contract annual rent” and add optional effective gross for parity with NOI.
2. **Align extra-payment contract:** Use strict `getPayoffProjection` for binary search baseline, or document that acceleration features use tolerance-aware payoff and expose `toleranceApplied` in any UI/API that surfaces those numbers.
3. **Export:** For multiple mortgages, add separate columns per lien, repeated rows per property, or explicit “primary mortgage only” labeling for rate/term fields.
4. **Document** benchmark 60-day rule (strict `<` vs inclusive) in `benchmark-utils` or user-facing copy.
5. **Process doc:** Extend §1.1 and §2 to include tolerance and extra-payment functions.

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` core iteration (interest, principal cap at balance, balance update) | PASS | Aligns with canonical pattern; row `payment` recomputed as principal+interest |
| Edge: `originalLoanAmount <= 0` or `monthlyPayment <= 0` → `[]` | PASS | |
| `getPiForAmortization` escrow branch clamps to ≥ 0.01 | PASS | |
| `getProjectedBalanceAsOf` before start month → 0 | PASS | |
| `getEffectiveBalance` / `getBalanceSource` 180-day staleness | PASS | Same `sixMonthsAgo` logic |
| `getPayoffProjection` balance ≤ 0 or payment ≤ 0 | PASS | Returns nulls |
| `getPayoffProjection` iteration matches schedule logic | PASS | Same interest / principal / balance pattern |
| `getMonthsToPayoffWithExtra` matches payoff iteration | PASS | |
| `getPayoffProjection` vs `generateAmortizationSchedule` identical iteration | PASS | |
| Edge: payment &lt; interest (negative principal) | NOTE | Balance can increase; not in process matrix |
| `getExtraPaymentForYearsEarlier` / `getPayoffYearsWithExtra` vs process spec (strict `getPayoffProjection`) | FAIL | Uses `getToleranceAwarePayoffProjection` |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| Effective rent, gross annual rent, expenses, NOI | PASS | Matches engineering-spec / process §2.2 |
| `capRate` with `estimatedValue > 0` | PASS | Full-property NOI ÷ value; equivalent to policy (NOI×s)/(V×s) |
| `ltv` property-level D/V | PASS | |
| `cashOnCashReturn` null when uninvested | PASS | |
| Proportional vs full_liability cash flow | PASS | Golden tests + policy |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| Empty portfolio | PASS | Zeros/nulls per process |
| `weightedCapRate`, `portfolioLtv`, `dscr`, `portfolioCashOnCashReturn` | PASS | |
| `totalAnnualRent` vs property-level effective gross | FAIL | Aggregates **stated** rent × 12, not sum of effective `grossAnnualRent` |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct` `marketRent <= 0` → 0 | PASS | |
| `isBenchmarkFresh` 60-day window | NOTE | Strict `<` boundary |
| `getBenchmarkLabel` \|pct\| &lt; 1 → at market | PASS | |
| `getBenchmarkEligibility` ordering | PASS | Single source for dashboard |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Payoff iteration consistent across schedule and `getPayoffProjection` / `getMonthsToPayoffWithExtra` | PASS | |
| `getEffectiveBalance` / `getBalanceSource` staleness | PASS | |
| Mortgage rate `Number(rate)/12` | PASS | |
| UI/API/export use `getEffectiveBalance` + `computePropertyMetrics` with same inputs | PASS | Dashboard, metrics API, portfolio summary, export |
| Portfolio annual rent vs NOI basis | FAIL | See High finding |

## Findings / recommendations

See **Severity-ranked findings** and **Recommendations** above. No code changes were made in this audit.

## Task candidates

- [ ] Fix or relabel portfolio `totalAnnualRent` so dashboard/API “Annual rent” matches effective gross used for NOI (or document contract-only basis in UI and API schema).
- [ ] Decide strict vs tolerance-aware payoff for `getExtraPaymentForYearsEarlier` / `getPayoffYearsWithExtra`; update code or `docs/process/math-logic-audit.md` and surface tolerance in UX if kept.
- [ ] Improve `app/app/api/export/portfolio/route.ts` for multiple mortgages (per-lien columns, repeated rows, or explicit labeling).
- [ ] Document or adjust benchmark 60-day inclusivity in `isBenchmarkFresh`.
- [ ] Optional: guard or document negative-amortization path in `generateAmortizationSchedule` for invalid payments.
- [ ] Update `docs/process/math-logic-audit.md` §1–2 for tolerance helpers and extra-payment behavior.

**Task candidate count:** 6

## Re-test checklist

- [ ] After any `totalAnnualRent` change: golden portfolio tests + dashboard spot-check vs property detail NOI.
- [ ] After payoff/extra-payment change: `app/lib/amortization.test.ts` + mortgage UI scenarios.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Release touching metrics, amortization, benchmark, or export; or quarterly.
- **Recommended next run:** After next material change to `app/lib/amortization.ts` or `app/lib/metrics/*`.

## Changelog (audit scope)

- 2026-03-28: Initial audit. Scope: `amortization.ts`, `property-metrics.ts`, `portfolio-metrics.ts`, `benchmark-utils.ts`; cross-check API/dashboard/export and policies; edge cases per `docs/process/math-logic-audit.md`.
