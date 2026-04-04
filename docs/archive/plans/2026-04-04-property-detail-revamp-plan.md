---
title: "feat: Property Detail & Edit Page Revamp"
type: feat
status: active
date: 2026-04-04
origin: docs/brainstorms/2026-04-04-property-detail-revamp-requirements.md
---

# feat: Property Detail & Edit Page Revamp

## Overview

This plan restructures the property detail page (Overview and Details tabs) and completes
the `/edit` page so it is the single full editor for all property data including mortgages.
It also applies a comprehensive visual polish pass to the edit page to make it feel premium
and cohesive. The result: landlords see the right information in the right place at a glance,
can edit everything from one page, and the entire surface matches the 2026 design system spec.

**Critical sequencing constraint:** Phase A (edit page complete) must ship before Phase B
(Details tab restructure). Removing inline mortgage editing from Details before adding it
to `/edit` would create a gap where mortgage editing is impossible.

---

## Problem Frame

See origin document for full analysis. Summary:

1. The Overview tab is overloaded — 8+ content blocks surround the headline metrics.
2. The Details tab is one monolithic card with no visual hierarchy.
3. `PropertyHealthStrip` renders on both tabs — duplicated on every tab switch.
4. Mortgage editing is split: property editing lives at `/edit`, mortgage editing lives inline
   on the Details tab — contradicting the architecture doc's explicit intent.
5. The `/edit` page's form card uses the wrong surface radius/shadow and a deprecated
   translucency hack on its sticky nav — it does not meet the 2026 design spec.
6. Several components have design system violations: `bg-card/95`, wrong heading levels,
   missing `tabular-nums` on financial values, `bg-card` inset surfaces on `bg-card` panels.
7. `PayoffCard` (payoff timeline + accelerator + Phase 3 refinance what-if) is confirmed
   active on the Overview tab and must be preserved — the revamp reduces noise around it,
   not the card itself.

---

## Requirements Trace

Phase A — Edit page:
- R15, R16, R17, R18: MortgageSection sibling on `/edit`; sticky nav Mortgage entry; stale copy fix
- R19, R28, R29, R30, R34, R35: PropertyForm surface fix, sticky nav, section heading level, page layout
- R31, R32, R33: MortgageSection component: heading, tabular-nums, inline form inset surface

Phase B — Details tab:
- R7, R10: Health strip on Overview only; removed from Details
- R8, R9: Details split into 4 distinct Panel cards with L3 headings + per-panel "Edit" links
- R11, R12, R13: Mortgage terms Panel — read-only display, add/add-another links, workspace link
- R14: MortgageSection (inline editing) removed from Details tab
- R20, R21: Section heading token fixes
- R22, R23, R24: Mobile: MobileSectionCard per panel, compact mortgage display, touch targets

Phase C — Overview tab:
- R1, R2, R3: Headline metrics panel; "Inputs at a glance" removed; "Open Refinance" quick action
- R4, R5, R6: Property context card; supporting metrics secondary; verbose description removed
- R25: Mobile: full-width secondary buttons for quick actions
- R26, R27: PayoffCard preserved; heading token fix (text-muted → text-foreground)

---

## Scope Boundaries

- `/mortgage` and `/modeling` workspaces: no changes.
- `add-property-wizard.tsx`: only the `bg-card/95` → `bg-card border-b border-border` sticky
  nav token fix (one line). No structural, flow, or field changes.
- `payoff-card.tsx`: only the heading token fix (R27). No behavioral or content changes.
- No inline field editing on any detail tab (not in scope now or in the future without an
  explicit product decision).
- No new metrics, alert indicators, or intelligence features.
- Edit form field UX (individual field layout, multi-unit rent inputs, estimate buttons): unchanged.

---

## Context & Research

### Relevant Code and Patterns

- `app/app/(app)/properties/[id]/page.tsx` — property + mortgage data fetch pattern;
  used as the reference for the mortgage fetch the edit route needs to add.
- `app/app/(app)/properties/[id]/overview-tab-content.tsx` — Overview tab; Unit 5 target.
- `app/app/(app)/properties/[id]/details-tab-content.tsx` — Details tab; Unit 4 target.
- `app/app/(app)/properties/[id]/payoff-card.tsx` — fully active; Phase 3 refinance what-if
  shipped. Preserved as-is except heading token.
- `app/app/(app)/properties/[id]/edit/page.tsx` — edit route; Unit 1 target.
- `app/app/(app)/properties/property-form.tsx` — form with sticky nav, 4 sections, submit handler.
- `app/app/(app)/properties/mortgage-section.tsx` — `embedded` prop controls own-card vs raw rendering.
  `MortgageForm` is an inner `<form>` — never nest inside `PropertyForm`'s `<form>`.
