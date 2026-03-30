# AI Agent Governance Audit — 2026-03-28

## Executive summary

- **Overall:** The repo has a coherent **PM + builder** rule pair (`alwaysApply: true`), **Husky** pre-commit/pre-push running `npm run lint` and `npm run test` from `app/`, and **project-level hooks** (`subagentStop`, `beforeShellExecution`) wired in `.cursor/hooks.json`. **Ten audit lanes** plus **full-audit synthesis** are documented in `docs/audits/README.md` with matching process files under `docs/process/` and rule files under `.cursor/rules/*-audit-agent.mdc`.
- **Top risk:** **Policy drift** — `docs/policies/shell-risk-policy.md` defines a broader **ASK** category (including network-heavy / external API side effects) than the **beforeShellExecution** hook prompt encodes; the hook is the operational control, so the written policy overstates what the hook enforces.
- **Secondary risks:** **Dual maintenance** across full-audit surfaces (rules + synthesis + README); **inconsistent depth** of instructions across audit lane rules (some launch detailed subagent prompts, others minimal).
- **Recommendation:** Sync the hook prompt (and PM workflow bullets that summarize command risk) with the canonical shell policy, and treat `docs/process/command-integrity-check.md` as the release companion when changing rules or lane paths.

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none)*

### Medium

- **Shell ASK policy vs hook prompt mismatch** — `docs/policies/shell-risk-policy.md` lists under ASK: “Network-heavy or external API calls that could have side effects.” The `beforeShellExecution` prompt in `.cursor/hooks.json` only mentions first-time `git push` and deploy-like commands (`vercel deploy`, `vercel --prod`). Risk: contributors assume the policy doc is fully enforced by the hook; side-effecting network commands may be allowed without an explicit ask path. — `docs/policies/shell-risk-policy.md`, `.cursor/hooks.json`
- **Dual maintenance for full-audit** — Lane count, report folder names, and synthesis behavior are stated in `.cursor/rules/full-audit-agent.mdc`, `docs/process/full-audit-synthesis.md`, and `docs/audits/README.md`. Changes to lanes or paths require coordinated edits. — `.cursor/rules/full-audit-agent.mdc`, `docs/process/full-audit-synthesis.md`, `docs/audits/README.md`

### Low

- **Thin vs rich audit rules** — `code-audit-agent.mdc` and `math-audit-agent.mdc` specify detailed subagent prompts and scope; `agent-governance-audit-agent.mdc` and `security-audit-agent.mdc` only reference process path and output path. Risk: uneven audit depth unless the user or parent agent expands the prompt. — `.cursor/rules/code-audit-agent.mdc`, `.cursor/rules/math-audit-agent.mdc`, `.cursor/rules/agent-governance-audit-agent.mdc`, `.cursor/rules/security-audit-agent.mdc`
- **PM workflow summary narrows ASK vs policy** — `docs/process/pm-agent-workflow.md` §3 lists ASK as first-time `git push` and deploy-like commands only, aligning with the current hook but not with the fuller `shell-risk-policy.md` ASK list. — `docs/process/pm-agent-workflow.md`, `docs/policies/shell-risk-policy.md`
- **No `AGENTS.md` / single AI entrypoint** — Onboarding relies on `docs/cursor-agent-setup.md` and scattered rules; there is no repo-root `AGENTS.md` (optional improvement noted in prior governance audit). — repo root, `docs/cursor-agent-setup.md`
- **Report naming pattern variance** — `full-audit-synthesis.md` uses `docs/audits/<lane>/YYYY-MM-DD-*-audit.md`; lane folders and filenames vary (e.g. `math-logic-audit.md`, `agent-governance-audit.md`). The `full-audit-agent.mdc` phrase `YYYY-MM-DD-<lane>-audit.md` is a loose shorthand. Low risk if synthesis uses glob on date. — `docs/process/full-audit-synthesis.md`, `.cursor/rules/full-audit-agent.mdc`
- **Command integrity check is manual** — `docs/process/command-integrity-check.md` is explicit quarterly/manual; no automated guard. Acceptable for a docs-first workflow. — `docs/process/command-integrity-check.md`

