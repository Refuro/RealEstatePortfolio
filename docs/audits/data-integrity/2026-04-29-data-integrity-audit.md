# Data Integrity & Reconciliation Audit — 2026-04-29

## Executive summary

- **Overall health:** Core portfolio math stays centralized in `app/lib/metrics/` (`computePropertyMetrics`, `computePortfolioMetrics`), with ownership mode threaded through dashboard, portfolio summary APIs, CSV row metrics (`GET /api/export/portfolio`), and server payloads (`buildPortfolioSummaryPayload`). Policy intent in `docs/policies/ownership-metrics.md` (saved deals always **proportional**) remains reflected in `app/app/api/deals/route.ts` and `serializeDeal` in `app/app/api/deals/[id]/route.ts`.
- **Top risks:** (1) **Portfolio CSV + import** still omit rent-benchmark freshness and valuation timing fields present on `Property`, so spreadsheets and round-trips cannot reconcile with `docs/policies/analytics-math-policy.md` §3.6–§6; (2) **Mortgage milestone emails** use **tolerance-aware** payoff projection (`app/lib/mortgage-milestones.ts`) while mortgage API payloads expose **strict** `getPayoffProjection` (`app/app/api/properties/[id]/mortgage/route.ts`), diverging from the strict/tolerance disclosure rules in §3.7; (3) **Monthly digest** and **persisted snapshots** carry **proportional-only** cash flow while the dashboard adjusts trend display for **full liability** (`adjustSnapshotCashFlow`), so email/channel math can diverge from the live UI for affected users (`app/app/api/cron/monthly-digest/route.ts`, `app/lib/snapshots.ts`, `app/app/(app)/dashboard/page.tsx`).
- **Recommendation:** Treat CSV as a governed contract aligned with schema and analytics policies (extend columns and importer parity). Align user-visible payoff narratives with policy (disclose tolerance in milestone emails or switch milestone detection to strict payoff). Bring digest snapshots in line with display mode **or** add explicit proportional-only labeling in digest copy.

## Severity-ranked findings

### Critical

- None observed in this read-only review of representative paths. Previous audits did not uncover tenant-isolation flaws in sampled export/import handlers; this pass did not re-run security-focused code review beyond contract alignment.

### High

- None raised to Critical/High purely on reconciliation math—the main gaps are disclosure, channel parity, or offline completeness rather than silent wrong totals on the canonical dashboard aggregates for correctly scoped queries.

### Medium

- **CSV export/import missing benchmark freshness and valuation as-of.** `docs/policies/analytics-math-policy.md` §3.6–§6 require reconcilability of “Annual rent vs NOI,” benchmark freshness (`marketRentAsOf`), and cross-surface consistency. `GET /api/export/portfolio` emits headers through `LTV` only (`app/app/api/export/portfolio/route.ts`); corresponding import paths do not hydrate `marketRent`, `marketRentAsOf`, or `estimatedValueAsOf` from CSV. **Impact:** Export → spreadsheet → re-import loses rent-comparison staleness semantics and valuation dating; accountants cannot reconcile off-platform rows with in-app freshness UX.

- **Mortgage payoff date contract differs across product surfaces.** `docs/policies/analytics-math-policy.md` §3.7 distinguishes **strict** payoff (API/export) vs **tolerance-aware** UI with disclosure. Mortgage route handlers serialize `payoffProjection` via `getPayoffProjection` (`app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts`). Milestone notifications use `getToleranceAwarePayoffProjection` for “payoff within 5 years” detection and email detail lines (`app/lib/mortgage-milestones.ts` lines 84–100). Mortgage **workspace UI** intentionally uses tolerance helpers with local disclosure (`app/app/(app)/properties/[id]/mortgage-tab-content.tsx`). **Impact:** The **date quoted in milestone email** may not match strict API `payoffProjection.payoffDate` for marginal residual/near-term-end cases—a cross-channel reconciliation risk unless users understand tolerance.

- **Portfolio digest email skips display-mode correction for snapshot cash flow.** Cron maps `snapshot.monthlyCashFlow` directly with an explicit proportional-only comment (`app/app/api/cron/monthly-digest/route.ts` lines 145–148). Stored snapshots document proportional storage and `adjustSnapshotCashFlow` for full liability (`app/lib/snapshots.ts` lines 39–40, 145–165). Dashboard applies adjustment when plotting (`adjustSnapshotCashFlow` usage from `dashboard/page.tsx`). **Impact:** Digest subscribers in **full liability** mode see email metrics that intentionally diverge from historical chart math.

