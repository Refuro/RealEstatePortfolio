# Confirming Stripe webhooks in production

**Goal:** Verify the live endpoint `POST https://<your-domain>/api/billing/webhook` receives and successfully processes Stripe events.

## 1. Stripe Dashboard (fastest)

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Developers** → **Webhooks**.
2. Open the endpoint that points to your production URL (path `/api/billing/webhook`).
3. Check **Recent deliveries** (or **Events** → filter by endpoint):
   - **200** responses = signature verified and handler ran (see your server logs if something still fails after 200).
   - **4xx** on signature = wrong `STRIPE_WEBHOOK_SECRET` or wrong endpoint URL/body.
4. Optional: **Send test webhook** from the endpoint detail page (e.g. `customer.subscription.updated`) and confirm a new row appears with **200**.

## 2. Real traffic

After a real checkout or subscription change in production, open the same **Recent deliveries** list and confirm an event fired within seconds.

## 3. App-side signals

- User `subscriptionTier` / `Subscription` row updates after checkout (and webhook runs).
- Sentry: no unhandled errors from `app/app/api/billing/webhook/route.ts` for valid payloads.

## Related

- Setup: [`docs/setup/manual-steps.md`](../setup/manual-steps.md)
- PostHog idempotency on retries: [`docs/internal/stripe-webhook-posthog-idempotency.md`](stripe-webhook-posthog-idempotency.md)
