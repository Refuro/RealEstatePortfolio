---
title: "refactor: Multi-step wizard for add-property flow"
type: refactor
status: active
date: 2026-04-05
predecessor: docs/plans/2026-04-05-onboarding-activation-rollout.md
audit: docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md
research: docs/research/2026-04-05-onboarding-form-ux-wizard-vs-scroll.md
---

# refactor: Multi-step wizard for add-property flow

## Overview

This plan restructures the add-property form (`add-property-wizard.tsx`) from a single-page scroll layout with 5 sections into a 4-step wizard with discrete step navigation, per-step validation, and step-transition RentCast calls. The research synthesis found that multi-step wizards produce 86% higher conversion rates than single-page scroll forms for complex forms (HubSpot), with mobile completion specifically seeing a ~180% lift (15–25% → 45–65%). The existing form has 20+ fields across 5 scroll sections; 0 of 6 signed-up users have completed it.

The 4-step structure collapses the existing 5 sections into: **Property** (address + basics), **Finances** (purchase, value, ownership, mortgage toggle + inline fields), **Income** (rent, expenses, vacancy), and **Review** (read-only summary with metrics preview and submit). The mortgage section is not removed — it moves inline into Step 2 behind the existing toggle, eliminating a separate scroll section that required a mandatory Yes/No selection before the user could proceed.

**What is NOT changing:** The quick-add mode (`?mode=quick`) is untouched. The `onboarding.ts` state model is untouched. Existing analytics event names and property shapes are unchanged. No npm dependencies are added. The `DraftProvider` and `useDraft` hook architecture is preserved and extended. The Prisma schema and `POST /api/properties` endpoint are unchanged.

## Skills to Load Before Starting

- **`veld-ui`** — `.cursor/skills/veld-ui/SKILL.md` — design tokens, surface hierarchy, motion rules, anti-patterns.
- **`veld-mobile`** — `.cursor/skills/veld-mobile/SKILL.md` — touch targets (44×44px min), safe-area insets, `MobileToolShell` conventions.

## Requirements Trace

- **R1.** `currentStep` is a number (1–4) stored in the `AddPropertyWizard` component state alongside `WizardData` and persisted into the draft localStorage payload under a `currentStep` key.
- **R2.** Moving backward from any step to a prior step never clears or resets data entered on any step. The single `WizardData` object is the source of truth; steps are views over it, not owners of state.
- **R3.** The "Next" button on Step 1 validates only: `addressLine1` (non-empty), `city` (non-empty), `state` (valid US state), and `zipCode` (non-empty). Units are validated if property type is multi-family/apartment.
- **R4.** The "Next" button on Step 2 validates only: `purchasePrice` (valid non-negative number), `purchaseDate` (non-empty), and `currentEstimatedValue` (valid non-negative number). If `addMortgage === true`, mortgage fields are validated via `createMortgageSchema`.
- **R5.** Step 3 has no required fields gating the "Next" button. Validation runs but only blocks on malformed input (negative expenses, vacancy > 100). Missing rent or expenses are permitted.
- **R6.** Step 4 is submit-only — clicking "Create property" runs `runAllValidations` across all steps before submission.
- **R7.** RentCast value estimate fires automatically when the user transitions from Step 1 → Step 2, if address is complete. It does NOT fire if `lastValueEstimate` already matches the current address (existing deduplication logic preserved).
- **R8.** RentCast rent estimate fires automatically when the user enters Step 3, if address is complete. It does NOT fire if `lastRentEstimate` already matches the current address.
- **R9.** The `ADDRESS_AUTOFILLED_EVENT` window event pattern is removed from the full wizard path. Step-transition effects replace it. The quick-add path retains its own `runQuickAutofillEstimates` function unchanged.
- **R10.** When the value estimate fires on Step 1→2 transition, the response is extended to include `bedrooms`, `bathrooms`, and `squareFootage` from the raw RentCast AVM response. These are pre-filled into the Step 1 fields as editable suggestions (only if the field is currently empty).
- **R11.** The `fetchValueEstimate` return type in `rentcast.ts` is extended to `{ value: number; bedrooms?: number; bathrooms?: number; squareFootage?: number }`. The `/api/estimates/value` route response is extended to include these optional fields.
- **R12.** A labeled step indicator ("Property → Finances → Income → Review") renders at the top of the wizard form. Completed steps show a checkmark icon and are clickable (navigates back to that step). The current step is highlighted with `bg-accent text-accent-foreground`. Future steps are muted and non-interactive.
- **R13.** Each step indicator tab meets the 44×44px minimum touch target on mobile (`min-h-[44px] min-w-[44px]`).
- **R14.** The step indicator uses only design system tokens: `text-accent`, `bg-accent`, `text-muted`, `bg-subtle`, `border-border`. No custom colors. No `uppercase tracking-wide` on step labels. No `hover:-translate-y-*`.
- **R15.** The existing `IntersectionObserver` milestone pattern is replaced with step-entry analytics. `wizard_opened` still fires on mount. New milestone values `step_2_entered`, `step_3_entered`, `step_4_entered` fire on step transitions. Existing milestone names (`section_location`, `section_economics`, `section_income`, `section_mortgage`, `section_review`) are not removed from the analytics event registry but no longer fire in the refactored wizard.
- **R16.** The `?mode=quick` path is not refactored. The `quickAdd` early return in `AddPropertyWizard` remains as-is, rendering the condensed single-section form.
- **R17.** The draft localStorage payload (`add-property-wizard-draft`) includes a `currentStep` number field. On restore, the user lands on the step stored in the draft.
- **R18.** The `DraftPayload` type in `draft-context.tsx` is extended to include `currentStep?: number` alongside the existing `data` and `savedAt` fields.
- **R19.** On mobile, the step progress indicator is rendered inside the `MobileToolShell` header area via the `context` prop slot. It is not a floating overlay. It is not a sticky sub-header that would overlap the `MobileToolShell` chrome.
- **R20.** Clicking "Edit" on a Review step card sets a `returnToReview: boolean` flag in state, navigates to the target step, and after the user clicks "Next" on that step, returns directly to Step 4 (Review) instead of advancing to the next sequential step.
- **R21.** The `returnToReview` flag is cleared when the user manually navigates to a step other than via the Review "Edit" link.
- **R22.** The mortgage section remains intact inside Step 2 with the existing `addMortgage` toggle. It is NOT removed.
- **R23.** The `onboarding.ts` state model is NOT modified.
- **R24.** Existing analytics event names in `analytics-events.ts` are NOT renamed or removed.
- **R25.** The step indicator uses a numbered-circle-plus-label pattern per step, connected by horizontal separator lines between circles. The circle shows the step number in `tabular-nums` or a `Check` icon when completed. No `uppercase tracking-wide` on any step label.
- **R26.** Step content mounts with a `motion-safe:` fade + subtle upward entrance using CSS `@starting-style` at 200ms duration with `--ease-out` easing. Reduced-motion users see instant step change with no animation.
- **R27.** Step 2 visually separates the purchase/value field group from the mortgage toggle + fields group using an Inset surface (`rounded-lg bg-subtle/40 p-4`) around the mortgage section, with a group label in `text-xs font-medium text-muted` (no uppercase).
- **R28.** Step 3 visually separates the rental-status + rent group from the expenses + vacancy group with a `border-t border-border` horizontal divider and `mt-6 pt-6` spacing.
- **R29.** While a RentCast estimate API call is in flight, the target value field displays an inline skeleton placeholder (`h-4 w-24 animate-pulse rounded-md bg-subtle`) overlaying the input area. The estimate button retains its "Estimating…" label alongside the skeleton.
- **R30.** Any `<input>` or `<select>` field that has a validation error receives `ring-1 ring-negative/50 border-negative` on the element itself, in addition to the existing `text-negative` error message below the field.
- **R31.** Review step summary cards use a Lucide icon prefix on each card header for scannability. Card headers use `text-sm font-semibold text-foreground` (not `text-muted`). Vertical spacing between cards is `space-y-3`. Currency values in `<dd>` elements render with `tabular-nums`.
- **R32.** On Step 3, the "Estimate rent" button is disabled with `opacity-50 cursor-not-allowed` and a helper message ("Complete the address in Step 1 to enable rent estimates") when address fields are incomplete.
- **R33.** The "Save basics and finish later" button in Step 2 uses `text-muted` label color, `transition-colors duration-150 hover:text-foreground` interaction, is separated from the form fields above by a `border-t border-border` divider, and includes a helper caption explaining its scope.

## Scope Boundaries

