# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.
**Ownership policy (ownership/metrics tasks):** Follow `docs/policies/ownership-metrics.md` as the canonical source for formulas and copy semantics.
**Analytics math policy (analytics/projection tasks):** Follow `docs/policies/analytics-math-policy.md` for debt-service basis, time-window labels, and UI/API/export reconciliation.

**Future features / roadmap:** See `docs/reference/roadmap.md`. PM promotes items from there to here when ready to build.

**Test quality gate (process):** How tests fit CI, PM review, and pre-push flow is described in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md). **Test infrastructure follow-up:** Phase 1 & 2 complete (see *Active tasks* below — items checked off).

---

## Completed

Historical completion logs are archived in `docs/tasks-archived.md`.

---

## Roadmap priority (value vs effort — 2025-03-15)

| Order | Item | Effort | Value | Recommendation |
|-------|------|--------|-------|----------------|
| — | Mortgage balance advancement | ✓ Done | — | Balance advancement, escrow, amortization fix, loan type import, chart tooltip. |
| — | Admin membership override | ✓ Done | — | Tier override, admin UI, settings override display. |
| — | Benchmarking | ✓ Done | — | Rent vs market, surfacing on list/dashboard, inline refresh. |
| — | Error tracking (Sentry) | ✓ Done | — | Production error monitoring; set NEXT_PUBLIC_SENTRY_DSN in Vercel. |
| — | Dashboard single-property | ✓ Done | — | Property at a glance, metrics, Rent vs. Market auto-refresh. |
| **1** | Refinance / payoff insights | Medium–High | High | Actionable; builds on amortization logic. |
| **3** | Simulation page | High | High | Full modeling; extends scenario concept. |
| **4** | Report section (PDF) | Medium | Medium | Professional output; share with partners/lenders. |
| **5** | Automated testing | High | High | Quality foundation; plan per Module M. |

**Defer:** Rent gap email (cost scales), Referral system (validate first).

---

## Active tasks

### Branding / metadata follow-up

- [x] **Replace default favicon with Veld icon set** — Generate and install a full favicon/app icon set from final Veld brand artwork (not Vercel default) and wire metadata links in the app head.
  - *Acceptance:*
    - [x] Public assets exist and are served from root: `favicon-96x96.png`, `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `site.webmanifest`.
    - [x] Head metadata includes:
      - [x] `<link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />`
      - [x] `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`
      - [x] `<link rel="shortcut icon" href="/favicon.ico" />`
      - [x] `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`
      - [x] `<meta name="apple-mobile-web-app-title" content="Veld" />`
      - [x] `<link rel="manifest" href="/site.webmanifest" />`
    - [x] Production tab/app icons no longer show Vercel branding.

### Test infrastructure follow-up (Phase 1 & 2)

*Source: [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §8. **Do Phase 1 first** (CI + docs), then Phase 2 (fixtures + deeper tests). PM assigns builder per phase or per bullet.*

#### Phase 1 — Trust and CI hardening (P0)

- [x] **CI: run ESLint** — In `.github/workflows/ci.yml`, add a step after `npm ci` (from `app/`): `npm run lint`. Fix all errors that fail the job (or narrow rules only with documented rationale).
  - *Acceptance:* CI runs lint on every trigger; green means tests **and** lint pass; update `qa/test-infrastructure-review.md` §10 change log when done.

- [x] **CI: build strategy** — Either (A) add `npm run build` in CI with required secrets in GitHub Actions, or (B) document in `qa/test-infrastructure-review.md` why build is not in CI (e.g. secrets only on Vercel) and keep build as a manual release gate via `pm-review-checklist.md`.
  - *Acceptance:* Chosen option is documented; no ambiguity for “green merge” vs deploy.

- [x] **Pre-push / smoke doc** — Update [`docs/setup/run-and-smoke-test.md`](setup/run-and-smoke-test.md) with a **Before push** subsection: recommended `npm run test` and `npm run lint` from `app/`; link to `qa/test-infrastructure-review.md` and `.github/workflows/ci.yml`.
  - *Acceptance:* Developers can follow one doc for local checks + understand CI parity.

#### Phase 2 — Math and domain depth (P1)

- [x] **Golden fixtures (metrics)** — Add shared fixtures (e.g. `app/lib/test/fixtures/metrics-golden.ts`) with inputs → expected NOI, cap rate, cash flow, LTV, and at least one **multi-property** portfolio aggregate; reference [`policies/ownership-metrics.md`](policies/ownership-metrics.md) in file or test comments.
  - *Acceptance:* Vitest uses fixtures; `npm run test` passes; PM can verify numbers against policy tables.

- [x] **Amortization coverage gap closure** — Audit `lib/amortization.ts` helpers used by mortgage/amortization UI; add tests for any high-risk gap called out in `qa/test-infrastructure-review.md` §4.2, or document deferral in the review doc.
  - *Acceptance:* Review doc §4.2 updated; new tests or explicit “deferred” list.

- [x] **API tests: plan limit (403)** — Add Vitest route tests (mocked `getActiveAppUser` + Prisma + `@/lib/plans` or tier/count) for `POST /api/properties` and `POST /api/deals` when limit reached (`PLAN_LIMIT_REACHED`).
  - *Acceptance:* At least one 403 case per route; pattern documented in `proposals/testing-implementation-plan.md` or review doc.

### Git hooks — Husky (optional Phase 3)

*Why:* CI runs on **push**; Husky runs **locally** so broken lint/tests don’t reach the remote. *Repo layout:* git root is **`RealEstatePortfolio/`** (contains `app/`, `docs/`); a **minimal root `package.json`** exists for Husky; app scripts run from **`app/`** via the hook.*

- [x] **Add Husky at git root with `app/` scripts** — Install Husky (current major version per npm), add `prepare` script so `npm install` enables hooks. Implemented **pre-commit** and **pre-push** (both run lint + test from `app/`; pre-commit blocks bad commits, pre-push catches anything skipped or broken before remote).
  - *Acceptance:*
    - [x] `.husky/` directory committed; hook runs `npm run lint` and `npm run test` from **`app/`** (paths work on Windows + Linux).
    - [x] Fresh clone: `npm install` at root (and/or `cd app && npm install` if documented) leaves hooks active.
    - [x] Intentionally failing lint or test **blocks** the hook action (commit or push).
    - [x] [`docs/setup/run-and-smoke-test.md`](setup/run-and-smoke-test.md) updated with a short **“Git hooks”** subsection: what runs, when, and how to skip in emergencies (`HUSKY=0` or `git commit --no-verify` — document responsibly).
    - [x] Optional: [`docs/qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §10 change log one-liner.

