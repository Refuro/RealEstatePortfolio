export type OnboardingUserState = {
  onboardingWelcomeSeenAt: Date | null;
  onboardingDismissedAt: Date | null;
};

export type OnboardingProgress = {
  welcomeSeenAt: string | null;
  dismissedAt: string | null;
};

export function buildOnboardingProgress(
  user: OnboardingUserState
): OnboardingProgress {
  return {
    welcomeSeenAt: user.onboardingWelcomeSeenAt?.toISOString() ?? null,
    dismissedAt: user.onboardingDismissedAt?.toISOString() ?? null,
  };
}
