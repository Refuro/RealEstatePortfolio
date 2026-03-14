import Link from "next/link";

export default function NotFound() {
  return (
    <div className="rounded-lg border border-border bg-card p-8 text-center">
      <h2 className="text-lg font-semibold text-foreground">Page not found</h2>
      <p className="mt-2 text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-block rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
