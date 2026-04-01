# Math & Logic Audit — 2026-03-31

## Executive summary

- Core amortization, property/portfolio metrics, and benchmark utilities align with `docs/process/math-logic-audit.md`, `docs/policies/ownership-metrics.md`, and `docs/policies/analytics-math-policy.md` for the paths reviewed.
- Saved-deal APIs, portfolio CSV export, mortgage JSON APIs, and portfolio summary payload use shared helpers consistently; strict payoff is used for API/export; the mortgage UI uses tolerance-aware helpers with disclosure where tolerance applies.
- Residual risk is mostly **data-quality**: amortization iteration does not clamp principal when payment is below interest (negative amortization), which is not blocked at validation and could distort schedules if bad numbers are stored.
- Overall recommendation: **ship with awareness**; optionally harden validation or clamp schedule iteration in a follow-up if imported or legacy rows can carry nonsensical payments.

## Summary

Amortization payoff projection, extra-payment helpers, and schedule generation share the same interest → principal → balance update when payment covers interest. Ownership-mode cash flow, NOI scaling, LTV, cap rate, portfolio rollups, and annual-rent basis match the canonical policies. RentCast hourly caps are numeric constants with a single shared counter contract documented in `plans.ts` and reference docs.

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` core iteration matches spec (interest, principal cap at balance, balance update) | PASS | Uses same structure as `getPayoffProjection` / extra-payment loops |
| Edge: `originalLoanAmount ≤ 0` or `monthlyPayment ≤ 0` → `[]` | PASS | |
| Rounding: rows to 2 decimals | PASS | |
| `getPiForAmortization` escrow path; P&I clamp ≥ 0.01 | PASS | |
| `getProjectedBalanceAsOf` before `startDate` → 0 | PASS | |
| `getEffectiveBalance` / `getBalanceSource` staleness: 180 days, same logic | PASS | Calendar `setDate(-180)` matches process “180 days” |
| `getPayoffProjection` iteration matches schedule; cap at term; balance/payment ≤ 0 → nulls | PASS | Starts from next month; aligns with spec intent |
| Edge: payment does not amortize → `remainingAtTermEnd`, null payoff | PASS | |
| `getMonthsToPayoffWithExtraStrict` / `WithTolerance` same iteration as payoff | PASS | |
| `getExtraPaymentForYearsEarlier` requires strict payoff; binary search | PASS | |
| `getExtraPaymentForYearsEarlier` `targetMonths ≤ 0` → null | PASS | |
| `getPayoffYearsWithExtra` `extraPayment < 0` → null | PASS | |
| Strict vs tolerance split per analytics policy §3.7 | PASS | Tolerance helpers documented UI-only; API routes use `getPayoffProjection` |
| Negative amortization (`payment < interest`): principal unbounded below zero | NOTE | No mortgage schema check; balance can grow in loop (see findings) |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `effectiveRent`, `grossAnnualRent` (pre-scale), `annualExpenses`, `noi` | PASS | Vacancy on rent; expenses unscaled then scaled in return |
| `capRate` = `noi / estimatedValue` when value > 0 | PASS | Equivalent to `(NOI×s)/(V×s)` per ownership policy |
| `monthlyCashFlow` proportional vs `full_liability` | PASS | Matches policy table |
| `equity` = `(V - D) × scale` | PASS | |
| `ltv` = `D / V` unscaled | PASS | Per policy (property leverage) |
| `cashOnCashReturn` guarded | PASS | Null when `cashInvested` null/0 after scale |
| Edge: `estimatedValue = 0` → cap/ltv null | PASS | |
| `scaleLiabilityAmount` / `getAnnualDebtService` / `computeAnnualCashFlowFromAnnualInputs` | PASS | Consistent with mode semantics |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| `weightedCapRate` = `totalNoi / totalMarketValue` | PASS | Guard on `totalMarketValue` |
| `portfolioLtv` = `totalDebt / totalMarketValue` | PASS | Debt mode-dependent per policy |
| `portfolioCashOnCashReturn` = `(totalMonthlyCashFlow × 12) / totalCashInvested` | PASS | |
| `totalAnnualRent` sum of `metrics.grossAnnualRent` | PASS | Vacancy-adjusted, ownership-scaled; aligns analytics policy §3.4 |
| `dscr` denominator `totalAnnualDebtService` | PASS | Uses `getAnnualDebtService` per property |
| Empty `properties` → zeros/nulls | PASS | |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct` `marketRent ≤ 0` → 0 | PASS | |
| `isBenchmarkFresh` / `isBenchmarkFreshAt`: `now - asOf < 60×24×60×60×1000` | PASS | Matches analytics policy §3.6 (exactly 60 days stale) |
| `getBenchmarkLabel` \|pct\| < 1 → at market | PASS | |
| `BENCHMARK_FRESHNESS_MAX_MS` | PASS | Documented in module |

