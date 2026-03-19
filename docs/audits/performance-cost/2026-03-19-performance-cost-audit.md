# Performance & Cost Audit — 2026-03-19

## Executive summary

- Dashboard charts are correctly lazy-loaded via `next/dynamic`, but Modeling and Mortgage workspaces import Recharts at top level — adding the full chart library to their initial bundle.
- No N+1 query patterns found; Prisma queries use `include` and `Promise.all` appropriately.
- Caching is limited: only the app layout uses `unstable_cache` (30s revalidate). Static public pages (Privacy, Terms) have no `revalidate` and are force-dynamic due to the app layout.
- Several client-side data fetches could be server-rendered (subscription details, amortization chart).
- External API costs are manageable at current scale but the dashboard rent-vs-market section can exhaust RentCast hourly limits by firing parallel benchmark refreshes.

---

## Severity-ranked findings

### Critical

- None found.

### High

- None found.

### Medium

**M1 — Recharts imported at top level in projections-tab-content and mortgage-tab-content**

- `app/(app)/properties/[id]/projections-tab-content.tsx` lines 14–23: Direct import of `Area`, `AreaChart`, `CartesianGrid`, `Legend`, `Line`, `ResponsiveContainer`, `Tooltip`, `XAxis`, `YAxis`.
- `app/(app)/properties/[id]/mortgage-tab-content.tsx` lines 15–21: Direct import of `CartesianGrid`, `Line`, `LineChart`, `ResponsiveContainer`, `Tooltip`, `XAxis`, `YAxis`.
- These components are used by:
  - `app/(app)/mortgage/mortgage-workspace.tsx` (imports `MortgageTabContent` line 7)
  - `app/(app)/modeling/modeling-workspace.tsx` (imports `ProjectionsTabContent` line 6)
- Visiting `/mortgage` or `/modeling` pulls the full Recharts bundle (~200KB gzipped) on initial page load, even before a chart is visible.
- **Contrast:** Dashboard correctly uses `next/dynamic` in `dashboard-charts.tsx` (lines 23–35) with `ssr: false` and loading placeholders.
- **Fix:** Wrap chart subcomponents in `next/dynamic` or lazy-load the tab content components.

**M2 — Dashboard rent-vs-market parallel API calls can exhaust RentCast limits**

- `app/(app)/dashboard/rent-vs-market-section.tsx` lines 80–94: `Promise.all(staleOrMissing.map(p => fetch(...)))` fires one benchmark refresh per stale property simultaneously.
- With 5+ stale properties and an Investor plan (10 calls/hour limit), a single dashboard load can exhaust the entire hourly quota.
- No throttling, batching, or sequential execution is implemented.
- **Fix:** Execute benchmark refreshes sequentially or cap concurrent refreshes to 2–3.

### Low

**L1 — Route-level error boundary does not report to Sentry**

- `app/(app)/error.tsx`: Shows "Something went wrong" with retry/back buttons but does not call `Sentry.captureException(error)`.
- `app/global-error.tsx`: Correctly calls `Sentry.captureException(error)`.
- Route-level errors in the app shell are not tracked in Sentry, only root-level errors are.
- **Fix:** Add `Sentry.captureException(error)` in `(app)/error.tsx`.

**L2 — Client-side fetches that could be server-rendered**

| Component | Fetch | Alternative |
|-----------|-------|-------------|
| `SubscriptionBillingDisplay` (`settings/subscription-billing-display.tsx` lines 18–30) | `useEffect` fetches `/api/billing/subscription-details` on mount | Settings page could pass subscription data as server props |
| `AmortizationChart` (`components/charts/amortization-chart.tsx` lines 29–36) | `useEffect` fetches `/api/properties/${propertyId}/amortization` on mount | Amortization page could prefetch server-side |
| `MortgageSection` (`properties/mortgage-section.tsx` lines 57–64) | `refreshMortgages()` fetches mortgage list | Initial data could come from page props |

These are not critical but represent unnecessary client-side round trips that add loading latency.

**L3 — Static pages have no `revalidate`**

- Privacy (`app/privacy/page.tsx`), Terms (`app/terms/page.tsx`), Contact (`app/contact/page.tsx`): No `export const revalidate` set.
- These pages change rarely and could benefit from `revalidate = 3600` (1 hour).
- However, the app layout exports `dynamic = "force-dynamic"`, so pages under `(app)` are inherently dynamic. Public pages outside `(app)` could potentially be static.