---

### Audit synthesis (2026-03-19)

Consolidated from 9 audit reports. Deduplicated. See `docs/audits/synthesis/2026-03-19-audit-synthesis.md` for full traceability.

Tasks are grouped into batches. **Batch 1** is first.

---

## Batch 1: Critical fixes & security foundation

*Purpose: Fix critical UX bug, harden security posture, and ensure error visibility. Do this batch first.*

- [x] **Fix signInUrl typo** — In `app/sign-up/[[...sign-up]]/page.tsx`, ensure `signInUrl="/sign-in"` (not `/sign-up`).
  - *Acceptance:* "Already have account?" link routes to `/sign-in`; no sign-up→sign-up loop.

- [x] **Add CSP header (report-only)** — Add Content-Security-Policy to `next.config.ts` security headers in report-only mode.
  - *Acceptance:* Response headers include `Content-Security-Policy-Report-Only`; no blocking; violations logged to report-uri or console.

- [x] **Add rate limiting** — Apply rate limits to: `api/properties` POST, `api/deals` POST, `api/import/portfolio` POST, `api/account/delete`, `api/billing/create-checkout-session`.
  - *Acceptance:* Each endpoint rejects with 429 when limit exceeded; limits documented (e.g. per-user or per-IP); existing rate-limited routes (contact, estimates) unchanged.

- [x] **Add Sentry.captureException in error boundary** — In `app/(app)/error.tsx`, call `Sentry.captureException(error)` before render.
  - *Acceptance:* Unhandled errors in app routes are reported to Sentry; error boundary still renders user-facing message.

- [x] **Verify middleware wiring** — Confirm `app/proxy.ts` is correctly loaded as Next.js middleware (re-export from `middleware.ts` or rename to `middleware.ts`).
  - *Acceptance:* Auth protection works for protected routes; public routes remain accessible; build succeeds; doc updated if renamed.

- [x] **Add structured logging for admin actions** — Log admin export and tier override actions with user, action, and timestamp.
  - *Acceptance:* Admin export and tier override emit structured logs (JSON or key-value); no PII in logs.

- [x] **Fix post-auth redirect to dashboard (O5)** — After sign-in or sign-up (including OAuth e.g. Google), user lands directly on `/dashboard` without an intermediate stop on the public landing page.
  - *Root cause:* Clerk's fallback redirect defaults to `/` when `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` are unset. OAuth and some flows use the fallback, not the component `afterSignInUrl`/`afterSignUpUrl`.
  - *Fix:* Set `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard` and `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard` in `.env` and `.env.example`. Optionally use `*_FORCE_REDIRECT_URL` if you want to always redirect to dashboard regardless of `redirect_url`.
  - *Acceptance:* No manual "Go to dashboard" click required; OAuth and email flows both redirect to `/dashboard`; no redirect to `/` or landing after successful auth.

---

## Batch 2: Governance & docs

*Purpose: Fix broken references, align conventions, and add release/audit gates.*

- [x] **Fix hooks.json shell-risk-policy path** — In `.cursor/hooks.json`, ensure beforeShellExecution prompt references `docs/policies/shell-risk-policy.md`.
  - *Acceptance:* Hooks resolve to correct policy file; no broken references.

- [x] **Fix design-spec internal links** — In `docs/policies/design-spec.md`, fix links to pm-review-checklist and engineering-spec.
  - *Acceptance:* All internal links resolve; no 404s in docs.

- [x] **Fix ai-development-process shell-risk references** — In `docs/ai-development-process-extraction.md`, correct shell-risk-policy references.
  - *Acceptance:* References point to `docs/policies/shell-risk-policy.md`.

- [x] **Standardize .env.example path** — In `cursor-agent-setup.md` and `pm-agent-workflow.md`, use consistent path to `.env.example` (e.g. `app/.env.example`).
  - *Acceptance:* Both docs use same path; path matches repo layout.

- [x] **Align math audit naming** — Align report naming convention between `docs/audits/math/README.md` and math audit agent/process.
  - *Acceptance:* README and agent produce same naming pattern (e.g. `YYYY-MM-DD-math-audit.md`).

- [x] **Remove pm-agent.mdc artifact** — Remove trailing markdown artifact in `.cursor/rules/pm-agent.mdc`.
  - *Acceptance:* File parses cleanly; no stray characters or broken structure.

- [x] **Add command-integrity check** — Document or automate a recurring check that audit rules reference correct process docs.
  - *Acceptance:* Process exists (manual or script); doc describes how to verify rules ↔ process alignment.

- [x] **Add PM release-gate audit item** — Add to `docs/process/pm-review-checklist.md` (or equivalent) an item for required audits per `docs/audits/README.md`.
  - *Acceptance:* Release checklist includes "Run required audits per cadence"; link to audits README.

---

## Batch 3: Reliability & observability

*Purpose: Health checks, error visibility, and incident runbook.*

