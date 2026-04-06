# Growth Funnel & Activation Audit — 2026-04-05

## Executive summary

- The acquisition surface (landing page, pricing page) is structurally solid — clear hero, honest scope section, embedded public calculator as lead-gen, and well-tracked CTAs via `FunnelCtaLink`. The primary conversion risk is the **complete absence of real social proof**: the "social proof strip" is product features, not user evidence.
- The sign-up → first-property activation path has a **critical gap after "Maybe later"**: the onboarding dismiss is permanent with no in-app recovery, and re-engagement drops to zero after the Day 7 cron email.
- Time-to-first-value framing is overpromised ("60 seconds") and underdelivered by the wizard (4 steps, financial documents required), creating trust damage at the highest-engagement moment.
- Analytics instrumentation covers the major events but has structural fragility: `user_signed_up` is client-side-only, wizard abandonment does not capture step context, and post-add-property activation nudges go untracked.

---

## Severity-ranked findings

### Critical

- **No real social proof on the landing page** — The "social proof strip" (`app/app/page.tsx` lines 314–352) renders three product feature statements ("Built for landlords with 1–10 properties", "Track your portfolio and analyze new deals", "Free plan — no card required"). There are no user testimonials, no star ratings, no user/property count, and no press or community mentions anywhere on the landing page or pricing page. For cold traffic evaluating a SaaS with financial data, the absence of third-party credibility is a primary conversion blocker.

- **Onboarding modal dismiss is a permanent dead end** — `OnboardingPanel` (`app/app/(app)/onboarding-panel.tsx` line 42) shows only when `!welcomeSeenAt && !dismissedAt`. Clicking "Maybe later" calls `patchOnboarding("dismiss_modal")`, setting `onboardingDismissedAt` in the database. Once dismissed, the modal never re-surfaces. The only re-engagement mechanism is the cron email at Days 3 and 7 (`app/app/api/cron/onboarding-emails/route.ts`). After Day 7, if the user is still inactive, there is no further nudge — in-app or via email. Given that the current state is 0 properties added by any signed-up user, this dead end is the most direct activation blocker.

### High

- **Sign-up page has no brand or value reinforcement at the conversion moment** — `SignUpView` (`app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`) renders a bare Clerk `<SignUp>` component with only a terms/privacy footer. The only exception is `PlanIntentSignUpReinforcement`, which fires only for `intent=investor` or `intent=pro` params. Free-intent and undecided users — the majority — see a generic Clerk form with no Veld features, no dashboard preview, and no reminder of what they're signing up for. This is the highest-traffic conversion moment and it has the weakest copy in the funnel.

- **`user_signed_up` event is client-side-only and localStorage-deduped** — `PostHogSignupOnce` (`app/components/analytics/posthog-signup-once.tsx`) fires the event from the browser using a 7-day localStorage window. If a user clears storage or signs in from a second device, the event fires again. There is no server-side webhook on account creation firing this event. The funnel's top-of-funnel signal is fragile and not guaranteed to match Clerk's actual signup count.

- **Dashboard empty-state CTA is untracked** — The "Add your first property" primary CTA in the empty dashboard (`app/app/(app)/dashboard/page.tsx` lines 126–132) uses a plain `<Link>` with no PostHog capture or `FunnelCtaLink` wrapper. The two secondary cards ("Analyze a deal first", "Import from a spreadsheet") are also plain `<Link>` elements. Activation-intent signals from the highest-visibility empty state go unmeasured.

- **"60 seconds" setup claim is inaccurate** — The landing page (`app/app/page.tsx` line 262) and pricing cards (`app/components/pricing-cards.tsx` `publicFeatures[0]`) both claim "Your first property in about 60 seconds" or "Set up your first property dashboard in about 60 seconds." The add-property wizard has 4 labeled steps (Property, Finances, Income, Review) requiring purchase price, purchase date, mortgage details, and monthly expenses — data that requires closing documents and mortgage statements. Real setup time for a complete property is 5–15 minutes. An overpromised time estimate violated immediately on entry to the wizard destroys trust at the worst moment.

