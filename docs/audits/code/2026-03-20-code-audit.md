# Code Audit — 2026-03-20

## Executive summary

- **Overall health:** Layering and security conventions remain strong: protected APIs use `getActiveAppUser()` (or intentional `getAppUser()` where documented), Zod validation on mutating routes sampled, `app/next.config.ts` sets security headers and `experimental.optimizePackageImports` for `lucide-react` and `recharts`. Dashboard and amortization charts follow the deferred-loading pattern (`next/dynamic`, `ssr: false`, placeholders).
- **Top gaps:** Property-detail **Projections** and **Mortgage** tabs still **import Recharts at module scope** (~956 and ~698 lines respectively), so the chart bundle loads with the tab chunk even when users never open those tabs. Marketing **landing and pricing** pages use raw `<img>` for screenshots; ESLint reports `@next/next/no-img-element` on six lines (verified this run).
- **Recommendation:** Lazy-load chart UIs in those tab modules (mirror `dashboard-charts.tsx` / `amortization-chart-dynamic.tsx`) and migrate marketing screenshots to `next/image` (or document a deliberate exception). Continue incremental extraction of duplicated tab helpers (e.g. `getRemainingTermMonths`) into `lib/`.

## Severity-ranked findings

### Critical

- *(none identified — no evidence of missing auth on sampled protected APIs, IDOR patterns, or secrets in client code this pass.)*

### High

