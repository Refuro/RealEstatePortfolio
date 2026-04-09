import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import {
  buildUnsubscribeUrl,
} from "@/lib/emails/onboarding-reengagement";
import type { MortgageMilestone } from "@/lib/mortgage-milestones";

export interface MortgageMilestoneEmailResult {
  success: boolean;
  id?: string;
}

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "https://veldportfolio.com";
}

function buildHtml(milestones: MortgageMilestone[], unsubscribeUrl: string, baseUrl: string): string {
  const listItems = milestones
    .map(
      (milestone) =>
        `<li style="margin-bottom:10px;"><strong>${milestone.title}</strong><br/><span style="color:#57534e;">${milestone.details}</span></li>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Veld Portfolio milestones</title>
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
            <td style="background-color:#ffffff;border-radius:12px;padding:32px;border:1px solid #e7e5e4;">
              <p style="margin:0 0 18px 0;font-size:16px;line-height:24px;color:#292524;">
                You hit new mortgage milestones this month:
              </p>
              <ul style="margin:0 0 22px 18px;padding:0;font-size:15px;line-height:22px;color:#292524;">
                ${listItems}
              </ul>
              <a href="${baseUrl}/dashboard?utm_source=email&utm_medium=email&utm_campaign=mortgage_milestones"
                 style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#ffffff;background:#1c1917;text-decoration:none;border-radius:8px;">
                View portfolio
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding-top:20px;">
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

function buildText(milestones: MortgageMilestone[], unsubscribeUrl: string, baseUrl: string): string {
  const lines = milestones
    .map((milestone) => `- ${milestone.title} ${milestone.details}`)
    .join("\n");

  return `You hit new mortgage milestones this month:
${lines}

View your portfolio:
${baseUrl}/dashboard?utm_source=email&utm_medium=email&utm_campaign=mortgage_milestones

—
Veld Portfolio
Unsubscribe: ${unsubscribeUrl}`.trim();
}

export async function sendMortgageMilestoneEmail(
  to: string,
  userId: string,
  milestones: MortgageMilestone[]
): Promise<MortgageMilestoneEmailResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    console.warn("RESEND_API_KEY not set — skipping mortgage milestone email");
    return { success: false };
  }
  if (milestones.length === 0) {
    return { success: false };
  }

  const fromDomain = process.env.RESEND_FROM_DOMAIN?.trim();
  const from = fromDomain
    ? `Veld Portfolio <hello@${fromDomain}>`
    : "Veld Portfolio <onboarding@resend.dev>";

  const unsubscribeUrl = buildUnsubscribeUrl(userId, "digest");
  const baseUrl = getAppBaseUrl();
  const text = buildText(milestones, unsubscribeUrl, baseUrl);
  const html = buildHtml(milestones, unsubscribeUrl, baseUrl);

  const resend = new Resend(resendKey);
  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    subject: "New mortgage milestones in your portfolio",
    text,
    html,
    headers: {
      "List-Unsubscribe": `<${unsubscribeUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) {
    console.error("Resend mortgage milestone email error:", error);
    Sentry.captureException(
      error instanceof Error ? error : new Error(String(error)),
      { tags: { area: "mortgage_milestone_email" } }
    );
    return { success: false };
  }

  return { success: true, id: data?.id };
}
