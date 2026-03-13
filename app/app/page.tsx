import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-zinc-50 px-4">
      <h1 className="text-center text-3xl font-semibold text-zinc-900">
        Portfolio Intelligence
      </h1>
      <p className="max-w-md text-center text-zinc-600">
        Track and analyze your rental property portfolio.
      </p>
      <div className="flex gap-4">
        {userId ? (
          <Link
            href="/dashboard"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Go to dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/sign-in"
              className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
