import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { AppNav } from "./app-nav";

export const dynamic = "force-dynamic";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="flex w-56 xl:w-64 2xl:w-72 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <Link href="/dashboard" className="text-lg font-semibold text-foreground">
            Portfolio
          </Link>
        </div>
        <AppNav />
        <div className="mt-auto border-t border-border px-4 py-4">
          <div className="flex items-center gap-2 rounded-md px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-muted">Account</span>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-4xl xl:max-w-6xl 2xl:max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
