# Math & Logic Audit — 2026-04-07

## Executive summary

- **Overall:** Core amortization, property/portfolio metrics, benchmark percentage/freshness, and portfolio CSV export all route through the canonical `app/lib` implementations reviewed below. No formula errors or edge-case violations were found against `docs/process/math-logic-audit.md` §2–§4.
- **Top risks:** (1) **API/UI contract drift** between strict payoff/extra-payment helpers and tolerance-aware variants (`*WithTolerance`) if used interchangeably without copy disclosure — behavior is documented in source but scattered call sites increase misuse risk. (2) **Unvalidated numeric inputs** from persistence can yield `NaN` in pure functions; guards are strong on division-by-zero, not on non-finite inputs. (3) **User interpretation** of CSV columns that mix effective vs stored mortgage balances — documented in export contract, but easy to misread in spreadsheets.
- **Recommendation:** Ship current math as-is; treat tolerance-discipline and optional input validation as backlog hardening, not blockers.

## Module results

### `app/lib/amortization.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` canonical interest / principal / balance | PASS | `interest = balance × monthlyRate`; principal capped at balance; `payment = principal + interest` per row; rounds to 2 dp (`amortization.ts` L66–L89). Empty schedule when `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` (L55–L57). |
| Negative-amort guard vs spec `min(payment − interest, balance)` | NOTE | Uses `AMORTIZATION_COMPARISON_EPSILON` so near–interest-only cases match tests; empty schedule when P&I strictly below interest (L69–L71). |
| `getPayoffProjection` iteration matches schedule logic | PASS | Same interest → principal cap → balance update pattern and epsilon check (L412–L426 vs L66–L80). |
| `getEffectiveBalance` / `getBalanceSource` staleness (180 days) | PASS | Identical `sixMonthsAgo.setDate(... - 180)` and `balanceAsOf >= sixMonthsAgo` (L201–L202, L240–L242). |
| Edge: `getPayoffProjection` balance ≤ 0 or payment ≤ 0 | PASS | Returns `{ payoffDate: null, remainingAtTermEnd: null }` (L391–L393). |
| Edge: payment does not amortize / negative amort | PASS | Early `isNegativeAmortizingPayment` or mid-loop return with `remainingAtTermEnd` rounded (L395–L398, L414–L418, L435–L438). |
| `getPiForAmortization` escrow clamp | PASS | `Math.max(0.01, pi)` when escrow included and amount &gt; 0 (L126–L128). |
| `getProjectedBalanceAsOf` before start | PASS | `if (asOf < startNorm) return 0` (L148); covered by `amortization.test.ts`. |
| `getExtraPaymentForYearsEarlier` null when no payoff / target ≤ 0 | PASS | L570–L582. |
| `getPayoffYearsWithExtra` extra &lt; 0 | PASS | L667. |
| `getMonthsToPayoffWithExtraStrict` aligns with payoff iteration | PASS | Same body pattern as `getPayoffProjection` (L495–L503 vs L412–L426). |
| `getRefinanceProjection` rate as decimal, guards | PASS | Uses `Number(mortgage.interestRate)/12`, `isNegativeAmortizingPayment` on new loan; `breakEvenMonths` only when `closing > 0 && monthlySavings > 0` (L828–L879). |
| `getStandardMonthlyPayment` division safety | PASS | `termYears <= 0` and `annualRate === 0` branches (L738–L742). |

### `app/lib/metrics/property-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent`, `grossAnnualRent`, `annualExpenses`, `noi` | PASS | L92–L96 matches process §2.2. |
| `capRate`, `ltv` when `estimatedValue > 0` | PASS | L97, L111; null when value 0. |
| `monthlyCashFlow` full_liability vs proportional | PASS | L101–L103 matches spec. |
| `equity`, `cashOnCashReturn` scaling / null | PASS | L108, L113–L115; `cashInvested` null or ≤ 0 → CoC null. |

### `app/lib/metrics/portfolio-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Empty `properties` | PASS | Zeros and nulls L42–L59. |
| `weightedCapRate`, `portfolioLtv`, `portfolioCashOnCashReturn` | PASS | L107–L110; denominators guarded. |
| `dscr` | PASS | L104–L105; null when `totalAnnualDebtService <= 0`. |
| Aggregation uses `computePropertyMetrics` | PASS | L76; single source of truth. |

### `app/lib/benchmark-utils.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct` marketRent ≤ 0 | PASS | L58–L60. |
| `isBenchmarkFresh` strict 60-day ms window | PASS | `now - asOf < BENCHMARK_FRESHNESS_MAX_MS` (L28–L35); matches `benchmark-utils.test.ts` boundary test. |
| `getBenchmarkLabel` “at market” band | PASS | `abs(pct) < 1` (L74–L77). |

### `app/lib/plans.ts` (RentCast quota inventory)

