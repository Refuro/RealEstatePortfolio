# Data Integrity & Reconciliation Audit — 2026-04-09

## Executive summary

- **Overall health:** Prisma models, migrations, and layered flow (UI → API → `lib/` → Prisma) match `docs/architecture-and-build-practices.md`. Portfolio math is centralized in `app/lib/metrics/`; `buildPortfolioSummaryPayload` and `GET /api/export/portfolio` both honor `User.ownershipDisplayMode`. Saved deals serialize metrics with **`proportional`** only, per `docs/policies/ownership-metrics.md` §5.
- **Top risks:** CSV export/import omits benchmark and value-as-of fields that exist on `Property`, so offline round-trip loses freshness semantics from `docs/policies/analytics-math-policy.md` §3.6. Multi-mortgage rows remain lossy on re-import (documented). **Monthly digest** email uses stored snapshot cash flow in **proportional** form only and does not apply `ownershipDisplayMode`, so full-liability users may see digest numbers that do not match the dashboard trend line.
- **Recommendation:** Treat CSV column parity with `Property` as a first-class contract (extend `docs/reference/portfolio-csv-export.md` when adding columns). For any new consumer of `PropertySnapshot`, reuse `adjustSnapshotCashFlow` or document intentional proportional-only copy. Run the analytics verification matrix (`docs/policies/analytics-math-policy.md` §8) when touching metrics, export, import, or snapshot code.

## Severity-ranked findings

### Critical

- None identified. No evidence of cross-tenant data access in reviewed routes; financial fields are validated on write paths audited below.

### High

- None identified in this pass after verifying dashboard snapshot trends. A prior gap (stored snapshot cash flow vs full-liability live UI) is **mitigated on the dashboard** via `adjustSnapshotCashFlow` and persisted `ownershipPct` / `monthlyPayment` on `PropertySnapshot` (see Medium items for remaining surface gaps).

### Medium

- **CSV round-trip drops benchmark and value-as-of context.** `Property` includes `marketRent`, `marketRentAsOf`, and `estimatedValueAsOf` (`app/prisma/schema.prisma`), but `GET /api/export/portfolio` headers/rows omit them and `POST /api/import/portfolio` does not set them on `property.create` — **risk/impact:** Exported spreadsheets and re-imported portfolios cannot preserve rent-benchmark freshness (`docs/policies/analytics-math-policy.md` §3.6) or value snapshot dating; reconciliation with in-app “fresh vs stale” UX breaks off-platform — **evidence:** `app/app/api/export/portfolio/route.ts` (header list and row cells through `LTV`); `app/app/api/import/portfolio/route.ts` (`property.create` `data` object); `app/lib/import/csv-parser.ts` (no `marketRentAsOf` / `estimatedValueAsOf` mapping in reviewed file).

- **Multi-mortgage properties are lossy on CSV re-import.** Importer creates at most one `Mortgage` per row — **risk/impact:** Debt service and balances after import will not match multi-lien exports unless users add liens in-app — **evidence:** `docs/reference/portfolio-csv-export.md` (Round-trip vs lossy matrix); `app/app/api/import/portfolio/route.ts` (single `mortgage.create` branch).

- **`GET /api/deals/[id]` vs `PATCH /api/deals/[id]` response shape asymmetry.** GET returns `portfolioContext` from `buildPortfolioSummaryPayload`; PATCH returns only `serializeDeal(deal)` — **risk/impact:** Clients that merge PATCH responses without refetch may drop portfolio context — **evidence:** `app/app/api/deals/[id]/route.ts` (`GET` return vs `PATCH` return at `serializeDeal`).

- **Monthly digest uses proportional snapshot cash flow only.** Cron builds digest content from stored `monthlyCashFlow` without `adjustSnapshotCashFlow` or user display mode — **risk/impact:** Full-liability users see email figures that can diverge from dashboard trend math; product choice is explicit in code comments but is a reconciliation gap across channels — **evidence:** `app/app/api/cron/monthly-digest/route.ts` (comment and `monthlyCashFlow: Number(snapshot.monthlyCashFlow)`); contrast `app/app/(app)/dashboard/page.tsx` (`adjustSnapshotCashFlow` when mapping snapshots for `buildDashboardTrends`).

### Low

- **Two independent “staleness” concepts.** Benchmark freshness uses a strict 60-day window (`app/lib/benchmark-utils.ts`, aligned with `docs/policies/analytics-math-policy.md` §3.6) while `isDataStale` in `app/lib/date-utils.ts` uses six months for generic property data — **risk/impact:** Operators or future copy could conflate “stale benchmark” with “stale property data” — **evidence:** cited files.

- **Exported computed columns are informational on import.** Import persists inputs; spreadsheet NOI/cash flow/cap rate/LTV cells are not read back — **risk/impact:** Users editing metric cells expect them to drive the app will be surprised; `display mode` column documents export basis but does not change the signed-in user’s setting — **evidence:** `app/app/api/import/portfolio/route.ts`; `app/app/api/export/portfolio/route.ts` (`display mode` in headers).

