# PM Agent Workflow — Feasibility & How It Works

This doc describes how one Cursor agent (the **PM**) keeps another agent (the **builder**) moving through project phases and gates risk on commands.

---

## What’s Feasible

| Goal | Feasible? | How |
|------|-----------|-----|
| **PM keeps builder moving through phases** | ✅ Yes | PM (this chat) reviews builder output after each phase and **resumes** the builder with “Approved, proceed to Phase N” or with feedback. A `subagentStop` hook can auto-send a follow-up so the PM is prompted to review. |
| **PM approves/declines commands by risk** | ✅ Partially | This chat **cannot** approve each shell command in real time (hooks run in a separate process). Use a **beforeShellExecution** hook with a prompt that encodes PM-style risk policy: allow low-risk (e.g. install, prisma migrate), deny high-risk (e.g. `rm -rf`, force push, prod DB), and optionally **ask** for medium-risk (e.g. network/API calls) so the **user** approves in the UI. |
| **PM uses “judgement” on risk** | ✅ Yes (at two levels) | (1) **Phase level:** PM (me) reviews what the builder did and decides approve / request changes / next phase. (2) **Command level:** A prompt-based hook acts as a “PM proxy” with a written risk policy. |

So: **phase-level** PM is you (this agent) in this chat; **command-level** PM is a hook that follows the risk policy below.

---

## How to Run It

### 1. Start the builder (from this chat or another)

- In **this** chat: say **“Start the builder at the stage the last builder left off at”** (or “Start the builder on Phase N”). I’ll read `docs/current-phase.md` to get the current phase and checklist, then launch a **subagent in this chat** with instructions to: work that phase only; aim to complete the phase in one run (if not possible, update `current-phase.md` with what’s done and what’s left, then stop); when done, update `docs/current-phase.md` and add a **Handoff** section there (or in `docs/builder-handoff.md`) with any new env vars, commands to run, or manual steps; then stop for PM review.
  - **Foreground (default):** Don’t say “background” — we’ll wait for the builder to finish, then I review using the PM review checklist and approve/advance or pause as agreed.
  - **Background:** Say **“in the background”** — I’ll run it in the background and report the agent ID and output file path; you can later say “check on the builder” or “approve and advance” and I’ll read the output and follow the checklist (and pause after Phase 3 if that’s the phase we just approved).
- In **another** chat: start the builder there; when you want PM oversight, bring the builder’s **agent ID** and **output file path** (or paste a summary) into this chat so I can “check on the builder” and resume with next phase or feedback.

### 2. After each phase

- When the builder finishes a phase, the **subagentStop** hook can send a follow-up so the PM is prompted to review.
- I (the PM) follow **`docs/pm-review-checklist.md`** every time: build, lint, tests, scope, docs/handoff, then approve or request changes.
- **Builder handoff:** The builder is instructed to add a short **Handoff** when they finish a phase (in `docs/current-phase.md` at the bottom, or in `docs/builder-handoff.md`): any new env vars, commands to run (e.g. `npm run db:migrate`), or manual steps. The PM checks this and ensures `manual-steps.md` / `.env.example` are updated if needed.
- **Pause after Phase 3:** After Phase 3 is approved, the project is **paused**. I do not resume the builder with Phase 4 unless you explicitly say to continue (e.g. “Start the builder at the stage the last builder left off at”). You can run Phase 4 when you’re ready.
- **Phase 4 (Stripe) gate:** When we reach Phase 4, I do not auto-advance to Phase 5 after approval. I report “Phase 4 ready for approval” and wait for you to explicitly approve (or run a quick smoke test) before sending the builder to Phase 5.
- **Resume (when not pausing):** Resume the builder with one message: e.g. “Approved. Proceed to Phase N — [scope].” or “Fix X and Y, then proceed to Phase N as above.”

### 3. Command-level risk (hook)

- Every shell command the builder runs is gated by **beforeShellExecution** with a **PM-style risk policy** (see `.cursor/hooks.json` and the prompt there).
- Policy summary:
  - **Allow:** read-only, `npm install`, `npx prisma migrate dev`, `npm run build`, `npm run dev`, lint/test, local dev.
  - **Deny:** `rm -rf`, `git push --force`, production DB or prod secrets, irreversible destructive commands.
  - **Ask (user approves in UI):** optional for medium-risk (e.g. `git push`, network-heavy, or first-time deploy). The hook can return `"ask"` so you approve in Cursor.

---

## Phases (from engineering-spec §8)

- **Phase 0** — Foundation (repo, auth, DB schema, app shell)
- **Phase 1** — Core Data Entry (Property CRUD, Mortgage CRUD)
- **Phase 2** — Value Creation (metrics engine, dashboard summary)
- **Phase 3** — Visualization (charts, amortization timeline)
- **Phase 4** — Monetization (Stripe, property caps)
- **Phase 5** — Polishing (onboarding, settings, error handling)

The PM uses these phases when approving and when instructing the builder (“proceed to Phase N”).

---

## Summary

- **PM (this agent):** Follows `docs/pm-review-checklist.md` every review. Keeps the builder moving through phases by approving and resuming with “proceed to Phase N” or with fixes. Uses `docs/engineering-spec.md` and `docs/manual-steps.md` as reference.
- **Builder handoff:** Builder adds a Handoff (in `current-phase.md` or `builder-handoff.md`) when done; PM ensures manual-steps and env example are updated.
- **Pause after Phase 3:** After Phase 3 is approved, the project pauses; Phase 4 starts only when you say to continue.
- **Phase 4 gate:** After Phase 4 approval, PM does not auto-advance to Phase 5; waits for your explicit approval.
- **Command risk:** Handled by the **beforeShellExecution** hook (allow/deny/ask).
- **Handoff (other chat):** When the builder runs in another chat, you bring agent ID and output here so the PM can review and resume.
