# Architecture & Build Practices

**Purpose:** Ensure future features align with design, security, and continuity. Prevent spaghetti code as the codebase evolves.

**Status:** Active — builder and PM must follow these practices.
**Last reviewed:** 2026-03-28 (Phase 9D observability, public images, export rate limits)
**Review cadence:** Quarterly or after major architecture changes

**Product mantra:** Build features that are **thoughtful** (consider edge cases and user intent), **robust** (handle failures, validate inputs, recover gracefully), **modern** (follow current patterns, avoid deprecated APIs), and **frictionless** (minimal steps, clear CTAs, no unnecessary barriers).

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

### Property detail, add, and edit (post–add-property overhaul)

| Route / area | Primary files | Notes |
|--------------|---------------|--------|
| **`/properties/new`** | `add-property-wizard.tsx` | Sectioned create; optional mortgage; deal `?from=`; drafts in `draft-context`. |
| **`/properties/[id]/edit`** | `property-form.tsx`, `lib/property-form-section-nav.ts` | PATCH `/api/properties/[id]`; section nav mirrors add flow. |
| **`/properties/[id]`** | `property-detail-tabs.tsx`, `overview-tab-content.tsx`, `details-tab-content.tsx` | Tabs: **Overview** (metrics + inputs snapshot + health strip) and **Details** (read-only ledger + embedded `MortgageSection`). Shared **`property-health-strip.tsx`**. Types in **`property-detail-types.ts`**. |
| **Workspaces** | `modeling-workspace.tsx` → `projections-tab-content`; `mortgage-workspace.tsx` → `mortgage-tab-content` | Deep-link with `?propertyId=`. |

**IA:** Editing property fields is **not** inline on the Details tab—**`/edit`** is the single full editor (see [`docs/archive/proposals/epic-a-discovery.md`](archive/proposals/epic-a-discovery.md) A3). Do not reintroduce triple inline PATCH without an explicit product decision.

### Established Patterns
- **Auth:** Protected API routes use `getActiveAppUser()` (or `getAppUser()` only where soft-deleted users must act, e.g. restore); return 401 if null when appropriate. See `docs/security/security-notes.md`.
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
- **Ownership semantics policy:** `docs/policies/ownership-metrics.md` — canonical formulas and copy expectations for partial-ownership scaling.
- **Analytics math policy:** `docs/policies/analytics-math-policy.md` — canonical contracts for time windows, debt-service source, and UI/API/export reconciliation.
- **Portfolio CSV (import/export):** `docs/reference/portfolio-csv-export.md` — column semantics, multi-mortgage labeling, canonical property types.
- **Plans/limits:** `lib/plans.ts` — property limits, tier names.
- **Pricing display:** `lib/pricing-display.ts` — display prices for UI.

### 2.3 Component Reuse
- **CurrencyInput** — Use for all currency fields. Do not create new currency inputs.
- **ChartWrapper** — Use for chart containers (title, empty state).
- **Modals** — Follow MetricHelpModal pattern: fixed overlay, backdrop click to close, semantic tokens.
- **Forms** — Reuse MortgageFormFields, property form patterns. Consistent inputClass, labelClass.

### 2.4 API Conventions
- **Auth:** `const user = await getActiveAppUser(); if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });` for routes that must block soft-deleted accounts. Exceptions are documented in `docs/security/security-notes.md`.
- **Validation:** Parse body with Zod; return 400 on invalid.
- **Errors:** `{ error: string }` in JSON body; appropriate status code.
- **Deleted users:** Check `user.deletedAt` for account operations; reject or redirect as needed.

### 2.5 Performance Practices

Keep initial JS small, defer heavy libraries, and cache static content. Follow these patterns so we don't regress.

**Heavy libraries (charts, etc.):**
- Use `next/dynamic` with `ssr: false` for components that import Recharts or other large libraries (~50KB+).
- Show a loading placeholder (skeleton or "Loading…") while the chunk loads.
- Do not import Recharts (or similar) at the top level of pages that render above-the-fold content.

**Layout and rendering:**
- Do **not** add `export const dynamic = "force-dynamic"` to the root layout unless Clerk or another requirement explicitly needs it. Prefer scoping `force-dynamic` to specific layouts or pages that need request-time data.
- **Public marketing / legal pages** (`/`, `/pricing`, `/privacy`, `/terms`, `/contact`, `/changelog`) call server-side `auth()` or `getAppUser()` so nav and CTAs differ for signed-in vs guest users. That makes them **dynamically rendered per request**; we do **not** set `export const revalidate` on these routes because session-dependent HTML is not snapshot-stable. Adding ISR would require moving session checks into a client boundary (future optimization). SEO still uses static `metadata` exports.

**Images:**
- Use `next/image` for all `<img>` tags. Never use raw `<img>` for user-facing images.
- Optimize OG images (e.g. 1200×630, WebP when possible).

**Config:**
- When adding large packages (lucide-react, recharts, etc.), add them to `next.config.ts` `experimental.optimizePackageImports` if supported.
- For pages that rarely change (Privacy, Terms), add `export const revalidate = 3600` (or similar) so they can be cached.

