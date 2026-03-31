# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.
**Ownership policy (ownership/metrics tasks):** Follow `docs/policies/ownership-metrics.md` as the canonical source for formulas and copy semantics.
**Analytics math policy (analytics/projection tasks):** Follow `docs/policies/analytics-math-policy.md` for debt-service basis, time-window labels, and UI/API/export reconciliation.

**Future features / roadmap:** See `docs/reference/roadmap.md`. PM promotes items from there to here when ready to build.

**Test quality gate (process):** How tests fit CI, PM review, and pre-push flow is in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md). **Completed** test-infra Phases 1–2, Husky, and audit batches **1–15** (checked-off detail) are in [`docs/tasks-archived.md`](tasks-archived.md) § **Tasks.md archive (2026-03-30)**. **Planned** automated-test expansion: **Testing hardening** below (aligned with [`qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md)).

---

## Completed

Historical completion logs and full checkbox snapshots are in [`docs/tasks-archived.md`](tasks-archived.md) — see **§ Tasks.md archive (2026-03-20)** and **§ Tasks.md archive (2026-03-30)**.

---

## Roadmap priority (value vs effort — last reviewed 2026-03-30)

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

### Mobile shell verification (functionality, logic, math)

*Process:* PM promotes here → **builder** implements per `.cursor/rules/builder-agent.mdc`. **Canonical math:** `docs/policies/ownership-metrics.md`, `docs/policies/analytics-math-policy.md`. **Playwright/E2E:** out of scope for this batch.

*Plan & checklist:* [`docs/qa/mobile-shell-verification.md`](qa/mobile-shell-verification.md). **Broader mobile audit criteria** (full app): [`docs/qa/mobile-experience-audit.md`](qa/mobile-experience-audit.md).

**Status:** Phase **A** (Vitest + `MobileToolShell` tests) is complete — detail in [`docs/tasks-archived.md`](tasks-archived.md) § Tasks.md archive (2026-03-30).

#### Phase 0 — Manual QA (PM or owner)

- [ ] **Run manual matrix** — At 320 / 375 / 430px and desktop ≥768px: verify all four `MobileToolShell` surfaces (Deal Analyzer, Modeling, Mortgage, Public calculator per landing/calc routes). Confirm functionality (shell chrome, inputs, collapsibles, charts), and spot-check logic/math against policies (see verification doc § Phase 0).
  - *Acceptance:* Checklist in `docs/qa/mobile-shell-verification.md` completed or issues filed; no blocking regressions.

#### Phase B — Optional integration smoke (builder, after A)

- [ ] **Optional: `matchMedia` + public calculator smoke** — Mock `(max-width: 767px)` and render `PublicCalculator` (or minimal wrapper) to assert mobile shell path renders — only if low flake.
  - *Acceptance:* Documented in `docs/qa/mobile-shell-verification.md`; skip with rationale if not worth maintenance.

---

### Pre-launch / PM — PostHog production (Batch 8.1)

- [ ] **Vercel production env** — `NEXT_PUBLIC_POSTHOG_KEY` / host set in Vercel; **production** loads the snippet and events appear in PostHog (“Live events”). Full acceptance bullets lived under Batch 8.1 in [`docs/tasks-archived.md`](tasks-archived.md) § Tasks.md archive (2026-03-30).

---

### Deferred backlog (owner decisions; not scheduled)

*Full context and completed synthesis phases are in the 2026-03-30 archive section.*

- [ ] **Batch 9 — Deferred:** Split `add-property-wizard.tsx` into smaller step modules/hooks (until complexity/velocity justify).
- [ ] **Batch 9 — Declined:** Onboarding panel decorative style simplification; optional nav micro-copy / tooltip changes — *no action unless design direction changes.*
- [ ] **Batch 11 — Deferred:** Trust strip / testimonials / logos (out of approved Batch 11 scope).
- [ ] **Batch 12 — Deferred:** Prepare business metrics snapshot for next valuation pass (MRR/subscriber); *owner preference: no in-repo placeholder until live metrics exist.*
- [ ] **Batch 14 — Deferred: CSP** — Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` match [`docs/policies/csp-rollout.md`](policies/csp-rollout.md); optionally add request body size guard for `POST /api/csp-report` if monitoring shows abuse.

---

### Testing hardening (phased — Vitest + optional E2E)

*Source & rationale:* [`docs/qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md) (tiers A–D, gaps, what “high confidence” means). *Process:* PM assigns by phase; **builder** implements per `.cursor/rules/builder-agent.mdc` and existing route-test patterns (`vi.mock` auth/db/rate-limit). *Sequencing:* **Complete Phase 1 before Phase 2** unless PM explicitly parallelizes. **Do not** start Phase 4 (E2E) until Phase 1 billing/webhook tests exist. Update [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §10 change log when a phase completes or CI policy changes.

**Correctness-first (applies to every phase):** Assertions must reflect **intended** behavior from [`docs/policies/ownership-metrics.md`](policies/ownership-metrics.md), [`docs/policies/analytics-math-policy.md`](policies/analytics-math-policy.md), [`docs/internal/api-list-contract.md`](internal/api-list-contract.md), and other agreed specs — not “whatever the route returns right now.” If code and policy disagree, **fix the code or update the policy doc**, then write tests that lock the corrected contract. See [`docs/qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md) §1.1.

#### Phase 1 — P0: Money and account safety — **✓ complete (2026-03-30)**

*Goal:* Confidence that billing and destructive account paths behave under controlled mocks. *Stack:* Vitest + colocated `*.test.ts` next to routes.

- [x] **`POST /api/billing/webhook`** — Stripe webhook handler (`app/app/api/billing/webhook/route.ts`). *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] `stripe.webhooks.constructEvent` is mocked; Prisma and `captureServerEvent` (or equivalent PostHog server capture) are mocked so tests do not hit network or real DB.
    - [x] **Case — success path:** At least one test where a valid `customer.subscription.updated` (or primary event your handler processes) runs through to successful tier/profile update without throw.
    - [x] **Case — bad signature / invalid payload:** Request returns **400** (current route behavior) when signature verification fails; no Prisma writes.
    - [x] **Case — irrelevant or unhandled event type:** Handler returns safely (e.g. 200 acknowledge or documented behavior) without corrupting data; no duplicate side effects on replay if idempotency is modeled (align with [`docs/internal/stripe-webhook-posthog-idempotency.md`](internal/stripe-webhook-posthog-idempotency.md) if applicable).
    - [x] `npm run test` from `app/` passes; no new lint errors.

- [x] **`POST /api/billing/create-checkout-session`** — Authenticated checkout creation. *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] Mocked Stripe: authenticated user with valid body receives a session/url payload (match current route contract).
    - [x] Unauthenticated request → **401**.
    - [x] Malformed or Zod-failing body → **400** with stable error shape.
    - [x] Colocated test file under `app/app/api/billing/create-checkout-session/`.

