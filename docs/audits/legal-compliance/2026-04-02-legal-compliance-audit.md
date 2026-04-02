# Legal & Compliance Audit — 2026-04-02

## Executive summary

- **Overall:** Alternative page content compares products at a **high level**; avoid implying third-party endorsement or trademark misuse. Current copy uses **generic** competitor names in context (“Stessa alternative”)—common fair-use pattern; **owner/counsel** should confirm if ever in doubt.
- **No new data collection** on alternative pages beyond existing analytics/signup flows.
- **Prior items:** Cookie consent / analytics disclosure (Vercel, gtag) — carryover from synthesis Schedule unless closed.

## Severity-ranked findings

### Critical

- None.

### High

- None from this static review.

### Medium

- **Comparative advertising:** Keep feature matrix **accurate**; update when competitors ship materially different features (ongoing product responsibility).

### Low

- Privacy policy “Data We Collect” if new marketing pixels added with design brief.

## Evidence reviewed

- `app/lib/marketing/competitor-data.ts` — feature booleans, copy tone
- Prior `2026-04-01-legal-compliance-audit-2.md` themes

## Risk & impact assessment

False comparative claims could create **legal/reputational** risk; engineering audit cannot certify marketing law compliance.

## Recommendations (prioritized)

1. **Product:** Annual review of competitor feature rows against public docs.
2. **Counsel:** Optional review of comparison pages if spend or visibility increases sharply.

## Task candidates (optional)

- [ ] (Human) Counsel review of competitor comparison matrix — if brand scales paid acquisition.

## Re-test checklist

- [ ] After any claim like “only” or “best,” remove or substantiate.

## Next trigger and cadence

- **Trigger:** Privacy/terms changes, new integrations, or marketing copy overhaul (design brief).
- **Cadence:** Quarterly.
