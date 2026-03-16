# Plaid Integration — Considerations for Future Phase

This doc captures cost, legal, and development considerations for adding Plaid (bank/lender connection) to the Real Estate Portfolio app. **Status: Deferred.** See `docs/architecture-and-build-practices.md` §5.1.

---

## What Plaid Would Enable

### Liabilities API (mortgage balance)

- Connect user's mortgage lender account via Plaid Link
- Pull **principal balance**, escrow balance, payment details
- Data refreshes ~daily
- Enables automatic mortgage balance updates → equity/LTV stay accurate without user action

### Transactions API (optional, broader scope)

- Pull bank transactions (rent deposits, mortgage payments, expenses)
- Would enable *actual* vs *projected* cash flow
- Requires transaction categorization (rent vs mortgage vs maintenance)
- Scope creep into bookkeeping — architecture doc defers this

**Recommendation:** If we add Plaid, start with **Liabilities only** (mortgage balance). Transactions is a larger lift and changes product positioning.

---

## Cost

### Plaid pricing (not publicly disclosed)

Plaid uses multiple models: one-time, subscription, per-request. Exact numbers require contacting Plaid Sales or applying for Production access.

**Typical ranges (from industry sources):**

- **Pay as You Go:** No minimum; per-connection or per-call. Best for early stage.
- **Growth:** Minimum spend, annual commitment; discounted rates. ~$6K/month API usage cited for "small-to-medium."
- **Custom:** $2K+/month; lowest per-use. Enterprise.

**Per-account estimates (ballpark):**

- Auth/Balance: often $0.30–$1.00+ per connected account per month (varies by product and volume)
- Liabilities (mortgage): typically bundled or similar to Balance product
- Transactions: additional; often subscription-style per account

**For our app (1–20 properties, small user base):**

- Assume 1–2 mortgage connections per user
- At 100 users, 150 connections: ~$45–$150/month (rough)
- At 1,000 users: ~$450–$1,500/month
- Cost scales with connected accounts, not properties

**Takeaway:** Plaid cost is meaningful at scale. Revisit when user base and revenue justify it (e.g. 500+ paying users, or when "connect mortgage" becomes a key differentiator).

---

## Legal & Compliance

### Data handling

- **Plaid's role:** Plaid is the intermediary. User authenticates with their lender via Plaid Link; Plaid returns data to your app. Plaid handles the bank credential flow.
- **Your responsibility:** You receive and store financial data (balance, possibly transactions). You must handle it securely.

### Key considerations

1. **Privacy policy & terms**
   - Disclose that you access financial data via Plaid
   - Explain what data you collect, how you use it, how long you retain it
   - Plaid requires specific disclosures in your privacy policy

2. **Data security**
   - Encrypt data at rest and in transit
   - Limit access (RBAC)
   - Audit logging for access to financial data
   - Secure storage of Plaid access tokens (never expose to client)

3. **GLBA (Gramm-Leach-Bliley Act)**
   - Applies to financial institutions. Plaid is the connector; you're not a bank.
   - If you're only displaying data (not lending, not holding funds), your exposure is lower
   - Best practice: treat financial data as sensitive; document handling

4. **Plaid agreement**
   - Plaid has a partner agreement and acceptable use policy
   - Must comply with their terms (e.g. no reselling raw data, proper consent flows)

5. **State regulations**
   - Varies by state. No specific real estate portfolio software license in most states, but financial data handling may trigger review in some jurisdictions

**Takeaway:** Not as heavy as building a lender, but non-trivial. Budget for privacy policy updates, security review, and Plaid compliance. Consider legal counsel before launch if you store financial data.

---

## Development Effort

### Core integration (Liabilities for mortgage balance)

**Rough timeline:**

- **Basic integration:** 2–4 weeks (Link, Auth, Liabilities fetch, balance display)
- **Production-ready:** +2–4 weeks (webhooks, error handling, reconnection flows, monitoring)
- **Full migration:** +2–4 months if migrating existing users to new OAuth/API (Plaid has evolved; legacy connections may need refresh)

**Components:**

1. **Plaid Link (frontend)**
   - Add Plaid Link SDK
   - "Connect mortgage account" flow in Settings or mortgage section
   - Product: `liabilities`; account type filter for mortgage/loan
   - Exchange public_token for access_token on backend

2. **Backend**
   - `POST /api/plaid/link-token` — create link_token for user
   - `POST /api/plaid/exchange` — exchange public_token, store access_token
   - `POST /api/plaid/refresh-balance` or cron — call `/liabilities/get`, update Mortgage.currentBalance
   - Webhook handler for `PENDING_EXPIRATION`, `ITEM_LOGIN_REQUIRED` (reconnection)

3. **Data model**
   - Store `plaidItemId`, `plaidAccessToken` (encrypted) per mortgage or per user
   - Map Plaid mortgage account → Mortgage record (by property address or user selection)

4. **Edge cases**
   - Lender not supported by Plaid
   - Connection fails (MFA, captcha, etc.)
   - Account removed by user
   - Token expiration (Plaid sends webhooks; need re-link flow)

5. **Security**
   - Never expose access_token to client
   - Encrypt tokens at rest
   - Rotate/revoke on user delete

### If adding Transactions (later)

- Additional 4–8 weeks
- Categorization logic (rent vs mortgage vs maintenance)
- Reconciliation UI
- Shifts product toward property management / bookkeeping

**Takeaway:** Liabilities-only is a moderate lift (4–8 weeks for production-ready). Not trivial; bank connectivity has real variability. Budget for fallback (manual balance) when Plaid fails.

---

## Recommendation Summary

| Phase | Approach | When |
|-------|----------|------|
| **Now** | Amortization projection + manual override | Implement per tasks.md |
| **Later** | Plaid Liabilities (mortgage balance only) | When 500+ users or revenue justifies ~$500+/mo |
| **Optional** | Plaid Transactions | Only if we pivot toward actual vs projected cash flow |

**Decision:** Keep Plaid deferred. Implement mortgage balance advancement (Phase 1) first. Revisit Plaid when user base and unit economics support it.
