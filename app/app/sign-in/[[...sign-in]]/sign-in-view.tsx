"use client";

import Link from "next/link";
import { SignIn, useAuth, useSignIn } from "@clerk/nextjs";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { PostHogAuthPageView } from "@/components/analytics/posthog-auth-page-view";

const authRedirectSpinner = (
  <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
);

export function SignInView() {
  const { isSignedIn } = useAuth();
  const { isLoaded: signInLoaded, signIn } = useSignIn();

  const awaitingRedirect =
    isSignedIn ||
    (signInLoaded &&
      signIn != null &&
      (signIn.status === "complete" || signIn.createdSessionId != null));

  if (awaitingRedirect) {
    return authRedirectSpinner;
  }

  return (
    <>
      <PostHogAuthPageView page="signin" />
      <PlanIntentUrlSync />
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
          },
        }}
        fallbackRedirectUrl="/dashboard"
        signUpUrl="/sign-up"
      />
      <p className="max-w-sm text-center text-sm text-muted">
        By signing in you agree to our{" "}
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
