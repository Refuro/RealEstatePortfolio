# AI Agent Governance Audit — 2026-04-07

## Executive summary

- **Rules vs canonical docs:** `docs/audits/README.md`, `full-audit-agent.mdc`, and `command-integrity-check.md` align on **14** lanes and process/rule paths; sampled audit rules reference valid process files and output folders.
- **Top risk (carried):** Always-on **builder** behavior and the **PM review checklist** still treat `docs/policies/design-spec.md` as the primary UI compliance target, even though that file’s header defers new work to `docs/design/design-spec-2026.md` — agents can follow secondary guidance by default.
- **Top risk (platform):** `.cursor/hooks.json` wires `subagentStop` to the **bash** script only; on Windows, if Git Bash/WSL is not used, the PM follow-up prompt from the hook may never run (PowerShell script exists but is not selected).
- **Process clarity:** `docs/audits/README.md` expects audits in **Agent** mode with writes enabled, while most `*-audit-agent.mdc` files instruct **launching a subagent**; `docs/process/agent-governance-audit-process.md` does not state an execution mode, so orchestration is ambiguous.

## Severity-ranked findings

### Critical

None.

### High

None.

### Medium

- **Canonical UI spec routing — builder rule, PM checklist, and PM workflow vs policy header** — Builders and PM reviews are steered to `docs/policies/design-spec.md` for UI compliance (`builder-agent.mdc` §2 and References; `docs/process/pm-review-checklist.md` design compliance bullet; `docs/process/pm-agent-workflow.md` summary line listing `docs/policies/design-spec.md` as reference). That policy file explicitly states canonical visual/interaction rules live in `docs/design/design-spec-2026.md` first and that it wins on conflict (`docs/policies/design-spec.md` lines 7–8). Risk: repeated audits and implementations diverge from the v3.1 spec unless agents read past the rule/checklist into the policy header. **Evidence:** `.cursor/rules/builder-agent.mdc` (lines 13–14, 44); `docs/process/pm-review-checklist.md` (line 19); `docs/process/pm-agent-workflow.md` (line 70); `docs/policies/design-spec.md` (lines 7–8).

- **`subagentStop` hook defaults to bash on a Windows-heavy workflow** — `hooks.json` sets `"command": ".cursor/hooks/on-subagent-stop.sh"`. `on-subagent-stop.ps1` exists but is unused. Docs describe switching to `.ps1` manually (`docs/cursor-agent-setup.md` ~120; `docs/setup/ai-process-workflow-setup.md` ~44–46). Risk: silent loss of the post-subagent PM nudge if the shell cannot run the script. **Evidence:** `.cursor/hooks.json`; `.cursor/hooks/on-subagent-stop.sh`; `.cursor/hooks/on-subagent-stop.ps1`.

- **Audit execution model fork (in-thread vs subagent)** — `docs/audits/README.md` § Running audits requires Agent chat with edits enabled and warns against read-only subagents. Single-lane rules (e.g. `code-audit-agent.mdc`, `agent-governance-audit-agent.mdc`) typically say “launch a subagent … read-only disabled.” Both can work, but the fork is not explained (when to use which). `docs/process/agent-governance-audit-process.md` §4 has no execution-mode line. **Evidence:** `docs/audits/README.md` (lines 40–44); `.cursor/rules/code-audit-agent.mdc` (lines 14–20); `.cursor/rules/agent-governance-audit-agent.mdc` (lines 14–17); `docs/process/agent-governance-audit-process.md` §4.

### Low

- **Lane rename checklist mismatch** — `docs/audits/README.md` § Lane structure contract lists six update targets (including referenced process doc or lane `README.md`). `docs/process/command-integrity-check.md` § Lane rename rule lists five and omits lane-level README / explicit “referenced process doc” wording. Risk: partial renames if contributors follow only the shorter list. **Evidence:** `docs/audits/README.md` (lines 25–36); `docs/process/command-integrity-check.md` (lines 5–12).

- **`docs/cursor-agent-setup.md` “Other focused audits” line under-lists lanes** — Summary section names feature/UX, security, performance-cost, reliability-ops, data-integrity, business-valuation, growth-funnel, and agent-governance only — **omits** mobile experience, SEO, documentation, and legal/compliance despite full rules existing and README listing all. Risk: onboarding readers underestimate audit surface. **Evidence:** `docs/cursor-agent-setup.md` (lines 143–147); `docs/audits/README.md` (table rows 8–22).

- **`docs/audits/README.md` report naming examples are incomplete** — Examples under “Report naming convention” omit several lanes (e.g. mobile experience filename pattern, agent-governance, growth-funnel). Risk: minor naming inconsistency for new contributors. **Evidence:** `docs/audits/README.md` (lines 72–86).

- **Positive note — `pm-agent.mdc` no longer cites `design-spec.md` directly** — PM rule text reviewed this run does not reference `docs/policies/design-spec.md` (grep on `.cursor/rules/pm-agent.mdc`). UI authority drift is concentrated in builder rule + PM checklist, not the PM rule body. **Evidence:** `.cursor/rules/pm-agent.mdc` (full file read; no `design-spec` string).

