# Content Security Policy (CSP) rollout

**Last updated:** 2026-03-28

## Goals

- Reduce XSS impact with a clear Content Security Policy.
- Collect violation reports before blocking traffic.

## Current behavior

1. **Report-only** — By default, responses include `Content-Security-Policy-Report-Only` with a policy aligned to the app’s scripts, styles, and connections, plus `report-uri` pointing at `POST /api/csp-report` (absolute URL when `NEXT_PUBLIC_APP_URL` is set).
2. **Reporting endpoint** — Browsers POST JSON reports to `/api/csp-report`. The route is **public** (listed in `app/proxy.ts` alongside `/api/contact` and `/api/health`) so anonymous sessions on marketing pages can submit reports without Clerk redirects. In development, reports are logged to the server console. In production, when `NEXT_PUBLIC_SENTRY_DSN` is set, the route forwards grouped CSP violations to Sentry with light sampling so rollout monitoring stays actionable instead of noisy.

## Rollout plan

1. Deploy report-only policy and monitor CSP violations:
   - **Development / local:** server console output from `/api/csp-report`
   - **Production:** Sentry events tagged with `signal=csp` and message format `CSP violation: <directive>`
2. Triage violations for **30 days** (adjust as needed): fix inline scripts, adjust `connect-src` for required APIs, etc.
3. When violations are near zero on production traffic, set **`CSP_ENFORCEMENT=true`** in Vercel (production). This switches to a real **`Content-Security-Policy`** header (same policy body, still with `report-uri` for monitoring).
4. If a release breaks a critical route, disable `CSP_ENFORCEMENT` immediately and fix forward.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_APP_URL` | Base URL for `report-uri` (recommended in production). |
| `CSP_ENFORCEMENT` | Set to `true` to enforce CSP (not only report-only). |

## Smoke checks after enforcement

- Sign-in / sign-up (Clerk)
- Dashboard, properties, property detail
- Settings → export CSV, billing portal link
- Stripe checkout (redirect)

Do not enable enforcement until these pass on staging or preview with `CSP_ENFORCEMENT=true`.
