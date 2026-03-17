import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { contactFormSchema } from "@/lib/validations/contact";

const RATE_LIMIT_PER_HOUR = 5;

function getIdentifier(userId: string | null, req: NextRequest): string {
  if (userId) return `user:${userId}`;
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  const ip = forwarded?.split(",")[0]?.trim() ?? realIp ?? "unknown";
  return `ip:${ip}`;
}

export async function POST(req: NextRequest) {
  const user = await getAppUser();
  const identifier = getIdentifier(user?.id ?? null, req);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await prisma.contactFormSubmission.count({
    where: { identifier, createdAt: { gte: oneHourAgo } },
  });
  if (recentCount >= RATE_LIMIT_PER_HOUR) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = contactFormSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      Object.values(first).flat().find(Boolean) ?? "Invalid form data";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { email, subject, message, website } = parsed.data;

  if (website && website.length > 0) {
    return NextResponse.json({ success: true });
  }

  const supportEmail = process.env.SUPPORT_EMAIL?.trim();
  const resendKey = process.env.RESEND_API_KEY?.trim();

  if (!supportEmail || !resendKey) {
    return NextResponse.json(
      { error: "Contact form is not configured" },
      { status: 503 }
    );
  }

  const subjectLabels: Record<string, string> = {
    general: "General",
    billing: "Billing",
    bug_report: "Bug report",
    feature_request: "Feature request",
    other: "Other",
  };
  const subjectLabel = subjectLabels[subject] ?? subject;

  const resend = new Resend(resendKey);
  const fromDomain = process.env.RESEND_FROM_DOMAIN?.trim();
  const from =
    fromDomain
      ? `Veld Portfolio <contact@${fromDomain}>`
      : "Veld Portfolio <onboarding@resend.dev>";

  const { data, error } = await resend.emails.send({
    from,
    to: [supportEmail],
    replyTo: [email],
    subject: `[Veld Contact] ${subjectLabel}: ${message.slice(0, 50)}${message.length > 50 ? "…" : ""}`,
    html: `
      <p><strong>From:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subjectLabel)}</p>
      <p><strong>Message:</strong></p>
      <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(message)}</pre>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }

  await prisma.contactFormSubmission.create({
    data: { identifier },
  });

  return NextResponse.json({ success: true, id: data?.id });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
