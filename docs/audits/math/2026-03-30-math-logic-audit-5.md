# Math & Logic Audit — 2026-03-30 (Run 5)

## Summary

Run 5 (2026-03-30) is a static, evidence-backed review of amortization, property/portfolio metrics, benchmark utilities, related API routes (`/api/portfolio/summary`, `/api/export/portfolio`, `/api/properties/[id]/metrics`, mortgage routes), export/contract docs, and policy alignment. Implementation matches `docs/process/math-logic-audit.md` §2–4 for core formulas and edge cases; golden and unit tests in `app/lib/metrics` and `app/lib/amortization.test.ts` encode the same contracts. No code defects were found in reviewed paths; the main follow-ups remain **documentation drift** (`docs/reference/engineering-spec.md` §6 vs shipped metrics) and **process inventory** completeness in `docs/process/math-logic-audit.md` §1.1.

## Executive summary

- **Overall health:** Core financial math (amortization iteration, 180-day effective balance, property/portfolio aggregation, benchmark % and strict 60-day freshness window, strict vs tolerance-aware payoff split) is consistent with `docs/policies/analytics-math-policy.md`, `docs/policies/ownership-metrics.md`, and shared helpers under `app/lib/metrics/` and `app/lib/amortization.ts`.
- **API/export alignment:** Portfolio summary, per-property metrics JSON, portfolio CSV, and mortgage list/detail serialization use `computePortfolioMetrics` / `computePropertyMetrics` and `getEffectiveBalance` where documented; mortgage APIs expose strict `getPayoffProjection` only (no tolerance fields in JSON).
- **Top risk:** Stale narrative in `docs/reference/engineering-spec.md` §6 could mislead implementers who treat it as the live contract.
- **Recommendation:** Keep policies and golden fixtures as source of truth; update or clearly deprecate engineering-spec §6 and extend the process inventory table per Run 4 findings.

## Severity-ranked findings

### Critical

- None.

### High

- None identified in reviewed implementation paths for metrics, amortization, benchmarks, or the API/export surfaces listed under Evidence reviewed.

### Medium

- **`docs/reference/engineering-spec.md` §6 (Calculation Backlog) remains stale vs production** — It still describes gross annual rent as `monthly_rent * 12` and monthly cash flow as `monthly_rent - monthly_expenses - monthly_payment` without vacancy or ownership modes. **Risk:** tasks or contributors copy §6 and ship formulas that diverge from `computePropertyMetrics` and `docs/policies/ownership-metrics.md`. **Evidence:** `docs/reference/engineering-spec.md` (lines ~525–549); `app/lib/metrics/property-metrics.ts`; `app/lib/test/fixtures/metrics-golden.ts`.

### Low

- **`docs/process/math-logic-audit.md` §1.1 inventory is incomplete** — Table lists `getPayoffYearsWithExtra` / amortization set but omits explicit rows for `getMonthsToPayoffWithExtraStrict`, `getMonthsToPayoffWithExtraWithTolerance`, tolerance helpers, and expanded `benchmark-utils` exports (`getBenchmarkEligibility`, `isBenchmarkComparable`, etc.). **Evidence:** `docs/process/math-logic-audit.md` §1.1; `app/lib/amortization.ts`; `app/lib/benchmark-utils.ts`.

- **Process doc §2.4 vs code for benchmark freshness** — Process text says “within 60 days”; implementation uses a **strict** millisecond upper bound (`now - asOf < BENCHMARK_FRESHNESS_MAX_MS`), so a snapshot at exactly 60 full days of age is **not** fresh. This matches `docs/policies/analytics-math-policy.md` §3.6 and `app/lib/benchmark-utils.ts` (`isBenchmarkFreshAt`).

- **`remainingAtTermEnd` uses whole-dollar rounding** — `getPayoffProjection` returns `Math.round(runningBalance)` while schedule rows use two-decimal rounding. Acceptable for API/display; not bit-identical to last schedule row. **Evidence:** `app/lib/amortization.ts` (`getPayoffProjection` return); `generateAmortizationSchedule` row rounding.

## Module results

