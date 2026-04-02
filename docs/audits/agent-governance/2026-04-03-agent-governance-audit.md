# AI Agent Governance Audit — 2026-04-03

## Executive summary

- **Overall health:** Governance artifacts (rules, hooks, audit index, command-integrity mapping, PM/builder docs) are largely aligned: **14 lanes**, **shell policy ↔ hook** categories match, and lane → process → rule mapping in `docs/process/command-integrity-check.md` matches `docs/audits/README.md`.
- **Top risks:** **Workflow inconsistency** between lane rules that mandate a **Task subagent** vs `docs/audits/README.md` and practice where the **main Agent** runs a lane in-thread; and **onboarding drift** in `docs/cursor-agent-setup.md` (clone checklist and summary text omit lanes present elsewhere).
- **Overall recommendation:** Tighten **one pattern** for who runs audits (subagent vs main agent) in rules or README; fix **cursor-agent-setup** lists so a coworker clone matches the full rule set; optionally align **subagentStop** follow-up text with the Phase 4 pause rule.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Audit execution model is split across docs** — `docs/audits/README.md` states audits must run in **Agent** mode with writes and that if a **Task** subagent is used, read-only must be off (so the report can be written). Individual lane rules (e.g. `.cursor/rules/agent-governance-audit-agent.mdc`, `.cursor/rules/code-audit-agent.mdc`) instruct **launch a subagent** as the primary path. The **agent governance process** (`docs/process/agent-governance-audit-process.md`) does **not** require a subagent; it describes review steps only. **Impact:** Teams get conflicting defaults (parent runs the audit vs always spawning a Task), different traceability, and occasional mismatch with the governance rule when the parent executes the audit directly (as in this run). **Evidence:** `docs/audits/README.md` (Running audits / Agent execution); `.cursor/rules/agent-governance-audit-agent.mdc` (§ What to do step 1); `docs/process/agent-governance-audit-process.md` (§ 4 Execution — no subagent step).

- **Coworker setup checklist omits a committed audit rule file** — `docs/cursor-agent-setup.md` “Step 1: Get the Cursor files” lists audit `*.mdc` files but **does not include** `.cursor/rules/seo-audit-agent.mdc`, while the same document’s table at the top **does** document SEO. **Impact:** Someone following only the Step 1 bullet list could omit the SEO lane rule when copying the repo to a new machine or fork. **Evidence:** `docs/cursor-agent-setup.md` lines 21–41 (table includes SEO), lines 91–107 (Step 1 list jumps from `growth-funnel-audit-agent.mdc` to `agent-governance-audit-agent.mdc`).

### Low

- **Summary paragraph under-lists focused audit lanes** — The closing “Other focused audits” sentence in `docs/cursor-agent-setup.md` names a subset of lanes and defers to `docs/audits/README.md`. **Impact:** Minor confusion for readers who do not open the README; SEO, Mobile experience, Documentation, and Legal are not named in that sentence (full audit paragraph does mention Mobile + SEO). **Evidence:** `docs/cursor-agent-setup.md` lines 146–148.

- **Lane rename checklist wording differs between two canonical docs** — `docs/audits/README.md` “Lane structure contract” lists six update targets (including referenced process docs / lane README and `command-integrity-check.md`). `docs/process/command-integrity-check.md` “Lane rename rule” lists five overlapping items and does not explicitly call out “lane README” files. **Impact:** During a rename, a contributor might follow one list and miss an item the other list would have caught. **Evidence:** `docs/audits/README.md` § Lane structure contract; `docs/process/command-integrity-check.md` § Lane rename rule.

- **subagentStop follow-up vs PM Phase 4 gate** — `.cursor/hooks/on-subagent-stop.sh` / `.cursor/hooks/on-subagent-stop.ps1` emit a generic message to approve and **proceed to the next phase**. `pm-agent.mdc` states **Phase 4** must not auto-advance to Phase 5 without user approval. **Impact:** Low; a PM following only the hook nudge might over-advance. The PM rule remains authoritative. **Evidence:** `.cursor/hooks/on-subagent-stop.sh` line 19; `.cursor/rules/pm-agent.mdc` (Phase 4 bullet).

- **Windows default hook command** — `.cursor/hooks.json` points `subagentStop` at `.cursor/hooks/on-subagent-stop.sh`. `docs/setup/ai-process-workflow-setup.md` documents switching to `.ps1` when Git Bash/WSL is unavailable. **Impact:** On some Windows setups the follow-up may not run until the path is changed—already documented, not a doc bug, but an operational consistency note.

## Evidence reviewed

