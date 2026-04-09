import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { buildUnsubscribeUrl } from "@/lib/emails/onboarding-reengagement";

export interface WinbackEmailResult {
  success: boolean;
  id?: string;
}

export type WinbackVariant = "6mo" | "12mo";

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://veldportfolio.com";
}

function getTemplate(variant: WinbackVariant, propertyCount: number, baseUrl: string) {
  const countLabel = propertyCount === 1 ? "property" : "properties";
  const dashboardUrl = `${baseUrl}/dashboard?utm_source=email&utm_medium=email&utm_campaign=winback_${variant}`;

  if (variant === "12mo") {
    return {
      subject: "One-year portfolio check-in",
      text: `It has been a while since your last Veld login.

Your ${propertyCount} ${countLabel} may have changed materially over the past year.

Re-open your dashboard:
${dashboardUrl}

—
Veld Portfolio`,
      htmlBody:
        `It has been a while since your last Veld login. Your <strong>${propertyCount} ${countLabel}</strong> may have changed materially over the past year.`,
      ctaText: "Review your portfolio",
      ctaUrl: dashboardUrl,
    };
  }

  return {
    subject: "Quick portfolio check-in",
    text: `You have not checked Veld in a while.

Your ${propertyCount} ${countLabel} might have meaningful updates waiting for you.

Jump back in:
${dashboardUrl}

—
Veld Portfolio`,
    htmlBody:
      `You have not checked Veld in a while. Your <strong>${propertyCount} ${countLabel}</strong> might have meaningful updates waiting for you.`,
    ctaText: "Open dashboard",
    ctaUrl: dashboardUrl,
  };
}

function buildHtml(bodyContent: string, ctaText: string, ctaUrl: string, unsubscribeUrl: string): string {
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
              <span style="font-size:15px;font-weight:600;color:#1c1917;letter-spacing:-0.2px;">Veld Portfolio</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:12px;padding:40px 36px;border:1px solid #e7e5e4;">
              <p style="margin:0 0 28px 0;font-size:16px;line-height:26px;color:#292524;">${bodyContent}</p>
              <a href="${ctaUrl}"
                 style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;background:#1c1917;text-decoration:none;border-radius:8px;">${ctaText}</a>
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

export async function sendWinbackEmail(
  to: string,
  userId: string,
  variant: WinbackVariant,
  propertyCount: number
): Promise<WinbackEmailResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    console.warn("RESEND_API_KEY not set — skipping winback email");
    return { success: false };
  }

  const fromDomain = process.env.RESEND_FROM_DOMAIN?.trim();
  const from = fromDomain
    ? `Veld Portfolio <hello@${fromDomain}>`
    : "Veld Portfolio <onboarding@resend.dev>";

  const unsubscribeUrl = buildUnsubscribeUrl(userId, "winback");
  const baseUrl = getAppBaseUrl();
  const template = getTemplate(variant, propertyCount, baseUrl);

  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: template.subject,
    text: `${template.text}\n\nUnsubscribe: ${unsubscribeUrl}`.trim(),
    html: buildHtml(template.htmlBody, template.ctaText, template.ctaUrl, unsubscribeUrl),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) {
    console.error("Resend winback email error:", error);
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)), {
      tags: { area: "winback_email", variant },
    });
    return { success: false };
  }

  return { success: true, id: data?.id };
}