| Check | Status | Notes |
|-------|--------|-------|
| `RENTCAST_HOURLY_LIMITS` numeric constants | PASS | free 5 / investor 10 / pro 20 (L26–L30); aligns with `docs/reference/rentcast-quota.md` cross-ref in process §1.1. |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Payoff / schedule iteration identity | PASS | Shared structure across `generateAmortizationSchedule`, `getPayoffProjection`, `getMonthsToPayoffWithExtraStrict`, `projectStoredBalanceForward` (principal cap + balance clamp). |
| Staleness 180 days | PASS | `getEffectiveBalance` and `getBalanceSource` share the same window; `getBalanceSource` adds `stored_projected` sub-tier (still consistent with process intent). |
| Mortgage rate decimal /12 | PASS | All amortization paths use `Number(rate)/12` (or input rate/12). |
| Export vs UI metrics | PASS | `app/app/api/export/portfolio/route.ts` uses `getEffectiveBalance` per lien and `computePropertyMetrics` with same inputs pattern as property surfaces (L112–L162). |

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Strict vs tolerance-aware payoff and extra-payment APIs** — Multiple exported pairs (`getPayoffProjection` / `getToleranceAwarePayoffProjection`, `getExtraPaymentForYearsEarlier` / `getExtraPaymentForYearsEarlierWithTolerance`, etc.) with explicit “UI-only” comments on tolerance variants (`amortization.ts` L511, L605, L695). **Risk:** Inconsistent numbers between API responses and exploratory UI if the wrong helper is wired. **Evidence:** `app/lib/amortization.ts` L441–L457, L561–L655, L657–L727; consumers include `app/app/api/properties/[id]/mortgage/route.ts`, refinance and mortgage pages.

### Low

- **Non-finite numeric inputs** — Pure functions assume coherent `Number(...)` results; corrupted DB strings could propagate `NaN` through metrics or amortization without a single central guard. **Evidence:** `property-metrics.ts` L90–L97; `amortization.ts` `MortgageRecord` coercions.
- **CSV column semantics** — Effective mortgage total vs stored sum and first-lien-only descriptive columns are correct per contract but require user care. **Evidence:** `app/app/api/export/portfolio/route.ts` L25–L31, L112–L123; `docs/reference/portfolio-csv-export.md` (referenced in route).

## Evidence reviewed

- `app/lib/amortization.ts` (full)
- `app/lib/metrics/property-metrics.ts` (full)
- `app/lib/metrics/portfolio-metrics.ts` (full)
- `app/lib/benchmark-utils.ts` (full)
- `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS` and surrounding quota docs)
- `app/app/api/export/portfolio/route.ts` (export path / metric consistency)
- Spot checks: `app/lib/amortization.test.ts`, `app/lib/benchmark-utils.test.ts`, `app/lib/metrics/property-metrics.test.ts`, `app/lib/metrics/portfolio-metrics.test.ts`

**Limits:** RentCast estimate route handlers were not re-audited for duplicate math beyond confirming limits live in `plans.ts`. Refinance UI (`refinance-workspace.tsx`) was not line-audited; it consumes `amortization` exports already covered here.

## Risk & impact assessment

- Unresolved **medium** items affect **trust and support load** (users or integrators seeing different payoff hints) more than silent data corruption; code comments mitigate but do not enforce.
- **Low** items are edge cases (bad data, spreadsheet misuse); likelihood is low in normal operation.

## Recommendations (prioritized)

1. **Document or lint call-site policy** for which amortization entry points are allowed from `app/app/api/**` vs marketing or exploratory UI (strict-only in API).
2. **Optional:** Add finite-number assertions or validation at property/mortgage write boundaries so `computePropertyMetrics` and amortization never receive `NaN`.
3. **Optional:** In export docs or in-app export help, repeat one line: “NOI / cash flow use effective mortgage balances; stored balances are listed separately.”

## Task candidates (optional)

- [ ] Inventory API routes and document which amortization helpers must remain strict-only vs tolerance-aware.
- [ ] Optional: finite-number validation on mortgage/property numeric writes to prevent `NaN` in metrics.

## Re-test checklist

- [ ] After any change to `amortization.ts` iteration or tolerance defaults: run `app/lib/amortization.test.ts`.
- [ ] After metrics formula changes: run `app/lib/metrics/*.test.ts` and `app/app/api/properties/[id]/metrics/route.test.ts`.
- [ ] After benchmark window changes: run `app/lib/benchmark-utils.test.ts`.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Release touching amortization, metrics, benchmarks, or portfolio export; or quarterly.
- **Suggested next window:** 2026-07-07 or next release that modifies `app/lib/amortization.ts` / `property-metrics.ts` / `portfolio-metrics.ts`.

## Changelog (audit scope)

- **2026-04-07:** Math & Logic audit. Scope: `amortization.ts`, `property-metrics.ts`, `portfolio-metrics.ts`, `benchmark-utils.ts`, `plans.ts` RentCast hourly limits, portfolio CSV export consistency. Process: `docs/process/math-logic-audit.md`. Template: `docs/process/audit-report-template.md`.
