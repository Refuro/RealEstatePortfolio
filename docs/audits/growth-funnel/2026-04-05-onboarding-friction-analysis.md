# Onboarding & First-Property Activation Friction Analysis

**Date:** 2026-04-05  
**Scope:** Full sign-up → first property added funnel  
**Target metric:** Increase % of signed-up users who complete the add-property flow  
**Current state:** 6 users signed up, 0 properties added, 0 activated

---

## 1. Funnel Audit Summary

The funnel is broken between sign-up and first property creation. 6 users completed sign-up; 0 completed the add-property flow. The onboarding modal offers a permanent escape hatch ("Maybe later") that sets `onboardingDismissedAt` with no re-engagement mechanism afterward. The wizard itself is a long, single-page form with 5 sections totaling 20+ fields across location, purchase, income, mortgage, and review, requiring paperwork (closing documents, mortgage statements) that a user almost certainly doesn't have in front of them on their first login. The empty dashboard does have a static "Add your first property" CTA, but there is no time-based re-engagement, no email follow-up, and no persistent nudge that changes over repeat visits. The most likely failure mode: user sees modal, clicks "Maybe later" (doesn't have paperwork, form looks heavy), lands on empty dashboard, never returns.

---

## 2. Modal Audit Findings (`onboarding-panel.tsx`)

### CRITICAL — "Maybe later" is a permanent opt-out with no recovery

- Clicking "Maybe later" calls `patchOnboarding("dismiss_modal")`, which sets `onboardingDismissedAt` in the database. The modal's visibility condition is `!progress.welcomeSeenAt && !progress.dismissedAt`. Once dismissed, the modal never returns. There is no server-side or client-side mechanism to re-surface it.
- After dismissal, the user sees the empty dashboard. The empty dashboard has a static CTA but no dynamic re-engagement. A user who dismisses on day 1 sees identical messaging on day 30.

### HIGH — "Typical setup time: about 60 seconds" is inaccurate

- The wizard has 5 sections. Section 4 (Mortgage) alone has 12 fields requiring a mortgage statement. Section 2 requires purchase closing documents. Even a user with all paperwork ready would need 3–5 minutes. Setting an expectation of 60 seconds that is immediately violated on entry to the wizard creates trust damage at the worst possible moment.

### HIGH — No preview of the post-activation experience

- The modal shows three ValueChips ("Track cash flow", "See equity growth", "Model upside") but no screenshot, no before/after, and no concrete preview of the dashboard. The user is asked to invest effort in a form without any visual evidence of the payoff.

### MEDIUM — Copy does not create urgency or communicate lightness

- "Build your real estate portfolio in minutes" is aspirational but generic. "Add your first property to unlock live equity, cash flow, and performance insights" communicates the outcome but makes the ask sound heavy — "add your first property" sounds like a commitment, not a quick win.
- There is no framing of "just the basics" or "you can add details later" — the modal implies the wizard requires full property data upfront.

### MEDIUM — Touch targets below 44px minimum

- "Maybe later" button: `px-4 py-2` with `text-sm` renders approximately 36px tall — below the 44px minimum per the veld-mobile skill.
- "Add first property" button: `px-5 py-2` — same issue.
- Both need `min-h-[44px]` on mobile.

### LOW — Design system violations

- `border-border/70` on the dialog — deprecated per veld-ui skill; should be `border-border`.
- `bg-card/95` on the dialog — deprecated; should be `bg-card`.
- `hover:-translate-y-px` on the primary CTA — Y-translate lift is designated for marketing value prop cards only, not in-app action buttons.

---

## 3. Wizard Audit Findings (`add-property-wizard.tsx`)

### Section 1 — Location & profile

**HIGH — No address autocomplete**
- User must manually type address line 1, city, state (dropdown), and ZIP. This is 4 required interactions for a single address. With autocomplete (Gap 12 from product gap discovery), this becomes 1 interaction. This is the single highest-friction field cluster in the entire wizard and the first thing a user encounters after the section heading.

