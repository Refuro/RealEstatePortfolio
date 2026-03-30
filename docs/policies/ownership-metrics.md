# Ownership Metrics Policy (Canonical)

**Purpose:** Define one ownership-semantics policy for formulas, UI copy, and reviews.

**Companion policy:** See `docs/policies/analytics-math-policy.md` for sitewide analytics contracts (time windows, debt-service source rules, reconciliation across UI/API/export).

**Scope:** Dashboard, Properties, Property detail, Modeling, Mortgage rollups, Analyze assumptions copy, exports/API summaries, and all metric help text.

---

## 1) Canonical model

Let:
- `s = ownershipPercent / 100`
- `R = effective monthly rent` (after vacancy)
- `E = monthly expenses`
- `P = monthly debt service (mortgage payment)`
- `D = debt balance`
- `V = estimated value`

Two classes of metrics:

1. **Economic-share metrics (always ownership-scaled):** rent, expenses, NOI, equity, annual rent, cash invested.  
2. **Liability metrics (mode-dependent):** debt exposure and debt service.

Display modes:
- **Proportional:** liability metrics are scaled by ownership (`s`).
- **Full liability:** liability metrics are shown at 100% (joint-liability lens).

---

## 2) Per-metric formulas by mode

| Metric | Proportional mode | Full liability mode |
|---|---|---|
| Rent (effective) | `R * s` | `R * s` |
| Expenses | `E * s` | `E * s` |
| Debt balance | `D * s` | `D` |
| Debt service (monthly) | `P * s` | `P` |
| Monthly cash flow | `(R - E - P) * s` | `(R * s) - (E * s) - P` |
| Annual cash flow | `monthlyCashFlow * 12` | `monthlyCashFlow * 12` |
| NOI (annual) | `(R - E) * 12 * s` | `(R - E) * 12 * s` |
| Equity | `(V - D) * s` | `(V - D) * s` |
| Annual rent (display) | `R * 12 * s` (same *R* as NOI) | `R * 12 * s` (same *R* as NOI) |
| Cash invested | `cashInvested * s` | `cashInvested * s` |

Ratios:
- **Cap rate:** `NOI / (V * s)` (economic-share context in both modes).
- **DSCR:** `NOI / annualDebtService`, where annual debt service follows mode rules above.
- **Property LTV:** `D / V` (property-level leverage; intentionally not ownership-scaled).
- **Portfolio LTV:** `totalDebt / totalMarketValue`; `totalDebt` is mode-dependent while `totalMarketValue` remains ownership-scaled.

---

## 3) Numeric examples

Assume:
- `ownershipPercent = 50%` (`s = 0.5`)
- `R = 3,000`, `E = 1,000`, `P = 1,200`
- `D = 220,000`, `V = 400,000`

**Proportional**
- Debt service = `1,200 * 0.5 = 600/mo`
- Monthly cash flow = `(3,000 - 1,000 - 1,200) * 0.5 = 400`
- NOI = `(3,000 - 1,000) * 12 * 0.5 = 12,000`
- DSCR = `12,000 / (600 * 12) = 1.67`

**Full liability**
- Debt service = `1,200/mo`
- Monthly cash flow = `(3,000 * 0.5) - (1,000 * 0.5) - 1,200 = -200`
- NOI = `12,000` (unchanged from proportional)
- DSCR = `12,000 / (1,200 * 12) = 0.83`

Interpretation: NOI reflects economics of your ownership share, while liability burden changes by selected lens.

---

## 4) UX copy requirements

Any UI that references ownership mode must clearly state:
- **Proportional:** "your share of rent, expenses, debt, and debt service."
- **Full liability:** "rent/expenses stay ownership-scaled, debt and debt service show 100%."

Where DSCR or LTV appears, copy/tooltips must avoid ambiguity about denominator behavior.

---

## 5) Implementation guardrails

- Use shared metric helpers in `app/lib/metrics/`; do not duplicate formulas in components/pages.
- If a task touches ownership behavior, update this document if formulas or semantics change.
- PM/builder reviews must verify affected surfaces against this policy before approval.