**L4 — Import route uses sequential creates**

- `app/api/import/portfolio/route.ts` lines 119–174: `for` loop with sequential `tx.property.create()` and `tx.mortgage.create()` inside a Prisma transaction.
- Not a classic N+1 (no reads in loop), but sequential writes become slow with large imports (20+ properties).
- Prisma does not support `createMany` with nested relations, so this pattern is expected.

---

## Detailed analysis

### Lazy loading audit

| Component | File | Lazy loaded | Status |
|-----------|------|-------------|--------|
| `EquityChart` | `dashboard-charts.tsx` L23–27 | `next/dynamic`, `ssr: false`, loading placeholder | PASS |
| `DebtVsValueChart` | `dashboard-charts.tsx` L28–31 | Same | PASS |
| `CashFlowChart` | `dashboard-charts.tsx` L32–35 | Same | PASS |
| `AmortizationChart` | `amortization-chart-dynamic.tsx` L5–18 | `next/dynamic`, `ssr: false`, loading placeholder | PASS |
| `ProjectionsTabContent` (Recharts) | `projections-tab-content.tsx` L14–23 | **No** — direct top-level import | FAIL |
| `MortgageTabContent` (Recharts) | `mortgage-tab-content.tsx` L15–21 | **No** — direct top-level import | FAIL |

### N+1 query analysis

| Route | Query pattern | N+1 risk |
|-------|---------------|----------|
| `api/properties` GET | `findMany` with `include: { mortgages: true }` | None |
| `api/properties/[id]` GET | `findFirst` with `include: { mortgages: true }` | None |
| `api/deals` GET | `findMany` (no nested) | None |
| `api/portfolio/summary` GET | `findMany` with `include: { mortgages: true }` | None |
| `api/export/portfolio` GET | `findMany` with `include: { mortgages: true }` | None |
| `api/import/portfolio` POST | Sequential creates in transaction (not N+1) | Low (sequential writes) |
| `api/admin` page | `Promise.all` for parallel Prisma calls | None |
| Dashboard server component | Single `findMany` with `include` | None |

No N+1 patterns found. All list queries use Prisma `include` for eager loading.

### Caching strategy

| Location | Cache | TTL | Notes |
|----------|-------|-----|-------|
| `app/(app)/layout.tsx` L16–31 | `unstable_cache` | 30s | Layout banner data (property/deal counts, subscription) |
| `app/(app)/layout.tsx` L10 | `force-dynamic` | N/A | All app pages are dynamic |
| Static pages (Privacy, Terms) | None | N/A | Could add `revalidate = 3600` |
| API routes | None | N/A | All dynamic responses |

### External API cost and rate-limit profiles

| Service | Pricing model | Rate limits | Current usage pattern |
|---------|--------------|-------------|----------------------|
| **RentCast** | Per API key tier | Free: 5/hr, Investor: 10/hr, Pro: 20/hr | Rent/value estimates, benchmark refresh |
| **Stripe** | Per transaction (2.9% + $0.30) | No documented rate limit | Checkout, webhooks, portal, sync |
| **Clerk** | Free tier: 10K MAU | Per plan | Auth on every request |
| **Resend** | Free: 100/day, 3K/month | Per plan | Contact form emails only |
| **Sentry** | Free: 5K errors/month | Per plan | Error tracking (10% sample rate in prod) |
| **Neon (PostgreSQL)** | Free: 0.5 GB storage | Per plan | All database operations |
| **Vercel** | Free: 100 GB bandwidth | Per plan | Hosting/deployment |

**Cost hotspots:**
1. RentCast is the only per-call external API with meaningful cost. Dashboard bulk refresh is the highest-risk pattern.
2. Stripe costs scale with transactions (not API calls).
3. All other services are within free-tier limits for early-stage usage.

### Bundle size risk assessment

| Page | Heavy imports | Risk |
|------|-------------|------|
| `/dashboard` | Recharts (lazy-loaded) | Low |
| `/properties` | None | None |
| `/properties/[id]` | None (charts removed to workspaces) | None |
| `/modeling` | Recharts (NOT lazy-loaded via `ProjectionsTabContent`) | Medium |
| `/mortgage` | Recharts (NOT lazy-loaded via `MortgageTabContent`) | Medium |
| `/analyze` | None | None |
| `/deals` | None | None |
| `/plans`, `/settings` | None | None |