- **`WIZARD_ABANDONED` captures no step context** — The wizard abandonment event fires from `beforeunload` (`app/app/(app)/draft-context.tsx` line 275) with only `has_draft: true`. It does not include the current step number. Without step granularity, it is impossible to identify which wizard section causes the most drop-off, blocking data-driven funnel optimization.

### Medium

- **Billing success page is a flat confirmation with no activation push** — `BillingSuccessPage` (`app/app/(app)/billing/success/page.tsx`) shows "Subscription active" with links to Dashboard and Settings. This is the highest-intent moment in the paid funnel — a user who just converted from free — and it delivers no celebration, no "here's what you can do now," and no specific next action like "Add up to 5 properties" (Investor) or "Add up to 20 properties" (Pro). The moment is wasted.

- **Re-engagement emails are plain-text only with no HTML template** — `sendOnboardingEmail` (`app/lib/emails/onboarding-reengagement.ts`) sends text-only emails using `text:` with no `html:` body. Plain-text emails are deliverable, but missing a branded HTML template (with dashboard screenshot, product context, and styled CTA button) meaningfully reduces click-through versus a comparable HTML email. Both the Day 3 and Day 7 subjects ("Your Veld dashboard is ready", "Still tracking properties in a spreadsheet?") are adequate but the body copy links directly to `/properties/new?mode=quick` without any in-email preview of what the user will see.

- **No analytics on empty-state CTA conversions post-email** — When a user clicks the re-engagement email link to `/properties/new?mode=quick`, there is no session-tagged analytics event recording "arrived from onboarding email." UTM parameters are supported (`lib/utm-attribution.ts`), but the email links do not append `utm_source=email&utm_medium=onboarding&utm_campaign=day3` (or `day7`). Attribution from email to property creation is invisible.

- **In-app upgrade nudge disappears after 14-day cooldown with no recovery** — `PaidIntentCheckoutBanner` (`app/components/growth/paid-intent-checkout-banner.tsx`) uses a 14-day localStorage cooldown after dismiss. A paid-intent user who dismisses the banner has no other in-app path to checkout other than manually navigating to `/plans`. There is no persistent indicator in the app nav or settings summary reminding them of their stated plan intent.

- **Wizard abandonment analytics event fires only on browser unload** — `beforeunload` is unreliable on mobile browsers (iOS Safari in particular suppresses it). For mobile users, `WIZARD_ABANDONED` may never fire, creating a silent drop-off in mobile analytics.

### Low

- **Post-first-property banner "add another property" prompt is not tracked** — The single-property upsell banner on the dashboard (`app/app/(app)/dashboard/page.tsx` lines 439–455) is a plain `<Link href="/properties/new">` with no PostHog event. This is one of the few in-app upgrade nudges for free users and its click rate is unobserved.

- **The "maybe later" escape hatch in the onboarding modal offers no softer alternative** — The modal's only two choices are "Add first property" (proceeds to wizard) or "Maybe later" (dismisses forever). There is no third option like "Show me around first" that could route a hesitant user to the dashboard with the modal preserved for later re-surfacing, which would preserve activation intent rather than disposing of it.

- **`SUBSCRIPTION_ACTIVATED` is only fired server-side via Stripe webhook** — The billing success page does not fire the client-side event, nor does the cron email filter on subscription status. If the webhook fails or is delayed, PostHog funnel data will show a gap between `checkout_started` and `subscription_activated`. A client-side fallback from `BillingSuccessPage` (with dedup guard) would add resilience.

- **Pricing page has no sign-up CTA above the fold on mobile** — The pricing CTA section (`app/app/pricing/page.tsx` lines 287–344) is at the bottom of the page, after the FAQ and feature comparison. On mobile, a visitor who decides to sign up immediately after reading plan prices must scroll past the comparison table, FAQ, and mockup section to reach the CTA card.

---

## Evidence reviewed

