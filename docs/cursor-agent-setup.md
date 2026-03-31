# Cursor AI agent infrastructure — setup guide

This doc describes how the Cursor AI agent setup is structured in this repo so you (or a coworker) can get the same PM/builder workflow and safety hooks on another machine or in another clone.

---

## What’s in place

The project uses:

1. **PM and builder rules** — PM rule (`pm-agent.mdc`) tells Cursor how to act as the PM; builder rule (`builder-agent.mdc`) reinforces phase scope, Handoff, and manual-step boundaries.
2. **Two Cursor hooks** — one runs when a subagent stops (optional follow-up to the PM); one runs before every shell command (allow/deny/ask by risk).
3. **Docs the PM and builder rely on** — phase list, task list, review checklist, workflow, manual steps, shell risk policy.

Everything the agent needs is in the repo; no Cursor “cloud” config. Cloning the repo and ensuring the hook script is executable is enough for the infrastructure to work.

---

## Files and folders to have

### 1. `.cursor/` (project-level Cursor config)

| Path | Purpose |
|------|--------|
| **`.cursor/rules/pm-agent.mdc`** | Rule that defines the PM agent. `alwaysApply: true` so it’s active in any chat. Tells the agent to use the phase workflow, the review checklist, and when to pause or gate phases. |
| **`.cursor/rules/builder-agent.mdc`** | Rule that reinforces builder behavior: stay in scope, update `tasks.md`, add env vars and manual steps to `.env.example` and `manual-steps.md`, never do manual steps. |
| **`.cursor/rules/code-audit-agent.mdc`** | Code audit command. When the user says "run code audit" or "code audit", the agent launches a subagent that follows `docs/process/code-audit-process.md` and writes a report to `docs/audits/code/`. |
| **`.cursor/rules/math-audit-agent.mdc`** | Math & Logic audit command. When the user says "run math audit" or "math audit", the agent launches a subagent that follows `docs/process/math-logic-audit.md` and writes a report to `docs/audits/math/`. |
| **`.cursor/rules/feature-audit-agent.mdc`** | Feature/UX audit command. Trigger phrases: "run feature audit", "run ux audit". Writes to `docs/audits/feature/`. |
| **`.cursor/rules/mobile-experience-audit-agent.mdc`** | Mobile experience audit (narrow viewport, shells, touch). Trigger phrases: "run mobile audit", "mobile experience audit". Follows `docs/process/mobile-experience-audit-process.md` and `docs/qa/mobile-experience-audit.md`. Writes `YYYY-MM-DD-mobile-experience-audit.md` to `docs/audits/feature/`. |
| **`.cursor/rules/security-audit-agent.mdc`** | Security audit command. Trigger phrases: "run security audit". Writes to `docs/audits/security/`. |
| **`.cursor/rules/performance-cost-audit-agent.mdc`** | Performance/cost audit command. Trigger phrases: "run performance audit". Writes to `docs/audits/performance-cost/`. |
| **`.cursor/rules/reliability-ops-audit-agent.mdc`** | Reliability/ops audit command. Trigger phrases: "run reliability audit". Writes to `docs/audits/reliability-ops/`. |
| **`.cursor/rules/data-integrity-audit-agent.mdc`** | Data-integrity audit command. Trigger phrases: "run data integrity audit". Writes to `docs/audits/data-integrity/`. |
| **`.cursor/rules/business-valuation-audit-agent.mdc`** | Business/valuation audit command. Trigger phrases: "run business audit", "run valuation audit". Writes to `docs/audits/business/`. |
| **`.cursor/rules/growth-funnel-audit-agent.mdc`** | Growth-funnel audit command. Trigger phrases: "run growth audit". Writes to `docs/audits/growth-funnel/`. |
| **`.cursor/rules/agent-governance-audit-agent.mdc`** | AI-agent governance audit command. Trigger phrases: "run agent governance audit". Writes to `docs/audits/agent-governance/`. |
| **`.cursor/rules/documentation-audit-agent.mdc`** | Documentation audit command. Trigger phrases: "run documentation audit", "run doc audit". Writes to `docs/audits/documentation/`. |
| **`.cursor/rules/legal-compliance-audit-agent.mdc`** | Legal & compliance audit command. Trigger phrases: "run legal audit", "run compliance audit". Writes to `docs/audits/legal-compliance/`. |
| **`.cursor/rules/full-audit-agent.mdc`** | Full audit command. Trigger phrases: "run full audit", "run all audits". Runs **13** lanes (including Mobile experience), then synthesis pass per `docs/process/full-audit-synthesis.md`. Outputs `docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md`. |
| **`.cursor/hooks.json`** | Declares the two hooks: `subagentStop` (script below) and `beforeShellExecution` (prompt-based risk policy for shell commands). |
| **`.cursor/hooks/on-subagent-stop.sh`** | Script run when a subagent stops. If the subagent completed, it can output a `followup_message` so the PM is prompted to review. Uses `jq` if available, else grep fallback. |
| **`.cursor/hooks/on-subagent-stop.ps1`** | PowerShell variant for Windows when Git Bash/WSL is not available. Edit `hooks.json` to use this path instead of the `.sh` script if needed. |

### 2. Docs the PM rule and workflow reference

These live under `docs/` and are linked from the rule or the workflow doc:

| Doc | Role |
|-----|------|
| `docs/reference/engineering-spec.md` | Phase list and scope (§8). |
| `docs/tasks.md` | Task list; builder checks off items when done. New env vars and manual steps go to `app/.env.example` and `docs/setup/manual-steps.md`. |
| `docs/reference/roadmap.md` | Value-add backlog, initiatives, long-term vision; PM promotes items to tasks.md when ready to build. |
| `docs/process/pm-review-checklist.md` | Checklist the PM runs before approving a phase (build, lint, tests, scope, docs). |
| `docs/process/pm-agent-workflow.md` | How to start the builder, task-based workflow, command-level risk. |
| `docs/setup/manual-steps.md` | Steps that stay manual (Vercel, Clerk, DB, Stripe); builder must not do these. |
| `docs/policies/shell-risk-policy.md` | Canonical shell risk policy (allow/deny/ask). The `beforeShellExecution` hook implements this; keep them in sync. |
| `docs/process/code-audit-process.md` | Process the code audit agent follows when the user runs a code audit. |
| `docs/audits/code/` | Folder for code audit reports. User reviews reports and creates tasks from findings as needed. |
| `docs/process/math-logic-audit.md` | Process the math audit agent follows when the user runs a math & logic audit. |
| `docs/audits/math/` | Folder for math & logic audit reports. User reviews reports and creates tasks from findings as needed. |
| `docs/process/feature-ux-audit-process.md` | Process for feature/UX/IA audits. |
| `docs/process/mobile-experience-audit-process.md` | Process for mobile experience audits; criteria in `docs/qa/mobile-experience-audit.md`. Reports live in `docs/audits/feature/`. |
| `docs/process/security-audit-process.md` | Process for security/privacy audits. |
| `docs/process/performance-cost-audit-process.md` | Process for performance/cost audits. |
| `docs/process/reliability-ops-audit-process.md` | Process for reliability/operations audits. |
| `docs/process/data-integrity-audit-process.md` | Process for reconciliation/data integrity audits. |
| `docs/process/business-valuation-audit-process.md` | Process for business/valuation audits. |
| `docs/process/growth-funnel-audit-process.md` | Process for growth/activation audits. |
| `docs/process/agent-governance-audit-process.md` | Process for AI-agent governance audits. |
| `docs/process/documentation-audit-process.md` | Process for documentation hygiene audits. |
| `docs/process/legal-compliance-audit-process.md` | Process for legal/compliance reviews (not a substitute for counsel). |
| `docs/process/full-audit-synthesis.md` | Synthesis pass when running all audits; produces deduplicated task list. |
| `docs/process/command-integrity-check.md` | Recurring check that audit rules reference correct process docs. |
| `docs/audits/synthesis/` | Folder for full audit synthesis reports (`YYYY-MM-DD-audit-synthesis.md`). |

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
  - `.cursor/rules/math-audit-agent.mdc`
  - `.cursor/rules/feature-audit-agent.mdc`
  - `.cursor/rules/mobile-experience-audit-agent.mdc`
  - `.cursor/rules/security-audit-agent.mdc`
  - `.cursor/rules/performance-cost-audit-agent.mdc`
  - `.cursor/rules/reliability-ops-audit-agent.mdc`
  - `.cursor/rules/data-integrity-audit-agent.mdc`
  - `.cursor/rules/business-valuation-audit-agent.mdc`
  - `.cursor/rules/growth-funnel-audit-agent.mdc`
  - `.cursor/rules/agent-governance-audit-agent.mdc`
  - `.cursor/rules/documentation-audit-agent.mdc`
  - `.cursor/rules/legal-compliance-audit-agent.mdc`
  - `.cursor/rules/full-audit-agent.mdc`
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

- Open a chat and treat the agent as the PM (e.g. “Start the builder or Complete tasks in tasks.md”). The PM rule will apply.
- The `beforeShellExecution` hook will gate shell commands; the `subagentStop` hook can prompt the PM to review when a builder subagent finishes.

---

## Summary for “set up my Cursor like this project”

1. Clone/pull the repo (includes `.cursor/` and `docs/`).
2. Run: `chmod +x .cursor/hooks/on-subagent-stop.sh`.
3. Open the project in Cursor; the PM rule and hooks are active.
4. Use the workflow from `docs/process/pm-agent-workflow.md` (start builder, review with `docs/process/pm-review-checklist.md`, approve/advance or pause as described).

**Code audit:** Say "run code audit" or "code audit" to trigger a codebase audit. The agent follows `docs/process/code-audit-process.md` and writes a report to `docs/audits/code/`. Review the report and create tasks in `docs/tasks.md` for any fixes you want.

**Math & Logic audit:** Say "run math audit" or "math audit" to trigger a math and logic audit. The agent follows `docs/process/math-logic-audit.md` and writes a report to `docs/audits/math/`. Review the report and create tasks in `docs/tasks.md` for any formula or edge-case fixes you want.

**Other focused audits:** You can also run feature/UX, security, performance-cost, reliability-ops, data-integrity, business-valuation, growth-funnel, and agent-governance audits with the matching "run <lane> audit" phrase shown in `docs/audits/README.md`.

**Full audit:** Say "run full audit" or "run all audits" to run all **12** audit lanes and produce a consolidated, deduplicated synthesis at `docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md`. PM reviews and promotes approved items to `docs/tasks.md`.

No API keys, no Cursor account config, and no duplicate files—just the repo and an executable hook script.
