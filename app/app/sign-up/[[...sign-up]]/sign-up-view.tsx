"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";
import { PlanIntentSignUpReinforcement } from "@/components/analytics/plan-intent-sign-up-reinforcement";

export function SignUpView() {
  return (
    <>
      <PlanIntentUrlSync />
      <PlanIntentSignUpReinforcement />
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
          },
        }}
        afterSignUpUrl="/dashboard"
        signInUrl="/sign-in"
      />
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
