# AI Agent Governance Audit — 2026-05-01

## Executive summary

- **Lane wiring looks healthy:** `docs/audits/README.md`, `docs/process/full-audit-synthesis.md`, and `.cursor/rules/full-audit-agent.mdc` all describe **14** audit lanes with matching process files under `docs/process/` and **14** `*-audit-agent.mdc` rule files plus `full-audit-agent.mdc`; `docs/process/command-integrity-check.md` lane → process → rule mapping matches live paths on review.
- **Shell policy and hook gate are aligned on paper:** `.cursor/hooks.json` `beforeShellExecution` prompt cites `docs/policies/shell-risk-policy.md` and enumerates ALLOW / DENY / ASK consistently with that policy; `.cursor/hooks/on-subagent-stop.sh` and `on-subagent-stop.ps1` exist for `subagentStop`.
- **Top governance gap unchanged:** **`app/.agents/`** (product context + multiple `skills/` trees) is an active agent-guidance surface but is **not** in `docs/process/agent-governance-audit-process.md` § Scope, and **`app/.agents/skills/`** is still not described in `docs/cursor-agent-setup.md` or `docs/setup/ai-process-workflow-setup.md` (only workspace `RealEstateProject/.cursor/skills/` is). Builder rule references `app/.agents/product-marketing-context.md` only — not the skill library.
- **Prior doc drift (partial audit list in setup) appears resolved:** `docs/cursor-agent-setup.md` now defers the full lane list to `docs/audits/README.md` instead of echoing an incomplete subset.

## Severity-ranked findings

### Critical

- None identified in this pass (no missing hook files, no detected path breakage for core audit commands, no shell-policy / hook category mismatch).

### High

- None identified. The `app/.agents/` documentation gap is a **process and discoverability** risk, not an immediate production or secrets-exposure failure mode from this review alone.

### Medium

- **Governance process scope omits `app/.agents/`** — `docs/process/agent-governance-audit-process.md` lists `.cursor/rules/*`, hooks, and several `docs/` references but does not require reviewing **`app/.agents/product-marketing-context.md`** or **`app/.agents/skills/*`** for drift vs policies and rules. That leaves marketing/CRO skill content and eval metadata outside the written audit contract, so recurring governance runs can miss contradictions with `docs/policies/*` or duplicated guidance in `.cursor/rules`. — *Evidence:* `docs/process/agent-governance-audit-process.md` § Scope; presence of `app/.agents/product-marketing-context.md` and `app/.agents/skills/*/SKILL.md` (e.g. `copywriting`, `neon-postgres`, `competitor-alternatives`, etc.).*

- **`app/.agents/skills/` undocumented in primary setup docs** — `docs/cursor-agent-setup.md` and `docs/setup/ai-process-workflow-setup.md` explain workspace-level Veld skills under `RealEstateProject/.cursor/skills/` but do not explain what **`app/.agents/skills/`** is for, when builders should load it, or how it differs from workspace skills. The inventory has **grown** (includes e.g. `neon-postgres` alongside CRO-oriented skills). Without an explicit contract, contributors may assume skills are auto-discovered when they are not in the same tree as `.cursor/skills`. — *Evidence:* `docs/cursor-agent-setup.md` (workspace skills note; no `app/.agents/skills/`); `app/.agents/skills/` directory layout; `docs/process/AVAILABLE_AGENTS.md` (indexes `.cursor/rules`, mentions workspace skills only).*

### Low

- **Lane display-name variance across tables** — `docs/process/command-integrity-check.md` and `docs/process/AVAILABLE_AGENTS.md` use shorter labels (e.g. “Reliability & Ops”, “Growth funnel”, “Data integrity”) while `docs/audits/README.md` uses fuller names (“Reliability & Operations”, “Growth Funnel & Activation”, “Data Integrity & Reconciliation”). File paths and rule slugs match; this is **naming consistency** only. — *Evidence:* side-by-side read of those three files.*

- **Builder references only one `app/.agents/` file** — `.cursor/rules/builder-agent.mdc` references **`app/.agents/product-marketing-context.md`** but not **`app/.agents/skills/`**, so builders are not rule-nudged to use CRO/product skills bundled in-repo unless a plan or human says so. — *Evidence:* `builder-agent.mdc` grep for `.agents`; `app/.agents/skills/` inventory.*

## Evidence reviewed

