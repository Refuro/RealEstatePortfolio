# Audit Report Template (Canonical)

Use this template for all AI-run audits unless a lane process explicitly requires extra sections.

**For agents:** Phrases like “audit only” or “no code changes” mean **do not modify application or library source** (for example under `app/`). Writing this report file under `docs/audits/` is **required**, not optional—run in Agent mode with writes enabled, not Ask/read-only.

---

## Required structure

```markdown
# <Audit Lane> Audit — YYYY-MM-DD

## Executive summary

- 2-4 bullets: overall health, top risks, overall recommendation.

## Severity-ranked findings

### Critical
- <finding> — <risk/impact> — <evidence path>

### High
- ...

### Medium
- ...

### Low
- ...

## Evidence reviewed

- Paths/surfaces/endpoints/files reviewed
- Any key assumptions/limits of the audit pass

## Risk & impact assessment

- Business/user impact of unresolved findings
- Short note on likelihood and exposure

## Recommendations (prioritized)

1. <priority 1 recommendation>
2. <priority 2 recommendation>
3. <priority 3 recommendation>

## Task candidates (optional)

Include only if findings warrant implementation work. Omit section if audit found no actionable gaps.

- [ ] <task candidate 1>
- [ ] <task candidate 2>
- [ ] <task candidate 3>

## Re-test checklist

- [ ] Verify fix for <critical/high finding>
- [ ] Verify no regression in adjacent area
- [ ] `npm run check` (when code changes are made)

## Next trigger and cadence

- Trigger: <release/monthly/quarterly/pre-launch>
- Recommended next run date/window: <date or cadence>
```

---

## Requirements

- Findings must be evidence-backed (path/surface references).
- Severity must reflect impact and urgency.
- Recommendations must be implementation-oriented.
- When present, task candidates must be small enough to move into active backlog quickly. Omit the Task candidates section if there are no actionable findings — do not invent work.
- Audits are review-only; do not make code changes during audit runs.
