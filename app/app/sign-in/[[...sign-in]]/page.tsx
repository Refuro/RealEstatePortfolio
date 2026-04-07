import { Suspense } from "react";
import type { Metadata } from "next";
import { SignInView } from "./sign-in-view";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4">
      <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
        <SignInView />
      </Suspense>
    </div>
  );
}
