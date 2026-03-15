# Security Audit

**Last updated:** March 2025  
**Scope:** Real Estate Portfolio app — auth, API, data, integrations.

---

## 1. Current Security Posture

### 1.1 Strengths

| Area | Status | Notes |
|------|--------|-------|
| **Auth** | ✅ Strong | Clerk protects all non-public routes. `getAppUser()` used consistently. |
| **Authorization** | ✅ Strong | All data access scoped by `userId`. No IDOR — properties, mortgages, export, metrics all use `where: { userId }` or `getPropertyForUser(id, user.id)`. |
| **Input validation** | ✅ Strong | Zod schemas on all API routes. No raw `body` use. Query params validated (estimates/rent). |
| **SQL injection** | ✅ Mitigated | Prisma parameterized queries only. No raw SQL. |
| **XSS** | ✅ Mitigated | No `dangerouslySetInnerHTML`, `innerHTML`, or `eval`. React escapes by default. |
| **Secrets** | ✅ Good | Env vars only. `.env` gitignored. Stripe/RentCast keys server-side. No `NEXT_PUBLIC_` for secrets. |
| **Stripe webhook** | ✅ Strong | Signature verified with `STRIPE_WEBHOOK_SECRET`. Invalid signature → 400. |
| **Admin** | ✅ Good | `isAdmin(user)` via `ADMIN_EMAILS` env. Admin routes and export API both enforce. |
| **Deleted users** | ✅ Handled | `deletedAt` checked; restore flow; permanent delete cascades correctly. |

### 1.2 Gaps & Recommendations

| Gap | Risk | Recommendation |
|-----|------|----------------|
| **No rate limiting** | Medium | Rent estimate, login, signup, and account delete could be abused. Add rate limiting (e.g. `@upstash/ratelimit` or Vercel middleware) for sensitive endpoints. |
| **No security headers** | Low–Medium | Add `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`. Use `next.config.ts` headers or middleware. |
| **Rent estimate abuse** | Medium | Each call costs RentCast API. No per-user limit. Consider: rate limit per user (e.g. 20/hour), or cap in app logic. |
| **CSRF** | Low | Next.js API routes use same-origin by default. Clerk handles auth. For state-changing ops, consider SameSite cookies (Clerk default). Document as accepted risk or add CSRF tokens for non-GET. |
| **Error messages** | Low | Some APIs return generic "Invalid" — good. Avoid leaking stack traces or internal paths in production. |
| **Password in delete flow** | ✅ Good | Clerk `verifyPassword` used. No plaintext storage. |
| **Admin export** | Low | CSV export is admin-only. Consider audit log of who exported when (future). |

### 1.3 Checklist for New Features

Before adding features, verify:

- [ ] New API routes call `getAppUser()` and return 401 if null
- [ ] All data access scoped by `userId` (or property belongs to user)
- [ ] Request bodies validated with Zod
- [ ] No secrets in client code
- [ ] IDs from URL/body resolved via `userId`-scoped query
- [ ] External APIs called server-side only; keys in env

---

## 2. Audit Tasks (Prioritized)

### High priority

1. **Rate limiting** — Add to `/api/estimates/rent`, `/api/account/delete`, `/api/account/delete-permanent`, and optionally sign-in/sign-up (Clerk may have its own).
2. **Security headers** — Add to `next.config.ts` or middleware.

### Medium priority

3. **RentCast usage cap** — Per-user limit (e.g. 50/month) to prevent abuse and control cost.
4. **Production error handling** — Ensure no stack traces or internal paths in API responses when `NODE_ENV=production`.

### Low priority

5. **CSP (Content Security Policy)** — If you add inline scripts or external resources, consider CSP header.
6. **Audit logging** — Log admin actions (e.g. user export) for compliance.

---

## 3. Quick Wins

### Security headers (next.config.ts)

```ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// In nextConfig:
async headers() {
  return [{ source: "/:path*", headers: securityHeaders }];
}
```

### Rate limit — two approaches

**Option A: DB-based (no new deps, recommended for MVP)**

- **Rent estimate:** Use existing `RentCastApiCall` table. Before calling RentCast, run:
  ```ts
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.rentCastApiCall.count({
    where: { userId: user.id, createdAt: { gte: oneHourAgo } },
  });
  if (count >= 20) return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  ```
- **Account delete:** Add `AccountActionAttempt` model (userId, action, createdAt). Before delete, count attempts in last hour; if >= 3, return 429. Or skip for MVP — Clerk already rate-limits password verification.

**Option B: Upstash Redis (production-grade, works across serverless)**

- Sign up at [upstash.com](https://upstash.com), create Redis DB, get `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
- Add to `.env.example` and `docs/manual-steps.md`.
- Create `lib/rate-limit.ts`:
  ```ts
  import { Ratelimit } from "@upstash/ratelimit";
  import { Redis } from "@upstash/redis";

  const redis = Redis.fromEnv();
  export const rentEstimateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "1 h"),
    prefix: "ratelimit:rent",
  });
  export const accountDeleteLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "1 h"),
    prefix: "ratelimit:delete",
  });
  ```
- In each API route: `const { success } = await rentEstimateLimit.limit(user.id); if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });`

**Recommendation:** Start with Option A for rent estimate (zero deps, uses existing table). Add Option B later if you need stricter limits or want to rate-limit more endpoints.

---

## 4. Implementation steps (for builder)

1. **Security headers** — Edit `app/next.config.ts`, add `headers()` async function returning the security headers for `/:path*`.
2. **Rent estimate rate limit** — In `GET /api/estimates/rent`, after `getAppUser()`, query `RentCastApiCall` count for `userId` in last hour. If >= 20, return 429. Place before the RentCast API call.
3. **Account delete rate limit** — Either: (a) add `AccountActionAttempt` table and check before delete, or (b) defer and document as Phase 2. Account delete is lower risk (user-only, password required).
4. **Document** — Add rate limit details to `docs/security-notes.md`.

---

## 5. References

- [security-notes.md](security-notes.md) — Ongoing security decisions
- [architecture-and-build-practices.md](architecture-and-build-practices.md) — Security checklist for new features
- [manual-steps.md](manual-steps.md) — Production keys, webhooks, HTTPS
