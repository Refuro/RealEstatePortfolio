# Performance & Cost Audit — 2026-03-28

## Executive summary

- **Overall:** `next.config.ts` enables **`experimental.optimizePackageImports`** for `lucide-react` and `recharts`. **Dashboard** portfolio charts follow the architecture pattern (`next/dynamic`, `ssr: false`, loading placeholders in `dashboard-charts.tsx`). **Modeling** and **mortgage** workspaces **lazy-load** heavy tab modules via `next/dynamic`, deferring the Recharts chunk until those routes are visited. **RentCast** usage is gated by **per-user hourly limits** tied to plan tier (`lib/plans.ts`, `getRentCastHourlyLimit`), with **preconnect** to `api.rentcast.io` in `app/layout.tsx`.
- **Top risks:** The **dashboard** `RentVsMarketSection` can issue a **sequential burst** of `POST /api/properties/:id/benchmark/refresh` calls on mount, consuming **up to the full hourly RentCast allowance** in one navigation and adding **multi-second latency**. **`RentCastApiCall`** has **no composite index** for the hot `count({ userId, createdAt })` guard, which will **degrade as rows accumulate**. **Estimate API routes** record **`rentCastApiCall` on failure** and return **HTTP 200** with an error payload in some paths, which **misaligns quota, observability, and client handling**.
- **Recommendation:** Treat dashboard benchmark auto-refresh as a **cost and UX control** (batch limits, user opt-in, or server-side scheduling); add **database indexing** for RentCast usage queries; **only count successful** third-party calls toward limits and use **consistent HTTP status codes**.

## Severity-ranked findings

### Critical

- *(none identified in this pass)*

### High

- **Dashboard benchmark auto-refresh burst** — On mount, `useEffect` iterates `refreshCandidates` and **awaits** `POST /api/properties/${id}/benchmark/refresh` **one after another**. A user with many stale/missing benchmarks can trigger **many RentCast calls in a single visit**, exhausting the hourly tier budget (e.g. 5–20/hour per `RENTCAST_HOURLY_LIMITS`) and stretching TTFI for that section. — `app/app/(app)/dashboard/rent-vs-market-section.tsx` (sequential loop ~lines 82–94).

- **Hourly RentCast limit query lacks supporting index** — Every RentCast-gated route runs `prisma.rentCastApiCall.count({ where: { userId, createdAt: { gte: oneHourAgo } } })`. The **`RentCastApiCall` model has no `@@index([userId, createdAt])`**, unlike `ApiRateLimitEntry` / `ContactFormSubmission`, so the guard can become **expensive** as call history grows. — `app/prisma/schema.prisma` (`RentCastApiCall`), used from `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`.

- **Failed RentCast calls still consume hourly quota** — In **`GET /api/estimates/rent`** and **`GET /api/estimates/value`**, the `catch` path calls `prisma.rentCastApiCall.create` even when **`fetchRentEstimate` / `fetchValueEstimate` fails**, so users **lose quota without a successful estimate**. **`/api/estimates/rent`** also returns **`status: 200`** with `{ error: message }` on failure, which complicates client handling and monitoring. — `app/app/api/estimates/rent/route.ts` (~119–124), `app/app/api/estimates/value/route.ts` (~96–101). **`benchmark/refresh`** records a row on failure as well — `app/app/api/properties/[id]/benchmark/refresh/route.ts` (~83–86).

### Medium

- **Authenticated shell is globally `force-dynamic`** — `app/app/(app)/layout.tsx` sets `export const dynamic = "force-dynamic"` with a comment that Clerk/user-specific data requires request-time rendering. This matches product reality but **conflicts with architecture guidance** to avoid root-level `force-dynamic` unless necessary; it **precludes static segment caching** for the whole `(app)` tree. Partial mitigation: **`unstable_cache`** for layout banner counts with **30s revalidation** (~lines 15–31).

- **Marketing/legal pages are not ISR-oriented** — **`/`, `/privacy`, `/terms`, `/changelog`** use **`auth()`** from Clerk (or similar) for nav personalization, with **no `export const revalidate`**. Per **`docs/architecture-and-build-practices.md` §2.5**, static or cached public pages are preferred; today these routes are **dynamic per request**, increasing **TTFB and edge cost** at scale compared to a static shell + client auth badge.

- **Landing/pricing use raw `<img>`** — Screenshots use **raw `<img>`** instead of **`next/image`**, which can hurt **LCP** and bypass **automatic optimization** — `app/app/page.tsx`, `app/app/pricing/page.tsx` (per §2.5 images guidance).

### Low

- **Heavy projection simulation loops** — `projections-tab-content.tsx` runs **nested month/year loops** for amortization and hold-horizon tables (`for (let month…)`, `for (let year…)`). For typical single-property horizons this is fine; **very long horizons or many mortgages** could increase **main-thread time** on low-end devices. — `app/app/(app)/properties/[id]/projections-tab-content.tsx`.

