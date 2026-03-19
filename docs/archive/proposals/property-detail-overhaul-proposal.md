# Property Detail Page Overhaul — Proposal

**ARCHIVED:** Superseded by property-detail-tabs-proposal; tabs implemented.  
**Status:** Proposal  
**Last updated:** March 2026  
**References:** `docs/refinance-payoff-proposal.md` §7, `docs/roadmap.md`, `docs/design-spec.md`

---

## 1. Executive summary

The property detail page has grown into a dense, scroll-heavy form. Users land on it wanting to understand their property and use tools (scenarios, payoff, refinance) — but the layout buries value and makes discovery hard. This proposal restructures the page around **user intent**: quick status → key metrics → tools → deep dives. The result is a scannable home base that surfaces what matters first and keeps power features discoverable without overwhelming.

---

## 2. Current state analysis

### 2.1 What's on the page today (top to bottom)

| Section | Content | Issues |
|---------|---------|--------|
| **Header** | Back link, Edit/Delete actions | Fine |
| **Title** | Nickname, address | Fine |
| **Property details** (card) | Type, purchase, value, rent, benchmark, expenses, bed/bath, ownership, vacancy, cash invested, notes | Long list; mixes identity with financials; benchmark buried in rent row |
| **Mortgages** (card) | Per-mortgage: balance, rate, term, payment, payoff insight, payoff accelerator | Dense; payoff accelerator hidden until you read; multiple mortgages = lots of scroll |
| **Investment metrics** | Cash flow, equity, cap rate, LTV, cash-on-cash | "Show more" hides advanced metrics; feels secondary |
| **Scenario** | Collapsible sliders for rent/value/mortgage | Valuable tool but collapsed by default; easy to miss |
| **Amortization** | Full chart | Large; "not affected by scenario" note adds cognitive load |

### 2.2 User pain points

1. **No clear entry point** — Everything looks equally important. Users don't know where to look first.
2. **Metrics buried** — Cash flow and equity are the "numbers first" metrics (per design spec) but they're below property details and mortgages.
3. **Tools hidden** — Scenario is collapsed; payoff accelerator is inside each mortgage. Users who skim never discover them.
4. **Property details overload** — 10+ fields in one card. Purchase price, value, rent, expenses, benchmark, notes — all in one list.
5. **Long scroll** — No way to jump to a section. On mobile, payoff and scenario feel far away.
6. **Cognitive load** — "Original mortgage schedule. Not affected by scenario" requires users to hold context across sections.

---

## 3. User goals (when visiting this page)

| Goal | Frequency | What they need |
|------|------------|----------------|
| **Check status** | High | Value, equity, cash flow at a glance |
| **Understand rent vs. market** | Medium | Benchmark visible, not buried |
| **See payoff timeline** | Medium | When will I pay off? Can I accelerate? |
| **Model what-if** | Medium | Scenario sliders — what if rent went up 10%? |
| **Edit property** | Low | Edit link discoverable but not dominant |
| **View amortization** | Low | Full schedule for reference |
| **Manage mortgages** | Low | Add/edit/delete when needed |

---

## 4. Proposed structure

### 4.1 Layout philosophy

**Hero → Metrics → Tools → Reference**

1. **Hero** — Property identity + at-a-glance numbers (value, equity, cash flow). One glance answers "How's this property doing?"
2. **Metrics** — Full investment metrics in a compact, scannable block.
3. **Tools** — Scenario, payoff accelerator. Surfaces "what you can do" with clear CTAs.
4. **Reference** — Property details, mortgages, amortization. Deep dives for when users need them.

### 4.2 Proposed page structure

