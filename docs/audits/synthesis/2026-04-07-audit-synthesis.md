# Full Audit Synthesis — 2026-04-07

> **Run:** 14 lanes, 7+7 parallel general-purpose agents (writes enabled; no `app/` edits during audits).  
> **Synthesis method:** `docs/process/full-audit-synthesis.md` §3–4.

---

## Audits included

| Lane | Report |
|------|--------|
| Code | [`docs/audits/code/2026-04-07-code-audit.md`](../code/2026-04-07-code-audit.md) |
| Math & Logic | [`docs/audits/math/2026-04-07-math-logic-audit.md`](../math/2026-04-07-math-logic-audit.md) |
| Feature / UX / IA | [`docs/audits/feature/2026-04-07-feature-ux-audit.md`](../feature/2026-04-07-feature-ux-audit.md) |
| Mobile experience | [`docs/audits/feature/2026-04-07-mobile-experience-audit.md`](../feature/2026-04-07-mobile-experience-audit.md) |
| Security & Privacy | [`docs/audits/security/2026-04-07-security-audit.md`](../security/2026-04-07-security-audit.md) |
| Performance & Cost | [`docs/audits/performance-cost/2026-04-07-performance-cost-audit.md`](../performance-cost/2026-04-07-performance-cost-audit.md) |
| Reliability & Operations | [`docs/audits/reliability-ops/2026-04-07-reliability-ops-audit.md`](../reliability-ops/2026-04-07-reliability-ops-audit.md) |
| Data Integrity & Reconciliation | [`docs/audits/data-integrity/2026-04-07-data-integrity-audit.md`](../data-integrity/2026-04-07-data-integrity-audit.md) |
| Business & Valuation | [`docs/audits/business/2026-04-07-business-valuation-audit.md`](../business/2026-04-07-business-valuation-audit.md) |
| Growth Funnel & Activation | [`docs/audits/growth-funnel/2026-04-07-growth-funnel-audit.md`](../growth-funnel/2026-04-07-growth-funnel-audit.md) |
| SEO (search & discovery) | [`docs/audits/seo/2026-04-07-seo-audit.md`](../seo/2026-04-07-seo-audit.md) |
| Documentation | [`docs/audits/documentation/2026-04-07-documentation-audit.md`](../documentation/2026-04-07-documentation-audit.md) |
| Legal & Compliance | [`docs/audits/legal-compliance/2026-04-07-legal-compliance-audit.md`](../legal-compliance/2026-04-07-legal-compliance-audit.md) |
| AI Agent Governance | [`docs/audits/agent-governance/2026-04-07-agent-governance-audit.md`](../agent-governance/2026-04-07-agent-governance-audit.md) |

---

## PM triage (this run)

Classified per `full-audit-synthesis.md` §3.5. Promote **Ship** and **Schedule** to [`docs/tasks.md`](../../tasks.md) when approved.

### Ship (next window)

- [ ] **SEC-CRON-1:** Add `/api/cron/trial-emails` to `isPublicRoute` in `app/proxy.ts`; update `docs/security/security-notes.md` public-route list; verify Vercel Cron 200 + handler `CRON_SECRET` path `[Security, Growth]`
- [ ] **CODE-PLACES-1:** Add server rate limits for `places:autocomplete` / `places:details` (`RATE_LIMITS`, `checkRateLimit` in autocomplete + details routes); document in `docs/security/security-notes.md` `[Code]`
- [ ] **GRW-PROOF-1:** Replace landing “social proof” strip with at least one evidence-based element (testimonial, metric, or third-party credibility) while preserving a11y `[Growth]`
- [ ] **GRW-COPY-1:** Unify “first property” / setup time claims across `app/app/page.tsx`, `pricing-cards.tsx`, and `pricing/page.tsx` with onboarding truth (~5 min) `[Growth]`
- [ ] **PERF-DB-1:** Scheduled cleanup (or TTL strategy) for `ApiRateLimitEntry` rows to cap table growth and query cost `[Performance-Cost]`

### Schedule (next batch)

