# AI Agent Governance Audit — 2026-04-01

## Executive summary

- **Overall health is good.** All 17 rule files are present and wired correctly. The 14-lane audit system (including Mobile experience and SEO) is consistently represented across `docs/audits/README.md`, `full-audit-agent.mdc`, `docs/process/full-audit-synthesis.md`, `docs/process/command-integrity-check.md`, and `docs/setup/ai-process-workflow-setup.md`. The key High finding from the 2026-03-31 audit (`command-integrity-check.md` missing Mobile experience row) has been resolved.
- **One Medium discrepancy remains:** `docs/cursor-agent-setup.md` line 148 still states "run all **12** audit lanes" in the Summary section, while the correct count is **14**. This is the only lane-count error still present across governance surfaces.
- **Low-severity drift in governance process doc and task hygiene:** `docs/process/agent-governance-audit-process.md` continues to omit explicit mention of the 14-lane count (a Low finding carried over from the 2026-03-31 audit with no action taken). Several fully-completed task sections in `docs/tasks.md` have not been archived. Phase 0–5 language in the PM rule and workflow doc is now historical rather than operational, though both still correctly defer to `docs/tasks.md` for live work.
- **Recommendation:** A single-pass doc update can close all open findings: correct the lane count in `cursor-agent-setup.md`, archive completed task sections, add a lane-count sentence to the governance process doc, and note the historical status of Phase 0–5 in the PM docs.

---

## Severity-ranked findings

### Critical

*(none)*

### High

*(none — the 2026-03-31 High finding about `command-integrity-check.md` missing Mobile experience has been resolved; the mapping table now includes all 14 lanes)*

### Medium

- **`docs/cursor-agent-setup.md` Summary section still states "12" audit lanes** — Line 148 reads: "run all **12** audit lanes and produce a consolidated, deduplicated synthesis." The correct count is **14** (confirmed in `docs/audits/README.md`, `full-audit-agent.mdc`, `docs/process/full-audit-synthesis.md` §6, and `docs/setup/ai-process-workflow-setup.md`). The file correctly lists all 14 rule files in the "Step 1" checklist (lines 94–111) and correctly includes the SEO process doc in the reference table (lines 37, 71–72), so this is an isolated number error in the prose summary, not a structural gap. **Risk:** A developer onboarding from the Summary section receives a misleading lane count; the discrepancy could cause a partial workflow copy. **Evidence:** `docs/cursor-agent-setup.md` line 148; `docs/audits/README.md` §Running audits (14 lanes); `.cursor/rules/full-audit-agent.mdc` (14 lanes); `docs/process/full-audit-synthesis.md` §6 (14 lanes).

### Low

- **`docs/process/agent-governance-audit-process.md` omits explicit 14-lane count and does not name SEO/Mobile experience lanes** — The §1 Scope reference list points to `docs/audits/README.md` (which is correct), but the process doc itself never states the total lane count or identifies SEO and Mobile experience by name. This is a carry-over Low finding from 2026-03-31 that has not been actioned. Operationally benign because the README is authoritative, but it reduces discoverability for anyone following only the governance process doc. **Evidence:** `docs/process/agent-governance-audit-process.md` §1; `docs/audits/README.md` (14 lanes including SEO, Mobile experience).

- **PM rule and workflow doc retain Phase 0–5 framing that is now historical** — `pm-agent.mdc` §Responsibilities item 1 references "Phase 0 Foundation → Phase 5 Polishing" from `docs/reference/engineering-spec.md` §8, and `docs/process/pm-agent-workflow.md` §Phases explicitly lists Phase 0–5. The project has completed all original phases and is now in product-feature expansion (new calculators, mobile shell, post-audit remediation). The operational impact is low because both docs correctly defer to `docs/tasks.md` for live tasks, but the Phase 0–5 framework could mislead a new PM about current project stage. **Evidence:** `.cursor/rules/pm-agent.mdc` (item 1); `docs/process/pm-agent-workflow.md` §Phases; `docs/tasks.md` (active tasks are new calculators, mobile shell verification, audit remediation — no longer Phase 0–5 structure).