- `app/lib/property-form-section-nav.ts` — `PROPERTY_EDIT_SECTION_NAV` constant; gets
  Mortgage entry added.
- `app/components/mobile-section-card.tsx`, `mobile-collapsible.tsx` — Details tab mobile
  layout primitives.
- `app/app/(app)/properties/[id]/property-detail-tabs.tsx` — tab switching; has legacy
  `?tab=mortgage` redirect targeting `#mortgages` anchor. The new Mortgage terms panel
  must carry `id="mortgages"` for backward compatibility.

### Institutional Learnings

- Architecture doc: `/edit` is the single full editor. No inline PATCH without an explicit
  product decision. This plan resolves that conflict for good.
- `bg-card/95` and `border-border/70` are deprecated per design spec §5.
- Panel-level surfaces: `rounded-xl border border-border bg-card shadow-sm` (§5, §7).
- Inset surfaces (content nested inside a Panel): `rounded-lg bg-subtle/40` — no border,
  no shadow (§5).
- Nested radii: Panel (`rounded-xl`) → card inside panel (`rounded-lg`) → button/input
  (`rounded-md`). Never `rounded-xl` inside `rounded-xl` (§7).
- Form labels at L5: `text-sm font-medium text-muted` — correct in current PropertyForm.
- Section landmarks (navigational, appear in Jump-to nav): L2, `text-xl font-semibold
  text-foreground`. Card/subsection titles: L3, `text-base font-semibold text-foreground`.
- `tabular-nums` required on all financial figures outside `CalculatorMetric` (§8).
- Sticky headers on scroll get `shadow-md` (Elevated) per §6; `border-b border-border`
  provides the structural separator when translucency is removed.

### External References

None required. All patterns are well-established in this codebase.

---

## Key Technical Decisions

- **MortgageSection is a sibling of PropertyForm on `/edit`, never nested inside it.**
  `PropertyForm` renders a root `<form>`; `MortgageSection` contains `MortgageForm` which
  is also a `<form>`. Nested forms are invalid HTML. Both live on the same page at the
  same React tree level — the sticky nav's "Mortgage" anchor link scrolls page-wide to the
  sibling section, which is valid anchor behavior regardless of form boundaries.

- **The `/edit` route fetches mortgage data independently.** Currently mortgage data is
  only fetched in the detail page route. Unit 1 adds the same Prisma mortgage query to
  the edit route so it can pass `mortgages` to the sibling `MortgageSection`.

- **On `/edit`, MortgageSection uses `embedded={true}`.** The edit page provides the outer
  card (`rounded-xl border border-border bg-card shadow-sm`) and section heading externally.
  This avoids the component rendering its own `rounded-lg` card inside the page's surface,
  which would violate nested radius rules.

- **Details tab uses four separate Panel cards, not one card with dividers.** Each panel
  has its own "Edit" link pointing to a different `/edit` anchor. Per design spec §5, a
  Panel is "a standalone discrete object that could be moved or removed independently."
  Each details section passes this test (you could show Property facts without Mortgage
  terms). Contrast with the edit form's sections, which are sequential parts of one task
  and therefore correctly share one Panel with internal dividers (§5 sibling rule).

- **Legacy `?tab=mortgage` redirect anchor preserved.** `property-detail-tabs.tsx` has a
  `useEffect` that redirects `?tab=mortgage` → Details tab and scrolls to `#mortgages`.
  The new Mortgage terms Panel carries `id="mortgages"` so existing bookmarks and links
  continue to work.

- **"Open Refinance workspace" replaces "Open Mortgage workspace" in headline metrics.**
  The `PayoffCard` already provides the inline mortgage insights and refinance calculator.
  The quick action in the metrics panel should link to the full analytical workspace
  (`/refinance?propertyId=<id>`), not the generic mortgage workspace.

---

## Open Questions

### Resolved During Planning

- Inline mortgage editing on Details: **Option A** — fully removed. `/edit` is the only
  edit path. PayoffCard on Overview handles the interactive mortgage experience.
  *(see origin: §Outstanding Questions — Resolved Before Planning)*
- MortgageSection nesting: sibling architecture, not embedded inside PropertyForm.
- PayoffCard status: confirmed active. Preserved with heading fix only.
- Both blocking questions resolved. Planning is unblocked.

### Deferred to Implementation

- Exact prop shape for the read-only mortgage display in the Mortgage terms panel —
  determine whether to extend `MortgageForPayoff` type from `payoff-card.tsx` or use
  `PropertyDetailTabsProps.mortgageData` directly.