- **Prisma `Json?` fields rely on convention.** `User` trial/digest/onboarding maps and `Property.unitRents` have no DB-level shape enforcement — **risk/impact:** Invalid JSON could surface at runtime; `unitRents` is partially validated via `parseUnitRentsFromDb` — **evidence:** `app/prisma/schema.prisma`; `app/lib/validations/property.ts` (`parseUnitRentsFromDb`).

- **Stored snapshot rows still encode proportional `monthlyCashFlow` in the database.** Display-mode alignment for chart deltas depends on callers passing adjusted values (dashboard does); raw SQL or future exports of snapshot tables could mislead if consumed without `adjustSnapshotCashFlow` — **risk/impact:** Low today if only dashboard/digest consume snapshots; document contract in `app/lib/snapshots.ts` comments — **evidence:** `app/lib/snapshots.ts` (`SnapshotData` JSDoc, `buildSnapshotData`, `adjustSnapshotCashFlow`).

## Evidence reviewed

- **Process and template:** `docs/process/data-integrity-audit-process.md`, `docs/process/audit-report-template.md`.
- **Policies and architecture:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/architecture-and-build-practices.md` (§2 layered flow, metrics SSOT, CSV reference).
- **CSV contract:** `docs/reference/portfolio-csv-export.md`.
- **Prisma:** `app/prisma/schema.prisma` (`User`, `Property`, `PropertySnapshot`, `Mortgage`, `SavedDeal`, JSON fields); migrations inventory under `app/prisma/migrations/` (32 SQL migrations); snapshot table introduction `app/prisma/migrations/20260408190000_add_snapshot_infra_phase1/migration.sql`; later snapshot columns appear in schema (`ownershipPct`, `monthlyPayment` on `PropertySnapshot`).
- **Snapshots and reconciliation:** `app/lib/snapshots.ts`, `app/lib/snapshots.test.ts`, `app/lib/dashboard-trends.ts`, `app/lib/refresh.ts` (snapshot creation path), `app/app/(app)/dashboard/page.tsx`, `app/app/api/cron/monthly-digest/route.ts`.
- **Metrics and API payloads:** `app/lib/metrics/property-metrics.ts` (referenced from export/deals/snapshots), `app/lib/server/portfolio-summary-payload.ts`, `app/app/api/portfolio/summary/route.ts` (not fully re-read; payload builder shared).
- **Import/export:** `app/app/api/export/portfolio/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/lib/import/csv-parser.ts`.
- **Deals API:** `app/app/api/deals/[id]/route.ts`.
- **Staleness helpers:** `app/lib/benchmark-utils.ts`, `app/lib/date-utils.ts`.

**Assumptions / limits:** Read-only audit; no production data or runtime tests executed. Not every API route or UI component was traced. Stripe webhooks and billing identity mapping were out of scope for this lane.

## Risk & impact assessment

Unresolved Medium items mainly affect **users who rely on CSV for backup/CPA workflows**, **multi-lien portfolios on re-import**, and **full-liability users reading monthly email** alongside the dashboard. Likelihood is moderate where CSV and email are actively used; exposure is contained where users stay in-app with single-lien properties. Low findings are documentation and future-proofing.

## Recommendations (prioritized)

1. **Extend portfolio CSV export/import** (or document explicit exclusions) for `marketRent`, `marketRentAsOf`, and `estimatedValueAsOf` so benchmark and value freshness reconcile with `docs/policies/analytics-math-policy.md`.
2. **Either apply display mode to digest snapshot cash flow** (load `ownershipDisplayMode` and call `adjustSnapshotCashFlow`) **or** add concise email copy stating digest uses proportional debt-service scaling for cash flow.
3. **Align `PATCH /api/deals/[id]`** with GET by including `portfolioContext` after update, or document that clients must refetch GET after PATCH.

## Task candidates (optional)

- [ ] Add CSV columns and importer mappings for `market rent`, `market rent as of`, and `value as of` (names TBD; update `docs/reference/portfolio-csv-export.md`).
- [ ] Digest: apply `adjustSnapshotCashFlow` using user `ownershipDisplayMode` and snapshot `ownershipPct`/`monthlyPayment`, or add user-facing reconciliation note.
- [ ] Deals PATCH: return `portfolioContext` via `buildPortfolioSummaryPayload` + `toDealPortfolioContext` for parity with GET.

## Re-test checklist

- [ ] Verify CSV round-trip for new benchmark/value-as-of columns (when implemented).
- [ ] Verify digest vs dashboard cash flow for a full-liability test user (when digest behavior changes).
- [ ] Verify deal analyze client after PATCH shape change (if implemented).
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Release touching Prisma schema, portfolio import/export, snapshot pipeline, or ownership/metrics policies.
- **Recommended next run:** Next quarterly architecture review or within one month if CSV or digest work ships.
