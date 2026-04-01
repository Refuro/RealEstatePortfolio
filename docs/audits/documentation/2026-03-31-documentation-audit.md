# Documentation Audit — 2026-03-31

## Executive summary

- **Overall health:** The documentation system is well indexed (`docs/README.md`, `docs/audits/README.md`), process docs are present and aligned on a **14-lane** full audit (including Mobile experience and SEO), and sampled setup/QA/launch/policies content is coherent with the PM/builder workflow.
- **Top risks:** A **broken relative link** in `docs/audits/synthesis/README.md` points under `docs/.cursor` (non-existent). **Freshness drift** between the main docs index (“latest” synthesis) and the synthesis folder’s own “latest” pointer. **Governance drift:** `docs/process/command-integrity-check.md` omits the Mobile experience lane in its rule mapping table, and `docs/setup/ai-process-workflow-setup.md` omits the matching rule file from its optional audit list.
- **Recommendation:** Treat doc fixes (link path, index alignment, integrity-check table, setup list) as **documentation cleanup** in one small pass; archive or relocate dated launch readouts when campaigns are closed to keep `docs/launch/` scannable.

## Severity-ranked findings

### Critical

- None.

### High

- **Broken reference — synthesis index → Cursor rule** — The link `[documentation audit rule](../../.cursor/rules/documentation-audit-agent.mdc)` from `docs/audits/synthesis/README.md` resolves to `docs/.cursor/rules/...`, which does not exist (repo rules live at repository root `.cursor/rules/`). Readers following the synthesis README get a dead link. — `docs/audits/synthesis/README.md` (line referencing `../../.cursor/...`).

### Medium

- **Stale “latest synthesis” pointer on main docs index** — `docs/README.md` Quick links cite `audits/synthesis/2026-03-30-audit-synthesis-4.md` as the latest synthesis, while `docs/audits/synthesis/README.md` states the latest full run is `2026-03-30-audit-synthesis-5.md`. Same-day suffix convention is documented, but the **top-level index is behind** the synthesis folder’s explicit latest. — `docs/README.md`, `docs/audits/synthesis/README.md`.
- **Command integrity mapping incomplete vs active lanes** — `docs/process/command-integrity-check.md` “Lane → process → rule mapping” table lists 13 lanes and **does not include Mobile experience**, despite `docs/audits/README.md` and `.cursor/rules/mobile-experience-audit-agent.mdc` being part of the active set. The check doc itself requires updating mapping when lanes change; partial tables undermine quarterly integrity verification. — `docs/process/command-integrity-check.md` (contrast `docs/audits/README.md` Mobile experience row).

### Low

- **Clone/setup doc omits one audit rule file** — `docs/setup/ai-process-workflow-setup.md` lists optional `*-audit-agent.mdc` files but **does not list** `mobile-experience-audit-agent.mdc`, so a copied workflow may miss Mobile lane wiring. — `docs/setup/ai-process-workflow-setup.md` (optional rules list; compare `.cursor/rules/mobile-experience-audit-agent.mdc`).
- **Launch folder density (archive candidates)** — Several **date-stamped** paid-ads artifacts (`paid-ads-readout-2026-03-30-*.md`, `paid-ads-round2-search-ops-2026-03-30.md`) sit alongside evergreen runbooks; after readouts are consumed, moving them under `docs/archive/` (or a `docs/launch/archive/`) would match the archive pattern used elsewhere. — `docs/launch/` (sampled listing).
- **Documentation audit same-day reruns** — Multiple files `2026-03-30-documentation-audit-2.md` … `-5.md` match the folder README suffix convention but add noise; optionally consolidate or archive older suffixes once PM has picked a canonical report for that day. — `docs/audits/documentation/README.md`, `docs/audits/documentation/2026-03-30-documentation-audit*.md`.
- **Policies discoverability** — `docs/README.md` “Policies (canonical)” highlights three policies; `docs/policies/` also contains `calculator-metric-tones.md` and `csp-rollout.md` (and design lives under Reference). Low risk; a single index line or table row would reduce “hidden” policy drift. — `docs/README.md`, `docs/policies/` (directory sample).

