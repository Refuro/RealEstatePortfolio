# Performance & Cost Audit — 2026-03-31

## Executive summary

- **Overall:** The app follows documented patterns for heavy client libraries (Recharts via `next/dynamic` + `ssr: false`, `optimizePackageImports` for `lucide-react` and `recharts`) and applies tiered **RentCast** hourly caps plus indexed quota/rate-limit tables. Production `npm run build` completed successfully (Next.js 16.1.6); almost all routes are dynamic (`ƒ`), with `robots.txt` and `sitemap.xml` static.
- **Top risks:** The authenticated segment uses **`export const dynamic = "force-dynamic"`** on `(app)/layout.tsx`, so the whole protected surface opts out of static/ISR HTML caching at the layout level—compute and TTFB scale with traffic. **PostHog person-property sync** calls **`GET /api/me` on every pathname change**, adding repeated DB reads on client navigations when analytics is enabled.
- **Cost drivers:** **RentCast** (upstream API + `RentCastApiCall` rows per successful call), **Stripe** (checkout, portal, webhooks, sync), **Resend** (`/api/contact`), **PostHog** (client + `posthog-node` on billing webhook), **Clerk**, and **Neon/PostgreSQL** (Prisma workload including quota/rate-limit counts).
- **Recommendation:** Treat the app shell rendering model and analytics-driven `/api/me` fan-out as the first optimization targets if origin CPU or DB read rates become material; keep RentCast/Stripe behavior aligned with `docs/reference/rentcast-quota.md` and existing rate limits.

## Severity-ranked findings

### Critical

- (None identified in this pass.)

### High

- **Authenticated layout is globally `force-dynamic`.** Every page under `app/(app)/` is server-rendered on demand without layout-level static/ISR caching, increasing origin work per request versus a narrower dynamic boundary (architecture doc already notes preferring scoped `force-dynamic`). — **Impact:** Higher server CPU and latency at scale; harder to amortize HTML at the edge. — **Evidence:** `app/app/(app)/layout.tsx` (`export const dynamic = "force-dynamic"`), Next build route table (e.g. `/dashboard`, `/properties` as `ƒ`).

### Medium

- **`PostHogPersonProperties` refetches `/api/me` on every pathname change.** When `NEXT_PUBLIC_POSTHOG_KEY` is set and the user is loaded, each navigation runs two Prisma `count` queries (properties + deals) to refresh person properties. — **Impact:** Multiplied DB reads during normal app use; noise for connection pool and Neon billing. — **Evidence:** `app/components/analytics/posthog-person-properties.tsx` (`useEffect` depends on `pathname`), `app/app/api/me/route.ts` (`Promise.all` counts).

- **Dashboard duplicates portfolio load/metric shaping vs `buildPortfolioSummaryPayload`.** The dashboard server page performs its own `prisma.property.findMany` with `include: { mortgages: true }` and recomputes portfolio inputs/metrics in-line rather than reusing `buildPortfolioSummaryPayload` (or a shared internal loader). — **Impact:** Risk of formula drift vs API/export paths; redundant code paths if future navigation bundles multiple summaries. — **Evidence:** `app/app/(app)/dashboard/page.tsx`, `app/lib/server/portfolio-summary-payload.ts`.

- **RentCast routes always run a rolling-hour `count` before upstream work.** Each eligible request hits `prisma.rentCastApiCall.count` then, on success, `create`. — **Impact:** Predictable extra read per estimate/benchmark attempt; acceptable at current scale but hot if UI triggers bursts. — **Evidence:** `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`; index `RentCastApiCall_userId_createdAt_idx` (migration `20260328140000_rentcast_api_call_user_created_index`).

### Low

- **Architecture suggests optional `revalidate` for rarely changing legal pages; session-dependent `auth()` on marketing/legal pages keeps them dynamic anyway.** Adding `revalidate` alone would not snapshot-cache guest HTML without moving session checks (already described in `docs/architecture-and-build-practices.md` §2.5). — **Evidence:** `app/app/privacy/page.tsx` (`auth()`), build output `/privacy` as `ƒ`.

- **Root `<head>` preconnects RentCast and (conditionally) PostHog; Clerk origins are not preconnected.** Minor connection setup latency for `*.clerk.accounts.dev` on first load. — **Evidence:** `app/app/layout.tsx`, CSP comments in `app/next.config.ts`.

