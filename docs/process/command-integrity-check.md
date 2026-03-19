# Command-integrity check

**Purpose:** Verify that audit rules (`.cursor/rules/*-audit-agent.mdc`) reference the correct process docs and output paths. Run periodically (e.g. quarterly or when adding a new audit lane).

**Status:** Reference — manual process.

---

## How to run

1. Open `docs/audits/README.md` — it lists all lanes with process docs and report folders.
2. For each lane in the table:
   - Confirm the process doc exists at `docs/process/<lane>-*.md`.
   - Confirm the rule file exists at `.cursor/rules/<lane>-audit-agent.mdc`.
   - Open the rule file and verify it references the correct process doc path and output path (e.g. `docs/audits/<lane>/YYYY-MM-DD-*-audit.md`).
3. If any rule references a wrong path or a process doc that was renamed/moved, update the rule.
4. If a new lane was added to `docs/audits/README.md`, ensure a matching rule and process doc exist.

---

## Lane → process → rule mapping

| Lane | Process doc | Rule file |
|------|-------------|-----------|
| Code | `docs/process/code-audit-process.md` | `code-audit-agent.mdc` |
| Math & Logic | `docs/process/math-logic-audit.md` | `math-audit-agent.mdc` |
| Feature / UX / IA | `docs/process/feature-ux-audit-process.md` | `feature-audit-agent.mdc` |
| Security & Privacy | `docs/process/security-audit-process.md` | `security-audit-agent.mdc` |
| Performance & Cost | `docs/process/performance-cost-audit-process.md` | `performance-cost-audit-agent.mdc` |
| Reliability & Ops | `docs/process/reliability-ops-audit-process.md` | `reliability-ops-audit-agent.mdc` |
| Data Integrity | `docs/process/data-integrity-audit-process.md` | `data-integrity-audit-agent.mdc` |
| Business & Valuation | `docs/process/business-valuation-audit-process.md` | `business-valuation-audit-agent.mdc` |
| Growth Funnel | `docs/process/growth-funnel-audit-process.md` | `growth-funnel-audit-agent.mdc` |
| AI Agent Governance | `docs/process/agent-governance-audit-process.md` | `agent-governance-audit-agent.mdc` |

---

*Reference: [docs/audits/README.md](../audits/README.md).*
