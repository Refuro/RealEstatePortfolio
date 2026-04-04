---
date: 2026-04-04
topic: property-detail-revamp
---

# Property Detail & Edit Revamp

## Problem Frame

The property detail page is the most important page in the product — it's where landlords
go to understand a property they own. But it has accumulated too much, in the wrong order,
with inconsistent editing paths.

**What's broken:**

1. **Overview tab is overloaded.** When a landlord opens a property, they see: a description
   paragraph, an address card, a health strip, a 2-column "Inputs at a glance" card
   (duplicate of Details), four performance metric cells, an "Open Modeling" button, a
   collapsible row of supporting metrics, and the `PayoffCard` component (payoff timeline +
   accelerator + "What if I refinanced?" what-if calculator, Phase A+B shipped). That's 8+
   distinct content blocks — several of them expandable to significant height — before
   anything actionable. The primary things a landlord needs — cash flow, equity, LTV — are
   buried among them. DSCR is a conditional fourth (only meaningful when a mortgage exists).
   The `PayoffCard` is genuinely valuable and must stay on Overview; the density problem is
   that the wrong things surround it, not the card itself.

2. **Details tab is one giant undifferentiated card.** Property facts, financial inputs,
   notes, and an inline mortgage editor all live inside a single `<section>` with
   `border-t` dividers. There is no visual hierarchy that helps the eye land anywhere.

3. **Health strip is duplicated.** `PropertyHealthStrip` renders on both the Overview tab
   and the Details tab. Users who move between tabs see the same status information twice,
   which erodes trust in the UI's intentionality.

4. **Editing is split across two surfaces.** Editing property basics lives at `/edit`.
   Editing mortgages lives inline on the Details tab. The edit page explicitly tells users:
   "Use the property detail page for mortgages." But the architecture principle says `/edit`
   is the single full editor. The inconsistency forces users to learn two different edit
   surfaces.

5. **Inline mortgage editing on Details creates UX debt.** The form drops into place
   inside the Details card, displacing content and requiring a mental context-switch from
   "reading" to "editing" mode. This is the pattern the architecture doc explicitly warns
   against ("Do not reintroduce triple inline PATCH without an explicit product decision").

6. **Design system violations** in the current code: deprecated `bg-card/95` in both
   wizard and edit sticky navs; `text-muted` used on section headings that should be
   `text-foreground`; `PayoffCard` component uses `text-sm font-semibold text-muted` as
   a card title.

7. **Mobile experience on Details is a single long scroll.** On mobile, the monolithic
   card becomes an extremely long vertical scroll with no visual breaks, no hierarchy, and
   no way to jump to mortgage terms without scrolling past all property facts and financial
   inputs.

**Who is affected:** Every user who has added at least one property. The property detail
page is the primary recurring touchpoint — landlords return to check metrics, update rent
or value, add mortgage payments, and link out to workspaces. A dense, hard-to-read page
creates friction at the product's core.

**Why now:** The refinance/payoff plan has shipped Phase A (payoff timeline + accelerator +
what-if calculator in `payoff-card.tsx`). The product gap discovery calls out the property
detail page as a density problem. With the refinance card now live on Overview, the page has
reached the point where it needs a structural fix before any further content additions — the
`PayoffCard`'s value is currently buried under content that should be removed, not added to.

---

## User Flow

