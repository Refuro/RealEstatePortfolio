# Audits

Periodic AI-run audits of the product and codebase. Each lane has a process doc and a report folder.

| Type | Process | Reports |
|------|---------|---------|
| **Code** | [code-audit-process.md](../process/code-audit-process.md) | [code/](code/) |
| **Math & Logic** | [math-logic-audit.md](../process/math-logic-audit.md) | [math/](math/) |
| **Feature / UX / IA** | [feature-ux-audit-process.md](../process/feature-ux-audit-process.md) | [feature/](feature/) |
| **Security & Privacy** | [security-audit-process.md](../process/security-audit-process.md) | [security/](security/) |
| **Performance & Cost** | [performance-cost-audit-process.md](../process/performance-cost-audit-process.md) | [performance-cost/](performance-cost/) |
| **Reliability & Operations** | [reliability-ops-audit-process.md](../process/reliability-ops-audit-process.md) | [reliability-ops/](reliability-ops/) |
| **Data Integrity & Reconciliation** | [data-integrity-audit-process.md](../process/data-integrity-audit-process.md) | [data-integrity/](data-integrity/) |
| **Business & Valuation** | [business-valuation-audit-process.md](../process/business-valuation-audit-process.md) | [business/](business/) |
| **Growth Funnel & Activation** | [growth-funnel-audit-process.md](../process/growth-funnel-audit-process.md) | [growth-funnel/](growth-funnel/) |
| **AI Agent Governance** | [agent-governance-audit-process.md](../process/agent-governance-audit-process.md) | [agent-governance/](agent-governance/) |
| **Synthesis** (full audit) | [full-audit-synthesis.md](../process/full-audit-synthesis.md) | [synthesis/](synthesis/) |

## Running audits

### Full audit (all lanes)

- **Trigger:** Say "run full audit" or "run all audits".
- **Flow:**
  1. Run all 10 audit lanes.
  2. After all reports are written, run the **synthesis pass** per [full-audit-synthesis.md](../process/full-audit-synthesis.md).
  3. Output: `docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md`.
  4. PM reviews synthesis and promotes approved items to [docs/tasks.md](../tasks.md).

### Single-lane audits

- **Code audit:** Say "run code audit" or "code audit" in chat. Agent follows the process and writes to `audits/code/`.
- **Math audit:** Say "run math audit" or "math audit" in chat. Agent follows the process and writes to `audits/math/`.
- **Feature/UX audit:** Say "run feature audit" or "run ux audit".
- **Security audit:** Say "run security audit".
- **Performance & cost audit:** Say "run performance audit".
- **Reliability audit:** Say "run reliability audit".
- **Data integrity audit:** Say "run data integrity audit".
- **Business valuation audit:** Say "run business audit" or "run valuation audit".
- **Growth funnel audit:** Say "run growth audit".
- **Agent governance audit:** Say "run agent governance audit".

### Report naming convention

Use daily ISO naming for all report files:

- `YYYY-MM-DD-<lane>-audit.md`

Examples:

- `2026-03-19-code-audit.md`
- `2026-03-19-math-logic-audit.md`
- `2026-03-19-security-audit.md`
- `2026-03-19-business-valuation-audit.md`

## Cadence and triggers

| Lane | Default cadence | Required trigger |
|------|-----------------|------------------|
| Code | Monthly | Major refactor or architecture shift |
| Math & Logic | Monthly | Any analytics/metrics contract change |
| Feature / UX / IA | Monthly | Navigation, IA, onboarding, or major page redesign |
| Security & Privacy | Monthly | Auth, billing, account, or integration security changes |
| Performance & Cost | Monthly | New heavy UI/dependency or external API changes |
| Reliability & Operations | Monthly | Release hardening and operational change windows |
| Data Integrity & Reconciliation | Monthly | Schema/import-export/API contract changes |
| Business & Valuation | Quarterly | Pricing/packaging/strategic readiness updates |
| Growth Funnel & Activation | Monthly | Onboarding, pricing CTA, or signup-flow changes |
| AI Agent Governance | Monthly | `.cursor/rules`, hooks, or process workflow updates |

For major launches, run at least: Security, Growth Funnel, Reliability/Ops, Data Integrity, and Code audits in the same release window.

## After review

- **Single-lane audit:** PM reviews the report and manually promotes task candidates to [docs/tasks.md](../tasks.md) if desired.
- **Full audit:** PM reviews the synthesis output (`docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md`) and promotes approved items to [docs/tasks.md](../tasks.md). Synthesis already deduplicates across lanes.
- The builder implements approved items.
