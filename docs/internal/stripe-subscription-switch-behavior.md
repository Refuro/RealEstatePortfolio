# Plan changes and multiple Stripe subscriptions

## What you observed

When a user **switches** to a different paid plan (e.g. Investor → Pro), **Stripe can show more than one subscription** on the same Customer: the new Checkout session created a **new** subscription instead of replacing the previous one.

## Why this happens (current app behavior)

`POST /api/billing/create-checkout-session` uses:

```ts
stripe.checkout.sessions.create({
  mode: "subscription",
  line_items: [{ price: priceId, quantity: 1 }],
  // ...
});
```

That flow **creates a new subscription** for each successful Checkout. It does **not** pass:

- `subscription` (to update an existing subscription in place), or  
- logic to **cancel** the prior subscription before or after the new one.

Stripe allows **multiple active subscriptions per Customer** unless you explicitly cancel or migrate.

**Billing Portal** plan changes (if users change plan only through Portal) may behave differently depending on Stripe Product/Price setup; in-app **Checkout** from `/plans` is the path above.

## Product / engineering options (decision needed)

1. **Cancel old subscription on successful upgrade/downgrade**  
   After `checkout.session.completed` (or via webhook when new subscription is active), cancel the previous subscription id (requires tracking `stripeSubscriptionId` per user and careful ordering with trials/proration).

2. **Use Checkout to update an existing subscription**  
   Stripe supports passing `subscription` / subscription-update modes so Checkout **replaces** or **updates** line items instead of stacking. Requires mapping current Stripe subscription id into session creation.

3. **Steer plan changes to Billing Portal only**  
   Hide “change plan” Checkout for existing subscribers and use Portal’s **update subscription** UX (still need to confirm Portal is configured for one sub per customer).

4. **Leave as-is for now**  
   Manually clean duplicate subs in Stripe Dashboard; document for support. Not ideal long term (double billing risk if both are active).

## Related code

- `app/app/api/billing/create-checkout-session/route.ts`
- `app/app/api/billing/webhook/route.ts` — subscription lifecycle

When you choose a direction, we can align webhook + DB (`Subscription` table) and add tests.

---

## Chosen direction — Billing Portal (implementation)

**Adopted approach:** Use **Customer Billing Portal** for plan changes; **Checkout** only for Free → first paid. See **[`billing-plan-change-portal-implementation-plan.md`](billing-plan-change-portal-implementation-plan.md)** for tasks, Stripe Dashboard prerequisites, and acceptance criteria.
