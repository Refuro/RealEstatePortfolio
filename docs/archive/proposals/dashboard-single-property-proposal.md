# Dashboard Proposal — Single-Property vs Multi-Property

**ARCHIVED:** Implemented.  
**Status:** Proposal (revised)  
**Last updated:** March 2026

---

## 1. Design philosophy

**Single-property:** The dashboard is a **property home base** — one property, one focus. Avoid redundancy. Use visuals to add color and break up text. Every element should earn its place.

**Multi-property:** The dashboard is a **portfolio overview** — comparison across properties. Charts shine here. More metrics, more charts, more sections.

**Shared:** Metric cards at top, Quick actions, design tokens. No raw zinc/slate. Thoughtful, robust, modern, frictionless.

---

## 2. Redundancy analysis (single-property)

| Element | Redundant with | Recommendation |
|---------|----------------|-----------------|
| Metric cards (value, debt, equity, cash flow) | Property at a glance | Single: show Property at a glance as hero; reduce or reframe metric row |
| "Add more properties..." text | Add property card | Remove standalone text; one card only |
| Add property card + teaser card | Overlap in messaging | Merge or consolidate; one clear CTA |
| Equity chart (one bar) | Property at a glance equity | Single: hide; adds little, one bar is low value |
| Cash flow chart (one bar) | Property at a glance + metric card | Single: hide; redundant, negative values render poorly |
| Value breakdown (standalone card) | Property at a glance numbers | Single: move inline into Property at a glance; if cramped, hide |

---

## 3. Single-property layout (recommended)

### 3.1 Structure

```
[Header: Dashboard — 1 property]

[Metric row — condensed]
  Total value | Total equity | Cash flow | (cap rate, LTV if useful)
  — For single property, these equal the property. Keep for consistency with multi-property header. Option: 3–4 primary cards only.

[Property at a glance — hero card]
  Property name / nickname
  Value | Debt | Equity | Cash flow | Rent vs. market
  [Inline value bar — compact horizontal stacked bar: debt + equity = value]
  [Equity as % of value — e.g. "Equity: 21% of value" — small text or micro bar]
  [View property] link

[One visual — adds color]
  — Inline value bar (above) provides color. Option: small LTV progress bar (debt/value as %) for another visual.
  — Or: payoff teaser when mortgage exists — "Pay off in ~18 years" with subtle progress indicator.

[Consolidated CTA — one card]
  "Add another property to see equity, debt, and cash flow charts side by side."
  [Add property]

[What's on property page — compact]
  Amortization, scenarios, rent vs. market. [View property →]

[Quick actions]
  View property | Add property | Analyze a deal
```

### 3.2 Visuals that add color (single-property)

| Visual | Placement | Purpose |
|--------|-----------|---------|
| **Inline value bar** | Inside Property at a glance, below metrics | Debt + equity = value; uses chart-1, chart-3; breaks up text |
| **Equity %** | Inline with equity metric or as micro bar | "21% of value" — quick context |
| **LTV bar** | Optional, small | Debt/value as %; another colored bar |
| **Cash flow badge** | Already have (positive/negative color) | Keep |
| **Payoff teaser** | Optional, when mortgage exists | "~18 years to payoff" — small, links to property |

**Avoid for single-property:** Full Equity chart (one bar), Cash flow chart (one bar, negative rendering issues), standalone Value breakdown card (redundant).

### 3.3 Eliminate

- Standalone "Add more properties to compare across your portfolio." text
- Cash flow chart for single-property
- Equity chart for single-property (one bar adds little)
- Standalone Value breakdown card — move inline or hide
- Duplicate add-property messaging

### 3.4 Consolidate

- **One add-property CTA:** Card with benefit copy + button. No text above.
- **Property at a glance + inline value bar:** One card, metrics + compact visual.

---

## 4. Multi-property layout (unchanged philosophy)

```
[Header: Dashboard — N properties]

[Metric row — full]
  Total value | Total debt | Total equity | Cash flow | Cap rate | LTV | NOI | Cash-on-cash

[Rent vs. market section]
  List of properties with benchmark labels

[Portfolio charts]
  Equity by property (bar chart)
  Debt vs. value by property (bar chart)
  Monthly cash flow by property (bar chart)
  — Fix Cash flow chart: formatCurrency for axis, proper negative scaling

[Quick actions]
  View all properties | Add property | Analyze a deal
```

**Charts add color and comparison value.** No Property at a glance; metrics + charts are the story.

---

## 5. Implementation summary

### 5.1 Single-property changes

| # | Change | Effort |
|---|--------|--------|
| 1 | Move Value breakdown inline into Property at a glance (compact bar below metrics). Fallback: hide if cramped. | Low |
| 2 | Hide Equity chart for single-property | Low |
| 3 | Hide Cash flow chart for single-property | Low |
| 4 | Remove standalone "Add more properties..." text | Low |
| 5 | Consolidate add-property: one card, shorter copy, one button | Low |
| 6 | Optional: Add equity % (e.g. "21% of value") to Property at a glance | Low |
| 7 | Optional: Payoff teaser when mortgage exists — "Pay off in ~X years" link | Low–medium |
| 8 | Consider: Condense metric row for single-property (fewer cards) — optional | Low |

### 5.2 Multi-property changes

| # | Change | Effort |
|---|--------|--------|
| 1 | Fix Cash flow chart: formatCurrency for X-axis, proper domain for negative values | Low |

### 5.3 Shared

- Quick actions: View property / View all, Add property, Analyze a deal
- Design tokens, responsive, accessible

---

## 6. Visual alternatives (for future consideration)

- **Donut/ring chart** — Debt vs. equity as a ring; compact, colorful
- **Progress bar** — LTV as "78% leveraged" with colored bar
- **Status pill** — "Cash flow: negative" with red pill; "Rent at market" with neutral
- **Payoff timeline** — Small horizontal bar showing years to payoff (when mortgage exists)

---

## 7. Files to modify

- `app/(app)/dashboard/page.tsx` — Single vs multi layout, CTA consolidation, optional metric condensing
- `app/(app)/dashboard/dashboard-charts.tsx` — Hide Equity/Cash flow for single; inline value bar in Property at a glance; remove standalone Value breakdown card
- `components/charts/cash-flow-chart.tsx` — Fix axis formatting, negative scaling
- `components/charts/value-breakdown-chart.tsx` — Extract inline variant or add compact mode for embedding in Property at a glance

---

## 8. Acceptance criteria

**Single-property:**
- [ ] Property at a glance is hero; includes inline value bar (debt + equity) or hides if fallback
- [ ] No Equity chart, no Cash flow chart
- [ ] No standalone Value breakdown card
- [ ] One add-property card with benefit copy; no redundant text above
- [ ] "What's on property page" teaser remains; compact
- [ ] Quick actions: View property, Add property, Analyze a deal

**Multi-property:**
- [ ] All charts (Equity, Debt vs. value, Cash flow) shown
- [ ] Cash flow chart: formatted axis, correct negative scaling
- [ ] No Property at a glance, no single-property CTAs

**Both:**
- [ ] Visuals add color (chart tokens); no raw zinc/slate
- [ ] Responsive, accessible
- [ ] `npm run check` passes

---

## 9. References

- `docs/design-spec.md` — Typography, color, spacing
- `docs/architecture-and-build-practices.md` — Product mantra
- `components/charts/*` — Chart patterns, ChartWrapper
