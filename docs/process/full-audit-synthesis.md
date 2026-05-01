# Full Audit Synthesis Process

**Purpose:** When all audit lanes are run together, produce one consolidated, deduplicated task list from all reports. Avoids overlap and creates a cohesive backlog for PM review.

**Trigger:** Only when user says "run full audit" or "run all audits" — not when running a single lane.

---

## 1. Prerequisites

- All lane reports from the same run exist under `docs/audits/` (typically `docs/audits/<lane>/YYYY-MM-DD-*-audit.md`). **Exception:** Mobile experience reports use `docs/audits/feature/YYYY-MM-DD-mobile-experience-audit.md`.
- Use the run date (e.g., `2026-03-19`) to identify which reports belong to this full-audit run.

---

## 2. Inputs

Collect task candidates from each report's "Task candidates" or "Task candidates (optional)" section. Skip:

- Reports that omit the section (no actionable findings).
- Re-test checklist items (those are verification steps, not implementation tasks).
- Items that are clearly "verify X" or "manual QA" — those stay in re-test, not task list.

---

## 3. Synthesis steps

### 3.1 Collect

From each report, extract implementation-oriented task candidates (lines starting with `- [ ]` that describe code/docs changes, not verification).

### 3.2 Deduplicate

Merge tasks that are semantically the same:

- **Same file + same action** → one task (e.g., "Add Sentry.captureException to error.tsx" from Performance and Reliability → one task).
- **Same fix, different wording** → one task (e.g., "Fix signInUrl" and "Correct sign-up page sign-in link" → one task).
- **Heuristics:** Same file path, same action verb, or clearly identical fix → consolidate.

When merging, keep the most specific/actionable wording. Note source lanes for traceability.

### 3.3 Prioritize

Order by source finding severity (from the audit that produced the task):

1. Critical
2. High
3. Medium
4. Low

Within same severity, order by domain (Security first, then UX, Performance, Reliability, Data, Growth, SEO, Governance, Math, Business).

### 3.4 Group

Group consolidated tasks by domain:

- **Security** — CSP, rate limiting, logging, auth, secrets
- **UX / Feature** — Nav, IA, CTAs, styling, modals
- **Mobile experience** — Narrow viewport shells, safe-area, touch (dedupe with Feature when the same fix)
- **Performance** — Lazy loading, caching, throttling, bundle size
- **Reliability** — Error boundaries, Sentry, health check, runbooks
- **Data Integrity** — Import/export, schema, validation
- **Growth** — Onboarding, funnel, conversion, screenshots
- **SEO** — Metadata, sitemap/robots, canonicals, structured data, indexability
- **Governance** — Rules, hooks, docs, stale references
- **Math** — Projections, metrics, export columns
- **Business** — Analytics, tests, changelog, launch
- **Documentation** — Stale docs, archive candidates, broken references, folder hygiene
- **Legal / Compliance** — Privacy, terms, consent, billing/marketing disclosure issues

### 3.5 Triage (PM — what to promote to `tasks.md`)

After grouping, **classify every consolidated item** into one of four buckets. Audits do **not** require inventing work; this step prevents “noise” from reading as mandatory. **Promote to [`docs/tasks.md`](../tasks.md) only from *Ship* and *Schedule* unless you explicitly accept optional work.**

| Bucket | Meaning | Typical sources |
|--------|---------|-----------------|
| **Ship** | Tackle in the **next** implementation window: unresolved **Critical/High** from lanes, or **Medium** with clear user, security, SEO rich-result, or data-integrity risk. | Security, SEO (guideline risk), reliability of destructive flows |
| **Schedule** | **Bounded Medium** improvements: UX/a11y, perf refactors with plan, docs that unblock teams, growth polish. Not blocking release if triage says so. | Feature, Growth, Mobile, Performance (non-experimental) |
| **Optional / backlog** | **Low**, “optional”, “evaluate”, tech-debt refactors, **future** upgrades (e.g. next major). Explicit **won’t fix** can move here with a one-line reason in the synthesis. | Code maintainability XL, Prisma-next-major, optional DRY |
| **Human-only / deferred** | **Legal counsel**, **owner sign-off**, **manual device QA**, **analytics verification in vendor UI**, anything AI cannot complete alone. | Business, Legal (counsel), manual viewport matrix |

