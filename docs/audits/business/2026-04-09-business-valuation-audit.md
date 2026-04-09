# Business & Valuation Audit — 2026-04-09

> **Continuity:** Follows `docs/audits/business/2026-04-07-business-valuation-audit.md`. **Permanent deferral:** Per `docs/process/business-valuation-audit-process.md` §5 (**GRW-1** — mobile pricing accordion omitting “Estimate pool (per hour)”) is **intentionally omitted by design** and is **not** raised as a finding in this pass.

---

## Executive summary

- **Retention and ops automation remain a strength in code and schedule.** `vercel.json` defines seven crons (onboarding, trial, rate-limit cleanup, mortgage milestones, monthly AVM refresh, monthly digest, daily winback). Server event names for digest, refresh, winback, and milestones exist in `app/lib/analytics-events.ts`; Vitest covers multiple cron handlers (e.g. `app/app/api/cron/monthly-digest/route.test.ts`, `monthly-refresh`, `winback-emails`, `milestone-emails`). **`npm run test`** (2026-04-09): **67 files, 460 tests** passed. This supports **delivery and maintainability** signals for an acquirer but does **not** replace verified **MRR, cohort retention, or activation** in production.
- **Revenue and PMF proof remain the valuation ceiling.** `docs/reference/valuation-brief.md` still describes **early-launch / pre-revenue**, **6 users**, **0 paying subscribers** (§1, §288–289). Until figures are refreshed with **dated** production evidence (Stripe, PostHog), valuation stays **replacement-cost and execution-weighted**, not ARR-multiple weighted.
- **Strategic and launch documentation still lag shipped behavior.** The valuation brief’s near-term table still lists **address autocomplete** as unbuilt (§7) while `app/lib/changelog-data.ts` (2026-04-07) describes guided onboarding with autocomplete. `docs/reference/roadmap.md` §2 still opens with **“zero outbound touchpoints”** despite crons above. `docs/launch/analytics.md`’s “Other product events” table does not list server/cron events (those names appear in `app/lib/analytics-events.ts` and are summarized in `docs/reference/complete-engineering-reference.md`). **Launch plan** §9 shows **partial** progress: analytics definition and external uptime monitor are checked; **env, prod health, support, pricing parity, and golden-path demo** remain unchecked (`docs/launch/launch-plan.md`).

---

## Severity-ranked findings

### Critical

- *(None in scope: no billing-architecture defect, existential legal finding, or data-loss class issue identified from reviewed docs and repository evidence.)*

### High

- **Pre-revenue and thin PMF evidence still dominate external valuation** — Documented user and paying counts remain minimal with **no MRR** narrative (`docs/reference/valuation-brief.md` §1, §288–289). Buyer pricing still hinges on **observed** trial→paid and return behavior, not feature depth alone.

### Medium

- **Valuation brief vs. shipped product (stale backlog and gaps)** — §7 “near-term backlog” still includes **address autocomplete** as unbuilt despite changelog/onboarding copy indicating it shipped (`app/lib/changelog-data.ts`, 2026-04-07). §285–297 “Honest gaps” understate **retention automation** now present via crons (`vercel.json`) and related tests. Stale briefs increase **diligence friction** — `docs/reference/valuation-brief.md`.

- **Roadmap retention narrative contradicts implementation** — The **Retention data hooks** intro still claims **“zero outbound touchpoints”** and no scheduled refreshes or digests (`docs/reference/roadmap.md` §2, lines ~148–150), while production schedules **onboarding**, **trial**, **milestone**, **monthly-refresh**, **monthly-digest**, and **winback** crons (`vercel.json`). **Doc alignment** is required for credible investor/operator positioning.

- **Launch analytics doc vs. server event contract** — `docs/launch/analytics.md` §“Other product events” ends at client/product events and does **not** enumerate server/cron events such as `monthly_digest_sent`, `winback_email_sent`, `monthly_refresh_completed`, `mortgage_milestone_email_sent` (`app/lib/analytics-events.ts`). Internal reference partially covers them (`docs/reference/complete-engineering-reference.md`); the **launch-facing** doc remains the gap. Launch plan §11 warns of **instrumentation drift** — risk of **silent dashboard decay** for ops.

