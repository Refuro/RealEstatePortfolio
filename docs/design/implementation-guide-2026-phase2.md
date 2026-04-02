> ⚠️ **COMPLETED / SUPERSEDED** — All changes in this guide have been applied to the codebase. This document is a historical record of what was implemented in Phase 2. For the current design system, see [`docs/design/design-spec-2026.md`](./design-spec-2026.md).

# Veld Portfolio — Implementation Guide 2026 Phase 2

**Version:** 1.0  
**Date:** 2026-04-01  
**Status:** Active — companion to `docs/design/implementation-guide-2026.md`  
**Design rationale:** `docs/design/design-brief-2026-phase2.md`  
**Prerequisites:** All Phase 1 changes (`implementation-guide-2026.md`) must already be applied before starting Phase 2.

> **How to use this guide:**  
> Work through Stages 1–7 in order. Each change provides a `Find:` block (exact JSX to locate) and a `Replace:` block (what to substitute). Changes are self-contained within each file. Every Stage ends with a `Verify after:` checklist. Run `npm run check` after completing all stages.

---

## Table of Contents

- [Stage 1 — Typography and Back-Nav Cleanup](#stage-1--typography-and-back-nav-cleanup) *(30 min)*
- [Stage 2 — Dashboard Polish](#stage-2--dashboard-polish) *(45 min)*
- [Stage 3 — Workspace Shells](#stage-3--workspace-shells) *(1–2 hours)*
- [Stage 4 — Public Calculator Pages](#stage-4--public-calculator-pages) *(1–2 hours)*
- [Stage 5 — Animation Token Layer](#stage-5--animation-token-layer) *(30 min)*
- [Stage 6 — Loading Skeleton Upgrades](#stage-6--loading-skeleton-upgrades) *(30 min)*
- [Stage 7 — Manual Checklist (No Code)](#stage-7--manual-checklist-no-code)*
- [Part 8 — Implementation Sequencing and Regression Checks](#part-8--implementation-sequencing-and-regression-checks)

---

## Stage 1 — Typography and Back-Nav Cleanup

**Goal:** Eliminate every remaining instance of the deprecated `uppercase tracking-wide text-muted` section title pattern and every `← Back` literal arrow back link that Phase 1 did not reach.

**Estimated time:** 30 minutes  
**Files touched:** 5

---

### 1.1 — Rent vs. Market: section title style and card border

**File:** `app/app/(app)/dashboard/rent-vs-market-section.tsx`

**Change 1 — Empty state h2 title**

Find:
```tsx
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Rent vs. market
        </h2>
```

Replace with:
```tsx
      <h2 className="text-sm font-semibold text-foreground">
          Rent vs. market
        </h2>
```

NOTE: This is inside the early-return branch (`ordered.length === 0`). There is a second instance in the main return — fix both.

**Change 2 — Main section h2 title**

Find:
```tsx
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Rent vs. market
          </h2>
```

Replace with:
```tsx
          <h2 className="text-sm font-semibold text-foreground">
            Rent vs. market
          </h2>
```

**Change 3 — Section card border**

Find:
```tsx
    <section className="mt-6 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
```

Replace with:
```tsx
    <section className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
```

Also fix the empty-state card:

Find:
```tsx
      <div className="mt-6 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
```

Replace with:
```tsx
      <div className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
```

**Change 4 — Property row hover feedback**

Find:
```tsx
              className="rounded-lg border border-border/70 bg-background/50 px-3 py-2"
```

Replace with (use replace_all — this class string appears on multiple `<li>` elements):
```tsx
              className="rounded-lg border border-border bg-subtle/40 px-3 py-2 transition-colors duration-150 hover:bg-subtle/70"
```

NOTE: The `<li>` elements contain `<Link>` children so the parent `<li>` should carry the hover state. The link itself (`text-sm font-medium text-foreground`) is already correct.

---

### 1.2 — New Property Page: back link icon

**File:** `app/app/(app)/properties/new/page.tsx`

**Change 1 — Add ChevronLeft import**

Find:
```tsx
import Link from "next/link";
import { AddPropertyWizard } from "../add-property-wizard";
```

Replace with:
```tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AddPropertyWizard } from "../add-property-wizard";
```

**Change 2 — Back link**

Find:
```tsx
        <Link
          href="/properties"
          className="text-sm text-muted hover:text-foreground"
        >
          ← Properties
        </Link>
```

Replace with:
```tsx
        <Link
          href="/properties"
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Properties
        </Link>
```

---

### 1.3 — Edit Property Page: back link icon

**File:** `app/app/(app)/properties/[id]/edit/page.tsx`

**Change 1 — Add ChevronLeft import**

Find the existing imports block at the top of the file. Add `ChevronLeft` to the lucide-react import if one exists, or add a new line:

```tsx
import { ChevronLeft } from "lucide-react";
```

NOTE: Read the file's current imports before editing to determine whether a lucide-react import already exists. If it does, add `ChevronLeft` to the destructuring. If not, add a new import line after the existing `import Link from "next/link"` line.

**Change 2 — Back link**

Find:
```tsx
        <Link
          href={`/properties/${id}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Back to property
        </Link>
```

Replace with:
```tsx
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Back to property
        </Link>
```

---

### 1.4 — Plans Page: fine print links and label

**File:** `app/app/(app)/plans/page.tsx`

**Change 1 — "Plan context" label**

Find:
```tsx
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Plan context
              </p>
```

Replace with:
```tsx
              <p className="text-xs font-medium text-muted">
                Plan context
              </p>
```

**Change 2 — Context card border**

Find:
```tsx
        <div className="mt-4 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
```

Replace with:
```tsx
        <div className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
```

**Change 3 — Status chips**

The status chips use `rounded-md border border-border/70 bg-background/45 px-2.5 py-1 text-muted`. There are multiple instances. Use replace_all:

Find:
```tsx
                  <span className="rounded-md border border-border/70 bg-background/45 px-2.5 py-1 text-muted">
```

Replace with:
```tsx
                  <span className="rounded-full border border-border bg-card px-3 py-1 text-muted shadow-sm">
```

NOTE: After this change, the chips will look identical to the trust pills on the pricing page. The `col-span-2` chip (the "Renews:" chip) also needs this change — apply replace_all to catch it.

**Change 4 — Fine print links**

Find:
```tsx
        <p className="mx-auto mt-8 max-w-2xl text-center text-sm text-muted">
          Subscriptions renew until you cancel. See our Terms:{" "}
          <Link
            href="/terms#subscriptions-and-payments"
            className="font-medium text-foreground underline underline-offset-2 hover:text-accent"
          >
            Subscriptions and Payments
          </Link>
          ,{" "}
          <Link href="/terms#refunds" className="font-medium text-foreground underline underline-offset-2 hover:text-accent">
            Refunds
          </Link>
          , and{" "}
          <Link
            href="/terms#cancellation"
            className="font-medium text-foreground underline underline-offset-2 hover:text-accent"
          >
            Cancellation
          </Link>
          .
        </p>
```

Replace with:
```tsx
        <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
          Subscriptions renew until you cancel. See our Terms:{" "}
          <Link
            href="/terms#subscriptions-and-payments"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Subscriptions and Payments
          </Link>
          ,{" "}
          <Link href="/terms#refunds" className="underline underline-offset-2 hover:text-foreground">
            Refunds
          </Link>
          , and{" "}
          <Link
            href="/terms#cancellation"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Cancellation
          </Link>
          .
        </p>
```

NOTE: Also changed `text-sm` → `text-xs` for visual consistency with the equivalent text block on the pricing page.

---

**Verify after Stage 1:**
- [ ] Rent vs. Market section title is `text-foreground` (not muted/uppercase) on the dashboard
- [ ] Rent vs. Market card border is solid (no `/70` opacity)
- [ ] Property rows in Rent vs. Market have a subtle hover state
- [ ] Back link on `/properties/new` uses ChevronLeft icon
- [ ] Back link on `/properties/[id]/edit` uses ChevronLeft icon
- [ ] "Plan context" label on Plans page is not uppercase
- [ ] Plans page fine print links are `underline` colored (not `font-medium text-foreground`)
- [ ] Run `npm run check` — zero new errors

---

## Stage 2 — Dashboard Polish

**Goal:** Apply secondary metrics grouping container; unify the Portfolio charts panel; apply motion to remaining interactive elements.

**Estimated time:** 45 minutes  
**Files touched:** 2

---

### 2.1 — Dashboard: secondary metrics grouping container

**File:** `app/app/(app)/dashboard/page.tsx`

**Change 1 — Wrap secondary metrics grid in grouping container**

Find:
```tsx
      <MobileCollapsible label="More metrics">
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
```

Replace with:
```tsx
      <MobileCollapsible label="More metrics">
        <div className="mt-3 rounded-xl bg-subtle/30 p-2">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-5">
```

Then close the new wrapping div. Find the closing tag of the secondary metrics grid:

Find:
```tsx
        </div>
      </MobileCollapsible>
```

Replace with:
```tsx
        </div>
        </div>
      </MobileCollapsible>
```

NOTE: The secondary metrics grid is inside `MobileCollapsible`. On mobile it only appears when the collapsible is open. On desktop, `MobileCollapsible` renders its children directly (no collapse). Both states benefit from the container.

---

### 2.2 — Dashboard Charts: unified panel

**File:** `app/app/(app)/dashboard/dashboard-charts.tsx`

**Change 1 — Wrap multi-property chart section in a single Panel**

Find:
```tsx
  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-foreground">
          Portfolio charts
        </h2>
        <div className="flex flex-wrap gap-2">
          <ChartTabButton
            label="Equity"
            active={activeChart === "equity"}
            onClick={() => setActiveChart("equity")}
          />
          <ChartTabButton
            label="Debt vs value"
            active={activeChart === "debt_vs_value"}
            onClick={() => setActiveChart("debt_vs_value")}
          />
          <ChartTabButton
            label="Cash flow"
            active={activeChart === "cash_flow"}
            onClick={() => setActiveChart("cash_flow")}
          />
        </div>
      </div>
      <div>{activeChartPanel}</div>
    </div>
  );
```

Replace with:
```tsx
  return (
    <div className="mt-8">
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">
            Portfolio charts
          </h2>
          <div className="flex flex-wrap gap-2">
            <ChartTabButton
              label="Equity"
              active={activeChart === "equity"}
              onClick={() => setActiveChart("equity")}
            />
            <ChartTabButton
              label="Debt vs value"
              active={activeChart === "debt_vs_value"}
              onClick={() => setActiveChart("debt_vs_value")}
            />
            <ChartTabButton
              label="Cash flow"
              active={activeChart === "cash_flow"}
              onClick={() => setActiveChart("cash_flow")}
            />
          </div>
        </div>
        <div className="p-5">{activeChartPanel}</div>
      </div>
    </div>
  );
```

**Change 2 — ChartLoadingPlaceholder inside unified panel**

The `ChartLoadingPlaceholder` currently adds its own `rounded-lg border border-border bg-card p-5 shadow-sm` wrapper. Now that it renders inside the unified panel, this double-wrapping adds an extra border and elevation. Update the loading placeholder:

Find:
```tsx
function ChartLoadingPlaceholder() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
      <div className="mt-4 flex h-[240px] items-center justify-center rounded border border-dashed border-border bg-subtle/50 text-sm text-muted">
        Loading charts…
      </div>
    </div>
  );
}
```

Replace with:
```tsx
function ChartLoadingPlaceholder() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-24 rounded-md bg-subtle" />
      <div className="flex h-[240px] items-center justify-center rounded-lg border border-dashed border-border bg-subtle/50 text-sm text-muted">
        Loading charts…
      </div>
    </div>
  );
}
```

NOTE: This strips the card wrapper from the loading placeholder since it is now inside the unified panel. The `rounded-lg border border-dashed` on the inner loading area remains to indicate the chart area boundary.

**Change 3 — ChartTabButton transition**

Find:
```tsx
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-accent/50 bg-accent/15 text-foreground"
          : "border-border bg-transparent text-muted hover:bg-subtle hover:text-foreground"
      }`}
```

Replace with:
```tsx
      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all duration-150 ${
        active
          ? "border-accent/50 bg-accent/15 text-foreground"
          : "border-border bg-transparent text-muted hover:bg-subtle hover:text-foreground"
      }`}
```

NOTE: `transition-all duration-150` covers both the color and border changes in one declaration.

---

**Verify after Stage 2:**
- [ ] Dashboard "More metrics" section has the same subtle container as the primary metrics row
- [ ] Portfolio charts: tab bar and chart content are inside one unified Panel with an internal border-b divider
- [ ] No double border visible around the chart when loading (ChartLoadingPlaceholder is borderless)
- [ ] ChartTabButton transitions are smooth (150ms, not instant)

---

## Stage 3 — Workspace Shells

**Goal:** Convert Modeling and Mortgage workspace context cards to flat action strips; fix all uppercase label patterns; update Plans/billing chip styles; remove card wrapper from Analyze page heading.

**Estimated time:** 1–2 hours  
**Files touched:** 4

---

### 3.1 — Modeling Workspace

**File:** `app/app/(app)/modeling/modeling-workspace.tsx`

**Change 1 — Add ChevronRight import**

Find the top of the file. Add `ChevronRight` to imports. The file currently imports from `"next/link"` and `"react"` — add a lucide-react import:

```tsx
import { ChevronRight } from "lucide-react";
```

Add this line after the `"react"` import and before the dynamic import block.

**Change 2 — Desktop context card → flat action strip**

Find:
```tsx
      <div className="mt-4 hidden rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm md:block">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mt-1 text-sm text-muted">
              Run scenario assumptions in a global workspace.
            </p>
            {selectedProperty && properties.length <= 1 && (
              <p className="mt-2 text-sm text-muted">
                Active property:{" "}
                <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-0.5 font-medium text-foreground">
                  {selectedPropertyLabel}
                </span>
              </p>
            )}
          </div>
          <label className="w-full text-xs font-medium uppercase tracking-wide text-muted lg:w-80">
            Property
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              disabled={properties.length <= 1}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selectedProperty && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <Link
              href={`/properties/${selectedProperty.id}`}
              className="text-muted hover:text-foreground hover:underline"
            >
              Open property detail
            </Link>
          </div>
        )}
      </div>
