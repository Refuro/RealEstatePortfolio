# Full Audit Synthesis — 2026-04-03

## Audits included

Fourteen parallel agent lanes (max 7 concurrent × 2 batches). Each report is evidence-backed; **no application source** was modified during audit runs.

| Lane | Report |
|------|--------|
| Code | [`../code/2026-04-03-code-audit.md`](../code/2026-04-03-code-audit.md) |
| Math & Logic | [`../math/2026-04-03-math-logic-audit.md`](../math/2026-04-03-math-logic-audit.md) |
| Feature / UX / IA | [`../feature/2026-04-03-feature-ux-audit.md`](../feature/2026-04-03-feature-ux-audit.md) |
| Mobile experience | [`../feature/2026-04-03-mobile-experience-audit.md`](../feature/2026-04-03-mobile-experience-audit.md) |
| Security & Privacy | [`../security/2026-04-03-security-audit.md`](../security/2026-04-03-security-audit.md) |
| Performance & Cost | [`../performance-cost/2026-04-03-performance-cost-audit.md`](../performance-cost/2026-04-03-performance-cost-audit.md) |
| Reliability & Operations | [`../reliability-ops/2026-04-03-reliability-ops-audit.md`](../reliability-ops/2026-04-03-reliability-ops-audit.md) |
| Data Integrity | [`../data-integrity/2026-04-03-data-integrity-audit.md`](../data-integrity/2026-04-03-data-integrity-audit.md) |
| Business & Valuation | [`../business/2026-04-03-business-valuation-audit.md`](../business/2026-04-03-business-valuation-audit.md) |
| Growth Funnel | [`../growth-funnel/2026-04-03-growth-funnel-audit.md`](../growth-funnel/2026-04-03-growth-funnel-audit.md) |
| SEO | [`../seo/2026-04-03-seo-audit.md`](../seo/2026-04-03-seo-audit.md) |
| Documentation | [`../documentation/2026-04-03-documentation-audit.md`](../documentation/2026-04-03-documentation-audit.md) |
| Legal & Compliance | [`../legal-compliance/2026-04-03-legal-compliance-audit.md`](../legal-compliance/2026-04-03-legal-compliance-audit.md) |
| AI Agent Governance | [`../agent-governance/2026-04-03-agent-governance-audit.md`](../agent-governance/2026-04-03-agent-governance-audit.md) |

**Method:** Subagents followed `docs/process/audit-report-template.md` and lane-specific process docs; findings include file paths and severity.

---

## Cross-cutting themes

1. **Security (billing):** Webhook `syncSubscriptionToDb` user-resolution ordering issue was **fixed** (customer mapping precedence + mismatch warning telemetry). Remaining security work is in Schedule.
2. **Math:** Extra-payment payoff-year helper lag mismatch was **fixed** (remaining-term cap now includes payment-start lag; regression test added).
3. **Growth + Feature:** Onboarding `PATCH` silent failure was **fixed** with user-visible error + retry-safe behavior. Welcome modal a11y and copy consistency remain scheduled.
4. **Reliability:** Sentry `environment` vs `NODE_ENV`; `(app)/error.tsx` capture during render vs `useEffect`; public route error boundary coverage.
5. **Performance:** Duplicate `/api/rentcast-quota` fetches from multiple `RentCastQuotaHint` mounts.
6. **Data integrity:** Export truncation UX; multi-lien CSV semantics; import `loanType` vs API enum alignment.
7. **SEO:** `WebApplication` JSON-LD missing `operatingSystem` / `offers` per `seo-growth-plan.md` Phase 0.7.
8. **Documentation:** `design-brief-2026` “Active / supersedes” vs hub “future” — **reconcile**; broken links in `visual-assets-guide.md`, archived benchmarking proposal; `synthesis/README.md` stale pointer.
9. **Legal:** Cookie settings text vs Vercel Web Analytics; `security-notes.md` gtag wording vs consent-gated client.
10. **Governance:** `cursor-agent-setup.md` missing `seo-audit-agent.mdc` in clone list; subagent vs main-agent audit execution wording.

---

## Deduplication notes

| Duplicate sources | Consolidated handling |
|---------------------|------------------------|
| “60s” vs “2 min” | Feature UX + Growth → **one** editorial/growth task |
| Design-spec nav vs `app-nav` | Feature task + Documentation “spec reconciliation” umbrella |
| Error boundary / Sentry | Reliability lead; Code notes related patterns |

---

## PM triage (2026-04-03)

Per [`docs/process/full-audit-synthesis.md`](../../process/full-audit-synthesis.md) §3.5.

### Ship (next window)

*Tackle in the next implementation window — unresolved **High** security/billing, **High** growth activation, or correctness-adjacent math with clear fix.*

- [x] **Security — Stripe webhook user resolution:** In `syncSubscriptionToDb`, resolve app user **primarily by Stripe customer ID → DB**, validate metadata mismatch via warning telemetry, and prevent wrong-user subscription writes. **Done 2026-04-03** in `app/api/billing/webhook/route.ts` with regression test updates in `app/api/billing/webhook/route.test.ts`.
- [x] **Growth — Onboarding PATCH failure:** User-visible error + retry when `PATCH /api/onboarding` fails (`onboarding-panel.tsx`). **Done 2026-04-03** with explicit error state and safe busy reset.
- [x] **Math — Payoff extra-payment horizon:** `getPayoffYearsWithExtra` / tolerance helpers now include payment-start **lag** in remaining-term cap; regression added in `lib/amortization.test.ts`. **Done 2026-04-03**.

