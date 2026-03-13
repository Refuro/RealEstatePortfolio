/**
 * Stripe config: server-side client and price IDs from env.
 * Do not create real Stripe keys in code; user sets env per manual-steps.
 */

import Stripe from "stripe";

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  return key;
}

export function getStripe(): Stripe {
  return new Stripe(getSecretKey(), { typescript: true });
}

export function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
  return secret;
}

/** Price IDs for subscription plans (user creates products in Stripe dashboard). */
export function getPriceIds(): {
  investor: string | null;
  pro: string | null;
} {
  return {
    investor: process.env.STRIPE_PRICE_ID_INVESTOR ?? null,
    pro: process.env.STRIPE_PRICE_ID_PRO ?? null,
  };
}

/** Plan tier from Stripe price ID (for webhook sync). */
export function planTierFromPriceId(priceId: string): "investor" | "pro" | null {
  const { investor, pro } = getPriceIds();
  if (priceId === investor) return "investor";
  if (priceId === pro) return "pro";
  return null;
}