- [x] **Add /api/health endpoint** — Create `/api/health` with DB connectivity check.
  - *Acceptance:* GET returns 200 when DB reachable, 503 when not; no auth required; response includes status.

- [x] **Add structured error logging to billing** — In `api/billing/create-checkout-session` and `api/billing/sync`, log errors with context (no card numbers).
  - *Acceptance:* Stripe/billing errors logged with error type and request context; no sensitive data.

- [x] **Create incident-response runbook** — Create `docs/runbooks/incident-response.md` covering rollback, monitoring, and recovery.
  - *Acceptance:* Doc covers: how to rollback, where to check logs/monitoring, recovery steps; linked from relevant docs.

- [x] **Add Suspense wrappers** — Wrap dashboard and properties page components in `Suspense` where appropriate.
  - *Acceptance:* Async data fetches show fallback during load; no layout shift or flash of empty state.

---

## Batch 4: Performance

*Purpose: Reduce client bundle, avoid hydration issues, and throttle heavy operations.*

- [x] **Dynamic-import ProjectionsTabContent chart** — Wrap `ProjectionsTabContent` or its chart in `next/dynamic` with `ssr: false`.
  - *Acceptance:* Chart loads client-side only; no hydration mismatch; tab remains functional.

- [x] **Dynamic-import MortgageTabContent chart** — Wrap `MortgageTabContent` or its chart in `next/dynamic` with `ssr: false`.
  - *Acceptance:* Same as above for mortgage tab.

- [x] **Throttle dashboard benchmark refresh** — Add sequential or throttled execution to dashboard benchmark refresh loop.
  - *Acceptance:* Benchmark refreshes do not fire in parallel burst; configurable delay or queue.

- [x] **Pass subscription as server props to Settings** — Fetch subscription details server-side and pass as props to Settings page.
  - *Acceptance:* Settings page receives subscription data from server; no client fetch for initial load.

---

## Batch 5: Data integrity & math

*Purpose: Import flexibility, validation, export completeness, and display correctness.*

- [x] **Import parser aliases** — Update import parser to accept `mortgage balance (effective)` or `mortgage balance (stored)` as column aliases.
  - *Acceptance:* CSV import succeeds when column header uses either alias; mapping documented.

- [x] **Zod validation for unitRents** — Add Zod runtime validation for `unitRents` JSON field on read.
  - *Acceptance:* Invalid `unitRents` shape rejected or sanitized; valid data passes; error message clear.

- [x] **NOI and annual cash flow in export** — Add NOI and annual cash flow columns to portfolio export.
  - *Acceptance:* Export includes columns; values match `docs/policies/ownership-metrics.md` formulas.

- [x] **Projection chart scaleLiabilityAmount** — Make projection chart loan balance use `scaleLiabilityAmount` for mode-aware display.
  - *Acceptance:* Chart shows scaled values when in scaled mode; matches other liability displays.

- [x] **Mortgage tab baseline note** — Update mortgage tab baseline note to clarify "no extra payment" scenario.
  - *Acceptance:* Note explicitly states baseline assumes no extra payments; no ambiguity.

- [x] **Evaluate ownershipPercent/vacancyPercent schema** — Evaluate Prisma schema change for `ownershipPercent`/`vacancyPercent` (Int → Decimal).
  - *Acceptance:* Decision documented (migrate or defer); if migrate, migration plan and backward compatibility considered.

---

## Batch 6: UX / Feature

*Purpose: Nav clarity, Deals UX, card consistency, and dashboard metrics.*

- [x] **Rename Pricing → Plans** — Rename nav label "Pricing" to "Plans" and page title to "Plans & billing".
  - *Acceptance:* Nav shows "Plans"; page title/heading shows "Plans & billing"; links updated.

- [x] **Remove duplicate Modeling/Mortgage links** — Remove duplicate links from bottom of property detail Overview.
  - *Acceptance:* Single set of Modeling/Mortgage links; no redundancy.

- [x] **Deals sort and search** — Add sort-by-date and search to Deals page.
  - *Acceptance:* User can sort deals by date; user can search/filter deals; UI clear.

- [x] **Standardize card styling** — Standardize card styling tokens across dashboard, properties, deals, and workspaces.
  - *Acceptance:* Shared tokens (border, padding, shadow) used consistently; no visual drift.

- [x] **Remove View action from deal cards** — Remove "View" action from deal cards (redundant with card click).
  - *Acceptance:* Deal cards navigate on click; no separate View button.

- [x] **Replace window.confirm in deals** — Replace `window.confirm()` with app-consistent delete confirmation (modal or inline).
  - *Acceptance:* Delete uses same pattern as other delete flows; accessible; no native confirm.

- [x] **Single-property metric cards** — Add single-property metric cards or inline metrics to dashboard.
  - *Acceptance:* When one property, dashboard shows key metrics (NOI, cash flow, etc.); matches design spec.

- [x] **Fix Analyze Deal Investment Metrics layout (O6)** — In Analyze Deal, Investment Metrics section: (1) Prevent "Monthly cash flow", "Annual cash flow", "Equity", "NOI" labels from wrapping to 3 lines; (2) Let Ownership % input span full width of card instead of clamping to column width.
  - *Acceptance:* Labels stay on 1–2 lines; layout looks professional at common viewport widths; Ownership % input spans full card width.

---

## Batch 7: Growth & activation

*Purpose: Screenshots, onboarding guidance, and re-entry paths.*

- [x] **Product screenshots** — Add product screenshots to landing page and public pricing page.
  - *Acceptance:* Screenshots visible; alt text; optimized size; no placeholder images.

- [x] **"What's next" guidance card** — Add "What's next" guidance card to post-first-property dashboard.
  - *Acceptance:* After first property added, user sees actionable next steps (e.g. add deal, run projections).

- [x] **"Analyze a deal" CTA** — Add "Analyze a deal" CTA to dashboard empty state.
  - *Acceptance:* Empty state includes clear CTA to deals; reduces drop-off.

