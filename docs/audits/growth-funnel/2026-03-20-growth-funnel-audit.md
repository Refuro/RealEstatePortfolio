# Growth Funnel & Activation Audit — 2026-03-20

## Executive summary

- **Overall:** Acquisition surfaces (landing, pricing) present clear value props, screenshots, and plan limits on the full **Pricing** experience; **Clerk** sign-up/sign-in wiring is consistent (`afterSignUpUrl` / `afterSignInUrl` → `/dashboard`, cross-links between auth routes). In-app **first-session** activation is supported by a **welcome modal** (`OnboardingPanel`) and a strong **empty dashboard** with multiple next steps.
- **Top risks:** (1) **Message mismatch** — the home “Simple pricing” strip summarizes **property** limits only, while Free also includes **saved-deal** limits that matter for the “Analyze a deal” story (`lib/plans.ts`). (2) **Public paid CTAs** — on `/pricing`, **Investor/Pro** buttons route to **`/sign-up`** like Free, so there is **no paid-intent capture** before account creation; upgrades happen only after signup via checkout (`pricing-cards.tsx`). (3) **Activation breadth** — empty-state users see **property**, **deal analysis**, and **CSV import** as parallel options, which may dilute a single fastest path to first value.
- **Recommendation:** Align **home pricing preview** copy with full plan definitions; treat **signup → first property** and **signup → first saved deal** as core funnel metrics (events already exist: `property_created`, `deal_created` in `lib/analytics-events.ts`); validate whether **paid-tier buttons** should deep-link to signup with query params or post-signup **Plans** focus.

## Severity-ranked findings

### Critical

- *(none identified in this pass — no broken auth gates or missing billing surfaces were found in reviewed code.)*

### High

- **Home pricing strip under-specifies Free tier vs product promise** — Visitors see “Free $0 · 1 property” but not **5 saved deals**, while deal analysis is a headline value prop on the same landing page (`VALUE_PROPS` includes “Deal analyzer”). Risk: users mis-set expectations until `/pricing` or first save attempt. — `app/app/page.tsx`, `app/lib/plans.ts`, `app/components/pricing-cards.tsx`
- **Paid plans on public pricing route to generic signup** — For logged-out users, **Choose Investor** / **Choose Pro** use `href="/sign-up"` (same as Free), so there is **no Stripe or plan metadata** on the acquisition click. Risk: lower intent signaling and extra steps for buyers ready to pay immediately. — `app/components/pricing-cards.tsx` ( `showSignUp` branch )

### Medium

- **Empty-dashboard activation splits attention across three “first value” paths** — Primary CTA “Add your first property,” secondary “Analyze a deal,” tertiary CSV import in settings anchor. Aligns with power-user flexibility but conflicts slightly with a single **shortest path to aha** (design spec emphasizes hierarchy and decision-first flows). — `app/app/(app)/dashboard/page.tsx`, `docs/policies/design-spec.md` §1
- **Welcome modal is property-centric only** — `OnboardingPanel` copy and primary button push **Add first property**; users whose first intent is **deal analysis** (aligned with hero/adjacent messaging) may dismiss or feel mis-routed. — `app/app/(app)/onboarding-panel.tsx`
- **Several app routes explicitly `redirect("/sign-in")` when `getAppUser()` is null** — Example: `analyze/page.tsx`. Unauthenticated users hitting deep links will land on **sign-in**, not **sign-up** (Clerk may still offer signup). **Hypothesis:** net-new visitors from marketing links may convert better with **`/sign-up`** + return URL where appropriate. — `app/app/(app)/analyze/page.tsx` (and `modeling`, `mortgage`, `deals` similarly)
- **Sign-in page lacks the Terms/Privacy footer present on sign-up** — Minor **trust and continuity** gap between adjacent auth steps. — `app/app/sign-in/[[...sign-in]]/page.tsx` vs `app/app/sign-up/[[...sign-up]]/page.tsx`

### Low

- **Post-checkout success page prioritizes Settings over portfolio work** — Primary button “Go to Settings”; dashboard is secondary. Reasonable for billing self-serve, but **post-purchase activation** (add data, use higher limits) is one click less prominent. — `app/app/(app)/billing/success/page.tsx`
- **Marketing screenshots use plain `<img>`** — Acceptable functionally; LCP and bandwidth may lag optimized `next/image` patterns (cross-reference performance audits). — `app/app/page.tsx`, `app/app/pricing/page.tsx`
- **`openGraph.url` on home uses relative `"/"`** — Often fine with Next metadata resolution; confirm social previews in staging when launch-ready.

## Evidence reviewed