```

Replace with:
```tsx
      <div className="mt-4 hidden md:block">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <p className="text-sm text-muted">
            Run scenario assumptions in a global workspace.
          </p>
          <label className="block w-full text-xs font-medium text-muted lg:w-80">
            Property
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              disabled={properties.length <= 1}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selectedProperty && (
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            <Link
              href={`/properties/${selectedProperty.id}`}
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              <ChevronRight className="size-3.5" aria-hidden />
              Open property detail
            </Link>
          </div>
        )}
      </div>
```

**Change 3 — Mobile header labels**

The `mobileHeader` variable uses `text-[11px] font-semibold uppercase tracking-[0.18em] text-muted` for its labels. Find all instances in `mobileHeader`:

Find (first label, inside `mobileHeader`):
```tsx
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
          Active property
        </p>
```

Replace with:
```tsx
        <p className="text-xs font-medium text-muted">
          Active property
        </p>
```

Find (selector label, inside `mobileHeader`):
```tsx
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Property
```

Replace with:
```tsx
      <label className="block text-xs font-medium text-muted">
        Property
```

Find (mobile "Open property detail" link, inside `mobileHeader`):
```tsx
          <Link
            href={`/properties/${selectedProperty.id}`}
            className="rounded-xl border border-border bg-background px-3 py-2 font-medium text-foreground hover:bg-subtle"
          >
            Open property detail
          </Link>