- `docs/process/agent-governance-audit-process.md`
- `docs/process/command-integrity-check.md`
- `docs/audits/README.md`
- `.cursor/rules/` — inventory of **17** `.mdc` files (**14** `*-audit-agent`, plus `full-audit-agent`, `pm-agent`, `builder-agent`)
- `.cursor/rules/full-audit-agent.mdc`, `.cursor/rules/agent-governance-audit-agent.mdc` — path and lane-count references
- Grep-backed process paths in `*-audit-agent.mdc` → `docs/process/*`
- `.cursor/hooks.json`, `.cursor/hooks/on-subagent-stop.sh`, `.cursor/hooks/on-subagent-stop.ps1`
- `docs/policies/shell-risk-policy.md`
- `docs/cursor-agent-setup.md`, `docs/setup/ai-process-workflow-setup.md` (skills / audit sections), `docs/process/AVAILABLE_AGENTS.md`
- `app/.agents/` — `product-marketing-context.md`; `skills/*` subdirectory names (**no** deep read of SKILL bodies; inventory only — audit-only constraint on application source)

## Risk & impact assessment

Unresolved **Medium** items mainly affect **consistency** and **review completeness**: agent outputs on marketing surfaces may drift from centralized product context if `app/.agents/` changes are not swept by the same cadence as `.cursor/rules` and `docs/`. Exposure is gradual (wrong copy, duplicated instructions, wasted agent context), not acute security by itself. **Low** items are bookkeeping and discoverability noise for humans reading multiple indexes.

## Recommendations (prioritized)

1. **Extend governance scope** — Add `app/.agents/` (at least `product-marketing-context.md` and `skills/` inventory checks) to `docs/process/agent-governance-audit-process.md` § Scope, with one line on cross-checking against marketing/analytics/policy docs where relevant.

2. **Document the two skill locations** — In `docs/cursor-agent-setup.md` (and/or `docs/setup/ai-process-workflow-setup.md`), add a short subsection: workspace `RealEstateProject/.cursor/skills/` (Veld UI / mobile / landing) vs `app/.agents/skills/` (product/CRO/Neon/etc.), plus when builders should attach which.

3. **Optional index update** — Add a sentence to `docs/process/AVAILABLE_AGENTS.md` pointing at `app/.agents/` for repo-local agent skills/context so the “rules map” does not imply `.cursor/rules` + workspace-only.

4. **Optional naming normalization** — Align lane labels in `command-integrity-check.md` / `AVAILABLE_AGENTS.md` with `docs/audits/README.md` where it reduces skim friction (paths unchanged).

## Task candidates

- [ ] Update `docs/process/agent-governance-audit-process.md` § Scope to include `app/.agents/` (product context + `skills/`) and expected cross-checks vs `docs/policies/*` / builder rule.
- [ ] Add `app/.agents/skills/` (and distinction from workspace `.cursor/skills/`) to `docs/cursor-agent-setup.md` and/or `docs/setup/ai-process-workflow-setup.md`.
- [ ] Add an `app/.agents/` pointer to `docs/process/AVAILABLE_AGENTS.md` (non-.cursor agent assets).
- [ ] Normalize abbreviated lane labels in `docs/process/command-integrity-check.md` and `docs/process/AVAILABLE_AGENTS.md` to match `docs/audits/README.md` display names.

## Re-test checklist

- [ ] After any `shell-risk-policy` edit, re-read `.cursor/hooks.json` `beforeShellExecution` prompt for category parity (`docs/process/command-integrity-check.md` § Shell policy ↔ hooks sync).
- [ ] After any lane rename, run through `docs/process/command-integrity-check.md` checklist and update `docs/audits/README.md` in the **same change** as `.cursor/rules/*-audit-agent.mdc`.
- [ ] Spot-check “run agent governance audit” still resolves to report path `docs/audits/agent-governance/YYYY-MM-DD-agent-governance-audit.md` per `.cursor/rules/agent-governance-audit-agent.mdc`.

## Next trigger and cadence

- **Trigger:** Monthly when `.cursor/rules`, hooks, or PM/builder/agent process docs change; also this lane is part of full audit **2026-05-01**.
- **Next run:** Per `docs/audits/README.md` cadence table — approximately **monthly**, or sooner after adding a new audit lane, hook, or `app/.agents/skills/` subtree.
