# Documentation Audit — 2026-04-07

## Executive summary

- **Governance wiring:** `docs/audits/README.md`, `docs/process/command-integrity-check.md`, and `.cursor/rules/*-audit-agent.mdc` remain aligned on 14 lanes; `documentation-audit-agent.mdc` and `full-audit-agent.mdc` reference the correct process paths and report locations.
- **Persistent high-severity drift:** The same issues called out in the 2026-04-05 documentation audit are still present after two more days of activity: non-lane reports at `docs/audits/` root (including three files through 2026-04-05; **update 2026-04-30:** two of three relocated to `feature/` and `growth-funnel/`), a missing research file referenced from an active plan, a stale “latest synthesis” link and weak design-spec hierarchy on `docs/README.md`, a broken `docs/tasks.md` link in the embedded synthesis template, and archive plan footers that use repo-root-style `docs/...` paths that do not resolve from `docs/archive/plans/`.
- **Hub gaps:** `docs/research/`, `docs/test-plans/`, `docs/decisions/`, and `docs/prompts/` now contain files but are not surfaced in `docs/README.md`, so discoverability lags folder growth.
- **Recommendation:** Treat the audits-root placement and plan frontmatter fixes as one small doc-hygiene batch; refresh the hub (synthesis link, design-spec primacy, new directories); fix the synthesis template link and archive footer relatives in the same pass to stop tripping PMs and agents.

## Severity-ranked findings

### Critical

- None. No documentation issue identified that blocks production runtime or makes the repo unusable.

### High

- **Non-lane audit reports still at `docs/audits/` root (historical)** — At audit time, three markdown files sat outside lane subfolders: `docs/audits/2026-04-04-polish-gap-audit.md`, `2026-04-05-quick-add-completion-gap-audit.md`, and `2026-04-05-onboarding-friction-analysis.md`. **Update (2026-04-30 Phase G):** The two 2026-04-05 reports now live under [`docs/audits/feature/2026-04-05-quick-add-completion-gap-audit.md`](../feature/2026-04-05-quick-add-completion-gap-audit.md) and [`docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md`](../growth-funnel/2026-04-05-onboarding-friction-analysis.md). **Evidence:** `docs/audits/README.md` (lane table and § Lane structure contract).

- **Active plan frontmatter points at missing research and non-standard audit path** — `docs/plans/2026-04-05-edit-page-completion-guidance.md` declares `research: docs/research/2026-04-05-edit-page-completion-ux.md`, which does not exist under `docs/research/` (only `2026-04-05-onboarding-form-ux-wizard-vs-scroll.md`, `growth-pricing-research-2026-04.md`, `interactive-demo-brief-2026-04.md`). The `audit:` key references `docs/audits/growth-funnel/2026-04-05-onboarding-friction-analysis.md` (lane path **as of 2026-04-30**). **Risk:** Broken traceability from plan to research evidence. **Evidence:** `docs/plans/2026-04-05-edit-page-completion-guidance.md` (frontmatter L6–L7); `docs/research/` directory listing.

- **`docs/README.md` quick link and design reference hierarchy still stale** — The “Latest audit synthesis” link still targets `audits/synthesis/2026-04-03-audit-synthesis.md` while a newer consolidated synthesis exists at `docs/audits/synthesis/2026-04-05-audit-synthesis.md`. The Reference section still lists `policies/design-spec.md` as **current** and `design/design-brief-2026.md` as **future** without prominently listing `design/design-spec-2026.md` as the primary 2026 shipped spec (DOC-1 from 2026-04-04 synthesis, still open). **Evidence:** `docs/README.md` L6, L16–19.

- **Embedded synthesis template uses wrong relative path to `docs/tasks.md`** — In `docs/process/full-audit-synthesis.md`, the §4 example block tells PMs to promote to `[docs/tasks.md](../../tasks.md)`. From `docs/process/`, `../../tasks.md` resolves to the repository root, where no `tasks.md` exists (`docs/tasks.md` is canonical). **Risk:** Copy-paste or rendered links 404 in viewers that resolve relatives from the file. **Evidence:** `docs/process/full-audit-synthesis.md` L170; single `tasks.md` at `docs/tasks.md` (repo search).

- **Archive plan footers use `docs/...` links that break relative resolution** — Footer “Related” links in archived plans use targets like `(docs/design/design-spec-2026.md)` and `(docs/brainstorms/...)`. From `docs/archive/plans/*.md`, those paths imply `docs/archive/plans/docs/...`, which does not exist. **Evidence:** `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` (e.g. L719–722); `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` (e.g. L731–736).

### Medium