## Evidence reviewed

- **Process & template:** `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`, `docs/process/command-integrity-check.md`, `docs/process/full-audit-synthesis.md` (partial), `docs/process/pm-agent-workflow.md` (partial).
- **Indices:** `docs/README.md`, `docs/audits/README.md`, `docs/audits/synthesis/README.md`, `docs/audits/documentation/README.md`.
- **Sampled areas:** `docs/setup/` (`ai-process-workflow-setup.md`, `run-and-smoke-test.md`), `docs/qa/README.md`, `docs/launch/launch-plan.md` (partial), `docs/policies/shell-risk-policy.md` (partial), `docs/proposals/` (existence check for `testing-implementation-plan.md`).
- **Governance wiring:** `.cursor/rules/documentation-audit-agent.mdc`, `.cursor/rules/full-audit-agent.mdc`, `.cursor/rules/mobile-experience-audit-agent.mdc` (existence); path resolution check for synthesis README → `.cursor` link.
- **Assumptions / limits:** Link checks focused on cited paths and representative governance surfaces; not every markdown link in `docs/` was machine-validated end-to-end.

## Risk & impact assessment

- **Impact:** Wrong or dead links and incomplete integrity tables slow PM/onboarding and increase the chance of **partial lane renames** (called out as high-risk in `docs/audits/README.md`). No direct product runtime impact.
- **Likelihood:** Drift is **likely** to recur without aligning the synthesis index, main README, and command-integrity table whenever lanes or same-day synthesis suffixes change.

## Recommendations (prioritized)

1. **Fix** the `docs/audits/synthesis/README.md` link to the documentation audit rule using the correct relative depth to repository root (three `..` segments from `docs/audits/synthesis/`), or use a repo-root-absolute style reference consistent with other docs.
2. **Align** “latest synthesis” between `docs/README.md` and `docs/audits/synthesis/README.md` (update the quick link to `-5` or point Quick links to the synthesis README as the single source of truth for “latest”).
3. **Extend** `docs/process/command-integrity-check.md` with a **Mobile experience** row (process doc, rule file, output path exception to `docs/audits/feature/…mobile-experience-audit.md` per existing docs).
4. **Add** `.cursor/rules/mobile-experience-audit-agent.mdc` to the optional audit rules bullet list in `docs/setup/ai-process-workflow-setup.md`.
5. **After campaigns close:** move or archive dated paid-ads readout/ops files from `docs/launch/` per `docs/archive/README.md` patterns.

## Boundary: doc cleanup vs other work

| Category | Items |
|----------|--------|
| **Documentation / process cleanup** | Synthesis README link; README synthesis pointer; command-integrity table; ai-process-workflow-setup optional rules list; launch readout archiving; optional policies index line. |
| **Product / code implementation** | None identified in this pass. |

## Task candidates (optional)

- [ ] Correct `.cursor/rules/documentation-audit-agent.mdc` link path in `docs/audits/synthesis/README.md`.
- [ ] Update `docs/README.md` latest synthesis quick link to match `docs/audits/synthesis/README.md` (or link to synthesis README only).
- [ ] Add Mobile experience lane to `docs/process/command-integrity-check.md` mapping table (process path, rule file, report path exception).
- [ ] Add `mobile-experience-audit-agent.mdc` to `docs/setup/ai-process-workflow-setup.md` optional rules list.

## Re-test checklist

- [ ] Open synthesis README link to documentation audit rule from IDE/GitHub and confirm target resolves.
- [ ] Confirm `docs/README.md` and `docs/audits/synthesis/README.md` agree on latest synthesis file for the same run date.
- [ ] Mentally walk `docs/process/command-integrity-check.md` steps for all **14** lanes including Mobile experience.
- [ ] No code changes required for doc-only fixes; run `npm run check` only if unrelated code is touched later.

## Next trigger and cadence

- **Trigger:** Large doc reorg, new audit lane, or repeated stale-reference reports from builders/PM.
- **Recommended cadence:** Monthly per `docs/audits/README.md` Documentation lane row.
