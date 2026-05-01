# Performance & Cost Audit — 2026-05-01

## Executive summary

- **Overall:** Config and bundle patterns align with `docs/architecture-and-build-practices.md` §2.5: `app/next.config.ts` uses `experimental.optimizePackageImports` for `lucide-react` and `recharts`; dashboard and tool surfaces defer Recharts via `next/dynamic` with `ssr: false` and loading placeholders (`app/app/(app)/dashboard/dashboard-charts.tsx`, `app/components/marketing/calculator-page-slots.tsx`, `app/app/(app)/refinance/refinance-workspace-loader.tsx`, modeling/mortgage loaders). Root layout preconnects Clerk (env), Stripe (`dns-prefetch`), and PostHog when configured (`app/app/layout.tsx`).
- **Top risk:** **Monthly cron RentCast volume and operator quota parity** — `refreshProperty` in `app/lib/refresh.ts` calls `fetchValueEstimate` / `fetchRentEstimate` with no `RentCastApiCall` ledger in this path, while `MAX_PROPERTIES_PER_USER_PER_RUN` remains `Number.POSITIVE_INFINITY`, so one eligible paying user can still drive two upstream calls per property missing a monthly snapshot in a single cron pass. `getRefreshEligibleUsers` still loads a broad user/property graph and filters in application code.
- **Positive current state:** The authenticated app layout combines `dynamic = "force-dynamic"` with **`unstable_cache`** for banner counts (30s revalidate, tag prefix `layout-banner:` per user) (`app/app/(app)/layout.tsx`); property routes call **`revalidateTag`** with the same tag on create/update (`app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`) so banners do not stay stale until TTL alone. Monthly refresh cron batches PostHog with **`captureServerEvents`** (`app/app/api/cron/monthly-refresh/route.ts`, `app/lib/posthog-server.ts`).
- **Recommendation:** Treat **RentCast cron budgeting + SQL-shaped eligibility** as the highest cost/runtime lever; then **batch or reuse PostHog** on webhook and multi-event email crons. Optionally add **page-level `revalidate`** or documented static/island splits where session-independent HTML exists.

## Severity-ranked findings

### Critical

- (None this pass — no unauthenticated spend vector or definite outage identified. Cron remains gated by `CRON_SECRET` on cron handlers; dominant exposure is **variable vendor cost, DB load, and function duration** at scale; see High.)

### High

- **RentCast automation outside hourly `RentCastApiCall` pool** — `refreshProperty` invokes RentCast integration (`app/lib/refresh.ts`, `app/lib/integrations/rentcast.ts`) without ledger writes in this module (no `RentCastApiCall` references in `refresh.ts`). User-facing estimate flows remain governed per `docs/reference/rentcast-quota.md`; **cron automation is not bounded the same way**, so operator-facing quotas do not cap vendor spend from `monthly-refresh`.
- **Unbounded per-user property work in cron refresh** — `MAX_PROPERTIES_PER_USER_PER_RUN = Number.POSITIVE_INFINITY` (`app/lib/refresh.ts`); `processUserRefresh` iterates all properties for the user that still lack a snapshot for the month. With `ESTIMATED_RENTCAST_CALLS_PER_PROPERTY = 2`, large portfolios create **spiky** external cost and long-running invocations.

### Medium

- **`getRefreshEligibleUsers` fetches a wide cohort then filters in JS** — `prisma.user.findMany` with nested `properties` (mortgages, snapshots) (`app/lib/refresh.ts`); tier and activity rules applied after load. Growth increases **database payload, CPU, and cold-start work** before any RentCast I/O.
- **PostHog server: per-call `captureServerEvent` still on hot multi-event paths** — `captureServerEvent` builds `new PostHog`, `flushAt: 1`, and `await client.shutdown()` per call (`app/lib/posthog-server.ts`). **Still used** on `app/app/api/billing/webhook/route.ts` (multiple branches), `app/app/api/cron/trial-emails/route.ts` (several captures per user loop), `app/app/api/cron/onboarding-emails/route.ts`, `app/app/api/cron/monthly-digest/route.ts`, `app/app/api/cron/milestone-emails/route.ts`, `app/app/api/cron/winback-emails/route.ts`, `app/app/api/admin/users/[id]/trial-email/route.ts`, and `app/lib/auth.ts` (trial started). **`captureServerEvents` is only confirmed on monthly-refresh** in this grep pass.
- **No `export const revalidate` (page-level ISR) under `app/`** — search for `revalidate =` on route modules: **no matches** (2026-05-01). Architecture §2.5 suggests ISR for rarely changing legal copy and notes marketing is session-aware; the **full-route caching gap** remains for surfaces that could split static shells from personalized client islands.
- **`npm run build` chains `prisma migrate deploy && next build`** — `app/package.json`. Affects **CI/deploy time**, **requires DB connectivity at build**, and expands **failure surface** on every build.

### Low

