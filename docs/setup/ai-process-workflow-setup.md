# AI Process Workflow Setup

This guide explains how to set up the Veld Portfolio AI workflow so a Cursor chat can act as a **PM** and launch a **builder** subagent with the same rules, hooks, and review loop used in this repo.

Use this when you want to:

- set up the workflow on another machine or fresh clone
- copy the workflow into a new project
- understand which files are required for the PM/builder process to work

---

## What this workflow includes

The workflow has five parts:

1. **PM and builder rules** in `.cursor/rules/`
2. **Hooks** in `.cursor/hooks.json`
3. **Core process docs** in `docs/`
4. **A task file** in `docs/tasks.md`
5. **A review loop** where the PM approves or sends the builder back with fixes

At a high level:

- The **PM** reads `docs/tasks.md`, launches the builder, reviews the result, and decides whether to approve the phase or request changes.
- The **builder** implements only the assigned tasks, updates docs as needed, runs checks, and stops for review.
- The **beforeShellExecution** hook applies command-risk guardrails.
- The **subagentStop** hook can prompt the PM to review when the builder finishes.

---

## Prerequisites

Before using this workflow, make sure you have:

- Cursor with project rules and hooks enabled
- the repo opened at the project root
- Git installed
- a shell environment that can run the hook script

For Linux and macOS, the included shell script is the default.

For Windows:

- Git Bash or WSL usually works with the `.sh` hook
- if not, switch the `subagentStop` command in `.cursor/hooks.json` to `.cursor/hooks/on-subagent-stop.ps1`

---

## Files you need

### Cursor files

These files define agent behavior and shell gating:

- `.cursor/rules/pm-agent.mdc`
- `.cursor/rules/builder-agent.mdc`
- `.cursor/hooks.json`
- `.cursor/hooks/on-subagent-stop.sh`
- `.cursor/hooks/on-subagent-stop.ps1`

Optional but part of this repo's broader AI workflow:

- `.cursor/rules/code-audit-agent.mdc`
- `.cursor/rules/math-audit-agent.mdc`
- `.cursor/rules/feature-audit-agent.mdc`
- `.cursor/rules/security-audit-agent.mdc`
- `.cursor/rules/performance-cost-audit-agent.mdc`
- `.cursor/rules/reliability-ops-audit-agent.mdc`
- `.cursor/rules/data-integrity-audit-agent.mdc`
- `.cursor/rules/business-valuation-audit-agent.mdc`
- `.cursor/rules/growth-funnel-audit-agent.mdc`
- `.cursor/rules/documentation-audit-agent.mdc`
- `.cursor/rules/legal-compliance-audit-agent.mdc`
- `.cursor/rules/agent-governance-audit-agent.mdc`
- `.cursor/rules/full-audit-agent.mdc`

### Required docs

These docs are the working context for the PM/builder loop:

- `docs/reference/engineering-spec.md`
- `docs/tasks.md`
- `docs/reference/roadmap.md`
- `docs/process/pm-review-checklist.md`
- `docs/process/pm-agent-workflow.md`
- `docs/setup/manual-steps.md`
- `docs/policies/shell-risk-policy.md`
- `app/.env.example`

Recommended supporting docs:

- `docs/architecture-and-build-practices.md`
- `docs/policies/design-spec.md`
- `docs/policies/ownership-metrics.md`
- `docs/policies/analytics-math-policy.md`

---

## Step-by-step setup

### 1. Copy the workflow files into the repo

At minimum, bring over:

- `.cursor/rules/pm-agent.mdc`
- `.cursor/rules/builder-agent.mdc`
- `.cursor/hooks.json`
- `.cursor/hooks/on-subagent-stop.sh`
- `docs/tasks.md`
- `docs/process/pm-review-checklist.md`
- `docs/process/pm-agent-workflow.md`
- `docs/setup/manual-steps.md`
- `docs/policies/shell-risk-policy.md`

If you are reproducing the full Veld workflow, also copy the audit rules and audit process docs.

### 2. Ensure the hook script is executable

From the repo root:

```bash
chmod +x .cursor/hooks/on-subagent-stop.sh
```

This is required on Linux and macOS so Cursor can run the `subagentStop` hook script.

### 3. Confirm the hook configuration

The repo-level hook config lives in `.cursor/hooks.json`.

The current setup uses:

- `subagentStop` to run `.cursor/hooks/on-subagent-stop.sh`
- `beforeShellExecution` as a prompt-based risk gate

The shell gate should stay aligned with `docs/policies/shell-risk-policy.md`.

Expected behavior:

- **Allow:** low-risk local commands like `npm install`, `npm run check`, tests, local Prisma commands
- **Deny:** destructive commands like `rm -rf`, force pushes, production-secret misuse
- **Ask:** first-time pushes, deploy-like commands, and external/network-heavy commands with possible side effects

If you change one of these, update both:

- `.cursor/hooks.json`
- `docs/policies/shell-risk-policy.md`

### 4. Make sure the PM rule has the right references

The PM rule should point the agent to:

