# AI Agent Governance Audit — 2026-04-09

## Executive summary

- **Lane wiring is healthy:** `docs/audits/README.md`, `docs/process/command-integrity-check.md`, `.cursor/rules/full-audit-agent.mdc`, and `docs/process/full-audit-synthesis.md` align on **14** audit lanes; each row in the command-integrity mapping points to a process file that exists, and each lane has a matching `.cursor/rules/*-audit-agent.mdc` (Mobile experience reports to `docs/audits/feature/` per documented exception).
- **Shell risk policy and the live hook stay aligned:** `docs/policies/shell-risk-policy.md` and the `beforeShellExecution` prompt in `.cursor/hooks.json` use the same ALLOW / DENY / ASK semantics and JSON response contract.
- **Top residual risks** are **guidance placement and onboarding drift** (canonical UI spec routing, Windows `subagentStop` default, incomplete “other audits” lists in setup copy, and a shorter lane-rename checklist in one doc than in the audit index)—not missing rules or broken process paths.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **Canonical UI spec vs always-on agent + PM checklist** — `docs/policies/design-spec.md` states that canonical visual and interaction rules live in `docs/design/design-spec-2026.md` first and that the 2026 spec wins on conflict. The builder rule and PM review checklist still cite `docs/policies/design-spec.md` as the sole compliance target for UI work. **Risk:** Agents under-use the 2026 spec and treat the policy file as exhaustive. **Evidence:** `docs/policies/design-spec.md` (lines 7–8); `.cursor/rules/builder-agent.mdc` (§2, References); `docs/process/pm-review-checklist.md` (design compliance bullet).

- **`subagentStop` defaults to the shell script on Windows-first setups** — `.cursor/hooks.json` invokes `.cursor/hooks/on-subagent-stop.sh` only; `on-subagent-stop.ps1` exists but is not wired. Setup docs correctly instruct switching to `.ps1` when Git Bash/WSL is unavailable. **Risk:** The post–subagent PM nudge never runs until hooks are edited. **Evidence:** `.cursor/hooks.json`; `.cursor/hooks/on-subagent-stop.sh`; `.cursor/hooks/on-subagent-stop.ps1`; `docs/setup/ai-process-workflow-setup.md` (Windows prerequisites); `docs/cursor-agent-setup.md` (hook Step 2).

- **Audit execution instructions: index vs governance rule vs governance process** — `docs/audits/README.md` states audits must run in Agent mode with writes enabled and that read-only subagents must not be used for report output. `agent-governance-audit-agent.mdc` requires launching a subagent with read-only disabled. `docs/process/agent-governance-audit-process.md` §4 says “Audit only; no code changes” but does **not** restate execution mode or the `docs/audits/` write requirement. **Risk:** Contributors treat “no code changes” as “no writes,” or assume a subagent is mandatory when the same chat may run the lane. **Evidence:** `docs/audits/README.md` (“Running audits”); `.cursor/rules/agent-governance-audit-agent.mdc` (Execution mode, step 1); `docs/process/agent-governance-audit-process.md` §3–4.

- **Onboarding summary under-lists audit lanes** — `docs/cursor-agent-setup.md` § “Other focused audits” names feature/UX, security, performance-cost, reliability-ops, data-integrity, business-valuation, growth-funnel, and agent-governance only; it omits **Mobile experience**, **SEO**, **Documentation**, and **Legal & Compliance**, which are first-class lanes in `docs/audits/README.md` and `.cursor/rules/`. **Risk:** New clones miss triggers and report locations for four lanes. **Evidence:** `docs/cursor-agent-setup.md` (summary § near end); `docs/audits/README.md` (table and single-lane list).

### Low

- **Lane rename checklist depth differs between docs** — `docs/audits/README.md` § “Lane structure contract” lists six coordinated update targets (including lane `README.md` and referenced process docs). `docs/process/command-integrity-check.md` § “Lane rename rule” lists five items and does not explicitly call out lane-level README files. **Risk:** Partial updates after a rename if only the shorter list is followed. **Evidence:** `docs/audits/README.md` (lines 25–36); `docs/process/command-integrity-check.md` (lines 5–12).

- **Report naming examples omit some lanes** — `docs/audits/README.md` “Report naming convention” examples omit `YYYY-MM-DD-agent-governance-audit.md` and the mobile experience filename pattern (`YYYY-MM-DD-mobile-experience-audit.md`). **Risk:** Minor discoverability friction only. **Evidence:** `docs/audits/README.md` (lines 72–86).

- **Shell ALLOW wording: policy vs hook** — `docs/policies/shell-risk-policy.md` lists `npm test` explicitly alongside `npm run check`; `.cursor/hooks.json` compresses this as `npm run build/dev/lint/check/test`. **Risk:** Low; `npm test` and `npm run test` resolve to the same script for this repo, but literal readers of the hook text might miss that `npm test` is allowed. **Evidence:** `docs/policies/shell-risk-policy.md` (ALLOW); `.cursor/hooks.json` (`beforeShellExecution` prompt).

