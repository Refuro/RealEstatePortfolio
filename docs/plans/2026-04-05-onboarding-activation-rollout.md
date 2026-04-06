---
title: "feat: Onboarding & first-property activation full rollout"
type: feat
status: active
date: 2026-04-05
audit: docs/audits/2026-04-05-onboarding-friction-analysis.md
---

# feat: Onboarding & first-property activation full rollout

## Overview

Zero of 6 signed-up users have added a property. This plan executes every friction fix and re-engagement mechanism identified in the onboarding friction audit. It is structured in two phases: Phase 1 is all Tier 1 improvements (copy, UX, field guidance, empty-state — no new infrastructure, executable in a single session), followed by Phase 2 (new features: address autocomplete, quick-add path, progressive save, and re-engagement emails). The two phases can be worked sequentially without interdependency conflicts except where noted.

The success metric is: at least one of the existing 6 users adds a property, and new sign-ups show a measurably shorter time-to-first-property in PostHog.

## Skills to Load Before Starting

**Load these before any implementation work begins:**

- **`veld-ui` skill** — enforces design tokens, typography levels, shadow/radius rules, component patterns, and anti-patterns. Required for all UI changes.
- **`veld-mobile` skill** — enforces touch target minimums, safe-area insets, responsive patterns, and `MobileToolShell` conventions. Required for any component that renders on mobile.

Both skills are at `.cursor/skills/veld-ui/SKILL.md` and `.cursor/skills/veld-mobile/SKILL.md`.

## Requirements Trace

- **R1.** The onboarding modal touch targets meet the 44×44px minimum on all interactive elements.
- **R2.** The onboarding modal contains no deprecated design tokens (`border-border/70`, `bg-card/95`).
- **R3.** The onboarding modal does not use `hover:-translate-y-*` on in-app action buttons.
- **R4.** The modal copy no longer claims "60 seconds" setup time.
- **R5.** The wizard nickname field is not the first field a user encounters.
- **R6.** The wizard monthly expenses field has helper text that explicitly excludes the mortgage payment.
- **R7.** The wizard cash invested field has helper text explaining what to include.
- **R8.** The wizard purchase price and date fields have helper text communicating that approximate values are acceptable.
- **R9.** The wizard review step shows a preview of computed metrics before the user submits.
- **R10.** The empty dashboard always shows a persistent activation CTA regardless of `onboardingDismissedAt` state.
- **R11.** The empty dashboard copy varies based on days since sign-up (day 0–1, day 2–6, day 7+).
- **R12.** Alternate entry paths (deal analyzer, CSV import) are visible on the empty dashboard without requiring a `<details>` expand.
- **R13.** Address entry in the wizard supports autocomplete via a proxied API route.
- **R14.** A quick-add mode exists at `/properties/new?mode=quick` that requires only address + expenses to save a property.
- **R15.** A "Save basics and finish later" path exists in the full wizard after Section 2 is complete.
- **R16.** Properties created with incomplete data surface a "Complete your property" prompt on the property detail page.
- **R17.** Users with 0 properties receive a day-3 re-engagement email via Resend.
- **R18.** Users with 0 properties receive a day-7 re-engagement email via Resend.
- **R19.** A `wizard_abandoned` analytics event fires when a user navigates away from `/properties/new` without completing the form.
- **R20.** An `estimate_value_used` and `estimate_rent_used` analytics event fires when a user clicks either estimate button.

## Scope Boundaries

- Do **NOT** remove the mortgage section — it is core to LTV, DSCR, equity, and cash flow. The mortgage section must remain as an optional/deferrable step.
- Do **NOT** change the `onboarding.ts` state model or the `onboardingDismissedAt` field — the re-engagement fix is purely additive (a new dashboard UI element), not a reset of dismissal state.
- Do **NOT** propose changes that break existing PostHog events. New events may be added; existing event names and property shapes must not change.
- Do **NOT** add property management features (tenant tracking, lease management, rent collection) as activation mechanics.
- Do **NOT** add new npm dependencies for Phase 1. Phase 2 (address autocomplete) may require a lightweight API client if not already present.
- Do **NOT** apply `cta-accent-glow` to secondary buttons — one accent glow per screen maximum.
- Do **NOT** use `uppercase tracking-wide` on any heading or label added in this plan — that pattern is reserved for sidebar group labels and table column headers per `veld-ui`.

## Context & Research

### Funnel state (as of 2026-04-05)

- 6 users signed up, 0 properties added.
- `onboardingDismissedAt` is set permanently on "Maybe later" click — no re-prompt exists.
- The wizard is a long single-page form with 5 anchored sections and 20+ fields.
- Empty dashboard renders static copy regardless of how many times the user has visited.
- No email is sent post sign-up if a user has not added a property.

### Relevant files

| File | Role |
|------|------|
| `app/app/(app)/onboarding-panel.tsx` | Welcome modal |
| `app/app/(app)/properties/add-property-wizard.tsx` | Full property wizard |
| `app/app/(app)/properties/new/page.tsx` | Page hosting the wizard |
| `app/app/(app)/dashboard/page.tsx` | Empty state and re-entry surface |
| `app/app/(app)/draft-context.tsx` | Draft save/restore, navigation guard |
| `app/app/(app)/properties/mortgage-form-fields.tsx` | Mortgage form fields (Section 4) |
| `app/lib/onboarding.ts` | Onboarding state model |
| `app/lib/analytics-events.ts` | Event name registry |
| `app/lib/analytics-dedup.ts` | Session/user dedup for events |
| `app/lib/analytics-client.ts` | Client-side event capture |
| `app/lib/validations/property.ts` | Zod schema for property creation |
| `app/prisma/schema.prisma` | Database schema |
| `app/app/api/properties/route.ts` | Property creation API |

### Prisma schema — required fields

Non-nullable, no-default fields on the `Property` model that any property creation must supply:

```
addressLine1, city, state, zipCode          — address
purchasePrice (Decimal)                     — required by schema
purchaseDate (DateTime)                     — required by schema
currentEstimatedValue (Decimal)             — required by schema
currentMonthlyRent (Decimal)               — required by schema
currentMonthlyExpenses (Decimal)           — required by schema
```

Fields with schema defaults: `propertyType` ("single_family"), `units` (1), `ownershipPercent` (100), `isRented` (true), `vacancyPercent` (5).

The quick-add path (Unit 7) must supply all required fields — purchase price and date can default to estimated value and today respectively; rent can be auto-estimated; expenses must be user-supplied (can default to 0 with a nudge).

### Metrics available with minimal input (no mortgage, no cash invested)

