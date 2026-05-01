# Performance & Cost Audit — 2026-04-30

## Executive summary

- **Overall:** Practices in `docs/architecture-and-build-practices.md` §2.5 remain largely in force: `app/next.config.ts` keeps `experimental.optimizePackageImports` for `lucide-react` and `recharts`; dashboard charts use `next/dynamic` for Recharts slices (`app/app/(app)/dashboard/dashboard-charts.tsx`). The authenticated shell uses `dynamic = "force-dynamic"` with `unstable_cache` for banner counts (`app/app/(app)/layout.tsx`).
- **Top risk:** **RentCast automation vs. user-facing quotas** — `refreshProperty` in `app/lib/refresh.ts` calls RentCast value/rent APIs without `RentCastApiCall` ledger parity, while `MAX_PROPERTIES_PER_USER_PER_RUN` is still `Number.POSITIVE_INFINITY`, so a single eligible payer can drive two upstream calls per property missing a monthly snapshot in one cron pass. `getRefreshEligibleUsers` still loads a wide user/property graph then filters in application code.
- **Improved since last pass:** **Monthly refresh analytics** — `app/app/api/cron/monthly-refresh/route.ts` uses `captureServerEvents` (`app/lib/posthog-server.ts`) to batch PostHog flushes per user instead of multiple sequential `captureServerEvent` shutdowns. Other routes (billing webhook, email crons, `app/lib/auth.ts`) still instantiate a client per `captureServerEvent` with `flushAt: 1`.
- **Recommendation:** Prioritize **cron RentCast budgeting + SQL-eligible cohort shaping**; then **reduce remaining per-event PostHog client lifecycles** on hot paths (especially multi-capture handlers). Validate with provider and Vercel metrics after changes.

## Severity-ranked findings

### Critical

- (None in this pass — no unauthenticated spend vector or hard outage identified; cron remains gated by `CRON_SECRET` in `app/app/api/cron/monthly-refresh/route.ts` and batch size by `MAX_REFRESH_BATCH_SIZE` in `app/lib/refresh.ts`. Dominant risks remain **cost and duration at scale**; see High.)

### High

- **RentCast monthly refresh outside the documented hourly `RentCastApiCall` pool** — `refreshProperty` performs `fetchValueEstimate` / `fetchRentEstimate` (`app/lib/refresh.ts`) with no `RentCastApiCall` writes in that path (grep: no matches in `refresh.ts`). User-triggered estimate and benchmark routes still participate in quota mechanics per `docs/reference/rentcast-quota.md`; automation does not, so **operator-visible limits** do not bound **cron-driven** vendor usage.
- **No per-user property cap on cron refresh** — `MAX_PROPERTIES_PER_USER_PER_RUN = Number.POSITIVE_INFINITY` with comment `// no explicit per-user cap today` (`app/lib/refresh.ts`); `processUserRefresh` slices with `user.properties.slice(0, MAX_PROPERTIES_PER_USER_PER_RUN)` — effectively **all** missing-snapshot properties for that user. With `ESTIMATED_RENTCAST_CALLS_PER_PROPERTY = 2`, large portfolios create **spiky** external cost and function runtime.

### Medium

- **`getRefreshEligibleUsers` loads all property-owning users then filters in JS** — `prisma.user.findMany` with nested `properties` (mortgages + month snapshots) (`app/lib/refresh.ts`); tier/activity/snapshot rules applied after fetch. Growth increases **DB payload, CPU, and cold-start time** before any RentCast I/O.
- **PostHog server: per-call client + `shutdown` still common** — `captureServerEvent` uses `new PostHog`, `flushAt: 1`, and `await client.shutdown()` (`app/lib/posthog-server.ts`). Call sites remain on `app/app/api/billing/webhook/route.ts`, several email crons (`trial-emails`, `onboarding-emails`, etc.), and `app/lib/auth.ts` (trial started). **Mitigation:** `captureServerEvents` exists and is used by `monthly-refresh`; extend similar batching or a shared client where multiple captures occur per invocation.
- **No `export const revalidate` in `app/`** — grep 2026-04-30: no matches. Architecture §2.5 suggests ISR for rarely changing legal copy; session-dependent marketing may constrain this, but the **caching gap** remains for surfaces that could split static shells vs. personalized islands.
- **`npm run build` runs `prisma migrate deploy && next build`** — `app/package.json`. Impacts **CI/deploy time**, **DB connectivity requirement**, and **failure surface** on every build.

