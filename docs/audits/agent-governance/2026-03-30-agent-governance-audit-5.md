# AI Agent Governance Audit — 2026-03-30 (Run 5)

## Executive summary

- **Onboarding drift resolved:** `docs/cursor-agent-setup.md` now consistently describes **12** full-audit lanes, lists **Documentation** and **Legal & Compliance** in the rules table, process/docs tables, summary, and Step 1 clone checklist — matching `docs/audits/README.md`, `.cursor/rules/full-audit-agent.mdc`, and `docs/process/command-integrity-check.md`
- **Safety wiring aligned:** `docs/policies/shell-risk-policy.md` and the `beforeShellExecution` prompt in `.cursor/hooks.json` remain in sync on ALLOW / DENY / ASK; `docs/process/pm-agent-workflow.md` correctly describes hook vs phase-level PM roles
- **Full-audit consistency:** `docs/process/full-audit-synthesis.md` §6 instructs all **12** lanes with optional documented skips noted in synthesis; no conflict with `.cursor/rules/full-audit-agent.mdc` beyond intentional skip wording
- **Overall recommendation:** No urgent governance fixes; optional polish: align `agent-governance-audit-agent.mdc` with same-day filename suffix guidance used in `documentation-audit-agent.mdc`, and optionally harmonize product naming in the shell hook prompt with “Veld” branding if desired

## Severity-ranked findings

### Critical

- None.

### High

- None. *(Prior Run 4 High finding — stale 10-lane copy and missing Documentation/Legal in `docs/cursor-agent-setup.md` — is **verified fixed** in the current file.)*

### Medium

- None.

### Low

- **Same-day report naming — agent governance rule vs documentation rule** — `.cursor/rules/documentation-audit-agent.mdc` explicitly allows `YYYY-MM-DD-documentation-audit-N.md` for multiple same-day runs; `.cursor/rules/agent-governance-audit-agent.mdc` only specifies `YYYY-MM-DD-agent-governance-audit.md` — **risk:** minor inconsistency for agents; humans already use `-2`, `-3`, etc. — `.cursor/rules/agent-governance-audit-agent.mdc`; contrast `.cursor/rules/documentation-audit-agent.mdc`; `docs/audits/agent-governance/README.md` (single pattern only)

- **Hook prompt product naming** — `beforeShellExecution` prompt in `.cursor/hooks.json` describes the app as “Real Estate Portfolio app”; PM/builder docs and `builder-agent.mdc` use **Veld** / **Veld Portfolio** for brand — **risk:** cosmetic only; no policy divergence — `.cursor/hooks.json`

- **Mobile experience lane outside the 12-lane full audit** — `docs/audits/README.md` lists **Mobile experience** with `docs/qa/mobile-experience-audit.md` and optional reports under `feature/`; it is not one of the **12** lanes in `full-audit-agent.mdc` — **risk:** low; could confuse someone expecting “all audits” to include mobile — **mitigation already present:** README table separates that row; optional future cross-link in `docs/cursor-agent-setup.md` or full-audit rule if confusion recurs

---

## Evidence reviewed

- `docs/process/agent-governance-audit-process.md`
- `docs/process/audit-report-template.md`
- `docs/process/command-integrity-check.md`
- `docs/audits/README.md`
- `docs/cursor-agent-setup.md` (full)
- `docs/setup/ai-process-workflow-setup.md`
- `docs/policies/shell-risk-policy.md`
- `docs/process/full-audit-synthesis.md` (including §6)
- `docs/process/pm-agent-workflow.md` (hook / shell sections)
- `.cursor/hooks.json`
- `.cursor/hooks/on-subagent-stop.ps1` (partial)
- `.cursor/rules/full-audit-agent.mdc`
- `.cursor/rules/agent-governance-audit-agent.mdc`
- `.cursor/rules/documentation-audit-agent.mdc`
- `.cursor/rules/code-audit-agent.mdc` (partial — subagent pattern)
- Glob: `.cursor/rules/*-audit-agent.mdc` — **12** lane rules + `full-audit-agent.mdc`
- Prior report: `docs/audits/agent-governance/2026-03-30-agent-governance-audit-4.md`

**Assumptions / limits:** Did not execute Cursor hooks or subagents; did not re-read every `*-audit-agent.mdc` body end-to-end. Lane ↔ process mapping validated via `command-integrity-check.md`, audit index, and spot-checks of rules and setup docs.

## Risk & impact assessment

Governance **controls are present and mutually consistent** across rules, hooks, and primary process docs. The resolved setup guide gap was the main **discoverability** risk; remaining items are **polish** (naming, optional suffix text in one rule). Shell gating and PM/builder workflow documentation remain aligned.

## Recommendations (prioritized)

1. **Optional —** Add the same parenthetical as in `documentation-audit-agent.mdc` to `agent-governance-audit-agent.mdc` for `YYYY-MM-DD-agent-governance-audit-N.md` when multiple runs occur on one day; optionally add one line to `docs/audits/agent-governance/README.md`.

2. **Optional —** If brand consistency matters in all surfaces, update the `beforeShellExecution` prompt in `.cursor/hooks.json` to say “Veld Portfolio” (or equivalent) while keeping the same ALLOW/DENY/ASK semantics unchanged.

3. **Optional —** If users repeatedly ask whether mobile is in the full audit, add a single clarifying sentence in `docs/audits/README.md` (Full audit subsection) or in `.cursor/rules/full-audit-agent.mdc` that the 12 lanes do not include the optional mobile-experience QA lane.

## Task candidates (optional)

- [ ] (Optional) Align `agent-governance-audit-agent.mdc` same-day filename suffix with `documentation-audit-agent.mdc` and `docs/audits/agent-governance/README.md`

## Re-test checklist

- [ ] After any doc/rule edit, spot-check `docs/audits/README.md` lane table vs `command-integrity-check.md` mapping
- [ ] If hook prompt text changes, re-read `docs/policies/shell-risk-policy.md` for category parity
- [ ] `npm run check` (when code changes are made) — not applicable to pure doc/rule updates

## Next trigger and cadence

- **Trigger:** Monthly after `.cursor/rules`, hooks, or PM/agent workflow doc changes; or after adding/renaming an audit lane
- **Recommended next run window:** 2026-04-30 or next governance-touching change
