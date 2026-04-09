# 20-Property Premium Experience — Phased Implementation

> Dependency order: Phase 1 → Phase 3 → Phase 4. Phase 2 and Phase 5 are fully independent and can run in parallel with any other phase.

---

## Dependency Map

```
Phase 1 (Data)  ──►  Phase 3 (Table)  ──►  Phase 4 (Wiring)
Phase 2 (Chart fixes)  ────────────────────────►  Phase 4 (Wiring)
Phase 5 (Properties page)  ──  standalone, no dependencies
```

**Recommended agent split:**
- Agent A: Phase 1 then Phase 3 (sequential)
- Agent B: Phase 2 (parallel with A)
- Agent C: Phase 4 (after A and B finish)
- Agent D: Phase 5 (parallel with everything)

---

## Phase 1 — Data Foundation

**Depends on:** nothing  
**Blocks:** Phase 3 (needs the new type fields)

### What to build

Extend `buildDashboardTrends` to compute per-property MoM deltas for value and cash flow alongside the existing equity delta.

### Files

- `app/lib/dashboard-trends.ts` — extend type + computation
- `app/lib/dashboard-trends.test.ts` — add test assertions

### Implementation

**`dashboard-trends.ts`:** The `DashboardTrends` type currently has:

```typescript
propertyEquityDeltaMoM: Record<string, number | null>;
```

Add two new fields:

```typescript
propertyValueDeltaMoM: Record<string, number | null>;
propertyCashFlowDeltaMoM: Record<string, number | null>;
```

In `buildDashboardTrends`, the existing `for...of byProperty` loop (lines 77-88) computes `propertyEquityDeltaMoM` using `getDelta(current?.equity, prior?.equity)`. Add the exact same pattern for the two new fields:

```typescript
propertyValueDeltaMoM[propertyId] = getDelta(current?.estimatedValue, prior?.estimatedValue);
propertyCashFlowDeltaMoM[propertyId] = getDelta(current?.monthlyCashFlow, prior?.monthlyCashFlow);
```

Return all three in the return object.

**Critical gotcha — ownership scaling:** `PropertySnapshot.estimatedValue` is stored as the **raw, unscaled** full property value (no ownership percent applied). By contrast, `equity` and `monthlyCashFlow` in the snapshot are already ownership-scaled (written via `computePropertyMetrics`). This means:
- `propertyEquityDeltaMoM` and `propertyCashFlowDeltaMoM` → correct as-is
- `propertyValueDeltaMoM` → raw; must be scaled by `(ownershipPercent ?? 100) / 100` at the **consumption site** in `dashboard/page.tsx`, not here

Do NOT add ownership scaling inside `buildDashboardTrends` — the function has no knowledge of ownershipPercent.

**`dashboard-trends.test.ts`:** The existing two tests check `propertyEquityDeltaMoM`. Add assertions for the two new fields using the same test data already in the file.

### Verification

Run `npx vitest lib/dashboard-trends` — all tests must pass.

---

## Phase 2 — Chart Fixes

**Depends on:** nothing  
**Blocks:** Phase 4 (DashboardCharts needs these fixes before wiring)

Three independent chart-level changes that can be done sequentially by one agent.

### 2A — Debt vs Value Chart: Horizontal Layout

**File:** `app/components/charts/debt-vs-value-chart.tsx`

Currently uses vertical bar layout (`BarChart` without `layout` prop). X-axis labels collide with many properties.

Switch to `layout="vertical"` (horizontal bars, matching the other two charts). In Recharts this means:
- Add `layout="vertical"` to `<BarChart>`
- Swap axes: `<XAxis type="number" tickFormatter={(v) => '$${v / 1000}k'} tick={{ fontSize: 11 }} />` and `<YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />`
- Update `radius` on `<Bar>` elements from `[4, 4, 0, 0]` (top corners for vertical bars) to `[0, 4, 4, 0]` (right corners for horizontal bars)

The two bar series (Value and Debt) remain grouped (not stacked). The legend stays as-is.

### 2B — Dynamic Chart Height

**File:** `app/components/charts/chart-wrapper.tsx`

Currently line 44: `<div className="mt-4 h-[200px] w-full sm:h-[240px]">` — fixed height for all charts.

Add an optional `heightPx` prop:

```typescript
type ChartWrapperProps = {
  // ... existing props
  heightPx?: number;
};
```

