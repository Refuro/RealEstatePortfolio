# Data Integrity & Reconciliation Audit — 2026-04-30

## Executive summary

- **Overall health:** Portfolio and property metrics remain centralized in `app/lib/metrics/` (`computePropertyMetrics`, `computePortfolioMetrics`), with `totalAnnualRent` aligned to the same vacancy-adjusted gross rent basis as NOI (`app/lib/metrics/portfolio-metrics.ts` comments and implementation). The **single proportional ownership basis** described in `docs/policies/ownership-metrics.md` (changelog 2026-04-30: display-mode toggle and `ownershipDisplayMode` removed) matches live code: no `adjustSnapshotCashFlow`, no `ownershipDisplayMode` outside historical migrations (`app/prisma/migrations/20260429180000_drop_user_ownership_display_mode/migration.sql`).
- **Top risks:** (1) **Portfolio CSV round-trip** still omits rent-benchmark and valuation timing fields that exist on `Property` (`marketRent`, `marketRentAsOf`, `estimatedValueAsOf` per `app/prisma/schema.prisma`), weakening reconciliation with `docs/policies/analytics-math-policy.md` §3.6–§6; importer has **no** parsing for those columns (`app/lib/import/csv-parser.ts` — no matches for `marketRent` / `estimatedValueAsOf`). (2) **Mortgage milestone emails** still use **tolerance-aware** payoff (`getToleranceAwarePayoffProjection` in `app/lib/mortgage-milestones.ts` lines 84–100) while mortgage APIs use strict `getPayoffProjection`, per §3.7 risk called out in the prior audit. (3) **Documentation and inline comments** still reference **full-liability** re-derivation and verification **modes** that the product no longer exposes (`docs/policies/analytics-math-policy.md` §8; `app/lib/snapshots.ts`, `app/lib/cash-flow-improvement.ts`, `app/prisma/schema.prisma` snapshot comments).
- **Recommendation:** Extend CSV + importer for benchmark and value-as-of columns and refresh `docs/reference/portfolio-csv-export.md` alongside policy §3.6–§6. Align milestone payoff messaging with §3.7 (strict parity or explicit tolerance disclosure). Sweep canonical docs and schema/code comments for obsolete liability-mode language so future changes do not reintroduce split-brain semantics.

## Severity-ranked findings

### Critical

- None observed in this static review (tenant isolation and auth patterns were not re-audited beyond sampled export/import and summary paths).

### High

- None elevated to High this pass; remaining gaps are spreadsheet completeness, episodic payoff-date divergence, and documentation drift rather than silent wrong dashboard aggregates for scoped queries.

### Medium

- **CSV export/import missing benchmark freshness and valuation as-of.** `Property` stores `marketRent`, `marketRentAsOf`, and `estimatedValueAsOf` (`app/prisma/schema.prisma`). `GET /api/export/portfolio` headers end at `LTV` only (`app/app/api/export/portfolio/route.ts` lines 63–95). Importer does not hydrate those fields from CSV (`app/lib/import/csv-parser.ts`). **Impact:** Export → spreadsheet → re-import loses staleness semantics (`docs/policies/analytics-math-policy.md` §3.6) and valuation dating; offline rows cannot reconcile with in-app freshness UX.

- **Mortgage payoff date contract differs across channels.** Milestone detection uses `getToleranceAwarePayoffProjection` (`app/lib/mortgage-milestones.ts`). Mortgage route handlers expose strict payoff via `getPayoffProjection` (pattern unchanged from prior audit: `app/app/api/properties/[id]/mortgage/route.ts`, nested mortgage route). **Impact:** Milestone email payoff dates can disagree with strict API `payoffProjection` near tolerance boundaries unless users understand tolerance semantics §3.7.

- **Canonical verification matrix contradicts current product.** `docs/policies/analytics-math-policy.md` §8 still requires verification across **Modes: `proportional`, `full_liability`**, but ownership policy (2026-04-30) retired the liability lens and `ownershipDisplayMode`. **Impact:** Engineers following §8 literally will search for behavior that no longer exists; acceptance criteria risk confusion or false regressions.

### Low

- **Portfolio CSV has no explicit annual rent column.** Policy §3.4 ties portfolio “Annual rent” to vacancy-adjusted annual rent consistent with NOI. Per-row CSV includes `NOI` and flow metrics but not a dedicated gross annual rent column, so spreadsheet reconciliation requires derivation rather than direct column parity with API field `totalAnnualRent` (`buildPortfolioSummaryPayload` / `computePortfolioMetrics`).

