import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildOnboardingProgress } from "@/lib/onboarding";

const patchSchema = z.object({
  action: z.enum([
    "mark_welcome_seen",
    "dismiss_modal",
  ]),
});

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progress = buildOnboardingProgress(user);
  return NextResponse.json(progress);
}

export async function PATCH(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = new Date();
  const { action } = parsed.data;

  if (action === "mark_welcome_seen") {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingWelcomeSeenAt: user.onboardingWelcomeSeenAt ?? now,
      },
    });
  } else if (action === "dismiss_modal") {
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingDismissedAt: now },
    });
  }

  const refreshed = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      onboardingWelcomeSeenAt: true,
      onboardingDismissedAt: true,
    },
  });

  if (!refreshed) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const progress = buildOnboardingProgress(refreshed);
  return NextResponse.json(progress);
}
