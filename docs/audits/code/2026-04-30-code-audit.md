# Code Audit — 2026-04-30

## Executive summary

- **Overall health:** The `app/` package aligns with documented layering (thin route handlers, Zod on sampled mutating APIs, metrics and validations in `lib/`), uses `getActiveAppUser()` across protected APIs with the documented `getAppUser()` exception on `app/app/api/account/restore/route.ts`, and scopes Prisma access by `userId` in sampled handlers. Heavy chart code on the dashboard uses `next/dynamic` with `ssr: false` and loading placeholders (`app/app/(app)/dashboard/dashboard-charts.tsx`). Root `app/app/layout.tsx` does not set `force-dynamic`; authenticated shell uses `dynamic = "force-dynamic"` with an explicit rationale (`app/app/(app)/layout.tsx`).
- **Top risks:** Very large client modules (several **well above** the ~300-line guidance in `docs/architecture-and-build-practices.md` §4.2) remain the main maintainability and regression-risk hotspot. The authenticated **`/calculators/rent-vs-buy`** route still pulls **Recharts** through a **static** import chain, which conflicts with §2.5 Performance Practices.
- **Security posture:** Cron routes sampled validate `Authorization: Bearer ${CRON_SECRET}` (`app/app/api/cron/monthly-digest/route.ts`). No new IDOR or missing-auth patterns were identified on protected APIs in this pass.
- **Recommendation:** Prioritize dynamic-loading the in-app rent-vs-buy calculator (mirror `calculator-page-slots.tsx`), then schedule incremental splits of the largest property/analyze components. Track CSV import transaction duration if bulk imports become common.

## Severity-ranked findings

### Critical

- *(None identified.)*

### High

- *(None escalated.)* Remaining issues are primarily velocity, bundle shape, and scaling-at-the-margin—not immediate exploitability.

### Medium

- **Monolithic UI modules vs file-size guidance** — `docs/architecture-and-build-practices.md` §4.2 suggests splitting past ~300 lines. Standouts include **`app/app/(app)/properties/add-property-wizard.tsx`**, **`app/app/(app)/analyze/deal-analyzer-form.tsx`**, **`app/app/(app)/properties/property-form.tsx`**, and **`app/app/(app)/properties/[id]/projections-tab-content.tsx`** (~1.3k lines with large Recharts surface). **Impact:** Higher merge/review cost and harder isolated testing on core landlord flows.
- **In-app Rent vs Buy loads Recharts via static import** — `app/app/(app)/calculators/rent-vs-buy/page.tsx` imports `RentVsBuyCalculator` directly; `app/components/marketing/rent-vs-buy-calculator.tsx` imports `recharts` at top level. Public/marketing uses dynamic slots (`app/components/marketing/calculator-page-slots.tsx`). **Impact:** Heavier initial JS on that authenticated route; inconsistent with §2.5.
- **Portfolio CSV import: sequential creates inside one transaction** — `app/app/api/import/portfolio/route.ts` loops rows with `tx.property.create` / optional `tx.mortgage.create` inside `prisma.$transaction`. **Impact:** Fine for typical CSV sizes; large imports extend lock duration and DB time—monitor before adding bulk UX.

### Low

- **Marketing / shell shadow depth vs minimal-chrome spec** — `docs/policies/design-spec.md` §9 discourages heavy shadows. Examples: `shadow-xl` / `shadow-lg` on `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/components/ui/drawer.tsx`, `app/app/(app)/properties/[id]/property-detail-content.tsx`, `shadow-2xl` on `app/app/(app)/onboarding-panel.tsx`.
- **Decorative gradient on homepage hero** — `app/app/page.tsx` uses gradient utility classes on a hero section; minor tension with “clarity over decoration” unless intentionally approved against `docs/design/design-spec-2026.md`.
- **Hardcoded colors outside token system (narrow)** — e.g. SVG/icon `color: "#0a0a0a"` in `app/components/properties/detail/completion-card.tsx` and `app/components/properties/task-center/incomplete-profiles-card.tsx`; email/unsubscribe HTML uses inline hex (expected for mail clients). Chart gradient stops in `app/components/dashboard/equity-trend-chart.tsx` use hex for Recharts stops—acceptable but not CSS-variable-driven.
- **Unsubscribe confirmation HTML** — `app/app/api/unsubscribe/route.ts` (~108): “Return to Veld Portfolio” links to `https://veldportfolio.com` regardless of deployment origin; inline styles use neutral palette hex, not app semantic tokens (acceptable for standalone HTML).
- **Stale comment vs typing** — `app/app/(app)/dashboard/build-insights-payload.ts` still mentions using `any` for JSON columns in a comment; types use structured shapes—comment misleads reviewers.
- **Redundant `force-dynamic` declarations** — Parent `app/app/(app)/layout.tsx` already exports `force-dynamic`; children such as `app/app/(app)/analyze/page.tsx`, `app/app/(app)/admin/layout.tsx`, and `app/app/(app)/admin/page.tsx` repeat it. **Impact:** Noise only.

### Architecture & patterns (cross-cutting)

