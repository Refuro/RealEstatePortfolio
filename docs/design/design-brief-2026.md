# Veld Portfolio — Design Brief 2026

**Version:** 1.0  
**Date:** 2026-04-01  
**Status:** Active — supersedes relevant visual sections of `docs/policies/design-spec.md`  
**Scope:** Full visual overhaul of marketing site and in-app product  
**Companion document:** `docs/design/implementation-guide-2026.md` (AI-executable technical instructions)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Brand Identity Refresh](#2-brand-identity-refresh)
   - [2.9 Surface Hierarchy](#29-surface-hierarchy)
3. [Design Pillars](#3-design-pillars)
4. [What We Are Not Changing](#4-what-we-are-not-changing)
5. [Public Marketing Site](#5-public-marketing-site)
6. [In-App Product](#6-in-app-product)
7. [Shared Component Reference](#7-shared-component-reference)
8. [Anti-Patterns and Rules](#8-anti-patterns-and-rules)

---

## 1. Executive Summary

Veld Portfolio is a well-built product running on a modern stack (Next.js 16, React 19, Tailwind CSS v4, Geist). The architecture and token system are sound. What is failing is the visual expression on top of that foundation.

The current design is technically consistent but visually anonymous. The accent color is pure black — indistinguishable from body text. The marketing site undersells the product: no hero with the product visible above the fold, no social proof, and a section rhythm so uniform that the page reads as one continuous gray surface. The in-app UI is functional but clinical — no visual identity, no sense of delight, no trend data to give users a reason to return.

This overhaul operates on two levels:

**Marketing site: full rebuild.** The landing page, navigation, and pricing surface need to tell a story, establish visual identity, and create conversion urgency. This is closer to a new page than an edit.

**In-app product: coordinated polish pass.** The structure and information architecture are correct and should not be disrupted. The changes are additive: brand color cascades automatically, components gain elevation and detail, navigation gains hierarchy, and the data display gains context.

The result should feel like a product built by a team that cares — analytical and precise, not clinical and austere.

---

## 2. Brand Identity Refresh

### 2.1 Brand Accent Color: Indigo

The primary change in this overhaul is introducing **indigo** as the Veld brand accent, replacing the current pure-black `--accent` token.

**Why indigo:**
- Completely distinct from the semantic palette (green = positive, red = negative, amber = warning). There is no conflict.
- Pairs naturally with the zinc/neutral base already established in `globals.css`. Indigo desaturates gracefully at low opacity, making it usable as a tint on cards and badges.
- Signals analytical precision and professionalism — used by Linear, Figma, and many modern SaaS tools in the "serious productivity" category.
- Works in both light and dark mode with a single hue shift (lighter tint in dark mode for legibility).
- Avoids the "money/gains" connotation of green, which is already doing semantic work in the positive cash flow and growth indicators.

**Token values:**

| Token | Light Mode | Dark Mode |
|---|---|---|
| `--accent` | `#6366f1` | `#818cf8` |
| `--accent-hover` | `#4f46e5` | `#a5b4fc` |
| `--accent-foreground` | `#ffffff` | `#1e1b4b` |

The rest of the palette is unchanged. The semantic colors (positive, negative, warning), the chart series, the background/foreground/border tokens — all remain as defined.

### 2.2 Full Color Palette Reference

| Token | Light Mode (current) | Light Mode (new) | Dark Mode (current) | Dark Mode (new) | Notes |
|---|---|---|---|---|---|
| `--background` | `#fafafa` | `#fafafa` | `#0a0a0a` | `#0a0a0a` | Unchanged |
| `--background-subtle` | `#f4f4f5` | `#f4f4f5` | `#171717` | `#171717` | Unchanged |
| `--card` | `#ffffff` | `#ffffff` | `#18181b` | `#18181b` | Unchanged |
| `--foreground` | `#0a0a0a` | `#0a0a0a` | `#fafafa` | `#fafafa` | Unchanged |
| `--foreground-muted` | `#71717a` | `#71717a` | `#a1a1aa` | `#a1a1aa` | Unchanged |
| `--border` | `#e4e4e7` | `#e4e4e7` | `#27272a` | `#27272a` | Unchanged |
| `--accent` | `#0a0a0a` | **`#6366f1`** | `#fafafa` | **`#818cf8`** | **CHANGED** |
| `--accent-hover` | `#262626` | **`#4f46e5`** | `#e4e4e7` | **`#a5b4fc`** | **CHANGED** |
| `--accent-foreground` | `#ffffff` | `#ffffff` | `#0a0a0a` | **`#1e1b4b`** | **CHANGED (dark)** |
| `--positive` | `#059669` | `#059669` | `#34d399` | `#34d399` | Unchanged |
| `--negative` | `#dc2626` | `#dc2626` | `#f87171` | `#f87171` | Unchanged |
| `--warning` | `#d97706` | `#d97706` | `#fbbf24` | `#fbbf24` | Unchanged |
| `--chart-1` through `--chart-5` | as defined | as defined | as defined | as defined | Unchanged |

**New tokens to add:**

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--accent-subtle` | `#eef2ff` | `#1e1b4b` | Low-emphasis accent tints (badges, icon backgrounds) |
| `--accent-subtle-foreground` | `#4338ca` | `#a5b4fc` | Text on `--accent-subtle` backgrounds |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 3px rgba(0,0,0,0.3)` | Card base shadow |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)` | `0 4px 8px -1px rgba(0,0,0,0.4)` | Elevated card / hover shadow |

### 2.3 Logo Mark Direction

The current "Veld" text wordmark renders as plain `text-lg font-semibold text-foreground`. There is a `favicon.svg` in `app/public/` that should be used as an icon mark alongside the wordmark.

**Direction:** Add the `favicon.svg` as a small `<img>` element (20×20px) to the left of the "Veld" text in both the landing nav and the app sidebar header. Use `object-contain` and ensure the image responds to light/dark mode if needed (a transparent-background SVG works on both).

This is a minimal-effort change that significantly improves brand presence. No new logo design is required — the existing asset is sufficient.

**Logo mark sizing by context:**

| Context | Icon size | Text size |
|---|---|---|
| Landing nav | 20×20px (`size-5`) | `text-lg font-semibold` |
| App sidebar header | 20×20px (`size-5`) | `text-lg font-semibold` |
| App mobile top bar | 20×20px (`size-5`) | `text-base font-semibold` |

### 2.4 Typography Hierarchy

The current design uses the `text-sm font-semibold uppercase tracking-wide text-muted` pattern so frequently it loses all meaning. This section defines five distinct typography levels, what they are for, and where each may be used.

**Level 1 — Page/Section Headline**
- Tailwind: `text-2xl font-semibold tracking-tight text-foreground` (in-app), `text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground` (marketing hero)
- Used for: page `<h1>` elements, marketing section primary headings
- Never used for: section labels within a page, chart titles, form group labels

**Level 2 — Section Heading**
- Tailwind: `text-xl font-semibold text-foreground` (in-app), `text-2xl font-semibold text-foreground` (marketing)
- Used for: major named sections within a page (e.g., "Plan & billing" in settings, "See what you get" on pricing)
- Never used for: data group labels inside metric grids, chart titles

**Level 3 — Subsection / Card Title**
- Tailwind: `text-base font-semibold text-foreground`
- Used for: named groups within a section, card headers that need identity (e.g., individual pricing plan names, "Investment property calculator" in calculator cards)
- Never used for: metric labels, navigation labels

**Level 4 — Data Group Label / Section Eyebrow**
- Tailwind: `text-xs font-semibold uppercase tracking-wide text-muted`
- Used for: labels above a group of related data metrics inside a card (e.g., "Portfolio metrics"), chart card titles, settings section headers inside the settings page, table column headers
- This is the pattern that has been overused. It is correct within data-dense surfaces where it signals "this is a category of data." It is incorrect as a marketing section heading or page section identifier.

**Level 5 — Body / Helper / Label**
- Tailwind: `text-sm text-muted` (body/description), `text-sm font-medium text-muted` (form label), `text-xs text-muted` (caption/footnote)
- Used for: descriptive body text, form labels, metric helper text, footnotes

**Rule:** Levels 1–3 use `text-foreground`. Level 4 uses `text-muted`. Level 5 uses `text-muted`. The distinction between a Level 2 heading and a Level 4 eyebrow must be immediately visible — if they look similar, one of them is wrong.

### 2.5 Shadow and Depth System

The current design uses `shadow-sm` sparingly and inconsistently. The new depth system has four levels:

| Level | CSS | Usage |
|---|---|---|
| **Flat** | `border border-border` only, no shadow | Inline elements, secondary cards inside a primary card, form inputs |
| **Raised** | `border border-border shadow-sm` | Primary content cards, metric cards, navigation sidebar, any surface that contains meaningful data |
| **Elevated** | `border border-border shadow-md` | Hover state on clickable cards, modals before backdrop, sticky header on scroll |
| **Floating** | `shadow-xl` or `shadow-2xl` | Full modals, command palette, toast notifications |

**Rule:** In the current design, `shadow-sm` appears on some cards (`shadow-sm` in the onboarding panel, analyze page) but most metric cards and section panels use none. The new rule: every content card that holds data the user cares about gets at minimum the Raised treatment. Decorative/structural dividers and inline containers stay Flat.

### 2.6 Radius System

The nested radii principle from Vercel's Geist system: a child element inside a container must have a border-radius that is proportionally smaller than the parent, so the rounded edges appear concentric rather than colliding.

| Context | Radius |
|---|---|
| Page-level panels, section cards | `rounded-xl` (12px) |
| Cards inside panels, metric cards | `rounded-lg` (8px) |
| Buttons, badges, tags, inputs | `rounded-md` (6px) |
| Small badges, tiny pills | `rounded-full` or `rounded-sm` (4px) |

**Rule:** A `rounded-xl` panel containing a `rounded-xl` button looks wrong — the curves collide. The button should be `rounded-md`. This is not currently enforced consistently in the codebase — correct it as components are touched.

### 2.7 Motion and Transitions

Current motion vocabulary: drawer slide (`transition-transform duration-200 ease-out`), color transitions (`transition-colors`). Everything else is instant.

The new motion vocabulary adds three behaviors:

**Hover lift:** On clickable cards and list rows, add `transition-shadow duration-150` so shadow depth animates on hover. This gives the interface a sense of physical responsiveness without animation complexity.

**State transitions:** Interactive elements (buttons, toggles, tabs) use `transition-colors duration-150` — this is already present in places, make it universal across all interactive elements.

**Reduced motion compliance:** The existing `app-respect-reduced-motion` class and `prefers-reduced-motion` media query are correctly implemented. All new motion must be wrapped in this pattern or use Tailwind's `motion-safe:` prefix.

**Not adding:** Number counting animations, chart reveal animations, or loading skeleton shimmer effects. These are additive quality-of-life items but are out of scope for this overhaul. They can be added as a follow-on pass.

### 2.8 Numerics Policy

All financial figures must render with tabular (monospaced) numeral spacing so numbers in columns and grids align vertically. Without this, `$1,234,567` and `$892` in adjacent cells shift visually.

Add to the body or a utility class:
```css
font-variant-numeric: tabular-nums;
```

In Tailwind v4, this is `tabular-nums` utility class. Apply it to:
- All `MetricCard` value renders
- All table cells containing currency or percentage
- All chart tooltip values
- All pricing card price figures

### 2.9 Surface Hierarchy

**The problem:** The current codebase applies `rounded-lg border border-border bg-card p-6` uniformly to nearly every content grouping — settings sections, metric containers, chart wrappers, empty states. When every grouping is a card, the word "card" loses meaning. The visual result is a page of identical rectangular frames stacked vertically: high perceived complexity, no clear focal point, no sense of what is primary.

**The solution — three surface levels:**

| Level | Visual treatment | Tailwind pattern | Meaning |
|---|---|---|---|
| **Page** | None | *(no wrapper)* | A section of a flowing document. Cannot be removed or rearranged without disrupting the page. |
| **Panel** | Border + shadow | `rounded-xl border border-border bg-card shadow-sm` | A self-contained, discrete content object. Could be moved, placed in a list, or removed without breaking the rest of the page. |
| **Inset** | Background tint only | `rounded-lg bg-subtle/50 p-3` | Secondary content nested inside a Panel. Never has its own shadow or border. |

**The discrete object test:** Before wrapping content in a Panel, ask: *"Is this a standalone unit that could exist in a list, be moved to a different location, or be removed without making the rest of the page feel incomplete?"*

| Content | Discrete? | Correct level |
|---|---|---|
| A property in the properties list | Yes | Panel |
| A deal in the saved deals list | Yes | Panel |
| A calculator card in the calculators hub | Yes | Panel |
| A metric tile on the dashboard | Yes | Panel (individual tiles) |
| A chart on the dashboard | Yes | Panel |
| A marketing feature callout (value props) | Yes | Panel |
| A settings category section (Appearance, Profile) | No — part of a document | Page level with internal dividers |
| A form section within a settings Panel | No | Inset or plain section |

**The sibling rule:** When multiple sibling Panels would be traversed in sequence as part of a single user task, they belong in ONE Panel with internal `border-t border-border` section dividers. The sections within are chapters in a document, not discrete objects.

**Applied to the three heaviest in-app pages:**

*Settings page:* Currently seven separate floating Panels. A user editing their settings is reading a document — they scroll it from top to bottom as a single task. The correct model is four logically grouped Panels, each containing multiple setting categories as internal sections. The account preferences (Appearance, Portfolio display, Profile) are the clearest case: three separate cards that are all "preference toggles and read-only data" belong in one Panel. See Section 6.11 for the exact grouping.

*Dashboard metric grid:* The individual metric tiles ARE discrete objects — each metric can be understood independently. The Panel treatment per tile is correct. The issue is visual: they float on the page background with no shared context, making the grid read as "nine things" rather than "the metrics section." Wrap the grid in a subtle `rounded-xl bg-subtle/30 p-2` grouping container — not a Panel (no border, no shadow), but enough to cluster the tiles into a coherent section without adding visual weight.

*Property detail tabs:* Within each tab, sequential sub-sections (mortgage summary, tax details, insurance) are chapters in the property's document, not discrete objects. Apply one Panel per tab with `border-t border-border` section dividers instead of separate cards per section.

---

## 3. Design Pillars

These six principles govern every design decision in this overhaul. When a specific guidance is ambiguous, apply the nearest pillar.

### Pillar 1: Chrome Serves Data

The sidebar, header bar, nav labels, borders, and dividers are infrastructure — they should be visually recessive relative to the content they frame. In the app, charts, metric values, and property data are the hero. The UI chrome should fade into the background so the user's eye is drawn to the numbers.

In practice: sidebar items use `text-sm text-muted` (not `text-base`). Active items get a quiet accent indicator, not a loud filled background. Chart containers use the same card treatment as metric cards so the chart itself is the visual emphasis.

### Pillar 2: Structure Felt, Not Seen

Hard borders between sections create visual noise. Where sections can be differentiated through spacing, background color shifts, or shadow depth changes alone, borders should be removed or reduced to `border-border/50` at most.

The strongest expression of this pillar is the card overuse problem. When every grouping of content receives a full `rounded-lg border border-border bg-card` container — settings sections, dashboard widgets, marketing callout boxes — the page becomes a wall of identical rectangular frames. A card should mark a discrete, self-contained object, not a section of a flowing document. Settings categories are chapters in a document; they should be organized inside one or two outer panels with internal dividers, not each wrapped in their own card. This distinction — what is an object, what is a document — is defined formally in Section 2.9.

In practice: the settings page consolidates from seven separate panels to four logically grouped panels. Marketing page sections alternate `bg-background` and `bg-card/50` without needing `border-t border-border` on every one. The dashboard action area becomes a plain flex strip rather than a card.

### Pillar 3: Tabular Numbers Everywhere

Any number a user might mentally compare to another number — across rows, time periods, properties, or metrics — must render in tabular numerals. This is a small CSS change with a large perceived quality impact. Financial tools that use proportional numerals feel amateur; tabular numerals feel precise.

### Pillar 4: Layered Depth

Cards are not flat. They exist at a physical level above the page background. The two-layer shadow (ambient + direct) conveys this without being heavy. The elevation model from Section 2.5 governs this. Every content card gets at minimum `shadow-sm`.

### Pillar 5: One Loud Action Per Screen

On any given screen, there is at most one brand-colored (indigo) CTA button. Everything else — secondary actions, navigation links, ghost buttons — is neutral. The brand color should be the visual anchor that immediately answers the question "what do I do next?"

In the app: "Add property" and "Save" are the loud actions. "Cancel," "View all," "See details" are neutral.
On the marketing site: "Get started free" is the loud action. "See pricing," "Sign in" are neutral.

### Pillar 6: No Section Title Uniformity

The `text-xs font-semibold uppercase tracking-wide text-muted` heading pattern must not appear on consecutive visible sections. It is a data-label pattern, not a page navigation pattern. Marketing section headings use real type sizes. In-app page headings use real type sizes. This pattern is reserved for labeling groups of data within a card or panel.

---

## 4. What We Are Not Changing

This section documents what is explicitly out of scope to prevent scope creep.

**Information architecture and navigation structure:** The sidebar navigation items and their order are correct. We are refining presentation (grouping labels, size), not restructuring the IA.

**Core component logic:** `MetricCard`, `PricingCards`, `PublicCalculator`, chart components — business logic and data handling are untouched. Only visual/structural changes.

**Token system architecture:** We are changing values in the existing token system, not restructuring how it works. `globals.css` stays as the source of truth with `@theme inline` mapping.

**Font:** Geist Sans is correct and stays. No font change.

**Dark mode infrastructure:** The current light/dark/system-preference implementation is correct. We are updating token values within it, not changing the mechanism.

**Mobile shell patterns:** `MobileToolShell`, `MobileCollapsible`, `MobileSectionCard`, `MobileSummaryRail` — these mobile-specific components work correctly and are not being restructured. Visual polish only.

**Database schema, API routes, business logic:** Zero changes.

---

## 5. Public Marketing Site

### 5.1 Landing Page (`app/app/page.tsx`) — Full Rebuild

This is the highest-impact change in the overhaul. The current landing page is text-centric with the product not visible until the third section. The rebuild prioritizes showing the product immediately, establishing social credibility, and creating a clear narrative arc.

**New section order:**

```
1. Navigation
2. Hero (60/40 split with product screenshot in view)
3. Social proof strip (1 line or minimal testimonials)
4. Interactive calculator section (elevated treatment)
5. Value props (icon-led with real descriptions)
6. "How it works" sequence (new section — 3 steps)
7. Pricing teaser (visual tier preview)
8. Footer
```

**Hero section — new structure:**

The hero moves from a centered text block to an asymmetric two-column grid:
- Left column (60% on `lg+`, 100% on mobile): Headline → subline → CTAs → trust pills
- Right column (40% on `lg+`, hidden on mobile below `lg`): Dashboard screenshot (`/ScreenDashboard.png`) in a styled frame

The screenshot frame adds visual credibility: a subtle border, a light shadow, and a small top bar with three colored circles (macOS-style chrome hint) to suggest this is a live application screenshot. This is a pure CSS treatment — no additional image assets needed.

On mobile, the layout stacks: headline → subline → CTAs → trust pills. The screenshot does not show on mobile (too small to be readable). This is fine — the mobile hero is still strong through copy.

The headline:  
Current: "Replace spreadsheet sprawl with one clear view of your rental portfolio"  
Keep this — it's specific and good.

The subline:  
Current: "Equity, cash flow, deal analysis, and rent estimates — all in one workspace built for small investors."  
Refine to: "All the numbers that matter — equity, cash flow, rent estimates, and deal analysis — without the spreadsheet chaos."

Remove the "Veld Portfolio" eyebrow label above the h1. It is on the nav and in the browser tab already.

**Social proof strip — new section:**

Immediately below the hero fold, a single full-width strip with a light contrasting background (`bg-subtle` on light, `bg-background-subtle` on dark). Contains either:
- Option A (if early-stage, no user count yet): Two or three short quote snippets from real users, no attribution needed beyond role ("Small landlord, 4 properties" / "First-time investor"). Format: quote in italics, role below in muted.
- Option B (if user count is available): A single line — "Join [N] investors tracking [X] properties" — in large, slightly bold type centered with a subtle divider on either side.

This section should be visually minimal — a single horizontal strip, 80–100px tall, that exists only to deliver one trust signal before the calculator section.

**Calculator section — elevated treatment:**

Currently styled identically to all other sections. New treatment: give this section a visually distinct background — on light mode, a `bg-slate-50` or a slight paper tone (`#f8f9fa`); on dark mode, a slightly lighter surface than the page background. Add a more prominent section heading at Level 2 (not the lowercase-uppercase muted pattern). Add a descriptive paragraph above the calculator that explains what it computes.

The "Open full calculator" link at the bottom of this section should use the accent color and an arrow indicator.

**Value props section — redesigned:**

Remove the tiny bordered icon boxes (`size-10 border border-border bg-card rounded-lg`). Replace with:
- Icon at `size-8` (32px) in an `bg-accent-subtle rounded-lg p-2` container (`bg-accent/10` tint in the accent color)
- Icon itself in `text-accent` (indigo, not muted)
- Title at Level 3 (`text-base font-semibold text-foreground`)
- Description expanded to 2 sentences (approximately 20–25 words rather than 7–9)

The 4-column grid on `lg+` stays. On mobile, the horizontal card layout (icon + text side by side) stays. Only the icon treatment and description length change.

**"How it works" section — new:**

A new section between value props and pricing preview. Three numbered steps in a horizontal row (stacked on mobile):

1. **Add your properties** — Enter purchase price, estimated value, rent, expenses, and mortgage details. Takes about 2 minutes per property.
2. **See your portfolio clearly** — Equity, cash flow, cap rate, and LTV across every property in one dashboard — always current, never a spreadsheet.
3. **Analyze and model** — Run deal analyses before buying, model what-if scenarios with sliders, and simulate mortgage payoff.

Visual treatment: Each step has a large numeral (`text-4xl font-bold text-accent/30`) as a decorative background element, with the step icon above and the text below. A horizontal connecting line runs between steps on desktop.

**Pricing teaser section — redesigned:**

Replace the three small pills with a visual teaser that shows all three tiers in a compact row. Each tier shows: plan name, price, property limit, and one-line description. The Investor tier gets a light `bg-accent/5 border-accent/30` treatment. A single "See full pricing" CTA below.

This is not the full pricing cards component — it is a lightweight preview that shows enough to let users understand the tiers without the billing toggle complexity.

**Remove:**  
- The "Veld Portfolio" eyebrow label  
- The generic `border-t border-border bg-card/30` uniform section backgrounds — replace with the section-by-section backgrounds described above

### 5.2 Landing Navigation (`components/landing-nav.tsx`) — Revision

**Changes:**

1. **Logo:** Add `<img src="/favicon.svg" className="size-5 object-contain" alt="" />` to the left of the "Veld" text. No alt text needed (decorative alongside text).

2. **Nav links — desktop:** Remove `Privacy` and `Terms` links. New desktop link set: Calculators · Pricing · Changelog · [Sign in] · [Get started →]. Keep the `Sign up` CTA with the brand accent color.

3. **CTA button styling:** The "Sign up" / "Get started" button should now use `bg-accent text-accent-foreground` (indigo) rather than `bg-accent` (which was pure black). This cascades from the token change.

4. **Mobile drawer:** Remove `Privacy` and `Terms` from the drawer link list as well. The drawer is now: [if signed in: Dashboard] · Calculators · Pricing · Changelog · Sign in · Sign up. Reduces link count from 7 to 5–6, cleaner experience.

5. **Hamburger target:** Change `size-10` to `size-11` (44×44px minimum touch target, flagged in mobile audit).

6. **Drawer a11y:** Add Escape key handler, focus management on open, `role="dialog"` and `aria-modal="true"` — these were flagged as missing in the mobile experience audit. Address as part of this revision.

### 5.3 Pricing Page (`app/app/pricing/page.tsx`) — Targeted Updates

The pricing page structure is sound. Changes are targeted:

1. **Trust strip:** The current trust pills (`rounded-full border border-border/70 px-3 py-1`) are fine as a pattern. Elevate their visual weight: increase the container from inline flex to a proper centered block with `gap-3`, give each pill `bg-card shadow-sm` instead of transparent.

2. **Heading:** The `text-3xl font-semibold text-foreground` h1 is correct. Keep it.

3. **Screenshot grid below pricing cards:** Already has `grid gap-4 md:grid-cols-2` with the dashboard screenshot spanning `md:col-span-2`. This is a good structure. Add a proper section heading ("See it in action" at Level 2) above the screenshots rather than the existing `text-sm font-semibold uppercase tracking-wide text-muted` label.

4. **Bottom CTA section:** Already well-structured with FAQ accordions. Visually, the `<details>` elements would benefit from a subtle hover state on the summary: `hover:bg-subtle rounded-lg transition-colors`. This is already nearly there — just confirm the styling is smooth.

### 5.4 Pricing Cards (`components/pricing-cards.tsx`) — Component Revision

This component is shared between the marketing pricing page and the in-app plans page. Changes:

1. **Feature bullets:** Replace `<span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-border" />` with the Lucide `Check` icon at size 14px (or `size-3.5`) in `text-positive`. This is the universal SaaS standard and dramatically improves readability.

2. **Recommended tier visual emphasis:** The Investor tier (highlighted for free users) currently gets `border-accent/60 ring-1 ring-accent/30` — extremely subtle. New treatment:
   - Card background: `bg-accent/5` (very light indigo tint)
   - Border: `border-accent/40`
   - Ring: `ring-2 ring-accent/20`
   - "Recommended" badge: moved to a ribbon-style top banner inside the card, not just a small badge next to the title

3. **Current plan card:** Keeps the `border-positive ring-1 ring-positive/60` treatment — this is good and should stay.

4. **Billing toggle:** The `bg-accent text-accent-foreground` active tab state cascades from the token change. No additional work needed.

5. **Price figures:** Add `tabular-nums` class to all price `<p>` elements.

6. **Annual savings badge:** Currently `bg-positive/15 px-1.5 py-0.5 text-[10px] font-semibold text-positive`. This is fine — keep it. Verify it renders clearly with the new card background.

### 5.5 Changelog (`app/app/changelog/page.tsx`) — Style Update

The changelog is a good content page with a poor visual treatment. The ordered list of entries reads like a plain document.

**New visual treatment — timeline style:**

Replace the bare `<ol>` with a timeline list where:
- The list has a left border: `border-l-2 border-border ml-3` on the `<ol>` itself
- Each `<li>` has a relative position with an accent-colored dot on the left border: a `size-3 rounded-full bg-accent absolute -left-[7px] top-2` element
- The date chip: wrap the `<time>` in a styled pill — `inline-flex text-xs font-medium bg-card border border-border rounded-full px-2 py-0.5 text-muted`
- The `<h2>` entry title: `text-lg font-semibold text-foreground` (currently correct)
- The bullet list of changes: keep as-is, `list-disc pl-5 text-sm space-y-1.5`

The overall page layout stays the same (`max-w-2xl`, `LandingNav` + `Footer`). Only the timeline list visual treatment changes.

### 5.6 Contact Page (`app/app/contact/page.tsx`) — Minor Update

The contact page is structurally fine. One update:

The back link (`← Back to home` / `← Back to dashboard`) is currently `text-sm text-muted`. Give it a small left-arrow icon (`ChevronLeft` from Lucide at `size-4`) for clarity: `inline-flex items-center gap-1 text-sm text-muted hover:text-foreground`.

No other changes needed.

### 5.7 Calculators Hub — Public (`components/calculators/calculators-hub-cards.tsx`)

The calculator hub cards are visually competent. Two enhancements:

1. **Card icon:** Add a small category icon in an `bg-accent/10 rounded-md p-1.5` container to the left of the card title, using an appropriate Lucide icon per calculator type (e.g., `Home` for investment property, `Hammer` for BRRRR/fix-and-flip, `SplitSquareHorizontal` for STR vs LTR). Sized at 18px.

2. **Arrow indicator:** The current `text-sm font-medium text-accent` "Open calculator →" text is good. With the token change, `text-accent` now renders in indigo instead of black, making it more visually prominent as a call-to-action indicator.

### 5.8 Sign-up and Sign-in Pages (Clerk Customization)

The sign-up and sign-in pages use Clerk's hosted UI components. Clerk accepts an `appearance` prop on `<ClerkProvider>` that maps brand colors.

Apply in the root layout's `<ClerkProvider>`:
```tsx
appearance={{
  variables: {
    colorPrimary: '#6366f1',
    colorPrimaryForeground: '#ffffff',
    borderRadius: '0.5rem',
  }
}}
```

This colors Clerk's primary buttons and focused inputs with the Veld brand indigo. No other Clerk customization is needed for this pass.

### 5.9 Footer (`components/footer.tsx`)

The footer is minimal and correct. One change: the link list is currently one flat row. On wider screens, consider grouping into two groups: left-aligned product links (Calculators, Pricing, Changelog, Alternatives, Compare, Resources) and right-aligned legal links (Privacy Policy, Terms of Service, Contact, Cookie Preferences). This is a minor layout improvement.

The copyright text and overall minimal aesthetic stay as-is.

---

## 6. In-App Product

### 6.1 App Shell (`app/app/(app)/app-layout-client.tsx`) — Revision

**Desktop sidebar changes:**

1. **Logo mark:** In the sidebar header `<div className="flex h-14 items-center gap-2 border-b border-border px-4">`, add `<img src="/favicon.svg" className="size-5 shrink-0" alt="" />` before the `<LogoLink />` component. The LogoLink renders the text "Veld".

2. **Sidebar background:** The sidebar currently uses `bg-card`. This is correct. Apply Pillar 1 (chrome serves data) by giving the sidebar a very slightly lower visual weight — this already exists with `bg-card` vs `bg-background`. No change needed here unless testing reveals the sidebar needs to recede more.

3. **Account area at bottom:** The `<UserButton>` + "Account" text area at the bottom is fine. No changes.

**Mobile top bar changes:**

1. **Logo mark:** In the mobile header, add the same `<img src="/favicon.svg" className="size-5 shrink-0" alt="" />` inside the `<LogoLink />` component rendering for the centered logo position.

2. No other mobile header changes.

### 6.2 App Navigation (`app/app/(app)/app-nav.tsx`) — Revision

This is one of the higher-impact in-app changes. Current: 9+ flat items at `text-base py-2.5`. New: grouped items at `text-sm py-2`.

**Group structure:**

```
[no label]
  Dashboard
  Properties

TOOLS
  Modeling
  Mortgage
  Calculators
  Analyze deal
  Deals

ACCOUNT
  Plans
  Settings
  [Admin — if applicable]
```

**Group label rendering:**
```tsx
<p className="px-4 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
  Tools
</p>
```
This is the correct use of the uppercase-muted pattern — it is labeling a group of data/tool items inside a panel.

**Nav item classes:**
- Inactive: `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted hover:bg-subtle hover:text-foreground transition-colors duration-100`
- Active: `flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-foreground bg-subtle border-l-2 border-accent`

The active state gets a left border in the brand accent color, which clearly marks the current location without being heavy.

**"Getting started / Add property" CTA:**

Move from the current ghost link treatment to a subtly elevated button:
```tsx
className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/15 transition-colors duration-100 w-full"
```
This makes it visually distinct as a call to action rather than a navigation link, which is its actual purpose.

### 6.3 Dashboard (`app/app/(app)/dashboard/page.tsx`) — Structural Updates

**Layout reorder:**

Current order:
1. `PaidIntentCheckoutBanner`
2. `<h1>Dashboard</h1>`
3. [optional onboarding success banner]
4. Action area card (workspace links + Add property + Analyze deal)
5. Metric grid
6. More metrics collapsible
7. Rent vs market section
8. Dashboard charts
9. Single-property upsell

New order (for users with properties):
1. `PaidIntentCheckoutBanner`
2. `<h1>Dashboard</h1>` — remove the prop of having it inside anything; just the h1 then a small muted subtext if needed
3. **Quick actions strip** — a lightweight non-card strip (no border/bg) of buttons: [Add property] [Analyze a deal] and workspace links. Removing the card wrapper reduces visual weight while keeping the functionality.
4. Metric grid
5. More metrics collapsible
6. Rent vs market section
7. Dashboard charts
8. Single-property upsell

**"Portfolio summary" line removed:**

The line `Portfolio summary across {X} properties.` is redundant context. The h1 is "Dashboard", the metric grid speaks for itself. Remove this line.

**MetricHelpLink placement:**

Keep it, but render it below the metric grid rather than inside the action area.

**Single-property upsell card:**

Give the border a brand accent tint: `border-accent/20 bg-accent/5` instead of the plain `border-border`. This makes it feel like a gentle nudge rather than just a content block.

**Zero-state (no properties):**

Add the `empty-properties.png` illustration. The card already has good structure — add the image above the welcome text:
```tsx
<img
  src="/empty-properties.png"
  alt=""
  className="mx-auto mb-4 size-24 object-contain opacity-80"
  aria-hidden="true"
/>
```

### 6.4 MetricCard (`components/metric-card.tsx`) — Component Enhancement

**Props changes:**

Add two optional props:
```tsx
delta?: number | null;       // Raw delta value (e.g., +1200 for "$1,200 up")
deltaLabel?: string | null;  // Display string (e.g., "+$1,200 this month")
```

**Rendering the delta:**

Below the main `<dd>` value, conditionally render:
```tsx
{deltaLabel && (
  <p className={`mt-0.5 text-xs ${
    delta === undefined || delta === null ? 'text-muted' :
    delta > 0 ? 'text-positive' :
    delta < 0 ? 'text-negative' : 'text-muted'
  }`}>
    {deltaLabel}
  </p>
)}
```

**Shadow:** Add `shadow-sm` to the card container class.

**Tabular numerals:** Add `tabular-nums` to the `<dd>` value class.

**Note on delta data availability:** The delta prop is optional and defaults to `undefined`. No dashboard changes need to be made immediately to supply delta data — the component can render without it. When delta data becomes available (e.g., from benchmark comparison or saved snapshots), the prop can be passed. Do not add fake or placeholder delta values.

### 6.5 Properties List (`app/app/(app)/properties/page.tsx`) — Visual Polish

**Property cards:** Add `shadow-sm` to both the single-property card and multi-property grid cards. Add `hover:shadow-md transition-shadow duration-150` to clickable cards.

**Benchmark/insight tags:** The `InsightTag` component renders tags like "at market", "below market", etc. Give "above market" and "at market" tags a subtle accent tint (`text-accent border-accent/30 bg-accent/10`) and leave "below market" with the existing positive/negative semantic treatment.

**Filter bar:** The horizontal scrolling filter pills are correct. No structural changes. Verify `tabular-nums` is applied to any count displays.

**Empty state:** The zero-state card already has a good structure. Add `shadow-sm` to the card. No other changes.

### 6.6 Property Detail (`app/app/(app)/properties/[id]/page.tsx`) — Enhancement

**Back navigation:**

Replace:
```tsx
<Link href="/properties" className="text-base text-muted hover:text-foreground">
  ← Properties
</Link>
```

With a breadcrumb using a Lucide icon:
```tsx
<Link
  href="/properties"
  className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground transition-colors"
>
  <ChevronLeft className="size-4" aria-hidden />
  Properties
</Link>
```

**PropertyHero component:**

The `PropertyHero` renders the address when a nickname is the page h1. Change from `bg-card` to `bg-subtle` for the address secondary card — this creates subtle visual differentiation showing it is supporting context, not primary content.

**Property detail tabs:**

The active tab indicator should use the accent color. In `property-detail-tabs.tsx`, wherever the active tab is styled, add or change to use `border-b-2 border-accent text-foreground` for the active tab and `text-muted hover:text-foreground` for inactive tabs.

### 6.7 Dashboard Charts (`app/app/(app)/dashboard/dashboard-charts.tsx`) — Polish

**Chart card containers:**

The `ChartLoadingPlaceholder` and the chart card wrappers (in the component's JSX rendering each chart) should add `shadow-sm` to their containers.

**Chart card titles:**

Change from `text-sm font-semibold uppercase tracking-wide text-muted` to `text-sm font-semibold text-foreground`. Chart titles should be direct labels, not the de-emphasis eyebrow pattern. The chart itself provides the visual hierarchy — the title just needs to be readable.

**Benchmark section:**

No structural changes needed. Verify styling is consistent with the updated card treatment.

### 6.8 Analyze Deal (`app/app/(app)/analyze/page.tsx`) — Minor Updates

**Header card:** The `rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm` header card already has a shadow. The h1 is correctly sized. No structural changes.

**Link to saved deals:** The `text-accent hover:underline` link style will automatically update to indigo with the token change.

**Mobile sticky results bar (from mobile audit):** In `deal-analyzer-form.tsx`, the fixed bottom bar needs `pb-safe` (or `padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px))`). This is a P1 issue from the mobile audit and should be addressed alongside this design pass.

### 6.9 Saved Deals (`app/app/(app)/deals/page.tsx`) — Empty State Enhancement

**Empty state:**

Add `empty-deals.png` illustration above the heading:
```tsx
<img
  src="/empty-deals.png"
  alt=""
  className="mx-auto mb-4 size-24 object-contain opacity-80"
  aria-hidden="true"
/>
```

**Card shadow:** Add `shadow-sm` to the empty state card.

**Deal list cards (in `deals-list.tsx`):** Add `shadow-sm` and `hover:shadow-md transition-shadow duration-150` to deal cards.

### 6.10 Calculators Hub In-App (`app/app/(app)/calculators/page.tsx`) — Minor

**Remove eyebrow label:**

Delete:
```tsx
<p className="text-sm font-medium uppercase tracking-wide text-muted">Calculators</p>
```

The `<h1>` alone is sufficient. This is a case where the eyebrow label adds no value and contributes to the overuse problem.

**Calculator cards:** The `CalculatorsHubCards` component changes (from section 5.7) apply here since it is a shared component with `variant="app"`.

### 6.11 Settings (`app/app/(app)/settings/page.tsx`) — Panel Consolidation

The settings page is the most literal example of the card overuse problem in the entire app. It currently has five separate `rounded-lg border border-border bg-card p-6` card containers — Appearance, Portfolio display, Profile, Plan & billing, and Export — plus a sixth for Delete account. Each section is visually identical to every other section: same border, same background, same radius, same padding. The page reads as a wall of undifferentiated frames.

Applying Section 2.9: settings sections are chapters in a document, not discrete objects. The correct model is four logically grouped Panels with internal `border-t border-border` dividers.

**New panel structure (5 separate cards → 4 grouped Panels):**

**Panel A — Account preferences**
Consolidates: Appearance + Portfolio display + Profile.
These are the simplest, most closely related sections — all user-controlled toggles or read-only identity data. Group them under one Panel with two internal dividers.
Panel container: `rounded-xl border border-border bg-card shadow-sm`.
Each section inside: `px-6 py-5`, with `border-t border-border` separating them.
Section labels (`p` with uppercase-muted): kept exactly as-is — this is the correct use of that pattern (labeling categories within a data panel).

**Panel B — Plan & billing** (standalone)
Sufficient content and user intent to merit its own Panel — users return to this section specifically to change plans or access the billing portal. No consolidation. Upgrade container from `rounded-lg` to `rounded-xl` and add `shadow-sm`.

**Panel C — Your data** (standalone)
The Export section already combines Download and Import CSV with an internal `border-t border-border` divider — this is already correct surface hierarchy. Upgrade container to `rounded-xl` and add `shadow-sm`. Rename the section heading from "Export your data" to "Your data" (since it handles both export and import).

**Panel D — Danger zone** (standalone)
Delete account must remain visually isolated — the destructive action requires its own context. Retains the `border-negative/20` border across all screen sizes (remove the `md:border-border` override that was incorrectly neutralizing the warning signal on desktop). Upgrade container to `rounded-xl` and add `shadow-sm`.

**Privacy section:** The `<CookiePreferencesSection />` component renders its own visual container internally. Keep it as a standalone section above Panel A — do not nest its output inside Panel A.

**Mobile account snapshot card:** The `rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm` card is already correctly structured (it IS a discrete summary object on mobile). No changes needed.

**Typography:** The `text-xs font-semibold uppercase tracking-wide text-muted` pattern for section headers inside Panels is one of its correct uses — labeling data categories within a structured container. Keep it unchanged. Change `<h2>` section heading elements to `<p>` where they become internal section labels (they are no longer page-level headings, they are category labels within a Panel).

**Visual result:** The user scrolling settings encounters 4 visually distinct Panels instead of 6 floating frames. Each Panel has a clear purpose: preferences, billing, data, and danger zone. Total visual weight drops significantly while all functionality is preserved.

### 6.12 Onboarding Panel (`app/app/(app)/onboarding-panel.tsx`) — No Changes Needed

The onboarding modal is already the most visually intentional component in the app. It has:
- Backdrop blur and background overlay
- Decorative blur orbs (`bg-accent/20 blur-3xl`) that will auto-update to indigo
- `shadow-2xl` elevation
- `shadow-accent/25` on the primary button

No changes needed. The brand accent token change alone will improve this component.

### 6.13 Plans Page (`app/app/(app)/plans/page.tsx`)

This page uses `PricingCards` with `showSignUp={false}`. All changes from section 5.4 apply. No additional page-level changes needed.

---

## 7. Shared Component Reference

Quick reference table for every component touched in this overhaul.

| Component | File | Change Type | Section |
|---|---|---|---|
| `MetricCard` | `components/metric-card.tsx` | Enhancement (delta, shadow, tabular-nums) | 6.4 |
| `AppNav` | `app/(app)/app-nav.tsx` | Revision (groups, size, active state, CTA) | 6.2 |
| `AppLayoutClient` | `app/(app)/app-layout-client.tsx` | Revision (logo mark) | 6.1 |
| `LandingNav` | `components/landing-nav.tsx` | Revision (logo, links, CTA, a11y, hamburger) | 5.2 |
| `PricingCards` | `components/pricing-cards.tsx` | Revision (checkmarks, tier emphasis, tabular) | 5.4 |
| `Footer` | `components/footer.tsx` | Minor (layout grouping) | 5.9 |
| `CalculatorsHubCards` | `components/calculators/calculators-hub-cards.tsx` | Minor (icon, hover) | 5.7 |
| `PropertyHero` | `app/(app)/properties/[id]/property-hero.tsx` | Minor (bg color) | 6.6 |
| `DashboardCharts` | `app/(app)/dashboard/dashboard-charts.tsx` | Polish (shadow, title style) | 6.7 |
| `OnboardingPanel` | `app/(app)/onboarding-panel.tsx` | None (auto-updates from token) | 6.12 |

---

## 8. Anti-Patterns and Rules

This section replaces the anti-patterns section of `docs/policies/design-spec.md`. It is more specific and opinionated.

### Typography Anti-Patterns

**Do not use** `text-sm font-semibold uppercase tracking-wide text-muted` for:
- Marketing page section headings
- Page-level h2 elements in the app (e.g., the "Plan & billing" setting section title is a correct use; a new marketing section heading is not)
- Chart titles (change to `text-sm font-semibold text-foreground`)
- Any heading that appears without a data grid, table, or card directly beneath it

**Do not use** the same text size for a page section heading and a metric label within a card on the same page. If they look the same, the hierarchy is broken.

### Color Anti-Patterns

**Do not use** `text-accent` for decorative text that is not interactive or a primary CTA. With the token change, `text-accent` is now the brand indigo — it has visual weight and should signal interaction or importance.

**Do not use** the `--positive` (green) color for non-semantic purposes. It means "this is good financially." Do not use it for brand accents or decorative purposes.

**Do not mix** semantic token names with raw color values in components. If a new element needs the accent color, use `text-accent` or `bg-accent`, never `text-[#6366f1]`.

### Card Usage Anti-Patterns

**Do not** use a card container for every content grouping. Apply the discrete object test (Section 2.9) first. If the content is a section of a flowing document — a settings category, a form group, a step in a sequence — it does not get a card wrapper. It gets spacing and, if needed, a `border-t border-border` divider within an outer Panel.

**Do not** have more than four or five sibling Panels on a single page unless the content is genuinely a list of discrete objects (properties list, deals list, calculator hub). A settings page with seven sibling Panels of settings categories should be four Panels with internal dividers.

**Do not** nest a Panel inside a Panel. If secondary content needs visual separation inside an existing Panel, use an Inset (`rounded-lg bg-subtle/50 p-3`) with no shadow or border. Two shadow-bearing containers nesting creates depth collision — the inner card appears to float above an already-elevated surface for no reason.

**Do not** use a card as a substitute for section spacing. If the only reason a wrapper exists is to give content a background and a separator from what's above it, use `pt-6 border-t border-border` instead.

**Do not** equate "important" with "needs a card." A section can be visually prominent through typography, spacing, and color treatment without a card container.

### Layout Anti-Patterns

**Do not** apply `border-t border-border` to every sequential section on a marketing page. Background color shifts and spacing communicate section separation without hard dividers.

**Do not** wrap every section in a card with full borders in the marketing site. Cards are for the in-app data surfaces. The marketing site can use plain section elements with background variation.

**Do not** use `rounded-xl` buttons inside `rounded-xl` cards. Child elements must have smaller radii than their parents (Section 2.6).

### Interaction Anti-Patterns

**Do not** add hover effects without transition durations. `hover:bg-subtle` alone creates a jarring instant switch. Always pair with `transition-colors duration-150` (or the appropriate property).

**Do not** use the brand accent color on more than one prominent CTA per screen. The accent is reserved for the primary action.

### Depth Anti-Patterns

**Do not** use `shadow-lg` or `shadow-xl` on static content cards. These elevations are for floating elements (modals, dropdowns, tooltips). Static content cards use `shadow-sm` (Raised) at most.

**Do not** have content cards with no elevation (flat, border-only) unless they are inside an already-elevated parent card. A flat card on a flat background creates no visual separation.

---

*Reference: `docs/design/implementation-guide-2026.md` for exact code instructions. `docs/policies/design-spec.md` for the pre-existing spec (Sections 1–3 of this brief supersede Sections 2, 3, and 9 of that document; other sections remain in effect).*
