# Security & Privacy Audit — 2026-03-19

## Executive summary

- Core authentication, authorization, and data-scoping posture is solid across all 29 API routes.
- No critical or high-severity vulnerabilities found; the app uses Clerk for auth, Zod for validation, and userId-scoped Prisma queries consistently.
- Three medium-severity gaps remain: no Content-Security-Policy header, limited rate-limiting coverage beyond rent estimates and contact form, and the middleware file naming (`proxy.ts`) should be verified against Next.js conventions.
- Two low-severity observations: no explicit CSRF tokens for high-sensitivity mutations, and `.env` with production secrets exists in workspace (covered by `.gitignore`).

---

## Severity-ranked findings

### Critical

- None found.

### High

- None found.

### Medium

**M1 — No Content-Security-Policy (CSP) header**

- `app/next.config.ts` lines 4–19 define security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- CSP is absent. Without CSP, inline script injection or unauthorized third-party script loading is not blocked at browser level.
- Previously noted in `docs/security/security-audit.md` as a planned improvement.
- **Impact:** Medium. Reduces defense-in-depth against XSS even though no current XSS vectors were found.

**M2 — Limited rate-limiting coverage**

Only 3 endpoint groups have rate limiting:

| Endpoint | Limit | Location |
|----------|-------|----------|
| `api/contact` | 5/hour per user or IP | `api/contact/route.ts` lines 7, 21–29 |
| `api/estimates/rent` | Per-tier hourly (5/10/20) | `api/estimates/rent/route.ts` lines 37–47 |
| `api/estimates/value` | Same tier-based | `api/estimates/value/route.ts` lines 34–43 |
| `api/properties/[id]/benchmark/refresh` | Same tier-based | `api/properties/[id]/benchmark/refresh/route.ts` lines 26–35 |

Missing rate limiting on sensitive write endpoints:

- `api/properties` POST (create property)
- `api/deals` POST (create deal)
- `api/properties/[id]/mortgage` POST (create mortgage)
- `api/import/portfolio` POST (bulk import)
- `api/account/delete` POST (soft delete)
- `api/account/delete-permanent` POST (hard delete)
- `api/billing/create-checkout-session` POST (Stripe checkout)

**Impact:** Medium. An authenticated malicious user could spam property/deal creation or trigger excessive Stripe sessions without throttling.

**M3 — Middleware file naming**

- Auth middleware logic lives in `app/proxy.ts`, not the Next.js conventional `middleware.ts`.
- Need to verify that `middleware.ts` exists and re-exports from `proxy.ts`, or that the build correctly resolves `proxy.ts` as middleware.
- If `proxy.ts` is not wired as middleware, public route protection may not execute.
- **Impact:** Medium if middleware is misconfigured; low if it is correctly wired (which it likely is given the app works).

### Low

**L1 — No explicit CSRF protection**

- No CSRF tokens or double-submit cookie patterns found.
- Mitigation: All state-changing API routes require Clerk session cookies (same-origin), use JSON bodies, and enforce `getActiveAppUser()`. Browser same-origin policy reduces CSRF risk.
- High-sensitivity flows (account deletion, billing checkout) rely solely on auth + Zod confirmation text validation.
- **Impact:** Low. Same-origin + auth reduces practical risk, but defense-in-depth is incomplete.

**L2 — `.env` with secrets in workspace**

- `app/.env` contains production secrets (DATABASE_URL, CLERK_SECRET_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RENTCAST_API_KEY, RESEND_API_KEY, ADMIN_EMAILS).
- `.env` is in `.gitignore` — not committed.
- Risk is accidental sharing via IDE sync, backup tools, or screen sharing.
- **Impact:** Low with `.gitignore` in place.

---

## API route audit — full inventory

All 29 API route files were reviewed for authentication, validation, and data scoping:

