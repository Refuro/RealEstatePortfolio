# Design Specification — Veld Portfolio

**Version:** 2.0  
**Last updated:** 2026-03-19  
**Last reviewed by:** PM + builder workflow  
**Review cadence:** Quarterly or before major UX overhaul  
**Status:** Active for legacy structural patterns; **canonical visual and interaction rules live in [`docs/design/design-spec-2026.md`](../design/design-spec-2026.md).** Use that document first for all new UI work.
**Historical context:** `docs/design/design-brief-2026.md` is a superseded planning record, not an active spec. Sections 2 (Typography), 3 (Color Palette), and 9 (What to avoid) in *this* file may overlap the 2026 spec — **when they conflict, `design-spec-2026.md` wins.** Retain this policy doc for architecture/process cross-references until fully merged.

---

## 1. Design Philosophy

The product targets **individual real estate investors** who may be less advanced but also supports power users. The design combines:

1. **Robinhood-inspired minimal** — One-glance clarity, big numbers, minimal chrome, high information density where it matters.
2. **Progressive disclosure** — Simple by default; advanced metrics and options available on demand without separate modes.

**Principles:**

- **Numbers first** — Primary metrics (total value, equity, cash flow) dominate. Secondary metrics (cap rate, LTV) are visible but secondary.
- **Clarity over decoration** — No unnecessary gradients, shadows, or visual noise. Every element earns its place.
- **Accessible hierarchy** — Clear typographic and spatial hierarchy so users know what to read first.
- **One flexible interface** — Avoid "simple mode" vs "advanced mode." Use progressive disclosure (expandable sections, "Show more") instead.

### 1.1 Audit alignment (required)

When running UX, feature, or code audits, evaluate this spec against:

- Dashboard, Properties, Property detail, Modeling, Mortgage, Analyze, Plans/Pricing.
- Information hierarchy quality (decision-first, low clutter, clear primary CTAs).
- Label density guardrails from `docs/policies/analytics-math-policy.md`.
- Consistency with component patterns in `docs/architecture-and-build-practices.md`.

If recurring UI patterns in production diverge from this spec, update this spec first before approving new UI work that follows the newer pattern.

---

## 2. Typography

| Role | Usage | Tailwind / CSS |
|------|--------|----------------|
| **Page title** | Main heading (e.g. "Dashboard", "Properties") | `text-2xl font-semibold` |
| **Section title** | Section headers (e.g. "Portfolio charts", "Investment metrics") | `text-sm font-semibold uppercase tracking-wide text-muted` |
| **Primary value** | Big numbers (total equity, cash flow, property value) | `text-2xl` or `text-3xl font-semibold` |
| **Secondary value** | Supporting numbers (cap rate, LTV) | `text-lg font-medium` |
| **Label** | Metric labels, form labels | `text-sm font-medium text-muted` |
| **Body** | Descriptions, helper text | `text-sm text-muted` |
| **Caption** | Chart labels, fine print | `text-xs text-muted` |

**Font stack:** Use `var(--font-geist-sans)` (Geist) for UI. Monospace (`var(--font-geist-mono)`) only for numeric/code contexts if needed.

---

## 3. Color Palette

Define semantic tokens in `globals.css` and use them consistently.

| Token | Light mode | Dark mode | Usage |
|-------|------------|-----------|-------|
| `--background` | `#fafafa` | `#0a0a0a` | Page background |
| `--background-subtle` | `#f4f4f5` | `#171717` | Hover states, subtle areas |
| `--card` | `#ffffff` | `#18181b` | Cards, sections, sidebar |
| `--foreground` | `#0a0a0a` | `#fafafa` | Primary text |
| `--foreground-muted` | `#71717a` | `#a1a1aa` | Labels, secondary text |
| `--border` | `#e4e4e7` | `#27272a` | Borders, dividers |
| `--accent` | `#6366f1` | `#818cf8` | Primary buttons, links, active indicators |
| `--accent-hover` | `#4f46e5` | `#a5b4fc` | Button hover states |
| `--accent-subtle` | `#eef2ff` | `#1e1b4b` | Badge backgrounds, icon tints |
| `--positive` | `#059669` | `#34d399` | Positive cash flow, gains |
| `--negative` | `#dc2626` | `#f87171` | Negative cash flow, losses |
| `--chart-1` … `--chart-5` | Defined palette | Same | Chart series colors |

