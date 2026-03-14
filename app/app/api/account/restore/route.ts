import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.deletedAt) {
    return NextResponse.json(
      { error: "Account is not deactivated" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { deletedAt: null },
  });

  return NextResponse.json({ success: true });
}
