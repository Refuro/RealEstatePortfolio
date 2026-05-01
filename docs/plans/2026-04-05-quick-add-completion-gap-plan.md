# Plan: Close the Quick-Add Completion Gap

**Date:** 2026-04-05  
**Source audit:** `docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`  
**Goal:** Ensure users who quick-add a property (a) understand their data is incomplete, (b) know exactly what's missing and why it matters, and (c) have clear, low-friction paths to enrich the property — from the moment of submission through every subsequent visit.

---

## Issues addressed

| # | Issue | Severity | Root file(s) |
|---|-------|----------|-------------|
| I-1 | Quick-add form: "Use the full form instead" link is low-visibility muted text buried under wrong intro copy | Medium | `properties/new/page.tsx` |
| I-2 | `isIncomplete` heuristic in overview tab is a fragile 3-condition AND that silences prematurely | High | `properties/[id]/overview-tab-content.tsx` |
| I-3 | Bed/bath/sqft row is silently hidden when null — user can't discover these fields exist | High | `properties/[id]/details-tab-content.tsx` |
| I-4 | Vacancy rate silently defaults to 5% with no "not set" indicator | Low | `properties/[id]/details-tab-content.tsx` |
| I-5 | Properties list has no "incomplete" badge — sparse properties look identical to enriched ones | High | `properties/page.tsx` |
| I-6 | No post-submit nudge after quick-add for non-first-property creates | High | `properties/add-property-wizard.tsx` |
| I-7 | First-property dashboard banner says "Your portfolio is now live" but never nudges to complete the property profile | Medium | `dashboard/page.tsx` |
| I-8 | No analytics event for enrichment — problem is invisible in data | Medium | `lib/analytics-events.ts` |
| I-9 | `quick-actions.tsx` exists but is not imported anywhere | Low | `properties/[id]/quick-actions.tsx` |

---

## Architecture decision: shared completeness utility

Every surface that needs to know whether a property is "complete" (the property detail page, the properties list, the post-submit redirect, the first-property banner) should use the same function. This avoids the current problem where `isIncomplete` is a one-off heuristic that only lives in one component.

### `lib/property-completeness.ts` (new file)

```typescript
type PropertyCompletenessInput = {
  purchasePrice: number;
  currentEstimatedValue: number;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  cashInvested: number | null;
  vacancyPercent: number | null;
  mortgageCount: number;
};

type CompletenessResult = {
  score: number;           // 0–100
  missingFields: string[]; // human-readable labels for missing items
  isComplete: boolean;     // score >= threshold (80)
};
```

**Checked fields and weights:**

| Field | Weight | Condition for "set" |
|-------|--------|-------------------|
| Purchase price differs from estimated value | 15 | `purchasePrice !== currentEstimatedValue` |
| Bedrooms | 10 | `bedrooms != null` |
| Bathrooms | 10 | `bathrooms != null` |
| Square feet | 10 | `squareFeet != null` |
| Cash invested | 15 | `cashInvested != null` |
| At least one mortgage | 25 | `mortgageCount > 0` |
| Vacancy rate explicitly set | 5 | `vacancyPercent != null` (DB stores the default as 5, but the column has a `@default(5)` — we check the nullable-before-save state; see implementation note below) |
| Total | 90 max from optional fields | |

**Base score:** 10 points free (address, property type, estimated value, rental status, monthly expenses — these are always populated by quick-add). This means a quick-add property with zero enrichment starts at **10/100**.

**Threshold:** `isComplete` = `score >= 80`. This requires at least mortgage + purchase price + 2 of {bed, bath, sqft, cashInvested}.

**Implementation note on vacancy:** The Prisma schema has `vacancyPercent Int @default(5)`. After save, the DB column is always non-null. We cannot distinguish "user explicitly set 5%" from "default 5%". Two options:
- **Option A:** Add a `vacancyExplicitlySet Boolean @default(false)` to the schema. Accurate but requires a migration.
- **Option B:** Exclude vacancy from the completeness score (drop 5 points from the total). Simpler.
- **Recommendation:** Option B for now. The 5-point weight is negligible, and we avoid a migration. Revisit if we later add an explicit-set flag for other defaults.

