# Performance & Cost Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** `next.config.ts` enables `experimental.optimizePackageImports` for `lucide-react` and `recharts`. Chart-heavy UI uses `next/dynamic` with `ssr: false` and loading placeholders on the dashboard.
- **Top risks:** **RentCast** usage is centralized with tier hourly caps (`lib/plans.ts` `RENTCAST_HOURLY_LIMITS`); all RentCast-backed features share one counter pool per user (`docs/reference/rentcast-quota.md` pattern) — a burst on one feature (e.g. value estimate) consumes quota for others.
- **Recommendation:** Monitor RentCast row growth and consider per-endpoint budgets if user complaints arise; keep CSV import/export rate limits as documented.

## Severity-ranked findings

### Critical

- None.

### High

- **Shared RentCast hourly pool** — Cost / UX surprise — Documented design: rent estimate, value estimate, and benchmark refresh share `RentCastApiCall` counting. Users hitting refresh repeatedly can starve other estimate actions within the hour.

### Medium

- **Large client bundles on property routes** — TTI — Mortgage and property detail modules are large; code-splitting at route level helps, but further splitting reduces main-thread parse cost (see Code audit).

### Low

- **Sentry** — Overhead — `instrumentation.ts` loads Sentry server/edge configs; acceptable for production diagnostics.

## Evidence reviewed

- `app/next.config.ts` — `optimizePackageImports`, headers
- `app/app/(app)/dashboard/dashboard-charts.tsx` — dynamic imports
- `app/lib/plans.ts` — `RENTCAST_HOURLY_LIMITS`, comments on shared pool
- `docs/reference/rentcast-quota.md` (referenced)
- `app/lib/rate-limit.ts` — export/import limits

## Risk & impact assessment

Primary **cost** driver is external API usage (RentCast), mitigated by DB-backed limits. **Frontend** cost is mostly chart libraries — already dynamically loaded on key pages.

## Recommendations (prioritized)

1. Surface remaining RentCast quota in UI where multiple actions compete (optional product improvement).
2. Continue lazy-loading any new chart or spreadsheet dependencies.
3. Review Prisma query patterns when adding list endpoints (avoid N+1; use `include` judiciously).

## Task candidates (optional)

- [ ] Product: show “RentCast uses remaining this hour” on estimate/refresh surfaces (ties to Growth/UX).

## Re-test checklist

- [ ] Lighthouse or Web Vitals spot-check on `/dashboard` and `/properties/[id]` after perf-related code changes.

## Next trigger and cadence

- Trigger: monthly or new heavy dependency / external API
- Recommended next run: 2026-04-28
