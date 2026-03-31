# Documentation Audit — 2026-03-30 (Run 4)

## Executive summary

- Documentation governance remains coherent: `docs/audits/README.md`, `docs/process/command-integrity-check.md`, and the twelve-lane table align; `docs/tasks.md` reflects completed documentation/legal audit lane work (Batch 13) and does not contradict active doc-process expectations.
- **Incremental improvement since Run 3:** `docs/launch/analytics.md` now links to `docs/launch/pre-live-telemetry-qa-2026-03-30.md` under “For paid relaunch QA,” which improves the analytics → operational QA path without updating the main doc index.
- Persistent gaps: `docs/README.md` still omits the Documentation and Legal & Compliance audit processes from the Process list; Launch & growth still does not surface `posthog-views-setup.md`; `docs/cursor-agent-setup.md` still enumerates audit rules without Documentation or Legal/Compliance agents; `docs/audits/documentation/README.md` and `.cursor/rules/documentation-audit-agent.mdc` still describe only the unsuffixed daily filename.
- Overall recommendation: treat remaining items as **documentation hygiene and onboarding alignment** (indices, cross-links, naming contract, cursor setup), consistent with `docs/audits/synthesis/2026-03-30-audit-synthesis-3.md` Governance/Documentation task list — not as blocking product defects.

## Severity-ranked findings

### Critical

- None.

### High

- None identified in this pass.

### Medium

- **Process index gap in `docs/README.md` (unchanged from Run 3)** — The Process section lists most audit lane processes but does **not** link to `docs/process/documentation-audit-process.md` or `docs/process/legal-compliance-audit-process.md`, while `docs/audits/README.md` lists those lanes as first-class. Risk: operators use the main index and miss two lane processes. — `docs/README.md` (Process section), `docs/audits/README.md`.

- **Launch telemetry: PostHog views doc discoverability** — `docs/launch/posthog-views-setup.md` exists and is referenced from other audits (e.g. growth-funnel reports) but is **not** linked from `docs/README.md` Launch & growth, and **`docs/launch/analytics.md` does not reference it** (only `pre-live-telemetry-qa-2026-03-30.md` is linked at the bottom). Risk: “where is the PostHog views / saved insights setup doc?” friction during campaigns. — `docs/README.md`, `docs/launch/analytics.md`, `docs/launch/posthog-views-setup.md`.

- **`docs/cursor-agent-setup.md` audit rule list incomplete vs twelve lanes** — The rules table and checklist list code through agent-governance and full-audit, but **omit** `.cursor/rules/documentation-audit-agent.mdc` and `.cursor/rules/legal-compliance-audit-agent.mdc`; the “Other focused audits” sentence also omits documentation and legal/compliance. This matches an open synthesis follow-up (`2026-03-30-audit-synthesis-3.md` § Governance / Documentation). Risk: onboarding doc drifts from `docs/audits/README.md` and command-integrity expectations. — `docs/cursor-agent-setup.md`, `docs/audits/README.md`.

- **Multi-run audit naming vs folder/rule contract (unchanged)** — `docs/audits/documentation/README.md` still specifies only `YYYY-MM-DD-documentation-audit.md`; `.cursor/rules/documentation-audit-agent.mdc` still requires output at `YYYY-MM-DD-documentation-audit.md`. This repo uses same-day suffixed runs (`…-audit-2.md`, `…-audit-3.md`, `…-audit-4.md`). Risk: overwrites or misfiling during repeated same-day runs. — `docs/audits/documentation/README.md`, `.cursor/rules/documentation-audit-agent.mdc`, `docs/audits/documentation/` (multiple `2026-03-30-*` files).

- **Latest full-audit / synthesis pointer** — `docs/audits/synthesis/README.md` describes output naming and process but does **not** point to the latest synthesis file (e.g. `2026-03-30-audit-synthesis-3.md`). Risk: readers rely on filename sort or external memory. — `docs/audits/synthesis/README.md`.

- **Full-audit lane count wording (minor drift)** — `docs/process/full-audit-synthesis.md` §6 says run “all 12 lane processes **(or 11 if Code is skipped when unchanged)**”; `.cursor/rules/full-audit-agent.mdc` instructs running “all 12 audit lanes” without that caveat. Risk: small confusion when Code is intentionally skipped. — `docs/process/full-audit-synthesis.md` §6, `.cursor/rules/full-audit-agent.mdc`.

### Low

- **Stale date label in roadmap-priority table** — `docs/tasks.md` section “Roadmap priority (value vs effort — **2025-03-15**)” still uses a 2025 label; work continues in 2026; may read as unmaintained. — `docs/tasks.md`.

