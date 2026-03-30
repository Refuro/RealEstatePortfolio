# AI Agent Governance Audit Process

**Purpose:** Ensure AI-assisted development controls remain safe, current, and aligned with the way the repo is actually run day to day.

**Status:** Active.

---

## 1. Scope

Audit:

- `.cursor/rules/*` coverage and drift
- Hook/risk policy consistency
- Audit command wiring and path validity
- Lane-name / folder / process-doc drift between `docs/audits/README.md` and `.cursor/rules/*-audit-agent.mdc`
- PM/builder workflow integrity
- Documentation consistency for AI operations
- Hook-vs-doc drift and rule-vs-doc drift
- Where guidance should live (hook vs rule vs process doc vs broader setup doc)
- Workflow consistency between documented process and current working files used by the team

Reference docs:

- `docs/cursor-agent-setup.md`
- `docs/policies/shell-risk-policy.md`
- `docs/process/command-integrity-check.md`
- `docs/process/pm-agent-workflow.md`
- `docs/setup/ai-process-workflow-setup.md`
- `docs/audits/README.md`
- `docs/tasks.md`
- `.cursor/rules/`
- `.cursor/hooks.json`

---

## 2. Audit dimensions

- Rule correctness and stale references
- Safety guardrails completeness
- Command ergonomics and trigger clarity
- Process compliance with PM/builder docs
- Missing governance controls for new capabilities
- Guidance placement: what belongs in hooks, rules, process docs, setup docs, or task-specific docs
- Workflow consistency recommendations that reduce drift across hooks, rules, docs, and real usage

---

## 3. Output

Write report to:

- `docs/audits/agent-governance/YYYY-MM-DD-agent-governance-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

---

## 4. Execution

1. Review rule and workflow docs.
2. Validate command wiring and referenced paths.
3. Compare hooks, rules, and docs for drift in shell-risk guidance, audit wiring, and PM/builder workflow expectations.
4. If any audit lane was renamed or moved, verify `docs/audits/README.md` and the matching `.cursor/rules/*-audit-agent.mdc` were updated in the same pass.
5. Identify whether each recurring instruction currently lives in the right place:
   - hooks for command-time enforcement
   - rules for always-on agent behavior
   - process docs for repeatable human/agent workflows
   - setup docs for onboarding/context
6. Review current working files (`docs/tasks.md`, PM/builder docs, audit index, setup docs) for day-to-day consistency.
7. Recommend updates to rules/process/hook docs, including workflow consistency recommendations.
8. Audit only; no code changes.