**With Option B, max score = 95, threshold remains 80.**

---

## Work items

### WI-1: Create `lib/property-completeness.ts`

**Files:** New file `app/lib/property-completeness.ts` + test file `app/lib/property-completeness.test.ts`

**What:**
- Export `getPropertyCompleteness(input: PropertyCompletenessInput): CompletenessResult`
- Export `COMPLETENESS_THRESHOLD = 80`
- `missingFields` returns human-readable labels: `"Purchase price"`, `"Bedrooms"`, `"Bathrooms"`, `"Square footage"`, `"Cash invested"`, `"Mortgage"`.
- Pure function, no DB access, no imports beyond types.

**Tests:**
- Quick-add property (all optional fields null, purchasePrice === estimatedValue, 0 mortgages) → score 10, missingFields has 6 items, isComplete false
- Fully enriched property → score 95, missingFields empty, isComplete true
- Partial: mortgage + purchase price differ → score 50, isComplete false
- Edge: one mortgage + bed + bath + sqft + cashInvested → score 80, isComplete true

**Effort:** ~1 hour

---

### WI-2: Replace `isIncomplete` with completeness utility on property detail Overview

**Files:** `app/app/(app)/properties/[id]/overview-tab-content.tsx`

**What:**
- Import `getPropertyCompleteness` from `lib/property-completeness`
- Replace the local `isIncomplete` boolean (lines 27–30) with:
  ```typescript
  const completeness = getPropertyCompleteness({
    purchasePrice: property.purchasePrice,
    currentEstimatedValue: property.currentEstimatedValue,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    squareFeet: property.squareFeet,
    cashInvested: property.cashInvested,
    vacancyPercent: property.vacancyPercent,
    mortgageCount: mortgageData.length,
  });
  ```
- Replace the banner condition `{isIncomplete && (` with `{!completeness.isComplete && (`
- Update the banner copy to be dynamic:
  - Title: Keep "Complete your property details for more accurate metrics"
  - Body: Replace static copy with dynamic missing-fields list, e.g.:  
    `"Missing: purchase price, bedrooms, bathrooms, square footage, mortgage. Add these to unlock LTV, cash-on-cash return, and DSCR."`
  - This tells the user exactly what's missing, not just "add purchase history."

**Effort:** ~30 minutes

---

### WI-3: Surface hidden fields on Details tab when null

**Files:** `app/app/(app)/properties/[id]/details-tab-content.tsx`

**What:** Currently lines 121–126 hide the "Details" row entirely when `detailsSummary` is empty. Change to:

