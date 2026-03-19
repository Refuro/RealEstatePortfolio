/**
 * Required environment variables for the app to run.
 * Validated at first use (when db is imported).
 * See .env.example and docs/setup/manual-steps.md for setup.
 */
const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "CLERK_SECRET_KEY",
  "STRIPE_SECRET_KEY",
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
