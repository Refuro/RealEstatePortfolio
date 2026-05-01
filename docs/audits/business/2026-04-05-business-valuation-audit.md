# Business & Valuation Audit — 2026-04-05

> **Continuity note:** This run follows the April 4 Run 2 audit (`docs/audits/business/2026-04-04-business-valuation-audit.md`). The primary new development since that run is the **onboarding & first-property activation rollout plan** (`docs/plans/2026-04-05-onboarding-activation-rollout.md`) and the associated **completeness schema migration** (`app/prisma/migrations/20260406120000_completeness_overhaul/migration.sql`). Several April 4 findings (GRW-1, GRW-2, GRW-3, BIZ-1, BIZ-5) remain unresolved and are carried forward.

---

## Executive summary

- **Activation crisis is now the explicit strategic focus.** With 0 of 6 users having added a property, the April 5 onboarding activation rollout plan (`docs/plans/2026-04-05-onboarding-activation-rollout.md`) directly attacks the pre-activation funnel break across 20 requirements and two phases. This is the most commercially significant development since launch and the right prioritization decision. If Phase 1 ships quickly and any of the 6 existing users activates, the entire valuation narrative changes — from "no users have evaluated the product" to "product is being used as intended."
- **Revenue proof remains the valuation ceiling.** Zero MRR, zero paying subscribers, zero activated users. The codebase-only valuation band ($15K–$35K) is unchanged from April 4. No upward movement is possible until at least one paying user with verifiable engagement exists. The rollout plan is the proximate mechanism that could change this.
- **Three April 4 High findings remain unresolved** and are now on their third consecutive audit pass: mobile pricing accordion missing the hourly estimate pool row (GRW-1), competitor/alternative CTAs missing `planIntent` and `?intent=free` (GRW-2), and `landing_variant` not captured on the `user_signed_up` event (GRW-3). These are small, well-scoped fixes; their continued absence is a process signal, not a technical difficulty.
- **The activation rollout introduces Phase 2 infrastructure risk.** Vercel Cron re-engagement emails, proxied Google Places API, new nullable DB fields, and a completeness scoring system are all net new. Each has its own failure mode. Silent failures on the cron job would mean the day-3/day-7 re-engagement emails never fire — directly undermining the most novel activation lever in the plan.

---

## Severity-ranked findings

### Critical

- *(none — no billing architecture defect, existential legal exposure, or blocking data-loss class finding in scope.)*

### High

- **Activation at zero — entire product remains unvalidated by users** — 0/6 signed-up users have added a property as of April 5. The product's core intelligence surfaces (portfolio dashboard, metrics, analysis workspaces) require at least one property to be meaningful. No user has yet experienced the product's actual value. This is not a product quality indictment — it is a distribution and onboarding problem. The April 5 rollout plan is the correct response. However, until at least one user activates, all commercial narratives (pricing, retention, PMF) are speculative. — `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` §1, `docs/reference/valuation-brief.md` §10

- **Revenue proof still absent — valuation remains asset-only** — $0 MRR, 0 paying subscribers. No Stripe revenue events have been captured in reviewed materials. The billing infrastructure is complete and correct (webhook signature verification, idempotency guards, tier sync, plan limits — all verified in code); the problem is no one has converted. Until verified MRR exists, an acquirer prices this on replacement cost only. — `app/lib/stripe-config.ts`, `app/app/api/billing/webhook/route.ts`, `docs/reference/valuation-brief.md` §9

- **`landing_variant` absent from `user_signed_up` — attribution blind spot worsening** — Carried from prior audits (April 3, April 4). `posthog-signup-once.tsx` still fires `user_signed_up` without `landing_variant` (last-touch). The April 5 activation rollout adds new entry surfaces (quick-add, day-3/7 emails, persistent dashboard CTA), none of which will be attributable to a signup cohort. With more surfaces, the gap compounds: it will be impossible to measure whether email re-engagement drives activated signups vs. organic discovery vs. calculator traffic. — `app/components/analytics/posthog-signup-once.tsx`, `app/lib/analytics-events.ts`, consolidated task **GRW-3**

### Medium

