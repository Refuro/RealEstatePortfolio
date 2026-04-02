# Performance & Cost Audit — 2026-04-02

## Executive summary

- **Overall:** Marketing pages continue to use **dynamic import** for heavy calculator chunks (`PublicCalculator` in `competitor-alternative-page.tsx`) — good pattern.
- **Alternative pages:** Additional sections (hero, CTAs, fit-for list) are static markup—negligible bundle impact vs prior version.
- **Cost:** RentCast and other third-party APIs unchanged this pass; no new polling patterns observed.

## Severity-ranked findings

### Critical

- None.

### High

- None new.

### Medium

- **Lazy-load deal analyzer** — Prior recommendation to lazy-load sections of `deal-analyzer-form.tsx` remains valid for TTI on `/analyze`.
- **Prisma / DB:** N+1 patterns—revisit when adding new list endpoints.

### Low

- `force-dynamic` on `(app)` layout is intentional for session-bound shell; not a bug.

## Evidence reviewed

- `competitor-alternative-page.tsx` — `dynamic()` for `PublicCalculator`
- `next.config` / `optimizePackageImports` (prior audits)
- `app/app/(app)/layout.tsx` — `force-dynamic`

## Risk & impact assessment

Slow **Analyze** load affects activation; marketing page perf is secondary to SEO/LCP on `/` and `/pricing`.

## Recommendations (prioritized)

1. Prioritize lazy-loading **deal analyzer** subsections when that file is next touched.
2. Monitor **Vercel** function duration and RentCast usage after traffic spikes.

## Task candidates (optional)

- [ ] (Optional) Lazy-load heavy sections of `deal-analyzer-form.tsx` (Schedule from prior synthesis).

## Re-test checklist

- [ ] Lighthouse spot check on `/` and `/alternatives/stessa` after major marketing change.

## Next trigger and cadence

- **Trigger:** New heavy dependencies, chart additions, or marketing hero media.
- **Cadence:** Monthly.
