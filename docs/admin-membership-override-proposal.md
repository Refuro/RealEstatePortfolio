# Admin Membership Override — Implementation Proposal

**Status:** Proposal  
**Last updated:** March 2025

---

## 1. Purpose

Allow admins to manually set a user's subscription tier (free, investor, pro) independent of Stripe. Use cases:

- **Demo accounts** — Give Pro access for sales demos without payment
- **Partners / realtors** — Complimentary access for referral partners
- **Goodwill** — Restore access for users with billing issues
- **Testing** — Verify plan limits without Stripe test mode

---

## 2. Current System

### How tier is determined today

| Source | When | What it does |
|--------|------|--------------|
| **Stripe webhook** | `customer.subscription.created/updated/deleted` | Updates `User.subscriptionTier` from price ID (investor/pro) or sets `free` on cancel |
| **Billing sync** | App load when user has `stripeCustomerId` and tier ≠ free | Checks Stripe; if no active subscription, downgrades to `free` |
| **Default** | New user | `subscriptionTier: "free"` |

### Where `subscriptionTier` is used

| Consumer | Usage |
|----------|-------|
| `lib/plans.ts` | `getPropertyLimit`, `getDealLimit`, `getRentCastHourlyLimit` |
| Dashboard, properties, layout | Property limit, deal limit |
| Settings | Display plan, limits |
| API: properties, deals, import, export, portfolio | Limit checks |
| API: estimates/rent, estimates/value, benchmark/refresh | RentCast rate limit |
| API: billing/sync | Downgrade logic |
| API: me | Returns tier to client |
| App layout client | Upgrade banner (free tier) |

All consumers read `user.subscriptionTier` directly. There is no override today.

---

## 3. Recommended Approach: Override Field

### Schema change

Add a nullable override field to `User`:

```prisma
model User {
  // ... existing fields
  subscriptionTier       String    @default("free")  // Stripe-derived
  subscriptionTierOverride String?  // When set, overrides Stripe; null = use subscriptionTier
  // ...
}
```

**Effective tier** = `subscriptionTierOverride ?? subscriptionTier`

- When **null**: Stripe (and webhook/sync) control the tier.
- When **set**: Admin override wins; Stripe events do not change the user's effective tier.

### Why this design

1. **Stripe remains source of truth for paid users** — Webhook and sync continue to update `subscriptionTier`. Override is an optional layer on top.
2. **Override is explicit** — Admins set it; admins clear it. No automatic overwriting.
3. **Billing sync respects override** — If override is set, sync skips downgrade logic.
4. **Single source for "effective tier"** — One helper used everywhere.

---

## 4. Implementation Details

### 4.1 Helper: `getEffectiveTier`

**Location:** `lib/plans.ts` (or new `lib/tier-utils.ts`)

```ts
export function getEffectiveTier(user: {
  subscriptionTier: string | null;
  subscriptionTierOverride?: string | null;
}): string {
  const override = user.subscriptionTierOverride?.trim().toLowerCase();
  if (override && ["free", "investor", "pro"].includes(override)) {
    return override;
  }
  return (user.subscriptionTier ?? "free").toLowerCase();
}
```

All tier-dependent logic uses `getEffectiveTier(user)` instead of `user.subscriptionTier ?? "free"`.

### 4.2 Consumers to update

| File | Change |
|------|--------|
| `app/(app)/dashboard/page.tsx` | `getPropertyLimit(getEffectiveTier(user))` |
| `app/(app)/properties/page.tsx` | Same |
| `app/(app)/layout.tsx` | Same for limits; pass `getEffectiveTier(user)` for banner |
| `app/(app)/settings/page.tsx` | Display and limits use effective tier |
| `app/(app)/deals/page.tsx` | `getDealLimit(getEffectiveTier(user))` |
| `app/(app)/analyze/page.tsx` | Same |
| `app/(app)/plans/page.tsx` | `currentTier={getEffectiveTier(user)}` |
| `app/(app)/app-layout-client.tsx` | Banner uses effective tier |
| `app/api/properties/route.ts` | `canAddProperty(getEffectiveTier(user), ...)` |
| `app/api/deals/route.ts` | `canAddDeal(getEffectiveTier(user), ...)` |
| `app/api/estimates/rent/route.ts` | `getRentCastHourlyLimit(getEffectiveTier(user))` |
| `app/api/estimates/value/route.ts` | Same |
| `app/api/properties/[id]/benchmark/refresh/route.ts` | Same |
| `app/api/import/portfolio/route.ts` | `getPropertyLimit(getEffectiveTier(user))` |
| `app/api/export/portfolio/route.ts` | Same |
| `app/api/portfolio/summary/route.ts` | Same |
| `app/api/billing/sync/route.ts` | **Special:** if override set, return early; do not downgrade |
| `app/api/billing/status/route.ts` | Return effective tier |
| `app/api/me/route.ts` | Return effective tier |

