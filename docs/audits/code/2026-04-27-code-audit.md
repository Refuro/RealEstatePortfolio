# Code Audit — 2026-04-27

## Executive summary

- **Overall health:** The stack aligns well with documented architecture: protected APIs consistently use `getActiveAppUser()` (with `getAppUser()` only on `POST /api/account/restore` per `docs/security/security-notes.md`), Prisma access is `userId`-scoped in sampled routes, `next.config.ts` applies security headers/CSP and `experimental.optimizePackageImports` for `lucide-react` and `recharts`, and chart-heavy surfaces use `next/dynamic` with `ssr: false` in dashboard, refinance/mortgage/modeling loaders, amortization chart, and marketing calculator slots.
- **Top risks:** Very large client modules on core flows (`add-property-wizard.tsx`, `deal-analyzer-form.tsx`, `property-form.tsx`) far exceed the ~300-line maintainability guidance in `docs/architecture-and-build-practices.md` §4.2. The signed-in **Rent vs buy** calculator page still statically imports `RentVsBuyCalculator`, which pulls **Recharts** at module top—contrary to §2.5 Performance Practices.
- **Design / UX drift:** Marketing and onboarding still use strong shadows (`shadow-lg` / `shadow-xl` / `shadow-2xl`) in several places, which conflicts with “clarity over decoration” and §9 “What to avoid” in `docs/policies/design-spec.md` (canonical visual rules also referenced in `docs/design/design-spec-2026.md`).
- **Recommendation:** Prioritize dynamic chart loading for `app/(app)/calculators/rent-vs-buy`, continue phased extraction from mega-components, and fix the unsubscribe confirmation “home” link for non-production environments.

## Severity-ranked findings

### Critical

- *(None identified on this pass.)* Cron paths in `app/proxy.ts` (lines 27–33) include all listed `vercel.json` cron routes; no auth bypass regression observed.

### High

- *(None escalated to High.)* The largest maintainability issues are longstanding and match prior audits; they are classified **Medium** below to reflect engineering velocity risk rather than immediate security or data-integrity exposure.

### Medium

- **Monolithic UI modules vs file-size guidance** — `docs/architecture-and-build-practices.md` §4.2 recommends splitting past ~300 lines. Current line counts (approximate, non-blank lines via workspace scan): `app/app/(app)/properties/add-property-wizard.tsx` ~2789; `app/app/(app)/analyze/deal-analyzer-form.tsx` ~1598; `app/app/(app)/properties/property-form.tsx` ~1174. **Risk/impact:** Merge conflicts, slower review, higher regression cost on property and deal flows; harder onboarding for new contributors.
- **In-app Rent vs Buy loads Recharts via static import** — `app/app/(app)/calculators/rent-vs-buy/page.tsx` imports `RentVsBuyCalculator` from `components/marketing/rent-vs-buy-calculator.tsx`, which imports `recharts` at lines 7–15. Public tools use `RentVsBuySlot` / `calculator-page-slots.tsx` with `next/dynamic` and `ssr: false`. **Risk/impact:** Heavier initial JS for signed-in users on that route; misaligned with §2.5 Performance Practices.
- **Unsubscribe confirmation HTML hardcodes production origin** — `app/app/api/unsubscribe/route.ts` line 108: anchor `href="https://veldportfolio.com"`. **Risk/impact:** Staging/preview confirmation pages link to production; confusing for QA and support.

### Low

- **Marketing / onboarding shadow depth** — `shadow-lg` / `shadow-xl` / `shadow-2xl` appear on e.g. `app/app/page.tsx` (~311), `app/app/pricing/page.tsx` (~255–269), `app/app/(app)/onboarding-panel.tsx` (~259, ~307), `app/components/consent/cookie-consent-banner.tsx` (~23). **Impact:** Visual drift from minimal-chrome intent in `docs/policies/design-spec.md` §9; not a functional defect.
- **Landing feature cards use lift + stronger hover shadow** — `app/app/page.tsx` (~404, ~532): `shadow-sm` with `hover:shadow-md` and `hover:-translate-y-0.5`. **Impact:** Decorative motion and heavier hover state vs flat card guidance in design spec §5.1 / §9.
- **Redundant `force-dynamic` on nested routes** — `app/app/(app)/layout.tsx` exports `dynamic = "force-dynamic"` (line 23, documented rationale); `app/app/(app)/analyze/page.tsx`, `app/app/(app)/admin/layout.tsx`, and `app/app/(app)/admin/page.tsx` also set `force-dynamic`. **Impact:** Audit noise; negligible runtime difference.
- **`app-layout-client.tsx` slightly over ~300 lines** — `app/app/(app)/app-layout-client.tsx` ~313 lines. **Impact:** Minor; shell component may justify size but is at the guidance threshold.