- **Activation rollout Phase 2 introduces silent-failure risk — no monitoring spec** — Phase 2 adds a Vercel Cron job for day-3/day-7 re-engagement emails (Resend). The plan (`docs/plans/2026-04-05-onboarding-activation-rollout.md` §Unit 9) describes the cron query and email delivery logic, but contains no monitoring requirement. If the cron job fails silently (missed invocation, Resend delivery failure, DB query error), the re-engagement emails never fire — directly undermining the plan's primary novel lever. The `onboarding_email_sent` analytics event (`app/lib/analytics-events.ts`) will also fail to fire, making the failure invisible. A simple Sentry alert on cron errors or a PostHog alert on zero `onboarding_email_sent` events in a 24h window would close this gap. — `docs/plans/2026-04-05-onboarding-activation-rollout.md` §Unit 9, `app/lib/analytics-events.ts`

- **Pricing mobile accordion missing Estimate pool row (GRW-1) — third consecutive audit** — Desktop `<table>` at `app/app/pricing/page.tsx` lines 133–143 includes `["Estimate pool (per hour)", "5/hr", "10/hr", "20/hr"]`; mobile `<details>` (lines 180–207) has 7 rows and never shows the hourly pool row. Mobile evaluators comparing tiers are missing a paid-tier differentiator. The growth funnel audit (`2026-04-04-growth-funnel-audit.md`) rated this High. This is a 3-line addition. — `app/app/pricing/page.tsx`, consolidated task **GRW-1**

- **Competitor/alternative CTAs missing `planIntent` and `?intent=free` (GRW-2) — third consecutive audit** — `app/components/marketing/competitor-alternative-page.tsx` hero, inline-table, and footer CTAs use `href="/sign-up"` without `?intent=free` and no `planIntent` prop. High-intent SEO traffic converting from `/vs/*` and `/alternatives/*` pages cannot trigger `PaidIntentCheckoutBanner` and arrives at sign-up without plan intent set. — `app/components/marketing/competitor-alternative-page.tsx`, consolidated task **GRW-2**

- **Completeness scoring — no written policy governing what "complete" means** — The `20260406120000_completeness_overhaul` migration introduces `hasMortgage` on the `Property` table for completeness scoring. `app/lib/property-completeness.ts` governs the scoring logic. However, no policy document (analogous to `docs/policies/ownership-metrics.md`) defines the completeness contract: which fields are required, which are optional, and how the score maps to the "Complete your property" prompt (Requirement R16 in the rollout plan). Without this, completeness logic is an implementation detail rather than a governed contract — the same class of risk the math policy docs explicitly prevented for metrics. — `app/lib/property-completeness.ts`, `app/prisma/migrations/20260406120000_completeness_overhaul/migration.sql`

