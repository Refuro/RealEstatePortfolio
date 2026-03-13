import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Get the current user from Clerk and ensure they exist in our DB.
 * Use in API routes and server components that need the app user.
 */
export async function getAppUser() {
  const { userId: clerkUserId, sessionClaims } = await auth();
  if (!clerkUserId) return null;

  const email = (sessionClaims?.email as string) ?? "";

  const user = await prisma.user.upsert({
    where: { clerkUserId },
    update: { email },
    create: {
      clerkUserId,
      email: email || `user-${clerkUserId}@placeholder.local`,
      subscriptionTier: "free",
    },
  });

  return user;
}
