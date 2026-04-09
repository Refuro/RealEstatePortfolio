import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { TRIAL_DURATION_DAYS } from "@/lib/plans";
import { AnalyticsEvents } from "@/lib/analytics-events";
import { captureServerEvent } from "@/lib/posthog-server";

const LAST_ACTIVE_UPDATE_INTERVAL_MS = 24 * 60 * 60 * 1000;

// Retry a Prisma operation up to maxAttempts times on transient failures
// (connection pool exhaustion, cold-start timeouts, brief network blips).
async function withPrismaRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isTransient =
        err instanceof Error &&
        // Prisma error codes for connection / timeout issues
        (err.message.includes("Can't reach database server") ||
          err.message.includes("Connection pool timeout") ||
          err.message.includes("ETIMEDOUT") ||
          err.message.includes("ECONNRESET") ||
          // Prisma client initialization error on cold starts
          err.message.includes("PrismaClientInitializationError"));
      if (!isTransient || attempt === maxAttempts) break;
      // Exponential backoff: 200ms, 400ms
      await new Promise((r) => setTimeout(r, 200 * attempt));
    }
  }
  throw lastErr;
}

/**
 * Get the current user from Clerk and ensure they exist in our DB.
 * Use in API routes and server components that need the app user.
 * Uses currentUser() to reliably get email (sessionClaims.email is often empty for OAuth sign-ins).
 * Wrapped with React cache() to deduplicate within the same RSC request (layout + child pages share result).
 *
 * Prisma calls are wrapped with retry logic so transient DB failures (cold-start
 * timeouts, connection pool exhaustion) don't crash the app shell on first load
 * — a new user landing on /dashboard immediately after signing up would otherwise
 * see "Something went wrong" with no recovery path.
 */
export const getAppUser = cache(async function getAppUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";

  const firstName = clerkUser.firstName ?? null;
  const lastName = clerkUser.lastName ?? null;
  const now = new Date();

  const existing = await withPrismaRetry(() =>
    prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    })
  );

  if (existing) {
    const shouldTouchLastActiveAt =
      !existing.lastActiveAt ||
      now.getTime() - existing.lastActiveAt.getTime() >=
        LAST_ACTIVE_UPDATE_INTERVAL_MS;

    if (
      existing.email === primaryEmail &&
      existing.firstName === firstName &&
      existing.lastName === lastName &&
      !shouldTouchLastActiveAt
    ) {
      return existing;
    }

    const updateData: {
      email?: string;
      firstName?: string | null;
      lastName?: string | null;
      lastActiveAt?: Date;
    } = {};

    if (existing.email !== primaryEmail) updateData.email = primaryEmail;
    if (existing.firstName !== firstName) updateData.firstName = firstName;
    if (existing.lastName !== lastName) updateData.lastName = lastName;
    if (shouldTouchLastActiveAt) updateData.lastActiveAt = now;

    return withPrismaRetry(() =>
      prisma.user.update({
        where: { id: existing.id },
        data: updateData,
      })
    );
  }

  const trialEnd = new Date(
    now.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  let createdUser;
  try {
    createdUser = await withPrismaRetry(() =>
      prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: primaryEmail || `user-${clerkUser.id}@placeholder.local`,
          firstName,
          lastName,
          lastActiveAt: now,
          subscriptionTier: "free",
          trialStartedAt: now,
          trialEndsAt: trialEnd,
        },
      })
    );
  } catch (err) {
    // Race-safe fallback: if another concurrent request already created
    // this Clerk user, fetch and return it instead of failing the page load.
    if (
      err instanceof Error &&
      (err.message.includes("Unique constraint failed") ||
        err.message.includes("P2002"))
    ) {
      const existingAfterConflict = await withPrismaRetry(() =>
        prisma.user.findUnique({
          where: { clerkUserId: clerkUser.id },
        })
      );
      if (existingAfterConflict) return existingAfterConflict;
    }
    throw err;
  }

  // Fire analytics in the background — don't let a PostHog failure block the user.
  void captureServerEvent(createdUser.clerkUserId, AnalyticsEvents.TRIAL_STARTED, {
    trial_duration_days: TRIAL_DURATION_DAYS,
    trial_ends_at: createdUser.trialEndsAt?.toISOString() ?? null,
  }).catch(() => {
    // Non-critical — analytics failure must never affect the signup path.
  });

  return createdUser;
});

/**
 * Get the current app user only if they are active (not soft-deleted).
 * Use in protected API routes — returns null when user.deletedAt is set.
 * Deleted users cannot access protected APIs; use getAppUser in layout (for RestoreAccountScreen)
 * and in the restore route (which must work for deleted users).
 */
export async function getActiveAppUser() {
  const user = await getAppUser();
  if (!user || user.deletedAt) return null;
  return user;
}

/**
 * Check if the user is an admin based on ADMIN_EMAILS env (comma-separated).
 * Returns false if ADMIN_EMAILS is empty or unset.
 */
export function isAdmin(user: { email: string }): boolean {
  const emails = process.env.ADMIN_EMAILS;
  if (!emails?.trim()) return false;
  const allowed = emails.split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  const userEmail = user.email?.toLowerCase() ?? "";
  return allowed.includes(userEmail);
}
