"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDraft } from "./draft-context";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Settings,
  Shield,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/pricing", label: "Pricing", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface AppNavProps {
  onClose?: () => void;
  showAdmin?: boolean;
}

export function AppNav({ onClose, showAdmin }: AppNavProps) {
  const pathname = usePathname();
  const draft = useDraft();
  const useNavigateTo =
    draft != null && pathname === "/properties/new" && draft.hasDraft;

  return (
    <nav className="flex flex-1 flex-col gap-2 p-4">
      {[...nav, ...(showAdmin ? [{ href: "/admin", label: "Admin", icon: Shield }] : [])].map(
        ({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        const className = `flex items-center gap-2 rounded-md px-4 py-2.5 text-base hover:bg-subtle w-full text-left ${
          isActive ? "bg-subtle font-medium text-foreground" : "text-muted hover:text-foreground"
        }`;
        if (useNavigateTo) {
          return (
            <button
              key={href}
              type="button"
              onClick={() => {
                draft.navigateTo(href);
                onClose?.();
              }}
              className={className}
            >
              <Icon size={18} />
              {label}
            </button>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={className}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      }
      )}
    </nav>
  );
}