- Do **NOT** refactor the quick-add mode (`?mode=quick`). It remains as a single-section form.
- Do **NOT** change `onboarding.ts` or `onboardingDismissedAt` behavior.
- Do **NOT** rename or remove existing analytics event names.
- Do **NOT** add npm dependencies without explicit justification.
- Do **NOT** use `uppercase tracking-wide` on step labels (L4 typography is reserved for sidebar group labels and table column headers).
- Do **NOT** apply `hover:-translate-y-*` on step navigation buttons (reserved for marketing value prop cards only).
- Do **NOT** remove the mortgage section — it moves inline into Step 2, not out of the wizard.
- Do **NOT** change the `POST /api/properties` endpoint or the Prisma schema.
- Do **NOT** change the onboarding modal (`onboarding-panel.tsx`), the empty dashboard (`dashboard/page.tsx`), or the re-engagement email infrastructure — those are completed units from the predecessor rollout plan.
- Do **NOT** break the `DraftProvider` / `useDraft` architecture — extend it additively.

## Key Technical Decisions

### Step state shape

`currentStep` is a number (1–4) held in the `AddPropertyWizard` component via `useState<number>(1)`. It is passed to `draft.saveDraft()` alongside the existing `WizardData` by extending `DraftPayload` to `{ data: WizardData; savedAt: string; currentStep?: number }`. On restore, if `currentStep` is present in the loaded draft, `setCurrentStep(draft.currentStep)` is called alongside `setData(...)`.

The step number is NOT part of `WizardData` itself — it is orthogonal state that controls which view is rendered. `WizardData` remains the single source of truth for all field values.

### Back navigation safety

Back navigation is inherently safe because there is a single `WizardData` state object that all steps read from and write to via `onChange`. Moving from Step 3 back to Step 2 simply changes which step component is rendered — the data object is unchanged. Moving forward from Step 2 to Step 3 and back to Step 2 renders `StepPurchase` with the same `data` it last modified. No data is cleared on step transitions. This is the existing `onChange` pattern, unchanged.

### RentCast call timing

- **Value estimate (Step 1→2 transition):** When the user clicks "Next" on Step 1 and validation passes, `handleEstimateValue()` is called before `setCurrentStep(2)`. If `lastValueEstimate` already matches the current address, the call is skipped (existing dedup logic). The value estimate call also extracts `bedrooms`, `bathrooms`, and `squareFootage` from the response and pre-fills those Step 1 fields if they are currently empty.
- **Rent estimate (Step 3 entry):** A `useEffect` fires when `currentStep` transitions to 3. It calls `handleEstimateRent()` if address is complete and `lastRentEstimate` doesn't match the current address.
- **The `ADDRESS_AUTOFILLED_EVENT` window event listeners in `StepPurchase` and `StepIncomeExpenses`** are removed. The quick-add path retains its own `runQuickAutofillEstimates` inline logic.

### RentCast property data backfill

The RentCast AVM `/v1/avm/value` endpoint returns a JSON object that includes `bedrooms`, `bathrooms`, and `squareFootage` fields alongside `value`. Currently, `fetchValueEstimate` in `rentcast.ts` extracts only `value`. The plan extends it:

1. `ValueEstimateResult` type changes to `{ value: number; bedrooms?: number; bathrooms?: number; squareFootage?: number }`.
2. `fetchValueEstimate` extracts these three fields from the raw response: `data.bedrooms` (number), `data.bathrooms` (number), `data.squareFootage` (number). Each is included in the return only if it is a finite positive number.
3. The `/api/estimates/value` route response changes from `{ value: number }` to `{ value: number; bedrooms?: number; bathrooms?: number; squareFootage?: number }`.
4. The wizard's Step 1→2 transition handler reads these fields from the API response and calls `setData(prev => ({ ...prev, bedrooms: prev.bedrooms || String(json.bedrooms), ... }))` — only filling in empty fields, never overwriting user input.

### Progress indicator

A `WizardStepNav` component renders 4 labeled tabs in a horizontal row. Structure per tab:

```tsx
<button
  type="button"
  disabled={step > currentStep && step !== currentStep + 1}
  onClick={() => canNavigate(step) && goToStep(step)}
  className={`min-h-[44px] min-w-[44px] flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150 ${classes}`}
>
  {isCompleted && <Check className="size-4" aria-hidden />}
  {label}
</button>
```

Class logic:
- **Current step:** `bg-accent text-accent-foreground`
- **Completed step (clickable):** `text-accent hover:bg-subtle cursor-pointer`
- **Future step (disabled):** `text-muted cursor-default opacity-60`

On desktop, the tabs render inside the existing sticky `<nav>` at the top of the form, replacing the current "Jump to" anchor link list.

On mobile, the tabs render inside `MobileToolShell` via the `context` prop — a horizontally scrollable row below the title and above the form content. This is the same slot used by other tool pages for contextual controls (e.g., mode switchers). It does not overlap content or float.

### Review step Edit links

Each Review card "Edit" link calls `goToStep(n, { returnToReview: true })`. This sets `returnToReview: true` in state. When the user clicks "Next" on the target step, the `handleNext` function checks `returnToReview` — if true, it sets `currentStep = 4` and clears the flag, instead of advancing to `currentStep + 1`. If the user manually clicks a step tab or the "Back" button, `returnToReview` is cleared.

### Mobile shell integration

The wizard currently does NOT use `MobileToolShell`. The refactored wizard adds an `isMobile` early return using `useIsMobile()`:

```tsx
if (isMobile) {
  return (
    <MobileToolShell
      eyebrow="Add Property"
      title={STEP_LABELS[currentStep - 1]}
      context={<WizardStepNav ... />}
      footer={<StepFooter ... />}
    >
      {stepContent}
    </MobileToolShell>
  );
}
```

The footer contains Back/Next/Submit buttons with safe-area bottom padding handled by `MobileToolShell`. The step indicator is in the `context` slot.

---

## Implementation Units

### Unit 1: Scaffold step state and step rendering

**Goal:** Add `currentStep` state, render only the active step's fields, and wire Next/Back buttons. No visual progress indicator yet.

**Requirements:** R1, R2, R16

**Dependencies:** None.

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

1. Add state: `const [currentStep, setCurrentStep] = useState(1);`
2. Add state: `const [returnToReview, setReturnToReview] = useState(false);`
3. Define `STEP_LABELS = ["Property", "Finances", "Income", "Review"] as const;`
4. Restructure the form body. Replace the 5 `<section>` blocks with a conditional renderer:
   - `currentStep === 1` → render `StepAddressBasics` (existing Section 1 content).
   - `currentStep === 2` → render `StepPurchase` + `StepMortgage` inline (existing Sections 2 + 4 merged). The `StepMortgage` component renders below `StepPurchase` within the same step container, preserving the `addMortgage` toggle and conditional mortgage fields.
   - `currentStep === 3` → render `StepIncomeExpenses` (existing Section 3 content).
   - `currentStep === 4` → render `StepReview` + notes textarea (existing Section 5 content).
5. Add a `handleNext()` function:
   - Validates the current step using the appropriate validator (`validateStep1`, `validateStep2` + optionally `validateStep4` for mortgage, `validateStep3`).
   - If validation passes and `returnToReview` is true, set `currentStep = 4` and clear `returnToReview`.
   - If validation passes and `returnToReview` is false, set `currentStep = currentStep + 1`.
   - If validation fails, set errors and do not advance.
6. Add a `handleBack()` function: `setCurrentStep(prev => Math.max(1, prev - 1)); setReturnToReview(false);`
7. Add a `goToStep(step: number, opts?: { returnToReview?: boolean })` function:
   - Only allows navigation to completed steps (step < currentStep) or the next step.
   - Sets `returnToReview` from opts if provided, clears it otherwise.
8. Render Back/Next buttons at the bottom of the form:
   - Step 1: only "Next".
   - Steps 2–3: "Back" + "Next".
   - Step 4: "Back" + "Create property".
9. The `handleSubmit()` function on Step 4 calls `runAllValidations(data)` before submitting, same as today. If validation fails, `setCurrentStep` to the step containing the first error.
10. Remove the `ADD_SECTION_NAV` anchor link `<nav>` from the full wizard path. Remove the `<section id="section-*">` wrapper divs (they are no longer needed for scroll targeting). Keep the heading text content for each step.
11. The "Save basics and finish later" button moves into Step 2 (since Section 2 content is now in Step 2). The `sectionEconomicsReached` state is no longer needed — the button is always visible in Step 2.
12. The `quickAdd` early return is untouched — it continues to render the condensed single-section form.

**Validation mapping for `handleNext`:**
- Step 1: `validateStep1(data)`
- Step 2: `validateStep2(data)` merged with `validateStep4(data)` (mortgage validation is now part of Step 2)
- Step 3: `validateStep3(data)`
- Step 4: `runAllValidations(data)` (full validation before submit)

