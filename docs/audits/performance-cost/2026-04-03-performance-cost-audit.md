# Performance & Cost Audit — 2026-04-03

## Executive summary

- **Overall:** Core patterns align with `docs/architecture-and-build-practices.md` §2.5: Recharts is behind `next/dynamic` + `ssr: false` on dashboard, mortgage/modeling workspaces, and amortization; `next.config.ts` uses `experimental.optimizePackageImports` for `lucide-react` and `recharts`; portfolio/property list data uses `include: { mortgages: true }` rather than per-row DB round-trips.
- **Top cost/perf risks:** (1) Multiple `RentCastQuotaHint` instances on the same view each call `GET /api/rentcast-quota`, duplicating Prisma `RentCastApiCall` counts and auth work. (2) `(app)` layout `force-dynamic` plus redundant `force-dynamic` on some child routes adds little value but documents intent; the layout already uses `unstable_cache` for banner counts (30s).
- **External APIs:** RentCast is gated by hourly limits (`app/lib/plans.ts`, `app/lib/rentcast-quota.ts`); dashboard auto-benchmark refresh is capped (`MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD` in `app/lib/benchmark-dashboard-utils.ts`) and runs **sequentially** in `app/app/(app)/dashboard/rent-vs-market-section.tsx` (trades latency for predictable upstream load).
- **Recommendation:** Prioritize consolidating duplicate quota hint fetches (single provider or one hint per surface), then consider merging the mortgage API’s two-step property+mortgages read into one `include` query for a small hot-path win.

## Severity-ranked findings

### Critical

- None observed in this pass (no unbounded external loops, no obvious unindexed hot queries without mitigation).

### High

- None elevated to High: RentCast usage is bounded by tier quotas and explicit caps; N+1 patterns were not found on main portfolio paths.

### Medium

- **Duplicate `/api/rentcast-quota` traffic per page** — Each `RentCastQuotaHint` mounts its own `useEffect` fetch to `/api/rentcast-quota` (`app/components/rentcast-quota-hint.tsx`), and `GET` runs `getRentCastQuotaState` → `prisma.rentCastApiCall.count` (`app/lib/rentcast-quota.ts`, `app/app/api/rentcast-quota/route.ts`). **Evidence:** `property-form.tsx` renders the hint twice (lines ~695, ~798); `benchmark-display.tsx` twice (~58, ~74). Same user/session sees redundant DB counts and API calls whenever hints are both mounted.
- **Dashboard benchmark auto-refresh latency** — `rent-vs-market-section.tsx` refreshes up to `MAX_AUTO_BENCHMARK_REFRESH_ON_LOAD` (3) via a `for` loop with `await fetch` per property (lines ~96–108). This protects RentCast from parallel bursts but **stacks latency** (3 sequential round-trips + server work) before `router.refresh()`.

### Low

- **Redundant `export const dynamic = "force-dynamic"`** — `app/app/(app)/layout.tsx` already sets `force-dynamic` for the authenticated shell. Child routes `app/app/(app)/analyze/page.tsx`, `app/app/(app)/admin/page.tsx`, and `app/app/(app)/admin/layout.tsx` repeat it. Harmless but redundant; no extra isolation beyond parent.
- **Mortgage list API: two DB round-trips** — `GET` in `app/app/api/properties/[id]/mortgage/route.ts` calls `getPropertyForUser` (`findFirst`) then `prisma.mortgage.findMany` (lines 77–85). Could be one `property.findFirst({ include: { mortgages: true } })` for fewer round-trips under load.
- **Property create: extra read after write** — `app/app/api/properties/route.ts` creates a property then `findUnique` with `include: { mortgages: true }` (lines ~199–202) to serialize the response. Reasonable for correctness; minor extra query on create path.
- **Marketing `dynamic(PublicCalculator)` without `ssr: false`** — `app/app/page.tsx`, `app/components/marketing/competitor-alternative-page.tsx`, `app/components/marketing/resource-article-page.tsx` use `next/dynamic` for `PublicCalculator` with loading placeholders but not `ssr: false`. The calculator is client-only (`useState`, etc.) and not Recharts-heavy; impact is smaller than chart bundles but §2.5’s “defer heavy client UI” pattern would use `ssr: false` for consistency.
- **`experimental.optimizePackageImports` scope** — `app/next.config.ts` lists `lucide-react` and `recharts`. Other sizable deps (e.g. `@clerk/nextjs`, `posthog-js`) are not in the list; only add if bundle analysis shows benefit (Next supports this for specific packages).

