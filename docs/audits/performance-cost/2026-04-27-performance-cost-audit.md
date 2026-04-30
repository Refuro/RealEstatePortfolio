# Performance & Cost Audit — 2026-04-27

## Executive summary

- **Overall:** Core app data paths generally avoid obvious N+1 Prisma patterns (e.g. dashboard portfolio load uses a bounded `findMany` with `include: { mortgages: true }`). Heavy UI (Recharts) is mostly code-split with `next/dynamic` and `ssr: false`, and `next.config.ts` enables `experimental.optimizePackageImports` for `lucide-react` and `recharts`.
- **Top risk:** **Third-party spend and serverless overhead** — scheduled **RentCast** usage in monthly refresh does not go through the same `RentCastApiCall` hourly quota as user-facing estimate routes, and eligibility loading can pull a very large user graph in one query. **Server PostHog** uses a new client + `shutdown()` per event, multiplying HTTP work on cron and webhook paths.
- **Rendering / cache:** Public and pricing surfaces call `getAppUser()` / session-aware patterns, so marketing HTML stays **dynamic per request** with no route-level `revalidate` anywhere in the app package — consistent with `docs/architecture-and-build-practices.md` but a deliberate TTFB/cache tradeoff.
- **Recommendation:** Prioritize **RentCast cron budgeting + query shaping** and **batched/singleton PostHog server client** before micro-optimizing bundles; keep measuring after changes with Vercel analytics and provider dashboards.

## Severity-ranked findings

### Critical

- (None identified in this pass — no single issue met “immediate production outage or unbounded spend with no mitigation” given current batch defaults and auth gates. RentCast scaling remains the closest watch item; see High.)

### High

- **RentCast monthly refresh bypasses per-user quota accounting and can drive large provider bill spikes** — User routes record each successful call via `prisma.rentCastApiCall.create` after `fetchValueEstimate` / `fetchRentEstimate` (`app/app/api/estimates/value/route.ts`, `app/app/api/estimates/rent/route.ts`). The cron path calls the same fetch helpers from `refreshProperty` in `app/lib/refresh.ts` **without** inserting `RentCastApiCall`, so the documented hourly pool in `docs/reference/rentcast-quota.md` does not limit cron spend. For each eligible user, **every property missing a snapshot for the month** triggers up to **two** upstream calls (value + rent). `MAX_PROPERTIES_PER_USER_PER_RUN` is `Infinity` (`app/lib/refresh.ts`), so a Pro user with many properties can generate **2 × N** calls in one cron iteration.
- **PostHog server capture opens a new client and flushes on every event** — `captureServerEvent` in `app/lib/posthog-server.ts` constructs `new PostHog(...)`, sets `flushAt: 1`, then `await client.shutdown()` per call. Cron routes such as `app/app/api/cron/monthly-refresh/route.ts` await **up to three** captures per user per batch iteration; other crons and `app/app/api/billing/webhook/route.ts` do the same pattern. Under serverless this adds **serial network latency**, **more invocations time**, and **higher PostHog ingestion overhead** than a shared buffered client or batched shutdown.
- **`getRefreshEligibleUsers` loads all non-deleted users with properties and nested mortgages/snapshots, then filters in memory** — `app/lib/refresh.ts` uses an unbounded `prisma.user.findMany` with deep `select` trees. As the user base grows, this becomes a **large single-query payload**, **high DB CPU/memory**, and **slow cron startup** before any RentCast calls run.

### Medium

- **No `export const revalidate` on static-friendly public pages** — Repo-wide search shows **no** route-level `revalidate` in `app/`. `docs/architecture-and-build-practices.md` §2.5 suggests values like `revalidate = 3600` for rarely changing legal copy; **Privacy/Terms/changelog-style** pages could still be constrained by session-aware nav if they call `getAppUser()`, but any **fully static** segments are not explicitly ISR-cached today.
- **Rate limiting doubles Prisma traffic on guarded actions** — `checkRateLimit` runs a `count` and `recordRateLimit` inserts a row (`app/lib/rate-limit.ts`) for each allowed request. This is correct for abuse prevention but is **steady-state DB write/read volume** on hot routes (properties, deals, billing, export, Places).
- **Build pipeline runs `prisma migrate deploy` on every `npm run build`** — `app/package.json` `build` script chains migration deploy before `next build`. This affects **CI minutes**, **deploy duration**, and **database connection usage** on every build (not end-user page load, but real **cost and failure surface**).
- **Authenticated app shell is `force-dynamic` with partial `unstable_cache` for banner counts** — `app/app/(app)/layout.tsx` forces dynamic rendering for session-accurate chrome; banner data uses `unstable_cache` with 30s revalidate and tags. Acceptable pattern, but **every navigation** still pays session/layout work; worth monitoring as app chrome grows.

