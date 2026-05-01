# Business & Valuation Audit — 2026-04-30

> **Continuity:** Follows `docs/audits/business/2026-04-29-business-valuation-audit.md`. **Permanent deferral:** Per `docs/process/business-valuation-audit-process.md` §5 (**GRW-1** — mobile pricing accordion omitting "Estimate pool (per hour)") is **intentionally omitted by design** and is **not** raised as a finding in this pass.

---

## Executive summary

- **Valuation is still capped by documented traction, not capability.** `docs/reference/valuation-brief.md` §1, §288–332 continues to describe **early-launch / pre-revenue**, **6 users**, **0 paying subscribers**, **no MRR**, and **zero users who added a property** — acquirers and investors weight **observed activation and revenue**, not roadmap depth.
- **Strategy docs remain materially behind the repo.** `docs/reference/roadmap.md` still states **50 test files / 374 tests** in two places; Vitest as of this pass is **85 files / 618 tests** (`npm run test -- --run` in `app/`, 2026-04-30). Reverse-trial and retention prose conflicts noted on 2026-04-29 are **unchanged** on spot-check — accuracy risk for external conversations persists.
- **Engineering diligence signals improved again** (+3 files, +17 tests vs. 2026-04-29). That strengthens **technical asset** narrative but does not substitute for funnel proof.
- **Cross-lane signal:** `docs/audits/feature/2026-04-30-feature-ux-audit.md` documents **inconsistent first-property paths** (quick vs. full wizard across Dashboard, Properties, chrome). At zero activated users, friction in the **activation surface** is a **conversion-relevant** risk class alongside missing interactive demo — evidence is audit-level, not live-session validated.
- **Overall recommendation:** Refresh canonical business/strategy docs to match shipped product and current test counts; close **`docs/launch/launch-plan.md` §9** operational checks; instrument and review a **single weekly funnel view** (trial → property → paid); treat activation IA consistency as **Schedule** once doc refresh lands.

---

## Severity-ranked findings

### Critical

- *(None in scope: no billing-architecture defect, existential legal finding, or data-loss class issue identified from reviewed docs and repository evidence.)*

### High

- **Revenue and activation evidence remain the valuation ceiling** — Documented funnel: **0 of 6 users** have added a property (`docs/reference/valuation-brief.md` §329–331); **no MRR** (`docs/reference/valuation-brief.md` §1, §289). External pricing of the asset stays **pre-revenue / asset-sale** until disproven with dated metrics.

### Medium

- **`roadmap.md` stale Vitest figures and internal contradictions** — Completed table and §386 still cite **50 files / 374 tests** (`docs/reference/roadmap.md`); actual **85 / 618** (2026-04-30). Reverse trial and retention hooks still read as **future / zero outbound** in places where product work has shipped — same structural issue as 2026-04-29 audit (`docs/reference/roadmap.md` §194–226 area; spot-check unchanged).

- **`valuation-brief.md` §7 backlog vs shipped substitutes** — Near-term table still lists **address autocomplete** as unbuilt (`docs/reference/valuation-brief.md` §265–270) while roadmap prose references shipped autocomplete in testing coverage (`docs/reference/roadmap.md` §386). Table mixes **ideal outputs** (PDF, alerts, share) with items that may need **recategorization** — weakens due-diligence clarity.

- **`docs/launch/launch-plan.md` §9 operational gaps unchanged** — Env verification, prod `/api/health`, support path, **pricing ↔ Stripe** parity, and **golden-path demo** remain unchecked (`docs/launch/launch-plan.md` §226–236). Blocks a confident “production-ready for scale” narrative.

- **Activation UX inconsistency (conversion adjacency)** — Feature lane audit finds divergent **Add property** defaults (quick vs. full wizard) across Dashboard empty vs. chrome vs. Properties zero-state, plus mobile **Analyze** labeling/icon ambiguity (`docs/audits/feature/2026-04-30-feature-ux-audit.md`). With **no users reaching core product** (`docs/reference/valuation-brief.md` §329–331), this class of friction is **material hypothesis**, not yet measurement-backed.

- **Defensibility / moat narrative unchanged** — PDF, persistent alerts, share links, interactive demo remain gaps vs. incumbents (`docs/reference/valuation-brief.md` §276–282, §293–298); **switching costs** stay moderate until shipped.

### Low

- **Entity and legal posture** — Terms/Privacy may still describe **sole proprietor–style** operator until LLC path completes (`docs/business-launch-checklist.md` §76–77). **Human-only.**

- **Owner concentration** — Bus factor 1 (`docs/reference/valuation-brief.md` §299); typical for stage.

- **`valuation-brief.md` §293 wording vs Vitest depth** — “No automated test coverage on the full product surface” remains directionally true for **E2E**, but **618** passing unit/integration-style tests **moderates** a careless read of “no coverage” — `docs/reference/valuation-brief.md`.

---

## Evidence reviewed

