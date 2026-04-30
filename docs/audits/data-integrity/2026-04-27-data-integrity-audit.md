# Data Integrity & Reconciliation Audit — 2026-04-27

## Executive summary

- **Overall health:** Architecture matches `docs/architecture-and-build-practices.md`: portfolio math is centralized in `app/lib/metrics/`; `buildPortfolioSummaryPayload` and `GET /api/portfolio/summary` honor `User.ownershipDisplayMode`; `GET /api/export/portfolio` uses the same `computePropertyMetrics` inputs with the user’s display mode. Saved deals continue to serialize metrics with **`proportional`** only, per `docs/policies/ownership-metrics.md` §5. Mortgage APIs use strict `getPayoffProjection` for `payoffProjection`; the mortgage workspace documents tolerance vs strict behavior inline.
- **Top risks:** Portfolio **CSV export/import** still omits benchmark and value-as-of fields that exist on `Property`, breaking offline reconciliation with `docs/policies/analytics-math-policy.md` §3.6 and value snapshot dating. **Monthly digest** email and **stored snapshots** use proportional `monthlyCashFlow` only at the source; full-liability users can see digest figures that diverge from dashboard trend lines (dashboard applies `adjustSnapshotCashFlow`). **`PATCH /api/deals/[id]`** returns a slimmer body than **`GET`**, dropping `portfolioContext` and risking client state drift.
- **Recommendation:** Treat CSV as a first-class contract with the Prisma `Property` model and policies (extend `docs/reference/portfolio-csv-export.md` when adding columns). For any channel that surfaces snapshot cash flow to full-liability users, either reuse `adjustSnapshotCashFlow` with persisted `ownershipPct` / `monthlyPayment` or document proportional-only email copy prominently. Align `PATCH` deal responses with `GET` or document that clients must refetch.

## Severity-ranked findings

### Critical

- None identified in this pass. Reviewed export/import and deal routes use auth and user scoping consistent with architecture notes; no cross-tenant data pattern surfaced in sampled paths.

### High

- None identified. Dashboard snapshot trends apply `adjustSnapshotCashFlow` where the live UI needs full-liability alignment (`app/app/(app)/dashboard/page.tsx`); stored snapshot creation remains proportional by design (`app/lib/snapshots.ts`).

### Medium

- **CSV round-trip drops benchmark and value-as-of context.** `Property` includes `marketRent`, `marketRentAsOf`, and `estimatedValueAsOf` (`app/prisma/schema.prisma`), but `GET /api/export/portfolio` headers/rows end at `LTV` and omit those fields (`app/app/api/export/portfolio/route.ts`). `POST /api/import/portfolio` `property.create` does not set them (`app/app/api/import/portfolio/route.ts`), and `app/lib/import/csv-parser.ts` has no mapping for these columns (confirmed via search). **Risk/impact:** Exported spreadsheets and re-imported portfolios cannot preserve rent-benchmark freshness semantics (`docs/policies/analytics-math-policy.md` §3.6) or value as-of dating; off-platform data no longer reconciles with in-app “fresh vs stale” UX.

- **Multi-mortgage properties remain lossy on CSV re-import.** Importer creates at most one `Mortgage` per imported row. **Risk/impact:** After import, total debt service and balances may not match multi-lien exports unless users add liens in-app. **Evidence:** `docs/reference/portfolio-csv-export.md` (Round-trip vs lossy matrix); `app/app/api/import/portfolio/route.ts` (single `mortgage.create` branch).

- **`GET /api/deals/[id]` vs `PATCH /api/deals/[id]` response shape asymmetry.** `GET` returns `serializeDeal(deal)` plus `portfolioContext` from `buildPortfolioSummaryPayload` / `toDealPortfolioContext`; `PATCH` returns only `serializeDeal(deal)` (`app/app/api/deals/[id]/route.ts`). **Risk/impact:** Clients that merge PATCH responses without refetch lose portfolio context and can show stale or missing comparison data.

- **Monthly digest uses stored proportional `monthlyCashFlow` only.** Cron maps `monthlyCashFlow: Number(snapshot.monthlyCashFlow)` with an explicit comment that batch email does not apply `ownershipDisplayMode` (`app/app/api/cron/monthly-digest/route.ts`). **Risk/impact:** Full-liability users may see email cash flow figures that do not match dashboard trend math; cross-channel reconciliation depends on users understanding the intentional gap.