- **`docs/tasks.md` fully-completed sections not yet archived** — Two sections are fully checked (`[x]` on every item) and represent completed implementation work that has not been moved to `docs/tasks-archived.md`: (1) "Calculator & tools — metric color / semantic treatment" (all 5 items `[x]`) and (2) "New calculators — STR vs LTR and Fix-and-flip (Phases A → C)" (Phases A, B, and C all complete). Additionally, "Full audit remediation — 2026-03-31 synthesis" Phases 1–8 are all `[x]` complete but the section header is still in the active file (deferred items are explicitly noted and belong). Leaving completed work in the active task file adds noise and makes it harder for the builder to identify actionable items on first read. **Evidence:** `docs/tasks.md` §Calculator & tools (all [x]); §New calculators Phases A–C (all [x]); `docs/tasks-archived.md` (prior archive pattern established).

- **`subagentStop` hook defaults to `.sh`; Windows follow-up may not fire without manual config** — `.cursor/hooks.json` invokes `.cursor/hooks/on-subagent-stop.sh`. On Windows hosts without Git Bash or WSL, the hook is silently skipped (no PM follow-up prompt after builder completes). Both `docs/cursor-agent-setup.md` and `docs/setup/ai-process-workflow-setup.md` document the PS1 workaround, so this is a workflow ergonomics gap, not an unaddressed governance risk. Carry-over Low from prior audits. **Evidence:** `.cursor/hooks.json` (command: `on-subagent-stop.sh`); `docs/cursor-agent-setup.md` §Windows note; `docs/setup/ai-process-workflow-setup.md` §Prerequisites.

- **`beforeShellExecution` hook is prompt-based and probabilistic** — The gate depends on the model interpreting the inline policy prompt correctly. Shell-risk-policy.md and the hook prompt are aligned (ALLOW / DENY / ASK categories match), but model misclassification remains a residual risk. No structural fix is available within the current hook architecture; accepting this risk is reasonable. Carry-over Low from prior audits. **Evidence:** `.cursor/hooks.json` (`"type": "prompt"`); `docs/policies/shell-risk-policy.md`.

---

## Evidence reviewed

### Rule files (`.cursor/rules/*.mdc`) — all 17 present

| Rule | Status |
|------|--------|
| `pm-agent.mdc` | Accurate; references `docs/tasks.md`, `engineering-spec.md`, `pm-review-checklist.md`, `manual-steps.md`, `roadmap.md`, `pm-agent-workflow.md` — all files confirmed present |
| `builder-agent.mdc` | Accurate; references `docs/policies/design-spec.md`, `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`, `docs/architecture-and-build-practices.md`, `docs/reference/roadmap.md`, `docs/reference/engineering-spec.md` — all confirmed present |
| `full-audit-agent.mdc` | Correct — states 14 lanes; lists all lanes including Mobile experience and SEO; references correct synthesis process |
| `agent-governance-audit-agent.mdc` | Accurate; correct output path and process doc reference |
| `code-audit-agent.mdc` | Accurate; correct process doc, output path, and subagent prompt |
| `math-audit-agent.mdc` | Accurate; correct process doc (`math-logic-audit.md`), output path |
| `feature-audit-agent.mdc` | Accurate; correct process doc and output path |
| `mobile-experience-audit-agent.mdc` | Accurate; references both `mobile-experience-audit-process.md` and `docs/qa/mobile-experience-audit.md`; correct output path (`docs/audits/feature/`) |
| `security-audit-agent.mdc` | Accurate; correct process doc and output path |
| `performance-cost-audit-agent.mdc` | Accurate |
| `reliability-ops-audit-agent.mdc` | Accurate |
| `data-integrity-audit-agent.mdc` | Accurate |
| `business-valuation-audit-agent.mdc` | Accurate |
| `growth-funnel-audit-agent.mdc` | Accurate |
| `seo-audit-agent.mdc` | Accurate; correct process doc and output path |
| `documentation-audit-agent.mdc` | Accurate |
| `legal-compliance-audit-agent.mdc` | Accurate; includes counsel-disclaimer reminder |