- Whether `property-detail-tabs.tsx`'s `?tab=mortgage` redirect needs any adjustment
  after the inline form is removed — the anchor scroll should still work; verify at
  implementation.
- Exact Tailwind classes for the Details tab panel "Edit" link hover animation — follow
  the existing `text-accent hover:underline` pattern or upgrade to the forward-link
  pattern (`text-sm text-muted transition-colors hover:text-foreground` + ChevronRight)
  per design spec §4.

---

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not
> implementation specification. The implementing agent should treat it as context, not
> code to reproduce.*

### Edit page structure after Phase A

```
/edit page.tsx (RSC)
  → fetches: property + mortgages (Prisma)
  → renders:
      <div className="space-y-8">
        <PropertyForm property={...} />          ← rounded-xl shadow-sm Panel
        <section id="section-mortgage"           ← rounded-xl shadow-sm Panel (sibling)
                 className="scroll-mt-28">
          heading: "Mortgages" (text-xl, L2)
          <MortgageSection embedded mortgages={mortgages} propertyId={id} />
        </section>
      </div>

PropertyForm sticky nav (inside <form>):
  Jump to: Location · Purchase & value · Income · Mortgage · Notes
            ↑ new anchor scrolls to sibling #section-mortgage below the form
```

### Details tab structure after Phase B

```
Details tab (4 separate Panels, each rounded-xl shadow-sm)
  ┌─ Property facts ────────────────── [Edit → /edit#section-location]
  ├─ Financial inputs ─────────────── [Edit → /edit#section-economics]
  ├─ Mortgage terms (id="mortgages") ─ [Edit → /edit#section-mortgage]
  │    per mortgage: balance, rate, term, payment, payoff date (read-only)
  │    "Open Refinance workspace →" link
  │    "Add another mortgage" link → /edit#section-mortgage
  └─ Notes ────────────────────────── [Edit → /edit#section-notes]

PropertyHealthStrip: removed from Details tab (stays on Overview only)
MortgageSection (inline editing): removed entirely from Details tab
```

### Overview tab structure after Phase C

```
Overview tab
  PropertyHero (address/nickname)
  PropertyHealthStrip (once only, here)
  ┌─ Headline metrics (cash flow, equity, LTV, DSCR) ──────────────┐
  │  [Open Modeling workspace]  [Open Refinance workspace]          │
  └─────────────────────────────────────────────────────────────────┘
  Property context card (1 line: "Purchased $X · $Y/mo rent · $Z/mo expenses")
  Supporting metrics (collapsed on mobile via MobileCollapsible)
  PayoffCard (payoff timeline + accelerator + refinance what-if)   ← unchanged
```

---

## Implementation Units

---

- [ ] **Unit 1: `/edit` route — mortgage data fetch + MortgageSection sibling**

**Goal:** Make the edit route fetch mortgage data and render `MortgageSection` as a sibling
below `PropertyForm`, with `#section-mortgage` anchor in the sticky nav.

**Requirements:** R15, R16, R17, R18

**Dependencies:** None

**Files:**
- Modify: `app/app/(app)/properties/[id]/edit/page.tsx`
- Modify: `app/lib/property-form-section-nav.ts`

**Approach:**
- In `page.tsx`: add a Prisma query for mortgages after the property fetch. Use the same
  shape as `app/app/(app)/properties/[id]/page.tsx`'s mortgage query. Pass `mortgages` as
  a prop to the new sibling section.
- Render a `<section id="section-mortgage" className="scroll-mt-28 rounded-xl border
  border-border bg-card shadow-sm">` below `<PropertyForm>`, with a `p-6` heading area
  ("Mortgages", `text-xl font-semibold text-foreground` + description) and a
  `border-t border-border p-6` content area containing
  `<MortgageSection embedded propertyId={id} mortgages={mortgages} />`.
- Update the page description text (R17): remove "Use the property detail page for
  mortgages, modeling, and scenarios." Replace with "Update location, purchase & value,
  income, mortgages, and notes. Use the workspaces for modeling and refinance scenarios."
- Wrap `<PropertyForm>` and the new mortgage section in a `<div className="mt-6 space-y-8">`.
- In `property-form-section-nav.ts`: add `{ id: "section-mortgage", label: "Mortgage" }`
  after `section-income` and before `section-notes`.

**Patterns to follow:**
- Mortgage data fetch pattern: `app/app/(app)/properties/[id]/page.tsx`
- Sibling section surface: same `rounded-xl border border-border bg-card shadow-sm` as
  other Panels in the app.
- `MortgageSection embedded` usage: already used in `details-tab-content.tsx` (note:
  that usage is being removed in Unit 4; this is the replacement home).

