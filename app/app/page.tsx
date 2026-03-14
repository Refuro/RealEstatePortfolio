import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ deleted?: string }>;
}) {
  const { userId } = await auth();
  const params = await searchParams;
  const deletedParam = params.deleted;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-4">
      <h1 className="text-center text-3xl font-semibold text-foreground">
        Portfolio Intelligence
      </h1>
      <p className="max-w-md text-center text-sm text-muted">
        Track and analyze your rental property portfolio.
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
              className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg border border-border px-6 py-3 text-sm font-medium hover:bg-subtle"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
