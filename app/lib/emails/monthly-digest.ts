import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { buildUnsubscribeUrl } from "@/lib/emails/onboarding-reengagement";
import {
  errorFromResendSdk,
  resendSdkErrorExtra,
} from "@/lib/emails/resend-sdk-error";
import type { DigestContent } from "@/lib/digest";

export interface MonthlyDigestEmailResult {
  success: boolean;
  id?: string;
}

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://veldportfolio.com";
}

function buildText(content: DigestContent, unsubscribeUrl: string, baseUrl: string): string {
  const lines = content.items
    .map((item) => {
      const delta = item.equityDelta != null ? ` (Δ ${item.equityDelta >= 0 ? "+" : ""}$${item.equityDelta})` : "";
      return `- ${item.propertyLabel}: Equity $${item.equity}${delta}, Cash flow $${item.monthlyCashFlow}/mo`;
    })
    .join("\n");

  return `${content.monthLabel} portfolio update

Total mortgage paydown: $${content.totalPaydown}
Total equity: $${content.totalEquity}${content.totalEquityDelta != null ? ` (Δ ${content.totalEquityDelta >= 0 ? "+" : ""}$${content.totalEquityDelta})` : ""}

${lines}

View dashboard:
${baseUrl}/dashboard?utm_source=email&utm_medium=email&utm_campaign=monthly_digest

—
Veld Portfolio
Unsubscribe: ${unsubscribeUrl}`.trim();
}

function buildHtml(content: DigestContent, unsubscribeUrl: string, baseUrl: string): string {
  const rows = content.items
    .map((item) => {
      const delta =
        item.equityDelta != null
          ? ` <span style="color:#78716c;">(Δ ${item.equityDelta >= 0 ? "+" : ""}$${item.equityDelta})</span>`
          : "";
      return `<li style="margin-bottom:10px;"><strong>${item.propertyLabel}</strong><br/>Equity: $${item.equity}${delta}<br/>Cash flow: $${item.monthlyCashFlow}/mo</li>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Monthly portfolio update</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f5f5f4;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;">
          <tr><td style="padding-bottom:24px;"><span style="font-size:15px;font-weight:600;color:#1c1917;">Veld Portfolio</span></td></tr>
          <tr>
            <td style="background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:32px;">
              <p style="margin:0 0 12px 0;color:#292524;font-size:16px;">${content.monthLabel} update</p>
              <p style="margin:0 0 12px 0;color:#292524;">Total mortgage paydown: <strong>$${content.totalPaydown}</strong><br/>Total equity: <strong>$${content.totalEquity}</strong></p>
              <ul style="margin:0 0 20px 18px;padding:0;color:#292524;font-size:14px;line-height:22px;">
                ${rows}
              </ul>
              <a href="${baseUrl}/dashboard?utm_source=email&utm_medium=email&utm_campaign=monthly_digest"
                 style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#fff;background:#1c1917;text-decoration:none;border-radius:8px;">
                View dashboard
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px;font-size:12px;color:#a8a29e;">
              Veld Portfolio &nbsp;&middot;&nbsp;
              <a href="${unsubscribeUrl}" style="color:#a8a29e;text-decoration:underline;">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendMonthlyDigestEmail(
  to: string,
  userId: string,
  content: DigestContent
): Promise<MonthlyDigestEmailResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    console.warn("RESEND_API_KEY not set — skipping monthly digest email");
    return { success: false };
  }

  const fromDomain = process.env.RESEND_FROM_DOMAIN?.trim();
  const from = fromDomain
    ? `Veld Portfolio <hello@${fromDomain}>`
    : "Veld Portfolio <onboarding@resend.dev>";

  const unsubscribeUrl = buildUnsubscribeUrl(userId, "digest");
  const baseUrl = getAppBaseUrl();

  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: `Your ${content.monthLabel} portfolio update`,
    text: buildText(content, unsubscribeUrl, baseUrl),
    html: buildHtml(content, unsubscribeUrl, baseUrl),
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) {
    console.error("Resend monthly digest email error:", error);
    Sentry.captureException(errorFromResendSdk(error), {
      tags: { area: "monthly_digest_email" },
      extra: resendSdkErrorExtra(error),
    });
    return { success: false };
  }

  return { success: true, id: data?.id };
}