- `app/app/page.tsx` — Landing page: hero, social proof strip, calculator, value props, pricing preview, bottom CTA
- `app/app/pricing/page.tsx` — Pricing page: plans, comparison table, FAQ, bottom CTA
- `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx` — Sign-up view (Clerk wrapper)
- `app/app/sign-up/[[...sign-up]]/page.tsx` — Sign-up page shell
- `app/app/(app)/onboarding-panel.tsx` — Onboarding welcome modal
- `app/app/(app)/dashboard/page.tsx` — Dashboard: empty state, post-first-property banner, single-property upsell
- `app/app/(app)/properties/page.tsx` — Properties list: empty state, over-limit handling, filter UI
- `app/app/(app)/properties/add-property-wizard.tsx` (first 220 lines + step labels) — 4-step wizard
- `app/app/(app)/deals/page.tsx` — Deals page: empty state, at-limit nudge
- `app/app/(app)/billing/success/page.tsx` — Billing success confirmation
- `app/app/(app)/plans/page.tsx` — Plans & billing page
- `app/app/(app)/layout.tsx` — App shell: onboarding props, banner data
- `app/app/(app)/components/over-limit-banner.tsx` — Over-limit upgrade banner
- `app/app/api/cron/onboarding-emails/route.ts` — Day 3 / Day 7 re-engagement cron
- `app/lib/emails/onboarding-reengagement.ts` — Email templates and send helper
- `app/lib/analytics-events.ts` — Full event catalogue
- `app/lib/analytics-client.ts` — Client-side event capture (PostHog + Google Ads)
- `app/lib/plan-intent.ts` — Plan intent storage/resolution
- `app/lib/utm-attribution.ts` — UTM parameter persistence
- `app/lib/onboarding.ts` — Onboarding state model
- `app/components/analytics/posthog-signup-once.tsx` — `user_signed_up` dedup logic
- `app/components/analytics/plan-intent-sign-up-reinforcement.tsx` — Sign-up intent reinforcement
- `app/components/analytics/upgrade-plan-link.tsx` — Upgrade CTA wrapper
- `app/components/growth/paid-intent-checkout-banner.tsx` — Post-signup paid intent nudge
- `app/components/growth/billing-success-clear-intent.tsx` — Checkout intent cleanup
- `app/components/pricing-cards.tsx` (first 80 lines) — Plan cards + feature copy
- `app/app/(app)/draft-context.tsx` (lines 260–295) — Wizard abandonment event

**Assumptions / limits:** Audit is static code review; no live PostHog data, Stripe revenue data, or session recordings were available. Activation rate (6 signups, 0 properties added) is cited from the prior onboarding friction analysis (`docs/audits/2026-04-05-onboarding-friction-analysis.md`).

---

## Risk & impact assessment

**Critical findings (social proof, permanent dismiss):** Both directly reduce conversion from cold traffic and from sign-up to first property. With 0 of 6 activated users, the activation funnel is effectively non-functional. Social proof absence is the highest conversion risk for any new signup considering the product. Permanent dismiss is the highest activation risk for users who did sign up.

**High findings (sign-up page, analytics fragility, 60-second claim):** The sign-up page weakness is a recoverable UX gap that compounds the social proof problem: users arrive with weak trust signals and are presented with a generic form. The `user_signed_up` fragility means the funnel top-of-funnel count may be wrong, making it impossible to accurately measure conversion rates. The "60 seconds" discrepancy creates early attrition at the wizard.

**Medium findings (billing success, plain-text emails, UTM gap):** These are missed opportunity losses rather than immediate blockers. The paid conversion moment and re-engagement email performance are both underoptimized and underobservable.

---

## Recommendations (prioritized)

1. **Add at least minimal social proof to the landing page.** Even early-stage: a count of properties tracked ("Xs properties tracked"), a beta user quote, or a "used by landlords in 20+ states" claim. The social proof strip (lines 314–352, `app/app/page.tsx`) is the right structural location — replace the feature statements with evidence. This is the highest-ROI single change for cold-traffic conversion.

2. **Replace the permanent onboarding dismiss with a re-surfaceable "remind me later."** Store the dismiss as a cooldown (e.g., 3 days) rather than a permanent flag. On each dashboard visit after the cooldown, re-show a lighter version of the modal or an inline banner. This preserves activation intent for users who weren't ready on Day 1 without being intrusive.

