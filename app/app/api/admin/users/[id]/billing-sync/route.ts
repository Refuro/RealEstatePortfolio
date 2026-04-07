import { NextRequest, NextResponse } from "next/server";
import { getActiveAppUser, isAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  checkRateLimit,
  getRateLimitIdentifier,
  recordRateLimit,
} from "@/lib/rate-limit";
import { billingIntervalFromPriceId, getStripe, planTierFromPriceId } from "@/lib/stripe-config";
import type Stripe from "stripe";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getActiveAppUser();
  if (!admin || !isAdmin(admin)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const identifier = getRateLimitIdentifier(admin.id, request);
  const { allowed } = await checkRateLimit(identifier, "admin:billing-sync");
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429 }
    );
  }

  const { id: userId } = await params;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      stripeCustomerId: true,
      subscriptionTier: true,
      subscriptionTierOverride: true,
    },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (!user.stripeCustomerId) {
    return NextResponse.json({
      ok: true,
      synced: false,
      message: "No Stripe customer found for this user yet.",
    });
  }

  const tier = (user.subscriptionTier ?? "free").toLowerCase();

  const dbSub = await prisma.subscription.findUnique({
    where: { userId: user.id },
    select: {
      stripeSubscriptionId: true,
      status: true,
      planName: true,
      cancelAtPeriodEnd: true,
      currentPeriodEnd: true,
    },
  });

  try {
    const stripe = getStripe();

    // Prefer retrieving the exact subscription we have on record so we don't
    // accidentally read a stale/different subscription from the list endpoint.
    let sub: Stripe.Subscription | null = null;
    if (dbSub?.stripeSubscriptionId) {
      try {
        sub = await stripe.subscriptions.retrieve(dbSub.stripeSubscriptionId);
      } catch {
        sub = null;
      }
    }
    if (!sub) {
      const list = await stripe.subscriptions.list({
        customer: user.stripeCustomerId,
        limit: 5,
        status: "all",
      });
      sub =
        list.data.find((s) => s.status === "active" || s.status === "trialing") ??
        list.data[0] ??
        null;
    }

    const status = sub?.status;
    const debug = {
      stripeSubId: sub?.id ?? null,
      stripeStatus: status ?? null,
      stripeCancelAtPeriodEnd: sub?.cancel_at_period_end ?? null,
      stripeCancelAt: sub?.cancel_at ?? null,
      dbSubId: dbSub?.stripeSubscriptionId ?? null,
      dbStatus: dbSub?.status ?? null,
      dbCancelAtPeriodEnd: dbSub?.cancelAtPeriodEnd ?? null,
    };

    if (!sub) {
      await recordRateLimit(identifier, "admin:billing-sync");
      return NextResponse.json({
        ok: true,
        synced: false,
        message: "No Stripe subscription found for this customer.",
        debug,
      });
    }

    if (status === "active" || status === "trialing") {
      const firstItem = sub.items?.data?.[0];
      const priceId =
        typeof firstItem?.price === "string" ? firstItem.price : firstItem?.price?.id;
      const stripeTier = priceId ? planTierFromPriceId(priceId) : null;
      const stripeInterval = priceId ? billingIntervalFromPriceId(priceId) : null;
      const stripePlanName = stripeTier
        ? stripeInterval
          ? `${stripeTier}_${stripeInterval}`
          : stripeTier
        : null;
      const periodEnd = firstItem?.current_period_end;
      const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : null;
      const nextCancelAtPeriodEnd =
        sub.cancel_at_period_end === true ||
        (typeof sub.cancel_at === "number" && sub.cancel_at * 1000 > Date.now());

      await prisma.subscription.upsert({
        where: { userId: user.id },
        update: {
          stripeSubscriptionId: sub.id,
          status,
          planName: stripePlanName ?? stripeTier,
          currentPeriodEnd,
          cancelAtPeriodEnd: nextCancelAtPeriodEnd,
        },
        create: {
          userId: user.id,
          stripeSubscriptionId: sub.id,
          status,
          planName: stripePlanName ?? stripeTier,
          currentPeriodEnd,
          cancelAtPeriodEnd: nextCancelAtPeriodEnd,
        },
      });

      if (!user.subscriptionTierOverride && stripeTier && stripeTier !== tier) {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionTier: stripeTier },
        });
      }

      await recordRateLimit(identifier, "admin:billing-sync");
      return NextResponse.json({
        ok: true,
        synced: true,
        message: `Synced: ${status}${nextCancelAtPeriodEnd ? ", cancels at period end" : ", renews"}.`,
        debug,
      });
    }

    if (["canceled", "unpaid", "incomplete_expired"].includes(status ?? "")) {
      await prisma.subscription.updateMany({
        where: { userId: user.id },
        data: {
          status: "canceled",
          planName: null,
          currentPeriodEnd: null,
          cancelAtPeriodEnd: null,
        },
      });
      if (!user.subscriptionTierOverride && tier !== "free") {
        await prisma.user.update({
          where: { id: user.id },
          data: { subscriptionTier: "free" },
        });
      }

      await recordRateLimit(identifier, "admin:billing-sync");
      return NextResponse.json({
        ok: true,
        synced: true,
        message: "Synced: subscription canceled.",
        debug,
      });
    }

    await recordRateLimit(identifier, "admin:billing-sync");
    return NextResponse.json({
      ok: true,
      synced: false,
      message: `No change applied (status: ${status ?? "unknown"}).`,
      debug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Billing sync failed";
    return NextResponse.json({ error: message, dbSub }, { status: 500 });
  }
}