### Schedule (next batch)

- [ ] **Feature — Welcome modal a11y:** `role="dialog"`, labeling, focus trap, Escape (`onboarding-panel.tsx`).
- [ ] **Growth — Deals at-limit CTA:** `UpgradePlanLink` + placement for at-limit copy (parity with over-limit).
- [ ] **Growth — `PlanIntentUrlSync` on `/sign-in`** (with Suspense / Clerk-safe pattern).
- [ ] **Growth — Funnel instrumentation:** `FunnelCtaLink` / intent on investment-property-calculator body CTA; competitor page primary CTAs + `planIntent` where applicable; `PaidIntentCheckoutBanner` tracked link.
- [ ] **Security — Rate limits:** `billing:sync` and `billing:portal` (or document intentional omission + monitoring).
- [ ] **Security — Admin layout:** `getActiveAppUser` + null redirect in `admin/layout.tsx` vs `getAppUser`.
- [ ] **Performance — RentCast quota:** Single fetch per page for property form + benchmark hints.
- [ ] **Reliability — Sentry:** `VERCEL_ENV` for `environment`; `(app)/error.tsx` capture in `useEffect([error])`.
- [ ] **Data integrity — Export UX:** Surface truncation + counts from `GET /api/export/portfolio` in Settings download flow.
- [ ] **SEO — JSON-LD:** `operatingSystem` + `offers` on `WebApplication` in root layout (`seo-growth-plan` Phase 0.7).
- [ ] **Legal — Disclosure alignment:** Cookie preferences copy + `security-notes.md` gtag/consent wording.
- [ ] **Documentation — Fixes:** `docs/audits/synthesis/README.md` latest link; `visual-assets-guide.md` + archived benchmarking proposal links; design-brief vs design-spec **one-paragraph** reconciliation in brief or hub.
- [ ] **Governance — `docs/cursor-agent-setup.md`:** Add `seo-audit-agent.mdc` to Step 1 clone list.
- [ ] **Code — Design-spec compliance:** Reduce heavy shadow classes where they violate `design-spec`; optional Zod for `POST /api/billing/portal` body.
- [ ] **Feature — Design-spec §6:** Update nav section to match `app-nav.tsx` (Tools + Plans) or document deviation.
- [ ] **Mobile — Focus return** on drawer close (`app-layout-client.tsx`); optional chip touch targets (`workspace-nav-mobile.tsx`).
- [ ] **Data integrity — Import:** Normalize or validate CSV `loanType` against `LOAN_TYPE_OPTIONS`; Papa Parse error surfacing.
- [ ] **Business — PostHog:** Saved insight for signup/activation by `landingVariant` (incl. alternative variants).

### Optional / backlog

- [ ] Consolidate mortgage GET queries (Performance); bundle analyzer pass.
- [ ] Root `app/error.tsx` or runbook note for public-route errors (Reliability).
- [ ] CSP enforcement staging (prior carryover).
- [ ] Large module splits (`deal-analyzer-form`, wizards) when touched.
- [ ] SEO: Footer deep links to `/alternatives/stessa`, `/vs/spreadsheets` if strict Phase 3 interpretation.
- [ ] Security: OAuth/passwordless delete documentation; admin audit log (durable).
- [ ] Math: Benchmark copy — “contract rent” vs effective rent where both appear.

### Human-only / deferred

- [ ] Manual full mobile checklist per `docs/qa/mobile-experience-audit.md` §4 (devices/viewports).
- [ ] Legal counsel: comparative claims, trademarks, non-US expansion.
- [ ] Production: Stripe webhook replay tests; Search Console spot checks; PostHog UI verification.
- [ ] Owner: `docs/launch/launch-plan.md` §9 production checklist items.

---

## Appendix: severity snapshot by lane

| Lane | Highest severity in report |
|------|----------------------------|
| Code | Medium (shadows, large files, portal body Zod) |
| Math | Medium (payoff extra lag) |
| Feature / UX | High (onboarding modal a11y) |
| Mobile | Medium (manual QA gap; focus/chips Low–Medium) |
| Security | **High** (webhook user resolution) |
| Performance | Medium (quota dedup; mortgage query merge) |
| Reliability | Medium (Sentry env, error capture pattern) |
| Data integrity | High (multi-lien semantics + truncation UX) |
| Business | Medium (operational / matrix freshness) |
| Growth | **High** (onboarding PATCH silent fail; at-limit link) |
| SEO | Medium (JSON-LD completeness) |
| Documentation | Medium (spec conflict + broken links) |
| Legal | Medium (cookie / analytics copy) |
| Agent Governance | Medium (doc alignment) |

---

## PM review

**Ship items are complete** and mirrored in [`docs/tasks.md`](../../tasks.md) under the 2026-04-03 Ship phase. Promote remaining **Schedule** items as desired.

## Re-test (cross-cutting)

- [x] `npm run check` in `app/` after code changes from this synthesis (done 2026-04-03).
- [ ] Stripe CLI webhook tests after billing route changes.
- [ ] Rich Results Test after JSON-LD edits.
- [x] `npx vitest run` for amortization/tests touched by math Ship item.
