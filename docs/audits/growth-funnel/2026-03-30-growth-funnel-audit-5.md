# Growth Funnel & Activation Audit — 2026-03-30 (Run 5)

## Executive summary

- **Primary funnel instrumentation is solid**: plan intent + UTM flow into `user_signed_up` and `plan_intent_applied`, session-deduplicated `funnel_cta_clicked` on `FunnelCtaLink` paths, onboarding steps via `onboarding_step_completed`, activation via `property_created` / `add_property_milestone_reached`, and Stripe webhook–driven subscription events. Google Ads gtag loads only after analytics consent (`google-ads-gtag.tsx`), aligned with PostHog gating (`posthog-provider.tsx`).
- **Sign-up → first value path is coherent**: Clerk `afterSignUpUrl="/dashboard"` (`sign-up-view.tsx`), welcome modal with “Add first property” / “Maybe later” (`onboarding-panel.tsx`), empty-state CTA to `/properties/new` (`dashboard/page.tsx`), and add-property wizard milestones (`add-property-wizard.tsx`).
- **Since Run 4**, the **pricing page footer “Create free account”** now uses `FunnelCtaLink` with `placement="pricing_footer"` and `planIntent="free"` (`app/app/pricing/page.tsx`), and **`docs/launch/analytics.md`** documents the `veld_ph_signup_sent_{userId}` key consistently with `posthog-signup-once.tsx`.
- **Remaining gaps** are mostly **secondary CTAs without `funnel_cta_clicked` / explicit `setPlanIntent` parity** (public calculator body copy, home “Simple pricing” button) and **pricing card sign-up rows** that set plan intent via `pricing_card` but do not emit `funnel_cta_clicked`. Marketing surfaces still lack testimonials or third-party trust signals.
- **Overall recommendation:** Instrument the remaining high-readership inline links for parity with `FunnelCtaLink`, optionally align pricing-card clicks with funnel CTA analytics, and add social proof when assets exist; continue pre-scale telemetry QA per launch docs.

## Severity-ranked findings

### Critical

- None.

### High

- None identified.

### Medium

- **Public `/investment-property-calculator` inline “create a free account” is not a tracked funnel CTA** — After `PublicCalculator`, body copy uses a plain `Link` to `/sign-up?intent=free` without `funnel_cta_clicked` or `setPlanIntent` (URL may still hydrate intent via `PlanIntentUrlSync`). The paid LP variant’s footer uses `FunnelCtaLink` (`app/app/lp/investment-property-calculator/page.tsx`), so analytics coverage is inconsistent across calculator entry points. — `app/app/investment-property-calculator/page.tsx` (lines ~94–100).

- **Home “Simple pricing” primary button is not instrumented as a funnel CTA** — The hero uses `FunnelCtaLink` for “Get started free” and “See pricing”; the lower “Simple pricing” section uses a plain `Link` to `/pricing` for “View pricing”, so scrollers who skip the hero lose session-level `funnel_cta_clicked` for that intent. — `app/app/page.tsx` (lines ~256–261).

- **Pricing page `PricingCards` sign-up actions omit `funnel_cta_clicked`** — “Choose Free / Investor / Pro” use `Link` + `setPlanIntent(..., "pricing_card")` (`pricing-cards.tsx`) but do not call `captureClientEvent(FUNNEL_CTA_CLICKED)`. Plan intent is captured for signup and `plan_intent_applied`, but **session CTA click** counts and placement-based funnel dashboards under-represent card clicks vs. nav/footer/hero.

- **Trust and objection handling remain thin on public marketing surfaces** — No testimonials, customer logos, or third-party proof on home, pricing, or calculator LPs; limits conversion efficiency for cold or paid traffic (unchanged theme from prior runs).

### Low

- **Landing nav secondary links are informational only** — Calculator, Pricing, Privacy, Terms, Changelog, and Sign in use plain `Link` without funnel events; acceptable for IA, but “Sign in” vs “Sign up” cannot be compared in `funnel_cta_clicked` for the same session. — `app/components/landing-nav.tsx`.

- **Contact page** — Focused on support form; no product signup CTA (appropriate for support-only intent). — `app/app/contact/page.tsx`.

## Evidence reviewed

