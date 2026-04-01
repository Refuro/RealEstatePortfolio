# Full Audit Synthesis — 2026-03-31

**Execution tracking:** Builder work is phased with acceptance criteria in [`docs/tasks.md`](../../tasks.md) → **Full audit remediation — 2026-03-31 synthesis**. Items tagged **`[Synth]`** there map to the consolidated checklist below; check off `tasks.md` to see what is still open. Large-file refactors and deferred synthesis lines are listed only under **Deferred from synthesis** in `tasks.md`, not as active phases.

## Audits included

- Code — `docs/audits/code/2026-03-31-code-audit.md`
- Math & Logic — `docs/audits/math/2026-03-31-math-logic-audit.md`
- Feature / UX / IA — `docs/audits/feature/2026-03-31-feature-ux-audit.md`
- Mobile experience — `docs/audits/feature/2026-03-31-mobile-experience-audit.md`
- Security & Privacy — `docs/audits/security/2026-03-31-security-audit.md`
- Performance & Cost — `docs/audits/performance-cost/2026-03-31-performance-cost-audit.md`
- Reliability & Operations — `docs/audits/reliability-ops/2026-03-31-reliability-ops-audit.md`
- Data Integrity & Reconciliation — `docs/audits/data-integrity/2026-03-31-data-integrity-audit.md`
- Business & Valuation — `docs/audits/business/2026-03-31-business-valuation-audit.md`
- Growth Funnel & Activation — `docs/audits/growth-funnel/2026-03-31-growth-funnel-audit.md`
- SEO (search & discovery) — `docs/audits/seo/2026-03-31-seo-audit.md`
- Documentation — `docs/audits/documentation/2026-03-31-documentation-audit.md`
- Legal & Compliance — `docs/audits/legal-compliance/2026-03-31-legal-compliance-audit.md`
- AI Agent Governance — `docs/audits/agent-governance/2026-03-31-agent-governance-audit.md`

**Parallel run:** Fourteen lane reports produced 2026-03-31; each lane followed its process doc and `docs/process/audit-report-template.md`. Evidence and severity live in the per-lane files above.

---

## Consolidated task list

### Security

- [ ] Refresh `docs/security/security-audit.md` (CSP, rate limits) to match `app/next.config.ts` and `app/lib/rate-limit.ts` (Security).
- [ ] Add `userId` to benchmark refresh `property.update` `where` for defense-in-depth (Security; overlaps Data Integrity theme—single change in code).

### Reliability

- [ ] Stop swallowing `/api/billing/sync` failures in `app/app/(app)/app-layout-client.tsx`—log/Sentry on non-OK or `catch` (Reliability).
- [ ] Capture RentCast upstream failures to Sentry (or sampled) in rent/value estimate and benchmark refresh routes (Reliability).
- [ ] Optionally move `Sentry.captureException` in `(app)/error.tsx` into `useEffect` for React 19 / Strict Mode alignment (Reliability).

### UX / Feature

- [ ] Mobile discoverability for portfolio export—parity with desktop dashboard strip (Feature/UX).
- [ ] Analyze: surface saved deals earlier (header link or copy to `/deals`) (Feature/UX).
- [ ] Property detail page title pattern vs `design-spec.md` (Feature/UX).
- [ ] Calculators hub padding vs `app-layout-client` `main`—avoid double padding (Feature/UX).
- [ ] Growth: home pricing strip mentions **saved deals** per tier; post-auth paid-intent continuation; empty state + welcome recommended first path; `/plans` copy covers properties **and** deals; sign-in Terms/Privacy parity with sign-up; billing success CTA balance; optional `clearPlanIntent` after subscribe (Growth).

### Mobile experience

- [ ] Deal Analyzer mobile sticky results bar: bottom safe-area padding (notch devices) (Mobile).
- [ ] `landing-nav` mobile drawer: Escape, focus trap, dialog semantics aligned with app drawer (Mobile).
- [ ] `MobileCollapsible` tap target ~44px (Mobile).
- [ ] Evaluate `viewport` / `viewportFit: 'cover'` in root layout if iOS safe-area gaps remain (Mobile).

### Performance

- [ ] Spike: reduce or debounce PostHog person props `/api/me` fan-out; verify properties still update after upgrade (Performance).
- [ ] Refactor dashboard data to reuse `buildPortfolioSummaryPayload` (or shared fetch) to cut duplicate server work (Performance).
- [ ] Optional: Clerk `preconnect`/`dns-prefetch` if RUM shows connection delay (Performance).

