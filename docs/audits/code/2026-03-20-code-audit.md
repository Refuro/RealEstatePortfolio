# Code Audit — 2026-03-20

## Executive summary

- **Overall:** Architecture remains sound (lib-layered metrics/amortization, Zod on APIs, Clerk `proxy.ts` boundary). Several **large client components** still centralize business logic and heavy chart imports.
- **Top risks:** (1) **`projections-tab-content.tsx`** (~950+ lines) still mixes projection math + Recharts; (2) **`mortgage-tab-content.tsx`** duplicates amortization helpers and imports Recharts eagerly; (3) **marketing pages** use raw `<img>` (ESLint `@next/next/no-img-element` warnings).
- **Recommendation:** Prioritize extracting projection/simulation helpers to `lib/` and lazy-loading chart sections; migrate hero screenshots to `next/image` or document intentional exceptions.

## Severity-ranked findings

### Critical

- *(none identified this pass)*

### High

- **Projection + mortgage tabs — logic + bundle** — Heavy simulation/projection code and top-level `recharts` imports live in property detail tab components; inflates client bundle for users who never open those tabs and complicates testing. — `app/(app)/properties/[id]/projections-tab-content.tsx`, `app/(app)/properties/[id]/mortgage-tab-content.tsx`

### Medium

- **Oversized files** — `projections-tab-content.tsx`, `mortgage-tab-content.tsx`, `add-property-wizard.tsx`, `property-form.tsx` exceed the ~300-line guideline from architecture docs; increases merge conflict and review cost. — same paths + `app/(app)/properties/add-property-wizard.tsx`, `app/(app)/properties/property-form.tsx`
- **Raw `<img>` on public marketing surfaces** — Landing and pricing use `<img>` for screenshots; Next.js recommends `next/image` for LCP/bandwidth. — `app/app/page.tsx`, `app/app/pricing/page.tsx`

### Low

- **Duplicated helpers** — `getRemainingTermMonths`-style logic still split between projections and mortgage tabs; should converge on `lib/amortization.ts` (or a dedicated `lib/projections.ts`). — tab files above

## Evidence reviewed

- `app/next.config.ts` (headers, `optimizePackageImports`)
- Property detail tabs under `app/(app)/properties/[id]/`
- `app/app/page.tsx`, `app/app/pricing/page.tsx`
- Prior report: `docs/audits/code/2026-03-19-code-audit.md` (for regression check)

## Risk & impact assessment

Large tab files slow feature work and increase bug risk when formulas change. Eager Recharts on property detail affects **Time to Interactive** on a hot path. Marketing `<img>` is lower severity but affects Core Web Vitals on acquisition pages.

## Recommendations (prioritized)

1. Extract shared mortgage/projection helpers to `lib/` and add focused unit tests.
2. Wrap chart-heavy sections in `next/dynamic` with `ssr: false` (pattern already used in `dashboard-charts.tsx`, `amortization-chart-dynamic.tsx`).
3. Replace marketing `<img>` with `next/image` (fixed sizes + `priority` where appropriate) or add eslint-disable with comment if static export constraints apply.

## Task candidates (optional)

- [ ] Extract `getRemainingTermMonths` / shared simulation helpers from projections + mortgage tabs into `lib/amortization.ts` or `lib/projections.ts`.
- [ ] Lazy-load Recharts sections in `projections-tab-content.tsx` and `mortgage-tab-content.tsx` via `next/dynamic`.
- [ ] Migrate landing/pricing screenshot `<img>` tags to `next/image` (or justify exceptions in code comments).

## Re-test checklist

- [ ] Property detail: Overview, Projections, Mortgage tabs — charts render, no hydration errors.
- [ ] `npm run lint` / `npm run test` from `app/`.

## Next trigger and cadence

- **Trigger:** After major property-detail or metrics refactor.
- **Next window:** ~1 month or next large UI refactor.