- [x] **`POST /api/account/delete`** and **`POST /api/account/delete-permanent`** (as implemented) — Soft vs hard delete boundaries. *Tests:* `delete/route.test.ts`, `delete-permanent/route.test.ts`.
  - *Acceptance:*
    - [x] Unauthenticated → **401** on each route that requires auth.
    - [x] Authenticated: mocks prove intended transition (e.g. soft-delete fields set vs permanent removal) without calling real Resend/Stripe.
    - [x] **`/api/account/restore`** — not part of Phase 1 scope; defer if dedicated tests are needed.

- [x] **`GET /api/portfolio/summary`** — Plan slice / denominator correctness. *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] Response JSON includes **`slice`** (or current contract) with `propertyCountTotal`, `propertyCountIncluded`, `propertyLimit`, `truncated` consistent with mocked `count` + `findMany` when total properties exceed plan cap.
    - [x] Case where user is under limit: `truncated` false and counts align with [`docs/internal/api-list-contract.md`](internal/api-list-contract.md).
    - [x] `npm run test` green.

- [x] **`GET /api/export/portfolio`** — CSV export headers and auth/rate-limit paths. *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] With mocks, response includes **`X-Veld-Property-Count-Total`**, **`X-Veld-Property-Count-Included`**, **`X-Veld-Property-Limit`**, **`X-Veld-Property-Slice-Truncated`** matching the same semantics as summary slice (per api-list-contract).
    - [x] **401** when not authenticated; **429** (or documented behavior) when rate limit mock triggers.
    - [x] **Phase 1 exit:** Webhook suite has **≥ 3** distinct cases (success, bad signature, irrelevant/unhandled); all Phase 1 routes above have colocated tests meeting bullets.

#### Phase 2 — P1: Data path and limits — **✓ complete (2026-03-30)**

*Goal:* Import/export and nested resources do not regress silently. *Depends on:* Phase 1 patterns established (shared mocks/helpers may be extended).