- **Landing & conversion:** `app/app/page.tsx`, `app/components/landing-nav.tsx`, `app/lib/pricing-display.ts`
- **Pricing & upgrade UX:** `app/app/pricing/page.tsx`, `app/components/pricing-cards.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/(app)/settings/page.tsx`, `app/app/(app)/billing/success/page.tsx`
- **Auth & continuity:** `app/app/sign-up/[[...sign-up]]/page.tsx`, `app/app/sign-in/[[...sign-in]]/page.tsx`, `app/proxy.ts` (public route matcher)
- **Activation & first value:** `app/app/(app)/layout.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/lib/onboarding.ts`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/properties/new/page.tsx`, `app/app/(app)/analyze/page.tsx`, `app/app/(app)/analyze/deal-analyzer-form.tsx` (partial)
- **Limits & upgrade triggers:** `app/lib/plans.ts`, `app/app/(app)/components/over-limit-banner.tsx`, `app/app/(app)/components/past-due-banner.tsx`
- **Analytics hooks (funnel instrumentation):** `app/lib/analytics-events.ts`, grep-based review of `captureClientEvent` / `captureServerEvent` usage
- **Policy / roadmap context:** `docs/policies/design-spec.md` (intro), `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`

**Assumptions / limits:** Static code review only; no production traffic, A/B tests, or session recordings. Clerk dashboard settings (OAuth providers, email templates) not inspected. Environment-specific pricing via `NEXT_PUBLIC_*` not verified at runtime.

## Risk & impact assessment

| Area | Impact if unresolved | Likelihood |
|------|----------------------|------------|
| Home vs plan definition mismatch | Higher support burden, surprise at deal/property limits, weaker trust | Medium for informed investors comparing tools |
| Paid CTA → generic signup | Longer path to revenue; possible drop between signup and checkout | Medium for high-intent payers |
| Split empty-state onboarding | Slower **time-to-first-value**, weaker activation metrics | Medium early in funnel |
| Sign-in vs sign-up deep links | Smaller conversion loss on cold traffic | Low–medium depending on marketing URLs |

## Recommendations (prioritized)

1. **Unify plan messaging** — Update the home “Simple pricing” section to reflect **both** property and saved-deal limits (or add “+ deals” shorthand) so it matches `PLAN_PROPERTY_LIMITS` / `PLAN_DEAL_LIMITS` and `PricingCards` content.
2. **Instrument and review the activation funnel** — Use existing events (`property_created`, `deal_created`, `checkout_started`, `plan_limit_hit`) to build dashboards: signup → first property; signup → first saved deal; free → checkout_started. Add session-staged benchmarks (median time) once data exists.
3. **Test acquisition intent for paid tiers** — Experiment with query params or Clerk metadata so “Choose Investor/Pro” carries **intent** into post-signup **Plans** or checkout (hypothesis: higher checkout_started / signup).
4. **Revisit empty state and welcome modal** — Either keep multi-path but add **one recommended** path copy for first-time users, or A/B test **property-first** vs **deal-first** onboarding for segments.

## Measurable funnel hypotheses

| ID | Hypothesis | Primary metric | Segment / notes |
|----|------------|----------------|-----------------|
| H1 | Adding **deal limit** to the home pricing strip **reduces** mismatch-driven drop-off before first saved deal | Signup → `deal_created` rate; time to first deal | New signups from `/` |
| H2 | **Welcome modal** “Add first property” increases **property_created** within 24h vs dismiss | % with `property_created` D0 | Users with `onboarding` state from `OnboardingPanel` |
| H3 | Routing cold traffic to **`/sign-up`** (vs `/sign-in`) from protected marketing deep links increases auth completions | Completed signup vs visits to `/analyze` logged-out | Campaign links |
| H4 | Post-upgrade, a **dashboard**-first success CTA increases **property_created** or **deal_created** within 7 days vs Settings-first | Activation after `checkout_started` / subscription events | New paying customers |

## Task candidates (optional)

- [ ] Copy update: home pricing preview — include Free **deal** limit (and optional one-liner pointing to full `/pricing`).
- [ ] UX spec: decide **single primary** first-value path on empty dashboard + optional “Other ways to start” collapse.
- [ ] Spike: **plan intent** from pricing CTAs (query string → post-signup banner on `/plans` or `/dashboard`).
- [ ] Align **sign-in** footer with **sign-up** (Terms + Privacy links).
- [ ] Evaluate **billing success** primary CTA toward **dashboard** (or split-test) for post-purchase activation.

## Re-test checklist

- [ ] Logged-out: `/` → CTA → `/sign-up` → `/dashboard` → welcome modal → `/properties/new` (staging).
- [ ] Logged-out: `/pricing` → each plan CTA → signup continuity; logged-in: upgrade → Stripe checkout error handling in `pricing-cards.tsx`.
- [ ] Hit **plan limits** (property + deal) and confirm `OverLimitBanner` + `PLAN_LIMIT_REACHED` UX on analyze save.
- [ ] `npm run check` (when code changes are made — not required for audit-only).

## Next trigger and cadence

- **Trigger:** Pricing/plan limit changes, major onboarding redesign, or marketing launch pushing new channels.
- **Recommended next run:** Monthly, or within two weeks of first production analytics baseline for funnel KPIs.