**Acceptance criteria:**
- [ ] `AddPropertyWizard` renders only one step's fields at a time, controlled by `currentStep`.
- [ ] Clicking "Next" on Step 1 runs `validateStep1`; errors prevent advancement.
- [ ] Clicking "Next" on Step 2 runs `validateStep2` + `validateStep4` (if `addMortgage === true`); errors prevent advancement.
- [ ] Clicking "Next" on Step 3 runs `validateStep3`; only malformed input blocks advancement.
- [ ] Clicking "Back" on any step decrements `currentStep` without clearing `WizardData`.
- [ ] After navigating Step 1 → Step 2 → Step 3 → Back → Back, all Step 1 and Step 2 fields retain their values.
- [ ] The mortgage toggle and fields render inside Step 2, below the purchase/value fields.
- [ ] The "Save basics and finish later" button renders in Step 2.
- [ ] The quick-add mode (`?mode=quick`) renders unchanged.
- [ ] The `handleSubmit` on Step 4 calls `runAllValidations` and scrolls to the first error step if validation fails.

---

### Unit 2: Progress indicator component

**Goal:** Build the `WizardStepNav` component and integrate it into the form header.

**Requirements:** R12, R13, R14

**Dependencies:** Unit 1 (step state must exist).

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx` (add `WizardStepNav` inline or as a local component)

**Approach:**

1. Create a `WizardStepNav` component accepting `currentStep`, `onGoToStep`, and `completedSteps` (derived from `currentStep` — steps 1 through `currentStep - 1` are completed).
2. Render 4 buttons in a horizontal `flex` container with `gap-1` on mobile and `gap-2` on desktop.
3. Each button:
   - Shows a `Check` icon (from `lucide-react`) when the step is completed.
   - Shows the step label text: "Property", "Finances", "Income", "Review".
   - Uses `min-h-[44px] min-w-[44px]` for touch target compliance.
   - Current step: `bg-accent text-accent-foreground rounded-md`.
   - Completed step: `text-accent hover:bg-subtle rounded-md transition-colors duration-150 cursor-pointer`.
   - Future step: `text-muted rounded-md cursor-default opacity-60`, `disabled`.
   - No `uppercase`, no `tracking-wide`, no `hover:-translate-y-*`.
4. On desktop: render `WizardStepNav` inside the existing sticky `<nav>` area at the top of the form panel, replacing the "Jump to" anchor links.
5. On mobile: pass `WizardStepNav` via the `context` prop of `MobileToolShell` (Unit 9 handles the full mobile shell integration; for now, render it in the same position for both).
6. Completed step clicks call `goToStep(step)`. Future step clicks are disabled.

**Acceptance criteria:**
- [ ] A 4-tab progress indicator renders at the top of the wizard form.
- [ ] The current step tab has `bg-accent text-accent-foreground`.
- [ ] Completed step tabs show a `Check` icon and are clickable.
- [ ] Future step tabs are muted (`text-muted opacity-60`) and disabled.
- [ ] No tab uses `uppercase tracking-wide`.
- [ ] No tab uses `hover:-translate-y-*`.
- [ ] Every tab has `min-h-[44px]` and `min-w-[44px]` in its class list.
- [ ] Clicking a completed step tab navigates to that step without clearing data.
- [ ] The "Jump to" anchor link nav is removed from the full wizard.

---

### Unit 3: Per-step validation

**Goal:** Wire per-step validation into the `handleNext` flow so each "Next" click validates only the current step's required fields.

**Requirements:** R3, R4, R5, R6

**Dependencies:** Unit 1 (step state and `handleNext` must exist).

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

1. `handleNext` calls the correct validator based on `currentStep`:
   - Step 1: `validateStep1(data)` — requires `addressLine1`, `city`, `state` (valid US state), `zipCode`. Multi-family/apartment additionally validates `units`.
   - Step 2: `validateStep2(data)` — requires `purchasePrice` (non-negative number), `purchaseDate` (non-empty), `currentEstimatedValue` (non-negative number). If `addMortgage === true`, also runs `validateStep4(data)` for mortgage fields.
   - Step 3: `validateStep3(data)` — no hard requirements. Only blocks on malformed input: negative expenses, vacancy > 100. If `isRented` is true, validates rent format but does not require a specific value.
2. On validation failure, `setErrors(stepErrors)` and do not advance. Errors display inline within the current step's fields (existing error rendering is preserved).
3. On validation success, `setErrors({})` and advance to the next step (or return to Review if `returnToReview` is true).
4. The `handleSubmit` on Step 4 still calls `runAllValidations` as a final gate. If any step has errors, `setCurrentStep` to the step containing the first error and show the errors.

**Acceptance criteria:**
- [ ] Clicking "Next" on Step 1 with an empty address shows an error on `addressLine1` and does not advance.
- [ ] Clicking "Next" on Step 1 with a valid address but empty city shows an error on `city` and does not advance.
- [ ] Clicking "Next" on Step 2 with an empty purchase price shows an error on `purchasePrice` and does not advance.
- [ ] Clicking "Next" on Step 2 with `addMortgage === true` and an empty `currentBalance` shows a mortgage validation error.
- [ ] Clicking "Next" on Step 3 with no data entered advances to Step 4 (no required fields gate Step 3).
- [ ] Clicking "Next" on Step 3 with vacancy set to 200 shows a validation error and does not advance.
- [ ] Clicking "Create property" on Step 4 with missing required fields across any step navigates to the first step with errors and shows them.
- [ ] Errors are cleared when the user successfully advances past a step.

---

### Unit 4: Step-transition RentCast calls

**Goal:** Replace the `ADDRESS_AUTOFILLED_EVENT` window event pattern with step-transition effects for RentCast calls.

**Requirements:** R7, R8, R9

**Dependencies:** Unit 1 (step state), Unit 3 (validation on Next).

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

1. **Value estimate on Step 1→2 transition:** In `handleNext`, after Step 1 validation passes, call `handleEstimateValue()` before advancing. Wrap in a try/catch so a failed estimate does not block step advancement. The call is skipped if `lastValueEstimate` is non-empty and `parseCurrencyNum(data.currentEstimatedValue) === parseCurrencyNum(data.lastValueEstimate)`.
2. **Rent estimate on Step 3 entry:** Add a `useEffect` that watches `currentStep`. When `currentStep` transitions to 3, call `handleEstimateRent()` if address is complete and `lastRentEstimate` doesn't match. Use a ref to track the previous step to avoid firing on mount or unrelated re-renders.
3. **Remove `ADDRESS_AUTOFILLED_EVENT` listeners** from `StepPurchase` and `StepIncomeExpenses`. Remove the `useEffect` blocks at lines 478–484 and 706–712 in the current file that listen for this event. Remove the `window.dispatchEvent(new CustomEvent(ADDRESS_AUTOFILLED_EVENT))` call from `handleAddressAutofill` in the non-quick-add branch.
4. **Keep `ADDRESS_AUTOFILLED_EVENT` const** in the file — it is still referenced by the quick-add path's `handleAddressAutofill` (which fires `runQuickAutofillEstimates` directly and does not use the window event). Actually, the quick-add path does not use the event either — it calls `runQuickAutofillEstimates` directly. The const and the event are fully unused after this change and can be removed.
5. The `handleEstimateValue` and `handleEstimateRent` functions are lifted from `StepPurchase` and `StepIncomeExpenses` into the parent `AddPropertyWizard` component so they can be called from step transition logic. The loading and error states for each remain, passed as props to the step components.

**Acceptance criteria:**
- [ ] Navigating from Step 1 to Step 2 triggers a value estimate API call (visible in network tab) if address is complete and no matching estimate exists.
- [ ] Navigating from Step 1 to Step 2 does NOT trigger a value estimate if `lastValueEstimate` matches the current estimated value.
- [ ] Entering Step 3 triggers a rent estimate API call if address is complete and no matching estimate exists.
- [ ] Entering Step 3 does NOT trigger a rent estimate if `lastRentEstimate` matches the current rent.
- [ ] The `ADDRESS_AUTOFILLED_EVENT` window event is no longer dispatched or listened for in the full wizard path.
- [ ] The quick-add path continues to work with its own `runQuickAutofillEstimates` function.
- [ ] A failed RentCast call on step transition does not block the user from advancing to the next step.

---

### Unit 5: RentCast property data backfill

**Goal:** Extract `bedrooms`, `bathrooms`, and `squareFootage` from the RentCast value estimate response and pre-fill them on Step 1 fields.

**Requirements:** R10, R11

**Dependencies:** Unit 4 (step-transition RentCast calls must be wired).

**Files:**
- Modify: `app/lib/integrations/rentcast.ts`
- Modify: `app/app/api/estimates/value/route.ts`
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

1. **`rentcast.ts` — extend `ValueEstimateResult`:**
   ```ts
   export type ValueEstimateResult = {
     value: number;
     bedrooms?: number;
     bathrooms?: number;
     squareFootage?: number;
   };
   ```
   In `fetchValueEstimate`, after extracting `value`, also extract:
   ```ts
   const bedrooms = typeof data.bedrooms === "number" && Number.isFinite(data.bedrooms) && data.bedrooms >= 1
     ? data.bedrooms : undefined;
   const bathrooms = typeof data.bathrooms === "number" && Number.isFinite(data.bathrooms) && data.bathrooms >= 0.5
     ? data.bathrooms : undefined;
   const squareFootage = typeof data.squareFootage === "number" && Number.isFinite(data.squareFootage) && data.squareFootage >= 100
     ? Math.round(data.squareFootage) : undefined;
   return { value, bedrooms, bathrooms, squareFootage };
   ```

2. **`/api/estimates/value/route.ts` — extend response:**
   Change line 95 from:
   ```ts
   return NextResponse.json({ value: result.value });
   ```
   To:
   ```ts
   return NextResponse.json({
     value: result.value,
     ...(result.bedrooms != null && { bedrooms: result.bedrooms }),
     ...(result.bathrooms != null && { bathrooms: result.bathrooms }),
     ...(result.squareFootage != null && { squareFootage: result.squareFootage }),
   });
   ```

3. **Wizard — consume in step transition handler:**
   The `handleEstimateValue` function already parses the JSON response. Extend the response type:
   ```ts
   const json = (await res.json()) as {
     value?: number;
     bedrooms?: number;
     bathrooms?: number;
     squareFootage?: number;
     error?: string;
   };
   ```
   After setting `currentEstimatedValue` and `lastValueEstimate`, also set:
   ```ts
   setData(prev => ({
     ...prev,
     currentEstimatedValue: val,
     lastValueEstimate: val,
     bedrooms: prev.bedrooms || (json.bedrooms != null ? String(json.bedrooms) : prev.bedrooms),
     bathrooms: prev.bathrooms || (json.bathrooms != null ? String(json.bathrooms) : prev.bathrooms),
     squareFeet: prev.squareFeet || (json.squareFootage != null ? String(json.squareFootage) : prev.squareFeet),
   }));
   ```
   The `||` check means: only pre-fill if the user has NOT already entered a value. User input is never overwritten.

**Acceptance criteria:**
- [ ] `ValueEstimateResult` in `rentcast.ts` includes optional `bedrooms`, `bathrooms`, `squareFootage` fields.
- [ ] The `/api/estimates/value` response JSON includes `bedrooms`, `bathrooms`, and `squareFootage` when the RentCast API returns them.
- [ ] After the Step 1→2 transition value estimate, if the user left bedrooms empty and the API returned `bedrooms: 3`, the bedrooms field on Step 1 now shows "3".
- [ ] If the user already entered "4" for bedrooms before the estimate, the field remains "4" — not overwritten.
- [ ] If the RentCast API does not return `bedrooms` (null/undefined), the field is not modified.
- [ ] The `squareFeet` field is pre-filled from `squareFootage` using the same empty-check logic.
- [ ] No existing tests for the value estimate route break (the response is a superset of the previous shape).

---

### Unit 6: Analytics migration

**Goal:** Replace IntersectionObserver milestone tracking with step-entry events.

**Requirements:** R15, R24

**Dependencies:** Unit 1 (step state).

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

1. **Remove the `IntersectionObserver` `useEffect`** (lines 1630–1656 in current file). This effect set up observers on `section-*` DOM elements. Those elements no longer exist in the step wizard.
2. **Remove the `ADD_PROPERTY_SECTION_MILESTONES` constant** — no longer needed.
3. **Keep the `ADD_SECTION_NAV` constant only if quick-add references it** — verify. It is not referenced by quick-add; remove it.
4. **Keep the `wizard_opened` milestone** — the `useEffect` at lines 1621–1628 that fires `ADD_PROPERTY_MILESTONE_REACHED` with `milestone: "wizard_opened"` on mount is unchanged.
5. **Add step-entry milestones:** In the `handleNext` function, after successfully advancing `currentStep`, fire:
   ```ts
   const milestoneMap: Record<number, string> = {
     2: "step_2_entered",
     3: "step_3_entered",
     4: "step_4_entered",
   };
   const milestone = milestoneMap[nextStep];
   if (milestone) {
     const key = addPropertyMilestoneKey(milestone);
     if (!hasFiredSession(key)) {
       markFiredSession(key);
       captureClientEvent(AnalyticsEvents.ADD_PROPERTY_MILESTONE_REACHED, { milestone });
     }
   }
   ```
6. Also fire step milestones when navigating via the step indicator (so "Edit" from Review → step entry also fires).
7. The `sectionEconomicsReached` state variable is no longer needed (it was used to conditionally show the "Save basics and finish later" button based on IntersectionObserver). Remove it.

**Acceptance criteria:**
- [ ] The `IntersectionObserver` `useEffect` no longer exists in `add-property-wizard.tsx`.
- [ ] `wizard_opened` still fires once per session on wizard mount.
- [ ] `step_2_entered` fires when the user first enters Step 2 in a session.
- [ ] `step_3_entered` fires when the user first enters Step 3 in a session.
- [ ] `step_4_entered` fires when the user first enters Step 4 in a session.
- [ ] Each step milestone fires at most once per session (dedup via `hasFiredSession`).
- [ ] Existing event name `ADD_PROPERTY_MILESTONE_REACHED` is used (not renamed).
- [ ] Existing event names in `analytics-events.ts` are not removed or renamed.
- [ ] No `sectionEconomicsReached` state variable exists.

---

### Unit 7: Draft persistence with step

**Goal:** Extend draft save/restore to include `currentStep` so users resume on the correct step.

**Requirements:** R17, R18

**Dependencies:** Unit 1 (step state).

**Files:**
- Modify: `app/app/(app)/draft-context.tsx`
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

1. **`draft-context.tsx` — extend `DraftPayload`:**
   ```ts
   export type DraftPayload = {
     data: WizardData;
     savedAt: string;
     currentStep?: number;
   };
   ```
   The `currentStep` field is optional for backward compatibility with drafts saved before this change.

2. **`draft-context.tsx` — extend `saveDraft`:**
   The `saveDraft` function currently accepts `(data: WizardData)`. Change its signature to `(data: WizardData, currentStep?: number)`:
   ```ts
   const saveDraft = useCallback((data: WizardData, currentStep?: number) => {
     const payload: DraftPayload = {
       data,
       savedAt: new Date().toISOString(),
       ...(currentStep != null && { currentStep }),
     };
     saveDraftToStorage(payload);
     // ...existing code...
   }, []);
   ```
   Update the `DraftContextValue` type to match.

3. **`draft-context.tsx` — extend `handleLeaveModalAction`:**
   The "Save draft and continue" action now also saves `currentStep`. The `wizardGetDataRef` pattern needs extending to also return `currentStep`. Add a `wizardGetStepRef` alongside `wizardGetDataRef`, or change `wizardGetDataRef` to return `{ data: WizardData; currentStep: number }`.

4. **`add-property-wizard.tsx` — pass `currentStep` to `saveDraft`:**
   In the `registerWizardGetData` callback, include `currentStep` in the returned object. Alternatively, register a separate `registerWizardGetStep` callback.

5. **`add-property-wizard.tsx` — restore `currentStep`:**
   In the `useEffect` that restores draft data (lines 1378–1389), after `setData(...)`, also `setCurrentStep(draft.draftData.currentStep ?? 1)`.

6. **`draft-context.tsx` — `loadDraft` already handles unknown fields** via `JSON.parse` — the `currentStep` field will survive round-tripping without code changes in `loadDraft`. The restore modal will show it if present.

**Acceptance criteria:**
- [ ] The `DraftPayload` type in `draft-context.tsx` includes `currentStep?: number`.
- [ ] When the user navigates away from the wizard with a draft, the saved draft localStorage JSON includes a `currentStep` field matching the step they were on.
- [ ] When the user returns to `/properties/new` and chooses "Continue from draft", they land on the step stored in the draft.
- [ ] Drafts saved before this change (without `currentStep`) still restore correctly — the user lands on Step 1.
- [ ] The leave modal "Save draft and continue" action saves the current step number.
- [ ] Reading `localStorage.getItem("add-property-wizard-draft")` and parsing the JSON shows a `currentStep` number field.

---

### Unit 8: Review step Edit links with returnToReview

**Goal:** Wire the Review step "Edit" links to navigate to the target step and return to Review after the user clicks "Next".

**Requirements:** R20, R21

**Dependencies:** Unit 1 (step state and `goToStep`).

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

1. **Replace anchor links with step navigation:**
   In `StepReview`, the current "Edit" links are `<a href="#section-location">`. Replace them with buttons that call a callback prop:
   ```tsx
   <button
     type="button"
     onClick={() => onEditStep(1)}
     className="text-sm font-medium text-accent hover:underline"
   >
     Edit
   </button>
   ```
   Add an `onEditStep: (step: number) => void` prop to `StepReview`.

2. **Step-to-review-card mapping:**
   - "Address & basics" card → `onEditStep(1)` (Step 1: Property)
   - "Purchase" card → `onEditStep(2)` (Step 2: Finances)
   - "Income & expenses" card → `onEditStep(2)` ... actually income is Step 3. Let me map correctly:
   - "Address & basics" → Step 1
   - "Purchase" → Step 2
   - "Income & expenses" → Step 3
   - "Mortgage" → Step 2 (mortgage is now in Step 2)

3. **`goToStep` sets `returnToReview`:**
   ```ts
   function goToStep(step: number, opts?: { returnToReview?: boolean }) {
     if (step >= 1 && step <= 4 && step <= highestReachedStep) {
       setCurrentStep(step);
       setReturnToReview(opts?.returnToReview ?? false);
     }
   }
   ```

4. **`handleNext` checks `returnToReview`:**
   After validation passes:
   ```ts
   if (returnToReview) {
     setCurrentStep(4);
     setReturnToReview(false);
   } else {
     setCurrentStep(prev => prev + 1);
   }
   ```

5. **`handleBack` clears `returnToReview`:**
   ```ts
   function handleBack() {
     setCurrentStep(prev => Math.max(1, prev - 1));
     setReturnToReview(false);
   }
   ```

6. **Step indicator clicks clear `returnToReview`:**
   When the user clicks a step tab in `WizardStepNav`, `returnToReview` is set to false.

**Acceptance criteria:**
- [ ] Clicking "Edit" on the "Address & basics" review card navigates to Step 1.
- [ ] After editing Step 1 fields and clicking "Next", the user returns to Step 4 (Review) — not Step 2.
- [ ] Clicking "Edit" on the "Purchase" review card navigates to Step 2. "Next" returns to Step 4.
- [ ] Clicking "Edit" on the "Income & expenses" review card navigates to Step 3. "Next" returns to Step 4.
- [ ] Clicking "Edit" on the "Mortgage" review card navigates to Step 2. "Next" returns to Step 4.
- [ ] If the user clicks "Back" instead of "Next" after an Edit, `returnToReview` is cleared and normal sequential navigation resumes.
- [ ] If the user clicks a step tab instead of "Next" after an Edit, `returnToReview` is cleared.

---

### Unit 9: Mobile shell integration and audit

**Goal:** Wrap the step wizard in `MobileToolShell` on mobile, position the step indicator in the `context` slot, and verify all touch targets.

**Requirements:** R13, R19

**Dependencies:** Unit 1, Unit 2 (step state and progress indicator).

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`

