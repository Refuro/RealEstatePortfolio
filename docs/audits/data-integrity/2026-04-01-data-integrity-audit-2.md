# Data Integrity & Reconciliation Audit — 2026-04-01 (pass 2)

## Executive summary

- **Pass focus:** Second lens on the same workspace, emphasizing **canonical policy alignment** (`docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`) and **cross-surface contracts** (metrics helpers, APIs, CSV, saved deals). Pass 1 the same day covered import/export and truncation in depth; this pass adds verification of **analytics math**, **benchmark freshness**, **payoff strict vs tolerance**, and **API response completeness** for reconciliation.
- **Overall health:** Core math remains centralized in `app/lib/metrics/` with ownership mode threaded consistently on property/portfolio surfaces; saved deals and deal-analyzer flows use **`proportional` only**, matching policy §5. Mortgage route handlers expose **strict** `getPayoffProjection` to JSON; tolerance-aware helpers stay in UI with disclosure (`app/app/(app)/properties/[id]/payoff-card.tsx`). Benchmark “fresh” uses a **strict upper bound** on age (`app/lib/benchmark-utils.ts`), matching analytics policy §3.6.
- **Top risks:** **Spreadsheet reconciliation** when users combine CSV **`rent`** (contract total via `getPropertyTotalRent`) with derived **NOI / cash flow** (vacancy-adjusted effective rent inside `computePropertyMetrics`) without applying **`vacancy %`**; and **API consumers** of `GET /api/properties/[id]/metrics` who do not also know the user’s **`ownershipDisplayMode`** and property **vacancy** may mis-explain numbers vs the dashboard or export.
- **Recommendation:** Treat `docs/reference/portfolio-csv-export.md` plus policy docs as the reconciliation spine; extend reference doc or export UX notes with an explicit **“rent column vs NOI rent leg”** note (implementation optional—audit only).

---

## Severity-ranked findings

### Critical

- None identified. No evidence of policy-bypassing duplicate formulas in the reviewed paths; deals serialization remains pinned to proportional metrics (`app/app/api/deals/route.ts`, `app/app/api/deals/[id]/route.ts`).

### High

- None newly rated High in this pass. **Multi-lien CSV round-trip loss** remains the primary structural integrity risk; see pass 1 (`docs/audits/data-integrity/2026-04-01-data-integrity-audit.md`) and `docs/reference/portfolio-csv-export.md` §Round-trip vs lossy matrix.

### Medium

- **CSV `rent` vs derived NOI/cash-flow basis** — The `rent` column is **contract / total monthly rent** (same basis as `getPropertyTotalRent`), while **NOI**, **annual cash flow**, **cap rate**, etc. use **effective rent after vacancy** inside `computePropertyMetrics` (`app/lib/metrics/property-metrics.ts`). **`vacancy %`** is exported on the row, but nothing in the CSV spells out that **NOI ≠ (rent × 12 × scale) − expenses** without applying vacancy. **Risk/impact:** Off-app spreadsheet checks that multiply `rent` by 12 will **not** reconcile to exported NOI without manual adjustment, conflicting with analytics policy §3.4’s “same *R*” expectation when users infer *R* from the wrong column. **Evidence:** `app/app/api/export/portfolio/route.ts` (inputs to `computePropertyMetrics` vs `getPropertyTotalRent` for `rent`); `docs/reference/portfolio-csv-export.md` §Rent columns.

- **Property metrics API omits reconciliation context** — `GET /api/properties/[id]/metrics` returns only the `PropertyMetrics` shape from `computePropertyMetrics` and does not echo **`ownershipDisplayMode`**, **`vacancyPercent`**, or debt-service basis labels (`app/app/api/properties/[id]/metrics/route.ts`). **Risk/impact:** External or future clients comparing JSON to UI or CSV without loading user settings may attribute deltas to bugs rather than lens or basis. **Evidence:** `app/app/api/properties/[id]/metrics/route.ts`.

### Low

- **Portfolio summary payload shape** — `GET /api/portfolio/summary` uses `buildPortfolioSummaryPayload` (`app/lib/server/portfolio-summary-payload.ts`, `app/app/api/portfolio/summary/route.ts`), which aligns with dashboard aggregation via `computePortfolioMetrics` and the same tier **slice** metadata as export. **Risk/impact:** Low; verify **field naming** (`totalAnnualRent`, `dscr`, etc.) against any third-party doc when publishing a public contract.

