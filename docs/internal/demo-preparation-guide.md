# Demo Preparation Guide — Veld Portfolio

**Audience:** Owner/non-expert presenter  
**Purpose:** Help you explain the product, the major pages, and the core metrics with confidence in plain English.

---

## 1. The shortest explanation

If someone asks what Veld Portfolio is, a strong simple answer is:

> Veld Portfolio helps small real estate investors understand what their properties are doing. It takes property, rent, expense, and mortgage inputs and turns them into a portfolio view, property-level metrics, deal analysis, and forward-looking modeling.

If they ask what makes it useful:

> It is meant to replace spreadsheet guesswork with cleaner investor-facing visibility. The app helps you understand equity, cash flow, debt burden, and what different assumptions do to your returns.

---

## 2. The mental model

The easiest way to talk about the app is to move from simple to advanced:

1. **Property record:** what the property is and what numbers it has today
2. **Mortgage record:** what debt is attached to it
3. **Portfolio rollup:** what all properties look like together
4. **Analysis tools:** what happens if you test a deal or change assumptions

That means each major area answers a different question:

- **Dashboard:** "How is my portfolio doing right now?"
- **Properties:** "What do I own and which property needs attention?"
- **Property detail:** "What is happening with this one property?"
- **Analyze deal:** "Would this be a good investment if I bought it?"
- **Modeling:** "What happens over time if assumptions change?"
- **Mortgage:** "How does this loan pay down and what if I pay extra?"

---

## 3. Plain-English metric glossary

### Property value

What the property is worth today based on the current estimated value in the app.

### Debt

How much mortgage balance is still outstanding.

### Equity

How much of the property you actually own after subtracting debt from value.

**Simple version:** value minus debt.

### Monthly cash flow

How much money is left each month after rent comes in and expenses plus mortgage payments go out.

**Simple version:** rent minus expenses minus debt payment.

Positive is good. Negative means the property needs money from you each month.

### Annual cash flow

The same idea as monthly cash flow, just rolled up over a year.

### NOI (Net Operating Income)

This is one of the most important investor metrics.

NOI means:

- take rent
- subtract operating expenses
- **do not** subtract mortgage payments yet

So NOI tells you how the property performs as a real estate asset before financing.

**Simple version:** annual rent minus annual operating expenses.

### Cap rate

Cap rate is a yield-style number.

**Simple version:** NOI divided by property value.

It helps compare how efficiently the property produces income relative to value.

### LTV (Loan-to-value)

How much debt there is relative to value.

**Simple version:** debt divided by value.

Higher LTV means more leverage and less cushion.

### DSCR (Debt service coverage ratio)

This tells you whether the property's income covers its debt payments.

**Simple version:** NOI divided by annual debt service.

- Above `1.0` means income covers debt
- Below `1.0` means income does not fully cover debt

### Cash-on-cash return

This asks: how well is the cash you personally put in performing?

**Simple version:** annual cash flow divided by cash invested.

### Vacancy assumption

This is the idea that you should not assume the property is occupied and paying 100% of the time forever. The app uses a vacancy percentage to reduce effective rent for analysis purposes.

### Ownership %

If you own only part of a property, the app can scale most economic metrics to your share. This matters for shared ownership situations.

---

## 4. High-level math explanation

When you need to explain how the app calculates things without sounding too technical, use this:

> The app starts with the property's rent, expenses, value, debt, ownership share, and vacancy assumption. From there it calculates asset performance metrics like NOI and cap rate, leverage metrics like LTV, and investor take-home metrics like cash flow and cash-on-cash return.

If someone wants a bit more:

> The key distinction is that NOI is before financing, while cash flow is after financing. So NOI tells you how the property performs as an asset, and cash flow tells you how it performs for you after debt payments.

If they ask why ownership matters:

> Some investors do not own 100% of a property. Veld can scale the economics to the user's ownership share so the numbers reflect their position, not just the raw property totals.

---

## 5. Page-by-page walkthroughs

### Dashboard

**What it is:** The high-level portfolio home base.

**What to say:**

> This page answers "What is my portfolio doing right now?" It shows total value, debt, equity, cash flow, and supporting ratios, then adds charts and benchmark context where relevant.

**What to point out:**

- headline metrics first
- charts for portfolio shape
- quick paths into properties, modeling, and mortgage tools
- benchmark context when there is enough data