## Evidence reviewed

- **Process/template:** `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` §2.5 (Performance Practices).
- **Config & build:** `app/next.config.ts` (CSP, `outputFileTracingRoot`/`turbopack.root`, `optimizePackageImports`, Sentry wrapper), `app/package.json` scripts/deps.
- **Rendering strategy:** `app/app/(app)/layout.tsx` (`force-dynamic`, `unstable_cache` for banner data), `app/app/layout.tsx` (preconnect/dns-prefetch for RentCast, Clerk, Stripe, PostHog), `force-dynamic` usages under `app/app/(app)/`.
- **Charts / heavy UI:** `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/properties/[id]/amortization-chart-dynamic.tsx`, Recharts imports under `app/components/charts/` and tab content files.
- **Prisma:** `app/lib/server/portfolio-summary-payload.ts`, `app/app/(app)/properties/page.tsx`, `app/app/(app)/admin/page.tsx`, `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/route.ts`.
- **RentCast / external:** `app/lib/integrations/rentcast.ts`, `app/app/api/estimates/rent/route.ts`, `app/app/api/estimates/value/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/lib/benchmark-dashboard-utils.ts`, `app/app/(app)/dashboard/rent-vs-market-section.tsx`, `docs/reference/rentcast-quota.md`.
- **Images:** Grep for `next/image` vs raw `<img>` in `app/` (no raw `<img>` matches; `next/image` on landing/pricing/app shell).
- **Assumptions:** No production Web Vitals, bundle analyzer output, or load tests were run; findings are static code review. Middleware file not present in `app/`.

## Risk & impact assessment

- **Unresolved duplicate quota hints:** Extra read load on `RentCastApiCall` and auth for every duplicated component; scales with editor pages that show two hints. User impact is small (latency ms–tens of ms); **cost** is extra DB/CPU on a frequently opened surface.
- **Sequential benchmark refresh:** Users with multiple stale properties see slower “fresh” benchmark data on first dashboard paint; tradeoff intentionally favors RentCast quota and upstream stability.
- **Admin page query fan-out:** `admin/page.tsx` runs a large `Promise.all` of counts, `groupBy`, and `findMany` slices. Acceptable for rare admin access; could matter if admin traffic grows.

## Recommendations (prioritized)

1. **Deduplicate RentCast quota reads in the UI** — Provide quota once per form/page (React context, a single parent hint, or lifting fetch to a parent and passing props) so `property-form.tsx` and `benchmark-display.tsx` do not double-call `/api/rentcast-quota` and double-count in Prisma.
2. **Optional: combine mortgage GET into a single query** — Use `prisma.property.findFirst({ where: { id, userId }, include: { mortgages: true } })` in `app/app/api/properties/[id]/mortgage/route.ts` to remove one round-trip.
3. **Optional: align marketing calculator dynamic imports with §2.5** — Add `ssr: false` (and keep loading placeholders) for `PublicCalculator` on home and marketing templates if bundle analysis shows a server chunk win.
4. **Keep sequential benchmark refresh or document parallel cap** — If product needs faster refresh for up to 3 properties, consider parallel `fetch` with a hard concurrency of 2 and monitoring RentCast 429s; otherwise current behavior is a reasonable cost/latency tradeoff.

## Task candidates

- [ ] Consolidate `RentCastQuotaHint` / quota fetching on property form and benchmark displays to a single fetch per page.
- [ ] Merge mortgage `GET` property + `mortgage.findMany` into one Prisma query with `include`.
- [ ] Run `@next/bundle-analyzer` (or Vercel bundle insights) on `main` and confirm whether `optimizePackageImports` should include additional packages.
- [ ] Add RUM or Vercel Speed Insights sampling post-launch to validate dashboard and property editor LCP/INP.

## Re-test checklist

- [ ] After quota deduplication: one `GET /api/rentcast-quota` per property edit session (verify in network tab).
- [ ] After mortgage API change: mortgage tab and API consumers still match prior JSON shape.
- [ ] `npm run check` (when code changes are made).

## Next trigger and cadence

- **Trigger:** Pre-launch hardening, after major dashboard/property-editor changes, or if RentCast billing/quotas change.
- **Recommended next run:** Within one quarter (2026-07) or sooner before a large marketing push that could spike RentCast and auth-adjacent traffic.
