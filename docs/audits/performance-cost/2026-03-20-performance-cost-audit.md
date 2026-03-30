# Performance & Cost Audit — 2026-03-20

## Executive summary

- **Overall:** The app follows several good patterns (`next/dynamic` + `ssr: false` for Recharts, `experimental.optimizePackageImports` for `lucide-react` and `recharts`, `getAppUser` wrapped in React `cache()`, and a short-TTL `unstable_cache` for layout banner counts). Heavy third-party spend is partially controlled via hourly RentCast caps and DB-backed call logging.
- **Top risks:** (1) Marketing and most document-style routes are **fully dynamic** in production (`ƒ`), so they miss static/ISR wins the architecture doc calls for. (2) The dashboard **auto-fires** one RentCast benchmark refresh per stale property on mount (sequential), which can consume the shared hourly quota and add multi-second latency. (3) Portfolio queries **load every property + mortgages** then apply plan limits in memory, which scales poorly for users far above their tier after a downgrade.
- **Recommendation:** Prioritize caching/splitting for public shells, tame automatic RentCast fan-out, and tighten DB access patterns (indexes + query limits) with simple before/after metrics (TTFB, query time, RentCast calls/hour).

## Severity-ranked findings

### Critical

- **None identified** in this pass — no evidence of unbounded external spend without existing counters/limits, or of a single obvious production outage driver. RentCast and Stripe paths are server-side and rate-limited or bounded (`limit: 1` on Stripe list).

### High

- **Public and content pages are server-rendered on every request (no static/ISR layer).** Next.js 16 production build labels almost all routes as dynamic (`ƒ`); only `robots.txt` and `sitemap.xml` are prerendered (`○`). The home page uses `auth()` and `searchParams`, which prevents a static marketing shell. This diverges from `docs/architecture-and-build-practices.md` (prefer static/cached public pages). **Impact:** Higher TTFB and origin load than necessary for anonymous traffic. **Evidence:** `npm run build` route table; `app/app/page.tsx` (`auth()`, `searchParams`).

- **Dashboard “Rent vs. market” auto-refreshes every stale/missing benchmark sequentially.** On mount, the client loops `POST /api/properties/[id]/benchmark/refresh` for each property without a fresh benchmark, one after another. Each success path calls RentCast and increments usage against the **shared** hourly limit (5/10/20 per tier across value, rent, and benchmark flows). **Impact:** Multi-property users can burn most of their hourly budget from a single page view; wall-clock time grows linearly with stale rows. **Evidence:** `app/app/(app)/dashboard/rent-vs-market-section.tsx` (sequential `fetch` in `for` loop); `app/app/api/properties/[id]/benchmark/refresh/route.ts`; `lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`).

- **Portfolio reads fetch the full property set then apply plan limits in application memory.** `takeFirstNByUpdatedAt` sorts and slices after `findMany` with `include: { mortgages: true }`. For users who are over limit (e.g. after downgrade), this still transfers and hydrates every row. **Impact:** Superlinear memory/CPU and larger DB result sets than needed for dashboard, properties list, and `/api/portfolio/summary`. **Evidence:** `app/lib/limit-utils.ts`; `app/app/(app)/dashboard/page.tsx`; `app/app/(app)/properties/page.tsx`; `app/app/api/portfolio/summary/route.ts`.

### Medium

- **Signed-in analytics triggers `GET /api/me` on every pathname change.** `PostHogPersonProperties` depends on `pathname` and refetches `/api/me`, which runs two `count` queries. Layout already computes related counts with `unstable_cache` on the server. **Impact:** Extra RSC navigation already does work; this adds redundant API traffic and DB reads for analytics-only state. **Evidence:** `app/components/analytics/posthog-person-properties.tsx`; `app/app/api/me/route.ts`; compare with `app/app/(app)/layout.tsx`.

- **Hot-path RentCast estimate routes run an hourly `count` on `RentCastApiCall` with no supporting index in Prisma schema.** Every `GET` to `/api/estimates/value` and `/api/estimates/rent` executes `rentCastApiCall.count({ where: { userId, createdAt: { gte: oneHourAgo } } })`. The `RentCastApiCall` model defines no `@@index([userId, createdAt])`. **Impact:** Table growth can slow estimate checks. **Evidence:** `app/prisma/schema.prisma` (`RentCastApiCall`); `app/app/api/estimates/value/route.ts`; `app/app/api/estimates/rent/route.ts`.

- **`Property` and `SavedDeal` lack explicit `userId` indexes** while almost every query filters on `userId`. PostgreSQL does not automatically index foreign-key child columns. **Impact:** Sequential scans or less selective plans as row counts grow. **Evidence:** `app/prisma/schema.prisma` (`Property`, `SavedDeal`); grep shows repeated `where: { userId: user.id }` across API and pages.

- **Dashboard chart prep calls `computePropertyMetrics` twice per property** (separate `.map` passes for equity and cash-flow series). **Impact:** Extra CPU on the critical dashboard RSC path; minor compared to DB but easy wins exist. **Evidence:** `app/app/(app)/dashboard/page.tsx` (`chartData` construction).

### Low