**Tailwind mapping:** Map `text-muted` → `--foreground-muted`, `bg-subtle` → `--background-subtle`, `border-default` → `--border`, etc. Use semantic names, not raw zinc/slate values, so theming stays consistent.

**Color usage rules:**

- Use **positive** (green) and **negative** (red) only for cash flow, gains/losses, and directional indicators.
- Use **accent** for primary actions (Add property, Save). Secondary actions use outline/border style.
- Avoid decorative color. Charts use a restrained palette (see §7).

---

## 4. Spacing & Layout

| Token | Value | Usage |
|-------|-------|-------|
| **Page padding** | `1.5rem` (24px) | Main content area |
| **Section gap** | `2rem` (32px) | Between major sections |
| **Card padding** | `1.25rem` (20px) or `1.5rem` | Inside cards |
| **Grid gap** | `1rem` (16px) | Between metric cards, grid items |
| **Compact gap** | `0.5rem` (8px) | Between related items |

**Layout structure:**

- **Sidebar:** Slim (e.g. `w-56` or icon-only collapsible). White/subtle background, `border-r` with `--border`.
- **Main content:** `flex-1 overflow-auto p-6` (or `p-6` equivalent). Max-width optional for very wide screens.
- **Responsive:** Stack grids on small screens (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). No horizontal scroll.
- **Mobile-also:** Test on both desktop and mobile (375px or real device). Use hamburger or simplified nav if many links; avoid squished text. Touch targets ≥ 44px.

### 4.1 Mobile-specific guidelines

The primary mobile/desktop breakpoint is `md` (768px). All mobile-specific changes use Tailwind responsive prefixes and `md:hidden` / `hidden md:block` patterns so desktop layout is never affected.

| Pattern | Implementation | Example |
|---------|---------------|---------|
| **Metric grids** | 2-column on mobile, expanding at `lg`/`xl` | `grid-cols-2 lg:grid-cols-3 xl:grid-cols-5` |
| **Progressive disclosure** | `MobileCollapsible` component — collapsed on mobile, always-open on `md`+ | Secondary metrics, supporting metrics, settings sections |
| **Workspace navigation** | `<select>` dropdown on mobile, inline buttons on desktop | Dashboard "Jump to..." select, `md:hidden` / `hidden md:flex` |
| **Form fields** | Single-column below `sm`, 2-column at `sm`+ | `grid-cols-1 sm:grid-cols-2` for mortgage fields |
| **Jump/section links** | Horizontal scroll strip on mobile, wrapping on desktop | `overflow-x-auto md:flex-wrap` with `shrink-0` items |
| **Filter/sort bars** | Horizontally scrollable on mobile | `overflow-x-auto` with `shrink-0` pill buttons |
| **Touch targets** | Minimum 44×44px on interactive elements | `size-11` (44px) for hamburger and user buttons |
| **Top padding** | `pt-16` on mobile (56px header + 8px breathing room) | `pt-16 md:pt-6` |
| **Sticky results** | Compact fixed bottom bar on mobile for deal analyzer | `fixed bottom-0 left-0 right-0 md:hidden` |
| **Pricing cards** | Stack on mobile, 3-across at `md` | `grid-cols-1 md:grid-cols-3` |
| **Chart height** | Slightly shorter on mobile | `h-[200px] sm:h-[240px]` |
| **MetricCard text** | Step down one size on mobile for compact cards | `text-base md:text-lg` |

**Shared infrastructure:**

- `useIsMobile` hook (`lib/use-is-mobile.ts`) — `useSyncExternalStore` with `(max-width: 767px)` media query, SSR-safe. Use for JS-driven show/hide when duplicating markup would be impractical.
- `MobileCollapsible` component (`components/mobile-collapsible.tsx`) — renders children directly on `md`+, collapsible `<button>`/reveal on mobile. Use for secondary content that clutters the mobile viewport.

---

## 5. Component Patterns

### 5.1 Metric cards (dashboard)

- **Primary metrics** (total value, equity, cash flow): Large value (`text-2xl` or `text-3xl`), label above in muted.
- **Secondary metrics** (cap rate, LTV): Slightly smaller value (`text-lg`), same card style.
- **Card style:** `rounded-lg border border-default bg-card p-5` (or equivalent). Flat, minimal shadow if any.
- **Cash flow:** Use `text-positive` or `text-negative` for the value.