**External APIs:**
- When adding new third-party API integrations, add `<link rel="preconnect" href="https://api.example.com" />` or `rel="dns-prefetch"` in the root layout `<head>` for the API origin.

**Checklist for new features:**
- [ ] New chart or heavy UI library? Use `next/dynamic` with `ssr: false`.
- [ ] New image in body? Use `next/image`.
- [ ] New external API? Add preconnect/dns-prefetch.
- [ ] New large package? Add to `optimizePackageImports` if applicable.
- [ ] New static content page? Consider `revalidate`.

### 2.6 Observability (Sentry and logging)

- **Sentry:** `@sentry/nextjs` is configured for client and server. Use `Sentry.captureException` for unexpected failures in API routes and critical server paths. Use `Sentry.captureMessage` (typically `level: "warning"`) for operational signals that are not thrown errors (e.g. Stripe webhook cannot resolve an app user from subscription metadata).
- **Stripe billing:** When subscription sync cannot map Stripe → app user (webhook), emit a **warning** to Sentry with `subscriptionId`, `customerId`, and whether `metadata.appUserId` was present. When `/api/billing/sync` fails talking to Stripe, capture the exception with `userId` and `stripeCustomerId` in `extra`.
- **Structured logs:** Prefer `console.error` with a single JSON line for ops dashboards where Sentry is not appropriate; include `action`, ids, and timestamps. Do not log secrets or full payment payloads.
- **Client global errors:** `app/global-error.tsx` reports to Sentry when `NEXT_PUBLIC_SENTRY_DSN` is set and shows an accessible, on-brand fallback (heading, short explanation, try again + home).

---

## 3. Security Checklist (New Features)

Before shipping any new feature, verify:

- [ ] **Auth:** New protected API routes use `getActiveAppUser()` (or a documented exception in `docs/security/security-notes.md`) and return 401 if null
- [ ] **Authorization:** All data access scoped by `userId` (or property belongs to user)
- [ ] **Input validation:** Request bodies validated with Zod; no raw `body` use
- [ ] **Secrets:** No API keys or secrets in client code; use env vars server-side
- [ ] **IDs:** Never trust IDs from URL/body; always resolve via `userId`-scoped query
- [ ] **External APIs:** If calling third-party APIs, use server-side only; store keys in env

Update `docs/security/security-notes.md` when adding new security-relevant behavior.

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
5. Document in `docs/setup/manual-steps.md` if user must obtain API key

---

## 5. Value-Add Roadmap

**See `docs/reference/roadmap.md`** for the prioritized value-add backlog, medium-term initiatives, external API opportunities, and deferred items. PM promotes items from there to `docs/tasks.md` when ready to build.

---

## 6. Builder Process Modifications

### 6.1 Pre-Build Checklist (Builder)
Before implementing a task:
- [ ] Read `docs/policies/design-spec.md` for UI work
- [ ] If ownership/metrics behavior is touched, read `docs/policies/ownership-metrics.md` first
- [ ] If analytics math is touched, read `docs/policies/analytics-math-policy.md` first
- [ ] Check `lib/` for existing logic to reuse
- [ ] Check `components/` for existing components to reuse
- [ ] Plan where new code goes (which module, which file)

### 6.2 Post-Build Checklist (Builder)
Before marking task complete:
- [ ] Run `npm run check`; fix errors
- [ ] Run `npm run test` when the task touches `lib/metrics/`, `lib/amortization.ts`, or `lib/validations/property.ts` (see [`docs/proposals/testing-implementation-plan.md`](proposals/testing-implementation-plan.md)); understand CI vs local parity via [`docs/qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md)
- [ ] No new `any` types; no duplicated logic
- [ ] New API routes follow auth + validation pattern
- [ ] If ownership behavior changed, verify formulas and copy match `docs/policies/ownership-metrics.md`
- [ ] If analytics math changed, verify basis/time-window labels and UI/API/export reconciliation against `docs/policies/analytics-math-policy.md`
- [ ] Update `docs/security/security-notes.md` if new security behavior
- [ ] Update `docs/setup/manual-steps.md` if new env vars or manual steps
- [ ] **If this task implements a roadmap feature:** mark it done in docs/reference/roadmap.md (add to Completed table or update status).
- [ ] **If this task touches property add/edit/detail or property APIs:** run or spot-check [`docs/qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md) before marking complete.

### 6.3 Builder Checklist — Context-Specific

Apply these when the task matches the context:

**When adding a new third-party service (API, auth, payments, analytics, etc.):**
- [ ] Add the service to Privacy Policy (`app/privacy/page.tsx` — "Data We Collect" section). Describe what data is collected, how it's used, and link to provider's privacy policy if relevant.
- [ ] Update Terms of Service (`app/terms/page.tsx`) if the service affects payments, data handling, or user obligations.
- [ ] Add env vars to `app/.env.example` and `docs/setup/manual-steps.md`.
- [ ] For incidents: see [docs/runbooks/incident-response.md](runbooks/incident-response.md).
- [ ] Document in `docs/setup/manual-steps.md` any manual setup (API keys, webhooks, dashboard config).