```
┌────────────────────────────────────────────────────────────────┐
│  /properties/[id]  — OVERVIEW TAB  (default)                   │
│                                                                 │
│  [Back link]                              [Edit] [Delete]       │
│  Property Title (h1)                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PropertyHero  (address / nickname)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Health strip  (data freshness, benchmark status)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Headline metrics  (cash flow, equity, LTV, DSCR)        │  │
│  │  Quick actions:  [Open Modeling]  [Open Refinance]       │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Property context  (type · purchased · rent · expenses)  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Supporting metrics (collapsible on mobile)                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PayoffCard  (payoff timeline · accelerator ·            │  │
│  │               What if I refinanced? [collapsible])       │  │
│  │               → Full refinance workspace                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  /properties/[id]  — DETAILS TAB                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Property facts  (type, address, beds/baths, purchase)   │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Financial inputs  (value, rent, expenses, ownership)    │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Mortgage terms  (read-only display, link to /edit)      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Notes  (read-only)                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  Edit link at top and bottom of tab → /edit                    │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  /properties/[id]/edit  — SINGLE FULL EDITOR                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PropertyForm  (<form>)                                  │  │
│  │  sticky nav: Location · Purchase & value · Income ·     │  │
│  │              Mortgage · Notes  (scrolls page-wide)       │  │
│  │  ─────────────────────────────────────────────────────   │  │
│  │  Location & profile section                              │  │
│  │  Purchase & value section                                │  │
│  │  Income & expenses section                               │  │
│  │  Notes section                                           │  │
│  │  [Save changes]  [Cancel]                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MortgageSection  (sibling — its own <form> root(s))    │  │
│  │  id="section-mortgage" scroll-mt-28                      │  │
│  │  Add / edit / delete mortgages inline ← NEW             │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

---

## Requirements

**Overview Tab — Restructure**

- R1. The Overview tab leads with a **headline metrics panel**: monthly cash flow, equity,
  LTV, and DSCR (when a mortgage exists). These are the four values a landlord needs first.
  Values are visually prominent (the existing `text-lg font-semibold` scale is correct).
  Color semantics apply: positive cash flow = `text-positive`; negative = `text-negative`;
  LTV > 80% = `text-negative`; LTV 71–80% = `text-warning`.

- R2. The **"Inputs at a glance" card is removed from Overview**. It is a Details-level
  concern. The metric values speak for themselves; context belongs in Details.

- R3. The **"Open Modeling workspace"** action moves into the headline metrics panel (as
  a secondary action button alongside the metrics). An **"Open Refinance workspace"** quick
  action is added adjacent to it (linking to `/refinance?propertyId=<id>`). Together these
  form a compact "quick actions" strip below the metrics. The `PayoffCard` below already
  provides the payoff timeline, accelerator, and inline refinance what-if; these workspace
  links are for users who want the full chart/simulation experience. The generic
  "Open Mortgage workspace" link is superseded by the more specific "Open Refinance" link
  since the `/refinance` workspace is the primary analytical destination.

- R4. The Overview tab includes a **property context card** that shows the minimum
  identifying facts: address, property type, and one condensed line of key financial
  inputs (e.g. "Purchased $330k · $2,195/mo rent · $100/mo expenses"). This replaces
  the existing "Inputs at a glance" with a single, shorter summary. The purpose is
  orientation only — not a full ledger. Unlike the removed "Inputs at a glance" card
  which repeated a two-column grid of all inputs, this card shows a single prose line
  and does not duplicate the Details tab ledger.

- R5. Supporting metrics (NOI, cap rate, cash-on-cash return, annual rent) remain, but
  are visually secondary. On desktop: a 4-column grid below the headline panel, with
  smaller text. On mobile: inside `MobileCollapsible` as today.

- R6. The verbose **description paragraph** ("Performance and input snapshot. Use the
  Details tab for a full ledger…") is removed. The page title and tab labels are
  sufficient navigation orientation.

**Health Strip — Deduplication**

- R7. `PropertyHealthStrip` renders **once**, on the Overview tab only. It is removed from
  the Details tab. The Details tab does not need freshness indicators — users are reading
  the raw ledger, not evaluating staleness.

**Details Tab — Restructure**

- R8. The Details tab is split into **four distinct Panels** (each
  `rounded-xl border border-border bg-card shadow-sm`), not one monolithic card:
  1. **Property facts** — nickname (if set), address, type, physical details
     (beds/baths/sq ft/unit mix), purchase date
  2. **Financial inputs** — purchase price, current estimated value, monthly rent (unit
     breakdown if multi-family), rental status, monthly expenses, ownership %, vacancy %,
     cash invested
  3. **Mortgage terms** — read-only view of each mortgage (see R11 below)
  4. **Notes** — read-only, with an "Edit" link to `/edit#section-notes`

- R9. Each panel has a clear heading (L3 style: `text-base font-semibold text-foreground`).
  Each panel has a compact "Edit" link aligned right in the header row that navigates
  directly to the relevant section on `/edit` via anchor (e.g. `/edit#section-location`).