```

Replace with:
```tsx
          <Link
            href={`/properties/${selectedProperty.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            <ChevronRight className="size-3.5" aria-hidden />
            Open property detail
          </Link>
```

NOTE: The mobile "Open property detail" link is inside the `<div className="flex flex-wrap gap-2 text-sm">` wrapper. After changing the link style, remove the `flex flex-wrap gap-2 text-sm` wrapper if no other links exist in it, replacing with just `<div className="mt-1">`. Read the full mobileHeader block to verify.

---

### 3.2 — Mortgage Workspace

**File:** `app/app/(app)/mortgage/mortgage-workspace.tsx`

**Change 1 — Add ChevronRight import**

```tsx
import { ChevronRight } from "lucide-react";
```

Add after the `"react"` and before the dynamic import block.

**Change 2 — Desktop context card → flat action strip**

Find:
```tsx
      <div className="mt-4 hidden rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm md:block">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mt-1 text-sm text-muted">
              Run mortgage payoff simulations in a global workspace.
            </p>
            {selectedProperty && (
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
                {properties.length <= 1 && (
                  <>
                    <span>Active property:</span>
                    <span className="rounded-full border border-border/70 bg-background/60 px-2.5 py-0.5 font-medium text-foreground">
                      {selectedPropertyLabel}
                    </span>
                  </>
                )}
                <span className="rounded-full border border-border/60 bg-background/50 px-2 py-0.5 text-xs text-muted">
                  {totalMortgages} {totalMortgages === 1 ? "mortgage" : "mortgages"}
                </span>
              </p>
            )}
          </div>
          <label className="w-full text-xs font-medium uppercase tracking-wide text-muted lg:w-80">
            Property
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => {
                const nextPropertyId = e.target.value;
                setSelectedPropertyId(nextPropertyId);
                syncMortgageWorkspaceQuery(nextPropertyId, null);
              }}
              disabled={properties.length <= 1}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm normal-case tracking-normal text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
            {properties.length <= 1 && (
              <span className="mt-1 block text-xs normal-case tracking-normal text-muted">
                Add more properties to switch context here.
              </span>
            )}
          </label>
        </div>
        {selectedProperty && selectedProperty.mortgages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <Link
              href={`/properties/${selectedProperty.id}`}
              className="text-muted hover:text-foreground hover:underline"
            >
              Open property detail
            </Link>
            <span className="text-muted">•</span>
            <Link
              href={`/properties/${selectedProperty.id}?tab=details#mortgages`}
              className="text-muted hover:text-foreground hover:underline"
            >
              Edit mortgage details
            </Link>
          </div>
        )}
      </div>