### Low

- **CSV `display mode` column is informational on export only.** Export duplicates the user’s `ownershipDisplayMode` on each row; import does not read this column into account settings (no matches in `app/lib/import`). **Risk/impact:** Low—column clarifies how numeric columns were computed—but spreadsheet users might assume re-import restores display mode.

- **Two independent “staleness” concepts.** Benchmark freshness uses a strict 60-day window (`app/lib/benchmark-utils.ts`, aligned with `docs/policies/analytics-math-policy.md` §3.6) while `isDataStale` in `app/lib/date-utils.ts` uses six months for generic property data. **Risk/impact:** Operators or future copy could conflate “stale benchmark” with “stale property data.”

## Evidence reviewed

- Policies: `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`
- Architecture: `docs/architecture-and-build-practices.md` (§2.2 single source of truth, CSV reference pointer)
- CSV contract: `docs/reference/portfolio-csv-export.md`
- Schema: `app/prisma/schema.prisma` (`Property`, `PropertySnapshot`, `Mortgage`)
- Export/import: `app/app/api/export/portfolio/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/lib/import/csv-parser.ts`
- Portfolio API: `app/app/api/portfolio/summary/route.ts`, `app/lib/server/portfolio-summary-payload.ts`
- Deals API: `app/app/api/deals/[id]/route.ts`
- Snapshots & dashboard reconciliation: `app/lib/snapshots.ts`, `app/app/(app)/dashboard/page.tsx`
- Digest: `app/app/api/cron/monthly-digest/route.ts`, `app/lib/digest.ts`
- Payoff strict vs tolerance: `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`, `app/lib/amortization.ts`

**Assumptions / limits:** Read-only audit of representative surfaces; no runtime DB inspection, no exhaustive enumeration of every API route. Client behavior for PATCH deals was not traced in frontend code.

## Risk & impact assessment

- **Unresolved CSV gaps** mainly hurt users who rely on export → spreadsheet → re-import or accountant handoff: they lose benchmark and valuation timing metadata, which can mislead rent-vs-market and “how current is this row?” judgments.
- **Digest vs dashboard** affects a subset (full-liability mode + digest subscribers) but erodes trust if numbers disagree without clear product copy.
- **PATCH deals** impact depends on client implementation; risk is moderate for any optimistic UI that replaces local state from PATCH alone.

Likelihood: CSV and multi-mortgage issues are **frequent** for power users; digest mismatch is **conditional** on mode and subscription behavior.

## Recommendations (prioritized)

1. **Extend portfolio CSV** to include `marketRent`, `marketRentAsOf`, and `estimatedValueAsOf` (and teach the importer to parse and persist them), updating `docs/reference/portfolio-csv-export.md` in lockstep so `docs/policies/analytics-math-policy.md` §6 reconciliation holds for exports.
2. **Either** include `portfolioContext` on successful `PATCH /api/deals/[id]` (matching `GET`) **or** document in API consumer guidance that clients must refetch after PATCH; prefer parity to prevent silent drift.
3. **Digest channel:** Apply `adjustSnapshotCashFlow` using snapshot `ownershipPct` and `monthlyPayment` plus the user’s `ownershipDisplayMode`, **or** add concise email copy that monthly cash flow is shown on a proportional liability basis only.

## Task candidates

- [ ] Add benchmark and value-as-of columns to portfolio CSV export and import (`marketRent`, `marketRentAsOf`, `estimatedValueAsOf`).
- [ ] Return `portfolioContext` from `PATCH /api/deals/[id]` or publish a breaking-change note and update clients to refetch.
- [ ] Reconcile monthly digest cash flow with display mode (code or explicit user-facing disclaimer).
- [ ] (Optional) Document or unify “staleness” vocabulary across benchmark vs generic property data surfaces.

## Re-test checklist

- [ ] After CSV changes: export → import round-trip preserves new columns; `npm run check` and targeted tests for `lib/import`.
- [ ] After deals PATCH change: contract test or E2E that GET and PATCH shapes match for `portfolioContext`.
- [ ] After digest change: spot-check full-liability test user vs dashboard totals.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Quarterly, after material changes to `Property` schema, CSV contract, snapshot pipeline, or ownership/metrics policies.
- **Recommended next run:** 2026-07-27 or next release touching import/export or digest.