### Data Integrity

- [ ] CSV import aliases: `escrow amount (first lien)`, `mortgage balance (stored sum)` to match export headers (Data Integrity).
- [ ] Regression test: export-header-shaped row parses escrow and mortgage balance (Data Integrity).
- [ ] Update `docs/reference/portfolio-csv-export.md` with round-trip column matrix (Data Integrity).

### Math

- [ ] Decide and implement guard or disclosure for negative amortization when P&I &lt; interest (`amortization.ts`, validation); add tests if shipped (Math).

### SEO

- [ ] Eliminate duplicated “Veld Portfolio” in rendered `<title>` where `metadata.template` stacks with full-string titles (home, changelog, contact—scan all `metadata`) (SEO).
- [ ] Align `robots.ts` disallows with non-public app prefixes (SEO).
- [ ] Add FAQPage JSON-LD to `/tools/brrr` consistent with other calculators (SEO).
- [ ] Expand Terms meta description for clearer snippets (SEO).

### Growth / Business (process & evidence)

- [ ] Internal commercial matrix: tier limits ↔ Stripe IDs ↔ `NEXT_PUBLIC_PRICE_*` ↔ marketing owner (Business).
- [ ] Investor one-pager: ICP, differentiation, shipped proof, explicit gaps—honest positioning (Business).
- [ ] PostHog named funnel: signup → first property → plan view → checkout → subscribed (Business).

### Legal / Compliance

- [ ] Privacy: disclose **Resend** (contact) and **Sentry** (errors/CSP/client) in third-party list (Legal).
- [ ] Production `SUPPORT_EMAIL` always set, or copy describes `/contact` when email hidden (Legal).
- [ ] Resolve Terms `TODO(legal)` operating entity with counsel (Legal).
- [ ] Align `docs/security/security-notes.md` RentCast rate-limit bullet with tiered quota docs (Legal + Security doc hygiene).

### Documentation & Governance (single pass)

- [x] Fix dead link in `docs/audits/synthesis/README.md` to `documentation-audit-agent.mdc` (`../../../.cursor/...` from `docs/audits/synthesis/`).
- [x] Align `docs/README.md` latest synthesis with this run; `docs/audits/synthesis/README.md` points at `2026-03-31-audit-synthesis.md`.
- [x] `docs/process/command-integrity-check.md`: **Mobile experience** row added; **SEO** row verified.
- [x] `docs/setup/ai-process-workflow-setup.md`: `mobile-experience-audit-agent.mdc` added to optional rules list.
- [x] `docs/cursor-agent-setup.md`: **SEO** rule + process + `docs/audits/seo/` in docs table.

### Code quality (large refactors)

- [ ] Refactor plan for mega-modules: `add-property-wizard.tsx`, `projections-tab-content.tsx`, `deal-analyzer-form.tsx`, and other &gt;300-line hotspots (Code).
- [ ] Onboarding modal: reduce decorative chrome per `design-spec.md` §1 (Code).
- [ ] Theme: add `primary` to `@theme` mapped to accent **or** replace `text-primary` / `bg-primary` with semantic tokens; verify light/dark (Code).
- [ ] Sentry on unexpected errors in `api/billing/portal` and similar catch-only routes (Code).
- [ ] Harden `PATCH` `app/api/properties/[id]/route.ts` with `userId` in `update` `where` (Code).

---

## PM review

Review the consolidated list above. Promote approved items to [docs/tasks.md](../../tasks.md). The builder implements approved items.

## Deduplication notes

- **command-integrity / workflow / cursor-agent-setup** items were merged into one **Documentation & Governance** subsection; the checklist above reflects **completed doc wiring fixes** applied in the same change set as this synthesis file.
- **Benchmark `userId` in `update` where** appears in Security audit; implemented once.
- **security-audit.md refresh** covers CSP + rate limits; Legal item for RentCast bullet is a separate doc fix.

---

## Re-test (cross-cutting)

- [ ] After CSP or metadata changes: smoke Clerk, Stripe checkout, key marketing URLs.
- [ ] After CSV import fix: export → import round-trip on staging.
- [ ] `npm run check` in `app/` when code ships from this synthesis (per-lane reports list additional spot-checks).
