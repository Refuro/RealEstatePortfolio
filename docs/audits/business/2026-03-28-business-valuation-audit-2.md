# Business & Valuation Audit — 2026-03-28 (run 2)

## Executive summary

- **Overall:** The product shows **mature technical execution** for a focused vertical SaaS (Clerk auth, Prisma, Stripe subscriptions, Sentry, RentCast integrations, portfolio metrics, import/export). Roadmap indicates many MVP-class features are shipped; remaining work is differentiation and go-to-market more than “does the app run.”
- **Top risks:** **Traction and revenue are not evidenced in-repo** (no ARR disclosure in this audit). **Key-person / small-team** execution risk is typical. Competitive space (personal rental/portfolio trackers) requires clear positioning.
- **Recommendation:** Treat valuation as **asset-heavy / rebuild-cost anchored** until verified recurring revenue and cohort data exist.

## Explicit valuation figure (required)

| Item | Value |
|------|--------|
| **Base-case enterprise value (codebase + documented IP, no verified ARR in repo)** | **USD $225,000** |
| **Reasonable range (same assumptions)** | **USD $90,000 – $380,000** |

### Assumptions

1. **No audited financials or ARR** were available inside the repository; valuation is **not** a revenue-multiple method.
2. **Replacement cost:** Rough-order rebuild of core app (auth, billing, property/mortgage modeling, benchmarks, import/export, ops hooks) ≈ **1.0–1.8** person-years of senior full-stack engineering at a **loaded** cost of **$120k–$180k/year** → **$120k–$320k** engineering replacement band.
3. **Add-ons:** Stripe + webhook hardening, rate limits, CSP posture, and test coverage add **modest** premium vs a greenfield prototype.
4. **Discounts:** Market competition, need for distribution, and **documentation of live MRR** missing → use **base case below midpoint** of replacement band.
5. Geography/tax/legal deal structure not modeled.

### Confidence

- **Low to medium** for absolute dollar accuracy; **higher** for **relative** ordering vs an unshipped prototype (this codebase is clearly beyond prototype).
- A **single buyer** (acqui-hire or strategic) could pay **outside** this range based on team or user data not visible here.

## Severity-ranked findings

### Critical

- None (not a compliance audit).

### High

- **Valuation uplift requires extrinsic metrics** — MRR/ARR, churn, CAC, and active user growth are not derivable from code alone.

### Medium

- **Moat** is mostly **execution speed + UX depth**, not proprietary data networks — acceptable for indie/SMB tool, weaker for strategic acquirer multiples.

### Low

- **Documentation** (roadmap, security notes, audits) improves diligence readiness vs typical solo repos.

## Evidence reviewed

- `README.md` (project), `docs/reference/roadmap.md`
- `docs/security/security-notes.md`
- `docs/audits/README.md` — audit cadence
- `app/lib/plans.ts`, billing-related APIs (existence)
- Prior audit synthesis references (conceptual)

## Risk & impact assessment

For **fundraising or sale**, buyers will weight **revenue quality** orders of magnitude above replacement cost. This report’s figure is **indicative** for internal planning and **not** investment advice.

## Recommendations (prioritized)

1. Track and document **MRR, plan mix, and churn** in a finance source of truth (even a spreadsheet) for future valuation passes.
2. Ship roadmap items that increase **retention** (e.g. benchmarking v2 trust, single-property dashboard improvements).
3. Maintain audit cadence pre-fundraise to reduce diligence friction.

## Task candidates (optional)

- [ ] Prepare a one-page **metrics snapshot** (users, MRR, costs) for next business audit (manual, outside repo if preferred).

## Re-test checklist

- [ ] Re-run valuation audit after **6–12 months** or any **pricing/packaging** overhaul.

## Next trigger and cadence

- Trigger: quarterly or pricing/strategy change
- Recommended next run: 2026-06-28
