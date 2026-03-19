# Security Audit

**Version:** 2.0  
**Last updated:** 2026-03-19  
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
| **Security headers** | ✅ Implemented | Standard anti-framing/content-sniffing/referrer/permissions headers added. |
| **Rate limiting (Rent estimate)** | ✅ Implemented | Per-user hourly controls reduce abuse and external API cost risk. |

### 1.2 Open gaps & recommendations (current)

| Gap | Risk | Recommendation |
|-----|------|----------------|
| **Coverage gap for non-Rent endpoints** | Medium | Extend rate limits to additional sensitive write endpoints as needed. |
| **No explicit CSP policy** | Medium | Add baseline CSP and tighten iteratively after telemetry review. |
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

1. Add baseline CSP policy with deployment-safe defaults.
2. Add structured audit logging for admin export and high-risk account actions.

### Medium priority

3. Expand targeted rate limits to additional write-heavy/sensitive endpoints.
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