```tsx
{detailsSummary ? (
  <div>
    <dt className="text-sm font-medium text-muted">Details</dt>
    <dd className="text-sm font-medium text-foreground">{detailsSummary}</dd>
  </div>
) : (
  <div>
    <dt className="text-sm font-medium text-muted">Details</dt>
    <dd className="text-sm text-muted">
      Bedrooms, bathrooms, sq ft not set.{" "}
      <Link
        href={`/properties/${propertyId}/edit#section-location`}
        className="font-medium text-accent hover:underline"
      >
        Add details
      </Link>
    </dd>
  </div>
)}
```

Also, for **cash invested** (line 206), when null, change the "—" to a similar pattern:

```tsx
{property.cashInvested != null
  ? formatCurrency(Number(property.cashInvested))
  : (
    <span className="text-muted">
      Not set.{" "}
      <Link
        href={`/properties/${propertyId}/edit#section-economics`}
        className="font-medium text-accent hover:underline"
      >
        Add
      </Link>
    </span>
  )
}
```

**Effort:** ~45 minutes

---

### WI-4: "Incomplete profile" badge on properties list cards

**Files:** `app/app/(app)/properties/page.tsx`

**What:**
- Import `getPropertyCompleteness` 
- In the `propertyCards` mapping (lines 193–237), compute completeness for each property:
  ```typescript
  const completeness = getPropertyCompleteness({
    purchasePrice: Number(p.purchasePrice),
    currentEstimatedValue: Number(p.currentEstimatedValue),
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms != null ? Number(p.bathrooms) : null,
    squareFeet: p.squareFeet,
    cashInvested: p.cashInvested != null ? Number(p.cashInvested) : null,
    vacancyPercent: p.vacancyPercent,
    mortgageCount: p.mortgages.length,
  });
  ```
- Add `incompleteProfile: !completeness.isComplete` to the card data object
- In both the multi-property grid card (line 533 area) and the single-property card (line 437 area), render a new `InsightTag`:
  ```tsx
  {card.incompleteProfile && <InsightTag label="Incomplete profile" />}
  ```
- Add `"incomplete_profile"` to the filter options:
  ```typescript
  { key: "incomplete_profile", label: "Incomplete profile" },
  ```
  And add a case in `filteredCards`:
  ```typescript
  case "incomplete_profile":
    return card.incompleteProfile;
  ```
- Include `incompleteProfile` in the `needsAttention` composite flag:
  ```typescript
  const needsAttention = noMortgage || benchmarkStale || negativeCashFlow || incompleteProfile;
  ```

**Effort:** ~1 hour

---

### WI-5: Improve quick-add form page — conditionalize intro copy + promote full-form link

**Files:** `app/app/(app)/properties/new/page.tsx`

**What:** Two changes to lines 24–36:

**A) Conditionalize the intro paragraph** so quick-add gets its own copy:

```tsx
{quickAdd ? (
  <p className="mt-1 text-sm text-muted">
    Just the essentials — address, value, rent, and expenses.
    You can add full details anytime from the property page.
  </p>
) : (
  <p className="mt-1 text-sm text-muted">
    Complete each section below, then create your property. Use the
    links at the top to jump between sections.
  </p>
)}
```

**B) Promote the full-form link from inline muted text to a bordered callout** — same visual pattern as the deal-conversion banner already on this page (lines 37–60):

```tsx
{quickAdd && (
  <div className="mt-4 flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-card/90 p-3">
    <p className="text-sm text-muted">
      Need to add mortgage, purchase history, or property specs?
    </p>
    <Link
      href="/properties/new"
      className="shrink-0 text-sm font-medium text-accent hover:underline"
    >
      Use the full form
    </Link>
  </div>
)}
```

The question framing ("Need to add…?") makes it a decision checkpoint. Naming specific fields (mortgage, purchase history, property specs) tells the user what they're skipping. The bordered card pattern is impossible to visually skip.

**Effort:** ~30 minutes

---

### WI-6: Post-submit completion nudge on property detail page

**Files:** `app/app/(app)/properties/[id]/page.tsx`, `app/app/(app)/properties/[id]/overview-tab-content.tsx`

**What:** After quick-add redirects to `/properties/{id}`, the user lands on the property page with no special signal that they just created a sparse property. Add a query parameter `?from=quick-add` to the redirect, and show a dismissible top-of-page banner.

**Step 1:** In `add-property-wizard.tsx`, change the non-first-property redirect (line 1821):
```typescript
router.push(`/properties/${resData.id}?from=quick-add`);
```

**Step 2:** In `properties/[id]/page.tsx`, read the `from` search param and pass it to the tabs component. The page is a server component, so:
```typescript
export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; tab?: string }>;
}) {
  // ... existing code ...
  const { from } = await searchParams;
  const fromQuickAdd = from === "quick-add";
  // pass fromQuickAdd to PropertyDetailTabs or render a banner directly
```

**Step 3:** Render a banner at the top of the page (below the h1, above the tabs) when `fromQuickAdd` is true:

```tsx
{fromQuickAdd && (
  <div className="mt-3 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
    <p className="text-sm font-semibold text-foreground">
      Property created with quick-add
    </p>
    <p className="mt-1 text-sm text-muted">
      Add purchase details, mortgage info, and property specs to unlock
      DSCR, LTV, cash-on-cash return, and payoff projections.
    </p>
    <div className="mt-3 flex flex-wrap gap-2">
      <Link
        href={`/properties/${id}/edit`}
        className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
      >
        Complete details
      </Link>
      <Link
        href={`/properties/${id}`}
        className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle"
      >
        I'll do this later
      </Link>
    </div>
  </div>
)}
```

This uses the same visual treatment as the first-property dashboard banner (`rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm`) for consistency. The "I'll do this later" link just strips the query param.

**Effort:** ~1.5 hours

---

### WI-7: Enhance first-property dashboard banner to nudge completion

**Files:** `app/app/(app)/dashboard/page.tsx`

**What:** The current `onboarding=first-property` banner (lines 164–198) shows "Property added. Your portfolio is now live." with links to Analyze a deal, Run projections, Simulate mortgage payoff, and Add another property.

Add a "Complete your property" link to this list, pointing to the edit page. We need the first property's ID. The dashboard already queries all properties. Change:

```tsx
{onboarding === "first-property" && (
  <div className="mt-3 rounded-xl border border-border/70 bg-card/95 p-4 shadow-sm">
    <p className="text-sm font-semibold text-foreground">
      Property added. Your portfolio is now live.
    </p>
    <p className="mt-1 text-sm text-muted">
      Great start. Here are some things to try next:
    </p>
    <div className="mt-3 flex flex-wrap gap-2">
      {firstPropertyId && (
        <Link
          href={`/properties/${firstPropertyId}/edit`}
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
        >
          Complete property details
        </Link>
      )}
      <Link href="/analyze" className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-subtle">
        Analyze a deal
      </Link>
      {/* ... rest of existing links ... */}
    </div>
  </div>
)}
```

Note that "Complete property details" is now the **primary CTA** (accent fill), and the others remain secondary (bordered). This shifts the emphasis from "explore other features" to "finish what you started."

The `firstPropertyId` can be derived from the existing properties query that the dashboard page already runs. Extract it as `const firstPropertyId = properties.length > 0 ? properties[0].id : null;` (or whichever is the most recently created).

**Effort:** ~30 minutes

---

### WI-8: Add analytics events for enrichment tracking

**Files:** `app/lib/analytics-events.ts`, `app/app/(app)/properties/property-form.tsx`

**What:**
- Add two new events to `AnalyticsEvents`:
  ```typescript
  PROPERTY_ENRICHMENT_STARTED: "property_enrichment_started",
  PROPERTY_ENRICHMENT_COMPLETED: "property_enrichment_completed",
  ```
- `PROPERTY_ENRICHMENT_STARTED`: Fire when a user opens the edit page for a property that has `completeness.isComplete === false`. This tells you how many users attempt enrichment.
- `PROPERTY_ENRICHMENT_COMPLETED`: Fire when a user saves edits that move a property from `isComplete === false` to `isComplete === true`. This is the completion event.

The edit page is `property-form.tsx`. On mount, check completeness. On save success, check completeness again. If it crossed the threshold, fire the completion event.

**Effort:** ~1 hour

---

### WI-9: Wire up `quick-actions.tsx` (optional, low priority)

**Files:** `app/app/(app)/properties/[id]/overview-tab-content.tsx`, `app/app/(app)/properties/[id]/quick-actions.tsx`

**What:** The `QuickActions` component already exists and provides Edit, Add mortgage, and Refresh benchmark buttons. It's just not imported anywhere. Consider adding it to the Overview tab below the health strip, or integrating its buttons into the completion banner.

**Decision:** Skip for now — the completion banner (WI-2) and the post-submit banner (WI-6) already provide "Complete details" CTAs. Adding `QuickActions` on top would create visual clutter. Revisit once the other changes ship and we see analytics.

**Effort:** ~15 minutes if pursued

---

## Implementation order and dependencies

```
WI-1  (completeness utility)          ← prerequisite for WI-2, WI-4, WI-6, WI-8
  │
  ├── WI-2  (replace isIncomplete)    ← can start after WI-1
  ├── WI-4  (list badge)              ← can start after WI-1
  ├── WI-8  (analytics events)        ← can start after WI-1
  │
  ├── WI-3  (surface hidden fields)   ← independent, no dependency on WI-1
  ├── WI-5  (quick-add form page)     ← independent, no dependency on WI-1
  ├── WI-7  (dashboard banner)        ← independent, no dependency on WI-1
  │
  └── WI-6  (post-submit nudge)       ← depends on WI-1 for completeness check
```

**Parallelizable pairs:**
- WI-3 + WI-5 + WI-7 can all be done in parallel (independent files, no shared changes)
- WI-2 + WI-4 + WI-8 can be done in parallel once WI-1 is complete

**Suggested sequence for a single developer:**

| Phase | Items | Estimated time |
|-------|-------|---------------|
| Phase 1 | WI-1 (completeness utility + tests) | 1 hr |
| Phase 2 | WI-5 (quick-add form) + WI-3 (hidden fields) + WI-7 (dashboard banner) | 1.5 hrs |
| Phase 3 | WI-2 (replace isIncomplete) + WI-4 (list badge) | 1.5 hrs |
| Phase 4 | WI-6 (post-submit nudge) + WI-8 (analytics events) | 2.5 hrs |
| **Total** | | **~6.5 hours** |

---

## Files modified (complete list)

| File | Action | Work items |
|------|--------|-----------|
| `app/lib/property-completeness.ts` | **Create** | WI-1 |
| `app/lib/property-completeness.test.ts` | **Create** | WI-1 |
| `app/lib/analytics-events.ts` | Edit (add 2 events) | WI-8 |
| `app/app/(app)/properties/new/page.tsx` | Edit (conditionalize intro + promote link) | WI-5 |
| `app/app/(app)/properties/[id]/overview-tab-content.tsx` | Edit (replace isIncomplete, update banner) | WI-2 |
| `app/app/(app)/properties/[id]/details-tab-content.tsx` | Edit (surface hidden fields, cashInvested CTA) | WI-3 |
| `app/app/(app)/properties/[id]/page.tsx` | Edit (read `from` param, render post-submit banner) | WI-6 |
| `app/app/(app)/properties/page.tsx` | Edit (add completeness, InsightTag, filter) | WI-4 |
| `app/app/(app)/properties/add-property-wizard.tsx` | Edit (add `?from=quick-add` to redirect) | WI-6 |
| `app/app/(app)/properties/property-form.tsx` | Edit (fire enrichment analytics) | WI-8 |
| `app/app/(app)/dashboard/page.tsx` | Edit (add "Complete property details" to banner) | WI-7 |

---

## What this does NOT include (future considerations)

- **Nudge email 24h after quick-add** — requires email infrastructure work; defer to a later batch.
- **Smart defaults from address data** (auto-fill bed/bath/sqft from Zillow/Redfin at quick-add time) — would reduce the enrichment burden but requires API integration.
- **Property completeness progress ring/bar** on the detail page — the banner + missing-fields list achieves the same goal with less visual overhead. If analytics show the banner is insufficient, add a ring.
- **Vacancy "explicitly set" flag** — avoiding a DB migration; the 5-point weight loss is negligible.
- **Wiring up `quick-actions.tsx`** — deferred to avoid CTA clutter.

---

## Success metrics

After shipping, measure in PostHog:

| Metric | Baseline (estimated) | Target |
|--------|---------------------|--------|
| % of quick-add properties enriched within 7 days | < 20% (no tracking exists today) | > 40% |
| `property_enrichment_started` / `property_quick_add_completed` | N/A | > 50% click-through |
| `property_enrichment_completed` / `property_enrichment_started` | N/A | > 60% finish rate |
| Properties list "Incomplete profile" badge click-through | N/A | Measurable (add event if needed) |

Review metrics 2 weeks after deploy. If enrichment rate is below 35%, escalate to Tier 2 interventions (progress ring, nudge email).
