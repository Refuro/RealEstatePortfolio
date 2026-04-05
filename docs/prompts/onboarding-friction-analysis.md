# Prompt: Onboarding & First-Property Activation Friction Analysis

**Use on:** Claude Opus 4.6 (see model note at bottom)  
**Skills to load first:** Read and apply `veld-ui` skill, `veld-mobile` skill before analyzing or proposing any UI changes.  
**Goal:** Deep analysis of the full sign-up → first property added funnel. Identify every friction point. Produce ranked, actionable recommendations with implementation specificity. The target metric is: increase the % of signed-up users who complete the add-property flow.

---

## Context

Veld Portfolio is a SaaS for small real estate investors. The product has 6 users, 0 have added a property, and 0 have seen the core product value (dashboard metrics, charts, analysis workspaces all require at least one property). This is the single highest-priority problem in the product right now.

**The activation threshold:** A user is "activated" the moment they have one property saved. Everything downstream — dashboard, deal analyzer context panel, modeling, mortgage workspace, benchmarking — becomes meaningful at that moment. Before it, the product is empty.

**Current funnel stages:**
1. User signs up (working — 6 users completed this)
2. User sees onboarding modal (unknown — may have dismissed)
3. User navigates to `/properties/new` (unknown)
4. User completes the add-property wizard (0 of 6 completed)
5. User lands on their dashboard with live metrics (never happened)

---

## Files to Read Before Analyzing

Read all of the following before forming any conclusions:

```
app/app/(app)/onboarding-panel.tsx          — welcome modal (step 2)
app/app/(app)/properties/add-property-wizard.tsx  — the full property form (step 4)
app/app/(app)/properties/new/page.tsx       — the page that hosts the wizard
app/app/(app)/dashboard/page.tsx            — what the user sees if they skip (empty state)
app/lib/onboarding.ts                       — onboarding state model
app/lib/analytics-events.ts                 — what is currently instrumented
docs/reference/product-overview.md          — product context
docs/reference/valuation-brief.md           — current user/activation state
docs/plans/2026-04-04-product-gap-discovery.md  — Gap 12: address autocomplete identified
```

---

## Analysis Tasks

### 1. Onboarding modal audit (`onboarding-panel.tsx`)

Analyze the welcome modal in full detail:

- **Copy effectiveness:** Does "Build your real estate portfolio in minutes" actually create urgency or communicate value? Does "Add your first property to unlock live equity, cash flow, and performance insights" make the ask feel light or heavy? Does "Typical setup time: about 60 seconds" set an accurate expectation?
- **CTA hierarchy:** The modal has two CTAs — "Add first property" (primary) and "Maybe later" (secondary). What happens to users who click "Maybe later"? Do they ever see another prompt, or is the activation path permanently closed unless they find Properties in the nav? Trace the code.
- **What is missing from the modal:** Does the modal show any preview of what the user will get? Is there any sense of what the dashboard looks like after adding a property? Is there social proof, a screenshot, or a before/after?
- **The escape valve problem:** "Maybe later" dismisses permanently (`dismiss_modal` action patches `onboardingDismissedAt`). What happens to a user who clicks "Maybe later"? Do they see an empty dashboard with no guidance? Is there a persistent empty-state CTA? Is there anything that re-surfaces the activation path later?
- **Mobile experience:** Apply the `veld-mobile` skill. Does the modal work well at 375px? Does the button layout stack correctly? Is focus trap and keyboard navigation intact?

---

### 2. Full wizard form audit (`add-property-wizard.tsx`)

The wizard is a long single-page scroll with 5 anchored sections. Audit every section:

**Section 1 — Location & profile**
- Fields: nickname (optional), address line 1*, address line 2 (optional), city*, state*, ZIP*, property type, units (conditional), bedrooms (optional), bathrooms (optional), square feet (optional)
- **Address entry:** There is no autocomplete. Users must manually type a full address. This is the first thing they encounter. How many fields does a user see before they can move forward? What is the cognitive load of the very first screen?
- **Required field gates:** City, state, ZIP are all required. If a user hasn't looked up their property address before opening the form, they will stop here. Is there guidance for what to do if they don't have the address in front of them?
- **"Nickname" placement:** Nickname is the very first field. Is this the right thing to ask first? Does it communicate that this is optional clearly enough? Does it slow down the perceived momentum?

