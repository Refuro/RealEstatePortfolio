import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const admin = await getActiveAppUser();
  if (!admin || !isAdmin(admin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      onboardingEmailsOptedOutAt: null,
      onboardingEmailsSentAt: Prisma.JsonNull,
    },
  });

  console.info(
    JSON.stringify({
      action: "admin_resubscribe_self",
      adminId: admin.id,
      adminEmail: admin.email,
      timestamp: new Date().toISOString(),
    })
  );

  return NextResponse.json({ resubscribed: true });
}
