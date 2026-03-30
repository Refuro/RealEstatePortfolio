# Math & Logic Audit — 2026-03-30

## Executive summary

- Core metrics paths (`lib/metrics/`, `lib/amortization.ts`, `lib/benchmark-utils.ts`) remain aligned with **ownership** and **analytics math** policies.
- Benchmark display logic is increasingly **centralized** (`benchmark-display-utils`, shared eligibility helpers), reducing UI drift risk.
- **Recommendation:** Keep policy docs as the single source of truth when changing formulas; extend golden tests when Node/Vitest env supports local runs.

## Severity-ranked findings

### Critical

- None.

### High

- None for core formulas in this pass.

### Medium

- **Test execution environment** — Local Vitest may fail on some Node versions (ESM/config). Math regression safety depends on CI or upgraded Node; not a formula bug but a **verification gap** if CI does not run full suite. *Evidence:* prior PM notes; `vitest.config.ts` stack.

### Low

- **Locale in display strings** — `toLocaleString()` in benchmark display copy can vary by runtime locale; acceptable for UI but worth awareness for snapshot tests if added later.

## Evidence reviewed

- `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`
- `app/lib/amortization.ts`, `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`
- `app/lib/benchmark-utils.ts`, `app/lib/benchmark-display-utils.ts`
- Existing unit tests under `app/lib/**/*.test.ts` (structure review)

## Risk & impact assessment

Formula drift is the main long-term risk; current structure (shared lib + helpers) mitigates it. Test-env friction affects confidence, not production math.

## Recommendations (prioritized)

1. Ensure CI or documented Node version matches Vitest/Vite requirements so `npm run test` is reliable for contributors.
2. When changing metrics contracts, update `docs/policies/` and golden fixtures together.

## Task candidates (optional)

- [ ] Align documented Node version for app development with Vitest engine requirements (e.g. `engines` in `app/package.json` or setup doc).

## Re-test checklist

- [ ] `npm run test` for metrics/amortization/benchmark libs when environment allows
- [ ] Re-read policy docs if any metric label or export column changes

## Next trigger and cadence

- **Trigger:** Any change to `lib/metrics/`, `lib/amortization.ts`, benchmark helpers, or export math
- **Cadence:** Monthly or per release with analytics changes
