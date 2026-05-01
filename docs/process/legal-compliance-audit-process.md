# Legal & Compliance Audit Process

**Purpose:** Perform a practical AI-assisted review for obvious app-facing legal/compliance gaps in product copy, consent flows, disclosures, and customer-facing commitments.
**Status:** Active.

**Important disclaimer:** This audit is a product and documentation review aid only. It is **not legal advice**, **not a substitute for licensed counsel**, and **not a guarantee of compliance** in any jurisdiction. Use it to catch obvious issues early, then escalate meaningful legal decisions to a qualified attorney.

**Cursor rule:** [`.cursor/rules/legal-compliance-audit-agent.mdc`](../../.cursor/rules/legal-compliance-audit-agent.mdc) — see [Audits README § Running audits](../audits/README.md#running-audits).

---

## 1. Scope

Audit obvious app-facing legal/compliance surfaces and their supporting docs, including:

- Privacy policy and cookie/analytics disclosures
- Terms of service and billing-related commitments
- Marketing claims, pricing language, and user-facing promises that could create avoidable risk
- Consent/runtime alignment for analytics, ads, cookies, and contact flows
- Support/contact/account-deletion communication where expectations should be explicit
- Documentation that describes these behaviors

This lane focuses on **obvious product-facing issues** that an AI review can flag responsibly.

### Exclusions

Do **not** present this lane as:

- a substitute for counsel
- exhaustive legal research
- jurisdiction-by-jurisdiction legal advice
- tax, securities, fair-housing, landlord-tenant, or corporate law advice
- a final approval for launch readiness

When in doubt, recommend human legal review instead of overclaiming certainty.

---

## 2. Audit dimensions

- **Disclosure alignment:** privacy/terms/cookie language matches actual runtime behavior
- **Consent expectations:** optional analytics/ads/cookies are described clearly and gated as documented
- **Billing and plan clarity:** pricing pages, terms, and billing docs avoid misleading claims
- **User-facing commitments:** support, exports, data handling, and account actions are not oversold or contradictory
- **Launch-risk issues:** any obvious missing disclaimer, stale legal text, or copy that should be reviewed by counsel

---

## 3. Output

Write report to:

- `docs/audits/legal-compliance/YYYY-MM-DD-legal-compliance-audit.md`

Use the shared report template in `docs/process/audit-report-template.md`.

The report should explicitly repeat the disclaimer that findings are a practical screening pass, not legal advice.

---

## 4. Execution

1. Read the relevant app-facing legal/compliance docs first.
2. Compare those docs against current app behavior and public-facing copy.
3. Flag obvious inconsistencies, omissions, or risky claims.
4. Mark anything that needs human legal review instead of asserting certainty.
5. Keep recommendations practical and scoped to this app.
6. Audit only; do not make code changes.

---

## 5. References

- `app/app/privacy/page.tsx`
- `app/app/terms/page.tsx`
- `app/app/pricing/page.tsx`
- `docs/launch/analytics.md`
- `docs/setup/manual-steps.md`
- `docs/security/security-notes.md`
