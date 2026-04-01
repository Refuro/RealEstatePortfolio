# Documentation Audit — 2026-04-01

## Executive summary

- **Overall health:** Governance structure (`docs/README.md`, `docs/audits/README.md`, `docs/process/command-integrity-check.md`, 14 audit lanes + rules) remains coherent and aligned with shipped tooling. Setup docs (`docs/setup/run-and-smoke-test.md`, `manual-steps.md`) accurately describe repo layout (`app/` root, Husky at repo root) and env expectations.
- **Top risk:** The **2026-04-01 proposal archive pass** moved implemented epic/QA docs to `docs/archive/proposals/`, but **several high-traffic docs still link to old `docs/proposals/` paths** that no longer exist. That produces **broken markdown links** in the roadmap, historical tasks archive, and property-flow regression matrix—worse than pre-archive drift because navigation now fails.
- **Secondary risk:** **`docs/audits/synthesis/README.md`** still advertises **2026-03-31** as the latest synthesis while **`docs/README.md`** points to **`2026-04-01-audit-synthesis.md`**, so the synthesis sub-index is stale relative to the main doc hub.
- **Recommendation:** Treat **link repair** (and one roadmap path string) as the first doc-only follow-up; then refresh synthesis README and optional README indexes. No product code changes required for documentation recovery.

---

## Severity-ranked findings

### Critical

- None. (No missing process files for active audit lanes; `.cursor/rules/documentation-audit-agent.mdc` references `docs/process/documentation-audit-process.md` and `docs/audits/documentation/` correctly.)

### High

- **Broken links after proposal archive — `docs/proposals/` paths for moved files** — Epic and add-property QA docs now live under `docs/archive/proposals/` (see `docs/archive/README.md`), but multiple docs still reference **`docs/proposals/...`** or **`../proposals/epic-*.md`** for those filenames. **Confirmed missing** from `docs/proposals/`: any `epic-*.md`. **Examples:**
  - `docs/reference/roadmap.md` — §6 “Shipped (reference)” still says design/history live in `` `docs/proposals/add-property-experience-overhaul.md` ``; file is **`docs/archive/proposals/add-property-experience-overhaul.md`**.
  - `docs/tasks-archived.md` — Multiple links such as `` [`docs/proposals/epic-a-discovery.md`](proposals/epic-a-discovery.md) `` and plain-text `` `docs/proposals/add-property-experience-overhaul.md` `` resolve to **non-existent** paths under `docs/proposals/`.
  - `docs/qa/property-flow-regression-matrix.md` — “Related entry QA docs” points to `` [`epic-c-entry-qa.md`](../proposals/epic-c-entry-qa.md) `` (and D/E/F epic QA files); those files are **not** in `docs/proposals/`.
  - **Risk:** Anyone following links from roadmap, QA matrix, or archived task log hits 404 in the repo file tree; undermines trust in docs as source of truth.

- **Synthesis index out of sync with main doc hub** — `docs/README.md` Quick links list **[Latest audit synthesis](audits/synthesis/2026-04-01-audit-synthesis.md)** (14 lanes). **`docs/audits/synthesis/README.md`** still states **Latest full run:** `2026-03-31-audit-synthesis.md` with prior `2026-03-30-audit-synthesis-5.md`. **`2026-04-01-audit-synthesis.md` exists** in the same folder. — **Risk:** PMs and agents open the wrong synthesis file when starting from the sub-index.

### Medium

- **`docs/internal/` partial indexing** — `docs/README.md` §Internal (engineering) lists five operational docs (billing matrix, past_due path, Stripe verification, subscription switch, billing portal plan). **`docs/internal/`** contains **12** files; not linked from the main README include **`api-list-contract.md`**, **`stripe-webhook-posthog-idempotency.md`**, **`effective-tier-analytics.md`**, **`differentiator-value-add-analysis.md`**, **`ai-operations-efficiency-analysis.md`**. Those are referenced from `docs/tasks.md` and synthesis work but are harder to discover from the hub. — `docs/README.md`, `docs/internal/*`.

- **`test-hardening-phase-1-2-plan.md` still under active proposals** — `docs/proposals/` retains **`test-hardening-phase-1-2-plan.md`** alongside `refinance-payoff-proposal.md` and `testing-implementation-plan.md`. `docs/tasks.md` marks **Testing hardening Phases 1–3** complete and Phase 18 archive work noted completed proposals moved. **Phase 1–2 plan** reads as **implemented process**; keeping it in `docs/proposals/` may still imply “active proposal” unless the team intentionally treats it as a living runbook. — `docs/proposals/test-hardening-phase-1-2-plan.md`, `docs/tasks.md` §Testing hardening.

- **Same-day documentation audit reruns (2026-03-30)** — `docs/audits/documentation/` still contains **`2026-03-30-documentation-audit.md`** through **`-5.md`** in addition to **2026-03-31** and **2026-04-01** reports. `docs/tasks.md` Phase 18 left “clean up superseded same-day documentation audit reruns” **open** (owner discretion). — Noise and duplicate narrative for readers choosing “which 2026-03-30 file is canonical.”

### Low

- **`docs/README.md` Process section** — Lists many `docs/process/*-audit-process.md` files but **does not list** `docs/process/mobile-experience-audit-process.md` (mobile lane is indexed in `docs/audits/README.md` and linked via QA → `mobile-experience-audit.md`). Minor discoverability gap.