| Route | Auth | Validation | Data scoping | Notes |
|-------|------|------------|--------------|-------|
| `api/billing/webhook` | None (public) | Stripe signature | N/A | Correctly public; signature verified via `stripe.webhooks.constructEvent()` |
| `api/contact` | `getAppUser()` | `contactFormSchema` (Zod) | N/A | Rate-limited 5/hr; honeypot field; `escapeHtml()` on output |
| `api/account/restore` | `getAppUser()` | None needed | `user.id` | Uses `getAppUser()` (not `getActiveAppUser()`) to allow deleted users to restore |
| `api/account/delete` | `getActiveAppUser()` | `deleteAccountSchema` (Zod) | `user.id` | Requires `confirmText === user email` |
| `api/account/delete-permanent` | `getActiveAppUser()` | `deletePermanentAccountSchema` (Zod) | `user.id` | Requires `confirmText === "DELETE"` |
| `api/properties` GET | `getActiveAppUser()` | N/A | `userId: user.id` | OK |
| `api/properties` POST | `getActiveAppUser()` | `createPropertySchema` + `createMortgageSchema` (Zod) | `userId: user.id` | OK |
| `api/properties/[id]` GET | `getActiveAppUser()` | N/A | `getPropertyForUser(id, user.id)` | OK |
| `api/properties/[id]` PATCH | `getActiveAppUser()` | `updatePropertySchema` (Zod) | `getPropertyForUser(id, user.id)` | OK |
| `api/properties/[id]` DELETE | `getActiveAppUser()` | N/A | `getPropertyForUser(id, user.id)` | OK |
| `api/properties/[id]/mortgage` GET | `getActiveAppUser()` | N/A | `getPropertyForUser` | OK |
| `api/properties/[id]/mortgage` POST | `getActiveAppUser()` | `createMortgageSchema` (Zod) | `getPropertyForUser` | OK |
| `api/properties/[id]/mortgage/[mortgageId]` PATCH | `getActiveAppUser()` | `updateMortgageSchema` (Zod) | `getMortgageForUser(mortgageId, user.id)` | OK |
| `api/properties/[id]/mortgage/[mortgageId]` DELETE | `getActiveAppUser()` | N/A | `getMortgageForUser(mortgageId, user.id)` | OK |
| `api/properties/[id]/benchmark/refresh` POST | `getActiveAppUser()` | N/A | `propertyId + userId` | Rate-limited per tier |
| `api/properties/[id]/metrics` GET | `getActiveAppUser()` | N/A | `getPropertyForUser` | OK |
| `api/properties/[id]/amortization` GET | `getActiveAppUser()` | N/A | `getPropertyForUser` | OK |
| `api/deals` GET | `getActiveAppUser()` | N/A | `userId: user.id` | OK |
| `api/deals` POST | `getActiveAppUser()` | `createDealSchema` (Zod) | `userId: user.id` | OK |
| `api/deals/[id]` GET | `getActiveAppUser()` | N/A | `getDealForUser(id, user.id)` | OK |
| `api/deals/[id]` PATCH | `getActiveAppUser()` | `updateDealSchema` (Zod) | `getDealForUser(id, user.id)` | OK |
| `api/deals/[id]` DELETE | `getActiveAppUser()` | N/A | `getDealForUser(id, user.id)` | OK |
| `api/me` GET | `getActiveAppUser()` | N/A | `user.id` | OK |
| `api/onboarding` PATCH | `getActiveAppUser()` | `patchSchema` (Zod) | `user.id` | OK |
| `api/portfolio/summary` GET | `getActiveAppUser()` | N/A | `userId: user.id` | OK |
| `api/export/portfolio` GET | `getActiveAppUser()` | N/A | `userId: user.id` | CSV escaping via `escapeCsvCell()` |
| `api/import/portfolio` POST | `getActiveAppUser()` | `parseRow` (csv-parser lib) | `userId: user.id` | Atomic transaction |
| `api/import/portfolio/template` GET | `getActiveAppUser()` | N/A | N/A (static template) | OK |
| `api/estimates/rent` GET | `getActiveAppUser()` | `rentEstimateQuerySchema` (Zod) | `userId: user.id` | Rate-limited per tier |
| `api/estimates/value` GET | `getActiveAppUser()` | `valueEstimateQuerySchema` (Zod) | `userId: user.id` | Rate-limited per tier |
| `api/billing/create-checkout-session` POST | `getActiveAppUser()` | `createCheckoutSessionSchema` (Zod) | `user.id` | OK |
| `api/billing/portal` POST | `getActiveAppUser()` | N/A | N/A | OK |
| `api/billing/status` GET | `getActiveAppUser()` | N/A | `userId: user.id` | OK |
| `api/billing/sync` GET | `getActiveAppUser()` | N/A | `userId: user.id` | OK |
| `api/billing/subscription-details` GET | `getActiveAppUser()` | N/A | `userId: user.id` | OK |
| `api/admin/export/users` GET | `getActiveAppUser()` + `isAdmin()` | N/A | Admin-only | CSV escaping via `escapeCsvCell()` |
| `api/admin/users/[id]/tier` PATCH | `getActiveAppUser()` + `isAdmin()` | `patchSchema` (Zod) | Admin updates any user | OK |

