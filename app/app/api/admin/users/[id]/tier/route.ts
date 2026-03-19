import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

const patchSchema = z.object({
  tier: z.enum(["free", "investor", "pro"]).nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getActiveAppUser();
  if (!admin || !isAdmin(admin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const { tier } = parsed.data;

  console.info(
    JSON.stringify({
      action: "admin_tier_override",
      adminId: admin.id,
      adminEmail: admin.email,
      targetUserId: userId,
      tier,
      timestamp: new Date().toISOString(),
    })
  );

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTierOverride: tier,
    },
  });

  const effectiveTier = tier ?? (updated.subscriptionTier ?? "free").toLowerCase();
  return NextResponse.json({
    subscriptionTierOverride: updated.subscriptionTierOverride,
    effectiveTier,
  });
}