- [ ] **GRW-1 / BIZ parity:** Mobile pricing accordion — add **Estimate pool (per hour)** row (or explicit “see desktop” note); aligns `[Business, Growth, Legal]` copy parity items
- [ ] **GRW-SIGNUP-1:** Stronger sign-up value for default (no `intent`) traffic — header or column on Clerk layout `[Growth]`
- [ ] **GRW-ANALYTICS-1:** Instrument dashboard empty-state and onboarding strip links; add wizard `step` + mobile-safe abandonment signal; UTM on onboarding email CTAs; harden `user_signed_up` vs `TRIAL_STARTED` story `[Growth]`
- [ ] **SEO-1:** Derive alternatives/vs sitemap URLs from `competitor-data` (or shared slug helpers); add `/refinance` to `robots.ts` disallow if product-intended `[SEO]`
- [ ] **SEO-2:** Add pricing **FAQ JSON-LD** aligned with visible copy; align `/vs` title vs H1 and `/tools` `openGraph.title` `[SEO]`
- [ ] **SEO-3 (optional polish):** Per-route or templated OG/Twitter images for major marketing URLs `[SEO]`
- [ ] **FEAT-1:** Wire `QuickActions` into property detail; fix Refinance empty state when properties exist but no loans (server `totalPropertyCount` + copy/CTAs) `[Feature]`
- [ ] **FEAT-A11Y-1:** Deals sort accessible name; property tabs WAI-ARIA pattern; Quick add vs Add explainer; deals header Analyze link `min-h-[44px]` `[Feature]`
- [ ] **MOB-1:** Focus return to hamburger after nav drawer close; 44px targets on Properties cards + `MobileModeSwitcher`; `aria-expanded` on `MobileCollapsible`; refinance chart tooltip width cap `[Mobile, Feature]`
- [ ] **PERF-2:** Refine `/api/billing/sync` to skip unnecessary Stripe calls for churned/abandoned-checkout users (document rules) `[Performance-Cost]`
- [ ] **PERF-3:** Lazy-split `add-property-wizard.tsx` and `deal-analyzer-form.tsx`; consolidate duplicate mortgage/metrics passes on `properties/page.tsx` and `dashboard/page.tsx` `[Performance-Cost, Code]`
- [ ] **PERF-4:** Import route — max upload size + row cap; merge mortgage GET queries in `mortgage/route.ts` `[Performance-Cost]`
- [ ] **DATA-1:** Prisma hardening — `User.email` unique; `RentCastApiCall` FK; consider `Subscription.status` enum; `hasMortgage` non-null + backfill; deal PATCH mortgage consistency; import `originalLoanAmount >= mortgageBalance` `[Data-Integrity]`
- [ ] **DATA-2:** Export truncation notice in-file + `portfolio-csv-export.md` updates (`display mode` column); `capRate` comment clarity `[Data-Integrity]`
- [ ] **REL-1:** Production checklist (Sentry DSN, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL`, Stripe webhook); Sentry on cron misconfig branches; `incident-response.md` migration/third-party triage; env-driven trace sampling `[Reliability-Ops]`
- [ ] **REL-2:** CI — `next build` with dummy env or `tsc --noEmit` in `app/` `[Reliability-Ops]`
- [ ] **MATH-1:** Document strict-only vs tolerance-aware amortization policy for API vs UI; optional finite-number validation on numeric writes `[Math]`
- [ ] **CODE-REFACTOR-1:** Deduplicate `parseCurrencyNum`; single-source `WizardData`; single-pass mortgage totals on `properties/page.tsx`; `getAppOrigin()` for unsubscribe footer link `[Code]`
- [ ] **SEC-IP-1:** Harden anonymous IP for rate limits (prefer platform-trusted header vs leftmost `X-Forwarded-For`) `[Security]`
- [ ] **DOC-1:** Move three root-level audits into lane folders + fix links; fix plan frontmatter `research:` / `audit:`; refresh `docs/README.md` (synthesis link, design-spec hierarchy, `research/` etc.); patch `full-audit-synthesis.md` tasks.md link; fix archive plan footers `[Documentation]`
- [ ] **GOV-1:** Point builder/PM docs at `docs/design/design-spec-2026.md` as primary UI authority `[Agent-Governance]`
- [ ] **GOV-2:** Windows `subagentStop` — wire `.ps1` or document bash requirement in `hooks.json` + setup `[Agent-Governance]`
- [ ] **GOV-3–5:** Document in-thread vs subagent audits; sync lane-rename checklist README vs `command-integrity-check.md`; refresh `cursor-agent-setup.md` lane list `[Agent-Governance]`
- [ ] **BIZ-DOC-1:** Refresh `docs/reference/valuation-brief.md` after PostHog/Stripe checks; cron/email observability doc; scope PDF export in `tasks.md` `[Business]`

### Optional / backlog

- [ ] CSP move to enforce when ready (`CSP_ENFORCEMENT`) — operational choice `[Security]`
- [ ] `CRON_SECRET` at app boot vs fail-at-hit — lower priority `[Security]`
- [ ] Billing success “activation-forward” primary CTA `[Growth]`
- [ ] `docs/policies/design-spec.md` §6 nav refresh to match `app-nav.tsx` `[Feature]`

### Human-only / deferred

- [ ] **LEGAL-1:** Terms governing law, venue, dispute resolution — counsel `[Legal]`
- [ ] **LEGAL-2:** Multi-state paid scale — refund/cancellation/auto-renewal vs state law — counsel `[Legal]`
- [ ] **LEGAL-3:** Pre-EU expansion — privacy basis, cookies, email characterization — counsel `[Legal]`
- [ ] **BIZ-5:** LLC + Stripe + legal copy path — `docs/business-launch-checklist.md` — owner/counsel `[Business]`
- [ ] Mobile real-device smoke (320–768, physical device) — QA `[Mobile]`
- [ ] Search Console / rich results manual verification — ops `[SEO]`

---

## Appendix — Consolidated inventory (by domain)

Deduplicated high-signal items; use **PM triage** above for promotion. Source lanes in brackets.

### Security

- [ ] Trial-emails cron public allowlist + docs sync `[Security]`
- [ ] Places API rate limits `[Code, Security]`
- [ ] IP identifier hardening for anonymous limits `[Security]`

### UX / Feature / Mobile

- [ ] QuickActions on property detail; Refinance empty state; deals/property a11y; add vs quick add explainer `[Feature]`
- [ ] Drawer focus, touch targets, collapsible ARIA, refinance tooltip `[Mobile]`

### Performance

- [ ] Rate-limit table pruning; billing sync Stripe calls; wizard splits; metrics consolidation; import caps; mortgage query merge `[Performance-Cost, Code]`

### Reliability

- [ ] Launch gates + cron observability + runbook + CI build `[Reliability-Ops]`

### Data integrity

- [ ] Schema + validation + export docs `[Data-Integrity]`

### Growth

- [ ] Social proof; copy alignment; signup; analytics instrumentation; email UTM `[Growth]`

### SEO

- [ ] Sitemap derivation; robots; FAQ JSON-LD; OG images; title alignment `[SEO]`

### Math

- [ ] API vs UI amortization policy doc; optional NaN guards `[Math]`

### Business

- [ ] Valuation brief; observability doc; PDF export scoping `[Business]`

### Documentation / Governance

- [ ] Audit file moves; README/synthesis/archive links; design authority; hooks Windows; audit execution docs `[Documentation, Agent-Governance]`

### Legal (engineering subset)

- [ ] STR vs LTR + investment calculator disclaimers; Terms/Privacy date format; pricing accordion footnote `[Legal]` — counsel items in Human-only

---

## PM review

Review **PM triage** above. Promote **Ship** and **Schedule** to [`docs/tasks.md`](../../tasks.md) unless explicitly deferred. The builder implements approved items.

---

*Generated: 2026-04-07 | 14 lanes | 7+7 parallel agents | See individual reports for citations and re-test checklists.*