### Blocking server component analysis

All protected pages wait on `getAppUser()` (Clerk auth) before any data fetch. This is unavoidable for auth-gated pages. Layout uses `unstable_cache` for banner data, which reduces DB calls.

| Page | Blocking calls | External API | Notes |
|------|---------------|--------------|-------|
| Dashboard | Auth → DB (properties with include) | None at render | Benchmark refresh is client-initiated |
| Properties | Auth → DB (properties with include) | None | OK |
| Property detail | Auth → DB (property with include) | None | OK |
| Modeling | Auth → DB (properties with include) | None | OK |
| Mortgage | Auth → DB (properties with include) | None | OK |
| Settings | Auth → DB (user) | None | Subscription details fetched client-side |

No external APIs block server rendering. RentCast calls are user-initiated (estimate buttons, benchmark refresh).

---

## Evidence reviewed

- `app/next.config.ts` (build config, security headers, `optimizePackageImports`)
- `app/(app)/layout.tsx` (caching, dynamic export)
- `app/(app)/dashboard/dashboard-charts.tsx` (lazy loading)
- `app/(app)/dashboard/rent-vs-market-section.tsx` (parallel API calls)
- `app/(app)/properties/[id]/projections-tab-content.tsx` (top-level Recharts import)
- `app/(app)/properties/[id]/mortgage-tab-content.tsx` (top-level Recharts import)
- `app/(app)/properties/[id]/amortization-chart-dynamic.tsx` (lazy loading)
- `app/(app)/settings/subscription-billing-display.tsx` (client fetch)
- `app/components/charts/amortization-chart.tsx` (client fetch)
- `app/app/api/import/portfolio/route.ts` (sequential creates)
- `app/app/api/export/portfolio/route.ts` (single query)
- `app/app/(app)/admin/page.tsx` (parallel queries)
- All API route files (query patterns)
- `app/lib/integrations/rentcast.ts` (timeout, error handling)

---

## Risk & impact assessment

- **Recharts bundle in Modeling/Mortgage (M1):** Users visiting these pages pay ~200KB extra in initial load. Not catastrophic but avoidable since the pattern for lazy loading already exists in dashboard-charts.
- **RentCast limit exhaustion (M2):** A user with 10 properties on Investor plan (10 calls/hr) who visits dashboard with stale benchmarks will hit rate limit immediately, getting errors for remaining calls. Poor UX.
- **Missing Sentry reporting (L1):** Route-level errors in the app shell silently disappear from error tracking. Could miss real production issues.

---

## Recommendations (prioritized)

1. **Lazy-load Recharts in Modeling and Mortgage** — Wrap `ProjectionsTabContent` and `MortgageTabContent` (or their chart subcomponents) in `next/dynamic` with `ssr: false` and loading skeletons.
2. **Throttle dashboard benchmark refreshes** — Execute sequentially or cap at 2–3 concurrent calls. Show progress indicator.
3. **Add Sentry to route-level error boundary** — Add `Sentry.captureException(error)` in `app/(app)/error.tsx`.
4. **Server-render subscription details** — Pass from Settings page server component instead of client-side fetch.
5. **Evaluate `revalidate` for public static pages** — Privacy, Terms could use `revalidate = 3600` if they are outside the `(app)` layout.

---

## Task candidates

- [ ] Wrap `ProjectionsTabContent` or its chart in `next/dynamic` with `ssr: false`.
- [ ] Wrap `MortgageTabContent` or its chart in `next/dynamic` with `ssr: false`.
- [ ] Add sequential or throttled execution to dashboard benchmark refresh loop.
- [ ] Add `Sentry.captureException(error)` to `app/(app)/error.tsx`.
- [ ] Pass subscription details as server props to Settings page.

---

## Re-test checklist

- [ ] Verify Modeling and Mortgage pages show loading skeleton before chart renders.
- [ ] Verify dashboard benchmark refresh does not exceed RentCast tier limit.
- [ ] Verify route-level errors appear in Sentry after adding capture.
- [ ] `npm run check` passes.

---

## Next trigger and cadence

- Trigger: new integration, chart-heavy UI, or caching strategy changes
- Recommended next run: monthly
