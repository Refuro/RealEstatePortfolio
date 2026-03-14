import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-zinc-900">Page not found</h2>
      <p className="mt-2 text-sm text-zinc-600">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
