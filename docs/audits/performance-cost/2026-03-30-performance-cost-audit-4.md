# Performance & Cost Audit — 2026-03-30 (Run 4)

## Executive summary

- **Overall:** Patterns from [Run 3](2026-03-30-performance-cost-audit-3.md) remain: Recharts is deferred via `next/dynamic` with `ssr: false`, `experimental.optimizePackageImports` covers `lucide-react` and `recharts`, the authenticated app shell uses `unstable_cache` for banner counts (30s revalidate), and RentCast usage is capped per tier with a shared hourly pool backed by indexed `RentCastApiCall` queries. A production `npm run build` completed successfully (Next.js 16.1.6, Turbopack); default build output does not include per-route First Load JS sizes.
- **Top risks:** (1) **Portfolio-style queries still load all user rows (and mortgages) before in-app slicing** on dashboard, properties list, export, portfolio summary API, and **deals list**—same class of issue as Run 3, with deals now called out explicitly. (2) **Workspace and list APIs that intentionally load the full property set** (`/modeling`, `/mortgage`, `GET /api/properties`) amplify DB and serialization cost for accounts with many stored properties. (3) **Admin dashboard** still runs unbounded `groupBy` on `RentCastApiCall` by user and an **unbounded `user.findMany`** for per-plan property averages.
- **Recommendation:** Prioritize SQL-level `orderBy` + `take` aligned with tier limits where the product allows it; add btree indexes on high-traffic foreign keys; bound or pre-aggregate admin analytics. Continue treating RentCast hourly limits and `RentCastApiCall` indexing as the main third-party cost controls.

## Severity-ranked findings

### Critical

- None identified. No evidence of unbounded external API loops, missing auth on paid third-party calls, or catastrophic bundle regressions in this pass.

### High

- **Portfolio queries load all properties (and mortgages) then apply plan limits in memory** — `prisma.property.findMany({ where: { userId }, include: { mortgages: true } })` followed by `takeFirstNByUpdatedAt(..., propertyLimit)` appears on `dashboard`, `properties`, `export/portfolio`, and `api/portfolio/summary`. **`deals` page** uses the same pattern for `savedDeal` with `dealLimit`. Users with more stored rows than their tier still pay full read cost. Evidence: `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/api/export/portfolio/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/lib/limit-utils.ts`.

### Medium

- **`getAppUser()` always runs `prisma.user.upsert`** — Syncs Clerk → DB on every resolving call; `React.cache` only dedupes within one request. Steady write load at scale versus read-first conditional update. Evidence: `app/lib/auth.ts`.

- **Admin: unbounded RentCast `groupBy` and full-user scan for averages** — `prisma.rentCastApiCall.groupBy({ by: ["userId"], ... })` returns all distinct users with counts, sorted in JS. `usersWithPropertiesForAvg` uses `prisma.user.findMany({ where: { deletedAt: null }, ... })` with **no `take`**, loading every active user to compute average properties per plan. Evidence: `app/app/(app)/admin/page.tsx`.

- **Schema: no explicit `@@index` on `Property.userId`, `SavedDeal.userId`, or `Mortgage.propertyId`** — Hot paths filter or join on these columns; contrast with explicit indexes on `RentCastApiCall`, `ApiRateLimitEntry`, `ContactFormSubmission`. Evidence: `app/prisma/schema.prisma`.

- **Full property loads on workspace routes and properties API (by design, but costly at scale)** — `modeling` and `mortgage` pages load all properties with mortgages (`orderBy` only, no tier cap). `GET /api/properties` returns all properties with mortgages for the user. Reasonable for picking any property in tooling, but cost scales with total stored rows, not effective tier. Evidence: `app/app/(app)/modeling/page.tsx`, `app/app/(app)/mortgage/page.tsx`, `app/app/api/properties/route.ts`.

### Low

- **Root client graph includes analytics when configured** — `posthog-js` remains a dependency; init/consent gating limits runtime cost but not package weight. Evidence: `app/package.json`, PostHog-related components under `app/components/`.

- **Sentry wraps `next.config`** — `@sentry/nextjs` adds instrumentation; acceptable for observability with build/runtime overhead. Evidence: `app/next.config.ts`.

