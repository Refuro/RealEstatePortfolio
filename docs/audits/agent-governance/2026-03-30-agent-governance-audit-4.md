# AI Agent Governance Audit — 2026-03-30 (Run 4)

## Executive summary

- **Core wiring remains sound:** `docs/audits/README.md`, `docs/process/command-integrity-check.md`, and `.cursor/rules/full-audit-agent.mdc` consistently describe **12** full-audit lanes with matching process and rule filenames. All **12** `*-audit-agent.mdc` lane rules exist under `.cursor/rules/`.
- **Shell risk stays aligned:** `docs/policies/shell-risk-policy.md` and the `beforeShellExecution` prompt in `.cursor/hooks.json` use the same ALLOW / DENY / ASK structure and examples.
- **Primary gap (unchanged from Run 3):** `docs/cursor-agent-setup.md` still states a **10-lane** full audit and omits **Documentation** and **Legal & Compliance** from its rules table, process/docs table, and Step 1 clone checklist — authoritative sources elsewhere are correct; this file remains the main onboarding drift vector.
- **Overall recommendation:** Apply the Run 3 recommendation to refresh `docs/cursor-agent-setup.md` in one pass; optionally reconcile `full-audit-synthesis.md` §6 with `full-audit-agent.mdc`, and document same-day report suffixes for agent-governance (and other) reruns.

## Severity-ranked findings

### Critical

- None.

### High

- **Stale full-audit lane count and incomplete audit coverage in setup guide (persistent)** — Summary still says **“run all 10 lanes”** while `docs/audits/README.md`, `full-audit-agent.mdc`, and `command-integrity-check.md` specify **12** lanes. The **Files and folders** rules table (lines ~23–40) lists `agent-governance-audit-agent.mdc` but not `documentation-audit-agent.mdc` or `legal-compliance-audit-agent.mdc`. The **Docs the PM rule references** table (lines ~44–69) has no rows for documentation or legal process docs or report folders. Step 1 clone list (lines ~83–95) omits those two rule files — **risk:** contributors who rely only on this guide under-copy audit rules, mis-scope full audits, or miss Documentation/Legal lanes — `docs/cursor-agent-setup.md` (e.g. summary ~line 136; rules table ~lines 23–40; docs table ~44–69; clone list ~83–95); contrast `docs/audits/README.md` and `.cursor/rules/documentation-audit-agent.mdc`, `legal-compliance-audit-agent.mdc`.

### Medium

- **Split “canonical” onboarding between two guides (persistent)** — `docs/setup/ai-process-workflow-setup.md` lists `documentation-audit-agent.mdc` and `legal-compliance-audit-agent.mdc` in optional audit rules; `docs/cursor-agent-setup.md` does not — **risk:** checklist inconsistency depending which doc is used — `docs/cursor-agent-setup.md` vs `docs/setup/ai-process-workflow-setup.md`.

### Low

- **Full-audit synthesis optional wording** — `docs/process/full-audit-synthesis.md` §6 still says run **“all 12 lane processes (or 11 if Code is skipped when unchanged)”** while `full-audit-agent.mdc` instructs **all 12** lanes with no skip — **risk:** minor agent/human ambiguity on whether Code may be omitted — `docs/process/full-audit-synthesis.md` §6; `.cursor/rules/full-audit-agent.mdc`.

- **Same-day report filenames** — `docs/process/agent-governance-audit-process.md` and `docs/audits/agent-governance/README.md` describe `YYYY-MM-DD-agent-governance-audit.md` only; this repo uses suffixed same-day runs (`-2`, `-3`, `-4`) — **risk:** low; naming is clear in practice.

- **Agent governance rule output path** — `.cursor/rules/agent-governance-audit-agent.mdc` requires `docs/audits/agent-governance/YYYY-MM-DD-agent-governance-audit.md` without mentioning suffixes for reruns — consistent with process doc; same low drift as above.

## Evidence reviewed

- `docs/process/agent-governance-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/process/command-integrity-check.md`
- `docs/audits/README.md`
- `docs/cursor-agent-setup.md`
- `docs/setup/ai-process-workflow-setup.md` (audit rules section)
- `docs/policies/shell-risk-policy.md`
- `docs/process/full-audit-synthesis.md` (including §6)
- `docs/process/pm-agent-workflow.md` (partial — shell/hook references)
- `.cursor/hooks.json`
- `.cursor/hooks/on-subagent-stop.sh`
- `.cursor/rules/full-audit-agent.mdc`
- `.cursor/rules/agent-governance-audit-agent.mdc`
- `.cursor/rules/documentation-audit-agent.mdc`
- `.cursor/rules/legal-compliance-audit-agent.mdc`
- Glob: `.cursor/rules/*-audit-agent.mdc` (**13** files: **12** lane rules + `full-audit-agent.mdc`)
- Prior report: `docs/audits/agent-governance/2026-03-30-agent-governance-audit-3.md`
- Grep: `10 lane` / `all 10` across repo (spot-check)

**Assumptions / limits:** Did not re-read every `*-audit-agent.mdc` body in full; mapping validated via `command-integrity-check.md`, index, and spot-check of Documentation/Legal rules. No runtime verification of Cursor hook execution.

## Risk & impact assessment

Unresolved **High** finding continues to affect **discoverability and onboarding accuracy**, not missing safety controls in-repo (rules and audit index are authoritative). Likelihood of confusion remains **medium** for anyone using `docs/cursor-agent-setup.md` as the sole setup reference. Shell policy and hook alignment remain **low** drift risk.

## Recommendations (prioritized)

1. **Refresh `docs/cursor-agent-setup.md`:** Set full audit to **12** lanes; add rows for `documentation-audit-agent.mdc`, `legal-compliance-audit-agent.mdc`, `docs/process/documentation-audit-process.md`, `docs/process/legal-compliance-audit-process.md`, and report folders under `docs/audits/`; add the two rule files to the Step 1 clone checklist — match `docs/audits/README.md` and `docs/setup/ai-process-workflow-setup.md`.
2. **Align synthesis vs full-audit wording:** Either remove the “11 if Code skipped” note from `docs/process/full-audit-synthesis.md` §6 or add the same nuance to `full-audit-agent.mdc` so instructions are single-valued.
3. **Optional:** Add one sentence to `docs/process/agent-governance-audit-process.md` or `docs/audits/agent-governance/README.md` that same-day reruns may use `-2`, `-3`, etc., to avoid overwriting prior reports.

## Task candidates (optional)

- [ ] Update `docs/cursor-agent-setup.md` for 12 lanes and Documentation/Legal audit rules, process docs, folders, and clone checklist (see High finding).
- [ ] Reconcile full-audit lane count / skip wording between `docs/process/full-audit-synthesis.md` §6 and `.cursor/rules/full-audit-agent.mdc`.

## Re-test checklist

- [ ] After doc fix: grep `cursor-agent-setup` for “10 lane” / “all 10” and confirm zero stale hits; confirm Documentation/Legal appear in rules, docs, and clone tables.
- [ ] Spot-check `docs/process/command-integrity-check.md` table against `.cursor/rules/*-audit-agent.mdc` filenames after any lane rename.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Changes to `.cursor/rules`, `.cursor/hooks.json`, audit lane set, or primary AI setup/onboarding docs; monthly governance review.
- **Recommended next run window:** Within one month, or immediately after editing `docs/cursor-agent-setup.md` or adding/removing audit lanes.
