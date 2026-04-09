# Growth Funnel & Activation Audit — 2026-04-09

## Executive summary

- **Overall:** Public acquisition (`/`, `/pricing`, `/tools`, `/investment-property-calculator`), Clerk auth (`fallbackRedirectUrl="/dashboard"`), plan-intent persistence, paid-intent nudge, welcome onboarding, and dashboard empty state form a coherent path to first property or Analyze; upgrade UX is supported by `/plans`, pricing cards, and billing integration.
- **Top risks:** **Calculator-led signups must re-enter inputs** after account creation (explicit on the calculator page, still a major time-to-value leak). **First-session attention split** among welcome modal, trial messaging, paid-intent banner (when applicable), and empty-dashboard CTAs.
- **Recommendation:** Prioritize **measurable experiments** on calculator→workspace handoff when roadmap allows; optionally test a **non-blocking “View plans”** affordance for trial users with zero properties if early conversion data warrants it (trial strip currently steers them to add a property first).

## Severity-ranked findings

### Critical

- None identified in this static/code-path review (auth gating and primary routes reviewed are consistent with expected behavior).

### High

- **Public calculator → in-app re-entry** — The investment property calculator page states that inputs are **not** carried into the app after signup, so users must re-enter assumptions in Analyze or property flows. **Risk:** Drop-off and longer time-to-first-value for SEO/tool-origin traffic. **Evidence:** `app/app/investment-property-calculator/page.tsx` (disclosure ~lines 94–95); pattern repeated across public calculators and sign-up CTAs; `docs/reference/roadmap.md` (product map — tools vs full workspace).

### Medium

- **Post-auth landing is always `/dashboard`** — `SignUp` and `SignIn` use `fallbackRedirectUrl="/dashboard"` only. **Risk:** Users who intended to resume a specific post-login URL (deep links, future “continue” flows) are not automatically returned unless extended redirect logic exists elsewhere. **Evidence:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-in/[[...sign-in]]/sign-in-view.tsx`.

- **Trial banner upgrade CTA deferred until activation or late trial** — While `propertyCount === 0` and `trialDaysRemaining > 0`, the trial banner shows an activation message and **does not** show the upgrade link (`shouldShowUpgradeCta = !hasEmptyPortfolio || days <= 0`). **Tradeoff:** Reduces billing-first behavior during early trial (good for activation); users who want to subscribe before adding a property rely on **Plans** in the nav, **PaidIntentCheckoutBanner** (paid intent only), or **Settings**. **Evidence:** `app/app/(app)/components/trial-banner.tsx` (lines 44–77).

- **Concurrent onboarding and growth surfaces** — On first session with an empty portfolio, **OnboardingPanel** (welcome modal / re-engagement), **TrialBanner** (when on trial), **PaidIntentCheckoutBanner** (free tier + investor/pro intent), and the **dashboard empty state** can appear together (stack order in `app/app/(app)/app-layout-client.tsx`). **Risk:** Cognitive load and unclear single “next step” despite strong individual copy.

### Low

- **Empty-dashboard copy** — The “Analyze a deal first” card says “No account data needed” while the user is signed in. **Evidence:** `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`.

- **Sign-in path lacks trial/value reinforcement** — Sign-up includes the 14-day trial line and paid-intent reinforcement; sign-in only adds Terms/Privacy. **Evidence:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/components/analytics/plan-intent-sign-up-reinforcement.tsx`, `app/app/sign-in/[[...sign-in]]/sign-in-view.tsx`.

- **Billing success is not activation-aware** — `/billing/success` emphasizes plan limits and links to dashboard/settings without a branch for users who still have **zero properties**. **Evidence:** `app/app/(app)/billing/success/page.tsx`.

## Evidence reviewed

- **Process & template:** `docs/process/audit-report-template.md`, `docs/process/growth-funnel-audit-process.md` (permanent deferral **GRW-1:** mobile pricing accordion omitting “Estimate pool (per hour)” is **intentional** — not reported as a defect).
- **Reference:** `docs/policies/design-spec.md` (alignment expectations), `docs/reference/roadmap.md` (product map, tools vs workspace).
- **Public funnel:** `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/app/tools/page.tsx`, `app/components/landing-nav.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/components/analytics/plan-intent-url-sync.tsx`, `app/lib/plan-intent.ts`.
- **Auth & routing:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-in/[[...sign-in]]/sign-in-view.tsx`, `app/proxy.ts` (public route matcher).
- **Activation:** `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`, `app/app/(app)/properties/page.tsx` (empty state).
- **Upgrade & billing:** `app/components/pricing-cards.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/(app)/components/trial-banner.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx`, `app/components/growth/billing-success-clear-intent.tsx`, `app/app/(app)/billing/success/page.tsx`, `app/app/(app)/app-nav.tsx` (Plans in account nav), `app/components/mobile-bottom-nav.tsx`.

**Limits:** No live browser session, production analytics, or Clerk/Stripe dashboard verification; static review only.

## Risk & impact assessment

- Findings primarily affect **activation rate**, **calculator-attributed funnel efficiency**, and **early-trial monetization** — not security or compliance.
- Calculator re-entry friction is **high likelihood** for tool-origin users because the product discloses the behavior explicitly.
- Trial-banner rules are **by design** for activation-first behavior; impact is on the subset who would pay before first property.

## Recommendations (prioritized)

1. **Calculator handoff experiment:** When capacity allows, ship a minimal prefill or query-param bridge from the highest-traffic public calculator to `/analyze` (or Quick Add) for overlapping fields; measure signup → first saved deal or first property within 7 days.
2. **Optional early upgrade path on trial strip:** If data shows demand from empty-portfolio trial users, A/B a secondary “View plans” text link alongside the activation message (without replacing the primary activation cue).
3. **Polish continuity:** Adjust empty-dashboard Analyze card copy for signed-in context; add one line of trial/value reassurance on sign-in; consider a zero-property CTA on billing success after fetching property count.

**Measurable hypotheses (process §4):**

- *H1:* Partial calculator field handoff increases **% of calculator-page signups who open Analyze with any field prefilled** within one session.
- *H2:* A secondary “View plans” link on the trial banner (empty portfolio, days remaining &gt; 3) increases **checkout starts** without reducing **first property added within 72h**.

## Task candidates (optional)

- [ ] Experiment: calculator → `/analyze` prefill for selected fields (see `app/app/investment-property-calculator/page.tsx` and marketing calculator components).
- [ ] Copy: dashboard empty-state “Analyze a deal first” description for authenticated users (`app/app/(app)/dashboard/dashboard-empty-state-ctas.tsx`).
- [ ] Copy: one-line trial/value line on sign-in (`app/app/sign-in/[[...sign-in]]/sign-in-view.tsx`).
- [ ] Optional: billing success branch when user has zero properties (`app/app/(app)/billing/success/page.tsx` — may require property count query).

## Re-test checklist

- [ ] Verify any trial-banner or onboarding change across empty vs non-empty portfolio and trial end states.
- [ ] Verify `PaidIntentCheckoutBanner` and `clearPlanIntent` after successful checkout (`app/components/growth/paid-intent-checkout-banner.tsx`, `app/components/growth/billing-success-clear-intent.tsx`).
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** After pricing/trial/onboarding/calculator funnel changes, or quarterly growth review.
- **Recommended next run:** 2026-07-09 ± 2 weeks, or the release after any calculator→workspace handoff ships.