- **Marketing and session-aware routes stay dynamic** — Public pages using `auth()` / `getAppUser()` remain server-rendered per request (documented trade-off vs ISR). Evidence: `docs/architecture-and-build-practices.md` §2.5.

## Evidence reviewed

- Process: `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` §2.5.
- Prior audit: `docs/audits/performance-cost/2026-03-30-performance-cost-audit-3.md`.
- Config & build: `app/next.config.ts` (`optimizePackageImports`, Sentry, Turbopack `root`), `app/package.json`; **`npm run build`** executed successfully (Next.js 16.1.6; no `@next/bundle-analyzer` output in default build).
- Caching: `app/app/(app)/layout.tsx` (`unstable_cache`, `revalidate: 30`, `dynamic = "force-dynamic"`).
- Data access: `app/lib/auth.ts`, `app/lib/limit-utils.ts`, `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`), `app/prisma/schema.prisma`.
- Routes & pages: `app/app/(app)/dashboard/page.tsx`, `dashboard-charts.tsx` (dynamic Recharts), `app/app/(app)/deals/page.tsx`, `app/app/(app)/modeling/page.tsx`, `app/app/(app)/mortgage/page.tsx`, `app/app/(app)/admin/page.tsx`, `app/app/api/properties/route.ts`, `app/app/api/estimates/rent/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/app/api/export/portfolio/route.ts`.
- External & quota: `docs/reference/rentcast-quota.md`, indexed `RentCastApiCall` usage in estimate routes.
- Images: `next/image` on `app/app/page.tsx`, `app/app/pricing/page.tsx`; no raw `<img` under `app/` in grep.

**Limits of this pass:** No production APM traces, no `EXPLAIN ANALYZE` on Postgres, and no webpack bundle analyzer report—findings are static review, architecture alignment, and a successful production build.

## Risk & impact assessment

- **Unresolved High:** Larger portfolios (especially over-tier) keep increasing latency and DB cost with stored row count, not with active tier limits.
- **Unresolved Medium:** Write-heavy user resolution, admin full-table scans, and workspace/API full loads are gradual operational risks as MAU, property count, and `RentCastApiCall` volume grow.
- **Likelihood:** High finding is most visible for multi-property and downgraded accounts; medium items matter as data and traffic scale.

## Recommendations (prioritized)

1. **Push plan limiting into Prisma** — Where business rules match “first N by `updatedAt`,” use `findMany({ orderBy: { updatedAt: "desc" }, take: limit, include: { mortgages: true } })` (and equivalent for deals) for dashboard, properties, deals, export, and `api/portfolio/summary`; document exceptions (e.g. admin or migration scripts needing full counts).
2. **Add btree indexes** — `@@index([userId])` on `Property` and `SavedDeal`, `@@index([propertyId])` on `Mortgage`, via migration; validate with `EXPLAIN` on hot queries.
3. **Bound admin aggregates** — Time-window or paginate RentCast leaderboards; replace or cap the full-user `findMany` used for average properties per plan (e.g. SQL aggregation by tier, sampling, or materialized rollups).
4. **Revisit `getAppUser` write pattern** — Read-first with conditional update when Clerk fields change, if correctness allows, to reduce steady-state writes.

## Task candidates (optional)

- [ ] Refactor tier-limited list/export/summary queries to use `orderBy` + `take` at the database (including deals).
- [ ] Add Prisma migration for `Property.userId`, `SavedDeal.userId`, and `Mortgage.propertyId` indexes; verify query plans.
- [ ] Admin: paginate or aggregate RentCast by-user stats; cap user scan for per-plan property averages.
- [ ] Spike: reduce `getAppUser` upsert to conditional updates after profile diff.

## Re-test checklist

- [ ] Load-test dashboard, properties, deals, export, and `GET /api/portfolio/summary` with an account that has many more rows than the active tier allows.
- [ ] After index migration, spot-check `EXPLAIN` for property/deal/mortgage hot paths.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Before major scale milestones, after large schema changes, or when RentCast/admin reporting requirements change.
- **Recommended next run:** Within one month or after implementing prioritized query/index work; consider adding `@next/bundle-analyzer` or CI bundle budgets if JS size regressions become a concern.
