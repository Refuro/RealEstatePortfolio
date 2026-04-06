# Test Plan: Onboarding & Property Pipeline Improvements

**Date:** 2026-04-05 (updated 2026-04-06)  
**Scope:** All changes from the quick-add completion gap plan, completeness system overhaul (v3), quick-add purchase price fix, quick-add accessibility, edit page completion guidance, mortgage section UX, deal analyzer Rentcast enrichment, save UX, field clearing fixes, mobile fixes, and Rentcast optimization for deal→property conversion.  
**Pre-requisite:** Prisma client must be regenerated after schema migration (stop dev server → `npx prisma generate` → restart). This plan covers the manual verification needed before prod deploy.

---

## Setup

You need **two test states** to cover all branches:

- **State A — Fresh account** (no properties): Tests the first-property flow where quick-add redirects to `/dashboard?onboarding=first-property`.
- **State B — Account with 1+ properties**: Tests the non-first-property flow where quick-add redirects to `/properties/{id}?from=quick-add`.

If you can't easily create a fresh account, you can use State B for most tests and skip tests marked [State A only].

---

## Test 1: Quick-add form page — intro copy, banners, and navigation

**Route:** `/properties/new?mode=quick`

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1.1 | Navigate to `/properties/new?mode=quick` | Page loads with h1 "Add property" | |
| 1.2 | Read the intro paragraph below the heading | Shows "Just the essentials — address, value, purchase price, rent, and expenses. You can add full details anytime from the property page." (includes "purchase price" in the list) | |
| 1.3 | Below the intro, see an accent-styled banner | Banner has `border-accent/30 bg-accent/10` styling. Text: "Need to add mortgage, purchase history, or property specs?" with accent pill "Use the full form" button on the right (stacked on mobile) | |
| 1.4 | Click "Use the full form" | Navigates to `/properties/new` (no `mode` param). The accent banner disappears. Intro text changes to "Complete each section below…" Full wizard renders. | |
| 1.5 | **Mobile (< 640px):** check the accent banner | Text and button stack vertically, no overflow or clip | |