### 4.3 Billing sync behavior

**Current:** If user has `stripeCustomerId` and tier ≠ free, check Stripe; if no active sub, downgrade to free.

**New:** If `subscriptionTierOverride` is set, return immediately without downgrading. Override users keep their tier regardless of Stripe.

```ts
// In billing/sync/route.ts
if (user.subscriptionTierOverride) {
  return NextResponse.json({ synced: false, tier: getEffectiveTier(user) });
}
```

### 4.4 Stripe webhook behavior

**No change.** Webhook continues to update `subscriptionTier` only. It does not touch `subscriptionTierOverride`. When override is set, the user's effective tier stays as set by the admin. When override is cleared, the next Stripe state (or sync) applies.

---

## 5. Admin UI

### 5.1 Users table enhancement

In the existing "Users (recent 50)" table:

- Add a **Tier** column that shows the **effective** tier.
- Add an **Override** column or control: dropdown or "Set tier" button.

**Options:**

- **A) Inline dropdown** — Each row has a `<select>` with: Free, Investor, Pro, — (clear override). On change, call API.
- **B) "Set tier" link** — Opens a small modal or inline form to pick tier and optionally clear override.

Recommendation: **Inline dropdown** — Fastest for admins, minimal clicks.

### 5.2 API endpoint

```
PATCH /api/admin/users/[id]/tier
Body: { tier: "free" | "investor" | "pro" | null }
```

- `tier: "free" | "investor" | "pro"` → set `subscriptionTierOverride` to that value.
- `tier: null` → clear override (`subscriptionTierOverride = null`).

**Auth:** Admin only (`isAdmin(user)`).

**Validation:** `tier` must be one of `"free"`, `"investor"`, `"pro"`, or `null`.

### 5.3 Display in admin table

| Email | Plan (effective) | Override | Properties | Last active |
|-------|------------------|----------|------------|-------------|
| user@example.com | Pro | Pro ✓ | 12 | ... |
| demo@example.com | Investor | — | 2 | ... |

- **Plan:** Effective tier (what the user actually has).
- **Override:** Shows the override value if set, or "—" if none. Makes it clear who has admin-set access.

---

## 6. User-facing behavior

### Settings page

- Shows **effective** tier (e.g. "Pro").
- No need to expose "override" to the user.
- Optional: If override is set, show a subtle "Courtesy upgrade" or similar. Can be deferred.

### Billing / Stripe

- Override users: No Stripe subscription required. "Change plan" / billing portal can still be shown; they can subscribe later. When they do, webhook will set `subscriptionTier`; if override is cleared, Stripe takes over.
- When admin clears override: User falls back to `subscriptionTier` (from Stripe or default free).

---

## 7. Edge cases

| Scenario | Behavior |
|----------|----------|
| Admin sets override to Pro | User gets Pro limits immediately. Stripe events do not change effective tier. |
| Admin clears override | Effective tier = `subscriptionTier` (Stripe or free). |
| User with override subscribes via Stripe | Webhook updates `subscriptionTier`. Override still wins until admin clears it. |
| Billing sync for override user | Skips downgrade; returns effective tier. |
| User has override Pro, admin sets to Investor | Override updated; effective tier = Investor. |
| Admin sets override to invalid value | API rejects; only "free", "investor", "pro", null allowed. |

---

## 8. Migration

```sql
ALTER TABLE "User" ADD COLUMN "subscriptionTierOverride" TEXT;
```

Default `null`; no backfill needed.

---

## 9. Summary

| Component | Change |
|-----------|--------|
| **Schema** | Add `subscriptionTierOverride String?` to User |
| **Lib** | Add `getEffectiveTier(user)` |
| **Consumers** | Use `getEffectiveTier(user)` instead of `user.subscriptionTier` |
| **Billing sync** | Skip downgrade when override is set |
| **Admin page** | Add tier dropdown + Override column to users table |
| **API** | Add `PATCH /api/admin/users/[id]/tier` |

**Effort:** Low. Small schema change, one helper, ~20 call-site updates, one new API route, admin UI changes.

---

## 10. References

- `lib/plans.ts` — Plan limits
- `app/(app)/admin/page.tsx` — Admin dashboard
- `app/api/billing/webhook/route.ts` — Stripe → DB sync
- `app/api/billing/sync/route.ts` — Client-triggered sync
- `prisma/schema.prisma` — User model