**Approach:**

1. Import `useIsMobile` from `@/lib/use-is-mobile`.
2. Import `MobileToolShell` from `@/components/mobile-tool-shell`.
3. In the full wizard (non-quick-add) render path, add an `isMobile` early return:
   ```tsx
   const isMobile = useIsMobile();
   if (isMobile) {
     return (
       <MobileToolShell
         eyebrow="Add Property"
         title={STEP_LABELS[currentStep - 1]}
         context={
           <WizardStepNav
             currentStep={currentStep}
             onGoToStep={goToStep}
           />
         }
         footer={
           <div className="flex items-center justify-between gap-3">
             {currentStep > 1 && (
               <button type="button" onClick={handleBack}
                 className="min-h-[44px] rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-subtle">
                 Back
               </button>
             )}
             <div className="ml-auto">
               {currentStep < 4 ? (
                 <button type="button" onClick={handleNext}
                   className="min-h-[44px] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover">
                   Next
                 </button>
               ) : (
                 <button type="submit" disabled={submitting}
                   className="min-h-[44px] rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all duration-150 hover:bg-accent-hover disabled:opacity-50">
                   {submitting ? "Creating…" : "Create property"}
                 </button>
               )}
             </div>
           </div>
         }
       >
         <form onSubmit={handleFormSubmit}>
           {error && <div className="mb-4 rounded-md px-4 py-2 text-sm text-negative">{error}</div>}
           {renderCurrentStep()}
         </form>
       </MobileToolShell>
     );
   }
   ```
