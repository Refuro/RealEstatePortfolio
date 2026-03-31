# Growth Funnel & Activation Audit — 2026-03-30 (Run 4)

## Executive summary

- **Funnel instrumentation remains strong** for primary paths: plan intent + UTM persistence, session-deduplicated `funnel_cta_clicked`, PostHog lifecycle events (signup, onboarding, property milestones, subscription), and Stripe-backed monetization; Google Ads gtag remains behind the same consent gate as PostHog where configured.
- **Activation UX is coherent**: landing → sign-up (Clerk) → `/dashboard` with welcome modal → add property; empty dashboard and post-first-property banner support time-to-first-value; add-property wizard emits `add_property_milestone_reached` at defined steps.
- **No new funnel-breaking defects** surfaced in this pass; **Run 3 gaps persist**: several high-intent links still bypass `FunnelCtaLink` / `setPlanIntent`, documentation for signup dedup storage keys still disagrees with code, and public marketing surfaces still lack trust/social proof.
- **Overall recommendation:** Treat optional CTA instrumentation and doc alignment as the next low-effort wins; continue launch/telemetry QA per existing launch docs before scaling paid traffic.

## Severity-ranked findings

### Critical

- None.

### High

- None identified.

### Medium

- **Pricing page bottom “Create free account” is not a tracked funnel CTA** — The FAQ-style block’s primary button uses a plain `Link` to `/sign-up` without `funnel_cta_clicked` or `setPlanIntent`, unlike `PricingCards` sign-up actions which call `setPlanIntent(..., "pricing_card")`. High-intent scrollers are under-represented in session CTA analytics and lose explicit plan-intent writes from that click. — `app/app/pricing/page.tsx` (lines ~146–151).

- **Public `/investment-property-calculator` inline “create a free account” remains untracked** — Body copy after `PublicCalculator` uses a plain `Link` with `?intent=free` (URL can still sync via `PlanIntentUrlSync`) but does not emit `funnel_cta_clicked` or `setPlanIntent` like `FunnelCtaLink` paths. Contrast: the paid LP variant wraps a footer “Create free account” in `FunnelCtaLink` (`app/app/lp/investment-property-calculator/page.tsx`). — `app/app/investment-property-calculator/page.tsx` (lines ~94–100).

- **Trust and objection handling remain thin on marketing surfaces** — No testimonials, logos, or third-party proof on home/pricing; limits conversion efficiency under competitive or cold traffic (unchanged from prior audits; aligns with deferred backlog).

### Low

- **Home “Simple pricing” section uses a plain `Link` for “View pricing”** — Secondary pricing entry does not emit `funnel_cta_clicked`, while hero “See pricing” uses `FunnelCtaLink`. — `app/app/page.tsx` (lines ~256–261).

- **`docs/launch/analytics.md` dedup key naming mismatch for `user_signed_up`** — Documentation references `localStorage` key `veld_ph_signup_{userId}`; implementation uses prefix `veld_ph_signup_sent_` in `app/components/analytics/posthog-signup-once.tsx`. Operators checking DevTools may be misled.

## Evidence reviewed

- Process: `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`
- Prior audit: `docs/audits/growth-funnel/2026-03-30-growth-funnel-audit-3.md`
- Landing & marketing: `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/app/lp/investment-property-calculator/page.tsx`, `app/components/landing-nav.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/components/marketing/public-calculator.tsx`, `app/components/pricing-cards.tsx`
- Sign-up & onboarding: `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/app-layout-client.tsx`
- Analytics & attribution: `app/lib/analytics-events.ts`, `app/lib/plan-intent.ts`, `app/lib/utm-attribution.ts`, `app/components/analytics/posthog-signup-once.tsx`, `plan-intent-url-sync.tsx`
- Activation depth: `app/app/(app)/properties/add-property-wizard.tsx` (`add_property_milestone_reached`)
- Launch docs: `docs/launch/analytics.md`

**Limits:** Static code review only; no production PostHog or Ads UI verification. Runtime behavior (consent, live events) assumes environment keys are set as documented.

## Risk & impact assessment

Unresolved medium items skew **funnel analytics** (under-counted CTAs, weaker explicit plan-intent attribution on some clicks) rather than core product behavior. Trust gaps affect **conversion rate** under paid or broad acquisition. Likelihood of analytics gaps rises for users who convert from lower-page or in-copy links.

## Recommendations (prioritized)

1. Wrap or replace the pricing page footer “Create free account” and the public calculator inline sign-up line with `FunnelCtaLink` (or equivalent `captureClientEvent(FUNNEL_CTA_CLICKED)` + `setPlanIntent`) so behavior matches hero, nav, pricing cards, and the LP calculator footer.
2. Align `docs/launch/analytics.md` signup dedup storage key wording with `veld_ph_signup_sent_*` (or change code to match the doc—single source of truth).
3. Continue pre-live / staging telemetry QA per `docs/launch/pre-live-telemetry-qa-2026-03-30.md` before scaling ad spend.
4. When assets exist, prioritize trust-strip or social proof on landing and pricing.

## Task candidates (optional)

- [ ] Add `FunnelCtaLink` (with `placement` / `cta_id` / `planIntent`) for pricing page footer “Create free account” and public calculator page inline “create a free account”.
- [ ] Optionally add `FunnelCtaLink` for home “Simple pricing” → “View pricing” for consistent session-level CTA coverage.
- [ ] Fix `user_signed_up` dedup key documentation in `docs/launch/analytics.md` to match `posthog-signup-once.tsx`.

## Re-test checklist

- [ ] After CTA changes: confirm new `funnel_cta_clicked` rows and `plan_intent` / `plan_intent_source` on affected paths in PostHog Live (with consent on).
- [ ] Confirm no regression on pricing sign-up and checkout flows (`npm run check` when code changes are made).
- [ ] Re-run pre-live telemetry QA for UTM, signup conversion, and activation conversion labels.

## Next trigger and cadence

- **Trigger:** Material changes to landing copy, pricing, sign-up, onboarding, analytics event names, or paid campaign / IA updates.
- **Recommended cadence:** Monthly, or after each major funnel experiment.
