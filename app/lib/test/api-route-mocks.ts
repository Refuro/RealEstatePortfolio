/** Minimal user shape for `getActiveAppUser()` in API route tests. */
export const mockActiveUser = {
  id: "test-user-cuid",
  clerkUserId: "clerk_test_1",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
  subscriptionTier: "pro",
  subscriptionTierOverride: null as string | null,
  deletedAt: null as Date | null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

/** Free tier — for plan-limit (403) route tests (`PLAN_PROPERTY_LIMITS.free` = 1, deals = 5). */
export const mockFreeTierUser = {
  ...mockActiveUser,
  id: "test-user-free",
  subscriptionTier: "free",
};
