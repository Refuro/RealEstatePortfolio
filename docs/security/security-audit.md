# Security Audit

**Version:** 2.1  
**Last updated:** 2026-03-31  
**Last reviewed by:** PM + security review pass  
**Review cadence:** Monthly + pre-launch gate  
**Scope:** Real Estate Portfolio app — auth, API, data, integrations, and operational security posture.

---

## 1. Current Security Posture

### 1.1 Strengths

| Area | Status | Notes |
|------|--------|-------|
| **Auth** | ✅ Strong | Clerk protects non-public routes and auth flow is centralized. |
| **Authorization** | ✅ Strong | Data access scoped by `userId`; helper patterns reduce IDOR risk. |
| **Input validation** | ✅ Strong | Zod validation is established on API routes. |
| **Injection/XSS controls** | ✅ Strong | Prisma parameterized queries; no known unsafe HTML eval patterns in core app. |
| **Secrets handling** | ✅ Strong | Server-only env vars for sensitive keys. |
| **Webhook security** | ✅ Strong | Stripe webhook signature verification enforced. |
| **Deleted account controls** | ✅ Strong | Deleted-user API blocking and restore flow in place. |
| **Security headers** | ✅ Implemented | X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy; see §5 CSP. |
| **CSP** | ✅ Implemented | Baseline CSP via `next.config.ts` — **Report-Only** by default; set `CSP_ENFORCEMENT=true` for enforced `Content-Security-Policy`. |
| **Rate limiting (RentCast + exports + writes)** | ✅ Implemented | Shared hourly RentCast quota per tier (`lib/plans.ts`); DB-backed `ApiRateLimitEntry` for selected routes — see §6 and [security-notes.md](security-notes.md). |

### 1.2 Open gaps & recommendations (current)

| Gap | Risk | Recommendation |
|-----|------|----------------|
| **Coverage gap for additional endpoints** | Medium | Extend `RATE_LIMITS` in `lib/rate-limit.ts` to more write-heavy routes as abuse patterns emerge. |
| **CSP enforcement vs Report-Only** | Low–Medium | Monitor `/api/csp-report` + Sentry before enabling `CSP_ENFORCEMENT=true` in production. |
| **Security event/audit logging depth** | Medium | Add structured logging for admin-sensitive actions and failed auth-sensitive operations. |
| **Operational security playbook** | Medium | Add incident response + secret-rotation runbook in docs. |
| **Dependency/SCA cadence not explicit** | Low-Medium | Add recurring dependency risk scan check in reliability/security audit cadence. |

### 1.3 Security checklist for new features

Before approving security-sensitive changes, verify:

- [ ] New API routes call `getAppUser()`/`getActiveAppUser()` and return 401 if null.
- [ ] Data access is scoped by `userId` (or ownership-resolved checks).
- [ ] Request payloads are validated with Zod.
- [ ] No secrets are exposed in client code.
- [ ] URL/body IDs are never trusted without scoped lookup.
- [ ] Third-party APIs are called server-side only with env-backed credentials.
- [ ] Security notes are updated in `docs/security/security-notes.md` for material changes.

---

## 2. Security Audit Tasks (Prioritized)

### High priority

1. ~~Add baseline CSP policy with deployment-safe defaults.~~ **Done** — see §5; tune enforcement after report review.
2. Add structured audit logging for admin export and high-risk account actions.

### Medium priority

3. Expand targeted rate limits to additional write-heavy/sensitive endpoints (baseline in §6).
4. Add incident response and key-rotation runbook to docs.

### Low priority

5. Define periodic dependency/security scanning checklist and owner cadence.

---

## 3. Audit lane integration

Security is a first-class audit lane under `docs/audits/` and should run with:

- **Release gate:** Before production release that changes auth, billing, account, or external integrations.
- **Monthly:** Focused security + privacy sanity pass.
- **Quarterly:** Deep review including hardening backlog recalibration.

Security findings should be translated into implementation tasks in `docs/tasks.md` (or equivalent active workflow file) with clear severity and acceptance criteria.

---

## 4. References

- [security-notes.md](security-notes.md) — ongoing security decisions and implementation notes
- [architecture-and-build-practices.md](../architecture-and-build-practices.md) — required security practices
- [manual-steps.md](../setup/manual-steps.md) — production keys, webhook setup, and manual ops steps

---

## 5. Content Security Policy (CSP) — `app/next.config.ts`

Headers apply to `/:path*` via `async headers()`.

| Setting | Behavior |
|---------|----------|
| **`CSP_ENFORCEMENT`** unset or not `true` | Browser receives **`Content-Security-Policy-Report-Only`** with the policy below (violations reported, not blocked). |
| **`CSP_ENFORCEMENT=true`** | Browser receives **`Content-Security-Policy`** (enforced). |

When `NEXT_PUBLIC_APP_URL` is set, the policy includes **`report-uri {baseUrl}/api/csp-report`** for violation reporting.

**Policy string (concatenated in code; summarize here):**

- `default-src 'self'`
- `script-src` — `'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://va.vercel-scripts.com https://vitals.vercel-insights.com https://vercel.live`
- `style-src` — `'self' 'unsafe-inline'`
- `img-src` — `'self' data: https://img.clerk.com https:`
- `font-src` — `'self' data:`
- `connect-src` — `'self' https:`
- `frame-src` — `'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com`
- `worker-src` — `'self' blob:`
- `frame-ancestors 'none'` · `base-uri 'self'` · `form-action 'self'`

**Source of truth:** `app/next.config.ts` (`cspDirectives`, `cspValue`, `cspHeaders`).

---

## 6. API rate limits — `app/lib/rate-limit.ts`

Rolling **one-hour** window per `identifier` + `action`, stored in **`ApiRateLimitEntry`**. If `RATE_LIMITS[action]` is undefined, the route is not limited by this helper.

| Action key | Limit / hour |
|------------|----------------|
| `properties:create` | 20 |
| `properties:patch` | 60 |
| `deals:create` | 20 |
| `deals:patch` | 60 |
| `admin:tier-patch` | 30 |
| `csp-report:post` | 240 (per IP; anonymous CSP violation reports) |
| `import:portfolio` | 5 |
| `export:portfolio` | 15 |
| `export:portfolio_summary` | 15 |
| `account:delete` | 5 |
| `account:delete-permanent` | 3 |
| `billing:create-checkout` | 10 |

**RentCast hourly quota** is **not** this table — it uses `RentCastApiCall` counts and `getRentCastHourlyLimit` / `RENTCAST_HOURLY_LIMITS` in `lib/plans.ts`. See [reference/rentcast-quota.md](../reference/rentcast-quota.md).

**Source of truth:** `app/lib/rate-limit.ts` (`RATE_LIMITS`).

---

## 7. Health endpoint — `GET /api/health`

| Aspect | Stance |
|--------|--------|
| **Auth** | **Public** — no Clerk session required. Intended for load balancers (e.g. Vercel), uptime monitors, and orchestration probes. |
| **Information disclosed** | Minimal JSON: `status` and `database` connectivity (`connected` / `disconnected`). No user data, secrets, or stack traces in the response body. |
| **Abuse** | Low risk; read-only probe. If abuse or noisy scanning becomes an issue, mitigate at the **edge** (WAF, IP allowlists for internal monitors, or platform-level rate limits) rather than breaking standard health-check semantics. |
| **Threat model** | Documented here as intentional public exposure for operability; not a secret admin surface. |