- **Hub does not index newer doc areas** — `docs/README.md` has no quick or section links for `docs/research/`, `docs/test-plans/`, `docs/decisions/`, or `docs/prompts/`, each of which now contains at least one file. **Risk:** Contributors duplicate effort or fail to find existing briefs, ADRs, and test plans. **Evidence:** `docs/README.md` full scan; `docs/research/`, `docs/test-plans/`, `docs/decisions/`, `docs/prompts/` listings.

### Low

- **Documentation audit rule vs process: subagent wording** — `documentation-audit-agent.mdc` instructs launching a subagent; `docs/process/documentation-audit-process.md` does not require it. This is minor operational drift only; local runs may follow either pattern as long as the report file is written. **Evidence:** `.cursor/rules/documentation-audit-agent.mdc` L16–17; `docs/process/documentation-audit-process.md` §4.

## Evidence reviewed

- `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/full-audit-synthesis.md` (§4 template)
- `docs/README.md`, `docs/audits/README.md`, `docs/setup/ai-process-workflow-setup.md` (audit rules list)
- `docs/audits/documentation/README.md`; root-level `docs/audits/*.md` (PowerShell `Get-ChildItem -File`)
- `.cursor/rules/documentation-audit-agent.mdc`, `.cursor/rules/full-audit-agent.mdc`
- `docs/plans/2026-04-05-edit-page-completion-guidance.md` (frontmatter)
- `docs/research/` directory (three files; target named in plan absent)
- `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md`, `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md` (footer links)
- Prior lane report: `docs/audits/documentation/2026-04-05-documentation-audit.md` (continuity check)
- Spot check: `docs/design/design-spec-2026.md` exists; `docs/tasks.md` exists only under `docs/`

**Limits:** No exhaustive link crawler across all markdown under `docs/`; no verification of external URLs. Sample focused on hub, process/governance, audits layout, and carry-over synthesis items.

## Risk & impact assessment

Unresolved **High** items mainly hurt **internal workflow**: PMs and agents follow wrong links, miss ad-hoc audits when browsing lane folders, and mis-order design sources when implementing UI. Likelihood is **high** during the next full-audit or onboarding cycle because the broken paths are on the main hub and in the synthesis template. **Medium** hub gaps increase duplicate docs and slower onboarding. No direct end-user product risk unless a builder ships UI against the wrong spec because the hub implied `policies/design-spec.md` is the only “current” token source.

## Recommendations (prioritized)

1. **Relocate or index** the three `docs/audits/*.md` root reports into the appropriate lane folders (or add an explicit “Ad-hoc audits (root)” subsection in `docs/audits/README.md` that lists them and states they are exceptions—prefer relocation per lane contract).
2. **Fix plan traceability:** Create or rename the missing edit-page completion research file, or update `docs/plans/2026-04-05-edit-page-completion-guidance.md` frontmatter to point at the real artifact; align `audit:` with the final location after any move.
3. **Refresh `docs/README.md`:** Point “Latest audit synthesis” at the newest synthesis file; add `design/design-spec-2026.md` as the primary shipped design reference alongside (not instead of) policy cross-links; add short links for `research/`, `test-plans/`, `decisions/`, `prompts/`.
4. **Correct the synthesis template link** in `docs/process/full-audit-synthesis.md` §4 to `../tasks.md` (or an absolute repo-relative path your renderer supports).
5. **Repair archive plan footers** to use relative paths from `docs/archive/plans/` (e.g. `../../design/design-spec-2026.md`, `../../brainstorms/...`).

## Task candidates

- [x] Move `docs/audits/2026-04-04-polish-gap-audit.md` if still at root; **done (Phase G):** `2026-04-05-quick-add-completion-gap-audit.md` → `docs/audits/feature/`; `2026-04-05-onboarding-friction-analysis.md` → `docs/audits/growth-funnel/`; inbound links updated.
- [ ] Resolve `research:` / `audit:` frontmatter in `docs/plans/2026-04-05-edit-page-completion-guidance.md` (add missing file or retarget).
- [ ] Update `docs/README.md` synthesis link, design-spec hierarchy, and new directory links.
- [ ] Patch `docs/process/full-audit-synthesis.md` L170 link to `docs/tasks.md`.
- [ ] Patch footer links in `docs/archive/plans/2026-04-04-property-detail-revamp-plan.md` and `docs/archive/plans/2026-04-04-refinance-payoff-insights-plan.md`.

## Re-test checklist

- [ ] After moves: confirm no broken references to old audit paths (grep `docs/audits/2026-04-0`).
- [ ] Open `docs/README.md` and synthesis template in the IDE preview and confirm links resolve.
- [ ] `npm run check` only if application code changes (none required for doc-only fixes).

## Next trigger and cadence

- **Trigger:** Per `docs/audits/README.md` — monthly, or after large doc reorg / repeated stale-reference drift.
- **Recommended next run:** 2026-05-07 or after the next full-audit synthesis that promotes documentation follow-ups.
