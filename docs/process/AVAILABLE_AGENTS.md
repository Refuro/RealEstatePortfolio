---
title: Cursor agents — rules map
status: active
updated: 2026-04-30
---

# Available agents (Cursor rules)

Curated map of **portfolio** [`.cursor/rules/`](../../.cursor/rules) entries. Open **`RealEstatePortfolio/`** in Cursor (same level as `app/` and `docs/`) so these project rules load.

Trigger phrases and subagent wiring are summarized in [`docs/audits/README.md`](../audits/README.md) § **Running audits**. Veld product **skills** (UI / mobile / landing CTA) live in the **workspace** tree: `RealEstateProject/.cursor/skills/` — see [`docs/cursor-agent-setup.md`](../cursor-agent-setup.md).

## PM and builder

| Agent (slug) | Rule file | Summary |
|--------------|-----------|---------|
| `pm-agent` | [`pm-agent.mdc`](../../.cursor/rules/pm-agent.mdc) | PM workflow, phase gates, review checklist |
| `builder-agent` | [`builder-agent.mdc`](../../.cursor/rules/builder-agent.mdc) | Builder scope, tasks, no manual steps |

## Audit lanes (single-lane rules)

| Lane | Agent slug (rule stem) | Rule file | Process doc |
|------|-------------------------|-----------|-------------|
| Code | `code-audit-agent` | [`code-audit-agent.mdc`](../../.cursor/rules/code-audit-agent.mdc) | [`code-audit-process.md`](code-audit-process.md) |
| Math & Logic | `math-audit-agent` | [`math-audit-agent.mdc`](../../.cursor/rules/math-audit-agent.mdc) | [`math-logic-audit.md`](math-logic-audit.md) |
| Feature / UX / IA | `feature-audit-agent` | [`feature-audit-agent.mdc`](../../.cursor/rules/feature-audit-agent.mdc) | [`feature-ux-audit-process.md`](feature-ux-audit-process.md) |
| Mobile experience | `mobile-experience-audit-agent` | [`mobile-experience-audit-agent.mdc`](../../.cursor/rules/mobile-experience-audit-agent.mdc) | [`mobile-experience-audit-process.md`](mobile-experience-audit-process.md) |
| Security & Privacy | `security-audit-agent` | [`security-audit-agent.mdc`](../../.cursor/rules/security-audit-agent.mdc) | [`security-audit-process.md`](security-audit-process.md) |
| Performance & Cost | `performance-cost-audit-agent` | [`performance-cost-audit-agent.mdc`](../../.cursor/rules/performance-cost-audit-agent.mdc) | [`performance-cost-audit-process.md`](performance-cost-audit-process.md) |
| Reliability & Ops | `reliability-ops-audit-agent` | [`reliability-ops-audit-agent.mdc`](../../.cursor/rules/reliability-ops-audit-agent.mdc) | [`reliability-ops-audit-process.md`](reliability-ops-audit-process.md) |
| Data integrity | `data-integrity-audit-agent` | [`data-integrity-audit-agent.mdc`](../../.cursor/rules/data-integrity-audit-agent.mdc) | [`data-integrity-audit-process.md`](data-integrity-audit-process.md) |
| Business & valuation | `business-valuation-audit-agent` | [`business-valuation-audit-agent.mdc`](../../.cursor/rules/business-valuation-audit-agent.mdc) | [`business-valuation-audit-process.md`](business-valuation-audit-process.md) |
| Growth funnel | `growth-funnel-audit-agent` | [`growth-funnel-audit-agent.mdc`](../../.cursor/rules/growth-funnel-audit-agent.mdc) | [`growth-funnel-audit-process.md`](growth-funnel-audit-process.md) |
| SEO | `seo-audit-agent` | [`seo-audit-agent.mdc`](../../.cursor/rules/seo-audit-agent.mdc) | [`seo-audit-process.md`](seo-audit-process.md) |
| Documentation | `documentation-audit-agent` | [`documentation-audit-agent.mdc`](../../.cursor/rules/documentation-audit-agent.mdc) | [`documentation-audit-process.md`](documentation-audit-process.md) |
| Legal & compliance | `legal-compliance-audit-agent` | [`legal-compliance-audit-agent.mdc`](../../.cursor/rules/legal-compliance-audit-agent.mdc) | [`legal-compliance-audit-process.md`](legal-compliance-audit-process.md) |
| Agent governance | `agent-governance-audit-agent` | [`agent-governance-audit-agent.mdc`](../../.cursor/rules/agent-governance-audit-agent.mdc) | [`agent-governance-audit-process.md`](agent-governance-audit-process.md) |

## Full audit (orchestrator)

| Agent slug | Rule file | Process |
|------------|-----------|---------|
| `full-audit-agent` | [`full-audit-agent.mdc`](../../.cursor/rules/full-audit-agent.mdc) | Runs all **14** lanes then [`full-audit-synthesis.md`](full-audit-synthesis.md) |

## Model hints (plans with “Composer” / “Sonnet”)

Some staged plans (e.g. [`docs/tasks-tools-expansion.md`](../tasks-tools-expansion.md)) recommend a **model tier** per stage. Map those to whichever Cursor chat model you use for “fast” vs “deeper” work; the portfolio does not ship a separate model registry beyond this file and per-plan notes.
