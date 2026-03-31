# Performance & Cost Audit — 2026-03-30 (Run 5)

## Executive summary

- **Overall:** Tier-limited portfolio surfaces now align reads with plan limits using `orderBy` + `take` in Prisma (`dashboard`, `properties`, `export`, `api/portfolio/summary`, `modeling`, `mortgage`); `deals` uses `take` plus `count` for over-limit UX. `app/prisma/schema.prisma` includes `@@index` on `Property.userId`, `SavedDeal.userId`, and `Mortgage.propertyId`. `getAppUser` in `app/lib/auth.ts` uses read-first resolution with conditional `update`/`create` (no unconditional upsert). Recharts remains deferred via `next/dynamic` with `ssr: false` in chart entry points; `experimental.optimizePackageImports` lists `lucide-react` and `recharts` in `app/next.config.ts`. A production `npm run build` was attempted for this run but **did not complete** (Prisma migrate timed out acquiring a Postgres advisory lock against the configured remote DB—environment/network limitation, not a code finding).
- **Top risks:** (1) **`GET /api/properties`** still returns every property with mortgages for the user—appropriate for pickers and flows that need the full stored set, but DB and JSON payload scale with total rows, not tier. (2) **Admin RentCast “by user” leaderboard** still runs `prisma.rentCastApiCall.groupBy({ by: ["userId"], ... })`, which materializes **all** distinct users before sorting and `slice(0, 100)` in application code—cost grows with RentCast row volume and user cardinality. (3) **Root layout** still loads analytics-related client graph (`PostHogGate` in `app/app/layout.tsx`) when keys/consent allow—bundle weight remains a steady-state consideration.
- **Recommendation:** Keep treating RentCast hourly limits and `RentCastApiCall` indexing as primary third-party cost controls; for admin, replace or bound the full `groupBy` (e.g. SQL `GROUP BY` with `ORDER BY count DESC LIMIT 100`, or a time window). For `GET /api/properties`, document the contract and consider pagination or a “light” list endpoint if mobile or new clients need smaller payloads.

## Severity-ranked findings

### Critical

- None identified in static review.

### High

- None identified. The Run 4 class of issue (load-all-then-slice for tier-limited portfolio lists) is **addressed in code** for the main app and summary/export paths cited in evidence below.

### Medium

- **`GET /api/properties` loads the full property set with mortgages** — `findMany` has no `take`; consumers get every row for `userId`. Reasonable for property pickers and create/edit flows that must reference any stored property, but cost and response size scale with stored properties. Evidence: `app/app/api/properties/route.ts`.

- **Admin: RentCast `groupBy` by user is unbounded before truncation** — `groupBy({ by: ["userId"], _count: ... })` returns all groups; top 100 is applied in JS after `sort`. Under large `RentCastApiCall` tables this is heavier than a capped SQL aggregate. Evidence: `app/app/(app)/admin/page.tsx` (Promise.all block including `rentCastByUser`).

- **Admin: average properties per plan uses a sample, not the full population** — `usersWithPropertiesForAvg` uses `take: 500` with tier/property counts—better than an unbounded scan, but averages are **sample-based** and can skew if not documented to operators. Evidence: `app/app/(app)/admin/page.tsx`.

### Low

- **Authenticated app shell** — `app/app/(app)/layout.tsx` uses `dynamic = "force-dynamic"` plus `unstable_cache` for banner counts (30s revalidate). Intentional for session-specific UI; no ISR on this subtree.

- **Client analytics and ads** — `PostHogGate`, `GoogleAdsGtagClient` in root layout; PostHog init gated on consent and key. Adds JS when enabled. Evidence: `app/app/layout.tsx`, `app/components/analytics/posthog-provider.tsx`.

- **Heavy chart libraries** — Recharts loaded only through `next/dynamic` in `dashboard-charts.tsx`, `modeling-workspace.tsx`, `mortgage-workspace.tsx`, `amortization-chart-dynamic.tsx`. Evidence: grep for `next/dynamic` under `app/`.

- **Sentry wraps Next config** — `withSentryConfig` in `app/next.config.ts`; standard observability trade-off.

- **`papaparse`** — Used in `app/app/api/import/portfolio/route.ts` (server-side CSV parse), not a default client bundle concern.

## Evidence reviewed

- Process: `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` §2.5.
- Prior run (delta context): `docs/audits/performance-cost/2026-03-30-performance-cost-audit-4.md`.
- Config: `app/next.config.ts`, `app/package.json`.
- Caching: `app/app/(app)/layout.tsx` (`unstable_cache`, `revalidate: 30`, `dynamic = "force-dynamic"`).
- Auth: `app/lib/auth.ts` (`getAppUser` with `findUnique` / conditional `update` / `create`).
- Schema: `app/prisma/schema.prisma` (indexes on `Property`, `SavedDeal`, `Mortgage`, `RentCastApiCall`).
- Tier-limited reads: `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/api/portfolio/summary/route.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/(app)/modeling/page.tsx`, `app/app/(app)/mortgage/page.tsx`.
- Full-list API: `app/app/api/properties/route.ts`.
- Admin: `app/app/(app)/admin/page.tsx`.
- Build: `npm run build` **failed** at `prisma migrate deploy` (P1002 / advisory lock timeout to Neon—no Next compile output from this environment).

**Limits of this pass:** No production APM, no `EXPLAIN ANALYZE`, no successful local production build in this session, no bundle analyzer report. Findings are from static review and alignment with architecture docs.

## Risk & impact assessment

- **Medium findings:** Operational cost and latency for very large portfolios concentrate on `GET /api/properties` and admin RentCast aggregation; wrong expectations about admin averages could mislead ops if the 500-user sample is treated as exact.
- **Likelihood:** Admin issues matter as RentCast call volume and user count grow; full-properties API matters for accounts with many stored properties using client flows that refetch the list.

## Recommendations (prioritized)

1. **Admin RentCast leaderboard** — Replace “full `groupBy` + JS top 100” with a database-side top-N (raw SQL or Prisma `$queryRaw` with `GROUP BY` / `ORDER BY COUNT(*) DESC` / `LIMIT 100`) or a time-window filter to reduce scanned rows.
2. **`GET /api/properties`** — Document that the endpoint returns the full set; if product adds mobile or performance-sensitive clients, add pagination, field selection, or a slim list route while keeping this route for full fidelity where needed.
3. **Admin averages** — Label UI or internal docs that per-plan property averages are computed from a capped sample (`take: 500`), or switch to SQL aggregation across all users if exact rollups are required.
4. **Bundle budgets (optional)** — If JS size regressions become a concern, add `@next/bundle-analyzer` or CI budgets; continue deferring Recharts and `optimizePackageImports` for listed packages.

## Task candidates (optional)

- [ ] Admin: bounded SQL top-N for RentCast calls by user (replace full `groupBy` + JS slice).
- [ ] Document or adjust `usersWithPropertiesForAvg` sampling vs exact aggregates.
- [ ] Spike: paginated or slim `GET /api/properties` variant for large accounts (if product needs it).

## Re-test checklist

- [ ] After admin query changes, load admin dashboard against a DB with large `RentCastApiCall` volume and confirm latency.
- [ ] Stress `GET /api/properties` with an account that has many stored properties (payload size and route latency).
- [ ] `npm run check` (when code changes are made); `npm run build` in an environment where `prisma migrate deploy` can acquire a lock.

## Next trigger and cadence

- **Trigger:** After major query changes, admin reporting changes, or new client surfaces that list properties.
- **Recommended next run:** Within one month, or after implementing admin RentCast aggregation work; repeat `npm run build` when DB access is available to confirm compile and route sizes if needed.
