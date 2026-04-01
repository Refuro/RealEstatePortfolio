# Performance & Cost Audit — 2026-04-01

## Executive summary

- **Overall:** The app's foundational performance posture is unchanged since the 2026-03-31 audit. Recharts is correctly deferred via `next/dynamic` + `ssr: false` on dashboard and workspace pages; `optimizePackageImports` covers `lucide-react` and `recharts`; `(app)/layout.tsx` banner counts are served from a 30-second `unstable_cache` rather than raw DB hits. RentCast quota enforcement and Stripe billing sync remain correctly scoped and throttled.
- **Top risks (unresolved from prior audit):** The authenticated segment is globally `force-dynamic`, making every request under `(app)/` an origin-rendered SSR hit with no layout-level HTML caching. `PostHogPersonProperties` continues to issue `GET /api/me` (two Prisma `count` queries) on **every client-side navigation** when analytics consent is given.
- **New findings:** `DealAnalyzerForm` (~1,400 lines) is a monolithic client component with no internal code splitting. `PublicCalculator` is statically imported (not `next/dynamic`) on the marketing homepage, pulling a ~540-line client component including a `useUser()` Clerk hook into the initial page bundle. Neither is a critical blocker today, but both inflate the JS payload for their respective pages.
- **Recommendation:** Prior high/medium recommendations remain the top queue: throttle the `/api/me` fan-out from `PostHogPersonProperties`, unify the dashboard data path with `buildPortfolioSummaryPayload`, and—when scaling—evaluate narrowing `force-dynamic` at the layout level.

---

## Severity-ranked findings

### Critical

- (None identified.)

### High

- **Authenticated layout is globally `force-dynamic` (unresolved from 2026-03-31).** Every route under `app/(app)/` is origin-rendered per request at the layout level; no HTML caching or ISR amortizes repeated visits. Child pages also export `dynamic = "force-dynamic"` independently (e.g. `analyze/page.tsx`), making the current pattern intentional but costly at scale. — **Impact:** SSR compute and TTFB scale linearly with authenticated traffic; no edge-cached HTML for the app shell. — **Evidence:** `app/app/(app)/layout.tsx` (`export const dynamic = "force-dynamic"`); `app/app/(app)/analyze/page.tsx` (same); build route table shows all `(app)/` routes as `ƒ`.

### Medium

- **`PostHogPersonProperties` refetches `/api/me` on every pathname change (unresolved from 2026-03-31).** Each navigation for a consented, authenticated user triggers two Prisma `count` queries (`property.count`, `savedDeal.count`) on the database. The component runs unconditionally inside `PostHogGate` at root layout, which is present on all pages. — **Impact:** Multiplied DB reads proportional to navigation frequency; elevated Neon/PostgreSQL read billing and connection pool pressure at scale. — **Evidence:** `app/components/analytics/posthog-person-properties.tsx` (effect deps: `[isLoaded, user?.id, pathname]`); `app/app/api/me/route.ts` (`Promise.all` counting properties and deals).

- **Dashboard page duplicates portfolio data loading versus `buildPortfolioSummaryPayload` (unresolved from 2026-03-31).** `dashboard/page.tsx` performs its own `prisma.property.findMany` with `include: { mortgages: true }`, maps portfolio inputs, and calls `computePortfolioMetrics` and `computePropertyMetrics` inline. `buildPortfolioSummaryPayload` (used by `/api/portfolio/summary`, `/api/export/portfolio-summary`, and deal context) is an independent, nearly identical code path. — **Impact:** Duplicated Prisma query paths; risk of metric formula drift between dashboard and API/export surfaces. — **Evidence:** `app/app/(app)/dashboard/page.tsx` (lines 37–104); `app/lib/server/portfolio-summary-payload.ts` (matching `findMany` + `computePortfolioMetrics` pattern).

- **`DealAnalyzerForm` is a monolithic ~1,400-line client component with no internal code splitting.** The form includes full desktop and mobile layouts (`MobileToolShell`, `MobileSectionCard`, `MobileCollapsible`), all state hooks, and the portfolio compare block in a single client bundle. It always loads in full at `/analyze` regardless of whether a dealId is present or the user is on mobile. — **Impact:** Larger initial JS payload for the analyze page; slower interactive time on low-bandwidth connections. — **Evidence:** `app/app/(app)/analyze/deal-analyzer-form.tsx` (file length ~1,400 lines; single `"use client"` boundary, no `next/dynamic` internal splits).

### Low

