# AI Agent Governance Audit — 2026-04-27

## Executive summary

- **Overall:** Cursor rules, audit lane wiring, and shell-risk documentation are **largely aligned**: fourteen lanes are consistently enumerated in `docs/audits/README.md`, `.cursor/rules/full-audit-agent.mdc`, and `docs/setup/ai-process-workflow-setup.md`; `docs/process/command-integrity-check.md` matches the checked-in `*-audit-agent.mdc` set; `docs/policies/shell-risk-policy.md` and `.cursor/hooks.json` `beforeShellExecution` prompt describe the same ALLOW / DENY / ASK shape.
- **Top risk:** Default **`subagentStop` hook** targets a **bash** script while Windows-heavy setups may need the documented **PowerShell** path—if the hook does not run, the PM review nudge after subagent completion is silently lost.
- **Second risk:** **`docs/cursor-agent-setup.md`** understates which focused audit lanes exist (omits SEO, mobile experience, documentation, legal/compliance), which invites **onboarding and command-discovery drift** relative to the canonical index.
- **Recommendation:** Treat **`docs/audits/README.md`** + **`docs/process/command-integrity-check.md`** as the source of truth for lane names; fix the setup-guide sentence; optionally standardize `hooks.json` per platform or validate hook execution in Windows CI/smoke notes.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified. (Shell gating is prompt-based and aligned with written policy; remaining gaps are workflow/onboarding consistency, not immediate safety failures.)

### Medium

- **Default `subagentStop` command may not run on Windows without Bash** — The repo’s committed `.cursor/hooks.json` invokes `.cursor/hooks/on-subagent-stop.sh`. `docs/setup/ai-process-workflow-setup.md` and `docs/cursor-agent-setup.md` correctly note Git Bash/WSL or switching to `on-subagent-stop.ps1`, but **the default checkout does not select the PowerShell hook**. If the hook fails to execute, the PM does not get the automated follow-up to review builder output (`followup_message`), weakening the documented PM/builder loop. — *Evidence:* `.cursor/hooks.json`; `.cursor/hooks/on-subagent-stop.ps1` (comment lines 5–6); `docs/setup/ai-process-workflow-setup.md` § Prerequisites / step 3.

- **`docs/cursor-agent-setup.md` understates available audit lanes** — The closing summary lists “feature/UX, security, performance-cost, reliability-ops, data-integrity, business-valuation, growth-funnel, and agent-governance” only, **omitting SEO, mobile experience, documentation, and legal/compliance** even though the same file’s table documents those rules. Readers may believe fewer lanes exist than `docs/audits/README.md` defines. — *Evidence:* `docs/cursor-agent-setup.md` (table ~lines 21–41 vs summary ~line 147).

### Low

- **`agent-governance-audit-agent.mdc` “Audit only” phrasing** — Step 3 says “Audit only. Do not make code changes” without repeating the template clarification that **writing `docs/audits/...` is required**. The shared template resolves this, but the rule alone can be misread as “no writes.” — *Evidence:* `.cursor/rules/agent-governance-audit-agent.mdc`; `docs/process/audit-report-template.md` (note on “audit only”).

- **Follow-up copy uses “§8” in hook output** — `on-subagent-stop.sh` / `.ps1` reference `docs/reference/engineering-spec.md §8`. The engineering spec uses markdown heading `# 8. Prioritized Build Order` (valid target); the “§” convention is informal and may render inconsistently in some UIs. — *Evidence:* `.cursor/hooks/on-subagent-stop.sh` line 19; `docs/reference/engineering-spec.md` ~line 599.

- **Lane naming typography differs between docs** — `full-audit-agent.mdc` uses hyphenated tokens (e.g. Performance-Cost); `docs/audits/README.md` uses “Performance & Cost.” Meaning is the same; only presentation differs. — *Evidence:* `.cursor/rules/full-audit-agent.mdc` line 12; `docs/audits/README.md` table.