```
[Header: ← Properties | Edit | Delete]

[HERO — Property at a glance]
  Property name / address
  [Inline metrics row: Value | Equity | Cash flow | Rent vs. market]
  — Same visual language as dashboard Property at a glance
  — Compact; 4–5 key numbers; rent vs. market prominent

[INVESTMENT METRICS — always visible]
  Cap rate | LTV | NOI | Cash-on-cash | DSCR | Annual rent
  — Single row or 2x3 grid; no "Show more"
  — Matches dashboard metric density

[TOOLS — two cards side by side or stacked]
  Card 1: Scenario
    — "What if rent, value, or payment changed?"
    — Sliders (default expanded or one-click expand)
    — Recalculated metrics inline
  Card 2: Payoff & refinance
    — "Pay off in X years" (or remaining at term)
    — Payoff accelerator (years earlier, extra payment)
    — Per-mortgage if multiple; or summary + expand

[PROPERTY DETAILS — collapsible or compact]
  Type, purchase, value, rent, expenses, benchmark, notes
  — Grouped: Identity | Financials | Optional
  — "Edit property" link
  — Collapsed by default if hero + metrics cover the basics

[MORTGAGES — collapsible when > 0]
  Full mortgage list with add/edit/delete
  — Expand to see details
  — Payoff insight lives in Tools card; this is the data

[AMORTIZATION — collapsible]
  "Original mortgage schedule" chart
  — Collapsed by default; "View amortization schedule" to expand
  — Or move to a sub-page / modal for power users
```

### 4.3 Key design decisions

| Decision | Rationale |
|----------|-----------|
| **Hero at top** | Matches dashboard; users get "how's it doing?" in one glance |
| **Metrics always visible** | No "Show more" — if we have the data, show it. Reduces clicks. |
| **Tools elevated** | Scenario and payoff are high-value; give them real estate |
| **Property details collapsible** | Hero + metrics cover the essentials; details for editing/reference |
| **Mortgages collapsible** | When you have 1–2 mortgages, payoff is in Tools. Full list for editing. |
| **Amortization collapsible** | Large chart; not everyone needs it every visit. Progressive disclosure. |
| **No tabs** | Tabs hide content. Collapsible sections let users expand what they need. |
| **Sticky section nav (optional)** | For long pages, "Overview | Mortgages | Amortization" jump links. Defer if collapsible reduces scroll enough. |

---

## 5. Section-by-section redesign

### 5.1 Hero — Property at a glance

**Purpose:** Answer "How's this property doing?" in 5 seconds.

**Content:**
- Property name (or address)
- Inline row: **Value** | **Equity** | **Cash flow** | **Rent vs. market**
- Optional: Small debt/equity bar (like dashboard) if it adds clarity

**Layout:** Single card, compact. Reuse dashboard's Property at a glance visual language (grid of metrics, optional inline bar).

**Edit:** "Edit property" link in card header or below. Not buried.

---

### 5.2 Investment metrics

**Purpose:** Full picture for investors who care about cap rate, LTV, etc.

**Content:** Cap rate, LTV, NOI, Cash-on-cash, DSCR, Annual rent. All visible. No "Show more."

**Layout:** 2x3 grid or single row (responsive). Same formatting as dashboard MetricCards.

**Change from current:** Remove toggle. Show all 6 (or 8 if we add more). Align with dashboard.

---

### 5.3 Tools — Scenario

**Purpose:** "What if" modeling. High value, currently underused.

**Content:**
- Heading: "Scenario"
- One-line intro: "What if rent, value, or mortgage payment changed?"
- Sliders: Rent %, Value %, Mortgage %
- Recalculated metrics (cash flow, equity, etc.) update inline
- "How is this calculated?" in details/summary

**Layout:** Card. Default **expanded** (not collapsed). Users came here to use tools; don't hide them. If space is tight, consider "Expand scenario" but default to open.

---

### 5.4 Tools — Payoff & refinance

**Purpose:** "When will I pay off? Can I pay it off sooner?"

**Content:**
- Per mortgage: "Pay off in X years (Month Year)" or "About $X remaining at term end"
- Payoff accelerator: "Pay off 5/10/15 years earlier" buttons, extra payment input
- Balance source: "Based on stored balance as of [date]" or "Using projected balance"

**Layout:** Card. If 1 mortgage: show payoff + accelerator inline. If 2+: summary per mortgage, expand for accelerator details. Reuse current PayoffInsight component; extract from MortgageSection into this Tools card.

**Relationship to Mortgages card:** Tools card = insights and actions. Mortgages card = data (balance, rate, term, edit/delete). Avoid duplication: payoff copy in Tools; raw mortgage data in Mortgages.

---

### 5.5 Property details

**Purpose:** Edit and reference. Identity + financial inputs.

**Content:** Same as today — type, purchase, value, rent, expenses, benchmark, bed/bath, ownership, vacancy, cash invested, notes.

