import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { sendOnboardingEmail } from "@/lib/emails/onboarding-reengagement";

const bodySchema = z.object({
  variant: z.enum(["day3", "day7"]),
});

export async function POST(request: NextRequest) {
  const admin = await getActiveAppUser();
  if (!admin || !isAdmin(admin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const supportEmail = process.env.SUPPORT_EMAIL?.trim();
  if (!supportEmail) {
    return NextResponse.json(
      { error: "SUPPORT_EMAIL is not configured" },
      { status: 500 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { variant } = parsed.data;

  // Send to SUPPORT_EMAIL but sign the unsubscribe link with the admin's own
  // userId so the unsubscribe route is real and fully testable.
  const result = await sendOnboardingEmail(supportEmail, admin.id, variant);

  if (!result.success) {
    return NextResponse.json(
      { error: "Email send failed — check RESEND_API_KEY and logs" },
      { status: 500 }
    );
  }

  console.info(
    JSON.stringify({
      action: "admin_email_preview",
      adminId: admin.id,
      adminEmail: admin.email,
      variant,
      sentTo: supportEmail,
      timestamp: new Date().toISOString(),
    })
  );

  return NextResponse.json({ sent: true, variant, sentTo: supportEmail });
}