### 5.2 Buttons

| Type | Style | Usage |
|------|-------|-------|
| **Primary** | Solid background (`bg-accent`), white text, `rounded-md` | Add property, Save, primary CTAs |
| **Secondary** | `border border-default bg-transparent`, hover `bg-subtle` | View all, Cancel, secondary actions |
| **Ghost** | No border, `hover:bg-subtle` | Inline links, low-emphasis actions |

Sizes: `px-4 py-2 text-sm font-medium` for standard buttons.

### 5.3 Cards & sections

- **Section:** `rounded-lg border border-default bg-card p-6`.
- **Section header:** `text-sm font-semibold uppercase tracking-wide text-muted` with `mb-4`.
- **List items:** `space-y-2` or `space-y-3` for vertical lists. Hover state: `hover:bg-subtle` for clickable rows.

### 5.4 Forms

- **Label:** `text-sm font-medium text-muted` above input.
- **Input:** `rounded-md border border-default bg-background px-3 py-2 text-sm`. Focus: `ring-2 ring-accent/20` or equivalent.
- **Error:** `text-sm text-negative` below field.
- **Grouping:** Use `<fieldset>` or div with `space-y-4` for logical groups. Optional "Advanced" or "More options" as expandable section.

### 5.5 Progressive disclosure

- **Expandable section:** "Show more metrics" / "Advanced options" — use `<details>` or a toggle. Content hidden by default.
- **Tabs:** Use for switching views (e.g. "Overview" vs "Detailed") when content is mutually exclusive.
- **Tooltips:** Optional for metric definitions (cap rate, LTV). Keep tooltip text short.

---

## 6. Navigation

- **Sidebar:** Vertical nav with `Dashboard`, `Properties`, `Pricing`, `Settings`. Active state: `bg-subtle` or `font-medium text-foreground`.
- **Account area:** Bottom of sidebar; UserButton + "Account" or similar.
- **Breadcrumbs:** Use for deep pages (e.g. Properties → 123 Main St → Edit). Format: `← Properties` or `Properties / 123 Main St`.

---

## 7. Charts

- **Container:** Same card style as sections. Title above chart.
- **Colors:** Use `--chart-1` through `--chart-5` for series. Avoid rainbow or high-saturation colors.
- **Grid:** Light, subtle (`stroke: var(--border)`). No heavy grid lines.
- **Tooltips:** Compact, readable. Format currency with `Intl.NumberFormat`.
- **Empty state:** Clear message (e.g. "Add properties to see equity by property") with consistent empty-state styling.

---

## 8. Empty states

- Centered content in a card.
- **Title:** `text-lg font-medium text-foreground`
- **Description:** `text-sm text-muted` — one or two sentences.
- **CTA:** Primary button for main action (e.g. "Add your first property").

---

## 9. What to avoid

- **Heavy shadows** — Prefer flat or very subtle shadow.
- **Decorative gradients** — No gradient backgrounds unless explicitly in spec.
- **Multiple accent colors** — One accent (dark/light by theme).
- **Dense information dumps** — Use progressive disclosure for advanced metrics.
- **Separate "simple" vs "advanced" modes** — One interface with expandable sections.
- **Inconsistent spacing** — Use the spacing tokens above.
- **Raw zinc/slate/emerald values in components** — Prefer semantic tokens (`text-muted`, `bg-subtle`, `text-positive`) for maintainability.

---

## 10. Implementation notes

- **Tailwind:** Extend `@theme` in `globals.css` with semantic color tokens. Use `text-muted`, `bg-subtle`, `border-default`, `text-positive`, `text-negative`, `bg-accent`, etc.
- **Dark mode:** Support `prefers-color-scheme: dark` via CSS variables. Ensure contrast meets accessibility guidelines.
- **Builder reference:** When implementing UI, always check new components against this spec. PM approval includes design compliance (see [pm-review-checklist.md](../process/pm-review-checklist.md)).
- **Audit reference:** Feature/UX audits must cite this spec and explicitly call out where modernized UI patterns require spec updates.

---

*Reference: [engineering-spec.md §20](../reference/engineering-spec.md) (Visual refresh).*
