# Growth Funnel & Activation Audit — 2026-03-28

## Executive summary

- **Overall:** The **landing → Clerk sign-up → dashboard** path is coherent: hero CTAs point to `/sign-up`, `afterSignUpUrl="/dashboard"` (`app/app/sign-up/[[...sign-up]]/page.tsx`), and first-session **welcome modal** plus empty-dashboard state steer users to **first property** (`app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`). **PostHog** is wired app-wide (`app/app/layout.tsx`) with **`$pageview`**, **identify**, **`user_signed_up`** (once per user), and a small set of **custom events** (`app/lib/analytics-events.ts`).
- **Top risks:** **Funnel measurement** is thin beyond pageviews and five named events — hard to localize drop-off between landing CTA, Clerk, welcome modal, and wizard completion. **Logged-out upgrade intent** on `/pricing` is **not** passed into sign-up (all paid cards link to `/sign-up` only — `app/components/pricing-cards.tsx`), so product analytics cannot distinguish “came for Investor vs Pro” until checkout.
- **Recommendation:** Add **hypothesis-driven events** (CTA source, welcome modal outcomes, wizard section completion or time-on-task) and, if business needs plan-aware acquisition, **query params or session storage** from pricing → sign-up → first session. Keep **activation copy** in the welcome modal and dashboard empty state as the primary loop; validate with funnel charts in PostHog once events exist.

## Severity-ranked findings

### Critical

- *(none identified in this pass)*

### High

- **Sparse custom event taxonomy for the core funnel** — Only `user_signed_up`, `property_created`, `deal_created`, `checkout_started`, and `subscription_activated` are defined (`app/lib/analytics-events.ts`). There are **no** events for primary CTA clicks, Clerk step completion, welcome modal (“Add first property” vs “Maybe later”), or wizard milestones. **Impact:** Funnel analysis relies heavily on **`$pageview`** and inference; cannot quantify friction on the highest-leverage steps. **Evidence:** `app/lib/analytics-events.ts`, `app/components/pricing-cards.tsx` (no capture on public CTAs), `app/app/(app)/onboarding-panel.tsx` (no analytics imports).

- **Logged-out paid plan CTAs collapse to generic sign-up** — For `showSignUp`, Investor and Pro cards use `href="/sign-up"` with no `?plan=` or equivalent (`app/components/pricing-cards.tsx`). Copy says “Choose Investor” / “Choose Pro” but the destination is identical. **Impact:** Messaging mismatch, lost attribution for paid intent, and harder remarketing/segmentation. **Evidence:** `app/components/pricing-cards.tsx` (links for `canUpgrade && showSignUp`).

### Medium

- **Welcome modal activation loop is uninstrumented** — The first-session modal (`app/app/(app)/onboarding-panel.tsx`) is a key activation surface but emits **no** PostHog events when shown, dismissed, or when the user navigates to `/properties/new`. **Impact:** Cannot measure modal lift vs “Maybe later” or time-to-first-property from this entry point.

- **`user_signed_up` eligibility window** — `PostHogSignupOnce` only fires when the Clerk account is **new within 7 days**; otherwise it marks storage and exits (`app/components/analytics/posthog-signup-once.tsx`). **Impact:** Safer for avoiding false positives, but tests, support-created accounts, or edge timing may **miss** the event; funnel denominators need documentation.

- **Paid conversion confirmation is split between client and server** — `checkout_started` fires client-side before redirect (`app/components/pricing-cards.tsx`); `subscription_activated` fires from the **Stripe webhook** on `checkout.session.completed` (`app/app/api/billing/webhook/route.ts`). The **billing success** page (`app/app/(app)/billing/success/page.tsx`) has **no** dedicated client event. **Impact:** Generally workable if webhooks are reliable, but harder to debug “checkout completed in browser but webhook delayed” scenarios in product analytics alone.

- **Add-property path length** — First value requires completing **`AddPropertyWizard`** (multi-section flow — `app/app/(app)/properties/add-property-wizard.tsx`) or alternate **`PropertyForm`** path (`app/app/(app)/properties/property-form.tsx`). Both fire `property_created` on success, but the **wizard is heavy** relative to “2 minutes” copy in the welcome modal (`app/app/(app)/onboarding-panel.tsx`). **Impact:** Potential **time-to-first-value** risk for impatient users; measurement gap without step events.

### Low

- **Auth pages are minimal** — Sign-in (`app/app/sign-in/[[...sign-in]]/page.tsx`) has no app chrome linking back to `/`; users rely on Clerk UI or browser back. **Impact:** Minor continuity friction, not a blocker if Clerk-hosted UI is trusted.

