# Data Integrity & Reconciliation Audit — 2026-05-01

## Executive summary

- **Schema, metrics, and validation** are broadly aligned with canonical policies (`docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`): shared helpers (`app/lib/metrics/property-metrics.ts`, `portfolio-metrics.ts`), Zod on property/mortgage APIs, and snapshot builders (`app/lib/snapshots.ts`) use the same vacancy and ownership scaling contracts as the dashboard copy (`metric-help-modal.tsx` references effective-rent / NOI alignment).
- **Largest reconciliation risks** are **cross-surface portfolio scope** (plan slice vs full API list vs CSV), **CSV round-trip gaps** (multi-lien and benchmark fields), and **RentCast telemetry**: monthly cron refresh calls the provider without `RentCastApiCall` rows, so operator/quota docs under-represent automated usage.
- **Stripe billing ↔ DB** replay and PostHog dedup are explicitly designed for idempotency (`StripePosthogDedup`, upserts); remaining risk is mostly **operator visibility** (metadata vs `stripeCustomerId` resolution), not silent double-charging in-app.
- **Recommendation:** Treat `GET /api/export/portfolio` / `buildPortfolioSummaryPayload` / properties dashboard as **plan-sliced** truth for **totals**; document or tighten `GET /api/properties` for integrators when `propertyCountTotal > propertyLimit`. Close RentCast logging gaps or document intentional exclusion.

## Severity-ranked findings

### Critical

- *(None on this pass.)*

### High

- **Plan-limited portfolio slice vs full property API — inconsistent “portfolio” for downsized / over-cap accounts** — After trial downgrade or tier change, `totalCount` can exceed `getPropertyLimit` (`app/app/(app)/properties/page.tsx` sets `overLimit` and still loads `take: propertyLimit` ordered by `updatedAt`). **Meanwhile** `GET /api/properties` returns **every** property with no limit (`app/app/api/properties/route.ts`). Portfolio CSV export and `loadPortfolioSummaryCore` use the **same slice** as the dashboard (`orderBy: { updatedAt: "desc" }, take: propertyLimit`, `app/lib/server/portfolio-summary-payload.ts`) and expose truncation via response headers (`X-Veld-Property-*` on export). **Impact:** API integrators or scripts using `GET /api/properties` can assume a full portfolio while dashboard, deal context, and CSV aggregates intentionally omit the tail; totals will not reconcile without reading `slice` / export headers or counting rows vs limit.

### Medium

- **CSV multi-lien + `monthly payment (all liens sum)` — lossy re-import can invent wrong single-loan economics** — Export documents first-lien rate/term and sums payments across liens (`app/app/api/export/portfolio/route.ts`, `docs/reference/portfolio-csv-export.md`). Import maps **`mortgage balance (effective)` / `(stored sum)`** and **`monthly payment (all liens sum)`** into **one** `Mortgage` row (`app/lib/import/csv-parser.ts`, `app/app/api/import/portfolio/route.ts`). **Impact:** Re-importing a multi-lien export creates one loan with **aggregate** payment and ambiguous balance basis; documented as lossy but easy to misread as faithful backup.

- **Portfolio CSV omits benchmark / freshness / several scalars — round-trip drift** — Export columns do not include `marketRent`, `marketRentAsOf`, `estimatedValueAsOf`, or detail fields such as bedrooms/bathrooms/square feet / `mortgagePaidOff` (`app/prisma/schema.prisma` vs `app/app/api/export/portfolio/route.ts`). **Impact:** Users who treat CSV as authoritative backup lose RentCast benchmark context and property-detail fields; re-import cannot restore them.

- **`POST /api/import/portfolio` blocked entirely when `canAddProperty` is false** — If `currentCount >= propertyLimit`, import returns `PLAN_LIMIT_REACHED` before row selection (`app/app/api/import/portfolio/route.ts`), even though the real constraint is “cannot net-add properties.” **Impact:** Over-cap accounts cannot use CSV as a **merge/replace** path without deleting rows first; increases manual error risk.

- **RentCast usage accounting gap for monthly snapshot refresh** — `docs/reference/rentcast-quota.md` lists routes that insert `RentCastApiCall` after success; **monthly cron** (`app/app/api/cron/monthly-refresh/route.ts` → `app/lib/refresh.ts` → `fetchValueEstimate` / `fetchRentEstimate`) performs upstream calls **without** inserting `RentCastApiCall`. **Impact:** Admin metrics (`app/app/(app)/admin/page.tsx`) and documented “one row per successful call” framing for user routes **exclude** automated refresh volume; totals inferred from `RentCastApiCall` alone **undercount** real provider usage.

### Low

- **`PropertySnapshot.ownershipPct` legacy null** — Migration and schema comment: `NULL = legacy row; treat as 1.0` (`app/prisma/migrations/20260409220000_add_snapshot_basis_fields/migration.sql`, `app/prisma/schema.prisma`). New snapshots set the field in `buildSnapshotData` (`app/lib/snapshots.ts`). **Impact:** Any future tooling that **re-derives** cash flow from snapshot fields using `ownershipPct` must handle null; stored `monthlyCashFlow` already reflects the computation at write time for existing rows.

- **Property list ordering differs between API and export** — `GET /api/properties` orders `createdAt desc`; export and plan-sliced UIs use `updatedAt desc`. **Impact:** Mostly cosmetic when under limit; adds noise when comparing ordered dumps.