In the content div (line 44), when `heightPx` is provided use it: `style={heightPx ? { height: `${heightPx}px` } : undefined}` and keep the Tailwind height classes for when it's not provided. The empty state div (line 40) does NOT need `heightPx` — only the content div does.

The height is computed by the caller (in Phase 4, inside `dashboard-charts.tsx`):
```typescript
const heightPx = visibleData.length <= 8 ? undefined : visibleData.length * 28;
```

### 2C — Chart Color Palette

**Files:**
- `app/app/globals.css`
- `app/components/charts/equity-chart.tsx`
- `app/app/(app)/dashboard/dashboard-charts.tsx`
- `docs/design/design-spec-2026.md`

**`globals.css` — update ALL FOUR color blocks:**

There are four places chart colors are defined. Missing any causes runtime bugs (undefined CSS var = invisible bars for users who've set explicit theme):

1. `:root` block (light defaults, around line 17)
2. `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` block (around line 76)
3. `[data-theme="light"]` explicit override block (around line 100)
4. `[data-theme="dark"]` explicit override block (around line 122)

In every dark block: fix `--chart-3` from its current value (`#34d399` in dark) to a non-green color — it's currently identical to `--positive: #34d399`, making them visually indistinguishable in dark mode. A muted orange or purple works well.

In all four blocks: add `--chart-6` through `--chart-10`. Choose colors that are:
- Perceptually distinct from each other and from the existing 5
- Not green (already `--positive`), red (`--negative`), amber (`--warning`), or indigo (`--accent`)
- Suggested: purple (#a855f7 / #c084fc), pink (#ec4899 / #f472b6), orange (#f97316 / #fb923c), rose (#e11d48 / #fb7185), warm yellow (#eab308 / #facc15)

Also update the `@theme inline` block (lines 131-154) — add:
```css
--color-chart-6: var(--chart-6);
--color-chart-7: var(--chart-7);
--color-chart-8: var(--chart-8);
--color-chart-9: var(--chart-9);
--color-chart-10: var(--chart-10);
```
Without this, Tailwind utilities `bg-chart-6`, `text-chart-6` etc. won't work.

**`equity-chart.tsx`:** Extend `CHART_COLORS` array (line 22) from 5 to 10:

```typescript
const CHART_COLORS = [
  "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)",
  "var(--chart-6)", "var(--chart-7)", "var(--chart-8)", "var(--chart-9)", "var(--chart-10)",
];
```

**`dashboard-charts.tsx` — `InlineValueBar` fix:** Lines 97 and 118 use `var(--chart-3)` for the equity segment and its legend swatch in the single-property "Property at a glance" view. Here the color IS semantically meaningful (equity = green = positive). Changing `--chart-3` to non-green would make the equity bar the wrong color. Fix both occurrences to use `var(--positive)` directly instead of `var(--chart-3)`.

**`design-spec-2026.md`:** Update Section 2.2 color token table to document the fixed `--chart-3` dark values and add `--chart-6` through `--chart-10` with their hex values for both light and dark mode.

### Verification

Visually test charts in light and dark mode with 10+ properties. Confirm:
- Debt vs value chart shows horizontal bars with no label collision
- Charts expand vertically when many bars
- No two adjacent bars have the same color with 10 or fewer bars
- Single-property equity bar in "Property at a glance" is still green

---

## Phase 3 — PropertyPerformanceTable

**Depends on:** Phase 1 (needs `propertyValueDeltaMoM` and `propertyCashFlowDeltaMoM` types)  
**Blocks:** Phase 4 (wiring imports this component)

### What to build

New client component: `app/app/(app)/dashboard/property-performance-table.tsx`

A sortable, filterable table showing all properties with key metrics and MoM delta indicators.

### Props interface

```typescript
type PropertyTableRow = {
  id: string;
  name: string;          // nickname || addressLine1
  addressLine1: string;
  updatedAt: Date;
  // Metrics (from perPropertyMetrics, already computed)
  value: number;         // estimatedValue * (ownershipPercent / 100)
  equity: number;
  monthlyCashFlow: number;
  capRate: number | null;
  // Deltas (keyed by property id, from trends -- value delta already scaled by ownership)
  valueDeltaMoM: number | null;
  equityDeltaMoM: number | null;
  cashFlowDeltaMoM: number | null;
  // Benchmark
  isRented: boolean;
  userRent: number;
  marketRent: number | null;
  marketRentAsOf: Date | string | null;
  // Attention flags
  noMortgage: boolean;
  benchmarkStale: boolean;
  negativeCashFlow: boolean;
  incompleteProfile: boolean;
  needsAttention: boolean;
};

type PropertyPerformanceTableProps = {
  rows: PropertyTableRow[];
};
```

### Columns

| Column | Value | Sort |
|---|---|---|
| Property | `name` (bold) + `addressLine1` (muted, smaller) | — |
| Value | `formatCurrency(value)` + delta indicator | by value, by delta |
| Equity | `formatCurrency(equity)` + delta indicator | by equity, by delta |
| Cash flow | `formatCurrency(monthlyCashFlow)`, color-coded | by CF, by delta |
| Cap rate | `(capRate * 100).toFixed(2)%` or `—` | numeric |
| Rent vs market | `getBenchmarkLabel(userRent, marketRent)` or status text | — |
| Status | `InsightTag` components for each active flag | — |
| Updated | `formatTimeAgo(updatedAt)` | date |

### Delta indicator pattern

Inline next to each currency value: `$142K (+$3.8K)` where:
- Delta positive → `text-positive`
- Delta negative → `text-negative`
- Delta zero or null → omit indicator entirely (no visual noise)

Same visual language as `MetricCard` delta labels already on the dashboard.

### Sort behavior

State: `{ column: SortColumn; direction: 'asc' | 'desc'; mode: 'value' | 'delta' }`

- Default: `{ column: 'cashFlow', direction: 'asc', mode: 'value' }` (worst cash flow first)
- Click column header → sort by that column value; click again → reverse direction
- Clicking the delta indicator for a column switches `mode` to `'delta'`
- When `mode === 'delta'`: rows with `null` delta sort to the **bottom** regardless of direction
- Active sort column shows a chevron icon (up/down)

### Filter chips

Client-state (not URL params). Five chips: All, Needs attention, Negative cash flow, Stale benchmark, Incomplete profile.

Active chip filters `rows` before sorting. Use the pre-computed boolean flags on each row (no re-computation needed).

### Mobile layout

Use responsive Tailwind classes — NOT `useIsMobile` — to avoid SSR hydration flash. The full table (`<table>`) is `hidden md:table`. A compact card-row list is `md:hidden`.

Each compact card-row:
```
[Property Name]          [$1,200/mo CF (+$50)] [!]
123 Main St · Updated 2d ago
```

- Full row is tappable (`<Link href="/properties/[id]">`)
- Primary metric shown = the active sort column's value + delta
- `min-h-[44px]` on every row (touch target rule, design spec §16.7)
- `⚠` attention indicator shown when `needsAttention === true`

`useIsMobile` is reserved only for logic that cannot be expressed with CSS (e.g. the Top N threshold for the Charts tab in Phase 4 — 5 on mobile vs 8 on desktop).

### Row click

Wrap each row in `<Link href={`/properties/${row.id}`}>` for both desktop table rows and mobile compact rows.

### Import dependencies

- `formatCurrency` from `@/lib/format-currency`
- `formatTimeAgo` from `@/lib/date-utils`
- `getBenchmarkLabel`, `getBenchmarkEligibility` from `@/lib/benchmark-utils`
- `useIsMobile` from `@/lib/use-is-mobile` (for Top N default in Charts tab — Phase 4 concern, not needed in the table itself)

### Verification

Build a dev test by temporarily wiring the table into the dashboard with hard-coded mock data for 20 properties. Confirm:
- Sort works for all columns including delta mode
- Null deltas go to bottom when sorting by delta
- Filter chips reduce visible rows
- Mobile compact view shows correctly
- Row click navigates

---

## Phase 4 — Adaptive Dashboard Wiring

**Depends on:** Phase 1, Phase 2, Phase 3 all complete  
**Blocks:** nothing (final phase for the dashboard)

### What to build

1. Refactor `dashboard/page.tsx` (single-pass metrics + conditional structure)
2. New `dashboard/portfolio-overview-section.tsx` (outer tab wrapper)
3. New `dashboard/benchmark-auto-refresh.tsx` (invisible side-effect component)
4. Add `containerless` prop to `dashboard-charts.tsx`
5. Add Top N slicing + expand/collapse to `dashboard-charts.tsx`

### 4A — `dashboard/page.tsx` refactor

**Single-pass metrics (required — currently `computePropertyMetrics` is called 3x per property):**

Replace the three separate `.map()` calls that each call `computePropertyMetrics` with a single pass:

```typescript
const perPropertyMetrics = portfolioInput.map((p) => ({
  id: p.id,
  ...computePropertyMetrics(p, displayMode),
}));
```

Then rebuild `chartData` from `perPropertyMetrics` instead of calling `computePropertyMetrics` again:

```typescript
const chartData: DashboardChartData = {
  equity: perPropertyMetrics.map((m) => ({
    name: portfolioInput.find(p => p.id === m.id)!.name,
    equity: m.equity,
    propertyId: m.id,
  })),
  // ... same for debtVsValue and cashFlow
};
```

**Attention flags per property:** Using the raw `properties` array (which has all DB fields), compute flags in the same loop — matching the logic from `properties/page.tsx` lines 219-252:

```typescript
const perPropertyAttentionFlags = properties.map((p) => {
  const metrics = perPropertyMetrics.find(m => m.id === p.id)!;
  const benchmarkEligibility = getBenchmarkEligibility({ ... });
  const benchmarkStale = benchmarkEligibility === 'benchmark_missing' || benchmarkEligibility === 'benchmark_stale';
  const noMortgage = p.mortgages.length === 0;
  const negativeCashFlow = metrics.monthlyCashFlow < 0;
  const completeness = getPropertyCompleteness({ purchasePrice: Number(p.purchasePrice), ... });
  const incompleteProfile = !completeness.isComplete;
  return { id: p.id, noMortgage, benchmarkStale, negativeCashFlow, incompleteProfile, needsAttention: noMortgage || benchmarkStale || negativeCashFlow || incompleteProfile };
});
```

**`propertyValueDeltaMoM` ownership scaling:** After computing `trends`, scale the value deltas before passing to the table:

```typescript
const scaledValueDeltas: Record<string, number | null> = {};
for (const p of properties) {
  const raw = trends.propertyValueDeltaMoM[p.id] ?? null;
  const scale = (p.ownershipPercent ?? 100) / 100;
  scaledValueDeltas[p.id] = raw != null ? raw * scale : null;
}
```

Pass `scaledValueDeltas` (not `trends.propertyValueDeltaMoM` directly) to the table.

**Conditional restructuring:** `DashboardCharts` currently renders unconditionally (no condition wraps it). Replace the current:

```tsx
{metrics.propertyCount > 1 && <RentVsMarketSection ... />}
<DashboardCharts ... />
```

with:

```tsx
{metrics.propertyCount >= 6 ? (
  <PortfolioOverviewSection
    rows={tableRows}
    chartData={chartData}
    propertyCount={metrics.propertyCount}
  />
) : (
  <>
    {metrics.propertyCount > 1 && <RentVsMarketSection ... />}
    <DashboardCharts ... />
  </>
)}
```

Build `tableRows: PropertyTableRow[]` by zipping `properties`, `perPropertyMetrics`, `perPropertyAttentionFlags`, and the scaled deltas.

### 4B — `dashboard/portfolio-overview-section.tsx`

New client component. Holds the outer "Properties / Charts" tab state.

```typescript
'use client';
// Tab state: 'properties' | 'charts'
// Renders panel chrome: rounded-xl border border-border bg-card shadow-sm
// Header: border-b border-border px-5 py-4 with two ChartTabButton components
// 'Properties' tab: <BenchmarkAutoRefresh rows={rows} /> then <PropertyPerformanceTable rows={rows} />
// 'Charts' tab: <DashboardCharts data={chartData} propertyCount={propertyCount} containerless />
```

Panel chrome: `rounded-xl border border-border bg-card shadow-sm` (matching Section 13.9).
Tab buttons: same style as existing `ChartTabButton` in `dashboard-charts.tsx` — define a local copy or extract it to a shared location.

### 4C — `dashboard/benchmark-auto-refresh.tsx`

Invisible component (renders `null`). Extracted from `RentVsMarketSection`. Fires auto-refresh of up to 3 stale benchmarks on mount.

Copy the `useEffect` logic from `rent-vs-market-section.tsx` lines 83-123 exactly:
- Same `hasTriggeredRefreshes` ref guard (prevents re-firing on re-render)
- Same `computeBenchmarkDashboardPartition` + `cappedRefreshCandidates` logic
- Same `fetch('/api/properties/[id]/benchmark/refresh', { method: 'POST' })` calls
- Same `router.refresh()` after any successful refresh
- No UI, returns `null`

Input prop: `properties: BenchmarkDashboardPropertyInput[]` (same type used by `computeBenchmarkDashboardPartition` in `lib/benchmark-dashboard-utils.ts`).

**Critical:** Preserve the `hasTriggeredRefreshes.current` ref guard. Without it, the effect re-fires on every render because `cappedRefreshCandidates` is a new array reference each time.

### 4D — `dashboard-charts.tsx`: `containerless` prop

Add `containerless?: boolean` to `DashboardCharts` props. In the multi-property render path (line 327):

```tsx
// Currently:
return (
  <div className="mt-8">
    <div className="rounded-xl border border-border bg-card shadow-sm">
      ...header + content...
    </div>
  </div>
);

// With containerless:
if (containerless) {
  return (
    <>
      ...header strip + content only, no outer divs...
    </>
  );
}
return (
  <div className="mt-8">
    <div className="rounded-xl border border-border bg-card shadow-sm">
      ...
    </div>
  </div>
);
```

This satisfies design spec §16.3 ("Do not nest a Panel inside a Panel") — `PortfolioOverviewSection` provides the panel chrome, `DashboardCharts` inside the Charts tab should not add its own.

The single-property path (at-a-glance view, lines 151-315) is NOT affected by `containerless` — it's only for the multi-property charts panel.

### 4E — `dashboard-charts.tsx`: Top N slicing

Add inside `DashboardCharts` (multi-property path). Per-chart expand state: `expandedCharts: Set<'equity' | 'debt_vs_value' | 'cash_flow'>`.

For each chart dataset, when `data.length > 8`:
- Sort the data per-chart (equity: highest equity first; cash flow: lowest cash flow first; debt vs value: highest value first)
- Default slice: `isMobile ? 5 : 8` (use `useIsMobile()` here — this is JS logic, not layout)
- When chart is in `expandedCharts`: show all rows
- Show "Show all N" button below chart when sliced
- Show "Show less" button when expanded
- Pass `heightPx` to `ChartWrapper` (from Phase 2B): `visibleData.length <= 8 ? undefined : visibleData.length * 28`

When `data.length <= 8`: no slicing, no button, no height override (no change for small portfolios).

### Verification

Test with the Pro tier seed data (6+ properties). Confirm:
- 1-property view: "Property at a glance" unchanged
- 2-5 properties: charts + rent vs market unchanged
- 6+ properties: table shows with "Properties" tab active by default
- Charts tab: charts render without nested panel chrome
- Charts tab: Top N slicing shows expand button when data > 8
- BenchmarkAutoRefresh fires on mount (check network tab for benchmark refresh calls)

---

## Phase 5 — Properties Page Mobile Progressive Disclosure

**Depends on:** nothing (fully independent)  
**Blocks:** nothing

### What to build

For mobile users with 10+ properties and no active filter, show only the first 6 property cards with a "Show all N properties" button.

### Files

- `app/app/(app)/properties/page.tsx` — compute `isMobileDisclosureEligible`, pass cards to wrapper
- New: `app/app/(app)/properties/properties-card-grid.tsx` — thin client wrapper

### `properties-card-grid.tsx`

```typescript
'use client';
// Props: cards: ReactNode[]; totalCount: number; isMobileDisclosureEligible: boolean
// State: expanded = false
// useEffect: if (!isMobile) setExpanded(true)  ← expands to full list on desktop after hydration
// Render: isMobileDisclosureEligible && !expanded ? cards.slice(0, 6) + button : cards
```

**Hydration strategy — initialize collapsed:** `expanded` defaults to `false`. SSR renders 6 cards for all viewports. After hydration:
- Desktop: `useEffect` sets `expanded = true` (brief additive expand — far less jarring than removal)
- Mobile: stays at 6

This prevents the "cards disappearing" flash that would occur if `expanded` defaulted to `true` and the component collapsed after hydration on mobile.

### `properties/page.tsx`

Compute server-side:

```typescript
const isMobileDisclosureEligible = activeFilter === 'all' && visibleCards.length >= 10;
```

Replace the `<ul className="grid ...">` at line 552 with `<PropertiesCardGrid cards={renderedCards} totalCount={visibleCards.length} isMobileDisclosureEligible={isMobileDisclosureEligible} />`.

Pass the rendered card elements (the `<li>` items) as children/array to the wrapper so the server still does all the rendering.

### Verification

Test on mobile viewport (or DevTools) with 10+ properties, no filter active:
- Only 6 cards shown initially
- "Show all N properties" button visible
- Clicking expands to all cards
- Desktop shows all cards immediately (no button)
- With any filter active: all matching cards shown regardless of count
