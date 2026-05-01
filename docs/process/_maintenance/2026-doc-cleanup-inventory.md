---
title: Doc cleanup — directory inventory (Phase A)
status: active
updated: 2026-04-30
---

Companion to [`2026-doc-cleanup-plan.md`](./2026-doc-cleanup-plan.md) and [`2026-doc-cleanup-working-log.md`](./2026-doc-cleanup-working-log.md).

**Content class vocabulary (provisional tags per bucket):**  
`hub`, `canonical_reference`, `process`, `audit_immutable`, `plan_active`, `plan_superseded`, `launch_ops`, `qa`, `internal_owner`, `brainstorm`, `archive_candidate`, `unknown`.

**Repo note:** Git repository root is **`RealEstatePortfolio/`** (confirmed via `git rev-parse --show-toplevel`). Counts under `docs/` include **493 paths** from `git ls-files docs/` as of this inventory. Workspace siblings (`claudeCode/`, parent `docs/`, parent `.cursor/`) are listed from the filesystem only — they are not under that git root.

---

## 1. `RealEstatePortfolio/docs/**`

**Totals:** **`git ls-files docs/`** was **493** before this Phase A session; after adding `2026-doc-cleanup-working-log.md` and `2026-doc-cleanup-inventory.md`, tracked count becomes **495** when committed. Current filesystem count under `docs/` (**495**; `Get-ChildItem -Recurse -File`) matches. Top-level counts in §1.1 sum to **495** with `process/` at **22**.

### 1.1 Top-level manifest (file counts)

| Top-level (folder or root file) | Files | Provisional content class |
|---------------------------------|------:|----------------------------|
| `audits/` | 336 | `audit_immutable` (lane outputs + synthesis; root-level dated `.md` in folder are historical) |
| `archive/` | 32 | `archive_candidate` / `plan_superseded` (mixed launch, plans, proposals) |
| `launch/` | 17 | `launch_ops` |
| `internal/` | 12 | `internal_owner` |
| `process/` | 22 | `process` (includes `_maintenance/` with plan + working log + inventory) |
| `design/` | 10 | `canonical_reference` (design artifacts; align with policy cross-links in later phases) |
| `plans/` | 10 | `plan_active` (default; per-file supersession resolved in Phase H) |
| `reference/` | 10 | `canonical_reference` |
| `policies/` | 7 | `canonical_reference` |
| `qa/` | 7 | `qa` |
| `proposals/` | 3 | `plan_active` / `archive_candidate` |
| `setup/` | 3 | `canonical_reference` / `process` |
| `research/` | 3 | `archive_candidate` / `unknown` |
| `onboarding/` | 2 | `canonical_reference` / `process` |
| `prompts/` | 2 | `internal_owner` / `brainstorm` |
| `runbooks/` | 2 | `launch_ops` / `process` |
| `security/` | 2 | `qa` / `canonical_reference` (threat/process notes) |
| `decisions/` | 1 | `canonical_reference` |
| `test-plans/` | 1 | `qa` |
| `owner_notes/` | 1 | `internal_owner` |
| `brainstorms/` | 1 | `brainstorm` |
| `README.md` | 1 | `hub` |
| `architecture-and-build-practices.md` | 1 | `canonical_reference` |
| `cursor-agent-setup.md` | 1 | `process` / `canonical_reference` (agent onboarding) |
| `tasks.md` | 1 | `process` / `canonical_reference` |
| `tasks-archived.md` | 1 | `archive_candidate` |
| `tasks-tools-expansion.md` | 1 | `process` |
| `ai-development-process-extraction.md` | 1 | `process` |
| `business-launch-checklist.md` | 1 | `launch_ops` |
| `mobile-card-itis-redesign-plan.md` | 1 | `plan_active` / `archive_candidate` |
| `plaid-considerations.md` | 1 | `canonical_reference` / `internal_owner` |
| `visual-assets-guide.md` | 1 | `canonical_reference` |

### 1.2 `docs/audits/` — by lane / area

| Path under `docs/audits/` | Files | Notes |
|---------------------------|------:|-------|
| `feature/` | 38 | |
| `code/` | 26 | |
| `math/` | 26 | |
| `security/` | 25 | |
| `synthesis/` | 24 | |
| `reliability-ops/` | 24 | |
| `agent-governance/` | 23 | |
| `business/` | 23 | |
| `data-integrity/` | 23 | |
| `performance-cost/` | 23 | |
| `documentation/` | 19 | |
| `legal-compliance/` | 19 | |
| `growth-funnel/` | 23 | |
| `seo/` | 14 | |
| `design/` | 2 | |
| `2026-04-04-polish-gap-audit.md` (root) | 1 | Dated file at audits root |
| `feature/2026-04-05-quick-add-completion-gap-audit.md` | 1 | Moved from audits root (Phase G, 2026-04-30) |
| `growth-funnel/2026-04-05-onboarding-friction-analysis.md` | 1 | Moved from audits root (Phase G, 2026-04-30) |
| `README.md` | 1 | `hub` (lane contract) |

### 1.3 `docs/archive/` — by subtree

