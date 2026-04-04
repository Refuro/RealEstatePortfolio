# AI Agent Governance Audit — 2026-04-03 (run 2)

## Executive summary

- **Overall health:** All **14** audit lane rules exist under `.cursor/rules/` with matching process docs in `docs/process/` and lane coverage in `docs/audits/README.md`. `docs/process/full-audit-synthesis.md` and `.cursor/rules/full-audit-agent.mdc` consistently describe **14** lanes (including Mobile experience and SEO). `docs/process/command-integrity-check.md` lane mapping table lists all **14** lanes and matches the README. `docs/setup/ai-process-workflow-setup.md` optional audit section includes `seo-audit-agent.mdc` and mentions `run SEO audit` alongside mobile and full audit.
- **Top risks:** The **morning audit Schedule item remains open:** `docs/cursor-agent-setup.md` **Step 1** still **does not list** `.cursor/rules/seo-audit-agent.mdc` (the table in § “Files and folders” does document SEO). **Audit execution model** remains **split** (lane rules often say “launch a subagent” vs README / `full-audit-agent.mdc` emphasizing **Agent** mode with writes). **Skill paths in new plans** point to `.cursor/skills/veld-*/SKILL.md`, but **`RealEstatePortfolio/.cursor/` has no `skills/` tree** in this workspace—skills live at the parent `RealEstateProject/.cursor/skills/`; clones that contain only `RealEstatePortfolio` may not resolve those paths without copying skills into the repo.
- **Overall recommendation:** **Close the Schedule item** by adding `seo-audit-agent.mdc` to Step 1; keep **one documented default** for audit execution (subagent vs in-thread); optionally **document or relocate** Veld skills so plan references resolve in a single-repo checkout.

## Severity-ranked findings

### Critical

- None identified in this pass.

### High

- None identified in this pass.

### Medium

- **`docs/cursor-agent-setup.md` Step 1 still omits the SEO audit rule** — The numbered clone list under “Step 1: Get the Cursor files from the repo” (lines 91–111) jumps from `growth-funnel-audit-agent.mdc` to `agent-governance-audit-agent.mdc` and **does not include** `.cursor/rules/seo-audit-agent.mdc`. The same document’s table in § “1. `.cursor/`” **does** document SEO (line 37). **Impact:** Coworkers following **only** the Step 1 bullet list can omit the SEO lane rule when replicating Cursor files. **Status:** Same gap called out in the **morning** audit (`docs/audits/agent-governance/2026-04-03-agent-governance-audit.md`, Medium finding + task candidate); **not yet fixed**. **Evidence:** `docs/cursor-agent-setup.md` lines 91–107.

- **Audit execution model remains inconsistent across artifacts** — `docs/audits/README.md` (Running audits) and `.cursor/rules/full-audit-agent.mdc` require **Agent** mode with writes and allow Task subagents if read-only is off. `.cursor/rules/agent-governance-audit-agent.mdc` still instructs **“Launch one subagent (generalPurpose)”** as step 1. `docs/process/agent-governance-audit-process.md` describes review steps without mandating a subagent. **Impact:** Conflicting defaults for who runs a lane (parent vs Task). **Evidence:** `docs/audits/README.md` § Running audits; `.cursor/rules/full-audit-agent.mdc` § What to do item 5; `.cursor/rules/agent-governance-audit-agent.mdc` § What to do item 1; `docs/process/agent-governance-audit-process.md` § 4 Execution.

### Low

- **Lane rename checklist still differs between two canonical docs** — `docs/audits/README.md` “Lane structure contract” lists **six** update targets (including referenced process docs / lane `README.md`). `docs/process/command-integrity-check.md` “Lane rename rule” lists **five** items and does not explicitly call out lane-level README files. **Impact:** During a rename, a contributor might follow one list and miss an item. **Evidence:** `docs/audits/README.md` § Lane structure contract; `docs/process/command-integrity-check.md` § Lane rename rule.

- **`docs/cursor-agent-setup.md` summary under-lists focused audits** — The “Other focused audits” sentence (lines 146–147) names a subset of lanes and defers to `docs/audits/README.md`. SEO, Mobile experience, Documentation, and Legal are not all named there (full audit paragraph elsewhere does mention Mobile + SEO). **Evidence:** `docs/cursor-agent-setup.md` lines 142–148.

