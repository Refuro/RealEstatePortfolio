# Ownership Metrics

**Purpose:** Document how partial ownership affects displayed metrics across the app.

---

## Proportional Mode (Default)

When a user owns less than 100% of a property, all metrics are scaled by their ownership percentage. This answers: *"What's my piece?"*

| Metric | Formula |
|--------|---------|
| Equity | (value − debt) × ownership % |
| Rent | rent × ownership % |
| Expenses | expenses × ownership % |
| Debt | debt × ownership % |
| Cash flow | (rent − expenses − payment) × ownership % |
| NOI | (gross rent − expenses) × ownership % |

Charts (equity, debt vs value, cash flow) and summary cards all use these scaled values. Partial owners see their share consistently everywhere.

---

## Full Liability Mode

Implemented via **Settings → Portfolio display**. Users can toggle to *"Full liability"* view:

- **Debt** and **mortgage payment** show 100% (joint liability — you're on the hook for the full amount)
- **Equity, rent, expenses** stay scaled by ownership %
- **Cash flow** = (rent×% − expenses×% − full payment) per property
- **Portfolio LTV** = totalDebt (sum of 100% debt) / totalMarketValue (scaled)