- **Eager Recharts in property detail tabs (Performance / bundle)** — `projections-tab-content.tsx` and `mortgage-tab-content.tsx` import Recharts components at the top level. Architecture doc §2.5 expects heavy chart libs behind `next/dynamic` with `ssr: false` and a loading state; dashboard and amortization already comply. **Impact:** unnecessary JS weight on the property-detail client surface. — `app/app/(app)/properties/[id]/projections-tab-content.tsx` (e.g. lines 13–23), `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (e.g. lines 14–21).

### Medium

- **Very large UI modules (Architecture / maintainability)** — Several property flows exceed the ~300-line guideline in `docs/architecture-and-build-practices.md`, increasing review and merge risk: `add-property-wizard.tsx` (~1424 lines), `property-form.tsx` (~930 lines), `projections-tab-content.tsx` (~956 lines), `mortgage-tab-content.tsx` (~698 lines). — under `app/app/(app)/properties/` (line counts from repository this audit date).
- **Marketing images: raw `<img>` + ESLint (Performance / design-system alignment)** — Home and pricing pages use `<img>` for product screenshots. `npm run lint` reports six `@next/next/no-img-element` warnings (`app/app/page.tsx` lines 149, 159, 172; `app/app/pricing/page.tsx` lines 66, 74, 82). Architecture §2.5 recommends `next/image` for user-facing images.
- **Design spec: decorative weight on marketing screenshots (Design compliance)** — Screenshot blocks use `shadow-lg` (e.g. `app/app/page.tsx` ~152–175, `app/app/pricing/page.tsx` ~69+). `docs/policies/design-spec.md` emphasizes clarity over decoration and minimal unnecessary shadows.

### Low

- **Duplicated `getRemainingTermMonths` helpers (Technical debt)** — Two different implementations exist between projections and mortgage tabs. — `app/app/(app)/properties/[id]/projections-tab-content.tsx` (~104+), `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` (~73+).
- **App shell `force-dynamic` (Performance — scoped, documented)** — `(app)/layout.tsx` exports `dynamic = "force-dynamic"` with an inline rationale (user-specific banner data). This is scoped to the authenticated segment, not the root layout. — `app/app/(app)/layout.tsx` lines 9–10.

## Findings by audit dimension

Cross-reference to severity above; evidence paths are the source of truth.

### Design Compliance

- Semantic token usage observed on sampled marketing and app surfaces (e.g. `text-muted`, `border-border`, `bg-card` on `app/app/page.tsx`). No broad drift to raw `zinc`/`slate` classes found in a targeted search.
- **Medium:** Marketing screenshot `shadow-lg` vs. design spec preference for minimal decoration (see severity-ranked Medium).

### Architecture Compliance

- **High / Medium:** Tab components mix substantial client simulation/UI with direct Recharts imports; prefer aligning with established deferred chart pattern and moving more pure logic to `lib/` for testability.
- Metrics/plans: sampled pages import `lib/metrics` / `lib/pricing-display` / `lib/amortization` appropriately in tab code; duplication is localized helpers, not wholesale formula forks.

### Efficiency

- **High:** Eager Recharts in property detail tabs (bundle cost).
- **Medium:** Raw `<img>` without Next image optimization on high-traffic marketing routes.

### Technical Debt & Corners

- **Low:** Duplicate `getRemainingTermMonths` implementations.
- **Medium:** Oversized files in property add/edit and detail tabs.

### Security

- Sampled API routes use `getActiveAppUser()` and return 401 when absent; admin route checks `isAdmin`. — e.g. `app/app/api/admin/users/[id]/tier/route.ts`, `app/app/api/properties/[id]/route.ts` (grep pass).
- `POST /api/contact` uses Zod (`contactFormSchema`), honeypot field, IP/user rate limiting, and HTML escaping for email bodies. Uses `getAppUser()` so deleted accounts could theoretically still submit contact mail — low exposure, product decision. — `app/app/api/contact/route.ts`.
- Stripe webhook verifies signatures via `constructEvent`. — `app/app/api/billing/webhook/route.ts` lines 12–33.
- **Critical:** none observed this pass.

### Product Mantra

*(thoughtful, robust, modern, frictionless per architecture doc)*

- **Friction / thoughtful:** Large wizards (`app/app/(app)/properties/add-property-wizard.tsx`, `app/app/(app)/properties/property-form.tsx`) are consistent with a guided flow but increase cognitive load for maintainers; users depend on stability of those paths.
- **Modern:** Chart deferral on dashboard vs. eager imports on detail tabs is an inconsistency worth closing.

### Performance

- **Positive:** `app/next.config.ts` includes `optimizePackageImports: ["lucide-react", "recharts"]`; root `app/app/layout.tsx` includes preconnect/dns-prefetch for RentCast, Stripe, and PostHog when configured (~114–122).
- **Gaps:** Property detail tabs vs. `app/app/(app)/dashboard/dashboard-charts.tsx` dynamic pattern; marketing `<img>` warnings.

## Evidence reviewed

- **Process & policy:** `docs/process/code-audit-process.md`, `docs/process/audit-report-template.md`, `docs/architecture-and-build-practices.md` (§2.5 Performance), `docs/security/security-notes.md`, `docs/policies/design-spec.md` (sampled).
- **Config & root:** `app/next.config.ts`, `app/app/layout.tsx`, `app/app/(app)/layout.tsx`.
- **Property flows:** `app/app/(app)/properties/[id]/projections-tab-content.tsx`, `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`, `app/app/(app)/properties/add-property-wizard.tsx`, `app/app/(app)/properties/property-form.tsx`, `app/app/(app)/dashboard/dashboard-charts.tsx`, `app/app/(app)/properties/[id]/amortization-chart-dynamic.tsx`.
- **Marketing:** `app/app/page.tsx`, `app/app/pricing/page.tsx`.
- **APIs (sample):** `app/app/api/contact/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/api/admin/users/[id]/tier/route.ts`; grep across `app/app/api/**/route.ts` for `getActiveAppUser` / `getAppUser`.
- **Tooling:** `npm run lint` in `app/` (2026-03-20).

**Limits:** Not every file under the Next package (`app/`) was read line-by-line; findings are based on representative paths, searches, and lint. No `npm run build` or full test suite executed for this audit document.

## Risk & impact assessment

| Area | Impact if unaddressed |
|------|-------------------------|
| Eager Recharts on property detail | Slower TTI and larger JS on a frequent investor workflow; worse on mid-tier mobile networks. |
| Marketing `<img>` | Weaker LCP and bandwidth use on acquisition pages; ESLint will keep flagging until resolved. |
| Large tab/wizard files | Higher defect and merge-conflict rates when metrics or IA change; harder onboarding for contributors. |

**Likelihood:** Performance and maintainability issues are **ongoing** (already present), not hypothetical regressions.

## Recommendations (prioritized)

1. **Lazy-load Recharts** in `app/app/(app)/properties/[id]/projections-tab-content.tsx` and `mortgage-tab-content.tsx` (split chart subcomponents, `next/dynamic` + `ssr: false`, loading skeleton consistent with `dashboard-charts.tsx`).
2. **Replace marketing `<img>`** on `app/app/page.tsx` and `app/app/pricing/page.tsx` with `next/image` (fixed dimensions, `priority` only for above-the-fold hero shots if applicable) or add a documented eslint exception with rationale if deployment constraints forbid `next/image`.
3. **Consolidate** `getRemainingTermMonths` (and any other duplicated amortization/projection helpers) into `lib/amortization.ts` or a small `lib/projections.ts`, with unit tests against existing amortization behavior.
4. **Incremental decomposition** of `app/app/(app)/properties/add-property-wizard.tsx` and `property-form.tsx` into section components or hooks (no behavior change required in first slice—structure only).

## Task candidates (optional)

- [ ] Dynamic-import chart sections in `app/app/(app)/properties/[id]/projections-tab-content.tsx` / `mortgage-tab-content.tsx` with loading placeholders.
- [ ] Migrate `app/app/page.tsx` and `app/app/pricing/page.tsx` screenshots to `next/image`; re-run `npm run lint` until `@next/next/no-img-element` is cleared or waived with comment.
- [ ] Single `getRemainingTermMonths` (or shared mortgage row type) in `lib/` and thin tab wrappers.
- [ ] Optional: reduce `shadow-lg` on marketing screenshots if product agrees with design-spec minimalism.

## Re-test checklist

- [ ] Property detail: open **Projections** and **Mortgage** tabs — charts render, no hydration errors, loading states acceptable.
- [ ] Run `npm run lint` in `app/` — zero new issues; marketing image warnings resolved or documented.
- [ ] After any code changes: `npm run check` (per `package.json`: build + lint).
- [ ] Spot-check `npm run test` if metrics/lib helpers are refactored.

## Next trigger and cadence

- **Trigger:** After substantial property-detail, metrics, or chart refactors; or monthly while the property UI is in active development.
- **Recommended next run:** ~4 weeks from this report, or immediately before a major release candidate.
