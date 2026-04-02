# Performance & Cost Audit — 2026-04-01 (pass 2)

## Executive summary

- **Overall:** Second independent pass confirms the stack matches documented performance practices: `next.config.ts` enables `experimental.optimizePackageImports` for `lucide-react` and `recharts`; dashboard charts and marketing `PublicCalculator` use `next/dynamic` with loading placeholders; modeling and mortgage workspaces lazy-load `ProjectionsTabContent` / `MortgageTabContent` with `ssr: false`, isolating large Recharts-heavy chunks from the initial route shell. The authenticated `(app)` layout uses `unstable_cache` (30s) for banner counts and subscription snapshot, trimming repeated Prisma work on navigation within the cache window.
- **Strengths:** Root `layout.tsx` preconnects RentCast and PostHog (when configured), dns-prefetches Clerk/Stripe as appropriate. Property detail IA routes legacy `?tab=mortgage|projections` to dedicated `/mortgage` and `/modeling` routes, so the core property page does not ship the projections/mortgage chart bundles. Server-side Stripe webhook PostHog emissions use `StripePosthogDedup` so retries do not duplicate capture (see internal doc).
- **Top risks:** `export const dynamic = "force-dynamic"` on `app/(app)/layout.tsx` keeps all authenticated HTML on the request-time path; SSR/origin cost scales linearly with signed-in traffic. `deal-analyzer-form.tsx` remains a single large client boundary (~1,389 lines) without internal lazy splits.
- **Recommendation:** Treat layout-level dynamism as acceptable until profiling proves otherwise; prioritize internal code-splitting for `/analyze` when bundle or TTI metrics warrant it. Optional follow-up: reduce duplicate `property.count` between cached layout banner data and `loadPortfolioSummaryCore` on cold paths, or feed PostHog person props from server-computed banner data to skip redundant `/api/me` work.

---

## Severity-ranked findings

### Critical

- (None identified.)

### High

- **Authenticated segment is globally `force-dynamic` at the layout.** `app/app/(app)/layout.tsx` sets `export const dynamic = "force-dynamic"`, so HTML for routes under `(app)/` is rendered per request without static/ISR amortization for the shell. Additional `force-dynamic` declarations appear on `analyze/page.tsx`, `admin/layout.tsx`, and `admin/page.tsx`. — **Impact:** TTFB and SSR compute grow with authenticated traffic; no edge-cached HTML for the app chrome. — **Evidence:** `app/app/(app)/layout.tsx` (lines 15–16); `app/app/(app)/analyze/page.tsx`; `app/app/(app)/admin/layout.tsx`; `app/app/(app)/admin/page.tsx`.

### Medium

- **`DealAnalyzerForm` is a monolithic client module (~1,389 lines) without internal lazy boundaries.** The analyze flow ships as one `"use client"` unit; compare and responsive branches are not split with `next/dynamic`. — **Impact:** Larger initial JS for `/analyze`; slower time-to-interactive on constrained networks. — **Evidence:** `app/app/(app)/analyze/deal-analyzer-form.tsx` (line count ~1,389; no internal `next/dynamic` splits).