### Full wizard page — "Use quick add" banner

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1.6 | Navigate to `/properties/new` (no `mode`, no `from`) | Shows "Complete each section below…" intro. An accent-styled banner appears: "Just need the basics? Add a property in under a minute." with "Use quick add" button | |
| 1.7 | Click "Use quick add" | Navigates to `/properties/new?mode=quick`. Quick-add form renders. | |
| 1.8 | Deal prefill: Navigate to `/properties/new?from=some-deal-id` | Deal conversion banner ("Converting a saved deal…") appears. "Use quick add" banner does NOT appear (it's suppressed when `dealId` is present) | |

### Properties list — quick-add link

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 1.9 | Navigate to `/properties` (with 1+ properties) | Header shows "Add property" button (accent) AND a separate "Quick add" text link (`text-sm text-muted`) | |
| 1.10 | Click "Quick add" link | Navigates to `/properties/new?mode=quick` | |

---

## Test 2: Quick-add form — purchase price field and last sale suggestion

**Route:** `/properties/new?mode=quick`

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 2.1 | Select an address via autocomplete | "Current estimated value" auto-fills with RentCast estimate. "Purchase price" field stays EMPTY — no auto-fill from estimated value. | |
| 2.2 | Check the purchase price field after enrichment | If RentCast returned `lastSalePrice`, a suggestion banner appears below: "Last sold for **$X** in Mon YYYY" with a "Use this" link. If no `lastSalePrice` available, no suggestion shown. | |
| 2.3 | Click "Use this" on the suggestion banner | Purchase price field fills with the last sale price. Purchase date fills with the last sale date. Suggestion banner disappears. | |
| 2.4 | Clear the purchase price field after using suggestion | Field clears. Suggestion banner does NOT reappear (suggestion state was cleared). | |
| 2.5 | Try to submit without entering a purchase price | Validation error: "Enter a valid purchase price". Form does NOT submit. | |
| 2.6 | "Current estimated value" and "Purchase price" are side by side on desktop | Both fields are in a `grid-cols-1 sm:grid-cols-2` container. On mobile they stack vertically. | |

---

## Test 3: Quick-add form — multi-unit property nudge

**Route:** `/properties/new?mode=quick`

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 3.1 | Select "Multi-family" or "Apartment" from the property type dropdown | An accent-styled nudge appears: "Multi-unit properties need per-unit rent details for accurate tracking." with "Use the full form" button | |
| 3.2 | Click "Use the full form" in the nudge | Navigates to `/properties/new` (full wizard) | |
| 3.3 | Select "Single family", "Condo", "Townhouse", or "Manufactured" | No multi-unit nudge shown | |
| 3.4 | If you ignore the nudge and proceed, quick-add hardcodes `units: 1` in the payload | Even for multi-family type selection, units are sent as 1 (acceptable — the nudge warned the user) | |

---

## Test 4: Quick-add form — rent/expenses layout

**Route:** `/properties/new?mode=quick`

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 4.1 | Select "Yes, rented" | Monthly rent and Monthly expenses appear in a `grid-cols-1 sm:grid-cols-2` container (side by side on desktop) | |
| 4.2 | Check the expenses helper text | Shows "Exclude mortgage — tracked separately." (shortened) | |
| 4.3 | Select "No, not rented" | "Income will be saved as $0 while not rented." text appears. Market rate info shows if available. Expenses field appears below (not side-by-side). | |

---

## Test 5: Quick-add submit → post-submit banner [State B]

**Route:** `/properties/new?mode=quick` → submit → `/properties/{id}?from=quick-add`

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 5.1 | Fill out the quick-add form with valid data (address, property type, value, purchase price, rent, expenses). Submit. | Form submits successfully, redirects to `/properties/{id}?from=quick-add` | |
| 5.2 | On the property detail page, see a banner below the h1 | Banner title: "Property created with quick-add". Body mentions DSCR, LTV, cash-on-cash, payoff projections. Two buttons: "Complete details" (accent) and "I'll do this later" (bordered). | |
| 5.3 | Click "I'll do this later" | Navigates to `/properties/{id}` (no `?from=quick-add`). Banner disappears. | |
| 5.4 | Manually reload `/properties/{id}` (no query param) | Banner is NOT shown. Only the Overview tab's completeness banner should be visible. | |
| 5.5 | Click "Complete details" on the post-submit banner | Navigates to `/properties/{id}/edit`. Edit form loads. | |

---

## Test 6: Quick-add submit → first-property dashboard banner [State A only]

**Route:** `/properties/new?mode=quick` (first property) → `/dashboard?onboarding=first-property`

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 6.1 | From a fresh account, quick-add a property | Redirects to `/dashboard?onboarding=first-property` | |
| 6.2 | Dashboard shows the onboarding banner | Title: "Property added. Your portfolio is now live." Body: "Great start. Add more details to your property to unlock full analytics." | |
| 6.3 | First button in the banner | **"Complete property details"** with accent fill styling (bg-accent). Links to `/properties/{id}/edit`. | |
| 6.4 | Other buttons still present | "Analyze a deal", "Run projections", "Simulate mortgage payoff", "Add another property" — all bordered secondary style. | |
| 6.5 | Click "Complete property details" | Navigates to edit page for the first property | |

---

## Test 7: Completeness system — scoring rules

This tests the overhauled completeness system (base 10, max 80, threshold 60).

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 7.1 | Quick-add a property (value auto-filled, purchase price = value, no mortgage, no cash invested) | Completeness score = 10 (only base). Missing: "actual purchase price", "mortgage status", "cash invested" (3 fields). Property shows "Incomplete profile" badge on the list. | |
| 7.2 | Edit the property: change purchase price to a DIFFERENT value than estimated value | Score increases by 25 → score = 35. "actual purchase price" drops from missing list. Still incomplete (35 < 60). | |
| 7.3 | On the mortgage section, answer "No mortgage" | Score increases by 25 → score = 60. "mortgage status" drops from missing list. Property is now "complete" (60 ≥ 60). Completeness banner disappears. | |
| 7.4 | Fill in "Cash invested" on the edit page | Score increases by 20 → score = 80 (max). "cash invested" drops from missing list. | |
| 7.5 | Verify bed/bath/sqft are NOT in the missing fields list | Even with bed/bath/sqft empty, they should never appear as missing. They are display-only. | |
| 7.6 | Verify the Location & Profile section description says "Address, property type, units, and optional property details." | NOT "optional details that improve rent estimates" | |

---

## Test 8: Completeness system — mortgage status (`hasMortgage`)

**Route:** `/properties/{id}/edit` → Mortgage section

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 8.1 | Open the edit page for a property with `hasMortgage = null` and no mortgages | Mortgage section shows a prompt: "Does this property have a mortgage?" with two buttons: "Yes, add mortgage" and "No mortgage" | |
| 8.2 | Click "No mortgage" | The prompt disappears. Replaced with: "This property has no mortgage." and an "Add mortgage" text link. `hasMortgage` is set to `false` via PATCH. Completeness score increases by 25. | |
| 8.3 | Click "Add mortgage" after selecting "No mortgage" | Mortgage form opens. `hasMortgage` is updated to `true`. | |
| 8.4 | Click "Yes, add mortgage" on the initial prompt | Mortgage form opens immediately. `hasMortgage` is set to `true`. | |
| 8.5 | Add a mortgage and save | Mortgage appears in the list. `hasMortgage` stays `true`. Completeness gets the mortgage 25 points. | |
| 8.6 | Property created via full wizard WITH a mortgage | `hasMortgage` is automatically set to `true` in the POST route. Completeness gets the 25 points immediately. | |

---

## Test 9: Edit page — completion guidance and highlight

**Route:** `/properties/{id}/edit` for an incomplete property

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 9.1 | Navigate to the edit page of an incomplete property | Intro text: "Complete the missing fields below to unlock full portfolio metrics." | |
| 9.2 | At the top of the form, see a summary card | Shows "X fields remaining for full metrics" and lists the missing fields (e.g., "actual purchase price, mortgage status, cash invested"). | |
| 9.3 | Click "Jump to first missing field" button | Page scrolls to the section containing the first missing field. That section gets a pulsing accent ring highlight (`ring-2 ring-accent/40 rounded-xl`) that fades after ~2.5 seconds. | |
| 9.4 | On initial page load (incomplete property) | After ~300ms, the first missing section auto-scrolls into view and gets the same highlight animation. | |
| 9.5 | The nav bar at the top shows badge counts | Each section link shows a numeric badge (accent pill) with the count of missing fields in that section. E.g., "Purchase & value (1)" if only purchase price is missing. | |
| 9.6 | If first missing field is "mortgage status" | "Jump to first missing field" scrolls to `#section-mortgage` (the mortgage section below PropertyForm). The highlight ring appears on that section. | |
| 9.7 | On a COMPLETE property, navigate to the edit page | Intro text: "Update location, purchase & value, income, mortgages, and notes. Use the workspaces for modeling and refinance scenarios." No summary card. No highlight. | |
| 9.8 | Check the purchase price inline nudge (if purchase price = estimated value) | Shows: "This may have been auto-filled. Update if it doesn't reflect your actual purchase price." in accent text | |

---

## Test 10: Edit page — mobile bottom padding

**Route:** `/properties/{id}/edit` on mobile

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 10.1 | Open the edit page on a mobile viewport (< 768px) | Scroll all the way down to the Mortgages section | |
| 10.2 | Verify the bottom of the mortgage section is NOT clipped by the bottom nav bar | There should be adequate padding (`pb-[calc(4rem+env(safe-area-inset-bottom,0px)+1.5rem)]`) between the last section content and the bottom nav. | |
| 10.3 | On desktop (≥ 768px) | The extra bottom padding is NOT applied (`md:pb-0`) | |

---

## Test 11: Property detail page — Overview tab completeness banner

**Route:** `/properties/{id}` for a quick-add property (sparse data)

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 11.1 | Open the property you just quick-added. Ensure you're on the Overview tab. | Banner visible: "Complete these for full metrics" | |
| 11.2 | Read the missing fields line | Lists specific fields, e.g., "actual purchase price, mortgage status, cash invested" (NOT bedrooms, bathrooms, square footage — those are excluded from scoring) | |
| 11.3 | Click "Complete details" in the banner | Navigates to `/properties/{id}/edit` | |
| 11.4 | Complete fields: differentiate purchase price from estimated value, confirm mortgage status (yes or no), add cash invested | After saving, return to the property page. **Banner should be gone** (score ≥ 60). | |
| 11.5 | **Regression:** Open a fully-enriched property | No completeness banner shown. Overview tab renders normally. | |

---

## Test 12: Property detail page — Details tab hidden fields

**Route:** `/properties/{id}?tab=details` for a quick-add property (sparse data)

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 12.1 | Open Details tab on a quick-add property with no bed/bath/sqft | "Property facts" section shows a row: **"Details"** with value **"Bedrooms, bathrooms, sq ft not set."** followed by an accent-colored **"Add details"** link | |
| 12.2 | Click "Add details" | Navigates to `/properties/{id}/edit#section-location` | |
| 12.3 | In "Financial inputs", find the "Cash invested" row | Shows **"Not set."** with an accent **"Add"** link (not just "—") | |
| 12.4 | Click the "Add" link on Cash invested | Navigates to `/properties/{id}/edit#section-economics` | |
| 12.5 | **Regression:** Open Details tab on a property WITH bed/bath/sqft/cashInvested set | Details row shows "3 bed · 2 bath · 1,200 sq ft" (normal display). Cash invested shows formatted dollar value. No "Not set" text or "Add" links. | |

---

## Test 13: Properties list — "Incomplete profile" badge and filter

**Route:** `/properties`

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 13.1 | Navigate to `/properties`. Find a quick-add property card. | Badge **"Incomplete profile"** appears in the insight tags row (using new completeness scoring — checks purchase price diff, mortgage status, cash invested only) | |
| 13.2 | Find or create a fully-enriched property (differentiated purchase price, confirmed mortgage status, cash invested set) | **No** "Incomplete profile" badge on that card | |
| 13.3 | In the filter bar, click **"Incomplete profile"** | URL changes to `/properties?filter=incomplete_profile`. Only properties with incomplete profiles shown. | |
| 13.4 | Click "All" to reset | All properties shown again | |
| 13.5 | Click **"Needs attention"** | Incomplete-profile properties are included (the composite `needsAttention` flag includes `incompleteProfile`) | |
| 13.6 | **Single-property mode:** If you have only 1 property and it's incomplete | The single-property card layout shows the "Incomplete profile" badge in the top-right badge cluster | |
| 13.7 | **Mobile (< 768px):** Verify the filter options include "Incomplete profile" in the mobile filter dropdown | | |

---

## Test 14: Edit page — analytics events (verify via PostHog / network tab)

**Route:** `/properties/{id}/edit` for an incomplete property

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 14.1 | Open browser dev tools → Network tab (filter by "posthog" or your analytics endpoint). Navigate to `/properties/{id}/edit` for an incomplete property. | `property_enrichment_started` event fires with `property_id` in the payload | |
| 14.2 | Fill in enough fields to cross the completeness threshold (differentiate purchase price, confirm mortgage, add cash invested). Save. | `property_enrichment_completed` event fires with `property_id` | |
| 14.3 | Navigate to `/properties/{id}/edit` for a **complete** property | `property_enrichment_started` does **NOT** fire (initialIsIncomplete is false) | |
| 14.4 | **Regression:** Create a brand-new property via the full wizard | `property_created` event still fires. No spurious `property_enrichment_started`. | |

---

## Test 15: Full wizard — regression check

These paths should be working correctly with the updated system.

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 15.1 | Navigate to `/properties/new`. Complete the full 4-step wizard. Submit. | Redirects to `/properties/{id}` (no `?from=quick-add`). **No** post-submit quick-add banner. | |
| 15.2 | [State A] Complete the full wizard as the first property | Redirects to `/dashboard?onboarding=first-property`. Dashboard banner appears as normal. | |
| 15.3 | On the full-wizard property detail page, check the Overview tab | If the property is enriched enough (score ≥ 60), no completeness banner. If some fields were skipped, the banner shows with the correct missing fields. | |
| 15.4 | Full wizard with mortgage step completed | `hasMortgage` set to `true` in POST route. Property gets mortgage completeness points (25) immediately. | |
| 15.5 | Full wizard intro copy for Location & Profile section | Says "Address, property type, units, and optional property details." — NOT "optional details that improve rent estimates" | |

---

## Test 16: RentCast API — no bed/bath/sqft overrides

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 16.1 | Open browser Network tab. In the full wizard Step 2, click "Estimate value" | `/api/estimates/value` request fires. URL params do NOT include `bedrooms`, `bathrooms`, or `squareFootage` — even if those fields are filled in Step 1. | |
| 16.2 | In the full wizard Step 3, click "Estimate rent" | `/api/estimates/rent` request fires. URL params do NOT include `bedrooms`, `bathrooms`, or `squareFootage`. | |
| 16.3 | In the property edit page, click "Estimate value" or "Estimate rent" | Same check: no bed/bath/sqft in request params. | |
| 16.4 | In the deal analyzer, trigger address autocomplete enrichment | RentCast calls do NOT include user-entered bed/bath/sqft. | |
| 16.5 | Quick-add: address autocomplete triggers value estimate | Value estimate API call does NOT include bed/bath/sqft. Response may include `lastSalePrice` and `lastSaleDate`. | |

---

## Test 17: RentCast API — lastSalePrice / lastSaleDate in value estimate

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 17.1 | Call `/api/estimates/value` with a known address that has sale history | Response JSON includes `lastSalePrice` (number) and `lastSaleDate` (date string) if RentCast provides them | |
| 17.2 | Call `/api/estimates/value` with an address that has NO sale history | Response JSON does NOT include `lastSalePrice` or `lastSaleDate` fields (they are omitted, not null) | |
| 17.3 | In the quick-add, select an address with known sale history | After enrichment, the "Last sold for $X in Mon YYYY" suggestion banner appears below purchase price field | |
| 17.4 | In the quick-add, select an address WITHOUT sale history | No suggestion banner appears. Purchase price field remains empty for manual entry. | |

---

## Test 18: Edge cases — completeness scoring

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 18.1 | Quick-add a property where purchase price is user-entered differently from estimated value | Score = 35 (base 10 + purchase price 25). Missing: "mortgage status", "cash invested". | |
| 18.2 | Property with mortgage added but `hasMortgage` was never explicitly set | If `mortgageCount > 0`, mortgage is still confirmed (score gets 25 points regardless of `hasMortgage` value). | |
| 18.3 | Property with `hasMortgage = false` and no mortgages | Mortgage is confirmed as "no mortgage" — score gets 25 points. Not listed as missing. | |
| 18.4 | Property with `hasMortgage = true` but `mortgageCount = 0` | Missing field = "mortgage details" (not "mortgage status"). User has confirmed they have a mortgage but hasn't added one yet. | |
| 18.5 | Property with `hasMortgage = null` and no mortgages | Missing field = "mortgage status". Prompt appears in mortgage section on edit page. | |
| 18.6 | `cashInvested = 0` vs. `cashInvested = null` | `null` = missing (no score). `0` = set (score gets 20 points). Cash invested of $0 is a valid answer (e.g., no money down). | |

---

## Test 19: Deal Analyzer — Rentcast enrichment on address autocomplete

**Route:** `/analyze` (new deal)

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 19.1 | Navigate to `/analyze`. Start typing an address in "Address line 1". | Autocomplete dropdown appears after ~3 characters | |
| 19.2 | Select an address from the autocomplete dropdown | City, State, ZIP auto-fill. "Fetching property data..." indicator appears briefly. | |
| 19.3 | After enrichment completes, check "Current value" field | If it was empty, it's now prefilled with the Rentcast estimate. If you had already typed a value, it's unchanged. | |
| 19.4 | Check below the "Monthly rent" input | A rent suggestion banner appears: "Market rent estimate: $X,XXX/mo" with a "Use this" link | |
| 19.5 | Click "Use this" on the rent suggestion banner | Monthly rent field updates to the suggested value. The banner disappears. | |
| 19.6 | Clear the monthly rent field and type a different number | Rent suggestion banner does NOT reappear (dismissed on manual change) | |
| 19.7 | **Desktop:** Verify the rent suggestion banner has slight top margin separating it from the expense field | Spacing looks clean, not cramped against the row above | |
| 19.8 | **Mobile:** Repeat 19.1–19.6 on a narrow viewport | Autocomplete, enrichment, and rent suggestion all work correctly in the mobile layout | |

---

## Test 20: Deal Analyzer — Save UX (toast, URL update, button text)

**Route:** `/analyze` (new deal)

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 20.1 | Fill out a valid deal (address + at least rent/expenses). Click "Save deal". | Button shows "Saving..." briefly. A green toast appears: "Deal saved \| View saved deals →". URL changes from `/analyze` to `/analyze?deal=<id>`. | |
| 20.2 | After save, check the button text | Now reads "Update deal" (not "Save deal") | |
| 20.3 | Check the "Convert to property" card on the right sidebar (desktop) or below (mobile) | Card is now visible with "Add this deal to portfolio" button. Was not visible before the first save. | |
| 20.4 | Make a change and click "Update deal" | Toast appears again. URL stays the same. No duplicate deal created. | |
| 20.5 | Click "New deal" | All fields reset. URL goes back to `/analyze`. Button text returns to "Save deal". "Convert to property" card disappears. | |
| 20.6 | Click "View saved deals →" in the toast | Navigates to `/deals` | |
| 20.7 | **Mobile:** Repeat 20.1–20.5 | Toast appears above the save buttons. Layout doesn't overflow. | |

---

## Test 21: Deal Analyzer — Current value behavior

**Route:** `/analyze`

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 21.1 | Leave "Current value" empty. Type "100,000" into "Purchase price". | Current value field shows "100,000" as a **placeholder** (gray, not committed). Helper text below reads "Defaults to purchase price". | |
| 21.2 | Change purchase price to "200,000" | Placeholder in current value updates to "200,000". The field itself is still empty. | |
| 21.3 | Click into the "Current value" field and type "250,000" | The typed value sticks. Changing purchase price no longer affects this field. | |
| 21.4 | Clear the "Current value" field entirely | Placeholder returns showing the current purchase price value. | |
| 21.5 | **Mobile:** Placeholder is NOT truncated or clipped ("Same as price" text is gone) | Placeholder shows the purchase price number or is blank. No "Same as price" text. | |

---

## Test 22: Deal Analyzer — Field clearing on update

**Route:** `/analyze?deal=<id>` (existing deal with optional fields filled)

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 22.1 | Open a saved deal that has "Address line 2" filled (e.g., "Apt 4") | Field shows the saved value | |
| 22.2 | Clear the "Address line 2" field completely. Click "Update deal". | Save succeeds. | |
| 22.3 | Reload the page (or navigate away and back to the same deal) | "Address line 2" is empty — the clearing persisted. | |
| 22.4 | Repeat with "Cash invested": fill a value, save, then clear it and save again | Clearing persists on reload. | |

---

## Test 23: Deal → Property wizard — data prefill and no wasted Rentcast calls

**Route:** `/analyze?deal=<id>` → click "Add this deal to portfolio"

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 23.1 | Open a saved deal that has enrichment data (from address autocomplete). Click "Add this deal to portfolio". | Wizard opens. Step 1 prefilled: address, city, state, ZIP, property type, bedrooms, bathrooms, square feet. | |
| 23.2 | Open browser Network tab (filter by `estimates`). Click "Next" to go to Step 2 (Finances). | **No** `/api/estimates/value` request fires. The "Current estimated value" field shows the deal's saved estimate (same number as the deal). | |
| 23.3 | Click "Next" to go to Step 3 (Income). | **No** `/api/estimates/rent` request fires. Monthly rent is prefilled from the deal's saved rent. | |
| 23.4 | Verify the prefilled estimated value matches the deal's "Current value" | The number should be identical — no discrepancy. | |
| 23.5 | On Step 2, click "Estimate value" button explicitly | A Rentcast call fires. The returned value should be close to (or identical to) the deal's saved value, since no sqft override is sent. | |
| 23.6 | **Normal path (no deal):** Navigate to `/properties/new`, complete Step 1, click "Next" | `/api/estimates/value` fires as normal (auto-estimate still works for the non-deal path). | |
| 23.7 | **Normal path:** Click "Next" to Step 3 | `/api/estimates/rent` fires as normal. | |

---

## Test 24: Property form — field clearing on update

**Route:** `/properties/<id>/edit` (existing property with optional fields)

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 24.1 | Open an existing property for editing. Verify "Nickname" has a value. Clear it. Save. | Save succeeds. | |
| 24.2 | Reload the property edit page | Nickname is empty — the clearing persisted. | |
| 24.3 | Repeat with "Address line 2": fill, save, clear, save | Clearing persists. | |
| 24.4 | Repeat with "Cash invested": fill, save, clear, save | Clearing persists. | |
| 24.5 | Repeat with "Notes": fill, save, clear, save | Clearing persists. | |

---

## Test 25: Mobile — full wizard footer and tool shell

**Route:** `/properties/new` on mobile viewport (< 640px)

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 25.1 | Open the full wizard on a mobile device or narrow viewport | The "Next" button at the bottom is fully visible above the bottom nav bar. Not cut off or hidden. | |
| 25.2 | Navigate to Step 2 (Finances) | "Next", "Save basics and finish later" buttons all fully visible. | |
| 25.3 | Navigate to Step 4 (Review) | "Create property" button fully visible and tappable. | |
| 25.4 | Open the deal analyzer `/analyze` on mobile | Save/New deal buttons in the footer are not cut off by the bottom nav. | |

---

## Test 26: Mobile-specific checks — all flows

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 26.1 | Quick-add form page on mobile (~375px width) | Accent banners (full-form callout, multi-unit nudge) stack vertically. No horizontal overflow. | |
| 26.2 | Post-submit banner on mobile | "Complete details" and "I'll do this later" buttons wrap properly. Touch targets are ≥ 44px. | |
| 26.3 | Properties list cards on mobile | "Incomplete profile" badge wraps within the badge row. Card doesn't overflow. | |
| 26.4 | Overview completeness banner on mobile | Missing fields text wraps. "Complete details" button is full-touchable (min-h-[44px]). | |
| 26.5 | Details tab "not set" rows on mobile | "Add details" and "Add" links are tappable without misclicks. | |
| 26.6 | Edit page mortgage section on mobile | Mortgage section is fully visible and not clipped by bottom nav (safe-area padding applied). | |
| 26.7 | Quick-add: "Current estimated value" and "Purchase price" stack vertically on mobile | Grid collapses from 2 columns to 1 correctly. | |
| 26.8 | Quick-add: "Monthly rent" and "Monthly expenses" stack vertically on mobile (when rented) | Grid collapses from 2 columns to 1 correctly. | |

---

## Test 27: Deal enrichment — reopening a saved deal

**Route:** `/deals` → open a previously enriched deal

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 27.1 | Save a deal with address autocomplete enrichment. Navigate to `/deals`. Re-open the deal. | All fields restore: address, current value, monthly rent. Enrichment data (bed/bath/sqft) is loaded in the background (visible when converting to property). | |
| 27.2 | The rent suggestion banner does NOT reappear on re-open | Banner only shows on fresh enrichment, not when loading a saved deal. | |
| 27.3 | Click "Add this deal to portfolio" | Wizard Step 1 shows enriched bedrooms, bathrooms, square feet, property type prefilled from the saved deal data. | |

---

## Test 28: API route — `hasMortgage` in POST

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 28.1 | Create a property via quick-add (no mortgage in payload) | Property created with `hasMortgage: null`. | |
| 28.2 | Create a property via full wizard with `hasMortgage: false` (user said no mortgage in step) | Property created with `hasMortgage: false`. | |
| 28.3 | Create a property via full wizard WITH a mortgage attached | Property created. After mortgage is created, `hasMortgage` is explicitly set to `true` via an update call. | |
| 28.4 | Verify by checking DB or API response | The `hasMortgage` field is persisted correctly in all three scenarios. | |

---

## Test 29: Schema changes — unitMix removed

| # | Step | Expected | Pass? |
|---|------|----------|-------|
| 29.1 | Check the Prisma schema | `unitMix` field is NOT present on the `Property` model. | |
| 29.2 | Search the codebase for "unitMix" references | No functional references remain (only migration files or docs). | |
| 29.3 | Edit page does NOT show a "Unit mix" field | No text input or label for unit mix anywhere in the property form. | |
| 29.4 | Details tab does NOT reference unit mix | No "Unit mix" row in the property details. | |

---

## Files changed (for reference during testing)

| File | What changed |
|------|-------------|
| `lib/property-completeness.ts` | Overhauled scoring: base 10, purchase price diff 25, mortgage confirmed 25, cash invested 20. Max 80, threshold 60. Bed/bath/sqft excluded. |
| `lib/property-completeness.test.ts` | Unit tests updated for new scoring rules |
| `lib/analytics-events.ts` | Added `PROPERTY_ENRICHMENT_STARTED`, `PROPERTY_ENRICHMENT_COMPLETED` |
| `lib/integrations/rentcast.ts` | `ValueEstimateResult` now includes `lastSalePrice` and `lastSaleDate`. Parsing added for both fields from RentCast response. |
| `lib/validations/property.ts` | `hasMortgage` field added to property validation schema |
| `lib/validations/deal.ts` | New enrichment fields in `dealSchemaBase` |
| `prisma/schema.prisma` | Added `hasMortgage` (Boolean?) to Property. Removed `unitMix`. Added enrichment columns to SavedDeal. |
| `prisma/migrations/20260406120000_completeness_overhaul/migration.sql` | Migration for `hasMortgage` addition and `unitMix` removal |
| `properties/new/page.tsx` | Conditional intro copy + accent "Use the full form" / "Use quick add" banners. Updated subtitle to include "purchase price". |
| `properties/add-property-wizard.tsx` | Quick-add: separate purchase price field, `lastSaleSuggestion` state, "Use this" pattern for last sale price, multi-unit nudge, compacted grid layouts for value/price and rent/expenses, no bed/bath/sqft in Rentcast calls, purchase price validation. Deal prefill carries enrichment data. |
| `properties/property-form.tsx` | `highlightSection()` function for animated scroll-to + ring highlight. Updated "Jump to first missing field" to use highlight. Updated copy: no bed/bath/sqft in completeness, softened purchase price nudge. Cash invested highlight ring. |
| `properties/[id]/edit/page.tsx` | Completeness computed with `hasMortgage`. Passes `hasMortgage` to PropertyForm and MortgageSection. Mobile safe-area bottom padding. Updated incomplete/complete intro copy. |
| `properties/mortgage-section.tsx` | `hasMortgage` prompt (yes/add, no mortgage). Three states: null (prompt), false (confirmed no), true (add form or list). Removed redundant empty state. |
| `properties/page.tsx` | "Quick add" link in header. Completeness uses new scoring with `hasMortgage`. |
| `properties/[id]/page.tsx` | Reads `from` param, renders post-submit banner |
| `properties/[id]/overview-tab-content.tsx` | Uses `getPropertyCompleteness` with `hasMortgage`. Missing fields banner reflects new scoring. |
| `properties/[id]/details-tab-content.tsx` | Surfaced hidden bed/bath/sqft + cash invested with "Add" links |
| `api/properties/route.ts` (POST) | `hasMortgage` persisted on create. Auto-set to `true` when mortgage created alongside property. |
| `api/estimates/value/route.ts` | Response now includes `lastSalePrice` and `lastSaleDate` if available |
| `api/deals/route.ts` | POST persists + returns enrichment fields |
| `api/deals/[id]/route.ts` | PATCH persists + returns enrichment fields |
| `dashboard/page.tsx` | "Complete property details" primary CTA in first-property banner |
| `analyze/deal-analyzer-form.tsx` | Address autocomplete + Rentcast enrichment, rent suggestion banner, save toast + URL update, field clearing fix, current value placeholder fix, enrichment fields in save payload |
| `components/mobile-tool-shell.tsx` | Bottom padding increased to account for MobileBottomNav height |
| `components/property/address-autocomplete-input.tsx` | Focus tracking improvements, better hide timer, input ref |
