# Vitest coverage vs Route Handlers inventory

Generated as an onboarding artifact for comparing **API Route Handler** surface area with **co-located `route.test.ts`** files and overall **`*.test.{ts,tsx}`** counts under [`app/`](../../app/).

See also [Test infrastructure review](../qa/test-infrastructure-review.md) and [Testing hardening proposal](../qa/testing-hardening-proposal.md).

---

## Summary (counts under `app/` excluding `node_modules`)

_Snapshot verified 2026-04-30 — re-run the commands below after adding routes or tests._

| Metric | Count |
|--------|-------|
| **`route.ts`** (Route Handlers + `app/llms.txt/route.ts`) | **50** |
| **`route.test.ts`** (co-located next to a `route.ts`) | **27** |
| Co-located coverage ratio | **54%** of handlers have a sibling route test |
| **`*.test.ts` / `*.test.tsx`** (entire app package) | **86** |

Many handlers without dedicated route tests still benefit from **`lib/`** unit tests (metrics, validations, billing helpers, calculators). Route-level gaps below flag places where regressions would only show up at integration/E2E unless covered indirectly.

---

## Route Handlers **with** co-located `route.test.ts`

These pairs live side-by-side under `app/app/`:

- `api/properties/route.ts`
- `api/properties/[id]/route.ts`
- `api/properties/[id]/metrics/route.ts`
- `api/properties/[id]/mortgage/route.ts`
- `api/properties/[id]/data-freshness/refresh/route.ts`
- `api/export/portfolio/route.ts`
- `api/import/portfolio/route.ts`
- `api/portfolio/summary/route.ts`
- `api/deals/route.ts`
- `api/deals/[id]/route.ts`
- `api/places/autocomplete/route.ts`
- `api/places/details/route.ts`
- `api/billing/webhook/route.ts`
- `api/billing/sync/route.ts`
- `api/billing/create-checkout-session/route.ts`
- `api/billing/portal/route.ts`
- `api/account/delete/route.ts`
- `api/account/delete-permanent/route.ts`
- `api/unsubscribe/route.ts`
- `api/csp-report/route.ts`
- `api/cron/monthly-digest/route.ts`
- `api/cron/monthly-refresh/route.ts`
- `api/cron/onboarding-emails/route.ts`
- `api/cron/trial-emails/route.ts`
- `api/cron/milestone-emails/route.ts`
- `api/cron/winback-emails/route.ts`
- `api/cron/rate-limit-cleanup/route.ts`

---

## Route Handlers **without** co-located `route.test.ts`

These **`route.ts`** files have **no** sibling `route.test.ts` as of the last sweep:

| Path | Notes |
|------|-------|
| `app/api/account/restore/route.ts` | Account lifecycle |
| `app/api/admin/email-preview/route.ts` | Admin |
| `app/api/admin/export/users/route.ts` | Admin export |
| `app/api/admin/resubscribe-self/route.ts` | Admin |
| `app/api/admin/users/[id]/billing-sync/route.ts` | Admin |
| `app/api/admin/users/[id]/tier/route.ts` | Admin |
| `app/api/admin/users/[id]/trial/route.ts` | Admin |
| `app/api/admin/users/[id]/trial-email/route.ts` | Admin |
| `app/api/billing/status/route.ts` | Billing |
| `app/api/billing/subscription-details/route.ts` | Billing |
| `app/api/contact/route.ts` | Public form |
| `app/api/estimates/rent/route.ts` | RentCast estimate |
| `app/api/estimates/value/route.ts` | RentCast estimate |
| `app/api/export/portfolio-summary/route.ts` | Export variant |
| `app/api/health/route.ts` | Liveness |
| `app/api/import/portfolio/template/route.ts` | CSV template download |
| `app/api/me/route.ts` | Current user payload |
| `app/api/onboarding/route.ts` | Onboarding state |
| `app/api/properties/[id]/amortization/route.ts` | Schedule JSON |
| `app/api/properties/[id]/benchmark/refresh/route.ts` | Benchmark refresh |
| `app/api/properties/[id]/mortgage/[mortgageId]/route.ts` | Single-lien ops |
| `app/api/rentcast-quota/route.ts` | Quota UI |
| `app/llms.txt/route.ts` | Static text route |

---

## Non-route Vitest files

The remaining **`86 − 27 = 59`** test files exercise **`lib/`**, **`components/`**, and **`app/(app)/`** modules directly—especially calculators, **`lib/metrics/**`**, validations, billing helpers, insights, import parsers, and selected UI components.

---

## How to refresh these numbers

From the app package root (`RealEstatePortfolio/app/`):

```powershell
$routes = Get-ChildItem -LiteralPath . -Recurse -Filter route.ts -File | Where-Object { $_.FullName -notmatch 'node_modules' }
$tests = Get-ChildItem -LiteralPath . -Recurse -Filter route.test.ts -File | Where-Object { $_.FullName -notmatch 'node_modules' }
$alltests = Get-ChildItem -LiteralPath . -Recurse -Include *.test.ts,*.test.tsx -File |
  Where-Object { $_.FullName -notmatch 'node_modules|\\.next\\' }
```

For each `route.ts`, use **`Test-Path -LiteralPath`** on the sibling `route.test.ts` (paths may contain `[id]` on Windows).
