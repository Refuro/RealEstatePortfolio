# Quick-Add Completion Gap Audit

**Date:** 2026-04-05  
**Scope:** Post-submission experience for quick-add properties; adequacy of completion nudges  
**Verdict:** **Real concern — high confidence**

---

## 1. Property Detail Page Audit

### What exists today

| Mechanism | Present? | Details |
|-----------|----------|---------|
| **Progress bar / % complete** | No | Nothing like this anywhere on the property page. |
| **"Incomplete" callout banner** | Yes, narrow | `overview-tab-content.tsx` renders a `bg-subtle/40` box with "Complete your property details for more accurate metrics" + "Complete details" button linking to edit. |
| **Health strip chips** | Yes | `PropertyHealthStrip` shows data-staleness, benchmark gaps, lender-missing, neg-am risk — but none of these are about profile completeness. |
| **Edit CTA** | Yes | "Edit" and "Delete" in `property-actions.tsx`. Generic, not completion-specific. |
| **Quick-actions component** | Exists unused | `quick-actions.tsx` (Edit, Add mortgage, Refresh benchmark) is defined but **not imported anywhere**. |

### The `isIncomplete` heuristic is too narrow

The banner only shows when **all three** conditions are true simultaneously:

```
cashInvested == null
  AND mortgageData.length === 0
  AND purchasePrice === currentEstimatedValue
```

This means:
- If the user typed a different purchase price than the auto-estimated value → **banner hidden**, even with zero mortgage data, no bedrooms, no sq ft, no purchase date enrichment.
- If the user added one mortgage but left everything else blank → **banner hidden**.
- In practice, quick-add sets `purchasePrice = currentEstimatedValue` (same value), so the banner **does** fire for unmodified quick-add properties. But any subsequent value edit silences it permanently.

### Field-by-field: what happens when data is missing

| Field | Shown on detail page? | Null/missing behavior | Nudge to fill? |
|-------|----------------------|----------------------|----------------|
| Purchase price | Yes (Financial inputs) | Always displayed (required in DB) | No |
| Purchase date | Yes (Property facts) | Always displayed (required in DB) | No |
| Bedrooms / Bathrooms / Sq ft | Conditionally | **Entire row silently hidden** when all null — no "—", no placeholder, no prompt | **No** |
| Mortgage | Yes (Details tab) | "No mortgage on file" + "Add mortgage" link | Partial (link exists) |
| Vacancy rate | Yes | Defaults silently to 5% — no "Not set" indicator | No |
| Cash invested | Yes | Shows "—" when null | No |
| Notes | Yes | "No notes added" | No |
| Monthly expenses breakdown | No | Only aggregate shown; no per-category breakdown | No |

**Key gap:** Bedrooms, bathrooms, and square feet are completely invisible when missing. A user looking at their property page has no way to know these fields exist unless they click Edit.

---

## 2. Quick-Add Form Audit

### Form fields

Address (with autocomplete), property type, current estimated value, rental status (+conditional monthly rent), monthly expenses. That's it — **5 inputs**.

### "Use the full form instead" link

**Location:** On `properties/new/page.tsx`, between the page subtitle and the form card. It is **above** the form, not inside it.

**Styling:** `text-sm text-muted` paragraph with a `font-medium text-accent hover:underline` link. Secondary but visible — accent-colored against muted parent text.

