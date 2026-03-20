# Math & Logic Audit — 2026-03-20

## Executive summary

- **Overall:** Canonical metrics flow through `lib/metrics/` with Vitest coverage and golden fixtures (`lib/test/fixtures/metrics-golden.ts`). Amortization helpers are well-tested; API route tests use mocks as documented in `docs/qa/test-infrastructure-review.md`.
- **Top risks:** Drift between **UI assumptions** and **lib** when tab-level code duplicates formulas; **export** columns must stay aligned with dashboard metrics definitions.
- **Recommendation:** Keep policy docs (`ownership-metrics.md`, `analytics-math-policy.md`) as source of truth; extend golden fixtures when adding new derived fields.

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none — no new contract breach detected in static review)*

### Medium

- **Duplicated projection paths** — Mortgage/projection **UI** layers still implement parallel month-by-month logic alongside `lib/amortization.ts`; risk of subtle divergence if one path is updated. — `app/(app)/properties/[id]/projections-tab-content.tsx`, `mortgage-tab-content.tsx`

### Low

- **Edge-case coverage** — `test-infrastructure-review.md` notes optional deeper tests for binary-search payoff helpers; acceptable backlog unless payoff UX changes.

## Evidence reviewed

- `lib/metrics/`, `lib/amortization.ts`, `lib/test/fixtures/metrics-golden.ts`
- `docs/policies/ownership-metrics.md` (reference)
- `docs/qa/test-infrastructure-review.md`
- Portfolio export: `app/api/export/portfolio/route.ts` (NOI, annual cash flow, cap rate, LTV columns present)

## Risk & impact assessment

Math bugs here directly affect investor trust. Current test + fixture setup mitigates regression; main residual risk is **duplicated simulation** in UI vs single lib implementation.

## Recommendations (prioritized)

1. Consolidate projection simulation into `lib/` and call from tabs (single implementation).
2. When changing any metric formula, update **golden fixtures** + export row shape in the same PR.

## Task candidates (optional)

- [ ] Add a small golden case for **multi-mortgage** rollup if not already covered in `metrics-golden.test.ts` (confirm against policy tables).
- [ ] After extracting tab logic to `lib/`, add one Vitest file targeting the extracted projection simulator.

## Re-test checklist

- [ ] `npm run test` — metrics + amortization suites.
- [ ] Spot-check export CSV against dashboard for one property after formula changes.

## Next trigger and cadence

- **Trigger:** Any change to `lib/metrics/`, `lib/amortization.ts`, ownership/vacancy fields, or export columns.
- **Next window:** Monthly or alongside pricing/metrics roadmap work.
