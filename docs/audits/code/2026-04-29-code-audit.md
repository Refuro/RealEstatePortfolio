# Code Audit — 2026-04-29

## Executive summary

- **Overall health:** The Next package under `app/` continues to match documented architecture: layered flow with thin route handlers, Zod validation on mutable APIs sampled, `getActiveAppUser()` on protected APIs with the documented `getAppUser()` exception on `POST /api/account/restore`, Prisma usage scoped by `userId`, charts on dashboard/refinance/modeling/marketing slots loaded via `next/dynamic` with `ssr: false` where patterns were checked, and `app/next.config.ts` keeps security headers/CSP plus `experimental.optimizePackageImports` for `lucide-react` and `recharts`. Root `app/app/layout.tsx` avoids `force-dynamic`; authenticated `app/app/(app)/layout.tsx` documents why shell routes stay dynamic and uses `unstable_cache` for banner counts.
- **Top risks:** Very large client modules on core flows still dominate maintenance cost versus `docs/architecture-and-build-practices.md` §4.2 (~300-line guidance). The signed-in **`/calculators/rent-vs-buy`** page still **statically imports** `RentVsBuyCalculator`, pulling **Recharts** into the initial bundle for that route—misaligned with §2.5 Performance Practices.
- **Efficiency / scaling:** `POST /api/import/portfolio` performs **sequential** `property.create` / optional `mortgage.create` per CSV row inside one `$transaction`—correct for FK ordering but **O(n) round-trips** inside the transaction; worth monitoring if bulk imports grow.
- **Recommendation:** Ship dynamic loading for in-app rent-vs-buy (reuse marketing slot pattern), keep chipping mega-components into hooks/subviews, and tighten low-friction fixes (unsubscribe HTML origin, stale comments, shadow/visual drift) when scheduling allows.

## Severity-ranked findings

### Critical

- *(None identified on this pass.)* Cron handlers sampled validate `CRON_SECRET` (e.g. `app/app/api/cron/monthly-digest/route.ts`). Soft-deleted accounts are blocked at `app/app/(app)/layout.tsx` via `RestoreAccountScreen` before child routes render.

### High

- *(None escalated.)* Largest issues remain engineering-velocity and bundle-shape risks rather than immediate exploitability; classified **Medium** / **Low** below.

### Medium

- **Monolithic UI modules vs file-size guidance** — `docs/architecture-and-build-practices.md` §4.2 recommends splitting past ~300 lines. Standout modules remain **`app/app/(app)/properties/add-property-wizard.tsx`**, **`app/app/(app)/analyze/deal-analyzer-form.tsx`**, and **`app/app/(app)/properties/property-form.tsx`** (multi-hundred to multi-thousand lines). **Risk/impact:** Merge conflicts, slower review, higher regression cost on property/deal flows.
- **In-app Rent vs Buy loads Recharts via static import** — `app/app/(app)/calculators/rent-vs-buy/page.tsx` imports `RentVsBuyCalculator` directly from `app/components/marketing/rent-vs-buy-calculator.tsx`, which imports `recharts` at module top. Public/marketing surfaces use `RentVsBuySlot` in `app/components/marketing/calculator-page-slots.tsx` with `next/dynamic` and `ssr: false`. **Risk/impact:** Heavier initial JS on that authenticated route; inconsistent with §2.5 Performance Practices.
- **Portfolio CSV import: sequential creates in transaction** — `app/app/api/import/portfolio/route.ts` (`prisma.$transaction` loop): each imported row runs `tx.property.create`, optional `tx.mortgage.create`, and sometimes `tx.property.update`. **Risk/impact:** Acceptable for typical CSV sizes; large imports increase DB time and lock duration—consider batching or background jobs if bulk import becomes common.

### Low