- **Paid users trigger `GET /api/billing/sync` up to once per tab every 5 minutes** (sessionStorage-gated), which lists Stripe subscriptions. **Impact:** Small recurring Stripe API volume; acceptable but worth monitoring if MAU grows. **Evidence:** `app/app/(app)/app-layout-client.tsx`; `app/app/api/billing/sync/route.ts`.

- **Root layout always loads analytics components** (PostHog, multiple client effects). When `NEXT_PUBLIC_POSTHOG_KEY` is unset, providers no-op, but Clerk + theme still load. **Impact:** Baseline JS for authenticated and public routes; acceptable for the product, noted for bundle-awareness. **Evidence:** `app/app/layout.tsx`.

## Evidence reviewed

- Process: `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`, performance section of `docs/architecture-and-build-practices.md`.
- Config & tooling: `app/next.config.ts`, `app/package.json`, production `npm run build` (route static/dynamic table).
- Representative routes & data: `app/app/layout.tsx`, `app/app/(app)/layout.tsx`, `app/app/page.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/dashboard/rent-vs-market-section.tsx`, `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/app-layout-client.tsx`.
- APIs & integrations: `app/app/api/estimates/value/route.ts`, `app/app/api/estimates/rent/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/app/api/me/route.ts`, `app/app/api/billing/sync/route.ts`, `app/lib/integrations/rentcast.ts`, `app/lib/plans.ts`.
- Schema: `app/prisma/schema.prisma`.
- Edge: `app/proxy.ts` (Clerk matcher).

**Limits:** No production APM traces, RUM, or DB `EXPLAIN` were run; database size and index usage are assessed by schema and query shape only.

## Risk & impact assessment

| Area | User/business impact | Likelihood |
|------|------------------------|------------|
| Dynamic marketing pages | Slower first paint and higher hosting cost for traffic that could be cached | High (confirmed by build output) |
| Auto benchmark refresh | Surprise RentCast usage, throttling (429), and slow dashboard loads for multi-property portfolios | Medium–high when benchmarks are stale |
| Full-table property reads | Degraded dashboard/properties/API latency for “over limit” portfolios | Medium as power users accumulate properties |
| Extra `/api/me` traffic | Minor DB load; adds noise when debugging perf | High for signed-in navigation |

## Recommendations (prioritized)

1. **Public/marketing caching:** Split or refactor the home page so static content (hero, SEO copy) can use ISR or static generation; isolate `auth()` / `searchParams`-dependent UI into a small dynamic island or client component. **Target:** Move `/`, `/pricing`, `/privacy`, `/terms` toward `○` or short `revalidate` where the build table currently shows `ƒ` (verify after change).

2. **RentCast fan-out:** Remove or strictly cap automatic benchmark refresh (e.g. at most one property per session, or user-initiated only). If auto-refresh remains, parallelize only where the hourly budget allows and surface progress/errors. **Target:** ≤1 RentCast call triggered without explicit user action per dashboard visit; P95 dashboard hydration + refresh &lt;2s for typical portfolios.

3. **DB access for plan limits:** Replace “load all, slice in JS” with queries that `orderBy: { updatedAt: "desc" }`, `take: propertyLimit`, and `include` mortgages only for those rows (same for deals if applicable). **Target:** Stable query time as total property count grows beyond the tier limit.

4. **Indexes:** Add Prisma indexes on `Property.userId`, `SavedDeal.userId`, and `RentCastApiCall(userId, createdAt)` (or equivalent) and validate with migration + `EXPLAIN` on estimate and count paths. **Target:** Sub-10ms count/lookup on typical tenant sizes (environment-dependent).

5. **Analytics `/api/me` churn:** Pass tier/counts from the server layout into a small client prop for PostHog, or debounce/throttle sync to coarse events (sign-in, tier change) instead of every pathname. **Target:** Zero extra `/api/me` calls during passive client navigation.

6. **Dashboard CPU:** Compute `computePropertyMetrics` once per property into a local variable reused for equity and cash-flow chart rows. **Target:** Small reduction in server CPU ms per dashboard request.

## Task candidates

- [ ] Introduce ISR/static shell for landing and legal/pricing routes; re-run build and confirm route table shows `○` or revalidated static where intended.
- [ ] Change `RentVsMarketSection` so stale benchmarks do not auto-POST for all properties; add UX for batch or per-row refresh with clear RentCast limit messaging.
- [ ] Refactor `takeFirstNByUpdatedAt` call sites to use limited Prisma queries for over-limit users.
- [ ] Add Prisma indexes for `Property.userId`, `SavedDeal.userId`, `RentCastApiCall(userId, createdAt)`; verify estimate `count` query plans.
- [ ] Replace pathname-driven `/api/me` polling for PostHog person properties with server-provided props or debounced sync.

## Re-test checklist

- [ ] Re-run `npm run build` and confirm route static/dynamic expectations for marketing pages.
- [ ] Manually open dashboard with multiple stale benchmarks — verify RentCast calls/hour and perceived latency.
- [ ] After any DB index migration, smoke-test `/api/estimates/value` and `/api/estimates/rent` under load (dev/staging).
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After major dashboard/property-list changes, RentCast integration changes, or monthly while user growth is material.
- **Recommended next run:** 2026-04-20 or next release candidate, whichever comes first.
