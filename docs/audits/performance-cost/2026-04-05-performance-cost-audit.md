# Performance & Cost Audit — 2026-04-05

## Executive summary

- **Overall posture remains solid on the patterns that matter most:** Recharts is consistently deferred behind `next/dynamic` with `ssr: false`, `optimizePackageImports` is configured for `lucide-react` and `recharts`, the authenticated app layout correctly scopes `force-dynamic` while using `unstable_cache` for banner counts (30 s revalidate), and the RentCast quota client uses in-flight deduplication. No critical regressions found.
- **Database-backed rate limiting is the most significant operational cost pattern:** Every write request (property create/edit/delete, deal create/edit, import, export, billing sync) consumes two extra DB round-trips for rate-limit check + record, and the `ApiRateLimitEntry` table has no cleanup path. At current scale this is low-risk; under moderate growth it degrades and adds unnecessary DB spend.
- **Two large monolithic client components represent the most actionable bundle-size opportunity:** `add-property-wizard.tsx` (~2,865 lines, fully client-rendered) and `deal-analyzer-form.tsx` (~1,616 lines) ship all steps and sub-features in a single eagerly-parsed bundle. Code-splitting per section would reduce first-load JS on the two highest-traffic create/analyze flows.
- **Carry-forward items from 2026-04-04 still open:** CSV import has no max-size guard; mortgage collection GET makes two DB calls; PostHog person properties fetch overlaps with layout banner data.

---

## Severity-ranked findings

### Critical

- None identified in this static analysis pass.

### High

- **Database-backed rate limiting: 2 extra DB round-trips per write + unbounded table growth** — `app/lib/rate-limit.ts` implements all rate limiting via `prisma.apiRateLimitEntry.count` (COUNT with rolling 1-hour window) and `prisma.apiRateLimitEntry.create` (INSERT). Every protected write route (property CRUD, deal CRUD, import, export, billing sync, billing portal, checkout, account delete) executes two additional DB calls around the actual operation. For a property create, the call chain is: `checkRateLimit` → COUNT, `property.count` (plan limit), `property.create`, optional `mortgage.create`, optional `property.update`, `property.findUnique` (response reload), `recordRateLimit` → INSERT — up to 7 DB round-trips per request. Separately, there is no scheduled cleanup of `ApiRateLimitEntry` rows older than 1 hour; entries accumulate indefinitely. The compound index `[identifier, action, createdAt]` (`app/prisma/schema.prisma` line 162) keeps the COUNT query fast today, but table size will grow with usage and periodic vacuuming overhead increases. **Evidence:** `app/lib/rate-limit.ts` lines 38–64, `app/prisma/schema.prisma` lines 155–163. **Impact:** moderate DB spend multiplier on every write path; degradation trajectory as table grows.

- **Billing sync fires a live Stripe API call on every browser cold start for users with a Stripe customer ID** — `app/app/(app)/app-layout-client.tsx` (lines 79–122) fetches `/api/billing/sync` via `useEffect` on every mount. Session storage throttle limits re-fires to once per 5 minutes per browser tab session, but cold starts (new browser session, private window, new device, tab close/reopen) bypass the throttle. `/api/billing/sync/route.ts` (line 58) calls `stripe.subscriptions.list({ customer: ..., limit: 1 })` — a live Stripe API call — on every qualifying request. Any user who has ever started a Stripe checkout but did not complete it has a `stripeCustomerId` set, meaning the sync fires for all partially-converting and converting users. Rate-limit is 60/hour server-side, but this is per-user, not per-session. Under moderate growth with many concurrent users, aggregate Stripe API volume could approach Stripe rate limits. **Evidence:** `app/app/(app)/app-layout-client.tsx` lines 79–122, `app/app/api/billing/sync/route.ts` lines 26–61. **Impact:** unbudgeted Stripe API spend; potential latency spike on each cold-start navigation for paid/initiated users.

### Medium