### Design compliance (process §2.1)

- **Strengths:** Grep over `app/**/*.tsx` found **no** `zinc-`, `slate-`, `emerald-`, `neutral-`, or `stone-` palette classes; mockups and many surfaces use `border-border`, `bg-card`, `text-muted`, `text-positive` / `text-negative` (e.g. `components/mockups/dashboard-mockup.tsx`).
- **Gaps:** Strong shadows and hover elevation on marketing/pricing/onboarding (see Medium/Low above). Clerk `appearance.variables.colorPrimary` in `app/app/layout.tsx` uses hex `#6366f1` (line 150)—acceptable third-party constraint but duplicates accent token mentally.

### Architecture compliance (process §2.2)

- **Strengths:** Layered flow holds in sampled APIs: e.g. `app/app/api/portfolio/summary/route.ts` delegates to `buildPortfolioSummaryPayload` in `lib/server/portfolio-summary-payload`; property routes use validations from `lib/validations` and `revalidateTag` for layout banner coherence.
- **Gaps:** Business logic remains embedded in very large client components (wizard, deal analyzer, property form) rather than progressively extracted to `lib/` and thin presenters—consistent with file-size debt above.

### Efficiency (process §2.3)

- **Strengths:** `unstable_cache` on layout banner data (`app/app/(app)/layout.tsx`); no obvious Prisma-in-loop patterns from targeted grep.
- **Gaps:** Static Recharts on `calculators/rent-vs-buy` increases bundle for that route (see Medium).

### Technical debt & corners (process §2.4)

- **Type safety:** Grep for `: any` / `as any` in `app/**/*.{ts,tsx}` (excluding natural-language “any” in prose) returned **no matches**.
- **Deprecated patterns:** No deprecated Next root `middleware.ts`—`app/proxy.ts` is used (Next 16 pattern per file comment).
- **Scaling:** Mega-components are the main scaling blocker for safe iteration on property/deal UX.

### Security (process §2.5)

- **Strengths:** Protected API sample shows `getActiveAppUser()`; `app/app/api/account/restore/route.ts` correctly uses `getAppUser()` for restore flow. RentCast API key read from `process.env` only in server routes (`app/app/api/estimates/rent/route.ts`, `value`, `benchmark/refresh`, cron refresh). Cron handlers validate `CRON_SECRET` (e.g. `app/app/api/cron/monthly-digest/route.ts`).
- **Notes:** `GET /api/unsubscribe` accepts `userId` in query but gates mutation with HMAC verification (`verifyUnsubscribeToken`)—acceptable pattern if tokens remain unguessable.

### Product mantra (process §2.6)

- **Thoughtful / robust:** Strong validation and rate limiting on sensitive routes (import, export, CSP report) per architecture and security docs.
- **Frictionless:** Concentrated complexity in add-property and deal analyzer flows may feel heavy for casual landlords; progressive disclosure exists but file size suggests accumulated edge cases.

### Performance (process §2.7)

- **Strengths:** `next.config.ts` lines 63–65: `optimizePackageImports: ["lucide-react", "recharts"]`. Root `app/app/layout.tsx` has dns-prefetch/preconnect for Clerk, Stripe, PostHog (lines 162–179). Dashboard charts: `app/app/(app)/dashboard/dashboard-charts.tsx` uses `dynamic` + `ssr: false` with loading placeholders. No raw `<img>` in `app/**/*.tsx` from grep.
- **Gaps:** In-app rent-vs-buy static Recharts import (Medium). Root layout correctly avoids `force-dynamic`; `(app)/layout` uses it with an explicit comment—appropriate.

