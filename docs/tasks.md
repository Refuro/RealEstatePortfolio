# Agent tasks

Tasks you want the **builder** agent to do. The PM adds tasks here when you ask; you can say "have the builder complete the tasks in tasks.md" and the PM will run the builder with these tasks.

**Product mantra (all tasks):** Thoughtful, robust, modern, frictionless. See `docs/architecture-and-build-practices.md`.
**Ownership policy (ownership/metrics tasks):** Follow `docs/policies/ownership-metrics.md` as the canonical source for formulas and copy semantics.
**Analytics math policy (analytics/projection tasks):** Follow `docs/policies/analytics-math-policy.md` for debt-service basis, time-window labels, and UI/API/export reconciliation.

**Future features / roadmap:** See `docs/reference/roadmap.md`. PM promotes items from there to here when ready to build.

**Test quality gate (process):** How tests fit CI, PM review, and pre-push flow is in [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md). **Completed** test-infra Phases 1–3 (detail), Husky, audit batches **1–15**, and the **2026-04-04** audit Ship/Schedule batch are in [`docs/tasks-archived.md`](tasks-archived.md) — see § **Tasks.md archive (2026-03-30)**, § **Tasks.md archive (2026-04-04)**, § **Tasks.md archive (2026-04-03 run 2)**, § **Tasks.md archive (2026-03-30 — testing hardening Phases 1–3)**, and related 2026-04-05 cleanup sections. **Planned** automated-test expansion: **Testing hardening** Phase 4+ below (aligned with [`qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md)).

---

## Completed

Historical completion logs and full checkbox snapshots are in [`docs/tasks-archived.md`](tasks-archived.md) — see **§ Tasks.md archive (2026-03-20)**, **§ Tasks.md archive (2026-03-30)**, **§ Tasks.md archive (2026-04-04)**, **§ Tasks.md archive (2026-04-03 run 2)**, **§ Tasks.md archive (2026-04-03 + 2026-04-01 — prior Ship batches)**, **§ Tasks.md archive (2026-03-31 — calculators and metric tones)**, **§ Tasks.md archive (2026-03-31 — full audit remediation completed phases)**, and **§ Tasks.md archive (2026-03-30 — testing hardening Phases 1–3)** (2026-04-05 cleanup).

---

## Roadmap priority (value vs effort — last reviewed 2026-04-04)

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

### Full audit remediation — 2026-03-31 synthesis — **remaining (open items)**

*Promoted from:* [`docs/audits/synthesis/2026-03-31-audit-synthesis.md`](audits/synthesis/2026-03-31-audit-synthesis.md) and [`docs/audits/synthesis/2026-04-01-audit-synthesis.md`](audits/synthesis/2026-04-01-audit-synthesis.md). *Completed phase snapshots:* [`docs/tasks-archived.md`](tasks-archived.md) § **Tasks.md archive (2026-03-31 — full audit remediation completed phases)**.

**Tracking tags**

| Tag | Meaning |
|-----|---------|
| **`[Synth]`** | Item appears in the synthesis consolidated task list — check off here to see what is still open vs addressed. |
| **`[Synth+]`** | Strongly implied by a lane report; not a separate line in synthesis (avoid duplicate PM tickets). |

---

#### Phase 2 — Observability (optional follow-up)

- [ ] **`[Synth+]` `error.tsx` Sentry + React 19** — *Skipped in prior batch per PM; optional follow-up.*
  - *Acceptance:* PM approves scope; no duplicate flood of events in dev; document choice in PR.

---

##### Phase 13 — Reliability & performance — **open**

- [ ] Evaluate whether app-shell `force-dynamic` can be narrowed or isolated as traffic scales.

---

##### Phase 14 — UX, accessibility & mobile — **open**

- [ ] Run a device-backed narrow viewport matrix pass (320 / 375 / 390 / 430 and 767 / 768 boundary) and log evidence in the mobile verification or audit notes.

---

##### Phase 17 — Business, launch & internal analytics docs — **open**

- [ ] Close unchecked operational items in [`docs/launch/launch-plan.md`](launch/launch-plan.md) section 9 against production reality. *Doc note added 2026-04-01; production verification remains on owner.*

---

##### Phase 18 — Repository documentation housekeeping — **open**

- [ ] Clean up superseded same-day documentation audit reruns once canonical copy is confirmed. *Owner: keep multiple same-day audits as real artifacts (2026-04-01).*

---

##### Phase 20 — Legal & compliance — **open**

- [ ] Route Terms recurring-billing/auto-renew wording through counsel for target jurisdictions *(owner / PM; track outcome in repo or legal folder as appropriate)*.
- [ ] Standardize legal-page metadata hygiene (exact "Last updated" date format; optionally consistent processor policy links). *Terms/Privacy already use "Last updated: Month YYYY"; optional Privacy processor sentence deferred.*

---

##### Phase 21 — Synthesis manual verification gate (`[Synth 4-01]`)

*Boundary:* QA and evidence after implementation waves — no new product scope (re-run audits and smoke tests once Phases 10–20 are sufficiently complete). *PM/owner runs these; not automated in-repo.*

- [ ] Re-run impacted lane audits (minimum: Reliability, Data Integrity, Growth, Mobile when those domains were touched).
- [ ] Smoke: sign-up/sign-in, checkout, webhook sync, portal launch, `past_due` recovery (after billing-related phases).
- [ ] Manual CSV: export → import round-trip with escrow, stored balance, and negative-amortization edge rows (after Phase 12).
- [ ] Live/staging: verify `robots.txt`, `sitemap.xml`, and app-route `noindex` / public canonical behavior (after Phase 16).

---

#### Deferred from synthesis (explicitly not in Phases 10–21)

*Large or design-pending items stay deferred until promoted explicitly.*

- [ ] **`[Synth]` Mega-module refactors** — Wizard, deal analyzer, projections tab, etc. (Code audit) — **deferred.**
- [ ] **`[Synth]` Onboarding modal decorative reduction** — **deferred** with mega-ui batch.
- [ ] **`[Synth]` `@theme` `primary` vs `text-primary` / `bg-primary`** — **deferred** unless blocking another task.

*The following were **promoted** into Phase 13 (no longer deferred here): dashboard + `buildPortfolioSummaryPayload` deduplication; PostHog `/api/me` fan-out reduction; optional Clerk preconnect.*

*Batch 14 (deferred backlog below):* CSP enforcement verification in production still applies; **Phase 10** covers synthesis `csp-report` abuse guard. Complete Batch 14 verification alongside or after Phase 10 as appropriate.

---

### Pre-launch / PM — PostHog production (Batch 8.1)

- [ ] **Vercel production env** — `NEXT_PUBLIC_POSTHOG_KEY` / host set in Vercel; **production** loads the snippet and events appear in PostHog ("Live events"). Full acceptance bullets lived under Batch 8.1 in [`docs/tasks-archived.md`](tasks-archived.md) § Tasks.md archive (2026-03-30).

---

### Deferred backlog (owner decisions; not scheduled)

*Full context and completed synthesis phases are in the 2026-03-30 archive section.*

- [ ] **Batch 9 — Deferred:** Split `add-property-wizard.tsx` into smaller step modules/hooks (until complexity/velocity justify).
- [ ] **Batch 9 — Declined:** Onboarding panel decorative style simplification; optional nav micro-copy / tooltip changes — *no action unless design direction changes.*
- [ ] **Batch 11 — Deferred:** Trust strip / testimonials / logos (out of approved Batch 11 scope).
- [ ] **Batch 12 — Deferred:** Prepare business metrics snapshot for next valuation pass (MRR/subscriber); *owner preference: no in-repo placeholder until live metrics exist.*
- [ ] **Batch 14 — Deferred: CSP** — Verify production `CSP_ENFORCEMENT` and `NEXT_PUBLIC_APP_URL` match [`docs/policies/csp-rollout.md`](policies/csp-rollout.md). *`POST /api/csp-report` abuse/body guard is scheduled in **Phase 10** (synthesis); keep Batch 14 focused on rollout verification.*

---

### Testing hardening (phased — Vitest + optional E2E)

*Source & rationale:* [`docs/qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md) (tiers A–D, gaps, what "high confidence" means). *Process:* PM assigns by phase; **builder** implements per `.cursor/rules/builder-agent.mdc` and existing route-test patterns (`vi.mock` auth/db/rate-limit). *Sequencing:* **Complete Phase 1 before Phase 2** unless PM explicitly parallelizes. **Do not** start Phase 4 (E2E) until Phase 1 billing/webhook tests exist. Update [`qa/test-infrastructure-review.md`](qa/test-infrastructure-review.md) §10 change log when a phase completes or CI policy changes.

**Correctness-first (applies to every phase):** Assertions must reflect **intended** behavior from [`docs/policies/ownership-metrics.md`](policies/ownership-metrics.md), [`docs/policies/analytics-math-policy.md`](policies/analytics-math-policy.md), [`docs/internal/api-list-contract.md`](internal/api-list-contract.md), and other agreed specs — not "whatever the route returns right now." If code and policy disagree, **fix the code or update the policy doc**, then write tests that lock the corrected contract. See [`docs/qa/testing-hardening-proposal.md`](qa/testing-hardening-proposal.md) §1.1.

*Phases 1–3 (complete) are archived in [`docs/tasks-archived.md`](tasks-archived.md) § **Tasks.md archive (2026-03-30 — testing hardening Phases 1–3)**.*

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

---

### Admin email tooling — onboarding email preview + re-subscribe

*Added 2026-04-05. Builder can run both items in one pass.*

- [x] **ADMIN-EMAIL-1** — Add a "Preview onboarding email" panel to the admin page (`app/app/(app)/admin/page.tsx`). The panel has two buttons — **"Send day-3 preview"** and **"Send day-7 preview"** — that POST to a new admin-only API route `POST /api/admin/email-preview`. That route reads `SUPPORT_EMAIL` from env, calls `sendOnboardingEmail(supportEmail, adminUserId, variant)` with the caller's own `userId` so the unsubscribe link in the email is real and testable, and returns `{ sent: true }`. The route must verify `isAdmin` before doing anything (same guard as the tier-override route). The UI buttons are disabled while the request is in-flight and show a brief success/error message inline.
  - *Acceptance:* Clicking either button from the admin page sends a real email (via Resend) to `SUPPORT_EMAIL` containing the correct subject, body, and a working unsubscribe link signed for the admin's own userId. Route returns 403 for non-admins. `npm run check` passes.

- [x] **ADMIN-EMAIL-2** — Add a "Re-subscribe me" button to the admin page that calls a new admin-only API route `POST /api/admin/resubscribe-self`. That route sets `onboardingEmailsOptedOutAt = null` AND resets `onboardingEmailsSentAt = null` on the calling admin user, so the full day-3 / day-7 cron path can run from scratch. Returns `{ resubscribed: true }`. The button shows confirmation inline and is only visible when the admin user's own `onboardingEmailsOptedOutAt` is not null (i.e., they are currently unsubscribed). Pass the current opt-out state from the server component as a prop.
  - *Acceptance:* After clicking, admin user's `onboardingEmailsOptedOutAt` is `null` and `onboardingEmailsSentAt` is `null` in the DB. Visiting `/api/unsubscribe?userId=…&token=…` for that user afterwards sets `onboardingEmailsOptedOutAt` again (full round-trip confirmed). Route returns 403 for non-admins. `npm run check` passes.

---

### Full audit remediation — 2026-04-05 synthesis — Ship batch

*Promoted from:* [`docs/audits/synthesis/2026-04-05-audit-synthesis.md`](audits/synthesis/2026-04-05-audit-synthesis.md). *Individual lane reports:* `docs/audits/*/2026-04-05-*`. *Completed items will be archived to [`docs/tasks-archived.md`](tasks-archived.md).*

> **⚠️ PM review required before builder runs UX-SHIP-1** — the onboarding dismiss change is a visible behavior shift for all signed-up users. Confirm the cooldown duration and re-display approach with the PM before implementing. All other items are surgical and can run without a prior review gate.

---

#### Security

- [ ] **SEC-SHIP-1** — Add `/api/unsubscribe` AND `/api/cron/onboarding-emails` to `isPublicRoute` in `app/proxy.ts`. Both routes implement their own auth (HMAC token and Bearer secret respectively) and must be reachable without a Clerk session. Closes CAN-SPAM compliance gap on unsubscribes; also unblocks the Vercel Cron job that has been silently 401-ing on every invocation.
  - *Acceptance:* Unauthenticated `GET /api/unsubscribe?userId=…&token=…` returns unsubscribe confirmation (not 401). Simulate Vercel Cron call with `Authorization: Bearer $CRON_SECRET` and confirm it hits the handler.

- [ ] **SEC-SHIP-2** — Wrap the Stripe billing webhook event-dispatch `switch` block in an outer try/catch + `Sentry.captureException` in `app/app/api/billing/webhook/route.ts` (lines 41–113). Currently DB failures inside `syncSubscriptionToDb` propagate as silent 500s; Stripe retries for up to 72h with no operator visibility.
  - *Acceptance:* Simulated DB error inside the switch block produces a Sentry event and still returns 500 (so Stripe retries). Existing webhook happy-path tests pass.

- [ ] **SEC-SHIP-3** — Add try/catch + `Sentry.captureException` + `console.error` to all currently unguarded read routes. Match the existing pattern in PATCH/DELETE handlers.
  - Routes: `GET /api/properties`, `GET /api/properties/[id]`, `GET /api/deals`, `GET /api/portfolio/summary`, `GET /api/onboarding`, `PATCH /api/onboarding`, `GET /api/export/portfolio`, `GET /api/export/portfolio-summary`.
  - *Acceptance:* Each route has a catch block that logs and captures to Sentry. `npm run check` passes.

- [ ] **SEC-SHIP-4** — Add try/catch around the `prisma.$transaction` block in `POST /api/import/portfolio/route.ts` (lines 166–225). Currently a mid-import DB failure produces an unguarded 500 with no Sentry signal.
  - *Acceptance:* Simulated transaction failure returns a clear 500 JSON with message; Sentry receives the event; DB is left in consistent state (all-or-nothing transaction guarantees this).

- [ ] **SEC-SHIP-5** — Add try/catch around the final `prisma.$transaction` in `POST /api/account/delete/route.ts` (lines 87–108). Stripe cancel already has a guard; the DB step does not. Failure leaves Stripe subscription canceled but app account still active.
  - *Acceptance:* Simulated DB failure returns 503; no `User` row is deleted; Sentry captures the error.

---

#### UX / Feature

- [x] **UX-SHIP-1** — Replace the permanent "Maybe later" onboarding modal dismissal with a 7-day snooze. `onboardingDismissedAt` now records dismiss timestamp; re-engagement nudge strip appears after 7 days if `propertyCount === 0`. Users with ≥1 property never see either surface. Dismissing the nudge resets the 7-day clock. Touches: `app/app/(app)/onboarding-panel.tsx`, `app/app/(app)/app-layout-client.tsx`.
  - *Acceptance:* After dismissing and returning past the cooldown period with 0 properties, a re-engagement nudge appears. A user with ≥1 property is never re-shown the modal regardless of cooldown. Existing tests pass.

- [ ] **UX-SHIP-2** — Widen `getPropertyCompleteness` heuristic to flag missing bedrooms/bathrooms/sqft as incomplete (not only when all three of cash invested, mortgage, and purchase price are simultaneously mismatched). Also render "Not set" placeholder text when bedrooms/bathrooms/sqft are all null instead of hiding the row entirely. Touches: `app/lib/property-completeness.ts`, `app/app/(app)/properties/[id]/overview-tab-content.tsx`.
  - *Acceptance:* A quick-add property (address + rent + value only) shows the completion banner and displays "Not set" for the three field groups. A fully-populated property shows no banner. `npm run check` passes.

---

#### Data Integrity

- [ ] **DI-SHIP-1** — CSV import: after creating `Mortgage` records inside the import transaction, add `tx.property.update({ where: { id }, data: { hasMortgage: true } })` for each property that had mortgage columns in `app/app/api/import/portfolio/route.ts`. Currently `hasMortgage` stays `null` for all imported properties even when mortgage data is present.
  - *Acceptance:* Import a CSV with mortgage columns → property record has `hasMortgage = true`. Import a CSV with no mortgage columns → `hasMortgage` remains `null` (unchanged). `npm run check` passes.

- [ ] **DI-SHIP-2** — Mortgage DELETE: after deleting a `Mortgage` row in `app/app/api/properties/[id]/mortgage/[mortgageId]/route.ts`, count remaining mortgages for the property and update `Property.hasMortgage` to `true` (any remain) or `false` (none remain).
  - *Acceptance:* Delete the last mortgage on a property → `hasMortgage = false`. Delete one of multiple mortgages → `hasMortgage = true`. `npm run check` passes.

- [ ] **DI-SHIP-3** — `app/app/api/account/delete-permanent/route.ts`: return HTTP 503 on Stripe subscription cancel failure instead of swallowing the error and proceeding to delete the `User` row. Mirror the pattern already in `delete/route.ts` (lines 71–85).
  - *Acceptance:* When Stripe cancel throws, the route returns 503 and the `User` row is NOT deleted. Sentry captures the error. `npm run check` passes.

---

#### Performance

- [ ] **PERF-SHIP-1** — Add scheduled cleanup of `ApiRateLimitEntry` rows older than 1 hour. Options: (a) a new Vercel Cron endpoint that runs `prisma.apiRateLimitEntry.deleteMany({ where: { createdAt: { lt: oneHourAgo } } })` daily or hourly, or (b) an inline prune after every `recordRateLimit` call. The compound index `[identifier, action, createdAt]` keeps queries fast today but the table grows unboundedly.
  - *Acceptance:* Rows older than 1 hour are pruned on schedule. Live entries (<1 h old) are preserved. Document chosen approach. `npm run check` passes.

- [ ] **PERF-SHIP-2** — Remove `<link rel="preconnect" href="https://api.rentcast.io" />` from `app/app/layout.tsx` (line 160). RentCast is a server-side-only integration; the browser never sends requests to `api.rentcast.io`; the preconnect wastes a TLS handshake on every page load for every user.
  - *Acceptance:* Line removed. Spot-check that RentCast API calls still function (they originate from Next.js API routes, not the browser). `npm run check` passes.

---

#### Legal

- [ ] **LEG-SHIP-1** — Add a one-sentence "Numbers are educational — confirm with your lender" disclaimer near the refinance projection output block in `app/app/(app)/properties/[id]/payoff-card.tsx` (around the monthly savings / break-even / total interest display). Match the pattern already used in `app/app/tools/brrr/page.tsx` lines 57–59 and `app/app/tools/fix-and-flip/page.tsx` lines 56–58.
  - *Acceptance:* Disclaimer is visible when the "What if I refinanced?" panel is expanded, adjacent to the projection output. `npm run check` passes.

---

#### Business / Policy (doc-only)

- [x] **BIZ-SHIP-1** — Wrote `docs/policies/property-completeness.md` — defines required vs. optional fields, full scoring algorithm (base 10, purchase price 25, mortgage 25, cash invested 20, home profile 20, max 100), threshold 60, banner behavior rules, mortgage edge cases, and implementation guardrails. Cross-referenced from `property-completeness.ts` JSDoc.
  - *Acceptance:* File exists at `docs/policies/property-completeness.md`; defines field classifications; cross-referenced from `property-completeness.ts` JSDoc. No code changes needed.

---

#### Deferred from this batch

- **UX-SHIP-2 (QuickActions)** — Importing `quick-actions.tsx` on property detail overview. Component fully built; deferred by PM — will promote when ready. See `docs/audits/feature/2026-04-05-feature-ux-audit.md` §High for context.
- **GRW-SHIP-1 (Social proof)** — Add real social proof to landing page. Deferred: no user testimonials or verified stats to use yet. Will promote when evidence is available. See `docs/audits/growth-funnel/2026-04-05-growth-funnel-audit.md` §Critical.
- **GRW-SHIP-2 (60-second copy)** — Not a task. Quick-add legitimately reduces first-property setup to ~60 seconds. Copy is accurate for that mode. No change needed.
