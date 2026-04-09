# Performance & Cost Audit — 2026-04-09

## Executive summary

- **Chart and heavy-UI patterns align with `docs/architecture-and-build-practices.md` §2.5:** dashboard charts use `next/dynamic` with `ssr: false` and loading placeholders (`app/app/(app)/dashboard/dashboard-charts.tsx`); `app/next.config.ts` sets `experimental.optimizePackageImports` for `lucide-react` and `recharts`; marketing tool calculators use lazy slots with `ssr: false` (`app/components/marketing/calculator-page-slots.tsx`, `app/components/marketing/calculator-location-slot.tsx`).
- **Variable spend and runtime risk concentrate in background jobs and third parties:** RentCast-driven monthly refresh (`app/app/api/cron/monthly-refresh/route.ts`, `app/lib/refresh.ts`), daily winback email cron that scans all qualifying users (`app/app/api/cron/winback-emails/route.ts`), Stripe billing sync on authenticated load (`app/app/(app)/app-layout-client.tsx`, `app/app/api/billing/sync/route.ts`), and Google Places proxy routes (`app/app/api/places/autocomplete/route.ts`, `app/app/api/places/details/route.ts`).
- **SEO calculator location URLs are pre-rendered at scale:** `generateStaticParams` on `app/app/tools/[calculator]/[location]/page.tsx` multiplies US locations by calculator slugs (~50 × 9 ≈ 450 static paths), increasing build time and artifact size versus fully dynamic marketing routes.
- **No `maxDuration` (or `runtime`) exports appear on cron/API routes in this pass** — long-running crons rely on default Vercel function limits; combined with unbounded per-user work in refresh and winback loops, this is a scale-sensitive reliability and cost footgun.

## Severity-ranked findings

### Critical

- None identified from static review alone (no evidence of immediate unmitigated data exfiltration or guaranteed production outage; external quotas and auth gates exist on hot APIs).

### High

- **Monthly RentCast refresh scales with eligible users and per-user property count** — Cron `GET /api/cron/monthly-refresh` processes up to `MAX_REFRESH_BATCH_SIZE` (100) users per invocation (`app/lib/refresh.ts` `DEFAULT_REFRESH_BATCH_SIZE = 10`, `MAX_REFRESH_BATCH_SIZE = 100`). `MAX_PROPERTIES_PER_USER_PER_RUN` is `Number.POSITIVE_INFINITY`, so a single user can trigger unbounded RentCast calls (`ESTIMATED_RENTCAST_CALLS_PER_PROPERTY = 2`) within one `processUserRefresh`. **Impact:** invoice spikes, upstream throttling, and function timeouts as the portfolio grows. **Evidence:** `app/app/api/cron/monthly-refresh/route.ts`, `app/lib/refresh.ts`, `vercel.json` (`/api/cron/monthly-refresh`).

- **Winback email cron loads all users with properties and iterates sequentially** — `prisma.user.findMany` with no `take`, then per-candidate `sendWinbackEmail` and DB updates (`app/app/api/cron/winback-emails/route.ts`). **Impact:** Resend usage and wall-clock time grow linearly with the user table; risk of hitting default serverless duration on Vercel without `maxDuration` or batching. **Evidence:** `app/app/api/cron/winback-emails/route.ts`, `vercel.json` (daily schedule).

- **Client-triggered Stripe billing sync on authenticated shell** — `AppLayoutClient` throttles `GET /api/billing/sync` via sessionStorage (~5 minutes) but still calls Stripe (`subscriptions.retrieve` / `list`) for users with `stripeCustomerId`. **Impact:** API volume and latency scale with paying cohorts; `router.refresh()` after success increases RSC work. **Evidence:** `app/app/(app)/app-layout-client.tsx`, `app/app/api/billing/sync/route.ts` (referenced in prior audits; pattern unchanged in architecture).

### Medium

- **PostHog server capture constructs a client and `shutdown()` per event** — `captureServerEvent` in `app/lib/posthog-server.ts` creates `new PostHog(...)` and awaits `shutdown()` for each call. Monthly refresh fires multiple events per processed user. **Impact:** extra latency inside cron loops and higher connection overhead vs a reused client or batched flush (within PostHog billing constraints).

- **~450 static calculator × state pages at build** — `app/app/tools/[calculator]/[location]/page.tsx` `generateStaticParams` crosses `LOCATION_DATA_US_STATES` with calculator defs. **Impact:** longer CI/`next build` and larger deployment surface; acceptable for SEO if monitored. **Evidence:** `app/app/tools/[calculator]/[location]/page.tsx`, `app/app/sitemap.ts` (`toolLocationPages`).

- **Database-backed rate limiting: count + create per successful action** — `checkRateLimit` + `recordRateLimit` (`app/lib/rate-limit.ts`). **Mitigation:** hourly `deleteMany` for rows older than one hour (`app/app/api/cron/rate-limit-cleanup/route.ts`). **Residual:** write amplification and Prisma load under traffic spikes.

- **Google Places routes bill upstream per keystroke/selection (with caps)** — Autocomplete and details proxy to Google with `cache: "no-store"`; limits `places:autocomplete` 120/h and `places:details` 60/h per user (`app/lib/rate-limit.ts`). **Impact:** Maps billing grows with active address-entry sessions.

- **Dashboard loads snapshots in a second query after portfolio payload** — `buildDashboardPortfolioPayload` then `prisma.propertySnapshot.findMany` for all property IDs (`app/app/(app)/dashboard/page.tsx`). **Impact:** two round-trips; not N+1, but could be merged or cached for very large portfolios.

