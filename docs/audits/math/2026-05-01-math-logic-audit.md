# Math & Logic Audit — 2026-05-01

## Executive summary

- **Core libraries** (`app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/benchmark-utils.ts`) match canonical iteration rules, division guards, and `docs/policies/ownership-metrics.md` / `analytics-math-policy.md` where those modules are authoritative.
- **New issues on this pass** are mainly **basis and horizon mismatches**: the dashboard scales **property value** (and MoM deltas) by ownership while the inline ownership explainer says value is property-level; **payment-start lag** (`getPaymentStartLagMonths`) is applied in payoff/refinance paths in `amortization.ts` but omitted from **mortgage tab simulation** (`simulateMortgage` / `getRemainingTermMonths`) and **projection loan series** (`buildSimMortgages` / `getRemainingTermMonths`).
- **Carried Medium item:** milestone generation still uses **`getToleranceAwarePayoffProjection`** without guaranteed disclosure outside the mortgage workspace banner.
- **Recommendation:** Align dashboard value semantics with ownership copy (or revise copy/column labels); add lag to UI projection horizons where amortization payoff uses it; tighten milestone/email disclosure for tolerance-derived dates.

---

## Severity-ranked findings

### Critical

- None identified.

### High

- None identified. (Mortgage-tab `simulateMortgage` starts from **`effectiveBalance`** via `toMortgageRecordLike`, so stale-balance divergence vs `getEffectiveBalance` is bridged server-side—not a raw `currentBalance` bug.)

### Medium

- **Dashboard “property value” row vs ownership explainer contradict** — **`app/app/(app)/dashboard/page.tsx`** sets **`value: pInput.estimatedValue * scale`** on table rows (**~253–255**), scales **chart `debtVsValue`** (**~188–193**), and scales **MoM value deltas** (**~239–243**). The same surface states that **property value … are property-level** (**~742** per policy chip). **`docs/policies/ownership-metrics.md` §2** fixes **display value as full `V`**. Users with partial ownership see a scaled “value” under copy that denies scaling.
- **`getPaymentStartLagMonths` omitted in mortgage/workspace simulation horizon** — **`getPayoffProjection`** (**`app/lib/amortization.ts`** **~406–407**) caps iterations with **`+ lagMonths`**; **`simulateMortgage`** in **`app/app/(app)/properties/[id]/mortgage-tab-content.tsx`** (**`getRemainingTermMonths`** **~78–88**) uses **`termYears × 12 − monthsSinceStart`** **without lag**. Charts / interest-saved deltas can truncate **up to ~2 months** sooner than payoff primitives for typical mid-month closes.
- **`getPaymentStartLagMonths` omitted in property projections loan series** — **`buildSimMortgages`** (**`projections-tab-content.tsx`** **~141**) sets **`remainingTermMonths: getRemainingTermMonths(m.startDate, m.termYears)`** with the same no-lag formula. **`projectLoanSeriesByMonth`** (**~147–201**) drives debt balances and amortized-leg cash flow tooling; horizon skew vs **`getPayoffProjection`** has the same class of impact as the mortgage tab.

### Low

- **Tolerance-aware payoff in milestone detector** — **`app/lib/mortgage-milestones.ts`** (**~62**, **~129**) uses **`getToleranceAwarePayoffProjection`**. **`analytics-math-policy.md` §3.7** expects disclosure when tolerance affects user-visible outcomes; email/in-product milestone copy (**`details`** **~144**) shows a concrete date **without stating end-of-term tolerance** (unless covered elsewhere downstream—**not verified** in templates this pass).
- **`projectStoredBalanceForward` vs schedule ε** — Negative-amort bailout uses **`pi <= interest`** (**`app/lib/amortization.ts`** **~184–185**) while schedules use **`payment + ε < interest`**. Divergence limited to **`pi ≈ interest`** rounding bands (same observation as prior audit; re-confirmed in current file).
- **Process doc drift** — **`docs/process/math-logic-audit.md` §2.2** still sketches legacy **full_liability / proportional** wording; **`ownership-metrics.md`** is authoritative (single proportional basis). **`§2.1 getBalanceSource`** shorthand vs three-tier return type remains underspecified in the process doc.

