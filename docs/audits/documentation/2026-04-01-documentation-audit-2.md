# Documentation Audit — 2026-04-01 (pass 2)

## Executive summary

- **Overall health:** The doc hub (`docs/README.md`), audit index (`docs/audits/README.md`), and command-integrity mapping remain aligned with **14** lanes and `.cursor/rules/*-audit-agent.mdc`. The **2026-04-01** proposal link repair (archive paths) is **reflected in the tree** — `docs/reference/roadmap.md`, `docs/tasks-archived.md`, `docs/qa/property-flow-regression-matrix.md`, and `docs/architecture-and-build-practices.md` now point at `docs/archive/proposals/` where needed; `docs/audits/synthesis/README.md` lists **`2026-04-01-audit-synthesis.md`** as latest.
- **Top risk:** **`docs/audits/synthesis/2026-04-01-audit-synthesis.md`** — **PM triage (Ship)** marks the documentation global link sweep **done**, but the **Appendix → Documentation** subsection still includes an **unchecked** “Global link sweep…” row that duplicates the completed work. That **splits source of truth** between triage and appendix.
- **Secondary:** **`docs/audits/documentation/2026-04-01-documentation-audit.md`** (first same-day pass) still describes broken epic links as the **current** top risk; repo state has moved on — readers may mis-prioritize. **`docs/process/documentation-audit-process.md`** §3 names only `YYYY-MM-DD-documentation-audit.md` while **`docs/audits/documentation/README.md`** and **`documentation-audit-agent.mdc`** document same-day **`-2`, `-3`, …** suffixes — minor process drift.
- **Recommendation:** Refresh **synthesis appendix** (or add explicit “superseded by triage” note), then treat **hub expansion** (`docs/README.md` internal/policies/process links per synthesis Schedule), **`test-hardening-phase-1-2-plan.md`** disposition, and **2026-03-30** documentation audit rerun cleanup as **doc-only** follow-ups.

---

## Severity-ranked findings

### Critical

- None.

### High

- **Synthesis appendix vs triage mismatch — `docs/audits/synthesis/2026-04-01-audit-synthesis.md`** — **Ship** lists documentation link sweep **done** (line 44); **“Already done”** notes synthesis README (lines 100–102). The **Appendix → Documentation** block (lines 198–205) still has **`- [ ] Global link sweep: replace stale docs/proposals/…`** and duplicate rows for README expansion / test-hardening / same-day audit cleanup. — **Risk:** Readers using the appendix as a flat backlog re-open finished work or miss that triage is canonical.

### Medium

- **First same-day documentation audit report is stale narrative — `docs/audits/documentation/2026-04-01-documentation-audit.md`** — Executive summary and High findings describe **broken** `docs/proposals/epic-*` links as active; **verified 2026-04-01** workspace paths use **`docs/archive/proposals/`** in roadmap, tasks-archived, property-flow matrix, architecture. — **Risk:** Mis-prioritization if someone opens the `-1` file without the `-2` pass.

- **`docs/README.md` hub still under-lists operational docs** — **Internal (engineering)** lists five files; **`docs/internal/`** has **12** markdown files. Unlinked examples: **`api-list-contract.md`**, **`stripe-webhook-posthog-idempotency.md`**, **`effective-tier-analytics.md`** (see prior documentation audit). **Policies (canonical)** still omits **`policies/calculator-metric-tones.md`** and **`policies/csp-rollout.md`** referenced elsewhere. **Process** omits **`process/mobile-experience-audit-process.md`** (mobile lane is in `docs/audits/README.md` and QA links criteria doc). — **Risk:** Discoverability gap for builders/PMs (synthesis line 74 also tracks “Expand `docs/README.md`”).

- **`docs/proposals/test-hardening-phase-1-2-plan.md` location** — Still under active **`docs/proposals/`** with **`refinance-payoff-proposal.md`** and **`testing-implementation-plan.md`**; Phases 1–3 hardening marked complete in **`docs/tasks.md`**. — **Risk:** “Active proposal” semantics vs historical runbook (PM decision; also **`2026-04-01-audit-synthesis.md`** Optional line 87).

- **`docs/architecture-and-build-practices.md` — `Last reviewed: 2026-03-28`** — Substantial shipping after that date; stack section still matches repo; **date** lags cadence stated in header.

- **Same-day documentation audit reruns — `docs/audits/documentation/2026-03-30-documentation-audit.md` through `-5.md`** — Multiple files for one calendar day; **`docs/tasks.md`** / synthesis Optional still mention cleanup — **Risk:** Unclear canonical narrative for historians (owner decision).

### Low

