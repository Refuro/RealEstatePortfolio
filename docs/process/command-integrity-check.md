# Command-integrity check

**Purpose:** Verify that audit rules (`.cursor/rules/*-audit-agent.mdc`) reference the correct process docs and output paths. Run periodically (e.g. quarterly or when adding a new audit lane).

**Lane rename rule:** If a lane name, report folder, or process filename changes, update these in the same change:

1. `docs/audits/README.md`
2. The matching `.cursor/rules/*-audit-agent.mdc`
3. This mapping doc
4. Any full-audit docs that enumerate lane names or counts
5. `docs/setup/ai-process-workflow-setup.md` if it lists optional audit lanes

Partial renames create stale command wiring and stale onboarding guidance.

**Status:** Reference — manual process.

---

## How to run

1. Open `docs/audits/README.md` — it lists all lanes with process docs and report folders.
2. For each lane in the table:
   - Confirm the process doc exists at `docs/process/<lane>-*.md` (Mobile experience: `docs/process/mobile-experience-audit-process.md`; criteria also in `docs/qa/mobile-experience-audit.md`).
   - Confirm the rule file exists at `.cursor/rules/<lane>-audit-agent.mdc`.
   - Open the rule file and verify it references the correct process doc path and output path (e.g. `docs/audits/<lane>/YYYY-MM-DD-*-audit.md`).
3. Check any full-audit docs that enumerate lanes (`docs/process/full-audit-synthesis.md`, `.cursor/rules/full-audit-agent.mdc`) and confirm their lane count/names still match.
4. If optional audit lanes are listed in onboarding/setup docs, confirm those lists match the active lane set.
5. If any rule references a wrong path or a process doc that was renamed/moved, update the rule **and** `docs/audits/README.md` together if lane structure changed.
6. If a new lane was added to `docs/audits/README.md`, ensure a matching rule and process doc exist.

---

## Lane → process → rule mapping

| Lane | Process doc | Rule file |
|------|-------------|-----------|
| Code | `docs/process/code-audit-process.md` | `code-audit-agent.mdc` |
| Math & Logic | `docs/process/math-logic-audit.md` | `math-audit-agent.mdc` |
| Feature / UX / IA | `docs/process/feature-ux-audit-process.md` | `feature-audit-agent.mdc` |
| Mobile experience | `docs/process/mobile-experience-audit-process.md` (criteria: `docs/qa/mobile-experience-audit.md`) | `mobile-experience-audit-agent.mdc` — reports: `docs/audits/feature/YYYY-MM-DD-mobile-experience-audit.md` |
| Security & Privacy | `docs/process/security-audit-process.md` | `security-audit-agent.mdc` |
| Performance & Cost | `docs/process/performance-cost-audit-process.md` | `performance-cost-audit-agent.mdc` |
| Reliability & Ops | `docs/process/reliability-ops-audit-process.md` | `reliability-ops-audit-agent.mdc` |
| Data Integrity | `docs/process/data-integrity-audit-process.md` | `data-integrity-audit-agent.mdc` |
| Business & Valuation | `docs/process/business-valuation-audit-process.md` | `business-valuation-audit-agent.mdc` |
| Growth Funnel | `docs/process/growth-funnel-audit-process.md` | `growth-funnel-audit-agent.mdc` |
| SEO | `docs/process/seo-audit-process.md` | `seo-audit-agent.mdc` |
| Documentation | `docs/process/documentation-audit-process.md` | `documentation-audit-agent.mdc` |
| Legal & Compliance | `docs/process/legal-compliance-audit-process.md` | `legal-compliance-audit-agent.mdc` |
| AI Agent Governance | `docs/process/agent-governance-audit-process.md` | `agent-governance-audit-agent.mdc` |

---

## Shell policy ↔ hooks sync

When changing **command risk** rules, update **both** so they stay in lockstep:

1. `docs/policies/shell-risk-policy.md` — source of truth for ALLOW / DENY / ASK.
2. `.cursor/hooks.json` — `beforeShellExecution` prompt must list the same categories (especially ASK: first-time `git push`, deploy-like commands, network-heavy or external API side effects).

If one file changes without the other, the hook gate and written policy will diverge.

---

*Reference: [docs/audits/README.md](../audits/README.md).*