- **`PublicCalculator` is statically imported on the marketing homepage.** `app/app/page.tsx` imports `PublicCalculator` directly rather than via `next/dynamic`. The component (~540 lines, `"use client"`) invokes `useUser()` from Clerk, meaning Clerk's React hook module is pulled into the homepage's initial client bundle. — **Impact:** Modest JS overhead on the primary acquisition page; `PublicCalculator` could be deferred with a loading placeholder using `next/dynamic`. — **Evidence:** `app/app/page.tsx` (`import { PublicCalculator } from "@/components/marketing/public-calculator"`); `app/components/marketing/public-calculator.tsx` (`useUser` from `@clerk/nextjs`; ~540 lines).

- **RentCast quota check runs a rolling-hour `count` before each upstream call (known, accepted).** All three quota-consuming routes (`/api/estimates/rent`, `/api/estimates/value`, `/api/properties/[id]/benchmark/refresh`) issue a `prisma.rentCastApiCall.count` with `createdAt: { gte: oneHourAgo }` before the external call, then a `create` on success. At current traffic this is acceptable; the index `RentCastApiCall_userId_createdAt_idx` keeps it efficient. — **Impact:** Predictable 1 read + 1 write per estimate attempt; could become a burst hotspot if UI allows rapid re-attempts. — **Evidence:** `app/app/api/estimates/rent/route.ts`; `app/app/api/estimates/value/route.ts`; `app/app/api/properties/[id]/benchmark/refresh/route.ts`.

- **Marketing and legal pages call `auth()` at request time, keeping them dynamic.** `/privacy`, `/terms`, `/contact`, `/pricing`, and `app/page.tsx` (homepage) call `auth()` or use `getAppUser()` for conditional UI, opting them out of static generation. Adding `revalidate` alone would not produce edge-cached HTML without removing the session check first. — **Impact:** Minor origin cost per marketing page visit; consistent with current product design. — **Evidence:** `app/app/page.tsx` (`await auth()`); `app/app/privacy/page.tsx`; build table shows marketing routes as `ƒ`.

- **Stripe webhook may emit duplicate PostHog server events on retry (documented, analytics noise only).** — **Evidence:** `docs/internal/stripe-webhook-posthog-idempotency.md` (carried from prior audit).

- **`@prisma/adapter-pg` v7 vs `prisma`/`@prisma/client` v6.x cross-major pairing (carried from prior audit).** Build currently succeeds; alignment should be verified on next major upgrade. — **Evidence:** `app/package.json` (`@prisma/adapter-pg: ^7.5.0`, `@prisma/client: ^6.19.2`).

- **Clerk origins not preconnected in `<head>`.** `app/app/layout.tsx` preconnects RentCast and conditionally PostHog but not `*.clerk.accounts.dev`. Minor DNS/TCP setup latency on first authenticated render. — **Evidence:** `app/app/layout.tsx` (lines 120–129).

---

## Evidence reviewed

- **Process:** `docs/process/performance-cost-audit-process.md`, `docs/reference/rentcast-quota.md`.
- **Plans/limits:** `app/lib/plans.ts` (`RENTCAST_HOURLY_LIMITS`, `getEffectiveTier`).
- **Build & config:** `app/package.json`, `app/next.config.ts` (`optimizePackageImports`, Sentry wrapper, CSP).
- **Root & app layout:** `app/app/layout.tsx` (Geist fonts, PostHogGate, preconnect), `app/app/(app)/layout.tsx` (`force-dynamic`, `unstable_cache` banner, `getLayoutBannerData`).
- **Marketing pages:** `app/app/page.tsx` (homepage, `PublicCalculator`, `ScreenDashboard.png` with `<Image>`), `app/app/pricing/page.tsx`.
- **App pages:** `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/analyze/page.tsx`, `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/properties/[id]/page.tsx`.
- **Server data:** `app/lib/server/portfolio-summary-payload.ts`, `app/app/api/portfolio/summary/route.ts`.
- **Client app shell:** `app/app/(app)/app-layout-client.tsx` (billing sync, drawer, 5-min sessionStorage throttle).
- **Chart loading:** `app/app/(app)/dashboard/dashboard-charts.tsx` (`next/dynamic` for all three chart components), `app/app/(app)/modeling/modeling-workspace.tsx` (`next/dynamic` for `ProjectionsTabContent`), `app/components/charts/amortization-chart.tsx` (direct recharts import, covered by `optimizePackageImports`), `app/components/charts/chart-wrapper.tsx`.
- **Analytics components:** `app/components/analytics/posthog-person-properties.tsx`, `app/components/analytics/posthog-provider.tsx` (gate + consent), `app/components/analytics/posthog-signup-once.tsx` (localStorage dedup).
- **API routes (cost):** `app/app/api/me/route.ts`, `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/app/api/rentcast-quota/route.ts`, `app/app/api/billing/sync/route.ts`, `app/app/api/billing/portal/route.ts`.
- **Instrumentation:** `app/instrumentation.ts` (Sentry server/edge import on register).
- **Prior audit:** `docs/audits/performance-cost/2026-03-31-performance-cost-audit.md`.