---

## Evidence reviewed

| Area | Paths |
|------|--------|
| Amortization, refinance | `app/lib/amortization.ts`, `app/lib/amortization.test.ts` |
| Property / portfolio metrics | `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/metrics/*.test.ts`, `app/lib/metrics/metrics-golden.test.ts` |
| Benchmarks | `app/lib/benchmark-utils.ts` |
| RentCast hourly caps (process §1.1) | `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`, `getRentCastHourlyLimit`) |
| API / export | `app/app/api/export/portfolio/route.ts`, `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/metrics/route.ts` |
| UI consumers (sampling) | `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`, `app/app/(app)/properties/[id]/projections-tab-content.tsx` |
| Milestones | `app/lib/mortgage-milestones.ts` |
| Policies / process | `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/process/math-logic-audit.md`, `docs/process/audit-report-template.md` |

**Limits:** Read-only review—no `npm run check`, no runtime numeric fixtures beyond what tests imply. Not every financial component was opened; focus was metrics/amortization contracts and high-traffic surfaces.

---

## Risk & impact assessment

- **Medium (dashboard value):** Partial owners may misread **portfolio value** and **sorting** as full asset value, or conversely read the explainer and distrust the table—decision quality and trust.
- **Medium (lag horizon):** Shorter simulated horizons skew **payoff charts**, **interest saved**, and **projection loan balances** vs strict amortization payoff used in API routes—usually a small month count but material near term-end.
- **Low (milestones):** Tol-adjusted payoff dates in notifications without disclosure weakens alignment with **`analytics-math-policy.md`** §3.7.

---

## Recommendations (prioritized)

1. **Reconcile dashboard value column** with **`ownership-metrics.md`**: show **full `V`** where copy promises property-level, or change labels/explainer to “your economic stake in asset value” and document the rollup purpose (total row already uses **`computePortfolioMetrics`** semantics).
2. **Unify remaining-term math** between **`getRemainingTermMonths`** (projections / mortgage tab) and **`getPayoffProjection`** by incorporating **`getPaymentStartLagMonths`** (or sharing one helper).
3. **Document or tighten** **`projectLoanSeriesByMonth`** negative-amort branch (**`projections-tab-content.tsx`** **~186–190**) vs canonical empty-schedule behavior so projection vs summary metrics stays explainable.
4. Add **tolerance disclosure** to mortgage milestone payloads or switch detection to **`getPayoffProjection`** if marketing requires strict payoff claims.

---

## Task candidates

- [ ] Fix dashboard **`PropertyTableRow.value`** / **`debtVsValue` chart value** / **value MoM deltas** to match **`ownership-metrics.md`** (full **V**) or update chip copy and headers to describe scaled semantics consistently.
- [ ] Add **`getPaymentStartLagMonths`** to **`getRemainingTermMonths`** in **`mortgage-tab-content.tsx`** and **`projections-tab-content.tsx`** (requires passing a **`MortgageRecord`**-like shape or duplicating lag inputs consistently).
- [ ] Extend mortgage milestone **`details`/email** copy when **`getToleranceAwarePayoffProjection`** supplies **`toleranceApplied`**, or use strict payoff for milestone eligibility.
- [ ] Refresh **`docs/process/math-logic-audit.md` §2.1–2.2** for three-tier balance source and single proportional cash-flow contract.

---

## Re-test checklist

- [ ] After dashboard value fix: spot-check **50% ownership** property—table, chart, detail card, export.
- [ ] After lag change: compare **mortgage tab** payoff month vs **`/api/.../mortgage`** **`payoffProjection`** for a mid-month close fixture.
- [ ] `npm run check` when application code changes land.

---

## Next trigger and cadence

- **Trigger:** Edits to **`app/lib/amortization.ts`**, **`app/lib/metrics/*`**, **`benchmark-utils.ts`**, **`plans.ts`**, or any new projection/payoff UI.
- **Suggested next run:** Next monthly math lane or before a mortgage/modeling release.

---

## Module results