| Subtree | Files |
|---------|------:|
| `archive/proposals/` | 14 |
| `archive/plans/` | 12 |
| `archive/launch/` | 5 |
| `archive/README.md` | 1 |

### 1.4 `docs/process/` — `_maintenance/` vs root

| Area | Files |
|------|------:|
| `process/*.md` (root of `process/`) | 19 |
| `process/_maintenance/` | 3 (`2026-doc-cleanup-plan.md`, `2026-doc-cleanup-working-log.md`, `2026-doc-cleanup-inventory.md`) |

---

## 2. `claudeCode/**` (workspace: `RealEstateProject/claudeCode/`)

**Not** inside `RealEstatePortfolio` git root.

### 2.1 Markdown files (10)

| Path (from workspace root) |
|----------------------------|
| `claudeCode/InsightsGating/implementation.md` |
| `claudeCode/PropertyRedesign/HANDOFF.md` |
| `claudeCode/PropertyRedesign/property-build-phases.md` |
| `claudeCode/PropertyRedesign/property-implementation-discussion.md` |
| `claudeCode/PropertyRedesign/property-post-implementation-followups.md` |
| `claudeCode/DashRedesign/post-veld-followups.md` |
| `claudeCode/DashRedesign/veld-build-phases.md` |
| `claudeCode/DashRedesign/veld-implementation-discussion.md` |
| `claudeCode/DashRedesign/veld-production-readiness.md` |
| `claudeCode/DashRedesign/veld-handoff/Veld Dashboard Handoff.md` |

### 2.2 Non-Markdown artifacts (8 files)

| Path | Kind |
|------|------|
| `claudeCode/RemovedHoldForLater/testimonial` | extensionless |
| `claudeCode/PropertyRedesign/Veld Properties Reimagined.html` | HTML |
| `claudeCode/DashRedesign/veld-handoff/design-canvas.jsx` | JSX |
| `claudeCode/DashRedesign/veld-handoff/Veld Mobile Breakpoints.html` | HTML |
| `claudeCode/DashRedesign/veld-handoff/Veld Dashboard.html` | HTML |
| `claudeCode/DashRedesign/veld-handoff/Veld Dashboard Multi.html` | HTML |
| `claudeCode/DashRedesign/veld-handoff/Veld Dashboard 20-Property.html` | HTML |
| `claudeCode/DashRedesign/veld-handoff/Veld Dashboard 10-Property.html` | HTML |

**Bucket provisional classes:** `internal_owner`, `brainstorm`, `archive_candidate` — **Checkpoint A** (PM): retain, archive under `claudeCode/archive/`, or merge into `docs/`.

---

## 3. Root `docs/**` (workspace: `RealEstateProject/docs/`)

**Not** inside `RealEstatePortfolio` git root.

| File | Provisional class |
|------|-------------------|
| `docs/x-account-setup-checklist.html` | `launch_ops` / `archive_candidate` |
| `docs/x-posting-strategy.html` | `launch_ops` / `archive_candidate` |
| `docs/tiktok-ad-guide.html` | `launch_ops` / `archive_candidate` |

---

## 4. `.cursor/**` — agent-relevant paths

Two trees: **workspace** vs **portfolio app**.

### 4.1 `RealEstateProject/.cursor/` (workspace)

| Path | Role |
|------|------|
| `.cursor/settings.json` | Editor/workspace settings |
| `.cursor/skills/veld-ui/SKILL.md` | Agent skill — Veld UI design system |
| `.cursor/skills/veld-landing-cta/SKILL.md` | Agent skill — landing / CTA |
| `.cursor/skills/veld-mobile/SKILL.md` | Agent skill — mobile patterns |

**Bucket provisional classes:** `process`, `canonical_reference` (governance for agents).

### 4.2 `RealEstatePortfolio/.cursor/` (app/repo)

| Path | Role |
|------|------|
| `.cursor/hooks.json` | Agent hooks config |
| `.cursor/hooks/on-subagent-stop.ps1` | Hook script |
| `.cursor/hooks/on-subagent-stop.sh` | Hook script |
| `.cursor/rules/builder-agent.mdc` | Builder agent |
| `.cursor/rules/pm-agent.mdc` | PM agent |
| `.cursor/rules/full-audit-agent.mdc` | Audit orchestration |
| `.cursor/rules/*-audit-agent.mdc` (14 specialized audit rules) | Lane-specific audit agents |

**Bucket provisional classes:** `process`, `internal_owner` (repo-local agent policy).

---

## 5. Tier-1 link-crawl seeds (A.3)

Paths below are from **workspace root** `RealEstateProject/` unless noted.

- `RealEstatePortfolio/docs/README.md`
- `RealEstatePortfolio/README.md`
- `RealEstatePortfolio/docs/audits/README.md`
- `RealEstatePortfolio/docs/cursor-agent-setup.md`
- `RealEstatePortfolio/docs/tasks.md`

**Note:** No `README.md` at workspace root `RealEstateProject/` was found; optional future seed: `RealEstatePortfolio/app/README.md` (not in plan’s minimal list).

---

## 6. Inventory persistence

Single markdown manifest only (under 500 lines); no JSON sidecar required.