**MEDIUM — Nickname is the first field**
- The first thing the wizard asks is "Nickname (optional)." A new user doesn't have a nickname in mind for their property — they're thinking about entering their address. Moving this to the end of the section or to the review step would reduce cognitive load at the moment of highest engagement.

**MEDIUM — High initial field count**
- A single-family user sees: Nickname, Address line 1, Address line 2, City, State, ZIP, Property type, Bedrooms, Bathrooms, Square feet — 10 fields visible immediately. This is front-loaded complexity. The optional fields (nickname, address line 2, bedrooms, bathrooms, sq ft) are not visually de-emphasized enough to signal "skip these."

### Section 2 — Purchase & value

**HIGH — Purchase price and date require closing documents**
- Both are validated as required. A user who doesn't remember their exact purchase price or date will stop here. There is no "estimate" button for purchase price and no guidance like "approximate is fine — you can update this later."

**MEDIUM — Cash invested has no helper text**
- The field label is "Cash invested (optional)" with no explanation. "Cash invested" (down payment + closing costs + rehab) is non-obvious for many landlords. Without guidance, some users will enter their down payment only, others their total out-of-pocket, and some will skip it — all producing different (and potentially misleading) cash-on-cash return values.

**LOW — "Estimate value" button is well-placed**
- The button is inline next to the current estimated value field with clear loading state ("Estimating...") and error messaging. It requires address from Section 1 — the error message "Enter address in Step 1 first" is adequate. This is one of the better UX elements in the wizard.

### Section 3 — Income & expenses

**HIGH — Monthly expenses has no guidance on what to include**
- The field is labeled "Monthly expenses *" with no helper text. A user who enters only their mortgage payment (the most common mistake) will get a severely wrong cash flow figure, because the mortgage payment should be separate from operating expenses. There is no note saying "Include insurance, property tax, HOA, maintenance — exclude your mortgage payment (that's tracked separately in Section 4)."

**MEDIUM — Vacancy % is jargon for new investors**
- The helper text says "Expected vacancy (e.g. 5%). Reduces rent in cash flow calculations." This explains the mechanical effect but not the concept. A first-time landlord who has never had a vacancy period may enter 0%, producing unrealistically optimistic cash flow.

**LOW — isRented toggle and estimate rent are clear**
- The toggle UI is good. The "Not rented" path shows helpful messaging about $0 income. The "Estimate rent" button follows the same pattern as "Estimate value." Both are functional.

### Section 4 — Mortgage

**MEDIUM — Must explicitly choose Yes/No before proceeding**
- `addMortgage` defaults to `null`. Validation requires a non-null selection: "Please choose whether to add a mortgage." A user who scrolls past without choosing will be scrolled back to this section on submit. While the section copy clearly says it's optional and "No, skip" is prominent, the `null` default means the user cannot simply skip by scrolling past — they must click.

**MEDIUM — Mortgage form is 12 fields requiring a statement**
- Fields: original loan amount, current balance, balance as of date, interest rate, term, start date, monthly payment, payment effective date, lender name, loan type, escrow checkbox, escrow amount. This section alone requires pulling up a mortgage statement. For a first-time setup, this is the section most likely to cause abandonment.

**LOW — "Optional" framing is clear**
- The helper text at the top of Section 4 is well-written: "Optional. You can skip and add or edit loan details anytime from the property page after you save. Choosing 'No, skip' does not block creating the property." This is good copy.

**LOW — Escrow guidance exists**
- The escrow amount field has helper text: "Used for balance projection. Your total payment above is used for cash flow." This is clear.

### Section 5 — Review

**MEDIUM — No metric preview before save**
- The review step shows a summary of entered data but no preview of the metrics that will calculate from it. The user submits blind — they don't know what equity, cash flow, or cap rate they'll see until after the property is created. Showing even 2–3 preview metrics (equity, monthly cash flow, cap rate) would validate the data entry effort and create a reward moment before the final click.

**LOW — Edit links work correctly**
- Each review card has an "Edit" anchor link that scrolls back to the relevant section. This is functional and well-implemented.

---

## 4. Empty Dashboard / Re-entry Path Findings

### CRITICAL — No re-engagement path after modal dismissal

