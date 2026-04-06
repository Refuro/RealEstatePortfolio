import * as crypto from "crypto";
import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";

export interface OnboardingEmailResult {
  success: boolean;
  id?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://veldportfolio.com"
  );
}

// ---------------------------------------------------------------------------
// Email copy
// ---------------------------------------------------------------------------

export const day3Email = {
  subject: "Your Veld dashboard is ready",
  buildText: (unsubscribeUrl: string, baseUrl: string) =>
    `You signed up for Veld Portfolio but haven't added a property yet.

Add one in under 5 minutes and start tracking equity, cash flow, and cap rate:
${baseUrl}/properties/new?mode=quick

—
Veld Portfolio
Unsubscribe: ${unsubscribeUrl}`.trim(),
};

export const day7Email = {
  subject: "Still tracking properties in a spreadsheet?",
  buildText: (unsubscribeUrl: string, baseUrl: string) =>
    `You're one property away from seeing your real estate portfolio in real time.

Add your first property:
${baseUrl}/properties/new?mode=quick

—
Veld Portfolio
Unsubscribe: ${unsubscribeUrl}`.trim(),
};

// ---------------------------------------------------------------------------
// Unsubscribe token helpers
// ---------------------------------------------------------------------------

function getUnsubscribeSecret(): string {
  const secret =
    process.env.UNSUBSCRIBE_HMAC_SECRET || process.env.CRON_SECRET;
  if (!secret) throw new Error("UNSUBSCRIBE_HMAC_SECRET (or CRON_SECRET fallback) is not set");
  return secret;
}

export function buildUnsubscribeToken(userId: string): string {
  const secret = getUnsubscribeSecret();
  return crypto.createHmac("sha256", secret).update(userId).digest("hex");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = buildUnsubscribeToken(userId);
  const expectedBuf = Buffer.from(expected);
  const tokenBuf = Buffer.from(token);
  if (expectedBuf.length !== tokenBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, tokenBuf);
}

export function buildUnsubscribeUrl(userId: string): string {
  const token = buildUnsubscribeToken(userId);
  const base = getAppBaseUrl();
  return `${base}/api/unsubscribe?userId=${encodeURIComponent(userId)}&token=${token}`;
}

// ---------------------------------------------------------------------------
// Send helper
// ---------------------------------------------------------------------------

export async function sendOnboardingEmail(
  to: string,
  userId: string,
  variant: "day3" | "day7"
): Promise<OnboardingEmailResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    console.warn("RESEND_API_KEY not set — skipping onboarding email");
    return { success: false };
  }

  const fromDomain = process.env.RESEND_FROM_DOMAIN?.trim();
  const from = fromDomain
    ? `Veld Portfolio <noreply@${fromDomain}>`
    : "Veld Portfolio <onboarding@resend.dev>";

  const unsubscribeUrl = buildUnsubscribeUrl(userId);
  const baseUrl = getAppBaseUrl();
  const template = variant === "day3" ? day3Email : day7Email;
  const text = template.buildText(unsubscribeUrl, baseUrl);

  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: template.subject,
    text,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) {
    console.error("Resend onboarding email error:", error);
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
      { tags: { area: "onboarding_email", variant } }
    );
    return { success: false };
  }

  return { success: true, id: data?.id };
}
