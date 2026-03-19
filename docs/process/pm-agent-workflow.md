# PM Agent Workflow — Feasibility & How It Works

This doc describes how one Cursor agent (the **PM**) keeps another agent (the **builder**) moving through project phases and gates risk on commands.

---

## What's Feasible

| Goal | Feasible? | How |
|------|-----------|-----|
| **PM keeps builder moving through phases** | Yes | PM (this chat) reviews builder output after each phase and **resumes** the builder with "Approved, proceed to Phase N" or with feedback. A `subagentStop` hook can auto-send a follow-up so the PM is prompted to review. |
| **PM approves/declines commands by risk** | Partially | This chat **cannot** approve each shell command in real time (hooks run in a separate process). Use a **beforeShellExecution** hook with a prompt that encodes PM-style risk policy: allow low-risk (e.g. install, prisma migrate), deny high-risk (e.g. `rm -rf`, force push, prod DB), and optionally **ask** for medium-risk (e.g. network/API calls) so the **user** approves in the UI. |
| **PM uses "judgement" on risk** | Yes (at two levels) | (1) **Phase level:** PM (me) reviews what the builder did and decides approve / request changes / next phase. (2) **Command level:** A prompt-based hook acts as a "PM proxy" with a written risk policy. |

So: **phase-level** PM is you (this agent) in this chat; **command-level** PM is a hook that follows the risk policy below.

---

## How to Run It

### 1. Start the builder (from this chat or another)

- In **this** chat: say **"Start the builder"** or **"Complete tasks in tasks.md"** (or "Start the builder on Phase N"). I'll read `docs/tasks.md` to get the current tasks, then launch a **subagent in this chat** with instructions to: work those tasks; update `docs/tasks.md` when done (check off completed items); add any new env vars to `app/.env.example` and manual steps to `docs/setup/manual-steps.md`; then stop for PM review.
  - **Foreground (default):** Don't say "background" — we'll wait for the builder to finish, then I review using the PM review checklist and approve/advance or pause as agreed.
  - **Background:** Say **"in the background"** — I'll run it in the background and report the agent ID and output file path; you can later say "check on the builder" or "approve and advance" and I'll read the output and follow the checklist.
- In **another** chat: start the builder there; when you want PM oversight, bring the builder's **agent ID** and **output file path** (or paste a summary) into this chat so I can "check on the builder" and resume with next phase or feedback.

### 2. After each phase

- When the builder finishes a phase, the **subagentStop** hook can send a follow-up so the PM is prompted to review.
- I (the PM) follow **`docs/process/pm-review-checklist.md`** every time: build, lint (errors must be cleaned up before approval; ignore Prisma schema URL), tests, scope, **design compliance** (for UI phases; see checklist), docs/handoff, then approve or request changes.
- **Tests & CI:** What the suite proves (and what it does not) is summarized in [`docs/qa/test-infrastructure-review.md`](../qa/test-infrastructure-review.md). Planned hardening and follow-up work lives in [`docs/tasks.md`](../tasks.md) under **Active tasks → Test infrastructure follow-up** (Phase 1 & 2).
- For major risk-bearing changes, run or verify required focused audits per `docs/audits/README.md` before final approval.
- **Builder handoff:** The builder adds new env vars to `app/.env.example` and manual steps to `docs/setup/manual-steps.md` when done. The PM checks this during review.
- **Resume:** Resume the builder with one message: e.g. "Approved. Proceed to Phase N — [scope]." or "Fix X and Y, then proceed to Phase N as above."

### 3. Command-level risk (hook)

- Every shell command the builder runs is gated by **beforeShellExecution** with a **PM-style risk policy** (see `docs/policies/shell-risk-policy.md` and `.cursor/hooks.json`).
- Policy summary:
  - **Allow:** read-only, `npm install`, `npx prisma migrate dev`, `npm run build`, `npm run dev`, `npm run check`, lint/test, local dev.
  - **Deny:** `rm -rf`, `git push --force`, production DB or prod secrets, irreversible destructive commands.
  - **Ask (user approves in UI):** first-time `git push`, deploy-like commands. The hook returns `{"ask": true, "reason": "..."}` so you approve in Cursor.

---

### 4. Builder crashed or stopped unexpectedly

- Read `docs/tasks.md` to see what's done vs. remaining.
- If the builder updated it before stopping, use that as the source of truth. If not, infer from recent changes or ask the user.
- Decide whether to resume (launch a new builder with "continue from where the last builder left off") or start fresh.

---

## Phases (from engineering-spec §8)

- **Phase 0** — Foundation (repo, auth, DB schema, app shell)
- **Phase 1** — Core Data Entry (Property CRUD, Mortgage CRUD)
- **Phase 2** — Value Creation (metrics engine, dashboard summary)
- **Phase 3** — Visualization (charts, amortization timeline)
- **Phase 4** — Monetization (Stripe, property caps)
- **Phase 5** — Polishing (onboarding, settings, error handling)

The PM uses these phases when approving and when instructing the builder ("proceed to Phase N").

---

## Summary

- **PM (this agent):** Follows `docs/process/pm-review-checklist.md` every review. Keeps the builder moving through phases by approving and resuming with "proceed to Phase N" or with fixes. Uses `docs/reference/engineering-spec.md`, `docs/policies/design-spec.md`, and `docs/setup/manual-steps.md` as reference. Design compliance is part of PM approval for UI work.
- **Builder handoff:** Builder adds env vars and manual steps to `app/.env.example` and `docs/setup/manual-steps.md` when done; PM ensures they're complete during review.
- **Command risk:** Handled by the **beforeShellExecution** hook (allow/deny/ask).
- **Handoff (other chat):** When the builder runs in another chat, you bring agent ID and output here so the PM can review and resume.