- R10. The `PropertyHealthStrip` **is not** rendered on the Details tab (see R7).

**Mortgage Terms Panel (Details Tab)**

- R11. The Mortgage terms panel shows each mortgage as a **read-only display card**:
  lender name (if set) as a small label; balance, rate, term, and monthly payment as
  prominent key-value pairs; payoff projection date (or "Not amortizing") as a single
  summary line; an "Edit" link → `/edit#section-mortgage`. No inline form here.

- R12. A prominent **"Add mortgage"** action link/button is shown when no mortgages exist
  (navigates to `/edit#section-mortgage`). When mortgages exist, an **"Add another
  mortgage"** link is shown below the list, also navigating to
  `/edit#section-mortgage`.

- R13. The existing **"Open Mortgage workspace"** link is retained in the Mortgage terms
  panel for access to the full simulation tool.

- R14. The inline `MortgageSection` component (with its inline add/edit form) is **removed
  from the Details tab**. Mortgage editing moves to `/edit` (see R16).

**Edit Page — Mortgage Section**

- R15. The `/properties/[id]/edit/page.tsx` route renders `MortgageSection` as a
  **sibling component below `PropertyForm`** — both at the same level in the React tree,
  each as its own independent `<form>` root. `MortgageSection` is **not** nested inside
  `PropertyForm`'s `<form>` element (nesting forms is invalid HTML). The edit page layout
  becomes:
  ```
  <div>
    <h1>Edit property</h1>
    <p>…description…</p>
    <PropertyForm className="mt-6" property={…} />        {/* <form>…</form> */}
    <MortgageSection propertyId={id} mortgages={mortgages}  {/* its own <form>s */}
      className="mt-8" />
  </div>
  ```
  The edit page route must independently fetch mortgage data for the property (currently
  only fetched in the detail page route). The same Prisma query pattern as the detail
  page is used. `MortgageSection` renders in its own `rounded-lg border border-border
  bg-card` surface, visually matching `PropertyForm`'s card appearance.

- R16. `PROPERTY_EDIT_SECTION_NAV` in `lib/property-form-section-nav.ts` gains a
  `{ id: "section-mortgage", label: "Mortgage" }` entry inserted after `section-income`
  and before `section-notes`. The `MortgageSection` wrapper element carries
  `id="section-mortgage" className="scroll-mt-28"` so the sticky nav anchor
  link scrolls to it correctly from inside the `PropertyForm` nav (anchor links
  scroll to any element on the page regardless of form boundaries).

