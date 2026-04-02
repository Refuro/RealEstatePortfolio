# Veld Portfolio — Implementation Guide 2026 Phase 3

**Version:** 1.0  
**Date:** 2026-04-01  
**Status:** Active  
**Design rationale:** `docs/design/design-brief-2026-phase3.md`  
**Prerequisites:** All Phase 1, Phase 2, and Phase 3 Rollout changes must already be applied before starting this guide.

> **How to use this guide:**  
> Work through Stages 1–8 in order. Each change provides a `Find:` block and a `Replace:` block. Complete and verify each stage before moving to the next. Stage 8 (Mobile Bottom Nav) is optional but recommended for active-user UX.

---

## Table of Contents

- [Stage 1 — Global CSS: Focus Ring and Form Transitions](#stage-1--global-css-focus-ring-and-form-transitions) *(15 min)*
- [Stage 2 — Motion Layer: Remaining Interactive Surfaces](#stage-2--motion-layer-remaining-interactive-surfaces) *(30 min)*
- [Stage 3 — Empty State System](#stage-3--empty-state-system) *(45 min)*
- [Stage 4 — Property Detail Tab: Sticky Bar and Touch Targets](#stage-4--property-detail-tab-sticky-bar-and-touch-targets) *(20 min)*
- [Stage 5 — MetricCard Hover Polish](#stage-5--metriccard-hover-polish) *(10 min)*
- [Stage 6 — Landing Page: Conversion and Trust Lift](#stage-6--landing-page-conversion-and-trust-lift) *(45 min)*
- [Stage 7 — Pricing Page: Comparison Table and FAQs](#stage-7--pricing-page-comparison-table-and-faqs) *(30 min)*
- [Stage 8 — Mobile Bottom Navigation (Optional)](#stage-8--mobile-bottom-navigation-optional) *(1–2 hours)*
- [Stage 9 — Brand Mark Preparation (Code Slots Only)](#stage-9--brand-mark-preparation-code-slots-only) *(15 min)*
- [Verify Checklist](#verify-checklist)

---

## Stage 1 — Global CSS: Focus Ring and Form Transitions

**Goal:** Add a global focus ring and global input hover/transition styles to `globals.css`. This is the highest-leverage change in Phase 3 — one file edit covers hundreds of interactive elements.

**Estimated time:** 15 minutes  
**File:** `app/app/globals.css`

---

### 1.1 — Global focus ring

**Find** the `:root` block (ends at the closing `}`). Insert the following block immediately after the `:root` block closing brace and before the `@media (prefers-color-scheme: dark)` block:

Find:
```css
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* System preference: dark when user hasn't set explicit theme */
```

Replace with:
```css
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Global focus ring — keyboard/AT navigation only, no mouse ring */
/* color-mix() is required here because --accent is a hex value, not HSL components */
:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--accent) 50%, transparent);
  outline-offset: 2px;
}

/* Remove redundant outlines already replaced by :focus-visible above */
:focus:not(:focus-visible) {
  outline: none;
}

/* System preference: dark when user hasn't set explicit theme */
```

---

### 1.2 — Global input and form element transitions

**Find** (append to the CSS after the focus-visible block, before the dark mode media query):

Find:
```css
/* System preference: dark when user hasn't set explicit theme */
@media (prefers-color-scheme: dark) {
```

Replace with:
```css
/* Input, select, textarea: hover affordance and smooth focus transition */
input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]),
select,
textarea {
  transition: border-color 150ms, box-shadow 150ms;
}

input:not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="color"]):hover:not(:focus),
select:hover:not(:focus),
textarea:hover:not(:focus) {
  border-color: hsl(var(--border) / 0.75);
}

/* System preference: dark when user hasn't set explicit theme */
@media (prefers-color-scheme: dark) {
```

---

**Verify after Stage 1:**
- [ ] Tab through any form (e.g., Add property) — each focused input shows a 2px indigo ring
- [ ] Mouse hover over an input (not focused) — border slightly darkens
- [ ] Mouse click on a button — no focus ring visible (ring only on keyboard nav)
- [ ] Dark mode: focus ring uses dark-mode accent color (lighter indigo)
- [ ] No CSS parse errors

---

## Stage 2 — Motion Layer: Remaining Interactive Surfaces

**Goal:** Apply `transition-*` classes to every interactive element that currently has a `hover:` class but no transition. Work file by file through the highest-traffic surfaces.

**Estimated time:** 30 minutes  
**Files:** `MetricCard`, `deals-list.tsx`, `property-detail-tabs.tsx`, `dashboard/page.tsx` onboarding banner, `landing-nav.tsx`, `app-nav.tsx`

---

### 2.1 — MetricCard: hover lift

**File:** `app/components/metric-card.tsx`

Find:
```tsx
      className={`min-w-0 rounded-lg border border-border bg-card shadow-sm ${
        compact ? "p-3" : "p-5"
      }`}
```

Replace with:
```tsx
      className={`min-w-0 rounded-lg border border-border bg-card shadow-sm transition-shadow duration-150 hover:shadow-md ${
        compact ? "p-3" : "p-5"
      }`}
```

---

### 2.2 — Dashboard: first-property banner link

**File:** `app/app/(app)/dashboard/page.tsx`

Find:
```tsx
              className="rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground hover:bg-accent-hover"
```

Replace with:
```tsx
              className="rounded-md bg-accent px-4 py-2 text-base font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent-hover"
```

---

### 2.3 — Deals list: sort select + search input transition

**File:** `app/app/(app)/deals/deals-list.tsx`

These elements already have `focus:border-accent focus:outline-none`. Add transitions.

Find:
```tsx
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted focus:border-accent focus:outline-none"
```

Replace with:
```tsx
            className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm placeholder:text-muted transition-colors duration-150 focus:border-accent focus:outline-none"
```

Find:
```tsx
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
```

Replace with:
```tsx
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors duration-150 focus:border-accent focus:outline-none"
```

Also fix the deal card border pattern (rollout guide should have caught this, but confirm):

Find:
```tsx
              className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md hover:bg-subtle/40"
```

Replace with:
```tsx
              className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md hover:bg-subtle/40"
```

**Also fix the sort option arrow literals** in this file:

Find:
```tsx
          <option value="cash-flow-high">Cash flow: high → low</option>
          <option value="cash-flow-low">Cash flow: low → high</option>
          <option value="cap-rate-high">Cap rate: high → low</option>
```

Replace with:
```tsx
          <option value="cash-flow-high">Cash flow: high to low</option>
          <option value="cash-flow-low">Cash flow: low to high</option>
          <option value="cap-rate-high">Cap rate: highest first</option>
```

---

### 2.4 — Property detail tabs: tab button transition

**File:** `app/app/(app)/properties/[id]/property-detail-tabs.tsx`

The tab buttons already have `transition-colors`. Confirm they also have `duration-150`. 

Find:
```tsx
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
```

Replace with:
```tsx
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
```

The change from `transition-colors` to `transition-all duration-200` makes the bottom border indicator travel smoothly.

---

### 2.5 — Landing nav: link transitions

**File:** `app/components/landing-nav.tsx`

The nav links use `text-muted hover:text-foreground`. They need `transition-colors duration-150`.

Find (replace_all: true — this pattern appears on every nav link):
```
className="text-muted hover:text-foreground"
```

Replace with:
```
className="text-muted transition-colors duration-150 hover:text-foreground"
```

---

**Verify after Stage 2:**
- [ ] Dashboard metric cards: subtle shadow lift on hover
- [ ] Deals list: search input and sort select transitions
- [ ] Property detail tab switching: indicator travels with `duration-200`
- [ ] Landing nav links: smooth `text-muted → text-foreground` on hover

---

## Stage 3 — Empty State System

**Goal:** Implement the empty state system from `design-brief-2026-phase3.md §2.15` for the five critical surfaces: properties list, deals list (no deals + no search results), and properties page with filter.

**Estimated time:** 45 minutes  
**Files:** `app/app/(app)/deals/deals-list.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/(app)/properties/page.tsx`

---

### 3.1 — Deals list: empty state (no deals)

**File:** `app/app/(app)/deals/deals-list.tsx`

Add `FileText` to the lucide import at the top of the file.

Find:
```tsx
import { Search } from "lucide-react";
```

Replace with:
```tsx
import { FileText, Search } from "lucide-react";
```

Then replace the current generic empty state paragraph:

Find:
```tsx
      {filtered.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">
          {search ? "No deals match your search." : "No deals to display."}
        </p>
```

Replace with:
```tsx
      {filtered.length === 0 ? (
        <div>
          {search ? (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <Search className="size-10 text-muted/40" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">No matching deals</p>
                <p className="mt-1 text-sm text-muted">Try adjusting your search.</p>
              </div>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-1 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <FileText className="size-10 text-muted/40" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-foreground">No saved deals</p>
                <p className="mt-1 text-sm text-muted">Run a deal analysis and save it here to compare later.</p>
              </div>
              <Link
                href="/analyze"
                className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
              >
                Analyze a deal
              </Link>
            </div>
          )}
        </div>
```

---

### 3.2 — Properties list: empty state (no properties)

**File:** `app/app/(app)/properties/page.tsx`

First, confirm the current empty state for the properties list. Find the existing no-properties render path. If the file renders `null` or a plain text string when `properties.length === 0`, replace it with the following. If it has a different structure, adapt accordingly.

Find the no-properties condition (look for a return that fires when the properties array is empty — it may use `propertyCount === 0` or `properties.length === 0`). Replace its content with:

```tsx
if (properties.length === 0) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Properties</h1>
        <Link
          href="/properties/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent-hover"
        >
          Add property
        </Link>
      </div>
      <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <Building2 className="size-10 text-muted/40" aria-hidden />
        <div>
          <p className="text-sm font-semibold text-foreground">No properties yet</p>
          <p className="mt-1 text-sm text-muted">
            Track equity, cash flow, and rent estimates across all your properties.
          </p>
        </div>
        <Link
          href="/properties/new"
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
        >
          Add your first property
        </Link>
      </div>
    </div>
  );
}
```

Make sure `Building2` is imported from `lucide-react` at the top of the file.

---

### 3.3 — Properties list: no-results-after-filter empty state

**File:** `app/app/(app)/properties/page.tsx`

If the properties list has filtering (search/filter) and can show zero results while `properties.length > 0`, add a search-specific empty state inside the filtered results section:

Find the location where filtered results are rendered empty (likely a `filtered.length === 0` check after the filter logic). If it exists, replace the generic text with:

```tsx
<div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center">
  <Search className="size-10 text-muted/40" aria-hidden />
  <div>
    <p className="text-sm font-semibold text-foreground">No matching properties</p>
    <p className="mt-1 text-sm text-muted">Try adjusting your filters.</p>
  </div>
</div>
```

---

**Verify after Stage 3:**
- [ ] Deals page with no saved deals: icon + heading + "Analyze a deal" CTA renders
- [ ] Deals page with search that matches nothing: icon + "No matching deals" + "Clear search" button renders
- [ ] "Clear search" button clears the search field (calls `setSearch("")`)
- [ ] Properties page with no properties: icon + heading + "Add your first property" CTA renders
- [ ] Icons visible in both light and dark mode (`text-muted/40` should render in both)

---

## Stage 4 — Property Detail Tab: Sticky Bar and Touch Targets

**Goal:** Make the property detail tab bar sticky so it stays visible when scrolling through long tab content, and fix the touch target height for both the desktop and mobile tab buttons.

**Estimated time:** 20 minutes  
**File:** `app/app/(app)/properties/[id]/property-detail-tabs.tsx`

---

### 4.1 — Sticky tab bar

Find:
```tsx
      <nav
        className="mt-4 flex items-center border-b border-border"
        aria-label="Property sections"
      >
```

Replace with:
```tsx
      <nav
        className="sticky top-14 z-10 mt-4 flex items-center border-b border-border bg-background"
        aria-label="Property sections"
      >
```

The `top-14` value aligns to the app nav height (56px = 14 × 4px Tailwind unit). The `bg-background` prevents content from showing through as the user scrolls under the tab bar.

**Note:** If the app nav height is not exactly `h-14` (56px), measure it. The app nav is in `app/app/(app)/app-nav.tsx`. If the nav renders taller or shorter, adjust `top-14` accordingly.

---

### 4.2 — Desktop tab button touch targets

The desktop tab buttons use `py-3` which renders at approximately 44px total with the text height. Confirm this is sufficient. If any tab button renders below 44px, adjust:

Find:
```tsx
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
```

Confirm `py-3` = 12px × 2 + 20px text = 44px. This is correct. No change needed.

---

### 4.3 — Mobile tab bar: jump-select height

Read the full mobile tab bar section in `property-detail-tabs.tsx` (lines ~80–127) to see the mobile jump-to select. Ensure the `<select>` element has `min-h-[44px]`.

Find the mobile `<select>` element (it appears after the `md:hidden` or `hidden md:flex` conditional). It likely has `px-2 py-2` or similar. Add `min-h-[44px]` if needed.

Read:

```59:127:app/app/(app)/properties/[id]/property-detail-tabs.tsx
```

After reading, apply the following if the select does not yet have `min-h-[44px]`:

Find (the mobile select — adjust based on actual content):
```tsx
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
```

Replace with:
```tsx
          className="min-h-[44px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
```

---

**Verify after Stage 4:**
- [ ] Open a property on desktop. Scroll down through the tab content. The tab bar stays pinned below the app nav.
- [ ] Open a property on mobile. Scroll down through content. Tab bar stays visible.
- [ ] The tab bar background is opaque (content does not bleed through)
- [ ] Tab switching still works correctly after making the nav sticky

---

## Stage 5 — MetricCard Hover Polish

Stage 5 is complete — the MetricCard change was already handled in Stage 2.1 above.

No additional work required here. Confirm the `transition-shadow duration-150 hover:shadow-md` is present on the MetricCard wrapper after Stage 2.

---

## Stage 6 — Landing Page: Conversion and Trust Lift

**Goal:** Elevate the no-card-required trust signal, reorder sections to put the deal analyzer above value props, and add accent-pill eyebrows to the Value props and How it works sections.

**Estimated time:** 45 minutes  
**File:** `app/app/page.tsx`

---

### 6.1 — Hero: replace trust pills with a focused trust line

The current trust pills are:
```tsx
                {!userId && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="rounded-full border border-border/70 px-3 py-1">No card required for Free</span>
                    <span className="rounded-full border border-border/70 px-3 py-1">Start in about 60 seconds</span>
                    <span className="rounded-full border border-border/70 px-3 py-1">Cancel anytime</span>
                  </div>
                )}
```

Replace with a single stronger line placed directly under the CTA row:

Find:
```tsx
                {!userId && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <span className="rounded-full border border-border/70 px-3 py-1">No card required for Free</span>
                    <span className="rounded-full border border-border/70 px-3 py-1">Start in about 60 seconds</span>
                    <span className="rounded-full border border-border/70 px-3 py-1">Cancel anytime</span>
                  </div>
                )}
```

Replace with:
```tsx
                {!userId && (
                  <p className="text-sm text-muted">
                    Free plan — <span className="font-medium text-foreground">no card required</span>. Your first property in about 60 seconds.
                  </p>
                )}
```

---

### 6.2 — Section order: move deal analyzer before value props

The current section order in `page.tsx` is approximately:
1. Hero
2. Social proof strip
3. Calculator section (`PublicCalculator`)
4. Value props section
5. How it works section
6. Pricing section
7. FAQ

Actually verify the exact order by reading the section structure:

Find the `{/* Calculator section */}` comment block. It should already be before value props. If it is, no reorder needed. **Only reorder if the calculator section is currently after value props.**

To verify, look for:
```tsx
        {/* Calculator section */}
```

If it appears after the value props section, move the entire `<section className="...">` block containing `PublicCalculator` to appear directly after the social proof strip. Otherwise, leave the order as-is.

---

### 6.3 — Social proof: replace generic quotes

Find:
```tsx
        <section className="border-y border-border bg-subtle px-4 py-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">&ldquo;Finally replaced my spreadsheet.&rdquo;</span>
                {" "}— Small landlord, 4 properties
              </p>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">&ldquo;The deal analyzer alone is worth it.&rdquo;</span>
                {" "}— First-time investor
              </p>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="text-sm text-muted">
                <span className="font-semibold text-foreground">&ldquo;Clear numbers without the chaos.&rdquo;</span>
                {" "}— Portfolio of 8 rentals
              </p>
            </div>
          </div>
        </section>
```

Replace with a factual positioning statement until real testimonials are available:
```tsx
        <section className="border-y border-border bg-subtle px-4 py-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-8">
              <p className="text-sm text-muted">Built for small landlords managing <span className="font-medium text-foreground">1–10 properties</span></p>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="text-sm text-muted">Replaces your <span className="font-medium text-foreground">portfolio spreadsheet</span> in about 5 minutes</p>
              <span className="hidden h-4 w-px bg-border sm:block" aria-hidden />
              <p className="text-sm text-muted">Free plan with <span className="font-medium text-foreground">no card required</span></p>
            </div>
          </div>
        </section>
```

**Note:** Replace this section with real testimonials as soon as they are available from actual users. The factual statements above are more credible than anonymous quotes but less compelling than real attributable feedback.

---

### 6.4 — Value props section: add accent-pill eyebrow

Find the value props section heading. It renders as an `h2` with no eyebrow. Add the eyebrow pill:

Find (the value props section `h2` — adapt based on exact current text):
```tsx
            <h2 className="text-2xl font-semibold text-foreground">
```

This likely reads something like "Everything you need to manage your portfolio." Find the exact heading and add the eyebrow immediately before it:

Find (example — verify exact string):
```tsx
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-2xl font-semibold text-foreground">
```

Replace with:
```tsx
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-3 flex justify-center">
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                Why Veld
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
```

---

### 6.5 — How it works section: add accent-pill eyebrow

Apply the same treatment to the "How it works" section heading.

Find the "How it works" section's `h2`. Look for a section that references `HOW_IT_WORKS`:

Find (adapt to actual structure):
```tsx
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold text-foreground">
```

NOTE: If there are multiple sections with this structure, identify which one is "How it works" by looking for the `HOW_IT_WORKS.map(...)` call nearby.

Replace with:
```tsx
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 flex justify-center">
              <span className="inline-flex items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1 text-xs font-medium text-accent">
                How it works
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
```

---

**Verify after Stage 6:**
- [ ] Landing page hero: single trust line renders below CTA buttons (signed-out view)
- [ ] Social proof strip: factual statements render correctly
- [ ] Value props section: accent pill eyebrow visible above the `h2`
- [ ] How it works section: accent pill eyebrow visible above the `h2`
- [ ] Everything looks correct in dark mode
- [ ] Mobile: trust line wraps gracefully

---

## Stage 7 — Pricing Page: Comparison Table and FAQs

**Goal:** Add a feature comparison table below the pricing cards and a short FAQ section. Both improve conversion by reducing uncertainty.

**Estimated time:** 30 minutes  
**File:** `app/app/pricing/page.tsx` (or wherever the pricing page is located — check `app/app/(marketing)/pricing/page.tsx` or similar)

First, locate the pricing page:

Find the file path using: `rg -l "Get started free" app/app` or similar.

---

### 7.1 — Feature comparison table

Add this section after the pricing cards section and before any existing FAQ:

```tsx
        {/* Feature comparison */}
        <section className="mt-12 hidden md:block">
          <h2 className="mb-6 text-center text-base font-semibold text-foreground">Compare plans</h2>
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-subtle">
                  <th className="px-4 py-3 text-left font-medium text-muted">Feature</th>
                  <th className="px-4 py-3 text-center font-medium text-muted">Free</th>
                  <th className="px-4 py-3 text-center font-medium text-foreground">Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Properties", "3", "25"],
                  ["Saved deals", "5", "Unlimited"],
                  ["Rent estimates", true, true],
                  ["Deal analyzer", true, true],
                  ["Scenario modeling", true, true],
                  ["Mortgage simulator", true, true],
                  ["Portfolio charts", true, true],
                  ["Data export (CSV)", false, true],
                  ["Priority support", false, true],
                ].map(([feature, free, pro], i) => (
                  <tr
                    key={i}
                    className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-subtle/30"}`}
                  >
                    <td className="px-4 py-3 text-foreground">{feature as string}</td>
                    <td className="px-4 py-3 text-center">
                      {free === true ? (
                        <span className="text-positive font-semibold">✓</span>
                      ) : free === false ? (
                        <span className="text-muted/40">—</span>
                      ) : (
                        <span className="text-foreground">{free as string}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {pro === true ? (
                        <span className="text-positive font-semibold">✓</span>
                      ) : pro === false ? (
                        <span className="text-muted/40">—</span>
                      ) : (
                        <span className="font-medium text-foreground">{pro as string}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile: comparison accordion */}
        <section className="mt-8 md:hidden">
          <details className="rounded-xl border border-border">
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-muted">
              Compare all features
            </summary>
            <div className="divide-y divide-border px-4 pb-4">
              {[
                ["Properties", "3", "25"],
                ["Saved deals", "5", "Unlimited"],
                ["Rent estimates", "✓", "✓"],
                ["Deal analyzer", "✓", "✓"],
                ["Scenario modeling", "✓", "✓"],
                ["Mortgage simulator", "✓", "✓"],
                ["Portfolio charts", "✓", "✓"],
                ["Data export (CSV)", "—", "✓"],
                ["Priority support", "—", "✓"],
              ].map(([feature, free, pro], i) => (
                <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-foreground">{feature}</span>
                  <div className="flex gap-6 text-xs">
                    <span className="text-muted">Free: <span className="font-medium text-foreground">{free}</span></span>
                    <span className="text-muted">Pro: <span className="font-medium text-foreground">{pro}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </details>
        </section>
```

---

### 7.2 — Pricing FAQ

Add after the comparison table:

```tsx
        {/* Pricing FAQ */}
        <section className="mt-10">
          <h2 className="mb-4 text-base font-semibold text-foreground">Common questions</h2>
          <div className="space-y-2">
            {[
              {
                q: "Does the Free plan require a credit card?",
                a: "No. The Free plan is free with no card required. You only need a card when upgrading to Pro.",
              },
              {
                q: "Can I switch from Free to Pro later?",
                a: "Yes. All your data — properties, deals, and settings — carries over automatically when you upgrade.",
              },
              {
                q: "What happens when I reach the Free plan property limit?",
                a: "You can view all your existing properties but cannot add new ones until you upgrade to Pro or remove a property.",
              },
              {
                q: "Can I cancel Pro anytime?",
                a: "Yes. Cancel anytime and you revert to the Free plan at the end of your billing period. Your data stays intact.",
              },
            ].map(({ q, a }, i) => (
              <details key={i} className="rounded-xl border border-border bg-card">
                <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-foreground transition-colors duration-150 hover:text-foreground/80">
                  {q}
                </summary>
                <p className="px-5 pb-4 text-sm text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
```

---

**Verify after Stage 7:**
- [ ] Desktop pricing page: comparison table renders below pricing cards, all features show correctly
- [ ] Mobile pricing page: "Compare all features" accordion collapses/expands correctly
- [ ] FAQ section: all 4 questions render and expand correctly
- [ ] Pricing page layout not broken in dark mode

---

## Stage 8 — Mobile Bottom Navigation (Optional)

**Goal:** Add a persistent bottom navigation strip for authenticated in-app users on mobile, providing one-tap access to the four primary destinations without requiring the hamburger drawer.

**Estimated time:** 1–2 hours  
**Files:** New component `app/components/mobile-bottom-nav.tsx`, root app layout

**Status:** Optional. Complete this stage only if you want to improve the mobile active-user experience. The product is fully functional without it.

---

### 8.1 — Create the MobileBottomNav component

Create new file: `app/components/mobile-bottom-nav.tsx`

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Calculator, LayoutDashboard, MoreHorizontal } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/analyze", label: "Analyze", icon: Calculator },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors duration-150 ${
              isActive ? "text-accent" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon className={`size-5 ${isActive ? "text-accent" : ""}`} aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
      {/* More button — opens the sidebar/hamburger */}
      <button
        type="button"
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-medium text-muted transition-colors duration-150 hover:text-foreground"
        aria-label="More navigation options"
        onClick={() => {
          // Trigger the existing mobile menu open — requires a shared state or event
          // Option A: Use a custom event
          document.dispatchEvent(new CustomEvent("open-mobile-menu"));
        }}
      >
        <MoreHorizontal className="size-5" aria-hidden />
        <span>More</span>
      </button>
    </nav>
  );
}
```

---

### 8.2 — Add safe-area bottom padding to main content

**File:** `app/app/(app)/layout.tsx` (or the root authenticated layout)

The main content area needs bottom padding on mobile so the last items are not hidden behind the bottom nav.

Find the `<main>` element in the authenticated layout and add:

```tsx
className="... pb-16 md:pb-0"
```

or if it uses Tailwind's `pb-safe` convention:

```tsx
className="... pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0"
```

---

### 8.3 — Render MobileBottomNav in authenticated layout

**File:** `app/app/(app)/layout.tsx`

Add the import and render the component just before the closing `</body>` or closing layout wrapper:

```tsx
import { MobileBottomNav } from "@/components/mobile-bottom-nav";

// Inside the layout JSX, before the closing tag:
<MobileBottomNav />
```

---

### 8.4 — Listen for open-mobile-menu event in AppNav

**File:** `app/app/(app)/app-nav.tsx`

The "More" button in `MobileBottomNav` dispatches a `CustomEvent`. The `AppNav` component needs to listen for it to open the mobile drawer.

Inside `AppNav` (which is a client component), add:

```tsx
useEffect(() => {
  const handler = () => setMobileOpen(true); // or whatever the open state setter is named
  document.addEventListener("open-mobile-menu", handler);
  return () => document.removeEventListener("open-mobile-menu", handler);
}, []);
```

Adapt `setMobileOpen` to match the actual state setter name in `AppNav`.

---

**Verify after Stage 8 (if implemented):**
- [ ] Mobile (< md): bottom nav visible with 4 items
- [ ] Desktop (≥ md): bottom nav hidden
- [ ] Active tab highlights in accent color
- [ ] "More" button opens the existing mobile drawer
- [ ] Content is not obscured by the bottom nav (padding applied)
- [ ] Safe area insets respected on iPhone with home bar

---

## Stage 9 — Brand Mark Preparation (Code Slots Only)

**Goal:** Prepare the technical slots for a brand mark (SVG icon) without implementing the mark itself. When a mark is designed, it can be dropped in immediately.

**Estimated time:** 15 minutes

---

### 9.1 — Landing nav: brand mark slot status

**File:** `app/components/landing-nav.tsx`

**No code change needed.** The brand mark slot already exists. The logo currently renders as:

```tsx
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Image
            src="/favicon.svg"
            width={20}
            height={20}
            className="size-5 shrink-0 object-contain"
            alt=""
            aria-hidden
          />
          Veld
        </Link>
```

The structure (`flex items-center gap-2`, `<Image>` slot next to wordmark) is already correct. When a branded SVG mark is ready, simply replace the `src="/favicon.svg"` with the new asset path.

**Action:** Open `/app/favicon.svg` and verify the current SVG is identifiable as a brand mark at small sizes. If it is a generic placeholder, replace it with a proper branded file — but this is a design asset task, not a code task. The slot is wired and ready.

---

### 9.2 — Document favicon and OG image slots

Create or update `public/` with placeholder comments. No code change — just note that the following files should be replaced when the mark is ready:

- `app/favicon.ico` — Replace with branded favicon (16x16, 32x32, 48x48)
- `public/icon.svg` — The SVG mark for use in OG images and PWA
- `app/opengraph-image.tsx` or `.png` — OG image using the mark

These are design assets, not code. Document their location and expected format in `docs/design/design-brief-2026-phase3.md` §5.

---

**Verify after Stage 9:**
- [ ] Landing nav: accent-colored "V" monogram appears next to "Veld" wordmark
- [ ] Works in dark mode (dark accent color used)
- [ ] No layout shift compared to before

---

## Verify Checklist

Run the full verification after all stages are complete.

### Functional checks
- [ ] Tab keyboard navigation: every interactive element shows a 2px indigo ring when focused by keyboard
- [ ] Mouse navigation: no focus rings appear on mouse click (only keyboard)
- [ ] Form inputs: hover shows subtle border darkening; focus shows accent ring
- [ ] All dashboard metric cards have a hover shadow lift
- [ ] Property detail tab bar sticks below app nav when scrolling
- [ ] Tab switching has a smooth indicator transition
- [ ] Deals page empty state: correct icon + heading + CTA
- [ ] Properties page empty state: correct icon + heading + CTA
- [ ] Landing page: "no card required" trust line visible in hero
- [ ] Landing page: accent-pill eyebrows on value props and how-it-works sections
- [ ] Pricing page: comparison table visible on desktop, accordion on mobile
- [ ] Pricing page: FAQ renders and expands correctly
- [ ] Landing nav: "V" monogram placeholder visible

### Visual regression checks (dark mode)
- [ ] Focus rings visible in dark mode
- [ ] Empty state icons visible in dark mode
- [ ] Social proof strip updated copy in dark mode
- [ ] Pricing comparison table in dark mode
- [ ] Landing nav monogram in dark mode

### Build check
```powershell
Set-Location "c:\Users\Refur\OneDrive\Documents\RealEstateProject\RealEstatePortfolio\app"; npx next build
```

Zero new errors is the pass condition.

---

## Sequencing Summary

| Stage | Priority | Impact | Effort |
|---|---|---|---|
| 1 — Global CSS | **Do first** | High (covers hundreds of elements) | Low (15 min) |
| 2 — Motion layer | High | Medium | Low (30 min) |
| 3 — Empty states | High | High (retention impact) | Medium (45 min) |
| 4 — Sticky tab bar | Medium | High (mobile UX) | Low (20 min) |
| 5 — MetricCard hover | Low | Low | Done in Stage 2 |
| 6 — Landing page | High | High (conversion) | Medium (45 min) |
| 7 — Pricing page | Medium | Medium | Medium (30 min) |
| 8 — Bottom nav | Optional | High for mobile | High (1–2 hr) |
| 9 — Brand mark slots | Low | Low (preparatory) | Low (15 min) |

**Minimum viable Phase 3:** Stages 1, 2, 3, 4, 6 give the highest return on time invested and cover all the design brief's top priorities.
