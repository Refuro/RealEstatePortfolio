# AI Agent Governance Audit — 2026-04-29

## Executive summary

- **Overall:** Repo-level **audit command wiring remains sound**: fourteen lanes align across `docs/audits/README.md`, `docs/process/command-integrity-check.md`, and the checked-in `.cursor/rules/*-audit-agent.mdc` set; **`docs/policies/shell-risk-policy.md`** and **`.cursor/hooks.json`** `beforeShellExecution` describe the same ALLOW / DENY / ASK buckets.
- **Top risks:** (1) **`docs/cursor-agent-setup.md` still summarizes “other focused audits” with a partial lane list**, contradicting the same file’s fuller table and `docs/audits/README.md`. (2) **Default `subagentStop` uses `on-subagent-stop.sh`**, which may not run where Bash/WSL is absent—silent loss of PM review nudge. (3) **Agent-related guidance spans Cursor rules plus `app/.agents/`** (e.g. product context referenced from `builder-agent.mdc`); **`docs/process/agent-governance-audit-process.md` does not mention that surface**, so governance reviews can miss drift there.
- **Recommendation:** Align onboarding copy with **`docs/audits/README.md`**, tighten Windows hook notes where operators actually look post-clone, and extend governance scope (or a short cross-link in setup docs) for **`app/.agents/`** vs `.cursor/rules` ownership.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified. Prompt-based shell gating matches written policy; issues below are consistency and operational ergonomics.

### Medium

- **`docs/cursor-agent-setup.md` summary contradicts canonical lane inventory** — The closing “Other focused audits” sentence lists eight lane families **without** SEO, mobile experience, documentation, or legal/compliance, while the **Full audit** sentence on the next lines commits to **fourteen** lanes and the file’s earlier table enumerates those rules. New contributors relying on the summary can underestimate available audits. — *Evidence:* `docs/cursor-agent-setup.md` (table ~lines 21–41 vs “Other focused audits” ~lines 147–148).

- **`subagentStop` defaults to Bash on Windows-heavy setups** — `.cursor/hooks.json` invokes `.cursor/hooks/on-subagent-stop.sh`. Written guidance correctly allows switching to **`on-subagent-stop.ps1`**, but committed **default stays `.sh`**; if the hook does not execute, the PM misses `followup_message` after builder/subagent stops. — *Evidence:* `.cursor/hooks.json`; `docs/setup/ai-process-workflow-setup.md` (Windows prerequisites and step 3).

- **Governance audit process omits non–`.cursor` agent surfaces** — `docs/process/agent-governance-audit-process.md` scopes `.cursor/rules/*`, hooks, and named docs under `docs/`. The builder rule points to **`app/.agents/product-marketing-context.md`** and **`app/.agents/skills/`** hosts product skills; these are active governance surfaces for agent behavior **not listed** in the process doc. Risk of unchecked drift between product-agent copy rules and Cursor rules on marketing/UI work. — *Evidence:* `docs/process/agent-governance-audit-process.md` § Scope; `.cursor/rules/builder-agent.mdc` references; inventory `app/.agents/skills/*/SKILL.md` (presence only).

### Low

- **`agent-governance-audit-agent.mdc` nests a subagent while “Audit only” can be read narrowly** — The rule directs launching a general-purpose subagent; the canonical template clarifies audit reports are required writes. Operators running the lane inline may duplicate nesting; **“no code changes”** without pointing at `audit-report-template.md` can still confuse. — *Evidence:* `.cursor/rules/agent-governance-audit-agent.mdc`; `docs/process/audit-report-template.md` (opening note).

- **Naming typography variance** — `full-audit-agent.mdc` hyphenates lane labels (e.g. Performance-Cost); `docs/audits/README.md` uses “Performance & Cost.” Semantic match; presentation only. — *Evidence:* `.cursor/rules/full-audit-agent.mdc` § What to do; `docs/audits/README.md` table.

- **Many dated reports under `docs/audits/agent-governance/`** — README historical policy allows retention; housekeeping (optional) only if redundant same-day duplicates should be archived elsewhere. — *Evidence:* `docs/audits/README.md` “Historical note”; folder listing.

## Evidence reviewed

- **Process & template:** `docs/process/agent-governance-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/pm-agent-workflow.md`, `docs/process/full-audit-synthesis.md` (§2–§3 headings)
- **Index & workflows:** `docs/audits/README.md`, `docs/tasks.md` (intro and gates), `docs/cursor-agent-setup.md`, `docs/setup/ai-process-workflow-setup.md`
- **Policies & hooks:** `docs/policies/shell-risk-policy.md`, `.cursor/hooks.json`, `.cursor/hooks/on-subagent-stop.sh`, `.cursor/hooks/on-subagent-stop.ps1` (path contract)
- **Rules:** `.cursor/rules/pm-agent.mdc`, `.cursor/rules/builder-agent.mdc`, `.cursor/rules/full-audit-agent.mdc`, `.cursor/rules/agent-governance-audit-agent.mdc`; glob confirms **14** `*-audit-agent.mdc` files
- **`app/` references (paths only — no application source audited):** `app/.agents/` skill inventory vs governance docs

**Assumptions / limits:** Hooks were not executed in Cursor on this machine; review is consistency of checked-in docs and configs. Workspace-level `.cursor/skills/` outside `RealEstatePortfolio/` were not audited as in-repo artifacts.

## Risk & impact assessment

Unresolved **Medium** items raise the chance contributors **misconfigure hooks** or **under-invoke audits**, slowing review and weakening cross-checks—not direct production exploit risk from governance docs alone. **Fragmentation** around `app/.agents/` can allow product-marketing drift vs stated policies if changes land without parallel rule updates.

## Recommendations (prioritized)

1. **Fix `docs/cursor-agent-setup.md`** — Either enumerate all single-lane audit families aligned with **`docs/audits/README.md`** or replace enumeration with “see **`docs/audits/README.md`** for all `run … audit` phrases” and drop the partial list.
2. **Surface Windows `subagentStop` ergonomics once** — Add a conspicuous troubleshooting bullet (hooks not firing → verify Bash vs **`on-subagent-stop.ps1`**) beside existing setup steps in **`docs/cursor-agent-setup.md`** or the verification checklist in **`docs/setup/ai-process-workflow-setup.md`**.
3. **Extend governance scope or cross-links** — Add to **`agent-governance-audit-process.md`** § Scope (and optionally **`docs/cursor-agent-setup.md`**): verify **`app/.agents/`** marketing context and skills stay consistent with **`docs/`** policies and `.cursor/rules` when agent-facing copy or flows change.

## Task candidates (optional)

- [ ] Update `docs/cursor-agent-setup.md` “Other focused audits” paragraph to mirror `docs/audits/README.md` or defer entirely to that index.

- [ ] Add `app/.agents/` to `docs/process/agent-governance-audit-process.md` scope with a brief “cross-check vs design/analytics policies” note.

## Re-test checklist

- [ ] After doc edits, grep `cursor-agent-setup.md` for audit lane mentions and compare to **`docs/audits/README.md`** table row count.

- [ ] After any **`hooks.json`** change, smoke `subagentStop` on a Windows path without Bash if that matches the team.

- [ ] `npm run check` — only if application code changes (not needed for governance-only documentation fixes).

## Next trigger and cadence

- **Trigger:** Per `docs/audits/README.md` — monthly, or whenever `.cursor/` rules/hooks/process workflow docs materially change.

- **Recommended next window:** **2026-05-29** or the next merge touching `.cursor/` or **`docs/process/*audit*`**.