### Calculators (lib)

| Surface | Status | Notes |
|---------|--------|-------|
| `public-calculator.ts` | PASS | `computeMonthlyPayment` percent→decimal; `computePropertyMetrics(..., "proportional")`; DSCR uses `metrics.noi` / `getAnnualDebtService` |
| `brrr-calculator.ts` | PASS | Refi loan, closing costs, cash-out; post-refi metrics proportional; clamps on inputs |
| `fix-and-flip-calculator.ts` | PASS | Interest-only hold, sale net of costs; ROI / annualized formulas consistent with comments |
| `str-ltr-calculator.ts` | PASS | STR effective monthly from occupancy/fees; LTR vacancy; shared loan; DSCR aligned; `annualGrossIncome` semantics differ by side **by design** (documented on type) |

### Export / import / APIs (math-relevant)

| Surface | Status | Notes |
|---------|--------|-------|
| `app/api/export/portfolio/route.ts` | PASS | `getEffectiveBalance` per lien; `computePropertyMetrics` with user `ownershipDisplayMode`; cap/LTV from shared helper |
| `app/api/import/portfolio/route.ts` | PASS | Delegates to `parseRow`; no local metric formulas |
| `lib/import/csv-parser.ts` `parseNum` / dates | PASS | Finite checks; comma stripping |
| `buildPortfolioSummaryPayload` | PASS | Same effective balance + `computePortfolioMetrics` as dashboard contract |
| `GET/POST /api/deals` + `GET/PATCH /api/deals/[id]` | PASS | `computePropertyMetrics(..., "proportional")` per ownership policy §5 |
| `app/api/properties/[id]/mortgage/route.ts` (+ `[mortgageId]`) | PASS | `payoffProjection` from `getPayoffProjection` only (strict) |
| `plans.ts` `RENTCAST_HOURLY_LIMITS` | PASS | Matches math-logic inventory; `getRentCastHourlyLimit` fallback |

### Validations (numeric)

| Area | Status | Notes |
|------|--------|-------|
| `lib/validations/deal.ts` | PASS | Non-negative decimals; value/price rule; ownership/vacancy bounds |
| `lib/validations/mortgage.ts` | NOTE | No rule that monthly P&I covers first-period interest (see negative amortization) |

### UI: mortgage tab (`mortgage-tab-content.tsx`)

