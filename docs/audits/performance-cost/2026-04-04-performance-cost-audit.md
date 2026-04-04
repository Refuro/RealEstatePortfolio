# Performance & Cost Audit — 2026-04-04

## Executive summary

- **Overall health is solid:** The app follows documented patterns for heavy UI (Recharts behind `next/dynamic` with `ssr: false` in `dashboard-charts.tsx`, `modeling-workspace.tsx`, `mortgage-workspace.tsx`, `refinance-workspace-loader.tsx`), `experimental.optimizePackageImports` for `lucide-react` and `recharts` in `next.config.ts`, and 200 calculator location pages pre-rendered at build time via `generateStaticParams`.
- **Yesterday's open items are largely resolved:** RentCast quota fetches are deduplicated via `lib/rentcast-quota-client.ts` (in-flight request sharing + module-level cache). `images.localPatterns` wildcard has been removed from `next.config.ts`. `MockupFrame` gained a `min-h-[min(28rem,65vh)]` guard for non-`fitToHeight` frames, eliminating the zero-height first paint — residual CLS between reserved min-height and final scaled height remains worth verifying in the field.
- **Top cost surfaces:** External spend and quota pressure concentrate on **RentCast** (hourly per-user limits, `RentCastApiCall` logging, composite index) and **Stripe** (billing sync, webhooks, checkout — bounded by client-side throttling and route rate limits). **PostHog** is used on the client (after consent) and server for billing events with webhook deduplication.
- **Upcoming PDF export feature is the highest-latent performance risk:** `docs/plans/2026-04-04-product-gap-discovery.md` identifies investor-ready PDF export as the #1 product gap. If implemented with `react-pdf` (statically imported) it adds ~150 KB+ gzip to the client bundle; `Puppeteer` on Vercel introduces request-time memory and timeout risk. Either path requires careful implementation guidance before the task ships.

---

## Severity-ranked findings

### Critical

- None identified in this static review.

### High

- None identified in this static review.

### Medium

- **CSV portfolio import: full-file memory and parse in one request** — `POST` reads `await file.text()` then `Papa.parse` over the entire string (`app/app/api/import/portfolio/route.ts` lines 41–42). A very large CSV can spike memory and CPU on the server for the duration of the request. **Mitigations present:** rate limit `import:portfolio` (5/hour per `lib/rate-limit.ts`). **Gap:** no explicit max file size or max row count at the route boundary. **Impact:** availability / noisy-neighbor risk more than day-to-day cost.

- **MockupFrame: residual CLS risk after min-height mitigation** — `app/components/mockups/mockup-frame.tsx` applies `min-h-[min(28rem,65vh)]` when `scale === 0 && !fitToHeight` (line 77), which addresses the zero-height first paint from the April 3 audit. Content remains `opacity: 0` until `scale > 0` (line 95), so the reserved min-height may still differ from the final scaled height once `ResizeObserver` fires. **Verify** with Lighthouse / CWV on `/` and `/pricing` before launch.

### Low

- **Mortgage collection GET: two DB round-trips** — `app/app/api/properties/[id]/mortgage/route.ts` calls `getPropertyForUser` (`findFirst` on `Property`) then `prisma.mortgage.findMany`. Could be merged into one `findFirst({ include: { mortgages: true } })`. **Impact:** small extra latency per request; not N+1 over many entities.

- **Authenticated shell: `force-dynamic` on `(app)/layout`** — `app/app/(app)/layout.tsx` line 16 sets `export const dynamic = "force-dynamic"` with `unstable_cache` for banner counts (30 s revalidate, lines 22–37). Consistent with architecture doc (session-specific data). **Impact:** no static HTML caching for the app shell; expected tradeoff.

- **Marketing/legal pages: dynamic HTML per request** — e.g. `app/app/privacy/page.tsx` calls `auth()` for `LandingNav`. Aligned with architecture doc: ISR not applied where session-dependent nav differs. **Impact:** higher TTFB vs fully static legal pages; accepted product choice.

- **PostHog person properties: extra `GET /api/me`** — `app/components/analytics/posthog-person-properties.tsx` fetches `/api/me` on load and on tab visibility. `app/app/api/me/route.ts` runs two `count` queries. **Impact:** one extra API round-trip per session when analytics is enabled; counts overlap conceptually with layout banner data but are not duplicated on the same response path.

