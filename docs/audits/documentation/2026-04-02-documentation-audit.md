# Documentation Audit — 2026-04-02

## Executive summary

- **Overall:** `docs/design/design-brief-2026.md` is a **new canonical strategic doc** for future visual work; `docs/policies/design-spec.md` remains active for **current** implementation per brief’s own scope statement.
- **Risk:** Teams should not treat both as equal “do this now”—**PM should mark** which spec governs each PR until migration completes.
- **Alternative pages:** No requirement to duplicate marketing copy in `docs/` beyond SEO/launch references; `competitor-data.ts` is source of truth for on-site strings.

## Severity-ranked findings

### Critical

- None.

### High

- None.

### Medium

- **Spec hierarchy:** Add explicit **“current vs future”** pointer in `docs/README.md` or `design-spec.md` header: “Visual overhaul: see `docs/design/design-brief-2026.md` (not yet implemented).”

### Low

- Cross-links from `seo-growth-plan.md` to alternative page structure if not already updated post-redesign.

## Evidence reviewed

- `docs/design/design-brief-2026.md` — supersedes relevant visual sections of design-spec
- `docs/policies/design-spec.md` — still referenced by audits
- `docs/README.md` — hub structure

## Risk & impact assessment

Conflicting specs confuse builders and AI agents—**documentation governance** issue, Medium.

## Recommendations (prioritized)

1. Single **Design** subsection in `docs/README.md`: link design-brief-2026 + implementation guide + current design-spec.
2. After design-brief Phase 1: archive or version design-spec sections superseded by brief.

## Task candidates (optional)

- [ ] Add 2–3 sentences to `docs/README.md` **Quick links** or **Reference** clarifying design-brief-2026 = future, design-spec = current until migration.

## Re-test checklist

- [ ] Grep for stale “design-spec only” claims in proposals after migration starts.

## Next trigger and cadence

- **Trigger:** Doc reorg, design-brief kickoff, or repeated confusion in PRs.
- **Cadence:** Monthly when docs are in flux.