```

Replace with:
```tsx
      <div className="mt-4 hidden md:block">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm text-muted">
              Run mortgage payoff simulations in a global workspace.
            </p>
            {selectedProperty && (
              <span className="mt-1.5 inline-flex items-center rounded-full border border-border bg-card px-2.5 py-0.5 text-xs text-muted shadow-sm">
                {totalMortgages} {totalMortgages === 1 ? "mortgage" : "mortgages"}
              </span>
            )}
          </div>
          <label className="block w-full text-xs font-medium text-muted lg:w-80">
            Property
            <select
              value={selectedProperty?.id ?? ""}
              onChange={(e) => {
                const nextPropertyId = e.target.value;
                setSelectedPropertyId(nextPropertyId);
                syncMortgageWorkspaceQuery(nextPropertyId, null);
              }}
              disabled={properties.length <= 1}
              className="mt-1.5 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyLabel(property)}
                </option>
              ))}
            </select>
            {properties.length <= 1 && (
              <span className="mt-1 block text-xs text-muted">
                Add more properties to switch context here.
              </span>
            )}
          </label>
        </div>
        {selectedProperty && selectedProperty.mortgages.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <Link
              href={`/properties/${selectedProperty.id}`}
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              <ChevronRight className="size-3.5" aria-hidden />
              Open property detail
            </Link>
            <Link
              href={`/properties/${selectedProperty.id}?tab=details#mortgages`}
              className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
            >
              <ChevronRight className="size-3.5" aria-hidden />
              Edit mortgage details
            </Link>
          </div>
        )}
      </div>
```

**Change 3 — Mobile header labels**

Find (inside `mobileHeader`):
```tsx
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
            Active property
          </p>
```

Replace with:
```tsx
          <p className="text-xs font-medium text-muted">
            Active property
          </p>
```

Find (selector label inside `mobileHeader`):
```tsx
      <label className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        Mortgage context
```

Replace with:
```tsx
      <label className="block text-xs font-medium text-muted">
        Mortgage context
```

Find (mobile "Open property detail" and "Edit mortgage details" links inside `mobileHeader`):
```tsx
          <Link
            href={`/properties/${selectedProperty.id}`}
            className="rounded-xl border border-border bg-background px-3 py-2 font-medium text-foreground hover:bg-subtle"
          >
            Open property detail
          </Link>
          <Link
            href={`/properties/${selectedProperty.id}?tab=details#mortgages`}
            className="rounded-xl border border-border bg-background px-3 py-2 font-medium text-foreground hover:bg-subtle"
          >
            Edit mortgage details
          </Link>
