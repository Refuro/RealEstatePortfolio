# AI-Assisted Development Process — Extraction Guide

**Purpose:** This document captures the process used to build Veld Portfolio. Use it to replicate the same efficient AI-driven workflow on future projects.

**Status:** Reference — extract and adapt for new projects.

---

## 1. Overview

The process relies on:

1. **Central docs** — Single source of truth for product, design, architecture, and tasks
2. **Agent roles** — PM agent (oversight) and Builder agent (implementation)
3. **Task-driven workflow** — Clear tasks in `tasks.md`; builder checks off as it goes
4. **Manual-step boundary** — Docs explicitly list what humans do vs. what agents do
5. **Design spec compliance** — All UI work references a design spec; no ad-hoc styling

**Result:** A production-ready SaaS (auth, billing, core features, mobile-responsive).

---

## 2. Doc Structure (Create These First)

Set up these docs **before** heavy building. They are the AI's primary context.

| Doc | Purpose | When to Create |
|-----|---------|----------------|
| **mvp-spec.md** | Product vision, target users, core problems, scope (in/out) | Day 0 |
| **engineering-spec.md** | Tech stack, domain model, API design, phased build order | Day 0 |
| **design-spec.md** | Typography, colors, spacing, component patterns | Day 0 |
| **architecture-and-build-practices.md** | Patterns, security checklist, anti-spaghetti rules | Day 0 |
| **tasks.md** | Current work; builder checks off items | Day 0 |
| **roadmap.md** | Backlog; PM promotes to tasks when ready | Day 0 |
| **manual-steps.md** | Steps humans do (Vercel, Clerk, Stripe, etc.) | Day 0 |
| **pm-review-checklist.md** | Checklist PM runs before approving phases | Day 0 |
| **pm-agent-workflow.md** | How to start builder, phase flow, risk gating | Day 0 |
| **run-and-smoke-test.md** | How to run, what needs env vars, smoke test | Day 1 |
| **.env.example** | All env vars with placeholders | As needed |

**Key principle:** The more complete and consistent these docs are, the less the AI guesses. Write them once; reference forever.

---

## 3. Cursor Agent Rules

Create `.cursor/rules/` with:

### pm-agent.mdc

- **Role:** Project manager — keeps builder moving, gates risk, approves phases
- **References:** `tasks.md`, `roadmap.md`, `pm-review-checklist.md`, `engineering-spec.md`, `manual-steps.md`
- **Behavior:** On "Start the builder" or "Complete tasks in tasks.md", launch subagent with task list; after builder stops, run review checklist; approve or request changes; resume with next phase or feedback

### builder-agent.mdc

- **Role:** Implementer — stays in scope, follows design spec, updates docs
- **References:** `tasks.md`, `roadmap.md`, `design-spec.md`, `architecture-and-build-practices.md`, `manual-steps.md`
- **Behavior:** Work only from tasks; follow design spec for UI; add env vars to `.env.example` and manual steps to `manual-steps.md`; never do manual steps; run `npm run check` before stopping

**Critical:** Both rules use `alwaysApply: true` so they're active in any chat.

---

## 4. Hooks (Optional but Recommended)

### beforeShellExecution

- **Purpose:** Gate risky shell commands (deny `rm -rf`, force push, prod DB access)
- **Policy:** Allow install, migrate, build, lint; deny destructive; ask for first-time push
- **File:** `.cursor/hooks.json` + policy in `docs/policies/shell-risk-policy.md`

### subagentStop

- **Purpose:** When builder subagent finishes, prompt PM to review
- **File:** `.cursor/hooks/on-subagent-stop.sh` (or `.ps1` for Windows)

---

## 5. Workflow (How to Run It)

### Starting a new project

1. Create the doc structure above (mvp-spec, engineering-spec, design-spec, etc.)
2. Fill in product vision, scope, tech stack, domain model
3. Define phases in engineering-spec (e.g., Phase 0 Foundation → Phase 5 Polishing)
4. Add initial tasks to `tasks.md` for Phase 0
5. Create `.cursor/rules/pm-agent.mdc` and `builder-agent.mdc`
6. Say: **"Start the builder"** or **"Complete tasks in tasks.md"**

