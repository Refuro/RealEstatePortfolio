# Performance & Cost Audit — 2026-04-07

## Executive summary

- **Posture is aligned with documented practices:** `experimental.optimizePackageImports` covers `lucide-react` and `recharts`; chart surfaces and the refinance workspace use `next/dynamic` with `ssr: false` and loading placeholders; the authenticated shell uses `unstable_cache` for banner counts (30 s revalidate). No raw `<img>` tags were found under `app/` (image discipline holds).
- **Largest cost/scale risks remain operational, not rendering:** database-backed rate limiting still adds two Prisma round-trips per protected write and appends rows to `ApiRateLimitEntry` with no cleanup job; cold-start billing sync still reaches Stripe for any user with a `stripeCustomerId`.
- **One prior audit item is resolved:** the root layout no longer preconnects to `api.rentcast.io` (RentCast is server-only). Current `<head>` hints target Clerk, Stripe (`dns-prefetch`), and PostHog when configured.
- **Best bundle wins are still the monolithic client flows and duplicate server-side metric passes** on hot list/dashboard routes; refinance tooling follows the preferred deferred-load pattern.

---

## Severity-ranked findings

### Critical

- None identified in this static analysis pass.

### High

- **Database-backed rate limiting: two extra DB round-trips per write + unbounded `ApiRateLimitEntry` growth** — `app/lib/rate-limit.ts` uses `prisma.apiRateLimitEntry.count` (rolling 1-hour window) and `prisma.apiRateLimitEntry.create` for every limited action. Protected writes therefore pay check + record on top of business queries. There is no scheduled pruning of rows older than the window; the compound index `[identifier, action, createdAt]` (`app/prisma/schema.prisma` lines 159–167) keeps counts efficient today, but table size grows with traffic. **Evidence:** `app/lib/rate-limit.ts` lines 38–64, `app/prisma/schema.prisma` lines 159–167. **Impact:** multiplied DB latency and storage/vacuum cost on write-heavy growth.

- **Billing sync still invokes live Stripe on cold app load when `stripeCustomerId` is set** — `app/app/(app)/app-layout-client.tsx` (lines 82–126) fetches `/api/billing/sync` after a 5-minute sessionStorage throttle (bypassed on new session / `billing_return=1`). `app/app/api/billing/sync/route.ts` loads the user’s DB subscription id and prefers `stripe.subscriptions.retrieve` (lines 61–72), then falls back to `stripe.subscriptions.list` with `limit: 5` (lines 73–83). That reduces list churn when a stable subscription id exists but **does not** remove the Stripe round-trip for partial-checkout users who have a customer id. **Evidence:** `app/app/(app)/app-layout-client.tsx` lines 82–126, `app/app/api/billing/sync/route.ts` lines 49–83. **Impact:** aggregate Stripe API volume and cold-start latency scale with active users who ever started checkout.

### Medium

- **`add-property-wizard.tsx` remains a single large client module (~2,749 non-empty lines)** — No per-step lazy boundaries observed; the full wizard parses on first visit to `/properties/new`. **Evidence:** `app/app/(app)/properties/add-property-wizard.tsx` (line count via static grep). **Impact:** first-load JS and TTI on the primary activation path.

- **`deal-analyzer-form.tsx` remains a large monolithic client module (~1,598 non-empty lines)** — Same pattern for `/analyze`. **Evidence:** `app/app/(app)/analyze/deal-analyzer-form.tsx`. **Impact:** TTI on deal analysis.

- **Duplicate per-property work on `properties/page.tsx`** — `portfolioInput` mapping computes mortgage totals and `getPropertyTotalRent` (lines 161–183); `propertyCards` recomputes mortgage totals, calls `computePropertyMetrics`, and invokes `getPropertyTotalRent` multiple times per property (lines 197–247). **Evidence:** `app/app/(app)/properties/page.tsx` lines 161–247. **Impact:** redundant CPU on a frequent server render; grows with property count.

- **`dashboard/page.tsx` calls `computePropertyMetrics` twice per property for chart series** — Separate `.map()` passes for equity and cash flow both call `computePropertyMetrics` (lines 91–112). **Evidence:** `app/app/(app)/dashboard/page.tsx` lines 91–112. **Impact:** redundant CPU; scales with property count.