### Low

- **Property list API returns full mortgage trees for all properties** — `GET` in `app/app/api/properties/route.ts` has no pagination; large accounts get **bigger JSON** and Prisma hydration cost. Tier limits cap portfolio size somewhat, but this remains a **payload** consideration for mobile clients.
- **Marketing homepage `PublicCalculator` uses `dynamic()` without `ssr: false`** — `app/app/page.tsx` loads `@/components/marketing/public-calculator` dynamically; the module is `"use client"` and does not import Recharts, so risk is **low**. Heavier calculator slots in `app/components/marketing/calculator-page-slots.tsx` correctly set `ssr: false`.
- **Third-party script weight in root layout** — `app/app/layout.tsx` loads Clerk, cookie consent, PostHog gate, Google Ads helpers, and Vercel analytics. Conditional consent reduces some loads, but **main-thread cost** on marketing remains a **profiling** candidate (not a code defect).

## Evidence reviewed

- Process: `docs/process/performance-cost-audit-process.md`, template: `docs/process/audit-report-template.md`
- Architecture / performance practices: `docs/architecture-and-build-practices.md` §2.5
- Next build & bundling: `app/next.config.ts`, `app/package.json`
- Layout & caching: `app/app/layout.tsx`, `app/app/(app)/layout.tsx`
- Data loading: `app/lib/server/portfolio-summary-payload.ts`, `app/app/(app)/dashboard/page.tsx` (partial)
- API & quotas: `app/app/api/properties/route.ts`, `app/app/api/estimates/value/route.ts`, `app/lib/refresh.ts`, `app/app/api/cron/monthly-refresh/route.ts`
- Analytics cost pattern: `app/lib/posthog-server.ts`, call sites via `captureServerEvent` grep
- Rate limits: `app/lib/rate-limit.ts`
- Docs cross-check: `docs/reference/rentcast-quota.md`

**Limits of this pass:** No production Lighthouse/Web Vitals traces, no Vercel Function duration samples, and no live Stripe/PostHog/RentCast billing exports — findings are **code- and architecture-informed** with qualitative impact.

## Risk & impact assessment

- **RentCast + cron:** At higher property counts and batch sizes, **variable external API cost** and **Vercel execution time** are the main business risks; user-facing quotas do not bound cron.
- **PostHog server:** Unlikely to break correctness, but **inflates tail latency** on webhooks and email cron and can **increase observability vendor load**.
- **Large `findMany` for refresh eligibility:** Mostly **DB scalability** and **predictable cron duration**; risk grows with row count even before third-party calls.

## Recommendations (prioritized)

1. **RentCast cron governance:** Cap **properties per user per run**, **calls per cron invocation**, or **monthly provider budget**; optionally record cron calls in `RentCastApiCall` (or a separate ledger) for **audit parity** with `docs/reference/rentcast-quota.md`. Push eligibility filtering into **SQL** (`where` / `some` / `none` on snapshots) and **page** users instead of loading the full cohort.
2. **PostHog server:** Use a **singleton** `PostHog` with higher `flushAt` / `flushInterval`, or batch events and **one shutdown** per invocation; fire-and-forget with careful error handling if latency must not block responses.
3. **ISR / caching policy:** For routes that are **truly static** without session-dependent HTML, add `revalidate`; for session-dependent marketing, document or implement the **client boundary split** hinted in architecture docs so static shells can cache.

## Task candidates (optional)

- [ ] Add **SQL-side filtering + pagination** for `getRefreshEligibleUsers` and a **finite** `MAX_PROPERTIES_PER_USER_PER_RUN` for monthly refresh.
- [ ] Refactor `captureServerEvent` to **reuse** a PostHog server client and **batch flush** per route handler / cron run.
- [ ] Review **legal/marketing** pages for **ISR** (`revalidate`) where session-aware nav can move to a client island.
- [ ] Consider **pagination or field projection** for `GET /api/properties` for large portfolios.

## Re-test checklist

- [ ] Verify RentCast **call volume** and **cron duration** after any cap or query change (staging + provider dashboard).
- [ ] Verify webhook and cron **latency** after PostHog batching; confirm events still arrive in PostHog.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Quarterly, after major **cron/integrations** changes, or before **scale milestones** (user/property count thresholds).
- **Recommended next run:** 2026-07-27 (quarterly) or next release touching `app/lib/refresh.ts`, estimate routes, or `posthog-server.ts`.
