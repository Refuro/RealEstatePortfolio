# Reliability & Operations Audit — 2026-03-20

## Executive summary

- **Overall:** **`/api/health`** returns DB status via `prisma.$queryRaw` — suitable for load balancers. **`app/(app)/error.tsx`** calls **`Sentry.captureException`**. CI runs **lint + test** (`.github/workflows/ci.yml`); Husky can run same locally (repo root).
- **Top risks:** **Build** still primarily validated on Vercel / local `check` — see test infrastructure review §3.5; **runbooks** should stay current if on-call expands.
- **Recommendation:** Keep health endpoint lightweight; add synthetic checks in production monitoring when traffic warrants.

## Severity-ranked findings

### Critical

- *(none)*

### High

- *(none — error boundary + health present)*

### Medium

- **CI vs production build parity** — GitHub Actions may not run full `next build` with secrets/DB; failures may first appear on Vercel. Documented as intentional; remains an ops awareness item. — `docs/qa/test-infrastructure-review.md` §3.5

### Low

- **Health endpoint noise** — Ensure aggressive scrapers don’t DDoS `/api/health` (low risk at current scale; add edge rate limit if needed later).

## Evidence reviewed

- `app/app/api/health/route.ts`
- `app/app/(app)/error.tsx` — Sentry
- `.github/workflows/ci.yml` (reference)
- `docs/runbooks/incident-response.md` (existence check — present in repo per tasks)

## Risk & impact assessment

Observability is adequate for early-stage SaaS; gap is mainly **build verification path** and **on-call process** maturity as team grows.

## Recommendations (prioritized)

1. Use Vercel preview + manual smoke for releases until CI build story improves.
2. Re-read `docs/runbooks/incident-response.md` quarterly.

## Task candidates (optional)

- [ ] Add **uptime monitor** (external ping) on `/api/health` in production URL when launch is public.
- [ ] Consider **GitHub Actions** secret-backed build job when secrets/DB strategy matures.

## Re-test checklist

- [ ] `GET /api/health` — 200 with DB up, 503 when `DATABASE_URL` broken (staging test).
- [ ] Force a client error in dev — Sentry event received (if DSN configured).

## Next trigger and cadence

- **Trigger:** Incident, infra migration, or new background worker.
- **Next window:** Monthly / post-launch hardening.