- **Output layer (Gap #1 — PDF) and switching-cost features still unscheduled** — Investor PDF export, side-by-side deal comparison, read-only share links, and portfolio alerts remain unbuilt and unscheduled. Collectively, these determine data gravity — how hard it is for a user to leave. Without them, a user can reconstruct their portfolio in a spreadsheet in one afternoon. `docs/tasks.md` lists Report section (PDF) at priority #4 but no implementation plan or scoping task exists. — `docs/tasks.md` §Roadmap priority, `docs/reference/valuation-brief.md` §7, consolidated task **BIZ-1**

- **Entity/legal alignment still deferred (BIZ-5)** — Terms and Privacy describe a sole-proprietor-style operator; LLC formation, Stripe entity alignment, and copy updates remain human-only deferred items. Unchanged since April 4. The plan notes this should be completed "before meaningful revenue." The activation rollout is designed to drive toward meaningful revenue; the entity alignment window is narrowing. — `docs/audits/synthesis/2026-04-04-audit-synthesis.md` §BIZ-5

### Low

- **Re-engagement email transactional classification — GDPR/CAN-SPAM edge** — The rollout plan classifies day-3/day-7 re-engagement emails as transactional (requiring only an unsubscribe link, not explicit opt-in). These emails are time-triggered from signup date, not triggered by a specific user action. Under GDPR, this characterization may not hold — time-triggered re-engagement emails are typically marketing communications requiring a lawful basis beyond the mere act of signing up for a product. Legal review should confirm the classification before the cron goes live, especially given the `LEG-4`/`LEG-5` items (governing law and auto-renewal disclosures) already deferred in the April 4 synthesis. — `docs/plans/2026-04-05-onboarding-activation-rollout.md` §Unit 9, `docs/audits/synthesis/2026-04-04-audit-synthesis.md` §LEG-4/LEG-5

- **Google Places API key via proxied route — quota and cost not specified** — Phase 2 adds address autocomplete via a proxied `app/api/places/autocomplete/route.ts`. The rollout plan correctly notes the API key must not reach the client. However, there is no spec for: rate limiting on the proxy route, per-user or per-session call caps, monthly budget for the Places API, or fallback behavior when the API is unavailable. At low user counts this is not material; but it should be documented before the feature ships to avoid surprise cost at scale. — `docs/plans/2026-04-05-onboarding-activation-rollout.md` §Key Technical Decisions

- **Interactive demo still unbuilt** — No change since April 4. The pre-signup conversion objection ("I don't know what I'm getting") remains unaddressed. Roadmap §Interactive demo describes a Phase A Arcade.so embed (zero-engineering-cost); this is still the highest-ROI pre-signup conversion improvement available. — `docs/reference/roadmap.md` §Interactive demo

- **Owner/operator concentration — no change** — One-person operator; brand, GTM, and iteration velocity are concentrated. Documentation and governance reduce but do not eliminate this. Standard pre-revenue SaaS risk; flagged for completeness. — `docs/reference/valuation-brief.md` §8

---

## Evidence reviewed

| Source | Detail |
|--------|--------|
| **Prior audit** | `docs/audits/business/2026-04-04-business-valuation-audit.md` (Run 2, this audit supersedes for today's pass) |
| **New plan (2026-04-05)** | `docs/plans/2026-04-05-onboarding-activation-rollout.md` (full read — 20 requirements, Phase 1 + Phase 2, analytics events, DB decisions) |
| **Friction audit** | `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` (full read) |
| **Schema migration** | `app/prisma/migrations/20260406120000_completeness_overhaul/migration.sql` (full read) |
| **Test plan** | `docs/test-plans/2026-04-05-quick-add-completion-gap-test-plan.md` (reviewed — confirms Phase 2 active) |
| **Analytics** | `app/lib/analytics-events.ts` (full read — 32 events registered, including new Phase 2 events) |
| **Stripe integration** | `app/lib/stripe-config.ts`, `app/app/api/billing/webhook/route.ts` (full read — complete, idempotent, analytics-wired) |
| **Plan limits** | `app/lib/plans.ts` (full read — Free/Investor/Pro limits confirmed correct) |
| **Pricing page** | `app/app/pricing/page.tsx` (full read — mobile accordion row gap confirmed: 7 rows, no estimate-pool row) |
| **Changelog** | `app/lib/changelog-data.ts` (full read — 6 entries, most recent 2026-04-04, active) |
| **Valuation brief** | `docs/reference/valuation-brief.md` (full read — current as of April 2026) |
| **April 4 synthesis** | `docs/audits/synthesis/2026-04-04-audit-synthesis.md` (full read — 73 consolidated items) |
| **Growth funnel audit** | `docs/audits/growth-funnel/2026-04-04-growth-funnel-audit.md` (reviewed — GRW-1/GRW-2 open) |
| **Completeness module** | `app/lib/property-completeness.ts` (confirmed present, no policy doc found) |

**Limits:** No Stripe Dashboard, PostHog project, or Clerk user management accessed. No live browser session. Email delivery (Resend) not tested. Valuation figures are illustrative ranges, not fairness opinions. Audit only — no application source files modified.

---

## Risk & impact assessment

| Theme | Likelihood | Business impact if unresolved |
|-------|------------|-------------------------------|
| 0% activation rate | Certain until rollout ships and drives engagement | Product remains unvalidated; no PMF evidence; valuation stays asset-only |
| No MRR | Certain until any user pays | Acquisition priced on replacement cost only; no ARR multiple possible |
| Cron job silent failure | Medium (new infra, no monitoring spec) | Day-3/7 emails never fire; primary re-engagement lever misfires invisibly |
| `landing_variant` missing from signup | By current design | Attribution worsens as rollout adds more entry surfaces; channel ROI unquantifiable |
| Mobile pricing row gap (GRW-1) | High for mobile evaluators | Wrong-tier selection; post-upgrade estimate-pool surprises; churn risk |
| No completeness policy doc | Medium | Inconsistent "Complete your property" prompt behavior; same class of risk as pre-policy metric drift |
| Output layer unshipped | High — backlog only | Low switching cost; premium tier differentiation rests on property/deal count caps only |
| Email legal classification | Low until scale | GDPR compliance gap if re-engagement emails don't meet transactional threshold |

---

## Valuation framing (updated from April 4)

### Assumptions

- **Codebase-only:** No verified recurring revenue. Activation at zero.
- **With traction:** Requires verified MRR, cohort data, and at least one user demonstrating meaningful engagement.

### Indicative valuation bands (USD — wide ranges, not fairness opinions)

| Scenario | What is priced in | Indicative range | Change from Apr 4 |
|----------|-------------------|------------------|-------------------|
| **A — Codebase / no material ARR** | Replacement cost + integration depth + test/doc maturity + activation rollout plan as governance signal + public calculator SEO surface | **~$15K–$38K** | Slight upward tilt: rollout plan and completeness infrastructure are genuine asset additions; no movement without user evidence |
| **B — Early revenue** | 10–50 paying subs, basic retention, activation metrics visible in PostHog | **~$50K–$110K** | Unchanged — requires actuals |
| **C — PMF signal** | 100+ paying, $2K+ MRR, improving net retention, output layer shipped | **~$150K–$400K+** | Unchanged — requires verified cohorts |

### What the April 5 plan adds to Scenario A

The onboarding activation rollout plan (`docs/plans/2026-04-05-onboarding-activation-rollout.md`) is a material addition to the codebase asset in two ways:
1. **Documentation asset:** A well-scoped, 20-requirement implementation plan is acquirer-readable evidence that the activation problem has been diagnosed and planned correctly. This reduces the "buyer must fix the funnel cold" risk discount.
2. **Code additions (when shipped):** Quick-add path, progressive save, re-engagement emails, and completeness scoring collectively increase data gravity (users who partially fill in a property are more likely to return to complete it) and re-engagement surface area. These are genuine retention mechanism additions, not cosmetic polish.

Neither addition moves the band materially without activation evidence. They narrow the acquirer's perceived work-to-validate-hypothesis cost.

### Top 3 value drivers (to increase valuation — updated)

1. **Activate at least one user — any method** — The April 5 rollout plan is the right vehicle. If Phase 1 (copy, UX, field guidance) ships in the current session and any of the 6 existing users adds a property, the valuation narrative changes from "0% activation" to "product is being used." This single data point — one activated user — is worth more than any feature addition.
2. **Get the first paying subscriber** — Even $15/month from one user proves willingness to pay, which is the single most valuable data point an acquirer or investor can receive at this stage. Phase 1 of the activation rollout is prerequisite; the billing infrastructure is already production-ready.
3. **Ship investor PDF output (Gap #1)** — Unchanged from April 4. M-effort, highest differentiation vs. DealCheck/Stessa, increases switching cost. Gate to Investor/Pro. Extends the existing `/export/portfolio-summary` pattern.

### Top 3 risks an acquirer would flag (updated)

1. **No distribution proof, 0% activation** — The honest framing is now that the product has never been meaningfully used. This is the sharpest diligence flag. The activation rollout plan is evidence of awareness and correct diagnosis, but not yet evidence of resolution.
2. **Silent-failure risk on new infra (cron, Places API)** — Phase 2 of the activation rollout introduces infra the product has never run before. Without monitoring, a buyer inherits unknown reliability for the two highest-leverage new activation levers.
3. **Low switching cost / data gravity** — PDF, share links, and deal comparison remain unbuilt. A user can leave with their property data in a mental model; nothing is locked in. Gaps #1, #5, and #7 from the product gap discovery all address this; none are scheduled.

---

## Recommendations (prioritized)

1. **Ship activation rollout Phase 1 this session** — Copy, UX, and field guidance (Units 1–6 per the plan) are no-infrastructure, executable now. The wizard field-guidance fixes, empty-dashboard re-engagement card, and copy accuracy corrections have the highest probability of converting at least one existing user with no additional engineering risk. Do not gate Phase 1 on Phase 2 readiness.
2. **Add cron monitoring before Phase 2 ships** — Before the Vercel Cron re-engagement email job goes live, add a Sentry alert on cron handler errors and a PostHog alert (or manual check) on `onboarding_email_sent` volume. The absence of this monitoring makes the plan's highest-leverage new lever unverifiable.
3. **Fix GRW-1 and GRW-2 this session alongside the rollout** — Mobile pricing accordion row (3 lines) and competitor CTA `planIntent` (two-line prop addition) have been open for three audit passes. They are small enough to include in the activation rollout batch. Continued deferral is a process failure, not a prioritization tradeoff.
4. **Add `landing_variant` to `user_signed_up` before more entry surfaces ship** — The activation rollout adds email re-engagement, quick-add, and a persistent dashboard CTA. All of these are new sources of sign-ups. Without `landing_variant` attribution, which channel drives activated users vs. unactivated users cannot be measured.
5. **Write a completeness policy document** — Before the "Complete your property" prompt (R16) ships, draft a brief policy document in `docs/policies/` defining the completeness scoring contract. This follows the same governance pattern as `ownership-metrics.md` and `analytics-math-policy.md` and prevents the same class of spec/code drift that those policies were written to prevent.
6. **Triage entity/legal alignment before first paying user** — The window for LLC formation and Terms/Privacy entity copy alignment is the current pre-revenue period. The activation rollout is designed to close that window. BIZ-5 and LEG-4/LEG-5 should be scheduled as human-only tasks with a deadline tied to "before the first paying subscriber."
7. **Plan investor PDF output (Gap #1) for the sprint after Phase 1 activation ships** — Once activation metrics show at least one user engaging with the portfolio dashboard, the PDF output is the next highest-leverage feature for switching cost, premium conversion, and acquirer narrative. Scope and add to `docs/tasks.md`.

---

## Task candidates

- [ ] **Ship activation rollout Phase 1** (Units 1–6 per `docs/plans/2026-04-05-onboarding-activation-rollout.md`): wizard field guidance, empty-dashboard re-engagement card, copy accuracy, touch target fixes. No new infrastructure.
- [ ] **Add cron monitoring before Phase 2 ships**: Sentry alert on cron handler errors; PostHog check on `onboarding_email_sent` volume; document expected daily firing count in `docs/runbooks/incident-response.md`.
- [ ] **GRW-1: Add "Estimate pool (per hour)" row to pricing mobile accordion** — `app/app/pricing/page.tsx` ~line 188 — 3-line addition to match desktop table.
- [ ] **GRW-2: Add `planIntent="free"` and `?intent=free` to competitor/alternative primary CTAs** — `app/components/marketing/competitor-alternative-page.tsx` hero, table, and footer placements.
- [ ] **GRW-3: Add `landing_variant` to `user_signed_up` event** — `app/components/analytics/posthog-signup-once.tsx`; pass last-touch variant or document approved session-funnel workaround in `docs/launch/analytics.md`.
- [ ] **Write completeness policy doc** — `docs/policies/property-completeness.md`: define which fields are required vs. optional, how the completeness score is computed, and what threshold triggers the "Complete your property" prompt. Govern `app/lib/property-completeness.ts`.
- [ ] **Plan investor PDF output (Gap #1)** — define scope, add to `docs/tasks.md`; extends existing `/export/portfolio-summary` pattern; gate to Investor/Pro.
- [ ] **BIZ-5 (human-only): LLC formation, Stripe entity alignment, Terms/Privacy update** — set a deadline tied to "before first paying subscriber."
- [ ] **Review re-engagement email transactional classification** — confirm day-3/day-7 emails qualify as transactional under GDPR and CAN-SPAM before cron goes live; adjust opt-in mechanism if required.

---

## Re-test checklist

- [ ] After Phase 1 ships: verify at least one of the 6 existing users adds a property (manual outreach or PostHog check on `property_created` event).
- [ ] After Phase 2 ships: verify `onboarding_email_sent` event fires in PostHog within 24h of a qualifying user's day-3 window.
- [ ] After GRW-1 fix: verify mobile accordion shows 8 rows including Estimate pool; compare to desktop table parity.
- [ ] After GRW-2 fix: verify `funnel_cta_clicked` events from `/vs/*` and `/alternatives/*` carry `plan_intent: "free"`.
- [ ] After GRW-3 fix: verify `user_signed_up` event in PostHog includes `landing_variant` property.
- [ ] After any Stripe or pricing change: re-verify `app/lib/pricing-display.ts` vs. Stripe dashboard price IDs match.
- [ ] `npm run check` in `app/` after any code change lands.

---

## Next trigger and cadence

- **Trigger:** First user activates (adds a property); first paying subscriber; Phase 2 ships; pricing/packaging change; M&A or fundraising process begins.
- **Recommended next run:** Within 48 hours of Phase 1 shipping (to assess whether activation rate moved). Then monthly while active user acquisition and GTM are in progress.

---

**PM triage:** Classify follow-ups per `docs/process/full-audit-synthesis.md` §3.5 — **Ship / Schedule / Optional / Human-only**; promote **Ship** and **Schedule** to `docs/tasks.md` when approved.