- **`GET /api/deals/[id]` vs `PATCH /api/deals/[id]` response asymmetry persists.** Successful `GET` includes `portfolioContext` from `toDealPortfolioContext` (`route.ts` lines 122–127). Successful `PATCH` returns only `serializeDeal(deal)` (lines 204–205). **Impact:** Clients that merge PATCH responses without refetch lose portfolio comparisons and can silently drift versus GET.

### Low

- **Multi-mortgage CSV re-import stays lossy** for more than one lien—documented in `docs/reference/portfolio-csv-export.md` (§Round-trip vs lossy matrix); implementation still aligns with at-most-one mortgage per CSV row (`app/app/api/import/portfolio/route.ts` pattern per prior audits).

- **CSV `display mode` column is informational.** Exporter writes the user’s `ownershipDisplayMode` per row (`app/app/api/export/portfolio/route.ts`); importer does not read it into settings (no handling in `app/lib/import/csv-parser.ts`). **Impact:** Spreadsheet readers may assume import restores liability lens; exported numeric columns merely reflect exporter-time mode.

## Evidence reviewed

- Process: `docs/process/data-integrity-audit-process.md`, `docs/process/audit-report-template.md`
- Policies: `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`
- Architecture: `docs/architecture-and-build-practices.md` §2.2, CSV pointer
- Contracts: `docs/reference/portfolio-csv-export.md`
- Metrics: `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`
- Server payloads: `app/lib/server/portfolio-summary-payload.ts`
- APIs: `app/app/api/portfolio/summary/route.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/export/portfolio-summary/route.ts`, `app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`, `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts`
- Snapshots/dashboard/digest: `app/lib/snapshots.ts`, `app/app/(app)/dashboard/page.tsx`, `app/app/api/cron/monthly-digest/route.ts`
- Payoff divergence: `app/lib/amortization.ts` (strict vs tolerance APIs), `app/lib/mortgage-milestones.ts`, `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`

**Limits:** Static codebase review only (no DB samples, no production traffic); not every API route enumerated.

## Risk & impact assessment

- CSV gaps hurt **operators and accountants** who depend on spreadsheet continuity and staleness cues; likelihood is **high among power export users**.
- Payoff mismatch between email and API/UI **strict** date is **episodic** (edge cases near term-end tolerances) but undermines trust in “one payoff truth.”
- Digest vs dashboard affects **digest subscribers × full-liability mode**—smaller cohort but high confusion if unexplained.

## Recommendations (prioritized)

1. Extend **portfolio CSV** (and importer) with `marketRent`, `marketRentAsOf`, and `estimatedValueAsOf`, updating `docs/reference/portfolio-csv-export.md` in lockstep with `docs/policies/analytics-math-policy.md` §3.6–§6.
2. Resolve **payoff divergence** for milestones: either use strict `getPayoffProjection` in `mortgage-milestones.ts`, or keep tolerance but add concise email/disclosure lines pointing to tolerance semantics per §3.7 so dates reconcile with expectations when users compare email to API/UI.
3. **Digest alignment:** Apply `adjustSnapshotCashFlow` with user `ownershipDisplayMode` and snapshot fields, **or** add digest-specific copy stating cash flow uses proportional liability semantics only.

## Task candidates

- [ ] Add benchmark and value-as-of columns to portfolio CSV + import parity with `Property`.
- [ ] Align mortgage milestone payoff messaging with §3.7 (strict projection or disclosed tolerance parity with API/UI).
- [ ] Return `portfolioContext` on successful `PATCH /api/deals/[id]` or document required refetch contract for API consumers.
- [ ] Digest: reconcile cash flow figures with ownership display mode or label channel limitations.

## Re-test checklist

- [ ] After CSV/import changes: round-trip preserves new columns; `npm run check` plus import route tests if touched.
- [ ] After payoff/milestone alignment: regression tests in `app/lib/mortgage-milestones.test.ts` / cron milestones.
- [ ] After digest change: fixture user in full-liability mode vs dashboard trend check.
- [ ] `npm run check` after any implementation work.

## Next trigger and cadence

- **Trigger:** Quarterly, or whenever `Property`/CSV contract, snapshot pipeline, amortization payoff rules, or ownership policies change materially.
- **Recommended next run:** After Q2 2026 import/export milestone or before a major CSV contract revision.
