# Performance & Cost Audit — 2026-03-20

## Executive summary

- **Overall:** `next.config.ts` uses **`experimental.optimizePackageImports`** for `lucide-react` and `recharts`. **Dashboard** charts use **`next/dynamic`** with loading placeholders. **Amortization** chart on property detail uses a dynamic wrapper.
- **Top risks:** **Projections** and **Mortgage** tabs still **import Recharts directly** — large JS for users who only view Overview; **RentCast** and other third-party calls incur **cost + latency** (tier limits partially mitigate).
- **Recommendation:** Dynamic-split chart sections on property detail; monitor RentCast usage per plan in product analytics.

## Severity-ranked findings

### Critical

- *(none)*

### High

- **Eager Recharts on property detail** — `projections-tab-content.tsx` and `mortgage-tab-content.tsx` import `recharts` at module scope. — paths under `app/(app)/properties/[id]/`

### Medium

- **Marketing images** — Raw `<img>` for screenshots may hurt LCP vs `next/image`. — `app/app/page.tsx`, `app/app/pricing/page.tsx`

### Low

- **Benchmark refresh loops** — Dashboard rent-vs-market refresh should remain throttled/sequential (verify if parallel fan-out still exists after recent edits). — `app/(app)/dashboard/rent-vs-market-section.tsx` (spot-check in future PRs)

## Evidence reviewed

- `app/next.config.ts`
- `app/(app)/dashboard/dashboard-charts.tsx` — dynamic pattern ✓
- `app/(app)/properties/[id]/projections-tab-content.tsx`, `mortgage-tab-content.tsx` — static recharts import
- `app/(app)/properties/[id]/amortization-chart-dynamic.tsx` — dynamic pattern ✓

## Risk & impact assessment

Bundle weight on property detail affects **mobile** and **low-end** devices most. External API cost scales with user acquisition unless caps are enforced in product and infrastructure.

## Recommendations (prioritized)

1. Dynamic-import chart subtrees for projections + mortgage tabs.
2. Migrate hero screenshots to `next/image`.

## Task candidates (optional)

- [ ] `next/dynamic` for Recharts exports in `projections-tab-content.tsx` and `mortgage-tab-content.tsx`.
- [ ] Add **bundle analyzer** run (`@next/bundle-analyzer`) once per quarter on `app/` build.

## Re-test checklist

- [ ] Lighthouse or Web Vitals on `/` and `/pricing`.
- [ ] Property detail: tab switch performance on throttled CPU.

## Next trigger and cadence

- **Trigger:** New chart library, heavy dependency, or marketing page redesign.
- **Next window:** Monthly.
