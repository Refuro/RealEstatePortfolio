---
title: "feat: Edit page completion guidance — bridging the last mile"
type: feat
status: draft
date: 2026-04-05
research: docs/research/2026-04-05-edit-page-completion-ux.md
audit: docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md
---

# feat: Edit page completion guidance — bridging the last mile

## Overview

Users who quick-add a property see a "Complete your property details" banner on the Overview tab with specific missing-field labels ("Missing: purchase price, bedrooms, cash invested, mortgage") and a "Complete details" CTA that links to `/properties/{id}/edit`. The edit page that receives this traffic has zero awareness of what's missing. The form renders ~20 fields across 4 sections with no visual distinction between filled and empty scored fields, no progress indication, and no connection to the "Incomplete profile" language the user just read.

This plan adds four interventions to the edit page, ordered by impact/effort ratio. All changes are within existing files, require no new dependencies, no schema changes, and no new API routes. The completeness engine (`getPropertyCompleteness`) and analytics primitives (`initialIsIncomplete`, `captureClientEvent`) are already imported into `PropertyForm` — this plan activates their visual potential.

The success metric is: users who arrive at the edit page via a completion nudge fill at least one more scored field per session than they do today.

## Skills to Load Before Starting

**Load these before any implementation work begins:**

- **`veld-ui` skill** — enforces design tokens, typography levels, shadow/radius rules, component patterns, and anti-patterns. Required for all UI changes.
- **`veld-mobile` skill** — enforces touch target minimums, safe-area insets, responsive patterns. Required for any component that renders on mobile.

Both skills are at `.cursor/skills/veld-ui/SKILL.md` and `.cursor/skills/veld-mobile/SKILL.md`.

## Requirements Trace

- **R1.** When `initialIsIncomplete` is true, the edit page displays a summary card above the form listing the specific missing fields.
- **R2.** The summary card copy matches the pattern established in the Overview tab banner: "Missing: X, Y, Z" with an explanation of what completing the fields unlocks.
- **R3.** The summary card includes an actionable link that scrolls to the first section containing a missing field.
- **R4.** When `initialIsIncomplete` is true, the sticky "Jump to" nav shows a count badge on each section that contains missing scored fields.
- **R5.** Nav badges do not appear on sections with zero missing fields (Notes section never gets a badge).
- **R6.** When `initialIsIncomplete` is true, empty scored fields receive a subtle visual distinction that disappears when the user fills them.
- **R7.** The field distinction uses an encouraging tone (accent tint), not an error tone (no red/negative).
- **R8.** On mount, if `initialIsIncomplete` is true, the page scrolls smoothly to the first section containing a missing field.
- **R9.** A `completion_guidance_jump_clicked` analytics event fires when the user clicks a "Jump to" link in the summary card.
- **R10.** All new interactive elements meet the 44×44px minimum touch target on mobile.
- **R11.** All completion guidance UI is gated behind `initialIsIncomplete` — fully enriched properties see no change.
- **R12.** The summary card disappears reactively if the user fills enough fields mid-session to cross the completeness threshold (live recomputation).

## Scope Boundaries

- Do **NOT** add a progress bar or percentage meter — the mortgage field (25 points) requires a separate sub-form below `PropertyForm`, making a "100%" target unreachable from within the form itself. A field count is more honest.
- Do **NOT** block or gate the Save button based on completeness — the user must always be able to save partial progress.
- Do **NOT** add completion guidance to the "Add property" flow (`/properties/new`) — that flow has its own wizard structure.
- Do **NOT** use `text-warning` or `ring-warning` for the field highlight — `--warning` is reserved for caution/near-limit states per the design spec. Use `ring-accent/15` (soft indigo tint) which says "fill me" without implying error.
- Do **NOT** use `bg-accent` on any new CTA — the "Save changes" button already owns the accent slot on this screen. New CTAs must be secondary (bordered ghost).
- Do **NOT** apply `uppercase tracking-wide` on any new label — reserved for sidebar group headers and table column headers per `veld-ui`.
- Do **NOT** modify `getPropertyCompleteness` — the scoring logic is correct and tested.