- **Internal comments referencing removed “full-liability” lens** — e.g. `app/lib/cash-flow-improvement.ts` still mentions full-liability scaling in a comment while product policy collapsed to proportional-only (`docs/policies/ownership-metrics.md` §1). **Impact:** Maintainer confusion only.

## Evidence reviewed

- Process: `docs/process/data-integrity-audit-process.md`; template: `docs/process/audit-report-template.md`.
- Policies: `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`.
- Prisma: `app/prisma/schema.prisma`; migrations sampled: `20260409220000_add_snapshot_basis_fields`, `20260429180000_drop_user_ownership_display_mode`, `20260401080000_add_stripe_posthog_dedup`, `20260407131500_preserve_rentcast_history_on_user_delete`.
- Import/export: `app/app/api/import/portfolio/route.ts`, `app/lib/import/csv-parser.ts`, `app/lib/import/validate-import-mortgage.ts`, `app/app/api/export/portfolio/route.ts`, `docs/reference/portfolio-csv-export.md`, `docs/reference/rentcast-quota.md`.
- API validation & serialization: `app/lib/validations/property.ts`, `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/metrics/route.ts`, `app/lib/serialize/property-api.ts`.
- Aggregates & UI slice: `app/lib/server/portfolio-summary-payload.ts`, `app/app/(app)/properties/page.tsx`.
- Metrics: `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`.
- Snapshots & RentCast sync: `app/lib/snapshots.ts`, `app/lib/refresh.ts`, `app/app/api/cron/monthly-refresh/route.ts`, `app/lib/integrations/rentcast.ts`, `app/app/api/properties/[id]/data-freshness/refresh/route.ts`.
- Stripe: `app/app/api/billing/webhook/route.ts`, `app/lib/stripe-webhook-posthog.ts`, `docs/internal/stripe-webhook-posthog-idempotency.md`.
- Plans: `app/lib/plans.ts`.

## Risk & impact assessment

- **High finding exposure:** Affects users who **exceed** current tier property limits (common after trial end or downgrade). They still **own** all rows in the database, but **reported portfolio metrics and CSV** only reflect the **most recently updated** `propertyLimit` slice. API clients that assume an exhaustive list will **overstate** included properties in aggregations or **miss** excluded ones.

- **Medium findings:** Mostly **user error** and **operational blind spots** (CSV as backup, multi-lien math, RentCast row gap), not silent corruption of stored primitives.

- **Likelihood:** Slice mismatch is **conditional** on `propertyCountTotal > propertyLimit`. RentCast gap is **certain** whenever monthly refresh runs and hits the provider.

## Recommendations (prioritized)

1. **Publish a single “portfolio scope” contract** for API consumers: either add `slice` metadata to `GET /api/properties` responses, or document that list endpoints may return **more** properties than **financial aggregates** when over limit, and point to `buildPortfolioSummaryPayload` / export headers as the aggregate source.

2. **Close or document the RentCast cron telemetry gap** — Record `RentCastApiCall` for successful cron upstream calls (with a `source` discriminator if needed) **or** amend `docs/reference/rentcast-quota.md` to state clearly that **user hourly quota** and **admin totals** exclude automated monthly refresh.

3. **Harden CSV ergonomics** — Extend export/import for optional benchmark and `estimatedValueAsOf` columns, or add a persistent “not in CSV” callout in Settings import UI beyond multi-lien warnings.

4. **Import when over property limit** — Allow import modes that **replace** or **skip** without requiring net-new capacity (e.g. transactional upsert by stable key), or return a dedicated error code with guidance to delete excess properties first.

## Task candidates

- [ ] Document or API-shape the **plan slice vs full list** contract (`GET /api/properties` vs `buildPortfolioSummaryPayload` / export headers); add integrator note in `docs/architecture-and-build-practices.md` or API-facing doc.
- [ ] **RentCast:** either insert `RentCastApiCall` rows from `app/lib/refresh.ts` on successful provider responses, or update `docs/reference/rentcast-quota.md` and admin copy to exclude cron from DB-based totals.
- [ ] **CSV:** add optional columns for `marketRent`, `marketRentAsOf`, `estimatedValueAsOf` (and/or property detail fields) **or** explicitly list non-exported fields in `docs/reference/portfolio-csv-export.md` and Settings.
- [ ] **Import:** when `monthly payment (all liens sum)` is present with `mortgage lien count > 1`, reject row with a clear error unless import gains multi-lien support (prevents silent wrong single mortgage).
- [ ] **Import:** allow over-cap portfolios to import with **no net new properties** (design + implementation pass).

## Re-test checklist

- [ ] After any slice/API doc fix: verify user with `propertyCountTotal > propertyLimit` sees dashboard `slice.truncated === true`, CSV headers match, and documented API behavior matches implementation.
- [ ] After RentCast logging change: run one monthly-refresh batch in staging and confirm admin RentCast counts (or updated docs) match provider logs.
- [ ] After CSV column changes: single-lien and multi-lien export → import dry run against `docs/reference/portfolio-csv-export.md` matrix.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Full-audit run `2026-05-01`; also re-run after material changes to **plans/slice logic**, **CSV contract**, **RentCast routes**, or **subscription sync**.
- **Recommended next window:** With the next monthly full audit or after any billing Tier/property-limit release.
