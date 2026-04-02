"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Calculator, LayoutDashboard, MoreHorizontal } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/analyze", label: "Analyze", icon: Calculator },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={`flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors duration-150 ${
              isActive ? "text-accent" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon className="size-5" aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        className="flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-3 py-1 text-[10px] font-medium text-muted transition-colors duration-150 hover:text-foreground"
        aria-label="More navigation options"
        onClick={() => {
          document.dispatchEvent(new CustomEvent("open-mobile-menu"));
        }}
      >
        <MoreHorizontal className="size-5" aria-hidden />
        <span>More</span>
      </button>
    </nav>
  );
}
