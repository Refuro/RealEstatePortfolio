# Mobile Redesign: Eliminating Card-itis

> **Status:** Plan complete, ready for implementation
> **Author:** Claude Opus 4.6 (planning) | **Executor:** Composer 2 Fast (recommended)
> **Date:** April 6, 2026
> **Scope:** Mobile-only (< 768px). Desktop layouts are frozen.

---

## Table of Contents

1. [Research Synthesis](#1-research-synthesis)
2. [The Core Shift](#2-the-core-shift)
3. [New Design Primitives](#3-new-design-primitives)
4. [Screen-by-Screen Specs](#4-screen-by-screen-specs)
5. [Migration Plan](#5-migration-plan)
6. [Updated Design Rules](#6-updated-design-rules)
7. [File Index](#7-file-index)
8. [Task Checklist](#8-task-checklist)

---

## 1. Research Synthesis

### Linear Mobile
Linear displays dense structured data with **zero card containers**. Sections are separated by full-bleed `1px` divider lines. Hierarchy comes entirely from typographic contrast: bold 15px section titles vs. 13px body text vs. 11px metadata. Items within a list use `border-t` dividers, not individual wrappers. The page background is uniform — grouping is communicated via whitespace gaps (24px between sections, 8px between items).

**Key pattern:** Dividers + typography scale = structure. No containers needed.

### Robinhood / Monarch Money
Hero metrics sit at the top in **large type (24-32px), full-bleed, no container**. Secondary metrics display as a horizontal row of label/value pairs separated by thin vertical dividers or equal spacing — critically, **not individually carded**. The entire metric row may sit on a subtle background band, but there are no per-metric borders. Sections below use the list-row pattern: label left, value right, `border-t` between rows. Charts are full-bleed within their section.

**Key pattern:** One shared surface for grouped metrics, not one card per metric. Vertical dividers or spacing separate values.

### Apple Settings / Health (iOS 17+)
The UITableView inset grouped style is the gold standard:

- **Page background:** neutral gray (`bg-background`)
- **Section groups:** white rounded containers (`rounded-xl bg-card`) — one container per logical section
- **Rows within a section:** separated by inset `border-t` dividers (not full-width)
- **Section headers:** `text-xs uppercase text-muted` above the group container
- **Section footers:** `text-xs text-muted` below the group container
- **No nesting** — a section group never contains another section group

Apple Health summary: large headline numbers displayed in a single shared card, not individually wrapped.

**Key pattern:** Section-level container only. Rows use dividers. No nested containers ever.

### Notion Mobile
Nested content uses **indentation + dividers**, not nested borders. Toggle blocks (collapsibles) are a simple chevron + text trigger with no card wrapper. The expanded content sits at the same level, indented or at the same indent with a subtle left border. Full-bleed sections with consistent spacing rhythm.

**Key pattern:** Collapsibles need no card wrapper. Indentation and left-border accents communicate hierarchy.

### Stripe Dashboard Mobile
Section headers are bold text with generous top margin — no card container around the header. Data rows below are full-bleed with `border-t` separators. Metric summaries display as a compact grid within a single surface. The overall page is a flat scrolling document, not a stack of cards.

**Key pattern:** Sections are document flow, not card stacks. One surface per data grouping.

### Modern React Native / Expo 2025
The industry shift is from `View` with `borderWidth` (card-per-item) to **spacing-as-structure**. Background color shifts (`bg-subtle` zones vs. `bg-background` zones) replace card boundaries. Consistent 8px vertical rhythm grid. Sections separated by 24px+ gaps, items within by 8px gaps or thin dividers.

**Key pattern:** Spacing and color bands replace explicit borders.

---

## 2. The Core Shift

**Before:** Every piece of information gets its own bordered, shadowed, rounded container, nested three levels deep.

**After:** The page is a scrolling document. Sections are grouped by a single shared surface (`rounded-xl bg-card`) or by dividers against the page background. Metrics share one surface. Nesting is communicated by typography and spacing, never by nested card borders.

In one sentence: **Card containers move from per-item to per-section, and the outer shell card disappears entirely.**

### Visual Architecture

```
CURRENT (3-level nesting):
┌─────────────────────────── MobileToolShell ───────────────────────────┐
│  rounded-[28px] border border-border/70 bg-card/95 shadow-sm         │
│  ┌──────────┐ ┌──────────┐                                           │
│  │ Metric 1 │ │ Metric 2 │  ← MobileSummaryRail (per-item cards)     │
│  │ rounded  │ │ rounded  │                                           │
│  │ border   │ │ border   │                                           │
│  └──────────┘ └──────────┘                                           │
│  ┌──────────────────── MobileSectionCard ──────────────────────┐     │
│  │  rounded-2xl border shadow-sm                                │     │
│  │  ┌──────────── MobileSectionCard subtle ────────────┐       │     │
│  │  │  rounded-2xl bg-background/35                     │       │     │
│  │  │  [input fields]                                   │       │     │
│  │  └──────────────────────────────────────────────────┘       │     │
│  └──────────────────────────────────────────────────────────────┘     │
└───────────────────────────────────────────────────────────────────────┘

PROPOSED (flat document flow):
── MobileToolShell (full bleed, no card) ───
  Eyebrow · Title
  ─────────────── border-b ───────────────
  ┌─ MobileStatStrip (ONE shared card) ──┐
  │  Metric 1     Metric 2               │
  │  Metric 3     Metric 4               │  ← rounded-xl bg-card p-4
  └──────────────────────────────────────┘
  Section title
  ┌─ MobilePageSection grouped ──────────┐
  │  Form group label                     │
  │  [input fields]                       │  ← rounded-xl bg-card
  │  ──────── border-t ────────          │
  │  Form group label                     │
  │  [input fields]                       │
  └──────────────────────────────────────┘
  ──────── border-t (flat section) ────────
  Chart section title
  [chart, full bleed]
```

---

## 3. New Design Primitives

### A. MobileToolShell (modified — not new)

**File:** `app/components/mobile-tool-shell.tsx`

Current outer wrapper:
```tsx
<div className="overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-sm md:hidden">
```

**Proposed outer wrapper:**
```tsx
<div className="space-y-4 pb-6 md:hidden">
```

Full-bleed. No card. No border. No shadow. No border-radius. The page `bg-background` shows through. The shell becomes a layout orchestrator, not a visual container.

**Header section** — currently `space-y-4 border-b border-border/70 p-4`:
```tsx
<div className="border-b border-border px-4 pb-4">
```

**Content section** — currently `p-3`:
```tsx
<div className="px-4">
```

**Footer** — currently `border-t border-border/70 px-4 pt-4 pb-6`:
```tsx
<div className="border-t border-border px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
```

**API surface:** No breaking changes. Same props. `summaryItems` still passed, but now rendered via `MobileStatStrip` internally instead of `MobileSummaryRail`.

### B. MobileStatStrip (new — replaces MobileSummaryRail)

**File:** `app/components/mobile-stat-strip.tsx` (new)

```typescript
type MobileStatItem = {
  label: string;
  value: string;
  tone?: "default" | "positive" | "warning" | "negative";
  helper?: string;
};

type MobileStatStripProps = {
  items: MobileStatItem[];
  columns?: 2 | 3;
};
```

**Render:**
```tsx
<div className="rounded-xl bg-card p-4">
  <div className={`grid gap-4 ${columns === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
    {items.map((item) => (
      <div key={item.label}>
        <p className="text-[11px] font-medium text-muted">{item.label}</p>
        <p className={`mt-0.5 text-base font-semibold tabular-nums ${toneClass[item.tone ?? "default"]}`}>
          {item.value}
        </p>
        {item.helper ? <p className="mt-0.5 text-[11px] text-muted">{item.helper}</p> : null}
      </div>
    ))}
  </div>
</div>
```

**Key differences from MobileSummaryRail:**
- ONE shared `rounded-xl bg-card` container, not per-item cards
- No per-item borders or shadows
- No `border-border/70` or `bg-background/75` on items
- Slightly more generous padding (p-4 vs. px-3 py-2.5)
- Uses `font-medium` not `font-semibold` on labels (lighter)
- Adds `tabular-nums` on values

### C. MobilePageSection (new — replaces MobileSectionCard for most uses)

**File:** `app/components/mobile-page-section.tsx` (new)

```typescript
type MobilePageSectionProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "grouped" | "flat";
  className?: string;
};
```

Two variants:

**`grouped` (default)** — iOS inset grouped table style:
```tsx
<section className={className}>
  {title && (
    <p className="mb-2 px-1 text-xs font-medium text-muted">{title}</p>
  )}
  <div className="rounded-xl bg-card">
    {children}
  </div>
  {subtitle && (
    <p className="mt-2 px-1 text-xs text-muted">{subtitle}</p>
  )}
</section>
```

**`flat`** — divider-separated (for content areas, results, etc.):
```tsx
<section className={`border-t border-border pt-4 ${className ?? ""}`}>
  {title && (
    <p className="mb-3 text-sm font-semibold text-foreground">{title}</p>
  )}
  {children}
  {subtitle && (
    <p className="mt-2 text-xs text-muted">{subtitle}</p>
  )}
</section>
```

### D. MobileListRow (new — for key/value rows within grouped sections)

**File:** `app/components/mobile-list-row.tsx` (new)

```typescript
type MobileListRowProps = {
  label: string;
  value: React.ReactNode;
  helper?: string;
  first?: boolean;
};
```

**Render:**
```tsx
<div className={`flex items-center justify-between gap-3 px-4 py-3 ${!first ? "border-t border-border" : ""}`}>
  <div className="min-w-0">
    <p className="text-sm text-muted">{label}</p>
    {helper && <p className="text-[11px] text-muted">{helper}</p>}
  </div>
  <div className="shrink-0 text-right">
    <span className="text-sm font-medium tabular-nums text-foreground">{value}</span>
  </div>
</div>
```

Touch target: the row itself is `py-3` giving 44px+ height at standard font size. For interactive rows, wrap in a button with `min-h-[44px]`.

### E. MobileFormGroup (new — for input groupings, replaces nested subtle cards)

**File:** `app/components/mobile-form-group.tsx` (new)

```typescript
type MobileFormGroupProps = {
  label?: string;
  children: React.ReactNode;
  className?: string;
};
```

**Render:**
```tsx
<div className={className}>
  {label && (
    <p className="mb-2 text-[11px] font-medium text-muted">{label}</p>
  )}
  <div className="space-y-3">
    {children}
  </div>
</div>
```

No card. No border. No shadow. No radius. Just a label and vertical spacing. This replaces `<MobileSectionCard tone="subtle">` throughout the codebase.

---

## 4. Screen-by-Screen Specs

### A. MobileToolShell

**File:** `app/components/mobile-tool-shell.tsx`

| Aspect | Current | Proposed |
|--------|---------|----------|
| Outer wrapper | `rounded-[28px] border border-border/70 bg-card/95 shadow-sm` | `space-y-4 pb-6` (full bleed) |
| Header | `space-y-4 border-b border-border/70 p-4` | `border-b border-border px-4 pb-4` |
| Summary rail | `MobileSummaryRail` (per-item cards) | `MobileStatStrip` (shared surface) |
| Content area | `p-3` > `px-1 pb-1` | `px-4 pt-4` |
| Footer | `border-t border-border/70 px-4 pt-4 pb-6` | `border-t border-border px-4 pt-4 pb-safe` |

Token fixes:
- `border-border/70` → `border-border` (three occurrences)
- `bg-card/95` → removed entirely (no bg on outer shell)

### B. MobileSummaryRail → MobileStatStrip

**File:** `app/components/mobile-summary-rail.tsx` (deprecated) + new `app/components/mobile-stat-strip.tsx`

| Aspect | Current (MobileSummaryRail) | Proposed (MobileStatStrip) |
|--------|---------------------------|---------------------------|
| Container | None (grid only) | `rounded-xl bg-card p-4` |
| Per-item wrapper | `rounded-2xl border border-border/70 bg-background/75 px-3 py-2.5` | None (bare div) |
| Label | `text-[11px] font-semibold uppercase tracking-wide text-muted` | `text-[11px] font-medium text-muted` (no uppercase, no tracking-wide per L5 rule) |
| Value | `text-base font-semibold` | `text-base font-semibold tabular-nums` |

The MobileSummaryRail file stays for backward compat but MobileToolShell switches to importing MobileStatStrip.

### C. MobileSectionCard → MobilePageSection / removed

**File:** `app/components/mobile-section-card.tsx`

| Current tone | Current classes | Replacement |
|-------------|----------------|-------------|
| `"surface"` | `rounded-2xl border border-border/70 bg-background/55 p-4 shadow-sm` | `MobilePageSection variant="grouped"` — one `rounded-xl bg-card` per section |
| `"subtle"` | `rounded-2xl bg-background/35 p-3.5` | `MobileFormGroup` — no container, just label + spacing |
| `"plain"` | empty string | Remove wrapper entirely |

`MobileSectionCard` stays in the codebase (deprecation comment) for any remaining consumers but no new uses.

### D. Modeling Page (mobile)

**File:** `app/app/(app)/properties/[id]/projections-tab-content.tsx` — lines ~1059-1298

**Current structure:**
```
MobileToolShell (card) →
  MobileSectionCard "Scenario setup" →
    MobileSectionCard subtle "Horizon and risk" (inputs)
    MobileSectionCard subtle "Growth assumptions" (inputs)
    MobileCollapsible →
      MobileSectionCard subtle "Debt strategy" (inputs)
      MobileSectionCard subtle "Exit assumptions" (inputs)
  MobileSectionCard subtle "Projection chart" (collapsible)
  MobileSectionCard subtle "Advanced breakdown" (collapsible)
  MobileSectionCard subtle "Baseline notes" (collapsible)
```

**Proposed structure:**
```
MobileToolShell (full bleed) →
  MobileStatStrip [Equity Y10, Cash Flow Y10, IRR, Cash-on-Cash] →
  MobilePageSection grouped title="Scenario setup" →
    Preset selector row →
    border-t divider →
    MobileFormGroup label="Horizon and risk" →
      input fields
    border-t divider →
    MobileFormGroup label="Growth assumptions" →
      input fields
    MobileCollapsible "Debt & exit" →
      MobileFormGroup label="Debt strategy" →
        input fields
      MobileFormGroup label="Exit assumptions" →
        input fields
  MobilePageSection flat title="Projection chart" →
    chart (full bleed within padding)
  MobilePageSection flat title="Advanced breakdown" →
    collapsible content
  MobilePageSection flat title="Baseline notes" →
    collapsible content
```

All the nested `MobileSectionCard` inside `MobileSectionCard` are eliminated. The scenario setup section is ONE `rounded-xl bg-card` container. Input groups within it use `MobileFormGroup` (no card) with `border-t border-border` dividers between groups. Charts and notes use `flat` variant (divider separated).

### E. Mortgage Page (mobile)

**File:** `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` — lines ~839-993

**Current structure:**
```
MobileToolShell (card) →
  MobileSectionCard "Payoff strategy" →
    MobileSectionCard subtle "Mortgage and payment" (display data)
    MobileSectionCard subtle "Pay off earlier" (inputs)
  MobileSectionCard subtle "Balance projection" (collapsible chart)
  MobileSectionCard subtle "How this estimate works" (collapsible text)
```

**Proposed structure:**
```
MobileToolShell (full bleed) →
  MobileStatStrip [Baseline payoff, Payoff delta, Interest saved, P&I] →
  MobilePageSection grouped title="Payoff strategy" →
    Mortgage selector row →
    border-t →
    MobileFormGroup label="Mortgage and payment" →
      MobileListRow "Rate" / "4.50%"
      MobileListRow "Remaining term" / "27 years"
      MobileListRow "P&I payment" / "$1,234/mo"
    border-t →
    MobileFormGroup label="Pay off earlier" →
      Extra payment input
      Payoff target chips
  MobilePageSection flat →
    MobileCollapsible "Balance projection" →
      chart
  MobilePageSection flat →
    MobileCollapsible "How this estimate works" →
      notes
```

Mortgage details use `MobileListRow` for the label/value display (rate, term, payment) — the Robinhood pattern for financial data.

### F. Deal Analyzer (mobile)

**File:** `app/app/(app)/analyze/deal-analyzer-form.tsx` — lines ~526-932, ~1040-1057

**Current structure:**
```
MobileToolShell (card) with modes →
  mobileInputsSurface:
    MobileSectionCard "Deal assumptions" →
      MobileSectionCard subtle "Basics" (address + price inputs)
      MobileSectionCard subtle "Income and expenses" (rent/expense inputs)
      MobileSectionCard subtle → MobileCollapsible "Debt and ownership"
  mobileResultsSurface:
    DealPortfolioCompareBlock (MobileSectionCard)
    MobileSectionCard "Quick summary" (headline metrics)
    MobileSectionCard subtle → MobileCollapsible "Stress test"
    MobileSectionCard subtle → MobileCollapsible "Full metrics"
```

**Proposed structure:**
```
MobileToolShell (full bleed) with modes →
  MobileStatStrip [Monthly CF, Cap Rate, CoC Return, DSCR] →
  Inputs mode:
    MobilePageSection grouped title="Deal assumptions" →
      MobileFormGroup label="Basics" →
        address autocomplete, price, value inputs
      border-t →
      MobileFormGroup label="Income and expenses" →
        rent, expense inputs
      border-t →
      MobileCollapsible "Debt and ownership" →
        ownership, mortgage inputs
  Results mode:
    DealPortfolioCompareBlock (use MobilePageSection grouped internally)
    MobilePageSection grouped title="Quick summary" →
      headline metric + verdict
    MobilePageSection flat →
      MobileCollapsible "Stress test" → content
    MobilePageSection flat →
      MobileCollapsible "Full metrics" → PropertyMetricsSection
```

The Deal Analyzer inputs transform from a card-inside-card form to an iOS Settings-style grouped list. Input groups within the single card are separated by `border-t` dividers. Results use `MobilePageSection` instead of `MobileSectionCard`.

### G. Property Detail Tabs (Overview, Details)

**File:** `app/app/(app)/properties/[id]/overview-tab-content.tsx`

This page is already lighter (no MobileToolShell). The main change:

- "Performance at a glance" section (line 93-141): currently `rounded-xl border border-border bg-card shadow-sm` with inner `rounded-md bg-subtle/30` metric boxes — this is already close to correct (one section card, inset metric items). **Keep as-is.**
- `MobileCollapsible` "Supporting metrics" (line 182): already correct. **Keep as-is.**
- Completeness prompt (line 55-69): uses `rounded-lg bg-subtle/40` — correct Inset pattern. **Keep as-is.**

**No changes needed** for overview-tab-content.tsx. It already avoids card-itis.

**File:** `app/app/(app)/properties/[id]/property-detail-tabs.tsx`

Tab navigation is already clean: `sticky top-14 z-10 border-b border-border bg-background`. **No changes needed.**

### H. Refinance Page (mobile)

**File:** `app/app/(app)/refinance/refinance-workspace.tsx` — lines ~627-639

**Current:**
```tsx
<MobileToolShell ...>
  <MobileSectionCard>
    {inputsSection}
    {metricsBlock}
  </MobileSectionCard>
  <MobileCollapsible label="Balance comparison">{chartSection}</MobileCollapsible>
</MobileToolShell>
```

**Proposed:**
```tsx
<MobileToolShell ...>
  <MobilePageSection variant="grouped">
    {inputsSection}
    <div className="border-t border-border" />
    {metricsBlock}
  </MobilePageSection>
  <MobilePageSection variant="flat">
    <MobileCollapsible label="Balance comparison">{chartSection}</MobileCollapsible>
  </MobilePageSection>
</MobileToolShell>
```

### I. Marketing Calculators

**Files:**
- `app/components/marketing/public-calculator.tsx`
- `app/components/marketing/fix-and-flip-calculator.tsx`
- `app/components/marketing/str-ltr-calculator.tsx`
- `app/components/marketing/brrr-calculator.tsx`

Same pattern as Deal Analyzer: replace nested `MobileSectionCard` with `MobilePageSection` grouped + `MobileFormGroup`. The shell changes propagate automatically since they use `MobileToolShell`.

---

## 5. Migration Plan

### Phase 0: Create new primitives (no consumers break)

1. Create `app/components/mobile-stat-strip.tsx` with `MobileStatStrip`
2. Create `app/components/mobile-page-section.tsx` with `MobilePageSection`
3. Create `app/components/mobile-list-row.tsx` with `MobileListRow`
4. Create `app/components/mobile-form-group.tsx` with `MobileFormGroup`

### Phase 1: Modify MobileToolShell (all consumers update at once)

5. In `app/components/mobile-tool-shell.tsx`:
   - Replace outer `div` classes: `overflow-hidden rounded-[28px] border border-border/70 bg-card/95 shadow-sm md:hidden` → `space-y-4 pb-6 md:hidden`
   - Replace header `div` classes: `space-y-4 border-b border-border/70 p-4` → `border-b border-border px-4 pb-4`
   - Switch import from `MobileSummaryRail` to `MobileStatStrip`
   - Replace content area classes: remove the `p-3` wrapper, use `px-4 pt-4`
   - Replace footer classes: `border-t border-border/70 px-4 pt-4 pb-6` → `border-t border-border px-4 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]`
6. Update `app/components/mobile-tool-shell.test.tsx` to match new class assertions.

### Phase 2: Migrate screens (highest visual impact first)

7. **Deal Analyzer** (`app/app/(app)/analyze/deal-analyzer-form.tsx`):
   - Replace all `<MobileSectionCard>` in `mobileInputsSurface` with `MobilePageSection` + `MobileFormGroup`
   - Replace all `<MobileSectionCard>` in `mobileResultsSurface` with `MobilePageSection`
   - Replace `<MobileSectionCard tone="subtle">` wrapping collapsibles with plain divs
   - Update `DealPortfolioCompareBlock` to use `MobilePageSection` instead of `MobileSectionCard`

8. **Modeling** (`app/app/(app)/properties/[id]/projections-tab-content.tsx`):
   - Replace nested `MobileSectionCard` in `mobileModelingSurface` with `MobilePageSection` + `MobileFormGroup` + `border-t` dividers
   - Chart and notes sections become `MobilePageSection variant="flat"`

9. **Mortgage** (`app/app/(app)/properties/[id]/mortgage-tab-content.tsx`):
   - Replace nested `MobileSectionCard` in `mobileMortgageSurface` with `MobilePageSection` + `MobileFormGroup` + `MobileListRow`
   - Chart and notes sections become `MobilePageSection variant="flat"`

10. **Refinance** (`app/app/(app)/refinance/refinance-workspace.tsx`):
    - Replace `MobileSectionCard` with `MobilePageSection variant="grouped"`

11. **Marketing calculators** (all four files):
    - Same nested-card elimination as Deal Analyzer

### Phase 3: Cleanup

12. Add deprecation comment to `app/components/mobile-section-card.tsx` and `app/components/mobile-summary-rail.tsx`
13. Update `.cursor/skills/veld-mobile/SKILL.md` with new patterns
14. Update `.cursor/skills/veld-ui/SKILL.md` with new anti-patterns
15. Update `docs/design/design-spec-2026.md` with mobile section

---

## 6. Updated Design Rules

### Banned Patterns (mobile)

These Tailwind class combinations are **banned** on mobile components going forward:

| Pattern | Why | Replace with |
|---------|-----|-------------|
| `rounded-[28px]` on any mobile container | Excessively round outer shell | Remove — full bleed |
| `rounded-2xl border border-border` inside another `rounded-*` container | Nested cards | `border-t border-border` divider or `MobileFormGroup` |
| `bg-card/95` | Opacity-diluted card | `bg-card` or remove bg entirely |
| `bg-background/75`, `bg-background/55`, `bg-background/35` | Opacity-diluted backgrounds | `bg-card` for sections, remove for form groups |
| `border-border/70` | Deprecated opacity border | `border-border` |
| `MobileSectionCard` inside `MobileSectionCard` | Card-in-card nesting | `MobileFormGroup` inside `MobilePageSection` |
| `shadow-sm` on items inside a `shadow-sm` parent | Double shadows | Shadow only on outermost level (section), never on items inside |
| Per-metric `rounded-2xl border` inside summary grids | Individual metric cards | `MobileStatStrip` shared surface |

### Approved Grouping Patterns (mobile)

| Pattern | Tailwind | When |
|---------|----------|------|
| Section group (iOS inset table) | `rounded-xl bg-card` | Form inputs, settings-like rows, data groups |
| Items within section | `border-t border-border px-4 py-3` | Rows inside a grouped section |
| Section divider (flat) | `border-t border-border pt-4` | Between content sections in document flow |
| Form input group | No container, just `space-y-3` + optional label | Input fields within a section |
| Stat strip | `rounded-xl bg-card p-4` (ONE container) | Summary metrics at top of tool pages |
| Collapsible wrapper | No card container — bare `MobileCollapsible` | Expandable content sections |
| Chart container | `rounded-lg bg-subtle/40 p-3` (Inset pattern) | Charts inside a section (the one case where inner rounding is ok) |

### Nested Radius Rule for Charts

When a chart genuinely needs a container inside a section:

- Section: `rounded-xl bg-card`
- Chart inset: `rounded-lg bg-subtle/40 p-3` (the design spec's Inset level)
- This is the ONLY approved case of a rounded element inside another rounded element on mobile
- The chart inset uses `rounded-lg` (smaller than parent `rounded-xl`) per the nested radius rule

### Typography Hierarchy on Mobile (reinforced)

| Element | Classes | Purpose |
|---------|---------|---------|
| Page title | `text-xl font-semibold text-foreground` | Shell header (one per page) |
| Eyebrow | `text-[11px] font-semibold uppercase tracking-[0.18em] text-muted` | Tool identifier above title |
| Section title | `text-sm font-semibold text-foreground` | Section heading within content |
| Form group label | `text-[11px] font-medium text-muted` | Label above input group (no uppercase) |
| Stat label | `text-[11px] font-medium text-muted` | Metric label in stat strip (no uppercase, no tracking-wide) |
| Stat value | `text-base font-semibold tabular-nums` | Metric value |
| Body text | `text-sm text-muted` | Descriptions, helpers |
| Micro helper | `text-[11px] text-muted` | Footnotes, sub-labels |

### Constraints Preserved

- `useIsMobile()` early-return pattern: unchanged
- 44x44px touch targets: all `MobileListRow` and interactive elements maintain `min-h-[44px]`
- Safe area insets: preserved in shell footer and bottom nav
- Desktop layouts: completely untouched — all changes in `isMobile` render paths and `md:hidden` blocks only
- `MobileToolShell` API surface: additive only — existing props work, internal rendering changes

---

## 7. File Index

All file paths relative to `RealEstatePortfolio/`:

### Components to create (Phase 0)
- `app/components/mobile-stat-strip.tsx` — new
- `app/components/mobile-page-section.tsx` — new
- `app/components/mobile-list-row.tsx` — new
- `app/components/mobile-form-group.tsx` — new

### Components to modify (Phase 1)
- `app/components/mobile-tool-shell.tsx` — remove card wrapper, switch to MobileStatStrip
- `app/components/mobile-tool-shell.test.tsx` — update assertions

### Pages to migrate (Phase 2)
- `app/app/(app)/analyze/deal-analyzer-form.tsx` — Deal Analyzer
- `app/app/(app)/properties/[id]/projections-tab-content.tsx` — Modeling
- `app/app/(app)/properties/[id]/mortgage-tab-content.tsx` — Mortgage
- `app/app/(app)/refinance/refinance-workspace.tsx` — Refinance
- `app/components/marketing/public-calculator.tsx` — Marketing calc
- `app/components/marketing/fix-and-flip-calculator.tsx` — Marketing calc
- `app/components/marketing/str-ltr-calculator.tsx` — Marketing calc
- `app/components/marketing/brrr-calculator.tsx` — Marketing calc

### Components to deprecate (Phase 3)
- `app/components/mobile-section-card.tsx` — add deprecation comment
- `app/components/mobile-summary-rail.tsx` — add deprecation comment

### Docs to update (Phase 3)
- `.cursor/skills/veld-mobile/SKILL.md`
- `.cursor/skills/veld-ui/SKILL.md`
- `docs/design/design-spec-2026.md`

### Files with NO changes needed
- `app/app/(app)/properties/[id]/overview-tab-content.tsx` — already avoids card-itis
- `app/app/(app)/properties/[id]/property-detail-tabs.tsx` — tab nav already clean
- `app/components/mobile-bottom-nav.tsx` — unaffected
- `app/components/mobile-collapsible.tsx` — unaffected (kept as-is)
- `app/components/mobile-mode-switcher.tsx` — unaffected
- `app/app/(app)/properties/add-property-wizard.tsx` — uses MobileToolShell (auto-updates)

---

## 8. Task Checklist

- [ ] **Phase 0: Create primitives**
  - [ ] Create `mobile-stat-strip.tsx`
  - [ ] Create `mobile-page-section.tsx`
  - [ ] Create `mobile-list-row.tsx`
  - [ ] Create `mobile-form-group.tsx`
- [ ] **Phase 1: Modify shell**
  - [ ] Refactor `mobile-tool-shell.tsx` (remove card, switch import)
  - [ ] Update `mobile-tool-shell.test.tsx`
- [ ] **Phase 2: Migrate screens**
  - [ ] Deal Analyzer (`deal-analyzer-form.tsx`)
  - [ ] Modeling (`projections-tab-content.tsx`)
  - [ ] Mortgage (`mortgage-tab-content.tsx`)
  - [ ] Refinance (`refinance-workspace.tsx`)
  - [ ] Marketing calculators (4 files)
- [ ] **Phase 3: Cleanup**
  - [ ] Deprecation comments on old components
  - [ ] Update `veld-mobile/SKILL.md`
  - [ ] Update `veld-ui/SKILL.md`
  - [ ] Update `design-spec-2026.md`
