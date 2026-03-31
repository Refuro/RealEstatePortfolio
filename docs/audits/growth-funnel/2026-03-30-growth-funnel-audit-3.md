# Growth Funnel & Activation Audit — 2026-03-30 (Run 3).

## Executive summary

- Acquisition and activation are instrumented end-to-end: plan intent + UTM persistence, deduplicated PostHog funnel events, Stripe-backed monetization events, and optional Google Ads gtag conversions behind the same analytics consent gate as PostHog.
- Primary UX paths (landing → sign-up → dashboard welcome modal → add property, plus pricing/checkout) are coherent; empty-state dashboard and post-first-property messaging support time-to-value.
- No funnel-breaking defects identified in code review; remaining gaps are mainly **measurement consistency** on a few high-intent links that bypass `FunnelCtaLink`, and **conversion lift** still limited by absent trust/social proof on public surfaces.
- Overall recommendation: safe to proceed with launch telemetry QA per `docs/launch/pre-live-telemetry-qa-2026-03-30.md`; prioritize optional CTA instrumentation where paid traffic lands.

## Severity-ranked findings

### Critical

- None.

### High

- None identified.

### Medium

- **Pricing page bottom “Create free account” is not a tracked funnel CTA** — High-intent users who scroll to the FAQ-style block lose `funnel_cta_clicked` and rely on navigation alone; `plan_intent` is not set via `setPlanIntent` on that click (unlike `PricingCards` sign-up buttons, which call `setPlanIntent(..., "pricing_card")`). — `app/app/pricing/page.tsx` (footer CTA `Link` to `/sign-up`).

- **Public calculator page inline “create a free account” link is untracked** — Body copy uses a plain `Link` without `funnel_cta_clicked` or `setPlanIntent`, so behavior diverges from `PublicCalculator` CTAs that use `FunnelCtaLink` and `planIntent`. — `app/app/investment-property-calculator/page.tsx`.

- **Trust and objection handling remain thin on marketing surfaces** — No testimonials, logos, or third-party proof on home/pricing; continues to cap conversion efficiency during paid or broad acquisition (aligned with deferred backlog items from prior runs).

### Low

- **Home “Simple pricing” section uses a plain `Link` for “View pricing”** — Secondary pricing entry in the lower section does not emit `funnel_cta_clicked`, while the hero “See pricing” does via `FunnelCtaLink`. — `app/app/page.tsx`.

- **`docs/launch/analytics.md` dedup key naming mismatch** — Doc references `veld_ph_signup_{userId}` for `user_signed_up` deduplication; implementation uses prefix `veld_ph_signup_sent_` in `app/components/analytics/posthog-signup-once.tsx`. Operators verifying storage keys in DevTools may be misled.

## Evidence reviewed

- Process: `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`
- Landing & marketing: `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/app/lp/investment-property-calculator/page.tsx`, `app/components/landing-nav.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/components/marketing/public-calculator.tsx`
- Sign-up & onboarding: `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/app-layout-client.tsx`
- Analytics & attribution: `app/lib/analytics-events.ts`, `app/lib/analytics-client.ts`, `app/lib/utm-attribution.ts`, `app/lib/plan-intent.ts` (referenced via sync), `app/components/analytics/posthog-provider.tsx`, `posthog-signup-once.tsx`, `posthog-plan-intent.tsx`, `plan-intent-url-sync.tsx`, `app/components/pricing-cards.tsx` (checkout + sign-up intent)
- Google Ads: `app/components/analytics/google-ads-gtag.tsx`, `app/app/layout.tsx`
- Launch docs: `docs/launch/analytics.md`, `docs/launch/pre-live-telemetry-qa-2026-03-30.md`, `docs/launch/posthog-views-setup.md` (referenced for funnel/insight context)

**Limits:** Static review only; no production PostHog or Ads UI verification. Runtime behavior (consent, live events) assumes env keys set as documented.

## Risk & impact assessment

Unresolved medium items skew **funnel analytics** (under-counted CTAs, weaker plan-intent resolution on some paths) rather than product functionality. Trust gaps affect **conversion rate** under competitive traffic. Likelihood of impact rises with paid spend and with users who convert from lower-page or inline-copy links.

## Recommendations (prioritized)

1. Replace or wrap the pricing page footer “Create free account” and the calculator inline sign-up link with `FunnelCtaLink` (or equivalent `setPlanIntent` + `funnel_cta_clicked`) so bottom-of-page and in-copy conversions match hero and card instrumentation.
2. Align `docs/launch/analytics.md` dedup storage key wording with `veld_ph_signup_sent_*` (or rename code to match the doc—pick one source of truth).
3. Execute `docs/launch/pre-live-telemetry-qa-2026-03-30.md` browser checks in staging/production before scaling ad spend.
4. When creative assets exist, promote trust-strip or social proof work from backlog to improve landing and pricing persuasion.

## Task candidates (optional)

- [ ] Add `FunnelCtaLink` (with `placement`/`cta_id`/`planIntent`) for pricing page footer “Create free account” and calculator page inline “create a free account” link.
- [ ] Optionally add `FunnelCtaLink` for home “Simple pricing” section “View pricing” button for consistent session-level CTA coverage.
- [ ] Fix `user_signed_up` dedup key documentation in `docs/launch/analytics.md` to match `posthog-signup-once.tsx`.

## Re-test checklist

- [ ] After CTA changes: confirm new `funnel_cta_clicked` rows and `plan_intent` on affected paths in PostHog Live (with consent on).
- [ ] Confirm no regression on pricing sign-up and checkout flows (`npm run check` when code changes are made).
- [ ] Re-run pre-live telemetry QA checklist for UTM, signup conversion, and activation conversion labels.

## Next trigger and cadence

- **Trigger:** Material changes to landing copy, pricing, sign-up, onboarding, or analytics event names; significant paid campaign or IA updates.
- **Recommended cadence:** Monthly, or after each major funnel experiment.