- **`analyze` page reiterates `force-dynamic`** — `app/app/(app)/analyze/page.tsx` duplicates the parent layout's dynamic rendering stance. **Impact:** clarity only; negligible runtime effect.

- **Upcoming PDF export: library selection is performance-critical** — `docs/plans/2026-04-04-product-gap-discovery.md` Gap 1 identifies investor-ready PDF as the top priority gap. When this task is planned: (a) `react-pdf` must be loaded via `next/dynamic` with `ssr: false` (it is ~150 KB+ gzip and non-trivial to tree-shake); (b) `Puppeteer` on Vercel introduces cold-start latency, high memory, and function timeout risk for large reports; (c) CSS `@media print` / `window.print()` path adds zero bundle cost and works for basic reports. Recommend requiring performance guidance in the task spec before implementation begins.

- **Upcoming calculators polish and changelog polish: no performance risk** — `docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md` and `docs/archive/plans/2026-04-04-changelog-polish-plan.md` both explicitly require CSS-first motion (no Framer Motion). No new external APIs, no new heavy dependencies, no new dynamically rendered routes. Net performance impact: zero, conditional on implementors following the plans.

---

## Evidence reviewed

- **Process / template:** `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`.
- **Architecture (performance):** `docs/architecture-and-build-practices.md` §2.5.
- **Previous audit:** `docs/audits/performance-cost/2026-04-03-performance-cost-audit-2.md` — open items reviewed for carry-forward/resolution status.
- **Build / bundling:** `app/next.config.ts` (`optimizePackageImports: ["lucide-react", "recharts"]`, no `localPatterns`, Turbopack root, Sentry wrapper).
- **SSR/CSR and code-splitting:** `next/dynamic` with `ssr: false` in `dashboard-charts.tsx`, `modeling-workspace.tsx`, `mortgage-workspace.tsx`, `refinance-workspace-loader.tsx`, `amortization-chart-dynamic.tsx`, marketing `competitor-alternative-page.tsx` / `resource-article-page.tsx`.
- **Recharts import sites:** `projections-tab-content.tsx` (top-level recharts import, loaded via `modeling-workspace.tsx` dynamic wrapper), `mortgage-tab-content.tsx` (top-level recharts, loaded via `mortgage-workspace.tsx` dynamic wrapper), `refinance-workspace.tsx` (top-level recharts, loaded via `refinance-workspace-loader.tsx` with `ssr: false`). Effective: all recharts access is deferred. Chart component files (`equity-chart.tsx`, `debt-vs-value-chart.tsx`, `cash-flow-chart.tsx`, `amortization-chart.tsx`) are leaf imports.
- **RentCast quota dedup resolution:** `app/lib/rentcast-quota-client.ts` — module-level `Map` cache and in-flight deduplication confirmed present; `useRentCastQuota(refreshKey)` used by `rentcast-quota-hint.tsx`.
- **MockupFrame CLS mitigation:** `app/components/mockups/mockup-frame.tsx` line 77 — `min-h-[min(28rem,65vh)]` applied when `scale === 0 && !fitToHeight`. Residual opacity-0 before `ResizeObserver` remains.
- **Static calculator pages:** `app/app/tools/[calculator]/[location]/page.tsx` uses `generateStaticParams` — 200 pre-rendered pages (4 calculators × 50 US states). No SSR cost per request for these high-volume SEO pages.
- **Caching:** `app/app/(app)/layout.tsx` (`unstable_cache`), `app/lib/auth.ts` (`cache()`).
- **Data loading / N+1:** `app/lib/server/portfolio-summary-payload.ts` (single `include` query), `app/app/(app)/properties/[id]/page.tsx` (`include: { mortgages: true }`), `app/app/api/properties/route.ts`.
- **API cost hot paths:** `app/lib/integrations/rentcast.ts`, `/api/estimates/rent`, `/api/estimates/value`, `/api/properties/[id]/benchmark/refresh`, `app/app/api/billing/sync/route.ts`, `app/app/(app)/app-layout-client.tsx` (billing sync throttle), `app/lib/posthog-server.ts`, `app/app/api/billing/webhook/route.ts`.
- **Import route:** `app/app/api/import/portfolio/route.ts` — `file.text()` + `Papa.parse` over full string; no max size/row guard confirmed.
- **Today's plans reviewed for performance impact:** `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` (Phase B shipped; recharts protected by loader), `docs/archive/plans/2026-04-04-calculators-premium-cta-plan.md` (CSS-only motion required), `docs/archive/plans/2026-04-04-changelog-polish-plan.md` (light polish, no new deps), `docs/plans/2026-04-04-product-gap-discovery.md` (strategy; PDF export gap flagged as forward performance risk).

