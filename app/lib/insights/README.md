# Insights engine

Generates the dynamic insight cards shown on the dashboard (and, in the future, on a dedicated insights page and in digest emails).

**Rationale + decision history:** see `claudeCode/veld-implementation-discussion.md` ¶ "1. Insights engine architecture." This README is the implementation contract; the discussion doc is the why.

---

## Public surface

```ts
import { pickInsights, buildInsightsContext } from "@/lib/insights";

const insights = pickInsights(ctx, { dismissed, maxCount: 3 });
```

The engine is pure. No DB calls, no fetches, no side effects. Callers (dashboard page, digest job, future insights page) build their own `InsightsContext` and pass it in.

---

## File layout

```
lib/insights/
  README.md                    ← you are here
  index.ts                     // public exports + DEFAULT_GENERATORS registry
  types.ts                     // Insight, InsightsContext, Generator, Severity, InsightType
  picker.ts                    // pickInsights() — slot-fill + editorial priority
  context.ts                   // helpers for callers to build InsightsContext
  copy.ts                      // sentence templates per insight type
  appreciation.ts              // tiered appreciation rate resolver — see decision #2
  generators/
    cash-flow-drag.ts
    rent-opportunity.ts
    refi-gap.ts
    total-return.ts
    best-performer.ts
    ltv-risk.ts
    equity-built.ts
    // cap-rate-benchmark.ts intentionally absent — deferred per discussion doc decision #3
  picker.test.ts
  generators/*.test.ts
```

---

## Non-negotiable rules

These exist because we considered alternatives and rejected them. Don't quietly switch them — if you think one is wrong, raise it.

### 1. Scoring within a severity bucket is editorial, not normalized

When two generators of the same severity (`negative` / `warning` / `positive`) compete for the same display slot, the winner is decided by a fixed editorial priority list — **not** by comparing normalized scores across generators.

```ts
const PRIORITY_ORDER = {
  negative: ["ltv_risk", "cash_flow_drag", "rent_opportunity"],
  warning:  ["refi_gap"],
  positive: ["total_return", "best_performer", "equity_built"],
  // cap_rate_benchmark intentionally absent in v1 — deferred per discussion doc decision #3.
  // equity_built is the v1 third positive backfill, per discussion doc decision #8.
} as const;
```

The `score` field on `Insight` is **only** for ranking *within* a single generator (e.g. picking which one of 5 cash-flow-negative properties to feature). Each generator chooses its own natural unit (usually dollars).

> **Do not replace this with a unified scoring algorithm.** Normalization needs a ground truth we don't have, every threshold becomes a tunable knob, and the resulting picks are harder to explain. Editorial order is a reviewable product opinion.

### 2. Picking algorithm — slot-fill with positive-only fallback

- Default: 1 negative + 1 warning + 1 positive
- If both negative AND warning are empty → show top 3 positives
- If one severity has zero candidates but others have leftovers → fill that slot with the next-best from a leftover severity
- Fewer than 3 eligible total → render only what we have. **Do not fill with generic CTAs / tips.** Filler dilutes the section.
- Zero eligible total → caller hides the section entirely.

### 3. Generators self-gate

The decision "should this insight even fire" lives inside the generator, not in an external threshold layer. Example: `ltv_risk` does not fire below 80% LTV. Severity is `warning` at 80–90%, `negative` above 90%. Don't lift these thresholds out into a config — keep them with the logic they govern.

### 4. Dismissal contract: engine returns everything; caller filters

`pickInsights` accepts an optional `dismissed: Set<string>` of `dismissKey`s and excludes them *before* slot-filling. The engine does not own dismissal storage. That lives at the caller (sessionStorage / cookie / DB — see decision #6 in the discussion doc).

`dismissKey` format: `${type}:${scope}` where scope is either a property `id` or the literal string `portfolio`.

### 5. Mode handling — single pool, generators self-select

Each generator declares `appliesTo: ("single" | "multi")[]`. The picker passes `ctx.mode` through; generators that don't apply just return `[]`. One engine, one ranking pass.

### 6. Copy lives in `copy.ts`, not in generators

Generators do math, identify which entities to feature, and pick a template. The actual sentence templates (with placeholders) live in `copy.ts`. This separation matters because copy quality is the part of this system most likely to need careful authoring vs. mechanical generation.

---

## What does NOT belong here

- **Fetching** market data, snapshots, or property info. Callers resolve those into `InsightsContext`.
- **Persistence** of dismissals. Caller's job.
- **Rendering**. The engine returns typed `Insight[]`; UI components consume them.
- **Cross-portfolio comparisons** ("you vs. other Veld users"). Out of scope for v1.
- **Tier gating.** Callers decide whether to call `pickInsights` based on subscription tier (`getEffectiveTier` in `@/lib/plans`). The engine has no concept of plans. Future callers (digest emails, dedicated insights page) inherit this contract — gate at the caller, not in here.

---

## Testing

Pure functions, fixture-based. For each generator:
- A few "should fire" fixtures (different severities)
- A "should not fire" fixture (gating logic)
- A "score ranking" fixture if the generator can produce multiple candidates

For the picker:
- All five edge cases from rule #2 (default slot-fill, positive-only fallback, leftover-fill, fewer than 3, zero)
- Editorial priority resolution (two generators of same severity)
- Dismissal filtering happens before slot-fill

---

## Build status

See `claudeCode/veld-implementation-discussion.md` ¶ "Build status of the insights engine" for what's authored vs. what remains.