### lib/amortization.ts (`app/lib/amortization.ts`)

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule`: interest = balance × monthlyRate; principal capped when ≥ balance; balance = max(0, balance − principal); payment = principal + interest | PASS | Lines 47–57; edge: non-amortizing payment yields principal &lt; 0 path. |
| Edge: originalLoanAmount ≤ 0 or monthlyPayment ≤ 0 → [] | PASS | Lines 36–37. |
| `getPiForAmortization`: escrow subtracted; clamp ≥ 0.01 | PASS | Lines 103–106. |
| `getProjectedBalanceAsOf`: before start month → 0 | PASS | Lines 121–125, 134–137. |
| `getEffectiveBalance` / `getBalanceSource`: 180-day staleness aligned | PASS | Same `sixMonthsAgo` pattern (lines 152–155 vs 179–183); projection fallback when projected ≤ 0 (lines 168–169). |
| `getPayoffProjection`: iteration matches schedule core; null when balance ≤ 0 or payment ≤ 0 | PASS | Lines 290–292, 305–319 vs schedule 47–57. |
| Non-amortizing path: null payoff, `remainingAtTermEnd` rounded | PASS | Lines 321–324. |
| `getExtraPaymentForYearsEarlier`: requires `getPayoffProjection` with payoff; uses `getMonthsToPayoffWithExtraStrict` | PASS | Lines 440–475; null when `projection.payoffDate == null` or `targetMonths <= 0`. |
| `getPayoffYearsWithExtra`: extra &lt; 0 → null | PASS | Lines 541–542. |
| Tolerance helpers documented UI-only vs strict core | PASS | Comments; `analytics-math-policy.md` §3.7. |

### lib/metrics/property-metrics.ts (`app/lib/metrics/property-metrics.ts`)

| Check | Status | Notes |
|-------|--------|-------|
| effectiveRent, grossAnnualRent, annualExpenses, NOI | PASS | Lines 90–96; default vacancy 5%. |
| capRate = full-property NOI / estimatedValue when value &gt; 0 | PASS | Lines 96–97; matches golden comment (full NOI ÷ full value). |
| monthlyCashFlow: `full_liability` vs `proportional` | PASS | Lines 101–103; aligns with `ownership-metrics.md` §2. |
| equity scaled; LTV full debt / full value | PASS | Lines 108–111. |
| cashOnCashReturn null when cashInvested null or scaled basis ≤ 0 | PASS | Lines 113–115. |

### lib/metrics/portfolio-metrics.ts (`app/lib/metrics/portfolio-metrics.ts`)

| Check | Status | Notes |
|-------|--------|-------|
| Empty properties → zeros and null ratio fields | PASS | Lines 42–59. |
| weightedCapRate = totalNoi / totalMarketValue | PASS | Line 107. |
| portfolioLtv = totalDebt / totalMarketValue | PASS | Line 108; `full_liability` uses full debt (lines 93–97). |
| portfolioCashOnCashReturn = (totalMonthlyCashFlow × 12) / totalCashInvested | PASS | Lines 109–110. |
| totalMonthlyRent / totalAnnualRent align with vacancy-adjusted NOI rent leg | PASS | Lines 81, 85; `analytics-math-policy.md` §3.4. |

### lib/benchmark-utils.ts (`app/lib/benchmark-utils.ts`)

| Check | Status | Notes |
|-------|--------|-------|
| getBenchmarkPct: marketRent ≤ 0 → 0 | PASS | Lines 58–60. |
| getBenchmarkLabel: abs(pct) &lt; 1 → “at market” | PASS | Lines 74–79. |
| Freshness: strict &lt; 60-day window (exclusive at boundary) | PASS | `isBenchmarkFreshAt` lines 27–35; `BENCHMARK_FRESHNESS_MAX_MS`. |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Payoff iteration shared across `generateAmortizationSchedule`, `getPayoffProjection`, `getMonthsToPayoffWithExtraStrict` | PASS | Same monthly interest / principal / balance update. |
| `getEffectiveBalance` and `getBalanceSource` staleness threshold | PASS | Both use 180-day lookback from “today”. |
| Rate as decimal ÷ 12 for monthly rate on mortgage records | PASS | `Number(mortgage.interestRate) / 12` in payoff/extra paths. |
| Metrics: dashboard, properties, portfolio summary, export, property metrics API use shared helpers + user `ownershipDisplayMode` | PASS | `computePortfolioMetrics` / `computePropertyMetrics` with `getEffectiveBalance` for debt inputs where applicable. |
| Analytics policy: strict API vs tolerance UI | PASS | Mortgage routes use `getPayoffProjection` only; `mortgage-tab-content.tsx` uses `getToleranceAwarePayoffProjection` for UI. |

## API and export surfaces (metrics-related)

| Surface | Role | Status |
|---------|------|--------|
| `app/app/api/portfolio/summary/route.ts` | `computePortfolioMetrics` with `getEffectiveBalance` rollups | Aligned with policy (all-in debt service from stored payments). |
| `app/app/api/properties/[id]/metrics/route.ts` | `computePropertyMetrics` + effective balance | Aligned. |
| `app/app/api/export/portfolio/route.ts` | `computePropertyMetrics`; CSV contract in `docs/reference/portfolio-csv-export.md` | Aligned; multi-lien effective balance sum documented. |
| `app/app/api/properties/[id]/mortgage/route.ts`, `.../mortgage/[mortgageId]/route.ts` | `serializeMortgage`: `getPayoffProjection` (strict) | Aligned with `analytics-math-policy.md` §3.7. |
| `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts` | `computePropertyMetrics` | Uses shared helper (deal analyzer consistency). |

## Tests reviewed (by path)

| Path | Role |
|------|------|
| `app/lib/metrics/property-metrics.test.ts` | Vacancy, proportional vs full_liability, null cap/LTV/cash-on-cash |
| `app/lib/metrics/portfolio-metrics.test.ts` | Empty portfolio, scaling, DSCR, weighted cap, full_liability debt |
| `app/lib/metrics/metrics-golden.test.ts` | Golden fixtures vs `ownership-metrics` policy |
| `app/lib/test/fixtures/metrics-golden.ts` | Canonical expected numbers and comments |
| `app/lib/amortization.test.ts` | Schedule edges, P&amp;I clamp, effective balance, payoff nulls, strict vs tolerance, extra-payoff helpers |
| `app/lib/benchmark-utils.test.ts` | Freshness boundary, getBenchmarkPct(·,0), eligibility states |

*This audit did not execute `npm run test`; conclusions follow static reading of sources.*

## Findings / recommendations

1. **FAIL (documentation):** `engineering-spec.md` §6 — see Medium finding; replace or banner with links to policy + `property-metrics.ts`.
2. **NOTE:** Process inventory and §2.4 benchmark wording — see Low findings; optional doc edits only.

## Changelog (audit scope)

- **2026-03-30:** Run 5. Scope: `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`; tests under `app/lib/metrics/*.test.ts`, `app/lib/amortization.test.ts`, `app/lib/benchmark-utils.test.ts`; policies `docs/policies/analytics-math-policy.md`, `docs/policies/ownership-metrics.md`; contracts `docs/reference/portfolio-csv-export.md`; API routes listed above; cross-check `docs/process/math-logic-audit.md`. No code changes.

## Evidence reviewed

- **Implementation:** `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`
- **Policies / contracts:** `docs/policies/analytics-math-policy.md`, `docs/policies/ownership-metrics.md`, `docs/process/math-logic-audit.md`, `docs/reference/portfolio-csv-export.md`, `docs/reference/engineering-spec.md` (§6 spot-check)
- **API routes:** `app/app/api/portfolio/summary/route.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/properties/[id]/metrics/route.ts`, `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts`, `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`
- **UI reference (payoff split):** `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (tolerance-aware vs strict)
- **Continuity:** [2026-03-30-math-logic-audit-4.md](2026-03-30-math-logic-audit-4.md) (Run 4)

## Risk & impact assessment

- **Medium (spec drift):** Relying on `engineering-spec.md` §6 for formulas could produce user-visible analytics errors if implemented literally.
- **Low (process/docs):** Incomplete inventory and informal “60 days” wording add review friction; code behavior is already documented precisely in `analytics-math-policy.md` §3.6 and `benchmark-utils.ts`.

## Recommendations (prioritized)

1. **Update or deprecate `engineering-spec.md` §6** — Point to `ownership-metrics.md`, `analytics-math-policy.md`, and `app/lib/metrics/*` as canonical, or replace the section with a short “see policies” stub.
2. **Extend `docs/process/math-logic-audit.md` §1.1** — Add strict/tolerance payoff helpers and benchmark eligibility exports; tighten §2.4 to “strictly within 60 full days (exclusive boundary).”
3. **Optional:** Add a one-line comment near `remainingAtTermEnd` rounding if API consumers need cent-level reconciliation (not required for this audit).

## Task candidates

- [ ] Replace or banner `docs/reference/engineering-spec.md` §6 with canonical policy links and/or remove obsolete formulas.
- [ ] Expand `docs/process/math-logic-audit.md` §1.1–§2.4 per recommendations above.

## Re-test checklist

- [ ] After any doc fix for engineering-spec §6, spot-check `computePropertyMetrics` / golden tests still match stated intent.
- [ ] After process doc edits, confirm §1.1 lists all exported payoff variants actually in `amortization.ts`.
- [ ] `npm run check` and `npm run test` when accompanying code or tests change (not applicable to this audit-only pass).

## Next trigger and cadence

- **Trigger:** Release with analytics/mortgage changes, quarterly, or pre-launch regression sweep.
- **Recommended next run:** Next significant change to `app/lib/metrics/`, `app/lib/amortization.ts`, or portfolio/mortgage API contracts; otherwise next calendar quarter.
