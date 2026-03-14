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