- **Recharts still bundled inside lazy chunks** — `projections-tab-content.tsx` and `mortgage-tab-content.tsx` import **recharts at module top**; **modeling** / **mortgage** routes load these via **`next/dynamic`**, so the cost is **deferred** until those pages load. Further splitting (e.g. dynamic around chart subcomponents only) is optional polish.

- **Billing sync on app load** — Paid users trigger **`GET /api/billing/sync`** at most every **5 minutes** per session (`app-layout-client.tsx`), bounded and reasonable; **Stripe list** call is **limit 1**. Low residual risk.

## Evidence reviewed

- `docs/architecture-and-build-practices.md` §2.5 (Performance Practices)
- `docs/process/performance-cost-audit-process.md` (scope)
- `app/next.config.ts` — `optimizePackageImports`, headers
- `app/app/layout.tsx` — fonts, analytics, RentCast preconnect, third-party scripts
- `app/app/(app)/layout.tsx` — `force-dynamic`, `unstable_cache` for banner data
- `app/app/(app)/dashboard/page.tsx`, `dashboard-charts.tsx`, `rent-vs-market-section.tsx`
- `app/lib/integrations/rentcast.ts` — timeouts, 429 handling
- `app/lib/plans.ts` — `RENTCAST_HOURLY_LIMITS`, `getRentCastHourlyLimit`
- `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`
- `app/prisma/schema.prisma` — `RentCastApiCall`, `ApiRateLimitEntry`, indexes
- `app/lib/rate-limit.ts` — Prisma-backed rate limits for writes/import
- `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx` — dynamic imports
- `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/privacy/page.tsx`, `app/app/terms/page.tsx` — render/auth patterns
- `app/package.json` — dependency footprint (Recharts, Clerk, Sentry, PostHog, Stripe, etc.)

**Assumptions / limits:** No production Web Vitals, bundle analyzer output, or load tests were run; findings are from **static code review** and **documented architecture**. Runtime behavior may vary with traffic and hosting configuration.

## Risk & impact assessment

- **User impact:** Dashboard benchmark burst can cause **slow dashboard loads** and **surprise “out of estimates”** states until the hourly window resets. **Quota on failed calls** erodes trust and increases support friction.
- **Cost impact:** RentCast and **Stripe/PostHog/Sentry** scale with usage; **uncontrolled bursts** and **missing DB indexes** raise **marginal cost and latency** as MAU grows.
- **Likelihood:** Dashboard auto-refresh runs for **every eligible user** visiting the dashboard with stale benchmarks — **high exposure** for active portfolios.

## Recommendations (prioritized)

1. **Change dashboard benchmark behavior** — Replace unbounded sequential auto-refresh with **at most one automatic refresh per visit**, **explicit user action**, or **server-side job**; if batching remains, **parallelize only within** a small cap and respect **global hourly limits** with clear UI when the cap is reached.
2. **Add `@@index([userId, createdAt])` (or equivalent)** on `RentCastApiCall` and verify query plans for the hourly `count`.
3. **Align RentCast accounting with outcomes** — Record **`rentCastApiCall` only after a successful upstream response** (or split “attempt” vs “success” metrics). Return **non-2xx** for true failures from estimate routes; keep **429** when the hourly cap applies.
4. **Revisit marketing page static strategy** — e.g. **`revalidate`** on mostly-static content, or **split** static marketing layout from a small client component for signed-in nav.
5. **Migrate hero/marketing images to `next/image`** where appropriate for LCP.

## Task candidates (optional)

- [ ] Cap or remove automatic sequential benchmark refresh on dashboard load; document product rules in `docs/reference/roadmap.md` or tasks if behavior changes.
- [ ] Add Prisma migration: `@@index([userId, createdAt])` on `RentCastApiCall`.
- [ ] Adjust estimate and benchmark routes: record usage only on success; normalize HTTP status for errors; add tests for quota + failure paths.
- [ ] Add `revalidate` or static generation strategy for `/`, `/privacy`, `/terms`, `/changelog` (evaluate Clerk/auth tradeoffs).
- [ ] Replace marketing `<img>` with `next/image` on landing and pricing.
- [ ] Optional: run `@next/bundle-analyzer` on `app/` build and attach baseline to a future audit.

## Re-test checklist

- [ ] Verify dashboard benchmark behavior under **10+ stale properties** (latency, number of RentCast calls, hourly limit messaging).
- [ ] Verify **estimate failure** no longer consumes hourly quota incorrectly; confirm **HTTP status** behavior for API clients.
- [ ] Explain / index check on `RentCastApiCall` count in staging DB.
- [ ] Lighthouse or Web Vitals on `/` and `/dashboard` after changes.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Major chart dependency upgrade, new third-party paid API, or noticeable **Vercel / DB** bill growth.
- **Recommended next run:** Within **one month**, or before **significant traffic** increase post-launch.