**Layout:** Collapsible section. Default **collapsed** if hero already shows value, rent, benchmark. Heading: "Property details" with "Edit property" link. Expand to see full list. Group into:
- **Identity:** Type, purchase date, bed/bath, unit mix
- **Financials:** Value, rent, expenses, benchmark, cash invested
- **Optional:** Ownership %, vacancy %, notes

---

### 5.6 Mortgages

**Purpose:** View and edit mortgage data. Add/remove mortgages.

**Content:** List of mortgages with balance, rate, term, payment, lender, loan type. Add mortgage, Edit, Delete.

**Layout:** Collapsible. Default **expanded** if 0 mortgages (show "Add mortgage" CTA). Default **collapsed** if 1+ (summary: "2 mortgages, $X total balance" — expand to see list and payoff is in Tools).

**Change from current:** Payoff insight moves to Tools card. This card is data + actions only.

---

### 5.7 Amortization

**Purpose:** Reference. Full schedule for users who want it.

**Content:** Amortization chart (unchanged).

**Layout:** Collapsible. Default **collapsed**. Heading: "Amortization schedule" with "View schedule" to expand. Note: "Original mortgage terms. Not affected by scenario." inside expanded section.

---

## 6. Mobile considerations

- Hero: Stack metrics vertically on small screens (2 cols → 1 col).
- Tools: Stack Scenario and Payoff cards vertically.
- Collapsible sections: Essential on mobile to reduce scroll. Default states matter — hero + metrics + Scenario expanded; Property details, Mortgages (if 1+), Amortization collapsed.
- Sticky "Back to top" or section nav: Consider if page remains long after collapse.

---

## 7. Implementation approach

### Phase 1: Restructure (no new features)
1. Add Hero block (Property at a glance) at top.
2. Expand Investment metrics (remove Show more).
3. Reorder: Hero → Metrics → Scenario → Payoff card → Property details → Mortgages → Amortization.
4. Extract payoff insight from MortgageSection into new PayoffCard (or Tools section).
5. Make Property details, Mortgages (when 1+), Amortization collapsible.

### Phase 2: Polish
1. Refine default expanded/collapsed states based on usage.
2. Add optional sticky section nav if needed.
3. Ensure Edit property is discoverable in hero or property details header.

### Phase 3: Optional enhancements
1. Sub-page for amortization (e.g. `/properties/[id]/amortization`) if chart feels heavy.
2. "Quick actions" row: Edit property | Add mortgage | Refresh benchmark.

---

## 8. Acceptance criteria

- [ ] Hero block at top with Value, Equity, Cash flow, Rent vs. market.
- [ ] Investment metrics always visible (no Show more).
- [ ] Scenario card expanded by default.
- [ ] Payoff insight in dedicated Tools card (or combined with Scenario).
- [ ] Property details collapsible; default collapsed when hero shows key data.
- [ ] Mortgages collapsible when 1+; payoff lives in Tools, not duplicated.
- [ ] Amortization collapsible; default collapsed.
- [ ] Edit property link discoverable (hero or property details).
- [ ] Mobile: metrics stack; collapsible sections reduce scroll.
- [ ] No regressions: all existing data and actions preserved.
- [ ] `npm run check` passes.

---

## 9. Files to modify

| File | Changes |
|------|---------|
| `app/(app)/properties/[id]/page.tsx` | Restructure layout; add Hero; reorder sections; wire collapsible |
| `app/(app)/properties/property-metrics-section.tsx` | Remove Show more; show all metrics |
| `app/(app)/properties/mortgage-section.tsx` | Extract payoff to Tools; simplify to data + add/edit/delete |
| New: `app/(app)/properties/[id]/property-hero.tsx` | Hero block (reuse dashboard patterns) |
| New: `app/(app)/properties/[id]/payoff-card.tsx` | Payoff insight + accelerator (extract from MortgageSection) |
| `app/(app)/properties/[id]/scenario-section.tsx` | Default expanded; possibly rename to ScenarioCard |
| New: `app/(app)/properties/[id]/collapsible-section.tsx` | Reusable collapsible wrapper |

---

## 10. References

- `docs/refinance-payoff-proposal.md` §7 — Property detail overhaul options
- `docs/dashboard-single-property-proposal.md` — Property at a glance pattern
- `docs/design-spec.md` — Numbers first, progressive disclosure
- `app/(app)/dashboard/dashboard-charts.tsx` — Inline value bar, Property at a glance grid
