# Benchmarking Surfacing Proposal

**ARCHIVED:** Implemented — superseded by live product; see [`../../reference/roadmap.md`](../../reference/roadmap.md) (benchmarking done).  
**Status:** Historical proposal (do not use for current behavior).  
**Last updated:** March 2025

---

## 1. Problem

The rent vs. market benchmark ("Your rent is X% above/below market") is only visible on the **property detail page**. Users who browse the properties list or dashboard never see it unless they click into each property. The feature is underused and its value is hidden.

---

## 2. Current App Structure

| Page | What's shown | Benchmark? |
|------|--------------|------------|
| **Dashboard** | Portfolio metrics (value, debt, equity, cash flow, cap rate, LTV, NOI, cash-on-cash), charts, quick actions | No |
| **Properties list** | Property cards: nickname, address, value, equity, cash flow, "Updated X ago" | No |
| **Property detail** | Full property info, metrics, scenario, amortization, benchmark | Yes |

---

## 3. Options for Surfacing Benchmarks

### Option A: Properties list — add benchmark to each card

**What:** Add a compact benchmark line to each property card on `/properties`.

**Example:**
```
123 Main St
Dallas, TX
Value: $364k · Equity: $131k · Cash flow: $2,460
Rent 12% below market
```

**Pros:** Visible at a glance; no extra click.  
**Cons:** Cards get denser; properties without benchmark show nothing or "Refresh benchmark" (adds clutter).

---

### Option B: Properties list — benchmark badge/pill

**What:** Small badge on each card: "Below market" (green) or "Above market" (muted) or "At market". Click card to see details.

**Pros:** Lightweight; draws attention without crowding.  
**Cons:** Loses the specific %; user must click for detail.

---

### Option C: Dashboard — "Rent insights" section

**What:** New section on dashboard: "Rent vs. market" with a list of properties that have benchmarks. E.g. "123 Main St: 12% below market · 456 Oak Ave: 5% above market". Link to property or "Refresh" for those without.

**Pros:** Dedicated space; highlights the feature.  
**Cons:** Adds a new section; may feel redundant if user has 1–2 properties.

---

### Option D: Dashboard — banner/hint when below market

**What:** When any property is significantly below market (e.g. >10%), show a dismissible banner: "You may be leaving money on the table — 123 Main St is 12% below market. Review rent."

**Pros:** Actionable; creates urgency.  
**Cons:** Can feel pushy; only relevant when below market.

---

### Option E: Properties list — expand card or tooltip

**What:** On hover or expand, show benchmark. Default view stays clean.

**Pros:** No clutter when collapsed.  
**Cons:** Hidden until interaction; mobile has no hover.

---

## 4. Recommendation

**Primary: Option A (compact line on properties list)**

- Properties list is the main place users scan their portfolio.
- One line per card is enough: "Rent 12% below market" or "Rent 5% above market".
- When no benchmark: show "Refresh benchmark" link (subtle, same size as "Consider updating").
- Keeps the flow: list → detail for full context.

**Secondary: Option C (dashboard "Rent insights")**

- Add a small "Rent vs. market" block on the dashboard when the user has ≥1 property with a fresh benchmark.
- Show up to 3 properties: "123 Main St: 12% below · 456 Oak: 5% above".
- Link each to the property detail.
- If no benchmarks: "Add market benchmarks to see how your rent compares" with link to properties.

---

## 5. Implementation Scope (Option A)

**Properties page** (`app/(app)/properties/page.tsx`):

- Fetch already includes `marketRent` and `marketRentAsOf` (from properties API).
- For each property card, add a line below the metrics grid:
  - If `marketRent` exists and fresh (≤60 days): "Rent X% below market" or "Rent X% above market" or "Rent at market".
  - If stale: "Rent vs. market: updated X days ago" with link to property (where they can refresh).
  - If no benchmark: "Refresh benchmark" linking to property detail (or a small inline refresh — but that costs an API call, so link is safer).

**Styling:** Use `text-muted` and `text-sm` so it doesn't dominate the card.

---

## 6. Implementation Scope (Option C — optional)

**Dashboard** (`app/(app)/dashboard/page.tsx`):

- After the metric cards or before charts, add a "Rent vs. market" section.
- Filter properties with `marketRent != null` and `marketRentAsOf` within 60 days.
- Render: "123 Main St: 12% below market" (link to property).
- If none: "See how your rent compares to market" with link to properties.

---

## 7. Summary

| Option | Effort | Impact | Recommendation |
|--------|--------|--------|----------------|
| A: Properties list line | Low | High | **Do first** |
| B: Badge only | Low | Medium | Alternative to A |
| C: Dashboard section | Medium | Medium | **Do second** |
| D: Banner | Low | Medium | Defer (can feel pushy) |
| E: Hover/expand | Medium | Low | Skip |

---

## 8. References

- [Benchmarking proposal](benchmarking-proposal.md)
- [BenchmarkDisplay component](../app/app/(app)/properties/benchmark-display.tsx)
