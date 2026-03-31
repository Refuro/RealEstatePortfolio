# Effective subscription tier (Stripe vs override)

**Code:** `getEffectiveTier` in `app/lib/plans.ts`.

| Field | Meaning |
|-------|---------|
| `user.subscriptionTier` | Written from **Stripe webhook** when subscription changes (`syncSubscriptionToDb`). |
| `user.subscriptionTierOverride` | Admin or support override; when set to `free` \| `investor` \| `pro`, **effective** tier for limits uses override. |

**Analytics:** Events that only read `subscriptionTier` from the database may **not** match what the user sees in the UI if an override is active. Prefer `getEffectiveTier(user)` when attributing behavior by tier in new server or client code.

**See also:** `docs/internal/billing-matrix.md`
