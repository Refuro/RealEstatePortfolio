import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Get the current user from Clerk and ensure they exist in our DB.
 * Use in API routes and server components that need the app user.
 * Uses currentUser() to reliably get email (sessionClaims.email is often empty for OAuth sign-ins).
 */
export async function getAppUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const primaryEmail =
    clerkUser.emailAddresses.find((e) => e.id === clerkUser.primaryEmailAddressId)
      ?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress ?? "";

  const firstName = clerkUser.firstName ?? null;
  const lastName = clerkUser.lastName ?? null;

  const user = await prisma.user.upsert({
    where: { clerkUserId: clerkUser.id },
    update: { email: primaryEmail, firstName, lastName },
    create: {
      clerkUserId: clerkUser.id,
      email: primaryEmail || `user-${clerkUser.id}@placeholder.local`,
      firstName,
      lastName,
      subscriptionTier: "free",
    },
  });

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
