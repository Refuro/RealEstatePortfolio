# Full Audit Synthesis — 2026-04-01

## Audits included

- Code — `docs/audits/code/2026-04-01-code-audit.md`
- Math & Logic — `docs/audits/math/2026-04-01-math-logic-audit.md`
- Feature / UX / IA — `docs/audits/feature/2026-04-01-feature-ux-audit.md`
- Mobile experience — `docs/audits/feature/2026-04-01-mobile-experience-audit.md`
- Security & Privacy — `docs/audits/security/2026-04-01-security-audit.md`
- Performance & Cost — `docs/audits/performance-cost/2026-04-01-performance-cost-audit.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-04-01-reliability-ops-audit.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-04-01-data-integrity-audit.md`
- Business & Valuation — `docs/audits/business/2026-04-01-business-valuation-audit.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-04-01-growth-funnel-audit.md`
- SEO (search & discovery) — `docs/audits/seo/2026-04-01-seo-audit.md`
- Documentation — `docs/audits/documentation/2026-04-01-documentation-audit.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-04-01-legal-compliance-audit.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-04-01-agent-governance-audit.md`

*All 14 lanes executed 2026-04-01 (two batches, max 7 parallel subagents).*

---

## How to read this synthesis

**Triage rubric:** See [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) §**3.5**. **Promote to [`docs/tasks.md`](../../tasks.md)** from **Ship** and **Schedule** by default. **Optional** is backlog or accepted risk; **Human-only** needs owner/legal/device time.

**“Clean” run:** No open **Ship** items; **Optional** may still list refactors and future work.

---

## PM triage (this run)

### Ship (next window) — worth tackling first

*Lane-severity drivers: SEO rich-result/guideline risk, security gaps on destructive APIs, reliability of account deletion, defense-in-depth on PATCH, data integrity disclosure for multi-mortgage CSV, broken doc links.*

- [x] **SEO:** Add visible FAQ (or accordion) on pages with `FAQPage` JSON-LD, **verbatim** aligned with JSON-LD Q&A. *(High guideline / rich-results risk.)* **Done 2026-04-01** — `lib/marketing/calculator-faqs.ts` + `CalculatorFaqSection`.
- [x] **SEO:** Refactor canonical URL construction to use `getAppOrigin()` across marketing pages and root layout (parity with `sitemap.ts`; avoids wrong canonicals if `APP_URL` drifts). *(Medium; high blast radius if misconfigured.)* **Done 2026-04-01**
- [x] **Security:** Add rate-limit coverage for `DELETE` on `/api/properties/[id]` and `/api/deals/[id]` (evaluate mortgage sub-routes). *(Abuse / consistency with other mutating routes.)* **Done 2026-04-01** — includes `properties:mortgage-delete`.
- [x] **Reliability:** Add Sentry + explicit failure policy for Stripe subscription cancel in `POST /api/account/delete` (optional idempotent retry). *(User/account state integrity.)* **Done 2026-04-01** — 503 + no DB mutation on cancel failure.
- [x] **Code:** Harden `PATCH /api/properties/[id]` update `where` with `userId`. *(Defense-in-depth.)* **Already satisfied** — `where: { id, userId: user.id }` in code.
- [x] **Data integrity:** Multi-mortgage CSV lossy re-import — **at minimum:** clear **docs + in-product warning** in export/import UX (`docs/reference/portfolio-csv-export.md` + user-visible stance). *(Lane High; full multi-row import is a larger product call.)* **Done 2026-04-01**
- [x] **Documentation:** Global link sweep: fix stale `docs/proposals/` → `docs/archive/proposals/` references; fix `roadmap`, `tasks-archived`, `property-flow-regression-matrix`, `architecture-and-build-practices` links as needed. *(Broken links waste time.)* **Done 2026-04-01**

### Schedule (next batch) — bounded Medium / polish