## Evidence reviewed

- `.cursor/rules/` — `pm-agent.mdc`, `builder-agent.mdc`, `full-audit-agent.mdc`, `agent-governance-audit-agent.mdc`, `code-audit-agent.mdc`, `math-audit-agent.mdc`, `security-audit-agent.mdc` (sample of thin rules)
- `.cursor/hooks.json`, `.cursor/hooks/on-subagent-stop.sh`
- `docs/policies/shell-risk-policy.md`, `docs/cursor-agent-setup.md`, `docs/process/agent-governance-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/pm-agent-workflow.md`, `docs/process/pm-review-checklist.md`, `docs/process/full-audit-synthesis.md`
- `docs/audits/README.md`, `docs/audits/agent-governance/README.md`
- `package.json` (root Husky), `.husky/pre-commit`, `.husky/pre-push`
- Prior report: `docs/audits/agent-governance/2026-03-20-agent-governance-audit.md` (continuity)
- Existence of process files for all lanes in `docs/process/*audit*.md` (including `math-logic-audit.md`)

**Assumptions / limits:** Did not execute Cursor hooks or verify `on-subagent-stop.sh` executable bit in git. Did not review application runtime security beyond governance surfaces. No code or config changes were made.

## Risk & impact assessment

Unresolved **policy vs hook** drift mainly affects **trust and consistency**: humans and agents may follow the markdown policy while the hook implements a narrower ASK set. Impact is **moderate** (depends on how often agents run non-allowlisted shell with side effects). **Dual maintenance** raises the chance of a broken full-audit instruction after a rename; impact is **low** until someone runs a full audit. **Operational safety** overall is **good**: deny rules for destructive operations, Husky quality gates, scoped PM/builder docs.

## Recommendations (prioritized)

1. **Align enforcement with policy** — Update `.cursor/hooks.json` `beforeShellExecution` prompt to include the ASK cases from `docs/policies/shell-risk-policy.md` (at minimum network-heavy / external API side effects), or narrow the policy doc to match the hook if the team intentionally wants a slimmer ASK set.
2. **Align PM workflow copy** — After (1), update `docs/process/pm-agent-workflow.md` §3 so its ASK summary matches the hook and policy.
3. **On lane changes** — Edit `full-audit-agent.mdc`, `full-audit-synthesis.md`, `docs/audits/README.md`, and `docs/process/command-integrity-check.md` table in one pass when adding or renaming a lane.
4. **Optional ergonomics** — Add a short “scope bullets” block to thin audit rules (governance, security) mirroring the pattern in `code-audit-agent.mdc` so single-lane runs are more consistent.

## Task candidates (optional)

- [ ] Sync `beforeShellExecution` prompt in `.cursor/hooks.json` with `docs/policies/shell-risk-policy.md` ASK list (network/API side effects).
- [ ] Update `docs/process/pm-agent-workflow.md` command-risk bullets to match the chosen ASK set.
- [ ] When convenient, add `AGENTS.md` at repo root (or a single pointer in `docs/README.md`) linking to `docs/cursor-agent-setup.md` and `docs/audits/README.md`.
- [ ] Optionally extend `agent-governance-audit-agent.mdc` / `security-audit-agent.mdc` with explicit subagent prompt sections (dimensions to cover) for parity with code/math rules.

## Re-test checklist

- [ ] After hook/policy edits: run a representative shell command from each ASK category and confirm Cursor prompts as expected.
- [ ] After doc edits: `grep` hook prompt against `shell-risk-policy.md` ASK/ALLOW/DENY lists.
- [ ] `npm run check` in `app/` when any code or hook-adjacent tooling changes (this audit did not change code).

## Next trigger and cadence

- **Trigger:** Changes to `.cursor/rules`, `.cursor/hooks.json`, `docs/policies/shell-risk-policy.md`, or PM/builder workflow docs; monthly otherwise per `docs/audits/README.md`.
- **Recommended next run window:** 2026-04-28 or after any hooks/rules refactor.
