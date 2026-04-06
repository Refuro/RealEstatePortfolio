import { NextResponse } from "next/server";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const admin = await getActiveAppUser();
  if (!admin || !isAdmin(admin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  await prisma.$executeRaw`
    UPDATE "User"
    SET "onboardingEmailsOptedOutAt" = NULL,
        "onboardingEmailsSentAt" = NULL
    WHERE "id" = ${admin.id}
  `;

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
