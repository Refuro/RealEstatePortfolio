# Performance & Cost Audit — 2026-04-29

## Executive summary

- **Overall:** Bundle-oriented practices align with `docs/architecture-and-build-practices.md` §2.5: Recharts on the dashboard uses `next/dynamic` with `ssr: false` and loading placeholders (`app/app/(app)/dashboard/dashboard-charts.tsx`); marketing calculator slots defer heavy client chunks with `ssr: false` (`app/components/marketing/calculator-page-slots.tsx`); `app/next.config.ts` sets `experimental.optimizePackageImports` for `lucide-react` and `recharts`. Dashboard portfolio loading uses bounded `findMany` with `include: { mortgages: true }` (`app/lib/server/portfolio-summary-payload.ts`).
- **Top risk:** **Third-party API spend and cron scalability** — monthly RentCast refresh (`app/lib/refresh.ts` → `app/app/api/cron/monthly-refresh/route.ts`) does not insert `RentCastApiCall` rows, so the hourly pool documented in `docs/reference/rentcast-quota.md` does not govern cron traffic. `MAX_PROPERTIES_PER_USER_PER_RUN` remains `Number.POSITIVE_INFINITY`, so one eligible paying user can drive **two upstream calls per property without snapshots** in a single cron iteration. Eligibility loads **all** non-deleted users with properties via one deep `findMany`, then filters in memory.
- **Secondary risk:** **Server-side observability overhead** — `captureServerEvent` constructs a new `PostHog` client with `flushAt: 1` and `await shutdown()` on every call (`app/lib/posthog-server.ts`), used across billing webhooks and multiple email/digest crons; this amplifies network round-trips and serverless duration versus batched or singleton clients.
- **Rendering:** Authenticated shell uses `export const dynamic = "force-dynamic"` with `unstable_cache` for banner counts (`app/app/(app)/layout.tsx`). No route-level `export const revalidate` for ISR was found in the codebase snapshot reviewed (grep across `app/`).
- **Recommendation:** Prioritize **RentCast cron budgeting + eligibility query shaping** and **PostHog server batching/singleton** before bundle-only optimizations; validate with provider dashboards and Vercel function metrics after changes.

## Severity-ranked findings

### Critical

- (None identified in this pass — no finding met “immediate outage or wholly unbounded spend with zero mitigation”; cron is authenticated via `CRON_SECRET` and batch size is capped by `MAX_REFRESH_BATCH_SIZE`. RentCast + eligibility scale remain the dominant **cost and latency** risks; see High.)

### High

- **RentCast monthly refresh is outside the documented `RentCastApiCall` hourly quota** — `docs/reference/rentcast-quota.md` lists consuming routes as estimates and benchmark refresh only. `refreshProperty` in `app/lib/refresh.ts` calls `fetchValueEstimate` / `fetchRentEstimate` without recording `RentCastApiCall`, unlike `app/app/api/estimates/value/route.ts`, `app/app/api/estimates/rent/route.ts`, and `app/app/api/properties/[id]/benchmark/refresh/route.ts`. User-facing limits in `app/lib/plans.ts` / `app/lib/rentcast-quota.ts` therefore do not cap cron-driven provider usage.
- **Unbounded properties per user per cron run** — `MAX_PROPERTIES_PER_USER_PER_RUN = Number.POSITIVE_INFINITY` in `app/lib/refresh.ts`; `processUserRefresh` slices with `user.properties.slice(0, MAX_PROPERTIES_PER_USER_PER_RUN)`, which processes **every** property missing a snapshot for the month. Combined with two RentCast calls per property when the API key and address are valid, this creates **large spikes** in external API cost and function runtime for heavy portfolios.
- **PostHog server capture uses a new client and shutdown per event** — `app/lib/posthog-server.ts` (`flushAt: 1`, `await client.shutdown()`). Call sites include `app/app/api/cron/monthly-refresh/route.ts` (up to three awaited captures per user per batch when branches fire), `app/app/api/billing/webhook/route.ts`, and several email crons (`monthly-digest`, `trial-emails`, `onboarding-emails`, `winback-emails`, `milestone-emails`) plus `app/lib/auth.ts` (trial started). This pattern increases **serial HTTP work** and **invocation wall time** versus buffering.

### Medium

- **`getRefreshEligibleUsers` loads a wide user graph then filters in JS** — `app/lib/refresh.ts` runs `prisma.user.findMany` with nested `properties` (mortgages + snapshot filter), returning all users who own any property before filtering by tier, activity, and missing snapshots. User growth increases **DB payload, CPU, and cron cold-start time** before any RentCast calls.
- **No ISR (`revalidate`) on static-friendly routes** — Architecture §2.5 suggests `revalidate` for rarely changing legal copy; grep found **no** `export const revalidate` in `app/`. Session-aware marketing patterns may constrain caching, but the gap remains for any shell that could split static vs personalized islands.
- **Rate limiting doubles Prisma work on guarded actions** — `checkRateLimit` counts rows and allowed paths insert via `recordRateLimit` (`app/lib/rate-limit.ts`). Appropriate for abuse prevention but steady **read/write volume** on hot mutations (properties, deals, billing, export, Places).
- **`npm run build` runs `prisma migrate deploy` before `next build`** — `app/package.json` build script. Affects **CI/deploy duration**, **DB connectivity**, and **failure surface** on every build, not end-user TTFB.