**Test scenarios:**
- Happy path: Edit page renders at `/properties/[id]/edit` for property with 1 mortgage.
  MortgageSection appears below PropertyForm with correct heading. Mortgage data displays.
- Empty state: Property with no mortgages renders the MortgageSection empty state
  ("No mortgage on file") with "Add mortgage" button.
- Mortgage add: Clicking "Add mortgage", completing the form, and submitting creates the
  mortgage and refreshes the list without navigating away from `/edit`.
- Mortgage edit: Clicking "Edit" on an existing mortgage opens the inline form; saving
  updates the displayed data without page navigation.
- Anchor scroll: Clicking "Mortgage" in the sticky nav scrolls the page to the
  `#section-mortgage` section below the form.
- Stale text: The edit page description no longer mentions "Use the property detail page
  for mortgages."
- Navigation: After saving property form changes, the page redirects to `/properties/[id]`.

**Verification:**
- `/properties/[id]/edit` loads without error for a property with and without mortgages.
- `PROPERTY_EDIT_SECTION_NAV` has 5 entries: Location, Purchase & value, Income, Mortgage, Notes.
- MortgageSection renders below PropertyForm with correct Panel surface and heading.
- `npm run check` passes on modified files.

---

- [ ] **Unit 2: PropertyForm visual polish + add-property-wizard nav fix**

**Goal:** Bring `PropertyForm` and the edit page layout to full design spec compliance —
correct Panel surface, sticky nav separator, section heading level, section description
copy. Also fix the identical sticky nav violation in `add-property-wizard.tsx`.

**Requirements:** R19, R28, R29, R30, R34, R35

**Dependencies:** Unit 1 (page layout established; polish applies on top)

**Files:**
- Modify: `app/app/(app)/properties/property-form.tsx`
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

*`property-form.tsx`:*
- Outer `<form>` wrapper: change `rounded-lg` → `rounded-xl` and add `shadow-sm`.
- Sticky nav: replace `bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/85`
  with `bg-card border-b border-border`. Keep all other nav classes unchanged.
- Section headings (`h2`): change `text-lg font-semibold` → `text-xl font-semibold`
  on all four section headings (Location & profile, Purchase & value,
  Income & expenses, Notes). `text-foreground` is already correct.
- "Purchase & value" section description: replace
  "What you paid, current value, cash invested, and ownership—aligned with the
  add-property flow." with "What you paid, current estimated value, cash invested,
  and ownership share."

*`add-property-wizard.tsx`:*
- Find the sticky nav (same `bg-card/95 backdrop-blur` pattern). Apply the same fix:
  `bg-card border-b border-border`. No other changes to the wizard.

**Patterns to follow:**
- Design spec §5 Panel: `rounded-xl border border-border bg-card shadow-sm`.
- Design spec §6 Elevated (sticky on scroll): `shadow-md` is the full elevated treatment;
  `border-b border-border` is the structural separator adequate for this nav.
- Design spec §4 L2 section headings: `text-xl font-semibold text-foreground`.

**Test scenarios:**
- Visual: PropertyForm renders with `rounded-xl` corners and visible `shadow-sm` — not
  flush with the page background.
- Sticky nav: On scroll, the nav shows a bottom border visually separating it from
  content below. No translucency/blur artifact.
- Section headings: "Location & profile", "Purchase & value", etc. render at `text-xl`
  scale — visually larger than before and clearly L2.
- Purchase copy: Section description no longer contains "aligned with the add-property flow."
- Wizard: `add-property-wizard.tsx` sticky nav shows `border-b border-border`; no
  backdrop-blur; wizard function unchanged.

**Verification:**
- `npm run check` passes on both modified files.
- No `bg-card/95` strings remain in `property-form.tsx` or `add-property-wizard.tsx`.
- No `text-lg` remains on section `<h2>` elements in `property-form.tsx`.

---

- [ ] **Unit 3: MortgageSection component polish**

**Goal:** Fix three design violations inside `mortgage-section.tsx`: standalone heading
level, missing `tabular-nums` on financial values, and the inline `MortgageForm` surface.

**Requirements:** R31, R32, R33

**Dependencies:** Unit 1 (establishes `embedded={true}` as the edit-page usage pattern;
fixes here apply to the non-embedded fallback and the inner form)

**Files:**
- Modify: `app/app/(app)/properties/mortgage-section.tsx`

**Approach:**
- **Standalone heading** (`embedded={false}` path): change
  `text-xs font-semibold text-muted` → `text-base font-semibold text-foreground` (L3).
  Also change the outer wrapper from `rounded-lg border border-border bg-card p-4` →
  `rounded-xl border border-border bg-card shadow-sm p-6` to match Panel spec.
