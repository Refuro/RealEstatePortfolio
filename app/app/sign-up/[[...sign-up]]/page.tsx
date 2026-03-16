import Link from "next/link";
import type { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
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
    </div>
  );
}