- **`add-property-wizard.tsx` is a ~2,865-line monolithic client component with no per-section lazy loading** — The entire wizard (all 4+ steps, address autocomplete with API calls, mortgage form, rent estimate trigger, analytics instrumentation) ships as a single eagerly-parsed client bundle. Steps 2–4 content is never shown on first render but is fully included in the parse/compile pass. This is the highest-traffic create flow. **Evidence:** `app/app/(app)/properties/add-property-wizard.tsx` (file size confirmed 2,865+ lines). **Impact:** slower TTI on `/properties/new`; the add-property wizard is the core first-run flow, so any parse overhead directly affects activation rate.

- **`deal-analyzer-form.tsx` is a ~1,616-line monolithic client component** — The deal analyzer form bundles address autocomplete, RentCast value estimate trigger, portfolio context fetch, save/load/delete logic, metrics display, and mobile shell all in one client chunk. **Evidence:** `app/app/(app)/analyze/deal-analyzer-form.tsx` (1,616+ lines). **Impact:** slower TTI on `/analyze`; affects deal analysis adoption.

- **Duplicate mortgage and rent computations per property in `properties/page.tsx`** — The properties list page computes `totalMortgageBalance`, `totalMonthlyPayment`, and `getPropertyTotalRent(p)` twice per property: once in the `portfolioInput` mapping (lines 160–183) and again inside the `propertyCards` mapping (lines 196–249). `getPropertyTotalRent` is also called a third time inside `propertyCards` for the benchmark eligibility check (line 221). For a user with 10–20 properties this is ~30–60 redundant function calls on a hot server-render path. **Evidence:** `app/app/(app)/properties/page.tsx` lines 159–249. **Impact:** wasted CPU on a frequently-visited server component; grows linearly with property count.

- **Dashboard page calls `computePropertyMetrics` in two separate map passes per property** — `app/app/(app)/dashboard/page.tsx` computes chart data via three sequential `.map()` loops over `portfolioInput` (lines 92–113): equity loop calls `computePropertyMetrics(p, displayMode)`, cash flow loop calls it again, and the debt-vs-value loop does inline arithmetic. Each call re-derives NOI, cap rate, and cash flow from first principles. For a user with 20 properties this is 40 `computePropertyMetrics` invocations instead of 20. **Evidence:** `app/app/(app)/dashboard/page.tsx` lines 91–113. **Impact:** extra CPU per dashboard render; compounds with property count.

- **No max upload size guard on CSV portfolio import** *(carry-forward from 2026-04-04)* — `app/app/api/import/portfolio/route.ts` reads the full file with `await file.text()` and then parses with `Papa.parse` in memory. No explicit limit on file size (bytes) or row count is enforced at the route boundary before parsing begins. Rate limit (`import:portfolio`, 5/hour) reduces attack surface but not per-request memory spike. **Evidence:** `app/app/api/import/portfolio/route.ts` lines 41–42. **Impact:** server memory spike risk on large uploads; prior audit open item.

- **`browser preconnect` for RentCast is emitted in the root layout but RentCast is a server-side-only integration** — `app/app/layout.tsx` line 160 emits `<link rel="preconnect" href="https://api.rentcast.io" />` for all users (authenticated or not) on every page. RentCast is called exclusively from Next.js API routes (`/api/estimates/rent`, `/api/estimates/value`, `/api/properties/[id]/benchmark/refresh`) — the browser never establishes a direct connection to `api.rentcast.io`. The preconnect is wasted: it opens a TCP+TLS handshake to a host the browser will not send any requests to. **Evidence:** `app/app/layout.tsx` line 160, `app/lib/integrations/rentcast.ts` (server-only). **Impact:** ~30–100 ms of unnecessary TLS handshake overhead on every page load for all users.

### Low

