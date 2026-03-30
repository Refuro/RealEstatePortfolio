/**
 * Required environment variables for the app to run.
 * Validated at first use (when db is imported).
 * See .env.example and docs/setup/manual-steps.md for setup.
 */
// STRIPE_WEBHOOK_SECRET: required with STRIPE_SECRET_KEY; webhook verifies signatures.
const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
] as const;

export function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter(
    (k) => !process.env[k] || !String(process.env[k]).trim()
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        `See .env.example and docs/setup/manual-steps.md for setup.`
    );
  }
}

/**
 * Vercel sets VERCEL=1 on build and runtime. Stripe webhooks must verify signatures;
 * fail fast so deploys cannot ship without STRIPE_WEBHOOK_SECRET.
 */
export function assertStripeWebhookSecretForVercelDeploy(): void {
  if (process.env.VERCEL !== "1") return;
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "STRIPE_WEBHOOK_SECRET is required on Vercel (Stripe webhook signature verification). " +
        "Add it in Vercel Project → Settings → Environment Variables. " +
        "See app/.env.example and docs/setup/manual-steps.md (Billing / Stripe)."
    );
  }
}