### Low

- **`GET /api/properties` returns full mortgage trees with no pagination** — `app/app/api/properties/route.ts` (`include: { mortgages: true }` for all rows). Tier limits bound worst case partially; still a **JSON payload and hydration** consideration for large accounts and mobile.
- **Marketing homepage `PublicCalculator`** — `app/app/page.tsx` uses `dynamic()` without `ssr: false`; module is client-only and not Recharts-backed — **low** bundle concern versus calculator slots that already set `ssr: false`.
- **Third-party scripts and providers in root layout** — `app/app/layout.tsx` wraps the tree with `ClerkProvider`, `CookieConsentProvider`, `PostHogGate`, multiple Google Ads client components, and `VercelAnalyticsClient`; `<head>` includes optional Clerk preconnect and PostHog preconnect. Consent gating may defer some loads, but aggregate script weight remains a **profiling** candidate for marketing landing performance.

## Evidence reviewed

- Process: `docs/process/performance-cost-audit-process.md`; template: `docs/process/audit-report-template.md`
- Architecture / performance: `docs/architecture-and-build-practices.md` §2.5
- Bundling: `app/next.config.ts`, `app/package.json`
- Charts / lazy loading: `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/components/marketing/calculator-page-slots.tsx`
- Layout / caching: `app/app/(app)/layout.tsx`, root providers `app/app/layout.tsx`
- Portfolio load pattern: `app/lib/server/portfolio-summary-payload.ts`
- RentCast / cron: `app/lib/refresh.ts`, `app/app/api/cron/monthly-refresh/route.ts`, `docs/reference/rentcast-quota.md`, quota usage in `app/app/api/estimates/value/route.ts`, `app/app/api/estimates/rent/route.ts`
- Observability cost pattern: `app/lib/posthog-server.ts`, `captureServerEvent` grep across `app/`
- API payload: `app/app/api/properties/route.ts`
- Rate limits: `app/lib/rate-limit.ts`
- Dynamic rendering flags: grep for `revalidate` / `force-dynamic` under `app/`

**Limits of this pass:** No fresh Lighthouse runs, no Web Vitals exports, no live Vercel Function duration or RentCast/PostHog billing pulls — conclusions are **code- and doc-informed** with qualitative impact estimates.

## Risk & impact assessment

- **RentCast + cron:** Dominant **variable vendor cost** and **timeout risk** as portfolios and eligible cohorts grow; quotas visible to users do not bound automation.
- **PostHog server:** Primarily **latency and vendor ingest amplification**; low correctness risk if batching is implemented carefully.
- **Eligibility query:** **Database scalability** and predictable cron duration degrade before third-party limits bite.

## Recommendations (prioritized)

1. **RentCast cron governance:** Introduce a **finite** `MAX_PROPERTIES_PER_USER_PER_RUN`, optional **per-invocation call ceiling**, and/or ledger parity (`RentCastApiCall` or separate cron audit rows) aligned with `docs/reference/rentcast-quota.md`. Push eligibility filtering toward **SQL** (`where` / relational predicates) and **paginate** users instead of loading the full cohort.
2. **PostHog server:** Replace per-call client construction with a **singleton** or **request-scoped batch** (higher `flushAt` / `flushInterval`, single `shutdown` per handler/cron completion); consider fire-and-forget where webhook latency is sensitive.
3. **Caching policy:** For routes where HTML does not require session at build time, add **`revalidate`** or document explicit **client-island** splits per architecture §2.5.

## Task candidates (optional)

- [ ] Cap **`MAX_PROPERTIES_PER_USER_PER_RUN`** and add **SQL-side eligibility** / paging for `getRefreshEligibleUsers`.
- [ ] Refactor **`captureServerEvent`** to reuse a PostHog server client and batch flush per invocation.
- [ ] Evaluate **ISR** or static shells for legal/marketing pages once session-dependent nav is isolated.
- [ ] Consider **pagination or slimmer selects** for `GET /api/properties` at high tier limits.

## Re-test checklist

- [ ] Verify RentCast **call volume** and cron **duration** after quota/cap changes (staging + provider dashboard).
- [ ] Verify webhook/cron **latency** and PostHog **event receipt** after batching changes.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Quarterly; after changes to `app/lib/refresh.ts`, estimate routes, cron schedules, or `posthog-server.ts`; before scale milestones (user/property counts).
- **Recommended next run:** **2026-07-29** (quarterly) or the next release touching cron/integrations listed above.
