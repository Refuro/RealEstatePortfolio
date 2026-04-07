import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TRIAL_DURATION_DAYS } from "@/lib/plans";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";

const patchSchema = z.object({
  action: z.enum([
    "start_14d",
    "set_4d_left",
    "set_1d_left",
    "set_expired_1d",
    "reset_email_flags",
    "clear_trial",
  ]),
});

const DAY_MS = 24 * 60 * 60 * 1000;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getActiveAppUser();
  if (!admin || !isAdmin(admin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(admin.id, request);
  const { allowed } = await checkRateLimit(identifier, "admin:trial-patch");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  const { id: userId } = await params;

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

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const { action } = parsed.data;

  const data: Prisma.UserUpdateInput = {};

  switch (action) {
    case "start_14d":
      data.trialStartedAt = now;
      data.trialEndsAt = new Date(now.getTime() + TRIAL_DURATION_DAYS * DAY_MS);
      data.trialEmailsSentAt = Prisma.DbNull;
      break;
    case "set_4d_left":
      data.trialStartedAt = new Date(now.getTime() - 10 * DAY_MS);
      data.trialEndsAt = new Date(now.getTime() + 4 * DAY_MS);
      break;
    case "set_1d_left":
      data.trialStartedAt = new Date(now.getTime() - 13 * DAY_MS);
      data.trialEndsAt = new Date(now.getTime() + DAY_MS);
      break;
    case "set_expired_1d":
      data.trialStartedAt = new Date(now.getTime() - 15 * DAY_MS);
      data.trialEndsAt = new Date(now.getTime() - DAY_MS);
      break;
    case "reset_email_flags":
      data.trialEmailsSentAt = Prisma.DbNull;
      break;
    case "clear_trial":
      data.trialStartedAt = null;
      data.trialEndsAt = null;
      data.trialEmailsSentAt = Prisma.DbNull;
      break;
  }

  await prisma.user.update({
    where: { id: userId },
    data,
  });

  await recordRateLimit(identifier, "admin:trial-patch");

  return NextResponse.json({ ok: true, message: "Trial test state updated." });
}
