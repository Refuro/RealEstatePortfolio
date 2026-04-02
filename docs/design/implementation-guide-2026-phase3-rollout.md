# Veld Portfolio — Implementation Guide 2026 Phase 3 — Pattern Rollout

**Version:** 1.0  
**Date:** 2026-04-01  
**Status:** Active — companion to `implementation-guide-2026-phase2.md`  
**Design rationale:** All patterns in this guide are already established in Phase 1 and Phase 2. No new design decisions are made here. This guide simply applies those patterns to surfaces that were out of scope for Phases 1 and 2.  
**Prerequisites:** All Phase 1 (`implementation-guide-2026.md`) and Phase 2 (`implementation-guide-2026-phase2.md`) changes must already be applied.

> **How to use this guide:**  
> Work through Stages 1–5 in order. Each change provides a `Find:` block (exact string to locate) and a `Replace:` block (exact replacement). Changes are self-contained within each file. Complete all changes in a stage before moving to the next. Run `npx next build` after completing all stages to verify no regressions.

---

## Table of Contents

- [Stage 1 — Property Detail Tabs: Projections Content](#stage-1--property-detail-tabs-projections-content) *(45 min)*
- [Stage 2 — Property Detail Tabs: Mortgage Content](#stage-2--property-detail-tabs-mortgage-content) *(30 min)*
- [Stage 3 — Settings Page](#stage-3--settings-page) *(20 min)*
- [Stage 4 — Properties List and Overview Tab](#stage-4--properties-list-and-overview-tab) *(30 min)*
- [Stage 5 — Remaining Arrow Literals and Scattered Files](#stage-5--remaining-arrow-literals-and-scattered-files) *(20 min)*
- [Verify Checklist](#verify-checklist)

---

## Stage 1 — Property Detail Tabs: Projections Content

**Goal:** Remove all `uppercase tracking-wide` section titles and `border-border/70 bg-background/55` (or `/70 bg-card`) sub-panel borders from `projections-tab-content.tsx`. This file is the most impactful — it renders inside both the property detail page and the Modeling workspace. A user can navigate from the polished Modeling shell directly into this content; the visual seam is the most noticeable in the product.

**Estimated time:** 45 minutes  
**File:** `app/app/(app)/properties/[id]/projections-tab-content.tsx`

---

### 1.1 — "Simulation controls" heading

Find:
```tsx
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Simulation controls
          </h3>
```

Replace with:
```tsx
          <h3 className="text-sm font-semibold text-foreground">
            Simulation controls
          </h3>
```

---

### 1.2 — Desktop controls sub-panel: "Horizon and risk"

Find:
```tsx
        <div className="rounded-lg border border-border/70 bg-background/55 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Horizon and risk
            </p>
```

Replace with:
```tsx
        <div className="rounded-lg border border-border bg-subtle/40 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted">
              Horizon and risk
            </p>
```

---

### 1.3 — Desktop controls sub-panel: "Growth assumptions"

Find:
```tsx
        <div className="rounded-lg border border-border/70 bg-background/55 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Growth assumptions
          </p>
```

Replace with:
```tsx
        <div className="rounded-lg border border-border bg-subtle/40 p-4">
          <p className="mb-3 text-xs font-medium text-muted">
            Growth assumptions
          </p>
```

---

### 1.4 — Desktop controls sub-panel: "Debt strategy"

Find:
```tsx
        <div className="rounded-lg border border-border/70 bg-background/55 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Debt strategy
          </p>
```

Replace with:
```tsx
        <div className="rounded-lg border border-border bg-subtle/40 p-4">
          <p className="mb-3 text-xs font-medium text-muted">
            Debt strategy
          </p>
```

---

### 1.5 — Desktop controls sub-panel: "Exit assumptions"

Find:
```tsx
        <div className="rounded-lg border border-border/70 bg-background/55 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">
            Exit assumptions
          </p>
```

Replace with:
```tsx
        <div className="rounded-lg border border-border bg-subtle/40 p-4">
          <p className="mb-3 text-xs font-medium text-muted">
            Exit assumptions
          </p>
```

---

### 1.6 — Workspace variant: "Advanced breakdown" sub-heading inside chart panel

Find:
```tsx
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">Advanced breakdown</p>
```

Replace with:
```tsx
                  <p className="text-xs font-medium text-muted">Advanced breakdown</p>
```

---

### 1.7 — Workspace variant: controls panel border (desktop two-column layout)

Find:
```tsx
            <div className="h-full rounded-xl border border-border/70 bg-card p-4 shadow-sm">
              {controlsContent}
            </div>
```

Replace with:
```tsx
            <div className="h-full rounded-xl border border-border bg-card p-4 shadow-sm">
              {controlsContent}
            </div>
```

---

### 1.8 — Workspace variant: chart panel border (desktop two-column layout)

Find:
```tsx
            <div className="flex h-full flex-col rounded-xl border border-border/70 bg-card p-4 shadow-sm">
```

Replace with:
```tsx
            <div className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
```

---

### 1.9 — Mobile: "Scenario setup" heading

Find:
```tsx
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Scenario setup
          </h3>
```

Replace with:
```tsx
          <h3 className="text-sm font-semibold text-foreground">
            Scenario setup
          </h3>
```

---

### 1.10 — Mobile MobileSectionCard sub-title: "Horizon and risk"

Find:
```tsx
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
              Horizon and risk
            </p>
```

Replace with:
```tsx
            <p className="text-[11px] font-medium text-muted">
              Horizon and risk
            </p>
```

---

### 1.11 — Mobile MobileSectionCard sub-title: "Growth assumptions"

Find:
```tsx
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Growth assumptions
          </p>
```

Replace with:
```tsx
          <p className="text-[11px] font-medium text-muted">
            Growth assumptions
          </p>
```

---

### 1.12 — Mobile MobileSectionCard sub-title: "Debt strategy"

Find:
```tsx
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Debt strategy
              </p>
```

Replace with:
```tsx
              <p className="text-[11px] font-medium text-muted">
                Debt strategy
              </p>
```

---

### 1.13 — Mobile MobileSectionCard sub-title: "Exit assumptions"

Find:
```tsx
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Exit assumptions
              </p>
```

Replace with:
```tsx
              <p className="text-[11px] font-medium text-muted">
                Exit assumptions
              </p>
```

---

### 1.14 — Mobile advanced breakdown cards: `border-border/70 bg-background/55`

These appear in `mobileAdvancedBreakdown`. Use `replace_all: true` for the following replacement since the same class string appears on multiple mini-cards in that block.

Find:
```tsx
className="rounded-xl border border-border/70 bg-background/55 px-3 py-2"
```

Replace with:
```tsx
className="rounded-xl border border-border bg-subtle/40 px-3 py-2"
```

Also fix the `col-span-2` variants. Find:
```tsx
className="col-span-2 rounded-xl border border-border/70 bg-background/55 px-3 py-2"
```

Replace with:
```tsx
className="col-span-2 rounded-xl border border-border bg-subtle/40 px-3 py-2"
```

---

**Verify after Stage 1:**
- [ ] Open a property → Projections tab: no uppercase section labels in the controls panel
- [ ] Open Modeling workspace → desktop: controls panel and chart panel borders are consistent with page borders
- [ ] Mobile: Scenario setup / Horizon / Growth labels are regular weight, not all-caps
- [ ] No TypeScript or lint errors on this file

---

## Stage 2 — Property Detail Tabs: Mortgage Content

**Goal:** Remove all `uppercase tracking-wide` labels and normalize sub-panel borders in `mortgage-tab-content.tsx`. Same rationale as Stage 1 — this file renders inside both property detail tabs and the Mortgage workspace.

**Estimated time:** 30 minutes  
**File:** `app/app/(app)/properties/[id]/mortgage-tab-content.tsx`

---

### 2.1 — Empty state "Mortgage simulator" heading

Find:
```tsx
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Mortgage simulator
        </h2>
```

Replace with:
```tsx
        <h2 className="text-sm font-semibold text-foreground">
          Mortgage simulator
        </h2>
```

---

### 2.2 — Controls panel heading: "Simulation controls"

Find:
```tsx
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Simulation controls
        </h3>
```

Replace with:
```tsx
        <h3 className="text-sm font-semibold text-foreground">
          Simulation controls
        </h3>
```

---

### 2.3 — Controls sub-panel heading: "Mortgage and payment" (desktop)

Find:
```tsx
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Mortgage and payment
          </p>
```

Replace with:
```tsx
          <p className="mb-2 text-[11px] font-medium text-muted">
            Mortgage and payment
          </p>
```

---

### 2.4 — Controls sub-panel heading: "Pay off earlier" (desktop)

Find:
```tsx
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Pay off earlier
          </p>
```

Replace with:
```tsx
          <p className="mb-1 text-[11px] font-medium text-muted">
            Pay off earlier
          </p>
```

---

### 2.5 — Controls panel border: workspace variant

Find:
```tsx
          "h-full rounded-xl border border-border/70 bg-card p-4 shadow-sm xl:min-h-[340px]"
```

Replace with:
```tsx
          "h-full rounded-xl border border-border bg-card p-4 shadow-sm xl:min-h-[340px]"
```

---

### 2.6 — Chart panel border: workspace variant

Find:
```tsx
          "flex h-full flex-col rounded-xl border border-border/70 bg-card p-4 shadow-sm"
```

Replace with:
```tsx
          "flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm"
```

---

### 2.7 — Controls inner background: `border-border/70 bg-subtle/35`

The "selected mortgage" readonly display and "Base P&I" readonly display use this pattern.

Find (use replace_all: true — appears twice):
```tsx
              className="rounded-md border border-border/70 bg-subtle/35 px-3 py-2.5"
```

Replace with:
```tsx
              className="rounded-md border border-border bg-subtle/40 px-3 py-2.5"
```

---

### 2.8 — Mobile heading: "Payoff strategy"

Find:
```tsx
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted">
            Payoff strategy
          </h3>
```

Replace with:
```tsx
          <h3 className="text-sm font-semibold text-foreground">
            Payoff strategy
          </h3>
```

---

### 2.9 — Mobile sub-heading: "Mortgage and payment"

Find:
```tsx
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Mortgage and payment
          </p>
```

Replace with:
```tsx
          <p className="text-[11px] font-medium text-muted">
            Mortgage and payment
          </p>
```

---

### 2.10 — Mobile sub-heading: "Pay off earlier"

Find:
```tsx
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
            Pay off earlier
          </p>
```

Replace with:
```tsx
          <p className="text-[11px] font-medium text-muted">
            Pay off earlier
          </p>
```

---

**Verify after Stage 2:**
- [ ] Open a property → Mortgage tab: no uppercase labels in the simulator controls
- [ ] Open Mortgage workspace → desktop: left panel and right chart panel use `border-border` not `border-border/70`
- [ ] Mobile: "Payoff strategy" and sub-labels are regular weight and not all-caps
- [ ] No TypeScript or lint errors on this file

---

## Stage 3 — Settings Page

**Goal:** Replace the 7 deprecated `uppercase tracking-wide text-muted` section labels on the settings page with the standard `text-sm font-medium text-muted` pattern used everywhere else. Also fix the mobile quick-view card borders.

**Estimated time:** 20 minutes  
**File:** `app/app/(app)/settings/page.tsx`

---

### 3.1 — Mobile quick-view: "Account snapshot" heading

Find:
```tsx
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Account snapshot
          </p>
```

Replace with:
```tsx
          <p className="text-sm font-medium text-muted">
            Account snapshot
          </p>
```

---

### 3.2 — Mobile quick-view: "Plan" stat label

Find:
```tsx
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Plan
              </p>
```

Replace with:
```tsx
              <p className="text-[11px] font-medium text-muted">
                Plan
              </p>
```

---

### 3.3 — Mobile quick-view: "Email" stat label

Find:
```tsx
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Email
              </p>
```

Replace with:
```tsx
              <p className="text-[11px] font-medium text-muted">
                Email
              </p>
```

---

### 3.4 — Mobile quick-view: "Properties" stat label

Find:
```tsx
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Properties
              </p>
```

Replace with:
```tsx
              <p className="text-[11px] font-medium text-muted">
                Properties
              </p>
```

---

### 3.5 — Mobile quick-view: "Saved deals" stat label

Find:
```tsx
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                Saved deals
              </p>
```

Replace with:
```tsx
              <p className="text-[11px] font-medium text-muted">
                Saved deals
              </p>
```

---

### 3.6 — Mobile quick-view card border

Find:
```tsx
        <div className="rounded-2xl border border-border/70 bg-card/95 p-4 shadow-sm">
```

Replace with:
```tsx
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
```

---

### 3.7 — Mobile quick-view inner stat cell borders (replace_all: true)

Find:
```tsx
            <div className="rounded-xl border border-border/70 bg-background/50 px-3 py-2">
```

Replace with:
```tsx
            <div className="rounded-xl border border-border bg-subtle/40 px-3 py-2">
```

---

### 3.8 — "Privacy" desktop section label

Find:
```tsx
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Privacy</p>
```

Replace with:
```tsx
        <p className="mb-3 text-sm font-medium text-muted">Privacy</p>
```

---

### 3.9 — "Appearance" desktop section label (inside card)

Find:
```tsx
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Appearance</p>
```

Replace with:
```tsx
          <p className="mb-3 text-sm font-medium text-muted">Appearance</p>
```

---

### 3.10 — "Portfolio display" desktop section label (inside card)

Find:
```tsx
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Portfolio display</p>
```

Replace with:
```tsx
          <p className="mb-3 text-sm font-medium text-muted">Portfolio display</p>
```

---

### 3.11 — "Profile" desktop section label (inside card)

Find:
```tsx
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Profile</p>
```

Replace with:
```tsx
          <p className="mb-3 text-sm font-medium text-muted">Profile</p>
```

---

### 3.12 — "Plan & billing" desktop section label

Find:
```tsx
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Plan & billing</p>
```

Replace with:
```tsx
        <p className="mb-3 text-sm font-medium text-muted">Plan & billing</p>
```

---

### 3.13 — "Your data" desktop section label

Find:
```tsx
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Your data</p>
```

Replace with:
```tsx
        <p className="mb-3 text-sm font-medium text-muted">Your data</p>
```

---

### 3.14 — "Delete account" desktop section label

Find:
```tsx
        <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">Delete account</p>
```

Replace with:
```tsx
        <p className="mb-3 text-sm font-medium text-muted">Delete account</p>
```

---

**Verify after Stage 3:**
- [ ] Settings page: all section labels render at normal weight (`font-medium`) without uppercase
- [ ] Mobile quick-view card has clean `border-border` border, inner stats match
- [ ] No TypeScript or lint errors on this file

---

## Stage 4 — Properties List and Overview Tab

**Goal:** Fix the properties list page (one of the most-used pages for active users) and the property overview tab.

**Estimated time:** 30 minutes  
**Files:** `app/app/(app)/properties/page.tsx`, `app/app/(app)/properties/[id]/overview-tab-content.tsx`

---

### 4.1 — Properties list page

**File:** `app/app/(app)/properties/page.tsx`

Use `rg -n "uppercase tracking-wide" app/app/\(app\)/properties/page.tsx` to find the exact count and lines before editing. The pattern `uppercase tracking-wide text-muted` should appear 3 times in this file (portfolio totals section label, sort section label, and one more). Apply the replacement below with `replace_all: true`.

Find (replace_all: true):
```
uppercase tracking-wide text-muted
```

Replace with:
```
text-muted
```

Then fix border patterns. Find (replace_all: true):
```tsx
border border-border/70 bg-card/95
```

Replace with:
```tsx
border border-border bg-card
```

Also fix any remaining:

Find (replace_all: true):
```tsx
border-border/70 bg-background/50
```

Replace with:
```tsx
border-border bg-subtle/40
```

---

### 4.2 — Property overview tab

**File:** `app/app/(app)/properties/[id]/overview-tab-content.tsx`

Find:
```tsx
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Overview</h2>
```

Replace with:
```tsx
        <h2 className="text-sm font-semibold text-foreground">Overview</h2>
```

Also fix any remaining uppercase sub-labels. Run `rg -n "uppercase tracking-wide" app/app/\(app\)/properties/\[id\]/overview-tab-content.tsx` first to see all instances, then apply:

Find (replace_all: true in this file):
```
font-semibold uppercase tracking-wide text-muted
```

Replace with:
```
font-medium text-muted
```

---

**Verify after Stage 4:**
- [ ] Properties list: section labels render without uppercase
- [ ] Property overview tab: "Overview" heading renders in `text-foreground` at normal weight
- [ ] No TypeScript or lint errors on these files

---

## Stage 5 — Remaining Arrow Literals and Scattered Files

**Goal:** Replace the last remaining literal arrow back links with icon-based navigation, and clean up scattered uppercase labels in lower-priority files.

**Estimated time:** 20 minutes

---

### 5.1 — Amortization page back link

**File:** `app/app/(app)/properties/[id]/amortization/page.tsx`

Find:
```tsx
import Link from "next/link";
```

Replace with:
```tsx
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
```

Then:

Find:
```tsx
        <Link
          href={`/properties/${id}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Property
        </Link>
```

Replace with:
```tsx
        <Link
          href={`/properties/${id}`}
          className="inline-flex items-center gap-1 text-sm text-muted transition-colors duration-150 hover:text-foreground"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Property
        </Link>
```

---

### 5.2 — Scenario section: arrow separators

**File:** `app/app/(app)/properties/[id]/scenario-section.tsx`

These `{" → "}` literals are used between label and value in scenario comparison rows. Replace with a more neutral separator.

Find (replace_all: true):
```tsx
                    {" → "}
```

Replace with:
```tsx
                    <span className="mx-1 text-muted/50" aria-hidden>→</span>
```

NOTE: This is a cosmetic improvement only. The arrow can stay as a separator here since it communicates directionality in a before/after comparison, but wrapping it removes it from the text node and gives it proper styling.

---

### 5.3 — In-app calculator sidebar pages

**Files:**
- `app/app/(app)/calculators/fix-and-flip/page.tsx`
- `app/app/(app)/calculators/str-vs-ltr/page.tsx`
- `app/app/(app)/calculators/investment-property-calculator/page.tsx`
- `app/app/(app)/calculators/brrr/page.tsx`

Each of these pages has a `text-xs font-semibold uppercase tracking-wide text-muted` eyebrow label (e.g. "Calculator"). Apply this replacement in each file:

Find (replace_all: true per file):
```
text-xs font-semibold uppercase tracking-wide text-muted
```

Replace with:
```
text-xs font-medium text-muted
```

---

### 5.4 — Export portfolio summary page

**File:** `app/app/(app)/export/portfolio-summary/page.tsx`

This page has approximately 10 `uppercase tracking-wide text-muted` section labels. Apply the broad replacement:

Find (replace_all: true):
```
font-semibold uppercase tracking-wide text-muted
```

Replace with:
```
font-medium text-muted
```

---

### 5.5 — Onboarding panel

**File:** `app/app/(app)/onboarding-panel.tsx`

Find (replace_all: true):
```
uppercase tracking-wide text-muted
```

Replace with:
```
text-muted
```

---

### 5.6 — Admin page

**File:** `app/app/(app)/admin/page.tsx`

Find (replace_all: true):
```
font-semibold uppercase tracking-wide text-muted
```

Replace with:
```
font-medium text-muted
```

---

### 5.7 — Property detail: details tab and payoff card

**Files:**
- `app/app/(app)/properties/[id]/details-tab-content.tsx`
- `app/app/(app)/properties/[id]/payoff-card.tsx`

Apply to each:

Find (replace_all: true per file):
```
uppercase tracking-wide text-muted
```

Replace with:
```
text-muted
```

Also fix border patterns in each:

Find (replace_all: true per file):
```
border-border/70 bg-card/95
```

Replace with:
```
border-border bg-card
```

---

### 5.8 — Property mortgage section

**File:** `app/app/(app)/properties/mortgage-section.tsx`

Find (replace_all: true):
```
uppercase tracking-wide text-muted
```

Replace with:
```
text-muted
```

---

### 5.9 — Property metrics section

**File:** `app/app/(app)/properties/property-metrics-section.tsx`

Find (replace_all: true):
```
uppercase tracking-wide text-muted
```

Replace with:
```
text-muted
```

Also:

Find (replace_all: true):
```
border-border/70 bg-card/95
```

Replace with:
```
border-border bg-card
```

---

### 5.10 — Add property wizard

**File:** `app/app/(app)/properties/add-property-wizard.tsx`

Find (replace_all: true):
```
uppercase tracking-wide text-muted
```

Replace with:
```
text-muted
```

Also:

Find (replace_all: true):
```
border-border/70 bg-card/95
```

Replace with:
```
border-border bg-card
```

---

### 5.11 — Properties filters mobile

**File:** `app/app/(app)/properties/properties-filters-mobile.tsx`

Find (replace_all: true):
```
uppercase tracking-wide text-muted
```

Replace with:
```
text-muted
```

---

### 5.12 — Collapsible section

**File:** `app/app/(app)/properties/[id]/collapsible-section.tsx`

Find (replace_all: true):
```
uppercase tracking-wide text-muted
```

Replace with:
```
text-muted
```

---

### 5.13 — Projections tab content: mortgage and projections tab borders (property detail variant)

**File:** `app/app/(app)/properties/[id]/projections-tab-content.tsx`  
*(same file as Stage 1 — catching the default/property-detail variant panels that Stage 1 did not cover)*

The default (non-workspace) variant has these card wrappers:

Find:
```tsx
    <div className="rounded-lg border border-border bg-card p-4">{controlsContent}</div>
```

This one already uses `border-border bg-card` — no change needed. Confirm it reads correctly after Stage 1.

---

**Verify after Stage 5:**
- [ ] Amortization page back link shows `<ChevronLeft>` icon + "Property" text
- [ ] Scenario section separators are styled spans rather than raw text nodes
- [ ] In-app calculator pages: no uppercase eyebrow labels
- [ ] Export page: no uppercase section headers
- [ ] Onboarding panel: no uppercase labels
- [ ] Property detail sub-pages (details tab, payoff card, mortgage section, metrics section): no uppercase labels
- [ ] Add property wizard: no uppercase labels, standard border values
- [ ] Run `npx next build` — zero new errors

---

## Verify Checklist

After completing all five stages, walk through the following pages and confirm:

| Surface | Check |
|---|---|
| Dashboard → secondary metrics | Already polished (Phase 2); no regression |
| Dashboard → Rent vs. Market | Already polished (Phase 2); no regression |
| Dashboard → portfolio charts | Already polished (Phase 2); no regression |
| Properties list | No uppercase labels; card borders consistent |
| Property detail → Overview tab | "Overview" heading in foreground color |
| Property detail → Details tab | No uppercase section labels |
| Property detail → Projections tab | No uppercase labels; sub-panels use `border-border` |
| Property detail → Mortgage tab | No uppercase labels; sub-panels use `border-border` |
| Modeling workspace → Projections content | Shells + content look from same design era |
| Mortgage workspace → Mortgage content | Shell + content look from same design era |
| Settings | No uppercase labels; mobile quick-view card clean |
| Amortization page | ChevronLeft back link |
| In-app calculators | No uppercase eyebrows |
| Export page | No uppercase headers |
| Add property wizard | No uppercase labels |

Run final:
```powershell
Set-Location "c:\Users\Refur\OneDrive\Documents\RealEstateProject\RealEstatePortfolio\app"; npx next build
```

Zero new errors is the pass condition.