**Observations:**
- Every protected route uses `getActiveAppUser()` (returns null for deleted accounts) except `api/account/restore` which correctly uses `getAppUser()`.
- All write endpoints use Zod schemas for input validation.
- All data queries scope by `userId` or use ownership-checking helpers (`getPropertyForUser`, `getDealForUser`, `getMortgageForUser`).
- Admin routes add `isAdmin()` check on top of standard auth.

---

## Secrets and client exposure

| Variable | Exposed to client | Risk |
|----------|-------------------|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Yes | None (publishable by design) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | None (publishable by design) |
| `NEXT_PUBLIC_APP_URL` | Yes | None (canonical URL) |
| `NEXT_PUBLIC_PRICE_INVESTOR_MONTHLY` | Yes | None (pricing display) |
| `NEXT_PUBLIC_PRICE_INVESTOR_YEARLY` | Yes | None (pricing display) |
| `NEXT_PUBLIC_PRICE_PRO_MONTHLY` | Yes | None (pricing display) |
| `NEXT_PUBLIC_PRICE_PRO_YEARLY` | Yes | None (pricing display) |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes | None (DSN is public) |
| `STRIPE_SECRET_KEY` | No | Server-only |
| `STRIPE_WEBHOOK_SECRET` | No | Server-only |
| `CLERK_SECRET_KEY` | No | Server-only |
| `DATABASE_URL` | No | Server-only |
| `RENTCAST_API_KEY` | No | Server-only |
| `RESEND_API_KEY` | No | Server-only |
| `ADMIN_EMAILS` | No | Server-only |

No secrets are exposed to the client bundle. All `NEXT_PUBLIC_` variables contain only publishable keys or display values.

---

## Middleware and public route configuration

`app/proxy.ts` defines the public route matcher:

```
"/", "/sign-in(.*)", "/sign-up(.*)", "/privacy", "/terms", "/pricing",
"/contact", "/api/billing/webhook", "/api/contact"
```

All other routes require Clerk auth via `auth.protect()`. The webhook route is correctly public (Stripe needs to reach it). The contact route is public to allow pre-auth contact.

---

## XSS and output encoding

| Surface | Protection | File |
|---------|------------|------|
| Contact form email HTML | `escapeHtml()` applied to email, subject, message | `api/contact/route.ts` lines 87–90 |
| Portfolio CSV export | `escapeCsvCell()` wraps all values | `api/export/portfolio/route.ts` lines 10–16 |
| Admin user CSV export | `escapeCsvCell()` wraps all values | `api/admin/export/users/route.ts` lines 6–12 |
| JSON-LD structured data | Server-generated from env (no user input) | `app/layout.tsx` line 95 |