- **SEO on auth routes** — `robots: { index: false }` on sign-in/sign-up (`app/app/sign-in/.../page.tsx`, `app/app/sign-up/.../page.tsx`) is appropriate; paid landing traffic should hit `/` and `/pricing`, not auth URLs.

## Evidence reviewed

- **Public acquisition:** `app/app/page.tsx`, `app/components/landing-nav.tsx`, `app/app/pricing/page.tsx`, `app/components/pricing-cards.tsx`, `app/app/contact/page.tsx` (not deep-dived — public trust surface exists)
- **Auth:** `app/app/sign-in/[[...sign-in]]/page.tsx`, `app/app/sign-up/[[...sign-up]]/page.tsx`, `app/proxy.ts` (public route list)
- **Activation:** `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/api/onboarding/route.ts`, `app/lib/onboarding.ts`, `app/app/(app)/properties/new/page.tsx`, `app/app/(app)/app-nav.tsx`
- **Upgrade / paid:** `app/app/(app)/plans/page.tsx`, `app/app/api/billing/create-checkout-session/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/(app)/billing/success/page.tsx`, `app/app/(app)/components/over-limit-banner.tsx`
- **Analytics:** `app/app/layout.tsx`, `app/components/analytics/posthog-*.tsx`, `app/lib/analytics-client.ts`, `app/lib/analytics-events.ts`, `app/lib/posthog-server.ts`
- **Secondary activation:** `app/app/(app)/analyze/deal-analyzer-form.tsx` (`deal_created` event)
- **Reference:** `docs/process/growth-funnel-audit-process.md`, `docs/policies/design-spec.md` (not line-audited for copy compliance in this pass)

**Limits:** No production PostHog project access; no session recordings or live conversion data. Assessment is **static code + flow** review only.

## Risk & impact assessment

Unresolved **measurement gaps** mainly hurt **optimization velocity** (where to A/B test, which copy fails) rather than blocking users from completing flows. **Pricing CTA → sign-up** ambiguity affects **marketing attribution** and **expectation setting** more than core product stability. **Webhook-dependent** subscription events are standard but add an ops dependency for analytics completeness.

## Recommendations (prioritized)

1. **Expand event schema** for the acquisition → activation path: at minimum CTA identifiers on landing/pricing (even via `captureClientEvent` on `Link` click handlers or a thin wrapper), welcome modal actions, and optional wizard step indices or duration buckets.
2. **Pass plan intent** from logged-out pricing to the authenticated journey (query param preserved through sign-up, or post-auth redirect to `/plans` with a banner) so “Choose Pro” behavior matches user expectation and analytics.
3. **Dashboard + modal alignment:** Keep a single narrative from “Welcome” → first property → `?onboarding=first-property` next steps (`app/app/(app)/dashboard/page.tsx`); add metrics before changing copy.
4. **Document funnel definitions** in-repo (which event marks “activated”) so PostHog dashboards stay consistent with `AnalyticsEvents`.
5. **Optional:** Client-side event on `billing/success` mirroring server `subscription_activated` for debugging (dedupe by `session_id` if implemented).

## Task candidates (optional)

- [ ] Add `cta_click` (or similar) on landing hero and pricing primary buttons with `location` / `label` properties.
- [ ] Add `welcome_modal_shown`, `welcome_modal_dismissed`, `welcome_modal_start_property` events in `onboarding-panel.tsx`.
- [ ] Add `?intent=investor|pro` (or `plan`) to `/sign-up` from pricing cards and persist for post-auth messaging or redirect.
- [ ] Add lightweight `billing_success_viewed` client event on `/billing/success` (optional dedupe).
- [ ] Add wizard milestone events (e.g. section completed) or a single `add_property_wizard_started` event.
- [ ] PostHog insight: funnel `$pageview` `/` → `$pageview` `/sign-up` → `user_signed_up` → `property_created` → `checkout_started` → `subscription_activated` with cohort filters.
- [ ] UX copy review: align “Choose Investor/Pro” with same post-sign-up path or change CTAs to “Start free, upgrade anytime” if plan-preservation is deferred.
- [ ] Review Clerk `appearance` to add logo/home link on sign-in for continuity.
- [ ] Document `user_signed_up` 7-day rule in internal analytics runbook.

## Re-test checklist

- [ ] Verify new/updated events appear in PostHog with correct properties in staging.
- [ ] Logged-out: `/` → `/sign-up` → dashboard → welcome modal → `/properties/new` → `property_created` fires once per creation path.
- [ ] Logged-in upgrade: `/plans` → checkout → Stripe → webhook → `subscription_activated` + DB tier update.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Pricing or onboarding redesign; major marketing campaign; monthly growth review.
- **Recommended next run:** **2026-04-28** or after any **analytics schema** change.