- [ ] **Security:** Stage and validate `CSP_ENFORCEMENT=true` with updated security doc CSP tables.
- [ ] **Security:** Add explicit recurring SCA / dependency review owner and cadence to security or reliability process docs.
- [ ] **UX / Feature:** `role="dialog"` / `aria-modal` / `aria-labelledby` + keyboard focus on `OnboardingPanel` welcome overlay.
- [ ] **UX / Feature:** Adjust `app-nav` labels or grouping for Analyze vs Deals; analytics on mis-clicks if available.
- [ ] **UX / Feature:** Replace raw `amber-500` in `OverLimitBanner` with semantic warning tokens.
- [ ] **UX / Feature:** Help link or tooltip on `deals/page.tsx` for proportional vs full-liability copy.
- [ ] **UX / Feature:** Redesign first-property success strip on dashboard (single primary CTA).
- [ ] **Growth:** Error/retry UX on `OnboardingPanel` when `/api/onboarding` PATCH fails.
- [ ] **Growth:** Elevate “Analyze a deal” / import on empty dashboard (not only inside closed `<details>`).
- [ ] **Growth:** Align “minutes” copy across landing, welcome modal, and pricing.
- [ ] **Growth:** Mount `PlanIntentUrlSync` on sign-in (or shared auth layout).
- [ ] **Growth:** Replace plain `Link` to `/plans` in `deals/page.tsx` at-limit block with `UpgradePlanLink`.
- [ ] **Mobile:** Focus restoration on mobile nav drawer close (`app-layout-client.tsx`).
- [ ] **Mobile:** Safe-area padding on app mobile drawer footer.
- [ ] **Performance:** Lazy-load sections of `deal-analyzer-form.tsx` via `next/dynamic` (skeletons).
- [ ] **Reliability:** Update `docs/runbooks/incident-response.md` § Health check (DB-only scope; Clerk/Stripe pointers).
- [ ] **Reliability:** Add root `app/error.tsx` or document why omitted.
- [ ] **Data integrity:** Truncation warning after portfolio CSV download (“X of Y properties”) using response headers.
- [ ] **Data integrity:** Extend export-only vs import-only column matrix in `docs/reference/portfolio-csv-export.md`.
- [ ] **Data integrity:** Import API: log or surface Papa Parse warnings when `errors.length > 0` and `data.length > 0`.
- [ ] **Legal:** Update `cookie-preferences-section.tsx` to mention Vercel Web Analytics or point to Privacy Policy list.
- [ ] **Legal:** Edit `docs/security/security-notes.md` Google Ads bullet for consent-gated loading.
- [ ] **Code:** Align `onboarding-panel.tsx` and `privacy/page.tsx` link styles with semantic tokens.
- [ ] **Code:** Optimize `GET /api/deals/[id]` portfolio payload **after** confirming cost in metrics (measure first).
- [ ] **Governance:** Mobile report path exception in `docs/process/agent-governance-audit-process.md` §1.
- [ ] **Governance:** Qualify “Other focused audits” in `docs/cursor-agent-setup.md`.
- [ ] **Documentation:** Expand `docs/README.md` hub links per documentation audit.

### Optional / backlog — Low, optional, evaluate, or future

- [ ] **Mobile:** Increase touch padding on analyzer stress preset chips **or** document intentional small targets.
- [ ] **Performance:** Evaluate narrowing app-shell `force-dynamic` as traffic scales.
- [ ] **Performance:** Optional — dedupe `property.count` between `(app)/layout` and `loadPortfolioSummaryCore`.
- [ ] **Performance:** Optional — DRY portfolio CSV export with shared portfolio loader.
- [ ] **Performance:** On next Prisma major — align `@prisma/adapter-pg` with client majors.
- [ ] **Reliability:** Optional — `Sentry.captureException` on export/import/mortgage routes (avoid double noise with `onRequestError`).
- [ ] **Data integrity:** Optional — add original loan amount + loan type to export headers (single-lien parity).
- [ ] **Math:** Optional — DRY `isNegativeAmortizingPayment` in `generateAmortizationSchedule`.
- [ ] **Code:** Extract first slice from `add-property-wizard.tsx` or `deal-analyzer-form.tsx` (large refactor).
- [ ] **Documentation:** Relocate or relabel `docs/proposals/test-hardening-phase-1-2-plan.md` (PM decision).
- [ ] **Documentation:** Clean up superseded same-day documentation audit reruns (owner decision).
- [ ] **Legal:** Align Terms/Privacy “Last updated” on next legal edit cycle.
- [ ] **Governance:** Archive completed `docs/tasks.md` sections to `tasks-archived.md` (PM-approved).

### Human-only / deferred — not AI-complete alone