### `app/lib/amortization.ts`

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` interest / principal / balance | PASS | Matches §2.1; ε rejects sub-interest payment; row rounding 2dp |
| `getPayoffProjection` iteration vs schedule | PASS | Same interest, principal cap, ε guard |
| `getEffectiveBalance` / `getBalanceSource` 180-day window | PASS | Aligned; source has third tier **`stored_projected`** (process doc shorthand only) |
| Edge: zero balance / zero payment → null projection | PASS | **~391–393** |
| Edge: negative amort at start | PASS | Returns **no payoff date**; **`remainingAtTermEnd`** uses rounded effective balance (field name “term end” imprecise—Low doc nuance) |
| `getPiForAmortization` escrow clamp | PASS | **`Math.max(0.01, pi)`** when escrow |
| `getProjectedBalanceAsOf` before start | PASS | Returns **0** |
| `getMonthsToPayoffWithExtraStrict` vs payoff loop | PASS | Same structure as **`getPayoffProjection`** |
| `getRefinanceProjection` rate / interest loops | PASS | Uses **`getEffectiveBalance`**, ε on current loan leg |
| Cross: `getPaymentStartLagMonths` in payoff/extra/refi | PASS | Present (see Medium: UI horizons omit it) |

### `app/lib/metrics/property-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Effective rent × 12 × scale vs NOI / cash flow | PASS | Aligns with **`ownership-metrics.md`** proportional basis |
| Cap rate **`noi/full V`** when **`estimatedValue > 0`** | PASS | Property-level cap rate invariant |
| LTV **`D/V`** ownership-unscaled | PASS | |
| CoC denominator guard | PASS | **`cashInvested` null/zero → null** (**~94–96**) |

### `app/lib/metrics/portfolio-metrics.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Empty list | PASS | **Zeros / nulls** (**~40–57**) |
| **`totalAnnualRent`** sum of **`grossAnnualRent`** from helper | PASS | Matches **analytics §3.4** vacancy-adjusted basis |
| **`weightedCapRate`** / **`portfolioLtv`** | PASS | Division guards |
| **`portfolioCashOnCashReturn`** | PASS | **`(totalMonthlyCashFlow × 12) / totalCashInvested`** |

### `app/lib/benchmark-utils.ts`

| Check | Status | Notes |
|-------|--------|-------|
| Freshness **`now - asOf < 60 × 86400000 ms`** | PASS | Matches **analytics §3.6** |
| **`getBenchmarkPct`** | PASS | **`marketRent <= 0 → 0`** |
| **`getBenchmarkTone` / Label** `< 1%` neutral | PASS | |

### RentCast quotas (`app/lib/plans.ts`)

| Check | Status | Notes |
|-------|--------|-------|
| Tier constants **5 / 10 / 20** | PASS | **`RENTCAST_HOURLY_LIMITS`** (**~26–29**) |

---

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Schedule vs payoff iteration | PASS | Shared logic pattern + ε |
| `getEffectiveBalance` vs `getBalanceSource` window | PASS | Same **180**-day cutoff |
| Rate as decimal **`/12`** | PASS | Consumers use **`Number(rate)/12`** |
| API/export strict payoff (**`analytics-math-policy` §3.7**) | PASS | **`getPayoffProjection`** on **`app/app/api/properties/[id]/mortgage/route.ts`**, **`mortgage/[mortgageId]/route.ts`** |
| **`simulateMortgage` / projections** horizon vs payoff | FAIL | **`lagMonths`** not applied (**Medium** findings) |

---

## Findings summary (concise)

| ID | Severity | Topic | Evidence |
|----|----------|--------|----------|
| M1 | Medium | Ownership copy vs scaled dashboard value/chart/MoM | `dashboard/page.tsx` |
| M2 | Medium | Simulation/projection **`remainingTermMonths`** omits **`getPaymentStartLagMonths`** | `mortgage-tab-content.tsx`, `projections-tab-content.tsx` vs `amortization.ts` |
| M3 | Low | Milestone payoff dates tolerance disclosure | `mortgage-milestones.ts` |

---

## Changelog (audit scope)

- **2026-05-01:** Independent re-read of current **`app/`** math modules and sampled UI/API/export; report written per **`docs/process/audit-report-template.md`** plus module tables per **`docs/process/math-logic-audit.md`** §7.
