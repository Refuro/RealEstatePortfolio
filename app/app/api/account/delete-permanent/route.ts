import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe-config";

export async function POST(request: NextRequest) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { password?: string; confirmText?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const password = body.password;
  if (!password || typeof password !== "string") {
    return NextResponse.json(
      { error: "Password is required" },
      { status: 400 }
    );
  }

  const client = await clerkClient();
  try {
    await client.users.verifyPassword({
      userId: user.clerkUserId,
      password,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  const subscription = await prisma.subscription.findUnique({
    where: { userId: user.id },
  });

  if (
    user.stripeCustomerId &&
    subscription?.stripeSubscriptionId &&
    subscription?.status === "active"
  ) {
    try {
      const stripe = getStripe();
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    } catch (err) {
      console.error("Failed to cancel Stripe subscription:", err);
    }
  }

  await prisma.user.delete({
    where: { id: user.id },
  });

  try {
    await client.users.deleteUser(user.clerkUserId);
  } catch (err) {
    console.error("Failed to delete user from Clerk:", err);
  }

  return NextResponse.json({ success: true });
}