- R17. The edit page description text (currently: "Update location, purchase & value,
  income, and notes. Use the property detail page for mortgages, modeling, and
  scenarios.") is updated to: "Update location, purchase & value, income, mortgages,
  and notes. Use the workspaces for modeling and refinance scenarios."

- R18. The `/edit` page's back link after save continues to navigate to
  `/properties/[id]` (no change to success flow).

**PayoffCard — Preservation and Design Fix**

- R26. `PayoffCard` remains on the Overview tab in its current position (last section,
  below the supporting metrics). It is **not removed or relocated** in this sprint. Its
  content (payoff timeline, accelerator, refinance what-if, link to `/refinance` workspace)
  is intentional and valuable. No structural changes to `payoff-card.tsx` beyond R27.

- R27. The `PayoffCard` section heading (`h2`) currently uses `text-sm font-semibold text-muted`.
  Fix to `text-sm font-semibold text-foreground` (card headings must not use `text-muted` per
  the design spec). This is the design violation noted in Problem Frame item 6.

**Design System Fixes**

- R19. The sticky nav in `property-form.tsx` uses `bg-card/95 backdrop-blur
  supports-backdrop-filter:bg-card/85`. Replace with `bg-card border-b border-border`.
  The `border-b` is what provides visual separation when content scrolls behind the nav —
  it replaces the translucency hack with a proper structural separator. The `backdrop-blur`
  and opacity dilution are both deprecated (§5 deprecation rule). Same fix applies to the
  sticky nav in `add-property-wizard.tsx`.

- R20. Any section or panel heading in the Details tab that currently uses `text-muted`
  should be corrected to `text-foreground` per the L2/L3 typography rules (the current
  `"Data & settings"` L2 heading is one example; after the panel split this heading may
  no longer exist, in which case R20 applies to whatever tab-level heading, if any,
  replaces it).

- R21. Section headings inside the Details tab panels use the correct L3 style
  (`text-base font-semibold text-foreground`), not the current mix of `text-sm` and
  `text-muted`.

**Edit Page — Visual Polish**

- R28. **PropertyForm outer card surface.** The `<form>` wrapper in `property-form.tsx`
  currently uses `rounded-lg border border-border bg-card p-6`. Change `rounded-lg` →
  `rounded-xl` and add `shadow-sm`. Per design spec §7, page-level panels use `rounded-xl`;
  per §6, every content card holding data the user cares about gets at minimum Raised
  (`shadow-sm`). Neither is currently applied. This is the single most visible surface
  violation on the edit page — `rounded-lg` makes the form card feel like a sub-Panel
  component rather than the primary page surface it is.

- R29. **PropertyForm section heading level.** The four section `<h2>` elements inside
  `PropertyForm` ("Location & profile", "Purchase & value", "Income & expenses", "Notes")
  currently use `text-lg font-semibold text-foreground`. Upgrade to
  `text-xl font-semibold text-foreground` (L2, §4). These are navigational section
  landmarks (they appear in the "Jump to" nav and are the primary way users orient within
  the form), not card titles (L3). The `text-lg` value falls between L2 and L3 with no
  semantic home in the spec.

- R30. **MortgageSection sibling: cohesive Panel framing on the edit page.** The
  `MortgageSection` component, when used in `embedded={true}` mode (no outer card, no
  internal heading), is wrapped by the edit page in a `<section>` element that provides:
  - Surface: `rounded-xl border border-border bg-card shadow-sm scroll-mt-28` — identical
    to the updated `PropertyForm` card
  - A heading area with `p-6`: `<h2 className="text-xl font-semibold text-foreground">Mortgages</h2>`
    and `<p className="mt-1 text-sm text-muted">Add or update mortgages for this property.</p>`
  - Content area: `border-t border-border p-6` containing `<MortgageSection embedded />`
  - `id="section-mortgage"` on the `<section>` element (for the "Jump to" anchor scroll)
  
  This ensures both cards are visually identical Panels — the edit page reads as one
  cohesive editing surface, not two unrelated components stacked on the page.

- R31. **MortgageSection standalone heading (non-edit usage).** The `MortgageSection`
  component's own internal heading (`h2 className="text-xs font-semibold text-muted"`) is
  only visible when `embedded={false}`. This style is neither L3 (card title:
  `text-base font-semibold text-foreground`) nor L4 (data group label:
  `text-xs font-semibold uppercase tracking-wide text-muted`) — it's a misalignment
  of both. On the edit page this heading is suppressed (R30 provides the heading
  externally). Separately, fix the standalone variant's heading to L3:
  `text-base font-semibold text-foreground`. This also fixes the heading on the Details
  tab's mortgage display (until it's replaced by R11's read-only panel).

- R32. **MortgageSection financial values: tabular-nums.** In the mortgage list display
  (`<dl>` / `<dd>` elements inside `mortgage-section.tsx`), all currency values — balance,
  monthly payment, original loan amount — are rendered without `tabular-nums`. Per design
  spec §8, all financial figures in the product must use `tabular-nums`. Add `tabular-nums`
  to the `<dd>` elements containing these values. This is a small addition but visibly
  differentiates a polished product from a rough one when numbers are compared across rows.

- R33. **MortgageForm inline inset surface.** The `MortgageForm` component (the inline
  add/edit form that renders inside `MortgageSection`) uses
  `rounded-md border border-border bg-card p-4` as its card. When rendered inside the
  edit page's `rounded-xl bg-card shadow-sm` Panel, a `bg-card` child on a `bg-card`
  parent creates zero visual contrast — the form appears to float without a frame.
  Change `bg-card` → `bg-subtle/40` (Inset surface, §5). The Inset level is for
  "secondary content nested inside a Panel" — which is exactly what the inline mortgage
  form is. Remove the `border border-border` too since Inset surfaces never have their
  own border per the spec; the rounded corner and background tint are the only signals.
  Result: `rounded-md bg-subtle/40 p-4`.

- R34. **Section description copy: remove internal jargon.** The "Purchase & value"
  section in `PropertyForm` has description text: "What you paid, current value, cash
  invested, and ownership—aligned with the add-property flow." The phrase "aligned with
  the add-property flow" is internal implementation language. Replace with:
  "What you paid, current estimated value, cash invested, and ownership share."

- R35. **Edit page spacing and layout consistency.** The edit page `page.tsx` wraps
  `PropertyForm` and the new `MortgageSection` sibling in a `<div className="space-y-8">`
  (currently unspecified). `space-y-8` matches the spacing rhythm used between Panels
  elsewhere in the app. Without this, the two cards will collapse together without
  breathing room, negating the visual separateness that makes them feel like distinct
  sections rather than one broken-up card.

**Mobile**

- R22. On mobile, each of the four Details tab panels is rendered as a `MobileSectionCard`
  with clear visual separation. The current single-panel scroll is replaced by visually
  distinct card sections.

- R23. The Mortgage terms panel on mobile shows mortgage data in a compact key-value layout
  with the payoff projection date visible without scrolling, consistent with
  `MobileSectionCard tone="subtle"`.

- R24. The "Edit" actions within Details panels are touch-target compliant (`min-h-[44px]`
  or implemented as full-row tappable links).

- R25. On mobile, the Overview tab's quick action buttons ("Open Modeling", "Open Mortgage")
  are rendered as full-width secondary buttons below the metrics, not inline links,
  to ensure tap target compliance.

---

## Success Criteria

- A landlord opening a property can identify its cash flow, equity position, and any
  status issues within 3 seconds without scrolling.
- The Details tab's four panels are visually distinct; a landlord can scan to "Mortgage
  terms" without reading through property facts and financial inputs first.
- A landlord can add or edit a mortgage entirely from `/edit`, without needing to return
  to the Details tab.
- There are no `bg-card/95` or `text-muted` section heading violations in the modified
  files.
- On mobile (390px viewport), the Overview tab's top content (metrics + health strip)
  is fully visible above the fold without scrolling.
- `PropertyHealthStrip` renders exactly once per property page view.
- The edit page's `PropertyForm` and `MortgageSection` are visually identical Panels
  (`rounded-xl border border-border bg-card shadow-sm`) with consistent section heading
  scale — the page reads as one cohesive editing surface, not two unrelated components.
- A landlord can add, edit, and delete a mortgage without leaving the `/edit` page.

---

## Scope Boundaries

- **In scope:** Overview tab restructure, Details tab panel split, health strip
  deduplication, mortgage terms panel (read-only), mortgage editing in `/edit`,
  design system fixes in modified files, mobile layout of new panels.

- **Out of scope:** The mortgage workspace (`/mortgage`) — no changes. The modeling
  workspace (`/modeling`) — no changes. The add-property wizard — no structural or
  flow changes. Exception: the `bg-card/95` design system fix in `add-property-wizard.tsx`
  sticky nav is in scope because it is a one-line token fix in a file that is "modified"
  under the design system fixes goal. No layout, section, or field changes to the wizard.

- **Out of scope:** Inline editing of individual property fields (rent, value) without
  navigating to `/edit`. This has been previously ruled out by architecture doctrine
  and remains deferred.

- **Out of scope:** Quick-update flow for mortgage balance (e.g. "Update balance from
  statement"). The mortgage workspace already serves this. This could be a follow-on.

- **Out of scope:** Any new metrics, alert indicators, or intelligence features on the
  property detail page. The scope is restructure + editing fix only.

- **Out of scope:** Making the Edit form fully match the Add wizard (Review step, same
  field order). The minimal change is adding the Mortgage section; full parity is a
  future initiative.

- **Out of scope:** Any structural changes to `PayoffCard` beyond the R27 heading color fix.
  The payoff, accelerator, and refinance what-if features are complete and correct as shipped.

---

## Key Decisions

- **Keep two-tab structure:** The Overview / Details split is sound. The problem is not
  the shape — it's that the wrong things are in each tab, and too much is in Overview.
  Replacing tabs with a single scroll would eliminate the ability to land directly on
  the ledger (useful for mortgage verification), and would not solve the density problem
  if all the same content is on one page.

- **Remove "Inputs at a glance" from Overview entirely:** Showing condensed inputs on
  the Overview tab was intended to give context for the metrics, but it creates a
  confusing partial duplicate of Details. Metrics speak for themselves. A shorter
  "property context" card (R4) provides orientation without the full input grid.

- **Details tab is read-only with "Edit" per-section:** The Details tab becomes a pure
  ledger. Editing happens in `/edit`. This enforces the architecture principle that `/edit`
  is the single full editor and eliminates the context-switch confusion of inline editing
  within a read surface.

- **Mortgage editing moves to /edit, not to a new route:** Adding a Mortgage section to
  `/edit` is the lowest-friction path to making `/edit` the single full editor. It reuses
  existing `MortgageSection`, `MortgageFormFields`, and `MortgageForm` components. No
  new routes, no new data patterns.

- **Health strip on Overview only:** The health strip answers "does this property's data
  need attention?" That's an Overview-level concern. The Details tab shows the data as
  entered; freshness indicators there would be redundant and distracting.

- **PayoffCard is confirmed active on the Overview tab and must be preserved:** Verified —
  `PayoffCard` is imported and rendered at the bottom of `overview-tab-content.tsx` (lines
  238–243). It is not orphaned. It ships Phase A of the refinance/payoff plan: payoff
  timeline, years-earlier accelerator buttons, extra payment input, collapsible "What if I
  refinanced?" calculator with rate/term/closing costs inputs and `CalculatorMetric` output
  cards, and a link to the `/refinance` workspace. It is a strategic differentiator — most
  property tracking tools don't have this — and the Overview tab is the correct home for it
  (insights + tools, not raw data). The revamp does not relocate or remove it; it only
  reduces the noise around it so the card gets the visual breathing room it deserves (R26,
  R27).

- **"Open Mortgage workspace" quick action is replaced by "Open Refinance workspace":** Now
  that the `PayoffCard` provides the inline payoff/refinance experience, the quick action
  link in the headline panel points to the `/refinance` workspace (the full chart comparison
  tool) rather than the generic `/mortgage` workspace. This creates a coherent mortgage story:
  Details tab shows contract facts; PayoffCard shows insights and tools; the workspace link
  goes deep.

---

## Dependencies / Assumptions

- `MortgageSection` is already a standalone component that can be embedded in the edit
  form with `embedded={true}` prop. It handles its own add/edit/delete API calls and
  local refresh. No structural changes to `MortgageSection` are required for R15.

- The existing `payoffProjection` data is already computed server-side in
  `app/app/(app)/properties/[id]/page.tsx` and passed into `mortgageData`. The
  read-only mortgage card in R11 can display `payoffProjection.payoffDate` directly
  without new API calls.

- `PROPERTY_EDIT_SECTION_NAV` in `lib/property-form-section-nav.ts` needs a
  `{ id: "section-mortgage", label: "Mortgage" }` entry added (R16). This is a
  low-risk change — only affects the sticky nav display.

- The add-property wizard (`add-property-wizard.tsx`) already has a Mortgage section
  with `MortgageFormFields`. There is no requirement to unify the wizard and edit form
  in this sprint.

---

## Outstanding Questions

### Resolve Before Planning

**Both questions below are now resolved. No user input required.**

- **[Affects R11, R14][RESOLVED — Option A]** Inline mortgage editing is **fully removed
  from the Details tab**. `/edit#section-mortgage` is the only edit path.

  *Rationale:* The `PayoffCard` discovery strengthens this decision decisively. The
  interactive mortgage experience already lives on Overview: `PayoffCard` shows payoff
  timeline, accelerator, and refinance what-if, with a link to the full `/refinance`
  workspace. The Details tab's job is to show the raw contract facts (rate, balance, term)
  as a read-only ledger with an edit link. There is no gap created by removing inline
  editing — users who want to act on mortgage data either use `PayoffCard` on Overview
  (for insights/what-ifs) or go to `/edit` (to change terms). Dual-path editing would
  mean maintaining two different mortgage form surfaces in sync; Option A eliminates that
  entirely. The architecture doc's explicit warning ("Do not reintroduce inline PATCH
  without a product decision") is answered here: the product decision is **no inline
  editing on Detail tabs, ever**.

- **[Affects R15][RESOLVED — Sibling architecture]** `MortgageSection` is rendered as a
  **sibling component to `PropertyForm`** on the `/edit` page — both live on the page, but
  `MortgageSection` is outside the `PropertyForm` `<form>` element, operating as its own
  independent form root.

  *Rationale:* Nesting `MortgageSection` inside `PropertyForm` creates invalid HTML (two
  `<form>` elements nested — illegal per spec, causes unpredictable submit behavior). The
  sibling architecture means:
  1. The `/edit` page layout renders `PropertyForm` (property fields, sticky nav) and then
     `MortgageSection` below it, both at the same level in the React tree.
  2. The `/edit` route (`/properties/[id]/edit/page.tsx`) must independently fetch mortgage
     data for the property — it currently does not. This is a small addition: the same
     Prisma query that lives in the detail page route needs to run in the edit route too.
  3. The sticky "Jump to" nav in `PropertyForm` gains a `#section-mortgage` entry (R16)
     that scrolls to the `MortgageSection` below the form — this works correctly with
     siblings since it's an anchor scroll, not a form submission.

### Deferred to Planning

- **[Affects R8, R22][Technical]** The Details tab currently uses
  `section id="mortgages"` with `scroll-mt-20` for anchor linking from legacy
  `?tab=mortgage` redirect logic. Verify the `property-detail-tabs.tsx` redirect logic
  after the inline mortgage form is removed, and ensure the anchor ID is preserved on the
  new Mortgage terms panel so any existing deep links still work.

- **[Affects R4][Technical]** Determine the exact format for the "property context card"
  on Overview (R4). The current `PropertyHero` component shows only the address in a
  `bg-subtle` card. Whether to extend `PropertyHero` or replace it with a richer card
  should be validated against the design spec §14.5 and the `PropertyHero` component's
  current implementation.

- **[Affects R19][Technical]** The `bg-card/95 backdrop-blur` sticky nav pattern is
  used in both `property-form.tsx` (edit) and `add-property-wizard.tsx` (add). Replacing
  with `bg-card` will eliminate the translucency effect on scroll. Verify this is
  acceptable visually, or add a `border-b border-border shadow-sm` to compensate for the
  loss of visual separation.

- **[Affects R8–R11, R15][Technical]** Each Details panel's "Edit" link must target a
  specific anchor in `/edit`. Confirm that edit anchors (`section-location`,
  `section-economics`, `section-income`, `section-mortgage`) exist or are added. They
  don't currently map one-to-one with Details panels.

- **[Affects R5, R6][Product]** Specify the default expanded/collapsed state of
  supporting metrics on mobile Overview (cap rate, GRM, etc.). Collapsed-by-default
  with a "More metrics" disclosure is assumed, but this should be confirmed.

- **[Affects Overview][Product]** Add 2–4 measurable success criteria for the Overview
  overload and mobile scroll problems — e.g. "headline metrics visible without scroll on
  iPhone SE at 375px width" — to enable post-ship validation.

- **[Affects Overview][Product]** State the intended emotional/cognitive takeaway from
  the Overview hero section (e.g. "I know at a glance if this property is performing
  well"). This helps validate whether the final implementation achieves the product goal.

---

## Next Steps

→ `/ce:plan` for structured implementation planning

**Planning is unblocked.** Both architectural questions are resolved:
- Inline mortgage editing is fully removed from Details (Option A).
- `MortgageSection` is a sibling of `PropertyForm` on `/edit`, not nested.
- `PayoffCard` is confirmed active and preserved as-is on Overview (+ R27 heading fix).

The planning agent should treat the edit route mortgage data fetch as a required prerequisite
for R15, and the "Jump to" nav anchor scroll to `#section-mortgage` as the UX bridge between
the `PropertyForm` sticky nav and the sibling `MortgageSection` below it.