- **Visual assets freshness marker** — `docs/visual-assets-guide.md` shows “Last updated: **2025-03-13**”; content may still be valid but the date invites doubt. — `docs/visual-assets-guide.md`.

## Evidence reviewed

- `docs/process/documentation-audit-process.md`, `docs/process/audit-report-template.md`
- `docs/README.md` (full index), `docs/audits/README.md`, `docs/audits/documentation/README.md`, `docs/audits/synthesis/README.md`, `docs/audits/synthesis/2026-03-30-audit-synthesis-3.md` (Governance/Documentation bullets)
- `docs/tasks.md` (header, roadmap table, Batch 13 documentation/legal audit completion)
- `docs/cursor-agent-setup.md` (audit rules table and “Other focused audits”)
- `docs/process/command-integrity-check.md`, `docs/process/full-audit-synthesis.md` §6
- `.cursor/rules/documentation-audit-agent.mdc`, `.cursor/rules/full-audit-agent.mdc`
- `docs/launch/analytics.md` (tail: PM checklist, telemetry QA links), `docs/launch/posthog-views-setup.md` (existence)
- `docs/visual-assets-guide.md` (header metadata)
- Prior same-lane context: `docs/audits/documentation/2026-03-30-documentation-audit-3.md`
- Spot-check: existence of key paths under `docs/` (tasks, roadmap, launch files, process files)

**Limits:** This pass did not exhaustively crawl every markdown link under `docs/`; it prioritized the main index, audit indices, process docs, synthesis pointers, cursor onboarding, and launch/analytics cross-links. Broken-link risk may remain in long-tail or archived paths.

## Risk & impact assessment

Unresolved findings mainly affect **navigation, onboarding consistency, and trust** (finding the right process doc, views setup doc, or latest synthesis), not runtime behavior. Exposure is highest for new operators and during repeated same-day audit runs.

## Recommendations (prioritized)

1. Extend `docs/README.md` Process section with links to `documentation-audit-process.md` and `legal-compliance-audit-process.md` (matches `docs/audits/README.md` and synthesis follow-ups).
2. Add `docs/launch/posthog-views-setup.md` to Launch & growth **and/or** a short “Saved views / PostHog setup” link in `docs/launch/analytics.md` near the “Saved insight” or “PM validation checklist” sections.
3. Update `docs/cursor-agent-setup.md` to include Documentation and Legal/Compliance audit rules and process links, and align the “Other focused audits” sentence with all optional lanes in `docs/audits/README.md`.
4. Document optional same-day `…-audit-N` suffixes in `docs/audits/documentation/README.md` and align `.cursor/rules/documentation-audit-agent.mdc` output guidance so reruns do not conflict with the default filename.
5. Add a one-line “Latest synthesis (as of YYYY-MM-DD): …” pointer in `docs/audits/synthesis/README.md` or the Audits section of `docs/README.md`, updated when a new synthesis ships.
6. Reconcile full-audit “11 vs 12 lanes” wording between `full-audit-synthesis.md` §6 and `full-audit-agent.mdc` so intentional Code skips are documented consistently.

## Task candidates (optional)

- [ ] Extend `docs/README.md` Process section with `documentation-audit-process.md` and `legal-compliance-audit-process.md`.
- [ ] Link `posthog-views-setup.md` from Launch & growth and/or `analytics.md`.
- [ ] Update `docs/cursor-agent-setup.md` with Documentation + Legal/Compliance audit rules and process references.
- [ ] Update `docs/audits/documentation/README.md` and `.cursor/rules/documentation-audit-agent.mdc` for optional `…-audit-N` same-day report naming.
- [ ] Add a latest-synthesis pointer to `docs/audits/synthesis/README.md` (or top-level `docs/README.md`).
- [ ] Align `full-audit-synthesis.md` §6 with `full-audit-agent.mdc` on Code-skip behavior.
- [ ] Refresh `docs/tasks.md` roadmap-priority table date label (or retitle to “last reviewed”) when next edited.
- [ ] Bump “Last updated” on `docs/visual-assets-guide.md` when content is next reviewed.

## Re-test checklist

- [ ] After index updates: confirm new Process links resolve and match `docs/audits/README.md` lane table.
- [ ] Confirm documentation audit rule text matches agreed report naming after any README/rule update.
- [ ] `npm run check` (when code or config changes are made as follow-ups; not required for doc-only index edits).

## Next trigger and cadence

- **Trigger:** Large doc cleanup, lane rename, repeated same-day audit runs, or pre-launch documentation hardening.
- **Recommended next run:** Within one month or after the next full-audit synthesis that adds multiple per-lane files on one date.
