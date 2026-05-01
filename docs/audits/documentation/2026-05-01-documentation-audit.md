# Documentation Audit — 2026-05-01

## Executive summary

- **Hubs match the newest synthesis on disk:** `docs/README.md` and `docs/audits/synthesis/README.md` both point at `2026-04-30-audit-synthesis.md`, which is the latest full synthesis file in `docs/audits/synthesis/` at audit time. When the **2026-05-01** full-run synthesis is written, the [two-file rule](../../process/full-audit-synthesis.md) requires updating both hubs in the same pass.
- **Lane-structure contract still has one explicit exception:** `docs/audits/2026-04-04-polish-gap-audit.md` remains at `docs/audits/` root instead of under a lane folder; `docs/audits/README.md` expects dated reports under `docs/audits/<lane>/`.
- **Automated link crawl (`npm run docs:linkcheck` / `check-doc-links.mjs`):** **P0 = 0.** Remaining **P1/P2** issues cluster around `_maintenance` cleanup-plan paths, an archived paid-ads README, and some historical audit/archive markdown—not critical-path hub breakage.
- **Earlier documentation-audit themes are largely closed:** `docs/process/AVAILABLE_AGENTS.md` exists; synthesis README correctly attributes `-2`/`-3` naming to the synthesis process; `docs/research/2026-04-05-edit-page-completion-ux.md` exists for the edit-page plan; the doc hub lists Mobile experience in the Process section and states design-spec hierarchy clearly.

## Severity-ranked findings

### Critical

- None. Documentation and governance gaps only; no direct production outage signal.

### High

- None for this pass. Prior hub staleness relative to synthesis is **resolved** as of `2026-04-30` hubs + synthesis pairing.

### Medium

- **Root-level audit vs lane contract** — `docs/audits/2026-04-04-polish-gap-audit.md` sits at `docs/audits/*.md` while [`docs/audits/README.md`](../README.md) § Lane structure contract describes reports under `docs/audits/<lane>/`. **Risk:** Agents and humans grep lane folders and miss this artifact; inconsistent with bookmark redirects and lane conventions. **Evidence:** file path; audits README table + lane structure section.

- **`docs/process/_maintenance/2026-doc-cleanup-plan.md` link targets** — `check-doc-links.mjs` reports multiple **P1** entries from this file (paths resolving outside `RealEstatePortfolio/`, or `internal_missing` for repo-relative anchors written as if from another root). **Risk:** Anyone executing the plan literally hits dead links. **Evidence:** link-check JSON (`p1` entries sourcing `docs/process/_maintenance/2026-doc-cleanup-plan.md`); same script run dated **2026-05-01**.

- **Archived paid-ads readouts README navigation** — `docs/archive/launch/paid-ads-readouts/README.md` links `../../launch/` and `../../launch/paid-ads-test-readout-template.md`; checker flags **internal_missing**, and the relative depth does not reach [`docs/launch/`](../../launch/) evergreen runbooks (needs `../../../launch/` from `paid-ads-readouts/`). **Risk:** Broken handoff from archive back to active launch docs. **Evidence:** file lines 3–4, 12; link-check `p2` entries.

### Low

- **Large orphan surface (discoverability)** — Doc link checker reports **~293** markdown files not reached from its seed closure (`orphanCount` in machine output). **Risk:** Duplicate or stale docs linger without hub linkage—not incorrect runtime behavior. **Evidence:** `docs/process/_maintenance/check-doc-links.mjs` run output **2026-05-01**.

- **`documentation-audit-process.md` vs `documentation-audit-agent.mdc`** — The Cursor rule instructs launching a **generalPurpose** subagent; [`documentation-audit-process.md`](../../process/documentation-audit-process.md) §4 describes execution steps without requiring a subagent. **Risk:** Minor agent behavioral drift. **Evidence:** `.cursor/rules/documentation-audit-agent.mdc` (launch subagent); process doc §4.

- **`documentation-maintenance.md` directory link** — In [`documentation-maintenance.md`](../../process/documentation-maintenance.md), the inline link to `./_maintenance/` is flagged **P2** (`internal_missing`) by the checker (directory / no index file). **Evidence:** link-check `p2`; same file.

- **`docs/tasks-archived.md` stale targets** — Checker lists missing synthesis file and bare `design-spec.md` targets (**P2**). **Risk:** Low; archive file, but confusing when tracing history. **Evidence:** link-check `p2` for `docs/tasks-archived.md`.

- **`docs/tasks.md` Phase 18** — Open housekeeping on superseded same-day documentation audit reruns. **Evidence:** `docs/tasks.md` (~§ Phase 18).

## Evidence reviewed

