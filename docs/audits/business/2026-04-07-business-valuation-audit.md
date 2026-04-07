# Business & Valuation Audit — 2026-04-07

> **Continuity note:** This run follows `docs/audits/business/2026-04-05-business-valuation-audit.md`. Since that pass, the product shipped a major **2026-04-07** release (changelog): guided first-property onboarding, address autocomplete, completeness scoring, broad mobile redesign, **14-day Investor trial (no card)**, and lifecycle email reminders. Prior **GRW-2** and **GRW-3** gaps are **resolved in code**. **GRW-1** (mobile pricing accordion) remains open. **`docs/policies/property-completeness.md`** now exists and closes the April 5 completeness-governance gap.

---

## Executive summary

- **Monetization and activation architecture materially improved.** The roadmap’s reverse-trial model and retention-adjacent onboarding emails are reflected in shipped product (`app/lib/changelog-data.ts`, trial helpers in `app/lib/plans.ts` / `app/lib/plans.test.ts`, lifecycle copy in `app/lib/emails/`). This raises execution credibility versus “planned only,” but **valuation still requires verified outcomes** (paying subs, `property_created` / trial funnel in PostHog), not feature shipment alone.
- **Revenue and PMF proof remain the ceiling.** `docs/reference/valuation-brief.md` still frames the stage as early-launch / pre-revenue with **0 paying subscribers** and a **small signed-up cohort**. Until MRR and engagement are observable in production analytics, an acquirer prices primarily on **replacement cost + documentation + test depth**, not ARR multiples.
- **Growth funnel hygiene improved:** competitor/alternative CTAs now pass `planIntent="free"` (`app/components/marketing/competitor-alternative-page.tsx`), and `user_signed_up` includes landing-variant and UTM spreads (`app/components/analytics/posthog-signup-once.tsx`). **GRW-1** — mobile pricing accordion missing the **Estimate pool (per hour)** row — is still a **High** parity defect for mobile evaluators (`app/app/pricing/page.tsx`).
- **Governance and delivery signals are stronger:** canonical **property completeness policy** (`docs/policies/property-completeness.md`), **51 Vitest files / 384 passing tests** (run 2026-04-07), and cron route tests (e.g. `app/app/api/cron/onboarding-emails/route.test.ts`, `trial-emails`) support maintainability. **Formal business / LLC checklist** items in `docs/business-launch-checklist.md` remain largely unchecked for the full LLC path — align before meaningful revenue (**BIZ-5** class).

---

## Severity-ranked findings

### Critical

- *(none — no billing-architecture defect, existential legal finding, or data-loss class issue in scope.)*

### High

- **Pre-revenue and limited PMF evidence still dominate valuation** — Without verified MRR, retention cohorts, and activation metrics, the business narrative stays **asset + execution** not **revenue multiple**. Valuation brief documents production billing and a small user base with **0 paying subscribers** — `docs/reference/valuation-brief.md` §1, §9 (as applicable). Post–Apr 7 ship, **refresh** this brief with trial start/expiry and property-creation rates once measured.

- **Mobile pricing table omits paid-tier “Estimate pool” row (GRW-1)** — Desktop comparison includes `["Estimate pool (per hour)", "5/hr", "10/hr", "20/hr"]` (~line 142); mobile accordion rows end at “Portfolio charts” with **no** estimate-pool row (~lines 184–192). Mobile buyers may misunderstand Pro/Investor differentiation — `app/app/pricing/page.tsx`.

### Medium

- **Output layer / switching cost still mostly backlog** — Investor PDF (beyond print-friendly summary), side-by-side deal comparison, read-only share links, and portfolio alerts remain high-value moat items in `docs/reference/roadmap.md` and `docs/reference/valuation-brief.md` §7; `docs/tasks.md` still lists “Report section (PDF)” as priority #4 without a dated implementation plan — switching cost stays **moderate**.

