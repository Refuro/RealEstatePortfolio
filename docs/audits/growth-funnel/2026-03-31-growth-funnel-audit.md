# Growth Funnel & Activation Audit — 2026-03-31

## Executive summary

- **Overall:** Public **landing** and **pricing** routes present clear value props, trust chips, FAQ/objection handling on pricing, and **Next/Image** on key screenshots. **Sign-up** carries **plan intent** via `?intent=` plus `FunnelCtaLink` / pricing-card `setPlanIntent`, synced by `PlanIntentUrlSync` and surfaced in PostHog (`plan_intent_applied`, checkout events). Logged-in **upgrade** uses Stripe checkout from `PricingCards` with helpful error copy; **OverLimitBanner** links to `/plans`.
- **Top risks:** (1) **Home “Simple pricing”** still summarizes **property counts only**, while Free and paid tiers also cap **saved deals** — same mismatch called out in prior funnel audits, still visible vs hero “deal analysis” messaging. (2) **Paid-tier acquisition** now **records** investor/pro intent but **afterSignUpUrl** remains **`/dashboard`** with no first-session nudge to **Plans** or checkout — high-intent payers still discover paywall after activation work. (3) **First value** UX splits attention (**property**, **analyze deal**, **CSV import**) and the **welcome modal** is **property-only**, which can misalign with deal-first visitors from calculators or “Deal analyzer” copy.
- **Recommendation:** Align **home pricing preview** with `PLAN_DEAL_LIMITS` / card copy; add a **single recommended** first path (or segment by `plan_intent`) for empty dashboard / welcome; test **post-signup** routing or prominent banner for `investor`/`pro` intent toward `/plans`.

## Severity-ranked findings

### Critical

- *(none — auth surfaces, pricing cards, and checkout wiring present; no broken funnel dead-ends found in reviewed code.)*

### High

- **Landing pricing strip omits saved-deal limits** — The “Simple pricing” chips show “Free $0 · 1 property”, Investor/Pro **property** counts only, not **5 / 20 / 50 saved deals** shown on full cards. Risk: expectation gap for users attracted by deal analysis before they hit save limits. — `app/app/page.tsx` (Simple pricing section); `app/lib/plans.ts` (limits); `app/components/pricing-cards.tsx`

### Medium

- **Paid plan intent stops at analytics/storage; no product continuation** — Choosing Investor/Pro from pricing goes to `/sign-up?intent=investor|pro` with `setPlanIntent` / URL sync, and PostHog registers intent — but Clerk **`afterSignUpUrl` is still `/dashboard`** and there is no server redirect to `/plans` or checkout. Risk: slower **time-to-revenue** and cognitive load for users who already chose a paid tier. — `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/components/pricing-cards.tsx`, `app/lib/plan-intent.ts`
- **Empty dashboard and welcome modal favor different “first wins”** — Empty state offers **Add property** (primary), **Analyze a deal**, and **CSV import**; modal pushes **Add first property** only. Design spec stresses **clear primary CTAs**; parallel paths may delay **time-to-first-value** for deal-first segments. — `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/onboarding-panel.tsx`, `docs/policies/design-spec.md` §1
- **Protected marketing/deep links send unauthenticated users to sign-in** — Example: `/analyze` uses `redirect("/sign-in")`. Clerk allows switching to sign-up, but cold traffic from “analyze” campaigns may see **sign-in-first** framing. — `app/app/(app)/analyze/page.tsx` (pattern may repeat on other `(app)` routes)
- **Logged-in plan headlines skew property-only** — `/pricing` (authenticated) and `/plans` subcopy say choosing by **properties you track**; cards correctly show **saved deals**. Minor **plan clarity** inconsistency for deal-heavy users. — `app/app/pricing/page.tsx`, `app/app/(app)/plans/page.tsx`

### Low

- **Sign-in page lacks Terms/Privacy footer** — **Sign-up** includes agreement links below Clerk; **sign-in** does not, a small **trust continuity** gap between adjacent steps. — `app/app/sign-in/[[...sign-in]]/page.tsx` vs `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`
- **Post-checkout success still leads with Settings** — Primary CTA **Go to Settings**; **Dashboard** is secondary. Reasonable for billing management but slightly de-emphasizes **immediate product use** after upgrade. — `app/app/(app)/billing/success/page.tsx`
- **`clearPlanIntent` is unused** — Documented for post-checkout cleanup but not called; stale intent may persist in localStorage for TTL (analytics/person property noise, not user-facing breakage). — `app/lib/plan-intent.ts` (grep: no call sites)
- **`openGraph.url` on home remains `"/"`** — Verify resolved absolute URLs in production social previews when launch-ready. — `app/app/page.tsx`

## Evidence reviewed