- [x] **"Getting started" link** — Add "Getting started" link in sidebar or settings for re-entry to onboarding tips.
  - *Acceptance:* User can return to onboarding content from sidebar/settings; link prominent.

- [x] **Wizard Quick add / mortgage skip** — ~~Consider wizard "Quick add" mode or mortgage step skip.~~ **Deferred.** Full wizard overhaul planned as a separate roadmap item. See `docs/reference/roadmap.md`.
  - *Acceptance:* Decision documented.

- [x] **Sidebar: Getting started → Add property (Phase 1)** — When user has 0 properties, sidebar footer link label is "Getting started"; when ≥1 property, label is "Add property". Same destination `/properties/new`.
  - *Acceptance:* Copy matches portfolio state; link behavior unchanged.

---

## Batch 8: Business & quality — **active (pre-launch)**

*Add-property experience overhaul (Epics A–G) is complete. Remaining Batch 8 work: instrumentation, changelog, uptime.*

*Purpose: Product analytics (PostHog), public changelog, external uptime monitoring.*

**Builder handoff (PM → implementer):** [`launch/batch-8-builder-handoff.md`](launch/batch-8-builder-handoff.md) — execution order, review gate, pointers to acceptance criteria below.

- [x] **Initial test coverage** — Vitest + Phase 1 unit tests; full strategy in [`proposals/testing-implementation-plan.md`](proposals/testing-implementation-plan.md).
  - *Acceptance:* Core math and metrics have unit tests; `npm run test` passes; `npm run test:coverage` available.

- [x] **Launch plan** — Create launch plan (target communities, messaging, timeline).
  - *Acceptance:* Doc exists with audience, messaging, and phased timeline.
  - *Deliverable:* [`docs/launch/launch-plan.md`](launch/launch-plan.md) *(Batch 8; Epic G in add-property overhaul is QA-only — see doc §1).*

### 8.1 PostHog + product events (instrumentation)

- [x] **PostHog Cloud + SDK** — Integrate **PostHog** for product analytics (not a custom admin funnel).
  - *Acceptance:*
    - [x] `posthog-js` (and/or `posthog-node` where server-side capture is needed) added in `app/`; init runs only when `NEXT_PUBLIC_POSTHOG_KEY` is set (no errors in dev without keys).
    - [x] `app/.env.example` documents `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` (default `https://us.i.posthog.com` or EU host if using EU project), with link to PostHog project settings.
    - [ ] Vercel production env has PostHog keys; **production** loads the snippet and events appear in PostHog (verify in PostHog “Live events”). *— PM: set keys in Vercel and verify.*
    - [x] **Identify:** After Clerk session is available, call `posthog.identify` with stable `userId` (Clerk user id) so funnels are per-user, not anonymous noise only.
    - [x] **Core funnel events** (names can be snake_case; keep consistent everywhere):
      - `user_signed_up` — first-time account creation (Clerk sign-up success path or one server event; avoid duplicate spam per user).
      - `property_created` — property successfully created (client after success or server after DB write; one event per create).
      - `deal_created` — deal successfully created.
      - `checkout_started` — user lands on Stripe Checkout or `create-checkout-session` succeeds (choose one canonical moment; document in code comment).
    - [x] Optional but recommended: `plan_upgraded` or `subscription_activated` when webhook confirms paid tier (server-side capture preferred for truth).
    - [x] **Privacy / compliance:** Document in [`docs/launch/launch-plan.md`](launch/launch-plan.md) or a short [`docs/launch/analytics.md`](launch/analytics.md): what PostHog collects, that keys are opt-in via env, and link to privacy policy; add cookie/consent note if required for your jurisdictions.
    - [x] At least one **PostHog insight** or saved funnel in the PostHog UI documented in `docs/launch/analytics.md` (e.g. sign-up → property_created within 7 days) so PM can reproduce the view.

### 8.2 Public changelog

- [x] **Public `/changelog` page** — Ship a changelog for users and SEO.
  - *Acceptance:*
    - [x] Route **`/changelog`** exists under `app/app/changelog/` (or equivalent); uses `Metadata` (title, description, canonical via `NEXT_PUBLIC_APP_URL`).
    - [x] **SEO (changelog-specific):** `title` and `description` target intent like “product updates” / “what’s new” for Veld Portfolio (not generic “Changelog” only); **`openGraph`** (and **Twitter** if consistent with `app/layout.tsx` patterns) includes title, description, and canonical URL for `/changelog`; optional **`keywords`** or richer first-paragraph copy if aligned with [`docs/launch/investor-style-one-pager.md`](launch/investor-style-one-pager.md) positioning (real estate portfolio software). H1 on page matches positioning.
    - [x] Lists **release entries** (date + title + short bullet list of user-visible changes); initial entry can be “Initial public changelog” + pointer to product areas.
    - [x] **Footer** (and optionally landing nav) includes a link to `/changelog` (“Changelog” or “What’s new”).
    - [x] **Robots:** page is allowed in `app/robots.ts` if you want it indexed; **sitemap:** add `/changelog` to `app/sitemap.ts` with appropriate `changeFrequency` / `priority`.
    - [x] Process note in [`docs/launch/launch-plan.md`](launch/launch-plan.md) or `docs/launch/analytics.md`: how to add a new entry each release (edit file vs component data structure).

### 8.3 External uptime monitor

