import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { buildUnsubscribeUrl } from "@/lib/emails/onboarding-reengagement";

export interface TrialLifecycleEmailResult {
  success: boolean;
  id?: string;
}

type TrialVariant = "day10" | "day13" | "expired";

function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://veldportfolio.com"
  );
}

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
          <tr>
            <td style="padding-bottom:24px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:8px;">
                    <img src="https://veldportfolio.com/assets/Veld_Logo_New.svg" alt="Veld" width="22" height="22" style="display:block;width:22px;height:22px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:15px;font-weight:600;color:#1c1917;letter-spacing:-0.2px;">Veld Portfolio</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px 36px;border:1px solid #e7e5e4;">
              <p style="margin:0 0 28px 0;font-size:16px;line-height:26px;color:#292524;">${bodyContent}</p>
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:8px;background-color:#1c1917;">
                    <a href="${ctaUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.1px;">${ctaText}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
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

function getTemplate(variant: TrialVariant, propertyCount: number) {
  const properties = Math.max(0, propertyCount);
  if (variant === "day10") {
    return {
      subject: "Your Veld trial ends in 4 days",
      body: `You have 4 days left in your free trial. You currently track ${properties} ${properties === 1 ? "property" : "properties"}. After trial, the free plan includes 1 property. Upgrade now to keep full access.`,
    };
  }
  if (variant === "day13") {
    return {
      subject: "Last day of your Veld trial",
      body: `Your free trial ends tomorrow. You currently track ${properties} ${properties === 1 ? "property" : "properties"}. Your data stays safe, but access reduces to the free plan limit of 1 property unless you upgrade.`,
    };
  }
  return {
    subject: "Your Veld trial has ended",
    body: `Your trial has ended and your data is safe. You currently track ${properties} ${properties === 1 ? "property" : "properties"}. Upgrade anytime to unlock all of them again.`,
  };
}

export async function sendTrialLifecycleEmail(
  to: string,
  userId: string,
  variant: TrialVariant,
  propertyCount: number
): Promise<TrialLifecycleEmailResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    console.warn("RESEND_API_KEY not set — skipping trial lifecycle email");
    return { success: false };
  }

  const fromDomain = process.env.RESEND_FROM_DOMAIN?.trim();
  const from = fromDomain
    ? `Veld Portfolio <hello@${fromDomain}>`
    : "Veld Portfolio <onboarding@resend.dev>";

  const unsubscribeUrl = buildUnsubscribeUrl(userId);
  const baseUrl = getAppBaseUrl();
  const template = getTemplate(variant, propertyCount);
  const ctaUrl = `${baseUrl}/plans`;
  const text = `${template.body}

Upgrade now:
${ctaUrl}

—
Veld Portfolio
Unsubscribe: ${unsubscribeUrl}`.trim();
  const html = buildHtml(template.body, "Upgrade now", ctaUrl, unsubscribeUrl);

  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: template.subject,
    text,
    html,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) {
    console.error("Resend trial lifecycle email error:", error);
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
      { tags: { area: "trial_lifecycle_email", variant } }
    );
    return { success: false };
  }

  return { success: true, id: data?.id };
}
