# Growth Funnel & Activation Audit — 2026-04-01

## Executive summary

- The end-to-end funnel from landing CTA → sign-up → onboarding modal → first property creation is structurally sound and mostly well-instrumented, with dedup logic correctly preventing duplicate events at every tracked step.
- Two concrete instrumentation gaps exist: the landing page pricing-preview "View pricing" `<Link>` is untracked, and upgrade CTAs that surface from `PLAN_LIMIT_HIT` error states are plain `<Link>` elements with no `funnel_cta_clicked` coverage — both represent blind spots in conversion attribution.
- The sign-up page provides zero intent reinforcement: users who arrived with `?intent=investor` or `?intent=pro` see the same Clerk widget as `?intent=free` users, missing a high-value moment to confirm the plan choice and reduce drop-off.
- Activation path from empty-state dashboard partially buries alternative first-actions (CSV import, deal analysis) behind a `<details>` disclosure that defaults closed, reducing discoverability for users who are not yet ready to add a property.
- Overall instrumentation health is good for new events (Batch 10), server-side events are correctly gated off cookie consent, and plan intent propagation logic is robust with one minor ordering edge case.

---

## Severity-ranked findings

### Critical

- None identified.

### High

**H1 — Pricing preview "View pricing" link on landing is untracked**
The landing page (`app/app/page.tsx`, line 262–266) renders a plain `<Link href="/pricing">View pricing</Link>` inside the pricing preview section. This link is not wrapped in `FunnelCtaLink`, so no `funnel_cta_clicked` event fires when a visitor navigates from the homepage pricing summary to `/pricing`. This is one of the most likely pre-signup navigation paths and represents a blind spot in the funnel.

**H2 — Upgrade CTAs after PLAN_LIMIT_HIT are untracked**
When a user hits a property or deal limit, `add-property-wizard.tsx` (line ~1460–1468), `deal-analyzer-form.tsx`, and `property-form.tsx` surface an inline error message with an "Upgrade plan" text-link to `/plans`. These are rendered as plain `<button>` or underline text with `draft?.navigateTo("/plans")`, not as `FunnelCtaLink`. The click that takes a limit-hit user to the upgrade path — arguably the highest-intent upgrade signal — is not captured in PostHog.

**H3 — Sign-up page has no plan-intent reinforcement**
`sign-up-view.tsx` renders the Clerk `<SignUp>` widget and a ToS blurb, regardless of the `?intent=` value in the URL. A user who clicked "Choose Investor" on the pricing page and landed on `/sign-up?intent=investor` sees an identical page to a free-intent user. This misses a critical persuasion moment: confirming to the user what they're about to unlock and why they should complete registration.

### Medium