### Low

- **`GET /api/properties` returns full mortgage trees, no pagination** — `findMany` with `include: { mortgages: true }` (`app/app/api/properties/route.ts`); tier caps bound worst case partially; still **payload/hydration** cost for large accounts.
- **Root layout third-party surface** — `app/app/layout.tsx` stacks Clerk, consent, PostHog, ads/analytics clients per architecture; **profiling** candidate for marketing LCP/JS main-thread (audit-only; no Lighthouse run this pass).
- **Marketing calculator homepage** — `PublicCalculator` loading pattern remains a minor bundle concern versus deferred slots (`app/components/marketing/calculator-page-slots.tsx` pattern referenced in prior audits).

## Evidence reviewed

- Process: `docs/process/performance-cost-audit-process.md`; template: `docs/process/audit-report-template.md`
- Architecture / performance: `docs/architecture-and-build-practices.md` §2.5
- Bundling: `app/next.config.ts`, `app/package.json`
- Charts: `app/app/(app)/dashboard/dashboard-charts.tsx`
- App shell caching: `app/app/(app)/layout.tsx`
- RentCast cron: `app/lib/refresh.ts`, `app/app/api/cron/monthly-refresh/route.ts`, `docs/reference/rentcast-quota.md` (by reference)
- PostHog server: `app/lib/posthog-server.ts`, `captureServerEvent` / `captureServerEvents` usage grep under `app/`
- API list payload: `app/app/api/properties/route.ts`
- ISR: grep `export const revalidate` under `app/`

**Limits of this pass:** No Lighthouse/Web Vitals exports, no live RentCast or PostHog billing pulls, no Vercel Function duration samples — conclusions are **code- and doc-informed** with qualitative impact estimates.

## Risk & impact assessment

- **RentCast + cron:** Primary **variable vendor cost** and **timeout risk** as eligible cohorts and property counts grow; user quotas do not throttle automation.
- **PostHog (residual):** **Latency and ingest overhead** on webhooks and multi-event crons; lower urgency than 2026-04-29 where monthly-refresh amplified sequential shutdowns.
- **Eligibility query:** **Database and CPU** scale pressure on cron invocations independent of third-party limits.

## Recommendations (prioritized)

1. **RentCast cron governance:** Add a finite `MAX_PROPERTIES_PER_USER_PER_RUN`, optional per-invocation **call ceiling**, and ledger alignment (`RentCastApiCall` or documented automation-specific accounting) with `docs/reference/rentcast-quota.md`. Push eligibility into **SQL** (`where` / relations) and **page** users instead of loading the full cohort.
2. **PostHog server paths:** Batch multi-event handlers with `captureServerEvents` or a **singleton/request-scoped** client (higher `flushAt`, single `shutdown` per handler). Start with **`billing/webhook`** and **`trial-emails`** (multiple captures per flow).
3. **Caching:** For routes where HTML does not need per-request session at the page level, add **`revalidate`** or document **client-island** splits per §2.5.

## Task candidates (optional)

- [ ] Cap **`MAX_PROPERTIES_PER_USER_PER_RUN`** and add **SQL-side eligibility** / user paging in `getRefreshEligibleUsers`.
- [ ] Record or bound **RentCast** calls from `refreshProperty` in line with quota docs.
- [ ] Refactor **billing webhook** and **trial-emails** to batch or reuse PostHog server client.
- [ ] Evaluate **ISR** or static shells for legal/marketing once session checks move to islands.

## Re-test checklist

- [ ] Verify RentCast **call volume** and cron **duration** after quota/cap changes (staging + provider dashboard).
- [ ] Verify webhook/cron **latency** and PostHog **event delivery** after further batching.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Quarterly; after changes to `app/lib/refresh.ts`, estimate/cron routes, or `posthog-server.ts`; before scale milestones.
- **Recommended next run:** **2026-07-30** (quarterly) or the next release touching cron, RentCast, or server analytics.
