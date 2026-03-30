# Code Audit — 2026-03-28

## Executive summary

- **Overall:** The stack matches documented patterns: Clerk + `proxy.ts`, `getActiveAppUser()` on protected APIs, Zod validation, Prisma scoped by `userId`, metrics and benchmark helpers centralized in `lib/`. Recent work (`isRented`, `lib/benchmark-utils.ts`, dashboard rent-vs-market) is consistent with the single-source-of-truth goal for eligibility labels.
- **Top risks:** (1) **Dashboard auto-refresh** of stale benchmarks issues **sequential** POSTs to `/api/properties/[id]/benchmark/refresh`, consuming shared hourly RentCast quota and adding latency; (2) **Very large client/route modules** (add wizard, property form, projections tab) exceed the architecture guideline (~300 lines) and concentrate UI + behavior; (3) **Marketing pages** still use raw `<img>` despite architecture guidance for `next/image`.
- **Recommendation:** Tame dashboard-side benchmark refresh (batch, cap, defer, or user-triggered only), continue modularizing the largest property flows, and finish the marketing image migration called out in prior audits.

## Severity-ranked findings

### Critical

- *(none identified this pass)*

### High

- **Dashboard benchmark auto-refresh — sequential API and quota usage** — On load, `RentVsMarketSection` runs a `for` loop that `await`s `POST /api/properties/[id]/benchmark/refresh` for every stale/missing benchmark. Each call hits RentCast (when not rate-limited), increments `rentCastApiCall`, and counts toward `getRentCastHourlyLimit` (e.g. 5/hour on free). A user with many stale properties can exhaust the hourly budget in one visit, see long sequential failures, and create avoidable cost and UX friction. — `app/app/(app)/dashboard/rent-vs-market-section.tsx` (lines ~82–94), `app/app/api/properties/[id]/benchmark/refresh/route.ts`

- **Oversized property and detail modules** — Core flows remain in multi-thousand-line files, well above the ~300-line “split when large” guidance in `docs/architecture-and-build-practices.md`. This increases merge conflict risk, makes behavior changes harder to review, and works against the “thin components / logic in lib” mantra. — `app/app/(app)/properties/add-property-wizard.tsx` (~1536 lines), `app/app/(app)/properties/property-form.tsx` (~1016 lines), `app/app/(app)/properties/[id]/projections-tab-content.tsx` (~1017 lines) (line counts from `wc -l` at audit time)

### Medium

- **App shell `force-dynamic`** — `(app)/layout.tsx` exports `dynamic = "force-dynamic"` so the whole authenticated subtree opts out of static rendering. The comment documents user-specific banner data; still, the tradeoff is broader than page-level caching and is worth revisiting if Clerk/layout patterns allow narrower dynamism later. — `app/app/(app)/layout.tsx`

- **Marketing / legal pages: no explicit `revalidate`** — Architecture §2.5 recommends `export const revalidate` for rarely changing static content. No `revalidate` exports were found under `app/app/` (grep). Public pages may still behave acceptably by default, but the documented pattern is not applied consistently. — e.g. `app/app/privacy/page.tsx`, `app/app/terms/page.tsx`, `app/app/pricing/page.tsx`

- **Raw `<img>` on landing and pricing** — Next.js and internal architecture prefer `next/image` for user-facing images (LCP, sizing). Landing and pricing still use `<img>` for screenshots. — `app/app/page.tsx`, `app/app/pricing/page.tsx` (matches finding in `2026-03-20-code-audit.md`)

- **Duplicate benchmark delta math** — Percent above/below market is computed inline in the benchmark refresh route (`pctAboveBelow`) while `lib/benchmark-utils.ts` owns `getBenchmarkPct` / `getBenchmarkLabel`. Risk of subtle drift if one path changes. — `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/lib/benchmark-utils.ts`

### Low

- **`serializeProperty` typing** — Mortgage objects in the serializer use an index signature `[key: string]: unknown`, which weakens type safety for API responses. — `app/app/api/properties/[id]/route.ts`

- **Design token drift (minor)** — Rent vs. market section uses `shadow-sm` on a card; design spec emphasizes flat, minimal chrome. Small inconsistency vs. “clarity over decoration.” — `app/app/(app)/dashboard/rent-vs-market-section.tsx`

- **`/api/health` exposes DB status** — Unauthenticated health checks are normal for load balancers; still a small information disclosure surface (confirms DB reachability). — `app/app/api/health/route.ts`

- **`POST /api/contact` uses `getAppUser()`** — Allows associating submissions with a user id when logged in; soft-deleted users are not blocked here (unlike `getActiveAppUser` APIs). Low impact given rate limits and public form use. — `app/app/api/contact/route.ts`

## Evidence reviewed

