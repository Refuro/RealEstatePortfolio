# Business & Valuation Audit — 2026-04-27

> **Continuity:** Follows `docs/audits/business/2026-04-09-business-valuation-audit.md`. **Permanent deferral:** Per `docs/process/business-valuation-audit-process.md` §5 (**GRW-1** — mobile pricing accordion omitting "Estimate pool (per hour)") is **intentionally omitted by design** and is **not** raised as a finding in this pass.

---

## Executive summary

- **Valuation is still traction-limited, not engineering-limited.** `docs/reference/valuation-brief.md` §1 and §285–289 continue to describe **early-launch / pre-revenue**, **6 users**, **0 paying subscribers**, and **no MRR** — the ceiling for an acquirer or investor remains **go-to-market and conversion proof**, not feature gaps in the abstract.
- **Shipped GTM and retention mechanics outpace several strategic documents.** The public changelog (`app/lib/changelog-data.ts`, 2026-04-07) documents **14-day Investor access (no card)** and **guided onboarding with address autocomplete**, while `docs/reference/valuation-brief.md` §7 still lists **address autocomplete** and parts of the **unbuilt** backlog as if current. The roadmap still frames **reverse trial** as a future "switch" (`docs/reference/roadmap.md` §Reverse trial) and **Retention data hooks** as having **"zero outbound touchpoints"** despite scheduled crons in `app/vercel.json` (onboarding, trial, milestones, monthly-refresh, monthly-digest, winback, rate-limit cleanup). This **documentation–product drift** adds diligence friction and understates real maturity.
- **Engineering and ops signals remain a relative strength for stage.** `npm run test` (2026-04-27, `app/`): **67** test files, **466** tests passed. Recent changelog entries (e.g. 2026-04-22) reference **cron execution fixes** and **analytics** hardening — relevant to **reliability** and **attribution** for paid experiments, but not a substitute for **dated** Stripe/PostHog-backed revenue and retention figures.
- **Overall recommendation:** Refresh owner-facing business docs against shipped reality; keep **highest-ROI** focus on **verified funnel metrics** (trial → property → paid) and **closing** residual launch operational checks (`docs/launch/launch-plan.md` §9) before scaling spend or M&A-style conversations.

---

## Severity-ranked findings

### Critical

- *(None in scope: no billing-architecture defect, existential legal finding, or data-loss class issue identified from reviewed docs and repository evidence.)*

### High

- **Revenue and PMF evidence remain the external valuation ceiling** — Documented user and paying counts are minimal with **no MRR** (`docs/reference/valuation-brief.md` §1, §288–289). Acquirer or investor pricing still depends on **observed** conversion, engagement, and retention, not codebase depth alone.

### Medium

- **`valuation-brief.md` near-term backlog vs shipped product** — §7 table still lists **address autocomplete** as unbuilt and positions items (e.g. interactive demo, PDF, alerts) without reflecting that **print portfolio summary**, **deal portfolio context**, **tools hub + calculators expansion**, and **14-day trial** are already in market per changelog and broader brief sections. Stale "unbuilt" rows reduce **credible** positioning in due diligence — `docs/reference/valuation-brief.md`.

- **Roadmap internal contradictions (reverse trial + retention narrative)** — §"Reverse trial pricing model" still reads as a proposed **switch from pure freemium** and "why now" copy, while `app/lib/changelog-data.ts` (2026-04-07) ships "**14 days of full Investor access, no card required**." §"Retention data hooks" still states **"zero outbound touchpoints"** and no scheduled digests/refresh, which conflicts with `app/vercel.json` crons. **Strategic doc accuracy** lags product — `docs/reference/roadmap.md`.

- **Roadmap test-count lines stale** — Completed table and §testing snapshot cite **50 files / 374 tests** while current Vitest is **67 files / 466 tests** (2026-04-27). Minor but visible when the roadmap is quoted as live ops metrics — `docs/reference/roadmap.md`.