## Evidence reviewed

- **Process / template:** `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`
- **Policies / architecture / security:** `docs/policies/design-spec.md`, `docs/architecture-and-build-practices.md` (§2 layered flow, §2.5 performance, §4 file size), `docs/security/security-notes.md`
- **Config / boundary:** `app/next.config.ts`, `app/proxy.ts`, `app/app/layout.tsx`, `app/app/(app)/layout.tsx`
- **API auth grep:** `getAppUser` / `getActiveAppUser` under `app/app/api/**/*.ts`
- **Representative APIs:** `app/app/api/portfolio/summary/route.ts`, `app/app/api/import/portfolio/route.ts`, `app/app/api/cron/monthly-digest/route.ts`, `app/app/api/unsubscribe/route.ts`, `app/app/api/health/route.ts`
- **Large components (line counts):** `add-property-wizard.tsx`, `deal-analyzer-form.tsx`, `property-form.tsx`, `app-layout-client.tsx`
- **Charts / dynamic:** `dashboard-charts.tsx`, `calculator-page-slots.tsx`, `rent-vs-buy-calculator.tsx`, `app/(app)/calculators/rent-vs-buy/page.tsx`
- **Design drift grep:** `shadow-lg`, `shadow-xl`, `shadow-2xl`; raw palette classes (`zinc-`, `slate-`, etc.)—none on palette sweep
- **Type safety grep:** `: any` / `as any`—none

**Limits:** No Lighthouse run, no bundle analyzer output, no full line-by-line read of multi-thousand-line components, no dependency CVE scan, no production log review.

## Risk & impact assessment

- **Medium findings:** High **likelihood** of continued churn on property/deal/calculator surfaces; impact is engineering velocity and bundle size on one route, not immediate credential or IDOR exposure.
- **Low findings:** Cumulative effect on brand consistency (shadows, motion) and staging correctness (unsubscribe link).

## Recommendations (prioritized)

1. **Refactor** `app/app/(app)/calculators/rent-vs-buy/page.tsx` to use the same dynamic slot pattern as public tools (e.g. `RentVsBuySlot` in `calculator-page-slots.tsx`) so Recharts loads with `ssr: false` and a placeholder.
2. **Continue phased extraction** from `add-property-wizard.tsx`, `deal-analyzer-form.tsx`, and `property-form.tsx` (hooks, step components, shared validation) toward the ~300-line guidance.
3. **Replace** the hardcoded `https://veldportfolio.com` link in `app/app/api/unsubscribe/route.ts` `htmlResponse` with `getAppOrigin()` or `NEXT_PUBLIC_APP_URL` so preview/staging confirmations stay on-environment.
4. **Audit shadow and hover-elevation usage** on marketing, pricing, onboarding, and cookie banner against `docs/design/design-spec-2026.md` and soften where product agrees.
5. **Optional cleanup:** Remove redundant `export const dynamic = "force-dynamic"` from child routes that inherit `(app)/layout.tsx` dynamism for audit clarity.

## Task candidates (optional)

- [ ] Dynamic chart loading for signed-in `/calculators/rent-vs-buy` (reuse marketing slot pattern).
- [ ] Milestone extraction PR for `deal-analyzer-form.tsx` (subsection components + hooks).
- [ ] Milestone extraction PR for `add-property-wizard.tsx` (further step splits).
- [ ] Env-based home URL in `app/app/api/unsubscribe/route.ts` HTML template.
- [ ] Design pass: reduce `shadow-xl` / `shadow-2xl` on homepage, pricing, onboarding modal.

## Re-test checklist

- [ ] After calculator change: smoke-test `/calculators/rent-vs-buy` signed-in and `/tools/rent-vs-buy` guest; confirm chart loads and no hydration issues.
- [ ] After unsubscribe link change: open unsubscribe success HTML on preview URL and verify link target.
- [ ] After large refactors: spot-check `docs/qa/property-flow-regression-matrix.md` as appropriate.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After changes to auth/proxy, new API routes, large marketing or calculator refactors, or before a major property/deal UX release.
- **Recommended next run window:** **2026-05-27** (monthly) or the next deploy touching chart loading, cron, or property/deal forms.