**When adding a new page:**
- [ ] **Public page (guest-accessible):** Add route to `proxy.ts` `isPublicRoute` so unauthenticated users can access it.
- [ ] **SEO metadata:** Add `metadata` with `title`, `description`, `alternates.canonical` (via `getAppOrigin()`), and `openGraph` (title, description, url). Use "Veld Portfolio" in titles. Never hard-code the origin; always use `getAppOrigin()` from `lib/app-url.ts`.
- [ ] **Sitemap:** If the route lives under a data-driven family — `/alternatives/[slug]`, `/vs/[slug]`, `/resources/[slug]`, `/tools/[calculator]/[location]`, or any of the `CALCULATOR_LOCATION_DEFS` calculator base paths — adding the entry to the underlying data file auto-includes it in `sitemap.ts` and `/llms.txt`. For top-level standalone pages, add an entry to `app/app/sitemap.ts` directly.
- [ ] **Structured data:** If the page has a visible breadcrumb nav, also emit `BreadcrumbJsonLd` (from `components/marketing/breadcrumb-jsonld.tsx`) with the same items as the visible nav. If the page has an FAQ section, emit `CalculatorFaqJsonLd` with a shared data source so the visible FAQ and JSON-LD match verbatim. Resource articles that canonically define a metric should set `definedTerm` on the article so `DefinedTermJsonLd` auto-emits.
- [ ] **Changelog:** Add a user-facing entry to `lib/changelog-data.ts` at the top of the array. Sitemap freshness dates are derived from the most recent changelog entry, so this is how search engines see real content activity.
- [ ] **Auth/utility page** (sign-in, sign-up, billing success, etc.): Add `robots: { index: false, follow: false }` and add path to `robots.ts` `disallow` if not already covered. Do NOT add to sitemap.
- [ ] **Design:** Use semantic tokens from `docs/policies/design-spec.md`; no raw zinc/slate. Typography, spacing, and component patterns per spec.
- [ ] **Responsive:** Ensure layout works on mobile (stacked grids, adequate touch targets).
- [ ] **Mobile-also:** Test on both desktop and narrow viewport (375px) or real device. Nav should not be squished on mobile; use hamburger or simplified nav if many links. Touch targets at least 44px. Avoid horizontal overflow.
- [ ] **Broader checks:** [SEO audit process](process/seo-audit-process.md) and [SEO release checklist](qa/seo-release-checklist.md).

**When adding plan-gated features (properties, deals, etc.):**
- [ ] Update `lib/plans.ts` if adding new limits or tiers.
- [ ] In-app upgrade links → `/plans`. Public/guest upgrade links → `/pricing`.
- [ ] Show limit and upgrade CTA when user is at or over limit.

**When adding new API routes:**
- [ ] Auth: `getAppUser()`; return 401 if null.
- [ ] Validation: Zod schema; return 400 on invalid.
- [ ] Data scope: All queries by `userId: user.id`.
- [ ] Block deleted users: Check `user.deletedAt` for account-sensitive operations.

**Brand consistency:**
- [ ] Use "Veld" for short form (logo, nav, sidebar). Use "Veld Portfolio" for formal contexts (metadata, Terms, Privacy, page titles).

### 6.4 Task Scoping (PM/User)
When adding tasks to `docs/tasks.md`:
- Include acceptance criteria
- Specify which existing patterns to follow
- Call out reuse (e.g. "Use CurrencyInput", "Use getAppUser in API")
- Note if new lib module or integration is needed

---

## 7. References

- **Property flow regression:** [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md)
- **Testing plan (Vitest phases):** [`proposals/testing-implementation-plan.md`](proposals/testing-implementation-plan.md)
- **Test infrastructure review (CI, correctness, next steps):** [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md)
- **Test follow-up tasks (Phase 1 & 2):** [`tasks.md`](tasks.md) — *Active tasks → Test infrastructure follow-up*
- **Design:** `docs/policies/design-spec.md`
- **Security:** `docs/security/security-notes.md`
- **Manual steps:** `docs/setup/manual-steps.md`
- **Ownership metrics:** `docs/policies/ownership-metrics.md` — how partial ownership scales metrics
- **Analytics math:** `docs/policies/analytics-math-policy.md` — canonical analytics contracts and reconciliation rules
- **Builder rule:** `.cursor/rules/builder-agent.mdc`
- **PM checklist:** `docs/process/pm-review-checklist.md`
- **Audit index:** `docs/audits/README.md`
- **Audit processes:** `docs/process/`

---

## 8. Audit governance alignment

Architecture decisions and implementations must remain audit-ready:

- Every release should be compatible with code, security, and data-integrity audits.
- Math/ownership-affecting work must remain compatible with analytics + ownership audit lanes.
- New cross-cutting systems (new integrations, pipelines, major UI flows) should include at least one corresponding focused audit lane or explicit note why existing lanes are sufficient.
- PM approval is blocked if required audit docs/checklists are not updated for significant architecture changes.
