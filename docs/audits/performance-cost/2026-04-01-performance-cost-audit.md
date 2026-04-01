# Performance & Cost Audit — 2026-04-01

## Executive summary

- **Overall:** Bundle and chart-loading posture is strong: `next.config.ts` uses `experimental.optimizePackageImports` for `lucide-react` and `recharts`; dashboard charts use `next/dynamic` with `ssr: false` and placeholders; the marketing homepage defers `PublicCalculator` via `next/dynamic` with a loading placeholder. The authenticated app shell uses `unstable_cache` (30s) for layout banner counts (`property`/`deal` counts + subscription), reducing repeated Prisma work on the hot path.
- **Resolved since prior audits:** `PostHogPersonProperties` no longer depends on `pathname`—it syncs from `GET /api/me` on mount and when the document becomes visible again, not on every client navigation. `dashboard/page.tsx` loads portfolio data through `buildDashboardPortfolioPayload`, which delegates to the same `loadPortfolioSummaryCore` used by `buildPortfolioSummaryPayload` (API/export alignment). Root `layout.tsx` adds RentCast preconnect, optional Clerk preconnect via `NEXT_PUBLIC_CLERK_PRECONNECT_ORIGIN`, or `dns-prefetch` for Clerk when unset.
- **Top risks:** `(app)/layout.tsx` exports `dynamic = "force-dynamic"`, so HTML for the authenticated segment is rendered per request with no layout-level static/ISR caching. `deal-analyzer-form.tsx` remains a very large single client boundary (~1,430 lines) with no internal code splitting.
- **Recommendation:** Keep monitoring SSR cost as traffic grows; prioritize splitting the deal analyzer when interactive time on `/analyze` becomes a concern. Optional: pass plan/count props from the server into PostHog to avoid the extra `/api/me` round-trip on mount (two Prisma counts) when analytics consent is on.

---

## Severity-ranked findings

### Critical

- (None identified.)

### High

- **Authenticated segment is globally `force-dynamic` at the layout.** `app/app/(app)/layout.tsx` sets `export const dynamic = "force-dynamic"` so every route under `(app)/` participates in request-time rendering; there is no edge-cached HTML for the app shell. Child routes such as `app/app/(app)/analyze/page.tsx` and admin layouts also declare `force-dynamic`, reinforcing the pattern. — **Impact:** SSR compute and TTFB scale with authenticated traffic; no amortization via static generation for the shell. — **Evidence:** `app/app/(app)/layout.tsx` (lines 15–16); `app/app/(app)/analyze/page.tsx` (`export const dynamic = "force-dynamic"`); `app/app/(app)/admin/layout.tsx` and `admin/page.tsx` (same).

### Medium

- **`DealAnalyzerForm` is a monolithic client module (~1,430 lines) without internal lazy boundaries.** The analyze flow lives under a single `"use client"` file; mobile/desktop layouts and compare UI ship together. — **Impact:** Larger initial JS for `/analyze`; slower time-to-interactive on slow networks. — **Evidence:** `app/app/(app)/analyze/deal-analyzer-form.tsx` (line count ~1,432; no `next/dynamic` internal splits).

- **Duplicate read patterns on a full dashboard load (layout + page).** `getLayoutBannerData` (via `unstable_cache`) runs `property.count`, `savedDeal.count`, and `subscription`; `loadPortfolioSummaryCore` (used by `buildDashboardPortfolioPayload`) runs `property.count` again plus `findMany` with mortgages. Same navigation can therefore issue overlapping counts—mitigated by the 30s layout cache for banner data, but cold or divergent paths still pay redundant queries. — **Impact:** Extra Prisma reads per first paint in a window; modest at current scale. — **Evidence:** `app/app/(app)/layout.tsx` (`getLayoutBannerData`, `unstable_cache`); `app/lib/server/portfolio-summary-payload.ts` (`loadPortfolioSummaryCore`).

### Low

- **`GET /api/me` (PostHog person properties) still performs two Prisma `count` queries when invoked.** After consent, `PostHogPersonProperties` calls `/api/me` on mount and on `visibilitychange` to visible—not on every route change. — **Impact:** Predictable small DB cost per session segment; lower priority than the prior pathname-driven fan-out. — **Evidence:** `app/components/analytics/posthog-person-properties.tsx`; `app/app/api/me/route.ts` (`Promise.all` on `property.count` and `savedDeal.count`).

- **RentCast quota: rolling-hour `count` before each upstream call.** Quota-consuming routes issue `prisma.rentCastApiCall.count` for the last hour before calling RentCast; successful calls insert a row. — **Impact:** One read (+ write on success) per estimate attempt; acceptable at current traffic. — **Evidence:** `docs/reference/rentcast-quota.md`; `app/app/api/estimates/rent/route.ts` (and sibling estimate/benchmark routes per quota doc).

- **Marketing and legal pages use request-time `auth()` / user checks, keeping them dynamic.** Per architecture notes, ISR would require moving session checks behind a client boundary. — **Impact:** Origin work per marketing visit; acceptable for current product. — **Evidence:** `docs/architecture-and-build-practices.md` (§2.5 Performance); `app/app/page.tsx` (`auth()`).

- **Portfolio CSV export duplicates portfolio slice query shape vs `loadPortfolioSummaryCore`.** `app/app/api/export/portfolio/route.ts` performs its own `property.count` + `findMany` with tier `take` rather than reusing `loadPortfolioSummaryCore`. — **Impact:** Maintenance/ drift risk if slice rules change; not a hot-path perf issue. — **Evidence:** `app/app/api/export/portfolio/route.ts` (lines ~47–57); `app/lib/server/portfolio-summary-payload.ts`.