- **Marketing / shell shadow depth vs minimal-chrome spec** — `docs/policies/design-spec.md` §9 discourages heavy shadows. Examples from grep: `app/components/ui/drawer.tsx` (`shadow-xl` on panel), `app/app/(app)/properties/[id]/property-detail-content.tsx`, `app/app/(app)/onboarding-panel.tsx` (`shadow-2xl`), `app/app/page.tsx` (`shadow-xl`). **Impact:** Visual drift from “flat / subtle” guidance; not functional breakage.
- **Decorative gradient on marketing homepage** — `app/app/page.tsx`: `bg-gradient-to-b from-accent/[0.04] to-transparent`. **Impact:** Minor tension with §9 “avoid decorative gradients” unless explicitly intentional for hero separation.
- **Unsubscribe confirmation HTML hardcodes production origin** — `app/app/api/unsubscribe/route.ts` (~line 108): `href="https://veldportfolio.com"`. **Impact:** Preview/staging confirmations deep-link to production.
- **Stale comment vs actual typing** — `app/app/(app)/dashboard/build-insights-payload.ts` comments reference using ``any`` for `unitRents`, but `DashboardPropertyRecord` correctly uses `unknown`. **Impact:** Confuses reviewers; suggests outdated mental model.
- **Inline CSS variables in dashboard charts chrome** — `app/app/(app)/dashboard/dashboard-charts.tsx`: expand button and loading placeholder use `style={{ ... }}` with `var(--border)` etc. **Impact:** Acceptable for dynamic chrome; slight inconsistency vs Tailwind semantic utilities elsewhere.
- **Redundant `force-dynamic`** — `app/app/(app)/layout.tsx` exports `dynamic = "force-dynamic"` with rationale; `app/app/(app)/analyze/page.tsx`, `app/app/(app)/admin/layout.tsx`, and `app/app/(app)/admin/page.tsx` repeat it. **Impact:** Noise only; behavior dominated by parent layout.

### Design compliance (process §2.1)

- **Strengths:** Wide use of semantic tokens (`text-muted`, `bg-card`, `border-border`, `text-accent`, positive/negative cash-flow coloring) across dashboard/property surfaces sampled; raw Tailwind zinc/slate utility drift was **not** observed in component `.tsx` sweeps (token definitions in `app/app/globals.css` correctly centralize hex).
- **Gaps:** Strong shadows and one marketing gradient (see Low above). Canonical interaction/visual detail also lives in `docs/design/design-spec-2026.md` when policies conflict.

### Architecture compliance (process §2.2)

- **Strengths:** Handler pattern holds on sampled routes (auth → validate → lib/Prisma). Insights work follows “logic in lib”: `app/lib/insights/*`, `app/app/(app)/dashboard/build-insights-payload.ts` as a thin dashboard-specific bridge (appropriate placement next to `page.tsx`).
- **Gaps:** Business rules and state remain concentrated in very large client components (wizard, deal analyzer, property form)—harder to reuse and test than lib-first modules.

### Efficiency (process §2.3)

- **Strengths:** No obvious Prisma calls inside arbitrary client loops from targeted search; layout banner uses `unstable_cache` with tags/revalidate (`app/app/(app)/layout.tsx`).
- **Gaps:** Static Recharts on `/calculators/rent-vs-buy` (Medium). Sequential import writes (Medium).

### Technical debt & corners (process §2.4)

- **Type safety:** No `: any` / `as any` matches in application `app/**/*.{ts,tsx}` from audit grep (excluding tests and prose).
- **Dead code:** Not systematically inventoried on this pass (487 TS/TSX files under `app/`).
- **Coupling:** Mega-components couple UX, validation triggers, and domain edge cases—primary scaling blocker for safe iteration.

### Security (process §2.5)

- **Strengths:** Protected APIs use `getActiveAppUser()`; restore uses `getAppUser()` only where documented (`app/app/api/account/restore/route.ts`). Secrets remain server-side per env patterns in architecture/security docs.
- **Notes:** Server pages under `(app)` correctly use `getAppUser()` for SSR while layout blocks deleted accounts before children render.

### Product mantra (process §2.6)

- **Thoughtful / robust:** Validation, rate limits, and Sentry hooks align with “robust” for sampled APIs (e.g. import/export, CSP report sizing elsewhere in codebase).
- **Frictionless:** Complexity concentrated in add-property and deal analyzer flows may still feel heavy for passive landlords despite progressive disclosure.

### Performance (process §2.7)

- **Strengths:** `app/next.config.ts` `optimizePackageImports: ["lucide-react", "recharts"]`. Root `app/app/layout.tsx`: Clerk preconnect/dns-prefetch, Stripe dns-prefetch, PostHog preconnect when configured. Dashboard charts: `app/app/(app)/dashboard/dashboard-charts.tsx` uses `dynamic` + `ssr: false` + loading placeholder. Refinance workspace: `app/app/(app)/refinance/refinance-workspace-loader.tsx` dynamic with placeholder. No raw `<img>` matches in `app/**/*.tsx` grep.
- **Gaps:** In-app rent-vs-buy static Recharts (Medium). Root layout correctly avoids global `force-dynamic`.

