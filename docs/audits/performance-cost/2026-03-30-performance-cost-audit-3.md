# Performance & Cost Audit — 2026-03-30 (Run 3)

## Executive summary

- **Overall:** The app follows documented patterns for heavy UI (Recharts behind `next/dynamic` with `ssr: false`), package import optimization (`lucide-react`, `recharts`), and partial server caching for the authenticated shell (`unstable_cache` on layout banner data). RentCast hot paths are rate-limited per tier with indexed quota queries and shared hourly accounting.
- **Top risks:** (1) **Portfolio-wide `findMany` + `include: { mortgages: true }` before in-app slicing** inflates database and application work for users with many properties relative to their effective tier (especially “over limit” accounts). (2) **`getAppUser()` performs a `prisma.user.upsert` on every call**—cheap per request but adds steady write load and connection churn at scale. (3) **Admin analytics queries** aggregate large tables (e.g. RentCast usage by user) without bounded SQL-level limits.
- **Recommendation:** Treat SQL-level filtering (`orderBy` + `take`) and explicit btree indexes on high-cardinality foreign keys as the next performance hardening pass; keep monitoring RentCast spend and hourly quota behavior as the primary external cost lever.

## Severity-ranked findings

### Critical

- None identified. No evidence of unbounded external API loops, missing auth on paid third-party calls, or catastrophic bundle regressions in this pass.

### High

- **Portfolio queries load all properties (and mortgages) then apply plan limits in memory** — For `dashboard`, `properties`, `export`, and `portfolio/summary` APIs, the code uses `prisma.property.findMany({ where: { userId }, include: { mortgages: true } })` followed by `takeFirstNByUpdatedAt(..., propertyLimit)`. Users with far more rows than their tier allows still pay the full read cost. Impact grows with property count (memory, Postgres I/O, JSON serialization). Evidence: `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/api/export/portfolio/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/lib/limit-utils.ts`.

### Medium

- **`getAppUser()` always runs `prisma.user.upsert`** — Intended to sync Clerk → app user, but every server render / API call that resolves the user triggers a write path. `React.cache` dedupes within one request only. At higher traffic, this increases write QPS and lock contention versus a read-first “find then conditional update” pattern. Evidence: `app/lib/auth.ts`.

- **Admin dashboard: unbounded aggregation over RentCast usage** — `prisma.rentCastApiCall.groupBy({ by: ["userId"], ... })` returns all distinct users with counts; the result set is sorted in JS. As `RentCastApiCall` grows, CPU and memory for this page grow without a cap or pre-aggregation. Evidence: `app/app/(app)/admin/page.tsx`.

- **Schema: no explicit `@@index` on `Property.userId`, `SavedDeal.userId`, or `Mortgage.propertyId`** — Hot queries filter or join on these columns constantly. PostgreSQL does not automatically index foreign-key columns. At scale, `findMany`/`count`/`include` plans may degrade to sequential scans unless indexes exist from migrations or DBA defaults. Evidence: `app/prisma/schema.prisma` (contrast with explicit indexes on `RentCastApiCall`, `ApiRateLimitEntry`, `ContactFormSubmission`).

### Low

- **Root `app/layout.tsx` loads PostHog-related modules when analytics is configured** — `posthog-js` is imported in provider components; bundle impact is gated by consent and init, but the dependency remains in the client graph when keys are present. Evidence: `app/components/analytics/posthog-provider.tsx`, `app/package.json`.

- **Sentry wraps `next.config`** — `@sentry/nextjs` adds build/runtime instrumentation; acceptable for observability but contributes to build time and server bundle surface. Evidence: `app/next.config.ts`.

- **Marketing and session-aware routes stay dynamic** — Public pages that call `auth()` or `getAppUser()` remain per-request (documented trade-off vs ISR). No regression; worth revisiting only if static marketing shells become a priority. Evidence: `docs/architecture-and-build-practices.md` §2.5, e.g. `app/app/investment-property-calculator/page.tsx`.

## Evidence reviewed

- Process: `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` (performance section).
- Config & tooling: `app/next.config.ts`, `app/package.json`, `app/lib/db.ts`.
- Rendering & bundles: `app/app/layout.tsx`, `app/app/(app)/layout.tsx`, `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/properties/[id]/amortization-chart-dynamic.tsx`, `components/charts/*.tsx`.
- Data access: `app/lib/auth.ts`, `app/lib/limit-utils.ts`, `app/prisma/schema.prisma`, representative routes `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/admin/page.tsx`, `app/app/api/export/portfolio/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/app/api/estimates/rent/route.ts`, `app/app/api/me/route.ts`.
- External & cost: `app/lib/integrations/` (RentCast usage via estimate routes), `docs/reference/rentcast-quota.md` (referenced in code comments).
- Images: searched for raw `<img` usage under `app/` (none found); `next/image` on `app/app/page.tsx`, `app/app/pricing/page.tsx`.

**Limits of this pass:** No production APM traces, no `EXPLAIN ANALYZE` on Postgres, and no bundle analyzer output were run. Findings are from static review and architecture alignment.

## Risk & impact assessment

- **Unresolved High:** Larger portfolios (especially over-tier) increase latency and infrastructure cost linearly with stored rows, not with “active” tier limits—user-visible slowness and higher DB spend during peak usage.
- **Unresolved Medium:** Write-heavy user resolution and admin aggregates are gradual operational risks as MAU and RentCast row volume grow.
- **Likelihood:** High finding triggers mainly for multi-property accounts; medium items matter as traffic and data volume increase.

## Recommendations (prioritized)

1. **Push plan limiting into Prisma** — Replace “fetch all, then `takeFirstNByUpdatedAt`” with `findMany({ orderBy: { updatedAt: "desc" }, take: propertyLimit, include: { mortgages: true } })` (and equivalent for export/summary) so the database returns only the rows needed, or use a subquery/CTE if business rules require counting “over limit” separately.
2. **Add btree indexes** — Add `@@index([userId])` on `Property` and `SavedDeal`, and `@@index([propertyId])` on `Mortgage`, via migration; validate with `EXPLAIN` on hot queries.
3. **Revisit `getAppUser` write pattern** — Consider `findUnique` + conditional `update` when Clerk profile fields changed, or throttle updates, to reduce steady-state writes while preserving correctness.
4. **Bound admin RentCast aggregates** — Add time windows, `take`/`skip`, or materialized rollups so admin views do not scan the full history on every load.

## Task candidates (optional)

- [ ] Refactor portfolio list/export/summary queries to use SQL-level `orderBy` + `take` aligned with `propertyLimit` (and document any exception where full counts are required).
- [ ] Add Prisma migration for `Property.userId`, `SavedDeal.userId`, and `Mortgage.propertyId` indexes; verify query plans.
- [ ] Spike: reduce `getAppUser` upsert to conditional updates after profile diff.
- [ ] Admin: paginate or time-bound RentCast leaderboards / groupBy results.

## Re-test checklist

- [ ] Load-test or manually test dashboard/properties/export with an account that has many more properties than the active tier allows.
- [ ] After index migration, spot-check `EXPLAIN` for `property.findMany` and `mortgage` joins.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Before major scale milestone, after large schema changes, or when RentCast/admin reporting requirements change.
- **Recommended next run:** Within one month or after implementing prioritized query/index work.
