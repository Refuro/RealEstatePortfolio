# Growth Funnel & Activation Audit — 2026-03-19

## Executive summary

- The signup-to-first-value funnel is well-constructed: Clerk auth → onboarding modal → add property wizard → dashboard with live metrics. Time-to-first-value is achievable in under 3 minutes.
- A typo in the sign-up page configuration sends "already have account" users to `/sign-up` instead of `/sign-in`, creating a dead loop.
- Public pricing page has clear tiers and CTAs, but no product screenshots, demo, or social proof — visitors must sign up blind.
- First-property wizard is comprehensive (5 steps) but at ~1000 lines represents the heaviest friction point. No "quick add" or "skip mortgage" shortcut exists.
- Empty states across all surfaces correctly guide users to the next action, but there's no cross-page "getting started" continuity after the first property is added.

---

## Severity-ranked findings

### Critical

- None found.

### High

**H1 — Sign-up page `signInUrl` points to `/sign-up` instead of `/sign-in`**

- `app/sign-up/[[...sign-up]]/page.tsx`: `signInUrl="/sign-up"`.
- When a user on the sign-up page clicks "Already have an account? Sign in", they are redirected back to `/sign-up` — a dead loop.
- Should be `signInUrl="/sign-in"`.
- **Impact:** Users who already have accounts and accidentally land on sign-up cannot find the sign-in page through the standard flow. They must manually navigate to `/sign-in`.

### Medium

**M1 — No product screenshots, demo, or social proof on public pages**

- Landing page (`app/page.tsx`) and pricing page (`app/pricing/page.tsx`) have clear copy and pricing but zero visual proof of the product.
- No screenshots, no demo video, no testimonials, no user count.
- Visitors must create an account to see what the product looks like.
- **Impact:** Significantly reduces conversion rate. Visitors who are comparison-shopping will choose competitors with visible product previews.

**M2 — First-property wizard is 5 steps with no skip option for mortgage**

- `app/(app)/properties/add-property-wizard.tsx`: ~1000 lines, 5 steps (Address & basics, Purchase, Income & expenses, Mortgage, Review).
- Step 4 (Mortgage) is optional data but presented as a required step in the flow — the user must click through it even if they skip all fields.
- No "Quick add" mode or progressive disclosure of advanced fields.
- **Impact:** Increases drop-off probability for users who want to quickly add a property to see what the tool does.

**M3 — No post-first-property continuation guidance**

- After first property creation, user is redirected to `/dashboard?onboarding=first-property`.
- Dashboard shows metrics for the property but no "what to do next" guidance.
- No suggestion to: try modeling, explore mortgage tools, analyze a new deal, or add another property.
- The onboarding modal is a one-shot experience — once dismissed, there's no re-entry point.
- **Impact:** Users see their property metrics but may not discover the tool's deeper value (modeling, mortgage simulation).

### Low

**L1 — "Maybe later" dismiss is permanent with no re-entry**

- `app/(app)/onboarding-panel.tsx`: "Maybe later" marks `onboardingDismissedAt`, permanently hiding the modal.
- No way to re-trigger the welcome modal or access a "getting started" guide from settings.
- Users who dismiss early and return later have no guided path.

**L2 — Empty state on dashboard does not mention "Analyze a deal"**

- Dashboard empty state (`dashboard/page.tsx` lines 100–128): Only shows "Add your first property" and "Import from CSV".
- No mention of the deal analyzer, which is the lowest-friction entry point (no property required).
- Users who want to evaluate a deal before committing to the product have no guidance to that feature.

**L3 — Public pricing FAQ could address more objections**

- `app/pricing/page.tsx`: FAQ section exists but content was not reviewed for completeness.
- Common micro-SaaS objections (data portability, cancellation, privacy) should be addressed.

---

## Full funnel walkthrough

### Stage 1: Public discovery → Sign-up intent

**Entry points:**
- Direct URL (`/`)
- Public pricing page (`/pricing`)
- Contact page (`/contact`)

**Landing page (`app/page.tsx`):**
- Clear value proposition headline.
- Feature highlights.
- CTA to sign up.
- No product screenshots, demo, or social proof.

**Public pricing page (`app/pricing/page.tsx`):**
- `PricingCards` component with 3 tiers (Free, Investor, Pro).
- Monthly/yearly toggle with savings display.
- Per-tier: feature list, limits, "Best for" text.
- CTAs: "Choose Free", "Choose Investor", "Choose Pro" → all route to `/sign-up`.
- Guest-only section: "Create free account" and "Sign in" CTAs.
- FAQ section.
- **Friction:** No visual proof of product. No free trial messaging. "Choose Free" implies commitment before value is demonstrated.

### Stage 2: Sign-up → Post-auth landing

**Sign-up (`app/sign-up/[[...sign-up]]/page.tsx`):**
- Clerk sign-up component.
- `afterSignUpUrl="/dashboard"` — redirects to dashboard after signup.
- `signInUrl="/sign-up"` — **BUG (H1)**: Should be `/sign-in`.
- Terms and Privacy links below form.
- Clean, standard Clerk UI.

