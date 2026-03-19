# AI Agent Governance Audit — 2026-03-19

## Executive summary

- All 10 audit lanes have matching `.cursor/rules/*.mdc` files, process documents in `docs/process/`, and output folders in `docs/audits/`. The framework is fully wired.
- One critical stale reference found: `.cursor/hooks.json` references `docs/shell-risk-policy.md` but the file lives at `docs/policies/shell-risk-policy.md`. The pre-shell-execution hook may not find its policy document.
- Three high-severity stale links exist in `docs/policies/design-spec.md` pointing to incorrect relative paths for `pm-review-checklist.md` and `engineering-spec.md`.
- Builder agent, PM agent, and PM review checklist are well-aligned and reference all necessary policy documents. Minor path inconsistencies exist in setup docs.

---

## Severity-ranked findings

### Critical

**C1 — `.cursor/hooks.json` references wrong path for shell-risk-policy**

- `.cursor/hooks.json` line 13: References `docs/shell-risk-policy.md`.
- Actual file location: `docs/policies/shell-risk-policy.md`.
- The `beforeShellExecution` hook prompt instructs the agent to read this file before running shell commands. If the path is wrong, the agent may skip the shell risk policy entirely.
- **Impact:** Critical. Every dangerous shell command could bypass risk review.

### High

**H1 — `docs/policies/design-spec.md` contains broken internal links**

- Line 184: References `pm-review-checklist.md` (relative). Resolves to `docs/policies/pm-review-checklist.md` which does not exist. Correct path: `docs/process/pm-review-checklist.md`.
- Line 189: References `engineering-spec.md` (relative). Resolves to `docs/policies/engineering-spec.md` which does not exist. Correct path: `docs/reference/engineering-spec.md`.
- **Impact:** Agents following design-spec links will fail to find referenced documents, potentially missing review requirements.

**H2 — `docs/ai-development-process-extraction.md` references wrong shell-risk-policy path**

- Lines 71, 148: References `docs/shell-risk-policy.md`.
- Correct path: `docs/policies/shell-risk-policy.md`.
- **Impact:** Agents referencing this document for process guidance will get incorrect paths.

### Medium

**M1 — `.env.example` and `manual-steps.md` paths inconsistent across docs**

| Document | Reference | Correct path |
|----------|-----------|-------------|
| `docs/cursor-agent-setup.md` line 26 | `.env.example` | `app/.env.example` |
| `docs/cursor-agent-setup.md` line 48 | `manual-steps.md` | `docs/setup/manual-steps.md` |
| `docs/process/pm-agent-workflow.md` line 70 | `.env.example` and `manual-steps.md` | `app/.env.example` and `docs/setup/manual-steps.md` |

Note: `pm-agent-workflow.md` line 22 correctly says `app/.env.example`, but line 70 uses the short form — contradicting itself.

**M2 — Math audit report naming inconsistency**

- `docs/audits/README.md` naming convention example: `2026-03-19-math-audit.md`.
- `math-audit-agent.mdc` output pattern: `YYYY-MM-DD-math-logic-audit.md`.
- The actual report file from the earlier audit is `2025-03-13-math-logic-audit.md` (matches the agent pattern, not the README example).
- Not breaking, but inconsistent.

### Low

**L1 — Trailing markdown artifact in pm-agent.mdc**