- **`docs/process/documentation-audit-process.md` §3** — Output path lists only `YYYY-MM-DD-documentation-audit.md`; **`docs/audits/documentation/README.md`** and **`.cursor/rules/documentation-audit-agent.mdc`** specify **`YYYY-MM-DD-documentation-audit-N.md`** for reruns. — Minor inconsistency for agents.

- **`docs/audits/documentation/2026-04-01-documentation-audit.md`** — Retained historical value; consider cross-link from executive summary to **pass 2** when superseding issues are fixed (optional editorial).

---

## Evidence reviewed

- **Process & template:** `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`.
- **Hubs & indices:** `docs/README.md`, `docs/audits/README.md`, `docs/audits/synthesis/README.md`, `docs/audits/documentation/README.md`.
- **Synthesis:** `docs/audits/synthesis/2026-04-01-audit-synthesis.md` (PM triage vs Appendix § Documentation).
- **Verification samples:** `docs/reference/roadmap.md` (§ shipped reference), `docs/tasks-archived.md` (archive proposal links), `docs/qa/property-flow-regression-matrix.md`, `docs/architecture-and-build-practices.md` (links + header), `docs/proposals/` (3 files), `docs/internal/` (file count).
- **Prior report:** `docs/audits/documentation/2026-04-01-documentation-audit.md` (compare to current tree).
- **Governance:** `.cursor/rules/documentation-audit-agent.mdc` (output naming).
- **Assumptions / limits:** Spot-checked paths and grep for `docs/proposals/epic` / `](../proposals/epic`; not an automated link checker across all of `docs/`.

---

## Risk & impact assessment

- **Runtime/product:** None from these documentation findings.
- **Operational:** **High** for **synthesis appendix drift** — wasted PM time or duplicate tickets if appendix is treated as live backlog. **Medium** for hub gaps and stale same-day audit narrative — slower onboarding and wrong prioritization.
- **Likelihood:** **High** that someone uses the synthesis appendix or the first 2026-04-01 documentation audit without the **-2** context during the same release window.
- **Exposure:** Until synthesis and optional README/hub updates land.

---

## Recommendations (prioritized)

1. **Reconcile `docs/audits/synthesis/2026-04-01-audit-synthesis.md`** — Update **Appendix → Documentation** (and any duplicate domain rows already **done** in **Ship**) so unchecked items do not contradict **PM triage**, or add a one-line banner: *“Appendix may lag triage; Ship/Schedule/Optional above are canonical.”*
2. **Expand `docs/README.md`** per open synthesis item — internal links (at least **`api-list-contract.md`**), **Policies** lines for **calculator-metric-tones** and **csp-rollout**, **Process** line for **mobile-experience-audit-process.md**; optional **Launch** link to **`changelog-process.md`** if still desired.
3. **Decide `docs/proposals/test-hardening-phase-1-2-plan.md`** — Archive with README entry, banner (“Phases complete; retained as runbook”), or leave as intentional living doc; align **`docs/archive/README.md`** if moved.
4. **Optional:** Consolidate **`2026-03-30-documentation-audit-*.md`** per owner preference (single canonical + archive, or README in folder).
5. **Patch `docs/process/documentation-audit-process.md` §3** — Add one sentence that same-day reruns use **`YYYY-MM-DD-documentation-audit-2.md`**, etc., matching **`docs/audits/documentation/README.md`**.

---

## Task candidates (optional)

- [ ] Edit **`docs/audits/synthesis/2026-04-01-audit-synthesis.md`** Appendix (Documentation + any other domains) for consistency with completed Ship items.
- [ ] Expand **`docs/README.md`** hub links (internal, policies, mobile process, optional changelog).
- [ ] Relocate or relabel **`docs/proposals/test-hardening-phase-1-2-plan.md`** after PM decision.
- [ ] Align **`docs/process/documentation-audit-process.md`** output naming with same-day suffix convention.
- [ ] Add one-line pointer in **`2026-04-01-documentation-audit.md`** to **`2026-04-01-documentation-audit-2.md`** if PM wants first pass marked superseded for link status.

---

## Re-test checklist

- [ ] After synthesis edit: confirm **Ship** and **Appendix** both reflect link-sweep completion for documentation.
- [ ] Spot-check **`docs/README.md`** new links resolve.
- [ ] `npm run check` — **when code changes are made** (not required for doc-only fixes).

---

## Next trigger and cadence

- **Trigger:** After synthesis appendix edit, large doc reorg, or next monthly documentation lane run.
- **Recommended next run window:** **2026-05-01** (monthly cadence per `docs/audits/README.md` Documentation lane) or after hub/README expansion to verify no new drift.