| Check | Status | Notes |
|-------|--------|-------|
| Baseline payoff / extra targets | PASS | Tolerance-aware helpers; `toMortgageRecordLike` seeds `currentBalance` from server `effectiveBalance` and forces recent `balanceAsOfDate` so client simulation aligns with effective balance |
| Disclosure | PASS | When `toleranceApplied`, copy states strict API/export vs tolerance in workspace |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| `getPayoffProjection` ↔ `generateAmortizationSchedule` iteration | PASS | Same interest, principal cap, balance update |
| `getEffectiveBalance` ↔ `getBalanceSource` staleness | PASS | Identical 180-day window |
| Mortgage rate stored as decimal; `/12` for monthly | PASS | `Number(interestRate)/12` in amortization |
| `getMonthsToPayoffWithExtraStrict` ↔ `getPayoffProjection` | PASS | |
| API/export strict payoff vs UI tolerance | PASS | Policy §3.7 |

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Negative amortization in shared amortization when payment &lt; interest** — If `monthlyPayment` (or P&I after escrow) is positive but less than one period’s interest, `principal = payment - interest` is negative, so balance can increase across `generateAmortizationSchedule`, `getPayoffProjection`, and UI `simulateMortgage`. Validations allow any non-negative payment without an interest-coverage check — `app/lib/amortization.ts` (`generateAmortizationSchedule`, `getPayoffProjection`), `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (`simulateMortgage`).

### Low

- **STR vs LTR `annualGrossIncome` meaning** — STR side uses pre–platform-fee gross bookings; LTR uses vacancy-adjusted annual rent from metrics. Type comments document this; confirm marketing/UI labels never imply identical definitions — `app/lib/str-ltr-calculator.ts`.

## Evidence reviewed

- `app/lib/amortization.ts` (full)
- `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`
- `app/lib/benchmark-utils.ts`
- `app/lib/public-calculator.ts`, `app/lib/brrr-calculator.ts`, `app/lib/fix-and-flip-calculator.ts`, `app/lib/str-ltr-calculator.ts`
- `app/lib/plans.ts` (RentCast limits)
- `app/lib/server/portfolio-summary-payload.ts`
- `app/app/api/export/portfolio/route.ts`, `app/app/api/import/portfolio/route.ts` (structure + math call sites)
- `app/lib/import/csv-parser.ts` (numeric/date parsing)
- `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`
- `app/app/api/properties/[id]/mortgage/route.ts`
- `app/lib/validations/deal.ts`, `app/lib/validations/mortgage.ts`
- `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (simulation, tolerance disclosure, `toMortgageRecordLike`)

**Limits:** Estimate route handlers were not line-audited for quota arithmetic (only plan constants). Calculator **components** (presentation only) were not re-read end-to-end. No runtime test execution in this audit.

## Risk & impact assessment

Unresolved medium finding mainly affects edge-case or bad data: most real fixed-rate mortgages have scheduled payment above interest. Impact is misleading schedules, payoff dates, and CSV “effective” narratives if corrupt imports slip through. Likelihood is low for typical user entry but non-zero for CSV import or typos.

## Recommendations (prioritized)

1. Add a validation or guard path for mortgage P&I ≥ minimum first-period interest (or clamp negative principal to 0 in schedule/projection with a clear product decision), and document behavior.
2. Keep mortgage tab disclosure visible wherever tolerance-aware payoff or `getExtraPaymentForYearsEarlierWithTolerance` is shown; re-verify if new surfaces reuse tolerance helpers without copy.
3. On next analytics change, re-run the verification matrix in `analytics-math-policy.md` §8 (ownership %, modes, escrow, payoff horizon, UI + API + export).

## Re-test checklist

- [ ] If negative-amortization guard is added: unit tests for schedule, `getPayoffProjection`, and a sample import row.
- [ ] Regression on `app/lib/amortization.test.ts` and deal/mortgage API tests after any change.
- [ ] `npm run check` after code changes (audit run did not modify code).

## Next trigger and cadence

- **Trigger:** Monthly or after any change to `app/lib/amortization.ts`, `app/lib/metrics/*`, benchmark freshness, or export/deal/mortgage metric payloads.
- **Suggested next window:** 2026-04-30 or next release touching analytics math.

## Findings / recommendations (math-lane index)

No FAIL rows in core module tables; see **Severity-ranked findings** for the negative-amortization NOTE elevated to Medium and STR/LTR Low note.

## Changelog (audit scope)

- **2026-03-31:** Initial audit for this date. Scope: amortization, property-metrics, portfolio-metrics, benchmark-utils; calculators in `app/lib/*-calculator.ts`; portfolio export/import call sites; deals and mortgage APIs; `portfolio-summary-payload`; validations deal/mortgage; mortgage tab payoff/tolerance UI; `plans` RentCast hourly limits.
