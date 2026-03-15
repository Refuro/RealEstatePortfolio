import { NextResponse } from "next/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPropertyLimit } from "@/lib/plans";

export async function GET() {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  const propertyCount = await prisma.property.count({
    where: { userId: user.id },
  });
  const limit = getPropertyLimit(user.subscriptionTier);
  const canAddMore = propertyCount < limit;

  return NextResponse.json({
    subscriptionTier: user.subscriptionTier,
    propertyCount,
    propertyLimit: limit,
    canAddMore,
    subscription: subscription
      ? {
          status: subscription.status,
          planName: subscription.planName,
          currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
        }
      : null,
  });
}