**Sign-in (`app/sign-in/[[...sign-in]]/page.tsx`):**
- Clerk sign-in component.
- `afterSignInUrl="/dashboard"` — redirects to dashboard.
- `signUpUrl="/sign-up"` — correct.

**Post-auth user sync (`lib/auth.ts`):**
- `getAppUser()` calls `currentUser()` from Clerk.
- If user doesn't exist in DB, creates via `upsertUser()` with Clerk data.
- No separate webhook — sync happens on first app request.
- This means user record is always available when dashboard loads.

### Stage 3: Onboarding → First property

**Onboarding modal (`app/(app)/onboarding-panel.tsx`):**

Trigger condition: both `onboardingWelcomeSeenAt` and `onboardingDismissedAt` are `null` (brand new user who hasn't seen or dismissed the modal).

Modal content:
- "Welcome" badge with gradient accent.
- Headline: "Build your real estate portfolio in minutes".
- Copy: "Add your first property to unlock live equity, cash flow, and performance insights."
- Value chips: "Track cash flow", "See equity growth", "Model upside".
- Setup time estimate: "Typical setup time: about 2 minutes".
- Primary CTA: "Add first property" → navigates to `/properties/new`.
- Secondary CTA: "Maybe later" → dismisses modal permanently.

Both CTAs mark `onboardingWelcomeSeenAt` via API. "Maybe later" additionally marks `onboardingDismissedAt`.

**API (`app/api/onboarding/route.ts`):** PATCH with `action: "mark_welcome_seen" | "dismiss_modal"`. Updates `onboardingWelcomeSeenAt` and/or `onboardingDismissedAt` timestamps.

**Assessment:** Modal is well-designed, concise, and action-oriented. The "~2 minutes" estimate sets expectations. Value chips are informational, not interactive. Good.

### Stage 4: First-property creation

**Wizard (`app/(app)/properties/add-property-wizard.tsx`):**

| Step | Content | Required fields | Optional fields |
|------|---------|----------------|-----------------|
| 1. Address & basics | Street, City, State, ZIP, property type, units, nickname | Address, type | Nickname, bedrooms, bathrooms |
| 2. Purchase | Purchase price, purchase date, current value, cash invested | Price, date, value | Cash invested |
| 3. Income & expenses | Monthly rent, monthly expenses, vacancy %, unit rents | Rent, expenses | Vacancy (default 5%), unit rents |
| 4. Mortgage | Balance, rate, term, payment, escrow, lender, loan type | None (entire step optional) | All fields |
| 5. Review | Summary of all inputs, confirm | N/A | N/A |

- RentCast estimate buttons on Step 2 (value) and Step 3 (rent) — nice quick-fill feature.
- `DraftProvider` preserves unsaved progress.
- Validation per step (`validateStep1`–`validateStep4`).
- On first property completion: `router.push("/dashboard?onboarding=first-property")`.

**Friction analysis:**
- 5 steps is a lot for a first-time user who just wants to see what the tool does.
- Step 4 (Mortgage) requires clicking "Next" even if all fields are empty.
- No "skip to review" or "quick add with just address and basics" option.
- ~1000 lines in a single file — complex internal logic that could benefit from splitting.

### Stage 5: Dashboard → Ongoing value

**First-property dashboard (`dashboard/page.tsx`):**
- With `?onboarding=first-property` query param: dashboard loads with property data.
- Single-property view: "Property at a glance" value bar chart, summary card with property links.
- No "What to do next" suggestions. No mention of Modeling, Mortgage tools, or deal analyzer.
- Metric cards only appear at 2+ properties.

**Multi-property experience:**
- Full metric cards, portfolio charts, rent-vs-market section.
- Summary card with workspace links (Modeling, Mortgage).
- Significantly richer than single-property view.

### Stage 6: Upgrade path

**In-app upgrade (`app/(app)/plans/page.tsx`):**
- Plan context card shows current tier, limits, billing status.
- `PricingCards` with "Choose Investor"/"Choose Pro" → Stripe checkout.
- Clear and functional.

**Plan limit nudge:**
- Properties page: "Showing X of Y" with "Upgrade" link when limit reached.
- Settings: "(limit reached)" in red next to plan limits.
- Contextual but not aggressive. Good tone.

---

## Empty state inventory

| Surface | Empty state message | CTA | Quality |
|---------|-------------------|-----|---------|
| Dashboard (0 properties) | "Welcome to Veld" + description | "Add your first property" | Good |
| Properties (0 properties) | "No properties yet" | "Add your first property" | Good |
| Properties (filtered, 0 matches) | "No properties match this view" | "Clear filters" | Good |
| Deals (0 deals) | "No saved deals yet" / "Analyze a deal and save it" | "Analyze a deal" | Good |
| Modeling (0 properties) | "Add your first property to start modeling" | "Add your first property" | Good |
| Mortgage (0 properties) | "Add your first property to start mortgage modeling" | "Add your first property" | Good |
| Mortgage (property, no mortgage) | "No mortgage found for this property" | "Add mortgage details" | Good |
| Value breakdown chart | "Add property value and mortgage data to see breakdown." | None | Missing CTA |

All empty states use consistent language and route to appropriate next actions. Only the value breakdown chart is missing a CTA.

---

## Conversion path analysis

### Public → Sign-up

| Source | CTA | Destination | Clarity |
|--------|-----|-------------|---------|
| Landing page | Sign up CTA | `/sign-up` | Clear |
| Public pricing | "Choose Free/Investor/Pro" | `/sign-up` | Clear |
| Public pricing (guest section) | "Create free account" | `/sign-up` | Clear |
| Public pricing (guest section) | "Sign in" | `/sign-in` | Clear |
| Sign-up page | "Already have account?" | `/sign-up` (**BUG**) | Broken (H1) |

### Free → Paid

| Trigger | CTA | Destination | Clarity |
|---------|-----|-------------|---------|
| Plan limit reached (properties) | "Upgrade" link | `/plans` | Clear |
| Plan limit reached (settings) | "(limit reached)" + "Upgrade" | `/plans` | Clear |
| Plans page | "Choose Investor"/"Choose Pro" | Stripe checkout | Clear |
| No unprompted upgrade nudge | N/A | N/A | Could add "unlock X" messaging |

---

## Evidence reviewed

- `app/sign-up/[[...sign-up]]/page.tsx` (sign-up config, BUG)
- `app/sign-in/[[...sign-in]]/page.tsx` (sign-in config)
- `app/(app)/onboarding-panel.tsx` (onboarding modal)
- `app/lib/onboarding.ts` (onboarding logic)
- `app/app/api/onboarding/route.ts` (onboarding API)
- `app/(app)/properties/add-property-wizard.tsx` (wizard flow)
- `app/(app)/dashboard/page.tsx` (dashboard empty state, first-property)
- `app/(app)/properties/page.tsx` (properties empty state)
- `app/(app)/deals/page.tsx` (deals empty state)
- `app/(app)/modeling/modeling-workspace.tsx` (modeling empty state)
- `app/(app)/mortgage/mortgage-workspace.tsx` (mortgage empty state)
- `app/pricing/page.tsx` (public pricing, guest CTAs)
- `app/(app)/plans/page.tsx` (in-app plans)
- `app/components/pricing-cards.tsx` (shared pricing component)
- `app/lib/auth.ts` (user sync flow)
- `app/proxy.ts` (public route config)

---

## Risk & impact assessment

- **H1 (sign-up dead loop):** Users with existing accounts who land on sign-up cannot navigate to sign-in through the page's own link. Direct impact on returning user experience.
- **M1 (no visual proof):** Every visitor who lands on pricing or landing page must take a leap of faith to sign up. This is the highest conversion-rate risk.
- **M2 (wizard friction):** The 5-step wizard is the heaviest commitment asked of a new user. Drop-off at this stage means lost activation.
- **M3 (no continuation):** Users who complete their first property see metrics but no guidance toward the product's deepest value features.

---

## Recommendations (prioritized)

1. **Fix `signInUrl` typo** in sign-up page — change `"/sign-up"` to `"/sign-in"`. One-line fix.
2. **Add product screenshots** to landing page and public pricing — show dashboard, modeling, and mortgage tools.
3. **Add post-first-property guidance** — A "What's next" card on dashboard after first property: try Modeling, explore Mortgage, analyze a deal.
4. **Simplify wizard for new users** — Consider a "Quick add" mode that collapses mortgage step, or allow skip-to-review after basics.
5. **Add "Analyze a deal" to dashboard empty state** — Users can explore the deal analyzer without adding a property first.
6. **Allow onboarding modal re-entry** — Add a "Getting started" link in settings or sidebar for users who dismissed early.

---

## Task candidates

- [ ] Fix `signInUrl="/sign-up"` to `signInUrl="/sign-in"` in `app/sign-up/[[...sign-up]]/page.tsx`.
- [ ] Add product screenshots to landing page and public pricing page.
- [ ] Add "What's next" guidance card to post-first-property dashboard.
- [ ] Add "Analyze a deal" CTA to dashboard empty state.
- [ ] Add "Getting started" link in sidebar or settings for re-entry to onboarding tips.
- [ ] Consider wizard "Quick add" mode or mortgage step skip.

---

## Re-test checklist

- [ ] Verify sign-up page "Already have account?" link routes to `/sign-in`.
- [ ] Verify first-property flow lands on dashboard with property data.
- [ ] Verify onboarding modal does not reappear after dismiss.
- [ ] Verify all empty states show correct CTAs.
- [ ] Manual QA: full funnel walkthrough from public pricing to first property to dashboard.

---

## Next trigger and cadence

- Trigger: onboarding, pricing, or signup flow changes
- Recommended next run: monthly
