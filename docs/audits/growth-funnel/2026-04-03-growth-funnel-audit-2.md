# Growth Funnel & Activation Audit — 2026-04-03 (Run 2)

## Executive summary

- **Landing page funnel instrumentation (plan Items 3, 7, 8, 9) is implemented:** The home page (`home_v4`) includes a signed-out calculator-section sign-up line with `FunnelCtaLink` + `planIntent="free"`, a tracked bottom secondary link (“Compare Veld vs spreadsheets”), differentiated bottom primary copy (“Create your free account”) with `ctaId="create_free_account"`, and a pricing-preview inline sign-up (“or sign up free”). `PlanIntentUrlSync` remains behind `Suspense` at the top of `/`.
- **Activation trust gap from Run 1 is addressed in code:** Welcome modal onboarding now sets user-visible error copy when `PATCH /api/onboarding` does not succeed, with `busy`/`disabled` handling—no longer a silent failure mode for the primary flows.
- **Run 1 “Schedule” items largely remain:** Deals **at-limit** upgrade is still a plain `<Link href="/plans">` (no `UpgradePlanLink` / `plan_limit_upgrade_cta_clicked`). **`/sign-in` still does not mount `PlanIntentUrlSync`.** Public **investment-property-calculator** body sign-up, **competitor/alternative** primary CTAs and secondary pricing links, **`PaidIntentCheckoutBanner` “View plans”**, and **nav “Sign in”** are still weak or missing relative to the `funnel_cta_clicked` / `planIntent` patterns used elsewhere.
- **Pricing premium plan** (`docs/archive/plans/2026-04-03-pricing-page-premium-plan.md`) is an open-ended design/motion brief—no substitute for a follow-up audit after implementation; conversion wiring on `/pricing` should stay aligned with `veld-landing-cta` and existing `checkout_started` behavior when that work ships.

## Severity-ranked findings

### Critical

- None. Core paths (landing → sign-up, first property, checkout) remain coherent; PostHog funnel definition in `docs/launch/posthog-growth-funnel.md` is unchanged.

### High

- **Deals list at-limit upgrade is not instrumented like over-limit** — When `atLimit` is true, “Upgrade to save more” is still a plain `Link` to `/plans` (`app/app/(app)/deals/page.tsx`, lines 74–80). Over-limit copy uses `UpgradePlanLink` with `placement="deals_list_over_limit"` (lines 93–101). **Impact:** `plan_limit_upgrade_cta_clicked` does not fire for at-limit clicks; attribution and the PostHog checklist in `posthog-growth-funnel.md` (plan limit → upgrade) stay incomplete for that segment.

- **`/sign-in` lacks `PlanIntentUrlSync`** — `app/app/sign-in/[[...sign-in]]/page.tsx` renders Clerk `SignIn` only—no `Suspense` + `PlanIntentUrlSync` (contrast marketing routes and sign-up). **Impact:** `?intent=` and UTM sync behavior on sign-in URLs do not match sign-up and marketing pages; campaign parity for returning users remains a gap (unchanged from Run 1).

### Medium

- **Public investment-property calculator: body “create a free account” is a plain `<Link>`** — `app/app/investment-property-calculator/page.tsx` (lines 71–73): `href="/sign-up?intent=free"` preserves URL intent but **no `funnel_cta_clicked`** and **no `setPlanIntent` from `FunnelCtaLink`** on click (Run 1 finding; still open).

- **Competitor / alternative pages: primary sign-up CTAs omit `planIntent` and use `href="/sign-up"` without `?intent=`** — `app/components/marketing/competitor-alternative-page.tsx` (e.g. lines 74–82, 145–153, 242–250): `FunnelCtaLink` is present for placements like `competitor_alt_hero`, but **`planIntent="free"`** and **`/sign-up?intent=free`** are not applied—weaker consistency with `landing_nav` / home flows for `plan_intent` resolution.

- **Competitor pages: “View pricing” / pricing note links are plain `<Link href="/pricing">`** — Same file (e.g. lines 83–88, 134–136, 205–207, 251–256): no `funnel_cta_clicked` for secondary funnel steps.

- **`PaidIntentCheckoutBanner` “View plans” is still a plain `Link` to `/plans`** — `app/components/growth/paid-intent-checkout-banner.tsx` (lines 76–80): no `UpgradePlanLink`, `FunnelCtaLink`, or dedicated `captureClientEvent` placement—post-signup paid-intent nudges remain hard to isolate in the same taxonomy as other upgrade CTAs (Run 1 finding; still open).

- **Marketing nav “Sign in” is not a funnel CTA** — `app/components/landing-nav.tsx` (lines 90–96): plain `Link` to `/sign-in`; only “Sign up” uses `FunnelCtaLink` (Run 1; still open).

### Low

- **Time-to-value copy tension** — Home hero trust line still says first property in **about 60 seconds** (`app/app/page.tsx`, lines 257–261); welcome modal still says **about 2 minutes** (`app/app/(app)/onboarding-panel.tsx`, line 128). Minor trust friction for careful readers (Run 1).

- **PostHog consent gating** — Client events remain dependent on optional analytics consent (`docs/launch/analytics.md`); funnel undercount for decliners is expected, not a regression.

