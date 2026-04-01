import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { clerkClient } from "@clerk/nextjs/server";
import { getActiveAppUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe-config";
import { deleteAccountSchema } from "@/lib/validations/account";

export async function POST(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "account:delete");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = deleteAccountSchema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Invalid request";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { password } = parsed.data;

  try {
    const client = await clerkClient();
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
      Sentry.captureException(err instanceof Error ? err : new Error("Stripe subscription cancel failed"), {
        tags: { route: "api/account/delete", userId: user.id },
        extra: { stripeSubscriptionId: subscription.stripeSubscriptionId },
      });
      return NextResponse.json(
        {
          error:
            "We could not cancel your subscription. Please try again in a moment or contact support.",
        },
        { status: 503 }
      );
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
        stripeCustomerId: null,
        subscriptionTier: "free",
      },
    }),
    ...(subscription
      ? [
          prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "canceled",
              planName: null,
              currentPeriodEnd: null,
            },
          }),
        ]
      : []),
  ]);

  await recordRateLimit(identifier, "account:delete");

  return NextResponse.json({ success: true });
}