- [ ] **Mobile:** Device-backed narrow viewport matrix (320 / 375 / 390 / 430, 767 / 768) — log evidence.
- [ ] **Legal:** Route Terms recurring-billing / auto-renew wording through **counsel** for target jurisdictions.
- [ ] **Business:** Owner: complete `docs/launch/launch-plan.md` §9 production checklist or waiver.
- [ ] **Business:** Complete PostHog funnel verification in **PostHog UI**; pin insight; update `posthog-growth-funnel.md` checkboxes.
- [ ] **Business:** Reconcile growth funnel audit markdown vs shipped instrumentation (or re-run lane).

### Already done (this synthesis cycle)

- [x] **`docs/audits/synthesis/README.md`** — latest full run points to `2026-04-01-audit-synthesis.md`.

---

## Deduplication notes (this run)

- **Account delete + Sentry:** Code + Reliability → one Reliability row (in **Ship**).
- **PATCH `userId`:** Distinct from DELETE rate limits.
- **Onboarding:** Feature (a11y) vs Growth (PATCH errors) — both **Schedule** (related but separate PRs OK).

---

## PM review

Review **Ship** and **Schedule** above. Promote approved items to [`docs/tasks.md`](../../tasks.md). The builder implements approved items.

**Phased implementation status** (Phases 10–21, etc.) lives in [`docs/tasks.md`](../../tasks.md); do not treat this file as the only source for already-shipped work.

---

## Re-test (cross-cutting)

- [ ] Re-run impacted lane audits after fixes (Reliability, Data Integrity, Growth, Mobile when touched).
- [ ] Billing/auth smoke: sign-up/sign-in, checkout, webhook, portal, `past_due`.
- [ ] CSV/mortgage: export → import round-trip with edge cases.
- [ ] SEO: `robots.txt`, `sitemap.xml`, Rich Results after FAQ/canonical changes — [`docs/qa/seo-release-checklist.md`](../../qa/seo-release-checklist.md).

---

## Appendix: Full consolidated task list (by domain)

*Flat inventory from lane reports; **PM triage above** is canonical for promotion. Verification-only items omitted.*

### Security

- [ ] Add rate-limit coverage for `DELETE` on `/api/properties/[id]` and `/api/deals/[id]` (and evaluate mortgage sub-routes).
- [ ] Stage and validate `CSP_ENFORCEMENT=true` with updated security doc CSP tables.
- [ ] Add explicit recurring SCA / dependency review owner and cadence to security or reliability process docs.

### UX / Feature

- [ ] Implement `role="dialog"` / `aria-modal` / `aria-labelledby` (and keyboard focus behavior) on `OnboardingPanel` welcome overlay.
- [ ] Adjust `app-nav` labels or grouping for Analyze vs Deals; add analytics on mis-clicks if available.
- [ ] Replace raw `amber-500` classes in `OverLimitBanner` with semantic warning tokens from `globals.css` / design spec.
- [ ] Add help link or tooltip on `deals/page.tsx` for the proportional vs full-liability sentence.
- [ ] Redesign first-property success strip on dashboard with a single primary CTA and secondary actions.

### Mobile experience

- [ ] Implement focus restoration for `#app-mobile-nav-drawer` close path in `app-layout-client.tsx`.
- [ ] Add `padding-bottom: env(safe-area-inset-bottom)` (or Tailwind equivalent) to the app mobile drawer footer area; verify on iOS.
- [ ] Increase touch padding on analyzer stress preset chips or document intentional small control pattern.
- [ ] Run a device-backed narrow viewport matrix pass (320 / 375 / 390 / 430 and 767 / 768 boundary) and log evidence for criteria still marked unverified.

### Performance

- [ ] Lazy-load sections of `deal-analyzer-form.tsx` via `next/dynamic` (preserve UX with skeletons).
- [ ] Evaluate whether app-shell `force-dynamic` can be narrowed or isolated as traffic scales.
- [ ] Optional: eliminate redundant `property.count` between `(app)/layout` cached banner path and `loadPortfolioSummaryCore` for dashboard navigations.
- [ ] Optional: align portfolio CSV export with `loadPortfolioSummaryCore` or a shared slice loader to DRY tier limits and query shape.
- [ ] On next Prisma major: align `@prisma/adapter-pg` with `prisma` / `@prisma/client` majors per release notes.

### Reliability

- [ ] Add Sentry + explicit failure policy for Stripe cancel in `POST /api/account/delete` (and optional idempotent retry).
- [ ] Update `docs/runbooks/incident-response.md` § Health check with explicit scope (DB only) and pointers to Clerk/Stripe dashboards or optional extra monitors.
- [ ] Add root `app/error.tsx` (or document why omitted) for parity with `app/(app)/error.tsx`.
- [ ] Optionally add `Sentry.captureException` in high-traffic or high-risk routes without it (export, import, mortgage) after confirming overlap with `onRequestError`.

