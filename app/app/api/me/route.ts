import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  ownershipDisplayMode: z.enum(["proportional", "full_liability"]).optional(),
});

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    subscriptionTier: user.subscriptionTier,
    ownershipDisplayMode: user.ownershipDisplayMode ?? "proportional",
  });
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

  const { ownershipDisplayMode } = parsed.data;
  if (ownershipDisplayMode == null) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ownershipDisplayMode },
  });

  return NextResponse.json({
    id: updated.id,
    ownershipDisplayMode: updated.ownershipDisplayMode ?? "proportional",
  });
}