- **No `Cache-Control` headers on read-only API responses** — `GET /api/properties`, `GET /api/portfolio/summary`, `GET /api/deals`, and other read-only routes return `NextResponse.json(...)` with no `Cache-Control` header. Browsers default to heuristic caching or no-cache for JSON responses. Even a short `Cache-Control: private, max-age=30, stale-while-revalidate=60` on stable aggregates like portfolio summary would reduce repeat DB hits when users navigate between app pages. **Evidence:** `app/app/api/properties/route.ts` line 33, `app/app/api/portfolio/summary/route.ts` line 12. **Impact:** small but unnecessary repeat DB fetches on frequent same-session navigation.

- **Mortgage collection GET makes two sequential DB calls** *(carry-forward from 2026-04-04)* — `app/app/api/properties/[id]/mortgage/route.ts` calls `getPropertyForUser` (a `findFirst` on `Property`) then `prisma.mortgage.findMany`. Could be merged into one `findFirst({ include: { mortgages: true } })`. **Impact:** minor; low traffic route.

- **PostHog person properties: extra `GET /api/me`** *(carry-forward from 2026-04-04)* — `app/components/analytics/posthog-person-properties.tsx` fetches `/api/me` on load and tab visibility change. `app/app/api/me/route.ts` executes two `COUNT` queries. These overlap conceptually with layout banner data but are on a separate response path. **Impact:** one extra API round-trip and two extra DB calls per session when analytics consent is granted.

- **`analyze/page.tsx` duplicates `force-dynamic` from parent layout** *(carry-forward from 2026-04-04)* — `app/app/(app)/analyze/page.tsx` line 8: `export const dynamic = "force-dynamic"`. The parent `(app)/layout.tsx` is already `force-dynamic`. This has no runtime effect but creates misleading noise. **Impact:** clarity only.

- **`MockupFrame`: residual CLS between `min-h` reservation and final scaled height** *(carry-forward from 2026-04-04)* — `app/components/mockups/mockup-frame.tsx` applies `min-h-[min(28rem,65vh)]` to guard zero-height first paint (resolved from April 3 audit), but content remains `opacity: 0` until `ResizeObserver` fires with the final scale. The reserved height may differ from the final rendered height. Affects `/` and `/pricing`. **Impact:** potential CLS on hero and pricing conversion sections; not measurable without field data.

---

## Evidence reviewed

