# AI Agent Governance Audit — 2026-03-30

## Executive summary

- **Rules and hooks** — PM/builder rules, `beforeShellExecution`, and `subagentStop` remain the backbone of safe AI usage; `docs/policies/shell-risk-policy.md` should stay in sync with `.cursor/hooks.json`.
- **Audit lanes** — Twelve lanes are documented in `docs/audits/README.md` with matching process docs and rules (including Documentation and Legal/Compliance).
- **Recommendation:** Run `docs/process/command-integrity-check.md` quarterly or when any `*-audit-agent.mdc` file changes.

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **Drift surface** — More lanes and docs increase the chance of stale trigger phrases or paths. The integrity check process and lane structure contract mitigate this.

### Low

- **Full audit agent** — Rule file lists 12 lanes; ensure `full-audit-synthesis.md` and any lane counts in docs stay aligned when lanes change.

## Evidence reviewed

- `.cursor/rules/pm-agent.mdc`, `.cursor/rules/builder-agent.mdc`, `.cursor/rules/full-audit-agent.mdc`
- `.cursor/hooks.json`, `docs/policies/shell-risk-policy.md`
- `docs/process/agent-governance-audit-process.md`, `docs/process/command-integrity-check.md`
- `docs/audits/README.md`

## Risk & impact assessment

Governance risk is **inconsistent instructions** to agents, leading to scope creep or unsafe commands. Written policy + hooks is good; discipline on updates is required.

## Recommendations (prioritized)

1. When editing shell risk, update both `shell-risk-policy.md` and `hooks.json` in one change.
2. After adding a lane, update audits README, command-integrity mapping, and full-audit rule if needed.

## Task candidates (optional)

- [ ] None; governance process is current—verify on next lane rename.

## Re-test checklist

- [ ] Say “run full audit” and confirm all 12 lane reports + synthesis paths are referenced consistently
- [ ] Spot-check one audit rule’s process path and output folder

## Next trigger and cadence

- **Trigger:** `.cursor/rules`, hooks, or workflow doc changes
- **Cadence:** Monthly
