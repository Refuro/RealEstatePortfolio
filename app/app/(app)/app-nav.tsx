"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppNavProps {
  onClose?: () => void;
}

export function AppNav({ onClose }: AppNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-2 p-4">
      {nav.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-2 rounded-md px-4 py-2.5 text-base hover:bg-subtle ${
              isActive ? "bg-subtle font-medium text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
