# AI Agent Governance Audit — 2026-04-01

## Executive summary

- **Overall health is strong.** All 17 `.cursor/rules/*.mdc` files are present; the 14-lane full audit is consistently described in `docs/audits/README.md`, `.cursor/rules/full-audit-agent.mdc`, `docs/process/full-audit-synthesis.md` §6, `docs/process/command-integrity-check.md` (14-row mapping), `docs/setup/ai-process-workflow-setup.md`, `docs/process/agent-governance-audit-process.md` §1, and `docs/cursor-agent-setup.md` (Full audit bullet correctly states **14** lanes). Prior reports that flagged a **12** lane error in `docs/cursor-agent-setup.md` are **obsolete** for the current file (line 148).
- **Top gaps:** (1) `docs/process/agent-governance-audit-process.md` §1 oversimplifies report folder paths (Mobile experience uses `docs/audits/feature/`, not a `mobile-experience/` folder). (2) `docs/cursor-agent-setup.md` “Other focused audits” line lists only a subset of lanes—mitigated because it points readers to `docs/audits/README.md`. (3) `docs/tasks.md` still contains large, fully completed task blocks that could be archived for clarity.
- **Recommendation:** Tighten the governance process doc path sentence; optionally broaden or qualify the setup-guide “Other focused audits” sentence; continue periodic `command-integrity-check` when lanes change; archive completed `tasks.md` sections when the PM agrees.

---

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none)*

### Medium

- **`docs/process/agent-governance-audit-process.md` §1 implies a uniform `docs/audits/<lane>/` layout** — The sentence “Lane outputs live under `docs/audits/<lane>/`” does not mention the **Mobile experience** exception: reports are written to `docs/audits/feature/YYYY-MM-DD-mobile-experience-audit.md` per `docs/process/mobile-experience-audit-process.md`, `docs/audits/README.md`, and `.cursor/rules/mobile-experience-audit-agent.mdc`. **Risk:** Someone following only the governance process doc could look in the wrong folder or add a misaligned lane rename. **Evidence:** `docs/process/agent-governance-audit-process.md` §1 (line 11); `docs/process/command-integrity-check.md` (Mobile experience row); `docs/audits/README.md` (Mobile experience row).

### Low

- **`docs/cursor-agent-setup.md` “Other focused audits” is illustrative, not exhaustive** — The Summary lists feature/UX, security, performance-cost, reliability-ops, data-integrity, business-valuation, growth-funnel, and agent-governance, but not **SEO**, **Legal & Compliance**, **Documentation**, or **Mobile experience**. The same paragraph defers to `docs/audits/README.md` for exact phrases, which limits impact. **Risk:** Skimmers might miss optional single-lane triggers until they open the README. **Evidence:** `docs/cursor-agent-setup.md` (lines 146–147); `docs/audits/README.md` §Single-lane audits.

- **`docs/policies/shell-risk-policy.md` vs `.cursor/hooks.json` — minor command wording drift** — Policy ALLOW lists `npm test`; the hook prompt bundles `npm run build/dev/lint/check/test`. Behavior is equivalent when a `test` script exists; wording differs slightly for manual parity checks. **Evidence:** `docs/policies/shell-risk-policy.md` §ALLOW; `.cursor/hooks.json` `beforeShellExecution` prompt.

- **PM workflow still centers Phase 0–5 from `docs/reference/engineering-spec.md` §8** — `pm-agent.mdc` and `docs/process/pm-agent-workflow.md` describe the original phased build; day-to-day work is largely **`docs/tasks.md`–driven** (roadmap, calculators, mobile shell, synthesis remediation). **Risk:** Low—both docs already use `tasks.md` as the operational queue. **Evidence:** `.cursor/rules/pm-agent.mdc`; `docs/process/pm-agent-workflow.md` §Phases; `docs/tasks.md` §Active tasks.

- **`subagentStop` defaults to `.cursor/hooks/on-subagent-stop.sh`** — On Windows without Git Bash/WSL, the hook may not run; `docs/cursor-agent-setup.md` and `docs/setup/ai-process-workflow-setup.md` document switching to `on-subagent-stop.ps1`. **Risk:** PM may not get automatic “review builder” follow-up until configured. **Evidence:** `.cursor/hooks.json`; `docs/cursor-agent-setup.md` §Step 2 / Windows.

- **`beforeShellExecution` is prompt-based** — Classification is model-dependent; written policy and hook text are aligned, but misclassification is a residual risk. **Evidence:** `.cursor/hooks.json` (`"type": "prompt"`); `docs/policies/shell-risk-policy.md`.

- **Historical audit/synthesis files may still mention older lane counts (e.g. 12 or 13)** — Older `docs/audits/synthesis/2026-03-30-*.md` files are snapshots; they can confuse if mistaken for current policy. Current canonical sources are README + `full-audit-agent.mdc`. **Evidence:** grep hits under `docs/audits/synthesis/`; `docs/audits/README.md` §Full audit.

