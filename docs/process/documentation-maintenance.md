# Documentation maintenance

Operational checklist for Veld Portfolio docs under `RealEstatePortfolio/docs/`.

## After each full audit synthesis

When a new **`docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md`** ships, update the **latest synthesis** pointer in the **same commit or follow-up** in both places (two-file rule — avoids PM triage lag):

1. [`docs/README.md`](../README.md) — Quick links
2. [`docs/audits/synthesis/README.md`](../audits/synthesis/README.md)

Process detail: [`docs/process/full-audit-synthesis.md`](full-audit-synthesis.md).

## Quarterly link check

Run at least **quarterly**, or before large doc merges:

From **`RealEstatePortfolio/`**:

```bash
npm run docs:linkcheck
```

From **`RealEstatePortfolio/app/`**:

```bash
npm run docs:linkcheck
```

**Goal:** **P0 = 0** (hub + synthesis README seeds). Remaining P1/P2 often reflect workspace cross-links and directories without `README.md` under `app/` — see [`docs/process/_maintenance/2026-doc-cleanup-link-report.md`](./_maintenance/2026-doc-cleanup-link-report.md) and raw JSON [`_link-report-raw.json`](./_maintenance/_link-report-raw.json).

To save machine-readable output: pipe stdout to `./docs/process/_maintenance/_link-report-raw.json`.

Implementation: [`docs/process/_maintenance/check-doc-links.mjs`](./_maintenance/check-doc-links.mjs).

## Metrics snapshots (Vitest / routes)

Paste-ready markdown for roadmap or audit notes (**approximate** static counts; does not replace `npm run test`).

From **`RealEstatePortfolio/`** or **`RealEstatePortfolio/app/`**:

```bash
npm run docs:metrics
```

Source: [`docs/process/_maintenance/generate-metrics-snapshot.mjs`](./_maintenance/generate-metrics-snapshot.mjs).

## Command integrity (after rules or audit-lane edits)

When `.cursor/rules/*-audit-agent.mdc` or lane/process renames land, walk [`docs/process/command-integrity-check.md`](command-integrity-check.md) so audit commands, process paths, and hub tables stay aligned.

## Large cleanups and working logs

Mega-cleanups may use a **dated** working log under [`docs/process/_maintenance/`](./_maintenance/) (example: [`2026-doc-cleanup-working-log.md`](./_maintenance/2026-doc-cleanup-working-log.md)) — **internal**; not linked from the hub. Prefer starting a **new dated log** for the next program-scale pass.

## CI gate (optional)

**Not enabled by default.** Run **`docs:linkcheck`** on PRs that touch `docs/**`, or on a weekly schedule, so drift is visible before the next quarterly crawl.
