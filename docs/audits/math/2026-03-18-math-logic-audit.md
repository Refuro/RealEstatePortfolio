# Math & Logic Audit — 2026-03-21

## Executive summary

- **Overall:** Centralized metrics in `lib/metrics/`, amortization in `lib/amortization.ts`, policies in `docs/policies/ownership-metrics.md` and `analytics-math-policy.md` remain the contract. Vitest coverage exists for core paths.
- **Top risks:** Any future change to **debt-service basis** or **ownership modes** must update tests + UI/export together per `analytics-math-policy.md`.
- **Recommendation:** No contract change detected this pass; keep golden fixtures current when editing formulas.

## Severity-ranked findings

### Critical

- *(none — no metrics formula edits reviewed this run)*

### High

- *(none new)*

### Medium

- **Regression surface** — Portfolio/property metrics and CSV export must stay aligned; single source of truth is `lib/metrics/` + policies. — `lib/metrics/`, `app/lib/test/fixtures/metrics-golden.ts`

### Low

- **Edge cases** — Multi-mortgage and proportional vs full-liability paths need continued spot-check when UI changes. — `ownership-metrics.md`

## Evidence reviewed

- `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`
- `app/lib/metrics/` (structure; no line-by-line re-derivation)
- `app/lib/amortization.ts` (high-level)
- Prior: `docs/audits/math/2026-03-20-math-logic-audit.md`

## Risk & impact assessment

Math bugs directly affect investor trust and compliance with stated formulas. Likelihood low if changes go through tests and policy docs.

## Recommendations (prioritized)

1. When changing any metric definition, update golden fixtures and `analytics-math-policy.md` in the same PR.
2. Keep `npm run test` green for `lib/metrics` and amortization before release.

## Task candidates (optional)

- *(omit — no new actionable gap identified)*

## Re-test checklist

- [ ] After any metrics PR: run `npm run test` and spot-check export vs dashboard for one multi-property user.

## Next trigger and cadence

- **Trigger:** Any change to `lib/metrics/`, amortization, or import/export columns.
- **Next window:** Monthly or before pricing/metrics release.