- **Strengths:** Layered flow holds on sampled routes; insights engine stays in `lib/insights/*` with `build-insights-payload.ts` as a dashboard-local bridge; `app/next.config.ts` keeps CSP/security headers and `experimental.optimizePackageImports: ["lucide-react", "recharts"]`.
- **Gaps:** Concentration of business/UI logic in mega-components (wizard, deal analyzer, projections tab) vs extraction into `lib/` and smaller presentational units.

### Security (process §2.5)

- **Strengths:** `grep` over `app/app/api` shows consistent `getActiveAppUser()` usage except documented restore (`getAppUser`). Webhook and health/csp-report/unsubscribe/cron patterns match `docs/security/security-notes.md` intent for public vs secret-gated routes.

### Performance (process §2.7)

- **Strengths:** Dashboard charts: dynamic + `ssr: false` + placeholder; modeling/refinance/mortgage workspaces wrap tab content with `dynamic` (`modeling-workspace.tsx`, `refinance-workspace-loader.tsx`, `mortgage-workspace.tsx`). Root layout includes Clerk preconnect/dns-prefetch, Stripe dns-prefetch, conditional PostHog preconnect (`app/app/layout.tsx`). No raw `<img>` matches in `app/**/*.tsx` on this grep pass.
- **Gaps:** Static Recharts path for in-app rent-vs-buy (Medium).

### Efficiency & technical debt

- **Type safety:** No `: any` / `as any` matches in production `app/**/*.{ts,tsx}` from targeted grep (tests/prose excluded by pattern).
- **Dead code:** Not systematically inventoried (large tree under `app/`).

## Evidence reviewed

- **Process / template:** `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`
- **Policies / architecture / security:** `docs/policies/design-spec.md`, `docs/architecture-and-build-practices.md` (§2.1–2.5, §4), `docs/security/security-notes.md`
- **Config / layouts:** `app/next.config.ts`, `app/app/layout.tsx`, `app/app/(app)/layout.tsx`
- **API auth:** `grep` for `getAppUser` / `getActiveAppUser` under `app/app/api/**/*.ts` (49 route files catalogued)
- **Representative APIs:** `app/app/api/import/portfolio/route.ts`, `app/app/api/cron/monthly-digest/route.ts`, `app/app/api/unsubscribe/route.ts`, `app/app/api/account/restore/route.ts`
- **Charts / bundles:** `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/calculators/rent-vs-buy/page.tsx`, `app/components/marketing/rent-vs-buy-calculator.tsx`, `app/components/marketing/calculator-page-slots.tsx`, `app/app/(app)/modeling/modeling-workspace.tsx`, `app/app/(app)/mortgage/mortgage-workspace.tsx`, `app/app/(app)/refinance/refinance-workspace-loader.tsx`
- **Design drift:** `grep` for `shadow-xl`, `shadow-2xl`, `shadow-lg`, hex in TSX (excluding `globals.css` token definitions)
- **Limits:** Sampling and grep-based pass; not every component or route handler was read line-by-line.

## Risk & impact assessment

- **Unresolved Medium items** mainly slow engineering velocity and slightly inflate bundle weight on one calculator route—not acute user-facing outages.
- **Likelihood:** Mega-files will continue to generate regressions on every property/analyze touch unless split.
- **Scaling:** CSV import and digest cron loops are acceptable at current scale; revisit if enterprise bulk import or cron batch sizes grow materially.

## Recommendations (prioritized)

1. **Dynamic-load the in-app Rent vs Buy calculator** — Wrap `RentVsBuyCalculator` with `next/dynamic` + `ssr: false` (and a small placeholder) from `app/app/(app)/calculators/rent-vs-buy/page.tsx`, or extract a shared dynamic loader used by marketing and app routes.
2. **Incremental decomposition of top offenders** — Extract hooks and dumb subviews from `projections-tab-content.tsx`, `deal-analyzer-form.tsx`, and `add-property-wizard.tsx` without changing behavior (pure refactor passes).
3. **Fix misleading docs-in-code** — Update the `unitRents` comment in `build-insights-payload.ts` to match actual typing.
4. **Polish low-friction UX/dev details** — Parameterize unsubscribe “home” URL from `getAppOrigin()` or env; optionally trim redundant child `force-dynamic` exports; soften shadows only if design signs off against `design-spec-2026.md`.

## Task candidates (optional)

- [ ] Add dynamic import wrapper for authenticated `/calculators/rent-vs-buy` Recharts bundle.
- [ ] Split `projections-tab-content.tsx` (sections + chart config hooks).
- [ ] Correct stale `any` reference comment in `build-insights-payload.ts`.
- [ ] Use app origin for unsubscribe HTML footer link (staging-safe).

## Re-test checklist

- [ ] After rent-vs-buy change: load `/calculators/rent-vs-buy` signed in; confirm chart renders and no hydration issues.
- [ ] After refactors: spot-check modeling projections and mortgage workspaces.
- [ ] `npm run check` (when code changes ship).

## Next trigger and cadence

- **Trigger:** Monthly or after major property/analyze/calculator work.
- **Suggested next window:** 2026-05-30 or next release milestone.
