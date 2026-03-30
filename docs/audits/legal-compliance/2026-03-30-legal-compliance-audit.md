# Legal & Compliance Audit — 2026-03-30

**Disclaimer:** This audit is a practical screening pass only. It is **not legal advice** and not a substitute for licensed counsel.

## Executive summary

- **Privacy and terms** pages exist and are reviewed on a cadence; cookie/consent gating for analytics and ads is implemented with documented behavior.
- **Billing and pricing** surfaces should stay aligned with terms and actual Stripe behavior.
- **Recommendation:** Before major marketing pushes or new jurisdictions, have counsel review privacy/terms and any new claims.

## Severity-ranked findings

### Critical

- None identified in static review.

### High

- None requiring immediate code change from this pass.

### Medium

- **Operating entity / terms** — Any `TODO(legal)` or entity name alignment noted in business docs should be resolved before formal partnerships. *Evidence:* `docs/tasks.md` Batch 11 notes (historical).

### Low

- **Copy drift** — When UI changes, confirm privacy policy still describes actual tracking and cookies.

## Evidence reviewed

- `app/app/privacy/page.tsx`, `app/app/terms/page.tsx` (conceptual)
- `docs/launch/analytics.md`, `docs/security/security-notes.md`
- `docs/process/legal-compliance-audit-process.md` scope and exclusions

## Risk & impact assessment

Residual risk is **regulatory and contractual**, not fully visible from code review alone.

## Recommendations (prioritized)

1. Keep privacy/terms “last updated” dates consistent with substantive edits.
2. When adding new third-party scripts, update privacy disclosure and consent gating together.

## Task candidates (optional)

- None mandatory from this screening pass; escalate specific questions to counsel.

## Re-test checklist

- [ ] First-visit consent flow with analytics envs set
- [ ] Privacy policy mentions PostHog, ads, and cookies consistent with runtime

## Next trigger and cadence

- **Trigger:** Privacy/terms/cookie/billing/marketing-copy changes or pre-launch
- **Cadence:** Quarterly
