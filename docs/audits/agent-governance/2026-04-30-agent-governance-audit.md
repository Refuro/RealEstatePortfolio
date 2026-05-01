# AI Agent Governance Audit — 2026-04-30

## Executive summary

- Governance wiring is **sound**: 14 audit lanes are enumerated consistently in `docs/audits/README.md`, `.cursor/rules/full-audit-agent.mdc`, and `docs/process/command-integrity-check.md`; each mapped lane has a process doc and matching `*-audit-agent.mdc` rule.
- **`docs/policies/shell-risk-policy.md` and `.cursor/hooks.json`** `beforeShellExecution` prompt are aligned on ALLOW / DENY / ASK and response shape; PM workflow doc matches that story.
- **Onboarding drift:** `docs/cursor-agent-setup.md` “Other focused audits” omits several lanes that `docs/audits/README.md` documents (mobile experience, SEO, documentation, legal/compliance), while the full-audit paragraph correctly mentions Mobile and SEO—new teammates may not discover those triggers from the setup guide alone.
- **Execution guidance drift:** `agent-governance-audit-agent.mdc` requires launching a subagent, while `docs/audits/README.md` allows running single-lane audits directly in Agent mode with writes—these are reconcilable but should be aligned to reduce confused orchestration.

## Severity-ranked findings

### Critical

- (None this pass.)

### High

- (None this pass.)

### Medium

- **Setup summary under-lists focused audit lanes** — New users following `docs/cursor-agent-setup.md` may miss mobile experience, SEO, documentation, and legal/compliance audit entry points even though `docs/audits/README.md` and per-lane rules define them — `docs/cursor-agent-setup.md` (Summary section, “Other focused audits” bullet; contrast with `docs/audits/README.md` table and Single-lane audits list).
- **`agent-governance-audit-agent.mdc` vs audit README on execution pattern** — Governance rule step 1 mandates a `generalPurpose` subagent; README states single-lane audits may run in Agent chat with edits enabled (and only cautions read-only for Task subagents) — `.cursor/rules/agent-governance-audit-agent.mdc`; `docs/audits/README.md` (Agent execution / Single-lane audits).

### Low

- **Lane naming shorthand in `full-audit-agent.mdc`** — Parenthetical list uses compact tokens (e.g. `Performance-Cost`) versus human labels in README (“Performance & Cost”); no functional drift but slightly noisier grep/triage — `.cursor/rules/full-audit-agent.mdc`; `docs/audits/README.md`.
- **`command-integrity-check.md` is manual / easy to skip** — Quarterly reminder exists; no automation or CI hook to detect rule↔process path drift until someone runs the checklist — `docs/process/command-integrity-check.md` §How to run.

## Evidence reviewed

- `docs/process/agent-governance-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/audits/README.md`
- `docs/process/command-integrity-check.md` (lane ↔ process ↔ rule table)
- `docs/policies/shell-risk-policy.md`
- `.cursor/hooks.json` (`beforeShellExecution`, `subagentStop`)
- `.cursor/hooks/on-subagent-stop.sh`, `.cursor/hooks/on-subagent-stop.ps1` (existence)
- `.cursor/rules/agent-governance-audit-agent.mdc`, `.cursor/rules/full-audit-agent.mdc`
- All `docs/process/*` audit process files matching the command-integrity mapping (14 lanes + `full-audit-synthesis.md`)
- `docs/cursor-agent-setup.md`
- `docs/process/pm-agent-workflow.md`
- `docs/setup/ai-process-workflow-setup.md` (partial — audit rules list)
- `docs/process/full-audit-synthesis.md` (lane grouping / triage)
- `docs/tasks.md` (header structure and PM/builder references — not a full task-body review)

**Limits:** Did not re-read every `.cursor/rules/*-audit-agent.mdc` body end-to-end beyond governance and full-audit rules; did not execute shell hooks or Cursor UI flows. No `app/` or application source reviewed (per audit scope).

## Risk & impact assessment

Unaddressed **Medium** items mainly affect **discoverability and consistent agent behavior**, not immediate product security. Worst case: a teammate runs audits from the shorter setup summary and never learns mobile/SEO/doc/legal triggers, or parent agents over-delegate governance audits to subagents when inline execution would suffice. Likelihood is moderate for onboarding; low for the current operator who uses `docs/audits/README.md`.

## Recommendations (prioritized)

1. **Expand or replace** the “Other focused audits” sentence in `docs/cursor-agent-setup.md` so it either names **all** focused lanes (matching `docs/audits/README.md`) or explicitly defers to that file for the complete trigger list—removes the partial list that currently omits Mobile, SEO, Documentation, and Legal/Compliance.
2. **Reconcile execution instructions** in `.cursor/rules/agent-governance-audit-agent.mdc` with `docs/audits/README.md`: allow “Agent mode in this chat with writes” as an equal option to subagent launch, or state when subagent launch is preferred (e.g. large context isolation).
3. **Calendar the manual check** in `docs/process/command-integrity-check.md` (quarterly when changing lanes) and optionally add a one-line pointer from `docs/process/agent-governance-audit-process.md` to that doc under “validate command wiring.”

## Task candidates (optional)

- [ ] Patch `docs/cursor-agent-setup.md` “Other focused audits” to include missing lanes or point only to `docs/audits/README.md` for the canonical trigger list.
- [ ] Edit `.cursor/rules/agent-governance-audit-agent.mdc` step 1 so subagent launch is optional where Agent-mode execution matches `docs/audits/README.md`.
- [ ] Add a brief cross-link from `docs/process/agent-governance-audit-process.md` §4 to `docs/process/command-integrity-check.md` for recurring path validation.

## Re-test checklist

- [ ] After doc/rule edits, grep `docs/cursor-agent-setup.md` for audit lane names vs `docs/audits/README.md` table.
- [ ] After rule edit, run one agent-governance audit from parent Agent chat (no subagent) and confirm report path `docs/audits/agent-governance/YYYY-MM-DD-agent-governance-audit.md` still works.
- [ ] `npm run check` (when code changes are made; not required for doc-only governance fixes)

## Next trigger and cadence

- **Trigger:** Monthly for AI Agent Governance lane; also after material changes to `.cursor/rules`, `.cursor/hooks.json`, or PM/builder/audit process docs (`docs/audits/README.md` cadence table).
- **Recommended next run window:** **2026-05-30** (or next change window that touches hooks, shell policy, or audit lane structure).