- **Stale “full-liability” wording in code and schema comments.** `SnapshotData` and Prisma snapshot comments describe `monthlyPayment` as needed to “re-derive full-liability cash flow” (`app/lib/snapshots.ts` lines 49–50; `app/prisma/schema.prisma` companion comment). `app/lib/cash-flow-improvement.ts` line 12 describes snapshot cash flow as “full-liability scaled.” With proportional-only semantics, these comments misstate the stored basis and can mislead maintainers.

- **Portfolio CSV reference doc aging.** `docs/reference/portfolio-csv-export.md` last updated 2026-04-01 and does not document the above benchmark/value-as-of gaps or post–display-mode ownership semantics.

## Resolved / superseded (since 2026-04-29 audit)

- **Monthly digest vs dashboard display mode:** Prior finding that digest used proportional-only snapshots while dashboard adjusted for full liability is **obsolete**: `ownershipDisplayMode` removed from `User`, no `adjustSnapshotCashFlow` in the codebase, digest maps stored `monthlyCashFlow` directly (`app/app/api/cron/monthly-digest/route.ts` lines 137–149).

- **`PATCH /api/deals/[id]` vs `GET` response asymmetry:** Successful `PATCH` now returns `portfolioContext` from `toDealPortfolioContext` together with `serializeDeal(deal)` (`app/app/api/deals/[id]/route.ts` lines 201–204), aligning with `GET`.

## Evidence reviewed

- Process: `docs/process/data-integrity-audit-process.md`, `docs/process/audit-report-template.md`
- Policies: `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`
- Architecture pointer: `docs/architecture-and-build-practices.md` §2.2
- Reference: `docs/reference/portfolio-csv-export.md`
- Schema: `app/prisma/schema.prisma` (Property, snapshot fields)
- Metrics: `app/lib/metrics/portfolio-metrics.ts`, `app/lib/metrics/property-metrics.ts` (sampled)
- Payloads/APIs: `app/lib/server/portfolio-summary-payload.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/export/portfolio-summary/route.ts`, `app/app/api/deals/[id]/route.ts`, `app/app/api/cron/monthly-digest/route.ts`
- Import: `app/lib/import/csv-parser.ts`
- Milestones: `app/lib/mortgage-milestones.ts`
- Grep: `ownershipDisplayMode`, `adjustSnapshotCashFlow`, `full_liability` across `app/`

**Limits:** Static review only (no production DB samples or traffic); not every API route enumerated.

## Risk & impact assessment

- CSV gaps affect **power users and accountants** relying on spreadsheet continuity; likelihood remains **high among heavy export users**.
- Payoff tolerance divergence is **infrequent** but damages trust when email dates are compared to strict API values.
- Doc/comment drift is **low immediate user impact** but raises **implementation error risk** on the next analytics or snapshot change.

## Recommendations (prioritized)

1. Add **`marketRent`, `marketRentAsOf`, `estimatedValueAsOf`** (and documented CSV headers) to portfolio export and import, updating `docs/reference/portfolio-csv-export.md` in lockstep with `docs/policies/analytics-math-policy.md` §3.6–§6.
2. Resolve **milestone vs API payoff**: use strict `getPayoffProjection` in `mortgage-milestones.ts`, or retain tolerance with explicit email disclosure per §3.7.
3. Update **`docs/policies/analytics-math-policy.md` §8** (and any linked task acceptance text) to remove `full_liability` mode checks and reflect single proportional semantics; align **schema/lib comments** that still say “full-liability.”

## Task candidates

- [ ] Portfolio CSV + import: benchmark and value-as-of columns with round-trip tests.
- [ ] Mortgage milestones: strict payoff or disclosed tolerance parity with mortgage API §3.7.
- [ ] Docs/comments sweep: analytics §8 verification matrix; `snapshots.ts`, `cash-flow-improvement.ts`, Prisma snapshot comments; refresh CSV reference “last updated.”

## Re-test checklist

- [ ] After CSV/import changes: round-trip preserves new columns; `npm run check` and import route coverage if touched.
- [ ] After milestone alignment: tests in `app/lib/mortgage-milestones.test.ts` (or equivalent) for date contract.
- [ ] After doc-only changes: spot-check §8 against repo grep for removed symbols.
- [ ] `npm run check` after any implementation work.

## Next trigger and cadence

- **Trigger:** Quarterly, or whenever Property/CSV contracts, snapshot pipeline, amortization payoff rules, or ownership policies change materially.
- **Recommended next run:** After CSV contract extension or next amortization/milestone change.