- **CSV portfolio import has no max body size / row cap before full parse** — `app/app/api/import/portfolio/route.ts` reads `await file.text()` then `Papa.parse` without a byte or row guard at the boundary (lines 31–46). Rate limit `import:portfolio` (5/hour) limits abuse frequency but not per-request memory. **Evidence:** `app/app/api/import/portfolio/route.ts` lines 31–46. **Impact:** memory spike risk on oversized uploads.

- **`GET /api/me` duplicates count queries already available from layout-adjacent data** — `app/app/api/me/route.ts` runs `property.count` and `savedDeal.count` (lines 16–19). `app/components/analytics/posthog-person-properties.tsx` calls this on load and on tab visibility (lines 27–46). Conceptually overlaps with `unstable_cache` banner data in `app/app/(app)/layout.tsx` (lines 28–44) though not the same response shape. **Evidence:** `app/app/api/me/route.ts` lines 16–19, `app/components/analytics/posthog-person-properties.tsx` lines 27–46, `app/app/(app)/layout.tsx` lines 28–44. **Impact:** extra API and DB work per analytics-enabled session.

### Low

- **No `Cache-Control` on read-only JSON APIs** — Example: `GET` handlers in `app/app/api/properties/route.ts` (lines 19–35) and `app/app/api/portfolio/summary/route.ts` (lines 6–14) return `NextResponse.json` without short private caching. **Impact:** missed opportunity to trim repeat fetches during in-session navigation (must stay user-private).

- **Mortgage collection route uses separate property lookup then `findMany`** — `app/app/api/properties/[id]/mortgage/route.ts` defines `getPropertyForUser` as `findFirst` without mortgages (lines 12–16), then loads mortgages in the handler. **Impact:** one extra round-trip vs a single `include: { mortgages: true }` (low-traffic route).

- **Redundant `force-dynamic` on analyze page** — `app/app/(app)/analyze/page.tsx` exports `dynamic = "force-dynamic"` while parent `(app)/layout.tsx` already sets it. **Evidence:** grep for `force-dynamic` in `app/app/(app)/analyze/page.tsx` and `app/app/(app)/layout.tsx`. **Impact:** clarity only.

### Resolved / positive (since 2026-04-05 audit)

- **RentCast root `preconnect` removed** — `app/app/layout.tsx` `<head>` now uses Clerk preconnect/dns-prefetch, Stripe dns-prefetch, and conditional PostHog preconnect (lines 158–177); no `api.rentcast.io` hint. Matches architecture guidance that RentCast is server-only.

- **Refinance workspace is code-split** — `app/app/(app)/refinance/refinance-workspace-loader.tsx` wraps `RefinanceWorkspace` in `next/dynamic` with `ssr: false` and a loading state (lines 6–17), ~754-line implementation in `refinance-workspace.tsx` loads on demand.

- **RentCast quota client-side dedup** — `app/lib/rentcast-quota-client.ts` retains in-flight deduplication and module cache (lines 7–44).

---

## Evidence reviewed

- **Process / template:** `docs/process/performance-cost-audit-process.md`, `docs/process/audit-report-template.md`.
- **Architecture (performance):** `docs/architecture-and-build-practices.md` §2.5.
- **Prior audit:** `docs/audits/performance-cost/2026-04-05-performance-cost-audit.md` (carry-forward and regression check).
- **Build / bundle:** `app/next.config.ts` (`optimizePackageImports`, Turbopack root, Sentry wrapper, security headers).
- **Caching / rendering:** `app/app/(app)/layout.tsx` (`force-dynamic`, `unstable_cache` banner data); `force-dynamic` usage across `(app)` and admin; dynamic import sites (dashboard charts, modeling/mortgage/refinance loaders, marketing pages, homepage).
- **Rate limiting & schema:** `app/lib/rate-limit.ts`, `app/prisma/schema.prisma` `ApiRateLimitEntry`.
- **External API cost:** `app/app/api/billing/sync/route.ts`, `app/app/(app)/app-layout-client.tsx`; RentCast routes under `app/app/api/estimates/`, `app/lib/integrations/rentcast.ts`, `app/lib/rentcast-quota.ts` / `rentcast-quota-client.ts`.
- **Hot-path server CPU:** `app/app/(app)/properties/page.tsx`, `app/app/(app)/dashboard/page.tsx`.
- **Import / memory:** `app/app/api/import/portfolio/route.ts`.
- **Read API responses:** `app/app/api/properties/route.ts`, `app/app/api/portfolio/summary/route.ts`.
- **Analytics overlap:** `app/app/api/me/route.ts`, `app/components/analytics/posthog-person-properties.tsx`.
- **Images:** ripgrep for `<img ` under `app/` (no matches).
- **Dependencies (cost-relevant):** `app/package.json` (PostHog, Stripe, Resend, Prisma, Recharts).

