# Math & Logic Audit — 2026-04-03

## Executive summary

- **Overall:** Core amortization iteration, property/portfolio metrics, and benchmark freshness/eligibility align with `docs/process/math-logic-audit.md`, `docs/policies/ownership-metrics.md`, and `docs/policies/analytics-math-policy.md`. Golden fixtures and targeted tests cover ownership modes, vacancy, and API/export/deals contracts.
- **Top risk:** `getPayoffYearsWithExtra` / `getPayoffYearsWithExtraWithTolerance` pass a `maxMonths` cap to the strict/tolerance payoff helpers **without** the same `+ getPaymentStartLagMonths(mortgage)` extension used inside `getPayoffProjection` and `getMonthsToPayoffWithExtraStrict`, which can truncate the simulation window when lag > 0 and skew or null out “years with extra” near the term boundary.
- **Secondary:** Rent-vs-market benchmarks use **contract** rent (`getPropertyTotalRent`) while NOI/cap rate use **vacancy-adjusted** effective rent — defensible for a “list rent vs comp” story but can feel inconsistent next to economics cards unless copy clarifies the basis.
- **Recommendation:** Fix the payoff-years cap to match the lag-aware remaining-months contract (or delegate max cap entirely to the shared helper). Optionally document benchmark rent basis in UI help text.

---

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified (no verified silent tolerance in API/export payoff JSON; mortgage routes and property detail use strict `getPayoffProjection` — see Evidence).

### Medium

- **Payoff “years with extra” uses a shorter month cap than payoff projection when payment-start lag > 0** — Understates available horizon for `getMonthsToPayoffWithExtraStrict` / tolerance variant vs `getPayoffProjection`, so results can be `null` or rounded years too low in edge cases — `app/lib/amortization.ts` lines 641–659 (`getPayoffYearsWithExtra`) and 666–694 (`getPayoffYearsWithExtraWithTolerance`); contrast `getPayoffProjection` lines 376–377 and `getMonthsToPayoffWithExtraStrict` lines 460–462.

### Low

- **Benchmark % uses contract rent, metrics use effective rent after vacancy** — Same property can show “above market” on the benchmark strip while NOI assumes vacancy; not a code bug but a **reconciliation/UX** risk — `getPropertyTotalRent` in `app/lib/property-utils.ts` lines 34–42; `computePropertyMetrics` effective rent in `app/lib/metrics/property-metrics.ts` lines 92–96; benchmark callers (e.g. `app/app/(app)/dashboard/page.tsx` uses `getPropertyTotalRent` for `userRent`).

- **Negative-amortization detection differs slightly between modules** — `generateAmortizationSchedule` / payoff loops use `payment + AMORTIZATION_COMPARISON_EPSILON < interest` (`app/lib/amortization.ts` e.g. 69–71, 383–385); `projectStoredBalanceForward` uses `pi <= interest` (line 184). At exact interest-only equality, schedule continues with zero principal; forward projection exits the loop path without reducing balance (correct for IO). Low practical risk; worth knowing for boundary reviews.

---

## Evidence reviewed

### Policies and process

- `docs/process/math-logic-audit.md` (scope, edge matrix, cross-module rules)
- `docs/process/audit-report-template.md`
- `docs/policies/ownership-metrics.md` (§2 formulas, §5 saved deals proportional-only)
- `docs/policies/analytics-math-policy.md` (§3.4 annual rent vs NOI, §3.6 benchmark freshness, §3.7 strict vs tolerance payoff)

### Implementation

- `app/lib/amortization.ts` (full file: schedule, balance projection, payoff, tolerance, extra payment, payoff years)
- `app/lib/metrics/property-metrics.ts`
- `app/lib/metrics/portfolio-metrics.ts`
- `app/lib/benchmark-utils.ts`
- `app/lib/property-utils.ts` (`getPropertyTotalRent`)

### API / export / UI alignment (spot-check)

