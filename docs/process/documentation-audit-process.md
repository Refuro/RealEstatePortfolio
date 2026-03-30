# Documentation Audit Process

**Purpose:** Review the repo's documentation for freshness, discoverability, broken references, archive candidates, and folder hygiene without turning the audit into an implementation pass.
**Status:** Active.

---

## 1. Scope

Audit the documentation system under `docs/` plus any directly related audit/governance files that control documentation workflow:

- `docs/`
- `docs/audits/README.md`
- `docs/process/command-integrity-check.md`
- `.cursor/rules/*-audit-agent.mdc` when lane wiring affects doc discoverability

This lane should identify documentation risks and cleanup recommendations. It should **not** rewrite product code or quietly expand scope into feature implementation.

---

## 2. Audit dimensions

- **Freshness and staleness:** docs that no longer match shipped behavior, duplicated guidance, or stale status markers
- **Broken references:** missing files, outdated links, renamed docs, and lane/path drift
- **Archive candidates:** documents that should move to archive/history so active docs stay readable
- **Folder hygiene:** confusing placement, inconsistent naming, or areas where a short index/README would reduce drift
- **Workflow clarity:** whether PM/builder/audit docs point to the right source-of-truth files
- **Boundary clarity:** whether findings are clearly separated into:
  - doc cleanup recommendations
  - process/governance updates
  - product implementation follow-ups that should become normal tasks later

---

## 3. Output

Write report to:

- `docs/audits/documentation/YYYY-MM-DD-documentation-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

The report should keep implementation recommendations clearly labeled as follow-up tasks, not immediate audit actions.

---

## 4. Execution

1. Review the highest-level docs first (`docs/README` equivalents, audit index, workflow/process docs, roadmap/tasks if relevant).
2. Sample across major doc areas: setup, process, policies, launch, audits, reference, runbooks, owner/internal docs.
3. Verify that links, paths, and lane names still resolve after recent repo changes.
4. Call out stale docs, duplicate docs, archive candidates, and missing connective tissue.
5. Separate documentation cleanup from product/code work.
6. Audit only; do not make code changes.

---

## 5. References

- `docs/audits/README.md`
- `docs/process/command-integrity-check.md`
- `docs/tasks.md`
- `docs/reference/roadmap.md`