| Area | Sources |
|------|---------|
| **Process / template** | `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md` |
| **Product / strategy** | `README.md`, `docs/reference/roadmap.md` (Vitest lines §258, §386; retention / reverse trial zones) |
| **Valuation / business narrative** | `docs/reference/valuation-brief.md` (§1–3, §7–10, activation Q&A) |
| **Launch / entity** | `docs/business-launch-checklist.md`, `docs/launch/launch-plan.md` §9 |
| **Cross-lane UX** | `docs/audits/feature/2026-04-30-feature-ux-audit.md` |
| **Tests (current)** | `npm run test -- --run` in `app/` — **85** test files, **618** tests passed (2026-04-30) |
| **Prior business audit** | `docs/audits/business/2026-04-29-business-valuation-audit.md` |

**Limits:** No Stripe Dashboard, PostHog production drill-down, Clerk admin, or live prod verification. User/revenue counts taken **as stated** in `valuation-brief.md`. Valuation bands are **illustrative**, not fairness opinions. **Audit only** — no edits under `app/`.

---

## Risk & impact assessment

| Theme | Likelihood | Business impact if unresolved |
|-------|------------|-------------------------------|
| $0 MRR / zero property activation | High until disproven | No durable ARR story; asset priced **below SaaS multiples** |
| Stale roadmap + valuation brief | Medium–high | Mis-stated maturity in **fundraising, partnership, or sale** discussions |
| Launch §9 gaps | Medium | **Ops and trust** risk when spend or audience grows |
| Activation IA friction | Medium (hypothesis) | **Suppresses** property-created rate; invisible without instrumentation |
| Thin PDF / alerts / share / demo | High (as backlog) | **Defensibility** vs incumbents stays limited |

---

## Valuation framing

*(Indicative bands only — not fairness opinions.)*

### Assumptions

- **Codebase / minimal ARR:** Billing and feature depth operational per `valuation-brief.md`; **no** meaningful recurring revenue in reviewed documents.
- **With traction:** Requires **dated** MRR, trial→paid, retention, and activation cohorts (Stripe + analytics).

### Indicative bands (USD)

| Scenario | Priced in | Indicative range | Note vs. 2026-04-29 |
|----------|-----------|------------------|---------------------|
| **A — Codebase, minimal ARR** | Replacement cost, policies, tests, automation | **~$22K–$55K** | **Marginal** uplift from **+3** files / **+17** tests; still **not** ARR-based |
| **B — Early revenue** | Dozens of paying subs, basic retention, visible funnel | **~$50K–$110K** | Requires **actuals** |
| **C — PMF signal** | ~$2K+ MRR, improving NRR, differentiated outputs (alerts, PDF, share) | **~$150K–$400K+** | Unchanged — needs **traction + moat** delivery |

`valuation-brief.md` §313 internal **$200K–$450K** rebuild ceiling remains a **theoretical upper bound** for greenfield replication; external **Scenario A** stays conservative for **solo-operator** and **unvalidated GTM** discounts.

---

## Recommendations (prioritized)

1. **Update `docs/reference/roadmap.md`** — Set Vitest line items to **85 / 618** (2026-04-30) or replace hard counts with “run `npm run test` / CI”; reconcile **reverse trial** and **retention** subsections with shipped vs. planned reality with citations.
2. **Refresh `docs/reference/valuation-brief.md` §7** — Remove or relabel **address autocomplete** if product definition treats it as shipped; separate **shipped mitigations** (e.g. print portfolio summary) from **true backlog**.
3. **Close `docs/launch/launch-plan.md` §9** — Owner verification with dates for env, health, support, Stripe/pricing parity, golden-path demo.
4. **Executive funnel dashboard (weekly)** — trial → property_created → checkout → subscription_activated with cohort dates; ties directly to Scenario B/C.
5. **Activation IA rule (cross-lane)** — After prioritization with PM, align **quick vs. full wizard** defaults per `docs/audits/feature/2026-04-30-feature-ux-audit.md` recommendations — reduces silent drop-off risk at current funnel stage.

---

## Task candidates

- [ ] **Roadmap:** Vitest counts + reverse trial / retention accuracy — `docs/reference/roadmap.md`.
- [ ] **Valuation brief:** §7 table + §293 qualification vs Vitest depth — `docs/reference/valuation-brief.md`.
- [ ] **Launch §9 verification** — `docs/launch/launch-plan.md` (owner).
- [ ] **BIZ-entity (human-only):** LLC + Stripe entity + Terms entity — `docs/business-launch-checklist.md`.
- [ ] **Activation IA follow-through** — Promote from feature audit when ready — `docs/audits/feature/2026-04-30-feature-ux-audit.md`.

---

## Re-test checklist

- [ ] After brief/roadmap updates: internal consistency with changelog and cron references.
- [ ] After launch §9 closure: record **date + verifier** in launch plan or runbook.
- [ ] `npm run check` in `app/` when application code changes (not required for doc-only work).

---

## Next trigger and cadence

- **Trigger:** First production MRR milestone; material pricing/packaging change; fundraising or M&A prep; monthly while GTM evolves; **after** any doc-only refresh of `valuation-brief.md` user counts.
- **Recommended next run:** **Within ~4 weeks** or next full product audit synthesis.

---

**PM triage:** Classify follow-ups per `docs/process/full-audit-synthesis.md` §3.5 — **Ship / Schedule / Optional / Human-only**; promote **Ship** and **Schedule** to `docs/tasks.md` when approved.