## Context & Research

### The disconnect

| What the user sees (Overview tab) | What the user sees (Edit page) |
|---|---|
| "Missing: purchase price, bedrooms, cash invested" | Generic "Edit property" heading |
| "Add these to unlock LTV, cash-on-cash return, and DSCR" | No mention of unlocked metrics |
| Completeness score badge | Zero progress indication |
| 3 specific fields called out | ~20 fields, all visually identical |

### UX research findings

- **Completeness meter pattern** (LinkedIn, Dynamics 365 CRM): divides an end-goal into visible sub-tasks with a progress indicator. LinkedIn's redesigned meter increased profile completion by over 100%. Source: [ui-patterns.com](https://ui-patterns.com/patterns/CompletenessMeter), [LinkedIn Profile Completion case study](https://www.samanthafreedman.com/profile-completion).
- **Zeigarnik Effect**: people remember uncompleted tasks better than completed ones — the cognitive tension drives completion. The Overview tab banner creates this tension; the edit page currently breaks it. Source: [Zeigarnik Effect in UX Design](https://designzig.com/zeigarnik-effect-in-ux-design/).
- **Scroll-to-first-empty pattern**: auto-scrolling to the first incomplete field on mount is the most effective single intervention for long forms (UX StackExchange consensus). Multiple auto-scrolls are disorienting — scroll once, to the first relevant section.
- **Visual highlight without error semantics**: HubSpot users specifically requested that blank fields be highlighted, but noted that small default error messages are "too small and difficult to notice." The ring must feel like a friendly highlighter, not a validation failure.

### Completeness scoring model

From `app/lib/property-completeness.ts`:

| Field | Weight | Section |
|---|---|---|
| Base (address + type + value + rent + expenses) | 10 (always set) | — |
| Purchase price ≠ estimated value | 15 | Purchase & value |
| Bedrooms | 10 | Location & profile |
| Bathrooms | 10 | Location & profile |
| Square footage | 10 | Location & profile |
| Cash invested | 15 | Purchase & value |
| At least one mortgage | 25 | Mortgage (separate) |
| **Max total** | **95** | |
| **Threshold** | **80** | |

A quick-add property starts at 10. Without mortgage, the max inline score is 70 (below threshold). This is why we use field count, not a percentage bar.

### Relevant files

| File | Role |
|------|------|
| `app/app/(app)/properties/property-form.tsx` | Main form component. Receives `initialIsIncomplete`. Already imports `getPropertyCompleteness`. |
| `app/app/(app)/properties/[id]/edit/page.tsx` | Edit page server component. Computes `initialIsIncomplete`. Passes property data and mortgage data. |
| `app/lib/property-completeness.ts` | Completeness scoring. Returns `{ score, missingFields, isComplete }`. |
| `app/lib/property-form-section-nav.ts` | Section nav config: 5 items with `id` and `label`. |
| `app/app/(app)/properties/[id]/overview-tab-content.tsx` | The Overview tab banner — the source pattern for our copy. |
| `app/lib/analytics-events.ts` | Event name registry. |
| `app/lib/analytics-client.ts` | Client-side event capture. |

### Field-to-section mapping

| `missingFields` label | Field ID(s) | Section ID |
|---|---|---|
| `"purchase price"` | `purchasePrice`, `currentEstimatedValue` | `section-economics` |
| `"bedrooms"` | `bedrooms` | `section-location` |
| `"bathrooms"` | `bathrooms` | `section-location` |
| `"square footage"` | `squareFeet` | `section-location` |
| `"cash invested"` | `cashInvested` | `section-economics` |
| `"mortgage"` | (separate form) | `section-mortgage` |

## Key Technical Decisions

- **Completeness is recomputed live from form state, not just on mount.** The summary card and field rings respond to the user filling fields in real time. This means `getPropertyCompleteness` is called on every relevant state change. Since it's a pure function with 6 conditionals and no I/O, the cost is negligible.
- **The field-to-section mapping is a static constant**, not derived dynamically. The mapping between `missingFields` labels and form section IDs is defined once in `property-form.tsx` and used by both the nav badges and the summary card's "jump to" link.
- **Auto-scroll fires once on mount only**, using a `useEffect` with an empty dependency array. It targets the section anchor, not the individual field, to give the user spatial context. Uses `scrollIntoView({ behavior: 'smooth', block: 'start' })`.
- **Field rings are reactive via controlled state.** The form already uses controlled state for all scored fields (`bedrooms`, `bathrooms`, `squareFeet`, `cashInvested`, `purchasePrice`, `currentEstimatedValue`). The ring class is computed from the current state value on every render — no additional state tracking needed.
- **Mortgage badge is informational only.** The mortgage section is rendered outside `PropertyForm` (it's a sibling `<MortgageSection>` in the edit page). The nav badge on "Mortgage" shows "(1)" when `mortgageCount === 0` but clicking it scrolls to the mortgage section as it does today. No changes to the mortgage form are needed.

## Open Questions

### Resolved During Planning

- **Should the summary card show a score or percentage?** No. The mortgage-ceiling problem (max 70 without mortgage, threshold 80) makes a percentage bar dishonest. A simple "N fields remaining" count with a checklist of specific field names is clearer and more actionable.
- **Should field rings use `ring-warning`?** No. `--warning` is reserved for caution/near-limit states. `ring-accent/15` (soft indigo) is encouraging without implying error.
- **Should the summary card persist after the user fills all inline fields but hasn't added a mortgage?** Yes — "mortgage" remains in the missing list. The card accurately reflects remaining fields. The user can dismiss it by saving and re-entering (at which point `initialIsIncomplete` may still be true or false depending on their score).

### Deferred to Implementation

- **Exact transition timing for field ring removal** — the ring should fade out, not snap off. The implementing agent should use `transition-all duration-200` on the input wrapper so the ring animates out smoothly.
- **Whether the summary card should be sticky or scroll with the page** — recommend starting non-sticky (scrolls with page). If user testing shows people miss it after scrolling past, it can be made sticky in a follow-up.

---

## Unit 1: Completeness summary card

**Goal:** When `initialIsIncomplete` is true, render a summary card at the top of the form that lists missing fields, explains what completing them unlocks, and links to the first missing section.

**Requirements:** R1, R2, R3, R9, R10, R11

**Dependencies:** None.

**Files:**
- Modify: `app/app/(app)/properties/property-form.tsx`
- Modify: `app/lib/analytics-events.ts`

**Approach:**

Add a new analytics event name:

```ts
COMPLETION_GUIDANCE_JUMP_CLICKED: "completion_guidance_jump_clicked",
```

In `PropertyForm`, compute completeness from current form state at render time. Add this block after the existing state declarations (around line 134):

```tsx
const MISSING_FIELD_TO_SECTION: Record<string, string> = {
  "purchase price": "section-economics",
  "bedrooms": "section-location",
  "bathrooms": "section-location",
  "square footage": "section-location",
  "cash invested": "section-economics",
  "mortgage": "section-mortgage",
};

const liveCompleteness = isEdit && initialIsIncomplete
  ? getPropertyCompleteness({
      purchasePrice: parseCurrencyNum(purchasePrice),
      currentEstimatedValue: parseCurrencyNum(currentEstimatedValue),
      bedrooms: bedrooms.trim() ? Number(bedrooms) : null,
      bathrooms: bathrooms.trim() ? Number(bathrooms) : null,
      squareFeet: squareFeet.trim() && parseInt(squareFeet.trim(), 10) >= 100
        ? parseInt(squareFeet.trim(), 10)
        : null,
      cashInvested: cashInvested.trim() && parseCurrencyNum(cashInvested) > 0
        ? parseCurrencyNum(cashInvested)
        : null,
      vacancyPercent: Number(vacancyPercent) || null,
      mortgageCount: 0, // mortgage form is a sibling; conservative here
    })
  : null;
```

Derive the first missing section for the jump link:

```tsx
const firstMissingSection = liveCompleteness?.missingFields[0]
  ? MISSING_FIELD_TO_SECTION[liveCompleteness.missingFields[0]]
  : null;
```

Render the summary card immediately below the error block (line ~430) and above the sticky nav, gated on `liveCompleteness && !liveCompleteness.isComplete`:

```tsx
{liveCompleteness && !liveCompleteness.isComplete && (
  <div className="rounded-lg bg-subtle/40 p-4">
    <p className="text-sm font-semibold text-foreground">
      {liveCompleteness.missingFields.length} field{liveCompleteness.missingFields.length !== 1 ? "s" : ""} remaining for full metrics
    </p>
    <p className="mt-1 text-xs text-muted">
      Missing: {liveCompleteness.missingFields.join(", ")}.
      {" "}Add these to unlock LTV, cash-on-cash return, and DSCR.
    </p>
    {firstMissingSection && (
      <a
        href={`#${firstMissingSection}`}
        onClick={() => {
          captureClientEvent(AnalyticsEvents.COMPLETION_GUIDANCE_JUMP_CLICKED, {
            property_id: property?.id,
            target_section: firstMissingSection,
          });
        }}
        className="mt-3 inline-flex min-h-[44px] items-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-subtle"
      >
        Jump to first missing field
      </a>
    )}
  </div>
)}
```

**Patterns to follow:**
- Surface: Inset pattern — `rounded-lg bg-subtle/40 p-4`. No shadow, no outer border. Matches the Overview tab banner surface.
- Copy: mirrors `overview-tab-content.tsx` lines 54–61 — "Missing: X, Y, Z. Add these to unlock..."
- CTA: secondary bordered ghost — `border border-border bg-transparent ... hover:bg-subtle`. Not `bg-accent` (Save owns that slot).
- Touch target: `min-h-[44px]` on the jump link per `veld-mobile`.
- Typography: heading is `text-sm font-semibold text-foreground` (L5 body label). Not L2 or L3 — the card is supplemental, not a section heading.

**Acceptance criteria:**
- [ ] When `initialIsIncomplete` is true, the summary card renders above the sticky nav.
- [ ] When `initialIsIncomplete` is false, no summary card renders.
- [ ] The card shows the count of missing fields and lists them by name.
- [ ] The card shows "Add these to unlock LTV, cash-on-cash return, and DSCR."
- [ ] Clicking "Jump to first missing field" smooth-scrolls to the correct section.
- [ ] `completion_guidance_jump_clicked` fires in PostHog with `property_id` and `target_section`.
- [ ] Filling a missing field live (e.g., typing a bedrooms value) updates the count and missing list without a page reload.
- [ ] When all inline fields are filled (but mortgage is still missing), the card still shows "1 field remaining" with "mortgage" listed.
- [ ] The jump link has `min-h-[44px]` in its class list.
- [ ] The card uses `rounded-lg bg-subtle/40 p-4` — no shadow, no outer border.
- [ ] No `uppercase tracking-wide` in any new text.

---

## Unit 2: Section-level nav badges

**Goal:** When `initialIsIncomplete` is true, show a count badge on each sticky nav item that has missing scored fields in its section.

**Requirements:** R4, R5, R11

**Dependencies:** Unit 1 (reuses the `MISSING_FIELD_TO_SECTION` mapping and `liveCompleteness`).

**Files:**
- Modify: `app/app/(app)/properties/property-form.tsx`

**Approach:**

Compute a section-to-count map from `liveCompleteness.missingFields` using `MISSING_FIELD_TO_SECTION`:

```tsx
const sectionMissingCounts = liveCompleteness
  ? liveCompleteness.missingFields.reduce<Record<string, number>>((acc, field) => {
      const section = MISSING_FIELD_TO_SECTION[field];
      if (section) acc[section] = (acc[section] || 0) + 1;
      return acc;
    }, {})
  : {};
