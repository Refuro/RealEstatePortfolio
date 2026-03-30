# Performance & Cost Audit — 2026-03-30

## Executive summary

- **Next.js 16** app uses dynamic routes appropriately; heavy charts are often client-loaded where needed.
- **External API cost** (RentCast) remains bounded by rate limits and quota surfacing; dashboard benchmark refresh has been capped vs unbounded bursts.
- **Recommendation:** Watch bundle size as analytics and marketing scripts grow; keep `next/image` on hot public pages per prior audits.

## Severity-ranked findings

### Critical

- None.

### High

- None new in this pass.

### Medium

- **RentCast / estimate usage** — Tier caps and hourly limits are product constraints; quota hints reduce surprise failures. *Evidence:* `docs/reference/rentcast-quota.md`, quota UI patterns.

### Low

- **Multiple lockfiles** — May affect tooling resolution; see Code audit note for Turbopack root warning.

## Evidence reviewed

- `docs/architecture-and-build-practices.md` (performance section)
- `app/next.config.ts` (headers, CSP)
- Dashboard/properties benchmark refresh patterns (conceptual review)

## Risk & impact assessment

Main cost risk is **upstream API usage** at scale, mitigated by limits and messaging.

## Recommendations (prioritized)

1. Keep image optimization on landing/pricing where assets are large.
2. Monitor RentCast call volume vs plan tiers as user count grows.

## Task candidates (optional)

- [ ] Periodic review of `optimizePackageImports` and chart code-splitting when adding heavy dependencies.

## Re-test checklist

- [ ] Lighthouse or manual check on `/` and `/dashboard` after major UI changes
- [ ] Verify benchmark refresh does not burst all properties on load

## Next trigger and cadence

- **Trigger:** New heavy UI dependency or external API integration
- **Cadence:** Monthly