- [x] **`POST /api/import/portfolio`** — Rows, validation, plan limit, rate limit. *Tests:* `route.test.ts`.
  - *Acceptance:*
    - [x] At least one **success** path (valid CSV or payload per handler).
    - [x] **400** when multipart has no `file` (handler contract); row-level parse errors return `errors` in JSON per existing import behavior (not necessarily 400).
    - [x] Plan cap → **403** with `PLAN_LIMIT_REACHED` or documented code.
    - [x] Rate limit → **429** when rate-limit mock is exhausted.

- [x] **`PATCH` / `DELETE` `/api/deals/[id]`** — Symmetry with `app/app/api/deals/route.test.ts` (list/create coverage). *Tests:* `app/app/api/deals/[id]/route.test.ts`.
  - *Acceptance:*
    - [x] PATCH success updates deal; invalid body → 400; not found → 404 as implemented.
    - [x] DELETE hard-deletes saved deal row; unauthorized → 401.

- [x] **`GET /api/properties/[id]/metrics`** — Computed metrics vs `lib/` contract. *Tests:* `app/app/api/properties/[id]/metrics/route.test.ts`.
  - *Acceptance:*
    - [x] Response equals `computePropertyMetrics(...)` for the same derived inputs (correctness-first).
    - [x] **401** without session when required.

- [x] **Shared test helpers** — No change to `api-route-mocks.ts` required; import/metrics use **colocated fixtures** and comments in each `route.test.ts` (acceptable per Phase 2 scope).

- [x] **Phase 2 exit:** Tier-1 extensions under `/api/properties` and `/api/deals` that return computed or nested data have route tests for the **GET/PATCH/DELETE** paths listed above; PM can trace each route to a `*.test.ts`.

#### Phase 3 — P2: `lib/` hardening and coverage discipline — **✓ complete (2026-03-30)**

*Goal:* Refactors do not break hidden assumptions; optional CI thresholds for core math.

- [x] **`lib/auth.ts` (or auth entry used by routes)** — Hybrid: **`isAdmin`** in `lib/auth.test.ts`; **`getAppUser` / `getActiveAppUser`** documented in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §2.4 as covered via mocked route tests (not Clerk/Prisma isolation).
  - *Acceptance:*
    - [x] Either: focused tests for `getActiveAppUser` / `getAppUser` behaviors that are easy to regress (e.g. soft-delete rejection), **or** a short note in `test-infrastructure-review.md` that auth is covered only via route integration tests — pick one strategy and list which routes cover which branches.

- [x] **`lib/plans.ts`** — Tier limits table-driven. *Tests:* `lib/plans.test.ts`.
  - *Acceptance:*
    - [x] Tests for `getPropertyLimit` / `getDealLimit` (or current API) for each tier string you support; failure cases for unknown tier if applicable.

- [x] **Coverage gates** — `app/vitest.config.ts`.
  - *Acceptance:*
    - [x] Aggregate **v8** thresholds on the **included** set: **statements ≥ 80%**, **lines ≥ 80%**, **branches ≥ 58%**, **functions ≥ 78%** — `npm run test:coverage` fails on regression; documented in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §3.4. *(CI still runs `npm run test` without coverage unless you add a job.)*
    - [x] `coverage.include` expanded with correct `app/app/api/...` paths + Phase 1–2 route files + `lib/plans.ts`.

#### Phase 4 — P3: Smoke E2E (optional; non-blocking until stable)

*Goal:* One browser happy path against test-mode Clerk/Stripe or staging. *Prerequisite:* Phase 1 complete.

- [ ] **Playwright (or Cypress) — one smoke file**
  - *Acceptance:*
    - [ ] Single spec: e.g. **guest → sign-in (test user) → dashboard loads** *or* **minimal add-property** flow — **≤ 5 min** local/CI runtime target.
    - [ ] Job runs on **`workflow_dispatch`** or **nightly** initially; document flakiness and promote to PR gate only when green consistently.
    - [ ] Secrets and URLs documented in [`docs/setup/manual-steps.md`](setup/manual-steps.md) (test Clerk keys, staging URL, no production secrets in logs).

#### Phase 5 — Ongoing (process; not a single completion checkbox)

- **Same PR rule:** When changing **metrics, Zod validations, CSV import, or billing**, add or extend tests in the same PR unless PM documents an exception.
- **Manual QA:** Keep [`docs/qa/mobile-shell-verification.md`](qa/mobile-shell-verification.md) and [`docs/qa/property-flow-regression-matrix.md`](qa/property-flow-regression-matrix.md) on a quarterly or pre-release cadence.

---

*When the builder completes a task, they check it off here and report back. Add new tasks below.*