```

In the existing sticky nav (line ~438), modify the nav item rendering to append a badge when the section has missing fields:

```tsx
{PROPERTY_EDIT_SECTION_NAV.map((s) => {
  const missingCount = sectionMissingCounts[s.id] || 0;
  return (
    <li key={s.id} className="shrink-0">
      <a
        href={`#${s.id}`}
        className="inline-flex min-h-[44px] items-center gap-1.5 text-accent transition-colors duration-150 hover:text-accent-hover"
      >
        {s.label}
        {missingCount > 0 && (
          <span className="inline-flex items-center rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-accent">
            {missingCount}
          </span>
        )}
      </a>
    </li>
  );
})}
```

The badge appears only when `liveCompleteness` exists AND the section has missing fields. When the user fills a field, the count updates live and the badge disappears when the section reaches zero.

**Design rationale for badge styling:**

- `bg-accent/10 text-accent` — uses the brand indigo at low emphasis, matching the "Add property CTA (nav)" pattern from `veld-ui` (`bg-accent/10 ... text-accent`). This says "there's something actionable here" without implying error.
- `rounded-full` — small pill per radius system.
- `tabular-nums` — numeric content must use tabular figures per design spec §8.
- `text-xs font-medium` — L5 label weight per typography system.

**Patterns to follow:**
- Badge: `rounded-full bg-accent/10 px-1.5 py-0.5 text-xs font-medium tabular-nums text-accent` — mirrors the nav CTA tint from `veld-ui` §Component Patterns.
- Nested radius: nav item is in a `<ul>` (no border-radius), badge is `rounded-full` — no nesting conflict.
- No `uppercase tracking-wide` — these are inline count indicators, not data group labels.

**Acceptance criteria:**
- [ ] When `initialIsIncomplete` is true and "bedrooms" + "bathrooms" + "square footage" are missing, the "Location & profile" nav link shows a `(3)` badge.
- [ ] When `initialIsIncomplete` is true and "cash invested" + "purchase price" are missing, the "Purchase & value" nav link shows a `(2)` badge.
- [ ] When mortgage is missing, the "Mortgage" nav link shows a `(1)` badge.
- [ ] "Income & expenses" and "Notes" nav links never show a badge (no scored fields in those sections).
- [ ] Filling "bedrooms" live reduces the Location & profile badge from `(3)` to `(2)`.
- [ ] When all fields in a section are filled, the badge for that section disappears entirely.
- [ ] When `initialIsIncomplete` is false, no badges appear on any nav link.
- [ ] Badge uses `tabular-nums` in its class list.
- [ ] Badge uses `bg-accent/10 text-accent` — not `bg-warning` or `bg-negative`.

---

## Unit 3: Field-level highlight rings

**Goal:** When `initialIsIncomplete` is true, empty scored fields receive a subtle indigo ring that disappears when the user provides a value.

**Requirements:** R6, R7, R11, R12

**Dependencies:** Unit 1 (reuses `liveCompleteness`).

**Files:**
- Modify: `app/app/(app)/properties/property-form.tsx`

**Approach:**

Build a mapping from `missingFields` labels to the form field IDs they correspond to:

```tsx
const MISSING_LABEL_TO_FIELD_IDS: Record<string, string[]> = {
  "purchase price": ["purchasePrice", "currentEstimatedValue"],
  "bedrooms": ["bedrooms"],
  "bathrooms": ["bathrooms"],
  "square footage": ["squareFeet"],
  "cash invested": ["cashInvested"],
};
```

Compute a `Set<string>` of currently-missing field IDs:

```tsx
const missingFieldIds = new Set(
  (liveCompleteness?.missingFields ?? []).flatMap(
    (label) => MISSING_LABEL_TO_FIELD_IDS[label] ?? []
  )
);
```

Create a helper function that extends the existing `inputClass` with a conditional ring:

```tsx
function fieldInputClass(fieldId: string): string {
  const isHighlighted = initialIsIncomplete && missingFieldIds.has(fieldId);
  return `${inputClass} transition-all duration-200${
    isHighlighted ? " ring-2 ring-accent/15" : ""
  }`;
}
```

Apply `fieldInputClass("bedrooms")` to the bedrooms input, `fieldInputClass("bathrooms")` to bathrooms, `fieldInputClass("squareFeet")` to the `PropertySquareFeetField` wrapper, `fieldInputClass("cashInvested")` to the cash invested `CurrencyInput`, and `fieldInputClass("purchasePrice")` / `fieldInputClass("currentEstimatedValue")` to their respective inputs.

The ring is intentionally subtle: `ring-accent/15` is a 15% opacity indigo — visible enough to draw the eye during a scan, but not loud enough to feel like a validation error. The `transition-all duration-200` ensures the ring fades out smoothly when the user fills the field.

**For the `PropertySquareFeetField` component:** This component accepts a `className` prop. Pass the ring class through:

```tsx
<PropertySquareFeetField
  value={squareFeet}
  onChange={setSquareFeet}
  className={`max-w-xs${initialIsIncomplete && missingFieldIds.has("squareFeet") ? " [&_input]:ring-2 [&_input]:ring-accent/15" : ""}`}