4. The `WizardStepNav` in the `context` slot renders as a horizontally scrollable row. Add `overflow-x-auto` on the container. Each tab label may truncate on very small screens — use `whitespace-nowrap`.
5. **Touch target audit:** Verify every interactive element in the wizard has `min-h-[44px]`:
   - Step nav tabs: already `min-h-[44px] min-w-[44px]` from Unit 2.
   - Back/Next/Submit buttons: `min-h-[44px]` in the footer.
   - "Save basics and finish later" button: already has `min-h-[44px]`.
   - "Yes, add mortgage" / "No, skip" buttons: already have `min-h-[48px]`.
   - Rental status toggle buttons: in the quick-add path they have `min-h-[44px]`; verify the full wizard `StepIncomeExpenses` toggles also have it. Current code shows `px-3 py-1.5` — add `min-h-[44px]`.
   - "Estimate value" / "Estimate rent" buttons: add `min-h-[44px]` if missing.
6. The `MobileToolShell` handles safe-area bottom padding in its footer. No additional safe-area padding needed.

**Acceptance criteria:**
- [ ] On mobile (< 768px), the wizard renders inside `MobileToolShell`.
- [ ] The step indicator renders in the `MobileToolShell` `context` slot, below the title and above the form content.
- [ ] The step indicator is not a floating overlay and does not overlap form content.
- [ ] Back/Next buttons render in the `MobileToolShell` footer.
- [ ] Every interactive element in the mobile wizard has `min-h-[44px]`.
- [ ] The "Yes, rented" / "No, not rented" toggle buttons in `StepIncomeExpenses` have `min-h-[44px]`.
- [ ] The "Estimate value" and "Estimate rent" buttons have `min-h-[44px]`.
- [ ] The `isMobile` early return is gated with `useIsMobile()` from `@/lib/use-is-mobile`.
- [ ] SSR renders the desktop path first (per `useIsMobile` convention — `getServerSnapshot: () => false`).

---

### Unit 10: Test updates

**Goal:** Update or add tests to cover the new step wizard behavior.

**Requirements:** Ensures the refactored wizard has test coverage for critical paths.

**Dependencies:** All prior units complete.

**Files:**
- Modify or create: test file(s) for `add-property-wizard.tsx` (find existing test file pattern)
- Modify: any existing test that asserts on the wizard's DOM structure (section IDs, scroll behavior)

**Approach:**

1. **Identify existing wizard tests:** Search for test files related to `add-property-wizard`. If none exist, create `app/app/(app)/properties/add-property-wizard.test.tsx`.
2. **Test scenarios:**
   - **Forward navigation:** Render wizard → fill address fields → click "Next" → verify Step 2 content renders.
   - **Back navigation with data preservation:** Fill Step 1 → Next → fill Step 2 → Next → Back → verify Step 2 fields retain values → Back → verify Step 1 fields retain values.
   - **Per-step validation:** Attempt "Next" on Step 1 with empty address → verify error message renders and step does not advance.
   - **RentCast deduplication:** Mock `/api/estimates/value` → fill address → Next (triggers estimate) → Back to Step 1 → Next again → verify no second API call (dedup).
   - **Draft restore on correct step:** Save a draft with `currentStep: 3` → restore → verify Step 3 content renders.
   - **Review Edit round-trip:** Navigate to Step 4 → click "Edit" on address card → verify Step 1 renders → click "Next" → verify Step 4 renders (not Step 2).
   - **Quick-add unaffected:** Render with `quickAdd={true}` → verify the condensed form renders, not the step wizard.
3. **Mock setup:** Follow the project's `vi.hoisted` + `vi.mock` pattern. Mock `useDraft`, `useRouter`, `fetch`, and `useIsMobile` as needed.

**Acceptance criteria:**
- [ ] Test file(s) exist and pass `vitest run` with no failures.
- [ ] Forward navigation test passes: Step 1 → Step 2 renders correct content.
- [ ] Back navigation test passes: data is preserved across back/forward transitions.
- [ ] Per-step validation test passes: errors block advancement.
- [ ] RentCast deduplication test passes: estimate is not called twice for the same address.
- [ ] Draft restore test passes: user lands on the saved step.
- [ ] Review Edit round-trip test passes: "Next" after Edit returns to Review.
- [ ] Quick-add test passes: `quickAdd={true}` renders the condensed form.
- [ ] No existing passing tests are broken.

