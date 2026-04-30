"use client";

import Link from "next/link";
import { SignUp, useAuth, useSignUp } from "@clerk/nextjs";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { PlanIntentSignUpReinforcement } from "@/components/analytics/plan-intent-sign-up-reinforcement";
import { PostHogAuthPageView } from "@/components/analytics/posthog-auth-page-view";

const authRedirectSpinner = (
  <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
);

export function SignUpView() {
  const { isSignedIn } = useAuth();
  const { isLoaded: signUpLoaded, signUp } = useSignUp();

  const awaitingRedirect =
    isSignedIn ||
    (signUpLoaded &&
      signUp != null &&
      (signUp.status === "complete" || signUp.createdSessionId != null));

  if (awaitingRedirect) {
    return authRedirectSpinner;
  }

  return (
    <>
      <PostHogAuthPageView page="signup" />
      <PlanIntentUrlSync />
      <PlanIntentSignUpReinforcement />
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
          },
        }}
        forceRedirectUrl="/properties/new?mode=quick"
        signInUrl="/sign-in"
      />
      <p className="max-w-sm text-center text-sm text-muted">
        Your account includes a 14-day free trial of the Investor plan. No credit
        card required.
      </p>
      <p className="max-w-sm text-center text-sm text-muted">
        By signing up you agree to our{" "}
        <Link href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );
}