```

Replace with:
```tsx
          <Link
            href={`/properties/${selectedProperty.id}`}
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            <ChevronRight className="size-3.5" aria-hidden />
            Open property detail
          </Link>
          <Link
            href={`/properties/${selectedProperty.id}?tab=details#mortgages`}
            className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
          >
            <ChevronRight className="size-3.5" aria-hidden />
            Edit mortgage details
          </Link>
```

NOTE: Also update the containing `<div>` from `className="flex flex-wrap gap-2 text-sm"` to `className="flex flex-wrap gap-x-4 gap-y-1"` since the links are now inline-flex and no longer need the button-gap sizing.

---

### 3.3 — Analyze Deal: remove card wrapper from page heading

**File:** `app/app/(app)/analyze/page.tsx`

**Change 1 — Remove card wrapper**

Find:
```tsx
    <div>
      <div className="rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Analyze deal</h1>
          <p className="mt-1 text-sm text-muted">
            Enter deal assumptions, review investment outcomes, and save for comparison.
          </p>
          <p className="mt-3 text-sm text-muted">
            <Link href="/deals" className="font-medium text-accent hover:underline">
              View saved deals
            </Link>{" "}
            to compare or edit analyses you&apos;ve already stored.
          </p>
        </div>
      </div>
      <div className="mt-8">
```

Replace with:
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
        to compare or edit analyses you&apos;ve already stored.
      </p>
      <div className="mt-6">
```

NOTE: Reduced `mt-8` to `mt-6` on the form wrapper since there is no longer a card providing visual separation above.

---

### 3.4 — Deal Analyzer Form: section title and table header

**File:** `app/app/(app)/analyze/deal-analyzer-form.tsx`

**Change 1 — "Compared to your portfolio" h3 (empty-portfolio branch)**

Find:
```tsx
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Compared to your portfolio
        </h3>
```

Replace with (use replace_all — this pattern appears in both the empty and populated branches):
```tsx
        <h3 className="text-sm font-semibold text-foreground">
          Compared to your portfolio
        </h3>
```

**Change 2 — Comparison table header row**

Find:
```tsx
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="py-2 pr-2 font-medium">Metric</th>
                <th className="py-2 pr-2 font-medium">This deal</th>
                <th className="py-2 font-medium">Portfolio</th>
              </tr>
```

Replace with:
```tsx
              <tr className="border-b border-border text-left text-[11px] text-muted">
                <th className="py-2 pr-2 font-medium">Metric</th>
                <th className="py-2 pr-2 font-medium">This deal</th>
                <th className="py-2 font-medium">Portfolio</th>
              </tr>
```

NOTE: Removing `uppercase tracking-wide` from the table header row. Keeping `text-[11px]` and `font-medium` — table column headers in a compact data table are a legitimate use of small text, just not decorative uppercase.

---

**Verify after Stage 3:**
- [ ] Modeling workspace desktop: no card border around the property selector — plain flex row
- [ ] Modeling workspace mobile: labels are `text-xs font-medium text-muted` (no uppercase)
- [ ] Mortgage workspace desktop: same — flat strip, no card
- [ ] Mortgage workspace mobile: same label treatment as Modeling
- [ ] "Open property detail" and "Edit mortgage details" use ChevronRight icon
- [ ] Analyze page `<h1>` is at the page level (no card wrapper)
- [ ] "Compared to your portfolio" heading is `text-foreground` (not uppercase/muted)
- [ ] Plans page status chips are pill-shaped with full-border and shadow-sm

---

## Stage 4 — Public Calculator Pages

**Goal:** Remove deprecated uppercase eyebrow labels from all public tools pages; elevate the tools hub intro; add ChevronRight breadcrumb separators; add post-calculator CTA bands for signed-out users.

**Estimated time:** 1–2 hours  
**Files touched:** 4 (tools hub + 3 calculator pages)

---

### 4.1 — Tools Hub Page

**File:** `app/app/tools/page.tsx`

**Change 1 — Add FunnelCtaLink and ChevronRight imports**

Read the current import block. Add:
```tsx
import { ChevronRight } from "lucide-react";
```

NOTE: `FunnelCtaLink` is not needed on the tools hub itself (no signup CTA here), but `ChevronRight` may be useful for links. Add only the imports needed.

**Change 2 — Remove uppercase eyebrow and elevate hero section**

Find:
```tsx
          <header>
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculators</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">Free real estate calculators</h1>
            <p className="mt-3 text-base text-muted">
              Quick, transparent math you can share. Open any calculator below—no account required for
              core estimates. Sign in to save analyses in the full deal workspace.
            </p>
            {userId && (
              <p className="mt-3 text-sm text-muted">
                <Link href="/calculators" className="font-medium text-foreground hover:underline">
                  Continue in app (sidebar)
                </Link>{" "}
                for the same calculators inside your workspace.
              </p>
            )}
          </header>
```