- Process: `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`
- Policies: `docs/policies/design-spec.md` (sample), `docs/architecture-and-build-practices.md` (§2 layered flow, §2.5 performance, file-size guidance), `docs/security/security-notes.md`
- **Auth boundary:** `app/proxy.ts` public route list; `app/lib/auth.ts` (`getAppUser` / `getActiveAppUser`)
- **API sample:** `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/app/api/contact/route.ts`, `app/app/api/health/route.ts`, `app/app/api/estimates/rent/route.ts`
- **Recent / high-churn areas (git status):** `app/lib/benchmark-utils.ts`, dashboard `rent-vs-market-section.tsx`, property detail tabs, `property-form.tsx`, `add-property-wizard.tsx`, Prisma `Property.isRented`
- **Performance config:** `app/next.config.ts` (`optimizePackageImports`, security headers); `app/app/layout.tsx` (preconnect/dns-prefetch); `app/app/(app)/dashboard/dashboard-charts.tsx` (`next/dynamic` + loading placeholders)
- **Line counts:** `wc -l` on large property/dashboard files

## Risk & impact assessment

Uncontrolled sequential RentCast usage from the dashboard directly affects **cost**, **hourly limits**, and **perceived performance** for investors with multiple properties—highest practical risk among this pass’s findings. Monolithic files mainly affect **engineering velocity and defect rate** over time. Marketing `<img>` and missing `revalidate` affect **CWV and edge caching**, secondary to core app correctness.

## Recommendations (prioritized)

1. **Change dashboard benchmark behavior:** Prefer a single user action, a capped batch job, staggered refresh, or server-side orchestration with a strict per-session cap—avoid unbounded sequential client POSTs on every dashboard visit.
2. **Split the largest property modules:** Extract sections (wizard steps, form field groups, projections chart blocks) into colocated files or `lib/` helpers with tests, keeping API routes thin.
3. **Reuse `getBenchmarkPct` (or shared helper) in the benchmark refresh response** so API and UI never diverge on the delta definition.
4. **Migrate landing/pricing `<img>` to `next/image`** with explicit dimensions (or document exceptions).
5. **Add `revalidate` (or document why not)** on stable public/legal pages per architecture §2.5.

## Task candidates

- [ ] Replace or cap dashboard `RentVsMarketSection` auto-refresh: e.g. refresh at most one property per visit, require explicit “Refresh all”, or move refresh to a server action with queueing and user-visible progress.
- [ ] Add integration or E2E coverage for “many stale benchmarks” so hourly RentCast limits and UX are regression-tested.
- [ ] Split `add-property-wizard.tsx` into step components or hooks under `app/(app)/properties/` (or `components/properties/`).
- [ ] Split `property-form.tsx` into section components mirroring add flow; share validation wiring only once.
- [ ] Extract non-UI projection math from `projections-tab-content.tsx` into `lib/` and lazy-load Recharts chunks with `next/dynamic` + placeholder (pattern from `dashboard-charts.tsx`).
- [ ] Refactor `serializeProperty` / mortgage typing in `api/properties/[id]/route.ts` to remove `[key: string]: unknown` where possible.
- [ ] Use `getBenchmarkPct` (or a single exported helper) in `benchmark/refresh/route.ts` for `pctAboveBelow`.
- [ ] Replace raw `<img>` on `app/page.tsx` and `app/pricing/page.tsx` with `next/image`.
- [ ] Add `export const revalidate = 3600` (or similar) to privacy, terms, changelog, and pricing pages if compatible with `auth()`/Clerk usage on those routes.
- [ ] Audit `shadow-sm` on dashboard rent-vs-market card against `docs/policies/design-spec.md` and align with flat card pattern if desired.

## Re-test checklist

- [ ] Dashboard: visit with 0 / 1 / many stale benchmarks; confirm RentCast hourly limit behavior and no runaway network tab.
- [ ] Property create/edit/detail: benchmark display and `isRented` flows unchanged.
- [ ] `npm run check` and targeted tests after any code changes (`npm run test` where metrics/validations touched).

## Next trigger and cadence

- **Trigger:** After further property/benchmark/dashboard work or monthly hygiene.
- **Recommended next window:** 2026-04-28 or after the next large property-UI refactor.

## Files audited

Key directories and files reviewed for this pass (non-exhaustive but representative):

- `app/proxy.ts`, `app/lib/auth.ts`, `app/lib/benchmark-utils.ts`, `app/lib/plans.ts`
- `app/app/layout.tsx`, `app/app/(app)/layout.tsx`
- `app/app/api/properties/route.ts`, `app/app/api/properties/[id]/route.ts`, `app/app/api/properties/[id]/benchmark/refresh/route.ts`, `app/app/api/estimates/rent/route.ts`, `app/app/api/contact/route.ts`, `app/app/api/health/route.ts`
- `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/dashboard/rent-vs-market-section.tsx`
- `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/property-form.tsx`, `app/app/(app)/properties/add-property-wizard.tsx`, `app/app/(app)/properties/benchmark-display.tsx`
- `app/app/(app)/properties/[id]/overview-tab-content.tsx`, `app/app/(app)/properties/[id]/property-health-strip.tsx`, `app/app/(app)/properties/[id]/projections-tab-content.tsx` (size spot-check)
- `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/privacy/page.tsx`
- `app/next.config.ts`