---

### Unit 11: Visual polish and animation

**Goal:** Bring the multi-step wizard to a high-quality visual standard by refining the step indicator into a numbered-circle stepper with connecting lines, adding step transition animation, visually grouping related form fields within steps, polishing RentCast loading states with skeleton placeholders, tightening input error styling, elevating the review step into a confirmation moment, specifying edge-case placeholder treatments, and finalizing the "Save basics" button weight.

**Requirements:** R25, R26, R27, R28, R29, R30, R31, R32, R33

**Dependencies:** Units 1, 2, 3, 4, 8, 9 (step structure, indicator, validation, RentCast calls, review edit links, and mobile shell must all exist).

**Files:**
- Modify: `app/app/(app)/properties/add-property-wizard.tsx`
- Modify: `app/app/globals.css`

**Approach:**

#### 11-A. Step indicator visual design (R25)

Replace the basic button row from Unit 2 with a numbered-circle stepper connected by horizontal lines. The pattern: `[●1 Property] ── [●2 Finances] ── [●3 Income] ── [●4 Review]`.

**Container:**
```tsx
<nav aria-label="Wizard progress" className="flex items-center">
  {STEP_LABELS.map((label, i) => {
    const step = i + 1;
    const isCompleted = step < currentStep;
    const isCurrent = step === currentStep;
    const isNavigable = step <= highestReachedStep;
    return (
      <Fragment key={step}>
        {i > 0 && (
          <div
            className={`mx-1 h-px flex-1 sm:mx-1.5 md:mx-2 ${
              i < currentStep ? "bg-accent/30" : "bg-border"
            }`}
            aria-hidden
          />
        )}
        <button
          type="button"
          disabled={!isNavigable || isCurrent}
          onClick={() => isNavigable && goToStep(step)}
          className={`flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors duration-150 ${
            isNavigable && !isCurrent
              ? "cursor-pointer hover:bg-subtle"
              : "cursor-default"
          }`}
          aria-current={isCurrent ? "step" : undefined}
        >
          <span className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums ${circleClasses}`}>
            {isCompleted ? <Check className="size-3.5" aria-hidden /> : step}
          </span>
          <span className={`hidden whitespace-nowrap sm:inline ${labelClasses}`}>
            {label}
          </span>
        </button>
      </Fragment>
    );
  })}
</nav>
```

**Circle class logic:**
- Current step: `bg-accent text-accent-foreground`
- Completed step: `bg-accent/10 text-accent`
- Future step: `bg-subtle text-muted`

**Label class logic:**
- Current step: `text-foreground`
- Completed step: `text-accent`
- Future step: `text-muted opacity-60`

**Connecting line logic (the `<div>` separator between each pair of circles):**
- Segment before step `i`: if `i < currentStep` (the preceding step is completed) → `bg-accent/30`
- Otherwise → `bg-border`

**Mobile behavior:** Labels are hidden via `hidden sm:inline` below 640px. Only numbered circles and connecting lines render on phones. At 375px, 4 circles at 44px each + 3 flex-1 lines fit comfortably within the `MobileToolShell` context slot. On tablets (640–768px, still in MobileToolShell), labels show.

**Desktop behavior:** Full labels visible. The nav replaces the "Jump to" anchor links at the top of the form panel.

**Constraints enforced:** No `uppercase`, no `tracking-wide`, no `hover:-translate-y-*`. Touch targets met via `min-h-[44px] min-w-[44px]`. All colors from design system tokens.

#### 11-B. Step transition animation (R26)

Add a CSS utility class `wizard-step-enter` to `globals.css`:

```css
@media (prefers-reduced-motion: no-preference) {
  .wizard-step-enter {
    transition: opacity 200ms var(--ease-out), transform 200ms var(--ease-out);
    transition-behavior: allow-discrete;
  }
  @starting-style {
    .wizard-step-enter {
      opacity: 0;
      transform: translateY(6px);
    }
  }
}
```

**Duration rationale:** 200ms matches the tab indicator duration from the design spec motion table (Section 10.1). The `--ease-out` token (`cubic-bezier(0.16, 1, 0.3, 1)`) is already defined in `:root` in `globals.css`.

**Integration:** Wrap the step content renderer in a keyed `<div>`:

```tsx
<div key={currentStep} className="wizard-step-enter">
  {renderCurrentStep()}
</div>
```

The `key={currentStep}` forces React to unmount/remount when the step changes, which triggers the `@starting-style` initial state on the fresh DOM node. This is the same mechanism as `hero-animate` and `reveal-up` but with shorter duration appropriate for in-app micro-interaction.

**Reduced-motion:** The entire block is inside `@media (prefers-reduced-motion: no-preference)`. Users with `prefers-reduced-motion: reduce` see an instant step switch with no animation — no fallback CSS required.

#### 11-C. Field visual grouping — Step 2 (R27)

Step 2 renders purchase/value fields at the top and the mortgage toggle + fields below. Wrap the mortgage section in an Inset surface to visually separate the two groups.

**Structure after refactor:**

```tsx
{/* Purchase & value fields — default flow, no wrapper */}
<div className="space-y-4">
  {/* purchasePrice, purchaseDate, currentEstimatedValue, cashInvested, ownershipPercent */}
</div>

{/* Mortgage group — Inset surface */}
<div className="mt-6 rounded-lg bg-subtle/40 p-4">
  <p className="mb-3 text-xs font-medium text-muted">Mortgage</p>
  <StepMortgage data={data} onChange={onChange} errors={errors} />
</div>
```

**Inside StepMortgage**, the existing mortgage detail wrapper (`rounded-md border border-border bg-subtle/50 p-4` at line 939) changes to `mt-4 space-y-4` — removing its border and background since it is already inside the Inset. This avoids visual nesting (Inset-inside-Inset looks like Panel-inside-Panel). The mortgage form fields render directly inside the Inset.

**"Save basics and finish later" button** renders below the Inset, separated by a `border-t` divider (see 11-H).

#### 11-D. Field visual grouping — Step 3 (R28)

Step 3 currently renders all fields in a flat `space-y-4` list. Add a visual divider between the income group and the expenses group.

**Structure after refactor:**

```tsx
<div className="space-y-4">
  {/* Income group */}
  <RentCastQuotaHint refreshKey={rentCastQuotaTick} />
  <div className="rounded-lg border border-border bg-subtle/20 p-3">
    {/* Rental status toggle: "Is this property currently rented?" */}
  </div>
  {/* Rent field(s) + estimate button */}

  {/* Divider */}
  <div className="border-t border-border mt-2 pt-2" />

  {/* Expenses group */}
  <div>
    {/* currentMonthlyExpenses */}
  </div>
  <div>
    {/* vacancyPercent */}
  </div>
</div>
```

The rental status toggle stays in its existing `rounded-lg border border-border bg-subtle/20 p-3` wrapper (this is a legitimate field-level container, not a Panel). The rent field(s) follow directly below. The `border-t` divider creates a clear visual break before the expenses section without adding card weight. The `mt-2 pt-2` spacing is tighter than a section break but enough to signal a new field group.

#### 11-E. RentCast loading state polish (R29)

Replace the plain "Estimating…" text on the estimate buttons with inline skeleton placeholders on the target value fields while API calls are in flight.

**Value estimate field (Step 2, `currentEstimatedValue`):**

```tsx
<div className="relative min-w-0 flex-1">
  <CurrencyInput
    id="currentEstimatedValue"
    value={data.currentEstimatedValue}
    onChange={(v) => update("currentEstimatedValue", v)}
    required
    className={fieldClass("currentEstimatedValue", errors)}
  />
  {valueEstimateLoading && (
    <div className="pointer-events-none absolute inset-x-0 top-1 bottom-0 mt-px flex items-center rounded-md bg-background px-3">
      <div className="h-4 w-24 animate-pulse rounded-md bg-subtle" />
    </div>
  )}
</div>
```

The skeleton is absolutely positioned over the input, using `pointer-events-none` so it doesn't intercept focus. `bg-background` matches the input background. The `h-4 w-24 animate-pulse rounded-md bg-subtle` pattern matches the design spec's inline skeleton standard (Section 12.1, Pattern A).

The estimate button retains its text label change:
```tsx
{valueEstimateLoading ? "Estimating…" : "Estimate value"}
```

**Rent estimate field (Step 3, `currentMonthlyRent` / unit rents):**

Same pattern on the single-unit `CurrencyInput`:
```tsx
<div className="relative min-w-0 flex-1">
  <CurrencyInput
    id="currentMonthlyRent"
    ...
    className={fieldClass("currentMonthlyRent", errors)}
  />
  {estimateLoading && (
    <div className="pointer-events-none absolute inset-x-0 top-1 bottom-0 mt-px flex items-center rounded-md bg-background px-3">
      <div className="h-4 w-20 animate-pulse rounded-md bg-subtle" />
    </div>
  )}