**Why it matters:** It reduces the need to piece together portfolio health from multiple property pages or spreadsheets.

---

### Properties page

**What it is:** The inventory and triage view.

**What to say:**

> This page is for browsing the portfolio property by property. It helps the user find what they own, sort/filter, and see which properties are healthy, underperforming, missing mortgage data, or missing benchmark context.

**Why it matters:** It is the bridge between portfolio-level summary and deep property detail.

---

### Property detail page

**What it is:** The single-property command center.

**What to say:**

> This page is where the user understands one property in full context. It separates performance summary from deeper factual details so the page stays readable.

**Key concepts to explain:**

- overview for performance and key signals
- details for the full property record
- mortgage information embedded with the rest of the property story
- benchmark and health signals

**Why it matters:** This is where a user verifies whether the numbers for a specific property actually make sense.

---

### Analyze deal

**What it is:** A pre-acquisition evaluation tool.

**What to say:**

> Analyze deal lets a user test a property before buying it. They can enter estimated rent, expenses, purchase price, value, debt, and ownership assumptions, then immediately see metrics like cash flow, NOI, cap rate, and DSCR.

**Why the stress section matters:**

> The stress tools help the user ask "what if rent is lower?" or "what if expenses are higher?" without overwriting the baseline assumptions.

**Why it matters:** This is one of the clearest value-add tools in the product because it supports investor decisions before money is committed.

---

### Modeling workspace

**What it is:** A forward-looking scenario tool.

**What to say:**

> Modeling is for asking how a property might evolve over time. Instead of just showing today's numbers, it lets the user explore projections based on assumptions like rent, expenses, debt behavior, and time horizon.

**Why it matters:** Investors do not only care about today. They care about what the property may look like in 5, 10, or 20 years.

**Simple explanation:** Analyze deal is more like "Is this deal attractive now?" Modeling is more like "What could this property become over time?"

---

### Mortgage workspace

**What it is:** A debt-specific lens.

**What to say:**

> The mortgage workspace focuses on loan payoff and debt behavior. It helps the user understand balance trajectory, payoff timing, and what extra payments could change.

**Important nuance:**

> Mortgage math is not the same as property performance math. A property can have good NOI and still feel tight because of debt structure. This page helps separate those ideas.

---

### Settings and plans

**What it is:** Account, billing, preferences, and import/export support.

**What to say:**

> Settings handles account-level controls, plan visibility, and import/export-related tasks. It is less about analysis and more about keeping the account and data workflow healthy.

---

## 6. Demo story order

If you are giving a live demo, this order is usually easiest:

1. Start on **Dashboard** to show the big picture.
2. Open **Properties** and pick one property.
3. Show the **Property detail** page to ground the portfolio in a real example.
4. Go to **Analyze deal** to show how the app helps before purchase.
5. Go to **Modeling** to show future-looking insight.
6. Go to **Mortgage** to show debt-specific intelligence.
7. End by returning to the value proposition: portfolio clarity plus decision support.

---

## 7. Questions you may get

### "What is the difference between NOI and cash flow?"

Use:

> NOI is before mortgage payments. Cash flow is after mortgage payments. NOI tells you how the property performs as an asset; cash flow tells you how it performs for you after financing.

### "Why do I care about cap rate?"

Use:

> Cap rate is a quick way to understand yield relative to value. It helps compare properties more objectively.

### "Why does ownership percentage matter?"

Use:

> Because many investors are not 100% owners of every property. The app can scale results to the user's share so the numbers reflect their real economic stake.

### "What makes this different from a spreadsheet?"

Use:

> The app keeps the metrics consistent across the portfolio, property detail, analysis, and modeling surfaces. It also adds benchmark and workflow support that spreadsheets usually do not maintain well.

---

## 8. Things to avoid saying

- Do not imply the app gives legal, tax, or investment advice.
- Do not imply market estimates are guaranteed truths; they are decision-support inputs.
- Do not overclaim automation. The product is strong today, but it is still intentionally lightweight rather than an everything platform.

---

## 9. Fast confidence refresher before a demo

Read these right before presenting:

1. `docs/internal/demo-preparation-guide.md`
2. `docs/internal/project-grounding.md`
3. `docs/policies/ownership-metrics.md`
4. `docs/policies/analytics-math-policy.md`

That combination will usually give you the product story, page story, and metric story you need.
