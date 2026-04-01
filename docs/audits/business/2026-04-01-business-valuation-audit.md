# Business & Valuation Audit — 2026-04-01

## Executive summary

- **Pricing and plan integrity are strong at the code level.** `PricingCards` imports `PLAN_PROPERTY_LIMITS` and `PLAN_DEAL_LIMITS` directly from `app/lib/plans.ts`, eliminating any code-level divergence between limits and marketing copy. `billing-matrix.md` manually states the same numbers and is consistent. Deployment-time drift (mismatched `NEXT_PUBLIC_PRICE_*` env vars vs live Stripe prices) remains the live operational risk, not a structural code flaw.
- **Billing user journey is functionally complete.** Checkout, webhook, portal, success page, and reactive sync all exist and are wired. The one notable gap is that `invoice.payment_failed` is not an explicit webhook handler; `past_due` state propagates only via `customer.subscription.updated`. Whether a user-facing banner is surfaced for `past_due` subscriptions cannot be confirmed from the billing routes alone.
- **Commercial posture and valuation framing remain consistent with the 2026-03-31 audit.** No MRR, churn, or paying subscriber data is evidenced in the repository. Valuation stays in the replacement-cost and documentation-maturity band (~$12K–$28K codebase-only; rising to $40K–$95K+ on first verified revenue cohort). Distribution remains the highest-priority unresolved business risk.
- **Top recommendations:** (1) Confirm and document the past_due user-facing path; (2) extend the billing matrix to include the three auxiliary billing routes; (3) verify the PostHog named funnel insight exists in the dashboard; (4) close remaining launch-plan operational checklist items before scaling paid acquisition.

---

## Severity-ranked findings

### Critical

- *(None identified on this pass.)*

### High

- **Revenue and retention remain unevidenced in-repo** — Stripe integration is functional (`app/lib/stripe-config.ts`, webhook, portal, sync), but no export of paying subscribers, MRR, churn, or LTV exists in reviewed artifacts. Acquirer or investor conversations stay in asset/replacement-cost territory without external verification of commercial metrics. — `app/lib/stripe-config.ts`, `app/.env.example`; limits: Stripe Dashboard and PostHog not queried in this pass.

- **Amortization edge cases unresolved** — The 2026-03-31 math audit documented that when stored payment is below computed interest (negative-amortization territory), schedule iteration can produce unbounded principal drift. No code-level fix was detected on this pass. Sophisticated buyers stress-testing mortgage payoff paths may treat this as a credibility risk on the product's core math differentiator. — `docs/audits/math/2026-03-31-math-logic-audit.md`; `app/lib/amortization.ts` (not re-examined on this pass; gap assumed open until cross-referenced with any math-lane fix).

### Medium

