# Business & Valuation Audit — 2026-04-03 (Run 2)

## Executive summary

- **Continuity with Run 1:** Monetization architecture, billing matrix discipline, and valuation framing from [`2026-04-03-business-valuation-audit.md`](./2026-04-03-business-valuation-audit.md) remain the baseline. This pass focuses on **today’s three implementation plans**, **commercial consistency checks**, and **analytics gaps** called out in the morning synthesis (PostHog by `landingVariant`).
- **Planned work — business tilt:** The **premium pricing** and **embedded mockups** plans aim at **product-quality perception** and **conversion trust** (aligned with ICP and investor one-pager). The **landing mobile & CTA** plan targets **direct funnel lift** (hero friction, new sign-up paths, analytics coverage) with a clear priority order.
- **Readiness:** Tier limits and dollar amounts are **aligned** across `app/lib/plans.ts`, `app/lib/pricing-display.ts`, `app/components/pricing-cards.tsx`, and the **desktop** comparison table on `app/app/pricing/page.tsx`; the **landing** pricing strip imports `PRICING_DISPLAY` (same source as cards). `SUPPORT_EMAIL` is **documented** in `app/.env.example` and `docs/setup/manual-steps.md`; runtime presence is **environment-dependent** (not verifiable in-repo). **`LANDING_VARIANT` (`home_v4`)** is passed into tracked CTAs on `app/app/page.tsx`.
- **Open Schedule item (PostHog):** **`landing_variant` is emitted on `funnel_cta_clicked`** (`app/components/marketing/funnel-cta-link.tsx`) but **not on `user_signed_up`** (`app/components/analytics/posthog-signup-once.tsx`). A saved insight “signup/activation **by** `landingVariant`” may require **session funnels, HogQL, or person properties** unless product adds variant to signup — see findings below.

## Severity-ranked findings

### Critical

- *(none identified in this pass.)*

### High