**Mobile visibility:** Plausibly above the fold on most phones (it's between h1 and the form card). However:
- The preceding paragraph says "Complete each section below…" (full-wizard copy that's not conditional on quick mode), which wastes vertical space.
- A first-time mobile user focused on the form inputs may mentally skip the preamble text.
- The phrasing "just the essentials" actually **reinforces** the quick-add decision rather than prompting doubt.

### Post-submission flow

- **First property:** Redirects to `/dashboard?onboarding=first-property` — dashboard shows a banner: "Property added. Your portfolio is now live." with next-step links. **No mention of completing the property profile.**
- **Subsequent properties:** Redirects to `/properties/{id}` — the property detail page. The `isIncomplete` banner may or may not show depending on the heuristic.
- **No interstitial screen**, no success modal, no "quick-add done, want to add more details?" prompt.

### Analytics

Events `PROPERTY_CREATED` and `PROPERTY_QUICK_ADD_COMPLETED` are fired. No event for "user returned to enrich a quick-add property" — so you currently have **no way to measure** the enrichment rate.

---

## 3. Dashboard / Properties List Audit

### Properties list cards

Cards display: address, value, equity, cash flow, property type badge, and `InsightTag` badges.

**Available `InsightTag` badges:**
- "No mortgage"
- "Benchmark stale"
- "Negative cash flow"
- "Needs update" (6+ months since last edit)

**Missing:** No "Incomplete profile" badge. No visual differentiation between quick-add sparse properties and fully detailed ones. A property with 5 fields populated looks identical to one with 25 fields.

### No completeness utility

- No `calculatePropertyCompleteness()` function exists.
- No `completionPercent` or `isComplete` field in the Prisma schema.
- The `isIncomplete` boolean in `overview-tab-content.tsx` is the only heuristic, and it's local to that component.

---

## 4. UX Research Synthesis

### The "bare record" problem is well-documented

**Empty states are a critical activation moment.** Research from Tonik's analysis of 60%+ D1-retention products shows that 40–60% of new users are lost at empty or underbuilt states. Products with designed empty-state journeys see 60–75% D1 retention vs. 35–45% for generic ones.

**The Zeigarnik Effect (incomplete tasks create cognitive tension)** is the psychological lever behind completion nudges. Visible checklists with unchecked items create an ongoing pull toward completion — but *only* if the incompleteness is visible. A page that silently hides missing fields provides zero Zeigarnik tension.

**The Endowed Progress Effect** (showing users they've already made progress, e.g., "3 of 8 steps done") increases completion motivation. LinkedIn profiles at "All-Star" completion level appear in 40x more searches. The progress bar was the mechanism that drove this — not just having the fields available.

### Profile enrichment without nudges is rare

CRM data shows the average B2B database has 40–60% of fields empty. Without automated enrichment or active nudges, users rarely return to complete records. The SaaS onboarding checklist benchmark is a 19.2% completion rate *with* a visible checklist (Userpilot, 188 companies). Without a checklist, completion rates are substantially lower.

**Activation rate benchmarks:** The average B2B SaaS activation rate is 37.5%. A 25% improvement in activation yields a 34% MRR increase over 12 months. Completion nudges are one of the highest-leverage activation interventions.

### Specific parallels

| Product | Pattern | Result |
|---------|---------|--------|
| LinkedIn | Profile completeness bar ("Intermediate → All-Star") | 40x search visibility for complete profiles |
| Guru | Role-based onboarding checklists | 71% activation increase |
| Generic SaaS (Tonik study) | Progressive disclosure empty states (hide 4 of 5 actions) | 34% activation increase |
| Generic SaaS (Tonik study) | Data-seeded empty states (example data) | D1 retention from 41% → 67% |

---

## 5. Verdict

### **Real concern — high confidence**

The quick-add flow creates properties with 5 populated fields out of ~20+ available fields. After submission:

1. **The property page silently hides missing fields** (bedrooms, bathrooms, sq ft) rather than showing them as empty. This eliminates the Zeigarnik Effect — users don't know they have incomplete data.
2. **The `isIncomplete` banner uses a fragile three-condition AND heuristic** that breaks the moment the user makes any one change (different purchase price, or adds a mortgage). It is not a true completeness measure.
3. **The dashboard / properties list has zero visual signal** that a property is data-sparse. A quick-add property with 5 fields looks identical to a fully enriched one.
4. **No post-submit interstitial or nudge** says "You created a property with minimal data — want to add more details?"
5. **No analytics event** tracks whether users return to enrich quick-add properties, so the problem is invisible in data.
6. **The "Use the full form instead" link before submission** is visible but secondary, and its framing ("just the essentials") actually validates the quick-add choice rather than creating urgency to use the full form.

**Expected impact:** Users who quick-add will see a property page with incomplete metrics (DSCR, LTV, cash-on-cash all showing "—") but won't understand *why* or *what to do about it*. The metrics showing "—" are a weak passive signal. Without an active nudge, the enrichment rate for quick-add properties will likely be < 20%.

---

## 6. Ranked Interventions

Ordered by **impact ÷ effort** (highest ROI first):

### Tier 1: High impact, low effort

| # | Intervention | Effort | Expected Impact | Details |
|---|-------------|--------|-----------------|---------|
| **1** | **Post-submit interstitial on property page** | ~2 hrs | High | After quick-add redirect to `/properties/{id}`, show a dismissible banner: "Property created with quick-add. Add purchase details, mortgage info, and property specs to unlock full analytics." CTA: "Complete details" → edit page. Persist until dismissed or property is enriched. |
| **2** | **Replace `isIncomplete` with a real completeness score** | ~3 hrs | High | Create a `getPropertyCompleteness(property)` utility that checks: purchase price ≠ estimated value, purchase date set, bedrooms/bath/sqft set, mortgage exists, cash invested set, vacancy explicitly set. Return a percentage. Use it for the banner AND the dashboard. |
| **3** | **"Incomplete" badge on properties list cards** | ~1 hr | Medium | When completeness < 70%, show an amber `InsightTag` on the property card: "Incomplete profile" or "Add details". Provides dashboard-level visibility. |

### Tier 2: Medium impact, medium effort

| # | Intervention | Effort | Expected Impact | Details |
|---|-------------|--------|-----------------|---------|
| **4** | **Inline empty-state prompts for hidden fields** | ~3 hrs | Medium | Instead of hiding bedrooms/bath/sqft when null, show a muted row: "Bedrooms, bathrooms, sq ft — Not set" with an "Add" link. Same for vacancy rate showing explicit "Default 5% — Customize". Surfaces the fields that are currently invisible. |
| **5** | **Property completeness progress bar on detail page** | ~4 hrs | Medium | A small progress ring or bar at the top of the property page: "Property profile: 35% complete". Leverages Endowed Progress Effect. Link segments to specific sections of the edit form. |
| **6** | **Post-submit success screen (interstitial page)** | ~3 hrs | Medium | Instead of redirecting directly to the property page, show a brief success screen: "Property created! Your next steps:" with 2–3 enrichment CTAs. Similar to the `onboarding=first-property` banner but for every quick-add. |

### Tier 3: Higher effort, incremental impact

| # | Intervention | Effort | Expected Impact | Details |
|---|-------------|--------|-----------------|---------|
| **7** | **One-time nudge email 24h after quick-add** | ~6 hrs | Low-medium | "You added [address] yesterday. Add mortgage and purchase details to see your true equity position." Requires email infrastructure. |
| **8** | **Smart defaults from address data** | ~8 hrs | Medium | Auto-populate bedrooms/bath/sqft from Zillow/Redfin API data at quick-add time. Reduces the number of fields needing manual enrichment. |
| **9** | **Quick-add form: add a "what you're skipping" disclosure** | ~1 hr | Low | Below the quick-add form, add a collapsed section: "Fields you can add later: purchase price, purchase date, mortgage details, bedrooms/bath/sqft, vacancy rate, notes." Sets expectations before submission. |

### Recommended minimum viable intervention

**Implement #1 + #2 + #3 together** (~6 hours total). This gives you:
- A persistent, dismissible completion banner on the property page (replaces the fragile `isIncomplete` heuristic)
- A completeness score utility that can be reused across the app
- Dashboard-level visibility via an "Incomplete" badge on property cards

Then add a `PROPERTY_ENRICHMENT_STARTED` analytics event on the edit page to measure whether the nudges are working.

---

## Files Referenced

| File | Role |
|------|------|
| `app/(app)/properties/[id]/overview-tab-content.tsx` | `isIncomplete` heuristic + banner |
| `app/(app)/properties/[id]/details-tab-content.tsx` | Field display, hidden optional fields |
| `app/(app)/properties/[id]/property-health-strip.tsx` | Health chips (not completeness) |
| `app/(app)/properties/[id]/property-detail-tabs.tsx` | Tab structure |
| `app/(app)/properties/new/page.tsx` | Quick-add link + page wrapper |
| `app/(app)/properties/add-property-wizard.tsx` | Quick-add form + `submitQuickAdd` |
| `app/(app)/properties/page.tsx` | Properties list, `InsightTag` badges |
| `app/(app)/properties/[id]/quick-actions.tsx` | Exists but unused |