### Data integrity

- [ ] **High — product/doc:** Multi-mortgage CSV remains lossy on re-import; document mitigations or product stance in `docs/reference/portfolio-csv-export.md` and UX.
- [ ] Settings: show “X of Y properties included” / truncation warning after portfolio CSV download using export response headers.
- [ ] Docs: extend export-only vs import-only column matrix in `docs/reference/portfolio-csv-export.md`.
- [ ] Import API: return or log Papa Parse warnings when `parsed.errors.length > 0` and `parsed.data.length > 0`.
- [ ] Optional product: add original loan amount and loan type to portfolio export headers for single-lien parity with import.

### Growth

- [ ] Add error/retry UX to `OnboardingPanel` when `/api/onboarding` PATCH fails.
- [ ] Elevate “Analyze a deal” (or import) on dashboard empty state without relying on closed `<details>`.
- [ ] Align hero, welcome modal, and pricing “minutes” copy across landing, onboarding, and pricing pages.
- [ ] Mount `PlanIntentUrlSync` on `sign-in/[[...sign-in]]/page.tsx` (or shared auth layout).
- [ ] Replace plain `Link` to `/plans` in `deals/page.tsx` at-limit block with `UpgradePlanLink`.

### SEO

- [ ] Add visible FAQ sections (or accordion) on pages that emit `FAQPage` JSON-LD, aligned verbatim with JSON-LD Q&A.
- [ ] Refactor canonical `APP_URL` construction to use `getAppOrigin()` across marketing `page.tsx` files and root layout for parity with `sitemap.ts`.

### Governance

- [ ] Add Mobile experience report path exception to `docs/process/agent-governance-audit-process.md` §1 (`docs/audits/feature/`).
- [ ] Qualify or expand “Other focused audits” in `docs/cursor-agent-setup.md` so SEO, Legal, Documentation, and Mobile experience are not implied out of scope.
- [ ] Archive fully completed sections from `docs/tasks.md` to `docs/tasks-archived.md` (PM-approved scope).

### Documentation

- [ ] Global link sweep: replace stale `docs/proposals/` → `docs/archive/proposals/` for archived epic/add-property QA files; fix `docs/reference/roadmap.md`, `docs/tasks-archived.md`, `docs/qa/property-flow-regression-matrix.md`, and `docs/architecture-and-build-practices.md` references as needed.
- [x] Update `docs/audits/synthesis/README.md` latest synthesis pointer — **done** (points to this file).
- [ ] Expand `docs/README.md` internal/policies/process links per documentation audit.
- [ ] Relocate or relabel `docs/proposals/test-hardening-phase-1-2-plan.md` after PM decision.
- [ ] Clean up superseded same-day documentation audit reruns once canonical copy is confirmed.

### Legal / compliance

- [ ] Update `cookie-preferences-section.tsx` copy to mention Vercel Web Analytics or point to the Privacy Policy list of optional tools.
- [ ] Edit `docs/security/security-notes.md` Google Ads bullet to reflect consent-gated loading.
- [ ] Align Terms and Privacy “Last updated” metadata for the same release when legal text next changes.
- [ ] Route Terms recurring-billing/auto-renew wording through counsel for target jurisdictions.

### Math

- [ ] (Optional) Call `isNegativeAmortizingPayment` from `generateAmortizationSchedule` for DRY consistency with `getPayoffProjection` / tests.

### Code (maintainability / API)

- [ ] Extract first slice from `add-property-wizard.tsx` or `deal-analyzer-form.tsx` into focused modules.
- [ ] Align `onboarding-panel.tsx` and `privacy/page.tsx` link styles with semantic tokens per design spec.
- [ ] Optimize `GET /api/deals/[id]` portfolio context payload after confirming cost in staging or production metrics.
- [ ] Harden `PATCH /api/properties/[id]` update `where` with `userId`.

### Business & valuation *(owner / PM)*

- [ ] Complete and date `docs/launch/launch-plan.md` §9 production checklist items (or document explicit waiver).
- [ ] Complete `docs/launch/posthog-growth-funnel.md` quick verification checklist and save/pin the named funnel insight in PostHog; update markdown checkboxes.
- [ ] Reconcile growth funnel audit markdown with shipped instrumentation or re-run growth lane when needed.
