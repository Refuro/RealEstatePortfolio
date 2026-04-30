# Ownership Metrics Policy (Canonical)

**Purpose:** Define one ownership-semantics policy for formulas, UI copy, and reviews.

**Companion policy:** See `docs/policies/analytics-math-policy.md` for sitewide analytics contracts (time windows, debt-service source rules, reconciliation across UI/API/export).

**Scope:** Dashboard, Properties, Property detail, Modeling, Mortgage rollups, Analyze assumptions copy, exports/API summaries, and all metric help text.

---

## 1) Canonical model

Let:
- `s = ownershipPercent / 100`
- `R = effective monthly rent` (after vacancy) — entered as the **property's full** rent
- `E = monthly expenses` — entered as the **property's full** expenses
- `P = monthly debt service (mortgage payment)` — recorded against the loan, full amount
- `D = debt balance` — recorded against the loan, full amount
- `V = estimated value` — the property's estimated market value, full amount
- `cashInvested` = the **user's personal cash** put in (down payment + closing costs + rehab). Not ownership-scaled — already represents what the user spent.

Three input classes:

1. **Property-level inputs (entered as totals):** rent, expenses, value, debt balance, debt service. The property has these regardless of who owns it.
2. **Personal inputs (entered as user's share):** ownership percent, cash invested.
3. **Derived metrics:** apply ownership scaling per §2.

There is **one** display mode. Liability framing (full debt, worst-case DSCR) is no longer surfaced as a toggle or expander — the "joint liability" lens did not earn its conceptual cost.

---

## 2) Per-metric formulas

| Metric | Formula | Notes |
|---|---|---|
| Rent (effective monthly) | `R` (full) on input; `R * s` on display | "Your share" view |
| Expenses (monthly) | `E * s` | "Your share" view |
| Debt balance (display) | `D * s` | "Your share" view |
| Debt service (monthly) | `P * s` | "Your share" view |
| Monthly cash flow | `(R - E - P) * s` | Your share of the property's cash flow |
| Annual cash flow | `monthlyCashFlow * 12` | — |
| NOI (annual) | `(R - E) * 12 * s` | Your share of operating income |
| Equity | `(V - D) * s` | Sale-proceeds concept: "what you'd walk with at closing" |
| Annual rent (display) | `R * 12 * s` | Same *R* as NOI |
| Cash invested | `cashInvested` (no scaling) | User entered their personal cash |
| Property value (display) | `V` (full, not scaled) | Asset value is asset value regardless of ownership |

Ratios:
- **Cap rate:** `NOI / (V * s)` — equivalent to property-level cap rate; ownership-scaled numerator and denominator cancel.
- **DSCR:** `(NOI) / (P * 12 * s)` — both ownership-scaled. The ratio matches the property's underlying DSCR.
- **Property LTV:** `D / V` (property-level leverage; not ownership-scaled).
- **Portfolio LTV:** `totalDebt / totalMarketValue`, where both sums are ownership-scaled.
- **Cash-on-cash return:** `annualCashFlow / cashInvested` — both already represent the user's share / money.

---

## 3) Numeric example

Assume:
- `ownershipPercent = 50%` (`s = 0.5`)
- `R = 3,000`, `E = 1,000`, `P = 1,200`
- `D = 220,000`, `V = 400,000`
- `cashInvested = 32,000` (user's personal cash)

Displayed values:
- Property value (full): `400,000`
- Equity: `(400,000 - 220,000) * 0.5 = 90,000`
- Debt balance (your share): `220,000 * 0.5 = 110,000`
- Monthly debt service (your share): `1,200 * 0.5 = 600`
- Monthly cash flow: `(3,000 - 1,000 - 1,200) * 0.5 = 400`
- NOI (annual): `(3,000 - 1,000) * 12 * 0.5 = 12,000`
- DSCR: `12,000 / (600 * 12) = 1.67`
- Cash-on-cash return: `(400 * 12) / 32,000 = 15.0%`

Interpretation: rent, expenses, debt, equity, and NOI all reflect the user's share of property economics. Property value reflects the asset's market value. Cash invested reflects what the user personally spent. Cash-on-cash and equity-as-percent-of-share help the user reason about their position.

---

## 4) UX copy requirements

When `ownershipPercent < 100`:

- The property detail header and dashboard single-property view render an `OwnershipChip` (`X% ownership`) plus a one-line explainer:
  > *Cash flow, equity, NOI, and rent reflect your X% share. Property value, cap rate, LTV, and DSCR are property-level.*
- The properties list per-card shows a small `X%` chip next to the address.
- The `Monthly rent`, `Monthly expenses` field labels include `(total)` suffix in the wizard, edit drawer, and rent form, with help text:
  > *Enter the property's full rent — your X% share is calculated automatically.*
- The `Cash invested` field label reads `Cash invested — your share`, with help text clarifying it's the user's personal cash.

When `ownershipPercent === 100`: no chip, no suffixes, no extra explainers. Solo-owner UX is unchanged from baseline.

---

## 5) Saved deals & Deal Analyzer

Saved deals and the Deal Analyzer use the same proportional math as portfolio surfaces. There is no analyzer-vs-portfolio split (that split existed only because of the old liability lens, which has been removed).

---

## 6) Implementation guardrails

- Use shared metric helpers in `app/lib/metrics/`; do not duplicate formulas in components/pages.
- Property-level inputs (rent, expenses, value, debt) are stored as **full** values. Scaling happens at metric computation, not at input.
- Personal inputs (cash invested, ownership %) are stored as the user entered them; do not scale them.
- If a task touches ownership behavior, update this document if formulas or semantics change.
- PM/builder reviews must verify affected surfaces against this policy before approval.

---

## 7) Changelog

- **2026-04-30** — Display-mode toggle and `ownershipDisplayMode` column removed. Collapsed to single proportional basis. `OwnershipDisplayMode` type retired. Joint-liability expander on the mortgage card removed (numbers visible there were already at full / not ownership-scaled, the expander added no information).
- **2026-04-30** — Bug fixes: stopped scaling Property Value in displays (asset value is asset value); stopped scaling `cashInvested` in `computePropertyMetrics` (the user enters their personal share, not partnership total). Wizard and edit-drawer field labels for rent/expenses gained `(total)` suffix and explainer when ownership < 100%.
- **2026-04-30** — `OwnershipChip` introduced for property detail header, dashboard single-property view, and properties list cards.
