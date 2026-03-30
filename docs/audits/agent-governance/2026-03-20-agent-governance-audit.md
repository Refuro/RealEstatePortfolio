# AI Agent Governance Audit — 2026-03-20

## Executive summary

- **Overall:** The repo has a coherent **PM + builder** rule pair (`pm-agent.mdc`, `builder-agent.mdc`), **10 audit lane rules** under `.cursor/rules/*-audit-agent.mdc` plus `full-audit-agent.mdc`, and a **`beforeShellExecution` prompt hook** wired in `.cursor/hooks.json` that points at `docs/policies/shell-risk-policy.md`. Reference paths in sampled rules match real files under `docs/`.
- **Top risk:** **Policy drift** — the canonical shell policy’s **ASK** rules are **not fully encoded** in the hook prompt (notably **network / side-effect commands**), while `docs/process/pm-agent-workflow.md` still describes broader “ask” behavior than the hook text.
- **Secondary risk:** **`subagentStop` uses the Bash script** by default; on **Windows** hosts without a Bash runner, the follow-up PM nudge may not run unless `hooks.json` is switched to `.cursor/hooks/on-subagent-stop.ps1` (documented in `docs/cursor-agent-setup.md`).
- **Recommendation:** Re-sync **hook prompt**, **`shell-risk-policy.md`**, and **PM workflow** text; tighten **`full-audit-agent.mdc`** report naming so full-audit runs cannot emit wrong filenames.

## Severity-ranked findings

### Critical

- *(none)* — No missing canonical policy file, no evidence that core rule files reference non-existent process docs for the governance lane itself.

### High

- **Shell policy ↔ hook prompt drift (ASK scope)** — `docs/policies/shell-risk-policy.md` requires **`{"ask": true}`** for **first-time `git push`**, **deploy-like commands**, and **“Network-heavy or external API calls that could have side effects.”** The **`beforeShellExecution`** prompt in `.cursor/hooks.json` lists ALLOW/DENY and ASK only for **first-time push** and **deploy-like** commands; it does **not** mention network/side-effect commands. **Impact:** Contributors and PM workflow docs may assume broader gating than the hook actually instructs the model to apply. **Evidence:** `docs/policies/shell-risk-policy.md` (§ ASK); `.cursor/hooks.json` (`beforeShellExecution` prompt text).

- **PM workflow doc overstates hook coverage vs implementation** — `docs/process/pm-agent-workflow.md` states the hook can **“optionally ask for medium-risk (e.g. network/API calls).”** The current `.cursor/hooks.json` prompt does not encode that ASK case. **Impact:** Process documentation misrepresents actual controls. **Evidence:** `docs/process/pm-agent-workflow.md` (§ What’s Feasible / Command-level risk); `.cursor/hooks.json`.

### Medium

- **`full-audit-agent.mdc` report path template is ambiguous** — The rule says each report goes to `docs/audits/<lane>/YYYY-MM-DD-<lane>-audit.md`. Lane folders use **stable folder names**, but **report stems differ** per lane (e.g. `feature-ux`, `math-logic`, `business-valuation`, `agent-governance`), as fixed in each lane rule and `docs/audits/README.md`. A literal reading of `<lane>` could produce **wrong filenames** during a full audit. **Evidence:** `.cursor/rules/full-audit-agent.mdc`; compare `.cursor/rules/feature-audit-agent.mdc`, `.cursor/rules/math-audit-agent.mdc`, `docs/audits/README.md` (report naming).

- **`full-audit-synthesis.md` optional 9-lane run conflicts with “all lanes” contract** — §6 says to run **“all 10 lane processes (or 9 if Code is skipped when unchanged).”** Elsewhere (`docs/audits/README.md`, `full-audit-agent.mdc`) the **full audit** is defined as **10 lanes**. **Impact:** Ambiguous trigger for synthesis inputs and PM expectations. **Evidence:** `docs/process/full-audit-synthesis.md` §6; `docs/audits/README.md`; `.cursor/rules/full-audit-agent.mdc`.

- **`subagentStop` defaults to Bash on a Windows-heavy setup** — `.cursor/hooks.json` runs `.cursor/hooks/on-subagent-stop.sh`. `docs/cursor-agent-setup.md` documents switching to `on-subagent-stop.ps1` when Bash is unavailable. **Impact:** **Degraded workflow** (no automatic “PM: review…” follow-up) rather than blocked dev work. **Evidence:** `.cursor/hooks.json`; `docs/cursor-agent-setup.md` (Step 2 / hooks table).

