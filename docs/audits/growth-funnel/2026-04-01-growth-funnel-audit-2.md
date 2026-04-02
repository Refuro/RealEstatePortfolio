# Growth Funnel & Activation Audit — 2026-04-01 (Run 2)

## Executive summary

- Funnel surfaces remain **structurally sound**: marketing pages mount `PlanIntentUrlSync` where expected (home, pricing, tools hub, public calculators), Clerk auth routes resolve to `/dashboard`, and post-checkout `/billing/success` pairs limits copy with `BillingSuccessClearIntent` for intent cleanup.
- **Friction clusters** around **first-session resilience** (silent onboarding API failure), **secondary activation paths** (deal analysis / import behind `<details>` on empty dashboard), and **message consistency** (hero “~60 seconds” vs welcome modal “~2 minutes”).
- **Measurement gaps** persist: **Sign in** in `LandingNav` is not a `FunnelCtaLink`; **at-limit** upgrade on Saved deals uses a plain `/plans` link while the **over-limit** notice uses `UpgradePlanLink` — inconsistent `plan_limit_upgrade_cta_clicked` coverage for the same high-intent surface.
- **Recommendation:** Ship onboarding error feedback and unify upgrade instrumentation on deals at-limit; align setup-time copy; add `PlanIntentUrlSync` to `/sign-in` for campaign parity. Treat analytics consent as a known funnel-blindness factor per `docs/launch/posthog-growth-funnel.md`.

## Severity-ranked findings

### Critical

- None identified — no evidence of broken Stripe checkout wiring, missing `/plans` for enforced limits, or dead-end routes in reviewed acquisition → activation paths.

### High

- **Welcome modal depends on `PATCH /api/onboarding` with no failure UX** — `patchOnboarding` returns `null` on non-OK responses; `handleWelcome` clears `busy` without toast or inline error, so users may repeatedly tap with no progress (`app/app/(app)/onboarding-panel.tsx`). **Impact:** first-session activation drop-off on network/API errors.

- **Empty dashboard hides “Analyze a deal” and CSV import behind closed `<details>`** — Primary CTA is “Add your first property”; alternate paths require expanding “More ways to get started” (`app/app/(app)/dashboard/page.tsx`). **Impact:** slower time-to-first-value for users whose ICP path is deal analysis or spreadsheet import.

### Medium

- **Conflicting setup-time promises** — Home hero trust chip: “Start in about 60 seconds” (`app/app/page.tsx`); welcome modal: “Typical setup time: about 2 minutes” (`app/app/(app)/onboarding-panel.tsx`). **Impact:** minor trust / expectation friction.

- **`/sign-in` does not mount `PlanIntentUrlSync`** — Sign-up view syncs `?intent=` from URL (`app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`); sign-in page is Clerk-only (`app/app/sign-in/[[...sign-in]]/page.tsx`). **Impact:** campaigns that deep-link `/sign-in?intent=…` do not refresh stored intent the same way as sign-up.

- **Saved deals: at-limit upgrade line is not instrumented like over-limit** — When `atLimit`, “Upgrade to save more” is a plain `<Link href="/plans">` (`app/app/(app)/deals/page.tsx`); when `overLimit`, “Upgrade to see all” uses `UpgradePlanLink` with `placement="deals_list_over_limit"`. **Impact:** incomplete `plan_limit_upgrade_cta_clicked` attribution for users exactly at cap (still a high-intent upgrade moment).

- **Welcome modal is not personalized by paid plan intent** — Copy is generic; paid-intent users are nudged elsewhere via `PaidIntentCheckoutBanner` (`app/components/growth/paid-intent-checkout-banner.tsx`) but not in the first-run modal. **Impact:** missed reinforcement for Investor/Pro-intent users still on Free during activation.

- **Client-side funnel events depend on analytics consent** — `docs/launch/posthog-growth-funnel.md` documents that declined optional analytics suppress client events while `subscription_activated` can still fire server-side. **Impact:** understated funnel metrics for non-consenting users; interpret sequential funnels with care.

### Low

- **“Sign in” in marketing nav is not a `FunnelCtaLink`** — `app/components/landing-nav.tsx` uses a plain `Link` to `/sign-in`. **Impact:** `funnel_cta_clicked` gap for returning-user attribution vs tracked sign-up.

- **Paid-intent banner uses plain `Link` to `/plans`** — `PaidIntentCheckoutBanner` “View plans” is not wrapped in `FunnelCtaLink` (`app/components/growth/paid-intent-checkout-banner.tsx`). **Impact:** optional gap vs marketing CTA event taxonomy (lower severity because `/plans` pageviews and downstream checkout events may still capture intent).