| Metric | Minimal | Full |
|--------|---------|------|
| Equity | Value only — meaningful | Value − debt |
| Monthly cash flow | Rent − expenses (no mortgage deducted) | Rent − expenses − mortgage − vacancy |
| Cap rate | Fully computable — NOI / value | Same |
| LTV | Not available | Debt / value |
| Cash-on-cash | Not available | Annual cash flow / cash invested |
| DSCR | Not available | NOI / annual debt service |

Three meaningful metrics are immediately available with minimal input.

### Analytics events in use (do not change)

```ts
AnalyticsEvents.ONBOARDING_STEP_COMPLETED   // "onboarding_step_completed"
AnalyticsEvents.ADD_PROPERTY_MILESTONE_REACHED  // "add_property_milestone_reached"
AnalyticsEvents.PROPERTY_CREATED            // "property_created"
```

Wizard milestone values already in use: `wizard_opened`, `section_location`, `section_economics`, `section_income`, `section_mortgage`, `section_review`.

### New analytics events to add

Add to `app/lib/analytics-events.ts`:

```ts
WIZARD_ABANDONED: "wizard_abandoned",
ESTIMATE_VALUE_USED: "estimate_value_used",
ESTIMATE_RENT_USED: "estimate_rent_used",
ADDRESS_AUTOCOMPLETE_USED: "address_autocomplete_used",
PROPERTY_QUICK_ADD_COMPLETED: "property_quick_add_completed",
PROPERTY_CREATED_PARTIAL: "property_created_partial",
ONBOARDING_EMAIL_SENT: "onboarding_email_sent",
```

## Key Technical Decisions

- **Empty dashboard re-engagement is purely a UI change** — the `onboardingDismissedAt` field is not reset. The persistent activation card on the empty dashboard is a new conditional block in `dashboard/page.tsx` keyed on `metrics.propertyCount === 0`. No server-side onboarding state changes needed.
- **Progressive copy uses `user.createdAt`** — the server component already has access to the user object (via `getAppUser()`). Compute days since signup inline; no new DB fields required.
- **Quick-add as a query param, not a new route** — `/properties/new?mode=quick` renders a condensed form within the existing `AddPropertyWizard`. This avoids duplicating the API call and validation logic. The `dealId` param already demonstrates this pattern in `new/page.tsx`.
- **Address autocomplete is a proxied API route** — the Google Places key must never be sent to the client. A Next.js API route at `app/api/places/autocomplete/route.ts` proxies requests server-side, returning only the normalized address fields needed to populate the form.
- **"Save basics and finish later" uses the same POST `/api/properties` endpoint** — no new API route is needed. The progressive save path sends default/zero values for fields the user didn't complete and marks the property with a completeness signal (inferred from `cashInvested === null && mortgage count === 0 && purchasePrice === currentEstimatedValue`).
- **Re-engagement emails are a Vercel Cron job** — Resend is already in the stack and the sender domain is verified. A daily cron queries users where `propertyCount = 0` and `createdAt` matches a 3-day or 7-day window. A new nullable `onboardingEmailsSentAt: Json?` field on the User model tracks which emails have been sent.
- **`wizard_abandoned` fires in `draft-context.tsx`** — the `beforeunload` handler already exists. Add a `captureClientEvent` call alongside the existing `e.preventDefault()`.

## Open Questions

### Resolved During Planning

- **Should `onboardingDismissedAt` be reset when a user re-engages?** No. The modal dismissal is respected. The re-engagement mechanism is the persistent dashboard card, not a modal re-prompt. This avoids the UX antipattern of overriding an explicit user choice.
- **Should the quick-add path bypass the existing Zod validation?** No. The same `createPropertySchema` is used. The quick-add path pre-fills required fields with sensible defaults so the schema is satisfied without the user providing them manually.
- **Should the day-3/day-7 emails be gated behind an explicit email opt-in?** No — these are transactional onboarding emails tied to product usage, not marketing emails. An unsubscribe link in the footer is sufficient. Track unsubscribes with a new `onboardingEmailsOptedOutAt` nullable field.
- **Does the metric preview in the review step require a server round-trip?** No. The wizard runs entirely client-side. Import `computePropertyMetrics` from `app/lib/metrics/property-metrics.ts` and compute preview metrics inline from the wizard's current `data` state.

### Deferred to Implementation

- **Exact copy for progressive empty-state messages** — the implementing agent should write these to match Veld's voice (clear, specific, not salesy) using the day-0/day-2/day-7 framework from the audit.
- **Exact copy for re-engagement email subjects and bodies** — the agent should write these as short, plain-text-first emails with a single link. No HTML templates required in v1.
- **Whether to auto-trigger "Estimate value" and "Estimate rent" after autocomplete** — recommended yes, but the agent should verify the UX doesn't feel jarring (e.g., add a 300ms delay before triggering so the user sees the address fill in first).

---

## Phase 1 — Copy, UX, and Field Guidance

*No new infrastructure. All changes are within existing files. Executable in a single session.*

---

### Unit 1: Fix onboarding modal — copy, touch targets, design system

**Goal:** Fix the "60 seconds" inaccuracy, bring both buttons to 44px touch targets, and eliminate the three design system violations (`border-border/70`, `bg-card/95`, `hover:-translate-y-px`).

**Requirements:** R1, R2, R3, R4

**Dependencies:** None.

**Files:**
- Modify: `app/app/(app)/onboarding-panel.tsx`

**Approach:**

*Copy change — line 196:*

Replace:
```tsx
<p className="mt-4 text-xs text-muted">Typical setup time: about 60 seconds.</p>
```
With:
```tsx
<p className="mt-4 text-xs text-muted">
  Takes about 5 minutes with your property details. You can start with just the basics and fill in the rest later.
</p>
```

*Touch targets — lines 205–221:*

Add `min-h-[44px]` to both button elements:
```tsx
// "Maybe later" button
className="min-h-[44px] rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-subtle disabled:opacity-60"

// "Add first property" button
className="min-h-[44px] rounded-md bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:bg-accent-hover disabled:opacity-60"
```

*Design system fixes — line 172:*

Replace:
```tsx
className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/70 bg-card/95 p-7 shadow-2xl outline-none"
```
With:
```tsx
className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-2xl outline-none"
```

Remove `hover:-translate-y-px` from the primary button (line 218). The corrected class for the primary button is `transition-all hover:bg-accent-hover` — no translate.

**Patterns to follow:**
- Touch targets: `veld-mobile` SKILL.md §Touch Targets — `min-h-[44px]` on all interactive elements visible on mobile.
- Token usage: `veld-ui` SKILL.md §Brand Tokens — `border-border` (full value), `bg-card` (full value).
- Y-translate: `veld-ui` SKILL.md §Motion Rules — `hover:-translate-y-0.5` is for marketing value prop cards only, never in-app buttons.