- **New plans: skill file paths vs repo layout** — `docs/archive/plans/2026-04-03-pricing-page-premium-plan.md` and the copy-paste prompt reference `.cursor/skills/veld-ui/SKILL.md`, `veld-mobile`, `veld-landing-cta`, and `docs/design/design-spec-2026.md` (the design spec path exists under `RealEstatePortfolio/docs/design/`). The **`.cursor/skills/`** paths **do not exist under** `RealEstatePortfolio/.cursor/` in this workspace; they exist at **`RealEstateProject/.cursor/skills/`** (sibling to the app repo). **Impact:** Agents or humans using **only** the `RealEstatePortfolio` tree may not find skills at the referenced paths unless the workspace root is the monorepo or skills are vendored into the repo. **Evidence:** glob of `RealEstatePortfolio/.cursor/` (rules + hooks only); `RealEstateProject/.cursor/skills/*/SKILL.md` present.

- **Landing CTA plan vs skill literal wording (minor)** — `docs/archive/plans/2026-04-03-landing-mobile-cta-plan.md` proposes bottom CTA label **“Create your free account”** while `.cursor/skills/veld-landing-cta/SKILL.md` lists **“Create free account”** as an approved primary variant. **Impact:** Low; likely acceptable marketing nuance, but PM should confirm alignment with the skill’s approved phrases.

- **Historical archive references older lane counts** — `docs/tasks-archived.md` still contains checkbox text referencing **“12 lanes”** for older agent-setup tasks; current canonical count is **14** (already noted in `docs/audits/documentation/2026-04-03-documentation-audit.md`). **Impact:** Confusion only if someone treats archived tasks as current. **Evidence:** grep hit on `docs/tasks-archived.md`; `docs/audits/README.md` full audit description.

## Evidence reviewed

- `docs/process/agent-governance-audit-process.md`, `docs/process/audit-report-template.md`
- Morning audit: `docs/audits/agent-governance/2026-04-03-agent-governance-audit.md`
- `docs/cursor-agent-setup.md` (table + Step 1 + summary paragraphs)
- `.cursor/rules/*.mdc` — glob: **17** files (14 `*-audit-agent.mdc`, plus `pm-agent`, `builder-agent`, `full-audit-agent`)
- `docs/audits/README.md` (lane table, lane structure contract, running audits)
- `docs/process/command-integrity-check.md` (mapping table, lane rename rule)
- `docs/process/full-audit-synthesis.md` (§ Audits included, § 6 Execution — 14 lanes)
- `docs/setup/ai-process-workflow-setup.md` (optional audit rules list, SEO + mobile prompts)
- `docs/archive/plans/2026-04-03-pricing-page-premium-plan.md`, `2026-04-03-embedded-mockups-plan.md`, `2026-04-03-landing-mobile-cta-plan.md`
- Parent workspace: `RealEstateProject/.cursor/skills/veld-ui|veld-mobile|veld-landing-cta/SKILL.md` (existence check)

**Assumptions / limits:** Did not re-execute shell hook behavior or Cursor UI. Did not diff every `*-audit-agent.mdc` body against its process doc line-by-line; mapping table and README were treated as the integration contract.

## Risk & impact assessment

The **open Step 1 gap** is the highest **practical** governance risk in this pass: it directly affects **onboarding accuracy** for SEO audit coverage. **Execution-model** inconsistency continues to affect **repeatability** and traceability of audit runs. **Skill path** mismatch affects **implementability** of today’s plans in a **single-folder** clone unless skills are present at referenced paths.

Unresolved **Low** items affect clarity (rename checklists, partial “Other focused audits” list, archived task wording), not core security or data integrity.

## Recommendations (prioritized)

1. **Add `.cursor/rules/seo-audit-agent.mdc` to `docs/cursor-agent-setup.md` Step 1** (between `growth-funnel-audit-agent.mdc` and `agent-governance-audit-agent.mdc`, or in strict alphabetical order—match existing list convention). This closes the morning **Schedule** item.

