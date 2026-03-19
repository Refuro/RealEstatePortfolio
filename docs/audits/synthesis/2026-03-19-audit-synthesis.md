# Full Audit Synthesis — 2026-03-19

## Audits included

- Math & Logic
- Feature / UX / IA
- Security & Privacy
- Performance & Cost
- Reliability & Operations
- Data Integrity & Reconciliation
- Business & Valuation
- Growth Funnel & Activation
- AI Agent Governance

(Code audit report exists but had no Task candidates section in the same format; findings are architectural.)

---

## Consolidated task list (deduplicated)

### Security

- [ ] Add CSP header in report-only mode to `next.config.ts` security headers.
- [ ] Add rate limiting to `api/properties` POST, `api/deals` POST, `api/import/portfolio` POST, `api/account/delete`, `api/billing/create-checkout-session`.
- [ ] Add structured logging for admin export and tier override actions.
- [ ] Verify `proxy.ts` → `middleware.ts` wiring or rename.

### Governance & docs

- [ ] Fix `.cursor/hooks.json` shell-risk-policy path to `docs/policies/shell-risk-policy.md`.
- [ ] Fix `docs/policies/design-spec.md` internal links (pm-review-checklist, engineering-spec).
- [ ] Fix `docs/ai-development-process-extraction.md` shell-risk-policy references.
- [ ] Standardize `.env.example` path in `cursor-agent-setup.md` and `pm-agent-workflow.md`.
- [ ] Align math audit report naming convention between README and agent.
- [ ] Remove trailing markdown artifact in `pm-agent.mdc`.
- [ ] Add recurring command-integrity check (verify audit rules → process docs).
- [ ] Add PM release-gate checklist item for required audits per `docs/audits/README.md`.

### Reliability & observability

- [ ] Add `Sentry.captureException(error)` to `app/(app)/error.tsx`.
- [ ] Add `/api/health` endpoint with DB connectivity check.
- [ ] Add structured error logging to `api/billing/create-checkout-session` and `api/billing/sync`.
- [ ] Create `docs/runbooks/incident-response.md` covering rollback, monitoring, and recovery.
- [ ] Add `Suspense` wrappers to dashboard and properties page components.

### Performance

- [ ] Wrap `ProjectionsTabContent` or its chart in `next/dynamic` with `ssr: false`.
- [ ] Wrap `MortgageTabContent` or its chart in `next/dynamic` with `ssr: false`.
- [ ] Add sequential or throttled execution to dashboard benchmark refresh loop.
- [ ] Pass subscription details as server props to Settings page.

### Data integrity & math

- [ ] Update import parser to accept `mortgage balance (effective)` or `mortgage balance (stored)` as aliases.
- [ ] Add Zod runtime validation for `unitRents` JSON field on read.
- [ ] Add NOI and annual cash flow columns to portfolio export.
- [ ] Make projection chart loan balance use `scaleLiabilityAmount` for mode-aware display.
- [ ] Update mortgage tab baseline note to clarify "no extra payment" scenario.
- [ ] Evaluate Prisma schema change for `ownershipPercent`/`vacancyPercent` (Int → Decimal).

### UX / Feature

- [ ] Fix `signInUrl` typo in `app/sign-up/[[...sign-up]]/page.tsx`: change `"/sign-up"` to `"/sign-in"` (critical 1-line fix).
- [ ] Rename nav label "Pricing" to "Plans" and page title to "Plans & billing".
- [ ] Remove duplicate Modeling/Mortgage links from bottom of property detail Overview.
- [ ] Add sort-by-date and search to Deals page.
- [ ] Standardize card styling tokens across dashboard, properties, deals, and workspaces.
- [ ] Remove "View" action from deal cards.
- [ ] Replace `window.confirm()` in deals with app-consistent delete confirmation.
- [ ] Add single-property metric cards or inline metrics to dashboard.

### Growth & activation

- [ ] Add product screenshots to landing page and public pricing page.
- [ ] Add "What's next" guidance card to post-first-property dashboard.
- [ ] Add "Analyze a deal" CTA to dashboard empty state.
- [ ] Add "Getting started" link in sidebar or settings for re-entry to onboarding tips.
- [ ] Consider wizard "Quick add" mode or mortgage step skip.

### Business & quality

- [ ] Set up analytics tracking (PostHog, Mixpanel, or similar) for funnel metrics.
- [ ] Add Vitest or Jest with initial test coverage for `lib/metrics/`, `lib/amortization.ts`.
- [ ] Create a launch plan (target communities, messaging, timeline).
- [ ] Add a public changelog page.

---

## Deduplication applied

| Merged from | Consolidated task |
|-------------|-------------------|
| Performance + Reliability | Add `Sentry.captureException` to error.tsx |
| Data Integrity + Math | Add NOI and annual cash flow to export |
| Growth + Business | Add product screenshots |
| Security + AP1 | CSP, rate limits, structured logging (merged into Security batch) |
| Agent Governance + AP2 | Governance fixes + command-integrity (merged into Governance batch) |

---

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.