- **`PaidIntentCheckoutBanner` surface tokens** — Banner uses `border-border/70` and `bg-card/95` (`paid-intent-checkout-banner.tsx`, line 69); aligns with historical veld-ui deprecation callouts in the pricing polish plan—cosmetic/consistency, not a funnel break.

## Evidence reviewed

- Process: `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`
- Prior run: `docs/audits/growth-funnel/2026-04-03-growth-funnel-audit.md`
- Plans: `docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md` (Items 3, 7, 8, 9), `docs/archive/plans/2026-04-03-pricing-page-premium-plan.md`
- Funnel docs: `docs/launch/posthog-growth-funnel.md`, `docs/launch/analytics.md`
- Events: `app/lib/analytics-events.ts`
- Surfaces audited: `app/app/page.tsx`, `app/app/(app)/deals/page.tsx`, `app/app/sign-in/[[...sign-in]]/page.tsx`, `app/app/investment-property-calculator/page.tsx`, `app/components/marketing/competitor-alternative-page.tsx`, `app/components/growth/paid-intent-checkout-banner.tsx`, `app/components/landing-nav.tsx`, `app/components/analytics/upgrade-plan-link.tsx`, `app/app/(app)/onboarding-panel.tsx`

**Limits:** Static code review only; no live PostHog session verification. Run 2 explicitly verifies implementation of landing plan Items 3, 7, 8, 9 against `app/app/page.tsx`.

## Risk & impact assessment

- **High (unresolved):** Measurement gap on **at-limit** deal upgrades skews limit-upgrade analytics and A/B readouts next to **over-limit**; **sign-in** without URL intent sync continues to risk campaign attribution drift for returning users.
- **Medium:** SEO/GTM surfaces (calculator page, competitor pages) still under-report `funnel_cta_clicked` and optional `planIntent` vs home/pricing—manageable if URL `?intent=` is always present, but inconsistent with documented precedence in `docs/launch/analytics.md`.
- **Resolved risk from Run 1:** Onboarding API failure is no longer silent—reduces support burden and “stuck modal” perception.

## Recommendations (prioritized)

1. **Unify deals at-limit upgrade tracking** — Replace the at-limit plain `Link` with `UpgradePlanLink` (or equivalent) and a distinct `placement` (e.g. `deals_list_at_limit`) so `plan_limit_upgrade_cta_clicked` matches over-limit behavior.
2. **Mount `PlanIntentUrlSync` on `/sign-in`** — Mirror the `Suspense` + client sync pattern used on marketing routes and sign-up so `?intent=` / UTM handling matches the rest of acquisition.
3. **Instrument remaining high-readership plain links** — Priority: `investment-property-calculator` body sign-up (`FunnelCtaLink` + `planIntent="free"`, distinct `placement`/`cta_id`), competitor primary CTAs (`planIntent` + `?intent=free`), `PaidIntentCheckoutBanner` “View plans”, then secondary competitor pricing links and nav “Sign in” with unique placements to avoid dedup collisions.
4. **After pricing premium work** — Re-audit `/pricing` for CTA hierarchy, motion accessibility (`prefers-reduced-motion`), and unchanged analytics/checkout behavior per `2026-04-03-pricing-page-premium-plan.md`.

## Task candidates (optional)

- [ ] `deals/page.tsx`: at-limit “Upgrade to save more” → `UpgradePlanLink` with new `placement`
- [ ] `sign-in/[[...sign-in]]/page.tsx`: add `Suspense` + `PlanIntentUrlSync` (verify Clerk + client boundaries)
- [ ] `investment-property-calculator/page.tsx`: `FunnelCtaLink` for inline “create a free account” with placement such as `public_calc_body`
- [ ] `competitor-alternative-page.tsx`: `planIntent="free"` and `href="/sign-up?intent=free"` on primary `FunnelCtaLink`s; optional `FunnelCtaLink` for “View pricing” with distinct placements
- [ ] `paid-intent-checkout-banner.tsx`: tracked navigation to `/plans` (`UpgradePlanLink` or `captureClientEvent` with dedicated `placement`)
- [ ] `landing-nav.tsx`: optional `FunnelCtaLink` for “Sign in” with placement `landing_nav_sign_in` (or document intentional exclusion)
- [ ] Align hero “60 seconds” vs modal “2 minutes” copy if product wants a single TTV story

## Re-test checklist

- [ ] Deals: at-limit click emits `plan_limit_upgrade_cta_clicked` with expected `placement`
- [ ] Sign-in: landing with `?intent=investor` (or `pro`) syncs stored intent before completing Clerk sign-in
- [ ] PostHog: `funnel_cta_clicked` for any newly instrumented calculator/competitor/nav placements (once per session per dedup key)
- [ ] `npm run check` (when code changes are made)
- [ ] No regression: landing `FunnelCtaLink` placements on `app/app/page.tsx` (`landing_calculator`, `landing_pricing_preview`, `landing_bottom_cta`)

## Next trigger and cadence

- **Trigger:** After shipping sign-in sync, deals at-limit instrumentation, or calculator/competitor/banner instrumentation; after pricing premium polish merge
- **Recommended next run:** Within two weeks of any of the above, or next monthly funnel review