- **Launch analytics focus vs server/cron contract** — `docs/launch/analytics.md` documents client and product events in depth; **server/cron-originated** events (see stable names in `app/lib/analytics-events.ts`, summarized in `docs/reference/complete-engineering-reference.md`) are still easy to under-document in **launch-facing** runbooks. Launch plan §11 flags **instrumentation drift** — `docs/launch/launch-plan.md`, `docs/launch/analytics.md`.

- **Public changelog may under-emphasize retention value** — User-facing entries highlight large UX and marketing releases; **scheduled digest, AVM refresh, winback, milestone** behavior is not spelled out in `CHANGELOG_ENTRIES` the same way (Apr 9 audit). Optional **transparency** gap for users and for buyers inferring "stickiness" from release notes — `app/lib/changelog-data.ts` (read-only evidence).

- **Launch §9 operational items partially open** — Production env verification, prod `/api/health`, support path, **pricing vs Stripe** parity, and **golden-path demo** remain unchecked; analytics definition and external uptime monitor are checked — `docs/launch/launch-plan.md` §9.

- **Defensibility / moat backlog unchanged in narrative** — `docs/reference/valuation-brief.md` §7 and roadmap §1a: investor-grade PDF, side-by-side deals, portfolio insights/alerts, read-only share links remain **strategic** gaps vs spreadsheets and incumbents; **switching cost** is moderate until those ship.

### Low

- **Entity and legal posture** — `docs/business-launch-checklist.md` notes Terms/Privacy may still describe a **sole proprietor–style** operator until an LLC is registered; standard **early-stage** theme for **human-only** follow-up, not a product defect.

- **Owner concentration** — Solo / bus factor called out in `docs/reference/valuation-brief.md` §8; typical for stage.

- **Valuation brief §8 "no automated test coverage on full product surface"** — Vitest depth is strong for core domains; **E2E** (e.g. Playwright) may still be partial or missing — align wording with `docs/reference/roadmap.md` and actual test stack to avoid **understating** automated coverage in external reads — `docs/reference/valuation-brief.md` §8.

---

## Evidence reviewed

| Area | Sources |
|------|---------|
| **Process / template** | `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md` |
| **Product / strategy** | `README.md`, `docs/reference/roadmap.md` (§1, §1a, §2 reverse trial, §2 retention, completed / testing lines) |
| **Valuation / business narrative** | `docs/reference/valuation-brief.md` (§1–3, §7–9) |
| **Launch / entity** | `docs/business-launch-checklist.md`, `docs/launch/launch-plan.md` (§2, §9, §10–11) |
| **Changelog (user-facing)** | `app/lib/changelog-data.ts` (read-only) |
| **Analytics** | `docs/launch/analytics.md`, `docs/reference/complete-engineering-reference.md` (event/cron context) |
| **Cron / schedule** | `app/vercel.json` |
| **Tests** | `npm run test` in `app/` (Vitest **67** files, **466** tests passed, 2026-04-27) |
| **Prior business audit** | `docs/audits/business/2026-04-09-business-valuation-audit.md` |
| **Cross-audit (maintainability signal)** | `docs/audits/code/2026-04-27-code-audit.md` (mega-components, performance notes — not re-derived here) |

**Limits:** No Stripe Dashboard, PostHog project, Clerk admin, or live production verification. User/revenue numbers taken **as stated** in `valuation-brief.md`. Valuation ranges are **illustrative**, not fairness opinions. **Audit only** — no changes under `app/` or other application source.

---

## Risk & impact assessment

| Theme | Likelihood | Business impact if unresolved |
|-------|------------|--------------------------------|
| $0 MRR / weak verified activation | High until analytics prove otherwise | No durable ARR story; priced as **asset + process** |
| Stale valuation brief + roadmap | Medium | Mis-stated maturity in **fundraising, partnerships, or sale** talks |
| Launch §9 + analytics runbook gaps | Medium | **Scale and ops** risk; silent drift on server events |
| Thin PDF / alerts / share layer | High (as backlog) | **Defensibility** vs incumbents stays limited |
| Documentation understating tests | Low | Unnecessary **discount** in technical diligence |

---

## Valuation framing

*(Indicative bands only, per `docs/process/business-valuation-audit-process.md` — not fairness opinions.)*

### Assumptions