## Evidence reviewed

- **Process / template:** `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`
- **Policies / architecture / security:** `docs/policies/design-spec.md`, `docs/architecture-and-build-practices.md` (§2 layered flow, §2.5 performance, §4 file size), `docs/security/security-notes.md`
- **Layouts / config:** `app/app/layout.tsx`, `app/app/(app)/layout.tsx`, `app/next.config.ts`
- **API auth patterns:** `grep getAppUser|getActiveAppUser` under `app/app/api/**/*.ts`
- **Representative APIs:** `app/app/api/import/portfolio/route.ts`, `app/app/api/cron/monthly-digest/route.ts`, `app/app/api/unsubscribe/route.ts`, property/deals/billing routes from grep sample
- **Charts / dynamic imports:** `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/components/marketing/calculator-page-slots.tsx`, `app/app/(app)/calculators/rent-vs-buy/page.tsx`, `app/components/marketing/rent-vs-buy-calculator.tsx`, `app/app/(app)/refinance/refinance-workspace-loader.tsx`
- **Large / hot-path UI:** `app/app/(app)/properties/add-property-wizard.tsx`, `app/app/(app)/analyze/deal-analyzer-form.tsx`, `app/app/(app)/analyze/page.tsx`, property detail/edit surfaces (partial reads + grep)
- **Design drift grep:** `shadow-xl`, `shadow-2xl`, `bg-gradient-to-b`; semantic token usage spot-checks

**Limits:** No Lighthouse, no bundle analyzer output, no full line-by-line read of multi-thousand-line components, no dependency CVE scan, no production trace review.

## Risk & impact assessment

- **Medium findings:** High likelihood of continued churn on property/deal/calculator/import paths; impact is velocity, occasionally bundle weight and DB duration under bulk import—not credential theft or broad IDOR from this sample.
- **Low findings:** Brand/minimalism drift (shadows, gradient), staging correctness for unsubscribe link, minor documentation hygiene.

## Recommendations (prioritized)

1. **Dynamic-load Recharts** on `app/app/(app)/calculators/rent-vs-buy/page.tsx` using the same pattern as `RentVsBuySlot` / `app/components/marketing/calculator-page-slots.tsx` (`next/dynamic`, `ssr: false`, placeholder).
2. **Continue phased extraction** from `app/app/(app)/properties/add-property-wizard.tsx`, `app/app/(app)/analyze/deal-analyzer-form.tsx`, and `app/app/(app)/properties/property-form.tsx` into hooks, step components, and shared validators aligned with `app/lib/validations`.
3. **If CSV imports scale:** Profile `POST /api/import/portfolio`; consider reducing per-row round-trips or moving very large jobs async while preserving transactional integrity.
4. **Replace** hardcoded `https://veldportfolio.com` in `app/app/api/unsubscribe/route.ts` HTML with `getAppOrigin()` / `NEXT_PUBLIC_APP_URL`.
5. **Design consistency pass:** Soften `shadow-xl` / `shadow-2xl` on drawer, onboarding, marketing hero where product agrees with `docs/design/design-spec-2026.md`.
6. **Fix stale comment** in `app/app/(app)/dashboard/build-insights-payload.ts` (reference `unknown`, not `any`).

## Task candidates (optional)

- [ ] Dynamic chart loading for signed-in `/calculators/rent-vs-buy`.
- [ ] Milestone extraction PR for `deal-analyzer-form.tsx` (subsections + hooks).
- [ ] Milestone extraction PR for `add-property-wizard.tsx`.
- [ ] Env-based home URL in `app/app/api/unsubscribe/route.ts` HTML template.
- [ ] Import route performance review when approaching larger CSVs.
- [ ] Comment fix: `app/app/(app)/dashboard/build-insights-payload.ts` unitRents documentation.

## Re-test checklist

- [ ] After calculator change: smoke-test `/calculators/rent-vs-buy` signed-in and public rent-vs-buy tool; chart loads; no hydration regressions.
- [ ] After unsubscribe link change: confirm confirmation page link on preview/staging.
- [ ] After large refactors: spot-check property/deal regression matrices as applicable.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After auth/proxy changes, new APIs, calculator/marketing refactors, or major property/deal UX releases.
- **Recommended next run window:** **2026-05-29** (monthly) or next deploy touching charts, import, or multi-thousand-line forms.