- **`GET /api/properties` returns full mortgage trees without pagination** — `findMany` with `include: { mortgages: true }` (`app/app/api/properties/route.ts`); plan caps bound worst case partially; still **response size and client work** for large accounts.
- **Root layout third-party stack** — `app/app/layout.tsx` loads Clerk, consent, PostHog gate, Google Ads clients, Vercel Analytics; appropriate for product but a **profiling** target for marketing **LCP / main-thread** (no Lighthouse run this pass).
- **Heavy client dependencies in `app/package.json`** — `recharts`, `papaparse` (CSV), `@radix-ui/react-dialog`, `vaul`, full Clerk — expected; **optimizePackageImports** mitigates lucide/recharts tree-shaking; papaparse remains a **feature-bundle** consideration on import paths that touch CSV UX.

## Evidence reviewed

- Process: `docs/process/performance-cost-audit-process.md`; template: `docs/process/audit-report-template.md`
- Architecture / performance: `docs/architecture-and-build-practices.md` §2.5
- Next config: `app/next.config.ts` (`optimizePackageImports`, `turbopack.root`, `outputFileTracingRoot`, `withSentryConfig`)
- App scripts / deps: `app/package.json`
- Dynamic imports / charts: `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/components/marketing/calculator-page-slots.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/refinance/refinance-workspace-loader.tsx`, `app/app/(app)/properties/[id]/amortization-chart-dynamic.tsx`
- Rendering / caching: `app/app/(app)/layout.tsx` (`dynamic`, `unstable_cache`, `revalidate: 30`, tags); `export const dynamic` on `app/app/(app)/admin/page.tsx`, `admin/layout.tsx`, `analyze/page.tsx`
- Cache invalidation: `revalidateTag` in `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`
- Root layout / hints: `app/app/layout.tsx` (fonts, preconnect / dns-prefetch)
- Images: `next/image` usage in `app/components/landing-nav.tsx`, `app/components/about/about-portrait-picker.tsx`, `app/app/(app)/app-layout-client.tsx`; no raw `<img` matches in `app/**/*.tsx` (grep)
- RentCast cron path: `app/lib/refresh.ts`, `app/lib/integrations/rentcast.ts`; quota doc by reference: `docs/reference/rentcast-quota.md`
- PostHog server: `app/lib/posthog-server.ts`; call-site grep under `app/` for `captureServerEvent` / `captureServerEvents`
- List payload: `app/app/api/properties/route.ts`
- ISR: no `export const revalidate` assignments under `app/`

**Limits of this pass:** No Lighthouse/Web Vitals exports, no live RentCast or PostHog billing pulls, no Vercel Function duration samples — conclusions are **code- and doc-informed** with qualitative impact estimates.

## Risk & impact assessment

- **RentCast + cron:** Primary **variable vendor cost** and **timeout risk** as eligible cohorts and property counts grow; interactive user quotas do not throttle automation.
- **PostHog (residual):** **Latency and ingest overhead** on webhook and email crons that fire multiple `captureServerEvent` calls per invocation.
- **Eligibility query:** **Database and CPU** pressure on every cron run independent of third-party limits.
- **Build pipeline:** **Deploy friction** if database is unreachable or migrations fail during `npm run build`.

## Recommendations (prioritized)

1. **RentCast cron governance:** Introduce a finite `MAX_PROPERTIES_PER_USER_PER_RUN`, optional per-invocation **call ceiling**, and **ledger alignment** (`RentCastApiCall` or documented automation-specific accounting) consistent with `docs/reference/rentcast-quota.md`. Push eligibility into **SQL** (`where` / relations) and **page** users instead of loading the full owner cohort in memory.
2. **PostHog server paths:** Refactor **`billing/webhook`** and **`trial-emails`** (and other multi-capture loops) to use **`captureServerEvents`** or a shared client with a single `shutdown` per handler where batching is safe.
3. **Caching strategy:** For routes where HTML does not require per-request session at the page boundary, add **`export const revalidate`** or document **client-island** splits per §2.5; keep `revalidateTag` alignment when adding new cached server fragments.
4. **API payload:** Consider **pagination**, field selection, or a slimmer list DTO for `GET /api/properties` if large-account performance becomes measurable.

## Task candidates (optional)

- [ ] Cap **`MAX_PROPERTIES_PER_USER_PER_RUN`** and add SQL-side eligibility / user paging in **`app/lib/refresh.ts`** (`getRefreshEligibleUsers` / `processUserRefresh`).
- [ ] Record or bound **RentCast** calls from **`refreshProperty`** in line with **`docs/reference/rentcast-quota.md`** (or document explicit automation accounting).
- [ ] Refactor **`app/app/api/billing/webhook/route.ts`** and **`app/app/api/cron/trial-emails/route.ts`** to batch **`captureServerEvents`** or otherwise reuse a single PostHog client per invocation.
- [ ] Evaluate **ISR** (`export const revalidate`) or static shells for **privacy/terms** and other session-stable marketing once nav/session moves to islands.
- [ ] Assess **`GET /api/properties`** shape (pagination or lighter `include`) for large portfolios.

## Re-test checklist

- [ ] Verify RentCast **call volume** and cron **duration** after quota/cap changes (staging + provider dashboard).
- [ ] Verify webhook/cron **latency** and PostHog **event delivery** after further server capture batching.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Quarterly; after changes to `app/lib/refresh.ts`, estimate/cron routes, `posthog-server.ts`, or layout/caching; before scale milestones.
- **Recommended next run:** **2026-08-01** (quarterly) or the next release touching cron, RentCast, server analytics, or marketing data-fetch patterns.