- **Codebase / minimal ARR:** Billing and feature depth are operational; **no** meaningful recurring revenue in reviewed documents.
- **With traction:** Needs **dated** MRR, trial→paid, cohort retention, and reactivation evidence (Stripe + PostHog + support of claims in `valuation-brief.md`).

### Indicative bands (USD)

| Scenario | Priced in | Indicative range | Note vs. 2026-04-09 |
|----------|-----------|------------------|---------------------|
| **A — Codebase, minimal ARR** | Replacement cost, feature depth, policies, test suite, cron/retention stack, trial mechanics | **~$20K–$50K** | **Slight** uplift ceiling from **+6** tests and ongoing ops fixes (e.g. changelog 2026-04-22); still **not** ARR-based |
| **B — Early revenue** | Dozens of paying subs, basic retention, visible funnel | **~$50K–$110K** | Unchanged — requires **actuals** |
| **C — PMF signal** | ~$2K+ MRR, improving NRR, differentiated outputs (alerts, PDF, share) | **~$150K–$400K+** | Unchanged — needs **traction + moat** delivery |

`valuation-brief.md` §9 cites **2,000–3,000** engineering hours and **$200K–$450K** replacement-style floor for a from-scratch rebuild; scenario **A** stays **conservative** vs that internal ceiling because external buyers **discount** for solo-operator and unproven GTM.

---

## Recommendations (prioritized)

1. **Refresh `docs/reference/valuation-brief.md` §7 and §8** — Remove **shipped** items from the "unbuilt" table (e.g. address autocomplete; note **14-day trial** and cron-backed retention), distinguish **print summary** vs **branded server PDF**, and **update** automated testing wording to match Vitest + any E2E status.
2. **Rewrite `docs/reference/roadmap.md` §Reverse trial and §Retention data hooks** — Mark reverse trial **shipped** (with pointer to changelog/tasks) and replace "zero outbound touchpoints" with **what is live** (cron list) vs **still planned** (e.g. rent-gap email as phased item). Update test counts to current figures.
3. **Extend `docs/launch/analytics.md`** with a **server / cron** event appendix aligned to `app/lib/analytics-events.ts` — supports ops dashboards and reduces drift risk flagged in `launch-plan.md` §11.
4. **Close or defer `docs/launch/launch-plan.md` §9** items with owner verification notes — env, health, support, **pricing/Stripe** parity, golden-path demo.
5. **Changelog policy** — Either add concise bullets for **email/digest/refresh** wins or record **intentional** omission in internal process (`docs/launch/changelog-process.md`).

---

## Task candidates

- [ ] **Valuation brief accuracy pass** — `docs/reference/valuation-brief.md` (§7 near-term, §8 testing, §285–289 traction placeholder refresh when owner has dated numbers).
- [ ] **Roadmap: reverse trial + retention + Vitest counts** — `docs/reference/roadmap.md`.
- [ ] **Analytics.md server/cron appendix** — `docs/launch/analytics.md`.
- [ ] **Launch §9 verification** — `docs/launch/launch-plan.md` (human/owner).
- [ ] **BIZ-entity (human-only):** LLC + Stripe entity + Terms entity — `docs/business-launch-checklist.md`.

---

## Re-test checklist

- [ ] After brief/roadmap updates: spot-check consistency with `app/lib/changelog-data.ts` and `app/vercel.json`.
- [ ] After `analytics.md` update: event names match `app/lib/analytics-events.ts` exactly.
- [ ] After launch §9 closure: record **date + verifier** in launch plan or runbook.
- [ ] `npm run check` in `app/` when application code changes (not required for doc-only work).

---

## Next trigger and cadence

- **Trigger:** First **production** MRR milestone; **material** pricing/packaging change; fundraising or M&A prep; monthly while GTM and retention automation evolve.
- **Recommended next run:** **Within ~4 weeks** or **next full product audit synthesis**; sooner if `valuation-brief.md` user/revenue section is updated with verifiable numbers.

---

**PM triage:** Classify follow-ups per `docs/process/full-audit-synthesis.md` §3.5 — **Ship / Schedule / Optional / Human-only**; promote **Ship** and **Schedule** to `docs/tasks.md` when approved.
