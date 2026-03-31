# AI Agent Governance Audit — 2026-03-30 (Run 3)

## Executive summary

- **Core wiring is sound:** `.cursor/rules/full-audit-agent.mdc`, `docs/audits/README.md`, and `docs/process/command-integrity-check.md` agree on **12** audit lanes and consistent process/rule paths.
- **Shell risk is aligned:** `docs/policies/shell-risk-policy.md` and the `beforeShellExecution` prompt in `.cursor/hooks.json` describe the same ALLOW / DENY / ASK categories.
- **Primary gap:** `docs/cursor-agent-setup.md` is materially out of date (states **10** full-audit lanes and omits Documentation and Legal audit rules and process docs), which creates onboarding and command-expectation drift relative to authoritative sources.
- **Overall recommendation:** Update `docs/cursor-agent-setup.md` in one pass to match `docs/audits/README.md` and the full-audit rule; optionally document same-day report suffixes (`-2`, `-3`) in the agent-governance process or folder README.

## Severity-ranked findings

### Critical

- None.

### High

- **Stale full-audit lane count and incomplete audit coverage in setup guide** — Misstates how many lanes a full audit runs (**“all 10 lanes”** vs **12** everywhere else) and omits Documentation and Legal lanes entirely from the `.cursor/rules` and process-doc tables — **risk:** new contributors misconfigure expectations, skip lanes, or under-copy files when cloning the workflow — `docs/cursor-agent-setup.md` (summary section ~line 136; rules table ~lines 23–37; docs table ~lines 44–69; grep shows no `documentation` or `legal-compliance`).

### Medium

- **Single “canonical” onboarding doc split across two guides** — `docs/setup/ai-process-workflow-setup.md` lists `documentation-audit-agent.mdc` and `legal-compliance-audit-agent.mdc`, while `docs/cursor-agent-setup.md` does not — **risk:** inconsistent copy/paste checklists depending which doc people read — `docs/cursor-agent-setup.md` vs `docs/setup/ai-process-workflow-setup.md`.

### Low

- **Full-audit synthesis optional wording** — `docs/process/full-audit-synthesis.md` mentions running **“12 lane processes (or 11 if Code is skipped when unchanged)”** while `full-audit-agent.mdc` instructs **all 12** lanes without that exception — **risk:** minor agent/human confusion on whether Code may be skipped — `docs/process/full-audit-synthesis.md` §6.

- **Same-day report filenames** — Process and folder README still describe `YYYY-MM-DD-agent-governance-audit.md` only; this repo uses suffixed runs (`-2`, `-3`) for the same calendar day — **risk:** low; naming is clear in practice — `docs/process/agent-governance-audit-process.md`, `docs/audits/agent-governance/README.md`.

## Evidence reviewed

- `docs/process/agent-governance-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/process/command-integrity-check.md`
- `docs/audits/README.md`
- `docs/cursor-agent-setup.md`
- `docs/setup/ai-process-workflow-setup.md` (partial)
- `docs/policies/shell-risk-policy.md`
- `.cursor/hooks.json`
- `.cursor/hooks/on-subagent-stop.sh`
- `.cursor/rules/full-audit-agent.mdc`
- `.cursor/rules/agent-governance-audit-agent.mdc`
- `.cursor/rules/pm-agent.mdc` (partial)
- `docs/process/full-audit-synthesis.md`
- `docs/process/pm-agent-workflow.md` (partial)
- Glob of `.cursor/rules/*-audit-agent.mdc` (12 lane rules present)

**Assumptions / limits:** Did not re-verify every individual `*-audit-agent.mdc` body line-by-line against its process doc (mapping table and spot checks used). No runtime verification of Cursor hook execution on this machine.

## Risk & impact assessment

Unresolved **High** finding mainly hurts **discoverability and onboarding accuracy**, not a missing safety control in-repo (rules and `docs/audits/README.md` are correct). Likelihood of confusion is **medium** for anyone relying on `docs/cursor-agent-setup.md` as the sole setup reference. Shell policy drift risk is **low** given current lockstep between policy doc and hook prompt.

## Recommendations (prioritized)

1. **Refresh `docs/cursor-agent-setup.md`:** Set full audit to **12** lanes; add rows for `documentation-audit-agent.mdc`, `legal-compliance-audit-agent.mdc`, `docs/process/documentation-audit-process.md`, and `docs/process/legal-compliance-audit-process.md` (and report folders under `docs/audits/`) so it matches `docs/audits/README.md` and `docs/setup/ai-process-workflow-setup.md`.
2. **Align synthesis vs full-audit wording:** Either remove the “11 if Code skipped” note from `full-audit-synthesis.md` or add the same nuance to `full-audit-agent.mdc` so agents do not get conflicting instructions.
3. **Optional:** Add one sentence to `docs/process/agent-governance-audit-process.md` or `docs/audits/agent-governance/README.md` that same-day reruns may use `-2`, `-3` suffixes to avoid overwrites.

## Task candidates (optional)

- [ ] Update `docs/cursor-agent-setup.md` for 12 lanes and Documentation/Legal audit rules and process docs (see High finding).
- [ ] Reconcile full-audit lane count wording between `docs/process/full-audit-synthesis.md` §6 and `.cursor/rules/full-audit-agent.mdc`.

## Re-test checklist

- [ ] After doc fix: grep `cursor-agent-setup` for “10 lane” and confirm zero stale hits; confirm Documentation/Legal appear in rules and process tables.
- [ ] Spot-check `docs/process/command-integrity-check.md` table against `.cursor/rules/*-audit-agent.mdc` filenames after any lane rename.
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- **Trigger:** Changes to `.cursor/rules`, `.cursor/hooks.json`, audit lane set, or primary AI setup/onboarding docs; monthly governance review.
- **Recommended next run window:** Within one month, or immediately after editing `docs/cursor-agent-setup.md` or adding/removing audit lanes.