- After "Maybe later", the `onboardingDismissedAt` timestamp is set permanently. No code path resets it. No email is sent. No time-based logic re-surfaces the prompt. The user sees the empty dashboard on every visit with identical static copy.

### MEDIUM — Empty dashboard CTA exists but is static

- The empty state uses the correct veld-ui empty state pattern (icon, heading, support text, CTA).
- "Start with a property to unlock your dashboard — equity, cash flow, and benchmarks in one place" is decent copy.
- But it's the same on day 1 and day 365. No progressive urgency, no personalization, no reference to what the user is missing.

### LOW — "More ways to get started" is hidden behind a `<details>` element

- "Analyze a deal" and "Import from CSV" are discoverable only if the user clicks an expandable summary link. On first visit, most users won't explore this. These alternate paths should be more visible.

---

## 5. Analytics Completeness

### What's good

- The onboarding modal emits `onboarding_step_completed` with distinct steps: `welcome_modal_viewed`, `welcome_maybe_later`, `welcome_add_first_property`. This covers the modal fork cleanly.
- The wizard emits `add_property_milestone_reached` for each section via IntersectionObserver. This creates a natural scroll-based funnel.
- `wizard_opened` milestone fires once per session on mount.
- `property_created` fires on successful save.
- Deduplication is implemented correctly: onboarding steps use localStorage (persistent per user), milestones use sessionStorage (per tab session).

### What's missing

- **No `wizard_abandoned` event.** The `beforeunload` handler in `draft-context.tsx` prevents accidental navigation but does not fire an analytics event. If a user opens the wizard, scrolls to section 2, and closes the tab, the only signal is `wizard_opened` + `section_location` + `section_economics` with no explicit abandonment marker. A `wizard_abandoned` event on `beforeunload` (or on navigation away from `/properties/new`) would close this gap.
- **No time-in-wizard metric.** The milestones record which sections were viewed but not how long the user spent on the wizard. A `wizard_opened` timestamp compared to `property_created` or `wizard_abandoned` would reveal whether users are dropping out quickly (overwhelmed) or slowly (stuck on a field).
- **Section milestone threshold is low.** `threshold: 0.12` means a milestone fires when just 12% of the section is visible. A user scrolling quickly past a section will fire the milestone without engaging. This inflates perceived funnel progress. Consider `threshold: 0.5` or adding a dwell-time gate.
- **No event for "Estimate value" or "Estimate rent" usage.** These are key activation assists — knowing how many users attempt or succeed with the estimate buttons would inform whether RentCast integration is helping or not.

---

## 6. Friction Ranking

Ranked from highest to lowest expected impact on activation rate.

| Rank | Friction point | Affected users | Current behavior | Proposed fix | Effort | Expected impact |
|------|---------------|----------------|-----------------|-------------|--------|----------------|
| 1 | No address autocomplete | Everyone | User manually types 4 address fields | Add Google Places / Smarty autocomplete to address input in `StepAddressBasics` | S–M | Very High |
| 2 | "Maybe later" permanently kills activation path | Everyone who isn't ready | `onboardingDismissedAt` set forever; no re-engagement | Add persistent inline empty-state banner on dashboard; add day-3/day-7 email via Resend | S (banner) / M (email) | Very High |
| 3 | Monthly expenses has no guidance | Everyone | "Monthly expenses *" with no helper text | Add helper text: "Include insurance, property tax, HOA, maintenance. Exclude mortgage payment — that's tracked separately below." | S (minutes) | High |
| 4 | "60 seconds" claim is inaccurate | Everyone | "Typical setup time: about 60 seconds" | Change to "about 5 minutes with your property details handy" or remove; add "You can save a basic property now and fill in details later" if quick-add is built | S (minutes) | High |
| 5 | No quick-add path — full form required for first property | Users without paperwork | 20+ field form required before any metrics are visible | Build "Quick add" path: address + estimated value + rent + expenses only; defer purchase details and mortgage | M | Very High |
| 6 | Purchase price/date require closing docs | Users without paperwork | Required fields with no skip or estimate option | Make purchase price default to estimated value with "(update later)" note; default purchase date to today with same note | S | High |
| 7 | No metric preview before save | Everyone | Review step shows data summary but no calculated metrics | Show 2–3 preview metrics (equity, monthly cash flow, cap rate) in the review step | S | Medium |
| 8 | Nickname is the first field | Everyone | First field is an optional, confusing question | Move nickname to end of section 1 or to review step | S (minutes) | Medium |
| 9 | Cash invested has no explanation | Less experienced investors | Label only: "Cash invested (optional)" | Add helper: "Down payment + closing costs + any upfront rehab. Used for cash-on-cash return." | S (minutes) | Medium |
| 10 | Vacancy % is jargon | New investors | "Expected vacancy (e.g. 5%)" | Expand helper: "The % of time you expect the property to be vacant between tenants. 5% is typical for stable rentals. Set to 0% if owner-occupied." | S (minutes) | Low |
| 11 | Touch targets below 44px on modal | Mobile users | Buttons at ~36px height | Add `min-h-[44px]` to both modal buttons | S (minutes) | Low |
| 12 | Design system violations in modal | N/A (cosmetic) | `border-border/70`, `bg-card/95`, `hover:-translate-y-px` | Fix to `border-border`, `bg-card`, remove translate | S (minutes) | Low |