## Evidence reviewed

- **Process & template:** `docs/process/agent-governance-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/pm-agent-workflow.md`, `docs/process/full-audit-synthesis.md` (partial)
- **Audit index & tasks:** `docs/audits/README.md`, `docs/tasks.md` (header and active-task context), `docs/audits/agent-governance/README.md`
- **Setup & cursor reference:** `docs/setup/ai-process-workflow-setup.md`, `docs/cursor-agent-setup.md`
- **Policies & hooks:** `docs/policies/shell-risk-policy.md`, `.cursor/hooks.json`, `.cursor/hooks/on-subagent-stop.sh`, `.cursor/hooks/on-subagent-stop.ps1`
- **Rules:** `.cursor/rules/pm-agent.mdc`, `.cursor/rules/builder-agent.mdc`, `.cursor/rules/full-audit-agent.mdc`, `.cursor/rules/agent-governance-audit-agent.mdc`, `.cursor/rules/code-audit-agent.mdc` (sample), and inventory of all `*-audit-agent.mdc` under `.cursor/rules/`
- **Phase reference validity:** `docs/reference/engineering-spec.md` § “8. Prioritized Build Order”
- **Process doc presence:** `docs/process/*audit*` glob (16 files including all lanes in the command-integrity table)

**Limits:** This pass did not execute hooks in Cursor or verify runtime behavior on this machine; it is documentation-and-config consistency review. No `app/` or application source was audited.

## Risk & impact assessment

- **Unresolved Medium findings:** Slightly higher chance of **missed PM review steps** on Windows if `subagentStop` is a no-op, and **slower discovery** of audit commands for new contributors reading only `docs/cursor-agent-setup.md`. Likelihood depends on team OS mix and whether hooks are smoke-tested after clone.
- **Exposure:** Internal workflow and governance hygiene; not direct user-data or production security exposure from these items alone.

## Recommendations (prioritized)

1. **Windows hook ergonomics:** Either document a one-line “after clone on Windows” step prominently (e.g. in `docs/cursor-agent-setup.md` summary) to switch `subagentStop` to `on-subagent-stop.ps1` when Bash is unavailable, or add a short troubleshooting bullet (“PM not prompted after subagent: check hook command”).
2. **Fix `docs/cursor-agent-setup.md` summary** so the “Other focused audits” sentence lists all fourteen single-lane families (or explicitly defers to `docs/audits/README.md` without enumerating a partial subset).
3. **Tighten `agent-governance-audit-agent.mdc`** with one phrase mirroring the template: audits must write the report under `docs/audits/agent-governance/`; “no code changes” excludes `app/` product source only.

## Task candidates (optional)

- [ ] Update `docs/cursor-agent-setup.md` summary line for focused audits to include SEO, mobile experience, documentation, and legal/compliance (or replace enumeration with “see `docs/audits/README.md`”).
- [ ] Add a Windows hook troubleshooting note (Bash vs PowerShell `subagentStop` path) to `docs/cursor-agent-setup.md` or `docs/setup/ai-process-workflow-setup.md` verification checklist.
- [ ] Amend `.cursor/rules/agent-governance-audit-agent.mdc` step 3 to state that writing the audit markdown is mandatory.

## Re-test checklist

- [ ] After any hook doc or `hooks.json` change, confirm `subagentStop` runs on a representative Windows and macOS machine.
- [ ] After `cursor-agent-setup.md` edit, spot-check that lane list matches `docs/audits/README.md`.
- [ ] `npm run check` (when code changes are made — not required for doc-only governance fixes)

## Next trigger and cadence

- **Trigger:** Per `docs/audits/README.md` — monthly, or whenever `.cursor/rules`, hooks, or process workflow docs change; also before major launch windows if governance changes ship.
- **Recommended next run:** 2026-05-27 or the next change batch touching `.cursor/` or `docs/process/*audit*`.