**“Clean” audit:** Reasonable goal = **no open items in *Ship*** after a pass; *Optional* may stay non-empty. Empty task-candidate sections on a lane report are valid when there are no actionable gaps.

---

## 4. Output

Write to `docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md`. Include **§3.5 PM triage** as the primary promotion view. The flat **Consolidated task list** (by domain) is optional; use it as an **appendix** if you want both triage and a full inventory in one file.

```markdown
# Full Audit Synthesis — YYYY-MM-DD

## Audits included

- Code
- Math & Logic
- Feature / UX / IA
- Mobile experience
- Security & Privacy
- Performance & Cost
- Reliability & Operations
- Data Integrity & Reconciliation
- Business & Valuation
- Growth Funnel & Activation
- SEO (search & discovery)
- Documentation
- Legal & Compliance
- AI Agent Governance

(Include only lanes that were run and had reports.)

## Consolidated task list

### Security
- [ ] <task 1>
- [ ] <task 2>

### UX / Feature
- [ ] <task 1>
...

### Performance
...

### Reliability
...

### Data Integrity
...

### Growth
...

### SEO
...

### Governance
...

### Math
...

### Business
...

### Documentation
...

### Legal / Compliance
...

## PM triage (this run)

Classify consolidated items per §3.5. **Ship** and **Schedule** are the default promotion targets for `tasks.md`.

### Ship (next window)
- [ ] ...

### Schedule (next batch)
- [ ] ...

### Optional / backlog
- [ ] ...

### Human-only / deferred
- [ ] ...

## PM review

Review triage above. Promote **Ship** and **Schedule** items to [docs/tasks.md](../tasks.md) unless explicitly deferred. The builder implements approved items.
```

---

## 5. Deduplication examples

| Duplicate sources | Consolidated task |
|-------------------|-------------------|
| Performance + Reliability: "Add Sentry.captureException to error.tsx" | Add `Sentry.captureException(error)` to `app/(app)/error.tsx` |
| Security + AP1: "Add CSP" | Add baseline CSP (report-only mode) to `next.config.ts` |
| Data Integrity + Math: "Add NOI and annual cash flow to export" | Add NOI and annual cash flow columns to portfolio export |
| Feature + Growth: "Add product screenshots" | Add product screenshots to landing and pricing pages |
| Performance + SEO: "Slow LCP on landing hero" | Optimize hero image / loading (Performance lead; SEO notes snippet impact) |

---

## 6. Execution

When the agent runs a full audit:

1. Run all **14** lane processes (Code, Math, Feature/UX, **Mobile experience**, Security, Performance/Cost, Reliability/Ops, Data Integrity, Business/Valuation, Growth Funnel, **SEO**, Documentation, Legal/Compliance, Agent Governance). If a lane is intentionally skipped (e.g. unchanged codebase for Code), note it in the synthesis **Audits included** section.
2. Write each report to `docs/audits/<lane>/YYYY-MM-DD-*-audit.md`.
3. Run this synthesis process.
4. Write output to `docs/audits/synthesis/YYYY-MM-DD-audit-synthesis.md`.
5. Present synthesis to user for PM review and promotion to tasks.md.
6. **PM checklist — two-file rule:** In the **same pass**, update both [`docs/README.md`](../README.md) (hub “latest synthesis” / quick links) and [`docs/audits/synthesis/README.md`](../audits/synthesis/README.md) so they point at the new `*-audit-synthesis.md`. Stale hub entries are a recurring documentation audit finding; do not ship synthesis without updating **both** files.

**Execution mode:** Use **Agent** mode with writes enabled (not Ask mode, not read-only subagents). **"No code changes"** applies to product source such as `app/`; writing these markdown files is required.