**Acceptance criteria:**
- [ ] "Typical setup time: about 60 seconds." does not appear anywhere in `onboarding-panel.tsx`.
- [ ] Both buttons have `min-h-[44px]` in their class list.
- [ ] `border-border/70` does not appear in `onboarding-panel.tsx`.
- [ ] `bg-card/95` does not appear in `onboarding-panel.tsx`.
- [ ] `hover:-translate-y-px` does not appear in `onboarding-panel.tsx`.
- [ ] Modal still renders correctly at 375px (verify at mobile width).
- [ ] Focus trap, Escape-key dismissal, and aria attributes are unchanged.

---

### Unit 2: Wizard field guidance — helper text and field order

**Goal:** Add helper text to monthly expenses, cash invested, purchase price, and purchase date. Move the nickname field to the end of Section 1.

**Requirements:** R5, R6, R7, R8

**Dependencies:** None.

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

*Move nickname field — `StepAddressBasics`:*

Cut the entire nickname `<div>` block (lines 137–148, the `label` + `input` for `id="nickname"`) from its current position at the top of the `space-y-4` container and paste it as the last child — after the `<PropertySquareFeetField>` component (currently line 387). The field remains optional and its label remains "Nickname (optional)".

*Monthly expenses helper text — `StepIncomeExpenses`:*

After the `<CurrencyInput id="currentMonthlyExpenses" ...>` and its error message block, add:
```tsx
<p className="mt-0.5 text-xs text-muted">
  Include insurance, property tax, HOA, repairs, and property management fees. Exclude your mortgage payment — that is tracked separately in the Mortgage section.
</p>
```

*Cash invested helper text — `StepPurchase`:*

After the `<CurrencyInput id="cashInvested" ...>` inside its `<div>`, add:
```tsx
<p className="mt-0.5 text-xs text-muted">
  Down payment + closing costs + any upfront rehab costs. Used to calculate cash-on-cash return.
</p>
```

*Purchase price helper text — `StepPurchase`:*

After the `<CurrencyInput id="purchasePrice" ...>` and its error block, add:
```tsx
<p className="mt-0.5 text-xs text-muted">
  Approximate is fine — you can update this anytime from the property page.
</p>
```

*Purchase date helper text — `StepPurchase`:*

After the `<input id="purchaseDate" ...>` and its error block, add:
```tsx
<p className="mt-0.5 text-xs text-muted">
  Approximate is fine — you can update this anytime.
</p>
```

**Patterns to follow:**
- All helper text uses `text-xs text-muted` — matches existing helpers on bedrooms, bathrooms, vacancy, and ownership fields in this file.
- No new classes introduced — pure copy additions.

**Acceptance criteria:**
- [ ] The first visible input in `StepAddressBasics` is `addressLine1`, not `nickname`.
- [ ] `StepIncomeExpenses` renders helper text below the monthly expenses input that explicitly mentions "mortgage payment" is excluded.
- [ ] `StepPurchase` renders helper text below cash invested explaining what to include.
- [ ] `StepPurchase` renders helper text below purchase price and below purchase date that each say approximate is fine.
- [ ] No existing validation logic is changed.
- [ ] No existing analytics events are changed.
- [ ] All helper text uses `text-xs text-muted` — no `uppercase`, no `tracking-wide`.

---

### Unit 3: Wizard review step — metric preview

**Goal:** Add a "Preview metrics" inset to the review step showing equity, monthly cash flow, and cap rate computed from the wizard's current data before the user submits.

**Requirements:** R9

**Dependencies:** None. The metrics engine is already available client-side.

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

At the top of the `add-property-wizard.tsx` file, add the import:
```tsx
import { computePropertyMetrics } from "@/lib/metrics/property-metrics";
import { formatCurrency } from "@/lib/format-currency";
```

(Both are likely already imported or available — check before adding.)

In `StepReview`, accept a second prop `previewMetrics` computed from the parent's wizard `data`. In the `AddPropertyWizard` component body, compute:

```tsx
const previewInput = {
  monthlyRent: parseCurrencyNum(data.currentMonthlyRent),
  monthlyExpenses: parseCurrencyNum(data.currentMonthlyExpenses),
  estimatedValue: parseCurrencyNum(data.currentEstimatedValue),
  cashInvested: data.cashInvested ? parseCurrencyNum(data.cashInvested) : null,
  totalMortgageBalance: 0, // not yet saved
  totalMonthlyPayment: 0,
  ownershipPercent: Number(data.ownershipPercent) || 100,
  vacancyPercent: Number(data.vacancyPercent) || 5,
};
const previewMetrics = computePropertyMetrics(previewInput, "proportional");
```

In `StepReview`, render a preview inset after the four review cards and before the notes field. Use the Inset surface pattern from `veld-ui`:

```tsx
<div className="rounded-lg bg-subtle/40 p-3">
  <p className="text-xs font-medium text-muted">Metrics preview</p>
  <div className="mt-2 grid grid-cols-3 gap-3 tabular-nums">
    <div>
      <p className="text-xs text-muted">Equity</p>
      <p className="text-sm font-semibold text-foreground">
        {previewMetrics.equity != null ? formatCurrency(previewMetrics.equity) : "—"}
      </p>
    </div>
    <div>
      <p className="text-xs text-muted">Monthly cash flow</p>
      <p className={`text-sm font-semibold ${(previewMetrics.monthlyCashFlow ?? 0) >= 0 ? "text-positive" : "text-negative"}`}>
        {previewMetrics.monthlyCashFlow != null ? formatCurrency(previewMetrics.monthlyCashFlow) : "—"}
      </p>
    </div>
    <div>
      <p className="text-xs text-muted">Cap rate</p>
      <p className="text-sm font-semibold text-foreground">
        {previewMetrics.capRate != null ? `${(previewMetrics.capRate * 100).toFixed(2)}%` : "—"}
      </p>
    </div>
  </div>
  <p className="mt-2 text-xs text-muted">
    Mortgage data, if added, will refine equity and cash flow after saving.
  </p>
</div>
```

**Patterns to follow:**
- Inset surface: `veld-ui` SKILL.md §Surface Hierarchy — `rounded-lg bg-subtle/40 p-3`, no shadow, no border.
- `tabular-nums` on all financial figures — required per `veld-ui` §Design Pillars.
- `text-positive` / `text-negative` only for financial gain/loss — not decoration.

