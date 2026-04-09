import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { prisma } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/emails/onboarding-reengagement";

const WINBACK_UNSUBSCRIBED_KEY = "__unsubscribedAt";

const unsubscribeTypeMap = {
  onboarding: {
    data: () => ({ onboardingEmailsOptedOutAt: new Date() }),
    message: "You have been unsubscribed from Veld Portfolio onboarding emails.",
  },
  digest: {
    data: () => ({ digestEmailsOptedOutAt: new Date() }),
    message: "You have been unsubscribed from Veld Portfolio digest and milestone emails.",
  },
  winback: {
    message: "You have been unsubscribed from Veld Portfolio winback emails.",
  },
} as const;

// GET /api/unsubscribe?userId=<id>&token=<hmac>
// Validates the HMAC token, marks the user as opted out, returns a plain HTML
// confirmation page so it works directly from an email client browser.

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const token = searchParams.get("token");
  const typeRaw = searchParams.get("type");
  const type =
    typeRaw === "digest" || typeRaw === "winback" ? typeRaw : "onboarding";

  if (!userId || !token) {
    return htmlResponse("Invalid unsubscribe link.", 400);
  }

  let valid = false;
  try {
    valid = verifyUnsubscribeToken(userId, token);
  } catch (err) {
    // CRON_SECRET may not be set in local dev — degrade gracefully.
    console.error("Unsubscribe token verification error:", err);
    Sentry.captureException(err, { tags: { area: "unsubscribe" } });
    return htmlResponse("Unsubscribe is temporarily unavailable.", 503);
  }

  if (!valid) {
    return htmlResponse("Invalid or expired unsubscribe link.", 400);
  }

  try {
    if (type === "winback") {
      const existing = await prisma.user.findUnique({
        where: { id: userId },
        select: { winbackEmailsSentAt: true },
      });

      const previous =
        existing?.winbackEmailsSentAt &&
        typeof existing.winbackEmailsSentAt === "object" &&
        !Array.isArray(existing.winbackEmailsSentAt)
          ? (existing.winbackEmailsSentAt as Record<string, string | null>)
          : {};

      await prisma.user.update({
        where: { id: userId },
        data: {
          winbackEmailsSentAt: {
            ...previous,
            [WINBACK_UNSUBSCRIBED_KEY]: new Date().toISOString(),
          },
        },
      });
    } else {
      const config = unsubscribeTypeMap[type];
      await prisma.user.update({
        where: { id: userId },
        data: config.data(),
      });
    }
  } catch (err) {
    console.error("Unsubscribe DB error:", err);
    Sentry.captureException(err, { tags: { area: "unsubscribe" } });
    return htmlResponse("Something went wrong. Please try again later.", 500);
  }

  return htmlResponse(unsubscribeTypeMap[type].message, 200);
}

function htmlResponse(message: string, status: number): NextResponse {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Unsubscribe — Veld Portfolio</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #fafaf9; color: #1c1917; }
    .card { max-width: 480px; width: 100%; padding: 2rem; background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; text-align: center; }
    p { margin: 0; font-size: 1rem; line-height: 1.5; color: #57534e; }
    a { color: #4f46e5; text-decoration: none; }
  </style>
</head>
<body>
  <div class="card">
    <p>${message}</p>
    <p style="margin-top:1rem;font-size:0.875rem;"><a href="https://veldportfolio.com">Return to Veld Portfolio</a></p>
  </div>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