Replace with:
```tsx
          <header className="rounded-xl border border-accent/10 bg-accent/5 px-6 py-8 text-center">
            <h1 className="text-2xl font-semibold text-foreground">
              Free real estate calculators
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted">
              Quick, transparent math you can share. No account required for core estimates.
              Sign in to save analyses in the full deal workspace.
            </p>
            {userId && (
              <p className="mt-3 text-sm text-muted">
                <Link
                  href="/calculators"
                  className="inline-flex items-center gap-1 font-medium text-accent transition-colors hover:text-accent-hover"
                >
                  Continue in app
                  <ChevronRight className="size-3.5" aria-hidden />
                </Link>
              </p>
            )}
          </header>
```

---

### 4.2 — Fix and Flip Calculator Page

**File:** `app/app/tools/fix-and-flip/page.tsx`

**Change 1 — Add ChevronRight and FunnelCtaLink imports**

Find the import block at the top. Add:
```tsx
import { ChevronRight } from "lucide-react";
import { FunnelCtaLink } from "@/components/marketing/funnel-cta-link";
```

**Change 2 — Upgrade breadcrumb and remove uppercase eyebrow**

Find:
```tsx
          <nav className="text-sm text-muted">
            <Link href="/tools" className="hover:text-foreground hover:underline">
              Calculators
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Fix and flip</span>
          </nav>
          <header className="mt-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
              Fix and flip calculator
            </h1>
```

Replace with:
```tsx
          <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/tools" className="transition-colors duration-150 hover:text-foreground">
              Calculators
            </Link>
            <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
            <span className="text-foreground">Fix and flip</span>
          </nav>
          <header className="mt-4 text-center">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              Fix and flip calculator
            </h1>
```

**Change 3 — Add post-FAQ CTA band and update footer link row**

Find:
```tsx
          <CalculatorFaqSection items={FIX_AND_FLIP_CALCULATOR_FAQ} />

          <p className="mt-6 text-center text-sm text-muted">
```

Replace with:
```tsx
          <CalculatorFaqSection items={FIX_AND_FLIP_CALCULATOR_FAQ} />

          {!userId && (
            <div className="mt-10 rounded-xl border border-accent/20 bg-accent/5 p-6 text-center">
              <p className="text-base font-semibold text-foreground">
                Ready to track this property?
              </p>
              <p className="mt-1 text-sm text-muted">
                Save your analysis, model scenarios, and benchmark rent in one place.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <FunnelCtaLink
                  href="/sign-up?intent=free"
                  placement="calculator_footer"
                  ctaId="create_free_account"
                  planIntent="free"
                  className="inline-flex items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors duration-150 hover:bg-accent-hover"
                >
                  Start free
                </FunnelCtaLink>
                <Link
                  href="/pricing"
                  className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
                >
                  See plans
                </Link>
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted">
```

---

### 4.3 — BRRRR Calculator Page

**File:** `app/app/tools/brrr/page.tsx`

Apply identical changes to 4.2. The pattern is the same:

**Change 1** — Add imports (`ChevronRight`, `FunnelCtaLink`)

**Change 2** — Find and replace breadcrumb + eyebrow:

Find:
```tsx
          <nav className="text-sm text-muted">
            <Link href="/tools" className="hover:text-foreground hover:underline">
              Calculators
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">BRRRR</span>
          </nav>
          <header className="mt-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">BRRRR calculator</h1>
```

Replace with:
```tsx
          <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/tools" className="transition-colors duration-150 hover:text-foreground">
              Calculators
            </Link>
            <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
            <span className="text-foreground">BRRRR</span>
          </nav>
          <header className="mt-4 text-center">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">BRRRR calculator</h1>
```

**Change 3** — Add post-FAQ CTA band (identical to 4.2 Change 3, add before the existing `<p className="mt-6 text-center text-sm text-muted">` footer).

---

### 4.4 — STR vs LTR Calculator Page

**File:** `app/app/tools/str-vs-ltr/page.tsx`

Apply identical changes to 4.2. The only difference is the breadcrumb label.

**Change 1** — Add imports (`ChevronRight`, `FunnelCtaLink`)

**Change 2** — Find and replace breadcrumb + eyebrow:

Find:
```tsx
          <nav className="text-sm text-muted">
            <Link href="/tools" className="hover:text-foreground hover:underline">
              Calculators
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">STR vs LTR</span>
          </nav>
          <header className="mt-4 text-center">
            <p className="text-sm font-medium uppercase tracking-wide text-muted">Calculator</p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground md:text-3xl">
              STR vs LTR calculator
            </h1>
```

Replace with:
```tsx
          <nav className="flex items-center gap-1.5 text-sm text-muted" aria-label="Breadcrumb">
            <Link href="/tools" className="transition-colors duration-150 hover:text-foreground">
              Calculators
            </Link>
            <ChevronRight className="size-3.5 text-muted/50" aria-hidden />
            <span className="text-foreground">STR vs LTR</span>
          </nav>
          <header className="mt-4 text-center">
            <h1 className="text-2xl font-semibold text-foreground md:text-3xl">
              STR vs LTR calculator
            </h1>
```

**Change 3** — Add post-FAQ CTA band (identical to 4.2 Change 3).

---

**Verify after Stage 4:**
- [ ] `tools/page.tsx` hero section has accent-tinted container; no uppercase "Calculators" label
- [ ] Fix-and-flip page: breadcrumb uses ChevronRight separator; no "Calculator" eyebrow
- [ ] BRRRR page: same
- [ ] STR vs LTR page: same
- [ ] Signed-out users see the CTA band after the FAQ section on all three calculator pages
- [ ] `FunnelCtaLink` renders correctly (inspect network — conversion event fires on click)
- [ ] Run `npm run check` — zero new errors