- **Public changelog under-reports retention and data-refresh capabilities** — `CHANGELOG_ENTRIES` in `app/lib/changelog-data.ts` has **no** user-facing entry for **monthly digest**, **scheduled AVM refresh**, **winback**, or **milestone** emails despite cron routes and tests. **Business transparency** and **support expectations** may lag **actual product behavior** (unless omission is intentional policy).

- **Launch §9 operational items partially open** — Production env verification, `/api/health` green in prod, support path, **pricing vs Stripe** alignment, and **golden-path demo** remain unchecked; **analytics.md definition** and **external uptime monitor** are checked (`docs/launch/launch-plan.md` §9). Residual items are **go-live and paid-scale** risk until closed.

- **Moat / switching-cost backlog unchanged in strategic docs** — Investor PDF beyond print summary, side-by-side deals, portfolio insights/alerts, read-only share links remain **high-value** gaps in `docs/reference/valuation-brief.md` §7 and roadmap §1a — **defensibility** vs. spreadsheets and incumbents stays **moderate**.

### Low

- **Roadmap “Completed” testing line is stale** — Table cites **“50 test files, 374 tests”** (`docs/reference/roadmap.md` completed reference) vs. **67 files / 460 tests** observed 2026-04-09 (`npm run test` in `app/`). Minor **signal hygiene** for anyone quoting the roadmap as live metrics.

- **Owner concentration and interactive-demo deferral** — Solo operator / bus factor and deferred no-signup demo remain standard **early-stage** themes (`docs/reference/valuation-brief.md` §8; roadmap §Interactive demo).

---

## Evidence reviewed

| Area | Sources |
|------|---------|
| **Process / template** | `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md` |
| **Product / strategy** | `README.md`, `docs/reference/roadmap.md` (§1, §1a, §2 retention, completed table) |
| **Valuation / business narrative** | `docs/reference/valuation-brief.md` (§1–9) |
| **Launch / entity** | `docs/business-launch-checklist.md`, `docs/launch/launch-plan.md` (§2, §9, §10–11) |
| **Changelog (user-facing)** | `app/lib/changelog-data.ts` (read-only evidence) |
| **Analytics contract** | `app/lib/analytics-events.ts`, `docs/launch/analytics.md`, `docs/reference/complete-engineering-reference.md` (cron/event summary) |
| **Retention / ops schedule** | `vercel.json` |
| **Tests** | `npm run test` in `app/` (Vitest **67** files, **460** tests passed, 2026-04-09) |
| **Prior business audit** | `docs/audits/business/2026-04-07-business-valuation-audit.md` |
| **Cross-audit context** | `docs/audits/code/2026-04-09-code-audit.md`, `docs/audits/performance-cost/2026-04-09-performance-cost-audit.md`, `docs/audits/reliability-ops/2026-04-09-reliability-ops-audit.md` (cron/proxy/scale themes — not re-litigated here) |

**Limits:** No Stripe Dashboard, PostHog project, Clerk admin, or live production verification. User/revenue numbers taken **as stated** in `valuation-brief.md`. Valuation ranges are **illustrative**, not fairness opinions. **Audit only** — no changes under `app/` or other application source.

---

## Risk & impact assessment

| Theme | Likelihood | Business impact if unresolved |
|-------|------------|--------------------------------|
| $0 MRR / weak verified activation | High until analytics prove otherwise | No ARR story; acquirer prices **asset + process**, not revenue multiple |
| Stale valuation brief + roadmap | Medium | Extra advisor cycles; **mis-stated** maturity in fundraising or sale conversations |
| Launch analytics doc drift (cron/server) | Medium | Incomplete ops dashboards; **undetected** email/refresh failures |
| Public changelog vs. shipped retention | Low–Medium | Support surprises; **under-selling** retention value in marketing |
| Residual launch §9 items | Medium until closed | **Scale** risk (env, health, support, demo, pricing parity) |
| Thin PDF/alerts/share layer | High (backlog) | **Switching cost** stays lower than tier-1 competitors |

---

## Valuation framing

*(Required by `docs/process/business-valuation-audit-process.md` §4 — indicative bands only, not fairness opinions.)*

### Assumptions