- **Financial values in mortgage list** (`<dl>` / `<dd>` elements): add `tabular-nums`
  to `<dd>` elements containing balance, monthly payment, and original loan amount.
  Pattern: `<dd className="tabular-nums text-sm font-medium text-foreground">`.
- **MortgageForm inner card**: change the form wrapper from
  `rounded-md border border-border bg-card p-4` → `rounded-md bg-subtle/40 p-4`.
  Per design spec §5, Inset surfaces (secondary content nested inside a Panel) use
  `bg-subtle/40` with no border and no shadow. The `border border-border` is removed
  because the background tint provides sufficient visual delineation.

**Patterns to follow:**
- Design spec §5 Inset: `rounded-lg bg-subtle/40 p-3` (size adjusted to `rounded-md p-4`
  for form padding — acceptable variance within the inset pattern).
- Existing `tabular-nums` usage: `payoff-card.tsx` uses `tabular-nums` on financial spans.
- Design spec §4 L3 card title: `text-base font-semibold text-foreground`.

**Test scenarios:**
- Standalone mode: `MortgageSection` without `embedded` prop renders with `rounded-xl
  shadow-sm` surface and L3 heading "Mortgages" in `text-foreground`.
- Embedded mode: `MortgageSection embedded` renders with no outer card — heading and
  surface come from the parent section (edit page).
- Financial values: Mortgage list items display balance, payment, and original amount
  with `tabular-nums` — numbers align vertically in multi-mortgage list.
- Inline form: When "Add mortgage" or "Edit" is clicked, the inline `MortgageForm` renders
  with `bg-subtle/40` background (visually distinct from the surrounding `bg-card` Panel
  without adding a competing border).

**Verification:**
- `npm run check` passes.
- No `text-xs font-semibold text-muted` remains as the standalone MortgageSection heading.
- No `border border-border bg-card` remains on the `MortgageForm` inner form card.
- `tabular-nums` present on the three target `<dd>` elements.

---

- [ ] **Unit 4: Details tab restructure**

**Goal:** Replace the monolithic Details card with four distinct Panel cards (Property
facts, Financial inputs, Mortgage terms, Notes). Remove `PropertyHealthStrip` and the
inline `MortgageSection`. Add a read-only Mortgage terms panel with payoff date.

**Requirements:** R7, R8, R9, R10, R11, R12, R13, R14, R20, R21, R22, R23, R24

**Dependencies:** Units 1–3 (mortgage editing must be live in `/edit` before being
removed from Details)

**Files:**
- Modify: `app/app/(app)/properties/[id]/details-tab-content.tsx`

**Approach:**

*Remove:*
- `PropertyHealthStrip` import and render (R7, R10) — it stays on Overview only.
- `MortgageSection` import and render (R14) — mortgage editing moves to `/edit`.

*Replace the current single `<section>` with four sequential `<section>` elements:*

Each Panel: `rounded-xl border border-border bg-card shadow-sm` with a header row
(`flex items-center justify-between px-6 py-4 border-b border-border`) containing
the section heading (L3: `text-base font-semibold text-foreground`) and an "Edit" link
(`inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground`
with `<ChevronRight className="size-3.5" aria-hidden />`) pointing to the appropriate
`/edit` anchor.

Panel 1 — Property facts:
- Heading: "Property facts" | Edit link → `/properties/${propertyId}/edit#section-location`
- Content: property type, address, beds/baths/sq ft (if set), unit mix (if set),
  purchase date, nickname (if set).

Panel 2 — Financial inputs:
- Heading: "Financial inputs" | Edit link → `/properties/${propertyId}/edit#section-economics`
  and `#section-income`
- Content: purchase price, current estimated value, monthly rent (unit breakdown if
  multi-family), rental status, monthly expenses, ownership %, vacancy %, cash invested.

Panel 3 — Mortgage terms:
- `id="mortgages"` (preserves legacy `?tab=mortgage` redirect anchor — R13 note)
- Heading: "Mortgage terms" | Edit link → `/properties/${propertyId}/edit#section-mortgage`
- Content per mortgage: balance (with source note: "stored as of …" or "from amortization"),
  rate, term, monthly payment, payoff projection date ("Payoff: Month YYYY" or
  "Not amortizing" or "Paid off"). All financial values: `tabular-nums`.
- Below the list: "Open Refinance workspace →" link → `/refinance?propertyId=<id>`.
- Empty state: "No mortgage on file." + "Add mortgage →" link →
  `/properties/${propertyId}/edit#section-mortgage`.
- If mortgages exist: "Add another mortgage →" link below the list.

Panel 4 — Notes:
- Heading: "Notes" | Edit link → `/properties/${propertyId}/edit#section-notes`
- Content: notes text, or empty state "No notes added." if unset.