- **PostHog: signup does not carry `landing_variant`** — The morning audit’s task candidate (“saved insight for signup/activation by `landingVariant`”) is **harder to implement literally** than it appears: `user_signed_up` payloads include `plan_intent`, UTM fields, and `clerk_user_id`, but **no `landing_variant`**. Variant appears on **`funnel_cta_clicked`** only. Analysts can still build **paths or funnels** (e.g. CTA click → signup) or use **PostHog features that join events in session**, but **direct breakdown of `user_signed_up` by variant is not supported** without schema or dashboard design changes. — `app/components/analytics/posthog-signup-once.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `docs/launch/analytics.md` (documents `landing_variant` on `funnel_cta_clicked`).

### Medium

- **Pricing page: mobile “Compare all features” omits hourly estimate row** — Desktop table lists **Estimate pool (per hour)** (`5/hr`, `10/hr`, `20/hr`); the mobile accordion omits that row while listing properties, deals, and feature flags. **Same visitor** can see **different commercial detail** by breakpoint — minor trust and support-load risk (“I didn’t see the limit on my phone”). — `app/app/pricing/page.tsx` (desktop rows ~133–137 vs mobile ~180–188).

- **Premium pricing plan — execution risk to conversion** — The open-ended polish plan correctly targets **flagship SaaS** feel and preserves analytics wiring in its prompt. **Business risk** is indirect: **layout shift**, **heavy client motion**, or **hydration flash** could **hurt** conversion and Core Web Vitals; **mitigation** is already in the plan (`prefers-reduced-motion`, stability). — `docs/plans/2026-04-03-pricing-page-premium-plan.md`

- **Embedded mockups plan — fidelity and maintenance** — Replacing PNGs with DOM mockups improves **sharpness and “real product” perception** (supports valuation narrative). **Risks:** mockups **drifting** from production UI over time, **duplicate** layout to maintain, and **implementation bugs** (scale wrapper, `Date.now()`-style nondeterminism) undermining trust if the preview looks “off.” The plan’s acceptance criteria and bundle-size note address this. — `docs/plans/2026-04-03-embedded-mockups-plan.md`; current `app/app/pricing/page.tsx` already imports mockup components.

### Low

- **Landing plan item 4 vs embedded mockups** — Item 4 still references **capturing a new `ScreenDashboard.png`**; the embedded mockup plan **removes** reliance on that asset. Sequencing should avoid **double work** (screenshot capture vs DOM mockup). — `docs/plans/2026-04-03-landing-mobile-cta-plan.md` § Item 4; `docs/plans/2026-04-03-embedded-mockups-plan.md`

- **No `TODO` / `FIXME` in application TS/TSX** — Grep across `app/**/*.ts(x)` found **no** `TODO`/`FIXME`/`XXX` markers; **business-critical** debt is not surfaced this way (does not rule out other comment styles or docs-only debt).

- **`SUPPORT_EMAIL` not provable from repo** — Pattern is consistent: `process.env.SUPPORT_EMAIL ?? null` on marketing and app shells; `.env.example` and manual steps describe setup. **Production** value is **operator-owned**; prior legal audits noted **Privacy/Terms vs footer** when unset. — `app/.env.example`, `docs/setup/manual-steps.md`, `app/app/pricing/page.tsx`

## Evidence reviewed

- **Process:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`
- **Prior same-day audit:** `docs/audits/business/2026-04-03-business-valuation-audit.md`
- **Reference:** `docs/launch/investor-style-one-pager.md`, `docs/internal/billing-matrix.md`, `docs/launch/posthog-growth-funnel.md`, `docs/launch/analytics.md`, `docs/reference/roadmap.md`
- **Plans (2026-04-03):** `docs/plans/2026-04-03-pricing-page-premium-plan.md`, `docs/plans/2026-04-03-embedded-mockups-plan.md`, `docs/plans/2026-04-03-landing-mobile-cta-plan.md`
- **Code (read-only):** `app/lib/plans.ts`, `app/lib/pricing-display.ts`, `app/components/pricing-cards.tsx`, `app/app/page.tsx`, `app/app/pricing/page.tsx`, `app/components/analytics/posthog-signup-once.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/.env.example`
- **Grep:** `SUPPORT_EMAIL`, `LANDING_VARIANT` / `landingVariant`, `TODO`/`FIXME` in `app/`

**Assumptions / limits:** No Stripe Dashboard, PostHog project, or Vercel env values were queried. **No application source code was modified** for this audit.

## Impact assessment — today’s plans

### `docs/plans/2026-04-03-pricing-page-premium-plan.md` (premium polish & motion)

| Lens | Assessment |
|------|------------|
| **Conversion funnel** | **Plausible positive:** clearer hierarchy, motion gated for `prefers-reduced-motion`, and “premium” feel support **trust → checkout_started** for visitors who compare alternatives. Not a substitute for **price/value** proof. |
| **Commercial / pricing risk** | **Low** if copy and `PricingCards` / Stripe flows stay unchanged. **Medium** if implementation introduces **CLS**, confusing toggles, or extra loud CTAs (plan explicitly defers to skills). |
| **Valuation** | Improves **perceived quality** for diligence; secondary to **MRR evidence** (`investor-style-one-pager.md` §5). |

### `docs/plans/2026-04-03-embedded-mockups-plan.md` (replace PNGs)

| Lens | Assessment |
|------|------------|
| **Product quality perception** | **Likely positive:** crisp text and DOM aligned with tokens beat **blurry downscaled PNGs** for “this is a real app” signaling. |
| **Risks** | **Mock drift** from live app; **bundle** and **complexity** (mitigated by deleting large PNGs per plan). |
| **Valuation** | Supports **replacement-cost / quality** story; still needs **usage and revenue** for business multiple. |

### `docs/plans/2026-04-03-landing-mobile-cta-plan.md` (mobile & CTA)