- **`display mode` on export row vs live account setting** — Export embeds the mode used for that download; if the user later changes **ownership display mode**, historical CSV files can disagree with the current UI without being “wrong.” Already noted in pass 1; retained for reconciliation checklists.

---

## Evidence reviewed

- **Policies:** `docs/policies/ownership-metrics.md` (§2–§5, §6), `docs/policies/analytics-math-policy.md` (§3.1–§3.7, §5–§6), `docs/architecture-and-build-practices.md` (metrics single source of truth).
- **Metrics:** `app/lib/metrics/property-metrics.ts`, `app/lib/metrics/portfolio-metrics.ts`, `app/lib/metrics/metrics-golden.test.ts`.
- **Portfolio aggregation:** `app/lib/server/portfolio-summary-payload.ts`, `app/app/api/portfolio/summary/route.ts`.
- **Export:** `app/app/api/export/portfolio/route.ts`.
- **Property metrics API:** `app/app/api/properties/[id]/metrics/route.ts`.
- **Saved deals:** `app/app/api/deals/route.ts` (serializeDeal proportional), `app/app/(app)/analyze/deal-analyzer-form.tsx` (`computePropertyMetrics` with `"proportional"`).
- **Benchmarks:** `app/lib/benchmark-utils.ts` (`BENCHMARK_FRESHNESS_MAX_MS`, `isBenchmarkFreshAt`).
- **Payoff:** `app/app/api/properties/[id]/mortgage/route.ts`, `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts` (`getPayoffProjection`); `app/app/(app)/properties/[id]/payoff-card.tsx` (tolerance disclosure string).
- **Reference:** `docs/reference/portfolio-csv-export.md`.
- **Schema (contract names):** `app/prisma/schema.prisma` (`User.ownershipDisplayMode`, `Property` rent/vacancy fields).

**Assumptions / limits:** Static code and doc review only; no production data sampling. Deliberate overlap with same-day pass 1 on CSV import/truncation is avoided here except where cross-reference helps. No changes under `app/`.

---

## Risk & impact assessment

- **Medium (CSV rent vs metrics):** Affects users who **export to Excel** and validate formulas without reading vacancy semantics; likelihood **medium** among spreadsheet-heavy investors, **low** for in-app-only workflows.
- **Medium (metrics API context):** Affects **integrators** and advanced users using the JSON endpoint in isolation; likelihood **low** until public API docs or mobile clients depend on it.
- **Low items:** Documentation and versioning hygiene rather than incorrect in-app math for a signed-in session.

---

## Recommendations (prioritized)

1. **Document the rent vs effective-rent relationship** in `docs/reference/portfolio-csv-export.md` (short subsection: how `rent`, `vacancy %`, and derived columns relate to `docs/policies/analytics-math-policy.md` §3.4).
2. **Optional API contract improvement (future):** Consider returning **`displayMode`** and **`vacancyPercent`** (or a short **`basis`** note) from `GET /api/properties/[id]/metrics` so machine clients self-describe the lens—only if product commits to a stable JSON contract.
3. **Keep verification matrix** from analytics policy §8 for any change touching `lib/metrics` or ownership mode (modes × tiers × surfaces).

---

## Task candidates (optional)

- [ ] Docs: add “CSV rent column vs NOI effective rent” reconciliation note to `docs/reference/portfolio-csv-export.md`.
- [ ] Product/API: evaluate adding non-breaking fields to `GET /api/properties/[id]/metrics` for `displayMode` / `vacancyPercent` (or document externally).

---

## Re-test checklist

- [ ] After doc/API changes: spot-check export row math by hand (with vacancy) against dashboard property metrics.
- [ ] After metrics helper changes: run `npm run check` and golden tests in `app/lib/metrics/`.

---

## Next trigger and cadence

- **Trigger:** Quarterly; or when policies, CSV columns, or `computePropertyMetrics` contracts change.
- **Recommended next run:** 2026-07-01 (or next release touching metrics, benchmarks, or export headers).
