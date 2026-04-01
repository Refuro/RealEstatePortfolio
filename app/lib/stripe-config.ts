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

export type BillingCycle = "monthly" | "yearly";

/** Price IDs for subscription plans (user creates products in Stripe dashboard). */
export function getPriceIds(): {
  investorMonthly: string | null;
  investorYearly: string | null;
  proMonthly: string | null;
  proYearly: string | null;
} {
  return {
    investorMonthly: process.env.STRIPE_PRICE_ID_INVESTOR_MONTHLY ?? null,
    investorYearly: process.env.STRIPE_PRICE_ID_INVESTOR_YEARLY ?? null,
    proMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY ?? null,
    proYearly: process.env.STRIPE_PRICE_ID_PRO_YEARLY ?? null,
  };
}

/** Get price ID for a plan and billing cycle. */
export function getPriceIdForPlan(
  plan: "investor" | "pro",
  billingCycle: BillingCycle
): string | null {
  const ids = getPriceIds();
  if (billingCycle === "yearly") {
    return plan === "investor" ? ids.investorYearly : ids.proYearly;
  }
  return plan === "investor" ? ids.investorMonthly : ids.proMonthly;
}

/** Plan tier from Stripe price ID (for webhook sync). */
export function planTierFromPriceId(priceId: string): "investor" | "pro" | null {
  const ids = getPriceIds();
  if (priceId === ids.investorMonthly || priceId === ids.investorYearly) return "investor";
  if (priceId === ids.proMonthly || priceId === ids.proYearly) return "pro";
  return null;
}

/** Billing interval (monthly/yearly) from Stripe price ID. */
export function billingIntervalFromPriceId(priceId: string): "monthly" | "yearly" | null {
  const ids = getPriceIds();
  if (priceId === ids.investorMonthly || priceId === ids.proMonthly) return "monthly";
  if (priceId === ids.investorYearly || priceId === ids.proYearly) return "yearly";
  return null;
}

/**
 * Parse billing interval from a stored planName like "investor_monthly" or "pro_yearly".
 * Old rows that only stored the tier name ("investor", "pro") return null.
 */
export function parsePlanNameInterval(planName: string | null | undefined): "monthly" | "yearly" | null {
  if (!planName) return null;
  if (planName.endsWith("_yearly")) return "yearly";
  if (planName.endsWith("_monthly")) return "monthly";
  return null;
}