| Item | Business impact (concise) |
|------|----------------------------|
| 1 Hide HERO_STEPS on mobile | **High:** shortens path to proof/social — fewer drop-offs before scroll. |
| 2 Mobile screenshot + `md` breakpoint | **High:** addresses **zero product visuals** on mobile; better **activation intent**. |
| 3 Calculator section sign-up link | **High:** closes skill gap — **logged-out** calculator users get a **tracked** path to `sign-up` (`landing_calculator`). |
| 4 Replace hero screenshot | **Medium–high:** stronger **value clarity**; coordinate with **mockup** plan to avoid duplicate work. |
| 5 Section order (Calculator before Value props) | **Medium:** engagement-first layout — can lift **time on page** and **calculator → signup**. |
| 6 Mobile CTA stack layout | **Medium:** reduces **accidental** secondary placement — better **intentional** clicks. |
| 7 Track bottom secondary link | **Low–medium:** improves **visibility** of `/vs/spreadsheets` in PostHog. |
| 8 Bottom CTA label differentiation | **Low–medium:** clearer **late-funnel** ask; distinct `cta_id` helps analytics. |
| 9 Pricing preview sign-up link | **Low:** extra **low-friction** entry to signup from pricing strip (`landing_pricing_preview`). |

## Risk & impact assessment

| Theme | Likelihood | Business impact if ignored |
|-------|------------|----------------------------|
| Signup not keyed by `landing_variant` in raw events | High (by design) | Weaker **single-event** cohort reporting; workarounds in PostHog or schema follow-up |
| Mobile pricing table missing hourly row | Medium (UX inconsistency) | **Support** questions, minor **trust** hit on mobile |
| Premium polish / mockups executed poorly | Low–medium | **Conversion** and **perception** harm despite good intent |
| No traction data | — (unchanged) | Valuation stays **asset / replacement-cost** weighted |

## Valuation posture (framing)

Indicative bands remain as in **Run 1** and **`2026-03-20-business-valuation-audit.md`** until **verified MRR, churn, and cohorts** exist. Today’s plans primarily improve **conversion instrumentation and perception**, not **reported revenue**.

## Recommendations (prioritized)

1. **Unblock “by `landingVariant`” analytics honestly** — Either document in PostHog **how** the team measures signup/activation by variant **without** `landing_variant` on `user_signed_up` (session funnel / HogQL), or **schedule a small product change** to attach **last-touch `landing_variant`** (or UTM-style persistence) to `user_signed_up` / activation events — aligns with morning **Schedule** item.
2. **Align mobile pricing accordion with desktop** — Add the **hourly estimate pool** row (or equivalent copy) to the mobile comparison block in `app/app/pricing/page.tsx` for parity.
3. **Sequence landing Item 4 with mockups** — Prefer **one** hero visual strategy (DOM mockup vs new PNG) to avoid redundant asset work — see Low finding above.
4. **Execute landing plan items 1–3 early** — Highest expected **conversion impact** with clear acceptance criteria.

## Task candidates (optional)

- [ ] PostHog: document or implement **signup/activation by variant** given **`user_signed_up` lacks `landing_variant`** (Run 2 High finding).
- [ ] **Pricing page mobile:** add **Estimate pool (per hour)** row to match desktop.
- [ ] **Coordination:** resolve **hero screenshot vs `DashboardMockup`** before shipping both plans.

## Re-test checklist

- [ ] After any pricing or Stripe change: `/pricing`, `/plans`, and **billing matrix** checklist (`docs/internal/billing-matrix.md`).
- [ ] After PostHog insight work: validate **funnel** or **query** matches PM expectations for **alternative and home variants**.
- [ ] `npm run check` in `app/` when follow-up code lands.

## Next trigger and cadence

- **Trigger:** After landing + pricing + mockup plans ship; any **price/env** change; material **GTM** spend.
- **Recommended next run:** **Monthly** during execution of these plans, or **next quarterly** business audit if unchanged.