- **Stripe webhook PostHog idempotency (analytics noise on retries).** Documented internal note. — **Evidence:** `docs/internal/stripe-webhook-posthog-idempotency.md`.

- **`@prisma/adapter-pg` v7 vs `prisma` / `@prisma/client` v6.x cross-major pairing.** Build currently succeeds; verify alignment on the next major Prisma upgrade. — **Evidence:** `app/package.json` (`@prisma/adapter-pg`, `@prisma/client`, `prisma` versions).

---

## Evidence reviewed

- **Process:** `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` (§2.5 Performance).
- **Reference:** `docs/reference/rentcast-quota.md`, `docs/internal/stripe-webhook-posthog-idempotency.md`.
- **Build & config:** `app/package.json`, `app/next.config.ts` (`optimizePackageImports`, Sentry wrapper, CSP headers, `outputFileTracingRoot` / Turbopack root).
- **Layouts:** `app/app/layout.tsx` (fonts, `PostHogGate`, preconnect/dns-prefetch for RentCast, Clerk, Stripe, PostHog), `app/app/(app)/layout.tsx` (`force-dynamic`, `unstable_cache` banner data).
- **Marketing:** `app/app/page.tsx` (`next/dynamic` for `PublicCalculator`, `auth()`, `next/image`).
- **App pages:** `app/app/(app)/dashboard/page.tsx` (`buildDashboardPortfolioPayload`), `app/app/(app)/dashboard/dashboard-charts.tsx` (`next/dynamic` + `ssr: false`), `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/analyze/page.tsx`.
- **Server data:** `app/lib/server/portfolio-summary-payload.ts` (`loadPortfolioSummaryCore`, `buildPortfolioSummaryPayload`, `buildDashboardPortfolioPayload`).
- **Client shell:** `app/app/(app)/app-layout-client.tsx` (billing sync with 5-minute `sessionStorage` throttle, portal return bypass).
- **Analytics:** `app/components/analytics/posthog-person-properties.tsx`, `app/components/analytics/posthog-provider.tsx`.
- **API (cost-related):** `app/app/api/me/route.ts`, `app/app/api/portfolio/summary/route.ts`, `app/app/api/properties/route.ts`, `app/app/api/export/portfolio/route.ts`, estimate/benchmark routes per RentCast quota doc.

**Audit limits:** No Lighthouse or field Web Vitals; no `@next/bundle-analyzer` output. Findings are static review and pattern-based. No application code changes were made (`app/` untouched).

---

## Risk & impact assessment

- **SSR / origin:** `force-dynamic` on `(app)/layout` affects all authenticated navigations; this is the dominant scaling cost until architecture shifts (e.g., more client-side or streamed data for volatile regions).
- **Database:** Layout cache and the PostHog `/api/me` change reduce unnecessary reads versus older pathname-driven behavior; remaining overlap between layout counts and dashboard `loadPortfolioSummaryCore` is a minor redundancy.
- **JS delivery:** The deal analyzer’s size is the main in-app bundle concern for `/analyze`; charts are already deferred.
- **External APIs:** RentCast, Stripe, PostHog, and Clerk usage match documented throttling and quota patterns; billing sync remains interval-throttled on the client.

---

## Recommendations (prioritized)

1. **When `/analyze` performance matters:** Split `deal-analyzer-form.tsx` with `next/dynamic` for non-critical regions (e.g., portfolio compare, mobile-only sections) so primary inputs hydrate first.
2. **Optional PostHog + DB efficiency:** Pass subscription tier and counts from the server layout (already computed for banners) into a thin client helper so `PostHogPersonProperties` can set person properties without `GET /api/me`, or keep `/api/me` but accept the current mount + visibility pattern as sufficient.
3. **Reduce overlapping counts (nice-to-have):** Reuse cached banner counts or a single server helper per request to avoid duplicate `property.count` between layout banner data and `loadPortfolioSummaryCore` where safe and correctness-preserving.
4. **Longer-term scaling:** Re-evaluate `(app)` `force-dynamic` only after profiling—e.g., whether volatile UI can move behind Suspense or client fetches to allow more caching at the layout edge.

---

## Task candidates

- [ ] Lazy-load sections of `deal-analyzer-form.tsx` via `next/dynamic` (preserve UX with skeletons).
- [ ] Optional: eliminate redundant `property.count` between `(app)/layout` cached banner path and `loadPortfolioSummaryCore` for dashboard navigations (design carefully for cache coherency).
- [ ] Optional: align portfolio CSV export with `loadPortfolioSummaryCore` or a shared “slice loader” to DRY tier limits and query shape.
- [ ] On next Prisma major: align `@prisma/adapter-pg` with `prisma` / `@prisma/client` majors per release notes.

---

## Re-test checklist

- [ ] After any deal-analyzer split: verify `/analyze` desktop and mobile flows and deep links with `dealId`.
- [ ] After any PostHog/server props change: verify person properties in PostHog after upgrade and property/deal changes.
- [ ] After DRY work on portfolio loaders: verify dashboard metrics vs `/api/portfolio/summary` and CSV export row selection.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Monthly, or after changes to app shell rendering, RentCast integration, analytics tree, or large new client bundles.
- **Recommended next run:** 2026-05-01 (or the next release window, whichever comes first).