*Mobile:* Each Panel renders identically at mobile breakpoints — the `rounded-xl` cards
provide natural visual breaks. The Mortgage terms panel at mobile shows balance, rate,
and payoff date as the visible-first fields (most important). The "Edit" link row is a
full-row tappable area with `min-h-[44px]` (touch target compliance, R24).

**Patterns to follow:**
- Existing Panel surface pattern throughout the app: `rounded-xl border border-border bg-card shadow-sm`.
- `payoff-card.tsx` for the payoff date display format and `getBalanceSourceCopy` helper
  (already imported via `payoff-card.tsx`'s exported types — reuse the same logic or
  inline the source-copy display for the read-only panel).
- Forward link pattern (§4): `inline-flex items-center gap-1 text-sm text-muted
  transition-colors hover:text-foreground` + `<ChevronRight className="size-3.5" aria-hidden />`.
- `mobile-section-card.tsx` — check if applicable as a wrapper or use the Panel class directly.

**Test scenarios:**
- Four panels render with correct content for a fully-populated property + 2 mortgages.
- Empty states: each panel shows its empty state gracefully (no rent set, no notes, no mortgage).
- Health strip: `PropertyHealthStrip` is NOT present on the Details tab.
- Inline mortgage form: No `MortgageSection` or inline add/edit form present on Details tab.
- Mortgage terms panel — stored balance: displays "Balance: $X (as of [date])".
- Mortgage terms panel — projected balance: displays "Est. balance: $X (from amortization)".
- Mortgage terms panel — payoff date present: displays "Payoff: Month YYYY".
- Mortgage terms panel — no payoff date: displays "Not amortizing" or the
  `remainingAtTermEnd` balloon payment message.
- Mortgage terms panel — empty: shows "No mortgage on file." + "Add mortgage" link.
- Edit links: Each panel's "Edit" chevron link navigates to the correct `/edit` anchor.
- Anchor compatibility: `?tab=mortgage` redirect in `property-detail-tabs.tsx` still works
  — scrolls to the Mortgage terms panel (now `id="mortgages"`).
- Touch target: "Edit" link row is at least 44px tall on mobile.
- "Open Refinance workspace" link: appears below the mortgage list and navigates correctly.

**Verification:**
- Details tab renders four visually distinct Panel cards.
- `MortgageSection` is not rendered or imported in `details-tab-content.tsx`.
- `PropertyHealthStrip` is not rendered or imported in `details-tab-content.tsx`.
- `npm run check` passes.
- `npm run test` passes (existing tests not broken).

---

- [ ] **Unit 5: Overview tab restructure + PayoffCard heading fix**

**Goal:** Remove "Inputs at a glance", elevate headline metrics, add property context card,
add "Open Refinance" quick action, fix PayoffCard heading token, ensure mobile compliance.

**Requirements:** R1, R2, R3, R4, R5, R6, R25, R26, R27

**Dependencies:** None (can be done independently; recommend after Unit 4 so both tabs
can be reviewed together)

**Files:**
- Modify: `app/app/(app)/properties/[id]/overview-tab-content.tsx`
- Modify: `app/app/(app)/properties/[id]/payoff-card.tsx`

**Approach:**

*`overview-tab-content.tsx`:*