**Section 2 — Purchase & value**
- Fields: purchase price, purchase date, current estimated value, cash invested
- **Memory burden:** These fields require the user to have paperwork. Purchase price and purchase date require looking up closing documents. Cash invested (down payment + closing costs) is non-obvious to calculate. Does any field have helper text that makes this easier or explains what "cash invested" means?
- **"Estimate value" button:** There is a RentCast-powered "Estimate value" button. Is it clearly surfaced? Can a user use it to skip entering a manual value?
- **Field interdependencies:** If a user leaves purchase price blank, what happens to cash-on-cash return? Are there any inline notes explaining what defaults or skips are safe?

**Section 3 — Income & expenses**
- Fields: isRented toggle, monthly rent (or unit rents for multi-family), monthly expenses, vacancy %
- **"isRented" toggle:** What does the form look like if this is toggled to "not rented"? Does the rent field disappear? Is it clear that an unrented property can still be added?
- **"Estimate rent" button:** Similar to estimate value — is it clearly surfaced? Does it communicate that RentCast is doing the work?
- **Vacancy %:** Default is 5%. Is there any explanation of what vacancy % means and why it matters? A new investor may not know this term.
- **Monthly expenses:** Single flat number. Is there any guidance on what should be included? (Insurance, taxes, HOA, maintenance?) A user who enters only their mortgage payment here will get wrong cash flow.

**Section 4 — Mortgage**
- This section requires: original loan amount, current balance, interest rate, term, start date, monthly payment, lender name, loan type, escrow details
- **Paperwork dependency:** This is the hardest section. It requires the user to have their mortgage statement. Is there a clear "skip for now" option? Is it framed as optional or required?
- **The skip question:** What happens if a user skips the mortgage? Do equity and LTV still show? Do the metrics that require mortgage data degrade gracefully or break? Document the fallback behavior.
- **Escrow:** Is there guidance on whether to include escrow in the monthly payment figure?

**Section 5 — Review**
- What does the review step show? Is there a summary of what will be saved? Is there a preview of what metrics will calculate from the data entered so far?

---

### 3. Empty dashboard state audit

- After clicking "Maybe later" on the onboarding modal, what does a user see?
- Is there a persistent empty-state CTA on the dashboard? Does it tell the user what they're missing?
- Is there any way a user who dismissed the modal gets re-prompted, reminded, or guided back to the add-property flow?
- Check `app/app/(app)/dashboard/page.tsx` for empty-state handling.

---

### 4. Analytics instrumentation audit

- The wizard fires `add_property_milestone_reached` events for each scroll section. Does PostHog have a funnel configured to show where users drop off? Even without historical data, is the instrumentation correct and complete?
- Is there a `wizard_started` event (distinct from `welcome_add_first_property`)? Is there an `add_property_completed` event? Is there a `wizard_abandoned` event or mechanism?
- Are the milestone events for sections 2–5 actually firing on scroll, or only if the user actively navigates? Read the scroll-intersection or section-tracking logic to understand when these fire.

---

### 5. Friction ranking

After completing the above analysis, rank every friction point from highest to lowest impact on activation. For each:

- Name the friction point
- Which user segment it affects most (everyone / users without paperwork handy / mobile users / etc.)
- Current behavior
- Proposed fix with implementation specificity (which file, which section, what change)
- Effort estimate (S = hours, M = 1–2 days, L = 3+ days)
- Expected impact on activation rate (Low / Medium / High / Very High)

---

### 6. Recommendations

Produce two recommendation tiers:

**Tier 1 — Highest impact, lowest effort (do this week)**
These should be copy, UX, and flow changes that do not require new infrastructure. Think: better empty-state CTAs, skip-for-now on mortgage, better field help text, re-surfacing the activation path after "Maybe later," improving the welcome modal copy or preview.

