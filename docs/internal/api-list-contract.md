# API list endpoints — plan limits vs UI

**Purpose:** Explain intentional behavior for `GET /api/properties`, `GET /api/deals`, portfolio rollups, and exports.

## Summary

| Surface | Behavior |
|---------|----------|
| **`GET /api/portfolio/summary`** | Portfolio metrics are computed from the **latest N properties** by `updatedAt` (`N` = plan property limit). Response JSON includes a **`slice`** object: `propertyCountTotal`, `propertyCountIncluded`, `propertyLimit`, `truncated` (true when total rows in DB exceed the included slice). |
| **`GET /api/export/portfolio`** | Same **N** properties as summary (recency slice). CSV body is unchanged; **HTTP response headers** repeat the denominator: `X-Veld-Property-Count-Total`, `X-Veld-Property-Count-Included`, `X-Veld-Property-Limit`, `X-Veld-Property-Slice-Truncated` (`true`/`false`). |
| **Dashboard / properties list UI** | Uses the same cap pattern in server components where applicable. |
| **`GET /api/properties`** | Returns **all** properties for the authenticated user (full list). UI list views apply tier limits in the app layer where applicable. |
| **`GET /api/deals`** | Returns **all** saved deals as a JSON **array** (no truncation). **HTTP headers:** `X-Veld-Deal-Count-Total` (equals array length), `X-Veld-Plan-Deal-Limit`, `X-Veld-Deals-Exceeds-Plan-Ui-Cap` (`true` when total deals exceed the plan limit for the tier — the Deals **page** may show only the latest N with messaging). |
| **`GET /api/deals/[id]`** | Returns one deal (with embedded `metrics`) plus **`portfolioContext`**: portfolio snapshot (weighted cap, portfolio cash-on-cash, DSCR, total monthly cash flow, property counts) using the same rollup rules as **`GET /api/portfolio/summary`**, for compare-to-portfolio UI on Analyze. |
| **`GET /api/export/portfolio-summary`** | Same aggregates as **`GET /api/portfolio/summary`**, with hourly **rate limiting** (`export:portfolio_summary`) for print/export flows. |

## Rationale

- Full property/deal lists support **integrations**, **debugging**, and **future features** without silently truncating data at the API.
- **Rollups** (summary, export) intentionally use a **bounded slice** so aggregates stay fast and aligned with plan semantics; **metadata** makes the denominator explicit.
- **Gating** for plan tiers remains on **create** routes (`POST /api/properties`, `POST /api/deals`) and on **product surfaces** that display capped collections.

## Client expectations

Integrators must not assume the JSON array length on `GET /api/properties` or `GET /api/deals` equals “rows used for portfolio rollup.” For summary/export, read **`slice`** or the **`X-Veld-*`** headers. Use plan metadata from `/api/me` or tier from billing if building external tools.