Remove:
- The verbose description paragraph at the top ("Performance and input snapshot. Use
  the Details tab for a full ledger…") — R6.
- The entire "Inputs at a glance" card section (the `rounded-xl` outer card's first
  `<div className="p-4">` block containing the two-column property+mortgage grid) — R2.

Restructure the remaining "Performance at a glance" content:
- The outer `rounded-xl border border-border bg-card shadow-sm` card becomes the
  **Headline metrics panel** (R1).
- Inside: headline metrics grid (4 cells: cash flow, equity, LTV, DSCR) stays as-is.
- Below the metrics grid, add a **quick actions row** (R3):
  `<div className="mt-4 flex flex-wrap gap-2">` with two secondary buttons/links:
  - "Open Modeling workspace" → `/modeling?propertyId=<id>` (existing, moved here)
  - "Open Refinance workspace" → `/refinance?propertyId=<id>` (new)
  Both are `rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium
  hover:bg-subtle` (secondary button pattern). On mobile, both render full-width
  (`w-full md:w-auto`) for touch target compliance (R25).
- Remove the existing "Open Modeling workspace" button from its current position above
  the metrics grid.

Add **property context card** (R4) between the headline metrics panel and the
supporting metrics:
`<div className="rounded-lg bg-subtle/40 px-4 py-3">` (Inset surface, §5) with a
single prose line: `"Purchased $X · $Y/mo rent · $Z/mo expenses"`. This is the minimum
orientation context — not a full ledger. No headings, no two-column grid.

Supporting metrics (NOI, cap rate, CoC, annual rent) remain inside `MobileCollapsible`
as today — no change (R5).

*`payoff-card.tsx`:*
- PayoffCard outer `<h2>` heading: change `text-sm font-semibold text-muted` →
  `text-sm font-semibold text-foreground` (R27). One token. No other changes.

**Patterns to follow:**
- Existing `MobileCollapsible` usage in `overview-tab-content.tsx` for supporting metrics.
- Inset surface: `rounded-lg bg-subtle/40 px-4 py-3` (consistent with Inset spec, §5).
- `formatCurrency` from `@/lib/format-currency` for the context card values.
- Secondary button pattern: `rounded-md border border-border bg-transparent px-3 py-2
  text-sm font-medium hover:bg-subtle`.

**Test scenarios:**
- Headline metrics visible: cash flow, equity, LTV, DSCR are the first data seen without
  scrolling on a 390px viewport.
- "Inputs at a glance" removed: no two-column property/mortgage input grid on Overview.
- Verbose description removed: no "Performance and input snapshot. Use the Details tab…"
  text on the page.
- Property context card: renders with purchase price, rent, and expenses in one line.
  Does not duplicate the Details tab's full ledger.
- Quick actions: "Open Modeling workspace" and "Open Refinance workspace" buttons are
  present below the metrics grid.
- "Open Refinance workspace" link: navigates to `/refinance?propertyId=<id>`.
- PayoffCard: still renders at the bottom of Overview with payoff timeline and
  "What if I refinanced?" collapsible. Heading text is `text-foreground` (not muted).
- Mobile quick actions (375px viewport): both workspace buttons render full-width,
  stacked vertically.
- Property with no mortgage: DSCR shows "—"; "Open Refinance" link still present.
- `PropertyHealthStrip` renders exactly once — on Overview, not Details.

**Verification:**
- No "Inputs at a glance" section present in rendered Overview tab.
- No verbose description paragraph at top of Overview.
- `PayoffCard` `h2` heading uses `text-foreground`, not `text-muted`.
- "Open Refinance workspace" quick action present and links to `/refinance?propertyId=<id>`.
- `npm run check` passes on both modified files.

---

## System-Wide Impact

- **Interaction graph:** No new API routes, no new server actions. `MortgageSection` on
  `/edit` uses the existing `PATCH /api/properties/[id]/mortgage/[mortgageId]` and
  `POST /api/properties/[id]/mortgage` routes. The detail page route (`[id]/page.tsx`)
  is unchanged. The edit route (`[id]/edit/page.tsx`) gains one Prisma read query.
- **Error propagation:** `MortgageSection` already handles its own API errors inline. No
  change to error propagation behavior.
- **State lifecycle risks:** `MortgageSection` on the edit page uses the same local
  `useState` + `router.refresh()` pattern as on the Details tab. Navigating between
  edit and detail does not leave stale state.
- **API surface parity:** No API contract changes.
- **Unchanged invariants:** `payoff-card.tsx` behavior, `mortgage-tab-content.tsx`,
  `/mortgage` workspace, `/refinance` workspace, `/modeling` workspace — all unchanged.
  `PropertyDetailTabs` tab switching logic unchanged. The `?tab=mortgage` redirect in
  `property-detail-tabs.tsx` continues to work via the `id="mortgages"` anchor preserved
  on the new Mortgage terms panel.
- **Integration coverage:** The edit page's mortgage fetch + MortgageSection sibling is
  the highest-risk integration point. Verify in a browser that adding/editing/deleting
  a mortgage from `/edit` correctly updates the read-only Mortgage terms panel on the
  Details tab after navigation (router.refresh() propagation).

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Deploying Phase B before Phase A is complete | Hard block: do not merge Unit 4 before Unit 1 is deployed and verified in staging/production. |
| `?tab=mortgage` deep links break after Details restructure | Preserved by keeping `id="mortgages"` on the new Mortgage terms panel. Verify in Unit 4 testing. |
| Edit route mortgage fetch N+1 or performance regression | The mortgage fetch is a simple `findMany` by `propertyId`. Same query already runs in the detail route with no observed issues. |
| `MortgageSection embedded` rendering differences | The `embedded` prop path removes the outer card only. Verify that the edit page's externally-provided card and padding produce the same UX as the old embedded Details tab card. |
| `bg-subtle/40` on `MortgageForm` has insufficient contrast in dark mode | Test both light and dark mode after Unit 3. If contrast is insufficient, fallback to `bg-subtle/60`. |
| Overview property context card too verbose for properties with many fields | The one-line format is by design. Keep to 3 values (purchased, rent, expenses). Do not add more fields. |

---

## Phased Delivery

### Phase A — Complete the Editor (Units 1–3)
Ship together. The edit page must be complete and tested before removing Details tab
mortgage editing. Phase A can be deployed and validated independently.

**Ships:** Mortgage editing fully available on `/edit`. Edit page is visually cohesive
(two matching Panel cards). PropertyForm and MortgageSection component polish applied.

### Phase B — Details Tab Restructure (Unit 4)
Depends on Phase A being deployed. Safe to land once mortgage editing is confirmed
working in `/edit`.

**Ships:** Four distinct panel cards on Details. Health strip deduplication. Read-only
Mortgage terms panel with payoff date and Refinance workspace link.

### Phase C — Overview Tab Restructure (Unit 5)
Can be done in parallel with Phase B or after. No dependencies on Phase B.

**Ships:** Headline metrics lead. "Inputs at a glance" removed. Property context card.
"Open Refinance" quick action. PayoffCard heading fix.

---

## Documentation / Operational Notes

- No database migrations. No new API routes. No environment variable changes.
- No feature flag needed — these are purely UI changes.
- After Phase B ships, the "Use the property detail page for mortgages" text in the
  edit page description is already replaced by Unit 1 (R17). Verify no other places
  in the app reference this old guidance.
- The `add-property-wizard.tsx` sticky nav fix (Unit 2) is a one-line token change
  with no UX impact on the add flow.

---

## Agent Kickoff Prompt

Use as the **user message** to the implementing AI.

```
You are executing docs/archive/plans/2026-04-04-property-detail-revamp-plan.md for Veld Portfolio.

Read these files first — they are mandatory context, not optional:
- docs/archive/plans/2026-04-04-property-detail-revamp-plan.md  (the plan)
- .cursor/skills/veld-ui/SKILL.md                        (design system)
- .cursor/skills/veld-mobile/SKILL.md                    (mobile patterns)
- docs/design/design-spec-2026.md                        (canonical spec)
- docs/architecture-and-build-practices.md               (editing architecture)

Work through phases in strict order:
  Phase A → Phase B → Phase C
  (Unit 1 → Unit 2 → Unit 3) then (Unit 4) then (Unit 5)

CRITICAL: Do not implement Unit 4 until Units 1–3 are complete and verified.
Removing inline mortgage editing from the Details tab before /edit has it is a
breaking change.

Hard constraints:
- MortgageSection must be a sibling of PropertyForm on /edit — never nested inside
  the <form> element. Two separate form roots on the same page.
- payoff-card.tsx: one change only — h2 heading token text-muted → text-foreground.
  No other changes to PayoffCard behavior, content, or structure.
- Design tokens only. No new dependencies.
- Panel-level surfaces: rounded-xl border border-border bg-card shadow-sm.
- Inset surfaces (content nested inside a Panel): rounded-md bg-subtle/40, no border.
- All financial figures outside CalculatorMetric must use tabular-nums.
- fix veld-ui and veld-mobile anti-patterns on every file you touch.
- Do not edit docs/archive/plans/2026-04-04-property-detail-revamp-plan.md unless asked.

After each Phase, confirm:
- npm run check passes
- Files touched (list)
- Any deferred items discovered

Deliver at the end:
1) Summary of user-facing changes per phase.
2) Full list of files modified.
3) Confirmation npm run check passes green.
4) Any implementation-time decisions made (document briefly).
```

---

## Sources & References

- **Origin document:** [`docs/brainstorms/2026-04-04-property-detail-revamp-requirements.md`](docs/brainstorms/2026-04-04-property-detail-revamp-requirements.md)
- **Design spec:** [`docs/design/design-spec-2026.md`](docs/design/design-spec-2026.md) v3.1 — §5 Surface Hierarchy, §6 Shadows, §7 Radius System, §8 Numerics, §9.2 Touch targets, §4 Typography
- **Architecture doc:** [`docs/architecture-and-build-practices.md`](docs/architecture-and-build-practices.md) — `/edit` as single full editor
- **Related plan:** [`docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`](docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md) — PayoffCard Phase A+B shipped; Phase B (`/refinance` workspace) referenced by the new "Open Refinance workspace" quick action
- **Related code:** `app/app/(app)/properties/[id]/overview-tab-content.tsx`, `app/app/(app)/properties/[id]/details-tab-content.tsx`, `app/app/(app)/properties/[id]/edit/page.tsx`, `app/app/(app)/properties/property-form.tsx`, `app/app/(app)/properties/mortgage-section.tsx`, `app/app/(app)/properties/[id]/payoff-card.tsx`