- Process: `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`
- Prior run: `docs/audits/growth-funnel/2026-03-30-growth-funnel-audit-4.md`
- Reference: `docs/policies/design-spec.md` (not re-read in full; lane scope is funnel/activation)
- Landing & marketing: `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/app/lp/investment-property-calculator/page.tsx`, `app/components/landing-nav.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/components/marketing/public-calculator.tsx`, `app/components/pricing-cards.tsx`, `app/components/footer.tsx`
- Sign-up: `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-in/[[...sign-in]]/page.tsx` (not expanded; Clerk wrapper)
- In-app activation: `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/properties/add-property-wizard.tsx` (event usage via grep)
- Plans & upgrade: `app/app/(app)/plans/page.tsx`, `app/app/(app)/billing/success/page.tsx`, `app/app/api/billing/webhook/route.ts`
- Analytics: `app/lib/analytics-events.ts`, `app/lib/analytics-client.ts`, `app/lib/plan-intent.ts`, `app/components/analytics/posthog-provider.tsx`, `posthog-signup-once.tsx`, `posthog-plan-intent.tsx`, `posthog-page-view.tsx`, `components/analytics/plan-intent-url-sync.tsx` (referenced from pages)
- Launch docs: `docs/launch/analytics.md`

**Limits:** Static code review only; no live PostHog, Stripe test mode, or production URL verification. Consent-gated analytics behavior is inferred from `PostHogGate` / `GoogleAdsGtagClient` code paths.

## Risk & impact assessment

Gaps skew **funnel analytics completeness** (under-counted clicks, uneven placement coverage) more than core product behavior. Users can still sign up and activate; risk is **wrong conclusions in dashboards** when optimizing CTAs. Thin trust content affects **conversion rate** for skeptical traffic; likelihood rises with paid scale.

## Recommendations (prioritized)

1. Wrap the public calculator page inline “create a free account” (and optionally mirror LP patterns) with `FunnelCtaLink` or equivalent `captureClientEvent(FUNNEL_CTA_CLICKED)` + `setPlanIntent("free", …)` so behavior matches nav, hero, pricing footer, and LP footer.
2. Replace the home “Simple pricing” → “View pricing” plain `Link` with `FunnelCtaLink` (e.g. `placement="landing_pricing_section"`, `ctaId="view_pricing_bottom"`) for consistent session CTA coverage with the hero “See pricing” (distinct `cta_id` avoids dedup collision if both fire in one session—confirm dedup key behavior in `analytics-dedup.ts` if both should count separately).
3. Either add `funnel_cta_clicked` to `PricingCards` sign-up buttons (with placements like `pricing_card_free`) or document that pricing cards are intentionally excluded from funnel CTA events to avoid double-counting with footer—then enforce one consistent story in analytics docs.
4. When ready, add a lightweight trust strip (quotes, logos, or “used by” copy) on home and/or pricing.
5. Continue staging/production telemetry QA per existing launch checklists before scaling ad spend.

## Task candidates (optional)

- [ ] Add `FunnelCtaLink` (or equivalent capture + `setPlanIntent`) for `app/app/investment-property-calculator/page.tsx` inline sign-up sentence.
- [ ] Add `FunnelCtaLink` for home “Simple pricing” → “View pricing” (`app/app/page.tsx`).
- [ ] Decide and implement whether `PricingCards` sign-up links should emit `funnel_cta_clicked` with unique `placement`/`cta_id` values.
- [ ] Plan trust/social proof content for landing and pricing when assets exist.

## Re-test checklist

- [ ] After any CTA instrumentation change: verify `funnel_cta_clicked`, `plan_intent`, and `plan_intent_source` in PostHog Live (with analytics consent on).
- [ ] Confirm signup → dashboard → onboarding → first property still works end-to-end; `npm run check` when code changes are made.
- [ ] Re-run launch telemetry QA for UTM persistence and conversion labels where env vars are set.

## Next trigger and cadence

- **Trigger:** Material changes to landing/pricing copy, sign-up or onboarding, analytics event names, paid campaign structure, or new marketing routes under `app/app/`.
- **Recommended cadence:** Monthly, or after each major funnel experiment.

---

## Brief summary

Run 5 confirms the funnel is **healthy for conversion and activation**, with **strong PostHog and plan-intent wiring** and a **fixed pricing-footer CTA** vs. Run 4. Remaining work is **narrowing analytics gaps** on a few plain links (calculator body copy, home pricing section) and **pricing card vs. `FunnelCtaLink` parity**, plus **trust content** when available—no critical blockers for launch from a funnel-code perspective.
