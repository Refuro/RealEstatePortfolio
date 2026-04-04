# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.
**Ownership policy (ownership/metrics tasks):** Follow `docs/policies/ownership-metrics.md` as the canonical source for formulas and copy semantics.
**Analytics math policy (analytics/projection tasks):** Follow `docs/policies/analytics-math-policy.md` for debt-service basis, time-window labels, and UI/API/export reconciliation.

**Future features / roadmap:** See `docs/reference/roadmap.md`. PM promotes items from there to here when ready to build.

**Test quality gate (process):** How tests fit CI, PM review, and pre-push flow is in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md). **Completed** test-infra Phases 1–3 (detail), Husky, audit batches **1–15**, and the **2026-04-04** audit Ship/Schedule batch are in [`docs/tasks-archived.md`](tasks-archived.md) — see § **Tasks.md archive (2026-03-30)**, § **Tasks.md archive (2026-04-04)**, § **Tasks.md archive (2026-04-03 run 2)**, § **Tasks.md archive (2026-03-30 — testing hardening Phases 1–3)**, and related 2026-04-05 cleanup sections. **Planned** automated-test expansion: **Testing hardening** Phase 4+ below (aligned with [`qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md)).

---

## Completed

Historical completion logs and full checkbox snapshots are in [`docs/tasks-archived.md`](tasks-archived.md) — see **§ Tasks.md archive (2026-03-20)**, **§ Tasks.md archive (2026-03-30)**, **§ Tasks.md archive (2026-04-04)**, **§ Tasks.md archive (2026-04-03 run 2)**, **§ Tasks.md archive (2026-04-03 + 2026-04-01 — prior Ship batches)**, **§ Tasks.md archive (2026-03-31 — calculators and metric tones)**, **§ Tasks.md archive (2026-03-31 — full audit remediation completed phases)**, and **§ Tasks.md archive (2026-03-30 — testing hardening Phases 1–3)** (2026-04-05 cleanup).

---

## Roadmap priority (value vs effort — last reviewed 2026-04-04)

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

### Mobile shell verification (functionality, logic, math)

*Process:* PM promotes here → **builder** implements per `.cursor/rules/builder-agent.mdc`. **Canonical math:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`. **Playwright/E2E:** out of scope for this batch.

*Plan & checklist:* [`docs/qa/mobile-shell-verification.md`](qa/mobile-shell-verification.md). **Broader mobile audit criteria** (full app): [`docs/qa/mobile-experience-audit.md`](qa/mobile-experience-audit.md).

**Status:** Phase **A** (Vitest + `MobileToolShell` tests) is complete — detail in [`docs/tasks-archived.md`](tasks-archived.md) § Tasks.md archive (2026-03-30).

#### Phase 0 — Manual QA (PM or owner)

- [ ] **Run manual matrix** — At 320 / 375 / 430px and desktop ≥768px: verify all four `MobileToolShell` surfaces (Deal Analyzer, Modeling, Mortgage, Public calculator per landing/calc routes). Confirm functionality (shell chrome, inputs, collapsibles, charts), and spot-check logic/math against policies (see verification doc § Phase 0).
  - *Acceptance:* Checklist in `docs/qa/mobile-shell-verification.md` completed or issues filed; no blocking regressions.

#### Phase B — Optional integration smoke (builder, after A)

- [ ] **Optional: `matchMedia` + public calculator smoke** — Mock `(max-width: 767px)` and render `PublicCalculator` (or minimal wrapper) to assert mobile shell path renders — only if low flake.
  - *Acceptance:* Documented in `docs/qa/mobile-shell-verification.md`; skip with rationale if not worth maintenance.

---

### Full audit remediation — 2026-03-31 synthesis — **remaining (open items)**

*Promoted from:* [`docs/audits/synthesis/2026-03-31-audit-synthesis.md`](audits/synthesis/2026-03-31-audit-synthesis.md) and [`docs/audits/synthesis/2026-04-01-audit-synthesis.md`](audits/synthesis/2026-04-01-audit-synthesis.md). *Completed phase snapshots:* [`docs/tasks-archived.md`](tasks-archived.md) § **Tasks.md archive (2026-03-31 — full audit remediation completed phases)**.

**Tracking tags**

| Tag | Meaning |
|-----|---------|
| **`[Synth]`** | Item appears in the synthesis consolidated task list — check off here to see what is still open vs addressed. |
| **`[Synth+]`** | Strongly implied by a lane report; not a separate line in synthesis (avoid duplicate PM tickets). |

---

#### Phase 2 — Observability (optional follow-up)

- [ ] **`[Synth+]` `error.tsx` Sentry + React 19** — *Skipped in prior batch per PM; optional follow-up.*
  - *Acceptance:* PM approves scope; no duplicate flood of events in dev; document choice in PR.

---

##### Phase 13 — Reliability & performance — **open**

- [ ] Evaluate whether app-shell `force-dynamic` can be narrowed or isolated as traffic scales.

---

##### Phase 14 — UX, accessibility & mobile — **open**

- [ ] Run a device-backed narrow viewport matrix pass (320 / 375 / 390 / 430 and 767 / 768 boundary) and log evidence in the mobile verification or audit notes.

---

##### Phase 17 — Business, launch & internal analytics docs — **open**

- [ ] Close unchecked operational items in [`docs/launch/launch-plan.md`](launch/launch-plan.md) section 9 against production reality. *Doc note added 2026-04-01; production verification remains on owner.*

---

##### Phase 18 — Repository documentation housekeeping — **open**

- [ ] Clean up superseded same-day documentation audit reruns once canonical copy is confirmed. *Owner: keep multiple same-day audits as real artifacts (2026-04-01).*

---

##### Phase 20 — Legal & compliance — **open**

- [ ] Route Terms recurring-billing/auto-renew wording through counsel for target jurisdictions *(owner / PM; track outcome in repo or legal folder as appropriate)*.
- [ ] Standardize legal-page metadata hygiene (exact "Last updated" date format; optionally consistent processor policy links). *Terms/Privacy already use "Last updated: Month YYYY"; optional Privacy processor sentence deferred.*

---

##### Phase 21 — Synthesis manual verification gate (`[Synth 4-01]`)

*Boundary:* QA and evidence after implementation waves — no new product scope (re-run audits and smoke tests once Phases 10–20 are sufficiently complete). *PM/owner runs these; not automated in-repo.*

- [ ] Re-run impacted lane audits (minimum: Reliability, Data Integrity, Growth, Mobile when those domains were touched).
- [ ] Smoke: sign-up/sign-in, checkout, webhook sync, portal launch, `past_due` recovery (after billing-related phases).
- [ ] Manual CSV: export → import round-trip with escrow, stored balance, and negative-amortization edge rows (after Phase 12).
- [ ] Live/staging: verify `robots.txt`, `sitemap.xml`, and app-route `noindex` / public canonical behavior (after Phase 16).

---

#### Deferred from synthesis (explicitly not in Phases 10–21)

*Large or design-pending items stay deferred until promoted explicitly.*

- [ ] **`[Synth]` Mega-module refactors** — Wizard, deal analyzer, projections tab, etc. (Code audit) — **deferred.**
- [ ] **`[Synth]` Onboarding modal decorative reduction** — **deferred** with mega-ui batch.
- [ ] **`[Synth]` `@theme` `primary` vs `text-primary` / `bg-primary`** — **deferred** unless blocking another task.

*The following were **promoted** into Phase 13 (no longer deferred here): dashboard + `buildPortfolioSummaryPayload` deduplication; PostHog `/api/me` fan-out reduction; optional Clerk preconnect.*

*Batch 14 (deferred backlog below):* CSP enforcement verification in production still applies; **Phase 10** covers synthesis `csp-report` abuse guard. Complete Batch 14 verification alongside or after Phase 10 as appropriate.

---

### Pre-launch / PM — PostHog production (Batch 8.1)

- [ ] **Vercel production env** — `NEXT_PUBLIC_POSTHOG_KEY` / host set in Vercel; **production** loads the snippet and events appear in PostHog ("Live events"). Full acceptance bullets lived under Batch 8.1 in [`docs/tasks-archived.md`](tasks-archived.md) § Tasks.md archive (2026-03-30).

---

### Deferred backlog (owner decisions; not scheduled)

*Full context and completed synthesis phases are in the 2026-03-30 archive section.*

- [ ] **Batch 9 — Deferred:** Split `add-property-wizard.tsx` into smaller step modules/hooks (until complexity/velocity justify).
- [ ] **Batch 9 — Declined:** Onboarding panel decorative style simplification; optional nav micro-copy / tooltip changes — *no action unless design direction changes.*
- [ ] **Batch 11 — Deferred:** Trust strip / testimonials / logos (out of approved Batch 11 scope).
- [ ] **Batch 12 — Deferred:** Prepare business metrics snapshot for next valuation pass (MRR/subscriber); *owner preference: no in-repo placeholder until live metrics exist.*
- [ ] **Batch 14 — Deferred: CSP** — Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` match [`docs/policies/csp-rollout.md`](policies/csp-rollout.md). *`POST /api/csp-report` abuse/body guard is scheduled in **Phase 10** (synthesis); keep Batch 14 focused on rollout verification.*

---

### Testing hardening (phased — Vitest + optional E2E)

*Source & rationale:* [`docs/qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md) (tiers A–D, gaps, what "high confidence" means). *Process:* PM assigns by phase; **builder** implements per `.cursor/rules/builder-agent.mdc` and existing route-test patterns (`vi.mock` auth/db/rate-limit). *Sequencing:* **Complete Phase 1 before Phase 2** unless PM explicitly parallelizes. **Do not** start Phase 4 (E2E) until Phase 1 billing/webhook tests exist. Update [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §10 change log when a phase completes or CI policy changes.

**Correctness-first (applies to every phase):** Assertions must reflect **intended** behavior from [`docs/policies/ownership-metrics.md`](policies/ownership-metrics.md), [`docs/policies/analytics-math-policy.md`](policies/analytics-math-policy.md), [`docs/internal/api-list-contract.md`](internal/api-list-contract.md), and other agreed specs — not "whatever the route returns right now." If code and policy disagree, **fix the code or update the policy doc**, then write tests that lock the corrected contract. See [`docs/qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md) §1.1.

*Phases 1–3 (complete) are archived in [`docs/tasks-archived.md`](tasks-archived.md) § **Tasks.md archive (2026-03-30 — testing hardening Phases 1–3)**.*

#### Phase 4 — P3: Smoke E2E (optional; non-blocking until stable)

*Goal:* One browser happy path against test-mode Clerk/Stripe or staging. *Prerequisite:* Phase 1 complete.

- [ ] **Playwright (or Cypress) — one smoke file**
  - *Acceptance:*
    - [ ] Single spec: e.g. **guest → sign-in (test user) → dashboard loads** *or* **minimal add-property** flow — **≤ 5 min** local/CI runtime target.
    - [ ] Job runs on **`workflow_dispatch`** or **nightly** initially; document flakiness and promote to PR gate only when green consistently.
    - [ ] Secrets and URLs documented in [`docs/setup/manual-steps.md`](setup/manual-steps.md) (test Clerk keys, staging URL, no production secrets in logs).

#### Phase 5 — Ongoing (process; not a single completion checkbox)

- **Same PR rule:** When changing **metrics, Zod validations, CSV import, or billing**, add or extend tests in the same PR unless PM documents an exception.
- **Manual QA:** Keep [`docs/qa/mobile-shell-verification.md`](qa/mobile-shell-verification.md) and [`docs/qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md) on a quarterly or pre-release cadence.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