### During development

- **Builder** works through `tasks.md`, checks off items, adds env vars and manual steps
- **PM** (or you) reviews after each phase using `pm-review-checklist.md`
- **Resume** builder with "Approved, proceed to Phase N" or "Fix X, then proceed"
- **Roadmap** holds future work; promote to `tasks.md` when ready

### Manual steps

- Builder **never** creates Vercel projects, Clerk apps, Stripe products, or production DBs
- Document these in `manual-steps.md`; you do them yourself
- Builder adds new manual steps when it adds features that require them

---

## 6. What Makes This Process Efficient

| Factor | Why It Matters |
|--------|----------------|
| **Single source of truth** | AI reads one doc per concern; no conflicting instructions |
| **Explicit scope** | tasks.md + roadmap = no scope creep; builder stays focused |
| **Design spec** | UI consistency without back-and-forth; "follow design-spec" is unambiguous |
| **Manual-step boundary** | Builder doesn't try to do things it can't (Vercel, Stripe Dashboard) |
| **Phased build order** | Foundation → Core → Value → Monetization → Polish; logical dependency order |
| **Checklist before approval** | PM runs build, lint, scope check; catches issues before advancing |
| **Context-specific checklists** | New service? Update Privacy/Terms. New page? Add to proxy, SEO. Architecture doc §6.3 |

---

## 7. Files to Copy for a New Project

### Minimum (to get started)

```
docs/
├── mvp-spec.md                    # Adapt for new product
├── engineering-spec.md            # Adapt stack, domain, phases
├── design-spec.md                 # Adapt colors, typography
├── architecture-and-build-practices.md  # Mostly reusable
├── tasks.md                       # Start with Phase 0 tasks
├── roadmap.md                     # Start empty or with backlog
├── manual-steps.md                # Adapt for your services
├── pm-review-checklist.md         # Reusable
├── pm-agent-workflow.md           # Reusable
└── run-and-smoke-test.md         # Adapt for your app

.cursor/
├── rules/
│   ├── pm-agent.mdc              # Update doc paths if different
│   └── builder-agent.mdc        # Update doc paths if different
└── hooks/
    ├── on-subagent-stop.sh
    └── on-subagent-stop.ps1     # Windows
```

### Optional

- `docs/policies/shell-risk-policy.md` — If using beforeShellExecution hook
- `docs/cursor-agent-setup.md` — Setup guide for collaborators
- `docs/code-audit-process.md` — If you want code audit capability

---

## 8. Adapting for a Different Product

1. **mvp-spec.md** — Rewrite vision, users, problems, scope for new product
2. **engineering-spec.md** — Adjust tech stack, domain model, phases
3. **design-spec.md** — New brand colors, typography, component patterns
4. **manual-steps.md** — List services you'll use (auth, payments, hosting)
5. **tasks.md** — Phase 0 tasks for new project (repo, auth, DB, app shell)
6. **.env.example** — Env vars for your stack

The **architecture-and-build-practices.md**, **pm-agent-workflow.md**, and **pm-review-checklist.md** are largely product-agnostic and can be copied with minimal edits.

---

## 9. Lessons from Veld Portfolio

- **Docs first:** Spending 1–2 hours on specs before coding saved days of rework
- **Task granularity:** Small, checkable tasks (e.g., "Add Dashboard link to LandingNav when userId present") work better than vague ones
- **Design spec pays off:** "Follow design-spec" eliminated style debates; AI had clear rules
- **Manual steps doc:** Kept builder from attempting impossible tasks (creating Stripe products, etc.)
- **Roadmap vs. tasks:** Roadmap = backlog; tasks = current work. PM promotes when ready. Clean separation.

---

## 10. Quick Start for New Project

1. Create repo with `app/` (or your app folder)
2. Copy this doc structure and the `.cursor/` rules
3. Write mvp-spec, engineering-spec, design-spec (even if brief)
4. Add Phase 0 tasks to tasks.md
5. Open in Cursor; say "Complete tasks in tasks.md"
6. Review, approve, advance phases as builder completes them

---

*Extracted from the Veld Portfolio build (2025). Adapt and reuse.*