---

## Stage 5 — Animation Token Layer

**Goal:** Add CSS animation custom properties; standardize transition durations on the remaining interactive surfaces that Phase 1 missed.

**Estimated time:** 30 minutes  
**Files touched:** 1 (globals.css)

---

### 5.1 — globals.css: animation tokens

**File:** `app/app/globals.css`

**Change 1 — Add motion tokens to :root**

Read the current `:root` block. Find the end of the existing custom property declarations and add the motion tokens immediately after the existing color tokens (before the `}` closing `:root`):

Find the last line of custom properties inside `:root`. It will be something like:
```css
  --color-warning: var(--warning);
```

Add after it (still inside `:root`):
```css

  /* Motion tokens */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

NOTE: These CSS custom properties are not directly consumed by Tailwind (Tailwind has its own `duration-150`, `duration-200` etc.). They serve as documentation tokens and are available for any custom CSS or inline styles that need them. Tailwind classes (`duration-150`, `duration-200`, `ease-out`) continue to be the primary implementation mechanism in components.

---

**Verify after Stage 5:**
- [ ] Open browser dev tools → Computed styles on `:root` → confirm `--duration-fast`, `--duration-base`, `--duration-slow` are present
- [ ] No visual changes — this stage is additive only

---

## Stage 6 — Loading Skeleton Upgrades

**Goal:** Replace the three placeholder `loading.tsx` files with structured skeletons that mirror the actual page layout.

**Estimated time:** 30 minutes  
**Files touched:** 3

---

### 6.1 — Modeling Loading

**File:** `app/app/(app)/modeling/loading.tsx`

Replace the entire file content:

```tsx
export default function ModelingLoading() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Page heading */}
      <div className="h-8 w-36 rounded-md bg-subtle" />
      {/* Action strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="h-4 w-64 rounded-md bg-subtle" />
        <div className="h-9 w-72 rounded-md bg-subtle" />
      </div>
      {/* Workspace content panel */}
      <div className="mt-4 rounded-xl border border-border bg-card/50 shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="h-4 w-48 rounded-md bg-subtle" />
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-subtle/60" />
            ))}
          </div>
          <div className="h-[280px] rounded-lg bg-subtle/60" />
        </div>
      </div>
    </div>
  );
}
```

---

### 6.2 — Mortgage Loading

**File:** `app/app/(app)/mortgage/loading.tsx`

Replace the entire file content:

```tsx
export default function MortgageLoading() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Page heading */}
      <div className="h-8 w-32 rounded-md bg-subtle" />
      {/* Action strip */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="h-4 w-72 rounded-md bg-subtle" />
        <div className="h-9 w-72 rounded-md bg-subtle" />
      </div>
      {/* Mortgage panel */}
      <div className="mt-4 rounded-xl border border-border bg-card/50 shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <div className="flex gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-7 w-24 rounded-md bg-subtle" />
            ))}
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-subtle/60" />
            ))}
          </div>
          <div className="h-[260px] rounded-lg bg-subtle/60" />
        </div>
      </div>
    </div>
  );
}
```

---

### 6.3 — Plans Loading

**File:** `app/app/(app)/plans/loading.tsx`

Replace the entire file content:

```tsx
export default function PlansLoading() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Page heading */}
      <div className="h-8 w-44 rounded-md bg-subtle" />
      <div className="h-4 w-80 rounded-md bg-subtle" />
      {/* Plan context panel */}
      <div className="mt-4 rounded-xl border border-border bg-card/50 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-28 rounded-full bg-subtle" />
          ))}
        </div>
      </div>
      {/* Pricing cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-72 rounded-xl border border-border bg-card/50 shadow-sm" />
        ))}
      </div>
    </div>
  );
}
```

NOTE: The Plans loading skeleton shows the pill-shaped chips in the context panel to set correct expectations for the new chip style from Stage 1.4.

---

**Verify after Stage 6:**
- [ ] Navigate to `/modeling` on a slow connection (or throttle in dev tools) — skeleton shows heading + action strip + panel structure
- [ ] Navigate to `/mortgage` — same
- [ ] Navigate to `/plans` — skeleton shows context panel with pill chips + three pricing card outlines
- [ ] No layout shift visible between skeleton and loaded state (structures should approximately match)

---

## Stage 7 — Manual Checklist (No Code)

These items require human action and cannot be automated.

### 7.1 — Product Screenshots

The following screenshots in `app/public/` were taken before the Phase 1 design overhaul and no longer accurately represent the product:

| File | Replaces | Captures |
|---|---|---|
| `ScreenDashboard.png` | Current dashboard screenshot | Dashboard with indigo CTAs, metric grouping containers, clean action strip |
| `ScreenMortgage.png` | Current mortgage screenshot | Mortgage workspace with flat action strip |
| `ScreenDeal.png` | Current deal analyzer screenshot | Deal analyzer without card-wrapped heading |

**Instructions:**
1. Sign in to the product with a test account that has at least 2–3 properties
2. Set the browser to 1280×800 resolution (matches the `width={1280} height={800}` in `pricing/page.tsx` and the landing page)
3. Capture each page in dark mode and light mode — use whichever looks better
4. Replace files in `app/public/` — keep the same filenames

### 7.2 — Landing Page Social Proof Numbers

`app/app/page.tsx` contains placeholder social proof numbers in the social proof strip (user count, review count). These should be:

- Replaced with real, accurate numbers when available, or
- Removed entirely until real numbers are available

Fabricated social proof (e.g., "200+ investors" when the actual number is different) erodes trust if a visitor investigates. No placeholder is better than an inaccurate one.

### 7.3 — Clerk Appearance Production Verification

Verify in production (not dev) that the Clerk sign-in and sign-up pages show the indigo primary color from the `ClerkProvider appearance` config added in Phase 1. Clerk's appearance may require a production deployment to fully take effect.

### 7.4 — Dark Mode Visual Regression

After deploying Stages 1–6, perform a full dark-mode walk-through:

- [ ] Dashboard: accent indigo visible on CTAs, active nav bar
- [ ] Dashboard: metric grouping containers visible but not too dark
- [ ] Workspace shells (Modeling, Mortgage): flat action strip visible without card shadow
- [ ] Rent vs. Market: title is foreground (not muted/uppercase)
- [ ] Plans page: chips are pill-shaped and properly bordered
- [ ] Analyze page: no card around the heading
- [ ] Public calculator pages: accent-tinted hero section visible

---

## Part 8 — Implementation Sequencing and Regression Checks

### Recommended Order

| Stage | Focus | Time | Impact |
|---|---|---|---|
| Stage 1 | Typography + back-nav + Plans card | 30 min | High visibility — affects Rent vs Market, Plans, 2 form pages |
| Stage 2 | Dashboard secondary metrics + charts panel | 45 min | High visibility — dashboard is the most-used page |
| Stage 3 | Workspace shells (Modeling, Mortgage, Analyze) | 1–2 hours | Medium-high — paid users visit these most |
| Stage 4 | Public calculator pages | 1–2 hours | Medium — SEO entry points for new users |
| Stage 5 | Animation tokens (globals.css only) | 30 min | Low direct — documentation/foundation |
| Stage 6 | Loading skeleton upgrades | 30 min | Low direct — perceived performance improvement |
| Stage 7 | Manual (screenshots, social proof) | Manual | High — marketing site promises product it now delivers |

**Total estimated time (Stages 1–6):** 4.5–6 hours  
**Stages 1–3 alone deliver the bulk of the visual improvement.** Stages 4–6 are important for completeness but can be deferred to a second pass if time is limited.

---

### Full Regression Checklist

Run after completing all six code stages:

**Build and type-checking:**
- [ ] `npm run check` passes with zero new errors or warnings
- [ ] `npm run test` — all existing tests pass (the changes in this guide touch only UI layer files; no logic changes)

**Typography audit (walk through each page in order):**
- [ ] Dashboard: Rent vs. Market title is `text-foreground`, not uppercase/muted
- [ ] Dashboard: secondary metrics row has the same `bg-subtle/30` grouping container as the primary row
- [ ] Dashboard: Portfolio charts section is one unified panel with internal header strip
- [ ] Modeling workspace desktop: no card border; flat action strip visible
- [ ] Modeling workspace mobile: labels are regular weight (not `[0.18em]` tracked uppercase)
- [ ] Mortgage workspace desktop: same as Modeling
- [ ] Mortgage workspace mobile: same as Modeling
- [ ] Plans page: "Plan context" is `text-xs font-medium text-muted` (no uppercase)
- [ ] Plans page: status chips are pill-shaped (not rounded-md)
- [ ] Plans page: fine print links are `text-xs` and match the pricing page style
- [ ] Analyze page: `<h1>` is at page level (not inside a card)
- [ ] "Compared to your portfolio" heading is `text-foreground`
- [ ] New property page: back link uses ChevronLeft icon
- [ ] Edit property page: back link uses ChevronLeft icon
- [ ] Tools hub: accent-tinted hero section; no "Calculators" uppercase label
- [ ] Fix-and-flip calculator: ChevronRight in breadcrumb; no "Calculator" label; CTA band for signed-out users
- [ ] BRRRR calculator: same
- [ ] STR vs LTR calculator: same

**Card/surface hierarchy audit:**
- [ ] No `border-border/70 bg-card/95` patterns remain in any file touched in Phases 1 or 2
- [ ] No `uppercase tracking-wide text-muted` patterns remain in any file touched in Phases 1 or 2
- [ ] No `← ` literal arrow characters remain in any back-navigation link in the app
- [ ] No page-level `<h1>` is wrapped inside a Panel container

**Mobile checks (test at 375px viewport width):**
- [ ] Dashboard mobile: secondary metrics open cleanly inside `MobileCollapsible` with grouping container
- [ ] Modeling mobile: action strip is hidden; mobile header renders correctly
- [ ] Mortgage mobile: same
- [ ] Calculator pages: CTA band stacks cleanly; two buttons are full-width on mobile

---

*Reference: `docs/design/design-brief-2026-phase2.md` for design rationale. `docs/design/implementation-guide-2026.md` for Phase 1 changes. `docs/policies/design-spec.md` for base component patterns not covered by either Phase guide.*
