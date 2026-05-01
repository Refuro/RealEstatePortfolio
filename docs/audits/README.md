# Audits

Periodic AI-run audits of the product and codebase. Each lane has a process doc and a report folder.

**Historical note:** Dated files under each lane folder (for example `2026-04-04-*.md`) are **point-in-time artifacts** from the run that created them. When a later audit supersedes findings, add a new dated report rather than editing or deleting older files; synthesis docs in [`synthesis/`](synthesis/) consolidate cross-lane follow-ups.

**Bookmark redirects (2026-04-30 doc cleanup):** Older URLs assumed `docs/audits/2026-04-05-quick-add-completion-gap-audit.md` and `docs/audits/2026-04-05-onboarding-friction-analysis.md` at repo root; canonical paths are [`feature/2026-04-05-quick-add-completion-gap-audit.md`](feature/2026-04-05-quick-add-completion-gap-audit.md) and [`growth-funnel/2026-04-05-onboarding-friction-analysis.md`](growth-funnel/2026-04-05-onboarding-friction-analysis.md).

| Type | Process | Reports |
|------|---------|---------|
| **Code** | [code-audit-process.md](../process/code-audit-process.md) | [code/](code/) |
| **Math & Logic** | [math-logic-audit.md](../process/math-logic-audit.md) | [math/](math/) |
| **Feature / UX / IA** | [feature-ux-audit-process.md](../process/feature-ux-audit-process.md) | [feature/](feature/) |
| **Mobile experience** (narrow viewport & shells) | [mobile-experience-audit-process.md](../process/mobile-experience-audit-process.md) → [mobile-experience-audit.md](../qa/mobile-experience-audit.md) | [feature/](feature/) — `YYYY-MM-DD-mobile-experience-audit.md` |
| **Security & Privacy** | [security-audit-process.md](../process/security-audit-process.md) | [security/](security/) |
| **Performance & Cost** | [performance-cost-audit-process.md](../process/performance-cost-audit-process.md) | [performance-cost/](performance-cost/) |
| **Reliability & Operations** | [reliability-ops-audit-process.md](../process/reliability-ops-audit-process.md) | [reliability-ops/](reliability-ops/) |
| **Data Integrity & Reconciliation** | [data-integrity-audit-process.md](../process/data-integrity-audit-process.md) | [data-integrity/](data-integrity/) |
| **Business & Valuation** | [business-valuation-audit-process.md](../process/business-valuation-audit-process.md) | [business/](business/) |
| **Growth Funnel & Activation** | [growth-funnel-audit-process.md](../process/growth-funnel-audit-process.md) | [growth-funnel/](growth-funnel/) |
| **SEO** (search & discovery) | [seo-audit-process.md](../process/seo-audit-process.md) | [seo/](seo/) |
| **Documentation** | [documentation-audit-process.md](../process/documentation-audit-process.md) | [documentation/](documentation/) |
| **Legal & Compliance** | [legal-compliance-audit-process.md](../process/legal-compliance-audit-process.md) | [legal-compliance/](legal-compliance/) |
| **AI Agent Governance** | [agent-governance-audit-process.md](../process/agent-governance-audit-process.md) | [agent-governance/](agent-governance/) |
| **Synthesis** (full audit) | [full-audit-synthesis.md](../process/full-audit-synthesis.md) | [synthesis/](synthesis/) |

## Lane structure contract

If you rename an audit lane, move its report folder, or rename its process doc, update these in the **same pass**:

1. `docs/audits/README.md`
2. The matching `.cursor/rules/*-audit-agent.mdc`
3. Any referenced process doc or lane `README.md`
4. `docs/process/command-integrity-check.md`
5. Any full-audit docs that enumerate lane count or names
6. `docs/setup/ai-process-workflow-setup.md` if it lists optional audit lanes

Do not leave partial lane renames merged, or audit commands and documentation will drift.

## Running audits

### Agent execution (Cursor)

Audits **must** create or update markdown under `docs/audits/`. Run them in **Agent** chat with edits enabled—not **Ask** mode, not read-only subagents. If you launch a **Task** subagent for a lane, leave **read-only** off so it can write the report file.

Process phrases like **"audit only"** or **"no code changes"** mean: do not change application or library source (for example under `app/`) while producing the audit; they **do not** mean skip writing the report. A full audit is a large task—run lanes in whatever order fits, but each lane’s output file is required.

### Full audit (all lanes)

- **Trigger:** Say "run full audit" or "run all audits".
- **Flow:**
1. Run all **14** audit lanes (Code, Math, Feature/UX, **Mobile experience**, Security, Performance/Cost, Reliability/Ops, Data Integrity, Business/Valuation, Growth Funnel, **SEO**, Documentation, Legal/Compliance, Agent Governance).
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
- **SEO audit:** Say "run SEO audit" or "run seo audit".
- **Documentation audit:** Say "run documentation audit" or "run doc audit".
- **Legal/compliance audit:** Say "run legal audit" or "run compliance audit".
- **Agent governance audit:** Say "run agent governance audit".
- **Mobile experience audit:** Say "run mobile audit", "mobile experience audit", or "run mobile UX audit".

### Report naming convention

Use daily ISO naming for all report files:

- `YYYY-MM-DD-<lane>-audit.md`

Examples:

- `2026-03-19-code-audit.md`
- `2026-03-19-math-logic-audit.md`
- `2026-03-19-security-audit.md`
- `2026-03-19-business-valuation-audit.md`
- `2026-03-19-documentation-audit.md`
- `2026-03-19-seo-audit.md`
- `2026-03-19-legal-compliance-audit.md`

## Cadence and triggers

| Lane | Default cadence | Required trigger |
|------|-----------------|------------------|
| Code | Monthly | Major refactor or architecture shift |
| Math & Logic | Monthly | Any analytics/metrics contract change |
| Feature / UX / IA | Monthly | Navigation, IA, onboarding, or major page redesign |
| Mobile experience | Monthly (or with major UI) | Mobile shell, safe-area, touch, or `md:hidden` layout changes |
| Security & Privacy | Monthly | Auth, billing, account, or integration security changes |
| Performance & Cost | Monthly | New heavy UI/dependency or external API changes |
| Reliability & Operations | Monthly | Release hardening and operational change windows |
| Data Integrity & Reconciliation | Monthly | Schema/import-export/API contract changes |
| Business & Valuation | Quarterly | Pricing/packaging/strategic readiness updates |
| Growth Funnel & Activation | Monthly | Onboarding, pricing CTA, or signup-flow changes |
| SEO | Monthly | New indexable routes, sitemap/robots/metadata changes, or major marketing copy |
| Documentation | Monthly | Large doc cleanup, doc reorg, or repeated stale-reference drift |
| Legal & Compliance | Quarterly | Privacy/terms/cookie/billing/marketing-copy changes or pre-launch review |
| AI Agent Governance | Monthly | `.cursor/rules`, hooks, or process workflow updates |

For major launches, run at least: Security, Legal/Compliance, Growth Funnel, **SEO**, Reliability/Ops, Data Integrity, and Code audits in the same release window.

## After review

- **Single-lane audit:** PM reviews the report and manually promotes task candidates to [docs/tasks.md](../tasks.md) if desired.
- **Full audit:** PM reviews the synthesis output (`docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md`) and promotes approved items to [docs/tasks.md](../tasks.md). Synthesis already deduplicates across lanes.
- The builder implements approved items.
