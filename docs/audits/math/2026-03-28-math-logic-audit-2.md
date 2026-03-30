# Math & Logic Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** Core amortization iteration in `app/lib/amortization.ts` matches the canonical pattern (monthly interest on balance, principal capped by remaining balance, balance floored at zero). Property and portfolio metrics remain centralized in `lib/metrics/`.
- **Top risks:** Edge cases around non-amortizing payments and escrow-derived P&I are intentionally handled; benchmark percentage when `marketRent <= 0` is defined to return 0 in `benchmark-utils` — consumers must still hide meaningless comparisons (roadmap “benchmarking v2”).
- **Recommendation:** Keep golden tests (`metrics-golden`, amortization tests) as the contract; any formula change should update golden fixtures in the same PR.

## Summary (lane-specific)

Amortization schedule generation guards invalid inputs (`originalLoanAmount <= 0` or `monthlyPayment <= 0` → empty schedule). `getPiForAmortization` documents escrow clamp to minimum P&I. Cross-module staleness for effective balance is documented at 180 days in the math process doc and implemented in `amortization.ts` (verified by structure; full line-by-line parity with prior audit).

## Module results

### lib/amortization.ts

| Check | Status | Notes |
|-------|--------|-------|
| `generateAmortizationSchedule` uses interest = balance × monthlyRate; principal min(payment−interest, balance) | PASS | See loop in `generateAmortizationSchedule` |
| Edge: invalid amount/payment → [] | PASS | Early return |
| `getPayoffProjection` / schedule share iteration semantics | PASS | Same monthly rate and balance update pattern |
| `getEffectiveBalance` / `getBalanceSource` staleness aligned | PASS | Shared 6-month / 180-day concept per spec |
| Division / NaN guards on hot paths | PASS | Clamps and early exits on non-positive payment/balance |

### lib/metrics/property-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| NOI, cap rate, LTV, cash-on-cash guards for zero/null denominators | PASS | Per engineering spec §6 pattern |
| Ownership scaling for cash flow / equity | PASS | Documented modes in policies |

### lib/metrics/portfolio-metrics.ts

| Check | Status | Notes |
|-------|--------|-------|
| Empty portfolio aggregation | PASS | Returns zeros/nulls |
| Weighted cap rate = total NOI / total market value | PASS | Standard aggregation |

### lib/benchmark-utils.ts

| Check | Status | Notes |
|-------|--------|-------|
| `getBenchmarkPct` when marketRent ≤ 0 → 0 | PASS | Avoids divide-by-zero |
| Freshness window (60 days) | PASS | Documented in module |

## Cross-module consistency

| Rule | Status | Notes |
|------|--------|-------|
| Monthly rate = annual/12 everywhere | PASS | Decimal rate convention |
| Payoff vs schedule iteration | PASS | Same principal/interest decomposition |

## Findings / recommendations

- **NOTE:** Benchmark eligibility for non-rental / missing rent is partly a **product** concern (roadmap: benchmarking v2); math layer returns safe numbers but UI must gate display.

## Task candidates (optional)

- [ ] Add/adjust unit tests for `isRented === false` benchmark display contract once benchmarking v2 ships (coordination with Feature/Data lanes).

## Changelog (audit scope)

- 2026-03-28: Run 2 full-audit pass; spot-check `amortization.ts` and metrics modules against `docs/process/math-logic-audit.md`.

## Re-test checklist

- [ ] `npm run test` for `app/lib/amortization.test.ts`, `portfolio-metrics.test.ts`, `benchmark-utils.test.ts` after math changes.

## Next trigger and cadence

- Trigger: monthly or any change to `lib/amortization.ts`, metrics, or benchmark utilities
- Recommended next run: 2026-04-28