2. **Align audit execution wording** across `docs/audits/README.md`, `docs/process/agent-governance-audit-process.md`, and `*-audit-agent.mdc` files: either state that the **main Agent** may run lanes in-thread, or state that **Task subagents are recommended**—pick one default and reflect it in governance lane rules.

3. **Reconcile lane rename checklists** — Extend `docs/process/command-integrity-check.md` “Lane rename rule” to match `docs/audits/README.md` § Lane structure contract (or add a single “see README § Lane structure contract” pointer to avoid duplication drift).

4. **Skills + plans:** Either **vendor** `.cursor/skills/veld-*` into `RealEstatePortfolio` for portable paths, or **document** in `docs/cursor-agent-setup.md` that Veld skills may live at `<monorepo>/.cursor/skills/` when using a multi-root workspace—so plan prompts stay accurate.

5. **Optional:** Broaden the “Other focused audits” sentence in `docs/cursor-agent-setup.md` to name SEO, Mobile, Documentation, and Legal or replace with “all lanes listed in `docs/audits/README.md`.”

6. **Optional:** Confirm “Create your free account” vs “Create free account” with `veld-landing-cta` before shipping the landing CTA plan.

## Task candidates (optional)

- [ ] Add `.cursor/rules/seo-audit-agent.mdc` to `docs/cursor-agent-setup.md` Step 1 clone list (closes morning Schedule item).
- [ ] Align audit execution wording (subagent vs main Agent) across README, governance process doc, and `*-audit-agent.mdc` files.
- [ ] Reconcile `command-integrity-check.md` lane rename list with `docs/audits/README.md` § Lane structure contract.
- [ ] Resolve Veld skill path portability (vendor skills into repo or document monorepo vs single-repo layout).

## New plans / policies (2026-04-03) — governance fit

| Plan | New audit lane or `.mdc` rule needed? | Notes |
|------|----------------------------------------|--------|
| `2026-04-03-pricing-page-premium-plan.md` | **No** | Open-ended UI/motion work; governed by existing **Feature/UX**, **Mobile**, **Growth**, **Performance** audits and **veld-*** skills—not a new governance primitive. |
| `2026-04-03-embedded-mockups-plan.md` | **No** | Implementation plan; **Code**, **Feature/UX**, **Performance** cover regressions; no new policy doc required. |
| `2026-04-03-landing-mobile-cta-plan.md` | **No** | Executable checklist aligned with **veld-landing-cta** / **veld-mobile**; **Growth Funnel** audit remains the right post-ship check. |

No new `docs/process/*` files or agent rules are **required** solely because these plans exist; follow-up is adequately covered by existing lanes and skills **once skill paths resolve in the workspace**.

## Skill references vs plans

- **Naming:** Plans consistently reference **`veld-ui`**, **`veld-mobile`**, and **`veld-landing-cta`** in line with skill folder names at `RealEstateProject/.cursor/skills/`.
- **Paths:** Repo-relative `.cursor/skills/...` in plans matches the parent workspace but **not** `RealEstatePortfolio/.cursor/` alone—see Medium/Low findings above.
- **Copy:** Minor nuance on **“Create your free account”** vs skill phrase **“Create free account”**—see Low finding.

## Re-test checklist

- [ ] After doc fix: re-read `docs/cursor-agent-setup.md` Step 1 against `.cursor/rules/*-audit-agent.mdc` glob (**14** lane rules + `full-audit-agent.mdc` as orchestrator).
- [ ] After execution-model change: run one governance audit in main Agent and one via Task; confirm report path under `docs/audits/agent-governance/`.
- [ ] `npm run check` — only when application or library source changes (not required for doc-only governance fixes).

## Next trigger and cadence

- **Trigger:** Monthly per `docs/audits/README.md`; or after changes to `.cursor/rules`, `.cursor/hooks.json`, PM/builder process docs, or **same-day repeat** when validating Schedule items from an earlier synthesis.
- **Recommended next run:** 2026-05-03 or after any lane rename, hook policy change, or bulk update to `docs/cursor-agent-setup.md` / `docs/setup/ai-process-workflow-setup.md`.