- **Valuation brief vs. product drift** — Brief’s shipped-feature inventory and “policy count” may lag (e.g. completeness policy, reverse trial, onboarding/cron surfaces). Stale external-facing diligence docs **inflate diligence friction** for advisors/acquirers — `docs/reference/valuation-brief.md` (last updated April 2026).

- **Cron / email operations monitoring not evidenced in docs** — Onboarding and trial email crons are implemented and unit-tested under `app/app/api/cron/`, but no reviewed **runbook or alert spec** ties Sentry/PostHog to `onboarding_email_sent` / `trial_email_sent` volume (see `app/lib/analytics-events.ts`). Silent failure risk for activation levers remains — process gap, not necessarily missing code.

- **Entity / Stripe / legal alignment still deferred (BIZ-5)** — `docs/business-launch-checklist.md` describes sole-proprietor posture and recommends LLC before meaningful revenue; full LLC checklist largely **unchecked**. Narrowing window as conversion mechanics improve.

### Low

- **Interactive demo still deferred** — Pre-signup objection (“what am I buying?”) unaddressed per `docs/reference/roadmap.md` §Interactive demo; acceptable tradeoff while trial/onboarding ship.

- **Owner/operator concentration** — Solo GTM and brand dependency; standard early-stage risk — `docs/reference/valuation-brief.md` §8.

- **Email regulatory classification** — Lifecycle and re-engagement emails include unsubscribe per changelog; confirm **lawful basis** (e.g. GDPR) for time-triggered messages if EU users scale — `docs/business-launch-checklist.md` / prior synthesis **LEG** themes.

---

## Evidence reviewed

| Signal | Source |
|--------|--------|
| **Process** | `docs/process/business-valuation-audit-process.md` (full) |
| **Template** | `docs/process/audit-report-template.md` |
| **Product / strategy** | `README.md`, `docs/reference/roadmap.md` (§1, §1a, §2 reverse trial & retention hooks, completed table), `docs/tasks.md` (roadmap priority table, active tasks) |
| **Launch / entity** | `docs/business-launch-checklist.md` |
| **Valuation narrative** | `docs/reference/valuation-brief.md` (§1–6, §5 testing/governance) |
| **Prior lane** | `docs/audits/business/2026-04-05-business-valuation-audit.md` |
| **Changelog (product readiness)** | `app/lib/changelog-data.ts` — entry **2026-04-07** (onboarding, mobile, 14-day trial, lifecycle emails) |
| **Metrics (documented)** | `docs/reference/valuation-brief.md` — stage, pricing, user/paying counts as stated there |
| **Tests** | `app/package.json` scripts; **Vitest** run 2026-04-07: **51 files, 384 tests passed** |
| **Monetization / trial** | `app/lib/plans.test.ts` (trial helpers); `app/lib/analytics-events.ts` (trial + funnel events) |
| **Growth fixes** | `app/components/marketing/competitor-alternative-page.tsx` (`planIntent="free"`); `app/components/analytics/posthog-signup-once.tsx` (`getLandingVariantForAnalytics`, UTM) |
| **Pricing parity** | `app/app/pricing/page.tsx` (desktop vs mobile rows) |
| **Completeness governance** | `docs/policies/property-completeness.md` |
| **Cron coverage** | `app/app/api/cron/onboarding-emails/route.test.ts`, `app/app/api/cron/trial-emails/route.test.ts` (existence + test pass) |

**Limits:** No Stripe Dashboard, PostHog project, or Clerk admin accessed. No live production verification. Valuation bands are **illustrative**, not fairness opinions. **Audit only** — no changes under `app/`.

---

## Risk & impact assessment

| Theme | Likelihood | Business impact if unresolved |
|-------|------------|--------------------------------|
| $0 MRR / weak activation proof | High until analytics show otherwise | Valuation stays replacement-cost–weighted; no ARR story |
| GRW-1 mobile pricing gap | High for mobile traffic | Tier confusion; support and churn friction on estimate limits |
| Thin output / share layer | High (backlog) | Low switching cost vs spreadsheets and incumbents |
| Stale valuation brief | Medium | Extra advisor cycles; perceived doc debt |
| Cron silent failure | Medium without monitoring | Trial/onboarding emails don’t fire; invisible funnel leak |
| Entity misalignment at first revenue | Medium | Legal/Stripe cleanup tax; buyer diligence flag |

