# Architecture & Build Practices

**Purpose:** Ensure future features align with design, security, and continuity. Prevent spaghetti code as the codebase evolves.

**Status:** Active — builder and PM must follow these practices.

---

## 1. Current Architecture Summary

### Tech Stack
- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend:** Next.js Route Handlers (API routes), Prisma ORM
- **Database:** PostgreSQL
- **Auth:** Clerk
- **Payments:** Stripe

### Directory Structure
```
app/
├── app/                    # Next.js app router
│   ├── (app)/              # Protected app routes (dashboard, properties, etc.)
│   ├── api/                # API routes
│   ├── sign-in, sign-up/   # Auth pages
│   └── layout.tsx
├── components/             # Shared UI components (charts, CurrencyInput, modals)
├── lib/                   # Business logic, utilities, config
│   ├── auth.ts            # getAppUser
│   ├── db.ts              # Prisma client
│   ├── metrics/           # Property/portfolio calculations
│   ├── validations/       # Zod schemas
│   └── ...
└── prisma/
```

### Established Patterns
- **Auth:** Every API route and protected page calls `getAppUser()` first; return 401 if null
- **Data access:** All queries scoped by `userId: user.id` — no IDOR
- **Validation:** Zod schemas in `lib/validations/`; validate before DB writes
- **Metrics:** Pure functions in `lib/metrics/`; no DB access
- **UI:** Semantic tokens from design-spec; no raw zinc/slate in components

---

## 2. Architecture Principles

### 2.1 Layered Data Flow
```
UI (pages, components)
    → API routes (auth, validation, orchestration)
        → lib (business logic, metrics, validations)
            → Prisma (data access)
```

- **API routes** do not contain business logic. They auth, validate, call lib, return.
- **lib/** contains reusable logic. No React, no request/response.
- **Components** are presentational or thin; fetch via API or receive props from server components.

### 2.2 Single Source of Truth
- **Metrics:** `lib/metrics/portfolio-metrics.ts` and `lib/metrics/property-metrics.ts` — all calculations here. Dashboard, property detail, export, etc. use these. Do not duplicate formulas.
- **Plans/limits:** `lib/plans.ts` — property limits, tier names.
- **Pricing display:** `lib/pricing-display.ts` — display prices for UI.

### 2.3 Component Reuse
- **CurrencyInput** — Use for all currency fields. Do not create new currency inputs.
- **ChartWrapper** — Use for chart containers (title, empty state).
- **Modals** — Follow MetricHelpModal pattern: fixed overlay, backdrop click to close, semantic tokens.
- **Forms** — Reuse MortgageFormFields, property form patterns. Consistent inputClass, labelClass.

### 2.4 API Conventions
- **Auth:** `const user = await getAppUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });`
- **Validation:** Parse body with Zod; return 400 on invalid.
- **Errors:** `{ error: string }` in JSON body; appropriate status code.
- **Deleted users:** Check `user.deletedAt` for account operations; reject or redirect as needed.

---

## 3. Security Checklist (New Features)

Before shipping any new feature, verify:

- [ ] **Auth:** All new API routes call `getAppUser()` and return 401 if null
- [ ] **Authorization:** All data access scoped by `userId` (or property belongs to user)
- [ ] **Input validation:** Request bodies validated with Zod; no raw `body` use
- [ ] **Secrets:** No API keys or secrets in client code; use env vars server-side
- [ ] **IDs:** Never trust IDs from URL/body; always resolve via `userId`-scoped query
- [ ] **External APIs:** If calling third-party APIs, use server-side only; store keys in env

Update `docs/security-notes.md` when adding new security-relevant behavior.

---

## 4. Avoiding Spaghetti Code

### 4.1 Do Not
- **Duplicate logic** — Extract to lib. If the same calculation appears in two places, move it.
- **Inline complex logic** — Keep API routes and components thin.
- **Create one-off components** — Prefer shared components. If a pattern repeats, extract.
- **Mix concerns** — API route should not compute metrics; component should not validate schemas.
- **Introduce new styling patterns** — Use design-spec tokens. No ad-hoc colors.

### 4.2 Do
- **Add to existing modules** — New validation? Add to `lib/validations/`. New metric? Add to `lib/metrics/`.
- **Document new patterns** — If you introduce a new pattern (e.g. integration adapter), add a short note here or in a module README.
- **Keep files focused** — If a file grows past ~300 lines, consider splitting.
- **Use TypeScript strictly** — No `any`; define types for API responses and shared data.

### 4.3 Integration Pattern (Future)
When adding external integrations (RentCast, Zillow, etc.):

1. Create `lib/integrations/<name>.ts` — adapter that fetches data, handles errors, returns typed result
2. Use env vars for API keys; never expose to client
3. Call from API route only; route returns data to client
4. Handle rate limits, timeouts, and failures gracefully
5. Document in `docs/manual-steps.md` if user must obtain API key

---

## 5. Value-Add Roadmap (Prioritized)

Post-MVP features, in suggested order:

| Priority | Feature | Rationale |
|----------|---------|-----------|
| 1 | **Rent estimate integration** (RentCast or similar) | Reduces manual entry; increases perceived value |
| 2 | **Property value estimate** (Zillow API or similar) | Same; keeps data fresh |
| 3 | **Rent gap email notifications** | Periodically compare each user's stored rent to freshly fetched rent estimates (RentCast). If the difference exceeds a configurable threshold (e.g. 10–15%), send an email: "Your rent at [address] may be below market. Current: $X. Market estimate: $Y." Drives retention, brings users back, and surfaces value of the rent estimate integration. |
| 4 | **Refinance / payoff insights** | Differentiator; "When to refinance" or "Payoff timeline" |
| 5 | **Report section** (PDF/print portfolio summary) | Professional output; share with partners/lenders |
| 6 | **Referral system** (if realtor validation positive) | Growth lever |

Defer until validated: referral incentives, advanced analytics, mobile app.

---

## 6. Builder Process Modifications

### 6.1 Pre-Build Checklist (Builder)
Before implementing a task:
- [ ] Read `docs/design-spec.md` for UI work
- [ ] Check `lib/` for existing logic to reuse
- [ ] Check `components/` for existing components to reuse
- [ ] Plan where new code goes (which module, which file)

### 6.2 Post-Build Checklist (Builder)
Before marking task complete:
- [ ] Run `npm run check`; fix errors
- [ ] No new `any` types; no duplicated logic
- [ ] New API routes follow auth + validation pattern
- [ ] Update `docs/security-notes.md` if new security behavior
- [ ] Update `docs/manual-steps.md` if new env vars or manual steps

### 6.3 Task Scoping (PM/User)
When adding tasks to `docs/tasks.md`:
- Include acceptance criteria
- Specify which existing patterns to follow
- Call out reuse (e.g. "Use CurrencyInput", "Use getAppUser in API")
- Note if new lib module or integration is needed

---

## 7. References

- **Design:** `docs/design-spec.md`
- **Security:** `docs/security-notes.md`
- **Manual steps:** `docs/manual-steps.md`
- **Ownership metrics:** `docs/ownership-metrics.md` — how partial ownership scales metrics
- **Builder rule:** `.cursor/rules/builder-agent.mdc`
- **PM checklist:** `docs/pm-review-checklist.md`
