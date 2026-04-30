# Business & Valuation Audit — 2026-04-29

> **Continuity:** Follows `docs/audits/business/2026-04-27-business-valuation-audit.md`. **Permanent deferral:** Per `docs/process/business-valuation-audit-process.md` §5 (**GRW-1** — mobile pricing accordion omitting "Estimate pool (per hour)") is **intentionally omitted by design** and is **not** raised as a finding in this pass.

---

## Executive summary

- **External valuation remains bounded by traction, not feature depth.** `docs/reference/valuation-brief.md` §1, §288–332 still describe **early-launch / pre-revenue**, **6 users**, **0 paying subscribers**, **no MRR**, and **zero users who added a property** — the binding constraint for an acquirer or investor is **activation and conversion proof**, not missing shelfware.
- **Owner-facing strategy docs continue to lag shipped product.** `docs/reference/roadmap.md` still frames **reverse trial** as a future switch from freemium (`docs/reference/roadmap.md` §Reverse trial) and **retention** as having **"zero outbound touchpoints"** (`docs/reference/roadmap.md` §Retention data hooks), while the 2026-04-27 audit already noted shipped **14-day Investor access** and scheduled crons. The roadmap **completed** table still cites **50 test files / 374 tests**; current Vitest is **82 files / 601 tests** (this run, `app/`, 2026-04-29). Drift **widened** since the last audit.
- **Engineering quality signals strengthened again.** Automated test volume increased materially since 2026-04-27 — a **relative** strength for technical diligence, but **not** a substitute for revenue, retention, or PMF evidence.
- **Overall recommendation:** Prioritize **dated, verifiable funnel metrics** (trial → property → paid) and **documentation refresh** so fundraising, partnership, or sale conversations match reality; close or explicitly defer **launch §9** operational checks before scaling paid acquisition.

---

## Severity-ranked findings

### Critical

- *(None in scope: no billing-architecture defect, existential legal finding, or data-loss class issue identified from reviewed docs and repository evidence.)*

### High

- **Revenue and activation evidence remain the valuation ceiling** — Documented funnel is stark: **0 of 6 users** have added a property (`docs/reference/valuation-brief.md` §Activation funnel); **no MRR** (`docs/reference/valuation-brief.md` §1, §289). Buyers and investors price **observed** behavior, not codebase depth alone.

### Medium

- **`valuation-brief.md` §7 "unbuilt" table vs shipped reality** — **Address autocomplete** is still listed as near-term backlog (`docs/reference/valuation-brief.md` §259–270) despite shipped onboarding/autocomplete called out elsewhere in prior audits and roadmap context. Rows for **investor-ready PDF**, **side-by-side deals**, **alerts**, **share links** remain valid gaps; the table does not clearly separate **shipped substitutes** (e.g. print portfolio summary §98) from **ideal** outputs — `docs/reference/valuation-brief.md`.

- **`roadmap.md` internal contradictions (reverse trial, retention, Vitest)** — Reverse trial subsection still reads as **proposed** freemium switch (`docs/reference/roadmap.md` §194–207). Retention still claims **zero outbound touchpoints** and no scheduled refreshes/digests (`docs/reference/roadmap.md` §212–226), conflicting with cron-backed behavior noted in the 2026-04-27 audit. Completed table cites **Vitest 50 files / 374 tests** (`docs/reference/roadmap.md` §258–259); actual run **82 / 601** (2026-04-29, `npm run test` in `app/`). **Strategic doc accuracy** lags product.

- **Launch §9 operational items still open** — Production env verification, prod `/api/health`, support path, **pricing vs Stripe** parity, and **golden-path demo** remain unchecked; analytics definition and external uptime monitor are checked — `docs/launch/launch-plan.md` §226–236.

- **Defensibility / moat narrative unchanged** — Portfolio alerts, server PDF, share links, interactive demo deferred path (`docs/reference/roadmap.md` §232–235) vs incumbents: **switching costs** stay moderate until those ship — consistent with `docs/reference/valuation-brief.md` §276–282.

### Low

- **Entity and legal posture** — Terms/Privacy may still describe a **sole proprietor–style** operator until LLC formalization — `docs/business-launch-checklist.md` §76–77. **Human-only** follow-up.

- **Owner concentration** — Solo / bus factor in `docs/reference/valuation-brief.md` §299; typical for stage.

- **`valuation-brief.md` §293 vs automated depth** — "No automated test coverage on the full product surface" is qualified by Phases 1–3 and **Vitest** depth; **82 / 601** tests reduce the "no coverage" read for **core domains** — wording may **understate** strength vs E2E gap — `docs/reference/valuation-brief.md`.

---

## Evidence reviewed