**Audit limits:** No Lighthouse/Web Vitals field data reviewed; no bundle analyzer output. Findings are code- and pattern-based. No code changes made.

---

## Risk & impact assessment

- **DB read volume:** The `/api/me` pathname fan-out is the most exposed DB cost driver for analytics users. At low MAU it is noise; at meaningful scale it becomes a measurable Neon read and connection load item.
- **Origin compute:** `force-dynamic` at the layout level means the app shell is re-rendered server-side on every authenticated navigation. This is the dominant per-request cost vector and scales directly with active sessions.
- **JS payload:** `DealAnalyzerForm` and `PublicCalculator` affect JS size on their respective pages. Neither carries chart libraries, so the absolute weight is modest, but there is room for deferred loading of secondary UI regions in the deal form.
- **External API cost:** RentCast, Stripe, PostHog, Clerk, and Resend all behave within documented bounds. Stripe billing sync is correctly throttled to 5 minutes via `sessionStorage`. No new unthrottled external call patterns found.
- **Likelihood:** High-severity finding (layout dynamism) affects 100% of authenticated requests. Medium-severity PostHog `/api/me` fan-out affects all navigating users with analytics consent. Dashboard duplication is a latent code-quality risk rather than a live performance issue at current scale.

---

## Recommendations (prioritized)

1. **Throttle `PostHogPersonProperties` `/api/me` fan-out.** Replace the raw `pathname` dependency with event-driven sync: fire on mount once (plus after property/deal mutations) rather than on every route change. Alternatively, pass plan tier and counts from the server layout into the client via props so no runtime fetch is needed.
2. **Unify dashboard portfolio data loading with `buildPortfolioSummaryPayload`.** Extract a shared `loadPortfolioSliceForUser(user, { includePropertyNames: true })` server function usable by `dashboard/page.tsx`, `/api/portfolio/summary`, and export paths. This eliminates the duplicate Prisma + metric-assembly pattern and reduces formula-drift risk.
3. **Lazy-load `DealAnalyzerForm` secondary regions.** Split the mobile section cards and the portfolio compare block into `next/dynamic` sub-components so the critical form fields and metric readout load first, deferring the portfolio comparison table and mobile shell variants.
4. **Evaluate `PublicCalculator` dynamic import on the homepage.** Wrap the marketing homepage calculator in `next/dynamic` with a skeleton placeholder; this moves the Clerk `useUser` hook and the ~540-line component out of the homepage's initial JS bundle.
5. **Revisit `(app)/layout` `force-dynamic`** when scaling: profile whether the volatile banner bits (property/deal counts, subscription status) could be served from a client fetch or streamed Suspense boundary, allowing the layout HTML itself to be statically cached at the edge.

---

## Task candidates

- [ ] Replace `PostHogPersonProperties` `pathname` dependency with mount-once + post-mutation sync; confirm person properties still update after upgrade/add-property.
- [ ] Refactor dashboard data path to call a shared server loader (extending `buildPortfolioSummaryPayload` with property display names for chart data).
- [ ] Split `DealAnalyzerForm` — lazy-load portfolio compare block and mobile shell sections via `next/dynamic`.
- [ ] Wrap `PublicCalculator` on homepage in `next/dynamic` to defer Clerk hook and component JS from initial bundle.
- [ ] Optional: add `preconnect`/`dns-prefetch` for Clerk origins in `app/app/layout.tsx`.

---

## Re-test checklist

- [ ] Verify PostHog person properties still update correctly after plan upgrade and property add if `/api/me` call pattern changes.
- [ ] Verify dashboard metric values match `/api/portfolio/summary` and `/api/export/portfolio-summary` after any data path unification.
- [ ] Confirm deal analyzer form UX is unchanged on mobile and desktop after any code-splitting changes.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Monthly, or after any change to billing, RentCast integration, analytics component tree, or app shell rendering strategy.
- **Recommended next run:** 2026-05-01 (or next release window, whichever comes first).