- **Stripe webhook may emit duplicate PostHog server events on Stripe retries** (documented; analytics noise, not DB idempotency failure for subscription rows). — **Evidence:** `docs/internal/stripe-webhook-posthog-idempotency.md`, `app/app/api/billing/webhook/route.ts`.

- **Heavy third-party stack on the critical path:** Clerk, Sentry wrapper (`withSentryConfig`), optional PostHog + Google Ads scripts increase JS payload and main-thread work versus a minimal shell (tradeoff accepted for product/security). — **Evidence:** `app/app/layout.tsx`, `app/next.config.ts`, `app/package.json`.

- **`@prisma/adapter-pg` resolves to v7 while `prisma` / `@prisma/client` are v6.x** in `app/package.json`—build succeeds today but cross-major pairing deserves awareness on upgrades. — **Evidence:** `app/package.json`, `app/lib/db.ts`.

## Evidence reviewed

- **Process & architecture:** `docs/process/performance-cost-audit-process.md`, `docs/architecture-and-build-practices.md` (§2.5 performance, external APIs).
- **Build & config:** `app/package.json`, `app/next.config.ts` (`optimizePackageImports`, Sentry), production `npm run build` output (2026-03-31).
- **Rendering:** `app/app/layout.tsx`, `app/app/(app)/layout.tsx` (`unstable_cache` banner data), `app/app/(app)/analyze/page.tsx`, `app/app/(app)/admin/layout.tsx`, `app/app/privacy/page.tsx`.
- **Bundles / heavy UI:** `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/properties/[id]/amortization-chart-dynamic.tsx`, `app/components/charts/*.tsx` (Recharts).
- **APIs & cost:** `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/app/api/rentcast-quota/route.ts`, `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`), `app/lib/rate-limit.ts`, `app/app/api/export/portfolio/route.ts`, `app/app/api/export/portfolio-summary/route.ts`, `app/app/api/me/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/lib/posthog-server.ts`, `app/app/api/contact/route.ts` (Resend import path not expanded in this pass—route exists).
- **Data access patterns:** `app/lib/server/portfolio-summary-payload.ts`, `app/app/api/deals/[id]/route.ts` (uses `buildPortfolioSummaryPayload`), Prisma schema indexes for `ApiRateLimitEntry` and `RentCastApiCall`.

**Limits:** No Lighthouse/Web Vitals field data; no bundle analyzer report checked in. Findings are code- and build-table–based.

## Risk & impact assessment

- **Users:** Chart loading is deferred client-side with placeholders—acceptable UX; full app shell dynamism may show as slower first byte on slow networks.
- **Spend:** RentCast and Stripe scale with product usage; PostHog/Clerk/Sentry scale with MAU and event volume. The `/api/me` fan-out mainly affects **database** read volume and app server concurrency, not external SaaS per se.
- **Likelihood:** Layout-level dynamism affects **every** authenticated hit. PostHog pathname refetch affects **every navigation** for opted-in analytics users.

## Recommendations (prioritized)

1. **Revisit `(app)/layout` dynamism** when scaling: validate whether `force-dynamic` can be narrowed (e.g. move volatile banner bits behind client fetch or a smaller server fragment) while preserving Clerk/user requirements—measure TTFB and origin CPU before/after.
2. **Throttle PostHog person-property sync:** e.g. debounce, sync only on tier/count–relevant events, or pass counts from server components once per layout instead of refetching on every `pathname` change.
3. **Unify dashboard portfolio loading** with `buildPortfolioSummaryPayload` (or extract a single `loadPortfolioSliceForUser` used by dashboard, `/api/portfolio/summary`, and deals) to remove duplicate Prisma + metric assembly paths.

## Task candidates

- [ ] Spike: reduce or debounce `PostHogPersonProperties` `/api/me` calls; confirm PostHog person properties still update after upgrade/add property.
- [ ] Refactor dashboard data path to share `buildPortfolioSummaryPayload` (extend return shape if chart rows need property metadata).
- [ ] Optional: add Clerk `preconnect`/`dns-prefetch` origins to `app/app/layout.tsx` if RUM shows connection delay.
- [ ] Optional: document or automate Prisma adapter + core version alignment on next major upgrade.

## Re-test checklist

- [ ] Verify fix for high-severity layout/dynamic or medium-severity `/api/me` finding with RUM or server metrics.
- [ ] Verify no regression on dashboard metrics vs `/api/portfolio/summary` / export if payload refactor ships.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly or after major changes to billing, RentCast, analytics, or app shell/layout auth.
- **Recommended next run:** 2026-04-30 (or next release window).