/>
```

If the component structure doesn't allow targeting the inner input via a descendant selector, modify `PropertySquareFeetField` to accept an `inputClassName` prop.

**For `CurrencyInput` components:** The `CurrencyInput` component accepts a `className` prop that is applied to the `<input>` element. Apply the ring class directly:

```tsx
<CurrencyInput
  id="cashInvested"
  value={cashInvested}
  onChange={setCashInvested}
  className={fieldInputClass("cashInvested")}
/>
```

**Patterns to follow:**
- Ring color: `ring-accent/15` — indigo at 15% opacity. Matches the brand accent without implying error. Per design spec §3.2, `--accent` is the brand indigo token.
- Transition: `transition-all duration-200` — matches the "Collapsible/accordion" timing tier from design spec §10.1 (200ms for state changes that aren't hover). Using `motion-safe:` is not required here because `transition-all` is a standard transition, not an animation.
- No red/negative: `ring-negative` or `ring-warning` would imply the field is in an error state. Empty is not wrong — it's incomplete.

**Acceptance criteria:**
- [ ] When `initialIsIncomplete` is true and bedrooms is empty, the bedrooms input has a soft indigo ring.
- [ ] Typing "3" into the bedrooms input causes the ring to fade out within 200ms.
- [ ] Clearing the bedrooms input causes the ring to fade back in.
- [ ] The ring uses `ring-accent/15` — not `ring-warning`, not `ring-negative`.
- [ ] Fields that are NOT scored by `getPropertyCompleteness` (nickname, address, notes, vacancy, ownership) never get a ring.
- [ ] When `initialIsIncomplete` is false, no fields get a ring.
- [ ] The ring is visible in both light mode and dark mode.
- [ ] The ring does not interfere with the existing focus ring (`focus:ring-2 focus:ring-accent/20` from globals.css).
- [ ] On mobile, the ring does not cause horizontal overflow or layout shift.

---

## Unit 4: Auto-scroll to first missing section on mount

**Goal:** When the edit page is entered via a completion nudge (`initialIsIncomplete` is true), automatically scroll to the first section that contains missing fields.

**Requirements:** R8, R11

**Dependencies:** Unit 1 (reuses `firstMissingSection`).

**Files:**
- Modify: `app/app/(app)/properties/property-form.tsx`

**Approach:**

Add a `useEffect` that fires once on mount. It checks `initialIsIncomplete` and scrolls to the first missing section after a short delay (to allow the form to fully render and the sticky nav to settle):

```tsx
const hasScrolledRef = useRef(false);

