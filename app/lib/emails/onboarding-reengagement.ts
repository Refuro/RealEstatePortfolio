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

function buildHtml(
  bodyContent: string,
  ctaText: string,
  ctaUrl: string,
  unsubscribeUrl: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Veld Portfolio</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;">

          <!-- Logo / wordmark -->
          <tr>
            <td style="padding-bottom:24px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:8px;">
                    <img src="https://veldportfolio.com/assets/Veld_Logo_New.svg"
                         alt="Veld"
                         width="22"
                         height="22"
                         style="display:block;width:22px;height:22px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:15px;font-weight:600;color:#1c1917;letter-spacing:-0.2px;">Veld Portfolio</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px 36px;border:1px solid #e7e5e4;">

              <!-- Body copy -->
              <p style="margin:0 0 28px 0;font-size:16px;line-height:26px;color:#292524;">${bodyContent}</p>

              <!-- CTA button -->
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background-color:#1c1917;">
                    <a href="${ctaUrl}"
                       style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">${ctaText}</a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#a8a29e;line-height:18px;">
                Veld Portfolio &nbsp;&middot;&nbsp;
                <a href="${unsubscribeUrl}" style="color:#a8a29e;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const day3Email = {
  subject: "Your Veld dashboard is ready",
  buildText: (unsubscribeUrl: string, baseUrl: string) =>
    `You signed up for Veld Portfolio but haven't added a property yet.

You still have 11 days of full Investor access in your free trial.

Add one in about 60 seconds and start tracking equity, cash flow, and cap rate:
${baseUrl}/properties/new?mode=quick&utm_source=email&utm_medium=email&utm_campaign=onboarding_day3

—
Veld Portfolio
Unsubscribe: ${unsubscribeUrl}`.trim(),
  buildHtml: (unsubscribeUrl: string, baseUrl: string) =>
    buildHtml(
      "You signed up for Veld Portfolio but haven&rsquo;t added a property yet. You still have 11 days of full Investor access in your free trial. Add one in about 60 seconds and start tracking equity, cash flow, and cap rate.",
      "Add your first property",
      `${baseUrl}/properties/new?mode=quick&utm_source=email&utm_medium=email&utm_campaign=onboarding_day3`,
      unsubscribeUrl
    ),
};

export const day7Email = {
  subject: "Still tracking properties in a spreadsheet?",
  buildText: (unsubscribeUrl: string, baseUrl: string) =>
    `You're one property away from seeing your real estate portfolio in real time.

You have 7 days of full portfolio access left in your free trial.

Add your first property:
${baseUrl}/properties/new?mode=quick&utm_source=email&utm_medium=email&utm_campaign=onboarding_day7

—
Veld Portfolio
Unsubscribe: ${unsubscribeUrl}`.trim(),
  buildHtml: (unsubscribeUrl: string, baseUrl: string) =>
    buildHtml(
      "You&rsquo;re one property away from seeing your real estate portfolio in real time. You have 7 days of full portfolio access left in your free trial.",
      "Add your first property",
      `${baseUrl}/properties/new?mode=quick&utm_source=email&utm_medium=email&utm_campaign=onboarding_day7`,
      unsubscribeUrl
    ),
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
    ? `Veld Portfolio <hello@${fromDomain}>`
    : "Veld Portfolio <onboarding@resend.dev>";

  const unsubscribeUrl = buildUnsubscribeUrl(userId);
  const baseUrl = getAppBaseUrl();
  const template = variant === "day3" ? day3Email : day7Email;
  const text = template.buildText(unsubscribeUrl, baseUrl);
  const html = template.buildHtml(unsubscribeUrl, baseUrl);

  const resend = new Resend(resendKey);
  const supportEmail = process.env.SUPPORT_EMAIL?.trim();

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    ...(supportEmail ? { replyTo: [supportEmail] } : {}),
    subject: template.subject,
    text,
    html,
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
