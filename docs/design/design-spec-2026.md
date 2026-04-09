# Veld Portfolio — Design Specification 2026

**Version:** 3.1 (reconciliation pass)
**Date:** 2026-04-04
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
10. [Motion and Animation](#10-motion-and-animation)
11. [Empty State System](#11-empty-state-system)
12. [Loading Skeleton Standard](#12-loading-skeleton-standard)
13. [Component Reference](#13-component-reference)
14. [Page Reference](#14-page-reference)
15. [Marketing Surface Patterns](#15-marketing-surface-patterns)
16. [Anti-Patterns](#16-anti-patterns)

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
| `--chart-1` | `#0ea5e9` | `#38bdf8` | Chart series |
| `--chart-2` | `#14b8a6` | `#2dd4bf` | Chart series |
| `--chart-3` | `#8b5cf6` | `#a78bfa` | Chart series (kept distinct from `--positive` in dark mode) |
| `--chart-4` | `#3b82f6` | `#60a5fa` | Chart series |
| `--chart-5` | `#06b6d4` | `#22d3ee` | Chart series |
| `--chart-6` | `#a855f7` | `#c084fc` | Extended chart series |
| `--chart-7` | `#ec4899` | `#f472b6` | Extended chart series |
| `--chart-8` | `#f97316` | `#fb923c` | Extended chart series |
| `--chart-9` | `#e11d48` | `#fb7185` | Extended chart series |
| `--chart-10` | `#eab308` | `#facc15` | Extended chart series |

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

**The opacity-variant rule:** Default to full-value tokens on app surfaces. Deprecated variants must not be introduced in new code:

- `border-border/70` -> `border-border`
- `border-border/60` -> `border-border`
- `bg-card/95`, `bg-card/90`, `bg-card/70` -> `bg-card`
- `bg-background/75` -> `bg-subtle` for section tints, `bg-foreground/50` for scrims/backdrops
- `bg-background/55`, `bg-background/35` -> `bg-card`

Exception: `components/calculators/calculator-metric.tsx` intentionally keeps its current border treatment for visual continuity.

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

## 10. Motion and Animation

### 10.1 Micro-interaction Policy Table

| Interaction Type | Duration | Tailwind |
|---|---|---|
| Button hover/active (color, bg) | 150ms | `transition-all duration-150` |
| Card hover (shadow lift) | 150ms | `transition-shadow duration-150` |
| Color-only hover (text, border) | 150ms | `transition-colors duration-150` |
| Card hover (lift) | 150ms | `transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md` |
| Tab indicator (underline travel) | 200ms | `transition-all duration-200` |
| Collapsible/accordion expand | 200ms | `transition-all duration-200` |
| Modal/drawer overlay | 300ms | `transition-all duration-300` |
| Page-level transitions | none | — |

### 10.2 The Mandatory Rule

Every `hover:bg-*`, `hover:text-*`, or `hover:shadow-*` class must be accompanied by the appropriate `transition-*` class. A hover state without a transition is a design defect.

### 10.3 No Page Transitions

Page-level navigation transitions are not used. They cause layout jank on Next.js App Router navigation and increase perceived load time.

### 10.4 CSS-First Entrance Animation — `hero-animate`

`hero-animate` is a CSS class defined in `globals.css` that produces a fade-in + slide-up entrance on initial page render. It uses `@starting-style` so the element begins invisible and already-positioned in the DOM — no JavaScript or state required.

```css
/* Only fires when user has no reduced-motion preference */
@media (prefers-reduced-motion: no-preference) {
  .hero-animate {
    transition: opacity 400ms ease-out, transform 400ms ease-out;
    transition-behavior: allow-discrete;
  }
  @starting-style {
    .hero-animate {
      opacity: 0;
      transform: translateY(8px);
    }
  }
}
```

**Usage rules:**
- Apply to hero headline, subheadline, CTA cluster, and trust line on landing pages and changelog
- Stagger within a group using inline `style={{ transitionDelay: "Xms" }}`. Recommended steps: 0ms, 80ms, 160ms, 220ms, 280ms, 300ms
- Never apply `hero-animate` to elements below the fold — use `reveal-up` instead
- Never apply to elements inside an already-animated parent (the stagger handles sequencing)
- Requires no JavaScript — fires purely from `@starting-style`

### 10.5 Staggered Reveal — `reveal-up` / `reveal-up-d1..d5`

`reveal-up` is a CSS class system for page-load stagger cascades on marketing pages (pricing, changelog). It uses the same `@starting-style` mechanism as `hero-animate` but is paired with named delay modifier classes.

```css
@media (prefers-reduced-motion: no-preference) {
  .reveal-up {
    transition: opacity 500ms var(--ease-out), transform 500ms var(--ease-out);
    transition-behavior: allow-discrete;
  }
  .reveal-up-d1 { transition-delay: 80ms; }
  .reveal-up-d2 { transition-delay: 160ms; }
  .reveal-up-d3 { transition-delay: 240ms; }
  .reveal-up-d4 { transition-delay: 320ms; }
  .reveal-up-d5 { transition-delay: 400ms; }
  @starting-style {
    .reveal-up {
      opacity: 0;
      transform: translateY(10px);
    }
  }
}
```

**Usage rules:**
- Apply `reveal-up` as the base class; add `reveal-up-d1` through `reveal-up-d5` for sequential cascade
- Cycle through `d1..d5` when a list has more than 5 items (e.g. changelog entries)
- Use on elements that are in the DOM at page load but below-the-fold (pricing page `h1`, subheadline, pricing cards)
- Not a substitute for `AnimatedSection` (which uses IntersectionObserver): `reveal-up` fires on load regardless of scroll position; `AnimatedSection` fires when the element scrolls into view

### 10.6 Scroll-Triggered Animation — `AnimatedSection`

`AnimatedSection` (`components/marketing/animated-section.tsx`) is a client component that wraps section content and plays an entrance animation when the element intersects the viewport.

**Mechanism:**
- Uses `IntersectionObserver` with `threshold: 0.08` (8% visible)
- Fires once then disconnects — no re-animation on scroll-out
- Animation classes use `motion-safe:` prefix so reduced-motion users see static content
- Duration: 500ms ease-out, translateY(3px) → translateY(0)

**Usage rules:**
- Wrap the **inner content `<div>`**, not the `<section>` element itself — section background colors must not be animated in/out
- Every marketing landing-page section below the fold (value props, How it works, Honest Scope, pricing preview, bottom CTA) should use `AnimatedSection`
- Do not use inside `hero-animate` or `reveal-up` elements — they already have their own animation path

### 10.7 CTA Glow — `cta-accent-glow`

A CSS utility that applies a soft accent-colored ambient shadow behind primary CTA buttons:

```css
.cta-accent-glow {
  box-shadow: 0 0 20px color-mix(in srgb, var(--accent) 15%, transparent);
}
```

Apply only to the single primary accent CTA per page (e.g. `Get started free`, `Create your free account`). Not for secondary or ghost buttons. Not for links styled as buttons.

### 10.8 Off-Limits Patterns

The following are explicitly prohibited:

- **Scroll hijack** — any animation that locks, slows, or re-routes scroll input
- **Loop animations** — `animation-iteration-count: infinite` on any visible element
- **LCP-blocking animation** — do not apply `opacity: 0` as an initial state to the largest contentful element on the page (e.g. the hero `<h1>`) without using `@starting-style`, which only fires once and does not affect LCP measurement
- **JS-driven per-frame animation** — use CSS transitions and `@starting-style`; do not use `requestAnimationFrame` loops or Spring physics libraries for decorative motion
- **Animation without reduced-motion gate** — every animation must use `motion-safe:` prefix (Tailwind utility) or be inside a `@media (prefers-reduced-motion: no-preference)` block

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

- Logo: `<Image src="/favicon.svg" width={24} height={24} className="size-6 shrink-0 object-contain">` + "Veld" text in `flex items-center gap-2 text-lg font-semibold text-foreground`
- Logo image renders at **24×24px** (`size-6`). The 2.3 Brand Identity table shows 20×20 for reference sizing — the actual implementation is 24×24.
- Nav wrapper: `w-full border-b border-border bg-background`
- Nav inner: `mx-auto flex max-w-6xl items-center justify-between px-4 py-3`
- Nav links: `text-muted transition-colors duration-150 hover:text-foreground text-sm`
- Sign up CTA: `bg-accent text-accent-foreground hover:bg-accent-hover rounded-lg px-4 py-2 text-sm font-medium` (mobile: full-width `py-3`; desktop: `inline-block w-auto py-2`)
- Hamburger: `size-11 min-h-11 min-w-11` (44px minimum touch target), `rounded-lg`, `hover:bg-subtle`
- Mobile drawer: slides in from the right, `w-64 inset-y-0 right-0 z-50`, `translate-x-full` → `translate-x-0`
- Mobile overlay: `fixed inset-0 z-40 bg-background/80 backdrop-blur-sm` behind the drawer
- Accessibility: `role="dialog"` + `aria-modal="true"` + Escape key handler + focus trap on open; hamburger has `aria-expanded` + `aria-controls`
- Desktop link order (left → right): [Dashboard if signed in] · Calculators · Pricing · Changelog · Sign in · Sign up
- Body scroll lock (`overflow: hidden`) applied while mobile menu is open

### 13.6 PricingCards (`components/pricing-cards.tsx`)

- Each card: `flex flex-col rounded-xl border bg-card p-4 shadow-sm md:p-5` — use `bg-card` at full value; opacity variants (`bg-card/95`) add no visual benefit here
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

### 13.10 MobileCollapsible and Mobile Tool Primitives

- `MobileCollapsible`: label uses `text-sm font-medium text-muted` (no uppercase)
- `MobileSectionCard` and `MobileSummaryRail` were removed after migration; do not reintroduce them.
- For active mobile development, use:
  - `MobileContextBar` (context row)
  - `MobileStatStrip` (summary metrics)
  - `MobilePageSection` (`grouped` + `flat`)
  - `MobileFormGroup` (input clustering)
- Preferred order on mobile tool pages: context bar -> stat strip -> primary chart/result -> assumptions/input sections.

### 13.11 MockupFrame (`components/mockups/mockup-frame.tsx`)

A client component that renders a product screenshot mockup at a fixed internal width and CSS-scales it to fit any container. Used on landing, pricing, and calculator pages.

**Props:**
- `internalWidth` (default: 960) — the pixel width the content is designed at
- `fitToHeight` (boolean) — scales to fit an explicit container height (used for side-by-side pricing page mockups)
- `chrome` (boolean) — renders a browser-style chrome bar (3 neutral dots on `bg-subtle`) at the top
- `ariaLabel` (required) — the accessible label for `role="img"`; must describe the data visible inside the mockup

**Rendering contract:**
- Outer container: `overflow-hidden` + your layout/shadow classes (e.g. `rounded-xl border border-border shadow-xl`)
- Inner content: `pointer-events-none select-none`, positioned absolutely, CSS-scaled via `transform: scale(N)`
- Content fades in from `opacity: 0` once the scale is calculated (prevents layout flash at 0 scale)
- Minimum height before scale resolves: `min-h-[min(28rem,65vh)]` (only when `fitToHeight` is false)

**Usage rules:**
- Always provide a meaningful `ariaLabel` describing the visible data (not "product screenshot")
- Apply shadow and border on the outer wrapper, not on MockupFrame's className — MockupFrame adds `overflow-hidden` which clips shadows
- Use `fitToHeight` when the container has an explicit `h-[Xpx]` height and the mockup should fill it
- Use `chrome` only when the landing hero needs the browser-window context (typically just the main hero mockup)

### 13.12 AnimatedSection (`components/marketing/animated-section.tsx`)

See Section 10.6 for the full specification. Component summary:

- Wraps section content in a `<div>` that is invisible until the element enters the viewport
- Uses `IntersectionObserver` with `threshold: 0.08`, fires once then disconnects
- All animation classes use `motion-safe:` prefix — reduced-motion users see fully static content
- Wrap the inner content `<div>`, never the `<section>` element itself

### 13.13 CalculatorMetric (`components/calculators/calculator-metric.tsx`)

The result tile used in all calculator components to display computed metrics.

```tsx
<div className="rounded-md border border-border/70 bg-background/45 px-3 py-2 [border-l-2 tone-class when tone is set]">
  <p className="text-xs text-muted">{label}</p>
  <p className="mt-1 text-base font-semibold [tone-value-class]">{value}</p>
  {helper && <p className="mt-0.5 text-[11px] text-muted">{helper}</p>}
</div>
```

**Tone system** (`lib/calculator-metric-tones.ts`):
- `default` — no left border accent, value in `text-foreground`
- `positive` — `border-l-2 border-positive`, value in `text-positive`
- `negative` — `border-l-2 border-negative`, value in `text-negative`
- `warning` — `border-l-2 border-warning`, value in `text-warning`
- `neutral` — no border accent, value in `text-muted`

This component currently uses `border-border/70` and `bg-background/45` as a legacy exception for calculator metric readability. Do not copy this pattern into new components; default to full-value tokens per the Phase 5 deprecation rules in §5.

### 13.14 FunnelCtaLink (`components/marketing/funnel-cta-link.tsx`)

An analytics-instrumented wrapper around Next.js `<Link>` used for all marketing CTAs that should be tracked in the conversion funnel. Accepts all standard link props plus:

- `placement` — where on the page the CTA lives (e.g. `"landing_hero"`, `"brrr_footer"`)
- `ctaId` — the action (e.g. `"get_started_free"`, `"view_pricing"`)
- `planIntent` — optional plan tier the user is signaling interest in (`"free"`, `"investor"`, `"pro"`)
- `landingVariant` — A/B variant identifier for attribution

**Usage rules:**
- Use `FunnelCtaLink` for every primary and secondary CTA that leads to sign-up, sign-in, pricing, or plan upgrade
- Use plain `<Link>` for navigation that is not part of the conversion funnel (e.g. changelog link in footer, "All calculators" sibling link)
- Never use `<a href="...">` for in-app navigation

---

## 14. Page Reference

### 14.1 Landing Page (`app/app/page.tsx`)

**Section order:**
1. LandingNav
2. Hero — asymmetric grid (`lg:grid-cols-[3fr_2fr]`): copy left, product screenshot right (hidden below `md`)
3. Social proof strip — `border-y border-border bg-subtle px-4 py-6`. Factual positioning statements (not anonymous quotes). Three items separated by `hidden sm:block` pipe dividers.
4. Calculator section — `border-b border-border bg-subtle px-4 py-12 sm:py-16` with "Free tool" eyebrow pill, L2 heading, description, `<PublicCalculator compact />`, "Open full calculator" accent link, and sibling calculator links
5. Value props — `px-4 py-12 sm:py-16` with "Why Veld" eyebrow, L2 heading, 4-column card grid with hover lift
6. How it works — `px-4 py-12 sm:py-16` with "How it works" eyebrow, L2 heading, 3-column numbered step layout (no cards)
7. Honest Scope — `border-y border-border bg-subtle px-4 py-12 sm:py-16` with two `rounded-xl border border-border bg-card p-6 shadow-sm` cards side-by-side
8. Pricing preview — `px-4 py-12 sm:py-16` with "Pricing" eyebrow, L2 heading, 3 tier cards, "See full pricing" secondary button, "or sign up free" ghost link
9. Bottom CTA strip (signed-out only) — `border-y border-border bg-subtle px-4 py-16 sm:py-20`, centered: L2 heading + subtext + primary `cta-accent-glow` CTA + ghost comparison link + footnote text
10. Footer

**Hero details:**
- Section background: `bg-gradient-to-b from-accent/[0.04] to-transparent` — subtle accent tint that fades out, hero section only
- Hero h1: `text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight` with `hero-animate` class and `transitionDelay: 0ms`
- Sub-headline: `text-base sm:text-lg text-muted` with `hero-animate` and `transitionDelay: 80ms`
- CTA cluster: `hero-animate flex flex-col gap-3 sm:flex-row sm:items-center` with `transitionDelay: 160ms`. Signed-out: primary accent button (`cta-accent-glow`) + ghost `See pricing` link. Signed-in: `Go to dashboard` + ghost `View pricing` link.
- Trust line (signed-out only): `hero-animate text-sm text-muted` with `transitionDelay: 220ms`
- Mobile mockup: `hero-animate sm:hidden` — `MockupFrame` + `DashboardMockup` rendered inline in the copy column below the CTA cluster, hidden at `sm` breakpoint; `transitionDelay: 280ms`
- HERO_STEPS mini-cards: `hero-animate hidden sm:grid sm:grid-cols-3 gap-2` — 3 compact cards (`rounded-lg border border-border bg-card p-3 shadow-sm`) each with a `size-4 text-accent` Lucide icon and `text-sm font-semibold` title and `text-xs text-muted` description; `transitionDelay: 300ms`
- Desktop mockup column: `hidden md:block` — `MockupFrame chrome className="rounded-xl border border-border shadow-xl"` (note: `md:block` not `lg:block`)
- Social proof strip row: `hero-animate` with `transitionDelay: 400ms`

**Value props cards (section 5):** Each: `flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md`. Icon container: `flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/10` with `size-5 text-accent` icon. The Y-translate lift is specific to marketing value prop cards. Do not use on in-app data cards.

**How it works steps (section 6):** Each step: `flex flex-col gap-4` (no card wrapper, no border). Step number circle: `flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-bold tabular-nums text-accent`. Icon: `size-5 text-muted` (decorative). Title: `text-base font-semibold text-foreground`. Description: `text-sm text-muted`.

**Honest Scope cards (section 7):** "What Veld does": `<Check className="mt-0.5 size-4 shrink-0 text-positive">` bullets. "What it doesn't do": `<Minus className="mt-0.5 size-4 shrink-0 text-muted">` bullets. Caption line below the "doesn't do" list: `text-xs text-muted`.

**Accent-pill eyebrow pattern** (used across all marketing surfaces):
```tsx
<div className="mb-3 flex justify-center sm:justify-start">
  <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
    Eyebrow label
  </span>
</div>
```
On centered sections (bottom CTA, pricing preview on landing, pricing page sections): `justify-center` only. On left-aligned sections: `justify-center sm:justify-start`.

### 14.2 Pricing Page (`app/app/pricing/page.tsx`)

**Section order:**
1. LandingNav
2. Page heading (`Pricing`, L1, `reveal-up`) + subtext (`reveal-up reveal-up-d1`) + trust pills (`reveal-up reveal-up-d2`, signed-out only)
3. `PricingCards` component (`reveal-up reveal-up-d3`)
4. Fine print (Billing, refunds, cancellation links) — `text-xs text-muted underline underline-offset-2`
5. Feature comparison — desktop table (`hidden md:block`): 4 columns (Feature label + Free + Investor + Pro); `overflow-hidden rounded-xl border border-border shadow-sm`; header row `bg-subtle`; even rows `bg-subtle/30`
6. Feature comparison — mobile accordion (`md:hidden`): `<details className="rounded-xl border border-border">` with "Compare all features" `<summary>`; Estimate pool row removed on mobile
7. Pricing FAQ — "FAQ" eyebrow pill + "Common questions" L2 heading + 4 `<details className="rounded-xl border border-border bg-card">` items
8. Screenshot preview (signed-out only) — "Preview" eyebrow pill + "See it in action" L2 heading + `MockupFrame` grid (DashboardMockup full-width + MortgageMockup + DealAnalyzerMockup side-by-side)
9. Bottom CTA card (signed-out only) — `rounded-xl border border-border bg-card p-6 md:p-8 shadow-sm` with two-column grid: headline + inline mini-FAQ `<details>` on the left; sign-up + sign-in button box on the right
10. Footer

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

**Mini-FAQ `<details>` inside the bottom CTA card** — each uses `rounded-lg border border-border p-3 transition-colors duration-150 hover:bg-subtle`, summary has `list-none cursor-pointer text-sm font-medium text-foreground`.

**Screenshot grid (`MockupFrame` usage on pricing page):**
- Full-width dashboard mockup: `className="rounded-xl border border-border shadow-lg md:col-span-2"`
- Side-by-side mortgage + deal-analyzer mockups: `fitToHeight className="h-[340px] ... shadow-lg md:h-[380px] lg:h-[400px]"` — uses `fitToHeight` prop so the mockup scales to the explicit container height

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

### 14.12 Public Calculator Pages (`app/app/tools/`)

There are two types of calculator page:

**Tools hub (`app/app/tools/page.tsx`):**
- Hero: `hero-animate rounded-xl border border-border bg-card px-6 py-8 text-center shadow-sm md:px-8 md:py-10` — the hero is itself a card on the tools hub (unlike all other marketing pages where the hero is a bare section). This is intentional: it makes the hub feel like a contained tool destination.
- h1: `text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground`
- Sub-headline: `text-base text-muted mx-auto max-w-xl`
- CTA (signed-out): primary accent button inline below the sub-headline
- Calculator cards grid: rendered by `CalculatorsHubCards variant="public"` below the hero
- Footer text row: `reveal-up reveal-up-d5 text-center text-sm text-muted` with inline links using `font-medium text-foreground hover:underline`

**Individual calculator pages** (e.g. `app/app/tools/brrr/page.tsx`):
- Page section order: breadcrumb nav → `hero-animate` centered header → `reveal-up reveal-up-d1` calculator block → `CalculatorFaqSection` → CTA strip (signed-out only) → sibling links footnote
- Breadcrumb: `flex items-center gap-1.5 text-sm text-muted` with `<ChevronRight className="size-3.5 text-muted/50">` as separator; current item `text-foreground`. This is the only surface that uses `<ChevronRight>` as a breadcrumb separator instead of a "/".
- Calculator header: centered, no card wrapper; `text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground` h1; sub-headline `text-base text-muted mx-auto max-w-2xl`
- Calculator block: no additional wrapper beyond the calculator component's own panel
- CTA strip (signed-out only): `rounded-xl border border-accent/20 bg-accent/5 p-6 text-center` — accent-tinted, not a neutral card. Contains primary accent button + secondary "See plans" neutral-border button.
- Sibling links footnote: `text-center text-sm text-muted` with inline `font-medium text-foreground hover:underline` links

**Calculator location pages** (`app/app/tools/[calculator]/[location]/page.tsx`):
- Same structure as individual calculator pages but with an additional local context `<MobileCollapsible>` block after the FAQ section
- Local context inset: `rounded-lg bg-subtle/40 p-5 md:p-6` (Inset surface — no border, no shadow per Section 5)
- Local context data list: `<dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">` with `<dt className="text-muted">` and `<dd className="font-medium text-foreground sm:col-span-2">`

**In-app calculators** (`app/app/(app)/calculators/`):
- Eyebrow label: `text-xs font-medium text-muted` (no uppercase)
- Section structure follows Page-level pattern (no card wrapper around page heading)

### 14.13 Changelog (`app/app/changelog/page.tsx`)

**Page structure:**
- Outer: `<article className="mx-auto min-w-0 max-w-2xl">` — single-column reading layout at `max-w-2xl`
- Page header: `<header className="hero-animate">` containing: "What's new" eyebrow pill (left-aligned, no centering), `text-3xl sm:text-4xl font-semibold tracking-tight` h1, `text-base leading-relaxed text-muted` sub-headline

**Timeline:**
- List: `<ol className="relative mt-10 space-y-8 border-l-2 border-border pl-6 md:space-y-10">`
- Each item: `<li className="relative reveal-up [stagger class]">` — entries stagger using `reveal-up-d1` through `reveal-up-d5`, cycling when there are more than 5 entries
- Timeline dot: `absolute -left-[1.9375rem] top-5 size-3 rounded-full bg-accent ring-2 ring-background` — the `ring-2 ring-background` creates a halo around the dot that separates it visually from the left border line. Offset `-left-[1.9375rem]` positions the dot centered on the 2px border line.
- Entry card: `rounded-xl border border-border bg-card p-4 shadow-sm md:p-5`
- Header row inside card: `flex flex-wrap items-baseline gap-x-3 gap-y-1`
- Date chip: `<time className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-medium tabular-nums text-muted shadow-sm">` — uses `bg-background` (not `bg-card`), `px-2.5`, `tabular-nums`, and `shadow-sm`
- Entry title: `text-lg font-semibold text-foreground` as `<h2>`
- Items list: `<ul className="mt-4 list-disc space-y-2.5 pl-5 text-sm leading-relaxed text-foreground">`

**Footer row:** `text-sm leading-relaxed text-muted` with inline accent links styled as `font-medium text-accent underline underline-offset-2 transition-colors duration-150 hover:text-accent-hover rounded-sm px-1 py-2.5 sm:py-1.5` (the generous padding satisfies the 44px touch target requirement for tapped links on mobile)

---

## 15. Marketing Surface Patterns

This section defines the structural and visual conventions that apply to all public marketing pages (landing, pricing, calculator hub, individual calculator pages, changelog, competitor/alternative pages, resource articles). These patterns complement the component specifications in Section 13 and page references in Section 14.

### 15.1 Marketing Page Shell

All public marketing pages share the same shell:

```
<div className="flex min-h-screen flex-col bg-background">
  <LandingNav userId={...} />
  <main className="flex-1 ...">
    ...sections...
  </main>
  <Footer supportEmail={...} />
</div>
```

The `flex-1` on `<main>` ensures the footer stays pinned to the bottom on short pages. Do not add `bg-card` or any surface color to the shell — sections control their own backgrounds.

### 15.2 Section Background Rhythm

Marketing pages alternate between `bg-background` and `bg-subtle` sections to create visual rhythm without hard borders between content areas. Sections with `border-b border-border` (or `border-y`) are the exceptions — used when a section needs explicit separation (social proof strip, calculator section, honest scope, bottom CTA strip).

| Section type | Background |
|---|---|
| Hero | `bg-gradient-to-b from-accent/[0.04] to-transparent` |
| Social proof / honest scope / CTA strips | `bg-subtle` with `border-y border-border` |
| Calculator, feature sections | `bg-subtle` with `border-b border-border` |
| Value props, How it works, pricing preview | `bg-background` (default) |
| Changelog, tools hub content | `bg-background` (default) |

### 15.3 Section Vertical Spacing

Marketing sections use `py-12 sm:py-16` as the standard. Full-emphasis CTA strips use `py-16 sm:py-20`. The hero uses `py-10 sm:py-14`.

`max-w-5xl` is the standard content width for most sections. `max-w-6xl` for wider grid layouts (4-column value props, pricing cards). `max-w-3xl` for focused single-column content (pricing preview on landing). `max-w-2xl` for reading-oriented content (changelog, FAQ answers). Always wrap content in `<div className="mx-auto max-w-[N]">` inside the section padding div.

### 15.4 FAQ Accordion Pattern

Two accordion patterns are in use, for different contexts:

**Standalone FAQ section** (pricing page FAQ, used when FAQs are the primary content):
```tsx
<details className="rounded-xl border border-border bg-card">
  <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-foreground transition-colors duration-150 hover:text-foreground/80">
    Question text
  </summary>
  <p className="px-5 pb-4 text-sm text-muted">Answer text</p>
</details>
```
Group multiple `<details>` in a `space-y-2` container.

**Inline mini-FAQ** (inside a CTA card, like the pricing page bottom card):
```tsx
<details className="group rounded-lg border border-border p-3 transition-colors duration-150 hover:bg-subtle">
  <summary className="cursor-pointer list-none text-sm font-medium text-foreground">
    Question text
  </summary>
  <p className="mt-2 text-sm text-muted">Answer text</p>
</details>
```
Used inside panels where FAQs are secondary content supplementing a CTA. Uses `rounded-lg` (smaller than standalone) and `list-none` on summary.

**`CalculatorFaqSection`** (calculator pages): NOT an accordion. Uses a `<dl>` pattern — questions as `<dt className="font-medium text-foreground">`, answers as `<dd className="mt-1 text-sm leading-relaxed text-muted">`. Groups have `space-y-6`. Choose this pattern when answers are always visible and brevity is a priority.

### 15.5 Feature Comparison Table

Desktop feature comparison tables use a contained card treatment:
```tsx
<div className="overflow-hidden rounded-xl border border-border shadow-sm">
  <table className="w-full text-sm">
    <thead>
      <tr className="border-b border-border bg-subtle">
        <th className="px-4 py-3 text-left font-medium text-muted">Feature</th>
        ...plan headers...
      </tr>
    </thead>
    <tbody>
      {rows.map((row, i) => (
        <tr className={`border-b border-border last:border-0 ${i % 2 !== 0 ? "bg-subtle/30" : ""}`}>
          ...
        </tr>
      ))}
    </tbody>
  </table>
</div>
```
- Alternating row tint: odd-indexed rows get `bg-subtle/30`
- Last row: `last:border-0` removes the bottom border
- Boolean values: `<span className="font-semibold text-positive">✓</span>` for included, `<span className="text-muted/40">—</span>` for not included
- `overflow-hidden rounded-xl` on the wrapper clips the table header corners

Mobile companion: `<details className="rounded-xl border border-border">` with a "Compare all features" summary; each row is `flex items-center justify-between gap-4 py-2.5 text-sm`. Remove rows with complex multi-value data that doesn't compress to mobile layout (Estimate pool row is removed from the mobile accordion).

### 15.6 Breadcrumb Navigation Pattern

Used on individual calculator and location pages. Not used on landing, pricing, or changelog.

```tsx
<nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
  <Link href="/tools" className="transition-colors duration-150 hover:text-foreground">
    Calculators
  </Link>
  <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
  <span className="text-foreground">Current page</span>
</nav>
```

For location sub-pages, the breadcrumb extends to three items (Calculators / Calculator name / Location) without additional `<ChevronRight>` — a "/" text separator is used instead at the third level.

### 15.7 Trust Pill Pattern

Used on the pricing page header (signed-out state) to reinforce credibility near the CTA:

```tsx
<span className="rounded-full border border-border bg-card px-3 py-1 shadow-sm text-sm text-muted">
  Trust claim
</span>
```

Group multiple pills in a `flex flex-wrap justify-center gap-2`. Pills use `bg-card` (not `bg-subtle`) to appear slightly lifted off the page background.

### 15.8 Pricing Preview Card Pattern

Used on the landing page pricing section (not the full pricing page). Three tier cards in `grid grid-cols-1 gap-3 sm:grid-cols-3`:

- Standard plan: `rounded-xl border border-border bg-card p-5 shadow-sm`
- Recommended plan (Investor): `rounded-xl border border-accent/50 bg-accent/5 p-5 shadow-sm ring-2 ring-accent/25` with an inline `Popular` badge: `rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground`
- Price figure: `text-2xl font-semibold tabular-nums text-foreground` with `/mo` as `text-base font-normal text-muted`

CTA row below cards: primary = secondary button (`rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-subtle`) leading to full pricing; secondary = ghost link (`text-muted hover:text-foreground`) for sign-up.

### 15.9 Bottom CTA Strip Pattern

The bottom CTA strip is the final conversion opportunity before the footer on the landing page. It appears **only for signed-out users**.

Structure:
```
border-y border-border bg-subtle
  max-w-xl text-center
    L2 heading
    text-base text-muted subtext
    flex gap-3 (primary CTA + ghost secondary)
    text-xs text-muted footnote
```

- Primary button: `cta-accent-glow inline-flex min-h-[44px] items-center justify-center rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover`
- Secondary ghost: `inline-flex min-h-[44px] items-center gap-1 text-sm font-medium text-muted transition-colors duration-150 hover:text-foreground` + `ChevronRight size-4`
- Footnote: `text-xs text-muted` — a short reassurance line (e.g. "Your first property in about 60 seconds.")
- The entire section wraps in `<AnimatedSection>`

### 15.10 MockupFrame Usage Conventions

| Context | Chrome | Shadow | fitToHeight |
|---|---|---|---|
| Hero landing (desktop right col) | `chrome` | `shadow-xl` | false |
| Hero landing (mobile inline) | — | `shadow-lg` | false |
| Pricing screenshot grid (full-width) | — | `shadow-lg` | false |
| Pricing screenshot grid (side-by-side) | — | `shadow-lg` | `true` + explicit `h-[340px]` |

Always apply `rounded-xl border border-border` on the `className` prop of `MockupFrame`. The `overflow-hidden` on the outer container clips any shadow applied to `className` — instead, apply shadow to a wrapping `<div>` if you need shadow outside the clip boundary. In practice, `shadow-lg` and `shadow-xl` render correctly because they are applied before the `overflow-hidden` clips the element.

---

## 16. Anti-Patterns

These patterns are explicitly prohibited in all new and edited code.

### 16.1 Typography

- **Do not** use `uppercase tracking-wide` for any heading that is not a sidebar nav group label or table column header
- **Do not** use the same text style for a page section heading and a metric label within a card on the same page
- **Do not** use literal `←` or `→` characters as navigation arrows — always use Lucide `ChevronLeft` / `ChevronRight`
- **Do not** use `text-accent` for decorative text that is not interactive or a primary CTA

### 16.2 Colors and Borders

- Prefer `border-border` and `bg-card` at full values for standard Panel surfaces. Do not introduce deprecated opacity variants (`border-border/70`, `border-border/60`, `bg-card/95`, `bg-card/90`, `bg-card/70`) outside documented legacy exceptions.
- **Do not** use raw hex color values in components — always use semantic tokens (`text-accent`, not `text-[#6366f1]`)
- **Do not** use `--positive` (green) for non-semantic purposes. It means financial gain. Not for brand accents or decoration.

### 16.3 Cards and Surface

- **Do not** wrap page-level headings (`<h1>`) in a card container on in-app workspace pages. (Exception: the tools hub `app/app/tools/page.tsx` intentionally wraps its hero in a card — this is a marketing surface convention, not an app pattern.)
- **Do not** use a card for every content grouping — apply the discrete object test first (Section 5)
- **Do not** have more than four or five sibling Panels on a page unless the content is genuinely a list of discrete objects
- **Do not** nest a Panel inside a Panel — use an Inset (`rounded-lg bg-subtle/40 p-3`) for secondary content inside a Panel
- **Do not** use `rounded-xl` buttons inside `rounded-xl` cards — child radii must be smaller than parent

### 16.4 Interactions

- **Do not** add `hover:bg-*`, `hover:text-*`, or `hover:shadow-*` without the appropriate `transition-*` class. A hover state without a transition is a design defect.
- **Do not** use `outline-none` on any interactive element without replacing it with explicit `focus-visible:ring-*` classes
- **Do not** use the brand accent color (`bg-accent`) on more than one prominent CTA per screen

### 16.5 Motion

- **Do not** add any `transition-*` or `animation-*` without a reduced-motion fallback (`motion-safe:` prefix or inside `@media (prefers-reduced-motion: no-preference)`)
- **Do not** use `hover:-translate-y-*` on in-app data cards — the Y-translate hover lift is reserved for marketing value prop cards only
- **Do not** apply `hero-animate` to elements below the fold — use `reveal-up` or `AnimatedSection`
- **Do not** use `AnimatedSection` inside a `hero-animate` or `reveal-up` element
- **Do not** use scroll-hijack, infinite loops, or LCP-blocking animation (see Section 10.8 for full list)
- **Do not** apply `cta-accent-glow` to secondary or ghost buttons — only the single primary accent CTA per page

### 16.6 Empty States

- **Do not** render blank space when a list has no data — every zero-data surface must have a designed empty state (Section 11)
- **Do not** use a plain text string like "No data" without heading, icon, and action
- **Do not** use PNG illustrations in empty states — use Lucide icons

### 16.7 Mobile

- **Do not** render the footer inside the authenticated app shell on mobile — `MobileBottomNav` replaces it
- **Do not** add `env(safe-area-inset-bottom)` dependent styling without confirming `viewport-fit=cover` is set in the viewport meta
- **Do not** have any `<button>` or `<a>` on mobile that renders below 44px in height — use `min-h-[44px]` as a guard
- **Do not** ship mobile forms with `text-sm`-only input sizing. Use `text-base md:text-sm` to prevent iOS Safari zoom-on-focus
- **Do not** stack redundant chrome (duplicate quick links + bottom nav, verbose header + context bar, multiple sticky bars competing on one view)
- **Do not** hide a page's primary chart/result behind a default-closed collapsible
- Use the mobile z-index scale consistently: `z-10` local sticky controls, `z-40` app header/non-nav overlays, `z-50` nav/drawer/modal shells, `z-[70]` onboarding tier

### 16.8 Social Proof

- **Do not** use anonymous unattributed quotes as social proof ("— Small landlord, 4 properties") — replace with honest factual claims or real attributable testimonials

### 16.9 Navigation

- **Do not** use `<a href="...">` for in-app navigation — always use Next.js `<Link href="...">` for client-side routing
- **Do not** wrap page-level back navigation in a card or panel

---

## Appendix A — Document History

| Version | Date | Description |
|---|---|---|
| 1.0 | 2026-04-01 | Phase 1: brand identity, token system, landing page rebuild, in-app polish |
| 2.0 | 2026-04-01 | Phase 2: motion tokens, loading skeletons, modeling/mortgage/plans/analyze pages |
| 2.5 | 2026-04-01 | Phase 3 Rollout: uppercase label removal, border pattern normalization, back-link icons |
| 3.0 | 2026-04-03 | Consolidated canonical spec. Supersedes all prior phase documents. |
| 3.1 | 2026-04-04 | **This document.** Spec reconciliation pass: added Section 10 motion system (hero-animate, reveal-up, AnimatedSection, cta-accent-glow), Section 15 Marketing Surface Patterns, Section 16 (renumbered Anti-Patterns); added Component entries 13.11–13.14 (MockupFrame, AnimatedSection, CalculatorMetric, FunnelCtaLink); corrected 13.5 logo size, 13.6 bg-card/95 contradiction, 14.1 landing page section count and hero details, 14.2 pricing page comparison table column count and screenshot section, 14.12 calculator page layouts, 14.13 changelog timeline dot and date chip. |
| 3.2 | 2026-04-06 | Mobile redesign codification pass: deprecated opacity token replacements, migration guidance away from `MobileSectionCard`/`MobileSummaryRail`, and explicit mobile rules for content-first ordering, iOS zoom-safe inputs, chrome reduction, and z-index tiers. |

**Superseded documents** (kept as historical record):
- `docs/design/design-brief-2026.md` — Phase 1 brief
- `docs/design/design-brief-2026-phase2.md` — Phase 2 brief
- `docs/design/design-brief-2026-phase3.md` — Phase 3 brief
- `docs/design/implementation-guide-2026.md` — Phase 1 technical instructions
- `docs/design/implementation-guide-2026-phase2.md` — Phase 2 technical instructions
- `docs/design/implementation-guide-2026-phase3.md` — Phase 3 new design instructions
- `docs/design/implementation-guide-2026-phase3-rollout.md` — Phase 3 mechanical rollout
- `docs/design/phase3-execution-playbook.md` — Phase 3 execution playbook (completed)
