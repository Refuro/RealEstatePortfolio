# Analytics Math Policy (Canonical)

**Purpose:** Define app-wide analytics math contracts so UI, API, exports, and future tools stay consistent and reconcilable.

**Companion policy:** Ownership semantics are defined in `docs/policies/ownership-metrics.md`. This document governs broader analytics conventions (time windows, debt-service sourcing, baseline/delta rules, and reconciliation).

---

## 1) Core principles

- **One metric, one contract:** Each displayed metric must have one explicit formula and input source.
- **No silent basis switching:** A metric cannot silently mix debt-service bases (for example, all-in payment vs P&I simulation).
- **Cross-surface reconciliation:** UI, API, and export values must reconcile under documented assumptions.
- **Shared helpers only:** Formula logic must live in `app/lib/metrics/` (or nearby shared lib for amortization primitives), never duplicated in page components.
- **Label the context:** Time horizon and basis assumptions must be visible where users read outcomes.
- **Clarity over density:** Do not overlabel primary surfaces. Put essential context inline, and move secondary detail to tooltips/help text or expandable sections.

---

## 2) Definitions

- **All-in debt service:** Stored monthly mortgage payment value as entered/imported by user (may include escrow depending on source data).
- **P&I debt service:** Principal + interest payment stream (escrow removed) used by amortization simulation.
- **Year N marker:** Snapshot at end of projected Year N.
- **Annual cash flow at Year N:** Forward 12-month window from Year N to Year N+1.
- **Cumulative cash flow through Year N:** Sum of annual cash flow windows from Years 1..N.
- **Baseline scenario:** Base preset with no optional overlays unless explicitly documented otherwise.

---

## 3) Required metric contracts

### 3.1 Cash flow family

- `monthlyCashFlow` and `annualCashFlow` must declare debt-service source (`all-in` or `P&I`) and ownership mode behavior.
- If projections use amortization-driven debt service, labels/tooltips must explicitly state this.
- If baseline notes cite all-in debt service, projection math must either:
  - use all-in debt service for the same metric, or
  - clearly indicate that projected cash flow uses a different basis and provide reconciliation copy.

### 3.2 Debt and leverage family

- Debt exposure presentation must follow `docs/policies/ownership-metrics.md` mode semantics unless explicitly marked as a modeling context value.
- LTV labels must specify whether they are property leverage context (`debt / value`) or ownership-adjusted context.

### 3.3 Ratio family

- DSCR denominator source must be explicit and consistent with selected mode and debt-service basis.
- Comparable DSCR values across surfaces must be derived from the same denominator contract.

### 3.4 Sale/position outcomes

- Exit-based outcomes must label exact hold-year context and included components (sale proceeds, cumulative cash flow, reinvested balance).
- Delta metrics must state baseline and assumption set.

---

## 4) Time-window and labeling standards

- Use explicit wording:
  - `Year 0 (Today snapshot)`
  - `Forward 12-month cash flow: Year N to Year N+1`
  - `End of Year N`
- Avoid ambiguous labels such as `Today` or `Annual cash flow` without time-window context.
- Tooltips and card labels must not conflict with baseline notes.

### Label density guardrails (required)

- **Primary cards:** keep labels short (one line when possible) and include only the minimum needed context.
- **Secondary assumptions:** use tooltip/help text or progressive disclosure (`details`, info icon modal, helper row), not long inline labels.
- **No repeated boilerplate:** if the same assumption applies to multiple cards, state it once in a nearby assumptions/baseline note.
- **Readability check:** any analytics view should keep scanability first (quick decision signal in primary row, detail on demand).

---

## 5) Debt-service source policy

For each analytics surface, implementation must choose a debt-service source and document it in code comments and UI copy:

- **Portfolio/property summary metrics:** all-in debt service unless policy explicitly states otherwise.
- **Amortization payoff simulation:** P&I simulation source.
- **Projection outcomes:** must declare source and maintain internal consistency across cards, tooltips, and baseline copy.

If a surface intentionally presents both sources, show both with clear labels; never collapse them into one unlabeled number.

**UX note:** when both are shown, make one primary and one secondary (for example, primary value + tooltip or expandable reconciliation row) to avoid clutter.

---

## 6) Reconciliation requirements (UI/API/export)

When a metric is exposed in multiple surfaces:

- API response field docs and UI labels must reference the same contract.
- Export columns must identify basis assumptions or match UI assumptions exactly.
- Any known intentional differences must be documented in release/task notes and surfaced in user-facing copy where confusion is likely.

---

## 7) Implementation guardrails

- Put shared math in `app/lib/metrics/` helpers; avoid route/component-local formulas.
- Prefer pure helper functions with typed inputs.
- Add short inline comments only for non-obvious assumptions (basis switch, window semantics).
- Ownership behavior updates must also update `docs/policies/ownership-metrics.md`.

---

## 8) Verification matrix (required for analytics changes)

For any task touching analytics math, verify:

- Ownership: `100%`, `50%`, `25%`
- Modes: `proportional`, `full_liability`
- Loan setups: escrow included, escrow excluded
- Horizon/payoff: payoff inside horizon, payoff after horizon
- Surfaces: at least one UI screen + one API endpoint + export (if affected)

Required outcomes:

- No sign flips or material mismatches without documented assumption differences.
- Labels/tooltips match computed window and basis.
- `npm run check` passes.

---

## 9) Change management

If a formula contract changes:

- Update this document and `docs/policies/ownership-metrics.md` (if ownership-related).
- Add/adjust task acceptance criteria in `docs/tasks.md`.
- Note migration/reconciliation impacts in task completion notes.