**Acceptance criteria:**
- [ ] The review step shows a "Metrics preview" inset with equity, monthly cash flow, and cap rate.
- [ ] Values update when the user edits Section 2 or Section 3 data and returns to review.
- [ ] All three values show "—" when the required input is missing (e.g., no value entered for estimated value).
- [ ] Monthly cash flow value uses `text-positive` when ≥ 0 and `text-negative` when < 0.
- [ ] Financial values use `tabular-nums` in their class list.
- [ ] The inset uses `rounded-lg bg-subtle/40 p-3` — no shadow, no outer border.
- [ ] No new npm dependencies introduced.

---

### Unit 4: Analytics — wizard_abandoned event + estimate button events

**Goal:** Add the `wizard_abandoned` event to the existing `beforeunload` handler. Add `estimate_value_used` and `estimate_rent_used` events to the respective estimate button handlers.

**Requirements:** R19, R20

**Dependencies:** None.

**Files:**
- Modify: `app/lib/analytics-events.ts`
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`
- Modify: `app/app/(app)/draft-context.tsx`

**Approach:**

*Add event names to `analytics-events.ts`:*

```ts
WIZARD_ABANDONED: "wizard_abandoned",
ESTIMATE_VALUE_USED: "estimate_value_used",
ESTIMATE_RENT_USED: "estimate_rent_used",
```

*`wizard_abandoned` in `draft-context.tsx`:*

In the `beforeunload` handler (lines 272–280), add a `captureClientEvent` call immediately before `e.preventDefault()`:

```ts
import { captureClientEvent } from "@/lib/analytics-client";
import { AnalyticsEvents } from "@/lib/analytics-events";