- `docs/process/agent-governance-audit-process.md`, `docs/process/audit-report-template.md`
- `.cursor/rules/*.mdc` (all 17 rule files enumerated; spot-check: `full-audit-agent.mdc`, `agent-governance-audit-agent.mdc`, `pm-agent.mdc`, `builder-agent.mdc`, `code-audit-agent.mdc`)
- `.cursor/hooks.json`, `.cursor/hooks/on-subagent-stop.sh`, `.cursor/hooks/on-subagent-stop.ps1`
- `docs/audits/README.md` (lane table, lane structure contract, running audits)
- `docs/process/command-integrity-check.md` (full lane mapping table, shell policy ↔ hooks)
- `docs/policies/shell-risk-policy.md` (cross-check vs hook prompt)
- `docs/process/pm-agent-workflow.md`, `docs/process/full-audit-synthesis.md` (§3.5 triage, audit list)
- `docs/setup/ai-process-workflow-setup.md`, `docs/cursor-agent-setup.md`, `docs/tasks.md` (header / workflow context)
- `docs/process/` audit process files (glob: all `*audit*` process docs present for 14 lanes + synthesis)

**Assumptions / limits:** Did not execute `command-integrity-check` line-by-line against every rule file body (paths verified via mapping table and spot-checks). Did not validate Cursor runtime behavior of hooks on this machine.

## Risk & impact assessment

Unresolved **Medium** items mainly affect **repeatability** of AI workflows (who runs audits, whether subagents are mandatory) and **onboarding accuracy** (missing file in one clone list). Likelihood of a bad outcome is moderate for team scaling; for a single maintainer following README + PM rule, exposure is lower.

**Low** items affect clarity and edge cases (Phase 4 vs hook nudge, partial lane lists), not core security or data integrity.

Shell **ALLOW/DENY/ASK** alignment between `docs/policies/shell-risk-policy.md` and `.cursor/hooks.json` appears **consistent** on category names and examples.

## Recommendations (prioritized)

1. **Pick and document one default for audit runs:** Either (a) state in `docs/audits/README.md` that the **main Agent** may execute any lane in-thread when appropriate, and change lane `*-audit-agent.mdc` files to say “run the audit (yourself or via one subagent)…” or (b) keep subagent-first but add a single sentence in the README that subagents are **recommended** for isolation. Align `docs/process/agent-governance-audit-process.md` with the same choice so governance audits do not contradict the rule file.

2. **Fix `docs/cursor-agent-setup.md` Step 1** to include `.cursor/rules/seo-audit-agent.mdc` in the clone list (between `growth-funnel-audit-agent.mdc` and `agent-governance-audit-agent.mdc` or in alphabetical order—match repo convention).

3. **Unify lane rename checklists** — Add the missing bullets to `docs/process/command-integrity-check.md` (e.g. referenced `README` under a lane folder, `docs/setup/ai-process-workflow-setup.md` when applicable) so it matches `docs/audits/README.md` § Lane structure contract, or add a single “see README § Lane structure contract” line to avoid duplication drift.

4. **Optional:** Extend the “Other focused audits” sentence in `docs/cursor-agent-setup.md` to name SEO, Mobile experience, Documentation, and Legal, or replace with “all lanes in `docs/audits/README.md`” to avoid partial enumeration.

5. **Optional:** Add one clause to the subagentStop JSON message: e.g. “unless Phase 4 completion—then wait for user approval before Phase 5 per `pm-agent.mdc`.”

## Task candidates (optional)

- [ ] Add `.cursor/rules/seo-audit-agent.mdc` to `docs/cursor-agent-setup.md` Step 1 clone list.
- [ ] Align audit execution wording across `docs/audits/README.md`, `docs/process/agent-governance-audit-process.md`, and `*-audit-agent.mdc` files (subagent vs main agent).
- [ ] Reconcile `command-integrity-check.md` lane rename list with `docs/audits/README.md` § Lane structure contract.

## Re-test checklist

- [ ] After doc updates: re-read `docs/cursor-agent-setup.md` Step 1 against `.cursor/rules/` directory listing (17 files).
- [ ] After execution-model change: run one single-lane audit in main Agent and one via Task subagent; confirm report path matches `docs/audits/README.md`.
- [ ] `npm run check` — only when application or library source changes (not required for doc-only governance fixes).

## Next trigger and cadence

- **Trigger:** Monthly per `docs/audits/README.md`; or after changes to `.cursor/rules`, `.cursor/hooks.json`, or PM/builder process docs.
- **Recommended next run:** 2026-05-03 or the next time audit lane names, report folders, or hook policy categories change (run `docs/process/command-integrity-check.md` in the same change).
