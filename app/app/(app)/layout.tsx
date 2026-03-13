import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/pricing", label: "Pricing" },
  { href: "/settings", label: "Settings" },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="flex w-56 flex-col border-r border-zinc-200 bg-white">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4">
          <Link href="/dashboard" className="font-semibold text-zinc-900">
            Portfolio
          </Link>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-200 p-3">
          <div className="flex items-center gap-2 rounded-md px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm text-zinc-600">Account</span>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
