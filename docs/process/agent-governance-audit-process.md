# AI Agent Governance Audit Process

**Purpose:** Ensure AI-assisted development controls remain safe, current, and aligned with project workflow.

**Status:** Active.

---

## 1. Scope

Audit:

- `.cursor/rules/*` coverage and drift
- Hook/risk policy consistency
- Audit command wiring and path validity
- PM/builder workflow integrity
- Documentation consistency for AI operations

Reference docs:

- `docs/cursor-agent-setup.md`
- `docs/policies/shell-risk-policy.md`
- `.cursor/rules/`
- `.cursor/hooks.json`

---

## 2. Audit dimensions

- Rule correctness and stale references
- Safety guardrails completeness
- Command ergonomics and trigger clarity
- Process compliance with PM/builder docs
- Missing governance controls for new capabilities

---

## 3. Output

Write report to:

- `docs/audits/agent-governance/YYYY-MM-DD-agent-governance-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

---

## 4. Execution

1. Review rule and workflow docs.
2. Validate command wiring and referenced paths.
3. Identify governance gaps and drift risks.
4. Recommend updates to rules/process/hook docs.
5. Audit only; no code changes.