- **Process / template:** `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`.
- **Architecture (performance):** `docs/architecture-and-build-practices.md` §2.5.
- **Previous audit:** `docs/audits/performance-cost/2026-04-04-performance-cost-audit.md` — open items reviewed for carry-forward status.
- **Build config:** `app/next.config.ts` (`optimizePackageImports`, Turbopack root, Sentry wrapper, security headers, no `force-dynamic` on root layout).
- **Rate limiting:** `app/lib/rate-limit.ts` (full read), `app/prisma/schema.prisma` `ApiRateLimitEntry` model and index.
- **Billing sync trigger:** `app/app/(app)/app-layout-client.tsx` lines 79–122 (`useEffect` + session storage throttle), `app/app/api/billing/sync/route.ts` (live Stripe call).
- **Dashboard page:** `app/app/(app)/dashboard/page.tsx` (full read — `computePropertyMetrics` pass count, `buildDashboardPortfolioPayload`).
- **Properties list page:** `app/app/(app)/properties/page.tsx` (full read — duplicate reduce loops identified).
- **Properties detail page:** `app/app/(app)/properties/[id]/page.tsx` — single `prisma.property.findFirst({ include: { mortgages: true } })`, metrics computed once: good pattern.
- **Portfolio summary payload:** `app/lib/server/portfolio-summary-payload.ts` — shared aggregation, used by both dashboard and API summary: good pattern, no duplication.
- **Client components (bundle size):** `app/app/(app)/properties/add-property-wizard.tsx` (~2,865 lines), `app/app/(app)/analyze/deal-analyzer-form.tsx` (~1,616 lines). Dynamic imports: `add-property-wizard.tsx` imports synchronously; no per-section splitting found.
- **Dynamic import coverage:** `app/app/(app)/dashboard/dashboard-charts.tsx` — EquityChart, DebtVsValueChart, CashFlowChart all behind `next/dynamic` with `ssr: false`: correct. Recharts chart leaf files (`equity-chart.tsx`, `debt-vs-value-chart.tsx`, `cash-flow-chart.tsx`) accessed only from dynamic wrappers: correct.
- **Root layout:** `app/app/layout.tsx` — `preconnect` to `api.rentcast.io` reviewed.
- **Database schema indexes:** `app/prisma/schema.prisma` — `Property[userId]`, `Mortgage[propertyId]`, `RentCastApiCall[userId, createdAt]`, `ApiRateLimitEntry[identifier, action, createdAt]`, `SavedDeal[userId]` all present: good. No missing indexes on current query patterns.
- **Prisma client config:** `app/lib/db.ts` — `PrismaPg` adapter with `DATABASE_URL`/`DIRECT_URL` split (standard pool/direct pattern): correct. Dev-mode query logging suppressed in production: correct.
- **API response caching:** `app/app/api/properties/route.ts`, `app/app/api/portfolio/summary/route.ts` — no `Cache-Control` headers.
- **RentCast quota dedup:** `app/lib/rentcast-quota-client.ts` — in-flight deduplication and module-level cache confirmed: resolved from prior audit.
- **App layout `unstable_cache`:** `app/app/(app)/layout.tsx` — 30-second revalidation for banner counts: good.
- **Force-dynamic scoping:** Confirmed `force-dynamic` on `(app)/layout.tsx`, `(app)/analyze/page.tsx`, `(app)/admin/layout.tsx`, `(app)/admin/page.tsx`. Root layout and marketing pages do not have `force-dynamic`: correct.
- **Marketing page static plans:** `/pricing`, `/privacy`, `/changelog` call `auth()` or `getAppUser()` for nav differentiation; dynamic rendering accepted per architecture doc; no `revalidate` set.

**Assumptions / limits:** No production bundle analyzer output, Web Vitals field data, or query execution plans were available. Findings are from static code analysis. Prisma Accelerate / connection pool configuration was not inspected (env-gated; assumed standard Neon/Supabase pool based on `DATABASE_URL`/`DIRECT_URL` pattern).

---

## Risk & impact assessment

- **Database rate limiting (High):** Operational cost impact is moderate today and grows proportionally with user activity. The unbounded `ApiRateLimitEntry` table is the key risk — without a pruning job the COUNT queries will eventually slow. Resolving either with Redis/Upstash or a daily/hourly cleanup job eliminates both the extra DB round-trips and the growth risk.
- **Billing sync Stripe calls (High):** At current user scale, aggregate Stripe API volume is within Stripe's standard limits. Risk is a growth cliff: if user count increases 5–10×, the cumulative cold-start Stripe calls across all active users could approach Stripe's rate limit for subscription list operations. The user experience impact (cold-start latency for paid users) is also real today.
- **Large client components (Medium):** TTI impact is felt most on first-run flows (add property, deal analysis). These are activation-critical paths. A 30–50% reduction in first-load JS on `/properties/new` is achievable with section splitting and would directly benefit conversion from sign-up to first property added.
- **Duplicate computations (Medium):** Pure server-side CPU; no DB cost. Negligible at current scale; worth a one-pass refactor to improve code clarity as much as performance.
- **Missing CSV max-size guard (Medium):** Low probability but high consequence — a single oversized import could spike server memory and affect adjacent requests. Simple mitigation (check `Content-Length` or reject on parse row count > N) should be added before any CSV import promotion campaign.
- **Wasted RentCast preconnect (Medium):** Real latency tax on every page load for every user. Cheap to fix: remove one line from root layout.
- **No API Cache-Control (Low):** Cosmetic gap at current scale; becomes meaningful when adding CDN edge caching or if browser prefetch patterns increase repeat fetches.

---

## Recommendations (prioritized)

