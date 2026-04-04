import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { SignIn } from "@clerk/nextjs";
import { PlanIntentUrlSync } from "@/components/analytics/plan-intent-url-sync";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <Suspense fallback={null}>
        <PlanIntentUrlSync />
      </Suspense>
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
          },
        }}
        afterSignInUrl="/dashboard"
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
    </div>
  );
}
