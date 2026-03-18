# Benchmarking Proposal: Rent vs Market

**Status:** Proposal (not yet implemented)  
**Last updated:** March 2025

---

## 1. Overview

Add "Your rent is X% above/below market" for each property. Uses RentCast rent API (same as "Estimate rent"). This doc covers API efficiency, caching strategy, scaling, and batch support research.

---

## 2. Core Strategy: Reuse Estimate Rent

**Key insight:** When a user clicks "Estimate rent," we already get market rent from RentCast. Store it and use it for benchmarking — zero extra API calls for that flow.

| Trigger | API call? | Notes |
|---------|-----------|-------|
| User clicks **"Estimate rent"** | Yes (1) | Store result in `marketRent` + `marketRentAsOf`. Use for both rent suggestion and benchmark. No extra call. |
| User clicks **"Refresh benchmark"** | Yes (1) | Only when cache is missing or stale. |
| User views property / dashboard | No | Always read from cache. If no cache, show "Refresh benchmark" instead of auto-fetching. |
| Background / cron | No | No automatic refreshes. |

---

## 3. Data Model

Add to `Property`:

```
marketRent        Decimal?   @db.Decimal(12, 2)   // RentCast market rent
marketRentAsOf    DateTime?  @db.Date            // When we last fetched
```

---

## 4. Cache TTL

| TTL | Pros | Cons |
|-----|------|------|
| 30 days | Fresher data | ~2× more refreshes |
| **60 days** | Good balance | **Recommended** |
| 90 days | Fewest calls | Data can feel stale |

**Recommendation:** 60 days. Market rent doesn't change that fast.

---

## 5. Display Rules

| State | UI |
|-------|-----|
| Cache hit (≤ 60 days) | Show "Rent: $2,195 · Market: $2,350 (+7%)" or "12% below market" |
| Cache miss | Show "Refresh benchmark" button (no auto-fetch) |
| Cache stale (> 60 days) | Show last benchmark + "Updated 65 days ago · Refresh" |
| API error | "Benchmark unavailable" |

---

## 6. Plan Gating (Optional)

| Plan | Behavior |
|------|----------|
| **Free** | Benchmark only when user clicks "Refresh benchmark" (no auto-population from Estimate rent). |
| **Investor / Pro** | "Estimate rent" auto-populates benchmark; 60-day cache; "Refresh benchmark" available. |

---

## 7. Call Volume Model

**Formula:**

```
Calls/month ≈ (users × 1) + (properties × 0.15)
```

| Users | Properties | Est. calls/month |
|-------|------------|------------------|
| 20 | 60 | ~29 |
| 50 | 150 | ~73 |
| 100 | 300 | ~145 |
| 200 | 600 | ~290 |
| 500 | 1,500 | ~725 |

**RentCast tiers:**

| Tier | Price | Included calls | Approx. supported users (3 props each) |
|------|--------|----------------|----------------------------------------|
| Developer | $0 | 50 | ~15–20 |
| Foundation | $74 | 1,000 | ~300–400 |
| Growth | $199 | 5,000 | ~1,500+ |

---

## 8. Scaling vs Rent Gap Email

| Aspect | Rent gap email | Benchmarking (this proposal) |
|--------|----------------|------------------------------|
| Trigger | Proactive, per user | On-demand (Estimate rent + Refresh) |
| Calls | 1 per property per email cycle | ~0.15 per property per month |
| Cost growth | Linear with users × properties | Same formula, but ~6× fewer calls |
| Control | Hard to cap | Easy to cap via on-demand only |

---

## 9. RentCast Batch Support

**Research (March 2025):**

- **AVM endpoints (rent/value):** Per-address only. `GET https://api.rentcast.io/v1/avm/rent/long-term` returns one estimate per request. No batch endpoint documented.
- **Search endpoints:** `/properties` and `/listings` support pagination and multi-value query params (e.g. pipe-separated filters) for *searching* — not for batch valuation.
- **Conclusion:** RentCast does **not** offer a batch endpoint for rent estimates. Each property = 1 API call.

**If batch were added later:**

- RentCast could introduce a batch endpoint (e.g. `POST /v1/avm/rent/batch` with array of addresses).
- **Impact:** "Refresh all benchmarks" could become 1 call instead of N. Stale refresh would drop from ~(properties × 0.15) to ~(users × 1) per month.
- **Action:** Monitor RentCast changelog; contact support to ask about batch roadmap. No change to current proposal — implementation stays 1 call per property.

---

## 10. Implementation Checklist

1. **Schema:** Add `marketRent`, `marketRentAsOf` to `Property`. Migration.
2. **Estimate rent API:** On success, write `marketRent` and `marketRentAsOf` to the property.
3. **Benchmark API:** New endpoint `GET /api/properties/[id]/benchmark` — returns cached benchmark if fresh; does not auto-fetch.
4. **Refresh endpoint:** `POST /api/properties/[id]/benchmark/refresh` — fetches from RentCast, updates cache, returns benchmark.
5. **UI:** Property detail + dashboard show benchmark when cache exists; "Refresh benchmark" when missing or stale.
6. **Plan gating:** Apply Free vs paid behavior as above.

---

## 11. Future Optimizations

- **Zip-level fallback:** If RentCast has zip-level market data, use for rough benchmark without per-address call.
- **Batch refresh:** If RentCast adds batch support, refresh multiple properties in one request.
- **Smarter TTL:** Longer TTL for stable markets, shorter for volatile (if data exists).

---

## 12. References

- [RentCast API](https://developers.rentcast.io/reference)
- [Rent Estimate endpoint](https://developers.rentcast.io/reference/rent-estimate-long-term)
- [RentCast API pricing](https://www.rentcast.io/api)
- [Rent gap email](docs/roadmap.md) — deferred due to cost scaling