- `docs/tasks.md`
- `docs/reference/engineering-spec.md`
- `docs/process/pm-review-checklist.md`
- `docs/setup/manual-steps.md`
- `docs/reference/roadmap.md`

The PM's job is to:

- read current tasks
- start or resume the builder
- review output against the checklist
- approve, pause, or request fixes

### 5. Make sure the builder rule has the right references

The builder rule should instruct the agent to:

- stay in scope
- work only from `docs/tasks.md` or PM instructions
- follow `docs/policies/design-spec.md` for UI work
- follow `docs/architecture-and-build-practices.md`
- update `app/.env.example` when new env vars are added
- update `docs/setup/manual-steps.md` when new manual steps are introduced
- never attempt manual platform setup itself
- run `npm run check` from `app/` before stopping

### 6. Seed the task file

The workflow depends on a clear task queue in `docs/tasks.md`.

Good tasks are:

- scoped
- checkable
- tied to acceptance criteria

Poor tasks are vague requests like "improve the app" or "make onboarding better."

If you are starting a new project, create Phase 0 tasks first. In this repo, phase order lives in `docs/reference/engineering-spec.md`.

### 7. Document manual boundaries

Add or confirm a `docs/setup/manual-steps.md` file that explicitly lists work agents should not attempt, such as:

- Vercel project creation
- Clerk dashboard configuration
- Stripe product and webhook setup
- production database provisioning
- production env var entry

This boundary is important because it keeps builder agents from attempting actions they cannot safely complete from the repo alone.

### 8. Add env placeholders

Make sure `app/.env.example` contains every required environment variable with placeholders and short notes where helpful.

Whenever the builder introduces a new dependency on environment config, that file should be updated in the same change.

---

## How to run the workflow

Once the files above are in place:

1. Open the repo in Cursor.
2. Start a chat and use the agent as the PM.
3. Ask it to start the builder, usually with a prompt like `Complete tasks in tasks.md`.
4. Let the builder finish or stop for review.
5. Have the PM review with `docs/process/pm-review-checklist.md`.
6. Resume with either approval or a short fix list plus the next phase.

Typical PM prompts:

- `Start the builder`
- `Complete tasks in tasks.md`
- `Start the builder on Phase 1`
- `Check on the builder`
- `Review this phase and approve if ready`

Typical PM review outcomes:

- `Approved. Proceed to Phase N.`
- `Fix X and Y, then proceed to Phase N.`
- `Approved for this phase; pause here.`

---

## How the phase loop works

This workflow is most effective when work is phased.

The repo's process is:

1. PM reads `docs/tasks.md`
2. PM launches builder subagent
3. Builder implements only the assigned scope
4. Builder updates docs and runs checks
5. Builder stops
6. PM reviews with `docs/process/pm-review-checklist.md`
7. PM either approves or requests fixes
8. PM resumes the builder with the next phase or correction list

The canonical phase list for this repo lives in `docs/reference/engineering-spec.md`.

---

## Optional audit lanes

This repo also supports audit commands through additional rule files.

If you want the full setup, include the matching `.cursor/rules/*-audit-agent.mdc` files and the related `docs/process/*audit*.md` docs.

That enables prompts like:

- `run code audit`
- `run security audit`
- `run math audit`
- `run documentation audit`
- `run legal audit`
- `run full audit`

Reports are written into `docs/audits/`.

---

## Verification checklist

After setup, confirm these all work:

- Cursor sees the `.cursor/rules/` files in the project
- `.cursor/hooks/on-subagent-stop.sh` is executable
- `.cursor/hooks.json` points to the correct hook script
- `docs/tasks.md` contains current tasks
- `docs/process/pm-review-checklist.md` exists and is current
- `docs/process/pm-agent-workflow.md` matches the intended PM/builder behavior
- `docs/policies/shell-risk-policy.md` matches the hook policy
- `app/.env.example` and `docs/setup/manual-steps.md` exist

Practical smoke test:

1. Ask the PM to `Complete tasks in tasks.md`.
2. Confirm the builder launches.
3. Confirm shell commands are gated normally.
4. Confirm the builder stops for review.
5. Confirm the PM can review and resume the builder.

---

## For a new project

If you are copying this workflow into a different codebase, adapt these first:

- `docs/reference/engineering-spec.md`
- `docs/tasks.md`
- `docs/reference/roadmap.md`
- `docs/setup/manual-steps.md`
- `app/.env.example`
- any product-specific design, architecture, or policy docs

The reusable parts are mostly:

- `.cursor/rules/pm-agent.mdc`
- `.cursor/rules/builder-agent.mdc`
- `.cursor/hooks.json`
- `.cursor/hooks/on-subagent-stop.sh`
- `docs/process/pm-review-checklist.md`
- `docs/process/pm-agent-workflow.md`

---

## Related docs

- `docs/cursor-agent-setup.md` for the existing repo-focused setup reference
- `docs/ai-development-process-extraction.md` for the higher-level process model
- `docs/process/pm-agent-workflow.md` for day-to-day PM/builder operation
- `docs/process/pm-review-checklist.md` for the approval gate
- `docs/policies/shell-risk-policy.md` for shell-command risk rules