- `.cursor/rules/pm-agent.mdc` line 36: Contains trailing ` ``` ` after the References section.
- Minor markdown rendering issue; does not affect agent behavior.

---

## Detailed analysis

### `.cursor/rules/` file inventory

All 11 `.mdc` files were verified:

| File | Role | Trigger mode | Triggers verified |
|------|------|-------------|-------------------|
| `pm-agent.mdc` | PM agent workflow | `alwaysApply` | N/A (always active) |
| `builder-agent.mdc` | Builder agent scope/handoff | `alwaysApply` | N/A (always active) |
| `code-audit-agent.mdc` | Code audit | Manual trigger | "run code audit", "code audit", "do a code audit" |
| `math-audit-agent.mdc` | Math & logic audit | Manual trigger | "run math audit", "math audit", "math and logic audit", "run math and logic audit" |
| `feature-audit-agent.mdc` | Feature/UX audit | Manual trigger | "run feature audit", "feature audit", "run ux audit", "ux audit" |
| `security-audit-agent.mdc` | Security audit | Manual trigger | "run security audit", "security audit" |
| `performance-cost-audit-agent.mdc` | Performance/cost audit | Manual trigger | "run performance audit", "performance audit", "run cost audit" |
| `reliability-ops-audit-agent.mdc` | Reliability/ops audit | Manual trigger | "run reliability audit", "reliability audit", "run ops audit" |
| `data-integrity-audit-agent.mdc` | Data integrity audit | Manual trigger | "run data integrity audit", "data integrity audit" |
| `business-valuation-audit-agent.mdc` | Business/valuation audit | Manual trigger | "run business audit", "business audit", "run valuation audit", "valuation audit" |
| `growth-funnel-audit-agent.mdc` | Growth funnel audit | Manual trigger | "run growth audit", "growth audit", "run funnel audit", "run activation audit" |
| `agent-governance-audit-agent.mdc` | Agent governance audit | Manual trigger | "run agent governance audit", "agent governance audit", "run ai governance audit" |

All files exist and have valid content. Trigger phrases are reasonable and discoverable.

### Audit lane → Process doc → Rule file → Output folder mapping

| Lane | Process doc | Exists | Rule file | Exists | Output folder | Exists |
|------|------------|--------|-----------|--------|---------------|--------|
| Code | `docs/process/code-audit-process.md` | Yes | `code-audit-agent.mdc` | Yes | `docs/audits/code/` | Yes |
| Math & Logic | `docs/process/math-logic-audit.md` | Yes | `math-audit-agent.mdc` | Yes | `docs/audits/math/` | Yes |
| Feature / UX / IA | `docs/process/feature-ux-audit-process.md` | Yes | `feature-audit-agent.mdc` | Yes | `docs/audits/feature/` | Yes |
| Security & Privacy | `docs/process/security-audit-process.md` | Yes | `security-audit-agent.mdc` | Yes | `docs/audits/security/` | Yes |
| Performance & Cost | `docs/process/performance-cost-audit-process.md` | Yes | `performance-cost-audit-agent.mdc` | Yes | `docs/audits/performance-cost/` | Yes |
| Reliability & Ops | `docs/process/reliability-ops-audit-process.md` | Yes | `reliability-ops-audit-agent.mdc` | Yes | `docs/audits/reliability-ops/` | Yes |
| Data Integrity | `docs/process/data-integrity-audit-process.md` | Yes | `data-integrity-audit-agent.mdc` | Yes | `docs/audits/data-integrity/` | Yes |
| Business & Valuation | `docs/process/business-valuation-audit-process.md` | Yes | `business-valuation-audit-agent.mdc` | Yes | `docs/audits/business/` | Yes |
| Growth Funnel | `docs/process/growth-funnel-audit-process.md` | Yes | `growth-funnel-audit-agent.mdc` | Yes | `docs/audits/growth-funnel/` | Yes |
| AI Agent Governance | `docs/process/agent-governance-audit-process.md` | Yes | `agent-governance-audit-agent.mdc` | Yes | `docs/audits/agent-governance/` | Yes |

**All 10 lanes are fully wired.** Every lane has a matching process doc, rule file, and output folder.

### Builder agent reference verification

`builder-agent.mdc` references these documents:

| Referenced doc | Path | Exists |
|---------------|------|--------|
| `docs/tasks.md` | Absolute | Yes |
| `docs/reference/roadmap.md` | Absolute | Yes |
| `docs/reference/engineering-spec.md` | Absolute | Yes |
| `docs/policies/design-spec.md` | Absolute | Yes |
| `docs/architecture-and-build-practices.md` | Absolute | Yes |
| `docs/policies/ownership-metrics.md` | Absolute | Yes |
| `docs/policies/analytics-math-policy.md` | Absolute | Yes |
| `docs/setup/manual-steps.md` | Absolute | Yes |

All references valid. Builder agent also includes context-specific checklists for new services, new pages, plan-gated features, and brand consistency.

### PM review checklist verification

`docs/process/pm-review-checklist.md` checklist items:

| Item | Status |
|------|--------|
| Build & lint (`npm run check`) | Present |
| Tests (if applicable) | Present |
| Scope match to acceptance criteria | Present |
| Design compliance | Present |
| Architecture compliance | Present |
| Ownership semantics | Present |
| Analytics math consistency | Present |
| Audit compatibility | Present |
| Audit gate | Present |
| Context-specific checks | Present |
| Docs (env vars, manual steps) | Present |

Complete and consistent with builder-agent requirements.

### `docs/cursor-agent-setup.md` accuracy

| Section | Accurate | Notes |
|---------|----------|-------|
| PM agent description | Yes | |
| Builder agent description | Yes | |
| Audit agents (11 listed) | Yes | All match actual `.mdc` files |
| Hooks description | Yes | |
| `.env.example` path | **No** | Uses `.env.example` instead of `app/.env.example` (M1) |
| `manual-steps.md` path | **No** | Uses `manual-steps.md` instead of `docs/setup/manual-steps.md` (M1) |

### PM agent workflow accuracy

`docs/process/pm-agent-workflow.md`:

| Section | Accurate | Notes |
|---------|----------|-------|
| Starting builder | Yes | |
| Phase review | Yes | |
| Command risk policy | Yes | References `shell-risk-policy.md` |
| Crash recovery | Yes | |
| `.env.example` reference | **Inconsistent** | Line 22 correct (`app/.env.example`), line 70 uses short form (M1) |
| Audit reference | Yes | Line 71 mentions `docs/audits/README.md` |

### `docs/architecture-and-build-practices.md` accuracy

| Reference | Valid | Notes |
|-----------|-------|-------|
| `.cursor/rules/builder-agent.mdc` | Yes | |
| `docs/process/pm-review-checklist.md` | Yes | |
| `docs/audits/README.md` | Yes | |
| `docs/process/` | Yes | |
| `docs/policies/analytics-math-policy.md` | Yes | |
| `proxy.ts` `isPublicRoute` | Yes | `app/proxy.ts` exists |

### Hooks configuration

`.cursor/hooks.json`:

| Hook | Purpose | Policy reference | Valid |
|------|---------|-----------------|-------|
| `beforeShellExecution` | Risk assessment before shell commands | `docs/shell-risk-policy.md` | **No** — should be `docs/policies/shell-risk-policy.md` (C1) |

---

## Stale reference summary

| Severity | Count | Details |
|----------|-------|---------|
| Critical | 1 | `.cursor/hooks.json` → `docs/shell-risk-policy.md` (should be `docs/policies/shell-risk-policy.md`) |
| High | 3 | `design-spec.md` → `pm-review-checklist.md` and `engineering-spec.md`; `ai-development-process-extraction.md` → `shell-risk-policy.md` |
| Medium | 3 | `cursor-agent-setup.md` and `pm-agent-workflow.md` → `.env.example` and `manual-steps.md` paths |
| Low | 1 | `pm-agent.mdc` trailing markdown artifact |

---

## Evidence reviewed

- All 11 files in `.cursor/rules/` (full content read)
- `.cursor/hooks.json` (hook configuration)
- `docs/cursor-agent-setup.md` (setup documentation)
- `docs/process/pm-agent-workflow.md` (PM workflow)
- `docs/process/pm-review-checklist.md` (review checklist)
- `.cursor/rules/builder-agent.mdc` (builder agent references)
- `docs/architecture-and-build-practices.md` (architecture doc)
- `docs/audits/README.md` (audit index)
- `docs/policies/design-spec.md` (design spec internal links)
- `docs/ai-development-process-extraction.md` (process extraction doc)
- All 10 process docs under `docs/process/` (existence verification)
- All 10 audit output folders under `docs/audits/` (existence verification)

---

## Risk & impact assessment

- **C1 (hooks.json path):** The shell risk policy may not be loaded before dangerous commands, effectively disabling the safety check. This is the highest-priority fix.
- **H1-H2 (broken links):** Agents following these references will fail to locate the correct documents, leading to incomplete review processes.
- **M1-M2 (path inconsistencies):** Confusion during setup or onboarding of a new operator/developer. Not blocking but reduces documentation trust.

---

## Recommendations (prioritized)

1. **Fix `.cursor/hooks.json`** — Update shell-risk-policy path from `docs/shell-risk-policy.md` to `docs/policies/shell-risk-policy.md`.
2. **Fix `docs/policies/design-spec.md` links** — Update `pm-review-checklist.md` to `../process/pm-review-checklist.md` and `engineering-spec.md` to `../reference/engineering-spec.md`.
3. **Fix `docs/ai-development-process-extraction.md`** — Update `docs/shell-risk-policy.md` references to `docs/policies/shell-risk-policy.md`.
4. **Standardize `.env.example` and `manual-steps.md` paths** — Use `app/.env.example` and `docs/setup/manual-steps.md` consistently in all docs.
5. **Align math audit report naming** — Update either `docs/audits/README.md` example or `math-audit-agent.mdc` pattern so both use the same naming convention.

---

## Task candidates

- [ ] Fix `.cursor/hooks.json` shell-risk-policy path.
- [ ] Fix `docs/policies/design-spec.md` internal links (pm-review-checklist, engineering-spec).
- [ ] Fix `docs/ai-development-process-extraction.md` shell-risk-policy references.
- [ ] Standardize `.env.example` path in `cursor-agent-setup.md` and `pm-agent-workflow.md`.
- [ ] Align math audit report naming convention.
- [ ] Remove trailing markdown artifact in `pm-agent.mdc`.

---

## Re-test checklist

- [ ] Trigger `beforeShellExecution` hook and verify it reads the correct shell-risk-policy file.
- [ ] Click/follow all internal links in `design-spec.md` and verify they resolve.
- [ ] Run each audit lane trigger phrase and verify the agent references the correct process doc.
- [ ] Verify `cursor-agent-setup.md` paths match actual file locations.

---

## Next trigger and cadence

- Trigger: any `.cursor/rules/` or audit process change
- Recommended next run: monthly
