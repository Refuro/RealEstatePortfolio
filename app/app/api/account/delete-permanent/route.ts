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
import { deletePermanentAccountSchema } from "@/lib/validations/account";

export async function POST(request: NextRequest) {
  const user = await getActiveAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(user.id, request);
  const { allowed } = await checkRateLimit(identifier, "account:delete-permanent");
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

  const parsed = deletePermanentAccountSchema.safeParse(body);
  if (!parsed.success) {
    const msg =
      parsed.error.issues[0]?.message ??
      "Confirmation required: type DELETE to permanently delete your account";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  const { password } = parsed.data;

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
      Sentry.captureException(err instanceof Error ? err : new Error("Stripe subscription cancel failed"), {
        tags: { route: "api/account/delete-permanent", userId: user.id },
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

  await prisma.user.delete({
    where: { id: user.id },
  });

  try {
    await client.users.deleteUser(user.clerkUserId);
  } catch (err) {
    console.error("Failed to delete user from Clerk:", err);
  }

  await recordRateLimit(identifier, "account:delete-permanent");

  return NextResponse.json({ success: true });
}