- **Social proof remains light on landing and pricing** — Trust chips and product screenshots; no testimonials or usage stats (`app/app/page.tsx`, `app/app/pricing/page.tsx`). **Impact:** objection handling relies on copy, FAQs, and policy links.

## Evidence reviewed

- **Process / template:** `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`
- **Policy / roadmap / analytics:** `docs/policies/design-spec.md` (§1.1), `docs/reference/roadmap.md` (§1 product map, Tools hub), `docs/launch/posthog-growth-funnel.md`
- **Landing & pricing:** `app/app/page.tsx`, `app/components/landing-nav.tsx`, `app/app/pricing/page.tsx`, `app/components/marketing/funnel-cta-link.tsx`
- **Public acquisition & tools:** `app/app/tools/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/app/lp/investment-property-calculator/page.tsx`
- **Auth:** `app/app/sign-in/[[...sign-in]]/page.tsx`, `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/components/analytics/plan-intent-url-sync.tsx`
- **Onboarding & activation:** `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/add-property-wizard.tsx` (redirect with `onboarding=first-property`)
- **Paywall & upgrade:** `app/app/(app)/deals/page.tsx`, `app/components/analytics/upgrade-plan-link.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx`, `app/components/growth/billing-success-clear-intent.tsx`, `app/app/(app)/billing/success/page.tsx`
- **Contact (support path):** `app/app/contact/page.tsx`

**Limits of this pass:** Static code and documentation review only — no production PostHog session verification, no live Clerk or Stripe exercises. Same date as `2026-04-01-growth-funnel-audit.md` (Run 1); this run independently re-verifies key paths and refines findings (e.g. deals page now uses `UpgradePlanLink` for over-limit only).

## Risk & impact assessment

- **High findings** affect **activation rate** and **support burden** (confused users) more than immediate revenue; exposure is **moderate** on typical networks but spikes when APIs fail.
- **Medium findings** skew **measurement, campaign parity, and message trust**; impact grows with paid acquisition and segmented email/ads.
- **Low findings** are **optimization** unless the brand leans heavily on social proof or granular CTA analytics.

## Recommendations (prioritized)

1. **Harden onboarding PATCH UX** — Surface a non-blocking error and optional retry when `patchOnboarding` returns null; avoid leaving the modal in an ambiguous state.
2. **Expose one secondary path on empty dashboard without requiring `<details>`** — e.g. an outline “Analyze a deal” next to “Add your first property,” keeping CSV in secondary placement if needed.
3. **Unify setup-time messaging** — Single band across home chips, welcome modal, and any pricing footers.
4. **Add `PlanIntentUrlSync` to the sign-in route** — Mirror sign-up for `?intent=` parity (small wrapper with `Suspense` as on other pages).
5. **Wrap deals at-limit “Upgrade to save more” with `UpgradePlanLink`** — New placement (e.g. `deals_header_at_limit`) for parity with `deals_list_over_limit`.
6. **Document analytics consent caveats** in growth readouts — When reporting funnel conversion, segment or footnote users who decline optional analytics per `docs/launch/posthog-growth-funnel.md`.

## Task candidates (optional)

- [ ] Add error/retry UX to `OnboardingPanel` when `/api/onboarding` PATCH fails
- [ ] Elevate “Analyze a deal” (or import) on dashboard empty state without relying on closed `<details>`
- [ ] Align “60 seconds” vs “2 minutes” copy across `app/app/page.tsx` and `app/app/(app)/onboarding-panel.tsx`
- [ ] Mount `PlanIntentUrlSync` on `app/app/sign-in/[[...sign-in]]/page.tsx`
- [ ] Replace at-limit plain `Link` in `app/app/(app)/deals/page.tsx` with `UpgradePlanLink` + placement
- [ ] (Optional) Use `FunnelCtaLink` for “Sign in” in `app/components/landing-nav.tsx` with a distinct `placement`

## Re-test checklist

- [ ] Verify onboarding modal behavior when `/api/onboarding` returns 4xx/5xx (error UX)
- [ ] Verify empty dashboard shows intended secondary CTA without extra clicks
- [ ] Verify `plan_limit_upgrade_cta_clicked` fires from deals page at-limit and over-limit paths
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Monthly, before major paid acquisition pushes, or after material funnel/auth/billing changes
- **Recommended next run:** 2026-05-01 or next release with onboarding/pricing/auth touchpoints
