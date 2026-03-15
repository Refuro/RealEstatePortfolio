# Cursor AI agent infrastructure — setup guide

This doc describes how the Cursor AI agent setup is structured in this repo so you (or a coworker) can get the same PM/builder workflow and safety hooks on another machine or in another clone.

---

## What’s in place

The project uses:

1. **PM and builder rules** — PM rule (`pm-agent.mdc`) tells Cursor how to act as the PM; builder rule (`builder-agent.mdc`) reinforces phase scope, Handoff, and manual-step boundaries.
2. **Two Cursor hooks** — one runs when a subagent stops (optional follow-up to the PM); one runs before every shell command (allow/deny/ask by risk).
3. **Docs the PM and builder rely on** — phase list, current phase, review checklist, workflow, manual steps, tasks, shell risk policy.

Everything the agent needs is in the repo; no Cursor “cloud” config. Cloning the repo and ensuring the hook script is executable is enough for the infrastructure to work.

---

## Files and folders to have

### 1. `.cursor/` (project-level Cursor config)

| Path | Purpose |
|------|--------|
| **`.cursor/rules/pm-agent.mdc`** | Rule that defines the PM agent. `alwaysApply: true` so it’s active in any chat. Tells the agent to use the phase workflow, the review checklist, and when to pause or gate phases. |
| **`.cursor/rules/builder-agent.mdc`** | Rule that reinforces builder behavior: stay in scope, update `current-phase.md`, add Handoff, never do manual steps. |
| **`.cursor/rules/code-audit-agent.mdc`** | Code audit command. When the user says "run code audit" or "code audit", the agent launches a subagent that follows `docs/code-audit-process.md` and writes a report to `docs/code_audits/`. |
| **`.cursor/hooks.json`** | Declares the two hooks: `subagentStop` (script below) and `beforeShellExecution` (prompt-based risk policy for shell commands). |
| **`.cursor/hooks/on-subagent-stop.sh`** | Script run when a subagent stops. If the subagent completed, it can output a `followup_message` so the PM is prompted to review. Uses `jq` if available, else grep fallback. |
| **`.cursor/hooks/on-subagent-stop.ps1`** | PowerShell variant for Windows when Git Bash/WSL is not available. Edit `hooks.json` to use this path instead of the `.sh` script if needed. |

### 2. Docs the PM rule and workflow reference

These live under `docs/` and are linked from the rule or the workflow doc:

| Doc | Role |
|-----|------|
| `docs/engineering-spec.md` | Phase list and scope (§8). |
| `docs/current-phase.md` | Current phase and checklist; builder updates this and adds Handoff when done. |
| `docs/pm-review-checklist.md` | Checklist the PM runs before approving a phase (build, lint, tests, scope, docs). |
| `docs/pm-agent-workflow.md` | How to start the builder, when to pause, Phase 4 gate, command-level risk. |
| `docs/manual-steps.md` | Steps that stay manual (Vercel, Clerk, DB, Stripe); builder must not do these. |
| `docs/tasks.md` | Optional task list for the builder (“complete tasks in tasks.md”). |
| `docs/shell-risk-policy.md` | Canonical shell risk policy (allow/deny/ask). The `beforeShellExecution` hook implements this; keep them in sync. |
| `docs/code-audit-process.md` | Process the code audit agent follows when the user runs a code audit. |
| `docs/code_audits/` | Folder for code audit reports. User reviews reports and creates tasks from findings as needed. |

If any of these are missing, the PM rule or workflow doc will reference them; add minimal stubs or copy from this repo.

---

## How to set this up (e.g. for a coworker)

Do this in the project root (same level as `app/` and `docs/`).

### Step 1: Get the Cursor files from the repo

- Ensure the repo has the `.cursor` directory and the `docs` files above (they’re committed).
- Clone or pull so you have:
  - `.cursor/rules/pm-agent.mdc`
  - `.cursor/rules/builder-agent.mdc`
  - `.cursor/rules/code-audit-agent.mdc`
  - `.cursor/hooks.json`
  - `.cursor/hooks/on-subagent-stop.sh`
  - `.cursor/hooks/on-subagent-stop.ps1` (optional, for Windows)
  - The `docs/` files listed above.

### Step 2: Make the hook script executable (Linux/macOS)

```bash
chmod +x .cursor/hooks/on-subagent-stop.sh
```

**Windows:** Cursor usually runs `.sh` scripts via Git Bash or WSL. If the hook doesn’t run, edit `.cursor/hooks.json` and change the `subagentStop` command from `.cursor/hooks/on-subagent-stop.sh` to `.cursor/hooks/on-subagent-stop.ps1` to use the PowerShell variant.

### Step 3: No extra Cursor app config required

- Rules in `.cursor/rules/` are picked up by Cursor when the project is open.
- Hooks in `.cursor/hooks.json` are project-level; no per-user Cursor setting is required for this setup.

Optional: in Cursor Settings, ensure “Rules” (or equivalent) are enabled for the project so the PM rule applies.

### Step 4: Use the workflow

- Open a chat and treat the agent as the PM (e.g. “Start the builder at the stage the last builder left off at”). The PM rule will apply.
- The `beforeShellExecution` hook will gate shell commands; the `subagentStop` hook can prompt the PM to review when a builder subagent finishes.

---

## Summary for “set up my Cursor like this project”

1. Clone/pull the repo (includes `.cursor/` and `docs/`).
2. Run: `chmod +x .cursor/hooks/on-subagent-stop.sh`.
3. Open the project in Cursor; the PM rule and hooks are active.
4. Use the workflow from `docs/pm-agent-workflow.md` (start builder, review with `docs/pm-review-checklist.md`, approve/advance or pause as described).

**Code audit:** Say "run code audit" or "code audit" to trigger a codebase audit. The agent follows `docs/code-audit-process.md` and writes a report to `docs/code_audits/`. Review the report and create tasks in `docs/tasks.md` for any fixes you want.

No API keys, no Cursor account config, and no duplicate files—just the repo and an executable hook script.