useEffect(() => {
  if (!initialIsIncomplete || !firstMissingSection || hasScrolledRef.current) return;
  hasScrolledRef.current = true;

  const timer = setTimeout(() => {
    const el = document.getElementById(firstMissingSection);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 300);

  return () => clearTimeout(timer);
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

The 300ms delay ensures the form layout is stable before scrolling. The `hasScrolledRef` guard prevents re-scrolling if the component remounts (e.g., React Strict Mode in development).

**Why scroll to the section, not the individual field:** Scrolling to `#section-location` puts the section heading ("Location & profile") at the top of the viewport, giving the user a clear landmark. Scrolling directly to an input would position it mid-section with no heading context, which is disorienting per UX research findings (see §Context).

**Patterns to follow:**
- `scroll-mt-28` is already set on all section elements (line ~457 in the form). This ensures the scroll target clears the sticky nav.
- Single scroll only — no chained or multi-step scrolling.

**Acceptance criteria:**
- [ ] Navigating to `/properties/{id}/edit` for an incomplete property auto-scrolls to the first section with missing fields.
- [ ] Navigating to `/properties/{id}/edit` for a complete property does NOT trigger any auto-scroll.
- [ ] The scroll is smooth (not instant).
- [ ] The section heading is visible after scroll (not hidden behind the sticky nav — `scroll-mt-28` handles this).
- [ ] The scroll fires only once per page load, even in React Strict Mode.
- [ ] If the user is already at the correct scroll position (e.g., if the first missing section is Location & profile, which is at the top), no visible scroll occurs.

---

## Unit 5: Edit page header copy when incomplete

**Goal:** When `initialIsIncomplete` is true, update the edit page header to acknowledge the user's intent — they came here to complete their property, not just to "edit" generically.

**Requirements:** R2, R11

**Dependencies:** None.

**Files:**
- Modify: `app/app/(app)/properties/[id]/edit/page.tsx`

**Approach:**

The edit page currently renders a static header:

```tsx
<h1 className="text-2xl font-semibold text-foreground">Edit property</h1>
<p className="mt-1 max-w-2xl text-sm text-muted">
  Update location, purchase & value, income, mortgages, and notes. Use the workspaces for
  modeling and refinance scenarios.
</p>
```

When `initialIsIncomplete` is true, replace the subtitle with context-aware copy:

```tsx
<h1 className="text-2xl font-semibold text-foreground">Edit property</h1>
<p className="mt-1 max-w-2xl text-sm text-muted">
  {initialIsIncomplete
    ? "Fill in the highlighted fields below to unlock full portfolio metrics."
    : "Update location, purchase & value, income, mortgages, and notes. Use the workspaces for modeling and refinance scenarios."}
</p>
```

This is a one-line conditional — no structural changes. The heading stays "Edit property" in both cases (the page IS the edit page; changing the h1 to "Complete property" would break breadcrumb expectations).

**Patterns to follow:**
- Typography: `text-sm text-muted` — L5 body text per design spec §4.
- No card wrapper around `<h1>` — Page-level heading per design spec §5.

**Acceptance criteria:**
- [ ] When `initialIsIncomplete` is true, the subtitle reads "Fill in the highlighted fields below to unlock full portfolio metrics."
- [ ] When `initialIsIncomplete` is false, the original subtitle is shown unchanged.
- [ ] The `<h1>` text is "Edit property" in both cases.

---

## System-Wide Impact

- **No new files.** All changes are within existing files.
- **No new dependencies.** No npm packages added.
- **No schema changes.** No Prisma migrations.
- **No new API routes.** All logic is client-side.
- **One new analytics event:** `COMPLETION_GUIDANCE_JUMP_CLICKED` added to `analytics-events.ts`.
- **Existing events unchanged:** `PROPERTY_ENRICHMENT_STARTED` and `PROPERTY_ENRICHMENT_COMPLETED` continue to fire as before.
- **Performance:** `getPropertyCompleteness` is called on every render when `initialIsIncomplete` is true. It's a pure function with 6 conditionals — no I/O, no allocations beyond a small array. Negligible cost.
- **Mobile:** All new elements use `min-h-[44px]` touch targets. The summary card stacks vertically. Nav badges are inline `text-xs` pills that wrap with the nav items.

## Build Order

| Order | Unit | Effort | What it unblocks |
|---|---|---|---|
| 1 | Unit 1 — Summary card | ~30 min | Provides `liveCompleteness`, `MISSING_FIELD_TO_SECTION`, and `firstMissingSection` used by all other units |
| 2 | Unit 2 — Nav badges | ~15 min | Uses `sectionMissingCounts` derived from Unit 1's mapping |
| 3 | Unit 3 — Field rings | ~30 min | Uses `missingFieldIds` derived from Unit 1's `liveCompleteness` |
| 4 | Unit 4 — Auto-scroll | ~10 min | Uses `firstMissingSection` from Unit 1 |
| 5 | Unit 5 — Header copy | ~5 min | Independent; trivial conditional |

Total estimated implementation: ~90 minutes.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `getPropertyCompleteness` called on every render might cause re-render cascades | It's a pure function returning a new object — React will re-render the affected subtree, but the form inputs are controlled and already re-render on every keystroke. No additional cost. |
| `ring-accent/15` may be too subtle in dark mode | Verify visually. If insufficient, increase to `ring-accent/25` for dark mode via `dark:ring-accent/25`. |
| Auto-scroll may feel jarring if the page loads slowly | The 300ms delay covers typical SSR hydration time. If the page is still loading at 300ms, the scroll will fire as soon as the target element exists. |
| Users who arrive at the edit page NOT from a completion nudge (e.g., direct navigation) still see guidance if `initialIsIncomplete` is true | This is correct behavior — the property IS incomplete regardless of how the user arrived. The guidance is helpful in all cases. |
| Mortgage badge in nav may confuse users since they can't add a mortgage from within `PropertyForm` | The "Mortgage" nav link already scrolls to the mortgage section (a sibling `<MortgageSection>` below the form). The badge simply adds a count indicator — the existing scroll behavior handles the rest. |

## Testing Checklist

| # | Scenario | Expected |
|---|---|---|
| T1 | Navigate to edit page for an incomplete property (missing bedrooms, cash invested, mortgage) | Summary card shows "3 fields remaining". Nav shows badges on Location (1), Purchase & value (1), Mortgage (1). Bedrooms and cash invested inputs have indigo ring. Page auto-scrolls to first missing section. |
| T2 | Fill in bedrooms (type "3") | Summary card updates to "2 fields remaining". Location badge changes from (1) to nothing. Bedrooms ring fades out. |
| T3 | Fill in cash invested (type "25000") | Summary card updates to "1 field remaining". Purchase & value badge disappears. Cash invested ring fades out. |
| T4 | Save and reload the page | If the property is still incomplete (mortgage missing), guidance reappears. If the user also added a mortgage (via the mortgage section), and the score crossed 80, no guidance appears. |
| T5 | Navigate to edit page for a COMPLETE property | No summary card, no badges, no rings, no auto-scroll. Header subtitle shows the default copy. |
| T6 | Mobile (375px): verify summary card | Card text wraps properly. Jump link is tappable (44px). No horizontal overflow. |
| T7 | Mobile (375px): verify nav badges | Badges wrap with the nav items in the horizontal scroll. No clipping. |
| T8 | Click "Jump to first missing field" in the summary card | Page scrolls to the correct section. `completion_guidance_jump_clicked` event fires in PostHog network tab. |

## Sources & References

- Research: UX completeness meter pattern — [ui-patterns.com/patterns/CompletenessMeter](https://ui-patterns.com/patterns/CompletenessMeter)
- Research: LinkedIn profile completion redesign — [samanthafreedman.com/profile-completion](https://www.samanthafreedman.com/profile-completion)
- Research: Zeigarnik Effect in UX — [designzig.com/zeigarnik-effect-in-ux-design](https://designzig.com/zeigarnik-effect-in-ux-design/)
- Research: Auto-scroll to required fields — [ux.stackexchange.com/questions/140109](https://ux.stackexchange.com/questions/140109)
- Governance: `docs/design/design-spec-2026.md` — design tokens, typography, surface hierarchy, anti-patterns
- Governance: `.cursor/skills/veld-ui/SKILL.md` — design system enforcement
- Governance: `.cursor/skills/veld-mobile/SKILL.md` — touch targets, responsive patterns
- Prior plan: `docs/plans/2026-04-05-onboarding-activation-rollout.md` — the broader onboarding/activation context this work sits within