**Tier 2 — High impact, medium effort (do this sprint)**
These should be concrete feature changes: progressive disclosure on the wizard (address → minimal save → optional details), address autocomplete (Gap 12 from product gap discovery), a "quick add" path (address + estimated value only, defer everything else), or a persistent "add your first property" banner.

For every recommendation, apply the `veld-ui` skill to ensure it conforms to the design system. Apply the `veld-mobile` skill for any UI changes to ensure touch targets, layout, and shell behavior are correct at 375px.

---

### 7. Quick-add path feasibility

Evaluate whether a "quick add" flow is technically feasible:

- Could a user add a property with only: address + property type + current estimated value (via RentCast) + optional rent? 
- Which fields are required by the Prisma schema vs. required by the metrics engine vs. required by the UI validation?
- What metrics would be available with minimal input vs. full input? (Equity requires value + debt. Cash flow requires rent + expenses + mortgage. Cap rate requires NOI + value. LTV requires debt + value.)
- Propose a minimum viable field set that produces at least 3 meaningful metrics immediately after save.
- Propose a "complete your property" prompt that surfaces on the property detail page for properties with incomplete data.

---

### 8. Re-engagement path proposal

Currently, there is no mechanism to re-engage a user who signed up, clicked "Maybe later," and returned to the app later. Propose a lightweight re-engagement path:

- A persistent "Add your first property" banner or card on the empty dashboard (not a modal — something inline that doesn't interrupt)
- Progressive empty-state copy that changes after day 1, day 3, and day 7 without a property (e.g., day 1: "Your dashboard is waiting for its first property"; day 7: "Other landlords tracking similar portfolios see X% more clarity on their equity")
- Whether a "we noticed you haven't added a property" email (via Resend, already in stack) makes sense at day 3 or day 7 post-signup

---

## Output Format

Structure your response as:

1. **Funnel audit summary** — 3–5 sentence assessment of the overall funnel health
2. **Modal audit findings** — bulleted findings with severity (critical / high / medium / low)
3. **Wizard audit findings** — organized by section, bulleted, with severity
4. **Empty dashboard / re-entry path findings** — bulleted with severity
5. **Analytics completeness** — what's good, what's missing
6. **Friction ranking table** — ranked from highest to lowest impact
7. **Tier 1 recommendations** — specific, implementable this week, file + line-level where possible
8. **Tier 2 recommendations** — concrete, scoped, with effort estimates
9. **Quick-add feasibility analysis** — minimum viable field set + fallback metric behavior
10. **Re-engagement path proposal** — specific, low-infrastructure first pass

Do not pad. Every finding should be specific to the actual code. Generic UX advice without grounding in the codebase is not useful here.

---

## Constraints and guardrails

- Do not propose changes that break the existing analytics instrumentation. If a recommendation changes a flow, note what analytics events need to be updated or added.
- Do not propose removing the mortgage section entirely — it is core to LTV, DSCR, equity, and cash flow. Propose making it optional/deferrable, not absent.
- Do not propose design changes that violate the `veld-ui` skill (design tokens, typography, surface hierarchy). All proposals must be compatible with the existing design system.
- Do not propose server-side changes to the onboarding state model (`onboarding.ts`) without noting the migration impact on existing user records.
- The product does not do property management. Do not propose tenant-tracking, lease management, or rent collection features as solutions to activation.

---

## Model note

**Use Claude Opus 4.6** for this prompt.

This is a deep research synthesis task requiring: code reading across multiple files, UX judgment, copy evaluation, implementation feasibility analysis, and a ranked recommendation output. It crosses the threshold where Opus 4.6's edge over Sonnet 4.6 on complex multi-step reasoning, editorial judgment, and long-horizon analysis is worth the cost premium. The output will directly inform implementation work this week, so quality matters more than speed here.

Do not run this with a coding-specialized model (Codex, Composer) — those models are not tuned for the analysis + judgment + copy evaluation component of this task. After Opus produces the analysis, use Sonnet 4.6 or Composer 2 Fast to implement the Tier 1 changes.