### Low

- **Prompt-based shell gate is not deterministic enforcement** — `beforeShellExecution` relies on an LLM following a prompt; misclassification remains possible regardless of text parity. Worth treating as a **known limitation** when assessing safety. **Evidence:** `.cursor/hooks.json` (`type`: `prompt`).

- **`docs/cursor-agent-setup.md` is a manual inventory** — It lists rules and docs; when adding a new audit lane or hook, the table can **drift** unless updated (no automated check referenced beyond `docs/process/command-integrity-check.md` for audit rules). **Evidence:** `docs/cursor-agent-setup.md`; `docs/process/command-integrity-check.md`.

## Evidence reviewed

- **Rules:** `.cursor/rules/pm-agent.mdc`, `builder-agent.mdc`, `full-audit-agent.mdc`, `agent-governance-audit-agent.mdc`, and all `*-audit-agent.mdc` files (16 files under `.cursor/rules/`).
- **Hooks:** `.cursor/hooks.json`, `.cursor/hooks/on-subagent-stop.sh`, `.cursor/hooks/on-subagent-stop.ps1`.
- **Policies & AI process docs:** `docs/policies/shell-risk-policy.md`, `docs/cursor-agent-setup.md`, `docs/process/agent-governance-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/full-audit-synthesis.md`, `docs/process/pm-agent-workflow.md`.
- **Audit index:** `docs/audits/README.md`, `docs/audits/agent-governance/README.md`.
- **Spot-check paths** referenced by PM/builder rules: `docs/reference/engineering-spec.md` (exists).
- **Scripts surface:** `app/package.json` (scripts align with ALLOW list in policy/hook for `npm run check`, `db:*`, etc.).

## Risk & impact assessment

- **Unresolved High findings** weaken **trust in governance**: the team may believe network/side-effect commands are ASK-gated when the hook prompt does not require it; mis-implementation risk rises for destructive or billable CLI usage.
- **Medium findings** affect **consistency of full-audit outputs** and **Windows developer experience** (PM nudge reliability), not core app runtime.
- **Likelihood:** Policy/hook drift is **likely** to recur without a periodic governance audit or explicit “edit both files” habit.

## Recommendations (prioritized)

1. **Align the three shell surfaces:** Update `.cursor/hooks.json` **beforeShellExecution** prompt so ASK cases match `docs/policies/shell-risk-policy.md` (at minimum: add explicit ASK language for network / side-effect external commands, or narrow the policy doc to match the hook—pick one source of truth).
2. **Edit `docs/process/pm-agent-workflow.md`** so its description of hook behavior matches the actual prompt (after step 1).
3. **Replace the generic filename line in `full-audit-agent.mdc`** with an explicit list of per-lane report filenames (or “follow each lane rule’s required filename”) to match `docs/audits/README.md`.
4. **Resolve the “9 vs 10 lanes” sentence** in `docs/process/full-audit-synthesis.md` §6 so full-audit semantics are single-valued.
5. **Windows default:** If the team is primarily on Windows without Git Bash, consider documenting or standardizing `subagentStop` on `on-subagent-stop.ps1` for this repo.

## Task candidates

- [ ] Update `.cursor/hooks.json` beforeShellExecution prompt to include ASK guidance for network-heavy / side-effect external commands per `docs/policies/shell-risk-policy.md`, then re-read both for parity.
- [ ] Update `docs/process/pm-agent-workflow.md` to reflect the actual hook ASK list (after hook update).
- [ ] Amend `.cursor/rules/full-audit-agent.mdc` to specify exact report filenames or defer explicitly to each lane rule + `docs/audits/README.md`.
- [ ] Clarify `docs/process/full-audit-synthesis.md` §6 regarding whether Code may be skipped in a “full” run and how synthesis should behave.

## Re-test checklist

- [ ] Re-run this governance audit after hook/policy edits and confirm no ASK/ALLOW/DENY drift between `docs/policies/shell-risk-policy.md` and `.cursor/hooks.json`.
- [ ] On a Windows machine, verify `subagentStop` runs (Bash or PS1) and emits `followup_message` when a subagent completes.
- [ ] `npm run check` (when code or config files are changed as part of follow-up work)

## Next trigger and cadence

- **Trigger:** After changes to `.cursor/rules/`, `.cursor/hooks.json`, or AI workflow docs; monthly per `docs/audits/README.md`.
- **Recommended next run:** Within one month of any shell-policy or hook edit, or **2026-04-20** if no changes.