- **Codebase / minimal ARR:** Per `valuation-brief.md` — billing operational, **no** meaningful recurring revenue verified in reviewed documents.
- **With traction:** Requires **verified** MRR, trial→paid conversion, and retention/return signals (PostHog + Stripe).

### Indicative bands (USD)

| Scenario | Priced in | Indicative range | Note vs. 2026-04-07 audit |
|----------|-----------|------------------|---------------------------|
| **A — Codebase, minimal ARR** | Replacement cost, feature depth, policies, tests, **cron-based retention stack**, trial/onboarding | **~$20K–$48K** | **Slight upward tilt** from ~$18K–$45K on prior passes: automated retention paths and **+76** tests vs. Apr 7 baseline (384); **not** a substitute for revenue proof |
| **B — Early revenue** | Dozens of paying subs, basic retention, funnel visibility | **~$50K–$110K** | Unchanged — needs **actuals** |
| **C — PMF signal** | $2K+ MRR, improving NRR, differentiated outputs (PDF, alerts, share) | **~$150K–$400K+** | Unchanged — needs **traction + moat** delivery |

---

## Recommendations (prioritized)

1. **Refresh `docs/reference/valuation-brief.md` with a dated snapshot** — Remove shipped items from “unbuilt” lists (e.g. address autocomplete), add **retention/cron** and **2026** dashboard/table releases, update **testing** stats, and replace static user counts with **as-of** figures from Clerk/Stripe/PostHog when available.
2. **Align `docs/reference/roadmap.md` §2** with shipped crons — Replace the “zero outbound touchpoints” framing with **phased truth** (what shipped vs. still planned, e.g. rent-gap email alerts).
3. **Extend `docs/launch/analytics.md`** — Add a **server/cron events** subsection mirroring stable names in `app/lib/analytics-events.ts` (digest, refresh, winback, milestones, and any related trial/onboarding server events); add PM validation bullets for cron-driven PostHog captures.
4. **Close or consciously defer `docs/launch/launch-plan.md` §9** remaining items — Owner verification for env, prod health, support, pricing/Stripe parity, and golden-path demo; link evidence in-repo where possible.
5. **Changelog policy decision** — Either add concise user-facing bullets for **scheduled emails and value refresh** (`app/lib/changelog-data.ts`) or record in internal process docs why they stay **out of band** (if intentional).

---

## Task candidates

- [ ] **Valuation brief refresh** — Accuracy pass vs. `changelog-data.ts`, `vercel.json`, and current Vitest counts — `docs/reference/valuation-brief.md`.
- [ ] **Roadmap retention intro rewrite** — Truthful narrative vs. shipped crons — `docs/reference/roadmap.md` §2.
- [ ] **Analytics.md server/cron appendix** — Mirror `app/lib/analytics-events.ts` — `docs/launch/analytics.md`.
- [ ] **Roadmap completed-table test counts** — Update “50 / 374” to current figures — `docs/reference/roadmap.md`.
- [ ] **Launch §9 verification** — Human/owner: env, health, support, demo, pricing — `docs/launch/launch-plan.md`.
- [ ] **BIZ-5 (human-only):** LLC + Stripe entity + Terms entity — `docs/business-launch-checklist.md`.

---

## Re-test checklist

- [ ] After brief/roadmap updates: spot-check **no** contradiction with `app/lib/changelog-data.ts` and `vercel.json`.
- [ ] After `analytics.md` update: confirm listed event names match `app/lib/analytics-events.ts` exactly.
- [ ] After launch §9 closure: record **date + verifier** in launch plan or linked runbook.
- [ ] `npm run check` in `app/` when any application code changes (not required for doc-only work).

---

## Next trigger and cadence

- **Trigger:** Material GTM push; first **paying** subscriber; pricing/packaging change; first **production** review cycle for digest/refresh/winback; fundraising or M&A prep.
- **Recommended next run:** **Monthly** while retention crons and trial mechanics are maturing; sooner if PostHog dashboards are updated for server/cron events.

---

**PM triage:** Classify follow-ups per `docs/process/full-audit-synthesis.md` §3.5 — **Ship / Schedule / Optional / Human-only**; promote **Ship** and **Schedule** to `docs/tasks.md` when approved.