1. **Add a cleanup job for `ApiRateLimitEntry` rows older than 1 hour** — A scheduled cron (daily or hourly) running `prisma.apiRateLimitEntry.deleteMany({ where: { createdAt: { lt: oneHourAgo } } })` eliminates unbounded table growth. This is low-effort and unblocks future rate-limit performance. Longer-term: evaluate Redis/Upstash for rate limiting to remove DB round-trips entirely.
2. **Remove the `preconnect` to `api.rentcast.io` from the root layout** — One-line change to `app/app/layout.tsx`. Removes 30–100 ms of wasted TLS handshake per page load for all users. The browser never calls RentCast directly; preconnect is a no-op at best and a latency cost at worst.
3. **Split `add-property-wizard.tsx` into per-section dynamic chunks** — Lazy-import form sections for steps 2–4 using `React.lazy` or `next/dynamic`. Target: step 1 (the initial quick-add and step selector) renders with ≤ 40% of the current bundle. Prioritize over the deal analyzer form split since add-property is the primary activation flow.
4. **Consolidate per-property computations in `properties/page.tsx` and `dashboard/page.tsx`** — Single-pass the mortgage reduce and `computePropertyMetrics` per property; store results and reuse across portfolio metrics, card rendering, and filter logic. Improves both code clarity and server CPU.
5. **Add max file size / row count guard to CSV import** — Before `file.text()` is called in `app/app/api/import/portfolio/route.ts`, check `Content-Length` header and reject over 2 MB with 413. Add a row count check during parse (reject after N rows). Prevents memory spike on a single oversized upload.
6. **Scope billing sync to only users with an active subscription in the DB** — Consider skipping the Stripe API call when the local DB `subscriptionTier === "free"` AND no `Subscription` record exists or `status` is `canceled`. Users who initiated checkout but abandoned are currently triggering a live Stripe call every cold start despite having no active subscription to sync.

---

## Task candidates

- [ ] Add scheduled cleanup of `ApiRateLimitEntry` rows older than 1 hour — cron or daily maintenance query in `prisma.$executeRaw` or `deleteMany`
- [ ] Remove `<link rel="preconnect" href="https://api.rentcast.io" />` from `app/app/layout.tsx`
- [ ] Split `add-property-wizard.tsx` step sections into lazy-loaded chunks using `next/dynamic` or `React.lazy`; target <40% of current bundle on step 1 render
- [ ] Consolidate duplicate mortgage / rent calculations in `app/app/(app)/properties/page.tsx` into a single per-property computation pass
- [ ] Consolidate `computePropertyMetrics` into a single pass in `app/app/(app)/dashboard/page.tsx` (currently called in 2 separate map loops per property)
- [ ] Add `Content-Length` max-size check and parse row limit to `app/app/api/import/portfolio/route.ts`
- [ ] Evaluate skipping `/api/billing/sync` Stripe call when local DB `subscriptionTier` is `free` with no active `Subscription` row — reduces cold-start Stripe API volume for churned/abandoned users

---

## Re-test checklist

- [ ] Verify `ApiRateLimitEntry` cleanup job runs without missing live entries (entries < 1 h old must be preserved)
- [ ] Verify preconnect removal does not break RentCast calls (server-side only; no browser impact expected)
- [ ] After wizard split: verify all wizard steps function correctly, draft-context persists across lazy-loaded sections, mobile layout is unaffected
- [ ] After properties/dashboard computation consolidation: verify metrics output matches pre-refactor across all test fixtures (`npm run test`)
- [ ] After CSV import guard: verify valid imports still succeed; oversized uploads return 413
- [ ] `npm run check` after any code changes

---

## Next trigger and cadence

- **Trigger:** Pre-launch performance pass, or after PDF export feature ships (highest-latent bundle/runtime risk from prior audit)
- **Recommended next run:** 2026-04-12 (weekly cadence) or immediately after a major new client component (PDF viewer, rich reporting, etc.) ships