---

## Valuation framing

### Assumptions

- **Codebase / no material ARR:** Per brief — billing ready, **no** meaningful recurring revenue verified in reviewed docs.
- **With traction:** Requires **verified** MRR, trial→paid conversion, and retention signals.

### Indicative bands (USD — wide ranges, not fairness opinions)

| Scenario | Priced in | Indicative range | vs. 2026-04-05 |
|----------|-----------|------------------|----------------|
| **A — Codebase, minimal ARR** | Replacement cost, depth of features, tests, policies, **shipped** trial + onboarding + funnel attribution fixes | **~$18K–$45K** | **Upward tilt:** reverse trial, onboarding stack, GRW-2/3, completeness policy, +10 tests — reduce “buyer must build conversion layer” discount; **no** substitute for user/revenue proof |
| **B — Early revenue** | Dozens of paying subs, basic retention, funnel visibility | **~$50K–$110K** | Unchanged — needs actuals |
| **C — PMF signal** | $2K+ MRR, improving NRR, output/share features | **~$150K–$400K+** | Unchanged |

---

## Recommendations (prioritized)

1. **Verify post-ship funnel in PostHog within 48–72 hours** — Confirm `trial_started`, `property_created`, and email events fire for real signups; update `docs/reference/valuation-brief.md` §1 with **dated** metrics snapshot.
2. **Close GRW-1** — Add the **Estimate pool (per hour)** row to the mobile pricing accordion to match desktop (`app/app/pricing/page.tsx`).
3. **Document cron observability** — One-page runbook: expected cron schedule, how to confirm `onboarding_email_sent` / `trial_email_sent` volume, Sentry or PostHog alert hooks — e.g. extend `docs/runbooks/` or `docs/launch/` (human-owned).
4. **Schedule investor PDF (tasks.md #4)** — Scope from existing `/export/portfolio-summary` pattern; raises switching cost and Pro/Investor justification.
5. **Triage BIZ-5 before first paying customer** — LLC, Stripe entity, Terms/Privacy entity name per `docs/business-launch-checklist.md`.

---

## Task candidates

- [ ] **GRW-1:** Add mobile accordion row for **Estimate pool (per hour)** — `app/app/pricing/page.tsx`.
- [ ] **Refresh valuation brief** — User counts, trial narrative, policy list (include `property-completeness.md`), last-reviewed date — `docs/reference/valuation-brief.md`.
- [ ] **Cron + email observability doc** — Alert expectations and manual verification steps for onboarding/trial crons.
- [ ] **Scope PDF export** — Promote from roadmap to concrete task in `docs/tasks.md` with acceptance criteria.
- [ ] **BIZ-5 (human-only):** LLC path + Stripe + legal copy — `docs/business-launch-checklist.md`.

---

## Re-test checklist

- [ ] After GRW-1: mobile pricing accordion shows estimate-pool row; parity with desktop table.
- [ ] After valuation-brief update: numbers match PostHog/Stripe for the stated date.
- [ ] After observability doc: dry-run or staging proof that cron paths log errors to Sentry (if configured).
- [ ] `npm run check` in `app/` when any code change lands.

---

## Next trigger and cadence

- **Trigger:** First week of data after **2026-04-07** release; first paying subscriber; pricing/packaging change; fundraising or M&A prep.
- **Recommended next run:** Within **1 week** of release (activation + trial metrics), then **monthly** while GTM is active.

---

**PM triage:** Classify follow-ups per `docs/process/full-audit-synthesis.md` §3.5 — **Ship / Schedule / Optional / Human-only**; promote **Ship** and **Schedule** to `docs/tasks.md` when approved.