### Hook/policy alignment

| Surface | Status |
|---------|--------|
| `.cursor/hooks.json` | `beforeShellExecution` prompt categories (ALLOW/DENY/ASK) match `docs/policies/shell-risk-policy.md` exactly; `subagentStop` wired to `.sh` script |
| `docs/policies/shell-risk-policy.md` | Aligned with hook prompt; no drift |
| `docs/process/pm-agent-workflow.md` | Consistent with hook policy description |

### Audit lane coverage

| Document | Lane count stated | Accurate? |
|----------|-------------------|-----------|
| `docs/audits/README.md` | 14 | ✓ |
| `full-audit-agent.mdc` | 14 | ✓ |
| `docs/process/full-audit-synthesis.md` §6 | 14 | ✓ |
| `docs/process/command-integrity-check.md` mapping table | 14 rows | ✓ (resolved from 2026-03-31 High finding) |
| `docs/setup/ai-process-workflow-setup.md` | 14-lane (line 276) | ✓ |
| `docs/cursor-agent-setup.md` reference table (§1) | 14 rule files listed | ✓ |
| `docs/cursor-agent-setup.md` Summary prose (line 148) | **12** | ✗ — Medium finding |

### Process doc completeness (`docs/process/`)

All 14 lane process docs confirmed present:
`code-audit-process.md`, `math-logic-audit.md`, `feature-ux-audit-process.md`, `mobile-experience-audit-process.md`, `security-audit-process.md`, `performance-cost-audit-process.md`, `reliability-ops-audit-process.md`, `data-integrity-audit-process.md`, `business-valuation-audit-process.md`, `growth-funnel-audit-process.md`, `seo-audit-process.md`, `documentation-audit-process.md`, `legal-compliance-audit-process.md`, `agent-governance-audit-process.md`.

Supporting process docs also confirmed: `pm-review-checklist.md`, `pm-agent-workflow.md`, `full-audit-synthesis.md`, `audit-report-template.md`, `command-integrity-check.md`.

### Builder policy doc references

All policy docs referenced by `builder-agent.mdc` confirmed present: `docs/policies/design-spec.md`, `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`. Additionally, `docs/policies/calculator-metric-tones.md` was added since the last major builder rule update and is documented directly in `docs/tasks.md` (task-level reference), but is not in `builder-agent.mdc`'s references section. This is a minor gap; the policy doc is discoverable through task descriptions.

### `docs/tasks.md` hygiene

- No stale tasks referencing incorrect phases (all active tasks are clearly scoped)
- No duplicate entries observed
- Completed tasks: sections for "Calculator & tools — metric color" and "New calculators (Phases A–C)" are fully checked but remain in the active file
- Deferred items are clearly labeled and appropriate
- Archive pointer to `docs/tasks-archived.md` is present and current

### Prior audit resolution status (2026-03-31)

| Prior finding | Severity | Resolution |
|---------------|----------|------------|
| `command-integrity-check.md` missing Mobile experience row | High | ✓ **Resolved** — row now present |
| `cursor-agent-setup.md` docs table missing SEO row | Medium | ✓ **Resolved** — SEO process doc and audit folder row added |
| `ai-process-workflow-setup.md` optional rules missing `mobile-experience-audit-agent.mdc` | Medium | ✓ **Resolved** — file now listed |
| `agent-governance-audit-process.md` omits 14-lane count / SEO | Low | ✗ **Open** — carried forward as Low finding |
| `subagentStop` `.sh` / Windows ergonomics | Low | ✗ **Open** (by design — documented workaround) |
| Prompt-based `beforeShellExecution` is probabilistic | Low | ✗ **Open** (structural; accepted risk) |