- **`invoice.payment_failed` not an explicit webhook event** — The webhook (`app/app/api/billing/webhook/route.ts`) handles `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `checkout.session.completed`. It does not explicitly handle `invoice.payment_failed`. The `past_due` status propagates indirectly when Stripe sends `customer.subscription.updated` after a failed invoice; `billing/sync/route.ts` explicitly defers downgrade for `past_due` with the comment "past_due banner will show." Whether that banner is rendered in the app layout could not be confirmed from billing routes alone. If it is absent or silently suppressed, users with failed payments would retain full access without notification until the subscription is fully canceled. — `app/app/api/billing/webhook/route.ts`; `app/app/api/billing/sync/route.ts` (lines ~59–62); `app/app/api/billing/status/route.ts`.

- **Billing matrix does not document auxiliary billing routes** — `docs/internal/billing-matrix.md` correctly covers the plan-limit, Stripe price-ID, and display-price matrix, but does not mention `/api/billing/sync`, `/api/billing/status`, or `/api/billing/subscription-details`. An operator using the matrix as the single reference for billing ops would be unaware of these routes and their behavior (reactive Stripe sync, live subscription status, period-end detail). — `docs/internal/billing-matrix.md`; `app/app/api/billing/sync/route.ts`, `app/app/api/billing/status/route.ts`, `app/app/api/billing/subscription-details/route.ts`.

- **PostHog growth funnel verification checklist is unchecked** — `docs/launch/posthog-growth-funnel.md` defines a 5-step funnel (signup → property_created → plan view → checkout_started → subscription_activated) that is correctly reflected in `app/lib/analytics-events.ts` and the webhook. However, the quick-verification checklist at the bottom of that document has no items marked complete. There is no in-repo evidence the named funnel insight (`Growth funnel — signup to subscribed`) has been saved in PostHog. Until saved, growth and PM have no structured conversion view during paid acquisition runs. — `docs/launch/posthog-growth-funnel.md` §Quick verification checklist; `app/lib/analytics-events.ts`.

- **Launch plan operational checklist items still unchecked** — `docs/launch/launch-plan.md` §9 contains five items that remain unchecked as of the last document revision (2026-03-28): production env vars verified, `/api/health` green in prod, support path tested, pricing page copy aligned with Stripe, and golden path demo recorded. The launch plan was last updated before the 2026-03-31 release. These are pre-scaling operational hygiene items, not code blockers, but their open status is a risk if paid acquisition spend increases before they are confirmed. — `docs/launch/launch-plan.md` §9 (lines 229–234).

### Low

- **`portal/route.ts` lacks Sentry coverage** — The billing portal route uses `console.error` in its catch block without a `Sentry.captureException` call. If portal creation fails in production, the error is logged but not surfaced in Sentry for alerting. This contrasts with `billing/sync/route.ts` which captures exceptions correctly. Operational visibility risk during billing disputes or portal outages. — `app/app/api/billing/portal/route.ts` (catch block ~32); `app/app/api/billing/sync/route.ts` (Sentry present).

- **`analytics-events.ts` has events not referenced in funnel documentation** — `SUBSCRIPTION_CANCELED`, `SUBSCRIPTION_UPDATED`, `PLAN_LIMIT_HIT`, `FUNNEL_CTA_CLICKED`, `ONBOARDING_STEP_COMPLETED`, `ADD_PROPERTY_MILESTONE_REACHED`, `PLAN_INTENT_APPLIED`, `IMPORT_COMPLETED`, `IMPORT_FAILED` are defined and presumably emitted, but `posthog-growth-funnel.md` and `docs/launch/analytics.md` do not document their payloads or dashboards. These events carry operational intelligence (e.g., `PLAN_LIMIT_HIT` signals upgrade intent; `IMPORT_COMPLETED` signals high-activation users). Without documented analysis of these events, the funnel picture is incomplete for investor or growth presentations. — `app/lib/analytics-events.ts`; `docs/launch/posthog-growth-funnel.md`.

- **Changelog current through 2026-03-31; no 2026-04-01 entry** — `app/lib/changelog-data.ts` most recent entry is dated `2026-03-31`. No code changes were expected today (audit-only pass), so this is not a drift issue. However, if any silent fix or infrastructure change ships on 2026-04-01, the changelog process (`docs/launch/changelog-process.md`) requires a new entry. Track going forward. — `app/lib/changelog-data.ts` (line 14–27).

- **Moat is workflow and domain clarity, not structural** — No network effects, proprietary data pipelines, or exclusive integrations protect the product. Positioning against spreadsheets and generic landlord tools is credible and real, but fast followers can replicate the core feature surface. This is a known and accepted risk documented in the one-pager; it limits exit premium unless distribution or data advantages emerge. — `docs/launch/investor-style-one-pager.md` §7; `docs/internal/differentiator-value-add-analysis.md`.

---

## Evidence reviewed

- **Process:** `docs/process/business-valuation-audit-process.md`, `docs/process/audit-report-template.md`
- **Business & investor docs:** `docs/launch/investor-style-one-pager.md`, `docs/launch/launch-plan.md`, `docs/reference/roadmap.md`
- **Commercial operations:** `docs/internal/billing-matrix.md`
- **Monetization code:** `app/lib/plans.ts`, `app/lib/pricing-display.ts`, `app/lib/stripe-config.ts`, `app/.env.example`
- **Pricing/marketing surfaces:** `app/app/pricing/page.tsx`, `app/app/(app)/plans/page.tsx`, `app/components/pricing-cards.tsx`
- **Billing flow routes:** `app/app/api/billing/create-checkout-session/route.ts`, `app/app/api/billing/webhook/route.ts`, `app/app/api/billing/portal/route.ts`, `app/app/api/billing/sync/route.ts`, `app/app/api/billing/status/route.ts`, `app/app/api/billing/subscription-details/route.ts`
- **Post-checkout surface:** `app/app/(app)/billing/success/page.tsx`
- **Analytics instrumentation:** `app/lib/analytics-events.ts`, `docs/launch/posthog-growth-funnel.md`
- **Product signal:** `app/lib/changelog-data.ts`
- **Prior business audit (continuity):** `docs/audits/business/2026-03-31-business-valuation-audit.md`
- **Cross-lane audit context:** `docs/audits/code/2026-03-31-code-audit.md`, `docs/audits/math/2026-03-31-math-logic-audit.md`

**Audit limits:** This pass did not query Stripe Dashboard, Clerk Dashboard, PostHog, or Vercel production environments. No live traffic, conversion, or MRR data was reviewed. Valuation ranges below are illustrative bands based on codebase and documentation maturity, not fairness opinions. Amortization fix status from the 2026-03-31 math audit was assumed open; verify against any subsequent math-lane patch.

---

## Risk & impact assessment

| Area | Likelihood | Business / valuation impact if ignored |
|------|------------|----------------------------------------|
| No verified revenue | — | Stays in replacement-cost band; no revenue-multiple premium available |
| Amortization edge cases | Low frequency, high severity | Power users and acquirer diligence lose trust in debt/equity outputs |
| `past_due` UX path unconfirmed | Medium with payment failures | Users retain access silently; subscription recovery is lower; churn risk |
| Missing billing route docs | Low ops impact today | Ops confusion if billing team grows or incident response relies on matrix |
| PostHog funnel unsaved | Low until paid ads scale | Growth and PM cannot read conversion data systematically |
| Open launch checklist | Rises with ad spend | If env drift or health gap exists in production, conversions are blocked |
| Undocumented analytics events | Low | Valuable upgrade-intent and activation signals go unanalyzed |

---

## Valuation posture

**Shared assumptions (explicit):**

- Asset type: SaaS codebase, documentation, and operational runbooks. No corporate financial statements, IP litigation, or production traffic data reviewed.
- "Codebase-only / no users" means no material attributed recurring revenue evidenced in-repo.
- "With traction" assumes verified MRR, manageable churn, and clean subscription history. Multiples collapse if churn is high or revenue is one-off.

**Indicative ranges (USD, wide bands; not a fairness opinion):**

| Scenario | What is priced in | Indicative range | Confidence |
|----------|-------------------|------------------|------------|
| **A — Codebase / no paying users** | Replacement cost, clean billing architecture, policy and test maturity, launched feature surface (calculators, deal context, export API, mortgage modeling) | **~$12K–$28K** | Low–medium (buyer- and market-dependent) |
| **B — Early revenue** | ~10–50 paying subs, visible retention, some unit economics | **~$40K–$95K** | Low until actuals verified |
| **C — PMF signal** | ~100+ paying, ~$2K+ MRR, improving net retention | **~$110K–$320K+** | Low until verified |

**vs 2026-03-31 audit:** No structural change in valuation band. The billing architecture is confirmed clean; no new commercial evidence shifts the range. Closing the `past_due` UX path and the launch checklist items would modestly reduce operational risk haircuts by diligent buyers.

**Metrics that move the needle (collect outside the repo):** MRR and ARPA by tier; churn and expansion rate; CAC by channel; activation rate (first property within 7 days); `PLAN_LIMIT_HIT` frequency (upgrade-intent proxy from PostHog); support volume per 100 MAU; RentCast and Stripe COGS per active user.

---

## Recommendations (prioritized)

1. **Confirm and document the `past_due` user-facing path** — Verify that the "past_due banner will show" comment in `billing/sync/route.ts` is wired to a visible UI state (check `app-layout-client.tsx` or equivalent shell component). If missing, add it. This closes a churn and trust gap before scaling paid acquisition.
2. **Extend `billing-matrix.md` to reference auxiliary billing routes** — Add a short table row or note for `/api/billing/sync`, `/api/billing/status`, and `/api/billing/subscription-details` with a one-line purpose and when each fires. Low effort; high ops clarity value.
3. **Save the named PostHog funnel insight** — Execute the quick-verification checklist in `posthog-growth-funnel.md`: confirm `NEXT_PUBLIC_POSTHOG_KEY` is set in production, run a test-mode checkout, verify all five events appear in Activity, and save the named funnel. This is required before paid acquisition metrics are meaningful.
4. **Close the launch plan operational checklist** — Work through the five unchecked items in `docs/launch/launch-plan.md` §9 before scaling ad spend: production env var audit, `/api/health` green in prod, support path smoke-test, pricing/Stripe spot-check, and golden path demo recording.
5. **Document secondary analytics events** — Add a brief table to `docs/launch/analytics.md` or `posthog-growth-funnel.md` covering `PLAN_LIMIT_HIT`, `SUBSCRIPTION_CANCELED`, `FUNNEL_CTA_CLICKED`, `IMPORT_COMPLETED`, and `ADD_PROPERTY_MILESTONE_REACHED` with payload descriptions. These events are upgrade-intent and activation signals that support investor and growth narratives.

---

## Task candidates

- [ ] **Audit `past_due` banner**: Trace from `billing/status` route response → layout client → UI; confirm banner renders for `past_due` subscription status; add if absent.
- [ ] **Billing matrix v2**: Add auxiliary billing routes table to `docs/internal/billing-matrix.md` (sync, status, subscription-details — purpose + trigger condition).
- [ ] **PostHog funnel verification**: Complete the checklist in `docs/launch/posthog-growth-funnel.md`; save named funnel insight; check items.
- [ ] **Launch checklist close-out**: Mark or verify each of the five unchecked items in `docs/launch/launch-plan.md` §9 against the live production environment.
- [ ] **Secondary analytics event documentation**: Add event reference table to `docs/launch/analytics.md` for events in `AnalyticsEvents` not currently described in funnel docs.
- [ ] **`portal/route.ts` Sentry coverage**: Add `Sentry.captureException` in the portal route catch block (parity with `sync/route.ts`).

---

## Re-test checklist

- [ ] Verify `past_due` banner renders in the app shell when subscription status is `past_due`.
- [ ] Verify pricing page amounts (`/pricing`, `/plans`) match Stripe test-mode prices and `NEXT_PUBLIC_PRICE_*` env values.
- [ ] Verify webhook receives and processes `customer.subscription.updated` for a simulated payment failure (Stripe CLI `stripe trigger invoice.payment_failed`).
- [ ] Confirm PostHog named funnel insight `Growth funnel — signup to subscribed` exists and shows events for a test signup.
- [ ] `npm run check` in `app/` if any code changes follow from these recommendations (not required for this audit-only pass).

---

## Next trigger and cadence

- **Trigger:** New pricing tier or packaging change, paid acquisition scaling event, first verified MRR milestone, fundraising or acquisition process initiation, or material change to any billing API.
- **Recommended next run:** Monthly while running paid acquisition or investor conversations; otherwise quarterly per `docs/audits/README.md`.