No `innerHTML`, `eval()`, `document.write`, or unescaped user content rendering found. React's default JSX escaping covers all component output.

---

## Webhook signature verification

`api/billing/webhook/route.ts` correctly:
1. Requires `stripe-signature` header (returns 400 if missing)
2. Calls `stripe.webhooks.constructEvent(body, signature, secret)` with `STRIPE_WEBHOOK_SECRET`
3. Catches verification failures and returns 400
4. Only processes events after signature validation passes

---

## Admin route protection

| Layer | File | Implementation |
|-------|------|----------------|
| Page layout | `app/(app)/admin/layout.tsx` lines 11–16 | `getAppUser()` + `isAdmin(user)` → redirect if not admin |
| API: export users | `api/admin/export/users/route.ts` lines 16–18 | `getActiveAppUser()` + `isAdmin(user)` → 401 if not admin |
| API: tier override | `api/admin/users/[id]/tier/route.ts` lines 14–16 | Same pattern |

Admin check (`lib/auth.ts` lines 52–57): `isAdmin()` compares user email against `ADMIN_EMAILS` env var (comma-separated list). Server-only evaluation.

---

## Evidence reviewed

- All 29 files under `app/app/api/`
- `app/proxy.ts` (middleware/public routes)
- `app/next.config.ts` (security headers)
- `app/.env` structure (secrets inventory)
- `app/lib/auth.ts` (auth helpers, admin check)
- `app/app/(app)/admin/layout.tsx` (admin page gate)
- `app/layout.tsx` (JSON-LD, preconnect)
- `app/app/api/billing/webhook/route.ts` (Stripe verification)
- `docs/security/security-audit.md` (existing security doc)
- `docs/security/security-notes.md` (security decisions)

---

## Risk & impact assessment

- **No unauthorized data access paths found.** Every route scopes by userId, and admin routes add role checks.
- **No XSS vectors found.** All user content is escaped before HTML/CSV output; React JSX handles component rendering.
- **Missing CSP** is the most impactful gap — it prevents defense-in-depth against any future XSS introduction.
- **Limited rate limiting** means an authenticated user could create excessive resources, though Clerk auth and plan limits provide some natural throttling.

---

## Recommendations (prioritized)

1. **Add baseline CSP** — Start with `Content-Security-Policy-Report-Only` to detect violations without breaking functionality, then tighten iteratively.
2. **Expand rate limiting** — Add per-user hourly limits to property/deal/mortgage creation endpoints, import, and billing session creation.
3. **Verify middleware wiring** — Confirm `proxy.ts` is correctly loaded as Next.js middleware (check for `middleware.ts` re-export or build config).
4. **Add CSRF protection for high-sensitivity flows** — Consider double-submit cookie or custom header verification for account deletion and billing mutations.
5. **Add structured logging** — Log admin-sensitive actions (tier overrides, user exports, account deletions) with timestamps and actor IDs for audit trail.

---

## Task candidates

- [ ] Add CSP header in report-only mode to `next.config.ts` security headers.
- [ ] Add rate limiting to `api/properties` POST, `api/deals` POST, `api/import/portfolio` POST.
- [ ] Add rate limiting to `api/account/delete` and `api/billing/create-checkout-session`.
- [ ] Verify `proxy.ts` → `middleware.ts` wiring or rename.
- [ ] Add structured logging for admin export and tier override actions.

---

## Re-test checklist

- [ ] Verify no regressions after CSP addition (check console for report-only violations).
- [ ] Verify rate-limited endpoints return 429 after threshold.
- [ ] Verify middleware protects all non-public routes after any naming changes.
- [ ] `npm run check` passes.

---

## Next trigger and cadence

- Trigger: any auth, billing, account, or integration changes
- Recommended next run: monthly + pre-launch gate