3. **Add value reinforcement to the sign-up page.** Wrap the Clerk `<SignUp>` component in a split layout: left side shows 3 feature bullets and a small dashboard mockup; right side has the form. This is a 1-component change to `sign-up-view.tsx` and requires no back-end work.

4. **Instrument the dashboard empty-state CTA and the post-first-property action links with `FunnelCtaLink` or `captureClientEvent`.** These are the highest-visibility activation touch points and currently generate no analytics signal.

5. **Add current step number to `WIZARD_ABANDONED` events.** In `draft-context.tsx`, expose `wizardGetStepRef` in the `beforeunload` handler. This adds one property to an existing event and immediately enables step-level drop-off analysis.

6. **Append UTM parameters to onboarding re-engagement email links.** Add `?utm_source=email&utm_medium=onboarding&utm_campaign=day3` (and `day7`) to both email CTA URLs in `lib/emails/onboarding-reengagement.ts`. This costs one line per email and enables end-to-end email-to-activation attribution in PostHog.

7. **Replace the billing success confirmation with an activation nudge page.** After checkout, the user should see a brief celebration + a specific CTA: "You can now track up to N properties. Add one now." This is the highest-intent moment in the paid funnel and currently wastes it.

8. **Correct the "60 seconds" setup claim to a more accurate framing.** Replace with "Your first property in about 5 minutes" or "Quick-add: just address, rent, and value — takes 2 minutes" (reflecting the quick-add mode). The wizard's `?mode=quick` path is the accurate target.

---

## Task candidates

- [ ] Add real social proof element to landing page social-proof strip (`app/app/page.tsx` lines 314–352) — replace product-feature bullets with user count, quote, or social evidence
- [ ] Convert onboarding modal dismiss from permanent flag to time-based cooldown (e.g. 3-day snooze stored in DB or localStorage) — `onboarding-panel.tsx` + `/api/onboarding`
- [ ] Wrap sign-up page Clerk form in a split-panel layout with feature bullets and a dashboard mockup (`app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`)
- [ ] Add `FunnelCtaLink` or `captureClientEvent` to dashboard empty-state CTA and secondary cards (`app/app/(app)/dashboard/page.tsx` lines 126–155)
- [ ] Add step number to `WIZARD_ABANDONED` event payload in `draft-context.tsx`
- [ ] Append UTM params to Day 3 and Day 7 re-engagement email CTAs (`app/lib/emails/onboarding-reengagement.ts`)
- [ ] Upgrade billing success page to activation nudge with plan-specific CTA ("Add your first property now") — `app/app/(app)/billing/success/page.tsx`
- [ ] Correct "60 seconds" copy to accurate framing on landing page and pricing cards
- [ ] Add a sign-up CTA above the fold on the pricing page mobile layout (`app/app/pricing/page.tsx`)
- [ ] Add `has_draft` + current step to `WIZARD_ABANDONED` and ensure mobile `beforeunload` coverage (or use `visibilitychange` as fallback)
- [ ] Add HTML email template with branded layout to onboarding re-engagement emails (`app/lib/emails/onboarding-reengagement.ts`)

---

## Re-test checklist

- [ ] Verify landing page social proof element renders on mobile and desktop
- [ ] Verify onboarding modal re-surfaces after cooldown period
- [ ] Verify sign-up page split layout renders correctly on mobile
- [ ] Verify `funnel_cta_clicked` events appear in PostHog for dashboard empty-state CTAs
- [ ] Verify `wizard_abandoned` event includes `step` property
- [ ] Verify UTM params appear in PostHog property on activation events from email-triggered sessions
- [ ] Verify billing success page CTA links to correct property-add path for new plan tier
- [ ] `npm run check` (if any of the above involves code changes)

---

## Next trigger and cadence

- **Trigger:** After implementing any Critical or High recommendations, or at 30-day interval
- **Recommended next run:** 2026-05-05 (monthly) or when activation rate crosses 20%