## Evidence reviewed

- **Process & template:** `docs/process/agent-governance-audit-process.md`, `docs/process/audit-report-template.md`
- **Audit index & workflow:** `docs/audits/README.md`, `docs/process/full-audit-synthesis.md` (§3 grouping / triage), `docs/process/command-integrity-check.md`, `docs/process/pm-agent-workflow.md`, `docs/setup/ai-process-workflow-setup.md`, `docs/cursor-agent-setup.md`, `docs/tasks.md` (referenced by process only)
- **Hooks & policy:** `.cursor/hooks.json`, `docs/policies/shell-risk-policy.md`, `.cursor/hooks/on-subagent-stop.sh`, `.cursor/hooks/on-subagent-stop.ps1`
- **Rules:** `.cursor/rules/full-audit-agent.mdc`, `.cursor/rules/agent-governance-audit-agent.mdc`, `.cursor/rules/pm-agent.mdc`, `.cursor/rules/builder-agent.mdc`, `.cursor/rules/code-audit-agent.mdc`, `.cursor/rules/math-audit-agent.mdc`
- **PM review / workflow:** `docs/process/pm-review-checklist.md`, `docs/process/pm-agent-workflow.md`
- **Design authority chain:** `docs/policies/design-spec.md` (header), `docs/design/design-spec-2026.md` (existence / role as cited in policy)
- **Process doc existence:** Glob under `docs/process/*audit*` confirmed 16 audit-related process files including all lanes in `command-integrity-check.md` mapping table
- **Prior governance report (continuity):** `docs/audits/agent-governance/2026-04-05-agent-governance-audit.md`

**Assumptions / limits:** No live Cursor hook execution test; shell gate alignment judged by static comparison of `shell-risk-policy.md` and the `beforeShellExecution` prompt in `hooks.json` (categories match: ALLOW/DENY/ASK). No edits under `app/`.

## Risk & impact assessment

Unresolved **medium** items reduce **agent instruction fidelity** (wrong or secondary design doc), **workflow reliability** (subagent stop hook on Windows), and **predictability** of how audits are run (subagent vs same chat). Likelihood is **ongoing** for design-doc drift (every UI task) and **environment-dependent** for hooks. Exposure is internal tooling and review quality, not end-user data directly.

## Recommendations (prioritized)

1. **Align always-on UI governance:** Update `.cursor/rules/builder-agent.mdc`, `docs/process/pm-review-checklist.md`, and `docs/process/pm-agent-workflow.md` so primary compliance references `docs/design/design-spec-2026.md`, with `docs/policies/design-spec.md` as legacy/structural cross-reference only — matching the policy file’s own header.
2. **Windows hook default:** Either switch `hooks.json` to `on-subagent-stop.ps1` when the team standardizes on PowerShell, or document a one-time “verify subagentStop works” step in setup (and optionally detect OS in a short setup note).
3. **Normalize audit orchestration:** Add one paragraph to `docs/audits/README.md` or `command-integrity-check.md`: subagent is optional if the main Agent session follows the process with writes enabled; subagent must not be read-only. Optionally align `agent-governance-audit-agent.mdc` step 1 with that (allow in-thread execution).
4. **Doc hygiene:** Extend `command-integrity-check.md` lane-rename list to match README; expand `docs/cursor-agent-setup.md` “Other focused audits” to all lanes or replace with a pointer to `docs/audits/README.md` only.

## Task candidates (optional)

- [ ] **GOV-1:** Point `builder-agent.mdc`, `pm-review-checklist.md`, and `pm-agent-workflow.md` at `docs/design/design-spec-2026.md` as primary UI authority (keep legacy policy as secondary).
- [ ] **GOV-2:** Decide default `subagentStop` command for Windows clones (`ps1` vs `.sh`) and update `hooks.json` + setup docs accordingly.
- [ ] **GOV-3:** Document in-thread vs subagent audit execution in `docs/audits/README.md` (and optionally relax `agent-governance-audit-agent.mdc` subagent requirement).
- [ ] **GOV-4:** Sync lane-rename checklist between `docs/audits/README.md` and `docs/process/command-integrity-check.md`.
- [ ] **GOV-5:** Refresh `docs/cursor-agent-setup.md` audit bullet list or defer entirely to `docs/audits/README.md`.

## Re-test checklist

- [ ] After GOV-1: confirm builder/checklist/workflow cite `design-spec-2026.md` first; spot-check one UI task for agent behavior.
- [ ] After GOV-2: stop a test subagent on Windows and confirm `followup_message` appears (or document failure mode).
- [ ] After GOV-3: run one single-lane audit in-thread and confirm report path matches README.
- [ ] `npm run check` (when any app code changes are made — not required for docs/rules-only governance fixes)

## Next trigger and cadence

- **Trigger:** Monthly per `docs/audits/README.md`, or whenever `.cursor/rules`, hooks, or PM/builder workflow docs change.
- **Recommended next run window:** 2026-05-07 (monthly) or next hooks/rules change.