**Assumptions / limits:** No production Web Vitals export, bundle analyzer output, or load tests were run. Findings are from static analysis and repository inspection.

---

## Risk & impact assessment

- **CSV import (Medium):** Affects server stability under edge-case uploads; rate limits reduce abuse frequency but not peak memory for a single allowed request.
- **MockupFrame CLS (Medium, verification):** Hero and pricing are conversion-critical; unresolved CLS above 0.1 hurts SEO and perceived quality — mitigated but not closed without measurement.
- **Upcoming PDF export (Low / forward risk):** If `react-pdf` or `Puppeteer` is chosen without a `next/dynamic` wrapper or server isolation, the cost shifts to High at the time of implementation. The risk window is before the task ships, not today.
- **Mortgage GET / PostHog / dynamic layouts (Low):** Small incremental latency or API calls; unlikely to move infrastructure cost materially at current scale.
- **RentCast / Stripe:** Controls (quotas, indexes, throttles, webhook idempotency) match a cost-conscious design; main risk is misconfiguration or quota exhaustion under growth, not unbounded loops in code.
- **Calculator location pages:** 200 static pages via `generateStaticParams` removes SSR cost from this entire high-volume SEO surface — positive finding.

---

## Recommendations (prioritized)

1. **Harden portfolio CSV import** — Add a maximum upload size (multipart header check, e.g. 2 MB) and/or a maximum row count before parsing; reject early with 413/400. Optionally parse in chunks if product requires very large files.
2. **Verify MockupFrame CLS in production-like runs** — Run Lighthouse (mobile + desktop) on `/` and `/pricing`; if CLS remains elevated, set a fixed aspect ratio or measured placeholder closer to final scaled height, or hydrate scale from a known mockup aspect ratio.
3. **Require performance guidance in the PDF export task spec** — Before planning Gap 1 (investor-ready PDF), document the library constraint: CSS print path (zero bundle cost, free tier), `react-pdf` (must be `next/dynamic` + `ssr: false`, server-render preferred), or Puppeteer (server-only with explicit timeout + memory budget). This constraint should appear in `docs/tasks.md` before implementation begins.
4. **Consolidate mortgage GET queries** — Replace separate `property.findFirst` + `mortgage.findMany` with a single `property.findFirst({ include: { mortgages: { orderBy: { createdAt: 'asc' } } } })` in `app/app/api/properties/[id]/mortgage/route.ts`.
5. **Optional: reduce `/api/me` duplication for PostHog** — Pass tier and counts from an existing server payload into a small client context, or document that the extra fetch is intentional for consent-gated analytics only.

---

## Task candidates

- [ ] Add CSV import file size / row limits (or streaming) in `app/app/api/import/portfolio/route.ts`.
- [ ] Run CWV / Lighthouse on landing and pricing; tune `MockupFrame` if CLS still fails thresholds.
- [ ] Merge Prisma queries in `GET` `app/app/api/properties/[id]/mortgage/route.ts`.
- [ ] Before scheduling PDF export (Gap 1): document performance constraints (bundle, rendering strategy, timeout budget) in the task spec.

---

## Re-test checklist

- [ ] After import limits: upload boundary tests (empty, at-limit, over-limit).
- [ ] After MockupFrame changes: CLS field check on `/` and `/pricing`.
- [ ] After mortgage route refactor: `npm run test` for affected API tests; manual mortgage list in UI.
- [ ] Before PDF export ships: bundle size check (`next build --analyze` or `@next/bundle-analyzer`) to confirm recharts/react-pdf are not in the initial bundle.
- [ ] `npm run check` (when code changes are made).

---

## Next trigger and cadence

- **Trigger:** Quarterly, after major performance-sensitive features (new charts, new external APIs, marketing rebuild), or before a traffic spike / launch. Re-run when PDF export feature is specced.
- **Recommended next run:** 2026-07-04 or the next full-audit synthesis date, whichever comes first. If PDF export is prioritized, run a focused bundle audit before that feature ships.
