import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Get the current user from Clerk and ensure they exist in our DB.
 * Use in API routes and server components that need the app user.
 * Uses currentUser() to reliably get email (sessionClaims.email is often empty for OAuth sign-ins).
 * Wrapped with React cache() to deduplicate within the same RSC request (layout + child pages share result).
 */
export const getAppUser = cache(async function getAppUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";

  const firstName = clerkUser.firstName ?? null;
  const lastName = clerkUser.lastName ?? null;

  const existing = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

  if (existing) {
    if (
      existing.email === primaryEmail &&
      existing.firstName === firstName &&
      existing.lastName === lastName
    ) {
      return existing;
    }
    return prisma.user.update({
      where: { id: existing.id },
      data: { email: primaryEmail, firstName, lastName },
    });
  }

  return prisma.user.create({
    data: {
      clerkUserId: clerkUser.id,
      email: primaryEmail || `user-${clerkUser.id}@placeholder.local`,
      firstName,
      lastName,
      subscriptionTier: "free",
    },
  });
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
