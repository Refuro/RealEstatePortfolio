import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
  description:
    "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates. Replace spreadsheets with Veld.",
  openGraph: {
    title: "Veld Portfolio — Portfolio Analytics for Real Estate Investors",
    description:
      "Track and analyze your rental property portfolio. Equity, cash flow, rent and value estimates.",
    url: "/",
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;
  const deletedParam = params.deleted;
  const supportEmail = process.env.SUPPORT_EMAIL ?? null;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <nav className="flex items-center justify-between border-b border-border px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-foreground">
          Veld
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-muted hover:text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="text-muted hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="text-muted hover:text-foreground">
            Terms
          </Link>
        </div>
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4">
      <h1 className="text-center text-3xl font-semibold text-foreground">
        Veld Portfolio
      </h1>
      <p className="max-w-md text-center text-sm text-muted">
        Track and analyze your rental property portfolio. Equity, cash flow, and metrics in one place.
      </p>
      {deletedParam === "1" && (
        <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
          Your account has been deactivated. You can sign in again to restore it.
        </p>
      )}
      {deletedParam === "permanent" && (
        <p className="max-w-md rounded-lg border border-border bg-card px-4 py-3 text-center text-sm text-foreground">
          Your account and data have been permanently deleted.
        </p>
      )}
      <div className="flex gap-4">
        {userId ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-subtle"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
      </div>
      <Footer supportEmail={supportEmail} />
    </div>
  );
}