---

## 7. Tier 1 Recommendations — Do This Week

Highest impact, lowest effort. Copy, UX, and flow changes that do not require new infrastructure.

### T1-1: Add helper text to monthly expenses field

**File:** `app/(app)/properties/add-property-wizard.tsx`, `StepIncomeExpenses`, after the expenses `<CurrencyInput>`  
**Change:** Add a `<p>` helper after the expenses input:

```tsx
<p className="mt-0.5 text-xs text-muted">
  Insurance, property tax, HOA, repairs, property management — exclude mortgage payment (tracked separately in the Mortgage section).
</p>
```

**Effort:** 5 minutes.  
**Impact:** High — prevents the single most common data entry error.  
**Analytics impact:** None — no events affected.

---

### T1-2: Fix "60 seconds" copy in onboarding modal

**File:** `app/(app)/onboarding-panel.tsx`, line 196  
**Change:** Replace with accurate expectation and a lightness signal:

```tsx
<p className="mt-4 text-xs text-muted">
  Takes about 5 minutes with your property details. You can start with just the basics and fill in the rest later.
</p>
```

**Effort:** 5 minutes.  
**Impact:** High — prevents trust violation at the moment of highest engagement.  
**Analytics impact:** None.

---

### T1-3: Move nickname field to end of Section 1

**File:** `app/(app)/properties/add-property-wizard.tsx`, `StepAddressBasics`  
**Change:** Move the nickname `<div>` block (lines 137–148) to after the square feet field (line 387). The first thing the user should see is address line 1.

**Effort:** 10 minutes.  
**Impact:** Medium — reduces cognitive load at the top of the form.  
**Analytics impact:** None.

---

### T1-4: Add helper text to cash invested field

**File:** `app/(app)/properties/add-property-wizard.tsx`, `StepPurchase`, after the cash invested `<CurrencyInput>`  
**Change:**

```tsx
<p className="mt-0.5 text-xs text-muted">
  Down payment + closing costs + any upfront rehab. Used to calculate cash-on-cash return.
</p>
```

**Effort:** 5 minutes.  
**Impact:** Medium.  
**Analytics impact:** None.

---

### T1-5: Add "approximate is fine" messaging to purchase price and date

**File:** `app/(app)/properties/add-property-wizard.tsx`, `StepPurchase`  
**Change:** Add helper text after purchase price and purchase date labels:

```tsx
<p className="mt-0.5 text-xs text-muted">
  Approximate is fine — you can update this anytime from the property page.
</p>
```

**Effort:** 10 minutes.  
**Impact:** Medium — reduces the "I need my closing docs" dropout.  
**Analytics impact:** None.

---

### T1-6: Add persistent empty-state re-engagement on dashboard