- Saved deals: `app/app/api/deals/route.ts` (lines 47–58), `app/app/api/deals/[id]/route.ts` (56–67), `app/app/(app)/deals/page.tsx` (33–44) — all **`computePropertyMetrics(..., "proportional")`** per ownership-metrics §5.
- Export: `app/app/api/export/portfolio/route.ts` (97–99, 148–159) — **`displayMode` from `user.ownershipDisplayMode`** with `computePropertyMetrics`.
- Property metrics API: `app/app/api/properties/[id]/metrics/route.ts` (37–49) — user `displayMode`.
- Strict payoff for API/page: `app/app/api/properties/[id]/mortgage/route.ts`, `mortgage/[mortgageId]/route.ts` — `getPayoffProjection`; `app/app/(app)/properties/[id]/page.tsx` (61–82).
- Tolerance-aware UI: `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (243–248, 490–496), `payoff-card.tsx` (133–134, 168+) — disclosure present for tolerance vs strict.

### Tests

- `app/lib/amortization.test.ts`
- `app/lib/metrics/property-metrics.test.ts`
- `app/lib/metrics/portfolio-metrics.test.ts`
- `app/lib/metrics/metrics-golden.test.ts`
- `app/lib/benchmark-utils.test.ts`
- `app/lib/test/fixtures/metrics-golden.ts`

### Assumptions / limits

- Review is static (read + trace + policy diff). No production data or Monte Carlo sampling.
- `getPayoffYearsWithExtra` lag mismatch is proven by **code path comparison**; a dedicated regression test would quantify frequency.

---

## Risk & impact assessment

- **Medium (lag cap):** Affects investors using mortgage tab “years with extra” / tolerance helpers on loans where `getPaymentStartLagMonths` returns 2 (typical mid-month close without explicit `paymentEffectiveDate`). Impact is **wrong null or rounded years** only when the true payoff-with-extra sits in the last few months of the **lag-extended** window — narrow but real.
- **Low (benchmark vs vacancy):** Mostly **interpretation**; could confuse users comparing benchmark strip to NOI unless copy states “contract rent vs market estimate.”

---

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: interest = balance × monthlyRate; principal caps to balance; empty inputs | PASS | Lines 55–57, 66–90; negative amort returns `[]` mid-schedule |
| Iteration matches `getPayoffProjection` / extra-payment strict loops | PASS | Same interest → principal → balance pattern and epsilon for sub-interest |
| `getPiForAmortization` escrow clamp ≥ 0.01 | PASS | Lines 126–128; tests in `amortization.test.ts` |
| `getProjectedBalanceAsOf` before start → 0 | PASS | Lines 148, 165–167 |
| `getEffectiveBalance` / `getBalanceSource` 180-day staleness | PASS | Lines 200–202, 240–242; same `sixMonthsAgo` construction |
| `getPayoffProjection` balance ≤ 0 / payment ≤ 0 | PASS | Lines 361–363 |
| `getPayoffProjection` negative amort → no payoff date | PASS | Lines 365–368, 383–388 |
| `getToleranceAwarePayoffProjection` vs strict policy §3.7 | PASS | Strict API uses `getPayoffProjection` only |
| `getPayoffYearsWithExtra` cap vs lag-aware remaining months | **FAIL** | Missing `+ lag` in caller `remainingTermMonths` (lines 646–656) vs internal 460–462 |
| `getPayoffYearsWithExtraWithTolerance` same cap issue | **FAIL** | Lines 680–690 |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| effectiveRent = rent × (1 − vacancy/100) | PASS | Lines 92–93 |
| grossAnnualRent / NOI scaling vs ownership-metrics §2 | PASS | `noi = (R−E)×12` then `noi * scale`; capRate = unscaled NOI / V = (NOI scaled)/(V×s) |
| Proportional vs full_liability cash flow | PASS | Lines 99–103; matches policy table |
| LTV = D/V unscaled | PASS | Lines 110–111 |
| estimatedValue = 0 → capRate/ltv null | PASS | Lines 97, 110–111 |
| cashInvested null/zero → cashOnCash null | PASS | Lines 113–115 |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| Empty properties → zeros/nulls | PASS | Lines 42–59 |
| weightedCapRate = totalNoi / totalMarketValue | PASS | Line 107 |
| portfolioLtv debt mode (full vs scaled) | PASS | Lines 93–97 |
| totalAnnualRent = sum of vacancy-adjusted grossAnnualRent | PASS | Lines 85, 121; aligns analytics §3.4 |
| DSCR = totalNoi / totalAnnualDebtService | PASS | Lines 104–105 |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| Freshness: `now - asOf < 60×24h` ms | PASS | `isBenchmarkFreshAt` lines 28–34; matches analytics §3.6 |
| Exactly boundary stale | PASS | `benchmark-utils.test.ts` lines 32–38 |
| getBenchmarkPct market ≤ 0 | PASS | Lines 58–60 |
| getBenchmarkLabel abs &lt; 1% “at market” | PASS | Lines 74–77 |
| Eligibility ordering | PASS | Tests cover not_rented → … → eligible_fresh |

---

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Payoff iteration matches schedule iteration | PASS | Shared pattern; epsilon handling documented |
| `getEffectiveBalance` / `getBalanceSource` staleness | PASS | Same 180-day cutoff |
| Rate as decimal, `/12` monthly | PASS | Consistent |
| `getMonthsToPayoffWithExtraStrict` vs `getPayoffProjection` term caps | **PARTIAL** | Internal caps both use lag; `getPayoffYearsWithExtra` caller omits lag in **its** `maxMonths` argument |
| API/export payoff strict-only | PASS | Mortgage routes + property page serialization |
| Saved deals proportional metrics | PASS | Deals routes and list page |

---

## Recommendations (prioritized)

1. **Align `getPayoffYearsWithExtra` and `getPayoffYearsWithExtraWithTolerance` month caps** with the same remaining-months formula as `getPayoffProjection` (include `getPaymentStartLagMonths(mortgage)`), or pass `Infinity`/`Number.MAX_SAFE_INTEGER` and rely solely on the inner `Math.min(maxMonths, remainingTermMonths)` so the inner contract is single-sourced.
2. **Add a regression test** in `amortization.test.ts` for a mortgage with `getPaymentStartLagMonths === 2` where payoff-with-extra needs the lag-extended window (fails today if cap too tight).
3. **Clarify benchmark copy** (tooltip or help): contract/total rent vs market estimate, distinct from vacancy-adjusted economics — optional documentation-only follow-up.

---

## Task candidates (optional)

- [ ] Fix payoff-years extra-payment simulation cap to include payment-start lag (or remove redundant outer cap); add `amortization.test.ts` regression.
- [ ] Review benchmark UI strings for explicit “contract rent” vs effective-rent context where both appear on property detail.

---

## Re-test checklist

- [ ] After any amortization change: run `app/lib/amortization.test.ts` and verify Westport / hybrid tolerance tests still pass.
- [ ] Verify `getPayoffYearsWithExtra` vs `getPayoffProjection` on a mid-month-close fixture with lag = 2.
- [ ] `npm run check` (when code changes are made).
- [ ] Spot-check property detail API vs UI for `payoffProjection` (strict) vs mortgage tab tolerance disclosure.

---

## Next trigger and cadence

- **Trigger:** Release touching `app/lib/amortization.ts`, metrics, benchmark utils, or deals/export/metrics routes.
- **Recommended next run:** After next mortgage simulation or ownership-metrics change; or quarterly.

---

## Changelog (audit scope)

- **2026-04-03:** Math & Logic lane. Scope: `app/lib/amortization.ts`, `app/lib/metrics/*`, `app/lib/benchmark-utils.ts`, policy alignment for ownership/deals/export/API/projection surfaces, tests listed above.
