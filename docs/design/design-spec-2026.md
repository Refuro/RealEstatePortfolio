# Veld Portfolio — Design Specification 2026

**Version:** 3.0 (consolidated)
**Date:** 2026-04-03
**Status:** Canonical — supersedes `design-brief-2026.md`, `design-brief-2026-phase2.md`, `design-brief-2026-phase3.md`, and all phase implementation guides
**Scope:** Full design language for both the public marketing site and the authenticated in-app product

> **How to use this document:** This is the single source of truth for Veld's visual design language. It is written in the present tense and reflects the actual current state of the codebase after all Phase 1, 2, and 3 work is applied. When a decision is ambiguous, apply the nearest pillar from Section 2. When adding or editing UI, consult the relevant component or page section before writing code.

---

## Table of Contents

1. [Design Pillars](#1-design-pillars)
2. [Brand Identity](#2-brand-identity)
3. [Token System](#3-token-system)
4. [Typography System](#4-typography-system)
5. [Surface Hierarchy](#5-surface-hierarchy)
6. [Shadow and Depth System](#6-shadow-and-depth-system)
7. [Radius System](#7-radius-system)
8. [Numerics Policy](#8-numerics-policy)
9. [Accessibility Standards](#9-accessibility-standards)
10. [Motion and Transitions](#10-motion-and-transitions)
11. [Empty State System](#11-empty-state-system)
12. [Loading Skeleton Standard](#12-loading-skeleton-standard)
13. [Component Reference](#13-component-reference)
14. [Page Reference](#14-page-reference)
15. [Anti-Patterns](#15-anti-patterns)

---

## 1. Design Pillars

These six principles govern every design decision. When specific guidance is ambiguous, apply the nearest pillar.

### Pillar 1 — Chrome Serves Data

The sidebar, header bar, nav labels, borders, and dividers are infrastructure. They should be visually recessive relative to the content they frame. Charts, metric values, and property data are the hero. In practice: sidebar items use `text-sm text-muted`. Active items get a quiet accent left-border indicator, not a loud filled background. Chart containers use the same card treatment as metric cards so the chart itself carries the visual emphasis.

### Pillar 2 — Structure Felt, Not Seen

Hard borders between sections create visual noise. Where sections can be differentiated through spacing, background color shifts, or shadow depth changes alone, borders should be removed. A card should mark a discrete self-contained object, not a section of a flowing document. Settings categories are chapters in a document — they belong inside Panels with internal dividers, not each in their own card. This distinction is defined formally in Section 5.

### Pillar 3 — Tabular Numbers Everywhere

Any number a user might mentally compare to another must render in tabular numerals (`tabular-nums`). Apply to all `MetricCard` values, table cells containing currency or percentage, chart tooltip values, and pricing card price figures.

### Pillar 4 — Layered Depth

Cards are not flat. They exist at a physical level above the page background. Every content card that holds data the user cares about gets at minimum the Raised treatment (`shadow-sm`). The elevation model in Section 6 governs this.

### Pillar 5 — One Loud Action Per Screen

On any given screen there is at most one brand-colored (indigo) CTA. Everything else — secondary actions, navigation links, ghost buttons — is neutral. In the app: "Add property" and "Save" are the loud actions. On the marketing site: "Get started free" is the loud action.

### Pillar 6 — No Section Title Uniformity

The uppercase-muted label pattern (`text-xs font-semibold uppercase tracking-wide text-muted`) is reserved exclusively for labeling groups of data within a Panel (e.g., sidebar group headers "TOOLS", table column headers). It must not appear as a marketing section heading, page-level `h2`, or any heading that is not directly above a data grid, table, or structured list.

---

## 2. Brand Identity

### 2.1 Brand Accent Color: Indigo

The Veld brand accent is **indigo**. It replaces the former pure-black `--accent` token.

**Why indigo:**
- Distinct from the semantic palette (green = positive, red = negative, amber = warning)
- Pairs naturally with the zinc/neutral base in `globals.css`
- Signals analytical precision and professionalism (used by Linear, Figma, and other serious productivity SaaS)
- Works in both light and dark mode with a single hue shift
- Avoids the "money/gains" connotation of green, which already does semantic work

### 2.2 Color Token Reference

| Token | Light Mode | Dark Mode | Notes |
|---|---|---|---|
| `--background` | `#fafafa` | `#0a0a0a` | Base page background |
| `--background-subtle` | `#f4f4f5` | `#171717` | Subtle section tint |
| `--card` | `#ffffff` | `#18181b` | Card/panel surface |
| `--foreground` | `#0a0a0a` | `#fafafa` | Primary text |
| `--foreground-muted` / `--muted` | `#71717a` | `#a1a1aa` | Secondary text |
| `--border` | `#e4e4e7` | `#27272a` | Borders and dividers |
| `--accent` | `#6366f1` | `#818cf8` | **Brand indigo** |
| `--accent-hover` | `#4f46e5` | `#a5b4fc` | Accent hover state |
| `--accent-foreground` | `#ffffff` | `#1e1b4b` | Text on accent surfaces |
| `--positive` | `#059669` | `#34d399` | Financial gain, success |
| `--negative` | `#dc2626` | `#f87171` | Financial loss, error |
| `--warning` | `#d97706` | `#fbbf24` | Caution, near-limit |
| `--chart-1` through `--chart-5` | as defined | as defined | Chart series — unchanged |

**Additional tokens:**

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--accent-subtle` | `#eef2ff` | `#1e1b4b` | Low-emphasis accent tints (badges, icon backgrounds) |
| `--accent-subtle-foreground` | `#4338ca` | `#a5b4fc` | Text on `--accent-subtle` backgrounds |

### 2.3 Logo Mark

The logo is the `favicon.svg` image mark (20×20px) paired with the "Veld" wordmark. The mark renders as a `next/image` (or `<img>`) element with `size-5 shrink-0 object-contain`, decorative (`alt=""` + `aria-hidden`), to the left of the text.

| Context | Icon size | Text size |
|---|---|---|
| Landing nav | 20×20 (`size-5`) | `text-lg font-semibold` |
| App sidebar header | 20×20 (`size-5`) | `text-lg font-semibold` |
| App mobile top bar | 20×20 (`size-5`) | `text-base font-semibold` |

When a custom SVG brand mark is designed, replace `src="/favicon.svg"` with the new asset path. The structural slot is already wired in all three locations.

### 2.4 Font

**Geist Sans** — unchanged from project origin. No font change.

### 2.5 Dark Mode

Implemented via CSS class strategy with `ThemeProvider`. System-preference fallback is active. Light/dark/system are user-selectable in Settings. All token values above reflect the correct per-mode values. No new dark-mode infrastructure changes are needed.

---

## 3. Token System

All tokens live in `app/app/globals.css` under the `@theme inline` and `:root` blocks.

### 3.1 Motion Tokens

```css
/* Motion tokens — defined in :root */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### 3.2 Global CSS Rules

The following rules are applied globally in `globals.css` and do not need to be repeated per-component:

**Focus ring (keyboard/AT only):**
```css
:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 50%, transparent);
  outline-offset: 2px;
}
:focus:not(:focus-visible) {
  outline: none;
}
```

**Input/select/textarea hover and transition:**
```css
input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
select,
textarea {
  transition: border-color 150ms, box-shadow 150ms;
}

input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):hover:not(:focus),
select:hover:not(:focus),
textarea:hover:not(:focus) {
  border-color: color-mix(in srgb, var(--border), var(--foreground) 22%);
}
```

**Viewport meta (in `app/layout.tsx` via Next.js `viewport` export):**
```ts
export const viewport: Viewport = {
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};
```
This is required for `env(safe-area-inset-bottom)` to resolve on iPhones. Without `viewport-fit=cover`, safe area values are always `0`.

---

## 4. Typography System

Five distinct levels. The level must be immediately obvious from visual weight alone — if two adjacent headings look the same, one is wrong.

| Level | Tailwind | Context | Rule |
|---|---|---|---|
| **L1 — Page Headline** | `text-2xl font-semibold tracking-tight text-foreground` (app) / `text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight` (marketing) | Page `<h1>` elements, marketing hero headline | One per page |
| **L2 — Section Heading** | `text-xl font-semibold text-foreground` (app) / `text-2xl font-semibold text-foreground` (marketing) | Named page sections that are navigational landmarks ("How it works", "Compare plans") | Never for data group labels, chart titles, or form labels |
| **L3 — Subsection / Card Title** | `text-base font-semibold text-foreground` | Named groups within a section, card headers with identity (pricing plan names, calculator card titles) | Never for metric labels or nav labels |
| **L4 — Data Group Label** | `text-xs font-semibold uppercase tracking-wide text-muted` | Sidebar nav group headers ("TOOLS", "ACCOUNT"), table column headers, labels above groups of structured data within a Panel | **Only** within a Panel above structured data. Never as a marketing section heading or page-level h2 |
| **L5 — Body / Helper / Label** | `text-sm text-muted` (body) / `text-sm font-medium text-muted` (form label) / `text-xs text-muted` (caption) | Descriptive body text, form labels, metric helper text, footnotes | — |

**Section labels within content cards** (e.g., "Simulation controls" in the Projections tab, "Plan context" in Plans page): use `text-xs font-medium text-muted` — **no uppercase, no tracking-wide**. These are L5 labels, not L4 data-group labels.

**Back navigation links:** Always use `inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground` with a `<ChevronLeft className="size-4" aria-hidden />` icon. Never use literal `←` characters.

**Forward / "go to" navigation links:** Use `inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground` with `<ChevronRight className="size-3.5" aria-hidden />`. Never use literal `→` characters.

**Arrow separators in breadcrumbs:** Use `<span className="mx-1 text-muted/50" aria-hidden>→</span>` if a separator is needed.

---

## 5. Surface Hierarchy

Three levels. Apply the discrete object test before wrapping content in a Panel: *"Is this a standalone unit that could exist in a list, be moved, or be removed without making the rest of the page feel incomplete?"*

| Level | Visual Treatment | Tailwind | Meaning |
|---|---|---|---|
| **Page** | None | *(no wrapper)* | A section of a flowing document. Cannot be removed or rearranged without disrupting the page. |
| **Panel** | Border + shadow | `rounded-xl border border-border bg-card shadow-sm` | A self-contained discrete content object. Can be moved, placed in a list, or removed independently. |
| **Inset** | Background tint only | `rounded-lg bg-subtle/40 p-3` | Secondary content nested inside a Panel. Never has its own shadow or border. |

**The sibling rule:** When multiple sibling Panels would be traversed sequentially as part of a single user task (e.g., reading through settings), they belong in ONE Panel with internal `border-t border-border` section dividers.

**The deprecation rule:** `border-border/70` and `bg-card/95` are deprecated. These opacity dilutions reduce contrast without adding polish. Always use `border-border` and `bg-card` at full values.

**Settings page panel structure:**
- Panel A — Account preferences (Appearance + Portfolio display + Profile)
- Panel B — Plan & billing (standalone)
- Panel C — Your data (export + import)
- Panel D — Danger zone (delete account, isolated, `border-negative/20` always visible)
- Cookie preferences renders as its own section above Panel A, outside the grouped structure

---

## 6. Shadow and Depth System

| Level | CSS | Tailwind | Usage |
|---|---|---|---|
| **Flat** | None | border only | Inline elements, secondary cards inside a Panel, form inputs |
| **Raised** | `0 1px 2px rgba(0,0,0,0.05)` | `shadow-sm` | Primary content cards, metric cards, nav sidebar, any surface that holds data the user cares about |
| **Elevated** | `0 4px 6px -1px rgba(0,0,0,0.07)` | `shadow-md` | Hover state on clickable cards, sticky headers on scroll |
| **Floating** | `0 20px 25px -5px rgba(0,0,0,0.1)` | `shadow-xl` / `shadow-2xl` | Full modals, command palette, toast notifications |

**Rule:** Every content card that holds data gets at minimum Raised (`shadow-sm`). Static content cards with no elevation must be inside an already-elevated parent — a flat card on a flat background creates no visual separation.

---

## 7. Radius System

Nested radii principle: a child element inside a container must have a border-radius proportionally smaller than the parent so rounded edges appear concentric.

| Context | Radius |
|---|---|
| Page-level panels, section cards | `rounded-xl` (12px) |
| Cards inside panels, metric cards | `rounded-lg` (8px) |
| Buttons, badges, inputs | `rounded-md` (6px) |
| Small badges, tiny pills | `rounded-full` or `rounded-sm` (4px) |

A `rounded-xl` panel containing a `rounded-xl` button looks wrong — the curves collide. The button must be `rounded-md`.

---

## 8. Numerics Policy

All financial figures render with tabular numerals to maintain column alignment:

```css
font-variant-numeric: tabular-nums;
```

In Tailwind: `tabular-nums` utility class. Apply to:
- All `MetricCard` value renders (`<dd>`)
- All table cells containing currency or percentage
- All chart tooltip values
- All pricing card price figures (`<p>` with price)

---

## 9. Accessibility Standards

### 9.1 Focus Rings

A global `:focus-visible` rule in `globals.css` covers all interactive elements automatically. The rule uses `color-mix(in srgb, var(--accent) 50%, transparent)` because `--accent` is a hex value, not HSL components — using `hsl(var(--accent) / 0.5)` would be invalid.

Do not add `outline-none` to any interactive element without also adding explicit `focus-visible:ring-*` classes. The only acceptable reason to suppress the default outline is to replace it with a custom ring.

### 9.2 Touch Targets

Every `<button>` and `<a>` visible on mobile must have a minimum rendered height of 44px. If the visual design requires a compact element, use `min-h-[44px] flex items-center` to extend the touch surface beyond the visual bounds.

### 9.3 Reduced Motion

All new motion must use `motion-safe:` prefix or the existing `app-respect-reduced-motion` class. Never add animation without a reduced-motion fallback.

### 9.4 ARIA Patterns

- Mobile drawers/dialogs must have `role="dialog"`, `aria-modal="true"`, and Escape key handling
- Decorative icons must have `aria-hidden`
- Images that are decorative alongside text must have `alt=""`
- Navigation landmarks must have `aria-label`

---

## 10. Motion and Transitions

### 10.1 Policy Table

| Interaction Type | Duration | Tailwind |
|---|---|---|
| Button hover/active (color, bg) | 150ms | `transition-all duration-150` |
| Card hover (shadow lift) | 150ms | `transition-shadow duration-150` |
| Color-only hover (text, border) | 150ms | `transition-colors duration-150` |
| Tab indicator (underline travel) | 200ms | `transition-all duration-200` |
| Collapsible/accordion expand | 200ms | `transition-all duration-200` |
| Modal/drawer overlay | 300ms | `transition-all duration-300` |
| Page-level transitions | none | — |

### 10.2 The Mandatory Rule

Every `hover:bg-*`, `hover:text-*`, or `hover:shadow-*` class must be accompanied by the appropriate `transition-*` class. A hover state without a transition is a design defect.

### 10.3 No Page Transitions

Page-level navigation transitions are not used. They cause layout jank on Next.js App Router navigation and increase perceived load time.

---

## 11. Empty State System

### 11.1 Philosophy

An empty state is a teaching moment and an activation opportunity. Every empty state answers two questions: (1) "Why is this empty?" and (2) "What's the most useful thing I can do right now?"

### 11.2 Anatomy

Every empty state has exactly four elements:

1. **Icon** — A `lucide-react` icon related to the surface. Size: `size-10`, `text-muted/40`. Not a PNG illustration — the product is data-focused; illustrations would be tonally wrong.
2. **Heading** — Short, specific, not generic. "No properties yet" not "Nothing here." Max 4–5 words.
3. **Supporting line** — One sentence. Max 12 words.
4. **Primary action** — A single CTA styled as the primary button (`bg-accent text-accent-foreground`). No secondary action unless there are two genuinely equal paths.

### 11.3 Container Pattern

```tsx
<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
  <Icon className="size-10 text-muted/40" aria-hidden />
  <div>
    <p className="text-sm font-semibold text-foreground">Heading</p>
    <p className="mt-1 text-sm text-muted">Supporting line.</p>
  </div>
  <Link
    href="/target"
    className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
  >
    CTA text
  </Link>
</div>
```

The `border-dashed` treatment signals "this space is waiting to be filled" and is distinct from the solid `border-border` used on data-bearing cards.

For search/filter empty states (no results), use a "Clear search" or "Clear filters" button instead of a route-change `Link`.

### 11.4 Standard States

| Surface | Icon | Heading | Support Line | CTA |
|---|---|---|---|---|
| Dashboard (no properties) | `Building2` | "Add your first property" | "Your portfolio metrics appear here once you add a property." | "Add property" → `/properties/new` |
| Properties list (no properties) | `Building2` | "No properties yet" | "Track equity, cash flow, and rent estimates across all your properties." | "Add your first property" → `/properties/new` |
| Properties list (no filter results) | `Search` | "No matching properties" | "Try adjusting your filters." | none / clear filters |
| Deals list (no saved deals) | `FileText` | "No saved deals" | "Run a deal analysis and save it here to compare later." | "Analyze a deal" → `/analyze` |
| Deals list (no search results) | `Search` | "No matching deals" | "Try adjusting your search." | "Clear search" (button) |

---

## 12. Loading Skeleton Standard

### 12.1 Three Patterns

**Pattern A — Inline pulse** (individual loading values inside a rendered container):
```tsx
<div className="h-4 w-24 animate-pulse rounded-md bg-subtle" />
```
Use for: metric values while data fetches, chart loading placeholder text.

**Pattern B — Card-level skeleton** (complete panel loading):
```tsx
<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
  <div className="animate-pulse space-y-3">
    <div className="h-4 w-32 rounded-md bg-subtle" />
    <div className="h-3 w-full rounded-md bg-subtle" />
    <div className="h-3 w-3/4 rounded-md bg-subtle" />
  </div>
</div>
```
Use for: dashboard charts loading, individual chart cards, plan context cards.

**Pattern C — Full-page skeleton** (`loading.tsx` files):
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-8 w-48 rounded-md bg-subtle" />
  <div className="h-4 w-80 rounded-md bg-subtle" />
  <div className="mt-2 flex gap-2">
    <div className="h-8 w-28 rounded-md bg-subtle" />
    <div className="h-8 w-28 rounded-md bg-subtle" />
  </div>
  <div className="mt-4 rounded-xl border border-border bg-card/50 p-5 shadow-sm">
    <div className="h-4 w-40 rounded-md bg-subtle" />
    <div className="mt-4 h-48 rounded-lg bg-subtle/60" />
  </div>
</div>
```
Use for: `loading.tsx` files in each route segment. The skeleton must resemble the page structure — not a single tall rectangle or a spinner.

---

## 13. Component Reference

### 13.1 MetricCard (`components/metric-card.tsx`)

- Container: `min-w-0 rounded-lg border border-border bg-card shadow-sm`
- Value (`<dd>`): `tabular-nums`
- Optional `delta` / `deltaLabel` props: renders below value in `text-positive` (positive), `text-negative` (negative), or `text-muted` (neutral)
- Not interactive — no `hover:` classes. The cards are display-only.
- Compact variant: `p-3`. Standard: `p-5`.

### 13.2 AppNav (`app/(app)/app-nav.tsx`)

- Group labels: `text-xs font-semibold uppercase tracking-wide text-muted` — this is the correct and only remaining use of the uppercase pattern in the codebase
- Inactive item: `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted w-full hover:bg-subtle hover:text-foreground transition-colors duration-100`
- Active item: `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground bg-subtle border-l-2 border-accent`
- Add property CTA: `flex items-center gap-2 rounded-md bg-accent/10 px-3 py-2 text-sm font-medium text-accent transition-colors duration-100 hover:bg-accent/15 w-full`
- Responds to `open-mobile-menu` custom event (dispatched by `MobileBottomNav`) to open the mobile drawer

### 13.3 MobileBottomNav (`components/mobile-bottom-nav.tsx`)

- Renders only on `< md` breakpoint (hidden on desktop via `md:hidden`)
- Fixed at `bottom-0`, `h-16`, `z-50`, `bg-background`
- Bottom padding: `pb-[env(safe-area-inset-bottom)]` — requires `viewport-fit=cover` in the viewport meta (set in `app/layout.tsx`)
- Items: Dashboard, Properties, Analyze, More (opens drawer via custom event)
- Active item: `text-accent`. Inactive: `text-muted hover:text-foreground`
- All items: `min-h-[44px] min-w-[44px]`
- "More" button dispatches `new CustomEvent("open-mobile-menu")` on `document`

### 13.4 AppLayoutClient (`app/(app)/app-layout-client.tsx`)

- Mobile fixed header: `fixed left-0 right-0 top-0 z-40 min-h-14 bg-card md:hidden`
- Desktop sidebar: `hidden md:flex w-56 xl:w-64 2xl:w-72 sticky top-0 h-screen bg-card border-r`
- Main content area: `pb-[calc(4rem+env(safe-area-inset-bottom))] pt-[calc(3.5rem+env(safe-area-inset-top,0px)+1rem)] md:p-6 md:pt-6`
  - The mobile bottom padding ensures content is not hidden behind `MobileBottomNav`
- Footer: `hidden md:block` — footer is desktop-only in the authenticated shell. Mobile uses `MobileBottomNav` instead.

### 13.5 LandingNav (`components/landing-nav.tsx`)

- Logo: `<Image src="/favicon.svg" size-5 object-contain>` + "Veld" text in `flex items-center gap-2`
- Nav links: `text-muted transition-colors duration-150 hover:text-foreground`
- Sign up CTA: `bg-accent text-accent-foreground hover:bg-accent-hover`
- Hamburger: `size-11 min-h-11 min-w-11` (44px minimum touch target)
- Mobile drawer: `role="dialog"` + `aria-modal="true"` + Escape key handler + focus trap on open
- Desktop links: Calculators · Pricing · Changelog · [if signed in: Dashboard] · Sign in · Sign up

### 13.6 PricingCards (`components/pricing-cards.tsx`)

- Each card: `flex flex-col rounded-xl border bg-card/95 p-4 shadow-sm md:p-5`
- CTA button area: `mt-auto pt-5` — pushes buttons to the same baseline regardless of card content height above
- Feature bullets: `<Check className="mt-0.5 size-3.5 shrink-0 text-positive" />` (Lucide, not dots)
- Recommended tier (Investor for free users): `border-accent/50 ring-2 ring-accent/25 bg-accent/5`
- Current plan: `border-positive ring-1 ring-positive/60`
- Billing toggle: "Annual billing" + "Save" badge uses `<span className="inline-flex items-center gap-1.5">` to avoid cramped layout
- Price figures: `tabular-nums`

### 13.7 Footer (`components/footer.tsx`)

- Used only in the authenticated app shell on **desktop** (`hidden md:block` wrapper in `AppLayoutClient`)
- Used on all public marketing pages (landing, pricing, changelog, etc.) on all breakpoints
- Layout: copyright left, nav links + legal links right
- Desktop: Cookie Preferences inline in the legal links row (`hidden md:contents`)
- Mobile (public pages only): Cookie Preferences on its own subordinate row

### 13.8 PropertyDetailTabs (`app/(app)/properties/[id]/property-detail-tabs.tsx`)

- Tab nav: `sticky top-14 z-10 mt-4 flex items-center border-b border-border bg-background md:top-0`
  - `top-14` aligns below the mobile fixed header (56px). `md:top-0` resets for desktop where there is no fixed top header.
  - `bg-background` prevents content bleed-through on scroll.
- Active tab: `border-b-2 border-accent text-foreground`
- Inactive tab: `border-b-2 border-transparent text-muted hover:border-border hover:text-foreground`
- Tab buttons: `transition-all duration-200`

### 13.9 ChartWrapper / Dashboard Charts

- Outer panel: `rounded-xl border border-border bg-card shadow-sm`
- Header strip: `flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4`
- Chart title: `text-sm font-semibold text-foreground` (not uppercase, not muted)
- Chart content area: `p-5`
- Individual chart components must not carry their own `rounded-xl border ... shadow-sm` when nested inside the unified panel.

### 13.10 MobileCollapsible and MobileSectionCard

- These mobile-specific components work correctly. Visual polish only — no structural changes.
- `MobileCollapsible`: label uses `text-sm font-medium text-muted` (no uppercase)
- `MobileSectionCard`: border uses `border-border bg-card` (no `/70` or `/95` opacity dilution)

---

## 14. Page Reference

### 14.1 Landing Page (`app/app/page.tsx`)

**Section order:**
1. LandingNav
2. Hero — asymmetric grid (`lg:grid-cols-[3fr_2fr]`): copy left, product screenshot right (hidden below `lg`)
3. Social proof strip — `border-y border-border bg-subtle px-4 py-6`. Factual positioning statements (not anonymous quotes). Three items separated by `hidden sm:block` dividers.
4. Calculator section — `border-b border-border bg-card/40` with L2 heading, description, `PublicCalculator`, "Open full calculator" accent link
5. Value props — with `Why Veld` accent-pill eyebrow above the `h2`
6. How it works — with `How it works` accent-pill eyebrow above the `h2`
7. Pricing preview — three tier cards, "See full pricing" CTA
8. Footer

**Hero trust line** (signed-out only): `<p className="text-sm text-muted">Free plan — <span className="font-medium text-foreground">no card required</span>. Your first property in about 60 seconds.</p>`

**Accent-pill eyebrow pattern:**
```tsx
<div className="mb-3 flex justify-center sm:justify-start">
  <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
    Eyebrow label
  </span>
</div>
```

### 14.2 Pricing Page (`app/app/pricing/page.tsx`)

**Section order:**
1. LandingNav
2. Page heading (`Pricing`, L1) + subtext + trust pills
3. Billing toggle (Monthly / Annual with "Save" badge)
4. PricingCards component
5. Fine print (Billing, refunds, cancellation links)
6. Feature comparison — desktop table (hidden on mobile, `hidden md:block`), 3 columns (Free / Investor / Pro)
7. Feature comparison — mobile accordion (`md:hidden`), "Compare all features" `<details>`, Estimate pool row removed
8. FAQ — `<details>` accordion, 4 questions
9. Screenshot grid (signed-out only)
10. CTA card with FAQ accordions (signed-out only)
11. Footer

**Comparison table data** (accurate, matches `lib/plans.ts`):

| Feature | Free | Investor | Pro |
|---|---|---|---|
| Properties tracked | 1 | 5 | 20 |
| Saved deals | 5 | 20 | 50 |
| Rent & value estimates | ✓ | ✓ | ✓ |
| Estimate pool (per hour) | 5/hr | 10/hr | 20/hr |
| Deal analyzer | ✓ | ✓ | ✓ |
| Scenario modeling | ✓ | ✓ | ✓ |
| Mortgage simulator | ✓ | ✓ | ✓ |
| Portfolio charts | ✓ | ✓ | ✓ |

### 14.3 Dashboard (`app/app/(app)/dashboard/page.tsx`)

**Section order (with properties):**
1. `PaidIntentCheckoutBanner`
2. `<h1>Dashboard</h1>` (L1, no card wrapper)
3. Quick actions strip (flat, no card — Add property + Analyze a deal links)
4. Primary metric grid in `rounded-xl bg-subtle/30 p-2` grouping container
5. Secondary metrics collapsible
6. Rent vs. Market section
7. Portfolio charts Panel
8. Single-property upsell (with `border-accent/20 bg-accent/5` tint)

**Zero-state (no properties):** Empty state with `Building2` icon (Lucide, not PNG). Heading: "Add your first property". CTA: "Add property" → `/properties/new`.

### 14.4 Properties List (`app/app/(app)/properties/page.tsx`)

- Page heading: `text-2xl font-semibold text-foreground` with "Add property" CTA button top-right
- Property cards: `rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-150`
- Empty states: See Section 11.4

### 14.5 Property Detail (`app/app/(app)/properties/[id]/page.tsx`)

- Back link: `<ChevronLeft> Properties` in `inline-flex items-center gap-1 text-sm text-muted`
- Property hero: address in `bg-subtle` secondary card
- Tabs: sticky via `PropertyDetailTabs` (Section 13.8)
- Amortization back link: `<ChevronLeft> Property` using same pattern

### 14.6 Deals Page (`app/app/(app)/deals/`)

- `deals/page.tsx` always renders `<DealsList>` — empty state logic lives inside the component, not at the page level
- `deals-list.tsx` handles its own empty states (Section 11.4)
- Deal card: `rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md hover:bg-subtle/40`
- Search input: `transition-colors duration-150` + `focus:border-accent`
- Sort select: `transition-colors duration-150` + `focus:border-accent`
- Sort option labels: "Cash flow: high to low" (no `→` arrows)

### 14.7 Modeling Workspace (`app/app/(app)/modeling/`)

- No card wrapper around the property selector — flat action strip pattern (`flex flex-wrap items-end justify-between gap-4`)
- Section labels: `text-xs font-medium text-muted` (no uppercase)
- "Open property detail" link: `<ChevronRight>` icon pattern

### 14.8 Mortgage Workspace (`app/app/(app)/mortgage/`)

- Same flat action strip pattern as Modeling
- Mobile header labels: `text-xs font-medium text-muted` (no uppercase)
- Both workspace links use `<ChevronRight>` icon pattern

### 14.9 Plans & Billing (`app/app/(app)/plans/page.tsx`)

- Plan context card: `rounded-xl border border-border bg-card shadow-sm p-4`
- "Plan context" label: `text-xs font-medium text-muted` (no uppercase)
- Status chips: `rounded-full border border-border bg-card px-3 py-1 shadow-sm`
- "Open settings" link: `whitespace-nowrap` to prevent wrapping
- Fine print links: `underline underline-offset-2 hover:text-foreground`

### 14.10 Settings (`app/app/(app)/settings/page.tsx`)

- 4 grouped Panels (see Section 5, settings panel structure)
- Section labels within Panels: `text-xs font-medium text-muted` (no uppercase, no tracking-wide)
- Panel A (Appearance + Portfolio display + Profile): `rounded-xl border border-border bg-card shadow-sm` with `border-t border-border` dividers between sections
- Panel D (Danger zone): `border-negative/20` always visible on all breakpoints

### 14.11 Analyze Deal (`app/app/(app)/analyze/`)

- `<h1>` at Page level (no card wrapper)
- Description paragraph and "View saved deals" link at Page level
- Deal analyzer form section titles: `text-sm font-semibold text-foreground` (not uppercase)
- Table header row: `text-[11px] text-muted` (no uppercase tracking-wide)

### 14.12 Calculators (`app/app/(app)/calculators/` and public)

- Eyebrow label: `text-xs font-medium text-muted` (no uppercase)
- Section structure follows Page-level pattern (no card wrapper around page heading)

### 14.13 Changelog (`app/app/changelog/page.tsx`)

- Timeline list: `border-l-2 border-border ml-3` on `<ol>`
- Each entry dot: `size-3 rounded-full bg-accent absolute -left-[7px] top-2`
- Date chip: `inline-flex text-xs font-medium bg-card border border-border rounded-full px-2 py-0.5 text-muted`
- Entry title: `text-lg font-semibold text-foreground`

---

## 15. Anti-Patterns

These patterns are explicitly prohibited in all new and edited code.

### 15.1 Typography

- **Do not** use `uppercase tracking-wide` for any heading that is not a sidebar nav group label or table column header
- **Do not** use the same text style for a page section heading and a metric label within a card on the same page
- **Do not** use literal `←` or `→` characters as navigation arrows — always use Lucide `ChevronLeft` / `ChevronRight`
- **Do not** use `text-accent` for decorative text that is not interactive or a primary CTA

### 15.2 Colors and Borders

- **Do not** use `border-border/70` or `bg-card/95` — these opacity dilutions are deprecated. Use `border-border` and `bg-card`
- **Do not** use raw hex color values in components — always use semantic tokens (`text-accent`, not `text-[#6366f1]`)
- **Do not** use `--positive` (green) for non-semantic purposes. It means financial gain. Not for brand accents or decoration.

### 15.3 Cards and Surface

- **Do not** wrap page-level headings (`<h1>`) in a card container. No other workspace page does this.
- **Do not** use a card for every content grouping — apply the discrete object test first (Section 5)
- **Do not** have more than four or five sibling Panels on a page unless the content is genuinely a list of discrete objects
- **Do not** nest a Panel inside a Panel — use an Inset (`rounded-lg bg-subtle/40 p-3`) for secondary content inside a Panel
- **Do not** use `rounded-xl` buttons inside `rounded-xl` cards — child radii must be smaller than parent

### 15.4 Interactions

- **Do not** add `hover:bg-*`, `hover:text-*`, or `hover:shadow-*` without the appropriate `transition-*` class. A hover state without a transition is a design defect.
- **Do not** use `outline-none` on any interactive element without replacing it with explicit `focus-visible:ring-*` classes
- **Do not** use the brand accent color (`bg-accent`) on more than one prominent CTA per screen

### 15.5 Empty States

- **Do not** render blank space when a list has no data — every zero-data surface must have a designed empty state (Section 11)
- **Do not** use a plain text string like "No data" without heading, icon, and action
- **Do not** use PNG illustrations in empty states — use Lucide icons

### 15.6 Mobile

- **Do not** render the footer inside the authenticated app shell on mobile — `MobileBottomNav` replaces it
- **Do not** add `env(safe-area-inset-bottom)` dependent styling without confirming `viewport-fit=cover` is set in the viewport meta
- **Do not** have any `<button>` or `<a>` on mobile that renders below 44px in height — use `min-h-[44px]` as a guard

### 15.7 Social Proof

- **Do not** use anonymous unattributed quotes as social proof ("— Small landlord, 4 properties") — replace with honest factual claims or real attributable testimonials

### 15.8 Navigation

- **Do not** use `<a href="...">` for in-app navigation — always use Next.js `<Link href="...">` for client-side routing
- **Do not** wrap page-level back navigation in a card or panel

---

## Appendix A — Document History

| Version | Date | Description |
|---|---|---|
| 1.0 | 2026-04-01 | Phase 1: brand identity, token system, landing page rebuild, in-app polish |
| 2.0 | 2026-04-01 | Phase 2: motion tokens, loading skeletons, modeling/mortgage/plans/analyze pages |
| 2.5 | 2026-04-01 | Phase 3 Rollout: uppercase label removal, border pattern normalization, back-link icons |
| 3.0 | 2026-04-03 | **This document.** Consolidated canonical spec. Supersedes all prior phase documents. |

**Superseded documents** (kept as historical record):
- `docs/design/design-brief-2026.md` — Phase 1 brief
- `docs/design/design-brief-2026-phase2.md` — Phase 2 brief
- `docs/design/design-brief-2026-phase3.md` — Phase 3 brief
- `docs/design/implementation-guide-2026.md` — Phase 1 technical instructions
- `docs/design/implementation-guide-2026-phase2.md` — Phase 2 technical instructions
- `docs/design/implementation-guide-2026-phase3.md` — Phase 3 new design instructions
- `docs/design/implementation-guide-2026-phase3-rollout.md` — Phase 3 mechanical rollout
- `docs/design/phase3-execution-playbook.md` — Phase 3 execution playbook (completed)