- **`docs/README.md` Policies (canonical) section** — Still lists three pillars (`ownership-metrics`, `analytics-math-policy`, `shell-risk-policy`). **`docs/policies/calculator-metric-tones.md`** and **`docs/policies/csp-rollout.md`** are active references from tasks and `manual-steps.md` but are not in that short list.

- **`docs/launch/changelog-process.md`** — Not linked from `docs/README.md` §Launch & growth; changelog convention is referenced from code comments (`app/lib/changelog-data.ts`). Discoverability only.

- **`docs/architecture-and-build-practices.md`** — Header **Last reviewed: 2026-03-28** lags substantial 2026-03-30+ shipping (calculators, billing hardening, CSV, synthesis phases). Content sampled still matches stack (Next.js 16, React 19); date is stale.

- **`docs/process/documentation-audit-process.md`** — References `.cursor/rules/*-audit-agent.mdc` for discoverability; **command-integrity-check** is the detailed mapping. No issue; optional note: **documentation-audit-agent.mdc** instructs launching a subagent—actual runs may inline (acceptable).

---

## Evidence reviewed

- **Process:** `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/full-audit-synthesis.md` (partial).
- **Indices & hubs:** `docs/README.md`, `docs/audits/README.md`, `docs/audits/synthesis/README.md`, `docs/audits/documentation/README.md`, `docs/archive/README.md`.
- **Workflow:** `docs/tasks.md` (sampled Phase 18, synthesis references), `docs/reference/roadmap.md` (§6 shipped reference string), `docs/tasks-archived.md` (link targets).
- **QA & setup:** `docs/qa/property-flow-regression-matrix.md`, `docs/setup/run-and-smoke-test.md`, `docs/setup/manual-steps.md`, `docs/setup/ai-process-workflow-setup.md` (optional audit rules list).
- **Cross-check:** `docs/proposals/` directory listing (3 files), `docs/archive/proposals/` (archived epics), `.cursor/rules/documentation-audit-agent.mdc`, `.cursor/rules/full-audit-agent.mdc` (14 lanes).
- **Synthesis:** Confirmed `docs/audits/synthesis/2026-04-01-audit-synthesis.md` exists vs synthesis README “latest” pointer.
- **Assumptions / limits:** Link checks were **path existence** verification against the workspace tree, not automated markdown link checking of every file in `docs/`. Other directories may contain additional stale `docs/proposals/epic-*` references not grep-sampled.

---

## Risk & impact assessment

- **User/product runtime:** None from these findings.
- **Operational impact:** **High** for onboarding, PM review, and audit follow-up: broken links waste time and erode confidence; wrong synthesis pointer can mis-route full-audit remediation.
- **Likelihood:** **High** that readers hit broken epic links soon—roadmap §6 and property-flow matrix are common entry points.
- **Exposure:** Ongoing until links and synthesis index are updated.

---

## Recommendations (prioritized)

1. **Fix broken proposal paths globally** — Update references to archived epics/add-property docs to **`docs/archive/proposals/<file>.md`** (or correct relative links from each file). Priority files: **`docs/reference/roadmap.md`**, **`docs/tasks-archived.md`**, **`docs/qa/property-flow-regression-matrix.md`**. Grep for `` `docs/proposals/epic` ``, `` `docs/proposals/add-property` ``, and `` `](proposals/epic` `` to catch stragglers.
2. **Refresh `docs/audits/synthesis/README.md`** — Set **Latest full run** to **`2026-04-01-audit-synthesis.md`** (and adjust “prior” pointer to **`2026-03-31-audit-synthesis.md`** or as PM prefers).
3. **Decide on `test-hardening-phase-1-2-plan.md` location** — Either move to **`docs/archive/proposals/`** with README entry or add a one-line banner at top: “Phases 1–2 complete; retained as historical runbook.”
4. **Extend `docs/README.md`** — Add missing **internal** docs (at least **`api-list-contract.md`**); add **Policies** lines for **calculator-metric-tones** and **csp-rollout**; add **Process** line for **mobile-experience-audit-process.md**; optional **Launch** link to **changelog-process.md**.
5. **Optional:** Consolidate **2026-03-30** documentation audit reruns per Phase 18 note (archive or single canonical file + pointer).

---

## Task candidates (optional)

- [ ] Global link sweep: replace stale `docs/proposals/` → `docs/archive/proposals/` for archived epic/add-property QA files; verify `docs/architecture-and-build-practices.md` §IA reference to `epic-a-discovery.md` (add path to archive or remove ambiguity).
- [ ] Update `docs/audits/synthesis/README.md` latest synthesis to `2026-04-01-audit-synthesis.md`.
- [ ] Expand `docs/README.md` internal/policies/process links per recommendations above.
- [ ] Relocate or relabel `docs/proposals/test-hardening-phase-1-2-plan.md` after PM decision.

---

## Re-test checklist

- [ ] After link fixes: open `docs/reference/roadmap.md`, `docs/tasks-archived.md`, and `docs/qa/property-flow-regression-matrix.md` links in editor and confirm targets exist.
- [ ] Confirm `docs/audits/synthesis/README.md` and `docs/README.md` agree on latest synthesis filename.
- [ ] `npm run check` — **when code changes are made** (not required for doc-only fixes).

---

## Next trigger and cadence

- **Trigger:** After large doc moves (archive/reorg), new audit lane, or repeated “link 404” reports from PM/builders.
- **Recommended next run window:** **2026-05-01** (monthly cadence per `docs/audits/README.md` Documentation lane) or immediately after the link-repair pass to confirm no regressions.