| Area | Sources |
|------|---------|
| **Process / template** | `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md` |
| **Product / strategy** | `README.md`, `docs/reference/roadmap.md` (§Reverse trial, §Retention data hooks, §Completed / Vitest) |
| **Valuation / business narrative** | `docs/reference/valuation-brief.md` (§1–3, §7–10, §Activation funnel / conversion Q&A) |
| **Launch / entity** | `docs/business-launch-checklist.md`, `docs/launch/launch-plan.md` §9 |
| **Tests (current)** | `npm run test -- --run` in `app/` — **82** test files, **601** tests passed (2026-04-29) |
| **Prior business audit** | `docs/audits/business/2026-04-27-business-valuation-audit.md` |

**Limits:** No Stripe Dashboard, PostHog project, Clerk admin, or live production verification. User/revenue numbers taken **as stated** in `valuation-brief.md`. Valuation ranges are **illustrative**, not fairness opinions. **Audit only** — no changes under `app/` or other application source.

---

## Risk & impact assessment

| Theme | Likelihood | Business impact if unresolved |
|-------|------------|-------------------------------|
| $0 MRR / zero property activation | High until disproven by data | No durable ARR story; priced as **asset + process** |
| Stale valuation brief + roadmap | Medium–high (drift increasing) | Mis-stated maturity in **fundraising, partnerships, or sale** talks |
| Launch §9 + ops verification gaps | Medium | **Scale and ops** risk when spend or audience grows |
| Thin PDF / alerts / share / demo layer | High (as backlog) | **Defensibility** vs incumbents stays limited |

---

## Valuation framing

*(Indicative bands only, per `docs/process/business-valuation-audit-process.md` — not fairness opinions.)*

### Assumptions

- **Codebase / minimal ARR:** Billing and feature depth are operational; **no** meaningful recurring revenue in reviewed documents.
- **With traction:** Requires **dated** MRR, trial→paid, cohort retention, and reactivation evidence (Stripe + analytics), supporting claims in `valuation-brief.md`.

### Indicative bands (USD)

| Scenario | Priced in | Indicative range | Note vs. 2026-04-27 |
|----------|-----------|------------------|---------------------|
| **A — Codebase, minimal ARR** | Replacement cost, feature depth, policies, test suite, automation | **~$22K–$55K** | **Slight** uplift from **+15** test files and **+135** tests; still **not** ARR-based |
| **B — Early revenue** | Dozens of paying subs, basic retention, visible funnel | **~$50K–$110K** | Requires **actuals** |
| **C — PMF signal** | ~$2K+ MRR, improving NRR, differentiated outputs (alerts, PDF, share) | **~$150K–$400K+** | Unchanged — needs **traction + moat** delivery |

`valuation-brief.md` §313 cites **2,000–3,000** engineering hours and **$200K–$450K** replacement-style ceiling for a from-scratch rebuild; scenario **A** stays **conservative** vs that internal ceiling because external buyers **discount** for solo-operator risk and **unvalidated** GTM.

---

## Recommendations (prioritized)

1. **Refresh `docs/reference/valuation-brief.md` §7 and activation narrative** — When owner has updated numbers: replace placeholders; separate **shipped** (print summary, onboarding) from **true backlog**; avoid listing **address autocomplete** if already shipped under current product definition.
2. **Rewrite `docs/reference/roadmap.md` §Reverse trial, §Retention data hooks, and §Completed Vitest line** — Mark reverse trial and retention automation **as shipped vs planned** with references to internal task/changelog sources; set Vitest to **82 / 601** (or remove hard counts in favor of "see latest CI / `npm run test`").
3. **`docs/launch/launch-plan.md` §9** — Owner verification with dates recorded for env, health, support, Stripe/pricing parity, golden-path demo — unblocks confident scaling narrative.
4. **Instrument and review one executive dashboard weekly** — trial start → property_created → checkout → subscription_activated, with cohort dates — ties directly to Scenario B/C bands.

---

## Task candidates

- [ ] **Valuation brief backlog table + funnel stats** — `docs/reference/valuation-brief.md` (§7 near-term table; §327–337 when traction data exists).
- [ ] **Roadmap: reverse trial, retention prose, Vitest counts** — `docs/reference/roadmap.md`.
- [ ] **Launch §9 verification** — `docs/launch/launch-plan.md` (human/owner).
- [ ] **BIZ-entity (human-only):** LLC + Stripe entity + Terms entity — `docs/business-launch-checklist.md`.

---

## Re-test checklist

- [ ] After brief/roadmap updates: consistency with changelog and cron schedule references (sources cited in roadmap).
- [ ] After launch §9 closure: record **date + verifier** in launch plan or runbook.
- [ ] `npm run check` in `app/` when application code changes (not required for doc-only work).

---

## Next trigger and cadence

- **Trigger:** First **production** MRR milestone; **material** pricing/packaging change; fundraising or M&A prep; monthly while GTM and retention automation evolve.
- **Recommended next run:** **Within ~4 weeks** or **next full product audit synthesis**; sooner if `valuation-brief.md` user/revenue section updates with verifiable numbers.

---

**PM triage:** Classify follow-ups per `docs/process/full-audit-synthesis.md` §3.5 — **Ship / Schedule / Optional / Human-only**; promote **Ship** and **Schedule** to `docs/tasks.md` when approved.