</div>
```

For multi-unit rent fields, the skeleton overlays the first unit rent input only (the remaining units fill simultaneously, so one skeleton communicates the loading state).

#### 11-F. Input error state (R30)

Add a helper function at module scope:

```ts
const inputErrorClass = "ring-1 ring-negative/50 border-negative";

function fieldClass(fieldName: string, errors: Record<string, string>): string {
  return errors[fieldName] ? `${inputClass} ${inputErrorClass}` : inputClass;
}
```

Replace every `className={inputClass}` on fields that have error handling with `className={fieldClass("fieldName", errors)}`. The affected fields and their keys:

| Step | Field | Error key |
|------|-------|-----------|
| 1 | `addressLine1` | `addressLine1` |
| 1 | `city` | `city` |
| 1 | `state` | `state` |
| 1 | `zipCode` | `zipCode` |
| 1 | `units` | `units` |
| 2 | `purchasePrice` | `purchasePrice` |
| 2 | `purchaseDate` | `purchaseDate` |
| 2 | `currentEstimatedValue` | `currentEstimatedValue` |
| 2 | `ownershipPercent` | `ownershipPercent` |
| 3 | `currentMonthlyRent` | `currentMonthlyRent` |
| 3 | `currentMonthlyExpenses` | `currentMonthlyExpenses` |
| 3 | `vacancyPercent` | `vacancyPercent` |

The `CurrencyInput` component accepts a `className` prop — pass `fieldClass(...)` instead of `inputClass`. For `AddressAutocompleteInput`, same approach.

The error ring + border appear immediately when validation fails and clear when the user successfully advances past the step (when `setErrors({})` runs on validation success).

#### 11-G. Review step visual design (R31)

Transform the review step from a plain form summary into a confirmation moment.

**1. Add a confirmation heading above the cards:**

```tsx
<div className="mb-4">
  <p className="text-base font-semibold text-foreground">Everything looks good?</p>
  <p className="mt-1 text-sm text-muted">Review your property details, then create.</p>
</div>
```

**2. Add icon prefixes to card headers:**

Import `MapPin`, `DollarSign`, `TrendingUp`, `Landmark` from `lucide-react`.

Replace each card header row:

```tsx
{/* Before */}
<h3 className="text-sm font-semibold text-muted">Address & basics</h3>

{/* After */}
<div className="flex items-center gap-2">
  <MapPin className="size-4 text-muted" aria-hidden />
  <h3 className="text-sm font-semibold text-foreground">Address & basics</h3>
</div>
```

Icon mapping:
- Address & basics → `MapPin`
- Purchase → `DollarSign`
- Income & expenses → `TrendingUp`
- Mortgage → `Landmark`

Card header text changes from `text-sm font-semibold text-muted` to `text-sm font-semibold text-foreground`. The icon in `text-muted` provides the visual hierarchy that the muted header text previously conveyed — but the foreground text makes the review step feel more assertive and readable as a confirmation.

**3. Tighten card spacing:**

Change the outer container from `<div className="space-y-6">` to `<div className="space-y-3">`. The tighter gap creates a cohesive card stack rather than isolated sections.

**4. Add `tabular-nums` to financial values:**

Every `<dd>` that renders a currency value (via `formatCurrencyVal`) or percentage gets `tabular-nums`:

```tsx
<dd className="font-medium tabular-nums text-foreground">{formatCurrencyVal(data.purchasePrice)}</dd>
```

This is already required by Pillar 3 (Tabular Numbers Everywhere) and is currently missing from the review cards.

**5. Metrics preview Inset:**

The existing Inset (`rounded-lg bg-subtle/40 p-3`) is kept. The tighter `space-y-3` on the parent brings it visually closer to the summary cards. Change the Inset heading from `"Metrics preview"` to `"Your numbers at a glance"` for a warmer confirmation-moment tone. Add `tabular-nums` to metric values (already present on some — verify all three: equity, cash flow, cap rate).

**6. Edit button styling remains `text-sm font-medium text-accent hover:underline`** — this is correct per design spec.

#### 11-H. "Save basics and finish later" button treatment (R33)

Reposition and restyle the partial-save button for Step 2 so it reads as available but unambiguously secondary to "Next".

**Placement:** Below the mortgage Inset, separated by a `border-t border-border` divider. This visually marks it as "outside the form" — an escape hatch, not the next action.

**Markup:**
```tsx
<div className="mt-6 border-t border-border pt-4">
  <button
    type="button"
    onClick={() => void handlePartialSave()}
    disabled={submitting}
    className="min-h-[44px] rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:bg-subtle hover:text-foreground disabled:opacity-50"
  >
    Save basics and finish later
  </button>
  <p className="mt-1.5 text-xs text-muted">
    Creates the property with Step 1 &amp; 2 data only. You can add income and mortgage later.
  </p>
</div>
```

**Key differences from current implementation:**
- `text-muted` instead of `text-foreground` — de-emphasizes the label relative to the accent "Next" button in the footer.
- `transition-colors duration-150` — was missing; now matches the motion rule that every hover state must have a transition.
- `hover:text-foreground` — brightens on hover so the button still feels interactive.
- `border-t border-border` wrapper — visually separates it from the form fields and the mortgage Inset above.
- Helper caption explains what "basics" means — reduces cognitive load about what data is actually saved.

The `sectionEconomicsReached` guard is no longer needed (removed in Unit 6). The button is always visible in Step 2.

#### 11-I. Step-specific empty/placeholder states (R32)

When the user reaches Step 3 before completing address fields on Step 1 (edge case: direct step navigation via the indicator after a draft restore, or a browser back/forward), the "Estimate rent" button has no address to estimate against.

**Treatment:**

Add an `addressComplete` derived boolean in `StepIncomeExpenses`:
```ts
const addressComplete = Boolean(
  data.addressLine1?.trim() &&
  data.city?.trim() &&
  data.state?.trim() &&
  data.zipCode?.trim()
);
```

Pass `addressComplete` into the estimate button's `disabled` prop:
```tsx
<button
  type="button"
  onClick={handleEstimateRent}
  disabled={estimateLoading || rentMatchesLastEstimate || !addressComplete}
  className="shrink-0 self-end rounded-md border border-border bg-transparent px-3 py-2 text-sm font-medium transition-colors duration-150 hover:bg-subtle disabled:opacity-50"
>
  {estimateLoading ? "Estimating…" : "Estimate rent"}
