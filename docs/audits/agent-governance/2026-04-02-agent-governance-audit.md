# AI Agent Governance Audit — 2026-04-02

## Executive summary

- **Overall:** `.cursor/rules`, hooks (`beforeShellExecution`), and `docs/process/*` remain the governance spine. **No changes** to hooks or rules required for alternative page marketing work.
- **Design brief:** New docs under `docs/design/` increase surface area for agents—ensure **builder rules** still point to `design-spec.md` for **current** PRs until brief is explicitly activated per `documentation` audit.

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **Rule drift:** If `builder-agent.mdc` references only design-spec, add a one-line exception: “Future visual work: `docs/design/design-brief-2026.md` (PM-gated).”

### Low

- `full-audit-synthesis.md` mobile path exception — prior synthesis note; verify doc consistency.

## Evidence reviewed

- `docs/design/design-brief-2026.md` — new artifact
- `.cursor/rules/` (existence; not exhaustive read)
- `docs/process/pm-agent-workflow.md`, `docs/process/full-audit-synthesis.md`

## Risk & impact assessment

Agents implementing wrong spec wastes time—**Medium** process risk.

## Recommendations (prioritized)

1. PM announces in `tasks.md` or Slack equivalent when **design-brief** supersedes design-spec for a given milestone.
2. Optional: `.cursor/rules/builder-agent.mdc` cross-link to design-brief as **future**.

## Task candidates (optional)

- [ ] (Optional) Add one sentence to `builder-agent.mdc` clarifying design-spec vs design-brief-2026 applicability.

## Re-test checklist

- [ ] New contributor reads rules → knows which design doc to follow.

## Next trigger and cadence

- **Trigger:** Changes to `.cursor/rules`, hooks, or audit lane names.
- **Cadence:** Monthly.