---

## Risk & impact assessment

- **Medium risk (doc integrity):** The "12 lanes" count in `docs/cursor-agent-setup.md` is a factual error in the Summary section of a key onboarding document. If a developer or future PM uses only that blurb to orient to the audit system, they may plan for fewer audits than exist, or fail to copy the SEO and Mobile experience rule files when reproducing the workflow. The rest of the file is correct, limiting the exposure.
- **Low risk (PM workflow staleness):** The Phase 0–5 framing in PM docs is historical; current active work is task-list driven, which both docs already support. Risk is primarily confusion for new contributors.
- **Low risk (task hygiene):** Fully-completed sections in `docs/tasks.md` add noise but have no operational impact; the builder reads the task list before starting work and can identify checked vs unchecked items.
- **No new lane gaps identified:** The four lanes added in prior cycles (SEO, Mobile experience, Documentation, Agent Governance) are all wired correctly. The product's new features (STR vs LTR calculator, Fix-and-flip, metric tones) are covered by existing audit lanes (Code, Math, Feature/UX, Mobile experience, SEO, Growth).

---

## Recommendations (prioritized)

1. **Correct lane count in `docs/cursor-agent-setup.md`** — Change "run all **12** audit lanes" to "run all **14** audit lanes" in the Summary section (line 148). This is a one-word fix to the only remaining lane-count discrepancy across all governance surfaces.

2. **Archive completed task sections in `docs/tasks.md`** — Move "Calculator & tools — metric color / semantic treatment" and "New calculators — STR vs LTR and Fix-and-flip (Phases A → C)" to `docs/tasks-archived.md` under a new `§ Tasks.md archive (2026-04-01)` heading, following the established archive pattern. Keep "Full audit remediation — 2026-03-31 synthesis" deferred items in the active file.

3. **Add 14-lane sentence to `docs/process/agent-governance-audit-process.md`** — Under §1 Scope reference docs, add a note such as: "Full audits use **14** lanes per `docs/audits/README.md` (including SEO and Mobile experience)." This closes the carry-over Low finding from 2026-03-31.

4. **Add historical context note to PM phase docs** — In `docs/process/pm-agent-workflow.md` §Phases and/or `pm-agent.mdc`, note that Phase 0–5 describes the original engineering-spec build order (now completed); current work flows from `docs/tasks.md` directly.

5. **Consider adding `docs/policies/calculator-metric-tones.md` to `builder-agent.mdc` references** — If any future task involves calculator metric display, the builder should know to read this policy. Low urgency; can be added when the next calculator-related task is promoted.

---

## Task candidates

- [ ] Fix "12" → "14" in `docs/cursor-agent-setup.md` Summary/Full audit blurb.
- [ ] Archive completed task sections (calculator metric tones, new calculators Phases A–C) to `docs/tasks-archived.md`.
- [ ] Add 14-lane/SEO/Mobile sentence to `docs/process/agent-governance-audit-process.md` §1 reference docs.

---

## Re-test checklist

- [ ] Confirm `docs/cursor-agent-setup.md` Summary section says "14 audit lanes."
- [ ] Confirm `docs/tasks.md` active sections are limited to open/deferred work.
- [ ] Re-run governance audit after edits; confirm lane count is consistent across all 6 surfaces in the mapping table above.
- [ ] Spot-check that every `*-audit-agent.mdc` still points to an existing `docs/process/*` file (no new renames).
- [ ] `npm run check` only if code/config changes are made (not required for doc-only fixes).

---

## Next trigger and cadence

- **Trigger:** After any change to `.cursor/rules/`, `.cursor/hooks.json`, lane additions/renames, or major PM/builder workflow updates; otherwise monthly per `docs/audits/README.md`.
- **Recommended next run:** 2026-05-01 or next governance-affecting change, whichever is sooner.