**M1 — Empty-state alternative first actions hidden in `<details>` disclosure**
The dashboard empty state (`app/app/(app)/dashboard/page.tsx`, lines 127–146) places "Analyze a deal" and CSV import links inside a `<details>/<summary>` block titled "More ways to get started." The disclosure is closed by default. New users who are not immediately ready to add a property (e.g., they're still in deal-analysis mode, or they imported a spreadsheet) will not see these paths unless they actively expand the section. This reduces time-to-first-value for a meaningful subset of new users.

**M2 — `PaidIntentCheckoutBanner` re-appears on every new session**
`paid-intent-checkout-banner.tsx` dismisses via `sessionStorage` key `veld_paid_intent_checkout_banner_dismissed`. Each new browser session re-shows the banner to a free-tier user who has a paid intent in `localStorage`. If a user accumulates many sessions without converting, they will be shown the same "You started signup with the Investor plan in mind" message repeatedly, risking banner fatigue. There is no per-user `localStorage` dismiss key for the banner, unlike onboarding dedup.

**M3 — `plan_intent_applied` localStorage write races with navigation**
In `posthog-plan-intent.tsx` (lines 42–49), `fired.current = true` is set synchronously, then `captureClientEvent` is called, and the `localStorage` key is written afterwards. If the user navigates away between these lines (component unmounts before line 49 executes), `fired.current` is reset on the next mount and localStorage has no key, so `plan_intent_applied` would fire again on the next page load. Probability is very low but the key write should precede or be atomic with the event fire to be safe.

**M4 — No differentiated onboarding for high-intent users**
The `OnboardingPanel` welcome modal (`onboarding-panel.tsx`) shows identical copy ("Build your real estate portfolio in minutes") to all new users regardless of whether they signed up with `intent=free`, `intent=investor`, or `intent=pro`. Users with a paid intent are not surfaced the message "You chose Investor — complete your first property to get full value before upgrading." This is a missed personalization opportunity to increase activation for paid-intent users.

**M5 — Billing success page is generic**
`billing/success/page.tsx` correctly clears plan intent (`BillingSuccessClearIntent`) and links to dashboard, but the copy is minimal: "Your plan is now active and your property and saved-deal limits have been updated." It does not tell the user what their new limits are, suggest the next action (e.g., "You can now track up to 5 properties — add your next one"), or confirm which plan they activated. This is a post-conversion momentum gap.

### Low

**L1 — Landing page has no social proof beyond trust chips**
The homepage has three trust micro-signals ("No card required for Free", "Start in about 60 seconds", "Cancel anytime") and one product screenshot. There are no testimonials, user counts, properties-analyzed totals, or reviewer quotes. The pricing page similarly lacks social proof beyond FAQs. For a SaaS targeting investors who make data-driven decisions, third-party validation signals reduce conversion friction.

**L2 — Calculator section CTA leads to `/investment-property-calculator`, not sign-up**
`landing_how_it_works` CTA (`ctaId: "open_public_calculator"`) navigates to the public full calculator page. Users who engage deeply with the tool have demonstrated strong product intent but are not nudged toward sign-up from within the calculator or from the compact landing preview. There is no CTA at the bottom of the calculator or the public tool page directing high-engagement users to create an account.

**L3 — Sign-in nav link is untracked**
The `<Link href="/sign-in">Sign in</Link>` in `landing-nav.tsx` (line 103–108) is a plain Next.js link. Returning-user sign-ins are not tracked as funnel events. While less critical than new signups, this means PostHog cannot attribute which landing variant/session correlates with sign-in attempts vs. new signups.

**L4 — `PostHogPersonProperties` fires on every navigation**
`posthog-person-properties.tsx` (line 49) includes `pathname` in the `useEffect` dependency array, triggering a fresh `/api/me` fetch on every client-side route change. For a user navigating across multiple workspace pages in a session, this could generate 10–20 serial fetch calls. The data is relatively static (tier, property count) and rarely changes mid-session; a session-scoped cache or a longer re-sync interval would reduce load without meaningfully degrading analytics freshness.

**L5 — `PlanIntentUrlSync` missing from sign-in page**
`SignUpView` correctly mounts `PlanIntentUrlSync`. However, `sign-in/[[...sign-in]]/page.tsx` does not wrap its view component in a similar sync. A user who re-visits `/sign-in?intent=investor` would not have their intent refreshed/restarted, though in practice intent is already set from the earlier sign-up visit.

---

## Evidence reviewed

| Surface / File | Notes |
|---|---|
| `app/app/page.tsx` | Landing page — hero CTAs, pricing preview, calculator section |
| `app/app/pricing/page.tsx` | Pricing page — PricingCards, FAQ, footer CTA |
| `app/app/(app)/plans/page.tsx` | In-app Plans & billing |
| `app/app/(app)/dashboard/page.tsx` | Empty state + post-property onboarding banner |
| `app/app/(app)/onboarding-panel.tsx` | Welcome modal, analytics step firing |
| `app/app/(app)/properties/new/page.tsx` + `add-property-wizard.tsx` | Wizard flow, milestone tracking, PROPERTY_CREATED fire |
| `app/app/(app)/billing/success/page.tsx` | Post-checkout success page |
| `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx` | Sign-up page content |
| `app/components/landing-nav.tsx` | Nav CTAs, mobile menu |
| `app/components/marketing/funnel-cta-link.tsx` | FunnelCtaLink component |
| `app/components/pricing-cards.tsx` | Pricing card logic, checkout_started fire, setPlanIntent |
| `app/components/growth/paid-intent-checkout-banner.tsx` | Post-signup paid intent nudge |
| `app/components/growth/billing-success-clear-intent.tsx` | Intent clear after checkout |
| `app/components/analytics/posthog-signup-once.tsx` | user_signed_up dedup |
| `app/components/analytics/posthog-plan-intent.tsx` | plan_intent_applied dedup |
| `app/components/analytics/posthog-person-properties.tsx` | Person property sync |
| `app/components/analytics/plan-intent-url-sync.tsx` | URL intent sync |
| `app/lib/analytics-events.ts` | All event names |
| `app/lib/analytics-dedup.ts` | Session/localStorage dedup helpers |
| `app/lib/plan-intent.ts` | Intent storage, TTL, precedence rules |
| `docs/launch/analytics.md` | Event spec, dedup rules, PM checklist |
| `docs/launch/posthog-growth-funnel.md` | Funnel step definitions |

**Limits of this audit pass:** Code-only review. No live PostHog data was consulted; actual funnel drop-off rates and event volumes are unknown. Audit assumed `NEXT_PUBLIC_POSTHOG_KEY` is set and cookie consent is accepted for all instrumentation assertions. Server-side webhook events (`subscription_activated`, `subscription_updated`, `subscription_canceled`) were reviewed at route level but not traced through all webhook retry scenarios.

---

## Risk & impact assessment

- **H1 (untracked pricing CTA):** Direct impact on conversion attribution; PM cannot accurately measure homepage → /pricing → signup funnel without this link tracked. Medium-low engineering effort to fix; high analytical value.
- **H2 (untracked upgrade-from-limit CTAs):** Limit-hit upgrade attempts are the most purchase-ready signal in the app. Losing this means PostHog funnels undercount conversion intent after paywall, and A/B testing the error copy is impossible without the event.
- **H3 (no intent reinforcement at sign-up):** Higher abandonment risk for paid-intent users who feel the sign-up flow doesn't confirm their intended plan. Reinforcing the intent (e.g., a one-line header "You're signing up for Investor") is a low-effort persuasion improvement with potentially measurable drop-off reduction.
- **M1 (hidden alternative actions):** Affects users who are not in a "ready to add a property" mode — deal analyzers, importers — slowing their time-to-first-value without blocking it.
- **M2 (banner fatigue):** Risk of desensitizing high-value users who have paid intent but are not yet ready to upgrade, potentially causing them to dismiss and disengage rather than convert later.
- **M3 (race condition):** Very low probability edge case; unlikely to surface in practice but could create spurious duplicate `plan_intent_applied` events in analytics, inflating apparent intent application counts.

---

## Recommendations (prioritized)

1. **Wrap the landing page pricing-preview "View pricing" link in `FunnelCtaLink`** (`placement: "landing_pricing_preview"`, `ctaId: "view_pricing_from_summary"`). One-line change, restores funnel visibility for a high-traffic click path.

2. **Instrument upgrade CTAs at `PLAN_LIMIT_HIT` sites** — replace the inline `draft?.navigateTo("/plans")` button and link with `FunnelCtaLink` (or capture a `funnel_cta_clicked` event inline) so limit-hit upgrade attempts are tracked as a distinct funnel signal.

3. **Add plan-intent context to the sign-up page** — read the `?intent=` param (already in URL/storage via `PlanIntentUrlSync`) and surface a one-line contextual header above the Clerk widget: e.g., "Signing up for Investor access. Complete setup below." This requires client-side intent read from `getPlanIntentForAnalytics` and a small conditional render.

4. **Expand empty-state "More ways to get started" by default** or surface "Analyze a deal" and "Import from CSV" as visible secondary CTAs below the primary "Add your first property" button, eliminating the `<details>` gate for new users.

5. **Upgrade billing success page** with contextual content: show the user their new plan name and updated limits (properties/deals), and provide a next-step suggestion (e.g., "You can now track up to 5 properties — add your next one") to capitalize on the conversion moment.

6. **Move the `PaidIntentCheckoutBanner` dismiss to `localStorage` with a bounded expiry** (e.g., 7 days) rather than per-session `sessionStorage`. This prevents re-showing to already-engaged users on every new session while still re-surfacing for users who return after a long gap.

7. **Add a `plan_intent_applied` localStorage write before the event fire** (swap lines 42–49 in `posthog-plan-intent.tsx`: write localStorage first, then set `fired.current = true`, then capture) to eliminate the ordering race.

---

## Task candidates

- [ ] Wrap landing pricing-preview "View pricing" in `FunnelCtaLink` with `placement: "landing_pricing_preview"` (`app/app/page.tsx`, line ~262)
- [ ] Replace `PLAN_LIMIT_HIT` upgrade link in `add-property-wizard.tsx` with a tracked CTA (`app/app/(app)/properties/add-property-wizard.tsx`, line ~1460–1468)
- [ ] Repeat tracked upgrade CTA for `deal-analyzer-form.tsx` and `property-form.tsx` PLAN_LIMIT_HIT paths
- [ ] Add plan-intent contextual header to `sign-up-view.tsx` above the Clerk widget
- [ ] Expand (or remove) `<details>` wrapper around alternative empty-state actions in `dashboard/page.tsx`
- [ ] Upgrade billing success copy to show plan name and new limits (`billing/success/page.tsx`)
- [ ] Move `PaidIntentCheckoutBanner` dismiss key to localStorage with 7-day TTL (`paid-intent-checkout-banner.tsx`)
- [ ] Swap localStorage write before `captureClientEvent` in `posthog-plan-intent.tsx` to fix ordering race

---

## Re-test checklist

- [ ] Verify `funnel_cta_clicked` fires for pricing-preview "View pricing" link after fix (PostHog Live view)
- [ ] Verify `funnel_cta_clicked` fires for upgrade CTA in PLAN_LIMIT_HIT error state for property and deal flows
- [ ] Verify plan-intent header renders correctly on sign-up page for all three intents (`free`, `investor`, `pro`) and is absent when intent is `undecided`
- [ ] Verify empty-state alternative actions are visible on first load without interaction
- [ ] Verify billing success page shows correct plan name after upgrade
- [ ] Verify `PaidIntentCheckoutBanner` does not reappear within the dismiss window after localStorage fix
- [ ] Verify `plan_intent_applied` fires at most once per user across sessions (localStorage key present after first fire)
- [ ] `npm run check` (when code changes are made)

---

## Next trigger and cadence

- **Trigger:** Pre-launch / post-Batch 10 deploy, or after any significant change to landing copy, sign-up flow, or pricing cards
- **Recommended next run date/window:** 2026-07-01 (quarterly), or sooner if paid ads are activated and funnel performance is being tracked against spend targets