- [x] **Uptime monitoring for production `/api/health`** — Use an **external** service (UptimeRobot, Better Stack, Pingdom, etc.); do not build this into the app.
  - *Acceptance:*
    - [x] Monitor **GET** `https://veldportfolio.com/api/health` in **production**; expect **HTTP 200** and JSON indicating DB ok (match current [`api/health`](../app/app/api/health/route.ts) contract). *— UptimeRobot.*
    - [x] **Alert channel** — email to support inbox (see runbook).
    - [x] Documented in [`docs/runbooks/incident-response.md`](runbooks/incident-response.md) § *External uptime monitor*: provider, URL, alerts, [public status page](https://stats.uptimerobot.com/Z6ScA8Ip37).
    - [x] Public status page: [stats.uptimerobot.com/Z6ScA8Ip37](https://stats.uptimerobot.com/Z6ScA8Ip37).

---

## Active: Add-property experience overhaul *(complete — regression only)*

*Full analysis, problems, principles, and **epics with acceptance criteria**: `docs/proposals/add-property-experience-overhaul.md`.*

Scope: **Add property** (wizard), **`/properties/[id]/edit`** (`property-form`), **property Detail** (**Overview** + **Details** tabs)—unify on shared primitives and consistent wayfinding; remove redundant edit patterns for the same data.

**Status:** Epics **A–G** complete (2026-03). Ongoing regression: [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md).

### Epic A — IA & design freeze
*Deliverables: [`docs/proposals/epic-a-discovery.md`](proposals/epic-a-discovery.md) — **A2 & A3 signed** (hybrid first-save; Details → `/edit`).*
- [x] **A1** Field inventory (wizard + edit + detail inline) → API mapping
- [x] **A2** First-save vs enrich-later decision (written)
- [x] **A3** Edit surface + what replaces Details triple inline (written)
- [x] **A4** Visual references (moodboard/Figma) aligned with team

### Epic B — Shared property UI layer
*Include optional **sqft** on the property record + RentCast **`squareFootage`** on estimates (see [`docs/proposals/epic-a-discovery.md`](proposals/epic-a-discovery.md) § Estimate fidelity).*
- [x] **B1** Shared tokens (`components/property/property-form-field-classes.ts`) + **`PropertySquareFeetField`**; used on add wizard, `/edit`, Details facts. *Full Location/Economics/Notes section extraction → epics C–D.*
- [x] **B2** **`squareFeet`** on `Property` + Zod + `POST`/`PATCH`/`GET` property APIs
- [x] **B3** RentCast **`squareFootage`** in `lib/integrations/rentcast.ts` + `/api/estimates/rent` & `value`; clients pass sqft when set

### Epic C — Add property (replace wizard)
- [x] **C1** Sectioned single-page add flow (sticky jump nav + anchors); **`?from=`** deal prefill unchanged; **draft** restore scrolls to Review — implementation: `app/app/(app)/properties/add-property-wizard.tsx`
- [x] **C2** Mortgage: explicit optional copy; **No, skip** remains non-blocking for create
- [x] **C3** Entry-point QA checklist — [`epic-c-entry-qa.md`](proposals/epic-c-entry-qa.md) *(manual smoke when touching this flow)*

### Epic D — Edit property page
- [x] **D1** Rebuild `/edit` on shared components — sectioned layout + sticky jump nav + `PROPERTY_EDIT_SECTION_NAV` in `lib/property-form-section-nav.ts`; `property-form.tsx` mirrors add flow sections (Location, Purchase & value, Income, Notes)
- [x] **D2** PATCH parity + plan errors — `unitMix` + `squareFeet` in PATCH payload; Zod `details` surfaced on validation failure; `PLAN_LIMIT_REACHED` unchanged
- [x] **D3** Wayfinding / hierarchy — edit page copy + link to property detail for mortgages/modeling; QA — [`epic-d-entry-qa.md`](proposals/epic-d-entry-qa.md)

### Epic E — Property detail (Details tab)
- [x] **E1** Replace/merge triple inline edit pattern (per A3) — Details is **read-only** summary + primary **Edit property** → `/edit`; no per-section Facts / Financial / Notes editors
- [x] **E2** Unsaved changes UX — inline PATCH + discard flows removed from Details (no `window.confirm` for facts/financial/notes)
- [x] **E3** Mortgage block styling parity — `MortgageSection` uses **`embedded`** inside the same `p-4` card as other blocks; typography/padding aligned; QA — [`epic-e-entry-qa.md`](proposals/epic-e-entry-qa.md)

### Epic F — Property Overview tab (`/properties/[id]` default tab)
- [x] **F1** De-duplicate headline KPIs — `PropertyHero` is identity-only; **Performance at a glance** is the single KPI grid (`overview-tab-content.tsx`, `property-hero.tsx`)
- [x] **F2** Visual parity with Details — cards `rounded-lg border border-border bg-card p-4`; primary **Edit property** (accent); shared **`PropertyHealthStrip`** with Details
- [x] **F3** Cross-tab wayfinding — **View full property data (Details tab)** + **Inputs at a glance** links to `?tab=details`
- [x] **F4** **Inputs at a glance** (replaces “Verification”) — includes **rent** + mortgage snapshot + copy pointing to Details / Edit
- [x] **F5** Data/benchmark **health strip** on Overview (same chips as Details via `property-health-strip.tsx`)
- [x] **F6** QA checklist — [`epic-f-overview-qa.md`](proposals/epic-f-overview-qa.md)

### Epic G — QA & cleanup
- [x] **G1** Regression matrix — [`qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md) (see also [`qa/README.md`](qa/README.md))
- [x] **G2** Remove dead code paths after cutover — removed unused `app/app/(app)/properties/[id]/section-nav.tsx` (never imported)
- [x] **G3** Docs update — property add/edit/detail surfaces in [`architecture-and-build-practices.md`](architecture-and-build-practices.md) § Current Architecture

---

## UX contract note (vacant rent)

- [x] **Vacant-state rent semantics** — In add/edit property flows, when `isRented = false`, rent inputs are not required and should not imply required status; market-rent estimate actions are hidden; copy states that income is saved as `$0` until marked rented; review summary explicitly shows `Rented: No` and vacant rent semantics. Persistence remains canonical in API (`currentMonthlyRent = 0`, `unitRents` cleared).

---

## Batch 9: Audit hardening follow-ups — **active**

*Purpose: Implement accepted 2026-03-28 synthesis follow-ups in phased order so we reduce production risk first, then compliance/contract drift, then reliability/performance polish.*

### Phase 9A (P0): Safety + correctness first

- [x] **Enforce Stripe webhook secret deploy guard** — Add `STRIPE_WEBHOOK_SECRET` to env validation/deploy guard flow.
  - *Acceptance:* Build/start fails fast with clear message when missing in required environments; `app/.env.example` and `docs/setup/manual-steps.md` reflect requirement.
- [x] **Normalize estimate/benchmark failure semantics** — Standardize API status/error/usage accounting for estimate and benchmark routes.
  - *Acceptance:* Upstream/provider failures return non-2xx consistently (e.g. 502/503); success remains 200; quota accounting rules are explicit and consistently applied; frontend error handling remains functional.
- [x] **Index RentCast hourly usage counts** — Add DB index for quota queries.
  - *Acceptance:* Prisma migration adds index on `RentCastApiCall(userId, createdAt)`; query plan/perf for hourly count improves; migration applied successfully.
- [x] **Single-property benchmark UX parity** — Respect `not_rented` / `rent_missing` states on single-property dashboard benchmark surfaces.
  - *Acceptance:* Single-property dashboard does not show misleading refresh/comparison actions when not rented or rent missing; copy matches property detail/list semantics.
- [x] **Cap dashboard benchmark refresh burst** — Replace unbounded stale-benchmark auto-refresh behavior.
  - *Acceptance:* Dashboard no longer triggers sequential refresh for all stale/missing properties on load by default; refresh strategy is explicit (capped, queued, or user-triggered) and UI communicates state clearly.

### Phase 9B (P1): Data + compliance alignment

- [x] **Fix import/export rental data integrity** — Resolve round-trip mismatches for `propertyType`, `isRented`, and rent source of truth.
  - *Acceptance:* Export preserves canonical property types; import/export support `isRented`; import defines deterministic precedence between `rent` and `unitRents` (with tests); round-trip no longer mutates semantics unexpectedly.
- [x] **Property API normalization parity** — Align POST/PATCH property serialization and rent split behavior with canonical helpers.
  - *Acceptance:* POST returns `unitRents` normalized like GET; PATCH uses effective `propertyType` (`data.propertyType ?? existing.propertyType`) when recomputing `unitRents`; regression tests cover both paths.
- [x] **Multi-mortgage export semantics** — Make export behavior explicit and trustworthy for properties with multiple mortgages.
  - *Acceptance:* Export either includes per-lien detail (columns or row strategy) or clearly labels “primary mortgage only”; docs and tests match chosen contract.
- [x] **Cookie consent + tracking gate (analytics/ads)** — Implement a consent system that keeps essential auth cookies always-on while gating PostHog and Google Ads until user opt-in.
  - *Implementation plan (concrete):*
    - Add a small consent model (`essential`, `analytics_ads`) with persisted choice in first-party storage (cookie or localStorage) and helper utilities in `app/lib/`.
    - Create a reusable consent banner component (accept/reject/manage) with design-spec-compliant styling and no intrusive modal behavior.
    - Gate PostHog initialization (`components/analytics/posthog-provider.tsx`, pageview/identify/signup emitters) behind `analytics_ads` consent.
    - Gate Google Ads script injection in `app/app/layout.tsx` behind the same consent check (and existing env checks).
    - Add a persistent “Manage cookies” entry point in footer/settings to reopen/update consent.
    - Update `app/app/privacy/page.tsx` with explicit consent language (essential vs optional categories, what loads only after opt-in).
  - *Acceptance:*
    - First visit with analytics envs set shows consent UI.
    - Before consent: no PostHog init/capture and no Google Ads script load.
    - After accept: tracking initializes and events fire as expected.
    - After reject: tracking remains disabled and choice persists across reloads.
    - User can change choice later via “Manage cookies”.
    - Privacy policy copy matches actual runtime behavior.
- [x] **CSP staged enforcement with reporting** — Move from report-only toward enforced CSP with an explicit rollout plan.
  - *Acceptance:* Reporting endpoint/mechanism is configured; policy is deployed in report-only first with documented review window; enforcement mode is enabled after violations are triaged; no critical route breakage in smoke checks.

### Phase 9C (P1): Metric contract + governance

- [x] **Resolve annual-rent vs NOI basis mismatch** — Align math/display contract for annual rent relative to vacancy-adjusted NOI.
  - *Acceptance:* Metric definitions are explicitly aligned or clearly labeled as different bases; dashboard/API/export use the same contract; policy/docs updated to match.
- [x] **Benchmark math helper consistency** — Centralize benchmark delta math usage across API and UI.
  - *Acceptance:* `benchmark/refresh` delta calculation uses shared benchmark helper(s) from `lib/benchmark-utils.ts`; no duplicated formula drift.
- [x] **Benchmark freshness boundary contract** — Decide and document strict vs inclusive 60-day freshness behavior.
  - *Acceptance:* `isBenchmarkFresh` boundary behavior is explicit in code/tests/docs; UI copy/tooltips do not conflict with implementation.
- [x] **Align governance hook policy enforcement** — Make `.cursor/hooks.json` ASK-risk behavior match documented shell-risk policy.
  - *Acceptance:* Hook prompt and `docs/policies/shell-risk-policy.md` define the same ASK-risk categories; `docs/process/pm-agent-workflow.md` reflects the same rules; command-integrity check docs updated if needed.
- [x] **Clarify RentCast quota model** — Resolve shared-pool ambiguity between rent and value estimate quota accounting.
  - *Acceptance:* Either split counters by endpoint type or document shared-pool behavior in code/docs and surface user-facing limits where appropriate.(no surfacing to user)

### Phase 9D (P2): Reliability + perf hardening

- [x] **Reliability hardening follow-up** — Improve production failure visibility and fallback UX for key error paths.
  - *Acceptance:* Stripe subscription-sync user-resolution failures are sent to Sentry with actionable metadata; `app/app/global-error.tsx` has accessible on-brand fallback UX; API logging/Sentry expectations are documented in architecture practices.
- [x] **Public route rendering performance cleanup** — Address known medium-priority performance drift on public routes.
  - *Acceptance:* Landing/pricing images use `next/image`; stable marketing/legal pages either use `revalidate` or have explicit documented rationale for dynamic rendering.
- [x] **Add export abuse controls** — Add rate limiting (or equivalent abuse controls) for portfolio CSV export endpoints.
  - *Acceptance:* `GET /api/export/portfolio` is protected by explicit abuse control; admin export path decision is documented (also protected or intentionally exempt with rationale).
- [x] **Contact route auth/scoping decision** — Align contact endpoint auth helper behavior with security policy.
  - *Acceptance:* Route is updated to `getActiveAppUser()` or policy/docs explicitly state and justify allowing soft-deleted users to submit contact forms.
- [x] **Audit regression coverage for benchmark load spikes** — Add integration/e2e coverage for many stale benchmarks.
  - *Acceptance:* Automated coverage verifies capped/queued refresh behavior, quota handling, and user-visible state on large stale sets.

### Deferred / declined from synthesis (owner decisions)

- [ ] **Deferred:** Split `add-property-wizard.tsx` into smaller step modules/hooks.
  - *Acceptance:* Keep deferred until complexity/velocity signals justify refactor.
- [ ] **Declined:** Onboarding panel decorative style simplification.
  - *Acceptance:* No action unless design direction changes.
- [ ] **Declined:** Optional nav micro-copy / tooltip changes for Analyze vs Deals and Plans/Pricing cross-link.
  - *Acceptance:* No action.

### Needs clarification before implementation (IF PM Gets here, stop here after clarifying)

- [x] **Clarify tolerance-aware payoff task scope** — Confirm desired strict vs tolerance behavior for extra-payment payoff helpers before implementation.
  - *Decision (PM/owner):* **Hybrid contract**. Keep payoff math strict in core contracts (API/export/core helpers), and allow tolerance-aware interpretation only in UI with explicit disclosure copy.
  - *Acceptance:* Decision recorded; implementation task added below.
- [x] **Implement hybrid payoff contract (strict core + tolerance-aware UI disclosure)** — Apply strict payoff semantics to core data contracts while preserving user-friendly tolerance handling in UX.
  - *Acceptance:*
    - Core helper/API/export contract uses strict payoff semantics only (no implicit tolerance-based payoff in canonical data outputs).
    - UI surfaces may show tolerance-aware payoff states, but must include clear disclosure text and tooltip/help copy describing tolerance behavior.
    - Tests cover strict-vs-tolerance divergence cases and ensure API/export remain strict.
    - Policy/docs are updated so math contract and UI wording stay aligned.

---

## Batch 10: Growth follow-ups (separate)

*Owner requested this lane be batched separately from Batch 9.*

- [x] **Funnel instrumentation expansion** — Add high-signal events for CTA clicks, onboarding modal actions, and add-property flow milestones.
  - *Acceptance:* New events are documented in `docs/launch/analytics.md`, emitted once per intended action, and visible in PostHog.
- [x] **Pricing intent propagation** — Pass plan intent from logged-out pricing to sign-up and post-auth flows.
  - *Acceptance:* Sign-up receives deterministic plan intent (`?intent=` or equivalent), and downstream copy/event properties reflect it.
- [x] **Growth analytics documentation polish** — Document signup event eligibility/window and optional billing success view event behavior.
  - *Acceptance:* Internal analytics docs clearly define event windows/dedup rules and any optional event usage.

---

## Batch 11: Business follow-ups (approved subset — 2026-03-28)

- [x] **Internal billing matrix** — `docs/internal/billing-matrix.md`: tier → property/deal limits → RentCast hourly caps → Stripe `STRIPE_PRICE_ID_*` → `NEXT_PUBLIC_PRICE_*`; includes release verification checklist.
- [x] **Roadmap mortgage-balance reconciliation** — `docs/reference/roadmap.md` mortgage section aligned with shipped state and `docs/tasks.md` (done vs deferred).
- [x] **Terms last updated** — Matches Privacy review recency (`March 2026`); source `TODO(legal)` for operating entity alignment with `docs/business-launch-checklist.md` (no forced entity rename).
- [x] **Pricing footnote** — Single line on `/pricing` for third-party estimate hourly limits by tier.
- [ ] **Trust strip / testimonials / logos** — *Deferred* (explicitly out of approved Batch 11 scope).

---

## Batch 12: Audit follow-ups (2026-03-28 run 2)

*Source: `docs/audits/synthesis/2026-03-28-audit-synthesis-2.md`. Ordered by PM priority after review.*

### High priority

- [x] **Make CSP reporting endpoint public** — Ensure anonymous browsers can submit CSP violation reports from public pages.
  - *Acceptance:* `/api/csp-report` is explicitly allowed through `app/proxy.ts` (or equivalent public-route mechanism); anonymous POST requests succeed; report-only/enforced CSP on public routes can reach the endpoint without auth redirects or 401/403 behavior; docs remain accurate.
- [x] **Ship benchmarking v2 consistency contract** — Apply one shared benchmark-comparability contract across dashboard, properties list, and property detail.
  - *Acceptance:* A single helper (for example `isBenchmarkComparable(...)` or equivalent) governs benchmark eligibility using the agreed rented/rent/market-data rules; dashboard/list/detail surfaces do not drift in whether they show comparison, refresh, or hidden-state copy; regression tests cover not-rented, rent-missing, stale, and eligible states.
- [x] **Surface RentCast quota visibility near estimate actions** — Reduce surprise quota exhaustion by showing remaining quota context near estimate/refresh flows.
  - *Acceptance:* User-facing estimate/refresh surfaces show clear quota context (remaining uses or equivalent shared-pool hint) before hard failure; copy matches the documented shared-pool quota model; behavior is consistent across relevant estimate/benchmark entry points.

### Medium priority

- [x] **Forward CSP violation reports to Sentry** — Improve production visibility for CSP rollout monitoring.
  - *Acceptance:* `POST /api/csp-report` forwards violation reports to Sentry in production with sane grouping/sampling to avoid noise; local/dev behavior remains lightweight; docs for CSP rollout and monitoring mention where reports are reviewed.
- [ ] **Prepare business metrics snapshot for next valuation pass** — Create a lightweight source of truth for revenue/usage metrics used in future business audits.
  - *Acceptance:* A documented template or checklist exists for tracking core business metrics (at minimum MRR, churn, and active users), with clear note that the data may live outside the repo if preferred; next valuation audit can reference this source directly.

### Low priority

- [x] **Keep audit lane docs/rules synchronized** — Add a lightweight governance reminder so lane naming and paths stay aligned when audit structure changes.
  - *Acceptance:* Relevant process/docs clearly state that lane-name or folder changes must update `docs/audits/README.md` and matching `.cursor/rules/*` references in the same pass; no stale lane references remain in current docs.
- [x] **Add benchmark-display regression coverage when benchmarking v2 lands** — Extend tests once the shared benchmark contract is implemented.
  - *Acceptance:* Automated coverage verifies benchmark display behavior for the shared comparability contract, including hidden/refreshable/eligible states, and guards against future UI drift.

---

## Batch 13: Owner notes follow-ups (2026-03-29)

*Source: `docs/owner_notes/notes.md` items O7-O11 that are not yet tracked elsewhere in `docs/tasks.md`.*

### Product / UX

- [x] **Fix Analyze Deal stress-mode popup contrast (O7)** — Improve readability and contrast for the rent-sensitivity and expense-sensitivity stress-mode popup in Analyze Deal.
  - *Acceptance:* Popup text and interactive states meet the app's normal readability standard in the relevant app theme(s); no low-contrast text remains; styling stays aligned with `docs/policies/design-spec.md`.

### Audit / governance process

- [x] **Add documentation audit lane and process (O8)** — Create a lightweight documentation audit process for stale docs, archive candidates, broken references, and folder hygiene.
  - *Acceptance:* A process doc exists under `docs/process/`; any required `.cursor/rules/` audit rule exists if this lane should be runnable via agent command; `docs/audits/README.md` is updated if the new lane is adopted; scope clearly distinguishes cleanup recommendations from implementation tasks.

- [x] **Add legal/compliance audit lane with clear disclaimer (O8)** — Define a practical AI-assisted legal/compliance review process for obvious app-facing issues without presenting it as a substitute for counsel.
  - *Acceptance:* A process doc exists describing scope, exclusions, and disclaimer language; it covers obvious privacy/terms/cookie/comms checks relevant to this app; if adopted as an audit lane, matching docs/rules/output location are wired consistently.

- [x] **Expand agent-governance audit scope for workflow consistency (O8)** — Update the AI governance audit/process so it explicitly reviews drift between hooks, rules, docs, and actual day-to-day usage.
  - *Acceptance:* `docs/process/agent-governance-audit-process.md` and any matching rule prompt explicitly include: hook-vs-doc drift, where guidance should live (hook vs rule vs doc), and AI workflow consistency recommendations; docs remain aligned per `docs/process/command-integrity-check.md`.

### Documentation / enablement

- [x] **Create project grounding write-up (O9)** — Write a multi-section overview of the application covering what it is, current architecture, integrations, AI workflow, coding principles, current state, and likely future direction.
  - *Acceptance:* A doc exists in `docs/` with clear sections for product overview, stack/integrations, AI process, coding principles, current state, and future direction; it is written for the owner rather than external marketing copy; references key source docs where useful.

- [x] **Create demo preparation guide (O10)** — Write a demo-prep document that explains app concepts, metrics, and major pages progressively enough for a non-expert owner to speak confidently about the product.
  - *Acceptance:* A doc exists in `docs/` with plain-English explanations of key terms (including NOI and related metrics), explanation of how metrics are calculated at a high level, and walkthrough sections for dashboard, modeling, property detail, mortgage, and other relevant pages.

### Strategic analysis

- [x] **Produce differentiator / value-add analysis (O11a)** — Research and document the highest-value feature, positioning, UX, and product differentiators for Veld Portfolio.
  - *Acceptance:* A doc exists with at least 10 ranked suggestions, each with rationale and an importance score; recommendations may include feature, UX, positioning, or visual-differentiation ideas, but should stay grounded in the current product and target user.

- [x] **Produce AI operations efficiency analysis (O11b)** — Review the current AI workflow and recommend process, tooling, model-usage, and operating improvements for the owner.
  - *Acceptance:* A doc exists with concrete recommendations covering current workflow strengths/weaknesses, model/task fit, when to use hooks vs docs vs rules, and practical operational ideas (for example remote access / on-the-go workflows where relevant); recommendations are specific enough to change how the project is run.

---

## Archived references (2026-03)

Detailed completed QA/history sections were moved to `docs/tasks-archived.md` to keep this file focused on active work:

- Property detail overhaul test checklist (verified complete; moved to archive).
- Property detail tabs UX refinements test checklist (verified complete; moved to archive).
- Recently completed implementation notes and summaries.
- Details tab Phase B inline editing completion checklist.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
