> ⚠️ **SUPERSEDED** — This document is a historical record. The canonical design reference is [`docs/design/design-spec-2026.md`](./design-spec-2026.md). Do not use this document as active guidance.

# Veld Portfolio — Design Brief 2026 Phase 2

**Version:** 1.0  
**Date:** 2026-04-01  
**Status:** Active — companion to `docs/design/design-brief-2026.md`  
**Scope:** Remaining surfaces not addressed in Phase 1; animation/motion layer; loading and empty-state standards  
**Companion document:** `docs/design/implementation-guide-2026-phase2.md` (AI-executable technical instructions)

> **How to use this document:** Read `design-brief-2026.md` first. This document only adds new principles and addresses surfaces Phase 1 did not cover. Sections are numbered as continuations of the Phase 1 brief (2.10+, 6.12+) so both documents form a single coherent reference.

---

## Table of Contents

1. [Phase 2 Scope and Goals](#1-phase-2-scope-and-goals)
2. [New System Tokens and Standards](#2-new-system-tokens-and-standards)
   - [2.10 Animation and Transition Tokens](#210-animation-and-transition-tokens)
   - [2.11 Loading Skeleton Standard](#211-loading-skeleton-standard)
   - [2.12 Empty State Standard](#212-empty-state-standard)
3. [In-App Pages — Phase 2](#3-in-app-pages--phase-2)
   - [6.12 Modeling Workspace](#612-modeling-workspace)
   - [6.13 Mortgage Workspace](#613-mortgage-workspace)
   - [6.14 Plans and Billing (In-App)](#614-plans-and-billing-in-app)
   - [6.15 Analyze Deal](#615-analyze-deal)
   - [6.16 Dashboard — Secondary Metrics and Charts Panel](#616-dashboard--secondary-metrics-and-charts-panel)
   - [6.17 Rent vs. Market Section](#617-rent-vs-market-section)
   - [6.18 Property Forms (New and Edit)](#618-property-forms-new-and-edit)
4. [Public Pages — Phase 2](#4-public-pages--phase-2)
   - [7.1 Public Tools Hub](#71-public-tools-hub)
   - [7.2 Individual Calculator Pages](#72-individual-calculator-pages)
5. [Updated Shared Component Reference](#5-updated-shared-component-reference)
6. [Anti-Pattern Additions](#6-anti-pattern-additions)

---

## 1. Phase 2 Scope and Goals

### 1.1 What Phase 1 Delivered

Phase 1 established the brand identity (indigo accent), rebuilt the marketing landing page, documented the Surface Hierarchy system, consolidated the Settings page, polished property detail tabs, updated the navigation, and introduced the animation token groundwork. That work raised the product from approximately 4.5/10 to 7.5/10 against SaaS industry standards at this price point.

### 1.2 The Remaining Gap

The ceiling at 7.5 is held in place by three specific classes of problem that Phase 1 did not address:

**1. Incomplete rollout of Phase 1 patterns.** The Modeling workspace, Mortgage workspace, Plans/billing page, Analyze deal page, and all public calculator pages were explicitly deferred. These pages still carry the old design language: `border-border/70 bg-card/95` card borders, `uppercase tracking-wide text-muted` section labels, and literal arrow-text back links (`← Properties`). A user who navigates from the now-polished dashboard to Modeling will notice the contrast immediately.

**2. System-level gaps.** Phase 1 defined Surface Hierarchy (structure), Typography (scale), and Color (tokens). It did not define Motion, Loading, or Empty States. Without a documented motion layer, every interactive transition is either missing or ad-hoc. Without a loading skeleton standard, the product creates jarring layout shifts between loading and loaded states. Without a formal empty-state system, zero-data views are inconsistent — some have illustrations and CTAs, others are plain text.

**3. Public calculator pages.** These pages are often the first thing a prospective user sees — arriving from SEO. They still carry the old `text-sm font-medium uppercase tracking-wide text-muted` "Calculator" eyebrow label, a centered header pattern with no brand presence, and no conversion-oriented CTA section after the calculator results.

### 1.3 Phase 2 Goal

Every surface of the product — in-app and public-facing — should feel like it was built by the same team at the same time. A user can navigate from the dashboard to the Mortgage workspace to a public calculator page and back to Settings without encountering a design-language inconsistency.

The target after Phase 2 is 9/10. The remaining 1 point is earned by product work outside design scope: real social proof data, retaken product screenshots, and future feature additions.

---

## 2. New System Tokens and Standards

### 2.10 Animation and Transition Tokens

#### 2.10.1 The Problem

Phase 1 introduced `transition-colors duration-150` and `transition-shadow duration-150` on hover states across card and button components. However, these values were applied without a policy, and many interactive elements in the untouched pages have either no transitions (jarring instant state changes) or mismatched durations (some `duration-200`, some `duration-300` from Tailwind defaults).

The goal is not to add animation for its own sake. The goal is to make interactive feedback feel instantaneous enough to not lag, but smooth enough to not jar.

#### 2.10.2 Token Definitions

Add the following CSS custom properties to `globals.css` under the `:root` block:

```css
/* Motion tokens */
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 300ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

#### 2.10.3 Usage Policy

| Interaction Type | Duration | Easing | Tailwind Equivalent |
|---|---|---|---|
| Button hover/active (color, shadow) | fast (150ms) | ease-out | `transition-all duration-150` |
| Card hover (shadow lift) | fast (150ms) | ease-out | `transition-shadow duration-150` |
| Nav active indicator (border, background) | fast (150ms) | ease-out | `transition-colors duration-150` |
| Tab indicator (underline travel) | base (200ms) | ease-in-out | `transition-all duration-200` |
| Collapsible/accordion expand | base (200ms) | ease-out | `transition-all duration-200` |
| Panel entrance (new content appearing) | base (200ms) | ease-out | `transition-opacity duration-200` |
| Modal/sheet overlay | slow (300ms) | ease-out | `transition-all duration-300` |
| Page-level transitions | none | — | No animation — too heavy, causes layout jank on navigation |

#### 2.10.4 Audit Target

Every interactive surface touched in Phases 1 and 2 must have an explicit `transition-*` class. The absence of a transition class on a hover state is a linting failure. The following patterns are the minimum:

- All `hover:bg-*` classes must be accompanied by `transition-colors duration-150`
- All `hover:shadow-*` classes must be accompanied by `transition-shadow duration-150`
- All `border-b-2` active tab indicators must be accompanied by `transition-colors duration-200`

---

### 2.11 Loading Skeleton Standard

#### 2.11.1 Three Patterns

**Pattern A — Inline pulse (existing)**  
Used for individual loading values inside an already-rendered container. The surrounding structure is visible; only the value itself is loading.

```tsx
<div className="h-4 w-24 animate-pulse rounded-md bg-subtle" />
```

Use for: metric values while data fetches, chart loading placeholder text.

**Pattern B — Card-level skeleton**  
Used for a complete panel whose content is loading. The card shell (border, background, rounded corners, shadow) is immediately visible, with animated placeholder bars inside representing the structure of the loaded content.

```tsx
<div className="rounded-xl border border-border bg-card p-5 shadow-sm">
  <div className="animate-pulse space-y-3">
    <div className="h-4 w-32 rounded-md bg-subtle" />
    <div className="h-3 w-full rounded-md bg-subtle" />
    <div className="h-3 w-3/4 rounded-md bg-subtle" />
  </div>
</div>
```

Use for: Dashboard charts loading, individual chart cards, plan context cards.

**Pattern C — Full-page skeleton (loading.tsx)**  
Used when the entire page content is loading via Next.js Streaming or a server component boundary. The skeleton mimics the visual structure of the loaded page at a coarse level: a page title placeholder, followed by one or two panel placeholders at approximately the right heights.

```tsx
// loading.tsx canonical pattern
<div className="animate-pulse space-y-4">
  {/* Page heading */}
  <div className="h-8 w-48 rounded-md bg-subtle" />
  <div className="h-4 w-80 rounded-md bg-subtle" />
  {/* Action strip (if the page has one) */}
  <div className="mt-2 flex gap-2">
    <div className="h-8 w-28 rounded-md bg-subtle" />
    <div className="h-8 w-28 rounded-md bg-subtle" />
  </div>
  {/* Primary content panel */}
  <div className="mt-4 rounded-xl border border-border bg-card/50 p-5 shadow-sm">
    <div className="h-4 w-40 rounded-md bg-subtle" />
    <div className="mt-4 h-48 rounded-lg bg-subtle/60" />
  </div>
</div>
```

Use for: `loading.tsx` files in each route segment. Every major route (Modeling, Mortgage, Plans, Dashboard, Properties, Analyze) should have a `loading.tsx` that follows this pattern.

#### 2.11.2 What Not to Do

Do not use `loading.tsx` to render a single large `h-[320px]` rectangle. This gives no information about what is loading and increases perceived load time because the user has no frame of reference. The more the skeleton resembles the loaded state's structure, the faster loading feels.

Do not use `loading.tsx` as a spinner. Spinners are appropriate for user-initiated async actions (form submit, button click). Page-level loading should always use a skeleton.

---

### 2.12 Empty State Standard

#### 2.12.1 The Pattern

Every zero-data view in the product follows a single structural pattern:

```tsx
<div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
  {/* Illustration — optional but strongly recommended */}
  <img
    src="/empty-[context].png"
    alt=""
    className="mx-auto mb-4 size-24 object-contain opacity-80"
    aria-hidden
  />
  {/* Title */}
  <h2 className="text-lg font-semibold text-foreground">[Title]</h2>
  {/* Description */}
  <p className="mx-auto mt-2 max-w-sm text-sm text-muted">[One sentence.]</p>
  {/* Primary CTA */}
  <div className="mt-6 flex justify-center">
    <Link
      href="[target]"
      className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
    >
      [CTA label]
    </Link>
  </div>
  {/* Secondary content — optional */}
  <details className="mt-6 text-left">
    <summary className="cursor-pointer list-none text-center text-sm text-muted hover:text-foreground">
      <span className="underline decoration-border underline-offset-4">[More options label]</span>
    </summary>
    {/* secondary actions */}
  </details>
</div>
```

#### 2.12.2 The Five Standard States

| State | Context | Title | Description | Primary CTA |
|---|---|---|---|---|
| **Zero properties** | Dashboard, Properties list, Modeling, Mortgage | "Welcome to Veld" (first visit) or "No properties yet" | "Add your first property to unlock your portfolio dashboard." | "Add your first property" → `/properties/new` |
| **Zero saved deals** | Deals list | "No saved deals yet" | "Run the deal analyzer and save your first analysis." | "Analyze a deal" → `/analyze` |
| **No mortgage on property** | Mortgage workspace, property mortgage tab | "No mortgage added" | "Add mortgage details to unlock payoff simulation." | "Add mortgage" → `/properties/[id]?tab=details#mortgages` |
| **No projections data** | Modeling workspace (edge case: property with zero rent/value) | "Not enough data to model" | "Add rent and value estimates to this property to run projections." | "Edit property" → `/properties/[id]/edit` |
| **API quota exhausted** | Rent vs. Market, any benchmark refresh | "Estimate limit reached" | "Your plan's hourly estimate pool is used up. Estimates refresh each hour." | "View your plan" → `/plans` |

#### 2.12.3 Illustration Naming Convention

Empty state illustrations follow the pattern `/empty-[context].png`. Contexts already established: `properties` (`empty-properties.png`), `deals` (`empty-deals.png`). Contexts that need illustrations created or assigned: `mortgage`, `projections`, `quota`. Until illustrations are available, omit the `<img>` block entirely rather than using a placeholder.

---

## 3. In-App Pages — Phase 2

### 6.12 Modeling Workspace

**File:** `app/app/(app)/modeling/modeling-workspace.tsx`

#### 6.12.1 Current State Problems

The desktop context card uses `rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm md:block hidden` — the old `border-border/70 bg-card/95` pattern that was deprecated in Phase 1. More importantly, a card wrapping a property selector and some metadata is not a Panel in the Surface Hierarchy sense — it is not a discrete object. It is a navigation/context utility. Wrapping it in a raised card gives it the same visual weight as a data panel, which creates false equivalence.

The mobile header uses `text-[11px] font-semibold uppercase tracking-[0.18em] text-muted` for labels — an even more aggressive version of the uppercase pattern we eliminated everywhere else.

The property selector `<label>` also uses `text-xs font-medium uppercase tracking-wide text-muted` — the same deprecated pattern.

#### 6.12.2 Target State

**Desktop:** The context card becomes a flat action strip. No border, no background, no shadow. The property selector and action links sit in a `flex flex-wrap items-end justify-between gap-4` row directly below the `<h1>`. This matches the dashboard's action strip pattern established in Phase 1.

**Mobile:** The `mobileHeader` prop content uses `text-xs font-medium text-muted` for labels (no uppercase, no tracking). The `<select>` element retains its focus ring and current sizing.

**"Open property detail" link:** Updated to use `ChevronLeft` icon + `inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground` — matching the pattern used in the property detail and contact pages.

**Empty state (no properties):** Already follows the correct pattern from Phase 1. No changes needed.

#### 6.12.3 Desktop Action Strip Pattern

```tsx
<div className="mt-4 flex flex-wrap items-end justify-between gap-4">
  <p className="text-sm text-muted">
    Run scenario assumptions in a global workspace.
  </p>
  <label className="block w-full text-xs font-medium text-muted lg:w-80">
    Property
    <select
      /* existing props */
      className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {/* options */}
    </select>
  </label>
</div>
{selectedProperty && (
  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
    <Link
      href={`/properties/${selectedProperty.id}`}
      className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
    >
      <ChevronRight className="size-3.5" aria-hidden />
      Open property detail
    </Link>
  </div>
)}
```

Note: Use `ChevronRight` (not `ChevronLeft`) for "go to" links. Reserve `ChevronLeft` for back navigation.

---

### 6.13 Mortgage Workspace

**File:** `app/app/(app)/mortgage/mortgage-workspace.tsx`

Identical treatment to Modeling (Section 6.12). The desktop context card becomes a flat action strip. Mobile header labels lose uppercase. Both "Open property detail" and "Edit mortgage details" links get the `ChevronRight` icon pattern.

The mortgage count badge (`rounded-full border border-border/60 bg-background/50 px-2.5 py-1 text-xs text-muted`) is correct and does not need changes — it is a status chip within a navigation context, not a section title.

---

### 6.14 Plans and Billing (In-App)

**File:** `app/app/(app)/plans/page.tsx`

#### 6.14.1 Current State Problems

- The plan context card uses `rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm` — deprecated border style.
- The "Plan context" section label uses `text-xs font-semibold uppercase tracking-wide text-muted` — deprecated uppercase label.
- Status chips use `rounded-md border border-border/70 bg-background/45 px-2.5 py-1 text-muted` — inconsistent radius (should be `rounded-full`) and inconsistent border (`border-border/70` vs `border-border`).
- Fine print links at the bottom use `font-medium text-foreground underline underline-offset-2 hover:text-accent` — the same heavy link style fixed on the pricing page in Phase 1.

#### 6.14.2 Target State

**Context card:** Upgrade to `rounded-xl border border-border bg-card shadow-sm p-4` (remove `/70` opacity and `/95` card opacity — these are deprecated dilutions that reduce contrast without adding polish).

**"Plan context" label:** Change from `text-xs font-semibold uppercase tracking-wide text-muted` to `text-xs font-medium text-muted`. Remove uppercase.

**Status chips:** Change from `rounded-md border border-border/70 bg-background/45` to `rounded-full border border-border bg-card px-3 py-1 shadow-sm` — matching the trust pills introduced on the pricing page in Phase 1.

**Fine print links:** Change from `font-medium text-foreground underline underline-offset-2 hover:text-accent` to `underline underline-offset-2 hover:text-foreground` — same fix applied to `pricing/page.tsx` in Phase 1.

---

### 6.15 Analyze Deal

**File:** `app/app/(app)/analyze/page.tsx` and `deal-analyzer-form.tsx`

#### 6.15.1 Surface Hierarchy Violation

The `analyze/page.tsx` wraps its `<h1>` and description in a `rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm` panel. This is a Surface Hierarchy violation: page-level headings belong at the Page level, not inside a Panel. No other workspace page (Dashboard, Properties, Modeling, Mortgage, Settings) wraps its `<h1>` in a card.

**Fix:** Remove the card wrapper. The `<h1>`, description paragraph, and "View saved deals" link become plain Page-level content with standard spacing. Structural equivalent:

```tsx
<div>
  <h1 className="text-2xl font-semibold text-foreground">Analyze deal</h1>
  <p className="mt-1 text-sm text-muted">
    Enter deal assumptions, review investment outcomes, and save for comparison.
  </p>
  <p className="mt-2 text-sm text-muted">
    <Link href="/deals" className="font-medium text-accent hover:underline">
      View saved deals
    </Link>{" "}
    to compare or edit analyses you've already stored.
  </p>
</div>
```

#### 6.15.2 Deal Analyzer Form Section Titles

`deal-analyzer-form.tsx` contains `DealPortfolioCompareBlock` which renders:

```tsx
<h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
  Compared to your portfolio
</h3>
```

And the table header row:

```tsx
<tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
```

Both follow the deprecated pattern. Fix:
- `h3` → `text-sm font-semibold text-foreground`
- Table header row → keep `text-[11px] text-muted` but remove `uppercase tracking-wide`. Table column headers are a legitimate use of smaller-than-body text but not of decorative uppercase.

---

### 6.16 Dashboard — Secondary Metrics and Charts Panel

**File:** `app/app/(app)/dashboard/page.tsx` and `dashboard-charts.tsx`

#### 6.16.1 Secondary Metrics Grouping

Phase 1 wrapped the primary 5-metric row in a `rounded-xl bg-subtle/30 p-2` grouping container. The secondary metrics (visible via `MobileCollapsible` expansion, always visible on desktop) render as raw individual `MetricCard` components without any grouping container. On desktop, the user sees the primary 5 in a contained group, then the secondary row as floating individual cards — breaking the visual logic.

**Fix:** Wrap the `<div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">` secondary metrics grid in the same grouping container:

```tsx
<div className="mt-3 rounded-xl bg-subtle/30 p-2">
  <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
    {/* secondary metric cards */}
  </div>
</div>
```

This change is inside the `MobileCollapsible` children, so on mobile it only appears when the collapsible is open — which is correct.

#### 6.16.2 Portfolio Charts Panel Unification

The dashboard's "Portfolio charts" section currently renders as two adjacent elements: a header row (`flex flex-wrap items-center justify-between gap-3` with the "Portfolio charts" h2 and tab buttons) and then a bare `<div>{activeChartPanel}</div>` below it. These are visually disconnected — the tab buttons appear to float above the chart rather than being a header inside a panel.

**Fix:** Wrap both the header row and the chart content in a single Panel:

```tsx
<div className="mt-8 rounded-xl border border-border bg-card shadow-sm">
  {/* Header strip — internal divider pattern */}
  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
    <h2 className="text-sm font-semibold text-foreground">Portfolio charts</h2>
    <div className="flex flex-wrap gap-2">
      {/* ChartTabButton components */}
    </div>
  </div>
  {/* Chart content */}
  <div className="p-5">
    {activeChartPanel}
  </div>
</div>
```

The individual chart components (`EquityChart`, `DebtVsValueChart`, `CashFlowChart`) render inside this container. Remove any `rounded-lg border border-border bg-card p-5 shadow-sm` wrapper from within the chart components themselves if they exist — they should not carry their own Panel styling when nested inside a Panel. (The `ChartLoadingPlaceholder` already uses this style — it should be converted to a borderless loading state when inside the unified panel.)

---

### 6.17 Rent vs. Market Section

**File:** `app/app/(app)/dashboard/rent-vs-market-section.tsx`

#### 6.17.1 Section Title

Two `h2` elements use `text-sm font-semibold uppercase tracking-wide text-muted` — the deprecated section title pattern.

**Fix both instances:**
- `<h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Rent vs. market</h2>` → `<h2 className="text-sm font-semibold text-foreground">Rent vs. market</h2>`

#### 6.17.2 Property Row Styling

Property list rows use `rounded-lg border border-border/70 bg-background/50 px-3 py-2` — the deprecated `border-border/70` opacity pattern.

**Fix:** Change to `rounded-lg border border-border bg-subtle/40 px-3 py-2 transition-colors hover:bg-subtle/70`.

The `hover:bg-subtle/70` is new — these rows are links, so they should have hover feedback. Add `transition-colors duration-150` per the motion policy.

#### 6.17.3 Card Border

The outer section card uses `rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm`.

**Fix:** Change to `rounded-xl border border-border bg-card p-4 shadow-sm`.

---

### 6.18 Property Forms (New and Edit)

#### 6.18.1 Back Navigation Icons

`app/app/(app)/properties/new/page.tsx` has:
```tsx
<Link href="/properties" className="text-sm text-muted hover:text-foreground">
  ← Properties
</Link>
```

`app/app/(app)/properties/[id]/edit/page.tsx` has:
```tsx
<Link href={`/properties/${id}`} className="text-sm text-muted hover:text-foreground">
  ← Back to property
</Link>
```

Both use literal arrow text. Every other back-navigation link in the app (property detail, contact, property detail back link from Phase 1) uses `ChevronLeft`.

**Fix both:** Add `import { ChevronLeft } from "lucide-react"` and replace:

```tsx
<Link
  href="[target]"
  className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
>
  <ChevronLeft className="size-4" aria-hidden />
  [Back label]
</Link>
```

---

## 4. Public Pages — Phase 2

### 7.1 Public Tools Hub

**File:** `app/app/tools/page.tsx`

#### 7.1.1 Current State

The page has `<p className="text-sm font-medium uppercase tracking-wide text-muted">Calculators</p>` as an eyebrow label above the `<h1>`. This is the exact pattern removed from the in-app calculators hub page in Phase 1, and for the same reasons: it adds a low-information label that the user already knows (they are on a calculators page) while consuming vertical space and visual weight.

The hero section is a plain left-aligned text block with no visual distinction from the rest of the page.

#### 7.1.2 Target State

Remove the uppercase "Calculators" eyebrow. Elevate the introduction area with a subtle accent-tinted container that creates a branded entry point:

```tsx
<div className="rounded-xl bg-accent/5 border border-accent/10 px-6 py-8 text-center">
  <h1 className="text-2xl font-semibold text-foreground">
    Free real estate calculators
  </h1>
  <p className="mx-auto mt-3 max-w-xl text-base text-muted">
    Quick, transparent math you can share. No account required for core estimates.
    Sign in to save analyses in the full deal workspace.
  </p>
  {userId && (
    <p className="mt-3 text-sm text-muted">
      <Link href="/calculators" className="font-medium text-accent hover:underline">
        Continue in app →
      </Link>
    </p>
  )}
</div>
```

The `CalculatorsHubCards` component (already updated in Phase 1 with brand-tinted icons) renders directly below.

---

### 7.2 Individual Calculator Pages

**Files:** `fix-and-flip/page.tsx`, `brrr/page.tsx`, `str-vs-ltr/page.tsx`

#### 7.2.1 Current State Problems

Each page has:
```tsx
<p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
<h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">[Name]</h1>
```

The uppercase "Calculator" eyebrow provides no information the breadcrumb above it doesn't already provide. It is also the same deprecated pattern eliminated everywhere else.

#### 7.2.2 Breadcrumb Elevation

The existing breadcrumb (`Calculators / Fix and flip`) is `text-sm text-muted` — visually very quiet. Elevate it slightly to `text-sm text-muted` with individual links using `text-muted hover:text-foreground transition-colors duration-150`.

Add `ChevronRight` between breadcrumb segments instead of a plain `/` divider for consistency with the rest of the navigation language:

```tsx
<nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
  <Link href="/tools" className="hover:text-foreground transition-colors duration-150">
    Calculators
  </Link>
  <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
  <span className="text-foreground">[Calculator name]</span>
</nav>
```

#### 7.2.3 Remove Uppercase Eyebrow, Keep Centered Header

After the breadcrumb, keep the centered `<h1>` and description but remove the `<p>` eyebrow entirely:

```tsx
<header className="mt-4 text-center">
  <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
    [Calculator name]
  </h1>
  <p className="mx-auto mt-3 max-w-2xl text-base text-muted">
    [Description]
  </p>
</header>
```

#### 7.2.4 Post-Calculator CTA Band

After the FAQ section on each calculator page, add a conversion-oriented CTA band. This is the point in the page where a user has used the calculator and is most likely to consider signing up. Currently, there is only a plain text link row (`All calculators · BRRRR calculator · ...`).

Replace the footer link row with a two-zone footer: an accent-tinted CTA panel for new users, followed by the existing link row:

```tsx
{!userId && (
  <div className="mt-10 rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
    <p className="text-base font-semibold text-foreground">
      Ready to track this property?
    </p>
    <p className="mt-1 text-sm text-muted">
      Save your analysis, model scenarios, and benchmark rent — all in one place.
    </p>
    <div className="mt-4 flex flex-wrap justify-center gap-3">
      <FunnelCtaLink
        href="/sign-up?intent=free"
        placement="calculator_footer"
        ctaId="create_free_account"
        planIntent="free"
        className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover transition-colors duration-150"
      >
        Start free
      </FunnelCtaLink>
      <Link
        href="/pricing"
        className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-subtle transition-colors duration-150"
      >
        See plans
      </Link>
    </div>
  </div>
)}

{/* Existing link row */}
<p className="mt-6 text-center text-sm text-muted">
  {/* existing links */}
</p>
```

Note: `FunnelCtaLink` already exists in the codebase (`@/components/marketing/funnel-cta-link`) and is used on the pricing and landing pages. Use it here for consistent conversion event tracking.

#### 7.2.5 Calculator Location Pages

The `[calculator]/[location]/page.tsx` route uses `CalculatorLocationPage` from `@/components/marketing/calculator-location-page`. Before making changes to this component, read it to assess whether it also carries the uppercase eyebrow pattern. If it does, apply the same fix. The pattern will be identical to the main calculator pages.

---

## 5. Updated Shared Component Reference

The Phase 1 component reference table is in `design-brief-2026.md` Section 7. The following components are added or updated in Phase 2:

| Component | File | Change Type | Section |
|---|---|---|---|
| `ModelingWorkspace` | `app/(app)/modeling/modeling-workspace.tsx` | Revision (flat action strip, label cleanup) | 6.12 |
| `MortgageWorkspace` | `app/(app)/mortgage/mortgage-workspace.tsx` | Revision (flat action strip, label cleanup) | 6.13 |
| `PlansPage` | `app/(app)/plans/page.tsx` | Polish (card border, chip style, fine print) | 6.14 |
| `AnalyzePage` | `app/(app)/analyze/page.tsx` | Fix (remove card wrapper from h1) | 6.15 |
| `DealAnalyzerForm` | `app/(app)/analyze/deal-analyzer-form.tsx` | Polish (section title, table header style) | 6.15 |
| `DashboardPage` | `app/(app)/dashboard/page.tsx` | Polish (secondary metrics container) | 6.16 |
| `DashboardCharts` | `app/(app)/dashboard/dashboard-charts.tsx` | Revision (unified charts panel) | 6.16 |
| `RentVsMarketSection` | `app/(app)/dashboard/rent-vs-market-section.tsx` | Polish (title style, row borders) | 6.17 |
| `NewPropertyPage` | `app/(app)/properties/new/page.tsx` | Minor (ChevronLeft back link) | 6.18 |
| `EditPropertyPage` | `app/(app)/properties/[id]/edit/page.tsx` | Minor (ChevronLeft back link) | 6.18 |
| `ToolsHubPage` | `app/tools/page.tsx` | Polish (remove eyebrow, accent intro area) | 7.1 |
| `FixAndFlipPage` | `app/tools/fix-and-flip/page.tsx` | Polish (remove eyebrow, breadcrumb, CTA band) | 7.2 |
| `BrrrPage` | `app/tools/brrr/page.tsx` | Polish (remove eyebrow, breadcrumb, CTA band) | 7.2 |
| `StrVsLtrPage` | `app/tools/str-vs-ltr/page.tsx` | Polish (remove eyebrow, breadcrumb, CTA band) | 7.2 |
| `Loading (Modeling)` | `app/(app)/modeling/loading.tsx` | Revision (structured skeleton) | 2.11 |
| `Loading (Mortgage)` | `app/(app)/mortgage/loading.tsx` | Revision (structured skeleton) | 2.11 |
| `Loading (Plans)` | `app/(app)/plans/loading.tsx` | Revision (structured skeleton) | 2.11 |
| `globals.css` | `app/globals.css` | Enhancement (animation tokens) | 2.10 |

---

## 6. Anti-Pattern Additions

The following additions extend Section 8 of `design-brief-2026.md`. The existing rules in that document remain fully in effect.

### New: Deprecated Card Border Pattern

**Do not use** `border-border/70 bg-card/95` in new or updated components. This pattern was common in early development to soften card appearance, but the result is reduced contrast that makes cards look slightly translucent without clear intent. The correct pattern for a standard Panel is `border-border bg-card shadow-sm`. The `shadow-sm` provides the elevation signal that the opacity dilution was trying to create through other means.

The pattern `border-border/70 bg-card/95` is now a visual debt marker. Any component still using it needs to be updated.

### New: Deprecated Opacity Modifiers on Core Tokens

**Do not use** `/70`, `/60`, `/50` opacity modifiers on `--border` or `--card` tokens in panel containers. These modifiers are appropriate for decorative or overlapping contexts (e.g., a chip inside a tinted section where some transparency helps blend). They are not appropriate on the primary panel border or background where the goal is clear definition.

Exception: Background overlays for modals (`bg-background/80 backdrop-blur`) and tinted section backgrounds (`bg-accent/5`, `bg-subtle/30`) are intentional and correct.

### New: Back Navigation Pattern

**Do not use** literal arrow characters (`←`) in back navigation links. Use `ChevronLeft` from Lucide Icons. The reasons:

1. The arrow character varies across fonts and renders at inconsistent weights
2. It cannot receive hover animations or color changes independently
3. It creates a maintenance inconsistency — some pages use icons, some use characters

**Correct pattern:**
```tsx
<Link
  href="[target]"
  className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
>
  <ChevronLeft className="size-4" aria-hidden />
  Back to [context]
</Link>
```

### New: Forward Navigation Pattern

For "go to" or "open" links inside panels (e.g., "Open property detail" in the workspace shells), **do not** use an arrow character or no indicator. Use `ChevronRight` from Lucide Icons:

```tsx
<Link
  href="[target]"
  className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
>
  <ChevronRight className="size-3.5" aria-hidden />
  [Link label]
</Link>
```

### New: Animation Missing = Fail

**Do not** add a `hover:bg-*` or `hover:shadow-*` class to any element without a corresponding `transition-*` class. An instant state change on hover is more jarring than no hover effect at all. The minimum valid hover pattern is:

```tsx
className="... hover:bg-subtle transition-colors duration-150"
```

### New: `loading.tsx` Minimum Standard

**Do not** write a `loading.tsx` that consists of a single undifferentiated rectangle:

```tsx
// Bad
<div className="h-[600px] animate-pulse rounded-xl bg-subtle" />
```

This tells the user nothing about what is loading and makes the perceived load time feel longer. The minimum acceptable `loading.tsx` must include a page heading placeholder and at least one panel-shaped placeholder. See Section 2.11 Pattern C for the canonical template.

---

*Reference: `docs/design/design-brief-2026.md` for Phase 1 principles. `docs/design/implementation-guide-2026-phase2.md` for AI-executable code instructions. `docs/policies/design-spec.md` for the pre-existing spec.*