**Assumptions / limits:** No production bundle analyzer output, Web Vitals field data, or DB query plans. Findings are from static code review and line-count sampling. Connection pool / Accelerate configuration was not validated from env.

---

## Risk & impact assessment

- **DB rate limiting (High):** Write-path amplification and unbounded table growth are the main trajectory risks; mitigations are well-understood (prune job and/or external limiter).
- **Stripe sync (High):** Acceptable at low scale; growth in “customer id but free tier” cohorts increases cold-start Stripe calls and tail latency.
- **Large client modules (Medium):** Directly affects activation and analyze flows; splitting yields measurable JS savings but needs careful QA for draft/state.
- **Duplicate metrics / `/api/me` (Medium):** CPU and DB noise until property counts grow; consolidation is low-risk refactors.
- **CSV import (Medium):** Low probability, high blast radius for memory; worth fixing before scaling import usage.

---

## Recommendations (prioritized)

1. **Add pruning for `ApiRateLimitEntry`** — Delete rows older than the rolling window (e.g. hourly cron). Longer-term: evaluate Upstash/Redis to drop per-write DB overhead.
2. **Narrow billing sync Stripe calls** — e.g. skip or defer live Stripe when local state indicates no active subscription and no `stripeSubscriptionId`, with explicit rules for “customer exists, all canceled” cohorts; keep portal-return bypass.
3. **Lazy-load wizard/analyzer sections** — `next/dynamic` or `React.lazy` for non–step-1 UI in add-property and deal analyzer; target measurable reduction in first-load JS on those routes.
4. **Single-pass property metrics on `properties/page.tsx` and `dashboard/page.tsx`** — Compute once per property, reuse for cards and charts.
5. **Bound CSV import** — Reject via `Content-Length` or early size check; cap parsed rows before full materialization.
6. **Optional: short `Cache-Control: private`** on stable read-only aggregates where safe — only if semantics and auth headers are verified; start with lowest-risk endpoints.

---

## Task candidates

- [ ] Scheduled cleanup of `ApiRateLimitEntry` rows older than 1 hour
- [ ] Refine `/api/billing/sync` to avoid unnecessary Stripe calls for churned / abandoned-checkout users (document rules in security/billing notes)
- [ ] Split `add-property-wizard.tsx` step bodies into lazy-loaded chunks
- [ ] Split `deal-analyzer-form.tsx` major sections into lazy-loaded chunks
- [ ] Consolidate duplicate mortgage/rent/metrics passes in `app/app/(app)/properties/page.tsx`
- [ ] Consolidate `computePropertyMetrics` usage in `app/app/(app)/dashboard/page.tsx` chart building
- [ ] Add max upload size and row limit to `app/app/api/import/portfolio/route.ts`
- [ ] Merge mortgage GET into one Prisma query in `app/app/api/properties/[id]/mortgage/route.ts`
- [ ] Pass banner counts into PostHog sync or cache `/api/me` counts briefly to avoid duplicate DB hits when analytics is on

---

## Re-test checklist

- [ ] After rate-limit pruning: verify limits still enforce correctly for in-window traffic
- [ ] After billing sync change: verify portal return and tier upgrades still refresh
- [ ] After wizard/analyzer splits: full flow QA (drafts, mobile, RentCast triggers)
- [ ] After metrics consolidation: `npm run test` for metrics modules
- [ ] After import limits: valid imports succeed; oversized files fail fast with clear errors
- [ ] `npm run check` when any code changes ship

---

## Next trigger and cadence

- **Trigger:** Monthly or after major feature work touching billing, import, dashboards, or new heavy client bundles.
- **Recommended next run:** 2026-05-07 or the next release candidate, whichever comes first.