- **Marketing homepage / articles use `dynamic()` without `ssr: false` for `PublicCalculator`** — `app/app/page.tsx`, `app/components/marketing/resource-article-page.tsx`, `app/components/marketing/competitor-alternative-page.tsx`. **Impact:** low for `public-calculator.tsx` (no Recharts); minor divergence from the strict §2.5 wording for “heavy” widgets.

### Low

- **Redundant `export const dynamic = "force-dynamic"` on `app/app/(app)/analyze/page.tsx`** — Parent `(app)/layout.tsx` already sets `force-dynamic`.

- **Third-party script and CSP surface on every document** — Clerk, PostHog gate, Google Ads gtag, Vercel Analytics, cookie consent (`app/app/layout.tsx`, `app/next.config.ts`). **Impact:** main-thread and network budget on all routes.

- **`calculator-location-slot.tsx` imports the full `calculator-page-slots` barrel** — All `dynamic()` factories are registered in one client chunk; runtime still loads only the active calculator’s async chunk. **Impact:** small extra wiring JS vs per-file imports (optional micro-optimization).

## Evidence reviewed

- **Process / template:** `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`.
- **Architecture (performance):** `docs/architecture-and-build-practices.md` §2.5.
- **Build / config:** `app/next.config.ts`, `vercel.json`, `app/package.json`.
- **Layouts / caching:** `app/app/(app)/layout.tsx` (`force-dynamic`, `unstable_cache` banner data, 30 s revalidate).
- **Dynamic imports / charts:** `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/refinance/refinance-workspace-loader.tsx`, `app/app/(app)/properties/[id]/amortization-chart-dynamic.tsx`, `app/components/marketing/calculator-page-slots.tsx`, `app/components/marketing/calculator-location-slot.tsx`, `app/components/marketing/calculator-location-page.tsx`.
- **Marketing entry pages:** `app/app/page.tsx`, `app/components/marketing/resource-article-page.tsx`, `app/components/marketing/competitor-alternative-page.tsx`.
- **Cron / external APIs:** `app/app/api/cron/monthly-refresh/route.ts`, `app/app/api/cron/winback-emails/route.ts`, `app/app/api/cron/rate-limit-cleanup/route.ts`, `vercel.json`; `app/lib/refresh.ts`, `app/lib/posthog-server.ts`, `app/app/api/places/autocomplete/route.ts`, `app/app/api/places/details/route.ts`, `app/lib/rate-limit.ts`.
- **Data loading:** `app/lib/server/portfolio-summary-payload.ts`, `app/app/(app)/dashboard/page.tsx`, `app/app/sitemap.ts`.

**Assumptions / limits:** No production bundle analyzer output, Web Vitals field data, Postgres `EXPLAIN` plans, or Vercel invoice data. Findings are from static code review and path tracing only.

**Correction vs earlier same-day draft:** `calculator-location-page.tsx` now composes `CalculatorLocationSlot`, which delegates to per-calculator `dynamic(..., { ssr: false })` exports in `calculator-page-slots.tsx`. A prior note claiming a single static import graph for all calculators on location pages is **obsolete** and has been removed.

## Risk & impact assessment

- **RentCast and cron batching:** Direct dollar and quota exposure as users and properties grow; batch size and lack of per-user property cap are the main levers before code changes to throttling.
- **Winback + other crons:** Sequential work over unbounded result sets risks timeouts and surprise Resend volume as the user base grows.
- **Stripe sync:** Acceptable at small scale; grows with customers who have `stripeCustomerId` and every cold navigation within the throttle window.
- **SSG marketing matrix:** Predictable build cost; monitor CI duration when adding states or calculators.

## Recommendations (prioritized)

1. **Cap per-user property work in monthly refresh and align cron `maxDuration` with worst-case runtime** — Set a finite `MAX_PROPERTIES_PER_USER_PER_RUN`, document RentCast budget vs batch size, and configure Vercel route segment config for long-running crons if on a plan that supports it.
2. **Batch or paginate winback processing** — Replace full-table `findMany` with keyed pagination, limit sends per invocation, or move to a queue so daily cron stays within function time limits.
3. **Reuse or batch PostHog server client in hot loops** — Avoid constructing and shutting down `PostHog` per event inside tight cron loops; use batching compatible with serverless (flush interval / shared module with care for concurrency).

## Task candidates (optional)

- [ ] Add explicit `maxDuration` (and monitoring) for `/api/cron/monthly-refresh` and `/api/cron/winback-emails` after measuring p95 duration in production.
- [ ] Introduce a finite per-user property cap in `processUserRefresh` with clear product/ops communication.
- [ ] Refactor `captureServerEvent` to reduce per-call client construction overhead in cron paths.
- [ ] Optional: merge dashboard portfolio + snapshot queries or add a short-lived cache for snapshot series where safe.

## Re-test checklist

- [ ] After cron changes: verify jobs complete within Vercel limits and RentCast/Resend dashboards show expected volumes.
- [ ] After bundle changes on marketing routes: run analyzer or compare client JS for a sample `/tools/{calculator}/{state}` URL.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Quarterly per `docs/architecture-and-build-practices.md`, or after major marketing expansion (new calculators/locations), billing changes, or new third-party APIs.
- **Recommended next run window:** 2026-07-09, or sooner if monthly RentCast, Resend, or Stripe usage exceeds budget thresholds.
