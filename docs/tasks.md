# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.
**Ownership policy (ownership/metrics tasks):** Follow `docs/policies/ownership-metrics.md` as the canonical source for formulas and copy semantics.
**Analytics math policy (analytics/projection tasks):** Follow `docs/policies/analytics-math-policy.md` for debt-service basis, time-window labels, and UI/API/export reconciliation.

**Future features / roadmap:** See `docs/reference/roadmap.md`. PM promotes items from there to here when ready to build.

---

## Completed

Historical completion logs are archived in `docs/tasks-archived.md`.

---

## Roadmap priority (value vs effort — 2025-03-15)

| Order | Item | Effort | Value | Recommendation |
|-------|------|--------|-------|----------------|
| — | Mortgage balance advancement | ✓ Done | — | Balance advancement, escrow, amortization fix, loan type import, chart tooltip. |
| — | Admin membership override | ✓ Done | — | Tier override, admin UI, settings override display. |
| — | Benchmarking | ✓ Done | — | Rent vs market, surfacing on list/dashboard, inline refresh. |
| — | Error tracking (Sentry) | ✓ Done | — | Production error monitoring; set NEXT_PUBLIC_SENTRY_DSN in Vercel. |
| — | Dashboard single-property | ✓ Done | — | Property at a glance, metrics, Rent vs. Market auto-refresh. |
| **1** | Refinance / payoff insights | Medium–High | High | Actionable; builds on amortization logic. |
| **3** | Simulation page | High | High | Full modeling; extends scenario concept. |
| **4** | Report section (PDF) | Medium | Medium | Professional output; share with partners/lenders. |
| **5** | Automated testing | High | High | Quality foundation; plan per Module M. |

**Defer:** Rent gap email (cost scales), Referral system (validate first).

---

## Active tasks

### Audit program follow-ups (2026-03-19)

#### Batch AP1 - Security hardening follow-up (priority high)

- [ ] Add baseline CSP policy with safe defaults and document rollout/monitoring notes.
- [ ] Expand rate-limit coverage review for sensitive write endpoints beyond rent estimate.
- [ ] Add structured logging for admin-sensitive flows (e.g., export, account-sensitive actions).
- [ ] Run `npm run check` and verify no regressions.

Acceptance criteria:
- [ ] CSP is documented and applied without breaking critical app flows.
- [ ] Sensitive endpoint rate-limit decisions are explicit (implemented or deferred with rationale).
- [ ] Admin-sensitive actions have auditable log coverage.
- [ ] `npm run check` passes.

#### Batch AP2 - Audit governance automation + integrity checks (priority high)

- [ ] Add a recurring command-integrity check (verify every audit rule points to a valid process doc and report folder).
- [ ] Add PM release-gate checklist item that confirms required focused audits were run per `docs/audits/README.md`.
- [ ] Add a lightweight stale-reference scan for `.cursor/rules/*.mdc` and key docs links.
- [ ] Run `npm run check` (if code touched) and verify docs references are valid.

Acceptance criteria:
- [ ] Governance check catches path drift before release approval.
- [ ] PM gating explicitly enforces focused-audit freshness on risk-bearing releases.
- [ ] No broken audit process/report links remain in docs or `.cursor` rules.

#### Batch AP3 - Data + growth + valuation operationalization (priority medium)

- [ ] Add a recurring reconciliation checklist for one representative property/portfolio/API/export path.
- [ ] Add activation funnel checkpoint table (public -> signup -> dashboard -> first property -> first tool use) to growth audit workflow.
- [ ] Add business valuation KPI and value-uplift ranking section template for quarterly business audits.
- [ ] Ensure outputs map cleanly into actionable task candidates each run.

Acceptance criteria:
- [ ] Data-integrity audits include explicit cross-surface reconciliation evidence.
- [ ] Growth-funnel audits include measurable activation blockers and impact hypotheses.
- [ ] Business audits include valuation scenario framing and prioritized uplift actions.

---

## Archived references (2026-03)

Detailed completed QA/history sections were moved to `docs/tasks-archived.md` to keep this file focused on active work:

- Property detail overhaul test checklist (verified complete; moved to archive).
- Property detail tabs UX refinements test checklist (verified complete; moved to archive).
- Recently completed implementation notes and summaries.
- Details tab Phase B inline editing completion checklist.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