</button>
```

When `!addressComplete`, render a helper below the button:
```tsx
{!addressComplete && (
  <p className="mt-1 text-xs text-muted">
    Complete the address in Step 1 to enable rent estimates.
  </p>
)}
```

Apply the same pattern to the "Estimate value" button in `StepPurchase` — it already checks address availability but shows a transient error toast. Add the persistent helper text when address is incomplete:
```tsx
{!addressComplete && (
  <p className="mt-1 text-xs text-muted">
    Complete the address in Step 1 to enable value estimates.
  </p>
)}
```

**Acceptance criteria:**

- [ ] The step indicator renders numbered circles (1–4) connected by horizontal lines, with step labels visible at ≥ 640px and hidden below.
- [ ] The current step circle uses `bg-accent text-accent-foreground`; completed circles use `bg-accent/10 text-accent` with a `Check` icon; future circles use `bg-subtle text-muted`.
- [ ] Connecting lines between completed steps use `bg-accent/30`; lines before future steps use `bg-border`.
- [ ] No step label uses `uppercase` or `tracking-wide`.
- [ ] Every step indicator button has `min-h-[44px] min-w-[44px]`.
- [ ] Navigating between steps triggers a fade + 6px upward entrance animation on the new step content, lasting 200ms.
- [ ] With `prefers-reduced-motion: reduce` enabled in OS settings, step transitions are instant with no animation.
- [ ] The `wizard-step-enter` class exists in `globals.css` inside a `@media (prefers-reduced-motion: no-preference)` block.
- [ ] Step 2 purchase/value fields and the mortgage section are visually separated — the mortgage toggle + fields sit inside a `rounded-lg bg-subtle/40 p-4` Inset with a `"Mortgage"` label in `text-xs font-medium text-muted`.
- [ ] The mortgage detail fields (when `addMortgage === true`) render inside the Inset without their own border or background — no nested Panel appearance.
- [ ] Step 3 has a `border-t border-border` divider between the rent group (rental status toggle + rent fields) and the expenses group (monthly expenses + vacancy).
- [ ] While a value estimate is loading, the `currentEstimatedValue` input shows an inline skeleton (`h-4 w-24 animate-pulse rounded-md bg-subtle`) overlaying the field area.
- [ ] While a rent estimate is loading, the `currentMonthlyRent` input shows an inline skeleton (`h-4 w-20 animate-pulse rounded-md bg-subtle`) overlaying the field area.
- [ ] Any input with a validation error has `ring-1 ring-negative/50 border-negative` applied to the input element itself, in addition to the `text-negative` error message below.
- [ ] Inputs without errors do NOT have the `ring-negative` treatment.
- [ ] Review step cards are spaced with `space-y-3` (not `space-y-6`).
- [ ] Each review card header has a Lucide icon prefix (`MapPin`, `DollarSign`, `TrendingUp`, `Landmark`) in `size-4 text-muted`.
- [ ] Review card header text uses `text-sm font-semibold text-foreground` (not `text-muted`).
- [ ] A confirmation heading ("Everything looks good?") renders above the review summary cards.
- [ ] All currency values in review `<dd>` elements have `tabular-nums`.
- [ ] On Step 3, the "Estimate rent" button is disabled with `opacity-50` and a helper message renders below when address fields are incomplete.
- [ ] On Step 2, the "Estimate value" button shows a helper message when address fields are incomplete.
- [ ] The "Save basics and finish later" button in Step 2 uses `text-muted` (not `text-foreground`) and sits below a `border-t border-border` divider.
- [ ] The "Save basics" button has `transition-colors duration-150` and `hover:text-foreground hover:bg-subtle`.
- [ ] A helper caption below the "Save basics" button explains it creates the property with Step 1 & 2 data only.
- [ ] No `hover:-translate-y-*` exists on any wizard UI element.
- [ ] No `uppercase tracking-wide` exists on any step label or form section label.
- [ ] No raw hex colors are used — all colors are design system tokens.
- [ ] No `border-border/70` or `bg-card/95` is introduced in new Unit 11 code.
- [ ] No nested Panels (Panel inside Panel) are created — the mortgage section uses Inset, not Panel.
- [ ] `shadow-sm` is NOT applied to form field wrappers or the mortgage Inset.
- [ ] `text-negative` and `ring-negative` are used only on fields with actual validation errors.
- [ ] Every animation uses `motion-safe:` prefix or is inside `@media (prefers-reduced-motion: no-preference)`.

---

## Suggested Implementation Order

| Order | Unit | Description |
|-------|------|-------------|
| 1 | Unit 1 | Scaffold step state and step rendering |
| 2 | Unit 2 | Progress indicator component |
| 3 | Unit 3 | Per-step validation |
| 4 | Unit 4 | Step-transition RentCast calls |
| 5 | Unit 5 | RentCast property data backfill |
| 6 | Unit 6 | Analytics migration |
| 7 | Unit 7 | Draft persistence with step |
| 8 | Unit 8 | Review step Edit links with returnToReview |
| 9 | Unit 9 | Mobile shell integration and audit |
| 10 | Unit 11 | Visual polish and animation |
| 11 | Unit 10 | Test updates |

Units 6 and 7 can be parallelized. Unit 9 can be started after Unit 2 is complete but should be finalized after all other units are done. Unit 11 depends on Units 1–4, 8, and 9, and should be implemented before Unit 10 so that test updates cover the final visual state.

---

## Test Plan

### Critical Path: Forward Navigation

1. Open `/properties/new`.
2. Fill in address line 1, city, state, ZIP.
3. Click "Next".
4. **Verify:** Step 2 (Finances) renders. The value estimate API call fires (check network tab). The step indicator shows Step 1 as completed (checkmark) and Step 2 as current (highlighted).
5. Fill purchase price, purchase date, estimated value.
6. Click "Next".
7. **Verify:** Step 3 (Income) renders. The rent estimate API call fires. Step 1 and 2 show checkmarks.
8. Click "Next".
9. **Verify:** Step 4 (Review) renders. All 4 review cards display the entered data. Metrics preview inset shows computed values.
10. Click "Create property".
11. **Verify:** Property is created and user is redirected.

### Critical Path: Back Navigation with Data Preservation

1. Complete Steps 1–3 with data.
2. On Step 3, click "Back".
3. **Verify:** Step 2 renders with all previously entered data (purchase price, date, value, mortgage choice).
4. Click "Back".
5. **Verify:** Step 1 renders with all address data, property type, beds, baths, sqft.
6. Click "Next" twice to return to Step 3.
7. **Verify:** Step 3 data (rent, expenses, vacancy) is unchanged.

### Critical Path: RentCast Deduplication

1. Fill address on Step 1. Click "Next".
2. **Verify:** Value estimate fires. Note the estimated value.
3. Click "Back" to Step 1. Make no address changes. Click "Next".
4. **Verify:** Value estimate does NOT fire again (network tab shows no new request). The estimated value is unchanged.
5. On Step 1, change the ZIP code. Click "Next".
6. **Verify:** Value estimate fires again (address changed, `lastValueEstimate` was cleared by the address change).

### Critical Path: RentCast Property Data Backfill

1. Fill address on Step 1 (leave beds, baths, sqft empty). Click "Next".
2. **Verify:** Value estimate fires. If the API returns `bedrooms`, `bathrooms`, `squareFootage`, those fields are pre-filled on Step 1.
3. Click "Back" to Step 1.
4. **Verify:** Bedrooms, bathrooms, and square feet fields show the pre-filled values.
5. Change bedrooms to a different number. Click "Next" → "Back".
6. **Verify:** The user-entered bedrooms value is preserved, not overwritten.

### Critical Path: Mobile Progress Indicator

1. Open `/properties/new` at 375px width.
2. **Verify:** The wizard renders inside `MobileToolShell`. The step indicator renders below the title in the header area. It is horizontally scrollable.
3. Each step tab is tappable with a finger (44×44px minimum).
4. Completed steps show a checkmark and are tappable to navigate back.
5. Future steps are muted and not tappable.
6. Back/Next buttons render in the footer with proper safe-area padding.

### Critical Path: Draft Restore on Correct Step

1. Open `/properties/new`. Fill Steps 1–2. Navigate to Step 3.
2. Close the browser tab (triggers beforeunload → draft saved).
3. Re-open `/properties/new`.
4. **Verify:** The restore modal appears. Click "Continue from draft".
5. **Verify:** The wizard renders on Step 3 with all Step 1 and Step 2 data preserved.
6. Inspect `localStorage.getItem("add-property-wizard-draft")`.
7. **Verify:** The JSON contains `"currentStep": 3`.

### Critical Path: Review "Edit" Round-Trip

1. Complete Steps 1–3 and land on Step 4 (Review).
2. Click "Edit" on the "Address & basics" card.
3. **Verify:** Step 1 renders with all existing data.
4. Change the nickname. Click "Next".
5. **Verify:** Step 4 (Review) renders immediately — not Step 2. The nickname change is reflected in the review card.
6. Click "Edit" on the "Income & expenses" card.
7. **Verify:** Step 3 renders. Click "Back".
8. **Verify:** Step 2 renders (normal back navigation). `returnToReview` is cleared.
9. Click "Next".
10. **Verify:** Step 3 renders (normal forward navigation — not Step 4).

### Critical Path: Quick-Add Unaffected

1. Open `/properties/new?mode=quick`.
2. **Verify:** The condensed quick-add form renders (single section, no step indicator, no step navigation).
3. Fill in address, expenses. Submit.
4. **Verify:** Property is created successfully. No step wizard UI was rendered.

## Model Recommendation

Units 1–10 can be implemented with the default model. **Unit 11 should use Claude Sonnet 4.6** — the visual polish work requires strong aesthetic judgment, precise Tailwind class composition, and the ability to hold the full design spec in context while auditing multiple visual surfaces simultaneously. The CSS `@starting-style` animation work and the review step "confirmation moment" design benefit from a model that can reason about visual hierarchy and user perception.

---

## Sources & References

- Predecessor plan: `docs/plans/2026-04-05-onboarding-activation-rollout.md`
- Friction audit: `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`
- Research: `docs/research/2026-04-05-onboarding-form-ux-wizard-vs-scroll.md`
- Design system: `.cursor/skills/veld-ui/SKILL.md`
- Mobile patterns: `.cursor/skills/veld-mobile/SKILL.md`
- Wizard source: `app/app/(app)/properties/add-property-wizard.tsx`
- Draft context: `app/app/(app)/draft-context.tsx`
- RentCast integration: `app/lib/integrations/rentcast.ts`
- Value estimate route: `app/app/api/estimates/value/route.ts`
- Rent estimate route: `app/app/api/estimates/rent/route.ts`
- Analytics events: `app/lib/analytics-events.ts`
- Address autocomplete: `app/components/property/address-autocomplete-input.tsx`
- MobileToolShell: `app/components/mobile-tool-shell.tsx`
