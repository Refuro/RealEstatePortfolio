# AI Agent Governance Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** `.cursor/rules/` includes dedicated rules for PM, builder, and multiple audit agents (`*-audit-agent.mdc`). `hooks.json` wires `beforeShellExecution` to a prompt gate aligned with `docs/policies/shell-risk-policy.md` and `subagentStop` hook script.
- **Top risks:** **Rule proliferation** — many audit agent rules exist; ensure `full-audit-agent.mdc` and `docs/audits/README.md` stay synchronized on lane names and paths. **Hooks** depend on local script presence (`.cursor/hooks/on-subagent-stop.sh`).
- **Recommendation:** When process docs move, grep `.cursor/rules` for stale references; keep `docs/process/pm-agent-workflow.md` and tasks flow aligned with README.

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **Documentation drift** — Multiple sources of truth (`docs/audits/README.md`, `docs/process/*-audit*.md`, `.cursor/rules/*`) — risk of agents following outdated lane names or folders if one updates without others.

### Low

- **Hook timeout** — `beforeShellExecution` prompt timeout 20s — acceptable; very slow models could theoretically timeout (operational note only).

## Evidence reviewed

- `.cursor/hooks.json`
- `.cursor/rules/` — file list (pm-agent, builder-agent, full-audit-agent, per-lane audit agents)
- `docs/audits/README.md` — lane table
- `docs/process/full-audit-synthesis.md`
- `docs/process/pm-agent-workflow.md` (referenced in rules)

## Risk & impact assessment

Governance posture is **above average** for a solo/small project: explicit shell policy, PM/builder roles, and audit cadence docs.

## Recommendations (prioritized)

1. After any rename of audit folders, update `docs/audits/README.md` and audit agent rules in the same change.
2. Keep `shell-risk-policy.md` and hook prompt categories in sync (ALLOW/DENY/ASK).
3. Periodically verify `on-subagent-stop.sh` remains executable and useful.

## Task candidates (optional)

- [ ] Add a short “lane folder → process doc” index in `docs/audits/README.md` if duplication bothers maintainers (optional editorial).

## Re-test checklist

- [ ] Run a hook-classified command locally; confirm JSON response behavior (manual).
- [ ] After rule edits: run `npm run check` only when builder tasks change code (not required for audit-only).

## Next trigger and cadence

- Trigger: monthly or changes to `.cursor/rules`, hooks, or PM workflow docs
- Recommended next run: 2026-04-28