- [`docs/process/documentation-audit-process.md`](../../process/documentation-audit-process.md), [`docs/process/audit-report-template.md`](../../process/audit-report-template.md)
- [`docs/README.md`](../../README.md), [`docs/audits/README.md`](../README.md), [`docs/audits/documentation/README.md`](README.md), [`docs/audits/synthesis/README.md`](../../synthesis/README.md)
- [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) (tasks.md link spots), [`docs/process/command-integrity-check.md`](../../process/command-integrity-check.md) (documentation row)
- [`docs/process/documentation-maintenance.md`](../../process/documentation-maintenance.md), [`docs/process/AVAILABLE_AGENTS.md`](../../process/AVAILABLE_AGENTS.md)
- [`docs/setup/ai-process-workflow-setup.md`](../../setup/ai-process-workflow-setup.md) (audit rule list spot-check)
- `.cursor/rules/documentation-audit-agent.mdc`, `.cursor/rules/full-audit-agent.mdc` (14-lane wording)
- `docs/audits/` layout (root `2026-04-04-polish-gap-audit.md`), [`docs/archive/launch/paid-ads-readouts/README.md`](../../archive/launch/paid-ads-readouts/README.md)
- `node docs/process/_maintenance/check-doc-links.mjs` (full JSON summary **2026-05-01**)
- Plan/research spot-check: [`docs/plans/2026-04-05-edit-page-completion-guidance.md`](../../plans/2026-04-05-edit-page-completion-guidance.md) + matching [`docs/research/2026-04-05-edit-page-completion-ux.md`](../../research/2026-04-05-edit-page-completion-ux.md)
- [`docs/tasks-tools-expansion.md`](../../tasks-tools-expansion.md) (AVAILABLE_AGENTS link path)

**Assumptions / limits:** External URLs not fetched. Not every orphan doc was opened manually. Full audit **2026-05-01** synthesis file did not exist yet at write time; hub pointers correctly describe **2026-04-30** as latest synthesis.

## Risk & impact assessment

Residual issues are **internal navigation, onboarding, and PM throughput** (wrong archive ↔ launch paths, cleanup-plan fragility, lane-folder inconsistency). End-user product risk is indirect unless teams ship wrong work from outdated synthesis—which is **not** the current state given aligned **2026-04-30** hubs.

## Recommendations (prioritized)

1. When **`docs/audits/synthesis/2026-05-01-audit-synthesis.md`** (or same-day `-2`) exists, update **`docs/README.md`** and **`docs/audits/synthesis/README.md`** “latest” pointers immediately (two-file rule).
2. **Resolve `docs/audits/2026-04-04-polish-gap-audit.md`:** move under an appropriate lane folder (likely [`docs/audits/feature/`](../feature/) given UX polish scope) **or** add an explicit, intentional exception in [`docs/audits/README.md`](../README.md) with a bookmark note—partial lane renames without README updates are forbidden by contract.
3. **Fix `docs/archive/launch/paid-ads-readouts/README.md`** relative paths so evergreen [`docs/launch/`](../../launch/) targets resolve (`../../../launch/` from that README).
4. **Normalize links in `docs/process/_maintenance/2026-doc-cleanup-plan.md`** to portfolio-root-relative targets that pass `docs:linkcheck`, or banner the doc as “historical / paths not validated.”
5. Optionally align **`documentation-audit-process.md`** §4 with **`.cursor/rules/documentation-audit-agent.mdc`** (subagent wording) to remove dual expectations.

## Task candidates (optional)

- [ ] After **2026-05-01** full synthesis is written: update [`docs/README.md`](../../README.md) and [`docs/audits/synthesis/README.md`](../../synthesis/README.md) to the new `*-audit-synthesis.md` and refresh “14 lanes / run date” copy if needed.
- [ ] Relocate [`docs/audits/2026-04-04-polish-gap-audit.md`](../2026-04-04-polish-gap-audit.md) into [`docs/audits/feature/`](../feature/) (or document an explicit README exception + redirect note).
- [ ] Correct launch/readout links in [`docs/archive/launch/paid-ads-readouts/README.md`](../../archive/launch/paid-ads-readouts/README.md) (`../../../launch/` semantics).
- [ ] Repair or annotate broken-relative links in [`docs/process/_maintenance/2026-doc-cleanup-plan.md`](../../process/_maintenance/2026-doc-cleanup-plan.md) so P1 noise drops on the next `docs:linkcheck`.
- [ ] Close or narrow [`docs/tasks.md`](../../tasks.md) Phase 18 once superseded documentation audit reruns are reconciled with [`docs/audits/documentation/README.md`](README.md) suffix convention.
- [ ] (Optional) Add **`documentation-audit-process.md`** bullet mirroring subagent instruction from [`.cursor/rules/documentation-audit-agent.mdc`](../../../.cursor/rules/documentation-audit-agent.mdc), or relax the rule to match the process.

## Re-test checklist

- [ ] After hub updates: open Quick links from `docs/README.md` and synthesis README “Latest full run” and confirm targets exist.
- [ ] Run `npm run docs:linkcheck` from repo root and confirm **P0 = 0**; spot-check P1/P2 deltas for edited files.

## Next trigger and cadence

- **Trigger:** Monthly per [`docs/audits/README.md`](../README.md); also after large doc reorganizations or repeated stale-reference drift.
- **Next window:** After **2026-05-01** full audit synthesis lands (confirm hubs updated).
