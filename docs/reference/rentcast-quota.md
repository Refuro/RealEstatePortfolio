# RentCast hourly quota

## Model

- **One shared pool per user:** Each successful upstream RentCast call inserts one `RentCastApiCall` row. The hourly limit (`RENTCAST_HOURLY_LIMITS` in `app/lib/plans.ts`, applied via `getRentCastHourlyLimit`) counts **all** such rows in the last hour — there is no separate counter for “rent vs value” endpoints.
- **Routes that consume quota:** `GET /api/estimates/rent`, `GET /api/estimates/value`, `POST /api/properties/[id]/benchmark/refresh`, and `POST /api/properties/[id]/data-freshness/refresh` (after each successful provider response; may perform one or two upstream calls when both value and benchmark need refresh).
- **Failed calls:** Do not insert `RentCastApiCall` and do not count toward the hourly cap.

## User-facing limits

Plan tiers define numeric caps only; this doc is for implementers. No separate user-facing split between rent and value quotas — behavior is “N successful RentCast calls per hour total.”

## API and UI

- **GET `/api/rentcast-quota`** (authenticated) — Returns `{ limit, used, remaining }` for the rolling hour, same counting rules as estimate routes. Used by `RentCastQuotaHint` near estimate and benchmark refresh actions.
- **Component:** `app/components/rentcast-quota-hint.tsx` — Shows remaining uses before hard 429; copy states the shared pool (rent, value, benchmark refresh).