const handler = (e: BeforeUnloadEvent) => {
  if (pathname === "/properties/new" && hasDraftRef.current) {
    captureClientEvent(AnalyticsEvents.WIZARD_ABANDONED, {
      has_draft: true,
    });
    e.preventDefault();
  }
};
```

*`estimate_value_used` in `StepPurchase.handleEstimateValue`:*

After the successful estimate branch (`if (json.value != null && Number.isFinite(json.value))`), add:
```ts
captureClientEvent(AnalyticsEvents.ESTIMATE_VALUE_USED, {
  success: true,
});
```

In the error branch, add:
```ts
captureClientEvent(AnalyticsEvents.ESTIMATE_VALUE_USED, {
  success: false,
});
```

*`estimate_rent_used` in `StepIncomeExpenses.handleEstimateRent`:*

Same pattern — `success: true` on the successful branch, `success: false` on the error branch.

**Acceptance criteria:**
- [ ] `WIZARD_ABANDONED`, `ESTIMATE_VALUE_USED`, `ESTIMATE_RENT_USED` appear in `analytics-events.ts`.
- [ ] Closing or navigating away from `/properties/new` with a draft fires `wizard_abandoned` in PostHog.
- [ ] Clicking "Estimate value" fires `estimate_value_used` with `success: true` on success and `success: false` on error.
- [ ] Clicking "Estimate rent" fires `estimate_rent_used` with `success: true` on success and `success: false` on error.
- [ ] Existing events (`add_property_milestone_reached`, `property_created`) are not changed.

---

### Unit 5: Upgrade empty dashboard empty state

**Goal:** Replace the static empty dashboard with a persistent activation card that always shows regardless of `onboardingDismissedAt` state, shows progressive copy based on account age, and exposes alternate entry paths (deal analyzer, CSV import) without requiring a `<details>` expand.

**Requirements:** R10, R11, R12

**Dependencies:** None.

**Files:**
- Modify: `app/app/(app)/dashboard/page.tsx`

**Approach:**

The `propertyCount === 0` branch (lines 97–143) currently renders a static centered card. Replace it entirely with a layout that:

1. Keeps the `<PaidIntentCheckoutBanner>` at the top.
2. Renders a prominent persistent activation card using the `border-accent/20 bg-accent/5` treatment (same pattern as the single-property upsell card already in the populated dashboard at lines 416–432).
3. Renders two visible secondary path cards below it (no `<details>`).

**Compute the copy variant server-side** using `user.createdAt` (already available from `getAppUser()`):

```tsx
const daysSinceSignup = Math.floor(
  (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
);

const emptyStateHeading =
  daysSinceSignup <= 1
    ? "Your dashboard is waiting for its first property"
    : daysSinceSignup <= 6
      ? "Still setting up? Most landlords add their first property in under 5 minutes"
      : "Your portfolio metrics are ready when you are";

const emptyStateBody =
  daysSinceSignup <= 1
    ? "Add one property and see live equity, cash flow, and cap rate — all in one place."
    : daysSinceSignup <= 6
      ? "Your dashboard will show real-time portfolio metrics the moment you add a property."
      : "Add a property to start tracking equity, cash flow, and rent benchmarks.";
```

**Render the new empty state:**

```tsx
<div className="space-y-4">
  {/* Primary activation card */}
  <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
      {emptyStateHeading}
    </h1>
    <p className="mt-2 text-sm text-muted">{emptyStateBody}</p>
    <div className="mt-5">
      <Link
        href="/properties/new"
        className="inline-flex min-h-[44px] items-center rounded-md bg-accent px-5 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover"
      >
        Add your first property
      </Link>
    </div>
  </div>

  {/* Secondary paths — always visible */}
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
    <Link
      href="/analyze"
      className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md"
    >
      <p className="text-sm font-semibold text-foreground">Analyze a deal first</p>
      <p className="text-xs text-muted">
        Run the numbers on a property before you commit. No account data needed.
      </p>
    </Link>
    <Link
      href="/settings#export"
      className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow duration-150 hover:shadow-md"
    >
      <p className="text-sm font-semibold text-foreground">Import from a spreadsheet</p>
      <p className="text-xs text-muted">
        Have your properties in CSV format? Import them all at once from Settings.
      </p>
    </Link>
  </div>
</div>
```

**Remove** the `<details>` block entirely.

**Patterns to follow:**
- Primary card: mirrors `border-accent/20 bg-accent/5 p-4 shadow-sm` upsell card at dashboard lines 416–432.
- Secondary cards: `rounded-xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-150` — standard property/deal card hover per `veld-ui`.
- CTA touch target: `min-h-[44px]` per `veld-mobile`.
- `h1` is Page-level per `veld-ui` — no card wrapper around it (the accent card wraps the whole unit, not just the heading).

**Acceptance criteria:**
- [ ] The empty dashboard shows the activation card regardless of `onboardingDismissedAt` value.
- [ ] Users who signed up within 24 hours see the day-0 heading copy.
- [ ] Users who signed up 2–6 days ago see the day-2 copy.
- [ ] Users who signed up 7+ days ago see the day-7 copy.
- [ ] "Analyze a deal" and "Import from a spreadsheet" are visible without any expand interaction.
- [ ] No `<details>` element exists in the `propertyCount === 0` branch.
- [ ] The primary CTA has `min-h-[44px]` in its class list.
- [ ] Secondary cards use `hover:shadow-md transition-shadow duration-150` — no `hover:-translate-y-*`.
- [ ] `border-accent/20 bg-accent/5` is used on the primary card — not `bg-accent` (which would be too loud for an ambient state).

---

## Phase 2 — New Features

*Requires new infrastructure. Build Phase 1 first. Units within Phase 2 should be built in order (address autocomplete before quick-add, quick-add before progressive save).*

---

### Unit 6: Address autocomplete — proxied API route + form integration

**Goal:** Replace the manual address line 1 input with an autocomplete input that populates all address fields on selection.

**Requirements:** R13

**Dependencies:** None external to Phase 2. Should be built before Unit 7 since quick-add depends on autocomplete.

**Files:**
- Create: `app/app/api/places/autocomplete/route.ts`
- Create: `app/components/property/address-autocomplete-input.tsx`
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`
- Modify: `app/lib/analytics-events.ts` (add `ADDRESS_AUTOCOMPLETE_USED`)

**Approach:**

*Proxy API route (`app/app/api/places/autocomplete/route.ts`):*

Accepts `?input=<typed string>` from the client. Calls the Google Places Autocomplete API (or Smarty) server-side with the API key from `process.env.GOOGLE_PLACES_API_KEY`. Returns a filtered response:

```ts
// GET /api/places/autocomplete?input=123+Main
// Returns: { predictions: [{ description: string, placeId: string }] }
```

A second endpoint `GET /api/places/details?placeId=<id>` returns the structured address components needed to populate the form fields:

```ts
// Returns: { addressLine1: string, city: string, state: string, zipCode: string }
```

Only return US addresses (add `components=country:US` to the Places API call). Do not return lat/lng or other unused data.

*Autocomplete input component (`app/components/property/address-autocomplete-input.tsx`):*

A controlled input that:
- Shows a dropdown of predictions as the user types (after 3+ characters).
- On selection, calls `/api/places/details?placeId=...` and invokes an `onSelect(address)` callback with the parsed address fields.
- Falls back gracefully if the API is unavailable — input remains a plain text field.
- Has a `min-h-[44px]` touch target and uses the same `inputClass` styling as other wizard inputs.
- Fires `captureClientEvent(AnalyticsEvents.ADDRESS_AUTOCOMPLETE_USED, { source: "google_places" })` on successful selection.

*Integration in `StepAddressBasics`:*

Replace the `<input id="addressLine1" ...>` with `<AddressAutocompleteInput>`. On selection, call `onChange` with all four address fields (`addressLine1`, `city`, `state`, `zipCode`) updated simultaneously.

After address auto-fill, add a 300ms delay then programmatically trigger `handleEstimateValue` (if the Section 2 component is in scope) and `handleEstimateRent` (if the Section 3 component is in scope). Since these are in sibling step components, expose them via a `ref` pattern or fire a custom event that the parent `AddPropertyWizard` can handle.

**Patterns to follow:**
- API route: same shape as `app/app/api/estimates/value/route.ts` — authenticated, validated query params, clean error responses.
- Input component: same `inputClass` and `labelClass` as other wizard inputs.

**Acceptance criteria:**
- [ ] Typing 3+ characters in the address field shows a dropdown of US address predictions.
- [ ] Selecting a prediction populates `addressLine1`, `city`, `state`, and `zipCode` simultaneously.
- [ ] After autocomplete selection, "Estimate value" and "Estimate rent" auto-trigger (with 300ms delay).
- [ ] The `ADDRESS_AUTOCOMPLETE_USED` event fires in PostHog on successful selection.
- [ ] The Google Places API key is never sent to the client — only the proxy route uses it.
- [ ] If the API is unavailable, the input degrades to a plain text field with no error state.
- [ ] The autocomplete input meets the 44px minimum touch target.
- [ ] Manual address entry still works (user can type an address that doesn't appear in predictions).
- [ ] Adding `process.env.GOOGLE_PLACES_API_KEY` to `.env.example` (without a real value) so future setup is documented.

---

### Unit 7: Quick-add mode — condensed form path

**Goal:** Build a condensed "Quick add" form at `/properties/new?mode=quick` that lets a user add a property with only an address and a monthly expenses figure, with everything else auto-filled or defaulted.

**Requirements:** R14

**Dependencies:** Unit 6 (address autocomplete must be built first — quick-add depends on it as its primary address input).

**Files:**
- Modify: `app/app/(app)/properties/new/page.tsx`
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`
- Modify: `app/lib/analytics-events.ts` (add `PROPERTY_QUICK_ADD_COMPLETED`)

**Approach:**

*`new/page.tsx`:*

Read `searchParams.mode` alongside the existing `from` (dealId) param. Pass `mode` to `AddPropertyWizard`:

```tsx
const { from: dealId, mode } = await searchParams;
// ...
<AddPropertyWizard dealId={dealId ?? undefined} quickAdd={mode === "quick"} />
```

Add a visible mode-switcher below the page title when `mode === "quick"`:

```tsx
{mode === "quick" && (
  <p className="mt-2 text-sm text-muted">
    Quick add — just the essentials.{" "}
    <Link href="/properties/new" className="font-medium text-accent hover:underline">
      Use the full form instead
    </Link>
  </p>
)}
```

*`AddPropertyWizard`:*

When `quickAdd` is `true`, render only the quick-add form instead of the 5-section wizard. The quick-add form is a single section with:

1. **Address** — `AddressAutocompleteInput` (auto-fills city/state/zip; auto-triggers value and rent estimates)
2. **Property type** — select (defaulted to single_family)
3. **Current estimated value** — pre-filled from estimate, editable
4. **Rental status + monthly rent** — isRented toggle + rent field (pre-filled from estimate if rented)
5. **Monthly expenses** — required field with helper text

On submit, send to `POST /api/properties` with:
- `purchasePrice` = `currentEstimatedValue` (user hasn't provided actual purchase price)
- `purchaseDate` = today
- `addMortgage` = false (skipped)
- All other required fields from the quick-add inputs
- `isRented` from the toggle

After a successful save, fire `captureClientEvent(AnalyticsEvents.PROPERTY_QUICK_ADD_COMPLETED, { property_id: resData.id })` in addition to the existing `PROPERTY_CREATED` event.

Route after save: `router.push("/dashboard?onboarding=first-property")` if `createdFirstProperty` is true (same as the full wizard), otherwise `router.push(`/properties/${resData.id}`)`.

**Update the onboarding modal CTA** to link to `/properties/new?mode=quick` instead of `/properties/new`:

```tsx
// onboarding-panel.tsx, line 96
router.push("/properties/new?mode=quick");
```

Update the empty dashboard CTA (Unit 5) similarly:
```tsx
href="/properties/new?mode=quick"
```

**Patterns to follow:**
- The `dealId` prefill pattern in `AddPropertyWizard` (lines 1193–1236) shows how to handle a conditional init path.
- Same `POST /api/properties` endpoint; same Zod validation.

**Acceptance criteria:**
- [ ] `/properties/new?mode=quick` renders the condensed quick-add form.
- [ ] The quick-add form has exactly 5 visible inputs: address, property type, estimated value, rent (conditional on isRented), and monthly expenses.
- [ ] Selecting an address via autocomplete auto-fills estimated value and rent.
- [ ] Submitting the quick-add form creates a property and redirects correctly.
- [ ] `PROPERTY_QUICK_ADD_COMPLETED` fires in PostHog after a successful quick-add save.
- [ ] `PROPERTY_CREATED` also fires (existing event — not replaced).
- [ ] The onboarding modal "Add first property" button links to `/properties/new?mode=quick`.
- [ ] The empty dashboard "Add your first property" CTA links to `/properties/new?mode=quick`.
- [ ] The full wizard at `/properties/new` (no mode param) is unchanged.
- [ ] A "Use the full form instead" link is visible on the quick-add page.

---

### Unit 8: Progressive save — "Save basics and finish later"

**Goal:** Let users save a partial property after completing only Section 1 (location) and Section 2 (purchase & value), with the remaining sections defaulted. Surface a "Complete your property" prompt on the property detail page for properties with incomplete data.

**Requirements:** R15, R16

**Dependencies:** Unit 7 (some UI patterns are shared with quick-add; build after Unit 7 to avoid duplication).

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`
- Modify: `app/lib/analytics-events.ts` (add `PROPERTY_CREATED_PARTIAL`)
- Modify: the property detail page component (find the file that renders the property detail overview tab)

**Approach:**

*"Save basics and finish later" button in `AddPropertyWizard`:*

After Section 2 (`section-economics`) is scrolled into view (detect via the existing IntersectionObserver milestone), show a "Save basics and finish later" secondary button near the Section 2 bottom. It does not appear until `section_economics` milestone has fired.

This button calls `handleSubmit` with a modified data object that:
- Uses `data.currentMonthlyExpenses || "0"` (defaults to zero)
- Uses `data.isRented ? data.currentMonthlyRent || "0" : "0"` (defaults to zero)
- Sets `addMortgage = false` (skips mortgage)
- Skips Section 3 and Section 4 validation entirely (call a reduced `validateStep1` + `validateStep2` only)

Fire `captureClientEvent(AnalyticsEvents.PROPERTY_CREATED_PARTIAL, { property_id: resData.id })` in addition to `PROPERTY_CREATED`.

*"Complete your property" prompt on property detail:*

Read the property's data and determine if it is "incomplete":

```ts
const isIncomplete =
  property.cashInvested == null &&
  property.mortgages.length === 0 &&
  Number(property.purchasePrice) === Number(property.currentEstimatedValue);
```

When `isIncomplete`, render an inline prompt at the top of the property detail overview tab using the Inset pattern:

```tsx
<div className="rounded-lg bg-subtle/40 p-4">
  <p className="text-sm font-semibold text-foreground">
    Complete your property details for more accurate metrics
  </p>
  <p className="mt-1 text-xs text-muted">
    Add purchase history and mortgage data to unlock LTV, cash-on-cash return, and DSCR.
  </p>
  <Link
    href={`/properties/${property.id}/edit`}
    className="mt-3 inline-flex min-h-[44px] items-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-subtle"
  >
    Complete details
  </Link>
</div>
```

**Patterns to follow:**
- Inset surface: `rounded-lg bg-subtle/40 p-4` — no shadow, no outer border.
- Secondary CTA: `border border-border bg-transparent ... transition-colors hover:bg-subtle` — not `bg-accent`.

**Acceptance criteria:**
- [ ] After the Section 2 milestone fires, a "Save basics and finish later" button is visible in the wizard.
- [ ] Clicking it validates only Sections 1 and 2, then submits with default zeros for income/expenses and no mortgage.
- [ ] `PROPERTY_CREATED_PARTIAL` fires in PostHog after a partial save.
- [ ] `PROPERTY_CREATED` also fires.
- [ ] Properties created via partial save (where `purchasePrice === currentEstimatedValue && cashInvested === null && mortgages.length === 0`) show the "Complete your property" prompt on the property detail page.
- [ ] The prompt renders using the Inset surface pattern — no shadow, no outer border.
- [ ] The "Complete details" CTA meets the 44px touch target minimum.
- [ ] The "Complete your property" prompt disappears after the user edits the property and adds mortgage or cash invested data.

---

### Unit 9: Re-engagement emails — day-3 and day-7 Resend sends

**Goal:** Automatically send re-engagement emails to users with 0 properties at day 3 and day 7 post sign-up.

**Requirements:** R17, R18

**Dependencies:** None within Phase 2. Can be built in parallel with Units 6–8.

**Files:**
- Create: `app/app/api/cron/onboarding-emails/route.ts`
- Create: `vercel.json` (or modify if it exists) — add cron schedule
- Modify: `app/prisma/schema.prisma` — add `onboardingEmailsSentAt` and `onboardingEmailsOptedOutAt` fields to User model
- Create: `app/lib/emails/onboarding-reengagement.ts` — email content and Resend call
- Modify: `app/lib/analytics-events.ts` (add `ONBOARDING_EMAIL_SENT`)

**Approach:**

*Prisma schema change (`app/prisma/schema.prisma`):*

On the `User` model, add two nullable fields:

```prisma
onboardingEmailsSentAt   Json?     // { day3: ISOString | null, day7: ISOString | null }
onboardingEmailsOptedOutAt DateTime? // null = subscribed, date = unsubscribed
```

Create and apply the migration. No impact on existing user records — nullable fields with no default.

*Email content (`app/lib/emails/onboarding-reengagement.ts`):*

Two email variants:

```ts
export const day3Email = {
  subject: "Your Veld dashboard is ready",
  text: `
You signed up for Veld Portfolio but haven't added a property yet.

Add one in under 5 minutes and start tracking equity, cash flow, and cap rate:
https://veldportfolio.com/properties/new?mode=quick

—
Veld Portfolio
Unsubscribe: https://veldportfolio.com/api/unsubscribe?token={token}
  `.trim(),
};

export const day7Email = {
  subject: "Still tracking properties in a spreadsheet?",
  text: `
You're one property away from seeing your real estate portfolio in real time.

Add your first property:
https://veldportfolio.com/properties/new?mode=quick

—
Veld Portfolio
Unsubscribe: https://veldportfolio.com/api/unsubscribe?token={token}
  `.trim(),
};
```

Plain text first. No HTML template in v1 — Resend renders plain text well.

*Cron route (`app/app/api/cron/onboarding-emails/route.ts`):*

```ts
// GET — called by Vercel Cron daily
// 1. Query users where propertyCount = 0 AND onboardingEmailsOptedOutAt IS NULL
// 2. For each user, check createdAt age:
//    - If age is 3 days ± 1 day AND onboardingEmailsSentAt.day3 IS NULL: send day3 email, update field
//    - If age is 7 days ± 1 day AND onboardingEmailsSentAt.day7 IS NULL: send day7 email, update field
// 3. Fire ONBOARDING_EMAIL_SENT server-side PostHog event per send
// 4. Return { sent: N }
```

Secure the route with a `CRON_SECRET` header check — Vercel Cron supports `Authorization: Bearer {CRON_SECRET}` header verification.

*Unsubscribe route (`app/app/api/unsubscribe/route.ts`):*

Accepts a signed token (HMAC of userId + secret). Sets `onboardingEmailsOptedOutAt` on the user record. Returns a plain confirmation page.

*Vercel Cron config (`vercel.json`):*

```json
{
  "crons": [
    {
      "path": "/api/cron/onboarding-emails",
      "schedule": "0 14 * * *"
    }
  ]
}
```

Runs at 14:00 UTC daily. Add `CRON_SECRET` to `.env.example` and Vercel environment variables.

**Acceptance criteria:**
- [ ] A user with 0 properties and `createdAt` 3 days ago receives the day-3 email exactly once.
- [ ] A user with 0 properties and `createdAt` 7 days ago receives the day-7 email exactly once.
- [ ] A user who adds a property before the email sends does not receive the email (property count query excludes them).
- [ ] A user who clicks the unsubscribe link sets `onboardingEmailsOptedOutAt` and receives no further onboarding emails.
- [ ] `ONBOARDING_EMAIL_SENT` fires in PostHog (server-side) for each email sent.
- [ ] The cron route returns `401` for requests without a valid `CRON_SECRET` header.
- [ ] `onboardingEmailsSentAt` and `onboardingEmailsOptedOutAt` are added to the Prisma schema with a new migration.
- [ ] The migration is additive — existing user records are unaffected (nullable fields with no default).
- [ ] `CRON_SECRET` and `GOOGLE_PLACES_API_KEY` are added to `.env.example` (without values).

---

### Unit 10: Test files for new API routes

**Goal:** Write test files for every new API route introduced in Phase 2, matching the project's established `route.test.ts` pattern. No existing tests need to be changed — this unit is purely additive.

**Requirements:** Ensures Phase 2 routes have the same test coverage as every other API route in the codebase.

**Dependencies:** Units 6 and 9 must be complete — tests are written against the implemented route handlers.

**Files:**
- Create: `app/app/api/places/autocomplete/route.test.ts`
- Create: `app/app/api/places/details/route.test.ts`
- Create: `app/app/api/cron/onboarding-emails/route.test.ts`
- Create: `app/app/api/unsubscribe/route.test.ts`

**Reference pattern for all test files:**
- `app/app/api/properties/route.test.ts` — mock setup, `vi.hoisted`, `vi.mock("@/lib/db")`, `vi.mock("@/lib/auth")`, `beforeEach` with `vi.clearAllMocks()`
- `app/lib/test/api-route-mocks.ts` — import `mockActiveUser` and `mockFreeTierUser` for authenticated routes

---

**`app/api/places/autocomplete/route.test.ts`**

Mock `@/lib/auth` and any fetch call to the Google Places upstream. Test scenarios:

- Returns `401` when `getActiveAppUser()` returns null.
- Returns `400` when `input` query param is missing or fewer than 3 characters.
- Returns `200` with `{ predictions: [...] }` when upstream returns valid data.
- Returns `200` with `{ predictions: [] }` when upstream returns no results (not a 500).
- Returns `200` with `{ predictions: [] }` when the upstream fetch throws (graceful degradation — input should remain usable).

---

**`app/api/places/details/route.test.ts`**

Mock `@/lib/auth` and the upstream fetch. Test scenarios:

- Returns `401` when unauthenticated.
- Returns `400` when `placeId` query param is missing.
- Returns `200` with `{ addressLine1, city, state, zipCode }` when upstream returns a valid place.
- Returns `400` when upstream returns a place that cannot be parsed into a US address (missing city or state component).

---

**`app/api/cron/onboarding-emails/route.test.ts`**

Mock `@/lib/db` (prisma), Resend, and PostHog capture. Do not use `mockActiveUser` — the cron route is not user-authenticated. Test scenarios:

- Returns `401` when the `Authorization` header is missing.
- Returns `401` when the `Authorization` header does not match `Bearer {CRON_SECRET}`.
- Returns `200` with `{ sent: 0 }` when there are no eligible users.
- Sends day-3 email to a user whose `createdAt` is exactly 3 days ago with 0 properties and `onboardingEmailsSentAt.day3 === null`. Verifies `onboardingEmailsSentAt` is updated on the user record after send.
- Sends day-7 email to a user whose `createdAt` is exactly 7 days ago with 0 properties and `onboardingEmailsSentAt.day7 === null`.
- Does **not** send to a user who has `onboardingEmailsOptedOutAt` set.
- Does **not** send to a user who already has `onboardingEmailsSentAt.day3` set (idempotency — cron can run multiple times safely).
- Does **not** send to a user with 1 or more properties (they are already activated).
- Each successful send fires `ONBOARDING_EMAIL_SENT` via the PostHog server-side capture mock.

---

**`app/api/unsubscribe/route.test.ts`**

Mock `@/lib/db`. No auth mock needed — this route is public. Test scenarios:

- Returns `400` when the `token` query param is missing.
- Returns `400` when the token does not match the expected HMAC for any user.
- Returns `200` and sets `onboardingEmailsOptedOutAt` on the user record when the token is valid.
- Returns `200` (idempotent) when called a second time for a user who is already opted out — does not error.

---

**Approach:**

Follow the exact mock setup pattern from `app/app/api/properties/route.test.ts`:

```ts
const { prismaMock } = vi.hoisted(() => {
  const prismaMock = {
    user: {
      findMany: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  };
  return { prismaMock };
});

vi.mock("@/lib/db", () => ({ prisma: prismaMock }));
```

For the cron and unsubscribe routes, mock Resend's `emails.send` method:

```ts
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: "mock-email-id" }) },
  })),
}));
```

For the Places routes, mock the global `fetch`:

```ts
vi.stubGlobal("fetch", vi.fn());
// In each test: (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(...)
```

**Acceptance criteria:**
- [ ] All four test files exist and pass `vitest run` with no failures.
- [ ] Each file follows the `vi.hoisted` + `vi.mock` pattern from `app/app/api/properties/route.test.ts`.
- [ ] The autocomplete route tests cover graceful degradation (upstream failure returns empty predictions, not a 500).
- [ ] The cron route tests cover idempotency (running the cron twice does not double-send).
- [ ] The cron route tests verify that users with ≥ 1 property are excluded.
- [ ] The unsubscribe route tests verify idempotency (double opt-out does not error).
- [ ] No existing test files are modified.
- [ ] `vitest run` passes for the full test suite after all Phase 2 units are complete.

---

## System-Wide Impact

- **Activation path changes:** The onboarding modal primary CTA and the empty dashboard primary CTA now both link to `/properties/new?mode=quick` instead of `/properties/new`. The full wizard remains accessible from `/properties` → "Add property" nav link and the "Use the full form instead" link on the quick-add page.
- **No changes to `onboarding.ts` or `onboardingDismissedAt` behavior** — the modal dismissal logic is intentionally preserved. The new empty dashboard card is orthogonal to modal state.
- **Existing `PROPERTY_CREATED` event is unchanged** — both quick-add and partial-save paths fire it. New events (`PROPERTY_QUICK_ADD_COMPLETED`, `PROPERTY_CREATED_PARTIAL`) are additive.
- **Prisma migration required** for Unit 9 only — two nullable fields on User model. No data migration required.
- **Error propagation:** The cron route failure should be silent (log to Sentry, do not re-throw in a way that disrupts other cron jobs). Each email send is independent — a Resend failure for one user should not block sends for others.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Google Places API key cost — Places Autocomplete is billed per request | Implement a 300ms debounce on the autocomplete input; only fire after 3+ characters. Monitor usage in Google Cloud Console. Expected cost: < $1/month at current scale. |
| `computePropertyMetrics` in the review step may return unexpected values for edge case inputs | Wrap in a try/catch; on error, show "—" for all preview metrics. The preview is informational only — it does not affect submission. |
| Day-3/day-7 email ± 1 day window may send twice if cron runs at an unusual time | Use the `onboardingEmailsSentAt` guard (check that `day3` or `day7` key is null before sending) — this is idempotent regardless of how many times the cron runs. |
| The quick-add path sets `purchasePrice = currentEstimatedValue` — users who later run cash-on-cash metrics will see inflated returns if they never update | Surfaced clearly in the "Complete your property" prompt. No calculation is done that would display an incorrect cash-on-cash before the user provides `cashInvested`. |
| Unsubscribe token must be signed to prevent enumeration attacks | Use `crypto.createHmac("sha256", process.env.UNSUBSCRIBE_SECRET).update(userId).digest("hex")` — verify on the unsubscribe route. Add `UNSUBSCRIBE_SECRET` to `.env.example`. |

## Documentation / Operational Notes

- No database migrations required for Phases 1. Phase 2 Unit 9 requires one migration (`onboardingEmailsSentAt`, `onboardingEmailsOptedOutAt` on User). Run `prisma migrate dev` locally and `prisma migrate deploy` on Vercel.
- New environment variables required: `GOOGLE_PLACES_API_KEY`, `CRON_SECRET`, `UNSUBSCRIBE_SECRET`. Add all to `.env.example` and the Vercel project's environment variables before deploying Phase 2.
- After Phase 1 deploys: verify in PostHog that `wizard_abandoned`, `estimate_value_used`, and `estimate_rent_used` events are appearing. Set up a funnel in PostHog: `welcome_modal_viewed` → `welcome_add_first_property` or `welcome_maybe_later` → `wizard_opened` → `section_economics` → `section_income` → `section_mortgage` → `section_review` → `property_created`.
- After Phase 2 Unit 9 deploys: monitor the cron log in Vercel for successful runs. Check that `onboardingEmailsSentAt` is being populated on the user records. Verify Resend delivery reports for the first batch.

## Roadmap: Future Email Re-engagement Expansion

The current cron email system (day-3 and day-7) only targets users who have **zero properties**. After the completeness system overhaul (2026-04-06), there is a larger cohort of users who quick-added a property but never completed the details (purchase price still matches estimate, no mortgage status confirmed, no cash invested). These users only see in-app nudges, which require them to return on their own.

**Planned expansion (not yet scheduled):**

1. **Day-2 incomplete-property email** — Send to users who have 1+ properties but a completeness score below the threshold (60). Copy: "Your property profile is almost complete. Add your purchase price and mortgage status to unlock full portfolio metrics." CTA: link to `/properties/{id}/edit`.
2. **Day-5 incomplete-property email** — Second nudge for users who received the day-2 email but still haven't completed. Copy: "You're one field away from seeing your real cap rate." CTA: link to the specific missing section.
3. **Query change** — The cron would need a second candidate query: users WITH properties, where the property's completeness score is below threshold. This requires either computing completeness in SQL or fetching property data alongside the user.
4. **Sentinel expansion** — `onboardingEmailsSentAt` would need additional keys (e.g., `incomplete_day2`, `incomplete_day5`) to track the new variants independently.
5. **Opt-out scope** — Consider whether `onboardingEmailsOptedOutAt` should cover all onboarding emails or if incomplete-property emails need a separate opt-out.

This expansion would close the gap between "signed up but didn't add a property" (current system) and "added a property but didn't complete it" (in-app nudges only today).

---

## Sources & References

- Audit: `docs/audits/2026-04-05-onboarding-friction-analysis.md` — full friction analysis and findings
- Governance: `.cursor/skills/veld-ui/SKILL.md` — design tokens, typography, motion, component patterns
- Governance: `.cursor/skills/veld-mobile/SKILL.md` — touch targets, safe-area, responsive patterns
- Source files: all files listed in §Context & Research
- Product context: `docs/reference/product-overview.md`
- Gap reference: `docs/plans/2026-04-04-product-gap-discovery.md` — Gap 12 (address autocomplete)
- Metrics engine: `app/lib/metrics/property-metrics.ts` — `computePropertyMetrics` (used in Unit 3)
- Validation schema: `app/lib/validations/property.ts` — `createPropertySchema` (unchanged by this plan)