- **Process / template / policy:** `docs/process/growth-funnel-audit-process.md`, `docs/process/audit-report-template.md`, `docs/policies/design-spec.md` (§1), `docs/reference/roadmap.md` (product map / Analyze vs calculators)
- **Context:** `docs/audits/feature/` (cross-lane UX/mobile/feature audits as referenced by process)
- **Landing & conversion:** `app/app/page.tsx`, `app/components/landing-nav.tsx`, `app/components/marketing/funnel-cta-link.tsx`, `app/components/analytics/plan-intent-url-sync.tsx`, `app/lib/pricing-display.ts`
- **Pricing & upgrade:** `app/app/pricing/page.tsx`, `app/components/pricing-cards.tsx`, `app/app/(app)/plans/page.tsx`, `app/app/(app)/settings/page.tsx` (referenced for billing entry), `app/app/(app)/billing/success/page.tsx`
- **Auth:** `app/app/sign-up/[[...sign-up]]/sign-up-view.tsx`, `app/app/sign-in/[[...sign-in]]/page.tsx`
- **Activation & first value:** `app/app/(app)/layout.tsx`, `app/app/(app)/app-layout-client.tsx`, `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/dashboard/page.tsx`, `app/app/(app)/analyze/page.tsx`
- **Limits & upgrade triggers:** `app/lib/plans.ts`, `app/app/(app)/components/over-limit-banner.tsx`, `app/app/(app)/components/past-due-banner.tsx` (layout reference)
- **Analytics / intent:** `app/lib/analytics-events.ts`, `app/components/analytics/posthog-plan-intent.tsx`, `app/components/analytics/posthog-signup-once.tsx` (referenced via grep)

**Assumptions / limits:** Static code review only; no production funnel data, session replay, or Clerk/Stripe dashboard configuration. Environment-specific prices via `NEXT_PUBLIC_*` not validated at runtime.

## Risk & impact assessment

| Area | Impact if unresolved | Likelihood |
|------|----------------------|------------|
| Home vs full plan definition (deals) | Surprise at save limits; weaker trust vs “deal analyzer” promise | Medium for deal-focused signups |
| Paid intent without post-auth continuation | Extra steps to checkout; lower conversion from pricing → paid | Medium for high-intent tiers |
| Split activation paths | Slower activation; weaker `property_created` / `deal_created` concentration | Medium early in funnel |
| Sign-in vs sign-up on deep links | Small friction for net-new visitors from `/analyze` links | Low–medium depending on campaigns |

## Recommendations (prioritized)

1. **Unify home pricing preview with plan truth** — Add **saved-deal** shorthand to the three chips (or one line under the row) so it matches `pricing-cards` and `PLAN_DEAL_LIMITS`.
2. **Close the loop for investor/pro intent after signup** — After auth, route or banner: e.g. optional `afterSignUpUrl` with query, client redirect to `/plans`, or dashboard callout “Continue to Investor/Pro checkout” when `plan_intent` is paid (respecting Clerk constraints).
3. **Clarify one primary first-value path** — In empty dashboard and/or welcome modal, label a **recommended** step (property vs deal) or use **plan_intent** / entry surface to tailor copy; keep secondary actions in “Other ways to start.”
4. **Align logged-in pricing/plans headlines** — Mention **properties and saved deals** (or “limits”) in one line so it matches card chips and roadmap’s Analyze/Deals story.
5. **Optional polish** — Sign-in footer parity with sign-up; evaluate **billing success** primary CTA toward dashboard for activation; call **`clearPlanIntent`** after successful checkout if stale intent should not linger.

## Measurable funnel hypotheses

| ID | Hypothesis | Primary metric | Segment / notes |
|----|------------|----------------|-----------------|
| H1 | Adding **deal limits** to the home pricing strip **reduces** mismatch before first `deal_created` | Signup → `deal_created`; support questions on limits | Traffic from `/` |
| H2 | **Post-signup** exposure to `/plans` (or checkout CTA) when `plan_intent` is **investor/pro** increases **`checkout_started`** within 24h | `checkout_started` / signup for paid-intent cohort | Users with `plan_intent_applied` ≠ free |
| H3 | **Welcome modal** with a **deal** path (or A/B property-first) changes **`deal_created`** D0 vs **`property_created`** D0 | D0 activation split | Calculator / SEO landing referrers |
| H4 | **`/analyze`** logged-out redirect to **`/sign-up?return_url=...`** (or sign-in with signup prominence) improves auth completions | Completed signup from `/analyze` entry | Paid/deal campaigns |

## Task candidates (optional)

- [ ] Copy: home “Simple pricing” — include **saved deals** per tier.
- [ ] UX: post-auth **paid-intent** continuation (banner, redirect, or `afterSignUpUrl` strategy).
- [ ] UX: empty state + welcome — **recommended** first path + collapsed alternates.
- [ ] Copy: `/plans` and logged-in `/pricing` intro — **properties and deals**.
- [ ] Sign-in page: **Terms + Privacy** links matching sign-up.
- [ ] Billing success: test **dashboard-first** CTA or equal weight.
- [ ] Wire **`clearPlanIntent`** after successful subscription if analytics should reset intent.

## Re-test checklist

- [ ] Logged-out: `/` → hero CTA → `/sign-up?intent=free` → `/dashboard` → welcome modal → `/properties/new` (staging).
- [ ] Logged-out: `/pricing` → **Choose Investor** → `/sign-up?intent=investor` → confirm intent in storage / PostHog → post-signup path to paywall acceptable.
- [ ] Logged-in free: `/plans` → **Choose Pro** → Stripe session; error paths in `pricing-cards.tsx`.
- [ ] Exceed **property** and **deal** limits → `OverLimitBanner` → `/plans`.
- [ ] `npm run check` (when code changes are made — not required for audit-only).

## Next trigger and cadence

- **Trigger:** Plan limit or pricing changes, onboarding redesign, or material marketing channel shift (e.g. deal-heavy campaigns).
- **Recommended next run:** Monthly, or within two weeks of production funnel baseline review.
