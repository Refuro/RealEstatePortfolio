# Security & Privacy Audit — 2026-04-02

## Executive summary

- **Overall:** Prior audit items (DELETE rate limits, mortgage POST/PATCH limits, account delete fail-closed on Stripe) are reflected in `lib/rate-limit.ts` (e.g. `properties:mortgage-post`, `properties:mortgage-patch`) and `tasks.md` completion notes.
- **Public routes:** `/alternatives/*` and `/vs/*` remain public per `proxy.ts` — no auth on comparison pages; no PII exposure in static competitor config.
- **No new attack surface** identified from alternative page copy/data changes.

## Severity-ranked findings

### Critical

- None new.

### High

- None new this pass.

### Medium

- **CSP:** Baseline CSP in report-only or enforcement remains a **Schedule/backlog** item from prior syntheses—unchanged.
- **Rate limit coverage:** When adding new **state-changing** API routes, pair with `RATE_LIMITS` + handler checks.

### Low

- Security doc table (`docs/security/security-notes.md`) should stay in sync when new limits ship.

## Evidence reviewed

- `app/lib/rate-limit.ts` — mortgage POST/PATCH keys
- `app/proxy.ts` — public route patterns (conceptual; path may vary)
- `app/lib/marketing/competitor-data.ts` — static marketing copy only

## Risk & impact assessment

Auth bypass or IDOR on protected routes would be Critical; this pass did not re-audit every API route exhaustively—**recommend** periodic route sweep after large API additions.

## Recommendations (prioritized)

1. On new API routes: **auth helper + Zod + rate limit** checklist from `architecture-and-build-practices.md`.
2. Continue fail-closed patterns for billing/destructive operations.

## Task candidates (optional)

- [ ] (Optional) Staging CSP enforcement timeline per prior synthesis (if not already tracked).

## Re-test checklist

- [ ] New routes: 401 for unauthenticated, 429 when rate limit exceeded.

## Next trigger and cadence

- **Trigger:** Auth, billing, account, or new integration changes.
- **Cadence:** Monthly.
