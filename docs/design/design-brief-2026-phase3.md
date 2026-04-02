> ⚠️ **SUPERSEDED** — This document is a historical record. The canonical design reference is [`docs/design/design-spec-2026.md`](./design-spec-2026.md). Do not use this document as active guidance.

# Veld Portfolio — Design Brief 2026 Phase 3

**Version:** 1.0  
**Date:** 2026-04-01  
**Status:** Active — companion to `design-brief-2026.md` and `design-brief-2026-phase2.md`  
**Scope:** Ceiling-breaker work to bring Veld from ~7.5/10 to a 10/10 (where design can take it). Covers motion layer implementation, empty state system, property detail tab restructuring, mobile-density improvements, landing page conversion lift, and the logo/brand mark question.  
**Companion document:** `implementation-guide-2026-phase3.md`

> **How to use this document:** After completing the rollout guide (`implementation-guide-2026-phase3-rollout.md`), this brief defines the new design decisions needed for the remaining ceiling. Read this brief before executing the companion implementation guide.

---

## Table of Contents

1. [Phase 3 Scope and Goals](#1-phase-3-scope-and-goals)
2. [System Updates](#2-system-updates)
   - [2.13 Focus Ring Standard](#213-focus-ring-standard)
   - [2.14 Motion Layer — Full Rollout Policy](#214-motion-layer--full-rollout-policy)
   - [2.15 Empty State System](#215-empty-state-system)
3. [In-App Improvements](#3-in-app-improvements)
   - [6.19 Property Detail Page — Tab and Content Restructure](#619-property-detail-page--tab-and-content-restructure)
   - [6.20 Dashboard — Metric Card Micro-Interactions](#620-dashboard--metric-card-micro-interactions)
   - [6.21 Forms — Input Field Polish](#621-forms--input-field-polish)
   - [6.22 Deals and Saved Deals Pages](#622-deals-and-saved-deals-pages)
4. [Public Pages Improvements](#4-public-pages-improvements)
   - [7.3 Landing Page — Conversion and Trust Lift](#73-landing-page--conversion-and-trust-lift)
   - [7.4 Pricing Page](#74-pricing-page)
5. [Brand Mark Question](#5-brand-mark-question)
6. [Mobile-Specific Standards](#6-mobile-specific-standards)
7. [Anti-Patterns — Phase 3 Additions](#7-anti-patterns--phase-3-additions)

---

## 1. Phase 3 Scope and Goals

### 1.1 What Phase 3 Builds On

Phase 1 established the design language: indigo accent, Surface Hierarchy, semantic tokens, typography scale.  
Phase 2 rolled out that language to deferred pages and added motion tokens, loading skeletons, and improved loading states.  
The rollout guide (separate document) mechanically applies Phase 1+2 patterns to the ~30 files that were out of scope.

After all prior work is applied, the design sits at approximately **7.5/10**. The remaining gap to 10/10 is not pattern inconsistency — that gap will be closed by the rollout guide. The remaining gap is about **depth**: the product uses patterns correctly but does not yet use them _expressively_. The difference between a 7.5 and a 10 in SaaS UI is the difference between a UI that functions correctly and a UI that communicates confidence and care at every interaction point.

### 1.2 The Remaining Gaps

**Gap 1 — No interactive feedback layer.** Motion tokens were defined in Phase 2 but were only applied to ~16 files. Every other interactive element (cards, table rows, nav items, form inputs, buttons in lesser-used pages) has no hover or focus transition. On a fast connection, pages feel static. The product does not respond to the user.

**Gap 2 — Focus states are invisible.** Keyboard navigation is essential for accessibility. The current codebase has very few explicit `focus-visible:ring-*` classes. Users navigating by keyboard have almost no visual indication of their current position.

**Gap 3 — Empty states are not designed.** Zero-property state on the dashboard shows the onboarding panel. But the properties list when empty, the deals list when empty, the analyze page for a new user, and several smaller surfaces show either nothing or a plain text string. These are high-stakes moments for new users and are currently abandoned.

**Gap 4 — Property detail tabs are information-dense on mobile.** The property detail page has four tabs: Overview, Details, Projections, and Mortgage. On mobile these tabs are functional but cramped — the tab labels themselves are short enough to fit, but the content inside each tab was designed for desktop and is adapted for mobile with varying degrees of success. Projections and Mortgage in particular have complex forms that are hard to read at mobile viewport.

**Gap 5 — The landing page does not maximize conversion.** The hero is much better after Phase 1 (product screenshot visible, left-aligned copy, clear CTA). But the page still undersells two things: the deal analyzer (the feature most likely to convert a first-time visitor) and the free tier (which has no card required — this is a significant trust advantage that is buried in a trust pill rather than foregrounded).

**Gap 6 — The pricing page is functional but not persuasive.** It shows the right information but does not communicate value differentiation clearly. Users cannot easily see "what do I get with Pro that I don't get for free?"

**Gap 7 — No brand mark.** The logo is the text string "Veld" in `text-lg font-semibold`. This is the most strategic decision in this document and the one with the most long-term impact. It is also the one that cannot be implemented purely in code — it requires a design decision.

### 1.3 Phase 3 Target

After Phase 3:

- Every interactive element in the product responds to hover and focus with appropriate visual feedback — **no silent interactions remain**.
- New users who land on an empty dashboard or properties list see an intentional, action-oriented empty state — **no abandoned zero-data moments**.
- The landing page's above-the-fold treatment leads with the free tier's no-card advantage and the deal analyzer's immediate utility — **conversion-oriented, not just descriptive**.
- The property detail page on mobile is genuinely usable — **not just adapted but intentional**.
- The product has a brand mark — **visual identity exists independent of text rendering**.

---

## 2. System Updates

### 2.13 Focus Ring Standard

#### 2.13.1 The Problem

Currently the product has no enforced focus ring standard. Some interactive elements use `focus:ring-2 focus:ring-accent/20` (as documented in Phase 1) but this is not consistently applied. Users navigating by keyboard have almost no visual affordance.

Modern SaaS products use `focus-visible:` rather than `focus:` to avoid showing the ring on mouse interactions while preserving it for keyboard and assistive technology navigation.

#### 2.13.2 Standard Definition

Every interactive element (buttons, links, inputs, selects, checkboxes, radio buttons, tabs, and any element with `tabIndex` or `role="button"`) must have:

```css
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background
```

In practice this resolves to:

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2
```

The `ring-offset-background` is the default offset color, so it can be omitted if the background is `--background`. On dark surfaces or card backgrounds that differ, add `focus-visible:ring-offset-card`.

#### 2.13.3 Application Strategy

The pattern should be added to:
1. All `<button>` elements (via Tailwind classes directly)
2. All `<a>` elements used as navigation
3. All `<input>`, `<select>`, and `<textarea>` elements
4. All tab-like elements rendered as `<button>` (the property detail tab bar, the chart tab bar)

Do not add it to `<div>` or `<span>` elements that are purely decorative. If they need focus behavior, they should be refactored to `<button>` or given `tabIndex` + `role` attributes.

#### 2.13.4 Global Default via CSS

The most efficient approach is to add a global CSS rule to `globals.css` that handles most interactive elements automatically, then only add explicit `focus-visible:ring-*` classes to custom elements that override the default:

```css
/* Global focus ring — applies to all interactive elements via keyboard/AT */
:focus-visible {
  outline: 2px solid hsl(var(--accent) / 0.4);
  outline-offset: 2px;
}
```

This is a CSS-first solution that does not require touching every component. The companion implementation guide implements this as a globals.css addition.

---

### 2.14 Motion Layer — Full Rollout Policy

#### 2.14.1 The Problem

Phase 2 defined five motion tokens (`--duration-fast`, `--duration-base`, `--duration-slow`, `--ease-out`, `--ease-in-out`) and applied them to ~16 files. The full interactive surface of the product has not been audited.

#### 2.14.2 Mandatory Transition Classes

The following rules are now mandatory for any new or edited interactive element:

| Element Type | Required Tailwind Classes |
|---|---|
| Any element with `hover:bg-*` | Must also have `transition-colors duration-150` |
| Any element with `hover:text-*` only | Must also have `transition-colors duration-150` |
| Any card with `hover:shadow-*` | Must also have `transition-shadow duration-150` |
| Any card with `hover:border-*` | Must also have `transition-colors duration-150` |
| Any button with `hover:bg-*` | Must also have `transition-all duration-150` |
| Any element with `hover:opacity-*` | Must also have `transition-opacity duration-150` |
| Tab indicators | `transition-all duration-200` |
| Accordion / collapsible expand | `transition-all duration-200` |
| Sidebar nav active states | `transition-colors duration-150` |

#### 2.14.3 What This Looks Like in Practice

Before (Phase 1–2 era):
```tsx
<button className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted hover:text-foreground">
  Reset
</button>
```

After (Phase 3):
```tsx
<button className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2">
  Reset
</button>
```

The addition is two concepts: `transition-colors duration-150` (motion) and the focus-visible ring (accessibility). Both are now mandatory.

#### 2.14.4 Page-Level Animation Policy

**No page-transition animations.** Navigation in Next.js with the App Router does not benefit from page-level fade/slide transitions — they create layout jank and perceived slowness. The product should remain instant on navigation.

**Chart entrance animation:** When chart data loads and replaces a skeleton, a `transition-opacity duration-200` on the chart container is appropriate. This is the one place a "content appearing" animation adds value.

**Modal/drawer overlay:** The `MobileToolShell` and any future modal overlays should use `transition-all duration-300` for their backdrop and panel entrance.

---

### 2.15 Empty State System

#### 2.15.1 Philosophy

An empty state is not a failure condition — it is a teaching moment and an activation opportunity. The goal is to answer two questions in every empty state: (1) "Why is this empty?" and (2) "What's the most useful thing I can do right now?"

The design research is unambiguous: products with designed empty states have significantly higher day-1 retention than those showing generic empty text. Veld's target users — small landlords managing 1–10 properties — will encounter the dashboard, properties list, and deals pages in empty states on signup. These moments determine whether the user completes their first property setup.

#### 2.15.2 Empty State Anatomy

Every empty state must have exactly these four elements:

1. **Icon** — A `lucide-react` icon that relates to the surface. Size: `size-10` or `size-12`, `text-muted/40`. Not an illustration. The product is data-focused and financial; decorative illustrations would feel tonally wrong.
2. **Heading** — Short, specific, not generic. "No properties yet" not "Nothing here." Max 4 words.
3. **Supporting line** — One sentence that either explains the value or gives context. Max 12 words.
4. **Primary action** — A single CTA that takes the user to the most productive next step. Styled as the primary button (`bg-accent text-accent-foreground`). No secondary action unless the user genuinely has two equally valid paths.

#### 2.15.3 Empty State Surfaces and Content

| Surface | Icon | Heading | Support Line | CTA |
|---|---|---|---|---|
| Dashboard (no properties) | `Building2` | "Add your first property" | "Your portfolio metrics appear here once you add a property." | "Add property →" → `/properties/new` |
| Properties list (no properties) | `Building2` | "No properties yet" | "Track equity, cash flow, and rent estimates across all your properties." | "Add your first property" → `/properties/new` |
| Deals list (no saved deals) | `FileText` | "No saved deals" | "Run a deal analysis and save it here to compare later." | "Analyze a deal" → `/analyze` |
| Deals list (no results matching filter) | `Search` | "No matching deals" | "Try adjusting your filters." | "Clear filters" (button, no route change) |
| Analyze page (first visit, no properties) | `Calculator` | "Analyze any deal" | "You can also compare deals against your existing portfolio once you add properties." | No CTA — the form is the action |
| Rent vs. Market (no benchmark data) | `TrendingUp` | "No market data yet" | "Refresh to fetch current rent estimates for your area." | "Refresh estimates" (existing button) |

#### 2.15.4 Empty State Container

All empty states use this container pattern:

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

The `border-dashed` treatment is intentional: it signals "this space is waiting to be filled" without being visually heavy. It is distinct from the solid-border `border-border` used on cards that contain data.

---

## 3. In-App Improvements

### 6.19 Property Detail Page — Tab and Content Restructure

#### 6.19.1 Current State

The property detail page has four tabs rendered via `property-detail-tabs.tsx`. On desktop this works well. On mobile, the tab bar is functional. The issue is the content inside each tab:

- **Overview tab:** Good. PropertyHero + health strip + metrics. Manageable density.
- **Details tab:** Dense table of inputs. Hard to scan on mobile. The table headings are small and the rows are tight.
- **Projections tab:** The largest and most interactive surface. The scenario controls panel on desktop is a solid `border-border/70 bg-background/55 p-4` card with four sub-panels inside it. On mobile, this works through `MobileSectionCard` and `MobileCollapsible`. The mobile experience here is actually quite good as of Phase 2 — the collapsible sections work. The desktop view, after the rollout guide, will be cleaner.
- **Mortgage tab:** Similar to Projections — complex controls, multiple sub-panels. Mobile experience is good via `MobileToolShell`.

#### 6.19.2 What Needs to Change

**Sticky tab bar on mobile.** When a user scrolls down in the property detail page on mobile, the tab bar scrolls out of view. This makes switching tabs require scrolling back up. The tab bar should be sticky at the top of its container (below the property header) on mobile.

Current tab bar container in `property-detail-tabs.tsx`:
```tsx
<div className="border-b border-border">
  {/* tab buttons */}
</div>
```

Target:
```tsx
<div className="sticky top-0 z-10 border-b border-border bg-background">
  {/* tab buttons */}
</div>
```

**Note:** The `top-0` value assumes the app nav is NOT sticky at the viewport level during tab content scrolling. Verify the app nav's `position` value — if it is `sticky`, the tab bar needs `top-[nav-height]`. The current app nav uses `sticky top-0` with a height of approximately `h-14` (56px), so the correct value is `top-14`.

**Tab active indicator.** Currently active tabs use a `border-b-2 border-accent` pattern. Add `transition-all duration-200` so the indicator travels smoothly when switching tabs. This applies to the tab button itself.

**Details tab — section dividers.** The Details tab is a long scroll of form-like fields. Group them into three clear sections with dividers: Property, Income & Expenses, Mortgage. Each section gets a `text-sm font-medium text-muted` header. This already exists in the data, but the visual separation is weak on mobile.

#### 6.19.3 No Structural Rebuild Required

The property detail tabs work. Do not rebuild them. The changes above are incremental improvements, not a redesign. The sticky tab bar is the highest-impact change.

---

### 6.20 Dashboard — Metric Card Micro-Interactions

#### 6.20.1 Current State

The primary metric cards on the dashboard (`MetricCard`) render as static display elements. They are not interactive — they do not link anywhere. This is correct behavior for now, but the cards also have no hover state at all, which makes the dashboard feel completely static.

#### 6.20.2 What Needs to Change

The `MetricCard` component should receive a subtle hover lift:

```
hover:shadow-sm hover:border-border/80
```

Combined with `transition-shadow duration-150 transition-colors duration-150`.

This is not adding a link — it is adding a visual depth response that communicates the cards are part of a live system. Even without navigation, the hover response communicates "this data is real and active."

**Implementation note:** The cards should remain non-clickable (`div`, not `a` or `button`). The hover effect is purely aesthetic.

---

### 6.21 Forms — Input Field Polish

#### 6.21.1 Current State

All input fields use:
```tsx
className="rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground"
```

They have no focus ring (addressed by the global CSS in §2.13.4), no hover state, and no transition.

#### 6.21.2 What Needs to Change

Add to all `<input>`, `<select>`, and `<textarea>` elements:

```
transition-colors duration-150 hover:border-border/80 focus:border-accent/40
```

The `hover:border-border/80` is subtle — it slightly darkens the border when the user mouses over an input, providing a pre-focus affordance.

The `focus:border-accent/40` gives the focused input a colored border ring distinct from the default, in addition to the global `focus-visible` ring from §2.13.4.

**Implementation approach:** Add this to the global CSS as a base style for `input`, `select`, and `textarea` elements rather than adding it to every component manually:

```css
input, select, textarea {
  transition: border-color 150ms, box-shadow 150ms;
}
input:hover:not(:focus), select:hover:not(:focus), textarea:hover:not(:focus) {
  border-color: hsl(var(--border) / 0.8);
}
```

---

### 6.22 Deals and Saved Deals Pages

#### 6.22.1 Current State

The deals list page (`deals/page.tsx`) and deals list component (`deals/deals-list.tsx`) still use pre-Phase-1 patterns for card borders and typography. The rollout guide addresses the typography. This section covers the structural improvement.

#### 6.22.2 What Needs to Change

**Deal card hover state.** Each saved deal in the list should have a hover lift, consistent with how property cards in the properties list work. Add `transition-shadow duration-150 hover:shadow-sm` to the deal card wrapper.

**Sort options.** The sort dropdown uses `→` and `←` arrow text. These should be replaced with proper Lucide icons (`ArrowUp`, `ArrowDown`) or simply text without directional arrows ("Cash flow: high to low").

**Empty state.** Addressed in §2.15.3.

---

## 4. Public Pages Improvements

### 7.3 Landing Page — Conversion and Trust Lift

#### 7.3.1 Current State Assessment

After Phase 1, the landing page has:
- Hero with left-aligned copy + product screenshot on desktop (strong)
- Social proof strip (present but placeholder quotes)
- Calculator section
- Value props (4 icons + text)
- How it works (3 steps)
- Pricing section
- FAQ + footer

This is a solid structure. The conversion problem is not structural — it is emphasis.

#### 7.3.2 What Needs to Change

**A. Foreground the free tier's no-card advantage.**

Currently "No card required for Free" is one of three small trust pills below the hero CTAs. This is Veld's strongest acquisition advantage at the top of funnel — a user who would otherwise bounce because they expect a credit card prompt will convert if they see "free, no card required" prominently. It needs to be elevated above the CTAs, not buried below them.

Target placement:
```
[headline]
[subheadline]
[Get started free →]   [See pricing]
  ↑
Add a line directly under the primary CTA: "Free plan — no card required. 60 seconds to your first property."
```

This replaces the three trust pills with a single, more direct sentence.

**B. Move the deal analyzer above the value props.**

The current section order is: Hero → social proof → Calculator → Value props → How it works → Pricing → FAQ.

The deal analyzer (PublicCalculator) is the product's most immediate-value feature for first-time visitors from SEO. A user who finds the site through a "rental property deal analyzer" search query lands on the hero and has to scroll to find the calculator. Reorder:

Hero → Social proof → **Deal analyzer** → Value props → How it works → Pricing → FAQ

**C. Section heading treatment.**

The Value props and How it works sections use plain `h2` with no visual anchor. Add a subtle accent-tinted pill above each section heading (an "eyebrow" in the modern SaaS sense, but non-uppercase):

```tsx
<div className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
  Why Veld
</div>
<h2 className="mt-3 text-2xl font-semibold text-foreground">...</h2>
```

This is a single visual element that separates section headings from body text without the harsh `uppercase tracking-wide` pattern.

**D. Social proof — update or remove.**

The current social proof quotes are generic placeholders. If real quotes are available, use them. If not, replace the social proof strip with a single honest sentence: "Built for small landlords managing 1–10 properties." This is more credible than unattributed anonymous quotes.

---

### 7.4 Pricing Page

#### 7.4.1 Current State

The pricing page shows the pricing cards with feature lists. The design was addressed in Phase 1 (border updates, pill chips). What remains is a conversion problem, not a design problem.

#### 7.4.2 What Needs to Change

**Feature comparison table.** Below the pricing cards, add a simple feature comparison table that shows what each tier includes. This is standard on all high-converting SaaS pricing pages and is notably absent from Veld's. The format:

| Feature | Free | Pro |
|---|---|---|
| Properties | 3 | 25 |
| Saved deals | 5 | Unlimited |
| Rent estimates | ✓ | ✓ |
| Deal analyzer | ✓ | ✓ |
| Modeling workspace | ✓ | ✓ |
| Mortgage simulator | ✓ | ✓ |
| Portfolio charts | ✓ | ✓ |
| Data export (CSV) | — | ✓ |
| Priority support | — | ✓ |

This table should appear below the pricing cards in a collapsible `<details>` element on mobile ("Compare all features") and always-visible on desktop.

**Frequently asked questions.** The pricing page should include 3–4 targeted FAQs:
1. "Can I switch from Free to Pro later?" → Yes, your data carries over.
2. "Does Free require a credit card?" → No.
3. "What happens if I exceed my property limit on Free?" → You can view existing properties but can't add more until you upgrade or remove one.
4. "Can I cancel Pro anytime?" → Yes, you revert to Free and keep your data.

These answer the questions that prevent conversion. They belong on the pricing page, not just in a support doc.

---

## 5. Brand Mark Question

### 5.1 The Current Situation

The logo is the text string "Veld" rendered as `text-lg font-semibold text-foreground` in the app nav, and as an SVG wordmark (or similar) in the landing nav. There is no mark — no symbol, no icon, no visual element that can represent the brand without the word.

This is a concrete business problem, not just an aesthetic one:

- App icons for PWA/bookmark are generic browser icons
- Social/OG images have no brand mark
- The favicon is likely text or a generic placeholder
- In any context where the brand name cannot be shown (small icon sizes, abstract representations), the brand is invisible

### 5.2 The Recommendation

A minimal geometric mark that:
1. Can be rendered at 16x16 (favicon) and scales cleanly to 512x512
2. Works in both light and dark mode
3. Relates visually to either "V" (the letter), "portfolio" (a grid/stack concept), or "land/real estate" (a simple building silhouette or geometric parcel shape)
4. Does NOT use gradients, complex line work, or color fills that fail at small sizes

The design direction that fits Veld's aesthetic best: a minimal **"V" lettermark** in the indigo accent color, using geometric strokes consistent with Lucide icon style (2px stroke, rounded caps). This:

- Extends the existing typography treatment naturally
- Works at all icon sizes because it is one letter, not a complex shape
- Uses brand color (indigo) so it is visually anchored in the token system
- Requires no illustration skills — it is a typographic mark

### 5.3 What Phase 3 Does

Phase 3 does not create the brand mark — that requires a design tool, not code. What Phase 3 does:
1. Documents the favicon and OG image situation
2. Prepares the technical slots for when the mark is created: `app/favicon.ico`, `public/icon.svg`, OG image templates
3. Updates the landing nav to support an image-based logo mark alongside the wordmark (so the mark can be dropped in when ready)

---

## 6. Mobile-Specific Standards

### 6.1 Touch Target Sizes

Every interactive element on mobile must meet the 44×44pt minimum touch target. The current codebase has several buttons that render below this:

- The tab bar buttons on property detail (`px-3 py-2`) — currently approximately 36px tall. Needs `py-3` to hit 44px.
- The preset buttons in the Projections controls panel — `px-2.5 py-1` — well below 44px on mobile. The mobile variant already uses `px-3 py-1.5 text-xs` which is closer but still marginal. Target: `min-h-[44px]` or `py-2.5`.
- Sort and filter controls in the properties list — `px-2 py-1.5` buttons. Need `py-2` minimum.

**Standard:** Any `<button>` or `<a>` visible on mobile must have a minimum rendered height of 44px (`min-h-[44px]`) or sufficient padding to achieve this. If the visual design does not allow for 44px height (e.g., compact chip buttons), use `min-h-[44px]` with `flex items-center` to ensure the touch surface extends beyond the visual bounds.

### 6.2 Bottom Navigation / Thumb Zone

The current mobile navigation is a hamburger drawer accessed from the top-right. For a product that active users open daily, this is a friction point. The thumb zone on mobile (the area reachable by the right thumb without shifting hand grip) covers roughly the bottom-center of the screen.

**Phase 3 recommendation:** Evaluate adding a bottom navigation strip for authenticated in-app users on mobile. This is a structural change that requires careful consideration of which pages it includes. Suggested tabs:

| Tab | Icon | Route |
|---|---|---|
| Dashboard | `LayoutDashboard` | `/dashboard` |
| Properties | `Building2` | `/properties` |
| Analyze | `Calculator` | `/analyze` |
| More | `Menu` | (opens drawer) |

The "More" tab would house: Modeling, Mortgage, Plans, Settings, Changelog.

**Caveat:** This is the largest structural change in Phase 3. It requires:
1. A new `MobileBottomNav` component
2. Conditional rendering in the root layout (authenticated only, mobile only)
3. Adjusting the main content area's bottom padding to account for the nav height (`pb-[env(safe-area-inset-bottom)+64px]`)
4. Removing the hamburger trigger from the top nav on mobile (or keeping it for the "More" destinations)

This change is categorized as **optional but recommended**. If it is deferred, the hamburger drawer remains functional and Phase 3 is complete without it. If it is implemented, it is the single biggest UX improvement for active mobile users.

### 6.3 Scroll and Overflow

Properties list on mobile: The portfolio totals section at the top of the properties list should be a horizontally scrollable strip on mobile rather than a wrapping grid. This prevents metric cards from stacking into a tall column before the property list even begins.

Current: `grid grid-cols-2 gap-3`  
Target on mobile: `flex overflow-x-auto gap-3 pb-1 snap-x` with each card having `snap-start shrink-0 w-[140px]`

This is the standard "horizontal scroll pill" pattern used by banking apps, Robinhood, and Coinbase for top-of-screen metric strips on mobile.

---

## 7. Anti-Patterns — Phase 3 Additions

These patterns are explicitly prohibited in all new code going forward, in addition to the anti-patterns documented in Phases 1 and 2:

### 7.1 Silent Hover States

Any element with a `hover:` class that does not also have `transition-*` is a silent interaction. This is prohibited. If you add `hover:bg-*`, `hover:text-*`, or `hover:shadow-*`, you must also add the appropriate `transition-*` class.

### 7.2 Missing Focus Rings on Interactive Elements

Any `<button>`, `<a>`, `<input>`, `<select>`, or `<textarea>` that does not respond visually to keyboard focus is a Phase 3 anti-pattern. The global CSS from §2.13.4 handles most cases automatically — the only way to violate this rule is to add `outline-none` without also adding `focus-visible:ring-*`.

### 7.3 Generic Empty States

Any surface that shows no data must have a designed empty state per the system in §2.15. The following are explicitly prohibited as empty state treatments:
- Blank space with nothing rendered
- A plain text string like "No data" without heading, icon, and action
- A hidden/`display:none` section that simply disappears when empty

### 7.4 Uncontrolled Touch Targets

Any `<button>` that renders below 44px in height on mobile is a touch target violation. Use `min-h-[44px]` as a guard if the design intent requires visual compactness.

### 7.5 Anonymous Social Proof

Any testimonial or social proof element must be either (a) attributable to a real, verifiable user/account, or (b) removed and replaced with an honest factual claim. Generic anonymous quotes ("— Small landlord, 4 properties") are prohibited in new code and should be replaced in the landing page as part of Phase 3.