- **`docs/tasks.md` hygiene — completed work remains in the active file** — Sections such as “Calculator & tools — metric color / semantic treatment” and “New calculators — STR vs LTR and Fix-and-flip” are fully checked off but not yet moved to `docs/tasks-archived.md`, increasing noise for builders scanning for open checkboxes. **Evidence:** `docs/tasks.md` (e.g. metric color block ~lines 61–98; calculators ~lines 100–241).

- **`builder-agent.mdc` references omit `docs/policies/calculator-metric-tones.md`** — The policy exists and is used in tasks; the builder rule’s References list does not cite it (discoverable via tasks and `calculator-metric-tones` in architecture copy). **Evidence:** `.cursor/rules/builder-agent.mdc` §References; `docs/policies/calculator-metric-tones.md`.

---

## Evidence reviewed

- **Rules:** All 17 files under `.cursor/rules/` (`pm-agent`, `builder-agent`, `full-audit-agent`, 14 `*-audit-agent.mdc` lane rules)—spot-checked `full-audit-agent.mdc`, `agent-governance-audit-agent.mdc`, `code-audit-agent.mdc`, `mobile-experience-audit-agent.mdc` for process paths and output locations.
- **Hooks:** `.cursor/hooks.json` (`subagentStop`, `beforeShellExecution`); `.cursor/hooks/on-subagent-stop.sh` (follow-up JSON for completed subagents).
- **Policies & process:** `docs/policies/shell-risk-policy.md`; `docs/process/command-integrity-check.md`; `docs/process/agent-governance-audit-process.md`; `docs/process/full-audit-synthesis.md`; `docs/process/audit-report-template.md`; `docs/process/pm-agent-workflow.md`.
- **Setup & onboarding:** `docs/cursor-agent-setup.md`; `docs/setup/ai-process-workflow-setup.md`; `docs/audits/README.md`; `docs/audits/agent-governance/README.md`.
- **Working files:** `docs/tasks.md` (structure, active vs completed blocks); no application source under `app/` modified for this audit.

**Assumptions / limits:** Review did not re-execute `npm` or Cursor hooks; assessment is static consistency and path validation. Historical markdown under `docs/audits/synthesis/` was sampled via search, not fully re-read.

---

## Risk & impact assessment

- **Medium finding (folder path):** Mis-stating where Mobile experience reports live could cause missed files during lane renames or automation; fixing one sentence in the governance process doc is low cost.
- **Low findings:** Mostly ergonomics, archival hygiene, and known limitations of prompt-based hooks. No evidence of missing audit rules or broken process-doc links for the current 14-lane set.

---

## Recommendations (prioritized)

1. **Amend `docs/process/agent-governance-audit-process.md` §1** — After the lane list or path sentence, add an explicit exception: Mobile experience reports go to `docs/audits/feature/` (see `mobile-experience-audit-process.md`). Optionally mirror the footnote style used in `docs/audits/README.md`.
2. **Tighten `docs/cursor-agent-setup.md` “Other focused audits”** — Either add “(not exhaustive—see `docs/audits/README.md` for SEO, Legal, Documentation, Mobile experience, …)” or replace the list with a single pointer to the README single-lane table.
3. **Archive completed `docs/tasks.md` sections** when the PM confirms—e.g. fully checked calculator/metric and new-calculator blocks—into `docs/tasks-archived.md` with a dated section header, per existing archive practice.
4. **Optional:** Add `docs/policies/calculator-metric-tones.md` to `builder-agent.mdc` References when calculator UI work is ongoing.

---

## Task candidates

- [ ] Add Mobile experience report path exception to `docs/process/agent-governance-audit-process.md` §1.
- [ ] Qualify or expand “Other focused audits” in `docs/cursor-agent-setup.md` so SEO, Legal, Documentation, and Mobile experience are not implied out of scope.
- [ ] Archive fully completed sections from `docs/tasks.md` to `docs/tasks-archived.md` (PM-approved scope).

---

## Re-test checklist

- [ ] Confirm `docs/process/agent-governance-audit-process.md` names `docs/audits/feature/` for Mobile experience reports.
- [ ] Confirm setup guide onboarding text matches `docs/audits/README.md` intent for single-lane audits.
- [ ] After any rule or hook edit, spot-check `docs/process/command-integrity-check.md` mapping and `npm run check` if `app/` changes accompany doc work.

---

## Next trigger and cadence

- **Trigger:** Changes to `.cursor/rules/`, `.cursor/hooks.json`, audit lane names or folders, or PM/builder workflow docs; otherwise monthly per `docs/audits/README.md`.
- **Recommended next run:** 2026-05-01 or the next governance-affecting change, whichever is sooner.