- **`full-audit-agent.mdc` lane labels vs README prose** — The full-audit rule uses hyphenated tokens (e.g. Performance-Cost, Reliability-Ops) while `docs/audits/README.md` uses titles with “&”. **Risk:** None for wiring; cosmetic inconsistency only. **Evidence:** `.cursor/rules/full-audit-agent.mdc`; `docs/audits/README.md`.

## Evidence reviewed

- `docs/process/agent-governance-audit-process.md` (scope, dimensions, execution steps)
- `docs/process/audit-report-template.md` (structure requirements)
- `docs/audits/README.md` (lane table, 14-lane contract, triggers, naming)
- `docs/process/command-integrity-check.md` (lane → process → rule mapping, shell sync note)
- `docs/process/full-audit-synthesis.md` (inputs, grouping including Governance)
- `docs/process/pm-agent-workflow.md` (PM vs hook roles, shell policy pointer)
- `docs/setup/ai-process-workflow-setup.md` (files list, optional audits, verification checklist)
- `docs/cursor-agent-setup.md` (`.cursor/` inventory, setup steps, summary)
- `docs/policies/shell-risk-policy.md` (ALLOW/DENY/ASK)
- `docs/tasks.md` — not fully read; assumed active task workflow per cross-references in PM docs
- `.cursor/hooks.json`, `.cursor/hooks/on-subagent-stop.sh` (sample)
- `.cursor/rules/pm-agent.mdc`, `builder-agent.mdc`, `full-audit-agent.mdc`, `agent-governance-audit-agent.mdc`, `code-audit-agent.mdc` (sample audit rule)
- Glob/list of `.cursor/rules/*-audit-agent.mdc` (14 lane rules + `full-audit-agent.mdc`)
- `docs/process/*audit*.md` glob (process files present)
- `app/package.json` scripts (cross-check against ALLOW examples: `db:*`, `check`, `test`)

**Limits:** Did not re-read every `*-audit-agent.mdc` line-by-line; spot-checked plus mapping table. Did not execute hooks or Cursor. Did not modify `app/`.

## Risk & impact assessment

Unresolved **Medium** items mostly affect **consistency of agent behavior and onboarding**, not immediate production breakage. The design-spec split is the highest-impact governance gap: wrong or outdated UI tokens could ship if agents skip `design-spec-2026.md`. Windows hook default affects **workflow friction** (missed PM nudge) for some developers. **Low** items are documentation hygiene and literal-read edge cases.

## Recommendations (prioritized)

1. **Unify UI compliance pointers** — Update `builder-agent.mdc` and `docs/process/pm-review-checklist.md` so UI reviews explicitly require `docs/design/design-spec-2026.md` as primary, with `docs/policies/design-spec.md` for legacy/process cross-references, matching `docs/policies/design-spec.md` lines 7–8.
2. **Harden governance process text** — Add to `docs/process/agent-governance-audit-process.md` §3–4: required Agent mode, writes under `docs/audits/`, and that “no code changes” excludes application source (e.g. `app/`) but not audit markdown—mirroring `docs/audits/README.md` and `audit-report-template.md`.
3. **Refresh setup summaries** — Extend `docs/cursor-agent-setup.md` “Other focused audits” (and any parallel bullets) to list all 14 lanes or point solely to `docs/audits/README.md` as the canonical trigger list.
4. **Align lane-rename checklists** — Extend `docs/process/command-integrity-check.md` § “Lane rename rule” to match the six-item contract in `docs/audits/README.md` (including lane `README.md` where applicable).
5. **Optional Windows default** — Document in `docs/cursor-agent-setup.md` or `hooks.json` comment strategy whether Windows repos should default to `.ps1` when the team is Windows-only (trade-off vs macOS/Linux).

## Task candidates (optional)

- [ ] Point builder + PM checklist UI compliance at `docs/design/design-spec-2026.md` (primary) and policy spec (secondary).
- [ ] Amend `docs/process/agent-governance-audit-process.md` with execution mode and `docs/audits/` write requirements.
- [ ] Expand `docs/cursor-agent-setup.md` audit summary to all lanes or defer entirely to `docs/audits/README.md`.
- [ ] Sync `docs/process/command-integrity-check.md` lane-rename bullets with `docs/audits/README.md` § Lane structure contract.
- [ ] Add `npm test` (or equivalent explicit phrase) to the `beforeShellExecution` ALLOW line for parity with `shell-risk-policy.md`.

## Re-test checklist

- [ ] After doc/rule edits, grep for stale “design-spec only” UI compliance strings in `.cursor/rules/` and `docs/process/pm-review-checklist.md`.
- [ ] After hook or policy edits, compare `docs/policies/shell-risk-policy.md` and `.cursor/hooks.json` side-by-side.
- [ ] `npm run check` (when any application or config code—not just docs—is changed)

## Next trigger and cadence

- **Trigger:** Monthly per `docs/audits/README.md`, or whenever `.cursor/rules`, hooks, or PM/builder/audit process docs change materially.
- **Recommended next run window:** 2026-05-09 (monthly) or before the next full-audit synthesis if governance files change sooner.