- **`ProjectionsTabContent` and `MortgageTabContent` are very large client modules with direct Recharts imports.** Each file is 1,000+ lines and imports Recharts symbols at module top. They are not loaded on the property overview path because `property-detail-tabs.tsx` redirects legacy tabs to `/modeling` and `/mortgage`; those routes load the tab content via `next/dynamic` + `ssr: false` in `modeling-workspace.tsx` and `mortgage-workspace.tsx`. — **Impact:** When users open modeling or mortgage tools, they still download a heavy combined chunk; maintainability and parse/compile cost remain high. — **Evidence:** `app/app/(app)/properties/[id]/projections-tab-content.tsx` (Recharts imports lines 17–27); `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (lines 17–25); `app/app/(app)/modeling/modeling-workspace.tsx` (dynamic import, lines 9–19); `app/app/(app)/mortgage/mortgage-workspace.tsx` (dynamic import, lines 9–19).

- **Overlapping Prisma read patterns on a full dashboard cold load.** `getLayoutBannerData` (wrapped in `unstable_cache` for 30s) runs `property.count`, `savedDeal.count`, and `subscription.findUnique`. `loadPortfolioSummaryCore` (used by `buildDashboardPortfolioPayload`) runs `property.count` again plus `findMany` with mortgages. First navigation in a window can still pay both shapes of work; the layout cache mitigates repeats within 30s. — **Impact:** Extra reads on cold or cache-miss paths; modest at current scale. — **Evidence:** `app/app/(app)/layout.tsx` (`getLayoutBannerData`, `unstable_cache`); `app/lib/server/portfolio-summary-payload.ts` (`loadPortfolioSummaryCore`, lines 8–18).

### Low

- **`GET /api/me` performs two Prisma `count` queries when invoked.** `PostHogPersonProperties` calls `/api/me` on mount and when the document becomes visible—not on every client navigation. — **Impact:** Small, predictable DB cost per visibility segment when PostHog is enabled. — **Evidence:** `app/components/analytics/posthog-person-properties.tsx`; `app/app/api/me/route.ts` (lines 16–18).

- **RentCast quota enforcement: rolling-hour `count` before upstream calls.** Estimate routes query `prisma.rentCastApiCall.count` for the last hour before calling RentCast; successful calls insert a row. — **Impact:** One count read (+ write on success) per estimate attempt; aligned with quota docs. — **Evidence:** `docs/reference/rentcast-quota.md`; `app/app/api/estimates/rent/route.ts`; `app/app/api/estimates/value/route.ts`.

- **Marketing home uses `auth()` and deferred calculator; pages remain request-time for session-aware nav.** Per architecture, ISR would require moving session checks client-side. — **Impact:** Origin work per landing visit; acceptable for current positioning. — **Evidence:** `docs/architecture-and-build-practices.md` (§2.5 Performance); `app/app/page.tsx` (`auth()` usage alongside `dynamic` for `PublicCalculator`).

- **Portfolio CSV export duplicates the portfolio slice query shape instead of reusing `loadPortfolioSummaryCore`.** `GET` handler runs `property.count` + `findMany` with tier `take` inline. — **Impact:** Drift risk if slice rules change; not primarily a hot-path latency issue given export rate limits. — **Evidence:** `app/app/api/export/portfolio/route.ts` (lines 47–57); `app/lib/server/portfolio-summary-payload.ts`.

- **`@prisma/adapter-pg` (v7) paired with `prisma` / `@prisma/client` (v6.x).** Build currently succeeds; verify release-note compatibility on the next coordinated upgrade. — **Evidence:** `app/package.json` (`@prisma/adapter-pg`, `@prisma/client`, `prisma` versions).

---

## Evidence reviewed

- **Process:** `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` (§2.5 Performance).
- **Reference:** `docs/reference/rentcast-quota.md`, `docs/internal/stripe-webhook-posthog-idempotency.md`.
- **Build & config:** `app/package.json`, `app/next.config.ts` (`optimizePackageImports`, `outputFileTracingRoot`, `turbopack.root`, Sentry wrapper).
- **Layouts & shell:** `app/app/layout.tsx` (preconnect/dns-prefetch), `app/app/(app)/layout.tsx` (`force-dynamic`, `unstable_cache`), `app/app/(app)/app-layout-client.tsx` (billing sync throttle).
- **Marketing:** `app/app/page.tsx` (`next/dynamic` for calculator, `auth()`).
- **Dashboard:** `app/app/(app)/dashboard/dashboard-charts.tsx` (`next/dynamic`, `ssr: false` for chart components).
- **Analyze & workspaces:** `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/analyze/page.tsx`, `modeling-workspace.tsx`, `mortgage-workspace.tsx`, `property-detail-tabs.tsx` (tab redirect behavior).
- **Server data:** `app/lib/server/portfolio-summary-payload.ts`.
- **APIs:** `app/app/api/me/route.ts`, `app/app/api/export/portfolio/route.ts`, RentCast estimate routes.

**Audit limits:** No Lighthouse, field Web Vitals, or `@next/bundle-analyzer` output. Findings are static review and architecture alignment. No application source changes were made (`app/` untouched).

---

## Risk & impact assessment

- **SSR / origin:** Layout-level `force-dynamic` is the main scaling lever for authenticated HTML; caching is limited to the 30s `unstable_cache` banner slice, not full-page static generation.
- **Database:** Redundant counts between layout and portfolio summary are a minor cold-path cost; `/api/me` adds small incremental load for analytics enrichment.
- **JS delivery:** Largest in-app concerns are monolithic client modules (`deal-analyzer-form`, projections/mortgage tab bodies) rather than dashboard charts, which are already deferred.
- **External APIs & vendor cost:** RentCast quota, Stripe, PostHog, and Clerk usage follow documented patterns; export is rate-limited.

---

## Recommendations (prioritized)

1. **When `/analyze` bundle or TTI becomes a metric:** Split `deal-analyzer-form.tsx` with `next/dynamic` for non-critical regions (compare, secondary panels) and use skeletons consistent with existing chart placeholders.
2. **Optional modeling/mortgage maintainability:** Internally split `projections-tab-content.tsx` / `mortgage-tab-content.tsx` (e.g., chart subcomponents or lazy chart islands) to reduce parse cost and improve chunk granularity without changing UX—only if profiling shows benefit.
3. **Optional PostHog + DB efficiency:** Pass tier and counts from the server layout (already computed for banners) into a minimal client helper so `PostHogPersonProperties` can avoid `GET /api/me` when safe, or accept the current mount + visibility pattern as sufficient.
4. **Optional query deduplication:** On cold dashboard loads, explore reusing cached banner counts or a single request-scoped helper for `property.count` where correctness and cache coherency allow.
5. **Longer-term:** Revisit `(app)` `force-dynamic` only after measurement—e.g., whether volatile regions can stream or client-fetch to unlock more caching.

---

## Task candidates (optional)

- [ ] Lazy-load sections of `deal-analyzer-form.tsx` via `next/dynamic` with loading placeholders.
- [ ] Optional: reduce redundant `property.count` between `(app)/layout` cached banner path and `loadPortfolioSummaryCore` where correctness permits.
- [ ] Optional: align portfolio CSV export with `loadPortfolioSummaryCore` or a shared slice loader for consistent tier limits and query shape.
- [ ] Optional: split large projections/mortgage tab files for maintainability and finer chunks if bundle analysis warrants.
- [ ] On next Prisma major upgrade: align `@prisma/adapter-pg` with `prisma` / `@prisma/client` per release notes.

---

## Re-test checklist

- [ ] After any deal-analyzer split: verify `/analyze` desktop/mobile and deep links with `dealId`.
- [ ] After any PostHog/server props change: verify person properties in PostHog after property/deal changes.
- [ ] After DRY work on portfolio loaders: verify dashboard vs `/api/portfolio/summary` and CSV export selection.
- [ ] After modeling/mortgage refactors: verify `/modeling` and `/mortgage` with `propertyId` query params.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Monthly, or after changes to app shell rendering, RentCast integration, analytics tree, modeling/mortgage tabs, or large new client bundles.
- **Recommended next run:** 2026-05-01 (or the next release window, whichever comes first).