**File:** `app/(app)/dashboard/page.tsx`, inside the `propertyCount === 0` block  
**Change:** Replace or augment the current static empty state with an inline card that acknowledges the user has returned. Move "Analyze a deal" and "Import from CSV" out of the `<details>` collapse into visible secondary CTAs.

**Effort:** 30 minutes.  
**Impact:** Very High — this is the re-entry surface for every user who clicked "Maybe later."  
**Analytics impact:** None — existing CTA click events still apply.

---

### T1-7: Fix modal touch targets and design system violations

**File:** `app/(app)/onboarding-panel.tsx`  
**Changes:**
- Add `min-h-[44px]` to both button elements (lines 205–211 and 213–221)
- Change `border-border/70` to `border-border` on line 172
- Change `bg-card/95` to `bg-card` on line 172
- Remove `hover:-translate-y-px` from the primary button (line 218)

**Effort:** 10 minutes.  
**Impact:** Low individually, but fixes mobile compliance and design system adherence.  
**Analytics impact:** None.

---

### T1-8: Add metric preview to the review step

**File:** `app/(app)/properties/add-property-wizard.tsx`, `StepReview`  
**Change:** After the four review cards, add a small "Preview metrics" inset showing computed equity, monthly cash flow, and cap rate from the entered data. Use the existing `computePropertyMetrics` function with the wizard data. Handle missing data gracefully (show "—" for metrics that can't compute).

**Effort:** 1–2 hours.  
**Impact:** Medium — creates a reward moment before submit and validates the user's data entry.  
**Analytics impact:** None.

---

## 8. Tier 2 Recommendations — Do This Sprint

Concrete feature changes with medium effort.

### T2-1: Quick-add path (address + estimates + expenses → save)

Build a "Quick add" mode for the add-property wizard that requires only:

1. Address (with autocomplete — see T2-2)
2. Property type (defaulted to single_family)
3. Current estimated value (auto-estimated via RentCast)
4. Rental status + estimated rent (auto-estimated)
5. Monthly expenses (one field)
6. Purchase price (pre-filled from estimated value, editable)
7. Purchase date (pre-filled to today, editable)

Everything else deferred. Mortgage skipped by default. After save, the property detail page shows a "Complete your property" prompt for missing data.

**Implementation:**
- New `quick` query param on `/properties/new?mode=quick`
- In `AddPropertyWizard`, if mode is quick, render only a condensed single-section form
- On save, same API — Prisma schema doesn't prevent minimal data since most optional fields are nullable or have defaults
- Add a `PROPERTY_QUICK_ADD_COMPLETED` analytics event

**Schema compatibility:** The Prisma schema requires `purchasePrice` (Decimal), `purchaseDate` (DateTime), `currentEstimatedValue` (Decimal), `currentMonthlyRent` (Decimal), and `currentMonthlyExpenses` (Decimal) as non-nullable. All other fields are optional or have defaults. The quick-add must include these 5 + address fields — but with auto-estimates and sensible defaults (price = estimated value, date = today, expenses = 0 with a note), the user interaction can be as low as 2 fields (address + expense estimate).

**Effort:** M (1–2 days).  
**Impact:** Very High.

---

### T2-2: Address autocomplete

Integrate Google Places Autocomplete (or Smarty) into the address input in `StepAddressBasics`.

**Implementation:**
- Proxy API route: `app/api/places/autocomplete` to keep API key server-side
- Autocomplete input component replaces `addressLine1` input
- On selection, auto-fill `addressLine1`, `city`, `state`, `zipCode`
- Auto-trigger "Estimate value" and "Estimate rent" after address auto-fill

**Effort:** S–M (4–8 hours including API proxy).  
**Impact:** Very High — reduces the highest-friction interaction from 4 fields to 1.

**Analytics:** Add `address_autocomplete_used` event with `{ source: "google_places" | "manual" }`.

---

### T2-3: Progressive save — save basic property, add details later

Instead of requiring all 5 sections before save, allow saving after Section 1 + Section 2 (address + purchase/value) with defaults for the rest:

- Rent: $0 (isRented = false by default, or use estimate)
- Expenses: $0 (with a "complete your property" nudge)
- Mortgage: skipped

**Implementation:**
- Add a "Save basics and finish later" button visible after Section 2
- Same `POST /api/properties` endpoint — just with default/zero values for income and expenses
- Property detail page shows a "Your property is missing income and expense data — metrics are incomplete" inline prompt
- Track `property_created_partial` vs `property_created_complete` in analytics

**Effort:** M (1–2 days).  
**Impact:** High.

---

### T2-4: Day-3 and day-7 re-engagement emails

For users with 0 properties, send automated emails via Resend:

- **Day 3:** "Your Veld dashboard is ready — add your first property in under 5 minutes" with a direct link to `/properties/new`
- **Day 7:** "Landlords tracking their portfolio see more clarity on equity and cash flow. Add your first property to get started."

**Implementation:**
- Cron job (Vercel Cron or similar) queries users where `createdAt` is 3 or 7 days ago AND property count = 0
- Send via Resend (already in stack)
- Add `onboarding_email_sent` and `onboarding_email_clicked` events
- Respect unsubscribe (add unsubscribe link, track opt-out in user model)

**Migration note:** Requires a new field on the User model (e.g., `onboardingEmailsSentAt: Json?`) to track which emails have been sent. No impact on existing user records — nullable field.

**Effort:** M (1–2 days).  
**Impact:** High — this is the only mechanism to re-engage users who have left the app.

---

## 9. Quick-Add Feasibility Analysis

### Schema requirements (Prisma)

Non-nullable, no-default fields on the `Property` model:

| Field | Type | Notes |
|-------|------|-------|
| `addressLine1` | String | Required |
| `city` | String | Required |
| `state` | String | Required |
| `zipCode` | String | Required |
| `purchasePrice` | Decimal(14,2) | Required |
| `purchaseDate` | DateTime | Required |
| `currentEstimatedValue` | Decimal(14,2) | Required |
| `currentMonthlyRent` | Decimal(12,2) | Required |
| `currentMonthlyExpenses` | Decimal(12,2) | Required |

Fields with defaults: `propertyType` ("single_family"), `units` (1), `ownershipPercent` (100), `isRented` (true), `vacancyPercent` (5).

### Zod validation requirements (`createPropertySchema`)

Same as Prisma plus: `purchasePrice` must parse to a non-negative number, `purchaseDate` must be a valid date, `currentMonthlyRent` must be provided when `isRented` is true (or have `unitRents`).

### Minimum viable field set (quick-add)

| User interaction | Field(s) populated | How |
|---|---|---|
| Type address (with autocomplete) | addressLine1, city, state, zipCode | Google Places auto-fill |
| (Auto) Estimate value | currentEstimatedValue | RentCast AVM, triggered automatically after address |
| (Auto) Estimate rent | currentMonthlyRent | RentCast, triggered automatically |
| Accept or edit purchase price | purchasePrice | Default to estimated value |
| Accept or edit purchase date | purchaseDate | Default to today |
| Enter monthly expenses | currentMonthlyExpenses | User enters; or default to $0 with "update later" note |

**Result: 1 required user interaction (address) + 1 optional edit (expenses). Everything else is auto-filled or defaulted.**

### Metrics available with minimal vs. full input

| Metric | Minimal input (no mortgage, no cash invested) | Full input |
|---|---|---|
| Equity | Value only (no debt to subtract) — still meaningful | Value − mortgage balance |
| Monthly cash flow | Rent − expenses (no mortgage deducted) — partial but useful | Rent − expenses − mortgage − vacancy |
| Cap rate | NOI / value — fully computable with rent + expenses + value + vacancy | Same |
| LTV | Not available (no debt) | Debt / value |
| Cash-on-cash | Not available (no cash invested) | Annual cash flow / cash invested |
| DSCR | Not available (no debt service) | NOI / annual debt service |

**3 meaningful metrics immediately available:** equity (simplified), monthly cash flow (simplified), and cap rate. This is enough to show the user the core product value.

### "Complete your property" prompt

On the property detail page, when data is incomplete, display an inline prompt:

- Heading: "Complete your property details for more accurate metrics"
- Support: "Add purchase history and mortgage data to unlock LTV, cash-on-cash return, and DSCR."
- CTA: "Complete details" → property edit page

**Display condition:** `cashInvested` is null AND mortgage count is 0 AND `purchasePrice` equals `currentEstimatedValue` (proxy for "user hasn't entered real purchase data").

---

## 10. Re-engagement Path Proposal

### Inline dashboard banner (not a modal)

Replace the `<details>` section in the empty dashboard with a prominent but non-interruptive card. Always visible on the empty dashboard, regardless of whether the onboarding modal was dismissed. Uses the veld-ui `border-accent/20 bg-accent/5` pattern (same as the existing single-property upsell card on the populated dashboard).

### Progressive copy based on account age

Use `user.createdAt` to vary the empty-state messaging. No new DB fields required — `createdAt` already exists on the User model.

| Account age | Heading | Support text |
|---|---|---|
| Day 0–1 | "Your dashboard is waiting for its first property" | "Add one property and see live equity, cash flow, and cap rate." |
| Day 2–6 | "Still setting up? Most landlords add their first property in under 5 minutes" | "Your dashboard will show real-time portfolio metrics the moment you add a property." |
| Day 7+ | "Your portfolio metrics are ready when you are" | "Add a property to start tracking equity, cash flow, and rent benchmarks." |

**Implementation:** Server component reads `user.createdAt`, computes days since signup, selects copy variant. No client-side state needed.

### Day-3 and day-7 emails (via Resend)

- **Day 3 email:** Subject: "Your Veld dashboard is ready." Body: "You signed up for Veld Portfolio but haven't added a property yet. Add one in under 5 minutes and start tracking equity, cash flow, and cap rate." CTA: "Add your first property" → `/properties/new`.
- **Day 7 email:** Subject: "Missing out on portfolio insights?" Body: "Landlords using Veld track real-time equity, cash flow, and rent-vs-market benchmarks. You're one property away from joining them." CTA: "Get started" → `/properties/new`.

Resend is already integrated for the contact form. The email sender (`mail.veldportfolio.com`) is verified.

**Infrastructure needed:**
- Vercel Cron (or edge function on a schedule) to run daily
- Query: users where property count = 0 AND account age matches trigger
- New nullable JSON field on User model to track sent emails (prevents re-sends)
- Unsubscribe mechanism (link in email footer, sets a flag)

**Effort:** M (1–2 days).  
**Impact:** High — this is the only way to reach users who have left the app.

### What NOT to build yet

- Push notifications (no native app)
- In-app notification center (over-engineering for 6 users)
- Complex drip email sequences (day-3 and day-7 are sufficient to start; iterate based on open/click data)

---

## Files Analyzed

| File | Role |
|------|------|
| `app/(app)/onboarding-panel.tsx` | Welcome modal (funnel step 2) |
| `app/(app)/properties/add-property-wizard.tsx` | Full property form (funnel step 4) |
| `app/(app)/properties/new/page.tsx` | Page hosting the wizard |
| `app/(app)/dashboard/page.tsx` | Empty state after modal dismissal |
| `app/(app)/layout.tsx` | App shell — passes onboarding props |
| `app/(app)/app-layout-client.tsx` | Client shell — renders OnboardingPanel |
| `app/(app)/draft-context.tsx` | Draft save/restore context for wizard |
| `app/(app)/properties/mortgage-form-fields.tsx` | Mortgage form (Section 4 fields) |
| `app/lib/onboarding.ts` | Onboarding state model |
| `app/lib/analytics-events.ts` | Event name registry |
| `app/lib/analytics-dedup.ts` | Session/user dedup for events |
| `app/lib/validations/property.ts` | Zod schema for property creation |
| `app/prisma/schema.prisma` | Database schema (Property model) |
| `docs/reference/product-overview.md` | Product context |
| `docs/reference/valuation-brief.md` | Current user/activation state |
| `docs/plans/2026-04-04-product-gap-discovery.md` | Gap 12: address autocomplete |
