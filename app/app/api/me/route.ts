import { NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectiveTier } from "@/lib/plans";

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [propertyCount, dealCount] = await Promise.all([
    prisma.property.count({ where: { userId: user.id } }),
    prisma.savedDeal.count({ where: { userId: user.id } }),
  ]);
  return NextResponse.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    subscriptionTier: getEffectiveTier(user),
    propertyCount,
    dealCount,
  });
}
