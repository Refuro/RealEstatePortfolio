# AI Agent Governance Audit — 2026-03-20

## Executive summary

- **Overall:** **Cursor rules** exist per lane under `.cursor/rules/` including **`full-audit-agent.mdc`**. **`.cursor/hooks.json`** references **`docs/policies/shell-risk-policy.md`** in the beforeShell prompt (path corrected per Batch 2 tasks). **Husky** at repo root runs **lint + test** on pre-commit/pre-push — aligns local quality with CI.
- **Top risks:** **Rules drift** — process docs (`docs/process/*.md`) must stay in sync with agent rules when workflows change; **hooks** — subagent scripts must remain non-destructive.
- **Recommendation:** Run `docs/process/command-integrity-check.md` (or equivalent) when adding/changing rules.

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none)*

### Medium

- **Dual maintenance** — Full audit process lives in `docs/process/full-audit-synthesis.md` and `.cursor/rules/full-audit-agent.mdc`; update both when lane count or output paths change.

### Low

- **Root `.gitignore`** — Excludes `node_modules/` at git root for Husky; contributors must run `npm install` at root + `app/` — document in onboarding (done in `run-and-smoke-test.md`).

## Evidence reviewed

- `.cursor/rules/full-audit-agent.mdc`, `builder-agent.mdc`, `pm-agent.mdc` (existence)
- `.cursor/hooks.json` — shell policy path
- `RealEstatePortfolio/.gitignore`, `.husky/pre-commit`, `.husky/pre-push`
- `docs/process/full-audit-synthesis.md`, `docs/audits/README.md`

## Risk & impact assessment

Poor governance causes inconsistent AI output and occasional unsafe shell suggestions; current hooks + docs mitigate.

## Recommendations (prioritized)

1. When editing **rules**, cross-check **linked process docs** in the same PR.
2. Keep **audit README** cadence table current when adding lanes.

## Task candidates (optional)

- [ ] Add **`AGENTS.md`** or top-level pointer in `docs/README.md` listing “how to run audits” (if onboarding new PMs).
- [ ] Version **full-audit** trigger phrases in `docs/cursor-agent-setup.md` if they change.

## Re-test checklist

- [ ] Say “run full audit” in Cursor — agent finds `full-audit-synthesis.md` output path.
- [ ] Fresh clone: `npm install` at root → Husky hooks present.

## Next trigger and cadence

- **Trigger:** Changes to `.cursor/`, hooks, or audit process docs.
- **Next window:** Monthly.
